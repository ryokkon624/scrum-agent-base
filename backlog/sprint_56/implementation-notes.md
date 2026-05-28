## #132: [mobile] おうち設定画面でDarkモードの場合「現在」バッジが見えない

### 仕様外の判断・変更・妥協点
- 特になし。既存の `AppColorScheme.statusActiveBg` / `statusActiveText` をそのまま利用。新規カラートークン定義は不要だった。

---

## #133: [mobile] おうち設定画面の画面下部の HouseholdSwitcher を非表示

### 仕様外の判断・変更・妥協点
- テスト用ルーター（`main_shell_indicator_test.dart`）に `/settings` ブランチを追加した。既存のテストはショッピング1ブランチしかなかったため、設定画面の遷移テストのためにブランチを追加する必要があった。

---

## #134: [mobile] 世帯未所属時に「アイテムを追加」ボタンを非活性化

### 仕様外の判断・変更・妥協点
- 特になし。`householdNotifierProvider` のローディング中（`householdAsync.valueOrNull == null`）もボタン非活性になるが、ローディング中は shopping data のローディングも走っており、`_ShoppingBody` 自体が表示される状態（shopping data が `AsyncData`）のときには household も概ね解決済みのため実害なしと判断した。
