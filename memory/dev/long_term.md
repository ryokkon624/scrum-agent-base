# Dev 長期記憶

**最終更新**: 2026-05-06

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
