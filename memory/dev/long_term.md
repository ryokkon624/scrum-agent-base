# Dev 長期記憶

**最終更新**: 2026-05-15

---

## long_term.md の目的

「次の自分が同じミスを繰り返さず、より速く正確に動くための手掛かり」を蓄積する場所。

- 技術的なハマりポイントと解決策
- 繰り返し指摘を受けるパターン（コミット前に参照）
- テスト・実装で躓きやすい罠

---

## 繰り返し指摘されるパターン（過去実績あり）

### hw-hub-frontend

| パターン                                                  | 発生スプリント | 対応                                                           |
| --------------------------------------------------------- | -------------- | -------------------------------------------------------------- |
| i18n ハードコード（文字列リテラルをテンプレートに直書き） | 33, 34         | `t('キー')` 形式。yup エラーメッセージも i18n キー文字列で渡す |

### hw-hub-mobile

| パターン                                                        | 発生スプリント | 対応                                                                          |
| --------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------- |
| マジックストリング（status/flag値を `'0'`/`'1'` で直接比較）    | 34, 35         | `core/models/` の生成済み enum（`ShoppingItemStatus.xxx.code`）を使う         |
| `catch (_) {}` でエラーを握りつぶし                             | 34, 35         | `rethrow` または `AppException` に変換                                        |
| i18n ハードコード（日本語・英語文字列をウィジェット内に直書き） | 33, 34         | ARB ファイルに定義して `AppLocalizations.of(context).key` を使う              |
| IndexedStack 配下で一覧 Provider の invalidate 漏れ             | 35             | 詳細・作成画面での追加/削除/ステータス変更後に `ref.invalidate(一覧Provider)` |

### hw-hub-backend

（現時点で繰り返し指摘の実績なし）

### hw-hub-batch

（現時点で繰り返し指摘の実績なし）

---

## 技術的なハマりポイント

### hw-hub-frontend

- store の内部状態フィールド（`lastFetchedAtByHouseholdId` 等）はコンポーネントから直接参照せず、getter（`isFetchedFor` 等）経由でアクセスする（カプセル化）
- スワイプジェスチャーは `composables/useSwipeGesture.ts` に切り出し、touchstart/touchmove/touchend のみ扱う（マウスイベントは無視）。translateX をリアルタイム返却して2層構成（背景＋前面）でドラッグ追従を実現
- スワイプ背景色は `main.css` に `bg-hwhub-swipe-action/delete/back/disabled` のカラートークンで指定する（生クラス禁止）
- ユーザーアイコンの broken image 対策は `components/ui/UserAvatar.vue`（`imageError = ref(false)` + `@error="imageError = true"` パターン）
- SP/PCのレイアウト分岐はTailwindの `md:` ブレークポイントで切り替え（`md:hidden` でSP専用、`md:block` でPC専用）
- スケルトンスクリーンは `components/ui/SkeletonItem.vue`（variant別 + count指定）として共通化。初回ロード中は `withLoading` を使わず `isInitialLoading` フラグで制御（二重ローディング表示を回避）
- Tailwind v4 では `@custom-variant dark (&:where(.dark, .dark *):not(.light *):not(.light));` で `dark:` バリアントを定義する
- FOUC防止は `index.html` の `<head>` 内インラインスクリプトで LS から読んで即 `<html class>` をセットする方式が確実
- `themeStore.init()` を `main.ts` で `app.use(router)` の前に呼ぶ（matchMedia リスナー登録のため）
- フロントの sessionStorage 永続化（`Set<number>`）は `JSON.stringify([...set])` ⇔ `new Set(JSON.parse())` で変換する
- 認証経路が複数ある場合（login/register/completeOAuthLogin）、不要な再フェッチを避けるため `if (!store.isLoaded)` ガードを各経路に入れる
- API契約のDTO型は `string` のままにして `toModel` でブランド型へキャストするのが最小影響

### hw-hub-mobile

- `showDialog(builder: (context) => ...)` 内で `Navigator.pop(context)` を使うと go_router 環境では外側 context が解決されページが閉じる。`builder: (dialogContext)` で明示的に受け取り `Navigator.pop(dialogContext)` を使うこと
- `IndexedStack` 配下では `AutoDispose` が破棄されず古い state が残る。詳細・作成画面で一覧が変わる操作後は必ず `ref.invalidate(一覧Provider)` を呼ぶ（操作の種類を問わず網羅すること）
- S3 Presigned URL への PUT は `AuthInterceptor` を通してはいけない（Authorization ヘッダが付くと S3 が 403）。`Dio()`（baseUrl 無し・interceptor 無し）の別インスタンスを使う
- Repository の API レスポンス形状（ラッパー `{"items":[...]}` か フラット配列か）はバックエンドの Controller / Response クラスを必ず確認してからモックを書く
- ウィジェットテストで `find.text('削除')` のような短いテキストはスワイプ背景ラベルと確認ダイアログボタンの両方にヒットしやすい。`find.text('...').last` や `find.descendant` で特定する
- Flutter の `Container` は子サイズに自動でフィットするため、全幅表示は明示的に `width: double.infinity` を指定する（Dismissible 内のカードは特に注意）
- `AppRoutes` 定数化は `context.go()` 引数の置換から先行し、`GoRoute(path: ...)` 側の置換は別 Issue で分離すると安全
- AssigneeUserId フィルタ忘れ注意: バックエンドが全世帯員分を返す画面ではフロント側フィルタが必要
- `AuthUser` のような共有ドメインモデルは `lib/core/models/` 配下に置く（core→features 依存を作らないため）
- `ServerException` などのカスタム例外が named パラメータ（`message:`）か positional かはテスト書き始める前に必ず確認する

### hw-hub-backend

- AWS SDK v2 を使う。`spring-cloud-aws` は Spring Boot 4.x と非互換なので使わない
- STG環境はEphemeral構成。使うときだけ `terraform apply`、終わったら `terraform destroy`
- `mybatisGenerator` は既存XMLに追記する動作のため、実行前に `rm -rf src/main/resources/mapper/generated` を必ず実行する。省略すると全Mapper XMLに定義が二重になってSpring Boot起動不可
- `m_code.code_value` は **VARCHAR(10)** 制限。長いコード値を入れると Flyway 失敗の原因になりやすい（例: `HOUSEWORK_ASSIGN` → `HW_ASSIGN`）
- Flyway失敗で `Already exists` エラー発生時: `DELETE FROM flyway_schema_history WHERE version='XX.XXX.XXX'` → 部分的成功分を手動削除 → 再実行
- Spockで例外検証する場合は `thrown(IllegalArgumentException)` のように具体的な型を指定する（想定外の例外をパスしないように）
- ShoppingItem系の認可チェックパターンは `item.getHouseholdId()` + `householdAuthorizationService.canAccessHousehold` で統一（updateStatus / updateFavorite / update / delete すべて同じ）
- `@RequiresPermission` 1つで複数ロール（ADMIN/SUPPORT）を許可する場合、`m_role_permission` に複数行入れるだけ（コード側に分岐を増やさない）
- Domain Model と全フィールド一致する Inner record は不要なボイラープレート。Service は Domain Model を直接返してよい

### hw-hub-batch

（現時点で実績なし）

---

## 習得したこと

### hw-hub-frontend

- Tailwind v4 の `@custom-variant dark` で `dark:` バリアントを定義し、`:root`/`:root.dark`/`@media prefers-color-scheme` の三段構成でライト/ダーク/OS追従を実現する
- パッケージ移動を含むリファクタは GREEN 状態を維持しながら段階的に進める（先に移動・参照更新で全テスト通る状態を作ってから新機能追加に入る）
- `as const` + `(typeof X)[keyof typeof X]` パターンで code.constants.ts に定数とブランド型を定義し、ベタ書き文字列を `XXX.YY` 参照に置換すると安全に横展開できる
- `route.meta.featureScope` を Banner 側で読み取り、Store getter のシグネチャに渡す（`visibleForRoute(routeName, currentScope)`）形にすると子ルート対応が一発で効く
- yup の `required()` メッセージは i18n キー文字列を渡しておき、テンプレ側で `t(errors.xxx)` の形にしないとロケール切替で動かない
- yup の `byte-length` テストは `new TextEncoder().encode(s).length` で計算する（マルチバイト・絵文字も安全）
- 「同名文字列」が別意味で使われる箇所（`'ALL'` のローカルフィルタ等）は横展開対象外として明示的に除外する
- vee-validate の `errors` が空でない場合 `Object.keys(errors).length > 0` でボタン無効化制御すると AC「エラー時ボタン無効化」を防御的に満たせる

### hw-hub-mobile

- Flutter標準 `Dismissible` で「キャンセル可能なスワイプ削除」: `confirmDismiss` 内で `showDialog` を `await` し、キャンセル時は `false` を返すとカードが元の位置に戻る。スワイプ実装のデファクトとして継続採用
- 詳細画面で itemId をキーにした画面ごとの状態は `AutoDisposeFamilyNotifier`／`NotifierProvider.autoDispose.family` で実装する
- `Notifier.build()` が同期の場合、初期非同期ロードは `Future.microtask(() => _initialize(itemId))` で蹴り、`isLoading: true` の初期 state を返す
- `AsyncNotifier.build()` で `ref.watch(householdNotifierProvider.future)` を await することで世帯切り替えに自動追従（AutoDispose + invalidate不要）
- image_picker のモックは Notifier に差し込まず、`setPickedImage(bytes, fileName)` に `XFile` を読んだ結果を渡す契約にするとテスタビリティが上がる
- ログインユーザー情報のような「全画面共通の認証コンテキスト」は `AuthAuthenticated(user)` のように auth state 自体に持たせるのが最小コスト。各 Notifier に個別呼び出しを持たせるのは早期の重複の兆候
- Riverpod テストで authState を差し替える際は `_FakeAuthNotifier extends AuthNotifier` を作って `build()` だけ override すれば十分
- `AuthNotifier.build()` で `/me` を呼ぶ場合、ネットワーク失敗時は `AuthUnauthenticated` にフォールバックし、router 側で `/login` リダイレクトに任せる方が UX が破綻しない
- AC違反の動作を既存テストが「正」として通過させていた場合、DEV・reviewer・SM誰も気づかない。Sprint Review HTML生成時にACとコードを対応させる作業が再発防止の機能を果たす
- `isNotPurchased` のような否定ゲッターは「対象ステータスのみ true」に限定する。他ステータスを含めない設計が直感的
- web SP版とモバイルでデザインが異なると Sprint Review で指摘されやすい。specに明記がない要素は hw-hub-frontend の SP版を参照する
- Notifier 層のエラーハンドリングは `on AppException catch (e)` でメッセージを state に格納し、予期しない例外は汎用メッセージを格納する（空ボディの `catch (_) {}` は禁止。rethrow は Riverpod に吸収されるだけで UI に反映されない）（Sprint 36 で確立・横展開完了）

### hw-hub-backend

- MyBatisはJava recordをサポートしている
- UserModel.reconstruct のシグネチャ変更は既存テスト全体に影響するため、影響範囲を grep で先に把握してから着手する
- HwHub 規約の依存ルールに従い、Domain Model と完全一致する Inner record は不要なボイラープレート。Service は Domain Model を直接返してよい

### hw-hub-batch

（現時点で実績なし）

---

## Skills更新履歴

| Sprint    | ファイル           | 更新内容                                 | 理由                                                                        |
| --------- | ------------------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| Sprint 31 | mobile-conventions | 全幅表示ウィジェットセクション追加       | Dismissible内 Container の width 未指定でカード幅がタスク名依存になった実績 |
| Sprint 33 | mobile-conventions | Repositoryモック構造確認ルール追記       | ClassCastException 実績（ラッパー形式を未確認でモック）                     |
| Sprint 34 | mobile-conventions | catch握りつぶし禁止ルール追記            | レビュー指摘（エラーを `catch (_) {}` で無視）                              |
| Sprint 35 | mobile-conventions | IndexedStack配下の invalidate ルール追記 | Sprint Review指摘（#107/#108）                                              |
| Sprint 36 | mobile-conventions | Notifier層エラーハンドリングパターン追記 | #99 全 Notifier への AppSnackBar 横展開で確立（`on AppException → state 格納`） |
