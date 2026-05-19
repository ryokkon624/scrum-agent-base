# Sprint 47 実装方針（承認済み）

## 対象Issue
- #136 モバイル家事設定 一覧画面
- #137 モバイル家事設定 新規作成画面
- #138 モバイル家事設定 編集画面

## ブランチ
`feature/136-mobile-housework-settings`（3 Issue統合、1ブランチ）

## ディレクトリ構成

```
lib/features/housework_settings/
├── housework_settings_providers.dart
├── data/
│   ├── housework_settings_api.dart
│   ├── housework_settings_repository.dart
│   └── models/
│       ├── housework_dto.dart
│       ├── housework_save_request.dart
│       └── housework_template_dto.dart
└── presentation/
    ├── housework_list/
    │   ├── housework_list_page.dart
    │   ├── housework_list_notifier.dart
    │   ├── housework_list_state.dart
    │   └── widgets/
    │       ├── housework_card.dart
    │       └── category_filter_dropdown.dart
    ├── housework_create/
    │   ├── housework_create_page.dart
    │   ├── housework_create_notifier.dart
    │   ├── housework_create_state.dart
    │   └── widgets/
    │       └── template_picker_modal.dart
    ├── housework_edit/
    │   ├── housework_edit_page.dart
    │   ├── housework_edit_notifier.dart
    │   └── housework_edit_state.dart
    └── widgets/
        ├── housework_form.dart
        ├── weekly_days_selector.dart
        ├── month_day_selector.dart
        └── nth_weekday_selector.dart
```

## API仕様

- `GET /api/houseworks?householdId={id}` → `List<HouseworkDto>`（フラット配列）
- `GET /api/houseworks/{id}` → `HouseworkDto`
- `POST /api/houseworks` → 201 + `HouseworkDto`
- `PUT /api/houseworks/{id}` → `HouseworkDto`
- `GET /api/housework-templates` → `List<HouseworkTemplateResponse>`（フラット配列）
- `weeklyDays`: 7bitビットマスクInteger（bit0=日, bit1=月, …, bit6=土）
- `dayOfMonth=31`: 月末扱い（セレクト「1〜30, 月末」、内部値=31）

## カテゴリフィルタ選択肢（修正確定）
「すべて / 掃除 / キッチン / ガーデン / ゴミ / ペット / **その他**」（Web版に合わせてOtherを追加）

## フォームデフォルト値
- `category=CLEAN`
- `recurrenceType=WEEKLY`
- `startDate=2025-01-01`
- `endDate=2099-12-31`
- `weeklyDaysMask=0`（ユーザー選択必須）

## 設計キーポイント
- `HouseworkFormState` の `copyWith` は全フィールド列挙
- 保存成功後に `ref.invalidate(houseworkListNotifierProvider)` 実施
- 全ProviderはAutoDispose付与
- 世帯切替時は `ref.watch(householdNotifierProvider.future)` で一覧自動再取得
- 削除機能なし（有効終了日で運用）

## テスト方針
- テスト検証はKeyベース（`find.byKey`）、日本語直接検証禁止
- カバレッジ ≥ 95%（全Issue）
- AutoDispose未設定・dynamic型乱用に注意

## 作業順
1. #136 一覧画面
2. #137 新規作成（共通フォーム作成）
3. #138 編集（共通フォーム流用）
