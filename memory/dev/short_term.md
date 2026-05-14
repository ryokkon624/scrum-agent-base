# Dev 短期記憶

**スプリント**: Sprint 34
**最終更新**: 2026-05-14

---

## スプリントゴール

買い物アイテム作成・詳細画面をモバイルに実装し、画像添付や履歴からの選択で買い物リストをより充実させられるようにする

---

## 対象Issue（featureラベル）

| Issue | 内容 | SP | ブランチ |
|-------|------|----|----|
| #86 | [mobile] 買い物アイテム作成・詳細画面を実装する (#14/#15) | TBD | `feature/85-mobile-shopping-list`（Sprint33から継続使用） |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`
作業スレッドID: `1504279756722405467`

---

## 承認済み実装方針

### #86: 買い物アイテム作成・詳細画面を実装する

**コミットメッセージ**: `feat: モバイルの買い物アイテム作成・詳細画面を実装する (ryokkon624/hw-hub-manage#86)`

#### りょこさんとの確認事項回答（承認済み）

1. **history-suggestions の期間フィルタ** → **案A採用**: `limit=100` で全件取得後、`lastPurchasedDate` でモバイル側ローカルフィルタする
2. **詳細画面の更新API** → **PUT で実装**（仕様書のPATCHは後追い修正。Webと同じく `PUT /api/shopping-items/{id}`）
3. **画像枚数制限** → **クライアント側枚数制限なし**（Webに合わせる）
4. **「このアイテムを削除」ボタン** → **未購入ステータス時のみ表示**（Web `ShoppingItemDetailPage.vue` の `v-if="isNotPurchased"` 仕様に合わせる）

#### 全体構成

`features/shopping/` 既存ディレクトリに追加実装する（Sprint33の `shopping_list_page` 等は既存）。

```
features/shopping/
├── shopping_providers.dart                 # 既存: 追加プロバイダーを宣言
├── data/
│   ├── shopping_repository.dart            # 既存: createItem / updateItem / deleteItem / fetchOne / favorites / historySuggestions を追加
│   ├── shopping_attachment_repository.dart # 【新規】Presigned URL発行 / S3 PUT / metadata登録 / 一覧 / 削除
│   └── models/
│       ├── shopping_item_history_suggestion_dto.dart  # 【新規】name / storeType / lastPurchasedDate / purchaseCount / sourceShoppingItemId
│       ├── shopping_attachment_dto.dart                # 【新規】id / fileName / imageUrl / sortOrder
│       ├── create_shopping_item_request.dart           # 【新規】name / memo / storeType / favorite / sourceShoppingItemId
│       ├── update_shopping_item_request.dart           # 【新規】name / memo / storeType / favorite
│       ├── create_upload_url_request.dart              # 【新規】fileName / mimeType
│       ├── create_upload_url_response.dart             # 【新規】uploadUrl / fileKey
│       └── create_attachment_request.dart              # 【新規】fileKey / fileName / mimeType
└── presentation/
    ├── shopping_item_new/
    │   ├── shopping_item_new_page.dart       # 【新規】#14 作成画面
    │   ├── shopping_item_new_notifier.dart   # 【新規】フォーム状態 + 登録処理 + 画像アップ
    │   └── shopping_item_new_state.dart      # 【新規】name / memo / storeType / favorite / pickedImage / sourceShoppingItemId / isSubmitting / errorMessage
    ├── shopping_item_detail/
    │   ├── shopping_item_detail_page.dart    # 【新規】#15 詳細画面
    │   ├── shopping_item_detail_notifier.dart# 【新規】読込 / 更新 / 削除 / status変更 / favorite / 画像追加削除
    │   └── shopping_item_detail_state.dart   # 【新規】item / attachments / editable... / isLoading / isSaving / errorMessage
    └── widgets/
        ├── history_picker_bottom_sheet.dart  # 【新規】AC3: 過去履歴から選ぶ
        ├── favorite_picker_bottom_sheet.dart # 【新規】AC4: お気に入りから選ぶ
        ├── status_step_selector.dart         # 【新規】AC7: 未購入→かご→購入済みステップ
        └── image_picker_field.dart           # 【新規】image_picker 呼出・サムネ表示の共通ウィジェット
```

#### Repository 拡張（`ShoppingRepository`）

既存 interface に以下を追加：

- `createItem({required int householdId, required CreateShoppingItemRequest req})` → `POST /api/households/{id}/shopping-items` → `ShoppingItemDto`
- `updateItem({required int shoppingItemId, required UpdateShoppingItemRequest req})` → `PUT /api/shopping-items/{id}` → `ShoppingItemDto`
- `fetchOne({required int shoppingItemId})` … 既存 `fetchItems` のローカルキャッシュを優先利用するが、直リンク対策で API 経由でも取得できるようにする（**ただしバックエンドに単体取得 API がない場合は `fetchItems` で取得→find する**）→ 実装前に backend を確認
- `fetchFavorites({required int householdId})` → `GET /api/households/{id}/shopping-items/favorites` → `List<ShoppingItemDto>`
- `fetchHistorySuggestions({required int householdId, String? q, String? storeType, int limit = 100})` → `GET /api/households/{id}/shopping-items/history-suggestions` → `List<ShoppingItemHistorySuggestionDto>`

#### Attachment Repository（新規）

- `createUploadUrl({required int itemId, required String fileName, required String mimeType})` → `POST /api/shopping-items/{itemId}/attachments/upload-url` → `CreateUploadUrlResponse`
- `uploadToS3({required String uploadUrl, required Uint8List bytes, required String mimeType})` → 素の Dio（**インターセプターを使わない別インスタンス**）で `PUT`
- `createAttachment({required int itemId, required CreateAttachmentRequest req})` → `POST /api/shopping-items/{itemId}/attachments`
- `listAttachments({required int itemId})` → `GET /api/shopping-items/{itemId}/attachments` → `List<ShoppingAttachmentDto>`
- `deleteAttachment({required int itemId, required int attachmentId})` → `DELETE /api/shopping-items/{itemId}/attachments/{attachmentId}`

> S3 PUT 用 Dio は `image_uploader.dart` というユーティリティに切り出してリピートさせる。`dio = Dio()`（baseUrl 無し・interceptor 無し）

#### Notifier の責務

**`ShoppingItemNewNotifier extends AutoDisposeNotifier<ShoppingItemNewState>`**
- `setName(String) / setMemo(String) / setStoreType(String) / setFavorite(bool)`
- `setFromHistory(ShoppingItemHistorySuggestionDto)` … name / storeType / sourceShoppingItemId をセット（favorite はクリア）
- `setFromFavorite(ShoppingItemDto)` … name / memo / storeType / sourceShoppingItemId をセット（favorite はクリア・固定）
- `pickImage(ImageSource source)` … image_picker 経由で XFile を取得・bytes 保持
- `clearImage()` … 選択解除
- `submit({required int householdId})` … バリデーション → createItem → 画像があれば uploadAttachment → 戻る

**`ShoppingItemDetailNotifier extends AutoDisposeFamilyAsyncNotifier<ShoppingItemDetailState, int>`** （itemIdをfamilyで受ける）
- `build(int itemId)` … item と attachments を並行取得
- `setName / setMemo / setStoreType` … editable state 更新
- `toggleFavorite()` … 即座に API 呼ぶ
- `updateStatus(String status)` … 即座に API 呼ぶ
- `save()` … updateItem (PUT) → list 画面に戻る
- `deleteItem()` … 削除確認後 → API → 戻る
- `addImage(XFile file)` … Presigned URL 発行 → S3 PUT → metadata 登録 → 一覧再取得
- `deleteAttachment(int attachmentId)` … 削除 → 一覧再取得

#### ボトムシート（AC3 / AC4）

`showModalBottomSheet` で表示。中身は StatefulWidget で keyword / storeTypeFilter / periodFilter（履歴のみ）を保持し、フィルタした結果を表示。「選ぶ」タップで `Navigator.pop(result)` し、呼出元 Notifier の `setFromHistory` / `setFromFavorite` を呼ぶ。

**期間フィルタ（履歴のみ）**：「すべて / 過去30日 / 過去90日 / 過去1年」の4択チップ。`lastPurchasedDate` を `DateTime.parse` してクライアント側で `now.subtract(Duration(days: 30|90|365))` と比較してフィルタ（**API では取得しない・ローカルフィルタ**）。

#### ステータスステップセレクター（AC7）

`StatusStepSelector` ウィジェット：
- 横並び3ステップ「1 未購入 → 2 かご → 3 購入済み」
- 各ステップに `TaskStatus` 風の丸アイコン
- 過去ステップ = 緑塗りつぶし＋✓ / 現在ステップ = primary塗りつぶし / 未来ステップ = グレー枠線
- ステップタップで `onChanged(status)` コールバック
- ステップ下に説明テキスト（「まだ買う前の状態です」等）

#### image_picker 導入と permissions

`pubspec.yaml` に `image_picker: ^1.1.0` を追加。`AndroidManifest.xml` と `Info.plist` の permissions も追加（仕様書 `common/image_upload.md` 参照）。

`image_picker` 呼出は `ImagePicker().pickImage(source: ..., maxWidth: 1920, maxHeight: 1920, imageQuality: 85)` を使用。Notifier 経由ではなくウィジェット側（モーダル選択用ボトムシート）で実行し、結果の `XFile` を Notifier に渡す（モック容易化のため）。

#### i18n 追加キー（ja/en/es）

`app_*.arb` に追加：
- `shoppingNewTitle` / `shoppingNewIntro`
- `shoppingNewSelectFromHistory` / `shoppingNewSelectFromFavorite`
- `shoppingNewName` / `shoppingNewMemo` / `shoppingNewStoreType` / `shoppingNewFavorite` / `shoppingNewImage`
- `shoppingNewImageHint` / `shoppingNewSubmit` / `shoppingNewCancel`
- `shoppingNewToastSuccess` / `shoppingNewToastError`
- `shoppingHistoryModalTitle` / `shoppingHistoryModalDescription`
- `shoppingHistoryModalKeywordPlaceholder` / `shoppingHistoryModalEmpty`
- `shoppingHistoryModalPeriodAll` / `shoppingHistoryModalPeriod30d` / `shoppingHistoryModalPeriod90d` / `shoppingHistoryModalPeriod365d`
- `shoppingFavoriteModalTitle` / `shoppingFavoriteModalDescription` / `shoppingFavoriteModalEmpty`
- `shoppingDetailTitle` / `shoppingDetailIntro`
- `shoppingDetailStatus` / `shoppingDetailStatusHelpNotPurchased` / `shoppingDetailStatusHelpInBasket` / `shoppingDetailStatusHelpPurchased`
- `shoppingDetailSave` / `shoppingDetailDeleteItem` / `shoppingDetailDeleteConfirm`
- `shoppingDetailImageSectionTitle` / `shoppingDetailImageAdd` / `shoppingDetailImageDelete` / `shoppingDetailImageDeleteConfirm`
- `shoppingDetailToastSaveSuccess` / `shoppingDetailToastDeleteSuccess` / `shoppingDetailToastImageAddSuccess` / `shoppingDetailToastImageDeleteSuccess`
- `shoppingImagePickerCamera` / `shoppingImagePickerGallery` / `shoppingImagePickerCancel`

#### ルーティング

`app_router.dart` の以下 2 ヶ所を差し替え：
- `AppRoutes._shoppingNewRelative` の builder を `const _P('買い物アイテム作成')` → `const ShoppingItemNewPage()`
- `AppRoutes._shoppingDetailRelative` の builder を `_P('買い物アイテム詳細 ${s.pathParameters['id']}')` → `ShoppingItemDetailPage(itemId: int.parse(s.pathParameters['id']!))`

---

## 作業順序（TDD: RED → GREEN → REFACTOR）

1. **準備**: `pubspec.yaml` に image_picker 追加 → `flutter pub get` → AndroidManifest / Info.plist に permissions 追加
2. **DTO・Request モデル**: 新規 8 ファイル → `build_runner` で `.g.dart` 生成
3. **ShoppingRepository 拡張**: interface に 4 メソッド追加 → impl 実装 → repository_test（成功 + DioException 変換）
4. **ShoppingAttachmentRepository 新規**: interface + impl → attachment_repository_test
5. **ShoppingItemNewNotifier + State**: state クラス → notifier → notifier_test（各操作の遷移）
6. **ShoppingItemDetailNotifier + State**: state → notifier → notifier_test
7. **i18n キー追加**: ja/en/es の ARB を編集 → `flutter gen-l10n`
8. **Widget 系**: `status_step_selector` → `image_picker_field` → `history_picker_bottom_sheet` → `favorite_picker_bottom_sheet` → page 本体 → page_test
9. **router 差し替え**: `_P('買い物アイテム作成')` → `ShoppingItemNewPage`、`_P('買い物アイテム詳細 ...')` → `ShoppingItemDetailPage`
10. **AC11: カバレッジ計測**: `coverage.ps1` で features.shopping 配下 ≥95% 達成を確認

---

## テスト方針

| 対象 | テスト |
|------|--------|
| `ShoppingRepositoryImpl`（拡張分） | createItem / updateItem / fetchFavorites / fetchHistorySuggestions の成功パス + DioException 変換 |
| `ShoppingAttachmentRepositoryImpl` | createUploadUrl / uploadToS3 / createAttachment / listAttachments / deleteAttachment の成功 + DioException 変換 |
| `ShoppingItemNewNotifier` | フォーム入力 / setFromHistory / setFromFavorite / pickImage / submit（成功・失敗）。`ImagePicker` はテストで Notifier に注入できる形にせず、`pickImage` メソッドを `XFile` 受取り型にしてテストで直接 `setPickedImage` を呼ぶ |
| `ShoppingItemDetailNotifier` | build / save / deleteItem / toggleFavorite / updateStatus / addImage / deleteAttachment の状態遷移 |
| `ShoppingItemNewPage` (widget) | 主要表示・カメラ/ライブラリ選択肢ボトムシート表示・送信ボタンタップで Notifier の `submit` が呼ばれること（Notifier はフェイク） |
| `ShoppingItemDetailPage` (widget) | 主要表示・ステータスステップタップ・お気に入りトグル・削除ダイアログ・「未購入時のみ削除ボタン表示」・保存ボタン |

> `image_picker` のモックは Notifier には差し込まず、画面側のソース選択ボトムシート（カメラ/ギャラリー）からの呼び出しを切り離す。Notifier の `pickImage` テストは `XFile` を直接渡せる契約にする（テスタビリティ優先）。

---

## 変更ファイル一覧

### pubspec / native
- `pubspec.yaml`（image_picker 追加）
- `android/app/src/main/AndroidManifest.xml`（CAMERA 権限）
- `ios/Runner/Info.plist`（NSCameraUsageDescription / NSPhotoLibraryUsageDescription）

### 新規（lib）
- `lib/features/shopping/data/shopping_attachment_repository.dart`
- `lib/features/shopping/data/models/shopping_item_history_suggestion_dto.dart`
- `lib/features/shopping/data/models/shopping_attachment_dto.dart`
- `lib/features/shopping/data/models/create_shopping_item_request.dart`
- `lib/features/shopping/data/models/update_shopping_item_request.dart`
- `lib/features/shopping/data/models/create_upload_url_request.dart`
- `lib/features/shopping/data/models/create_upload_url_response.dart`
- `lib/features/shopping/data/models/create_attachment_request.dart`
- `lib/features/shopping/presentation/shopping_item_new/shopping_item_new_page.dart`
- `lib/features/shopping/presentation/shopping_item_new/shopping_item_new_notifier.dart`
- `lib/features/shopping/presentation/shopping_item_new/shopping_item_new_state.dart`
- `lib/features/shopping/presentation/shopping_item_detail/shopping_item_detail_page.dart`
- `lib/features/shopping/presentation/shopping_item_detail/shopping_item_detail_notifier.dart`
- `lib/features/shopping/presentation/shopping_item_detail/shopping_item_detail_state.dart`
- `lib/features/shopping/presentation/widgets/history_picker_bottom_sheet.dart`
- `lib/features/shopping/presentation/widgets/favorite_picker_bottom_sheet.dart`
- `lib/features/shopping/presentation/widgets/status_step_selector.dart`
- `lib/features/shopping/presentation/widgets/image_picker_field.dart`

### 新規（test）
- `test/features/shopping/data/shopping_repository_test.dart`（拡張分テスト追加）
- `test/features/shopping/data/shopping_attachment_repository_test.dart`
- `test/features/shopping/presentation/shopping_item_new/shopping_item_new_notifier_test.dart`
- `test/features/shopping/presentation/shopping_item_new/shopping_item_new_page_test.dart`
- `test/features/shopping/presentation/shopping_item_detail/shopping_item_detail_notifier_test.dart`
- `test/features/shopping/presentation/shopping_item_detail/shopping_item_detail_page_test.dart`

### 編集
- `lib/features/shopping/data/shopping_repository.dart`（メソッド追加）
- `lib/features/shopping/shopping_providers.dart`（attachment / notifier providers 追加）
- `lib/app_router.dart`（2ヶ所の builder 差し替え）
- `lib/l10n/app_ja.arb` / `app_en.arb` / `app_es.arb`

---

## コミット前チェックリスト

- [ ] ACをすべて満たしているか（AC1〜AC11）
- [ ] `dart format .`
- [ ] `flutter analyze`（警告ゼロ）
- [ ] `flutter test`（全グリーン）
- [ ] `coverage.ps1` で features.shopping 配下のカバレッジ ≥95%
- [ ] AppLocalizations の import パスは `lib/l10n/app_localizations.dart` への相対パス
- [ ] image_picker の権限設定（AndroidManifest / Info.plist）を追加した
- [ ] シミュレーターまたはウィジェットテストで主要画面の見た目（ステップUI・サムネ横スクロール・ボトムシート）を確認した
- [ ] `git push origin feature/85-mobile-shopping-list`

---

## 作業ルール

- [DEV] プレフィックスをDiscord投稿に必ずつける
- 作業スレッドID: `1504279756722405467`
- ブランチ: `feature/85-mobile-shopping-list`（既存・新規作成しない）
- PRはSMが行う。DEVはpushまでが担当

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #86 買い物アイテム作成・詳細画面実装 | 計画フェーズ完了・Sonnetでの実装フェーズ待ち |

---

## ハマりポイントログ

（実装フェーズで都度追加する）
