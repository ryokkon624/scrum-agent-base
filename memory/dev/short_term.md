# Sprint 52 作業メモ

## 担当Issue
- #126: [bug/mobile] プロフィール画像を登録済みのユーザーのuser_iconに画像が表示されない
- #127: [bug/mobile] アカウント設定画面でプロフィール画像登録後に画面の画像が更新されない
- #130: [feature/mobile] アカウント設定画面に外観設定セクションを追加

## 作業順
1. #126 → 2. #127 → 3. #130

---

## #126 実装方針（承認済み）

**ブランチ**: `fix/126-mobile-user-icon-image-not-displayed`

### 原因
- `AccountSettingsRepositoryImpl._resolveS3Url()` はアップロード時（Presigned URL）にのみ適用されており、表示用の `iconUrl`（fetchProfile/getMyProfile の戻り値）には変換が適用されていない
- バックエンドが LocalStack の URL（`http://localhost:4566/...`）をそのまま返すため、Android エミュレーターから到達不能 → 画像ロード失敗 → イニシャル表示
- ヘッダーの `HeaderUserIcon` が参照する `AuthUser.iconUrl` も同様の問題

### 改修方針
- S3 URL 変換ロジックを `core/network/S3UrlResolver` として共通化
  - `kDebugMode` 時のみ `localhost` / `127.0.0.1` → `10.0.2.2` に置換
- 表示用 URL にも変換を適用：全 `iconUrl` を Repository 層で一括変換
- 対象は **ユーザーアイコンのみ**（買い物アイテム画像は対象外）

### 変更ファイル（想定）
- 新規: `lib/core/network/s3_url_resolver.dart`
- 編集: `lib/features/account_settings/data/account_settings_repository.dart`
- 編集: AuthRepository / AuthNotifier（`AuthUser.iconUrl` への変換適用）
- 編集: 各 provider 配線

---

## #127 実装方針（承認済み）

**ブランチ**: `fix/127-mobile-account-settings-icon-not-refreshed`

### 原因
- AC1: `uploadIcon()` 後の `fetchProfile()` で取得する URL が `localhost` のままで画像表示失敗（#126 と同根）
- AC2: ヘッダー（`AuthUser.iconUrl`）は `AuthNotifier` の state を参照しており、`uploadIcon` 後に invalidate されないため未反映

### 改修方針
- AC1: #126 の URL 変換修正で自動解消
- AC2: `uploadIcon()` 完了後に `ref.invalidate(authNotifierProvider)` を追加

### 変更ファイル（想定）
- 編集: `lib/features/account_settings/presentation/account_settings_notifier.dart`

---

## #130 実装方針（承認済み）

**ブランチ**: `feature/130-mobile-appearance-settings`

### 方針
- `ThemeModeNotifier`（AsyncNotifier）を新規作成
  - `build()` は SharedPreferences から読み取り（未ログイン時もデバイスローカルの保存値を適用）
  - ログイン後に `/me` から取得した DB 値を優先して同期し、デバイスローカルの保存値も DB 値で上書き更新
- `main.dart` の `themeMode` を Notifier state を参照するよう変更（AC3 即時反映）
- アカウント設定画面の「プロフィール設定セクション」と「プロフィール画像セクション」の間に `AppearanceSection`（3択セグメントボタン）を配置
- AC5（Web 同期）: 既存バックエンド API `PATCH /api/users/me/theme` を使用

### 変更ファイル（想定）
- 新規: `lib/core/theme/theme_mode_notifier.dart`
- 新規: `lib/features/account_settings/presentation/widgets/appearance_section.dart`
- 編集: `lib/main.dart`
- 編集: `lib/features/account_settings/presentation/account_settings_page.dart`
- 編集: ARB（ja/en/es）

---

## 注意事項（long_term.md より抜粋）
- AutoDispose 設定漏れ注意（Sprint 45/48/51 で繰り返し指摘）
- `catch (_) {}` 禁止
- ウィジェットテストは Key ベース検証（日本語直接検証禁止）
- `copyWith` は全フィールド列挙
- Dio の型パラメータは具体型を指定
- マジックストリング禁止（`core/models/` の enum を使う）
- i18n ハードコード禁止
- `debugPrint` でエラーオブジェクト全体を出力しない
