# Sprint 64 バックログ

## スプリントゴール

モバイルの認証体験を改善し、開発参入コストを下げるドキュメントを整備する

---

## 対象Issue

| Issue | タイトル | ラベル | SP | ブランチ |
|-------|---------|--------|----|---------|
| #179 | [mobile] AuthInterceptorにトークンリフレッシュ処理を実装する | feature | 3 | feature/179-auth-interceptor-token-refresh |
| #180 | README.mdへのhw-hub-mobile情報追加とmobile_README.mdの更新 | documentation | 1 | docs/180-mobile-readme |

---

## Issue #179: [mobile] AuthInterceptorにトークンリフレッシュ処理を実装する

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/179
**ブランチ**: `feature/179-auth-interceptor-token-refresh`
**ラベル**: feature
**リポジトリ**: hw-hub-mobile

### ユーザーストーリー

**As a** モバイルアプリ利用者  
**I want to** アクセストークンが期限切れになっても自動で再認証してほしい  
**So that** セッション切れを意識せず継続して操作できる

### Acceptance Criteria

- [x] AC1: AuthInterceptorにあった `TODO: POST /api/auth/refresh バックエンド実装後に追加` のコメントが削除されている
- [x] AC2: POST /api/auth/refresh を使ったトークンリフレッシュ処理が実装されている
- [x] AC3: アクセストークン期限切れ（401エラー）時にリフレッシュを自動実行し、元のリクエストをリトライする
- [x] AC4: リフレッシュトークンも期限切れの場合はログアウト処理を行い、ログイン画面に遷移する

### 備考

- 優先順位の根拠：バックエンドのリフレッシュAPIが実装済みのため、モバイル側の対応が残タスクになっている
- 依存関係：バックエンド（POST /api/auth/refresh）実装済み

### ⚠️ 実装上の注意（Sprint 58教訓）

- **logout()の順序を厳守**: `state = AuthUnauthenticated()` → `ref.invalidate()` の順。  
  invalidate前にstateが未認証でないと、AuthInterceptorが401を再度リフレッシュ呼び出しとして処理し、logout()が無限ループになる（Sprint 58 #172で発生）
- **saveTokens()後にinvalidateする**: login成功後は`saveTokens()`完了後に`ref.invalidate(householdNotifierProvider)`を実行する。トークンクリア後にinvalidateするとAPIがトークンなしで呼ばれエラー状態が継続する（Sprint 58 #158で発生）
- リフレッシュ失敗時（401）のログアウト処理でも同様の順序を守ること

---

## Issue #180: README.mdへのhw-hub-mobile情報追加とmobile_README.mdの更新

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/180
**ブランチ**: `docs/180-mobile-readme`
**ラベル**: documentation
**リポジトリ**: hw-hub-mobile（README.mdは全リポジトリ共通）

### 前提

README.mdはhw-hub-xxx系全リポジトリ共通である。※scrum-agent-baseは対象外  
各リポジトリごとに異なるのはxxx_README.md。

### ユーザーストーリー

**As a** 開発者  
**I want to** hw-hub-mobileのREADMEが整備されてほしい  
**So that** モバイル開発の参入コストを下げ、規約に沿った実装ができる

### Acceptance Criteria

- [x] AC1: README.md（全リポジトリ共通）にhw-hub-mobileのセクションが追加されている
  - 技術スタック（Flutter / Dart / Riverpod / go_router / Dio等）
  - リポジトリ概要・用途
  - セットアップ手順（flutter pub get 等）
- [x] AC2: mobile_README.mdにmobile-conventionsスキルから以下の重要事項が記載されている
  - ディレクトリ構成（feature-first構成）
  - アーキテクチャ層の説明
  - 状態管理の方針（Riverpod）
  - テスト方針
  - i18n方針

### 備考

- `.claude\skills\mobile-conventions` スキルを参照し、mobile_README.mdに含めるべきものは含めること
- 優先順位の根拠：hw-hub-mobileの開発が進んでいるが、READMEが未整備
- 依存関係：なし

---

## リスク・チャレンジ

### リスク

1. **#179 AuthInterceptorの401ループ**: Sprint 58でAuthInterceptorの401リフレッシュ処理に無限ループが発生した実績あり。logout()内のstate設定とref.invalidate()の順序を厳守する
2. **#179 並列リクエスト時のリフレッシュ競合**: 複数リクエストが同時に401を返した場合、リフレッシュが複数回呼ばれるリスク。フラグ等での排他制御が必要か検討

### チャレンジ

- なし（新モデルリリースなし）
