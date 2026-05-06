# Dev 短期記憶

**スプリント**: Sprint 24
**最終更新**: 2026-05-06

---

## スプリントゴール

アナウンスマスタメンテ画面を管理画面配下に追加し、システム管理者が開発者の手を借りずにアナウンスを管理できる機能を完成させる

---

## Sprint 24 コミット開始点（reviewerへの差分指示用）

- **ブランチ**: `feature/57-admin-announcements`（hw-hub-frontend / hw-hub-backend / hw-hub-database 共通）
- **Sprint 24 開始時の HEAD**: `a7b1888`（Sprint 23完了版コミット）
- **reviewer 指示時の差分範囲**: `git diff a7b1888..HEAD`

---

## 実装方針（りょこさん承認済み 2026-05-06）

### 承認・修正サマリ

| 項目 | 確定内容 |
|-----|---------|
| Q1. 権限付与対象 | **ADMIN + SUPPORT** 両方に付与（`m_role_permission` に2行追加） |
| Q2. 一覧ステータス | **3区分（開始前 / 有効中 / 期限切れ）** で実装 |
| Q3. パッケージ構成 | `application.service.announcement` パッケージを新設し、既存 `AnnouncementService` を移動。`AnnouncementSummary` を独立 record として切り出し。新規 Service も同パッケージ配下 |
| Q4. Domain チェック | `AnnouncementModel.create()` 内で startAt < endAt / severity・targetScope の有効値 / 各タイトル・本文 NotBlank をチェック |

### 全体方針

#57 単独だが、フロント・バックエンド・DB の3層に渡るため、以下の順で TDD で実装する。

1. DB（Flyway / 権限マッピング） → 2. バックエンド（Domain/Service/Controller） → 3. フロント（Store/View/Form）

ブランチ命名は `feature/57-admin-announcements`（3リポジトリ共通）。

---

### 1. hw-hub-database（Flyway）

**新規 Flyway**: `V00_001_017__add_announcement_management_permission.sql`

| 追加項目 | 値 |
|---------|---|
| `m_code` 0025（パーミッション）に追加 | `code_value='40'`, `name='AnnouncementMng'`, `display_name_ja='アナウンス管理'` 等 |
| `m_role_permission` に追加 | `('ADMIN', '40')` および **`('SUPPORT', '40')`** の2行（Q1反映） |
| `m_code` 0012（プログラム種別）に追加 | `code_value='OnlAdmAnn'`, `name='ONL_ADM_ANN'` |

---

### 2. hw-hub-backend

#### 2.1 パッケージ再編（Q3反映）

| 操作 | 対象 |
|-----|-----|
| 移動 | `application/service/AnnouncementService.java` → `application/service/announcement/AnnouncementService.java` |
| 切り出し | 既存 `AnnouncementService` の Inner Class `AnnouncementSummary` (record) を独立ファイル `application/service/announcement/AnnouncementSummary.java` へ |
| 新規追加 | `application/service/announcement/AdminAnnouncementService.java` |
| 影響範囲（import 更新） | `presentation/rest/announcement/AnnouncementController.java` / `presentation/rest/announcement/dto/AnnouncementDto.java` / `test/.../AnnouncementControllerSpec.groovy`（`AnnouncementService.AnnouncementSummary` を `AnnouncementSummary` へ） |

> 既存テストが先に通る状態を保ったままパッケージ移動を行う（リファクタは GREEN 状態を維持）。

#### 2.2 Permission Enum / ProgramType Enum 追加

| ファイル | 変更 |
|---------|------|
| `domain/enums/Permission.java` | `ANNOUNCEMENT_MANAGEMENT("40")` を追加 |
| `domain/enums/ProgramType.java` | `ONL_ADM_ANN("OnlAdmAnn")` を追加 |

#### 2.3 既存 AnnouncementModel に `create` ファクトリ + Domain チェック追加（Q4反映）

| ファイル | 変更 |
|---------|------|
| `domain/model/AnnouncementModel.java` | `create(...)` ファクトリ（id を null で生成）。バリデーション: `startAt < endAt` / severity が `AnnouncementSeverity` enum の有効値 / targetScope が `AnnouncementScope` enum の有効値 / 各タイトル・本文 NotBlank（空文字・null・空白のみ NG）。違反時は `IllegalArgumentException` |
| `domain/repository/AnnouncementRepository.java` | `findAll()` / `findById(Long id)` / `insert(model, operatorUserId, program)` / `update(model, operatorUserId, program)` / `delete(id, operatorUserId, program)` を追加 |
| `infrastructure/mybatis/repository/MyBatisAnnouncementRepository.java` | 既存に追加実装（Sprint 22 で `findActiveAt` のみ実装済み） |
| `infrastructure/mybatis/converter/AnnouncementConverter.java` | `toEntity(model)` を追加（既存は `toModel(entity)` のみ） |
| `infrastructure/mybatis/custom/mapper/AnnouncementCustomMapper.java` | 必要なら `update` 等を追加（WHO カラム手動更新用） |

#### 2.4 Service 層

新規 `application/service/announcement/AdminAnnouncementService.java`（既存 `AnnouncementService.getActiveAnnouncements` には手を入れない）：

```java
@Transactional(readOnly = true)
public List<AnnouncementSummary> getAll();

@Transactional(readOnly = true)
public AnnouncementSummary getById(Long id);

@Transactional
public AnnouncementSummary create(AnnouncementModel model, Long operatorUserId);

@Transactional
public void update(AnnouncementModel model, Long operatorUserId);

@Transactional
public void delete(Long id, Long operatorUserId);
```

> `AnnouncementSummary` は読み取り系の戻り値として再利用する（フィールド一致）。

#### 2.5 Controller 層

新規: `presentation/rest/admin/announcement/AdminAnnouncementController.java`

```
GET    /api/admin/announcements         一覧取得
POST   /api/admin/announcements         新規登録
PUT    /api/admin/announcements/{id}    更新
DELETE /api/admin/announcements/{id}    削除
```

すべて `@RequiresPermission(Permission.ANNOUNCEMENT_MANAGEMENT)` を付与。

新規 DTO（`presentation/rest/admin/announcement/dto/`）:
- `AdminAnnouncementRequest.java`（titleJa/En/Es, bodyJa/En/Es, severity, targetScope, startAt, endAt + Bean Validation `@NotBlank`）
- `AdminAnnouncementResponse.java`（id + Request 相当 + WHO カラム）

#### 2.6 Spock テスト（TDDのRED-GREEN）

| 新規/編集テストファイル | 対象 |
|-------------------------|------|
| `AnnouncementModelSpec.groovy`（新規 or 既存追記） | create() の各バリデーション（where: で網羅） |
| `AdminAnnouncementServiceSpec.groovy`（新規） | getAll / getById / create / update / delete |
| `MyBatisAnnouncementRepositorySpec.groovy`（既存があれば追記） | findAll / findById / insert / update / delete |
| `AdminAnnouncementControllerSpec.groovy`（新規） | エンドポイント動作・権限チェック（ADMIN/SUPPORT 許可、その他 403） |

---

### 3. hw-hub-frontend

#### 3.1 PERMISSION 定数 / useRole 拡張

| ファイル | 変更 |
|---------|------|
| `constants/code.constants.ts` | `PERMISSION` に `ANNOUNCEMENT_MNG: '40'` を追加 |
| `composables/useRole.ts` | `canManageAnnouncement = computed(() => hasPermission(PERMISSION.ANNOUNCEMENT_MNG))` を追加 |

#### 3.2 API クライアント

`api/adminApi.ts` に追加：

```ts
async fetchAdminAnnouncements(): Promise<AdminAnnouncementModel[]>
async fetchAdminAnnouncement(id: number): Promise<AdminAnnouncementModel>
async createAdminAnnouncement(req: AdminAnnouncementRequest): Promise<AdminAnnouncementModel>
async updateAdminAnnouncement(id: number, req: AdminAnnouncementRequest): Promise<void>
async deleteAdminAnnouncement(id: number): Promise<void>
```

#### 3.3 Store

新規: `stores/adminAnnouncementStore.ts`
（`adminHouseworkTemplateStore` と同じ構造：`items[]` / `isLoading` / `isSubmitting` + `loadAll/create/update/remove/clear`）

#### 3.4 Domain

新規: `domain/announcement/adminAnnouncement.model.ts`

```ts
export interface AdminAnnouncementModel {
  id: number
  titleJa: string; titleEn: string; titleEs: string
  bodyJa: string; bodyEn: string; bodyEs: string
  severity: AnnouncementSeverityCode
  targetScope: AnnouncementScopeCode
  startAt: string
  endAt: string
}
```

#### 3.5 ルーティング

`router/index.ts` の `admin` 子ルートに追加：

```
{ path: 'announcements',           name: 'admin.announcements',      meta: { requiresPermission: PERMISSION.ANNOUNCEMENT_MNG } }
{ path: 'announcements/new',       name: 'admin.announcements.new',  meta: { requiresPermission: PERMISSION.ANNOUNCEMENT_MNG } }
{ path: 'announcements/:id/edit',  name: 'admin.announcements.edit', meta: { requiresPermission: PERMISSION.ANNOUNCEMENT_MNG }, props: ... }
```

> Sprint 23 #60 のルールに従い、admin 配下の子ルートには `featureScope` を設定しない。

#### 3.6 Page / Form 実装

新規:
- `views/admin/AdminAnnouncementsPage.vue`（一覧。`AdminHouseworkTemplatesPage` と同じ構造：PC=テーブル+ソート+ページング、SP=カード+ページング）
- `views/admin/AdminAnnouncementFormPage.vue`（新規/編集兼用。`AdminHouseworkTemplateFormPage` と同じく vee-validate + yup を使用）

AdminTopPage.vue にもアナウンス管理カードを追加：
- アイコン: `Megaphone`（lucide-vue-next）
- アイコン色: 既存と被らないトーンを選定（cyan系を予定）
- `:can-access="canManageAnnouncement"`

#### 3.7 一覧画面の表示項目（AC2 対応）

| 列 | 値 |
|----|---|
| タイトル | 表示言語に応じて `titleJa/En/Es` から選択 |
| 重要度 | `m_code` 0028（AnnouncementSeverity）の display_name でラベル化。色つきバッジ |
| 対象スコープ | `m_code` 0027（AnnouncementScope）の display_name でラベル化 |
| 有効期間 | `startAt 〜 endAt`（locale-aware フォーマット） |
| ステータス（Q2: 3区分確定） | `now < startAt` → 開始前 / `startAt <= now < endAt` → 有効中 / `endAt <= now` → 期限切れ |

#### 3.8 フォーム入力項目（AC3 対応）

| 項目 | 必須 | 入力方法 |
|------|------|---------|
| タイトル ja/en/es | 必須 | text |
| 本文 ja/en/es | 必須 | textarea |
| 重要度 | 必須 | select（codeStore から `m_code` 0028 取得） |
| 対象スコープ | 必須 | select（codeStore から `m_code` 0027 取得） |
| 有効開始日時 | 必須 | `<input type="datetime-local">` |
| 有効終了日時 | 必須 | `<input type="datetime-local">`（startAt < endAt のチェック） |

#### 3.9 i18n 追加

`i18n/ja.json` `en.json` `es.json` に以下を追加：
- `admin.sections.announcement.title` / `subtitle`
- `admin.announcement.*`（columns / form / toast / validation 各キー）
- `pageTitles.adminAnnouncements` / `adminAnnouncementNew` / `adminAnnouncementEdit`

#### 3.10 Vitest（TDD）

| ファイル | 対象 |
|---------|------|
| `__tests__/api/adminApi.spec.ts`（既存に追記） | fetchAdminAnnouncements / create / update / delete |
| `__tests__/stores/adminAnnouncementStore.spec.ts`（新規） | loadAll / create / update / remove |
| `__tests__/composables/useRole.spec.ts`（既存があれば追記） | canManageAnnouncement |

> View / Form のテストは見た目主体のため省略（規約通り）。

---

## 作業順

1. **DB**: Flyway 追加 → `flywayMigrate` 実行 → `mybatisGenerator`（事前に `rm -rf src/main/resources/mapper/generated`）
2. **Backend**:
   - パッケージ移動: AnnouncementService を `application/service/announcement/` へ、AnnouncementSummary を独立 record に切り出し（参照元 import を grep で全更新、既存テスト緑のまま）
   - Permission enum / ProgramType enum 追加
   - AnnouncementModel に `create` + Domain チェック追加（TDD・Spec 先行）
   - Repository / Converter 拡張（TDD）
   - AdminAnnouncementService 新規（TDD）
   - AdminAnnouncementController 新規（TDD・権限チェック ADMIN/SUPPORT 両方許可、その他 403）
3. **Frontend**:
   - PERMISSION 定数 + useRole 拡張（TDD・spec先行）
   - adminApi 追加（TDD）
   - adminAnnouncementStore 新規（TDD）
   - domain モデル / i18n / ルーティング追加
   - AdminAnnouncementsPage / AdminAnnouncementFormPage 実装
   - AdminTopPage にカード追加
4. **動作確認**: ADMIN ユーザーでログイン → アナウンス CRUD が一通り動くこと → SUPPORT ユーザーでも CRUD 可能 → 他ロールはメニュー非表示 / 直アクセス 403 確認

各層完了ごとにコミット → 全層完了後にまとめて push（3リポジトリそれぞれ）。

---

## 実装状況

| 区分 | ブランチ | 状態 |
|-----|---------|------|
| DB | feature/57-admin-announcements | 完了（push済み） |
| Backend | feature/57-admin-announcements | 完了（push済み） |
| Frontend | feature/57-admin-announcements | 完了（push済み） |

**全AC完了・全リポジトリpush済み（2026-05-06）**

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|

---

*スプリント終了後、long_term.mdに要約して移す*
