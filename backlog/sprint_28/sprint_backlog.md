# Sprint 28 バックログ

## スプリントゴール

モバイルMy Tasks画面を実装してスワイプ操作で日々の家事管理を快適にし、AppRoutes定数クラス導入でルーティング品質を向上させる

## 対象Issue

| Issue | タイトル                                         | ラベル    | SP  |
| ----- | ------------------------------------------------ | --------- | --- |
| #67   | [mobile] My Tasks画面を実装する (#12)            | feature   | 5   |
| #75   | 画面遷移時に指定するpathを定数に置き換えたい     | refactor  | 2   |

---

## Issue #67: [mobile] My Tasks画面を実装する (#12)

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/67  
**ブランチ名**: `feature/67-mobile-my-tasks`  
**仕様書**: `hw-hub-mobile/docs/mobile-spec/12_my_tasks.md`

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー  
**I want to** 自分担当の家事タスクをスワイプで素早く完了・スキップしたい  
**So that** 毎日の家事管理をモバイルで快適にこなせる

### Acceptance Criteria

- [ ] AC1: 過去の未対応タスクがある場合に「過去の家事」セクションを日付グループ表示する。0件の場合はセクション自体を非表示にする
- [ ] AC2: 「これからの家事」セクションに今日以降の自分担当タスクを日付グループ表示する。セクションヘッダーに未対応件数を表示する
- [ ] AC3: フィルタ（すべて / 今日 / 1週間）でフロント側絞り込みができる
- [ ] AC4: 右スワイプ（emerald-500背景・「完了」ラベル）でステータスを完了に更新し、カードをリストから除去する（PATCH /api/housework-tasks/{taskId}/status）
- [ ] AC5: 左スワイプ（slate-400背景・「スキップ」ラベル）でステータスをスキップに更新し、カードをリストから除去する（PATCH /api/housework-tasks/{taskId}/status）
- [ ] AC6: スワイプ中はカードが追従してドラッグし、カード幅の30%超えでアクション確定する。背景に色とアイコンを表示して操作内容をフィードバックし、確定後にトーストを表示する
- [ ] AC7: 「すべて完了にする」ボタンで確認ダイアログを表示し、確認後に過去タスクを一括完了できる（PATCH /api/housework-tasks/bulk-status）
- [ ] AC8: 複数世帯所属時は世帯インジケーターバーを表示し、タップで世帯切り替えができる（HouseholdSwitcher共通仕様。ホームで実装済みのUIを再利用）
- [ ] AC9: 画面表示時・世帯切り替え時にAPIからデータを取得し、ローディング中はインジケーターを表示する
- [ ] AC10: テストカバレッジ ≥95%（Notifier・ウィジェットテスト）

### 備考

- 優先順位の根拠：モバイルで最も使用頻度が高い画面
- 依存関係：HouseholdSwitcherをホーム（Sprint 26で実装済み）で先行実装すること → 解消済み
- スワイプ操作はSprint 26のホーム画面で実装したパターンを流用可能

---

## Issue #75: 画面遷移時に指定するpathを定数に置き換えたい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/75  
**ブランチ名**: `refactor/75-app-routes-constants`

### 概要

画面遷移時の `'/tasks'` のような指定方法の場合、タイポがあっても静的解析でひっかからない。

```dart
MyTasksCard(
  summary: state.myTasksSummary,
  onOpen: () => context.go('/tasks'),
),
```

そのため、AppRoutes定数クラスを作成する。

```dart
class AppRoutes {
  static const tasks = '/tasks';
  static const home = '/home';
}

// 使う側
context.go(AppRoutes.tasks);
```

`app_router.dart` 内に定義するでよい。

### ユーザーストーリー

**As a** 開発者  
**I want to** 画面遷移時のpathをAppRoutes定数クラスで一元管理したい  
**So that** タイポによるランタイムエラーを静的解析の段階で検出できるようにする

### Acceptance Criteria

- [ ] AC1: `app_router.dart` 内に `AppRoutes` 定数クラスが定義されており、既存のすべてのルートパスが定数として含まれている
- [ ] AC2: アプリ内でハードコードされたパス文字列を使った画面遷移がすべて `AppRoutes.xxx` に置き換えられている
- [ ] AC3: `flutter analyze` が警告・エラーなしで通過する

### 備考

- 優先順位の根拠: ランタイムエラーを静的解析で事前に防ぐ品質改善。低リスク・高効果
- 依存関係: なし
- 実装量は小さいが、#67（My Tasks）で新たに `/tasks` ルートが追加されるため、#67と同一ブランチでまとめて実施すると効率的

---

## リスク・チャレンジ

### リスク

- #67はAC10件と大規模（スワイプUI・フィルタ・世帯切り替え・一括完了・テスト95%）
- Agent Teams messaging failureの既知問題（dev/dev2がSendMessageに無応答になる場合）→ 発生時はSMが直接計画フェーズを担当

### チャレンジ

- Claudeモデルの最新バージョン確認: 現在 Opus 4.7（計画）/ Sonnet 4.6（実装）。変更なし
- reviewerのDiscord投稿継続監視（Sprint 13〜27で16スプリント連続成功）
- #75（AppRoutes定数化）と#67（My Tasks）を同一ブランチでまとめることで効率化できるかを検討する
