# Dev 短期記憶

**スプリント**: Sprint 22
**最終更新**: 2026-05-05

---

## スプリントゴール

アナウンスバナー機能を追加し、DBスキーマ整備・バックエンドAPI実装・フロントエンドUI実装を完了させ、システム管理者が重要なお知らせをユーザーに周知できる基盤を構築する

---

## 実装方針（承認済み）

### Issue #56: アナウンスバナー機能の追加

**ブランチ**: `feature/56-announcement-banner`（hw-hub-database / hw-hub-backend / hw-hub-frontend の3リポジトリ）
**コミット参照**: `(ryokkon624/hw-hub-manage#56)`

#### 1. hw-hub-database

**新規SQL**: `flyway/sql/V00_001_016__add_announcement.sql`

- `m_code` に以下を投入
  - `0027` `AnnouncementScope`：ALL / HOME / HOUSEWORK_ASSIGN / HOUSEWORK_TASK / HOUSEWORK_SETTINGS / SHOPPING / SETTINGS_ACCOUNT / SETTINGS_HOUSEHOLD / SETTINGS_APP / NOTIFICATION / INQUIRY / ADMIN（ja/en/es 表示名）
  - `0028` `AnnouncementSeverity`：INFO / WARN / ERROR（ja/en/es 表示名）
- `m_announcement` テーブル新規作成
  ```
  announcement_id BIGINT UNSIGNED PK AUTO_INCREMENT
  title_ja / title_en / title_es VARCHAR(200) NOT NULL
  body_ja  / body_en  / body_es  TEXT          NOT NULL
  severity        VARCHAR(10) NOT NULL  -- m_code 0028
  target_scope    VARCHAR(30) NOT NULL  -- m_code 0027
  start_at        DATETIME(6) NOT NULL
  end_at          DATETIME(6) NOT NULL
  + WHOカラム
  KEY idx_announcement_period (start_at, end_at)
  KEY idx_announcement_scope  (target_scope)
  ```
- `generatorConfig.xml` に `m_announcement` を追加（AUTO_INCREMENT PK パターン）
- 適用手順: `./gradlew flywayClean && flywayMigrate && seedDevData`

#### 2. hw-hub-backend

- `./gradlew generateEnums` で `AnnouncementScope`・`AnnouncementSeverity` enum を自動生成
- `rm -rf src/main/resources/mapper/generated` 後 `./gradlew mybatisGenerator` で `m_announcement` のEntity / Mapper / XML を生成
- ドメイン層
  - `domain/model/announcement/AnnouncementModel.java`（record か class、`reconstruct()`）
  - `domain/model/announcement/AnnouncementId.java`
  - `domain/repository/announcement/AnnouncementRepository.java`
- インフラ層
  - `infrastructure/repository/announcement/MyBatisAnnouncementRepository.java`
  - `infrastructure/repository/announcement/AnnouncementConverter.java`（generated entity → Domain）
  - 必要に応じて Mapper XML 拡張（`findActiveAt(LocalDateTime now)` クエリで start_at <= now < end_at の範囲検索）
- アプリケーション層
  - `application/service/announcement/AnnouncementService.java`
  - `getActiveAnnouncements(LocalDateTime now)` を `@Transactional(readOnly = true)` で実装
  - レスポンスDTO `AnnouncementSummary`（service 内 record）
- プレゼンテーション層
  - `presentation/rest/announcement/AnnouncementController.java`
    - `GET /api/announcements/active`（認証必須／`@CurrentUserId` は使うが userIdベース絞り込みはなし）
    - 返却: `id / titleJa / titleEn / titleEs / bodyJa / bodyEn / bodyEs / severity / targetScope / startAt / endAt`
- TDD（Spock）
  - `AnnouncementServiceSpec`（active判定の境界テスト where: ブロック活用）
  - `AnnouncementConverterSpec`
  - `AnnouncementControllerSpec`（`@WebMvcTest` レベル or 既存パターンに合わせる）

#### 3. hw-hub-frontend

- `api/announcementApi.ts` 新規
  - DTO定義 + `Announcement` Domain型（`id / titleByLocale / bodyByLocale / severity / targetScope / startAt / endAt`）
  - `fetchActiveAnnouncements()` のみ
- `stores/announcementStore.ts` 新規
  - state: `announcements: Announcement[]`、`expandedIds: Set<number>`、`closedIds: Set<number>`（sessionStorage 永続化）、`isLoaded: boolean`
  - actions: `fetchActive()`, `toggleExpand(id)`, `close(id)`, `reset()`
  - getter: `visibleForRoute(routeName, scopeOfRoute)` でフィルタ（ALL or 一致 scope、未close）
- `router/index.ts` の各ルートに `meta.featureScope: AnnouncementScopeCode` を追加
  - HOME / HOUSEWORK_ASSIGN / HOUSEWORK_TASK / HOUSEWORK_SETTINGS / SHOPPING / SETTINGS_ACCOUNT / SETTINGS_HOUSEHOLD / SETTINGS_APP / NOTIFICATION / INQUIRY / ADMIN
- `components/announcement/AnnouncementBanner.vue` 新規
  - propsなし。`announcementStore.visibleForRoute` を route の `meta.featureScope` でフィルタして列挙表示
  - クリックでタイトル行全体トグル → 本文展開／折りたたみ。シェブロン（ChevronRight / ChevronDown）で開閉表示
  - タイトル行右端は `区切り | + ×ボタン`。×でstoreの`close(id)`呼び出し（sessionStorage に保持・次回ログインで消える）
  - severity に応じてカラートークン切替：INFO → `bg-hwhub-info-soft` / WARN → `bg-hwhub-accent-soft` / ERROR → `bg-hwhub-danger-soft`（生Tailwindカラー禁止）
  - 文字色は `text-hwhub-heading` 等トークン使用。アイコンは Info / TriangleAlert / OctagonAlert を severity ごとに使い分け（named import）
  - i18n: 多言語対応のため `currentLocale` で `titleByLocale[locale]` を選ぶ
- `layouts/AppLayout.vue` のテンプレート最上部（`<header>` の上）に `<AnnouncementBanner />` を配置
- ログイン後のフロー：`authStore.login` 成功時 or `App.vue` で `isAuthenticated` 監視して `announcementStore.fetchActive()`（authStore の既存パターンに合わせる）
- ログアウト時に `announcementStore.reset()`（closedIds の sessionStorage は同セッション内のみ保持なのでOK）
- TDD（Vitest）
  - `announcementStore.spec.ts`：fetch/close/visibleForRoute のフィルタロジック（where 風 it.each 活用）
  - `announcementApi.spec.ts`：DTO → Domain 変換
  - `AnnouncementBanner.vue` は **見た目変更のためテスト不要**（規約準拠）

#### 4. ダークモード視認性確認（AC10末尾）

`bg-hwhub-info-soft` / `bg-hwhub-accent-soft` / `bg-hwhub-danger-soft` は既に `main.css` の `:root.dark` 部分にダーク用色が定義済み（#182838 / #2a2418 / #2e1a20）。視認性確認のうえ、テキストとのコントラストが弱ければ `text-hwhub-heading` ではなく severity 別の専用テキストトークンを追加する（必要に応じて）。

#### 5. 作業順

1. hw-hub-database に Migration SQL 追加 → flywayClean/Migrate/seed
2. hw-hub-backend で generateEnums + mybatisGenerator
3. hw-hub-backend のドメイン〜APIまで TDD で実装
4. hw-hub-frontend の API/Store TDD → AnnouncementBanner.vue → AppLayout 組込み → router meta 追加
5. ダークモード視認性確認
6. ACチェック → コミット → プッシュ

---

## 確認済み事項

- 0027 / 0028 は m_code 未使用（採番OK）
- ThemeMode（0026）の SQL ファイル `V00_001_015__add_theme_mode.sql` が現状の最新 → 次バージョンは `V00_001_016__`
- ダーク用カラートークンは main.css 内 `:root.dark` / `@media prefers-color-scheme: dark` に既に存在
- AppLayout は `<header>` → `<main>` 構造。`<header>` の上（テンプレート最上部）に `AnnouncementBanner` を挿入（りょこさん承認済み修正）
- フロントAPIはStoreのAction経由ルール厳守

---

## 実装状況

| リポジトリ | ブランチ | 状態 |
|-----------|---------|------|
| hw-hub-database | feature/56-announcement-banner | push 完了 |
| hw-hub-backend | feature/56-announcement-banner | push 完了（レビュー指摘対応済み） |
| hw-hub-frontend | feature/56-announcement-banner | push 完了（レビュー指摘対応済み） |

## レビュー指摘対応（2026-05-05）

1. `AnnouncementCustomMapper.xml` の `findActiveAt` クエリに `LIMIT 100` を追加
2. `authStore.ts` の3ログインパス（login / register / completeOAuthLogin）に `if (!announcementStore.isLoaded)` ガードを追加

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-05-05 | flywayMigrate で m_announcement テーブルが Already exists エラー | 失敗したマイグレーションの m_code INSERT が部分的に成功し m_announcement テーブルが作成されたが flyway_schema_history には failed レコードが残った | docker exec で直接 DELETE FROM flyway_schema_history WHERE version='00.001.016' を実行し、m_code の 0027/0028 データも手動削除してから flywayMigrate を再実行 |
| 2026-05-05 | m_code.code_value が VARCHAR(10) のため HOUSEWORK_ASSIGN 等の長い値が挿入できなかった | m_code テーブルの code_value は VARCHAR(10) に制限されている | スコープの code_value を短縮（HW_ASSIGN / HW_TASK / HW_CONF / CONF_ACCT / CONF_HH / CONF_APP / NOTIFY）に変更 |

---

*スプリント終了後、long_term.mdに要約して移す*
