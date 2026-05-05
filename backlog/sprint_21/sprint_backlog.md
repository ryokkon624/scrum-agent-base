# Sprint 21 バックログ

**スプリント期間**: 2026-05-04 〜
**スプリントゴール**: ダークモード設定のDB永続化によるマルチデバイス体験向上と、deleteHouseworkエンドポイントのセキュリティ修正（認可チェック追加または廃止）を実現する

---

## 対象Issue

| Issue | タイトル | SP | ブランチ |
|-------|---------|-----|---------|
| #54 | Darkモードの設定値をDBに保持したい | 5 | feature/54-dark-mode-db |
| #50 | HouseworkController.deleteHouseworkに認可チェックを追加したい | 2 | fix/50-delete-housework-auth |

**⚠️ 注意**: #54は hw-hub-database / hw-hub-backend / hw-hub-frontend の3リポジトリにまたがる。#50は実装前にフロントエンドでのAPI使用状況を調査し、使用されていない場合はエンドポイント削除、使用されている場合は認可チェック追加のパスを選択する。

---

## Issue #54: Darkモードの設定値をDBに保持したい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/54
**ラベル**: feature
**SP**: 5
**ブランチ**: `feature/54-dark-mode-db`（新規）

---

### ユーザーストーリー

**As a** アプリを複数デバイスで利用するユーザー
**I want to** ダークモードの設定をDBに保存したい
**So that** ログイン後にどのデバイスでも同じテーマ設定が自動的に反映されるようにしたい

### Acceptance Criteria

- [x] AC1: hw-hub-databaseのFlywayマイグレーションに、`m_code`へThemeMode区分値（`code_type: '0026'`、`code_type_name_en: 'ThemeMode'`）として DARK / LIGHT / SYSTEM の3レコードが登録される
- [x] AC2: hw-hub-backendに `ThemeMode` enum（`CodeEnum` 実装）が作成され、DARK / LIGHT / SYSTEM の3値を持つ
- [x] AC3: hw-hub-databaseのFlywayマイグレーションに、`m_user` テーブルへ `theme_mode` カラム（VARCHAR、NOT NULL、DEFAULT `'SYSTEM'`）を追加するSQLが存在する
- [x] AC4: バックエンドにテーマモード更新APIが存在し、ログイン中のユーザーの `theme_mode` を DARK / LIGHT / SYSTEM のいずれかで保存できる
- [x] AC5: ログイン認証後、バックエンドのレスポンスに `themeMode` が含まれ、フロントエンドはこの値でLocal Storageの設定を上書き同期する
- [x] AC6: 未ログイン時はLocal Storageの値をそのまま使用し続ける
- [x] AC7: テーマ変更操作時、フロントエンドはLocal Storage更新と同時にAC4のAPIを呼び出してDBにも保存する

### 備考

- 依存関係：#43（Darkモード対応。Local Storage制御はここで実装済み）
- `m_code` の最大 `code_type` は現在 `0025`（2026-05-04時点）
- 実装対象リポジトリ: hw-hub-database / hw-hub-backend / hw-hub-frontend（3リポジトリまたぎ）
- コミット参照: `(ryokkon624/hw-hub-manage#54)`

---

## Issue #50: HouseworkController.deleteHouseworkに認可チェックを追加したい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/50
**ラベル**: bug
**SP**: 2
**ブランチ**: `fix/50-delete-housework-auth`（新規）

---

### 発生事象

`HouseworkController.deleteHousework` は認証済みであれば誰でも任意の家事マスタを削除できる状態になっている。ログインユーザーが当該世帯のメンバーであることを検証していない。

Sprint 17（Issue #41）のセキュリティコードレビューにて発見。リファクタリング前のmainブランチにも同様の欠如が存在していた既存問題。

### ユーザーストーリー

**As a** 家事アプリのユーザー
**I want to** 自分の世帯の家事マスタしか操作できないようにしたい
**So that** 他の世帯のデータを誤って・意図的に削除されるリスクをなくしたい

### Acceptance Criteria

- [x] AC1: フロントエンドで `deleteHousework` APIが使用されているか確認する
- [x] AC2: フロントエンドで使用されていない場合、`HouseworkController.deleteHousework` エンドポイントおよび対応するサービス・マッパーを削除する
- [x] AC3: フロントエンドで使用されている場合、`deleteHousework` の呼び出し元Controllerで `@CurrentUserId Long userId` を受け取り、サービス層に渡す（→ 未使用のためスキップ）
- [x] AC4: フロントエンドで使用されている場合、`HouseworkService.deleteHousework` でログインユーザーが当該世帯のメンバーであることを検証し、メンバー外であれば403を返す（→ 未使用のためスキップ）
- [x] AC5: 対応する Spock テストが通過する（削除に伴いテストも削除、全体1024+件通過）

### 原因

認可チェックが欠如しているため、他の世帯の家事マスタを削除できてしまうセキュリティリスクがある。

### 改修方針

まずフロントエンドで当該APIが使用されているか確認する。houseworkは有効開始・終了日を持ち、削除する際は有効終了日をシステム日付より前にする運用のため、削除APIが実際には不要な可能性がある。使用されていなければエンドポイントを削除し、使用されていれば認可チェックを追加する。

### 備考

- 依存関係：なし
- 実装対象リポジトリ: hw-hub-backend（調査はhw-hub-frontendも含む）
- コミット参照: `(ryokkon624/hw-hub-manage#50)`
