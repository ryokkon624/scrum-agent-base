---
name: mobile-conventions
description: HwHubモバイル（hw-hub-mobile）の設計規約・実装方針。Dartファイル・Flutterウィジェット・RiverpodのNotifier・Retrofitクライアント・テストファイルを新規作成・編集するときは必ずこのスキルを参照すること。feature-first構成・アーキテクチャ層・状態管理・テスト方針・i18nなど、実装の判断に必要な規約をすべてここに集約している。
---

# Mobile Conventions

hw-hub-mobileの設計規約・実装方針。

---

## 1. アーキテクチャ（feature-first + 簡略 Clean Architecture）

```
presentation/ (Page・Notifier・State)
      ↓
data/         (Repository interface + impl・API・モデル)
      ↓
core/network/ (Dio・例外・インターセプター)
```

- **domain 層は省略**する。Repository interface は `data/` に同居させる
- UseCase は設けない。Notifier が直接 Repository を呼ぶ
- 複数機能をまたぐビジネスロジックが必要になった場合のみ `domain/usecase/` を切り出す
- `features/shell` はナビゲーションシェル（BottomNavigationBar・世帯切替UI）であり、ドメイン機能ではない

### 依存方向ルール

- Page は Notifier を呼ぶ。Repository を直接呼ばない
- Notifier は Repository interface に依存する。実装クラスには依存しない
- **Notifier 内で `Dio` を直接使用してはならない**。必ず `Repository` 経由で API を呼ぶこと（`Notifier → Repository → Api` の依存方向を守ること）
- `core/` 配下は全機能から参照できる共通基盤

---

## 2. ディレクトリ構成

```
lib/
├── main.dart
├── app_router.dart            # GoRouter 全ルート定義
├── core/                      # 全機能共通基盤
│   ├── auth/                  # 認証状態管理（AuthNotifier・TokenStorage）
│   ├── config/                # 環境設定（AppConfig・ベースURL）
│   ├── di/                    # Provider 定義（DI配線）
│   ├── household/             # 世帯状態管理
│   ├── models/                # 共有ドメインモデル
│   ├── network/               # Dio クライアント・例外定義・インターセプター
│   ├── storage/               # ストレージキー定数
│   ├── theme/                 # テーマ・カラー・スペーシング定数
│   └── ui/                    # 共通UIコンポーネント（SnackBar・Dialog）
└── features/
    └── {feature}/
        ├── {feature}_providers.dart   # Provider 定義
        ├── data/
        │   ├── {feature}_api.dart     # Retrofit @RestApi 定義
        │   ├── {feature}_repository.dart  # interface + impl
        │   └── models/                # レスポンスモデル
        └── presentation/
            └── {screen}/
                ├── {screen}_page.dart      # UI
                ├── {screen}_notifier.dart  # ロジック + Provider定義
                └── {screen}_state.dart     # 不変状態クラス
```

---

## 3. 基本記述スタイル

- `dynamic` / `var` の乱用は禁止。適切な型を明示する
- テキストはハードコード禁止。必ず ARB ファイルに定義して `AppLocalizations.of(context).key` を使う
- i18n キー構造: `{screen}{Context}` のキャメルケース

```
例:
  loginTitle
  signupSubmitButton
  inviteInviterLabel
  passwordResetSentResendSuccess
```

- `const` コンストラクタを積極的に使い、不要な再ビルドを避ける
- コード値（APIから返される文字列/数値の区分値）はマジックストリングで直接比較せず、`core/models/` 配下の enum を使う

### m_code で管理されている区分値（自動生成）

`lib/core/models/` には `hw-hub-database` の `./gradlew generateEnums` で生成した enum が配置済み。  
`PurchaseLocationType`, `TaskStatus`, `Category` など m_code に登録されている区分値はすべてここにある。  
**新しく作らず、生成済みのファイルを import して使うこと。**

```dart
// 生成済みの enum を import して使う例
import 'package:hw_hub_mobile/core/models/purchase_location_type.dart';

// コード値との比較
if (item.storeType == PurchaseLocationType.supermarket.code) { ... }

// コード値から enum に変換
final type = PurchaseLocationType.fromCode(item.storeType); // 不正値は null
```

生成済み enum はすべて以下の形式になっている。

```dart
enum PurchaseLocationType {
  supermarket('1'),
  online('2'),
  drugstore('3');

  const PurchaseLocationType(this.code);
  final String code;

  static PurchaseLocationType? fromCode(String? code) {
    for (final v in values) {
      if (v.code == code) return v;
    }
    return null;
  }
}
```

m_code が更新された場合は `./gradlew generateEnums`（hw-hub-database）を実行し、生成ファイルを `lib/core/models/` に上書きコピーしてコミットする。

### m_code で管理されていない区分値（カスタム定義）

画面固有の状態や API の仕様に由来するが m_code に登録されていない区分値は、`core/models/` に手動で作成する。

```dart
// lib/core/models/password_reset_result.dart の例（m_codeに無いカスタム enum）
enum PasswordResetResult { success, expired, invalid }
```

- カスタム enum はコード値を持たない（画面状態の分岐にのみ使う）ことが多い
- API レスポンスのフラグなど文字列/数値のマッピングが必要な場合は生成済み enum と同じ形式（`fromCode` + null 安全）で作る

### 全幅表示が必要なウィジェット

カードや一覧アイテムを親コンテナ幅いっぱいに広げる場合は、以下のいずれかを明示的に指定すること。
Flutter の `Container` はデフォルトでコンテンツサイズになるため、指定がないとタスク名の長さによって幅がバラバラになる。

```dart
// パターン1: SizedBox で全幅指定
SizedBox(
  width: double.infinity,
  child: MyCard(...),
)

// パターン2: Container に width を指定
Container(
  width: double.infinity,
  child: MyCard(...),
)

// パターン3: Column の crossAxisAlignment で子を伸ばす
Column(
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: [MyCard(...)],
)
```

> **背景（Sprint 31 Retro）**: `swipeable_task_card.dart` のmarginを削除したが `width: double.infinity` を設定しなかったため、カード幅がタスク名に依存したままになりSprint Reviewで指摘された。

### Dismissible のスワイプ方向とアクションの対応

`Dismissible` で「左スワイプ」「右スワイプ」それぞれに異なるアクションを割り当てる場合、以下の3箇所を必ず一致させること。

| 要素 | 役割 |
|---|---|
| `background` | startToEnd（右スワイプ）のアイコン・色 |
| `secondaryBackground` | endToStart（左スワイプ）のアイコン・色 |
| `confirmDismiss` の `direction` 判定 | `DismissDirection.startToEnd` で右スワイプのアクションを実行 |

```dart
Dismissible(
  key: ValueKey(task.taskId),
  background: _buildBackground(Colors.blue, Icons.person, Alignment.centerLeft),   // 右スワイプ
  secondaryBackground: _buildBackground(Colors.red, Icons.delete, Alignment.centerRight), // 左スワイプ
  confirmDismiss: (direction) async {
    if (direction == DismissDirection.startToEnd) {
      // 右スワイプのアクション（例: 自分にアサイン）
      await ref.read(notifier).assignToMe(task.taskId);
    } else {
      // 左スワイプのアクション（例: 削除確認）
      return await showDialog(...);
    }
    return false;
  },
  child: ...,
)
```

> **背景（Sprint 40 #115）**: `background` と `secondaryBackground` の中身を正しく設定していたが、`confirmDismiss` の `direction` 判定が逆になっており、右スワイプで削除・左スワイプで担当者変更が実行されていた。中身と判定は常にセットで確認すること。

### 折り返しレイアウト（Wrap）vs 水平スクロール（ListView）

複数アイテムを横並びにする際、画面外に溢れる可能性がある場合は `Wrap` を使う。

```dart
// NG: 水平スクロール → 高さ固定 + スクロールで項目が画面外に流れて非表示になりやすい
SizedBox(
  height: 72,
  child: ListView(
    scrollDirection: Axis.horizontal,
    children: items.map((item) => ItemChip(item: item)).toList(),
  ),
)

// OK: Wrap → 折り返しで全項目が表示される。コンテンツ量に応じて高さが伸縮する
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: items.map((item) => ItemChip(item: item)).toList(),
)
```

使い分け:
- 項目数が固定で少ない、または水平スクロールが UX 仕様として必要 → `ListView(scrollDirection: Axis.horizontal)`
- 項目数が可変・増減する、または全項目を一覧で見せたい → `Wrap`

> **背景（Sprint 40 #111）**: メンバーサマリを `SizedBox(height: 72) + ListView(scrollDirection: Axis.horizontal)` で実装していたため、メンバー数が増えると画面外に流れて非表示になっていた。`Wrap(spacing: 8, runSpacing: 8)` に変更することで全メンバーを折り返し表示できるようになった。

### アバター表示（UserAvatar）共通ウィジェット

ユーザーアイコンを表示する場合は `lib/core/ui/user_avatar.dart` の `UserAvatar` ウィジェットを使う。新しい機能でアイコン表示が必要になった場合も、新規作成せずこのウィジェットを参照すること。

```dart
// 通常のユーザーアバター（iconUrl があればアイコン表示、なければイニシャル）
UserAvatar(
  iconUrl: member.iconUrl,
  displayName: member.nickname ?? member.displayName,
  radius: 16,
)

// 未割当状態を表示する場合（丸い円に「未」ラベル）
UserAvatar(
  iconUrl: null,
  displayName: null,  // null を渡すと「未」表示になる設計
  radius: 16,
)
```

実装パターン:
- `iconUrl` が非 null → `CircleAvatar(backgroundImage: NetworkImage(iconUrl))` で表示
- 読み込み失敗時 → `onError` フォールバックでイニシャル表示
- `displayName` が null（未割当） → 「未」ラベルの円を表示（Web 版踏襲）
- `displayName` が非 null（割当済み） → イニシャル（最初の1文字）を表示

> **背景（Sprint 40 #112）**: 担当者バッジがテキストラベルのみで実装されており、アイコン表示に対応していなかった。`core/ui/user_avatar.dart` として共通ウィジェットを新規作成し、担当者バッジ・メンバーサマリの両方から参照する構成にした。

### リスト生成時の key 付与（必須）

`items.map((item) => ...)` でウィジェットを生成する際は、最外ウィジェットに必ず `key: ValueKey(item.uniqueId)` を付与すること。

```dart
// NG: key なし → スワイプ後のリスト更新でウィジェット状態が混乱する
items.map((item) => Padding(
  padding: const EdgeInsets.symmetric(vertical: 4),
  child: SwipeableCard(item: item),
)).toList()

// OK: 最外ウィジェットに ValueKey を付与
items.map((item) => Padding(
  key: ValueKey(item.shoppingItemId),
  padding: const EdgeInsets.symmetric(vertical: 4),
  child: SwipeableCard(item: item),
)).toList()
```

`Dismissible` は `key` が必須だが、その外側の `Padding` 等にも同じ key を付与しないと `setState` や `invalidate` 後にウィジェット状態が意図しない要素に紐づいたままになる。

> **背景（Sprint 38 Review）**: `purchased_tab.dart` の `items.map()` で `Padding` に key を付与しておらず、スワイプ後のリスト更新時にウィジェット状態が混乱する可能性を指摘された。
> **Sprint 39**: `member_picker_bottom_sheet` / `member_summary_strip` でも同様の指摘。`members.map()` のような別モデルのリスト生成でも同様に適用すること。

### build() 内の重い計算を Notifier 側で事前計算する（パフォーマンス必須）

`build()` メソッドはフレームごとに呼ばれる。O(n×m) の集計・同一フィルタの複数回呼び出しは `build()` 内に書かない。

```dart
// NG: build() 内で毎フレーム O(n × m) のループを実行
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(houseworkAssignNotifierProvider).valueOrNull;
  return Row(
    children: state!.members.map((m) {
      // tasks.where(...).toList() を毎フレーム実行
      final count = state.tasks.where((t) => t.assigneeId == m.memberId).length;
      return _SummaryChip(member: m, count: count);
    }).toList(),
  );
}

// OK: Notifier 側で事前計算し Map として state に持たせる
// housework_assign_notifier.dart 側
Map<int, int> _computeMemberTaskCounts(List<HouseworkTask> tasks) {
  final counts = <int, int>{};
  for (final task in tasks) {
    if (task.assigneeId != null) {
      counts[task.assigneeId!] = (counts[task.assigneeId!] ?? 0) + 1;
    }
  }
  return counts;
}
// state に memberTaskCounts: Map<int, int> を持たせ、
// tasks が変化するたびに _computeMemberTaskCounts() を呼んで更新する

// ウィジェット側
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(houseworkAssignNotifierProvider).valueOrNull;
  return Row(
    children: state!.members.map((m) {
      final count = state.memberTaskCounts[m.memberId] ?? 0; // O(1)参照
      return _SummaryChip(member: m, count: count);
    }).toList(),
  );
}
```

適用すべき場面:
- `items.where(条件).length` を `build()` 内の `map()` の中で呼んでいる場合
- 同じ `where().toList()` を `build()` 内で複数回呼んでいる場合
- `DTO.copyWith()` が使えるのに全フィールドを明示して再生成している場合（可読性・保守性）

> **背景（Sprint 39 Review）**: `MemberSummaryStrip.build()` でメンバーごとにタスク数を `tasks.where(...).length` で計算していた。O(メンバー数 × タスク数) のループが毎フレーム走るため、Notifier 側で `_computeMemberTaskCounts()` として事前計算し `Map<int, int>` を state に持たせる改修を行った。

---

## 4. 状態管理（Riverpod）

| Provider 種別 | 用途 |
|---|---|
| `NotifierProvider` | 同期的な画面状態（フォーム入力・ローディングフラグ） |
| `AsyncNotifierProvider` | 非同期の画面状態（API呼び出しを含む操作） |
| `FutureProvider.family` | 一度だけ実行する非同期処理（トークン検証など） |
| `AutoDispose` | 画面を離れたら破棄するプロバイダに付与 |

- Provider 定義は各 `{screen}_notifier.dart` の末尾に記述する
- グローバルに参照する Provider は `{feature}_providers.dart` または `core/di/providers.dart` に置く
- `ref.watch` は build メソッド内のみ。ハンドラ内では `ref.read` を使う

### IndexedStack 配下の一覧画面における invalidate（重要）

`StatefulShellRoute.indexedStack` 配下では、一覧画面ウィジェットが `IndexedStack` で保持されるため `AutoDispose` が破棄されず古い state が残る。

**詳細・作成画面で一覧の内容が変わる操作（追加・削除・ステータス変更）を行った場合は、一覧画面に戻る前に必ず一覧 Provider を explicit に invalidate すること。**

```dart
// Page 側の ref.listen や操作コールバックで invalidate する
ref.invalidate(shoppingListNotifierProvider);
```

対象となる操作パターン:
- アイテム追加後（作成画面 submit 成功時）
- アイテム削除後（詳細画面 deleteItem 成功時）
- ステータス変更後（詳細画面 updateStatus 成功時）
- お気に入り操作後（詳細画面 toggleFavorite 成功時）

> **背景（Sprint 35）**: 追加後・お気に入り操作後の反映漏れを Sprint 35 で修正したが、ステータス変更後の invalidate が漏れており Sprint Review で指摘された（#107）。削除後の反映も同様（#108）。

---

## 5. ナビゲーション（go_router）

- 全ルートは `app_router.dart` に集約する
- 認証状態（`authNotifierProvider`）を `redirect` で監視し、未認証→`/login` へリダイレクト
- ディープリンクパス（`/email-verify`・`/invite/:token`・`/password/reset`）は `_publicPrefixes` に含め、認証不要として扱う
- `context.go()` と `context.push()` を使い分ける（履歴スタックを置き換えるか積むか）

---

## 6. ネットワーク層（Retrofit / Dio）

- API クライアントは `@RestApi` アノテーションで定義し、`build_runner` でコード生成する
- リクエスト/レスポンスモデルは `data/models/` に置き、`fromJson` は `json_serializable` で生成する
- エラーは `DioException` をキャッチし `AppException` サブクラスに変換して上位へ伝播させる

```dart
// Repository impl のエラーハンドリングパターン
} on DioException catch (e) {
  if (e.error is AppException) throw e.error!;
  throw NetworkException(e.message ?? 'Network error');
}
```

- 認証トークンの付与・リフレッシュは `AuthInterceptor` で一元管理する

### エラーハンドリングルール

- **`catch (_) {}` でエラーを握りつぶしてはならない**（Sprint 34 Review で指摘）。コンテキストに応じて以下のいずれかを行うこと：
  - **Repository / Service 層**: `rethrow` または `AppException` サブクラスに変換して `throw`
  - **Notifier 層**: `on AppException catch (e)` でメッセージを state に格納し、予期しない例外は汎用メッセージを格納する（rethrow しない）。空ボディの `catch (_) {}` は引き続き禁止

```dart
// NG: エラーを握りつぶす（空ボディ）
} catch (_) {}

// NG: 意味のない rethrow（Riverpod に吸収されるだけで UI に反映されない）
} catch (_) { rethrow; }

// OK（Repository層）: rethrow
} catch (e) {
  rethrow;
}

// OK（Repository層）: AppException に変換
} on DioException catch (e) {
  if (e.error is AppException) throw e.error!;
  throw NetworkException(e.message ?? 'Network error');
}

// OK（Notifier層）: state に格納して UI へ通知（Sprint 36 で確立）
} on AppException catch (e) {
  state = AsyncData(current.copyWith(errorMessage: e.message));
} catch (_) {
  state = AsyncData(current.copyWith(errorMessage: 'errorUnexpected'));
}
```

---

## 7. テスト方針（flutter_test + mockito）

### テスト対象の分類

| 種別 | テスト | 備考 |
|---|---|---|
| Repository impl | **必須** | 成功パス + DioException→AppException 変換 |
| Notifier | **必須** | 各操作の状態遷移（成功・エラー） |
| Page（ウィジェット） | **必須** | 主要な表示確認・ユーザー操作のゴールデンパス |
| 自動生成ファイル（`.g.dart` / `.mocks.dart`） | **不要** | 除外対象 |

### Repository impl テスト時のモック構造確認（重要）

Repository のモックを作成する前に、バックエンドの実際の API レスポンス構造を必ず確認すること。

- **ラッパー形式 `{"items": [...]}` か、フラットなリスト `[...]` かを確認する**
- バックエンドの `@RestApi` / Controller の戻り値型・レスポンスクラスを `hw-hub-backend` で確認する
- モックを誤った構造で作成すると、テストが通過してもランタイムで `ClassCastException` が発生する（Sprint 33 で発生）

```dart
// NG: フラットリストをレスポンスとしてモック
when(mockDio.get(...)).thenAnswer((_) async => Response(data: [{"id": 1, ...}], ...));

// OK: ラッパー形式を確認してモック
when(mockDio.get(...)).thenAnswer((_) async => Response(data: {"items": [{"id": 1, ...}]}, ...));
```

### ウィジェットテストのヘルパー

`test/helpers/widget_test_helpers.dart` に共通ヘルパーがある。

```dart
// 通常のウィジェットテスト（GoRouter不要な場合）
await tester.pumpWidget(buildTestPage(const LoginPage(), overrides: [...]));

// ナビゲーションテスト（context.go/push を含む場合）
await tester.pumpWidget(buildTestPageWithRouter(
  routes: [
    GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
    GoRoute(path: '/signup', builder: (_, __) => const Scaffold(body: Text('signup-page'))),
  ],
  overrides: [...],
  initialLocation: '/login',
));
await tester.pumpAndSettle();
await tester.tap(find.text('新規登録'));
await tester.pumpAndSettle();
expect(find.text('signup-page'), findsOneWidget);
```

### Provider オーバーライドのパターン

```dart
// 非ファミリープロバイダー
loginNotifierProvider.overrideWith(() => _FakeLoginNotifier())

// ファミリープロバイダー（引数あり）
// NG: passwordResetSentNotifierProvider('email').overrideWith(...)  ← コンパイルエラー
// OK: ファミリープロバイダー本体に対して呼ぶ
passwordResetSentNotifierProvider.overrideWith(() => _FakeNotifier())
```

### フェイク Notifier の実装パターン

```dart
// 初期状態だけ差し替える（最もシンプル）
class _ErrorLoginNotifier extends LoginNotifier {
  @override
  LoginState build() => const LoginState(errorMessage: 'エラー');
}

// build() 後に状態遷移させて ref.listen / SnackBar / ナビゲーションをトリガーする
class _SentEmailNotifier extends PasswordForgotNotifier {
  @override
  PasswordForgotState build() {
    Future.microtask(() => state = state.copyWith(sentEmail: 'test@example.com'));
    return const PasswordForgotState();
  }
}
```

### `pump()` vs `pumpAndSettle()` の選択ルール

```
CircularProgressIndicator が画面にある → pumpAndSettle() でタイムアウトする
→ pump() を使う（アニメーションを1フレーム進めるだけで十分）

画面遷移・SnackBar表示など、アニメーションが終わるまで待ちたい → pumpAndSettle()
Future.microtask による状態遷移を待つ場合 → pump(); pump(); で2フレーム進める
```

### Notifier テストの書き方

```dart
ProviderContainer makeContainer(String email) {
  final container = ProviderContainer(
    overrides: [
      secureStorageProvider.overrideWithValue(mockStorage),
      authRepositoryProvider.overrideWithValue(mockRepo),
    ],
  );
  addTearDown(container.dispose);
  return container;
}

// 操作してから状態を確認
await container.read(someNotifierProvider.notifier).doSomething();
expect(container.read(someNotifierProvider).isSending, false);
```

### タイマーを含む Notifier のテスト（fakeAsync）

`fake_async` を `pubspec.yaml` の `dev_dependencies` に直接追加する（`flutter_test` 経由では使えない）。

```yaml
dev_dependencies:
  fake_async: ^1.3.1
```

```dart
import 'package:fake_async/fake_async.dart';

test('1秒後にcooldownが減少する', () {
  fakeAsync((fake) {
    final container = makeContainer('test@example.com');
    // AutoDispose を防ぐためサブスクリプションを保持する（必須）
    final sub = container.listen(
      emailVerifyWaitNotifierProvider('test@example.com'),
      (_, __) {},
    );

    container.read(emailVerifyWaitNotifierProvider('test@example.com').notifier).resend();
    fake.flushMicrotasks(); // async処理を完了させる

    fake.elapse(const Duration(seconds: 1));
    expect(container.read(emailVerifyWaitNotifierProvider('test@example.com')).cooldownSeconds, 59);

    sub.close();
  });
});
```

**注意**: `container.listen()` がないと AutoDispose が `fake.flushMicrotasks()` のタイミングでプロバイダーを破棄し、タイマーが消えて状態が初期値に戻る。

### 複数の使い捨て引数は `_` を繰り返す（unnecessary_underscores）

Dart の `unnecessary_underscores` lint は `__`（2つ以上のアンダースコア変数）を禁止する。複数の無視引数は全て `_` を使う。

```dart
// NG: GoRoute builder / container.listen などで __ を使うとlintエラー
GoRoute(path: '/login', builder: (_, __) => const LoginPage())
container.listen(provider, (_, __) {})

// OK
GoRoute(path: '/login', builder: (_, _) => const LoginPage())
container.listen(provider, (_, _) {})
```

### モックの定義場所

- `test/features/{feature}/auth_mocks.dart` にまとめて `@GenerateMocks([...])` を定義する
- `@GenerateMocks` の更新後は `dart run build_runner build --delete-conflicting-outputs` を実行する

### カバレッジ除外パターン

除外パターンは `lcov_exclude.txt` で管理する。以下は除外対象。

- `lib/main.dart` / `lib/app_router.dart`
- `lib/l10n/*`（自動生成）
- `lib/core/config/*` / `lib/core/storage/*` / `lib/core/theme/*`（定数・設定のみ）
- `lib/core/di/*`（Provider 配線のみ）
- `lib/features/shell/*`（ナビゲーションシェル）
- `*/*.g.dart` / `*/*.mocks.dart`（コード生成）

カバレッジ計測は `coverage.ps1` を実行する（Windows PowerShell ネイティブで lcov フィルタリングを行う）。

CI（`coverage-mobile.yml`）の lcov コマンドには `--ignore-errors unused` を付ける。除外パターンが lcov.info に存在しない場合、lcov が exit code 25 で終了するため。

```yaml
lcov --remove coverage/lcov.info $PATTERNS --ignore-errors unused --output-file coverage/lcov_filtered.info
```

### 構造的に到達できないコード

以下は現行実装の制約上テストで到達できない。カバレッジ除外対象にしてよい。

- `household_notifier.dart` build() のハードコード空リスト返却（実APIコール前の仮実装）
- `auth_notifier.dart` の `Platform.isIOS` 分岐（iOS ビルドが存在しないため）

---

## 8. コード生成

生成が必要な場面と実行コマンド。

| 目的 | コマンド |
|---|---|
| Retrofit `.g.dart` 生成 | `dart run build_runner build --delete-conflicting-outputs` |
| Mockito `.mocks.dart` 生成 | 上と同じ（同時に生成される） |
| i18n Dart ファイル生成 | `flutter gen-l10n` |

- `.g.dart` / `.mocks.dart` / `lib/l10n/app_localizations*.dart` は自動生成ファイル。**直接編集禁止**

---

## 9. i18n 追加手順

1. `lib/l10n/app_ja.arb` にキーと日本語文字列を追加
2. `lib/l10n/app_en.arb` に同じキーと英語文字列を追加
3. `lib/l10n/app_es.arb` に同じキーとスペイン語文字列を追加
4. `flutter gen-l10n` を実行
5. 各 Page で `AppLocalizations.of(context).キー名` を使う

ハードコードの日本語・英語文字列は追加しないこと。

---

## 10. コミット前の必須作業

```bash
dart format .
flutter analyze
flutter test
```

フォーマット未適用・解析エラーありの状態でコミットしない。

---

## 11. デザイン参照方針

- **Mobileのspecで指定がない場合は `hw-hub-frontend` のホーム画面SP版を参照する**
- 色・レイアウト・表示順序・グラフ仕様など、specに明記されていない要素はwebのSP版に揃えること
- webのSP版と異なる実装が必要な場合は、specに明示的に記載する

> **背景（Sprint 26 Retro）**: 積み上げ棒グラフの未割当の表示順序など、specに記載がなかった要素がwebと異なっていたことがSprint Reviewで指摘された。
