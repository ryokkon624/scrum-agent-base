# Sprint 32 バックログ

**スプリント番号**: 32
**スプリントゴール**: My Tasks画面の家事カードを画面幅いっぱいに正しく表示する
**対象ブランチ**: `feature/67-mobile-my-tasks`（既存ブランチ・PR #12オープン中）

---

## Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #82 | [mobile] My Tasks画面の家事カードが幅いっぱいに表示されない | bug | - |

---

## #82: [mobile] My Tasks画面の家事カードが幅いっぱいに表示されない

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/82
**ラベル**: bug
**ブランチ名**: `feature/67-mobile-my-tasks`

### 発生事象

My Tasks画面の家事カードの幅が家事タスク名の長さによってバラバラで、画面横幅いっぱいに表示されない。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** My Tasks画面の家事カードが画面横幅いっぱいに表示されること
**So that** スワイプ操作をしやすく、一覧としての視認性が高い画面を使える

### Acceptance Criteria

- [x] AC1: 家事カードが画面横幅いっぱいに表示され、カード幅がコンテンツ（タスク名）の長さに依存しない
- [x] AC2: ウィジェットテストで `SwipeableTaskCard` の幅がコンテナ幅と一致することを検証している

### 原因

<!-- DEVが計画フェーズで更新 -->

### 改修方針

<!-- DEVが計画フェーズで更新 -->

### 備考

- Sprint 31 Review指摘。#80（カードレイアウトweb SP版合わせ）のAC2未達成
- Sprint 29 #77のレイアウト対応でも同系統の問題が発生しており、2スプリント連続
- 根本原因の仮説: `swipeable_task_card.dart` の Container に `width: double.infinity` / `SizedBox.expand` / `CrossAxisAlignment.stretch` が設定されていない
- ブランチ名: `feature/67-mobile-my-tasks`
- PR #12にcloses追加が必要（既存PRのbodyをPATCHで更新）

---

## SMメモ

- bugラベルのため、計画フェーズでDEVが根本原因調査・改修方針をIssue Bodyに記入する
- 既存ブランチ継続のためPR新規作成不要。既存PR #12のbodyに `closes ryokkon624/hw-hub-manage#82` を追加する
- reviewerへのdiffスコープ指定が必須（`git diff [sprint-start-commit]^...HEAD`）
