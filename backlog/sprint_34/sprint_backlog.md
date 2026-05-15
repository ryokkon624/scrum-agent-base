# Sprint 34 バックログ

**スプリント番号**: 34
**スプリントゴール**: 買い物アイテム作成・詳細画面をモバイルに実装し、画像添付や履歴からの選択で買い物リストをより充実させられるようにする
**対象ブランチ**: `feature/85-mobile-shopping-list`（Sprint33から継続使用）

---

## Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #86 | [mobile] 買い物アイテム作成・詳細画面を実装する (#14/#15) | feature | - |

---

## #86: [mobile] 買い物アイテム作成・詳細画面を実装する (#14/#15)

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/86
**ラベル**: feature
**ブランチ名**: `feature/85-mobile-shopping-list`（Sprint33から継続使用）

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** 買い物アイテムをモバイルから作成・編集でき、画像を添付したい
**So that** 商品の見た目をメモしながら買い物リストを充実させられる

### Acceptance Criteria

- [x] AC1: （#14作成）品名（必須）・メモ・購入場所・お気に入りチェックを入力し、アイテムを登録できる（`POST /api/households/{id}/shopping-items`）
- [x] AC2: （#14作成）image_pickerでカメラまたはフォトライブラリから画像を1枚選択して添付できる（Presigned URL経由でS3にアップロード）
- [x] AC3: （#14作成）「過去の購入から選ぶ」ボトムシートで品名・購入場所・期間フィルタを使って購入履歴からアイテムを選択しフォームに反映できる
- [x] AC4: （#14作成）「お気に入りから選ぶ」ボトムシートで品名・購入場所フィルタを使ってお気に入りアイテムを選択しフォームに反映できる
- [x] AC5: （#14作成）登録完了後、#13買い物リスト画面に戻る
- [x] AC6: （#15詳細）品名・メモ・購入場所・お気に入りを編集して保存できる（`PATCH /api/shopping-items/{id}`）
- [x] AC7: （#15詳細）ステータスをステップ表示（未購入→かご→購入済み）でタップ変更できる（`PATCH /api/shopping-items/{id}/status`）
- [x] AC8: （#15詳細）登録済み画像を横スクロールで表示し、各画像を削除できる（`DELETE /api/shopping-items/{id}/attachments/{attachmentId}`）
- [x] AC9: （#15詳細）image_pickerで画像を1枚ずつ追加できる（Presigned URL経由でS3にアップロード後、`POST /api/shopping-items/{id}/attachments`で登録）
- [x] AC10: （#15詳細）「このアイテムを削除」ボタンで確認ダイアログ後にアイテムを削除し、#13買い物リスト画面に戻る（`DELETE /api/shopping-items/{id}`）
- [x] AC11: テストカバレッジ ≥95%（Notifier・ウィジェットテスト）

### 備考

- 優先順位の根拠：#13買い物リストからの遷移先。#13と同スプリント実装を想定
- 依存関係：#13買い物リスト画面（画面遷移元）を先行して実装すること。`image_picker` パッケージ導入が必要
- ブランチ名：`feature/85-mobile-shopping-list` （#85で対応していたブランチ）
- 仕様書：`hw-hub-mobile/docs/mobile-spec/14_shopping_item_new.md` / `15_shopping_item_detail.md` / `common/image_upload.md`

---

## SMメモ

- featureラベルのため計画フェーズでの根本原因調査は不要
- 既存ブランチ `feature/85-mobile-shopping-list` を継続使用する（新規ブランチ作成しないこと）
- 既存PRがある場合はbodyをPATCHで更新してSprintN分の closes 行を追加する
- AC2/AC9でimage_picker経由のPresigned URLアップロードが必要。パッケージ導入状況と実装方針をDEVに事前確認させること
- AC3「過去の購入から選ぶ」・AC4「お気に入りから選ぶ」のボトムシートは独自UI。DEVの実装方針を丁寧に確認すること
- AC11テストカバレッジ≥95%。image_pickerのモック戦略を実装前に整理すること
