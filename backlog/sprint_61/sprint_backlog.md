# Sprint 61 バックログ

## スプリントゴール

モバイルの命名・配置規約を統一し、家事割り当てスワイプモードのフィルタリングバグを修正する

---

## ブランチ方針

複数Issue実装は1ブランチにまとめる方針（Sprint 55確立）。
ブランチ名: `refactor/176-mobile-data-structure`（リポジトリ: hw-hub-mobile）

---

## Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #176 | [mobile] data 層のモデルファイルの配置が feature によって異なる | refactor | - |
| #177 | [mobile] tasks feature のフォルダ名とファイル名が my_tasks で混在している | refactor | - |
| #165 | [mobile] 家事割り当て画面の「他メンバーのタスクを奪う」スワイプモードに自身のタスクが表示される | bug | - |

---

## #176 [mobile] data 層のモデルファイルの配置が feature によって異なる

### 発生事象

DTO やリクエスト/レスポンスモデルの配置が feature によって `data/` 直下と `data/models/` サブフォルダの2パターンに分かれている。

```
// data/models/ サブフォルダあり（統一パターン）
features/auth/data/
  auth_api.dart
  models/
    auth_user.dart
    login_response.dart
    register_response.dart

features/inquiry/data/
  inquiry_api.dart
  models/
    inquiry_dto.dart
    ...

// data/ 直下にモデルが散乱（不統一パターン）
features/home/data/
  home_repository.dart
  home_raw_data.dart        ← models/ なしで直置き
  household_member_dto.dart ← 直置き
  housework_dto.dart        ← 直置き
  housework_task_dto.dart   ← 直置き
  shopping_item_dto.dart    ← 直置き

features/shopping/data/
  shopping_repository.dart
  create_shopping_item_request.dart  ← 直置き
  shopping_attachment_dto.dart       ← 直置き
  update_shopping_item_request.dart  ← 直置き
  ...
```

### ユーザーストーリー

**As a** 開発者
**I want to** どの feature でも `data/models/` にモデルファイルがあると期待したい
**So that** ファイルを探す際に迷わない

### Acceptance Criteria

- [-] AC1: `home/data/` 直下のモデルファイル（`*_dto.dart`, `home_raw_data.dart`）が `home/data/models/` に移動する（No-op: 既に models/ 配下に整理済みのため実装不要）
- [-] AC2: `shopping/data/` 直下のモデルファイル（`*_dto.dart`, `*_request.dart`, `*_response.dart`）が `shopping/data/models/` に移動する（No-op: 既に models/ 配下に整理済みのため実装不要）
- [-] AC3: 他 feature の `data/` 配下も確認し、`models/` サブフォルダなしで直置きされているモデルファイルがあれば移動する（No-op: 全 feature が既に整理済み）
- [-] AC4: 移動に伴う import パスが全ファイルで更新される（No-op: 実装不要のため対象なし）

### 原因

モデルファイルを `data/models/` に置くルールが一部 feature に徹底されていなかったため。

### 実装案

各 feature の `data/models/` サブフォルダを作成し、モデルファイルを移動する。
import パスを合わせて更新する。

### 改修方針

上記「実装案」の通り。

### 備考

- 依存関係：なし
- ブランチ: `refactor/176-mobile-data-structure`

---

## #177 [mobile] tasks feature のフォルダ名とファイル名が my_tasks で混在している

### 発生事象

`features/tasks/` というフォルダ名に対して、配下のファイル名・クラス名がほぼ全て `my_tasks_` プレフィックスになっており、一貫性がない。

```
features/tasks/              ← フォルダ名は tasks
  my_tasks_providers.dart    ← ファイル名は my_tasks_
  presentation/
    my_tasks_notifier.dart   ← ファイル名は my_tasks_
    my_tasks_page.dart       ← ファイル名は my_tasks_
    my_tasks_state.dart      ← ファイル名は my_tasks_
    widgets/
  data/
    my_tasks_repository.dart ← ファイル名は my_tasks_
```

`tasks` という名前は「全タスク管理機能」と誤解させる可能性があり、実態（自分に割り当てられたタスクの一覧）と乖離している。

### ユーザーストーリー

**As a** 開発者
**I want to** feature フォルダ名とファイル名・クラス名を統一したい
**So that** feature の役割とファイル名が一致し、コードが読みやすくなる

### Acceptance Criteria

- [x] AC1: フォルダ名 `features/tasks/` が `features/my_tasks/` にリネームされる（ファイル名に合わせる）
- [x] AC2: または、配下の全ファイル・クラス名が `tasks_` プレフィックスに統一される（フォルダ名に合わせる）（選択肢A採用）
- [x] AC3: router / provider / import パスが全ファイルで更新される
- [x] AC4: テストファイルの命名・配置も同様に更新される

### 原因

フォルダ作成時と実装時で命名が揃わなかったため。

### 実装案

**選択肢A（フォルダ名をファイル名に合わせる）:**
`features/tasks/` → `features/my_tasks/` にリネーム。

**選択肢B（ファイル名をフォルダ名に合わせる）:**
`my_tasks_*.dart` → `tasks_*.dart` に全リネーム。クラス名 `MyTasksNotifier` → `TasksNotifier` 等も変更。

影響範囲が少ない選択肢A（フォルダリネームのみ）を推奨する。

### 改修方針

上記「実装案」の選択肢Aの通り。`features/tasks/` → `features/my_tasks/` にリネームのみ。

### 備考

- 依存関係：なし
- ブランチ: `refactor/176-mobile-data-structure`（#176と同一ブランチ）

---

## #165 [mobile] 家事割り当て画面の「他メンバーのタスクを奪う」スワイプモードに自身のタスクが表示される

**⚠️ bugラベル: 計画フェーズで根本原因を調査し、GitHub Issue Body（原因・改修方針）を更新すること**

### 発生事象

家事割り当て画面の「他メンバーのタスクを奪う」スワイプモードに自身のタスクが表示されている。
正しくは未割当タスクと自身を除く他メンバーのタスクのみが表示されるべき。

### ユーザーストーリー

**As a** アプリユーザー
**I want to** 「他メンバーのタスクを奪う」スワイプモードに自身のタスクが表示されないようにしたい
**So that** 他のメンバーのタスクだけが表示されて操作しやすい

### Acceptance Criteria

- [x] AC1: 「他メンバーのタスクを奪う」スワイプモードに自身のタスクが表示されない
- [x] AC2: 「他メンバーのタスクを奪う」スワイプモードに未割当タスクと自身を除く他メンバーのタスクが表示される

### 原因

<!-- 原因分析後に更新 -->

### 改修方針

<!-- 原因分析後に更新 -->

### 備考

- 依存関係：なし
- ブランチ: `refactor/176-mobile-data-structure`（#176/#177と同一ブランチ）
