# Dev 短期記憶

**スプリント**: Sprint 23
**最終更新**: 2026-05-05

---

## スプリントゴール

フロントエンドのコード品質向上 — デッドコード削除・マジックストリングの定数化・アナウンスバナーの子ルート対応

---

## Sprint 23 コミット開始点（reviewerへの差分指示用）

- **ブランチ**: `feature/56-announcement-banner`（hw-hub-frontend）
- **Sprint 23 開始時の HEAD**: `5c64d47`（Sprint 22 最終コミット）
- **reviewer 指示時の差分範囲**: `git diff 5c64d47..HEAD`

---

## 実装方針（承認済み・2026-05-05）

> **りょこさん承認結果**:
> - Q1（#60設計判断）: **案A 採用**（`visibleForRoute` を `route.meta.featureScope` ベースに変更）
> - Q2（admin配下）: **ADMIN配下の子ルートには featureScope を設定しない**（参照できる人が限られているため例外扱い）
> - Q3（テスト内のベタ書き）: **定数参照に置換する**

### 共通方針

- 対象リポジトリは hw-hub-frontend のみ
- TDD：Store / utils はテスト先行（Vitest）
- View / Component の見た目変更のみはテスト不要
- 型定義は `as const` + `(typeof X)[keyof typeof X]` パターンで code.constants.ts に追加

---

### Issue #55: フロントエンド未使用 deleteHousework コード削除

**ブランチ**: `fix/55-delete-unused-deletehousework`（新規・main から派生）
**コミット参照**: `(ryokkon624/hw-hub-manage#55)`

#### 削除対象

| ファイル | 削除箇所 |
|---------|---------|
| `src/api/houseworkApi.ts` | `deleteHousework(houseworkId: number): Promise<void>` メソッド（L62-64） |
| `src/stores/houseworkStore.ts` | `actions.delete(houseworkId)` メソッド全体（L156-174） |
| `src/__tests__/api/houseworkApi.spec.ts` | `describe('deleteHousework', ...)` ブロック（L254-263） |
| `src/__tests__/stores/houseworkStore.spec.ts` | `deleteHousework: vi.fn()` モック行（L24）, `mockedHouseworkApi.deleteHousework.mockResolvedValue()` を含む `it('delete: ...')` ブロック（L205-222） |

#### 確認済み事項

- フロントエンド全体で `houseworkStore.delete` を呼んでいる View / Component は **0件**
- `houseworkApi.deleteHousework` を直接呼んでいる箇所も **テスト以外なし**
- バックエンド `DELETE /api/houseworks/{id}` は Sprint 21 で削除済み

#### 手順

1. RED: テストファイルから対象ブロックを削除（先に削除すると delete 関数が「未使用」になる）
2. GREEN: 本体側 `deleteHousework` / `delete` を削除
3. `npm run test:unit` で全件パス確認
4. `npm run format` 後コミット & push

---

### Issue #58: AnnouncementBanner.vue の severity 文字列を定数化

**ブランチ**: `feature/56-announcement-banner`（既存への追加コミット）
**コミット参照**: `(ryokkon624/hw-hub-manage#58)`

#### 1. `src/constants/code.constants.ts` への追加

```ts
// CODE_TYPE に追加
ANNOUNCEMENT_SCOPE: '0027',     // AnnouncementScope (#59 で追加するが先に入れて衝突回避)
ANNOUNCEMENT_SEVERITY: '0028',  // AnnouncementSeverity

// 末尾に追加
/**
 * 0028: アナウンス重要度 (AnnouncementSeverity)
 */
export const ANNOUNCEMENT_SEVERITY = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const
export type AnnouncementSeverityCode =
  (typeof ANNOUNCEMENT_SEVERITY)[keyof typeof ANNOUNCEMENT_SEVERITY]
```

#### 2. 横展開（severity ベタ書きを定数参照に）

| ファイル | 変更内容 |
|---------|---------|
| `src/components/announcement/AnnouncementBanner.vue` | 3関数（`bannerClass` / `severityIcon` / `severityIconClass`）の `'ERROR'` / `'WARN'` を `ANNOUNCEMENT_SEVERITY.ERROR` / `.WARN` に置換。引数型を `string` → `AnnouncementSeverityCode` に強化 |
| `src/domain/announcement/announcement.model.ts` | `severity: string` → `severity: AnnouncementSeverityCode` に強化 |
| `src/api/announcementApi.ts` | `AnnouncementDto.severity: string` はAPI契約のため `string` のまま、`toModel` で `as AnnouncementSeverityCode` キャスト |
| テスト `src/__tests__/api/announcementApi.spec.ts` | severity リテラル箇所があれば確認（現状 `'WARN'` 等が含まれる場合は定数参照に） |
| テスト `src/__tests__/stores/announcementStore.spec.ts` | severity を持つテストデータを定数参照に |

#### 確認

- `grep -rn "'INFO'\|'WARN'\|'ERROR'"` の結果：announcementバナー以外のヒットなし → severity 横展開は AnnouncementBanner.vue + テストのみ
- View/Component の見た目変更のみ → AnnouncementBanner.vue 自体のテスト追加は不要（既存 spec のメンテのみ）

---

### Issue #59: router/index.ts の featureScope を定数化

**ブランチ**: `feature/56-announcement-banner`（既存への追加コミット）
**コミット参照**: `(ryokkon624/hw-hub-manage#59)`

#### 1. `src/constants/code.constants.ts` への追加

```ts
/**
 * 0027: アナウンス対象スコープ (AnnouncementScope)
 * code_value は VARCHAR(10) 制限のため短縮形を採用
 */
export const ANNOUNCEMENT_SCOPE = {
  ALL: 'ALL',
  HOME: 'HOME',
  HW_ASSIGN: 'HW_ASSIGN',
  HW_TASK: 'HW_TASK',
  HW_CONF: 'HW_CONF',
  SHOPPING: 'SHOPPING',
  CONF_ACCT: 'CONF_ACCT',
  CONF_HH: 'CONF_HH',
  CONF_APP: 'CONF_APP',
  NOTIFY: 'NOTIFY',
  INQUIRY: 'INQUIRY',
  ADMIN: 'ADMIN',
} as const
export type AnnouncementScopeCode =
  (typeof ANNOUNCEMENT_SCOPE)[keyof typeof ANNOUNCEMENT_SCOPE]
```

#### 2. 横展開（featureScope ベタ書きを定数参照に）

| ファイル | 変更内容 |
|---------|---------|
| `src/router/index.ts` | `RouteMeta.featureScope?: string` → `?: AnnouncementScopeCode` に強化。各ルートの `featureScope: 'HOME'` 等 11箇所を `ANNOUNCEMENT_SCOPE.HOME` 等に置換 |
| `src/stores/announcementStore.ts` | `SCOPE_TO_ROUTE_MAP` のキーを `ANNOUNCEMENT_SCOPE.HOME: 'home'` 形式に変換（`Record<AnnouncementScopeCode, string>` 型に変更）。`a.targetScope === 'ALL'` を `a.targetScope === ANNOUNCEMENT_SCOPE.ALL` に置換 |
| `src/domain/announcement/announcement.model.ts` | `targetScope: string` → `targetScope: AnnouncementScopeCode` に強化 |
| `src/api/announcementApi.ts` | DTO は `string` のまま、`toModel` で `as AnnouncementScopeCode` キャスト |
| テスト `src/__tests__/stores/announcementStore.spec.ts` | `targetScope: 'ALL' / 'HOME' / 'HW_TASK' / 'HW_ASSIGN'` を定数参照に変更 |
| テスト `src/__tests__/api/announcementApi.spec.ts` | `targetScope: 'ALL'` を定数参照に変更 |

#### 横展開の対象外（同名文字列 'ALL' は別意味）

以下の `'ALL'` は **AnnouncementScope と無関係なローカルフィルタ用**。横展開しない。
- `HouseworkForm.vue` の `templateFilterCategory = 'ALL'`
- `HouseworkAssignmentPage.vue` の `assigneeFilter = 'ALL' | ...`
- `HouseworkSettingsPage.vue` / `AdminHouseworkTemplatesPage.vue` の `filterCategory = 'ALL'`
- `MyTasksPage.vue` の `futureFilter = 'ALL' | 'TODAY' | 'WEEK'`
- `AdminRolesPage.vue` の `'ADMIN'` / `'SUPPORT'`（USER_ROLE 表示ラベル文字列）

---

### Issue #60: router/index.ts の子ルートに featureScope を引き継ぐ

**ブランチ**: `feature/56-announcement-banner`（既存への追加コミット・#59 完了後着手）
**コミット参照**: `(ryokkon624/hw-hub-manage#60)`

#### 親に featureScope ありで子が未設定の箇所一覧

| 親（featureScope） | 未設定の子ルート | 設定する値 |
|-------------------|-----------------|-----------|
| `settings/housework` (HW_CONF) | `settings/housework/new` | `ANNOUNCEMENT_SCOPE.HW_CONF` |
| `settings/housework` (HW_CONF) | `settings/housework/:houseworkId/edit` | `ANNOUNCEMENT_SCOPE.HW_CONF` |
| `shopping` (SHOPPING) | `shopping/new` | `ANNOUNCEMENT_SCOPE.SHOPPING` |
| `shopping` (SHOPPING) | `shopping/items/:itemId` | `ANNOUNCEMENT_SCOPE.SHOPPING` |
| `settings/inquiry` (INQUIRY) | `settings/inquiry/new` | `ANNOUNCEMENT_SCOPE.INQUIRY` |
| `settings/inquiry` (INQUIRY) | `settings/inquiry/:inquiryId` | `ANNOUNCEMENT_SCOPE.INQUIRY` |

#### admin 配下の取り扱い（Q2 で確定 = 例外扱い）

- **admin 配下の子ルート（`admin/users` `admin/roles` `admin/inquiries` `admin/inquiries/:id` `admin/housework-templates` `admin/housework-templates/new` `admin/housework-templates/:id/edit`）には featureScope を設定しない**
- 理由: ADMIN 機能は参照できる人が限られており、アナウンス表示対象として子ルートまで広げる必要がない（りょこさん判断）
- 既存の admin 直下 `path: ''`（AdminTopPage）の `featureScope: ANNOUNCEMENT_SCOPE.ADMIN` のみ維持

#### 動作確認

- AnnouncementBanner.vue は `route.name` をそのまま使う形ではなく、`announcementStore.visibleForRoute(routeName)` 経由で `SCOPE_TO_ROUTE_MAP` で照合している
- 現状の `SCOPE_TO_ROUTE_MAP` は **親ルート名のみ**（例：`SHOPPING: 'shopping'`）にマッピング
- 子ルート（`shopping.new` 等）が `route.name` のとき、現状の `visibleForRoute` ロジックでは ALL のみ表示される
- → 子ルートに `meta.featureScope` を設定しても、`visibleForRoute(routeName)` ロジックは `routeName` 引数だけで判定するため **子ルート対応が効かない**

#### 設計判断（Q1 で確定 = 案A 採用）

**案A**: `visibleForRoute` を `route.meta.featureScope` ベースに変更する
- AnnouncementBanner.vue 側で `route.meta.featureScope` を取り出して引数で渡す形に変更
- `visibleForRoute(routeName, featureScope)` シグネチャに変更
- メリット: meta を信頼源にできるためマッピングが一元化
- デメリット: store の getter シグネチャ変更でテスト改修が必要

#### TDD（案A）

- `announcementStore.spec.ts` に `visibleForRoute(routeName, currentScope)` のテストを追加
  - currentScope が `ANNOUNCEMENT_SCOPE.HOME` で targetScope=`ANNOUNCEMENT_SCOPE.HOME` のアナウンス → 表示
  - currentScope が undefined で targetScope=`ANNOUNCEMENT_SCOPE.ALL` → 表示
  - currentScope が `ANNOUNCEMENT_SCOPE.SHOPPING` で targetScope=`ANNOUNCEMENT_SCOPE.HW_TASK` → 非表示
- `AnnouncementBanner.vue` の見た目変更は不要だが、`route.meta.featureScope` を取り出して `visibleForRoute` に渡す呼び出し側の変更が必要

---

## 作業順

1. **#55**（独立・新規ブランチ `fix/55-delete-unused-deletehousework`）
2. **#58**（feature/56-announcement-banner ブランチに追加コミット）
3. **#59**（feature/56-announcement-banner ブランチに追加コミット・#58 と同じファイルを編集するため #58 完了後）
4. **#60**（feature/56-announcement-banner ブランチに追加コミット・#59 完了後）

各 Issue 完了ごとにコミット → 全 Issue 完了後にまとめて push。

---

## 確認事項の承認結果（2026-05-05 りょこさん回答）

| 確認事項 | 決定 |
|---------|------|
| Q1: #60 設計判断（案A vs 案B） | **案A 採用**（`visibleForRoute` を `route.meta.featureScope` ベースに変更） |
| Q2: #60 admin 配下の子ルート | **featureScope を設定しない**（参照できる人が限られているため例外扱い） |
| Q3: #58/#59 テスト内のベタ書き | **定数参照に置換する** |

---

## 実装状況

| Issue | ブランチ | 状態 |
|-------|---------|------|
| #55 | fix/55-delete-unused-deletehousework | 完了・push済み |
| #58 | feature/56-announcement-banner | 完了・push済み |
| #59 | feature/56-announcement-banner | 完了・push済み |
| #60 | feature/56-announcement-banner | 完了・push済み |

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|

---

*スプリント終了後、long_term.mdに要約して移す*
