# Sprint 50 バックログ

**スプリントゴール**: モバイルアプリのコード品質を向上させる（flutter analyzeのlint警告ゼロ化・テストカバレッジ95%以上達成）

**期間**: 2026-05-20 〜

---

## 対象Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #154 | [mobile] flutter analyzeでlint警告が11件発生している | bug | - |
| #153 | [mobile] 単体テストのカバレッジを上げたい | refactor | - |

---

## Issue #154: [mobile] flutter analyzeでlint警告が11件発生している

**GitHub**: https://github.com/ryokkon624/hw-hub-manage/issues/154  
**ブランチ**: `fix/154-flutter-analyze`  
**ラベル**: bug

### 発生事象

`flutter analyze` を実行すると Warning が計11件検出されている。

- `unused_import`：7件（テストファイル4ファイルで未使用の import 文が残存）
- `deprecated_member_use`：2件（`invitation_section.dart` で非推奨の `.withOpacity()` を使用）
- `unused_element`：1件（`app_router.dart` で未参照の宣言 `_P` が存在）
- `unused_catch_clause`：1件（`google_link_section.dart` で catch 節の変数 `e` が未使用）

※ `auth_interceptor.dart:88` の TODO は POST /api/auth/refresh のバックエンド実装待ちのため修正対象外とする。

### ユーザーストーリー

**As a** 開発チーム  
**I want to** `flutter analyze` の警告を0件にしたい  
**So that** コードの品質を保ち、意図しないコードが混入しないようにしたい

### Acceptance Criteria

- [x] AC1: `flutter analyze` を実行して Warning が **0件** になること（auth_interceptor.dart の TODO コメントは除外）
- [x] AC2: `unused_import` 7件を削除すること（対象テストファイル4ファイル）
- [x] AC3: `unused_element` 1件を修正すること（`app_router.dart` の `_P` を削除）
- [x] AC4: `unused_catch_clause` 1件を修正すること（`google_link_section.dart` の catch 節から変数 `e` を除去）
- [x] AC5: `deprecated_member_use` 2件を修正すること（`invitation_section.dart` の `.withOpacity()` を `.withValues()` に変更）
- [x] AC6: 既存テストが全て pass すること

### 原因

lint 解析が検出した不要コード・非推奨 API 使用が残存している。

### 改修方針

各警告を個別に機械的に修正する。

### 備考

- 依存関係：なし
- `auth_interceptor.dart:88` の TODO は POST /api/auth/refresh 実装後に対応予定

---

## Issue #153: [mobile] 単体テストのカバレッジを上げたい

**GitHub**: https://github.com/ryokkon624/hw-hub-manage/issues/153  
**ブランチ**: `refactor/153-test-coverage`  
**ラベル**: refactor

### ユーザーストーリー

**As a** 開発チーム  
**I want to** mobileアプリのテストカバレッジを95%以上にしたい  
**So that** コード品質を客観的に担保し、リグレッションを早期検知できる

### Acceptance Criteria

- [x] AC1: `coverage.ps1` を実行した結果、全体のラインカバレッジが **95% 以上** になること（95.1%: 7676/8071）
- [x] AC2: 以下の優先順位でウィジェットテストを追加すること（カバレッジが特に低いため）
  1. `notifications/presentation/widgets`（現状 45.9%）
  2. `household_settings/presentation/widgets`（現状 59.6%）
  3. `shopping/presentation/widgets`（現状 72.5%・601行と絶対量も多い）
- [x] AC3: 上記3箇所対応後、`coverage.ps1` で全体カバレッジを再確認し、95% 未満の場合は他の低カバレッジ箇所に追加でテストを書くこと
- [x] AC4: 既存テストが全て pass すること（`flutter test` でエラーなし）（1235件全pass）

### 備考

- 依存関係：なし
- lcov_exclude.txt の除外設定は実施済み（現状カバレッジ 74.2%）
- テスト対象外コード（providers, data/models, 生成ファイル等）は lcov_exclude.txt で管理済み
