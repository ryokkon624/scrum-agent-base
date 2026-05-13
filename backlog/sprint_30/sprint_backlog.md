# Sprint 30 バックログ

**スプリント番号**: Sprint 30
**作成日**: 2026-05-13
**ブランチ**: feature/67-mobile-my-tasks（既存ブランチに継続コミット）
**対象PR**: hw-hub-mobile PR #12（既存PR bodyをPATCHで更新）

---

## スプリントゴール

ログイン済みユーザー情報をRiverpodのauthStateで一元管理し、home・My Tasks画面の冗長なAPI呼び出しを排除することでモバイルアプリのパフォーマンスを向上させる

---

## 対象Issue

### #81: [mobile] ログイン済みユーザー情報をRiverpodで保持し、各画面の冗長なAPI呼び出しを解消する

**ラベル**: refactor
**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/81
**ブランチ**: feature/67-mobile-my-tasks

#### ユーザーストーリー

**As a** モバイルアプリユーザー
**I want to** アプリが必要最小限のAPI呼び出しで動作してほしい
**So that** 画面表示が速くなり、不要なサーバー負荷が減る

#### Acceptance Criteria

- [x] AC1: ログイン成功時、`LoginResponse` に含まれる `AuthUser`（userId / email / displayName）が `AuthAuthenticated` state に保持される
- [x] AC2: アプリ起動時（token復元時）、`/me` APIを1回呼び出してユーザー情報を取得し、stateに保持する
- [x] AC3: `home_notifier.dart` の `loadCurrentUserId()` API呼び出しが削除され、`authNotifierProvider` からuserIdを取得するよう変更される
- [x] AC4: `my_tasks_notifier.dart` の `loadCurrentUserId()` API呼び出しが削除され、`authNotifierProvider` からuserIdを取得するよう変更される

#### 背景・問題

ログイン時、バックエンドは `LoginResponse` の中に `userId` / `email` / `displayName` を返している（`AuthUser`）。しかし現状の `login_notifier.dart` はトークンのみを保存し、ユーザー情報を破棄している。`AuthAuthenticated` 状態もユーザー情報を一切持っていない。

その結果、以下の2画面でユーザーIDが必要になるたびに `loadCurrentUserId()` APIを個別に発行している：

- `lib/features/home/presentation/home_notifier.dart`
- `lib/features/tasks/presentation/my_tasks_notifier.dart`

#### 改修スコープ

| ファイル | 変更内容 |
|---|---|
| `lib/core/auth/auth_state.dart` | `AuthAuthenticated` に `AuthUser user` フィールドを追加 |
| `lib/core/auth/auth_notifier.dart` | token復元時に `/me` APIを呼び出してuserInfoをstateに保持。`saveTokens` に `AuthUser` 引数を追加 |
| `lib/features/auth/presentation/login/login_notifier.dart` | `saveTokens` 呼び出し時に `resp.user` を渡す |
| `lib/features/home/presentation/home_notifier.dart` | `loadCurrentUserId()` を削除し、`authNotifierProvider` からuserIdを取得 |
| `lib/features/tasks/presentation/my_tasks_notifier.dart` | 同上 |

#### 備考

- 優先順位の根拠：API呼び出しの冗長性解消・パフォーマンス改善
- 依存関係：なし
- ユーザー情報の永続化はアプリ起動時に `/me` APIを1回呼ぶ方式で対応する。secure_storageに保存する方式は、Web側でプロフィールを変更後にアプリを起動した際に古い情報を使い続けるリスクがあるため採用しない

---

## リスク・チャレンジ

### リスク

- `AuthAuthenticated` stateの変更が認証フロー全体（ログイン・ログアウト・token復元）に波及する可能性
- token復元時の `/me` API呼び出しでエラーが発生した場合のハンドリング（未認証状態へのフォールバック）
- 既存ブランチへの追加コミットのため、reviewerへのコミット範囲指定が必須（sprint-start-commitを特定すること）

### チャレンジ

- Claudeモデルの最新バージョン確認（現在: Sonnet 4.6 / Opus 4.7。変更なし）
- reviewerのDiscord投稿継続監視（18スプリント連続成功中）
- **今スプリントから新規追加: Sprint ReviewのHTMLファイル生成（⑥b）をDEVが担当する**
