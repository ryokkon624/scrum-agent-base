# Sprint 22 バックログ

**スプリント期間**: 2026-05-05 〜
**スプリントゴール**: アナウンスバナー機能を追加し、DBスキーマ整備・バックエンドAPI実装・フロントエンドUI実装を完了させ、システム管理者が重要なお知らせをユーザーに周知できる基盤を構築する

---

## 対象Issue

| Issue | タイトル | SP | ブランチ |
|-------|---------|-----|---------|
| #56 | アナウンスバナー機能の追加 | - | feature/56-announcement-banner |

**⚠️ 注意**: #56は hw-hub-database / hw-hub-backend / hw-hub-frontend の3リポジトリにまたがる。ダークモード用カラートークン（INFO/WARN/ERROR）は既存定義に Darkモード用スタイルがない可能性があるため、事前確認が必要。

---

## Issue #56: アナウンスバナー機能の追加

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/56
**ラベル**: feature
**SP**: -
**ブランチ**: `feature/56-announcement-banner`（新規）

---

### ユーザーストーリー

**As a** システム管理者
**I want to** アプリ上にアナウンスバナーを表示したい
**So that** システムメンテナンスや重要なお知らせをユーザーに周知できる

### Acceptance Criteria

- [x] AC1: `m_announcement` テーブルが作成され、タイトル（ja/en/es）・本文（ja/en/es）・重要度・対象スコープ・有効開始日時・有効終了日時を持つ
- [x] AC2: `m_code` に機能区分（code_type: 0027）が追加される（ALL / HOME / HW_ASSIGN / HW_TASK / HW_CONF / SHOPPING / CONF_ACCT / CONF_HH / CONF_APP / NOTIFY / INQUIRY / ADMIN）
- [x] AC3: `m_code` に重要度（code_type: 0028）が追加される（INFO / WARN / ERROR）
- [x] AC4: `GET /api/announcements/active` エンドポイントが実装され、現在日時が有効期間内のアナウンス一覧を返す（認証済みユーザー向け）
- [x] AC5: `AppLayout.vue` の最上部に `AnnouncementBanner.vue` が配置され、ログイン後に有効なアナウンスを取得・表示する
- [x] AC6: バナーはタイトル行全体がクリッカブルで、クリックすると本文が展開/折りたたみされる。開閉状態はシェブロン（›/‹）で表示する
- [x] AC7: タイトル行右端の `|` 区切りの右に `×` ボタンがあり、クリックするとバナーを閉じる。閉じたアナウンスIDは sessionStorage に保存され、次回ログインまで非表示になる
- [x] AC8: `target_scope = 'ALL'` のアナウンスは全画面に表示される
- [x] AC9: `target_scope` が特定機能区分の場合、`router/index.ts` の `meta.featureScope` と一致する画面のみに表示される
- [x] AC10: 重要度に応じてバナーの色が変わる。色はカラートークンを使用し生Tailwindカラークラスの使用は禁止（INFO: `bg-hwhub-info-soft` / WARN: `bg-hwhub-accent-soft` / ERROR: `bg-hwhub-danger-soft`）。既存カラートークンはDarkモード用定義（#182838 / #2a2418 / #2e1a20）を持つため視認性確認済み

### 備考

- 優先順位の根拠：システム運用上の基盤機能。マスタメンテ画面（別Issue）の前提
- 依存関係：アナウンスマスタメンテ画面Issueとセット（本Issueが先行）
- 実装対象リポジトリ: hw-hub-database / hw-hub-backend / hw-hub-frontend（3リポジトリまたぎ）
- コミット参照: `(ryokkon624/hw-hub-manage#56)`
