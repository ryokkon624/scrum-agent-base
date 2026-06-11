---
name: mobile-conventions
description: HwHubモバイル（hw-hub-mobile）の設計規約・実装方針。Dartファイル・Flutterウィジェット・RiverpodのNotifier・Retrofitクライアント・テストファイルを新規作成・編集するときは必ずこのスキルを参照すること。feature-first構成・アーキテクチャ層・状態管理・テスト方針・i18nなど、実装の判断に必要な規約をすべてここに集約している。
---

# Mobile Conventions

hw-hub-mobileの設計規約・実装方針。

特定の実装場面でだけ必要になる詳細パターンは `patterns/` 配下に分離している。本文中のリンク先は、該当する実装をするときだけ読むこと。

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
- i18n キー構造: `{screen}{Context}` のキャメルケース（例: `loginTitle` / `signupSubmitButton` / `passwordResetSentResendSuccess`）
- `const` コンストラクタを積極的に使い、不要な再ビルドを避ける
- コード値（APIから返される文字列/数値の区分値）はマジックストリングで直接比較せず、`core/models/` 配下の enum を使う

### m_code で管理されている区分値（自動生成）

`lib/core/models/` には `hw-hub-database` の `./gradlew generateEnums` で生成した enum が配置済み。
`PurchaseLocationType`, `TaskStatus`, `Category` など m_code に登録されている区分値はすべてここにある。
**新しく作らず、生成済みのファイルを import して使うこと。**

```dart
import 'package:hw_hub_mobile/core/models/purchase_location_type.dart';

// コード値との比較
if (item.storeType == PurchaseLocationType.supermarket.code) { ... }

// コード値から enum に変換
final type = PurchaseLocationType.fromCode(item.storeType); // 不正値は null
```

生成済み enum はすべて「`code` フィールド + `fromCode(String?)`（不正値は null を返す）」の統一形式になっている。

m_code が更新された場合は `./gradlew generateEnums`（hw-hub-database）を実行し、生成ファイルを `lib/core/models/` に上書きコピーしてコミットする。

### m_code で管理されていない区分値（カスタム定義）

画面固有の状態や API の仕様に由来するが m_code に登録されていない区分値は、`core/models/` に手動で作成する。

```dart
// lib/core/models/password_reset_result.dart の例（m_codeに無いカスタム enum）
enum PasswordResetResult { success, expired, invalid }
```

- カスタム enum はコード値を持たない（画面状態の分岐にのみ使う）ことが多い
- API レスポンスのフラグなど文字列/数値のマッピングが必要な場合は生成済み enum と同じ形式（`fromCode` + null 安全）で作る

### UI実装チェックリスト（過去スプリントで実際に踏んだ罠）

ウィジェット・フォームを実装するたびに確認すること。各項目の末尾は発生スプリント。

- **`copyWith` は全フィールドを列挙する**。一部だけ書くと他フィールドが更新できず「バグか仕様か」混乱の元になる（Sprint 46 #122）
- **全幅カードは幅を明示する**。`Container` はデフォルトでコンテンツサイズになるため、`SizedBox(width: double.infinity)` または `Column(crossAxisAlignment: CrossAxisAlignment.stretch)` を指定する（Sprint 31）
- **`Dismissible` のスワイプ方向は3点セットで一致を確認する**: `background`（startToEnd=右スワイプ）・`secondaryBackground`（endToStart=左スワイプ）・`confirmDismiss` の `direction` 判定。スワイプモード専用 Widget にも同じルールを適用する（Sprint 40 #115 / Sprint 42 #116 で2回逆転）
- **増減する横並びアイテムは `Wrap(spacing, runSpacing)` で折り返す**。固定高さ + `ListView(scrollDirection: Axis.horizontal)` は項目が画面外に流れて非表示になる。水平スクロールはUX仕様として必要な場合のみ（Sprint 40 #111）
- **ユーザーアイコンは `core/ui/user_avatar.dart` の `UserAvatar` を使う**（新規作成しない）。割当済みユーザーには members から `iconUrl` を lookup して渡すこと。`iconUrl: null` のハードコードは「未割当（未）表示」専用（Sprint 40 #112 / Sprint 42 #118）
- **長くなりうる `Text` には `overflow: TextOverflow.ellipsis` + `maxLines` を指定する**。`Row` 内の `Text` は `Expanded` / `Flexible` で囲む（Sprint 41）
- **リスト生成の最外ウィジェットに `key: ValueKey(item.uniqueId)` を付与する**。`items.map()` でも `ListView.builder` の `itemBuilder` でも、`Dismissible` の外側の `Padding` 等に付与しないとリスト更新時にウィジェット状態が別要素に紐づく（Sprint 38 / 39 / 59 で3回指摘）
- **一覧画面の `AsyncValue` は4ケースすべて実装する**: `loading` / `error` / `data` 0件（専用の空状態ウィジェット）/ `data` 1件以上。0件をローディング表示で流用しない（Sprint 47 #136）
- **スクロール可能な一覧・詳細画面は `RefreshIndicator` でラップする**。`physics: const AlwaysScrollableScrollPhysics()` を指定し（コンテンツが画面未満でもスワイプ可にする）、`onRefresh` で Notifier の reload または `ref.invalidate` を呼ぶ（Sprint 51 #151 で8画面未実装）
- **フォームへ値を流し込むときは State と `TextEditingController.text` を両方更新し、全フィールド横展開する**。`TextFormField(initialValue:)` は初回 build しか反映されない。`ref.listen` 内で `controller.text` を変えるときは `setState()` で包む → 詳細: [patterns/form-controller.md](patterns/form-controller.md)（Sprint 47 #137 / 54 #146 / 55 #131）
- **日付入力は存在しない日付（2/30等）を弾くバリデーションを実装する**。Dart の `DateTime` は無効な日付を自動繰り越しする → 詳細: [patterns/date-validation.md](patterns/date-validation.md)（Sprint 47 #138 / 54 #147）
- **`build()` 内で重い計算をしない**。O(n×m) の集計・`where().length`・条件分岐用フラグ（OWNER判定等）は Notifier 側で事前計算し、`Map` / `bool` として State に持たせて O(1) 参照する（Sprint 39 / Sprint 46 #122）

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

### AutoDispose の設定ルール（重要）

画面固有の `AsyncNotifierProvider` / `NotifierProvider` には原則 `autoDispose` を付与すること（例: `AsyncNotifierProvider.autoDispose<...>`）。付与しないと画面離脱後もプロバイダーがメモリに残り続ける。詳細・設定系画面に限らず**一覧画面の Notifier も対象**（Sprint 45 / Sprint 48 で2回指摘）。

**autoDispose を付けてはいけないプロバイダー（グローバル共有 Provider）**:

- 未読件数など全画面共通で参照するグローバル Provider（`core/di/providers.dart` に置くもの）
- `authNotifierProvider` など認証状態 Provider

### IndexedStack 配下の一覧画面における invalidate（重要）

`StatefulShellRoute.indexedStack` 配下では、一覧画面ウィジェットが `IndexedStack` で保持されるため `AutoDispose` が破棄されず古い state が残る。

**詳細・作成画面で一覧の内容が変わる操作（追加・削除・ステータス変更・お気に入り操作）に成功したら、一覧画面に戻る前に必ず一覧 Provider を `ref.invalidate(...)` で明示的に無効化すること**（Sprint 35 / #107 / #108 で反映漏れ3件）。

### 認証系 Provider の invalidate タイミング

`logout()` では **`state = AuthUnauthenticated()` を先にセットしてから** `ref.invalidate` する（逆順だと 401 → 再ログアウトの無限ループになる。Sprint 58 #172）。グローバル Provider の invalidate はログイン成功後（`saveTokens()`）に行う（Sprint 58 #158）→ 詳細: [patterns/auth-interceptor.md](patterns/auth-interceptor.md)

---

## 5. ナビゲーション（go_router）

- 全ルートは `app_router.dart` に集約する
- 認証状態（`authNotifierProvider`）を `redirect` で監視し、未認証→`/login` へリダイレクト
- ディープリンクパス（`/email-verify`・`/invite/:token`・`/password/reset`）は `_publicPrefixes` に含め、認証不要として扱う
- `context.go()` と `context.push()` を使い分ける（履歴スタックを置き換えるか積むか）
  - `context.push()`: 詳細閲覧など「戻る操作が自然」な遷移に使う
  - `context.go()`: フォーム送信成功後など「前の画面に戻ってほしくない」遷移に使う
  - **⚠️ 新規作成成功後の詳細画面遷移は `context.go()` を使う**: `context.push()` を使うと戻るスタックに新規作成画面が残り、「←」で新規作成画面に戻ってしまう（Sprint 48 #149）
- **シェル外ルート（例: `/notifications`）からシェル内ルートへ `context.push()` する前に、`matchedLocation` を確認して `context.pop()` を先行させる**。怠ると `HeroController` のキー衝突でクラッシュする（Sprint 57 #157）→ 詳細: [patterns/hero-controller-conflict.md](patterns/hero-controller-conflict.md)

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

### AuthInterceptor のトークンリフレッシュ

複数リクエストが同時に 401 を受けても、リフレッシュ API を1回だけ呼んで全待機リクエストを再送する（`Completer<void>` による並行制御）。リフレッシュ用 Dio は AuthInterceptor をアタッチしない別インスタンスを使う（無限ループ防止）。トークン保存は `AuthNotifier.updateTokens()` に一元化する（Sprint 64 #179）→ 実装詳細: [patterns/auth-interceptor.md](patterns/auth-interceptor.md)

### Dio の型パラメータは必ず具体型を指定する

`_dio.get<dynamic>()` ではなく `_dio.get<List<dynamic>>()` / `_dio.get<Map<String, dynamic>>()` のように具体型を指定する。`<dynamic>` のままだと2段階キャストが必要になり、テストでモックのスタブも型が合わず効かない（Sprint 46 #122）。

### デバッグログのセキュリティルール

`debugPrint` でキャッチした例外オブジェクト（`$e`）を直接出力してはならない。スタックトレース・内部状態がログに露出する。`debugPrint('Google sign-in failed')` のような固定の警告文字列のみ出力する（Sprint 45）。

### エラーハンドリングルール

- **`catch (_) {}` でエラーを握りつぶしてはならない**（Sprint 34 Review で指摘）。コンテキストに応じて以下のいずれかを行うこと：
  - **Repository / Service 層**: `rethrow` または `AppException` サブクラスに変換して `throw`
  - **Notifier 層**: `on AppException catch (e)` でメッセージを state に格納し、予期しない例外は汎用メッセージを格納する（rethrow しない）。空ボディの `catch (_) {}` は引き続き禁止
  - **StatefulWidget の event handler 内**: `on AppException catch (e)` でメッセージを `setState` で保持して画面内に表示、それ以外は `AppSnackBar` で汎用通知を表示する

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

// OK（StatefulWidget event handler内）: AppException はメッセージを setState で保持、その他は AppSnackBar で汎用通知（Sprint 43 で追加）
} on AppException catch (e) {
  setState(() => _errorMessage = e.message);
} catch (_) {
  AppSnackBar.showError(context, 'errorUnexpected');
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
| 操作ロジックを持つウィジェット | **必須** | ユーザー操作 → コールバック（Notifier 呼び出し等）を含む子ウィジェットはページ外でもウィジェットテスト必須（例: `SegmentedButton` 選択 → `onThemeModeChanged` 呼び出しを確認） |
| 見た目のみの子ウィジェット | **不要** | 表示ロジックがない純粋な描画ウィジェット（ラベル・装飾等）はテスト対象外 |
| 自動生成ファイル（`.g.dart` / `.mocks.dart`） | **不要** | 除外対象 |

**判断基準**: コールバック引数（`onXxx`）が Notifier 呼び出しや状態変更を含む場合はウィジェットテスト必須。純粋に表示だけなら不要（Sprint 52 #130）。

### Repository impl テスト時のモック構造確認（重要）

Repository のモックを作成する前に、バックエンドの実際の API レスポンス構造を必ず確認すること。

- **ラッパー形式 `{"items": [...]}` か、フラットなリスト `[...]` かを確認する**
- バックエンドの `@RestApi` / Controller の戻り値型・レスポンスクラスを `hw-hub-backend` で確認する
- モックを誤った構造で作成すると、テストが通過してもランタイムで `ClassCastException` が発生する（Sprint 33 で発生）

### ウィジェットテストで日本語テキストを直接検証しない（重要）

`find.text('日本語文字列')` でのウィジェット検索・検証、および `(tester.widget(...) as Text).data == '日本語'` のようなキャスト経由の検証は禁止。ARB の文字列変更に脆く、多言語テスト環境に対応できない（Sprint 45 / Sprint 53 で2回指摘）。

**代わりに `Key` ベースで検証すること。**各ウィジェット（セクション・バッジ・ボタン等）に `Key` を付与し、`find.byKey` で検索する。

```dart
// NG: 日本語テキスト直接検証 → ARB変更・多言語対応で壊れる
expect(find.text('パスワード変更'), findsOneWidget);

// OK: Key ベースで検証 → 表示文字列に依存しない
// ウィジェット側: PasswordChangeSection(key: const Key('passwordChangeSection'), ...)
expect(find.byKey(const Key('passwordChangeSection')), findsOneWidget);
```

例外（英語固定文字列のみ許容）: テスト用のルーティング先 Scaffold の body テキスト（例: `Text('signup-page')`）など、テスト専用プレースホルダーは引き続き `find.text` で参照可。

### ウィジェットテストのヘルパー

`test/helpers/widget_test_helpers.dart` に共通ヘルパーがある。

```dart
// 通常のウィジェットテスト（GoRouter不要な場合）
await tester.pumpWidget(buildTestPage(const LoginPage(), overrides: [...]));

// ナビゲーションテスト（context.go/push を含む場合）
await tester.pumpWidget(buildTestPageWithRouter(
  routes: [
    GoRoute(path: '/login', builder: (_, _) => const LoginPage()),
    GoRoute(path: '/signup', builder: (_, _) => const Scaffold(body: Text('signup-page'))),
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

### タイマーを含む Notifier のテスト

`fake_async` パッケージ（`dev_dependencies` に直接追加）で時間を進めてテストする。AutoDispose による破棄を防ぐため `container.listen()` でのサブスクリプション保持が必須 → 詳細: [patterns/fake-async-timer.md](patterns/fake-async-timer.md)

### 複数の使い捨て引数は `_` を繰り返す（unnecessary_underscores）

Dart の `unnecessary_underscores` lint は `__`（2つ以上のアンダースコア変数）を禁止する。複数の無視引数は全て `_` を使う。

```dart
// NG: GoRoute builder / container.listen などで __ を使うとlintエラー
GoRoute(path: '/login', builder: (_, __) => const LoginPage())

// OK
GoRoute(path: '/login', builder: (_, _) => const LoginPage())
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

### バックエンドからキー値を受け取って翻訳する機能の注意事項

通知メッセージなど「バックエンドが文字列キーを返し、Flutter側でARBキーに変換して翻訳する」設計では、**計画フェーズでバックエンドが実際に返すキー値を確認し、Flutter ARBキーと突き合わせること**（Sprint 43 #124 でキー不一致によりi18nキーがそのまま表示された）。

Flutter は動的ARBキー参照ができないため、`notification_message_renderer.dart` のようにディスパッチテーブルで変換する。

確認事項（計画フェーズ）:

- バックエンドDBの実際のキー値（例: `t_notification.title_key` の値）
- Flutter ARBキーとの命名規則の一致
- `params` の型・キー名

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

---

## 12. 外部パッケージ採用実績

| パッケージ | 用途 | 方針 |
|---|---|---|
| `table_calendar` | カレンダー表示 | 自作しない。読み取り専用カレンダーの実装は [patterns/table-calendar.md](patterns/table-calendar.md) 参照（Sprint 41 #114） |
| `package_info_plus` | アプリバージョン取得 | `PackageInfo.fromPlatform()` を `AsyncNotifier.build()` 内で await する。他の非同期処理（バックエンドAPI等）とは `Future.wait` で並行実行する（Sprint 49 #142） |

---

## 13. 静的コンテンツ画面の設計パターン

利用規約・プライバシーポリシーなど「APIコールも状態管理も不要な情報表示画面」では Notifier / Repository / State の3点セットを作らない（過剰設計）。

- `StatelessWidget` で実装する（`ConsumerWidget` も不要）
- `SingleChildScrollView` + `Column` でスクロール可能なコンテンツを表示し、テキストはすべて ARB に定義する
- ウィジェットテストは「画面が表示できること」と「主要なセクション Key が存在すること」の確認だけで十分

> **背景（Sprint 49 #143/#144）**: 状態管理不要なコンテンツ表示画面を StatelessWidget のみで実装する方針をユーザーが承認した。
