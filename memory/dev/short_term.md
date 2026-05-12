# Dev 短期記憶

**スプリント**: Sprint 27
**最終更新**: 2026-05-12

---

## スプリントゴール

モバイルホーム画面のSprint 26 Review指摘5件を全件解消し、webのSP版と完全に統一されたUIを実現する

---

## 対象Issue

| Issue | 内容 | ブランチ |
|-------|------|---------|
| #70 | [mobile] My Tasksカードの件数集計バグ修正 | `feature/66-mobile-home`（hw-hub-mobileリポジトリ） |
| #71 | [mobile] 買い物リストカードの購入場所名称表示バグ修正 | `feature/66-mobile-home` |
| #69 | [mobile] ホーム画面デザインをwebのSP版に合わせる | `feature/66-mobile-home` |
| #72 | [mobile] おうちの様子グラフ積み上げ順序修正（未割当を一番上に） | `feature/66-mobile-home` |
| #73 | [mobile] おうちの様子グラフ縦軸目盛り追加 | `feature/66-mobile-home` |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`

---

## 承認済み実装方針

### 実装順序
#70 → #71（bugを先に）→ #72 → #73 → #69（デザイン確認が必要なため最後）

---

### #70 My Tasksカードの件数集計バグ

**原因**: `home_notifier.dart:87` の `_calcMyTasksSummary` が `assigneeUserId != null`（割り当て済み全員）でフィルタリングしており、ログインユーザーのIDで絞り込んでいない（Phase 4のTODOコメントあり）

**改修方針**:
- `_load()` メソッド内で `authNotifierProvider` から `currentUserId` を取得する
- `_calcMyTasksSummary` に `currentUserId` を引数として渡し、`t.assigneeUserId == currentUserId` でフィルタリングする
- バックエンドAPIへの変更は不要（`HouseworkTaskResponse` に `assigneeUserId` フィールドは既存）

**対象ファイル**: `lib/features/home/presentation/home_notifier.dart`

---

### #71 買い物リストの購入場所名称表示バグ

**原因**: `shopping_card.dart:131` の `_storeLabel` が `'supermarket'/'online'/'drug_store'` でswitch文を書いているが、バックエンドAPIは `'1'`（スーパー）、`'2'`（オンライン）、`'3'`（ドラッグストア）を返す。いずれのcaseにもマッチせず `default: return storeType;` でIDがそのまま表示されていた。

**改修方針**: `_storeLabel` のswitch文を `'1'`/`'2'`/`'3'` キーに修正する（フロントエンドの `PURCHASE_LOCATION_TYPE` 定数と整合）

**対象ファイル**: `lib/features/home/presentation/widgets/shopping_card.dart`

---

### #72 おうちの様子グラフ積み上げ順序修正

**原因**: `household_overview_card.dart:129-147` で「未割当 → メンバー」の順で `rodStackItems` に追加しているため、未割当が棒グラフの下（底）に来る。

**改修方針**: 順序を「メンバー → 未割当（最後）」に変更する。fl_chartでは配列の最後に追加されたセグメントが最上部に積み上がるため、未割当を最後に追加すれば頂点に表示される。

**対象ファイル**: `lib/features/home/presentation/widgets/household_overview_card.dart`（`_OverviewChart.build()` の `rodStackItems` 構築ロジック L126-147）

---

### #73 縦軸目盛り追加

**改修方針**:
```dart
leftTitles: AxisTitles(
  sideTitles: SideTitles(
    showTitles: true,
    reservedSize: 28,
    getTitlesWidget: (value, meta) {
      if (value != value.roundToDouble()) return const SizedBox.shrink();
      return Text(
        value.toInt().toString(),
        style: TextStyle(fontSize: 10, color: colors.textMuted),
      );
    },
  ),
),
```

**対象ファイル**: `lib/features/home/presentation/widgets/household_overview_card.dart`（`leftTitles` 設定 L186-188）

---

### #69 ホーム画面デザインをwebのSP版に合わせる

**改修方針**:
- `hw-hub-frontend` のホーム画面SP版（`ShoppingListCard.vue` / `MyTasksCard.vue` / `UnassignedCard.vue` 等）を参照して各カードの色・余白・フォントサイズを確認・調整
- spec未記載の要素はwebのSP版を正として実装

**対象ファイル**: 確認後に決定（主に `lib/features/home/presentation/widgets/` 配下）

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
- 作業開始時・完了時・レビュー指摘対応完了時にDiscord作業スレッド（スレッドID: 1503569468045922354）に投稿する
- PRはSMが行う。DEVはpushまでが担当

---

## 申し送り事項（Sprint 26から引き継ぎ）

- **HomeAppBar の通知・アカウントアイコンは未実装（SnackBar表示）。`#15` 対応時に必ず実装すること。**

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #70 My Tasksカード件数集計バグ | 完了 |
| #71 購入場所名称表示バグ | 完了 |
| #72 グラフ積み上げ順序修正 | 完了 |
| #73 グラフ縦軸目盛り追加 | 完了 |
| #69 デザインwebのSP版合わせ | 完了 |

**push済みブランチ**: `feature/66-mobile-home`（hw-hub-mobile）
**最終コミット**: `e7aae02` fix: Sprint27 ホーム画面5件修正

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
