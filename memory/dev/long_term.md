# Dev 長期記憶

**最終更新**: 2026-05-14

---

## コミット前セルフチェック（繰り返し指摘パターン）

コードレビューで繰り返し指摘されたパターン。コミット前に必ず確認すること。

| チェック項目 | 確認内容 |
|---|---|
| **マジックストリング** | APIから返される区分値（`'0'`/`'1'`など）を直接比較していないか。`core/models/` の生成済み enum（`XxxStatus.code`）を使うこと（Sprint 35で指摘） |
| **catch握りつぶし** | `catch (_) {}` でエラーを無視していないか。必ず `rethrow` または `AppException` に変換すること（Sprint 34・35で指摘） |
| **i18nハードコード** | 日本語・英語文字列をウィジェット内に直書きしていないか。ARBファイルに定義して `AppLocalizations.of(context).key` を使うこと（Sprint 33で指摘） |
| **invalidate漏れ** | 詳細・作成画面での操作（追加/削除/ステータス変更/お気に入り）後に一覧 Provider を `ref.invalidate()` しているか（IndexedStack配下では必須。Sprint 35で指摘） |

---

## 技術的なハマりポイントと解決策

（スプリントごとのshort_termから移してくる）

### AWS / インフラ
- AWS SDK v2を使う。spring-cloud-awsはSpring Boot 4.xと非互換なので使わない
- STG環境はEphemeral構成。使うときだけ `terraform apply`、終わったら `terraform destroy`

### Spring Boot / バックエンド
- MyBatisはJava recordをサポートしている
- ドメインRepositoryインターフェースを使ったレイヤードアーキテクチャを守る
- ShoppingItem系の認可チェックパターンは `item.getHouseholdId()` を取得して `householdAuthorizationService.canAccessHousehold` で判定する形で統一（updateStatus / updateFavorite / update / delete すべて同じ）。例外は `ResourceNotFoundException` / `AccessDeniedException` を投げる

### Vue 3 / フロントエンド
- ローカライズユーティリティはcomposablesに移動済み
- Pinia + Composition APIで状態管理
- store の内部状態フィールド（`lastFetchedAtByHouseholdId` 等）はコンポーネントから直接参照せず、getter（`isFetchedFor` 等）経由でアクセスする（カプセル化）
- スワイプジェスチャーは `composables/useSwipeGesture.ts` に切り出し、touchstart/touchmove/touchend のみ扱う（マウスイベントは無視）。translateX をリアルタイム返却して2層構成（背景＋前面）でドラッグ追従を実現
- スワイプ背景色は `main.css` に `bg-hwhub-swipe-action/delete/back/disabled` の4トークンを定義してカラートークン経由で指定する（生クラス禁止）
- ユーザーアイコンの broken image 対策は `components/ui/UserAvatar.vue`（共通コンポーネント）で `imageError = ref(false)` + `@error="imageError = true"` パターン。AC3例外箇所は個別に空グレー丸表示で対応する
- SP/PCのレイアウト分岐はTailwindの `md:` ブレークポイントで切り替え（`md:hidden` でSP専用UI、`md:block` でPC専用UI）
- スケルトンスクリーンは `components/ui/SkeletonItem.vue`（variant別 + count指定）として共通化。初回ロード中は `withLoading` を使わず `isInitialLoading` フラグで制御することで二重ローディング表示を回避

---

## Sprint 13 サマリー（2026-04-30完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #34 | SP版買い物リスト画面を3タブ構成に変更（SP:5） | ShoppingListTabBar.vue 新規・SP時のみタブ切替、PC時は2カラムgrid維持 |
| #33 | ユーザーアイコン取得失敗時のイニシャル表示（SP:2） | UserAvatar.vue 共通化・AC3例外箇所のみ個別対応 |
| #42 | 買い物リスト画面にスワイプジェスチャー導入（SP:5） | useSwipeGesture composable + SwipeableShoppingItem.vue・カラートークン4種追加 |

---

## Sprint 14 サマリー（2026-05-01完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #44 | スケルトンスクリーン導入（SP:3） | SkeletonItem.vue 新規・家事割り当て/MyTasks/買い物リスト3画面に適用。レビュー指摘で memberMap で O(1) 参照に改善 |
| #45 | 購入済みアイテム左スワイプ時の背景アイコン削除（SP:1） | SwipeableShoppingItem の購入済み時の左スワイプ背景アイコン・背景色を削除 |

---

## Sprint 18 サマリー（2026-05-01完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #43 | ダークモード対応（SP:5） | `main.css` に CSS変数ベースのライト/ダーク2テーマ実装、`@custom-variant dark` 宣言、`prefers-color-scheme` 連動 + `<html class="dark/light">` で手動上書き。`themeStore.ts`（SYSTEM/LIGHT/DARK 3択・LSキー `hwhub_theme`）と `ThemeSwitcher.vue`（SegmentControl）新規。`index.html` に FOUC防止インラインスクリプト、`main.ts` で `useThemeStore().init()` 配線。主要レイアウト・ページコンテナ・モーダルは `bg-hwhub-surface-card`/`text-hwhub-heading`/`border-hwhub-border` 等のトークンに置換。残存生Tailwindカラーは Sprint19 へ持ち越し（Issue #51） |

### Sprint 18 で習得したこと（テーマ実装）
- Tailwind v4 では `@custom-variant dark (&:where(.dark, .dark *):not(.light *):not(.light));` で `dark:` バリアントを定義する
- `:root` に CSS変数を定義し、`:root.dark` で上書き、さらに `@media (prefers-color-scheme: dark) { :root:not(.light):not(.dark) {...} }` で OS追従を実現する三段構成
- FOUC（テーマ切替時の白フラッシュ）防止は `index.html` の `<head>` 内インラインスクリプトで LS から読んで即 `<html class>` をセットする方式が確実
- `themeStore.init()` を `main.ts` で `app.use(router)` の前に呼ぶ（matchMedia リスナー登録のため）
- カラートークン化は「ライト/ダーク両方で意味的に同じ役割を持つ色」を抽象化する作業。`bg-white` のように「ダークモードでは別色になるべき箇所」と「意図的に白固定にしたい箇所」（トグルつまみ・Googleブランドボタン・ダーク背景上の半透明白オーバーレイ等）を見極めて使い分ける

---

## Sprint 19 サマリー（2026-05-01完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #51 | 残存生Tailwindカラークラス（gray/slate系160箇所/49ファイル）をカラートークンに移行 | 共通コンポーネント・認証ページ・設定ページ・各種Viewを3コミットで完全移行。意図的白固定4箇所（LandingPage/LoginPage Googleボタン/AccountSettingsページトグルつまみ/HouseholdSwitcherMobile）はスコープ外として除外 |

### Sprint 19 で習得したこと
- Edit失敗時はファイルをReadして正確なインデント・空白を確認してから再実行する（old_stringの不一致が原因になりやすい）

---

## Sprint 21 サマリー（2026-05-04完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #54 | ダークモード設定のDB永続化 | `m_code` に ThemeMode区分（0026）追加、`m_user.theme_mode` カラム追加、`PUT /api/users/me/theme` API実装、ログイン時のDB値同期・変更時のAPI呼び出しをフロントに実装 |
| #50 | deleteHouseworkエンドポイント削除 | フロント未使用を確認しAC2のパス（エンドポイント削除）を選択。Controller/Service/Repository/MyBatisRepository から削除し関連Spockテストも削除 |

### Sprint 21 で習得したこと
- `mybatisGenerator` は既存XMLに追記する動作のため、実行前に `rm -rf src/main/resources/mapper/generated` を必ず実行する。省略すると全Mapper XMLに定義が二重に重なってSpring Boot起動不可
- Spockで例外検証する場合は `thrown(IllegalArgumentException)` のように具体的な型を指定し、「想定外の例外をパス」しないようにする
- UserModel.reconstruct のシグネチャ変更は既存テスト全体に影響するため、影響範囲を grep で先に把握してから着手する

---

## Sprint 22 サマリー（2026-05-05完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #56 | アナウンスバナー機能の追加 | hw-hub-database に `m_announcement` テーブル + `m_code` 0027(AnnouncementScope)/0028(AnnouncementSeverity) 追加。hw-hub-backend で `GET /api/announcements/active` API実装（Domain/Repository/Service/Controller + Spock）。hw-hub-frontend で `announcementApi`/`announcementStore`/`AnnouncementBanner.vue` 新規・`AppLayout` 最上部組込み・router meta に `featureScope` 追加。severity 別カラートークン適用（INFO/WARN/ERROR）。レビュー対応で `findActiveAt` に `LIMIT 100` 追加・authStore 3ログインパスに `isLoaded` ガード追加 |

### Sprint 22 で習得したこと（DB/Flyway 失敗時のリカバリ）
- flywayMigrate 失敗で `Already exists` エラー発生時：
  1. docker exec で直接 `DELETE FROM flyway_schema_history WHERE version='XX.XXX.XXX'` を実行
  2. 失敗マイグレーションが部分的に成功した形跡（テーブル/レコード）を手動で削除
  3. flywayMigrate を再実行
- `m_code.code_value` は **VARCHAR(10)** 制限。長いコード値を入れる場合は短縮する（例：`HOUSEWORK_ASSIGN` → `HW_ASSIGN`）。Flyway失敗の原因になりやすい
- フロントの sessionStorage 永続化セット（`closedIds: Set<number>`）は `JSON.stringify([...set])` ⇔ `new Set(JSON.parse())` で変換する
- store の internal state（`expandedIds.has(id)`）はコンポーネントから直接参照せず、必ず getter（`isExpanded(id)`）経由でアクセスする（カプセル化）
- 認証経路が複数ある場合（login/register/completeOAuthLogin）、不要な再フェッチを避けるため `if (!store.isLoaded)` ガードを各経路に入れる

---

## Sprint 23 サマリー（2026-05-05完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #55 | 未使用 deleteHousework コード削除 | `houseworkApi.deleteHousework` / `houseworkStore.delete` および関連テストを削除（バックエンドはSprint 21で削除済み） |
| #58 | AnnouncementBanner.vue の severity 文字列を定数化 | `code.constants.ts` に `ANNOUNCEMENT_SEVERITY` 追加（コードタイプ 0028）・型 `AnnouncementSeverityCode` を導入。バナー / Domain / API契約箇所を順次置換 |
| #59 | router/index.ts の featureScope を定数化 | `code.constants.ts` に `ANNOUNCEMENT_SCOPE` 追加（コードタイプ 0027）・型 `AnnouncementScopeCode` を導入。`SCOPE_TO_ROUTE_MAP` のキーも定数化 |
| #60 | 子ルートに featureScope を引き継ぐ | `visibleForRoute` を `(routeName, currentScope)` シグネチャに変更し、AnnouncementBanner.vue 側で `route.meta.featureScope` を取り出して渡す形に。settings/housework・shopping・settings/inquiry の子ルートに featureScope を設定。admin 配下子ルートは権限が限られるため例外として未設定 |

### Sprint 23 で習得したこと
- `as const` + `(typeof X)[keyof typeof X]` パターンで code.constants.ts に定数とブランド型を定義し、ベタ書き文字列を `XXX.YY` 参照に置換すると安全に横展開できる
- `route.meta.featureScope` を Banner 側で読み取り、Store getter のシグネチャに渡す（`visibleForRoute(routeName, currentScope)`）形にすると子ルート対応が一発で効く
- API契約のDTO型は `string` のままにして `toModel` でブランド型へキャストするのが最小影響
- 「同名文字列」が別意味で使われる箇所（`'ALL'` のローカルフィルタ等）は横展開対象外として明示的に除外する

---

## Sprint 25 サマリー（2026-05-06完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #62 | yup バリデーション i18n 化 | `announcementForm.validation.ts` を utils に切り出し、エラーメッセージをi18nキー化。`t(errors.xxx)` で各言語切替 |
| #63 | タイトル200バイト上限 | `byteLength = new TextEncoder().encode(s).length` で計算し yup `test('byte-length')` で検証。ja/en/es 3言語タイトルに適用、ボタン disabled 連動 |
| #64 | 重要度バッジダークモード対応 | `bg-{color}-50` 等を `bg-hwhub-palette-{color}-soft / border-hwhub-palette-{color} / text-hwhub-palette-{color}` に置換 |
| #65 | AnnouncementSummary 削除 | Inner record を削除し Service から Domain Model（`AnnouncementModel`）を直接 Controller に返す形に変更。Spock テストの mock 戻り値も Model に置換 |

### Sprint 25 で習得したこと
- HwHub 規約の依存ルール表に従い、Domain Model と完全一致する Inner record は不要なボイラープレート。Service は Domain Model を直接返してよい
- yup の `byte-length` テストはマルチバイト・絵文字を含む文字列にも安全（`TextEncoder`）
- vee-validate の `errors` が空でない場合 `Object.keys(errors).length > 0` でボタン無効化制御を行うと AC「エラー時ボタン無効化」を防御的に満たせる

---

## Sprint 35 サマリー（2026-05-14完了）

| Issue | 内容 |
|-------|------|
| #88 | 購入済みアイテムが購入後に非表示になる（`purchasedAt` が null → `purchasedItems` getter 除外） |
| #94 | アイテム削除ダイアログのキャンセルでページごと閉じる（`Navigator.pop(context)` が外側 context を使用） |
| #96 | 添付ファイル削除ダイアログのキャンセルでページごと閉じる（同上） |
| #93 | かごに入れたアイテムが非購入タブに残る（`isNotPurchased` getter が `inBasket` を誤判定 + invalidate漏れ） |

### Sprint 35 で習得したこと
- `IndexedStack` 配下では `AutoDispose` が破棄されず古い state が残る。詳細・作成画面で一覧が変わる操作後は必ず `ref.invalidate(一覧Provider)` を呼ぶ（操作の種類を問わず網羅すること）
- `showDialog(builder: (context) => AlertDialog(...))` 内で `Navigator.pop(context)` を使うと go_router 環境では外側の context が解決されページが閉じる。`builder: (dialogContext)` で dialog context を明示的に受け取り `Navigator.pop(dialogContext)` を使うこと
- `isNotPurchased` のような否定ゲッターは「対象ステータスのみ true」に限定する。`notPurchased` のみを true とし、`inBasket` 等の他ステータスを含めない設計が直感的

---

## Sprint 34 サマリー（2026-05-14完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #86 | [mobile] 買い物アイテム作成・詳細画面を実装する (#14/#15) | `features/shopping/` 配下に作成画面（`shopping_item_new`）・詳細画面（`shopping_item_detail`）一式を新規。作成は `ShoppingItemNewNotifier`（AutoDisposeNotifier）、詳細は `ShoppingItemDetailNotifier`（AutoDisposeFamilyNotifier、itemId を family で受ける）。`ShoppingAttachmentRepository` 新規（Presigned URL 発行→S3 PUT→metadata 登録の3段。S3 PUT は interceptor 無しの素の Dio）。DTO・Request モデル8種を新規＋`build_runner`。`history_picker_bottom_sheet`・`favorite_picker_bottom_sheet`・`status_step_selector`・`image_picker_field` ウィジェット。`image_picker: ^1.1.0` 追加＋AndroidManifest/Info.plist 権限。詳細画面の更新は PUT `/api/shopping-items/{id}`。「削除」ボタンは未購入時のみ表示。i18n（ja/en/es）に shopping* キー追加。`app_router.dart` の仮画面 builder を実画面に差し替え |

### Sprint 34 で習得したこと
- 詳細画面で itemId をキーにした画面ごとの状態は `AutoDisposeFamilyNotifier`／`NotifierProvider.autoDispose.family` で実装する
- `Notifier.build()` が同期の場合、初期非同期ロードは `Future.microtask(() => _initialize(itemId))` で蹴り、`isLoading: true` の初期 state を返す
- S3 Presigned URL への PUT はアプリの `AuthInterceptor` を通してはいけない（Authorization ヘッダが付くと S3 が 403）。`Dio()`（baseUrl 無し・interceptor 無し）の別インスタンスを使う
- image_picker のモックは Notifier に差し込まず、Page 側のソース選択（カメラ/ギャラリー）から切り離して Notifier の `setPickedImage(bytes, fileName)` に `XFile` を読んだ結果を渡す契約にするとテスタビリティが上がる

---

## Sprint 33 サマリー（2026-05-13完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #85 | [mobile] 買い物リスト画面を実装する (#13) | `features/shopping/` 配下に Repository・AsyncNotifier・State・Page 一式を新規作成。3タブ（未購入/かご/購入済み）+ 購入場所フィルタ + Dismissible によるスワイプ操作（かごへ/削除/購入済み/戻す）。`bulk_purchase_dialog`・`swipeable_shopping_card`・`purchased_item_tile` 等のウィジェット分割。i18n（ja/en/es）に shopping* キーを追加。`coverage.ps1` で features.shopping のみ集計し ≥95% 達成。Sprint Review 中に発覚した「`fetchItems()` のレスポンスが `{"items":[...]}` ラッパー形式なのに `List<dynamic>` キャストしていた」バグを `(response.data as Map)['items']` に修正・テストモックも修正 |

### Sprint 33 で習得したこと
- Flutter標準 `Dismissible` で「キャンセル可能なスワイプ削除」を実装するときは `confirmDismiss` 内で `showDialog` を `await` し、キャンセル時は `false` を返すとカードが元の位置に戻る
- カバレッジ計測で feature ディレクトリ単位で集計したい場合、`lcov.info` の `SF:` パスを `awk` で判定して features.shopping のみ抽出する手が速い
- `ServerException` などのカスタム例外が **named パラメータ**（`message:`）か positional かはテスト書き始める前に必ず確認する
- ウィジェットテストで `find.text('削除')` のような短いテキストはスワイプ背景ラベルと確認ダイアログボタンの両方にヒットしやすい。`find.text('...').last` や `find.descendant` で特定する
- Repository の API レスポンス形状（ラッパー `{"items":[...]}` か フラット配列か）はバックエンドの Controller / Response クラスを必ず確認してからモックを書く（mobile-conventions の重要事項としても明記済み）

---

## Sprint 32 サマリー（2026-05-13完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #82 | [mobile] My Tasksカードがタスク名の長さで幅が変わる | `swipeable_task_card.dart` の Dismissible child の `Container` に `width: double.infinity` を追加。Sprint 31 で margin 削除のみ対応し全幅指定を漏らした件を是正。`my_tasks_page_test.dart` に短いタスク名と長いタスク名でカード幅が等しいことを `tester.getSize()` で検証するテストを追加 |

### Sprint 32 で習得したこと
- Flutter の `Container` は子サイズに自動でフィットするため、横幅をいっぱいに広げたい場合は明示的に `width: double.infinity` を指定する必要がある。Dismissible の中で並んでいるカードは特に注意

---

## Sprint 31 サマリー（2026-05-13完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #79 | [mobile] My Tasks画面に未割当のタスクが表示される | `MyTasksNotifier._load()` 42行目の `task.assigneeUserId != null &&` を削除し、`assigneeUserId == currentUserId` のみを past/future 振り分け対象に。Sprint 29でDEVが「親切のため未割当も表示」と自己判断したスコープクリープを是正。テスト期待値を `[1, 5]` → `[1]` に修正しACコメント追加。未割当(id=5)が past/future いずれにも含まれない検証を追加 |
| #80 | [mobile] My Tasks画面のカードレイアウトをwebのSP版に合わせる | `PastTasksSection` / `FutureTasksSection` をセクションコンテナ化（`Container(borderRadius:12, border, color: surfaceCard, padding: md)`）、`SwipeableTaskCard` の margin を削除して外側で制御。BoxShadow は入れない方針（commit: 17a7268） |

### Sprint 31 で習得したこと
- AC違反の動作を既存テストが「正」として通過させていた場合、DEV・reviewer・SM誰も気づかない（#79のAC4分析で判明）。Sprint Review HTML生成時にACとコードを対応させる作業が再発防止の機能を果たす
- セクションコンテナ化と「カードのmargin削除」だけでは `width: double.infinity` を別途指定しないとカード幅がタスク名長に依存してしまう（Sprint 31 Reviewで指摘 → #82 で対応）
- `mobile-conventions.md` に「全幅表示が必要なウィジェット」セクションを追加し、`SizedBox(width: double.infinity)` / `Container(width: double.infinity)` / `Column(crossAxisAlignment: stretch)` の3パターンを明示

---

## Sprint 30 サマリー（2026-05-13完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #81 | [mobile] ログイン済みユーザー情報をRiverpodで保持し、各画面の冗長なAPI呼び出しを解消する | `AuthAuthenticated` に `AuthUser user` を追加、`AuthUser` を `core/models/` に移動。`AuthNotifier.build()` で token 復元時に `/api/users/me/profile` を呼んで `AuthAuthenticated(user)` を構築（失敗時は `AuthUnauthenticated`）。`saveTokens(user: ...)` シグネチャ化。`HomeNotifier` / `MyTasksNotifier` の `loadCurrentUserId()` 呼び出しを authState 参照に置換し、Repository から `loadCurrentUserId` を削除。テスト（auth_notifier_test / login_notifier_test / signup_notifier_test / home_notifier_test / my_tasks_notifier_test）を authState スタブに差し替え、`@GenerateMocks` 再生成 |

### Sprint 30 で習得したこと
- ログインユーザー情報のような「全画面共通の認証コンテキスト」は `AuthAuthenticated(user)` のように auth state 自体に持たせるのが最小コスト。各 Notifier に `loadCurrentUserId` を持たせるのは早期の重複の兆候
- `AuthUser` のような共有ドメインモデルは `features/auth/data/models/` ではなく `lib/core/models/` 配下に置く（core→features 依存を作らないため）
- `AuthNotifier.build()` で `/me` を呼ぶ場合、ネットワーク失敗時は `AuthUnauthenticated` にフォールバックし、router 側で `/login` リダイレクトに任せる方が UX が破綻しない
- Riverpod テストで authState を差し替える際は `_FakeAuthNotifier extends AuthNotifier` を作って `build()` だけ override すれば十分（saveTokens 等は呼ばれないため）

---

## Sprint 29 サマリー（2026-05-12完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #76 | [mobile] My Tasks画面に自分の担当以外の家事タスクが表示される | `MyTasksRepository` に `loadCurrentUserId()` 追加、`MyTasksNotifier._load()` で `assigneeUserId == currentUserId`（および未割当）でフィルタしてから past/future に振り分け。仕様書 12_my_tasks.md にもフロント側フィルタを明記 |
| #78 | [mobile] app_router.dartのGoRouteのpath引数がAppRoutes定数に未置換のまま残っている | `app_router.dart` の全 `GoRoute(path: ...)` を `AppRoutes` 定数に置換。ネストサブルートは `AppRoutes` 内に private const として相対パス用定数（`_xxxRelative`）を追加して参照 |
| #77 | [mobile] My Tasks画面のデザインがwebのSP版と異なる | `SwipeableTaskCard` に variant プロパティ追加（past=rose系 / today=emerald系 / 通常）、`PastTasksSection` のヘッダーを横並びに変更し "すべて完了" を小型primaryボタンに、`FutureTasksSection` のフィルタをセグメントコントロール風に、日付ラベルを「今日／明日／M/D(曜日)」表記に、ページ最上部に `myTasksIntro` 追加。i18n（ja/en/es）も更新 |

### Sprint 29 で習得したこと
- モバイルで「ログインユーザー情報」が必要な場面では、`loadCurrentUserId()` の個別API呼び出しを各 Notifier が持つと冗長になる。Sprint 30 で authState に AuthUser を持たせる方向に統合する（#81）
- web SP版とモバイルでデザインが異なるとSprint Reviewで指摘されやすい。`SwipeableTaskCard` のように variant 切替で複数スタイルに対応する設計が将来再利用しやすい
- `AppRoutes` 定数化は「ナビゲーション引数」と「GoRoute path 定義」を別Issueで分けてもよいが、ネストサブルートの相対パス（`'sent'` / `':id'`）は親パスから切り出して private const にする方が明示的・grep可能

---

## Sprint 28 サマリー（2026-05-11完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #75 | 画面遷移時に指定するpathを定数に置き換えたい | `app_router.dart` 末尾に `AppRoutes` クラス追加。`context.go('/xxx')` を全て `AppRoutes.xxx` に置換 |
| #67 | [mobile] My Tasks画面を実装する | `features/tasks/` 配下に Repository / Notifier / State / Page / Widget一式新規。`Dismissible` を使ったスワイプUIで完了・スキップ・bulk-status を実装。AC10カバレッジ95%以上 |

### Sprint 28 で習得したこと（モバイル）
- Flutter標準の `Dismissible` でスワイプUIを実装：`dismissThresholds` で30%しきい値、`background`/`secondaryBackground` で方向別の色・アイコンを表示、`confirmDismiss` でAPI呼び出し
- `AsyncNotifier.build()` で `ref.watch(householdNotifierProvider.future)` を await することで世帯切り替えに自動追従（AutoDispose + invalidate不要）
- `AppRoutes` 定数化は `context.go()` 引数の置換から先行すると影響範囲が把握しやすい。`GoRoute(path: ...)` 側の置換は別Issueで分離した方が安全（→ Sprint 29 #78 で対応）
- モバイルの My Tasks では `assigneeUserId == currentUserId` フィルタを忘れがち（web SP版を参照しつつもバックエンドが全世帯員分を返す前提を見落とす）→ Sprint 28 Review で指摘（#76）

---

## Sprint 24 サマリー（2026-05-06完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #57 | アナウンスマスタメンテ画面（管理画面配下）追加 | 3リポジトリ横断の大規模実装。**hw-hub-database**: `m_code` 0025 に `AnnouncementMng`(40) 追加、`m_role_permission` に ADMIN/SUPPORT × 40 を追加、`m_code` 0012 に `OnlAdmAnn` 追加（Flyway: `V00_001_017`）。**hw-hub-backend**: `application/service/announcement/` パッケージ新設・`AnnouncementService` を移動・`AnnouncementSummary` Inner record として定義、`AdminAnnouncementService`（getAll/getById/create/update/delete）新規、`AdminAnnouncementController`（GET/POST/PUT/DELETE `/api/admin/announcements`）を `@RequiresPermission(ANNOUNCEMENT_MANAGEMENT)` 付きで新規、`AnnouncementModel.create()` ファクトリ追加（startAt < endAt / NotBlank / severity・scope 有効値チェック）、`AnnouncementRepository` に findAll/findById/insert/update/delete を追加、`AnnouncementConverter.toEntity` を追加。**hw-hub-frontend**: `PERMISSION.ANNOUNCEMENT_MNG` 追加・`useRole.canManageAnnouncement` 拡張、`adminApi` に CRUD 関数追加、`adminAnnouncementStore`（loadAll/create/update/remove + isLoaded キャッシュ）新規、`AdminAnnouncementsPage`（PC=テーブル/ソート/ページング、SP=カード/ページング、3区分ステータス）と `AdminAnnouncementFormPage`（vee-validate + yup）新規、`AdminTopPage` にカード追加、router に `admin.announcements` 系3ルート追加、ja/en/es i18n 追加 |

### Sprint 24 で習得したこと
- パッケージ移動を含むリファクタは GREEN 状態を維持しながら段階的に進める（先に移動・参照更新で全テスト通る状態を作ってから新機能追加に入る）
- `@RequiresPermission` 1つで複数ロール（ADMIN/SUPPORT）を許可する場合、`m_role_permission` に複数行入れるだけ（コード側に分岐を増やさない）
- AnnouncementSummary のような「Domain Model と全フィールド一致する Inner record」は HwHub 規約上不要なボイラープレート。Service は Domain Model を直接返してよい（Sprint 25 の #65 で是正）
- yup の `required()` メッセージは i18n キー文字列を渡しておき、テンプレ側で `t(errors.xxx)` の形にしないとロケール切替で動かない
- バイト長バリデーションは `new TextEncoder().encode(s).length` で計算する。マルチバイト/絵文字も正しく数えられる（`houseworkForm.validation.ts` のパターン）
- バッジ色のダークモード対応は `bg-{color}-50/text-{color}-600` を `bg-hwhub-palette-{color}-soft / border-hwhub-palette-{color} / text-hwhub-palette-{color}` に置換（`main.css` で `:root.dark` 上書き済み）。問い合わせ管理のカテゴリバッジが参考実装

---

## 習得したスキルログ

| スプリント | 習得内容 | 備考 |
|-----------|---------|------|
| | | |

---

## 削除したスキルログ

（モデルアップデートなどで不要になったSkill）

| スプリント | 削除内容 | 削除理由 |
|-----------|---------|---------|
| | | |
