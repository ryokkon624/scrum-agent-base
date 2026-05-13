# Sprint 29 バックログ

## スプリントゴール

Sprint 28 Review指摘対応 — My Tasks担当者フィルタバグ・デザインweb SP版合わせ・GoRoute定数化漏れを完了させる

## 対象Issue

| Issue | タイトル                                                                         | ラベル | SP  |
| ----- | -------------------------------------------------------------------------------- | ------ | --- |
| #76   | [mobile] My Tasks画面に自分の担当以外の家事タスクが表示される                    | bug    | -   |
| #77   | [mobile] My Tasks画面のデザインがwebのSP版と異なる                               | bug    | -   |
| #78   | [mobile] app_router.dartのGoRouteのpath引数がAppRoutes定数に未置換のまま残っている | bug    | -   |

---

## Issue #76: [mobile] My Tasks画面に自分の担当以外の家事タスクが表示される

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/76  
**ブランチ名**: `feature/67-mobile-my-tasks`  
**ラベル**: bug

### 発生事象

My Tasks画面を開くと、ログインユーザーが担当していないタスクも含む全世帯員分の家事タスクが表示される（おうち全体のタスクが表示されている）。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー  
**I want to** My Tasks画面に自分が担当する家事タスクだけが表示されること  
**So that** 他のメンバーのタスクと混在せず、自分がやるべきことに集中できる

### Acceptance Criteria

- [x] AC1: My Tasks画面に表示されるタスクはすべてログインユーザーが担当（assigneeUserId == currentUserId）のものだけである
- [x] AC2: 他のメンバーが担当するタスクは表示されない
- [x] AC3: テストで「自分以外のassigneeUserIdを持つタスクが表示されないこと」がNotifierテストで検証されている
- [x] AC4: 仕様書 `hw-hub-mobile/docs/mobile-spec/12_my_tasks.md` の4.APIセクションに「フロント側でassigneeUserId == currentUserIdでフィルタする」旨が追記されている

### 原因

<!-- DEVが計画フェーズで更新 -->

### 改修方針

<!-- DEVが計画フェーズで更新 -->

### 備考

- ホーム画面（#70 My Tasksカード件数集計バグ）と同じ根本原因。Sprint 28 Review指摘
- コミット番号: `(ryokkon624/hw-hub-manage#76)`

---

## Issue #77: [mobile] My Tasks画面のデザインがwebのSP版と異なる

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/77  
**ブランチ名**: `feature/67-mobile-my-tasks`  
**ラベル**: bug

### 発生事象

My Tasks画面の色・レイアウトがhw-hub-frontendのSP版（MyTasksPage.vue）と異なる。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー  
**I want to** モバイルのMy Tasks画面がwebのSP版と統一されたデザインであること  
**So that** デバイスをまたいで一貫した体験を得られる

### Acceptance Criteria

- [x] AC1: `hw-hub-frontend/src/views/housework/tasks/MyTasksPage.vue` のSP版と照合して差分箇所を特定し、色・余白・フォントサイズを一致させる
- [x] AC2: webのSP版に存在する視覚要素でモバイル仕様書に未記載のものは、webのSP版を正として実装されている

### 原因

<!-- DEVが計画フェーズで更新 -->

### 改修方針

<!-- DEVが計画フェーズで更新 -->

### 備考

- ホーム画面（Sprint 27 #69 デザインweb SP版合わせ）と同じ指摘。Sprint 28 Review指摘
- コミット番号: `(ryokkon624/hw-hub-manage#77)`

---

## Issue #78: [mobile] app_router.dartのGoRouteのpath引数がAppRoutes定数に未置換のまま残っている

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/78  
**ブランチ名**: `feature/67-mobile-my-tasks`  
**ラベル**: bug

### 発生事象

#75でAppRoutes定数クラスを追加し `context.go()` の引数は置き換えたが、`app_router.dart` 内の `GoRoute(path: '/tasks')` などのGoRoute定義のpath引数がリテラルのままになっている。ルートパスの変更時に `AppRoutes` クラスと `GoRoute` 定義の2箇所を修正しなければならない状態。

### ユーザーストーリー

**As a** 開発者  
**I want to** GoRoute定義のpath引数もAppRoutes定数で統一したい  
**So that** ルートパスの変更時に `AppRoutes` クラスの1箇所だけ修正すればよくなる

### Acceptance Criteria

- [x] AC1: `app_router.dart` 内のすべての `GoRoute(path: ...)` のpath引数が `AppRoutes.xxx` に置き換えられている（`_publicPrefixes` は対象外）
- [x] AC2: `flutter analyze` が警告・エラーなしで通過する

### 原因

<!-- DEVが計画フェーズで更新 -->

### 改修方針

<!-- DEVが計画フェーズで更新 -->

### 備考

- #75（AppRoutes定数化）の対応漏れ。Sprint 28 Review指摘
- コミット番号: `(ryokkon624/hw-hub-manage#78)`
