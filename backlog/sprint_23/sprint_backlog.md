# Sprint 23 バックログ

**スプリント期間**: 2026-05-05 〜
**スプリントゴール**: フロントエンドのコード品質向上 — デッドコード削除・マジックストリングの定数化・アナウンスバナーの子ルート対応

---

## 対象 Issue 一覧

| Issue | タイトル | ラベル | ブランチ |
|-------|---------|-------|---------|
| #55 | フロントエンドの未使用deleteHousework関連コードを削除したい | bug | fix/55-delete-unused-deletehousework（新規） |
| #58 | AnnouncementBanner.vueのseverity文字列をcode.constants.tsで定数参照にする | refactor | feature/56-announcement-banner（既存） |
| #59 | router/index.tsのfeatureScopeをcode.constants.tsで定数参照にする | refactor | feature/56-announcement-banner（既存） |
| #60 | router/index.tsの子ルートにfeatureScopeを引き継ぐ | bug | feature/56-announcement-banner（既存） |

---

## #55: フロントエンドの未使用deleteHousework関連コードを削除したい

**GitHub Issue**: ryokkon624/hw-hub-manage#55
**ブランチ**: fix/55-delete-unused-deletehousework（新規）
**コミット参照**: (ryokkon624/hw-hub-manage#55)

### 発生事象

Sprint 21（Issue #50）でバックエンドの `HouseworkController.deleteHousework` エンドポイントを削除したが、フロントエンドの以下のコードが残存している。

- `houseworkApi.deleteHousework()`（`hw-hub-frontend/src/api/houseworkApi.ts`）
- `houseworkStore.delete()`（`hw-hub-frontend/src/stores/houseworkStore.ts`）

これらはどのViewからも呼ばれておらず、かつ存在しないバックエンドエンドポイントを呼び出すデッドコードになっている。

### ユーザーストーリー

**As a** 開発者
**I want to** 存在しないエンドポイントを呼び出すデッドコードを削除したい
**So that** コードベースの品質を維持し、誤って呼び出されるリスクをなくしたい

### Acceptance Criteria

- [x] AC1: `houseworkApi.deleteHousework()` が `houseworkApi.ts` から削除される
- [x] AC2: `houseworkStore.delete()` が `houseworkStore.ts` から削除される
- [x] AC3: 関連するテストコード（`houseworkApi.spec.ts` / `houseworkStore.spec.ts` 等）も併せて削除される
- [x] AC4: 全テストが通過する

### 備考

- Sprint 21 Sprint Review（Issue #50）にてユーザーが指摘
- 依存関係: #50（deleteHouseworkエンドポイント削除）完了済み

---

## #58: AnnouncementBanner.vueのseverity文字列をcode.constants.tsで定数参照にする

**GitHub Issue**: ryokkon624/hw-hub-manage#58
**ブランチ**: feature/56-announcement-banner（既存ブランチへの追加コミット）
**コミット参照**: (ryokkon624/hw-hub-manage#58)

### 概要

`AnnouncementBanner.vue` の `switch` 文にて `'ERROR'`、`'WARN'` 等の severity 文字列がべた書きされている。
`C:\work\hw-hub\hw-hub-frontend\src\constants\code.constants.ts` に定数として定義し、定数参照に変更する。横展開も含めること。

### ユーザーストーリー

**As a** 開発者
**I want to** severity の文字列値を code.constants.ts で一元管理したい
**So that** 値の変更や追加が一箇所で完結し、typo によるバグを防げる

### Acceptance Criteria

- [x] AC1: `code.constants.ts` に `ANNOUNCEMENT_SEVERITY`（INFO / WARN / ERROR）が定数として定義される
- [x] AC2: `AnnouncementBanner.vue` の severity ベタ書き箇所が定数参照に変更される
- [x] AC3: フロントエンド内の他ファイルで `ANNOUNCEMENT_SEVERITY` に該当する severity 値をベタ書きしている箇所があれば同様に定数参照に変更する（featureScope値の横展開は #59 担当）
- [x] AC4: 既存テストが全通過する

### 備考

- Sprint 22 Review 指摘（2件目）
- 対象リポジトリ: hw-hub-frontend
- ブランチ: feature/56-announcement-banner
- コミット参照: (ryokkon624/hw-hub-manage#58)
- 依存関係: #59（featureScope定数化）と並行実装可能

---

## #59: router/index.tsのfeatureScopeをcode.constants.tsで定数参照にする

**GitHub Issue**: ryokkon624/hw-hub-manage#59
**ブランチ**: feature/56-announcement-banner（既存ブランチへの追加コミット）
**コミット参照**: (ryokkon624/hw-hub-manage#59)

### 概要

`hw-hub-frontend\src\router\index.ts` の `meta.featureScope` に `'ALL'`、`'HOME'`、`'SHOPPING'` 等の AnnouncementScope（code_type: 0027）の値がべた書きされている。
`C:\work\hw-hub\hw-hub-frontend\src\constants\code.constants.ts` に `ANNOUNCEMENT_SCOPE` として定数定義し、定数参照に変更する。横展開も含めること。

### ユーザーストーリー

**As a** 開発者
**I want to** featureScope の文字列値を code.constants.ts で一元管理したい
**So that** バックエンドの m_code 値との整合性を一箇所で管理でき、変更漏れを防げる

### Acceptance Criteria

- [x] AC1: `code.constants.ts` に `ANNOUNCEMENT_SCOPE`（ALL / HOME / HW_ASSIGN / HW_TASK / HW_CONF / SHOPPING / CONF_ACCT / CONF_HH / CONF_APP / NOTIFY / INQUIRY / ADMIN）が定数として定義される
- [x] AC2: `router/index.ts` の featureScope ベタ書き箇所が定数参照に変更される
- [x] AC3: フロントエンド内の他ファイルで `ANNOUNCEMENT_SCOPE` に該当する featureScope 値をベタ書きしている箇所があれば同様に定数参照に変更する（severity値の横展開は #58 担当）
- [x] AC4: 既存テストが全通過する

### 備考

- Sprint 22 Review 指摘（3件目）
- 対象リポジトリ: hw-hub-frontend
- ブランチ: feature/56-announcement-banner
- コミット参照: (ryokkon624/hw-hub-manage#59)
- 依存関係: #58（severity定数化）と並行実装可能。#60（子ルートfeatureScope引継ぎ）は本Issueの実装後に着手推奨

---

## #60: router/index.tsの子ルートにfeatureScopeを引き継ぐ

**GitHub Issue**: ryokkon624/hw-hub-manage#60
**ブランチ**: feature/56-announcement-banner（既存ブランチへの追加コミット）
**コミット参照**: (ryokkon624/hw-hub-manage#60)

### 発生事象

`hw-hub-frontend\src\router\index.ts` にて、親ルートに `meta.featureScope` が設定されているが、子ルートには設定されていないケースがある。
例: `path: shopping` には `featureScope: 'SHOPPING'` が設定されているが、`path: shopping/new` には未設定。
アナウンスバナーの画面フィルタリングが子ルートで正しく動作するよう、上位ルートの featureScope を引き継ぐ形で設定する。

### ユーザーストーリー

**As a** アプリユーザー
**I want to** 特定機能のサブ画面でも適切なアナウンスバナーを表示したい
**So that** 買い物リストの新規追加画面など子ルートでも関連するお知らせを見落とさない

### Acceptance Criteria

- [x] AC1: `router/index.ts` の全ルートを確認し、親ルートに `featureScope` が設定されているにもかかわらず子ルートに未設定の箇所を全て洗い出す
- [x] AC2: 該当する子ルート全てに親ルートと同じ `featureScope` を設定する
- [x] AC3: `AnnouncementBanner.vue` の画面フィルタリングが子ルートでも正しく動作することを確認する（visibleForRoute を featureScope ベースに変更）
- [x] AC4: 既存テストが全通過する

### 備考

- Sprint 22 Review 指摘（4件目）
- 対象リポジトリ: hw-hub-frontend
- ブランチ: feature/56-announcement-banner
- コミット参照: (ryokkon624/hw-hub-manage#60)
- 依存関係: #59（featureScope定数化）実装後に着手推奨

---

## 実装順序（推奨）

1. **#55** — 独立した新規ブランチ。他Issueと依存関係なし
2. **#58 / #59** — feature/56-announcement-banner ブランチ。同じ `code.constants.ts` を編集するためコンフリクト注意。順次実装推奨（#58 → #59）
3. **#60** — #59 完了後に着手。featureScope定数化済みの定数を使って子ルートに設定する

## リスク

- #58・#59・#60 は同一ブランチ（feature/56-announcement-banner）への追加コミット。reviewerへの指示はコミット範囲を `git diff <sprint-start-commit>^...HEAD` で指定すること
- #58 と #59 が同じ `code.constants.ts` を編集するため、順次実装（#58完了後に#59）が安全
