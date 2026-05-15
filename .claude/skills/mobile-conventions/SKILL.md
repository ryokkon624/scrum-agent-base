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
