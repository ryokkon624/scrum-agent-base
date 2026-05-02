# Sprint 19 バックログ

**スプリント期間**: 2026-05-01 〜
**スプリントゴール**: 残存する生Tailwindカラークラスをカラートークンに完全移行し、ダークモードを全画面で一貫させる

---

## 対象Issue

| Issue | タイトル | SP | ブランチ |
|-------|---------|-----|---------|
| #51 | 残存生Tailwindカラークラスをカラートークンに移行したい | 5 | feature/43-dark-mode |

---

## Issue #51: 残存生Tailwindカラークラスをカラートークンに移行したい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/51
**ブランチ**: `feature/43-dark-mode`（Sprint18で使用していたブランチ）
**⚠️ 注意**: Sprint18のブランチ `feature/43-dark-mode` 上に継続してコミットすること

---

## 概要

### 現状
Sprint 18（ダークモード対応 #43）で主要レイアウト・ページコンテナ・モーダルの色置換を実施したが、以下の箇所が未対応のまま残存している。

### 残存箇所
- **残存件数**: 94箇所 / 34ファイル
- **主な残存ファイル**:

| ファイル | 残存件数 |
|---------|---------|
| src/views/LandingPage.vue | 22 |
| src/components/housework/HouseworkForm.vue | 12 |
| src/views/PasswordResetSentPage.vue | 6 |
| src/views/LoginPage.vue | 5 |
| src/components/HouseholdSwitcherMobile.vue | 4 |
| その他ページ・コンポーネント（認証系・ホームカード・通知・スワイプ等） | 45 |

※ AccountSettingsPage.vue に残る3箇所はトグルボタンつまみ（意図的に白固定）

### 問題点
ダークモードが有効な状態でも、残存ファイルの一部UI要素でライトモード時の色が固定表示されてしまう。

### 改善案
残存する bg-white / text-slate-* / bg-gray-* / border-gray-* 等の生Tailwindカラークラスを、bg-hwhub-surface-card / text-hwhub-heading 等のカラートークンに置換する。

---

## ユーザーストーリー

**As a** ダークモードを使うユーザー
**I want to** アプリの全画面でダークモードが適用されるようにしたい
**So that** 一部の画面だけ明るいままになる違和感をなくしたい

---

## Acceptance Criteria

- [x] AC1: src/views/LandingPage.vue の残存22箇所がカラートークンに置換される
- [x] AC2: src/components/housework/HouseworkForm.vue の残存12箇所がカラートークンに置換される
- [x] AC3: その他残存34ファイルの生Tailwindカラークラスがカラートークンに置換される
- [x] AC4: 置換完了後、意図的な白固定箇所（DEVが判断）を除く生Tailwindカラークラスがゼロになる

---

## 備考

- 優先順位の根拠：ダークモード有効時に一部画面がライトモード表示のままとなりUX上問題がある
- 依存関係: #43（ダークモード対応）完了済み
- スコープ外: 意図的に白固定にしている箇所（DEVが判断）
- 対応ブランチ: `feature/43-dark-mode`
- 参照: Sprint 18 DEV報告（残存箇所のgrep集計）
