## #167: 日時フォーマット処理が複数ファイルに重複している

### 仕様外の判断・変更・妥協点

- `date_format_utils.dart` のファイルレベルコメントは `///` ではなく `//` で記述（`///` はドキュメントコメントとして次の宣言に紐づく必要があるため、ファイルトップの説明コメントに使うと `dangling_library_doc_comments` 警告が発生する）

## #169: SnackBar の呼び出し方が AppSnackBar と ScaffoldMessenger で混在している

### 仕様外の判断・変更・妥походов変更・妥協点

- `unpurchased_tab.dart` / `basket_tab.dart` で2秒指定されていた duration は AppSnackBar の3秒固定に統一した（りょこさん承認済み）
- `shopping_item_new_page.dart` の `ScaffoldMessenger` 呼び出しは#169実施前から既に `AppSnackBar` を使っていたため変更不要だった（grep で確認済み）
- AppSnackBar はグローバルな `scaffoldMessengerKey` を使うため、ウィジェットテストで `AppSnackBar.showSuccess/showError` の呼び出し結果を検証するには `MaterialApp(scaffoldMessengerKey: AppSnackBar.messengerKey)` の設定が必要。`buildTestPage` に `withSnackBarKey: bool = false` パラメータを追加して対応した

## #170: 確認ダイアログの実装が AppDialog と showDialog() 直接呼び出しで混在している

### 仕様外の判断・変更・妥協点

- `AppDialog.confirm` は `title` パラメータが必須。元のダイアログが title なし（content のみ）だった箇所では `title: ''` を渡した（空文字列はウィジェット上で表示されない）
- `bulk_skip_dialog.dart` は `StatelessWidget` クラスから `showBulkSkipDialog(BuildContext, {required int count})` 関数に変更した。クラス自体が不要になったためウィジェットテストも関数呼び出し形式に書き直した
- 置換対象外にした箇所:
  - `notification_popover.dart`: ポップオーバー UI 全体を showDialog で実装しており AppDialog.confirm の置き換え対象ではない
  - `household_list_section.dart`: TextField を含む入力ダイアログのため AppDialog.confirm では代替不可
  - `bulk_complete_dialog.dart`: 独立した StatefulWidget 本体（UI コンポーネント）であり呼び出し側ではない
- `_MemberCard` / `_InvitationRow` の `onRemove`/`onTransferOwner`/`onLeave`/`onRevoke` コールバック型を `VoidCallback` から `Future<void> Function()` に変更した（AppDialog.confirm が `Future<bool>` を返すため await が必要になったことに対応）
- `header_user_icon_test.dart` のログアウトダイアログ確認をキー（`Key('logoutConfirmDialog')` 等）からタイプ（`find.byType(AlertDialog)`・`find.byType(TextButton), findsNWidgets(2)`）ベースに変更した（AppDialog は Key を付与しないため）
