# Dev 短期記憶

**スプリント**: Sprint 28
**最終更新**: 2026-05-12

---

## スプリントゴール

モバイルMy Tasks画面を実装してスワイプ操作で日々の家事管理を快適にし、AppRoutes定数クラス導入でルーティング品質を向上させる

---

## 対象Issue

| Issue | 内容 | ブランチ |
|-------|------|---------|
| #67 | [mobile] My Tasks画面を実装する (#12) | `feature/67-mobile-my-tasks`（hw-hub-mobile） |
| #75 | 画面遷移時に指定するpathを定数に置き換えたい | `feature/67-mobile-my-tasks`（#67と同一ブランチ） |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`

---

## 承認済み実装方針

### 全体方針
- 同一ブランチ `feature/67-mobile-my-tasks` で #67 + #75 をまとめて実施
- 実装順序: #75（AppRoutes定数化・低リスク先行）→ #67（My Tasks本体）

---

### #75 AppRoutes定数化

**対象ファイル**: `lib/app_router.dart`

**改修内容**:
- `app_router.dart` 末尾に `AppRoutes` クラスを追加し、既存全ルートを定数として定義
  - 認証系: `/login`, `/signup`, `/email-waiting`, `/forgot-password`, `/forgot-password/sent`, `/auth-result`, `/email-verify`, `/invite/:token`, `/password/reset`
  - シェル内: `/`, `/housework`, `/tasks`, `/shopping`, `/shopping/new`, `/shopping/:id`, `/settings`, `/settings/account`, `/settings/household`, `/settings/housework`, `/settings/housework/new`, `/settings/housework/:id`, `/settings/inquiries`, `/settings/inquiries/new`, `/settings/inquiries/:id`, `/settings/app-info`, `/settings/terms`, `/settings/privacy`
  - シェル外: `/notifications`
- リポジトリ全体の `context.go('/xxx')` / `path: '/xxx'` を grep して `AppRoutes.xxx` に置換
- `flutter analyze` 警告ゼロを確認

---

### #67 My Tasks画面

**バックエンドAPI**（既存3エンドポイントをそのまま利用・変更なし）:
- `GET /api/housework-tasks?householdId=X&status=0`
- `PATCH /api/housework-tasks/{taskId}/status`
- `PATCH /api/housework-tasks/bulk-status`

**新規ファイル構成** (`lib/features/tasks/`):
```
data/
  my_tasks_repository.dart          # GET / PATCH(status) / PATCH(bulk-status)
presentation/
  my_tasks_notifier.dart            # AsyncNotifier (pastTasks/futureTasks/filter/isLoading)
  my_tasks_state.dart               # MyTasksState, MyTasksFilter (all/today/week)
  my_tasks_page.dart                # 画面本体
  widgets/
    past_tasks_section.dart         # 過去の家事セクション（0件時非表示）
    future_tasks_section.dart       # これからの家事セクション（フィルタ含む）
    swipeable_task_card.dart        # スワイプカード（共通化）
    bulk_complete_dialog.dart       # 「すべて完了」確認ダイアログ
my_tasks_providers.dart             # Repository Provider
```

**スワイプ実装**: Flutter標準の `Dismissible` を使用
- 背景は `direction` 別に `background`/`secondaryBackground` で設定
- `dismissThresholds: {DismissDirection.startToEnd: 0.3, DismissDirection.endToStart: 0.3}` でAC6の30%条件
- 右スワイプ（完了）= emerald-500、左スワイプ（スキップ）= slate-400
- `confirmDismiss` でAPI呼び出し、成功時にトースト表示・カード除去

**ルーティング**: 既存の `/tasks` 仮実装（`_P('My Tasks')`）を本物の `MyTasksPage` に差し替え

**HouseholdSwitcher**: Sprint 26実装済みの `main_shell.dart` の `HouseholdIndicatorBar` がボトムナビ直上に表示されるため、My Tasksページ側での個別実装は不要

**テスト戦略**（AC10 ≥95%）:
- `my_tasks_repository_test.dart`: Dio mockでAPI 3種類
- `my_tasks_notifier_test.dart`: 過去/未来振り分け・フィルタ・完了/スキップ・bulk-status
- `my_tasks_page_test.dart`: ウィジェットテスト（ローディング・空表示・スワイプ・確認ダイアログ・フィルタタブ）

---

### 確認事項（りょこさん All OK 回答済み）

1. AC8世帯バーは `main_shell` の既存実装を利用（追加実装不要）
2. AC9はホーム画面同様 `AsyncNotifier.build()` + `ref.invalidate` 設計
3. トーストは `ScaffoldMessenger.showSnackBar`
4. AC7 bulk-status のリクエストボディ仕様は実装時にバックエンドコードで確認

---

## コミット前チェックリスト

- [ ] `dart format .`（リポジトリルートで実行）
- [ ] `flutter analyze`（警告ゼロ）
- [ ] `flutter test`（既存テスト全グリーン）
- [ ] 変更したテストも全グリーン
- [ ] `git push` 完了

---

## 作業ルール

- コミットメッセージ形式: `fix: [内容] (ryokkon624/hw-hub-manage#N)` または `feat:`
- [DEV] プレフィックスをDiscord投稿に必ずつける
- 作業開始時・完了時・レビュー指摘対応完了時にDiscord作業スレッド（スレッドID: 1503649259403087912）に投稿する
- PRはSMが行う。DEVはpushまでが担当

---

## 申し送り事項（Sprint 26から引き継ぎ）

- **HomeAppBar の通知・アカウントアイコンは未実装（SnackBar表示）。`#15` 対応時に必ず実装すること。**

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #75 AppRoutes定数化 | 完了（コミット: da8a8af） |
| #67 My Tasks画面 | 完了（コミット: fc0d4b8） |

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
