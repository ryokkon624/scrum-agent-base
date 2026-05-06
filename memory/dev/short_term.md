# Dev 短期記憶

**スプリント**: Sprint 25
**最終更新**: 2026-05-06

---

## スプリントゴール

Sprint 24レビュー指摘4件（フロントエンドバグ3件・バックエンドリファクタリング1件）を解消し、アナウンス管理機能を完成品質に引き上げる

---

## Sprint 25 コミット開始点（reviewerへの差分指示用）

- **ブランチ**: `feature/57-admin-announcements`（既存ブランチへの追加コミット。新規ブランチ作成なし）
- **対象リポジトリ**: hw-hub-frontend（#62/#63/#64） / hw-hub-backend（#65）
- **Sprint 25 開始時の HEAD**: 各リポジトリの現状 HEAD（Sprint 24 push済みコミット）
- **reviewer 指示時の差分範囲**: 各リポジトリで Sprint 25 で追加するコミットのみ

---

## 実装方針（提示中・りょこさん承認待ち）

### 全体方針

- 全4件は**既存ブランチ `feature/57-admin-announcements` への追加コミット**。新規ブランチは作成しない。
- #62 と #63 は同一ファイル（`AdminAnnouncementFormPage.vue`）変更のため、**1コミットにまとめる**。
- 作業順は フロント（#62+#63 → #64） → バックエンド（#65）。各 Issue 完了ごとにコミット。
- TDD: バリデーションスキーマは utils 層に切り出すため Vitest 必須。バックエンドは既存 Spec の更新中心。

---

### #62 + #63: yup バリデーション i18n 化 + タイトル200バイト上限（同一コミット）

**対象リポジトリ**: hw-hub-frontend
**コミット参照**: `(ryokkon624/hw-hub-manage#62, ryokkon624/hw-hub-manage#63)`

#### 変更ファイル

| 種別 | ファイル | 変更内容 |
|------|---------|---------|
| 新規 | `src/domain/announcement/announcementForm.validation.ts` | `houseworkForm.validation.ts` と同じ構造で yup スキーマを切り出し。i18n キーをエラーメッセージとして渡す |
| 編集 | `src/views/admin/AdminAnnouncementFormPage.vue` | インラインの yup スキーマ削除 → 上記 utils を `toTypedSchema` で読み込む。エラー表示を `{{ t(errors.xxx) }}` 形式に変更 |
| 編集 | `src/i18n/ja.json` `en.json` `es.json` | `admin.announcement.validation` に `titleJa.required` / `titleEn.required` / `titleEs.required` / `bodyJa.required` / `bodyEn.required` / `bodyEs.required` / `severity.required` / `targetScope.required` / `startAt.required` / `endAt.required` / `titleJa.maxBytes` / `titleEn.maxBytes` / `titleEs.maxBytes` を追加。既存 `endAtAfterStartAt` は維持 |
| 新規（テスト） | `src/__tests__/domain/announcement/announcementForm.validation.spec.ts` | 各フィールドの required / タイトル3言語の200バイト上限 / endAt > startAt をホワイトボックステスト |

#### バリデーション仕様（AC1, AC2 対応）

```ts
// announcementForm.validation.ts（イメージ）
const byteLength = (s: string | undefined | null): number =>
  s ? new TextEncoder().encode(s).length : 0

export const announcementFormSchema = yup.object({
  titleJa: yup.string()
    .required('admin.announcement.validation.titleJa.required')
    .test('byte-length', 'admin.announcement.validation.titleJa.maxBytes',
      (v) => byteLength(v) <= 200),
  titleEn: yup.string()
    .required('admin.announcement.validation.titleEn.required')
    .test('byte-length', 'admin.announcement.validation.titleEn.maxBytes',
      (v) => byteLength(v) <= 200),
  titleEs: yup.string()
    .required('admin.announcement.validation.titleEs.required')
    .test('byte-length', 'admin.announcement.validation.titleEs.maxBytes',
      (v) => byteLength(v) <= 200),
  bodyJa: yup.string().required('admin.announcement.validation.bodyJa.required'),
  bodyEn: yup.string().required('admin.announcement.validation.bodyEn.required'),
  bodyEs: yup.string().required('admin.announcement.validation.bodyEs.required'),
  severity: yup.string().required('admin.announcement.validation.severity.required'),
  targetScope: yup.string().required('admin.announcement.validation.targetScope.required'),
  startAt: yup.string().required('admin.announcement.validation.startAt.required'),
  endAt: yup.string()
    .required('admin.announcement.validation.endAt.required')
    .test('end-after-start', 'admin.announcement.validation.endAtAfterStartAt',
      (value, ctx) => {
        const start = ctx.parent.startAt as string | undefined
        if (!value || !start) return true
        return new Date(value) > new Date(start)
      }),
})
```

#### View 側の変更ポイント

- `<p v-if="errors.titleJa" ...>{{ errors.titleJa }}</p>` → `{{ t(errors.titleJa) }}` に変更（全12箇所）
- 登録/更新ボタンは `:disabled="store.isSubmitting || formSubmitting || Object.keys(errors).length > 0"` でも良いが、yup と vee-validate の標準動作で `formSubmitting` 中は無効化される。AC2 は「200バイト超の入力時にエラーメッセージが表示され、登録・更新ボタンが無効化される」なので、`Object.keys(errors).length > 0` を追加して防御的に対応する。

#### AC 対応マッピング

| AC | 対応 |
|----|----|
| #62 AC1: 全 yup メッセージが i18n キー | utils 切り出し + `t(errors.xxx)` |
| #62 AC2: ja/en/es 各言語で正しく表示 | 3言語に同キー追加 |
| #62 AC3: 既存テストが全通過 | バリデーション spec 追加・既存 spec への影響は `t()` 呼び出しのみ |
| #63 AC1: タイトル ja/en/es の200バイト上限 | 各 `titleXx` に `byte-length` test 追加 |
| #63 AC2: 200バイト超でエラー + ボタン無効化 | エラー表示 + `errors` 件数で `disabled` 制御 |
| #63 AC3: 既存テストが全通過 | バリデーション spec で網羅 |

---

### #64: 重要度バッジのダークモード対応

**対象リポジトリ**: hw-hub-frontend
**コミット参照**: `(ryokkon624/hw-hub-manage#64)`

#### 変更ファイル

| 種別 | ファイル | 変更内容 |
|------|---------|---------|
| 編集 | `src/views/admin/AdminAnnouncementsPage.vue` | `severityColorClass` の戻り値を palette トークンに置換 |

#### 置換マッピング（問い合わせ管理 categoryColorClass と同じスタイル）

```diff
 const severityColorClass = (severity: string): string => {
   switch (severity) {
     case ANNOUNCEMENT_SEVERITY.INFO:
-      return 'bg-blue-50 border border-blue-200 text-blue-600'
+      return 'bg-hwhub-palette-blue-soft border border-hwhub-palette-blue text-hwhub-palette-blue'
     case ANNOUNCEMENT_SEVERITY.WARN:
-      return 'bg-amber-50 border border-amber-200 text-amber-600'
+      return 'bg-hwhub-palette-amber-soft border border-hwhub-palette-amber text-hwhub-palette-amber'
     case ANNOUNCEMENT_SEVERITY.ERROR:
-      return 'bg-rose-50 border border-rose-200 text-rose-600'
+      return 'bg-hwhub-palette-rose-soft border border-hwhub-palette-rose text-hwhub-palette-rose'
     default:
       return 'bg-hwhub-surface-subtle text-hwhub-muted'
   }
 }
```

> palette トークンは `main.css` の `:root.dark` で上書き済みのため、ダークモードで自動的に色が切り替わる。

#### AC 対応マッピング

| AC | 対応 |
|----|----|
| AC1: ダークモード対応カラートークンを使用 | `bg-hwhub-palette-*-soft` / `border-hwhub-palette-*` / `text-hwhub-palette-*` に置換 |
| AC2: ダークモード時に適切なコントラスト | palette トークンが OS テーマ + 手動切替に追従 |
| AC3: 既存テストが全通過 | 見た目変更のためテストなし（規約通り） |

---

### #65: AnnouncementService の AnnouncementSummary を削除し Domain Model 直返し

**対象リポジトリ**: hw-hub-backend
**コミット参照**: `(ryokkon624/hw-hub-manage#65)`

#### 変更方針

- `AnnouncementService.getActiveAnnouncements` の戻り値を `List<AnnouncementSummary>` → `List<AnnouncementModel>` に変更
- `AdminAnnouncementService.getAll/getById/create` の戻り値を `AnnouncementSummary` → `AnnouncementModel` に変更
- `AnnouncementSummary` Inner record を **削除**
- DTO（`AnnouncementDto.from` / `AdminAnnouncementResponse.from`）の引数を `AnnouncementSummary` → `AnnouncementModel` に変更
- Controller 側の import 整理（`AnnouncementSummary` の参照を全削除）

#### 変更ファイル一覧

| 種別 | ファイル | 変更内容 |
|------|---------|---------|
| 編集 | `application/service/announcement/AnnouncementService.java` | `AnnouncementSummary` Inner record を**削除**。`getActiveAnnouncements` の戻り値を `List<AnnouncementModel>` に変更 |
| 編集 | `application/service/announcement/AdminAnnouncementService.java` | 戻り値を `AnnouncementModel` に変更（`getAll/getById/create`）。`AnnouncementSummary::from` の map を削除 |
| 編集 | `presentation/rest/announcement/AnnouncementController.java` | 変数型を `AnnouncementModel`、import から `AnnouncementSummary` 除去 |
| 編集 | `presentation/rest/announcement/dto/AnnouncementDto.java` | `from(AnnouncementSummary)` → `from(AnnouncementModel)` にシグネチャ変更。getter 呼び出しに変更（`model.getId()` 等） |
| 編集 | `presentation/rest/admin/announcement/AdminAnnouncementController.java` | 変数型を `AnnouncementModel`、import から `AnnouncementSummary` 除去 |
| 編集 | `presentation/rest/admin/announcement/dto/AdminAnnouncementResponse.java` | `from(AnnouncementSummary)` → `from(AnnouncementModel)` にシグネチャ変更 |
| 編集 | `test/.../announcement/AnnouncementControllerSpec.groovy` | `AnnouncementSummary` を `AnnouncementModel.reconstruct(...)` に置換 |
| 編集 | `test/.../announcement/AdminAnnouncementServiceSpec.groovy` | 戻り値型のアサーション調整（`result[0].id == 1L` 等は変わらない） |
| 編集 | `test/.../admin/announcement/AdminAnnouncementControllerSpec.groovy` | service のモック戻り値を `AnnouncementModel` に変更 |

#### Domain Model を Controller に返す妥当性

CLAUDE.md / backend-conventions の依存ルール表で **Domain Model は Presentation 層から参照可能** と明記されている。`AnnouncementSummary` は Model と全フィールド一致しており、独自の振る舞いも持たないため、HwHub 規約上は不要なボイラープレート。

> Application Service の Inner Class DTO は「複数の Domain Model を束ねるとき」または「Model の一部フィールドだけ公開したいとき」に有効（バックログ #65 備考）。本ケースは該当しない。

#### AC 対応マッピング

| AC | 対応 |
|----|----|
| AC1: Service が `AnnouncementModel` を直接返す | 上記の通り |
| AC2: Controller で Model → DTO 変換 | DTO の `from(model)` で変換 |
| AC3: `AnnouncementSummary` Inner class を削除 | 削除 |
| AC4: 既存テストが全通過 | Spock テストの mock 戻り値を Model に統一して通す |

---

## りょこさんへの確認事項

なし。バックログとAC・参考実装が明確で、技術選択も既存パターン踏襲のため迷う点なし。

---

## 作業順（実装フェーズで実施）

1. **フロント #62 + #63**（同一コミット）
   - RED: `announcementForm.validation.spec.ts` を新規作成（required / 200バイト上限 / endAt > startAt のテスト）
   - GREEN: `announcementForm.validation.ts` を新規作成
   - REFACTOR: `AdminAnnouncementFormPage.vue` を utils 参照に書き換え + i18n 追加
   - 動作確認: ja/en/es でメッセージ切替 / 200バイト超でボタン無効化
2. **フロント #64**（単独コミット）
   - `AdminAnnouncementsPage.vue` の `severityColorClass` を palette トークンに置換
   - 動作確認: ライト/ダークでバッジ色が切り替わる
3. **バックエンド #65**（単独コミット）
   - `AdminAnnouncementServiceSpec` / `AnnouncementControllerSpec` / `AdminAnnouncementControllerSpec` のモック戻り値を Model に変更（RED）
   - `AnnouncementSummary` 削除 + 各 Service / DTO / Controller を Model 直返しに変更（GREEN）
   - `./gradlew spotlessApply` 実行
4. 全完了後、各リポジトリで `git push` してSMにレビュー依頼

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #62 yup i18n 対応 | 完了 |
| #63 タイトル200バイト上限 | 完了 |
| #64 重要度バッジダークモード | 完了 |
| #65 AnnouncementSummary 削除 | 完了 |

## コミット履歴（Sprint 25）

### hw-hub-frontend
- `349966a` feat: アナウンスフォームバリデーションi18n化・200バイト上限追加・重要度バッジダークモード対応 (#62, #63, #64)

### hw-hub-backend
- `aee496a` refactor: AnnouncementSummary Inner record を削除し Service が AnnouncementModel を直接返すよう変更 (#65)

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|

---

*スプリント終了後、long_term.mdに要約して移す*
