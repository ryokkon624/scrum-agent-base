# HwHub モバイルアプリ化 計画書 (v0.1 現時点版)

## 背景と目的

既に稼働中のHwHub（Vue 3 + TypeScript / Spring Boot）のWebアプリに対し、Flutterで実装するモバイルアプリ版を新規に追加する。Web版（PC/SP両対応）とは別アプリとして、モバイルならではの体験（プッシュ通知、オフライン、共有シート連携など）を活かす方向で検討する。

## 既存Webアプリの技術スタック

- **backend**: Java 21 / Spring Boot 4.x / MyBatis / Flyway / MySQL 8.4 / Groovy + Spock
- **frontend**: Vue 3 / TypeScript / Pinia / Tailwind CSS / Vite / Vitest

## 全体の流れ

### Phase 0: 仕様策定

既存`screen.md`を起点にモバイル版の機能を確定する。

- **機能一覧の詳細化**: 各画面の画面遷移・APIコール・状態管理単位で書き出す
- **モバイル要否の選別**: PC前提の管理機能（admin系など）はモバイル不要、家事チェック・買い物リストなど外出先で価値が高い機能を優先
- **モバイルならではの機能の検討**:
  - プッシュ通知（家事リマインド、買い物追加通知）
  - オフライン対応
  - 共有シート連携（買い物追加）
  - ウィジェット（今日の家事）
- **API契約の確認**: 既存Backend APIをそのまま使う前提でよいか、認証方式（Cookie/JWT）がモバイルに適合するかを確認

**成果物**:
- `mobile-screen.md`（機能一覧 + 優先度）
- `mobile-spec/`配下の各機能詳細仕様（既存のspec-driven開発スタイルを踏襲）

### Phase 1: 技術選定・基盤設計

Flutter周りの主要な論点を確定する。

| 項目 | 候補 | 備考 |
|---|---|---|
| 状態管理 | Riverpod / Bloc | Pinia慣れならRiverpodが概念的に近い |
| ルーティング | go_router | デファクト |
| HTTP/API | dio + retrofit / freezed + json_serializable | モデル自動生成 |
| 環境分離 | `--dart-define-from-file` | dev / stg / prd |
| CI/CD | GitHub Actions + Fastlane | 初期は手元ビルドでもOK |
| テスト | flutter_test + integration_test + mocktail | HwHubのテスト文化を踏襲 |

### Phase 2: リポジトリ作成 → Hello World

- リポジトリ: `ryokkon624/hw-hub-mobile`
- `flutter create` → 起動確認 → CI（lint + test + build）通過まで
- `hw-hub-manage` にIssue起票、commit/PR運用は既存と揃える（commit末尾に `(ryokkon624/hw-hub-manage#N)`）

### Phase 3: 共通基盤の構築

機能実装より前にやること。

1. **デザインシステムの移植**
   - `main.css`のトークン（color / spacing / typography / radius）をFlutterの`ThemeData` + 独自`AppTokens`クラスに翻訳
   - Claude Designを活用: Vue版のスクショ + `main.css`を渡してFlutterのTheme + 共通Widget（Button / Card / Input等）を生成
2. **認証基盤**
   - ログイン / ログアウト / トークン保持（flutter_secure_storage）/ 自動リフレッシュ / 未認証リダイレクト
3. **APIクライアント**
   - dioのインターセプタで認証ヘッダ・エラーハンドリング・ログを集約
4. **エラーハンドリング / トースト**
   - 全画面共通のSnackBar / Dialog
5. **ルーティング骨格**
   - 認証済み / 未認証のシェル分け

### Phase 4: 機能実装（スプリント分割）

優先度順に1機能=1スプリント程度で進める。HwHubのスクラムエージェント体制（SM/DEV/PO）はほぼそのまま流用可能。Flutter固有のツール（`flutter analyze`、`flutter test`等）を`#skills-changelog`に追加する程度の調整で運用できる見込み。

### Phase 5: ストア配信準備

後半に集中。

- アイコン / スプラッシュスクリーン
- プライバシーポリシー
- ストア掲載文
- TestFlight / Internal Testing
- 本番リリース

## デザインシステム方針

Vue版の`main.css`から大きく変えない方針。ただしFlutterはCSSを直接読めないため、**`main.css`のCSS変数をDartの定数 / ThemeDataに一回限り写経する作業**が発生する。一度移植すれば以降はDart側のみメンテ。

Claude Designに`main.css`を渡して「Flutter の ThemeData と AppColors / AppSpacing クラスに変換して」と依頼するのが効率的。

## 開発運用方針

- 既存HwHubのspec-driven開発スタイルを踏襲（詳細仕様 → 実装の順）
- backend-firstの考え方をモバイルでは「共通基盤先行 → 機能実装」に読み替え
- 既存パターンを確認してから新規実装
- commit運用・Issue管理・スクラムエージェント体制は既存をほぼ流用

---

## 未決事項（次に決めるもの）

以下、本計画を確定させる前に決めておきたい論点。

- [ ] **ターゲットOS**: iOS + Android両方 / 片方先行（先行する場合はどちら）
- [ ] **API認証方式**: 既存のCookie認証のままか、モバイル向けにJWT等への変更が必要か
- [ ] **BFFの要否**: 既存APIを直接叩くか、モバイル用にBFFを挟むか
- [ ] **状態管理ライブラリの確定**: Riverpod or Bloc
- [ ] **モバイル必須機能の確定**: `screen.md`を見て選別
- [ ] **モバイル新規機能の優先度**: プッシュ通知 / オフライン / 共有シート / ウィジェットのどれを初期スコープに含めるか
- [ ] **リリース時期の目標**: ストア配信までのざっくりした期間感
- [ ] **リポジトリ命名**: `hw-hub-mobile`でよいか

---

*v0.1 / 2026-04-27 時点*
