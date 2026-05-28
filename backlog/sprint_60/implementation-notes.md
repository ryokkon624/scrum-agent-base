## #168: Notifier エラーハンドリング共通化

### 仕様外の判断・変更・妥協点

- **`_runCatching()` のシグネチャは Notifier の種類ごとに個別定義した**: 共通基底クラスは不要とのユーザー確認のため、各 Notifier に private メソッドとして追加した。Generic で共通化できるが、Dart の型システム上 `state.copyWith(errorMessage: msg)` のような呼び出しを Generic にするには `copyWith` の型を抽象化する必要があり過設計になるため見送り。
- **`ShoppingItemNewNotifier.fetchHistorySuggestions` / `fetchFavorites` は `_runCatching()` 非適用**: 戻り値（`List<T>`）があるため、エラー時に空リストを返す必要があり通常の `_runCatching()` パターンに合わない。個別 try/catch を維持した。
- **`AppInfoNotifier._fetchAppVersion` / `_fetchApiVersion` は変更なし**: `_fetchAppVersion` は戻り値があるため非適用。`_fetchApiVersion` は AC の「Nice to Have」処理でサイレント catch が仕様通りのため変更しない。
- **auth系 Notifier のうち `catch (_)` がないものは変更なし**: `signup_notifier`, `password_forgot_notifier`, `password_reset_notifier`, `password_reset_sent_notifier`, `invitation_notifier`, `email_verify_wait_notifier` はすでに `on AppException` のみで `catch (_)` がないため変更不要。
- **`NotificationCenterNotifier._fetchNotifications` の `catch (_) { rethrow; }` は `rethrowUnexpected: true` パラメータで維持**: 元の挙動（AppException 以外の予期しない例外は rethrow する）を `_runCatching` の `rethrowUnexpected` フラグで再現した。

## #173: Provider 定義の集約

### 仕様外の判断・変更・妥協点

（実装中に随時追記）

## #174: 不要サブフォルダ解消

### 仕様外の判断・変更・妥協点

（実装中に随時追記）

## #175: テストフォルダ構成整理

### 仕様外の判断・変更・妥協点

（実装中に随時追記）
