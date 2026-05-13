# Sprint 31 バックログ

**スプリント番号**: 31
**作成日**: 2026-05-13
**ステータス**: Planning完了

---

## スプリントゴール

Sprint 29 Review指摘の残課題2件（My Tasksフィルタバグ・カードレイアウト）を解消し、
モバイルMy Tasks画面を完成品質に引き上げる

---

## 対象Issue

| Issue | タイトル | ラベル | SP | ブランチ |
|-------|---------|-------|-----|---------|
| #79 | [mobile] My Tasks画面に未割当のタスクが表示される | bug | 3 | feature/67-mobile-my-tasks |
| #80 | [mobile] My Tasks画面のカードレイアウトをwebのSP版に合わせる | bug | 2 | feature/67-mobile-my-tasks |

---

## Issue #79: [mobile] My Tasks画面に未割当のタスクが表示される

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/79
**ラベル**: bug
**ブランチ名**: `feature/67-mobile-my-tasks`（コミットはこのIssue単独で分ける）

### 発生事象

My Tasks画面を開くと、担当者が割り当てられていない（assigneeUserId == null）タスクが表示される。
AC1「表示されるタスクはすべてログインユーザーが担当（assigneeUserId == currentUserId）のものだけである」を満たしていない。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** My Tasks画面に自分が担当する家事タスクだけが表示されること
**So that** 他のメンバーのタスクや未割当タスクと混在せず、自分がやるべきことに集中できる

### Acceptance Criteria

- [x] AC1: My Tasks画面に表示されるタスクはすべてログインユーザーが担当（assigneeUserId == currentUserId）のものだけである
- [x] AC2: 未割当のタスク（assigneeUserId == null）は表示されない
- [x] AC3: テストで「assigneeUserId が null のタスクが表示されないこと」がNotifierテストで検証されている
- [x] AC4: 計画フェーズでDEVが以下の3点を分析し、原因・改修方針セクションに記録の上SMに提案している
  - ①コードレベルの根本原因（なぜ「未割当タスクを含める」実装になったか）
  - ②なぜAC未達のままレビューを通過したか（テスト・プロセスのどこに問題があったか）
  - ③再発防止策の提案（テスト・実装・プロセス観点）

### 原因

<!-- DEVが計画フェーズで更新。①コードレベルの根本原因（なぜ「未割当タスクを含める」実装になったか）②なぜAC未達のまま通過したか（テスト・プロセスのどこに問題があったか）を分析すること -->

### 改修方針

<!-- DEVが計画フェーズで更新。バグ修正に加えて、③再発防止策（テスト・実装・プロセス観点での改善案）を提案すること -->

### 備考

- Sprint 29 Review指摘。#76（担当者フィルタバグ）のAC1未達成
- DEVが「未割当タスクは含める」と自己判断して実装したことが直接原因
- 既存ブランチ継続: `feature/67-mobile-my-tasks`（PR #12オープン中。このIssueのコミットは単独で分けること）

---

## Issue #80: [mobile] My Tasks画面のカードレイアウトをwebのSP版に合わせる

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/80
**ラベル**: bug
**ブランチ名**: `feature/67-mobile-my-tasks`（コミットはこのIssue単独で分ける）

### 発生事象

My Tasks画面のカードレイアウトが以下の2点でwebのSP版（MyTasksPage.vue）と異なる。

①「過去の家事」「これからの家事」セクション内の家事カードがフラットに並んでおり、日付グループの中にインデントされていない。webのSP版は日付ラベル・タスク数の下に家事カードが階層表示される。

②家事カードの横幅がコンテンツ幅に依存しており左寄せになっている。webのSP版は家事カードが親コンテナ幅いっぱいに広がっている。右手でスマホを持つユーザーが幅の狭いカードをスワイプしにくい。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** モバイルのMy Tasks画面のカードレイアウトがwebのSP版と統一されていること
**So that** デバイスをまたいで一貫した体験を得られ、スワイプ操作も快適に行える

### Acceptance Criteria

- [x] AC1: 「過去の家事」「これからの家事」各セクション内で、日付ラベル・タスク数の下に家事カードがインデントして配置されている（webのSP版の階層構造と一致）
- [x] AC2: 家事カードが画面横幅いっぱいに表示され、カード幅がコンテンツ長に依存しない
- [x] AC3: `hw-hub-frontend/src/views/housework/tasks/MyTasksPage.vue` のSP版レイアウトと目視で一致している

### 原因

<!-- DEVが計画フェーズで更新 -->

### 改修方針

<!-- DEVが計画フェーズで更新 -->

### 備考

- Sprint 29 Review指摘。#77（デザインweb SP版合わせ）の対応漏れ
- 既存ブランチ継続: `feature/67-mobile-my-tasks`（PR #12オープン中。このIssueのコミットは単独で分けること）
- 参照ファイル: `hw-hub-frontend/src/views/housework/tasks/MyTasksPage.vue`（SP版レイアウト）

---

## リスク・チャレンジ

### リスク
- `feature/67-mobile-my-tasks` は既存ブランチ・PR #12オープン中。複数スプリントにまたがっているため、reviewerへの指示はコミット範囲を `git diff <sprint-start-commit>^...HEAD` で絞ること（Sprint 20の教訓）
- #79はAC4の原因分析が計画フェーズの必須作業。分析がそのまま再発防止策・テスト設計に直結するため、Opus 4.7での計画フェーズでしっかり実施すること

### チャレンジ
- Claudeモデル最新バージョン確認: 現在 Opus 4.7（計画）/ Sonnet 4.6（実装）が最新。変更なし（Sprint 30確認済み）
- reviewerのDiscord投稿継続監視: Sprint 13〜30で19スプリント連続成功中

---

## Sprint Review HTML生成対象

| Issue | ラベル | ファイル |
|-------|-------|---------|
| #79 | bug | backlog/sprint_31/review-#79.html |
| #80 | bug | backlog/sprint_31/review-#80.html |
