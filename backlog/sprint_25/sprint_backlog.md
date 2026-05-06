# Sprint 25 バックログ

**スプリント期間**: 2026-05-06 〜
**スプリントゴール**: Sprint 24レビュー指摘4件（フロントエンドバグ3件・バックエンドリファクタリング1件）を解消し、アナウンス管理機能を完成品質に引き上げる

---

## 対象 Issue 一覧

| Issue | タイトル | ラベル | ブランチ |
|-------|---------|-------|---------|
| #62 | AdminAnnouncementFormPage.vueのyupバリデーションメッセージがi18n対応されていない | bug | feature/57-admin-announcements（既存） |
| #63 | AdminAnnouncementFormPage.vueのタイトルに200バイト超の入力が可能 | bug | feature/57-admin-announcements（既存） |
| #64 | アナウンス管理画面の重要度バッジがダークモードで明るすぎる | bug | feature/57-admin-announcements（既存） |
| #65 | AnnouncementServiceのAnnouncementSummaryへの不要なマッピングを削除する | refactor | feature/57-admin-announcements（既存） |

> ⚠️ 全Issue共通: **既存ブランチ `feature/57-admin-announcements` へのコミット**

---

## #62: AdminAnnouncementFormPage.vueのyupバリデーションメッセージがi18n対応されていない

**GitHub Issue**: ryokkon624/hw-hub-manage#62
**ブランチ**: feature/57-admin-announcements（既存）
**コミット参照**: (ryokkon624/hw-hub-manage#62)
**対象リポジトリ**: hw-hub-frontend

### 発生事象

`AdminAnnouncementFormPage.vue` の yup の `required()` バリデーションメッセージが i18n 対応されていない。ja・es でも英語のメッセージが表示される。

### 参考

`hw-hub-frontend/src/domain/housework/houseworkForm.validation.ts` の実装パターンを参照すること。

### ユーザーストーリー

**As a** システム管理者
**I want to** アナウンス登録フォームのバリデーションメッセージを表示言語で確認したい
**So that** 日本語・スペイン語環境でも意味のあるエラーメッセージが表示される

### Acceptance Criteria

- [x] AC1: `AdminAnnouncementFormPage.vue` の全 yup バリデーションメッセージが i18n キーを使って表示される
- [x] AC2: ja・en・es の各言語でバリデーションメッセージが正しく表示される
- [x] AC3: 既存テストが全通過する

### 備考

- Sprint 24 Review 指摘（1件目）
- 参考: `houseworkForm.validation.ts` の実装パターン
- 依存関係: なし
- #63と同一ファイル変更のため、同一コミットでの対応推奨

---

## #63: AdminAnnouncementFormPage.vueのタイトルに200バイト超の入力が可能

**GitHub Issue**: ryokkon624/hw-hub-manage#63
**ブランチ**: feature/57-admin-announcements（既存）
**コミット参照**: (ryokkon624/hw-hub-manage#63)
**対象リポジトリ**: hw-hub-frontend

### 発生事象

`AdminAnnouncementFormPage.vue` のタイトル入力欄で200バイト以上の文字列が入力でき、バリデーションで防がれていない。フロントエンドのバリデーションで入力を制限し、APIコールが発生しないようにする必要がある。

### ユーザーストーリー

**As a** システム管理者
**I want to** タイトルの文字数制限をフォーム上で確認したい
**So that** 200バイトを超えた入力時にAPIコールされる前にエラーが表示される

### Acceptance Criteria

- [x] AC1: タイトル（ja/en/es）の各入力欄に200バイト上限のバリデーションが追加される
- [x] AC2: 200バイト超の入力時にエラーメッセージが表示され、登録・更新ボタンが無効化される
- [x] AC3: 既存テストが全通過する

### 備考

- Sprint 24 Review 指摘（2件目）
- 依存関係: #62と同一ファイル変更のため、同一コミットで対応推奨

---

## #64: アナウンス管理画面の重要度バッジがダークモードで明るすぎる

**GitHub Issue**: ryokkon624/hw-hub-manage#64
**ブランチ**: feature/57-admin-announcements（既存）
**コミット参照**: (ryokkon624/hw-hub-manage#64)
**対象リポジトリ**: hw-hub-frontend

### 発生事象

アナウンス管理画面（`/admin/announcements`）の重要度バッジがダークモードでもライトモードと同じ色になっており、ダークモード時に明るすぎる。

### 参考

問い合わせ管理のカテゴリバッジの実装を参考にすること。

### ユーザーストーリー

**As a** システム管理者
**I want to** ダークモードでもアナウンスの重要度を視認しやすい色で確認したい
**So that** 夜間・ダークモード環境でも重要度の色が適切に表示される

### Acceptance Criteria

- [x] AC1: 重要度バッジがダークモード対応のカラートークンを使用している
- [x] AC2: ダークモード時に重要度バッジの色が適切なコントラストで表示される
- [x] AC3: 既存テストが全通過する

### 備考

- Sprint 24 Review 指摘（3件目）
- 参考: 問い合わせ管理のカテゴリバッジ実装
- 依存関係: なし

---

## #65: AnnouncementServiceのAnnouncementSummaryへの不要なマッピングを削除する

**GitHub Issue**: ryokkon624/hw-hub-manage#65
**ブランチ**: feature/57-admin-announcements（既存）
**コミット参照**: (ryokkon624/hw-hub-manage#65)
**対象リポジトリ**: hw-hub-backend

### 概要

`AnnouncementService` が `List<AnnouncementModel>` / `AnnouncementModel` を `AnnouncementSummary` に変換してから Controller に返しているが、`AnnouncementSummary` は `AnnouncementModel` と全フィールド一致しており、変換はただのボイラープレートになっている。

### ユーザーストーリー

**As a** 開発者
**I want to** AnnouncementServiceが不要な変換なしにAnnouncementModelを直接返してほしい
**So that** コードがシンプルになり、HwHub規約に沿った設計になる

### Acceptance Criteria

- [x] AC1: `AnnouncementService` が `AnnouncementModel`（または `List<AnnouncementModel>`）を直接返すよう変更される
- [x] AC2: `AnnouncementController` で `AnnouncementModel` → DTO 変換を行うよう変更される
- [x] AC3: `AnnouncementSummary` Inner class が削除される（または AdminAnnouncementService 専用の役割がある場合は整理される）
- [x] AC4: 既存テストが全通過する

### 備考

- Sprint 24 Review 指摘（4件目）
- 依存関係: なし
- HwHub規約: Domain ModelはControllerへ返してよい。Application ServiceのInner class DTOは「複数のDomain Modelを束ねるとき」または「Modelの一部フィールドだけ公開したい時」に有効

---

## リスク・チャレンジ

### リスク

- #62と#63は同一ファイル（`AdminAnnouncementFormPage.vue`）を変更するため、両方を同一コミットで対応すること
- #65のリファクタリングはControllerへの変更も含む広範囲な修正のため、既存テストへの影響確認が必要
- 全4件が既存ブランチへのコミットのため、reviewerへのコミット範囲指定が必要（`git log main...[ブランチ名] --oneline` で今スプリントのコミットを特定）

### チャレンジ

- なし（今スプリントはSpring 24指摘の確実なクローズを優先）
