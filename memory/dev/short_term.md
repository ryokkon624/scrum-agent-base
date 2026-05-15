# Dev 短期記憶

## 現在の状態

Sprint 36 実装完了。ブランチ `feature/85-mobile-shopping-list` にコミット・プッシュ済み。SMへ報告待ち。

## 完了したこと

- #97: setFromFavorite/setFromHistoryにmemoフィールド追加
- #108: 詳細画面削除後に一覧Providerをinvalidate（#107のページ変更も同コミットに含む）
- #99: 全NotifierへのAppSnackBarエラー通知横展開（ShoppingListNotifier・ShoppingItemDetailNotifier・ShoppingItemNewNotifier・MyTasksNotifier）
- Sprint36 バックログ全ACチェック済み
- `flutter analyze` 問題なし（391テスト全パス）

## コミット一覧

1. b4dd924: fix: お気に入り選択時のメモ欄更新漏れを修正 (ryokkon624/hw-hub-manage#97)
2. 01ced05: fix: 買い物アイテム詳細画面削除後の一覧即時反映を修正 (ryokkon624/hw-hub-manage#108)
3. 5e391dd: fix: 全NotifierへのAppSnackBarエラー通知横展開 (ryokkon624/hw-hub-manage#99)

## 引き継ぎ事項

- PR作成はりょこさんが行う
- Sprint 36 レトロスペクティブに向けてlong_term.mdを更新すること
