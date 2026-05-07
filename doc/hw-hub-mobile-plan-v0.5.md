# HwHub モバイルアプリ化 計画書 (v0.5)

## 背景と目的

既に稼働中のHwHub（Vue 3 + TypeScript / Spring Boot）のWebアプリに対し、Flutterで実装するモバイルアプリ版を新規に追加する。Web版（PC/SP両対応）とは別アプリとして、モバイルならではの体験（プッシュ通知、オフライン、共有シート連携など）を活かす方向で検討する。

## 既存Webアプリの技術スタック

- **backend**: Java 21 / Spring Boot 4.x / MyBatis / Flyway / MySQL 8.4 / Groovy + Spock
- **frontend**: Vue 3 / TypeScript / Pinia / Tailwind CSS / Vite / Vitest

---

## 技術スタック（確定）

| カテゴリ | 内容 |
|---|---|
| フレームワーク | Flutter |
| 言語 | Dart |
| 状態管理 | riverpod / hooks_riverpod / flutter_hooks |
| ルーティング | go_router |
| HTTP Client | dio |
| Security | flutter_secure_storage |
| Data Model | freezed / json_serializable |
| API定義 | retrofit ※Phase 3着手時に再導入（後述） |
| グラフ | fl_chart |
| 画像選択 | image_picker |
| Testing | mockito / flutter_test |
| 対象OS | iOS / Android 両方 |
| 最低iOS | iOS 16以上 |
| 最低Android | Android 10（API 29）以上 |
| Bundle ID | `com.hwhub.app` |

---

## バックエンド改修一覧（確定）

モバイルアプリ対応で必要なバックエンド改修のみ記載する。既存APIは原則そのまま利用可能。

| 優先度 | エンドポイント / 対応内容 | 内容 | 実装量 | 状態 |
|---|---|---|---|---|
| 🔴 必須・早期 | `POST /api/auth/refresh` | リフレッシュトークン発行・検証。ログイン時にリフレッシュトークンも返却するよう改修 | 中 | ✅ 完了 |
| 🔴 必須・早期 | `POST /oauth/google/mobile` | Flutter側の`google_sign_in`が取得したidTokenを受け取り、`verifyIdToken()`で検証後HwHub JWTを返却。`loginOrCreate()`は既存流用 | 小 | ✅ 完了 |
| 🔴 必須・早期 | AASA / assetlinks.json 配信 | ディープリンク（Universal Links / App Links）対応のため、`.well-known/`配下に設定ファイルを配信するエンドポイントをSpring Bootに追加 | 小 | ✅ 完了 |
| 🟡 設定画面実装時 | `POST /api/users/me/google/link/mobile` | Google Linkのモバイル版。`loginOrCreate()`流用のため極小 | 極小 | 未着手 |

**画像アップロード（S3 Presigned URL方式）はバックエンド改修不要。** Flutterからも同じAPIをそのまま利用できる。

---

## モバイル機能スコープ

### 対象（モバイル版に含める）

**認証系**

| # | 画面名 | 備考 |
|---|---|---|
| #1 | ログイン | メール/パスワード + Googleログイン（google_sign_in） |
| #2 | サインアップ | 端末ロケールをデフォルト言語として自動設定 |
| #3 | 認証メール待機 | 再送60秒クールダウン |
| #4 | メール認証 | ディープリンクで受け取り |
| #5 | 招待受け取り | ディープリンクで受け取り。ログイン状態で分岐 |
| #6 | パスワード忘れ | |
| #7 | リセットメール送信 | |
| #8 | パスワード再設定 | ディープリンクで受け取り |
| #9 | 認証結果 | type × status の組み合わせで表示内容を制御 |

**メイン機能**

| # | 画面名 | モバイル固有の考慮点 |
|---|---|---|
| #10 | ホーム | fl_chartで積み上げ棒グラフ。世帯未所属時はオンボーディングカード表示 |
| #11 | 家事分担 | D&DをタップUIに変更。スワイプモード2種類（未割当 / 他メンバーから奪う） |
| #12 | My Tasks | Web版SP版と同等。スワイプモードなし |
| #13 | 買い物リスト | PC版2カラム→タブ切り替え（未購入 / かご / 購入済み） |
| #14 | 買い物アイテム作成 | image_pickerでカメラ/ライブラリ選択 |
| #15 | 買い物アイテム詳細 | image_pickerでカメラ/ライブラリ選択 |
| #16 | 通知センター | ベルアイコンに未読件数バッジ表示 |

**設定**

| # | 画面名 | モバイル固有の考慮点 |
|---|---|---|
| #17 | 設定トップ | |
| #18 | アカウント設定 | image_picker（アイコン変更）、通知設定（将来FCM対応時に流用）、Google連携 |
| #19 | 世帯設定 | 招待リンクはhttps://URLをOSシェアシートで共有 |
| #20 | 家事設定一覧 | 追加ボタンは上部配置。削除なし（有効終了日で管理） |
| #21 | 家事新規作成 | |
| #22 | 家事編集 | |
| #23 | 問い合わせ一覧 | |
| #24 | 問い合わせ新規作成 | |
| #25 | 問い合わせ詳細 | |
| #26 | アプリ情報 | |
| #27 | 利用規約 | |
| #28 | プライバシーポリシー | |

### 対象外（モバイル版には含めない）

管理画面系は全て除外。PCでの運用を前提とした機能のため。

- 管理トップ / ユーザー管理 / ロール管理 / 問い合わせ管理（管理者側）/ 家事テンプレート管理

---

## 共通仕様

| 仕様書 | 内容 |
|---|---|
| `common/household_switcher.md` | 複数世帯所属時のみボトムナビ上部に世帯インジケーターバーを表示。タップでボトムシート切り替え |
| `common/deep_link.md` | Universal Links（iOS）/ App Links（Android）方式を採用。対象パス: `/email-verify` / `/invite/:token` / `/password/reset` |
| `common/image_upload.md` | S3 Presigned URL方式。image_pickerで選択後、dioでS3に直接PUT。バックエンド改修不要 |

## i18n（多言語対応）方針

- **認証前画面**: 端末のロケールに自動追従
- **認証後**: アカウント設定（#18）の「利用言語」設定に従う
- サインアップ時に端末ロケールをデフォルト言語として自動設定
- Web版のようなヘッダーへのLanguageSwitcher設置は不要

---

## 全体の流れ

### Phase 0: 仕様策定 ✅ 完了

**作成済みドキュメント（hw-hub-manage/docs/mobile-spec/）**

```
mobile-screen.md                    # 画面一覧（#1〜#28）
01_login.md 〜 09_auth_result.md    # 認証系9画面
10_home.md
11_housework_assign.md
12_my_tasks.md
13_shopping_list.md
14_shopping_item_new.md
15_shopping_item_detail.md
16_notifications.md
17_settings_top.md 〜 28_privacy.md # 設定画面12画面
common/household_switcher.md
common/deep_link.md
common/image_upload.md
```

### Phase 1: リポジトリ作成 → Hello World ✅ 完了

- Flutter環境構築（Windows / Antigravity）
- `ryokkon624/hw-hub-mobile` リポジトリ作成
- Androidエミュレーター（Pixel 8）で動作確認
- Bundle IDを`com.hwhub.app`に修正済み
- GitHubへ初回コミット・プッシュ完了

### Phase 2: バックエンド改修 + テスト基盤整備 ✅ 完了

v0.4時点の「Phase 2 共通基盤の構築」から、**バックエンド改修とFlutterテスト基盤** を切り出して先行対応した。

#### 2-1. バックエンド改修（ブランチ: `feature/mobile-backend-support`）

| コミット | 内容 |
|---|---|
| feat: リフレッシュトークン発行・検証 | `JwtProperties.refreshExpiryMillis` 追加。`POST /api/auth/refresh` 実装。ログイン・登録レスポンスに `refreshToken` フィールドを追加 |
| feat: Googleモバイル認証エンドポイント | `POST /oauth/google/mobile`。idTokenをGoogleのtokeninfo APIで検証し、HwHub JWTを返却 |
| feat: .well-known配信エンドポイント | `GET /.well-known/apple-app-site-association`（iOS Universal Links）、`GET /.well-known/assetlinks.json`（Android App Links）。`DeepLinkProperties`でアプリID・パッケージ名・SHA256フィンガープリントを設定ファイルで管理 |

#### 2-2. Flutterテスト基盤整備

- `mockito` + `build_runner` によるMockクラス生成（`@GenerateMocks`）
- ユニットテスト: `AppException`（sealed class）、`HouseholdState`、`TokenStorage`、`HouseholdNotifier`
- ウィジェットテスト: `HouseholdIndicatorBar`（`ProviderContainer` + `overrideWith` によるFake注入）
- カバレッジ: `flutter test --coverage` → `coverage/lcov.info` → VS Code **Coverage Gutters** 拡張でガター表示

---

### v0.4 からの変更点・差分

#### エンドポイントパスの変更

v0.4では `POST /api/auth/google/mobile` と記載していたが、既存の `GoogleOAuthController`（`/oauth/google/` 配下）に追加する形で実装したため、実際のパスは **`POST /oauth/google/mobile`** になった。

#### フロントエンド（Web版）への影響

`POST /api/auth/refresh` の追加に伴い、ログイン・登録レスポンスに `refreshToken` フィールドが増えた。既存のWeb版フロントエンドは `refreshToken` を無視するだけなので**改修不要**であることを確認済み。

#### retrofit_generator を一時的に削除

`retrofit 4.9.2` + `retrofit_generator 9.7.0` は `dart_mappable` との組み合わせで **コンパイルエラー**（`Parser.DartMappable` が switch case で未処理）になる。Phase 3でAPIクライアント実装を始める際に、互換バージョンを調査して再導入する。

---

### Phase 2 はまりどころ

#### 【バックエンド】DeepLinkProperties のプロパティが null になる

`@Configuration @ConfigurationProperties` を組み合わせると、SpringがCGLIBプロキシクラスとしてラップするためプロパティのセッター呼び出しが届かず、フィールドが null になる。

**解決策**: `@Configuration` を外し、`@ConfigurationProperties` のみにする。アプリケーションクラスに `@ConfigurationPropertiesScan` が付いているため自動スキャンされる。

```java
// NG: @Configuration と @ConfigurationProperties の併用
@Configuration
@ConfigurationProperties(prefix = "hwhub.deep-link")
public class DeepLinkProperties { ... }

// OK: @ConfigurationProperties のみ
@ConfigurationProperties(prefix = "hwhub.deep-link")
public class DeepLinkProperties { ... }
```

#### 【バックエンド】application-test.yml が2ファイル存在する

`src/main/resources/application-test.yml` と `src/test/resources/application-test.yml` の2つが存在し、テスト実行時は **`src/test/resources/` が優先**される。`src/main/resources/` 側に新しいプロパティを追加しても統合テストには反映されないため、テスト用プロパティは必ず `src/test/resources/application-test.yml` に追記する。

#### 【Flutter】HouseholdNotifier の Fake は extends で定義する

`HouseholdNotifier` はクラスなので、ウィジェットテスト用の Fake を作る際は `implements` ではなく `extends` で定義しないとコンパイルエラーになる。

```dart
// NG
class _FakeHouseholdNotifier implements HouseholdNotifier { ... }

// OK
class _FakeHouseholdNotifier extends HouseholdNotifier { ... }
```

#### 【Flutter】testWidgets の中に test をネストできない

`testWidgets` はすでに非同期テストのラッパーであり、`test { await testWidgets(...) }` とネストすると `testWidgets` の戻り値は `void` なので `await` できずコンパイルエラーになる。トップレベルの `testWidgets` 呼び出しにフラットに並べること。

#### 【Flutter】カバレッジ HTML レポートの genhtml は PATH 設定が必要

`choco install lcov` でインストールしても、新しいシェルを開き直さないと `genhtml` コマンドが認識されない（`refreshenv` も効かないことがある）。開発中は **VS Code Coverage Gutters 拡張の Watch ボタン** でガター表示するのが実用的。HTML レポートは CI で生成する想定。

---

### Phase 3: 共通基盤の構築（Flutter側）

バックエンドは完了済み。Flutter側の共通基盤を実装する。スプリントに乗せて進める。

1. **デザインシステムの移植**
   - `main.css`のトークン（color / spacing / typography / radius）をFlutterの`ThemeData` + 独自`AppTokens`クラスに翻訳
   - 共通Widget（Button / Card / Input / Toast等）を整備

2. **認証基盤**
   - ログイン / ログアウト / アクセストークン保持（flutter_secure_storage）
   - リフレッシュトークンの Flag + Queue パターン実装（dioインターセプタ）
     - 401受信 → `isRefreshing=true` → `POST /api/auth/refresh` 呼び出し
     - 並行リクエストはキューに積んで待機 → リフレッシュ完了後リトライ
   - 未認証時のリダイレクト
   - iOSアプリ削除時の罠対策（SharedPreferencesにインストールフラグ）

3. **APIクライアント**
   - dioのインターセプタで認証ヘッダ・エラーハンドリング・ログを集約
   - retrofit を互換バージョンで再導入、freezedでモデル生成

4. **ルーティング骨格**
   - go_routerで認証済み / 未認証のシェル分け
   - ディープリンク対応（`common/deep_link.md`参照）
   - iOS: Xcode の `Runner.entitlements` に `applinks:` エントリを追加する（Apple Developer Portal での Associated Domains 設定も必要）

5. **エラーハンドリング / トースト**
   - 全画面共通のSnackBar / Dialog

6. **HouseholdSwitcher**
   - `common/household_switcher.md`参照

### Phase 4: 機能実装（スプリント分割）

優先度順に1機能=1スプリント程度で進める。

**推奨実装順序**

| 順序 | 対象 | 備考 |
|---|---|---|
| 1 | 認証画面群（#1〜#9） | ログイン・サインアップ・パスワードリセット・ディープリンク |
| 2 | ホーム（#10） | fl_chart導入 |
| 3 | My Tasks（#12） | 最もモバイルで使う頻度が高い |
| 4 | 買い物リスト（#13〜#15） | image_picker導入 |
| 5 | 家事分担（#11） | スワイプモード実装 |
| 6 | 通知センター（#16） | ベルバッジ |
| 7 | 設定画面群（#17〜#28） | |
| 8 | Google連携（#1・#18） | バックエンド改修完了済み |

**スクラムエージェント体制**

HwHubの既存SM/DEV/POエージェントをほぼそのまま流用。Flutter固有のツール（`flutter analyze` / `flutter test` / `dart format`）を`#skills-changelog`に追加する程度の調整で運用できる見込み。

### Phase 5: ストア配信準備（任意）

- アイコン / スプラッシュスクリーン
- プライバシーポリシー（モバイル版）
- ストア掲載文
- Apple Developer Program / Google Play Console の設定
- TestFlight / Internal Testing
- 本番リリース

---

## デザインシステム方針

Vue版の`main.css`から大きく変えない方針。FlutterはCSSを直接読めないため、**`main.css`のCSS変数をDartの定数 / ThemeDataに一回限り翻訳する作業**が発生する。一度移植すれば以降はDart側のみメンテ。Claude Designに`main.css`を渡してFlutterのThemeData + AppColors / AppSpacing / AppRadius クラスに変換してもらうのが効率的。

---

## 開発運用方針

- 既存HwHubのspec-driven開発スタイルを踏襲（詳細仕様 → 実装の順）
- 既存パターンを確認してから新規実装
- commit運用・Issue管理・スクラムエージェント体制は既存をほぼ流用
- `dart format` を毎回実施（`spotlessApply`相当）
- テストカバレッジは限りなく100%を目指す（ユニット + ウィジェット）

---

## 初期スコープ外・将来検討

| 機能 | 備考 |
|---|---|
| プッシュ通知（FCM） | Bundle ID確定済みのため後から追加可能。#18通知設定をそのまま流用できる設計。バックエンドへのFCM連携も別途必要 |
| オフライン対応 | 買い物リストなど一部機能で有効 |
| 共有シート連携 | 買い物アイテム追加など |
| ホーム画面ウィジェット | 今日の家事など |

---

*v0.5 / 2026-05-07 時点*
