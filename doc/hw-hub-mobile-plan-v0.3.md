# HwHub モバイルアプリ化 計画書 (v0.3)

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
| API定義 | retrofit |
| グラフ | fl_chart |
| Testing | mockito / flutter_test |
| 対象OS | iOS / Android 両方 |
| 最低iOS | iOS 16以上 |
| 最低Android | Android 10（API 29）以上 |
| Bundle ID | `com.hwhub.app` |

---

## バックエンド改修一覧（確定）

モバイルアプリ対応で必要なバックエンド改修のみ記載する。既存APIは原則そのまま利用可能。

| 優先度 | エンドポイント / 対応内容 | 内容 | 実装量 |
|---|---|---|---|
| 🔴 必須・早期 | `POST /api/auth/refresh` | リフレッシュトークン発行・検証。ログイン時にリフレッシュトークンも返却するよう改修 | 中 |
| 🔴 必須・早期 | `POST /api/auth/google/mobile` | Flutter側の`google_sign_in`が取得したidTokenを受け取り、`verifyIdToken()`で検証後HwHub JWTを返却。`loginOrCreate()`は既存流用 | 小 |
| 🔴 必須・早期 | AASA / assetlinks.json 配信 | ディープリンク（Universal Links / App Links）対応のため、`.well-known/`配下に設定ファイルを配信するエンドポイントをSpring Bootに追加 | 小 |
| 🟡 設定画面実装時 | `POST /api/users/me/google/link/mobile` | Google Linkのモバイル版。`loginOrCreate()`流用のため極小 | 極小 |

**画像アップロード（S3 Presigned URL方式）はバックエンド改修不要。** Flutterからも同じAPIをそのまま利用できる。

---

## モバイル機能スコープ

### 対象（モバイル版に含める）

**認証系**

| # | 画面名 | 備考 |
|---|---|---|
| #1 | ログイン | メール/パスワード + Googleログイン（google_sign_in） |
| #2 | サインアップ | |
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

**設定（仕様書未作成）**

| # | 画面名 | 備考 |
|---|---|---|
| #17 | 設定トップ | |
| #18 | アカウント設定 | image_picker（アイコン変更）、Google連携 |
| #19 | 世帯設定 | |
| #20 | 家事設定一覧 | |
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
| `common/image_upload.md` | S3 Presigned URL方式。flutter側はimage_picker + dioでPUT。バックエンド改修不要（未作成） |

---

## 全体の流れ

### Phase 0: 仕様策定 ✅ 完了

**作成済みドキュメント（hw-hub-manage/docs/mobile-spec/）**

```
mobile-screen.md                    # 画面一覧（#1〜#28）
10_home.md
11_housework_assign.md
12_my_tasks.md
13_shopping_list.md
14_shopping_item_new.md
15_shopping_item_detail.md
16_notifications.md
01_login.md 〜 09_auth_result.md    # 認証系9画面
common/household_switcher.md
common/deep_link.md
```

**未作成（設定画面群）**
- `17_settings_top.md` 〜 `28_privacy.md`（#17〜#28）
- `common/image_upload.md`

→ 設定画面の仕様策定はPhase 3の設定画面実装スプリント前に行う

### Phase 1: リポジトリ作成 → Hello World

- リポジトリ: `ryokkon624/hw-hub-mobile`
- `flutter create` → 起動確認（iOS/Android両方）
- CI（lint + test + build）まで通す
- `hw-hub-manage` にIssue起票、commit/PR運用は既存と揃える
  - commit末尾: `(ryokkon624/hw-hub-manage#N)`

### Phase 2: 共通基盤の構築

機能実装より前にやること。バックエンド改修（リフレッシュトークン・Google Mobile認証・AASA配信）もこのフェーズで並行実施。

1. **デザインシステムの移植**
   - `main.css`のトークン（color / spacing / typography / radius）をFlutterの`ThemeData` + 独自`AppTokens`クラスに翻訳
   - Claude Designを活用してVue版と一貫したデザインを実現
   - 共通Widget（Button / Card / Input / Toast等）を整備

2. **認証基盤**
   - ログイン / ログアウト / アクセストークン保持（flutter_secure_storage）
   - リフレッシュトークンのFlag + Queueパターン実装（dioインターセプタ）
     - 401受信 → `isRefreshing=true` → `/api/auth/refresh`呼び出し
     - 並行リクエストはキューに積んで待機 → リフレッシュ完了後リトライ
   - 未認証時のリダイレクト
   - iOSアプリ削除時の罠対策（SharedPreferencesにインストールフラグ）

3. **APIクライアント**
   - dioのインターセプタで認証ヘッダ・エラーハンドリング・ログを集約
   - retrofitでエンドポイント定義、freezedでモデル生成

4. **ルーティング骨格**
   - go_routerで認証済み / 未認証のシェル分け
   - ディープリンク対応（`common/deep_link.md`参照）

5. **エラーハンドリング / トースト**
   - 全画面共通のSnackBar / Dialog

6. **HouseholdSwitcher**
   - `common/household_switcher.md`参照

### Phase 3: 機能実装（スプリント分割）

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
| 7 | 設定画面群（#17〜#28） | 仕様策定と並行 |
| 8 | Google連携（#1・#18） | バックエンド改修完了後 |

**スクラムエージェント体制**

HwHubの既存SM/DEV/POエージェントをほぼそのまま流用。Flutter固有のツール（`flutter analyze` / `flutter test` / `dart format`）を`#skills-changelog`に追加する程度の調整で運用できる見込み。

### Phase 4: ストア配信準備（任意）

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
- `dart format`を毎回実施（`spotlessApply`相当）

---

## 初期スコープ外・将来検討

| 機能 | 備考 |
|---|---|
| プッシュ通知（FCM） | Bundle ID確定済みのため後から追加可能。バックエンドへのFCM連携も別途必要 |
| オフライン対応 | 買い物リストなど一部機能で有効 |
| 共有シート連携 | 買い物アイテム追加など |
| ホーム画面ウィジェット | 今日の家事など |

---

*v0.3 / 2026-04-27 時点*
