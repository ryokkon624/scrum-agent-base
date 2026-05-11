# HwHub モバイルアプリ化 計画書 (v0.6)

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
| #11 | 家事分担 | D&DをタップUIに変更。通常リストモード: 左スワイプ=自分(sky-500)・右スワイプ=メンバーモーダル(amber-500)。Tinderスワイプモード別途あり |
| #12 | My Tasks | 右スワイプ=完了(emerald-500)・左スワイプ=スキップ(slate-400) |
| #13 | 買い物リスト | タブ切り替え（未購入/かご/購入済み）。未購入: 右=かご(emerald)/左=削除(rose)。かご: 右=購入済み(emerald)/左=戻す(slate) |
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

## 全体の流れ

### Phase 0: 仕様策定 ✅ 完了

### Phase 1: リポジトリ作成 → Hello World ✅ 完了

### Phase 2: 共通基盤の構築 ✅ 完了

（詳細は v0.5 参照）

---

### Phase 3: 機能実装

優先度順に1機能=1スプリント程度で進める。

| 順序 | 対象 | 状態 | 備考 |
|---|---|---|---|
| 1 | 認証画面群（#1〜#9） | ✅ 完了 | テスト167件・カバレッジ95.4% |
| 2 | ホーム（#10） | 未着手 | fl_chart導入 |
| 3 | My Tasks（#12） | 未着手 | 最もモバイルで使う頻度が高い |
| 4 | 買い物リスト（#13〜#15） | 未着手 | image_picker導入 |
| 5 | 家事分担（#11） | 未着手 | スワイプモード実装 |
| 6 | 通知センター（#16） | 未着手 | ベルバッジ |
| 7 | 設定画面群（#17〜#28） | 未着手 | |
| 8 | Google連携（#1・#18） | 未着手 | バックエンド改修完了済み |

---

### v0.5 からの変更点・差分

#### Phase 3 Step 1: 認証画面群（#1〜#9）実装完了

| 実績 | 内容 |
|---|---|
| 実装画面 | ログイン / サインアップ / メール認証待機 / メール認証 / 招待受け取り / パスワード忘れ / リセットメール送信 / パスワード再設定 / 認証結果（9画面） |
| テスト件数 | 167件（Repository 6・Notifier 81・ウィジェット 80） |
| カバレッジ | 95.4%（766/803 lines）← 目標 ≥95% 達成 |
| マージ済みPR | ryokkon624/hw-hub-mobile#5 |

#### CI インフラの整備

| 項目 | 内容 |
|---|---|
| `coverage-mobile.yml` lcov修正 | 除外パターンが lcov.info にマッチしない場合に `--ignore-errors unused` が必要（exit code 25 を回避） |
| `format-check-mobile.yml` 追加 | `dart format --output=none --set-exit-if-changed .` でフォーマット違反を PR 時に検出 |
| GitHub Pages 有効化 | `POST /repos/ryokkon624/hw-hub-mobile/pages` API で手動有効化。カバレッジレポート: https://ryokkon624.github.io/hw-hub-mobile/ |
| 全リポジトリ format-check CI | frontend（prettier）・backend（spotlessCheck）・batch（spotlessCheck）・mobile（dart format）に format-check workflow を追加 |

#### mobile-spec のスワイプ操作対応（#11〜#13）

Web版フロントエンドでスワイプ操作に変更されていた3画面のmobile-specを更新。

| spec | 変更内容 |
|---|---|
| `11_housework_assign.md` v0.1→v0.2 | 通常リストモード: [自分にする]/[担当▼]ボタン削除 → 左スワイプ=自分(sky-500)/右スワイプ=メンバーモーダル(amber-500) |
| `12_my_tasks.md` v0.1→v0.2 | [スキップ]/[完了]ボタン削除 → 右スワイプ=完了(emerald-500)/左スワイプ=スキップ(slate-400) |
| `13_shopping_list.md` v0.1→v0.2 | [かごへ]/[戻す]/[購入済み]ボタン削除（一括購入ボタンは維持）→ 未購入: 右=かご(emerald)/左=削除(rose)。かご: 右=購入済み(emerald)/左=戻す(slate)。DELETE APIエンドポイント追記 |

---

### Phase 3 はまりどころ

#### 【Flutter テスト】unnecessary_underscores lint エラー

GoRoute の `builder: (_, __)` パターンは `unnecessary_underscores` lint で拒否される。複数の使い捨て引数は全て `_` を使う。

```dart
// NG
GoRoute(path: '/login', builder: (_, __) => const LoginPage())
container.listen(provider, (_, __) {})

// OK
GoRoute(path: '/login', builder: (_, _) => const LoginPage())
container.listen(provider, (_, _) {})
```

#### 【Flutter テスト】lcov --ignore-errors unused が必要な場合

lcov_exclude.txt に書いたパターンが lcov.info に存在しない場合、lcov が exit code 25 で終了する。CI では `--ignore-errors unused` を付けて回避する。

```yaml
lcov --remove coverage/lcov.info $PATTERNS --ignore-errors unused --output-file coverage/lcov_filtered.info
```

#### 【Git 運用】mainブランチへの直接コミット厳禁

修正作業は必ずブランチを切ってから行う。誤って main にコミットした場合の復旧手順:

```bash
# 1. main 上のコミットを含む新ブランチを作成
git checkout -b fix/branch-name

# 2. main を origin/main まで巻き戻す
git checkout main
git reset --hard origin/main

# 3. 新ブランチをプッシュ
git push origin fix/branch-name
```

#### 【GitHub Pages】Pagesの手動有効化が必要

新規リポジトリは GitHub Pages がデフォルト無効。デプロイ workflow を追加しただけでは 404 になる。初回のみ API で有効化する。

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/OWNER/REPO/pages \
  -d '{"build_type": "workflow"}'
```

#### 【Dart】dart format はコミット前に必ず実行

`spotlessApply`（Java）・`npm run format`（frontend）と同様に、Dartも `dart format .` をコミット前に実行する。CI の `format-check-mobile.yml` が差異を検出してブロックする。

---

### Phase 5: ストア配信準備（任意）

- アイコン / スプラッシュスクリーン
- プライバシーポリシー（モバイル版）
- ストア掲載文
- Apple Developer Program / Google Play Console の設定
- TestFlight / Internal Testing
- 本番リリース

---

## デザインシステム方針

Vue版の`main.css`から大きく変えない方針。FlutterはCSSを直接読めないため、**`main.css`のCSS変数をDartの定数 / ThemeDataに一回限り翻訳する作業**が発生する。一度移植すれば以降はDart側のみメンテ。

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

*v0.6 / 2026-05-11 時点*
