# Dev 短期記憶

**スプリント**: Sprint 32
**最終更新**: 2026-05-13

---

## スプリントゴール

Sprint 31 で残ったMy Tasksカード幅問題（`SwipeableTaskCard` がタスク名の長さで幅が変わる）を修正し、カードが親コンテナ幅いっぱいに表示されるようにする

---

## 対象Issue（bugラベル）

| Issue | 内容 | SP | ブランチ |
|-------|------|----|----|
| #82 | [mobile] My Tasksカードがタスク名の長さで幅が変わる | TBD | `fix/82-mobile-my-tasks-card-width` |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`

---

## 承認済み実装方針

### #82: My Tasksカードがタスク名の長さで幅が変わる

**コミットメッセージ**: `fix: My Tasksカードを親コンテナ幅いっぱいに表示する (ryokkon624/hw-hub-manage#82)`

**原因:**
`swipeable_task_card.dart` の Dismissible の child である `Container` に `width` 指定がないため、内部テキスト（タスク名）の長さに依存したintrinsicな幅になっている。Sprint 31 で `margin` 削除のみ対応し `width: double.infinity` の設定を漏らしたことが直接原因。

**改修方針:**
`swipeable_task_card.dart` の Dismissible child の `Container` に `width: double.infinity` を追加するのみ。セクション側（`past_tasks_section.dart` / `future_tasks_section.dart`）は変更不要。

---

## テスト方針（TDD: RED → GREEN → REFACTOR）

| 対象 | テスト |
|------|--------|
| 短いタスク名と長いタスク名の2パターンで `SwipeableTaskCard` の幅が等しいこと | `my_tasks_page_test.dart` に追加（`tester.getSize()` でassertion） |

---

## 変更ファイル一覧

**編集:**
- `lib/features/tasks/presentation/widgets/swipeable_task_card.dart`（Dismissible child Container に `width: double.infinity` 追加）
- `test/features/tasks/presentation/my_tasks_page_test.dart`（カード幅のassertion追加）

---

## コミット前チェックリスト

- [ ] ACをすべて満たしているか
- [ ] `dart format .`
- [ ] `flutter analyze`（警告ゼロ）
- [ ] `flutter test`（全グリーン）
- [ ] シミュレーターまたはウィジェットテストで実際の見た目（カード全幅表示）を確認した
- [ ] AppLocalizationsのimportパスは `lib/l10n/app_localizations.dart` への相対パスか（今回は変更なしの想定）
- [ ] `git push -u origin fix/82-mobile-my-tasks-card-width`

---

## 作業ルール

- [DEV] プレフィックスをDiscord投稿に必ずつける
- 作業スレッドID: `1504009337452888145`
- ブランチ: `fix/82-mobile-my-tasks-card-width`
- PRはSMが行う。DEVはpushまでが担当

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #82 My Tasksカード幅問題 | 実装完了・プッシュ済み（ブランチ: feature/67-mobile-my-tasks、コミット: e61888f） |

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
