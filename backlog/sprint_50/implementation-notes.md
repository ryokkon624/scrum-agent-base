## #154: flutter analyze警告ゼロ化

### 仕様外の判断・変更・妥協点

- **`_P` クラスの削除**: `app_router.dart` にあった「Phase 4以降で実装するまでの仮画面」クラスが完全に参照されていないことを確認して削除。Phase 4の実装時に改めて作成する前提。
- **`account_settings_page_test.dart` の未使用import精査**: 元々 `account_settings_providers.dart` と `account_settings_notifier_test.mocks.dart`、`mockito` の3つが未使用だったが、`accountSettingsNotifierProvider` が `account_settings_notifier.dart` 内で定義されているため `providers.dart` も実際には不要だった。削除後に再度analyzeして確認。

## #153: テストカバレッジ95%以上

### 仕様外の判断・変更・妥協点

（実装中に随時追記）
