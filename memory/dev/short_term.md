# Dev 短期記憶

**スプリント**: Sprint 30
**最終更新**: 2026-05-13

---

## スプリントゴール

ログイン済みユーザー情報をRiverpodのauthStateで一元管理し、home・My Tasks画面の冗長なAPI呼び出しを排除することでモバイルアプリのパフォーマンスを向上させる

---

## 対象Issue（refactorラベル）

| Issue | 内容 | ブランチ |
|-------|------|---------|
| #81 | [mobile] ログイン済みユーザー情報をRiverpodで保持し、各画面の冗長なAPI呼び出しを解消する | `feature/67-mobile-my-tasks`（既存ブランチに継続コミット） |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`
コミット番号: `(ryokkon624/hw-hub-manage#81)`
PR: hw-hub-mobile PR #12（既存PR bodyをPATCHで更新）

---

## 承認済み実装方針

### 全体方針
- 単一Issue #81 を1コミットで完了させる
- ラベルは refactor なので「機能・振る舞いは不変、構造のみ改善」を厳守する（API呼び出し回数の削減は副次効果）
- 既存ブランチ `feature/67-mobile-my-tasks` に継続コミット（PRは既存 #12 を更新）

---

### #81 ログイン済みユーザー情報をRiverpodで保持

**改修方針（4ステップ）**:

#### Step 1: `AuthAuthenticated` に AuthUser を持たせる
- `lib/core/auth/auth_state.dart`
  - `AuthAuthenticated` に `final AuthUser user;` を追加（constコンストラクタ + 等価性のために `==` / `hashCode` を override しない方針：Riverpodの状態更新は識別子比較に依存しない `AsyncData` ラップで通知される）
  - `AuthUser` を `lib/features/auth/data/models/auth_user.dart` から **`lib/core/models/auth_user.dart`** に移動して core→features 依存を解消する（共有ドメインモデルの置き場所として `core/models/` が妥当）
  - 既存の import パスを一括置換

#### Step 2: `AuthNotifier` の改修
- `lib/core/auth/auth_notifier.dart`
  - `build()` 内のtoken復元時：tokenがあれば `dio.get('/api/users/me/profile')` を呼んで AuthUser を構築し、`AuthAuthenticated(user)` を返す
    - 失敗時（ネットワークエラー / 401）は `AuthUnauthenticated()` を返す（再ログインを促す）
    - dio は `ref.read(dioProvider)` で取得
  - `saveTokens` に `required AuthUser user` 引数を追加。保存後 `state = AsyncData(AuthAuthenticated(user))`
  - logout は変更不要

#### Step 3: 呼び出し元の修正
- `lib/features/auth/presentation/login/login_notifier.dart`
  - `saveTokens(accessToken: ..., refreshToken: ..., user: resp.user)` に変更
- `lib/features/auth/presentation/signup/signup_notifier.dart`
  - 同様に `user: resp.user` を渡す
- `lib/features/home/presentation/home_notifier.dart`
  - `repo.loadCurrentUserId()` 呼び出しを削除
  - `_load` の冒頭で `final auth = ref.read(authNotifierProvider).valueOrNull;` を取得し、`auth is AuthAuthenticated` なら `auth.user.userId` を使用
  - 未認証ケースは home_router の redirect で既に弾かれているが、念のため未取得時はエラーを投げる
- `lib/features/tasks/presentation/my_tasks_notifier.dart`
  - 同様に `repo.loadCurrentUserId()` 呼び出しを削除し authState から取得

#### Step 4: Repository から `loadCurrentUserId` を削除
- `lib/features/home/data/home_repository.dart`：interface / impl から削除
- `lib/features/tasks/data/my_tasks_repository.dart`：同上
- 既存テスト（`home_notifier_test.dart` / `my_tasks_notifier_test.dart` / `my_tasks_repository_test.dart`）を authState スタブに差し替える
- `home_mocks.dart` / `tasks_mocks.dart` の `@GenerateMocks` も再生成（`dart run build_runner build --delete-conflicting-outputs`）

---

### テスト方針（TDD: RED → GREEN → REFACTOR）

| 対象 | テスト |
|------|--------|
| `AuthNotifier.build()` token 復元時 `/me` 呼び出し成功 → `AuthAuthenticated(user)` を返す | 新規追加（必須） |
| `AuthNotifier.build()` token 復元時 `/me` 呼び出し失敗 → `AuthUnauthenticated()` を返す | 新規追加（必須） |
| `AuthNotifier.saveTokens(user: ...)` → state が `AuthAuthenticated(user)` になる | 既存テストを更新 |
| `LoginNotifier.submit` 成功時 `saveTokens` に `resp.user` が渡る | 既存テストを更新 |
| `SignupNotifier.submit` 即ログイン成功時 `saveTokens` に `resp.user` が渡る | 既存テストを更新 |
| `HomeNotifier._load` が `authNotifierProvider` から userId を取得して使う | 既存テスト更新（authState を AuthAuthenticated(user) で override） |
| `MyTasksNotifier._load` 同上 | 既存テスト更新 |
| `HomeRepository.loadCurrentUserId` テスト削除 | テストファイル更新 |
| `MyTasksRepository.loadCurrentUserId` テスト削除 | テストファイル更新 |

---

### 変更ファイル一覧

**新規/移動**:
- 移動: `lib/features/auth/data/models/auth_user.dart` → `lib/core/models/auth_user.dart`

**編集**:
- `lib/core/auth/auth_state.dart`（AuthAuthenticated に user 追加）
- `lib/core/auth/auth_notifier.dart`（build時 `/me` 呼び出し・saveTokens シグネチャ変更）
- `lib/features/auth/data/models/login_response.dart`（import path変更）
- `lib/features/auth/data/models/register_response.dart`（import path変更）
- `lib/features/auth/presentation/login/login_notifier.dart`（saveTokens に user 渡す）
- `lib/features/auth/presentation/signup/signup_notifier.dart`（同上）
- `lib/features/home/data/home_repository.dart`（loadCurrentUserId 削除）
- `lib/features/home/presentation/home_notifier.dart`（authState から userId 取得）
- `lib/features/tasks/data/my_tasks_repository.dart`（loadCurrentUserId 削除）
- `lib/features/tasks/presentation/my_tasks_notifier.dart`（authState から userId 取得）

**自動生成（再ビルド）**:
- `test/features/home/home_mocks.mocks.dart`
- `test/features/tasks/tasks_mocks.mocks.dart`

**テスト編集**:
- `test/core/auth/auth_notifier_test.dart`（build時 `/me` 呼び出しテスト追加）
- `test/features/auth/presentation/login/login_notifier_test.dart`（user引数検証）
- `test/features/auth/presentation/signup/signup_notifier_test.dart`（user引数検証）
- `test/features/home/presentation/home_notifier_test.dart`（authState スタブ）
- `test/features/tasks/presentation/my_tasks_notifier_test.dart`（authState スタブ）
- `test/features/home/data/home_repository_test.dart`（loadCurrentUserId テスト削除）
- `test/features/tasks/data/my_tasks_repository_test.dart`（同上）

---

## 懸念点・確認事項（承認済み）

- AuthUser を `core/models/` に移動することで core→features 依存を避ける（採用：`core/auth/` ではなく `core/models/` が共有ドメインモデルの正規置き場）
- `/me` 呼び出し失敗時は AuthUnauthenticated にフォールバック（採用）
- AC4 で `my_tasks_notifier.dart` の `loadCurrentUserId()` を削除する範囲は Repository から関数自体を削除するところまで（Sprint 29で追加したばかりだが、refactor の本旨に従って削除）

---

## コミット前チェックリスト

- [ ] `dart format .`
- [ ] `flutter analyze`（警告ゼロ）
- [ ] `flutter test`（全グリーン）
- [ ] `git push -u origin feature/67-mobile-my-tasks`
- [ ] PR #12 body 更新（SMが実施）

---

## 作業ルール

- コミットメッセージ形式: `refactor: ログイン済みユーザー情報をauthStateで保持 (ryokkon624/hw-hub-manage#81)`
- [DEV] プレフィックスをDiscord投稿に必ずつける
- 作業スレッドID: `1503967750387666944`
- PRはSMが行う。DEVはpushまでが担当

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #81 ログイン済みユーザー情報をauthStateで保持 | 完了 ✅ |

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
