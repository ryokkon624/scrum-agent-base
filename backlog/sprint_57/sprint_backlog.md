# Sprint 57 バックログ

## スプリントゴール

モバイルのホーム画面おうちの様子カードのUX改善（棒グラフタップ詳細・空状態表示）と、通知センターのナビゲーションバグ修正

---

## 対象Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|-------|-----|
| #161 | [mobile]ホーム画面のおうちの様子カードで棒グラフクリック時、凡例に明細を表示したい | feature | - |
| #163 | [mobile] ホーム画面のおうちの様子カードでデータがない場合にデータがないことを明示する | feature | - |
| #157 | [mobile] 通知センターで通知をクリックするとエラーが発生する | bug | - |

---

## Issue #161: [mobile]ホーム画面のおうちの様子カードで棒グラフクリック時、凡例に明細を表示したい

**ラベル**: feature
**ブランチ名**: `feature/household-chart-tooltip`
**コミット参照**: `(ryokkon624/hw-hub-manage#161)`

### ユーザーストーリー

ホーム画面のおうちの様子カードで積み上げ棒グラフの棒をタップしたとき、その日付のメンバーごとのタスク件数をツールチップで確認したい。

### 背景・目的

現在、棒グラフはタッチが無効（`BarTouchData(enabled: false)`）になっており、各メンバーの件数を確認するには凡例の色から目視で読み取る必要がある。
fl_chart の組み込みツールチップ機能を有効化することで、タップ操作だけでその日の内訳を確認できるようにする。

### 改修概要

**対象ファイル**:
- `hw-hub-mobile/lib/features/home/presentation/widgets/household_overview_card.dart`

**変更内容**:

1. `_OverviewChart` の `BarTouchData` を有効化する
   - `enabled: false` → `enabled: true`
2. `touchTooltipData`（`BarTouchTooltipData`）を設定する
   - `getTooltipItem` コールバック内で `group.x` をインデックスとして `overview[group.x].countsByAssignee` を参照し、メンバーごとの件数を複数行テキストで組み立てる
   - 件数が 0 のメンバーは表示をスキップする
   - 未割当は「未割当」ラベルで末尾に表示する
3. ツールチップの背景色はテーマの `surfaceCard` を使用する

**表示イメージ**:
```
┌────────────────┐
│ 田中: 3件      │
│ 佐藤: 1件      │
│ 未割当: 2件    │
└────────────────┘
```

### Acceptance Criteria

- [x] 棒グラフの棒をタップするとツールチップが表示される
- [x] ツールチップにその日付のメンバーごとのタスク件数が表示される
- [x] 件数が 0 のメンバーはツールチップに表示されない
- [x] 未割当タスクがある場合、未割当の件数も表示される
- [x] ツールチップの背景色がテーマに沿っている

---

## Issue #163: [mobile] ホーム画面のおうちの様子カードでデータがない場合にデータがないことを明示する

**ラベル**: feature
**ブランチ名**: `feature/household-chart-tooltip`（#161 と同一ブランチ・1ブランチ方針）
**コミット参照**: `(ryokkon624/hw-hub-manage#163)`

### ユーザーストーリー

**As a** アプリユーザー
**I want to** ホーム画面のおうちの様子カードにデータがない場合、データがないことを明示してほしい
**So that** データがない状態とデータがある状態を視覚的に区別できる

### 背景・目的

現在、タスクが1件もない日でも棒グラフがMAX表示されてしまい、データがあるかのように誤認させる問題がある。
空状態を明示することで、ユーザーが状態を正しく認識できるようにする。

### Acceptance Criteria

- [x] AC1: おうちの様子カードのデータが存在しない日の棒グラフがMAXで表示されない
- [x] AC2: おうちの様子カードのデータが存在しない場合、データがないことを示す表示になる

### 備考

- 優先順位の根拠：棒グラフがMAX表示されているためデータありと誤認させる可能性がある
- 依存関係：なし
- 対象ファイルは #161 と同じ `household_overview_card.dart`

---

## Issue #157: [mobile] 通知センターで通知をクリックするとエラーが発生する

**ラベル**: bug（計画フェーズで根本原因調査・改修方針を整理し、GitHub Issue Body を更新すること）
**ブランチ名**: `feature/household-chart-tooltip`（1ブランチ方針）
**コミット参照**: `(ryokkon624/hw-hub-manage#157)`

### 発生事象

通知センターで通知をクリックするとアサーションエラーが発生し、画面遷移が正常に行われない。

```
══╡ EXCEPTION CAUGHT BY WIDGETS LIBRARY ╞═══════════════════════════════════════════════════════════
The following assertion was thrown building HeroControllerScope:
'package:flutter/src/widgets/navigator.dart': Failed assertion: line 4049 pos 18:
'!keyReservation.contains(key)': is not true.

Either the assertion indicates an error in the framework itself, or we should provide substantially
more information in this error message to help you determine and fix the underlying cause.
In either case, please report this assertion by filing a bug on GitHub:
  https://github.com/flutter/flutter/issues/new?template=02_bug.yml

The relevant error-causing widget was:
  HeroControllerScope
  HeroControllerScope:file:///C:/Users/ryokk/AppData/Local/Pub/Cache/hosted/pub.dev/go_router-14.8.1/lib/src/builder.dart:436:14
```

go_router 14.8.1 の HeroControllerScope でHeroキーが重複していることが原因と推測される。

### ユーザーストーリー

**As a** アプリユーザー
**I want to** 通知センターで通知をクリックして対象の画面に遷移したい
**So that** 通知から素早く関連コンテンツにアクセスできる

### Acceptance Criteria

- [x] AC1: 通知センターで通知をクリックした際にエラーが発生せず、対応する画面に遷移する

### 原因・改修方針

計画フェーズで調査・整理して GitHub Issue Body に記録する。

### 備考

- 依存関係：なし

---

## リスク・チャレンジ

- **#157（bug）はgo_routerのHero関連バグ**: FlutterフレームワークのHeroControllerScope とgo_routerの相互作用が原因の可能性があるため、計画フェーズで通知遷移の実装コードを精査し、根本原因を特定すること
- **#161 と #163 は同一ファイルへの改修**: `household_overview_card.dart` を両方の Issue で変更するため、コミット順序を明確にしてコンフリクトを防ぐこと
- **1ブランチ方針（Sprint 55 確立）**: 3件すべてを `feature/household-chart-tooltip` ブランチにIssue単位でコミットを積む
