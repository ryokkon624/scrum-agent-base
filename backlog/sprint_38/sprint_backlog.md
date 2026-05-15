# Sprint 38 バックログ

## スプリントゴール

モバイル買い物リストの購入済みタブにスワイプ操作を追加し、ナビゲーションバーのi18n未対応を修正することで、UI一貫性とコード品質を向上させる

## ブランチ

- #91: `feature/89-mobile-shopping-ui-improvements` を継続するか新規ブランチ `feature/91-purchased-swipe` を作成するか、DEVがPR #14のマージ状況を確認して判断すること
- #109: `fix/109-nav-label-i18n`（新規ブランチ）

---

## Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #91 | [mobile]買い物リスト画面の購入済みタブでスワイプを可能にしたい | feature | - |
| #109 | [mobile]main_shellのナビゲーションバーラベルがi18n未対応 | bug | 1 |

---

## #91: 購入済みタブでスワイプを可能にする

**ラベル**: feature
**コミット番号**: `feat: 購入済みタブに左スワイプ対応を追加 (ryokkon624/hw-hub-manage#91)`

### 概要

Web版のSPモードと同様に、買い物リスト画面の購入済みタブでスワイプを可能にしたい。
- 左スワイプ：スワイプ可能だが、スワイプ後「ステータスを変更するには、編集画面で更新してください」のメッセージを表示
- 右スワイプ：不可

### ユーザーストーリー

**As a** 買い物リストを使うユーザー
**I want to** 購入済みタブでも左スワイプのジェスチャーを使いたい
**So that** 他タブと同じ操作感でアイテムを扱える

### Acceptance Criteria

- [x] AC1: 購入済みタブのアイテムカードで左スワイプが可能である
- [x] AC2: 左スワイプ後、「ステータスを変更するには、編集画面で更新してください」のトーストメッセージが表示される
- [x] AC3: 右スワイプは無効である

### 備考

- 優先順位の根拠：Web版SPモードとのUI統一
- 依存関係：#90（購入済みタブのカード形式レイアウト）完了済み ✅
- PR #14（`feature/89-mobile-shopping-ui-improvements`）がオープン中のため、ブランチ戦略をDEVが確認して判断すること

---

## #109: ナビゲーションバーラベルのi18n対応

**ラベル**: bug
**コミット番号**: `fix: ナビゲーションバーラベルをi18n対応に修正 (ryokkon624/hw-hub-manage#109)`

### 発生事象

`lib/features/shell/main_shell.dart` のNavigationDestinationの `label` パラメータが日本語ハードコードになっており、AppLocalizationsによるi18n対応がされていない。

### ユーザーストーリー

**As a** 開発者
**I want to** ナビゲーションバーのラベルをAppLocalizationsで管理したい
**So that** 他のi18n済みテキストと統一された方法でラベルを管理できる

### Acceptance Criteria

- [x] AC1: NavigationDestinationの各labelがAppLocalizationsのキーを参照している
- [x] AC2: ARBファイル（intl_ja.arb / intl_en.arb）にナビゲーションラベルのキーが追加されている
- [x] AC3: 現在の表示テキスト（ホーム・家事分担・タスク・買い物・設定）が変わらない

### 原因

`NavigationDestination` の `label` パラメータに日本語文字列リテラルが直接埋め込まれており、AppLocalizationsを経由していない。

### 改修方針

各 `NavigationDestination` の `label` を `AppLocalizations.of(context)` の対応するキーに置き換え、intl_ja.arb / intl_en.arb にキーを追加する。

### 備考

- Sprint 37 コードレビューで検出（convention-reviewer）
- 依存関係：なし
