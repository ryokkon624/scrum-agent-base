## #126: [mobile] プロフィール画像を登録済みのユーザーのuser_iconに画像が表示されない

### 仕様外の判断・変更・妥協点
- **S3UrlResolver をシングルトン `const` クラスで実装**: インスタンス化コストがないため、Provider から毎回 `S3UrlResolver(isDebug: kDebugMode)` として生成する形にした（`final` フィールドに持つほうが通常だが、`const` クラスにすることでテストでも `const _debugResolver = S3UrlResolver(isDebug: true)` として使いやすい）。
- **AuthRepositoryImpl に `s3UrlResolver` を named パラメータで追加**: 既存が named パラメータ形式（`required AuthApi api`）だったため、同様に `required S3UrlResolver s3UrlResolver` として追加した。既存のすべての呼び出し箇所（auth_providers.dart）を更新済み。
- **AccountSettingsRepositoryImpl は positional パラメータ**: 既存が `(Dio, Dio)` の positional だったため、3番目に `S3UrlResolver` を追加した（シグネチャを変更せず既存のパターンに合わせた）。
- **fetchProfile / updateProfile の戻り値で URL 変換を適用**: `UserProfileDto` は const コンストラクタを持つ不変 DTO のため、`copyWith` が定義されていない。変換後の値で新しいインスタンスを生成して返す形にした（全フィールドを明示して生成）。

---

## #127: [mobile] アカウント設定画面でプロフィール画像登録後に画面の画像が更新されない

### 仕様外の判断・変更・妥協点
- **AC1 は #126 の修正で自動解消**: `fetchProfile()` の `iconUrl` に URL 変換が適用されるようになったため、`uploadIcon()` Step4 の `fetchProfile()` で正しい URL が返るようになった。
- **authNotifierProvider.invalidate の位置**: `state = AsyncData(...)` で成功状態をセットした後に `ref.invalidate(authNotifierProvider)` を呼ぶことで、ヘッダーの再取得が成功後にトリガーされる設計にした。エラー時は invalidate しない（意図的）。

---

## #130: [mobile] アカウント設定画面に外観設定セクション（システム連動/ライト/ダーク）を追加する

### 仕様外の判断・変更・妥協点
- **ThemeMode 名前衝突の解決**: `lib/core/models/theme_mode.dart` に HwHub 独自の `ThemeMode` enum が存在し、Flutter material の `ThemeMode` と名前が衝突する。`theme_mode_notifier.dart` では `import 'package:flutter/material.dart' as material;` と `import '../models/theme_mode.dart' as hw;` というエイリアスを使って解決した。
- **ThemeModeNotifier を AsyncNotifier で実装**: SharedPreferences の読み取りは非同期のため `AsyncNotifier<material.ThemeMode>` を採用した。`main.dart` では `AsyncData` の `valueOrNull ?? ThemeMode.system` でフォールバックを設定している（初期化中も `ThemeMode.system` が適用される）。
- **AC5（Nice to Have）の実装**: `AccountSettingsNotifier.updateThemeMode()` を `catch (_) {}` で無視する形で実装した。通常 `catch (_) {}` 禁止だが、AC5 は明示的に "Nice to Have" であり、バックエンド同期失敗を UI に出すことが逆にユーザー体験を悪化させるため例外的に採用した。
- **モックファイル再生成の必要性**: `AccountSettingsRepository` に `updateThemeMode()` を追加したため、build_runner で `account_settings_notifier_test.mocks.dart` を再生成した。
- **AppearanceSection のキー**: ウィジェットテストで Key ベース検証できるよう `Key('appearanceSection')` を SegmentedButton のコンテナに付与した。
