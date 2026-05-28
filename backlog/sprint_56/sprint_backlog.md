# Sprint 56 バックログ

## スプリントゴール

おうち設定画面のUI改善（Darkモード対応・HouseholdSwitcher非表示）と買い物リストの世帯未所属時ボタン非活性化を実施し、Sprint 46 Review指摘を完了させる

## 対象Issue

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #132 | [mobile] おうち設定画面でDarkモードの場合に現在のおうちに表示される「現在」が見えない | bug | - |
| #133 | [mobile] おうち設定画面の画面下部のHouseholdSwitcherを非表示にする | feature | - |
| #134 | [mobile] 世帯未所属時に買い物リストの「アイテムを追加」ボタンを非活性にする | feature | - |

## ブランチ方針

複数Issue 1ブランチ方針（Sprint 55確立）に従い、全Issueを1ブランチに積む。
- **ブランチ名**: `fix/132-household-ui-sprint56`

---

## Issue #132（bug）

### タイトル
[mobile] おうち設定画面でDarkモードの場合に現在のおうちに表示される「現在」が見えない

### 発生事象

おうち設定画面でDarkモードを使用している場合、現在選択中のおうちに表示される「現在」バッジが視認できない。テキストカラーまたは背景カラーがDarkモードの背景色と同化していることが原因と考えられる。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** Darkモード時でも「現在」バッジが視認できてほしい
**So that** 現在選択中のおうちをひと目で確認できる

### Acceptance Criteria

- [x] AC1: Darkモード時に「現在」バッジが視認できる（カラートークンでDarkモード対応）
- [x] AC2: Lightモード時の「現在」バッジの表示に変化がない

### 原因
<!-- 原因分析後に更新 -->

### 改修方針
<!-- 原因分析後に更新 -->

### 備考

- Sprint 46 Review 指摘 ②
- 関連Issue: #122（世帯設定画面実装）
- GitHub Issue: ryokkon624/hw-hub-manage#132
- **bugラベル**: 計画フェーズで根本原因の調査・改修方針を整理し、Issue Bodyを更新すること

---

## Issue #133（feature）

### タイトル
[mobile] おうち設定画面の画面下部のHouseholdSwitcherを非表示にする

### ユーザーストーリー

**As a** ユーザー
**I want to** おうち設定画面上部でおうちを切り替えられる
**So that** 画面下部のHouseholdSwitcherが不要になり、UIがすっきりする

### Acceptance Criteria

- [x] AC1: おうち設定画面（画面#19）の画面下部にHouseholdSwitcherが表示されない
- [x] AC2: 他の画面（ホーム・タスク・買い物リストなど）のHouseholdSwitcherは変更なし

### 備考

- Sprint 46 Review 指摘 ③
- 画面上部に世帯一覧・切り替えUIが存在するため、下部のHouseholdSwitcherは重複・不要
- 関連Issue: #122（世帯設定画面実装）
- GitHub Issue: ryokkon624/hw-hub-manage#133

---

## Issue #134（feature）

### タイトル
[mobile] 世帯未所属時に買い物リストの「アイテムを追加」ボタンを非活性にする

### ユーザーストーリー

**As a** ユーザー
**I want to** 世帯に所属していない状態では買い物アイテムを追加できないようにしたい
**So that** householdIdが必須キーである買い物アイテムを誤って操作することを防げる

### Acceptance Criteria

- [x] AC1: 世帯に所属していない状態では、買い物リスト画面の「アイテムを追加」ボタンが非活性（disabled）になる
- [x] AC2: 世帯に所属している状態では、「アイテムを追加」ボタンが活性になる（既存動作と同じ）

### 備考

- Sprint 46 Review 指摘 ④
- householdIdは買い物アイテムの必須キーであるため、世帯未所属時の追加操作は不正な状態になる
- GitHub Issue: ryokkon624/hw-hub-manage#134

---

## リスク・チャレンジ

### リスク
- #132（bug）はカラートークンの実装方法がモバイル規約（`mobile-conventions`）に依存するため、DEVは計画フェーズで既存トークン定義を調査すること
- #133・#134は既存コンポーネントの変更のため、他画面への影響を回避するよう実装すること（AC2の「他画面変更なし」）

### チャレンジ
- なし（既存機能の改修・バグ修正のみ）
