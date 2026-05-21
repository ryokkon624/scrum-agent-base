## #129: アカウント設定画面でGoogle連携後にm_userのauth_providerが更新されない

### 仕様外の判断・変更・妥協点
- **AppConfig.googleServerClientId の defaultValue を空文字列に設定**: 開発環境では `flutter run --dart-define=GOOGLE_SERVER_CLIENT_ID=xxx` で設定する想定。空の場合は `null` を渡して従来通りの動作（idToken が null になりやすい問題は実機 dart-define 設定で解消）。
- **GoogleLinkSection を StatefulWidget に変換**: `on Exception catch (_)` のエラーハンドリングを `AppException`/汎用エラーに分けるため StatefulWidget が必要。ただし `_errorMessage` の State 管理は不要で、`AppSnackBar` でエラー表示するため `State` はシンプルなまま。
- **`_handleLink` のエラーハンドリング**: Google sign-in 自体はプラットフォームプラグインなのでウィジェットテストでは直接検証できない。既存テスト（表示確認）は引き続き通ることを確認した。
- **`GoogleSignIn` の `serverClientId`**: 空の場合は `null` を渡す（`serverClientId: null` の場合はデフォルト動作で idToken を取得するが、バックエンドの `tokeninfo` 検証は `aud` を厳密にチェックしないため、`serverClientId` 未設定でも連携自体は動作する可能性がある）。

---

## #146: 家事登録画面でテンプレート選択時に家事名が画面に反映されない

### 仕様外の判断・変更・妥協点
（実装中に随時追記）

---

## #147: 家事編集画面で存在しない日付を入力しても保存ボタンが押下できる

### 仕様外の判断・変更・妥故点
（実装中に随時追記）

---

## #145: 家事設定画面で家事が0件の場合に「読み込み中」と表示され続ける

### 仕様外の判断・変更・妥協点
（実装中に随時追記）
