# Sprint 51 バックログ

## スプリントゴール

モバイルアプリのバグ2件（pull-to-refresh 未動作・ログアウト後スピナー）を修正し、shopping featureのディレクトリ構成を整理する

---

## 対象 Issue 一覧

| Issue | タイトル | ラベル | SP | ブランチ |
|-------|---------|--------|-----|---------|
| #151 | [mobile] 一覧画面で下スワイプによるデータ更新が動作しない画面がある | bug | - | `fix/151-pull-to-refresh` |
| #125 | [mobile] ログアウト後のログイン画面でスピナーが動作し続けてログインできない | bug | - | `fix/125-mobile-logout-login-spinner` |
| #150 | [mobile] features/shopping配下のディレクトリ構成をリファクタリングする | refactor | - | `refactor/150-shopping-directory` |

---

## Issue #151 — [mobile] 一覧画面で下スワイプによるデータ更新が動作しない画面がある

### 発生事象

一部の一覧系画面で画面最上部からの下スワイプ（pull-to-refresh）によるデータ更新が動作していない。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** 一覧画面を下スワイプして最新データに更新したい
**So that** 最新の情報をすぐに確認できる

### Acceptance Criteria

- [x] AC1: 一覧系画面すべてで下スワイプによるデータ更新（pull-to-refresh）が動作する（対象画面はDEVが実装フェーズで網羅的に洗い出す）
- [x] AC2: 問い合わせ詳細画面でも下スワイプによるデータ更新が動作する

### 備考

- 買い物リスト画面は #95 で対応済み
- 対象: 一覧系画面（必須）・問い合わせ詳細画面（必須）
- 対象外: 登録・詳細画面（問い合わせ詳細を除く）
- **bugラベル → 計画フェーズで根本原因調査・改修方針を整理し、IssueのBodyを更新すること**
- ブランチ: `fix/151-pull-to-refresh`
- コミット参照: `(ryokkon624/hw-hub-manage#151)`

---

## Issue #125 — [mobile] ログアウト後のログイン画面でスピナーが動作し続けてログインできない

### 発生事象

ユーザーアイコンからログアウトすると、遷移先のログイン画面でスピナーが表示され続け、ログイン操作ができない。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** ログアウト後にログイン画面で正常にログインできるようにしたい
**So that** 別アカウントへの切り替えや再ログインをスムーズに行える

### Acceptance Criteria

- [x] AC1: ユーザーアイコンからログアウト直後のログイン画面でスピナーが表示されず通常の入力フォームが表示される（アプリ再起動後の正常動作は確認済み、ログアウト直後のみ対象）
- [x] AC2: ログアウト後のログイン画面からログインが正常に完了できる

### 備考

- 対象: ユーザーアイコン → ログアウト後のログイン画面
- Sprint 44 Sprint Reviewで発覚
- **bugラベル → 計画フェーズで根本原因調査・改修方針を整理し、IssueのBodyを更新すること**
- ブランチ: `fix/125-mobile-logout-login-spinner`（指定済み）
- コミット参照: `(ryokkon624/hw-hub-manage#125)`

---

## Issue #150 — [mobile] features/shopping配下のディレクトリ構成をリファクタリングする

### ユーザーストーリー

**As a** HwHubモバイル開発者
**I want to** shopping featureのpresentation層のディレクトリ構成を整理したい
**So that** ファイルの役割が明確になり、コードの見通しが向上する

### Acceptance Criteria

- [x] AC1: `lib/features/shopping/presentation/shopping_item_list/` フォルダを作成し、以下の3ファイルを移動する
  - `shopping_list_notifier.dart`
  - `shopping_list_page.dart`
  - `shopping_list_state.dart`
- [x] AC2: ファイル移動後も既存の買い物リスト機能にデグレがない

### 備考

- 依存関係：なし
- ブランチ: `refactor/150-shopping-directory`
- コミット参照: `(ryokkon624/hw-hub-manage#150)`
