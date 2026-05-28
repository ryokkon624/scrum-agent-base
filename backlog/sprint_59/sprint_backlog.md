# Sprint 59 バックログ

## スプリントゴール

モバイルアプリの共通ユーティリティ・共通コンポーネントの呼び出しを統一し、日時フォーマット・SnackBar・ダイアログの重複実装と混在パターンを解消する

---

## 対象Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|-------|-----|
| #167 | [mobile] 日時フォーマット処理が複数ファイルに重複している | refactor | - |
| #169 | [mobile] SnackBar の呼び出し方が AppSnackBar と ScaffoldMessenger で混在している | refactor | - |
| #170 | [mobile] 確認ダイアログの実装が AppDialog と showDialog() 直接呼び出しで混在している | refactor | - |

---

## Issue #167: [mobile] 日時フォーマット処理が複数ファイルに重複している

**ラベル**: refactor
**ブランチ名**: DEV計画フェーズで決定（1ブランチ方針：#167, #169, #170 を同一ブランチにまとめる）
**コミット参照**: `(ryokkon624/hw-hub-manage#167)`

### 発生事象

同一の日時フォーマット処理（ISO文字列 → `yyyy/MM/dd HH:mm` 形式）が複数ファイルにコピーされており、修正時に漏れが発生するリスクがある。

| ファイル | 関数名 | 内容 |
|---------|-------|------|
| `features/inquiry/presentation/inquiry_list/inquiry_list_page.dart` | `_formatDateTime()` | `yyyy/MM/dd HH:mm` 形式 |
| `features/inquiry/presentation/inquiry_detail/widgets/message_bubble.dart` | `_formatDateTime()` | 上と全く同じ実装 |
| `features/notifications/presentation/widgets/notification_list_item.dart` | `_formatDate()` | 秒数（HH:mm:ss）を含む別フォーマット |

### ユーザーストーリー

**As a** 開発者
**I want to** 日時フォーマット処理を1箇所に集約したい
**So that** フォーマット変更時の修正漏れや表記ゆれを防げる

### Acceptance Criteria

- [x] AC1: `lib/core/utils/date_format_utils.dart` に共通の日時フォーマット関数が定義される
- [x] AC2: `inquiry_list_page.dart` のプライベート `_formatDateTime()` が共通関数に置き換わる
- [x] AC3: `message_bubble.dart` のプライベート `_formatDateTime()` が共通関数に置き換わる
- [x] AC4: `notification_list_item.dart` のプライベート `_formatDate()` が共通関数に置き換わる

### 原因

日時フォーマット処理が各ウィジェット・ページのプライベート関数として実装されており、共通ユーティリティが存在しない。

### 実装案

#### 1. 共通ユーティリティ関数の作成

**新規作成ファイル:** `lib/core/utils/date_format_utils.dart`

```dart
String formatDateTime(String isoString) {
  try {
    final dt = DateTime.parse(isoString);
    final y = dt.year;
    final mo = dt.month.toString().padLeft(2, '0');
    final d = dt.day.toString().padLeft(2, '0');
    final h = dt.hour.toString().padLeft(2, '0');
    final mi = dt.minute.toString().padLeft(2, '0');
    return '$y/$mo/$d $h:$mi';
  } catch (_) {
    return isoString;
  }
}

String formatDateTimeWithSeconds(String isoString) {
  try {
    final dt = DateTime.parse(isoString);
    final y = dt.year;
    final mo = dt.month.toString().padLeft(2, '0');
    final d = dt.day.toString().padLeft(2, '0');
    final h = dt.hour.toString().padLeft(2, '0');
    final mi = dt.minute.toString().padLeft(2, '0');
    final s = dt.second.toString().padLeft(2, '0');
    return '$y/$mo/$d $h:$mi:$s';
  } catch (_) {
    return isoString;
  }
}
```

#### 2. 各ファイルの差し替え

```dart
// 変更前（inquiry_list_page.dart, message_bubble.dart）
_formatDateTime(occurredAt)

// 変更後
formatDateTime(occurredAt)

// 変更前（notification_list_item.dart）
_formatDate(occurredAt)

// 変更後
formatDateTimeWithSeconds(occurredAt)
```

#### 対象ファイル一覧

| ファイル | 現状 | 対応 |
|---|---|---|
| `core/utils/date_format_utils.dart` | 存在しない | 新規作成 |
| `features/inquiry/presentation/inquiry_list/inquiry_list_page.dart` | プライベート `_formatDateTime()` | 共通関数に差し替え |
| `features/inquiry/presentation/inquiry_detail/widgets/message_bubble.dart` | プライベート `_formatDateTime()` | 共通関数に差し替え |
| `features/notifications/presentation/widgets/notification_list_item.dart` | プライベート `_formatDate()` | 共通関数に差し替え |

### 改修方針

上記「実装案」の通り。

### 備考

- 依存関係：なし

---

## Issue #169: [mobile] SnackBar の呼び出し方が AppSnackBar と ScaffoldMessenger で混在している

**ラベル**: refactor
**ブランチ名**: DEV計画フェーズで決定（1ブランチ方針）
**コミット参照**: `(ryokkon624/hw-hub-manage#169)`

### 発生事象

SnackBar の表示方法が `AppSnackBar` ユーティリティと `ScaffoldMessenger` の直接呼び出しで混在しており、統一されていない。

| 方式 | 使用箇所例 |
|-----|----------|
| `AppSnackBar.showError()` / `showSuccess()` | `account_settings_page.dart` 等（多数） |
| `ScaffoldMessenger.of(context).showSnackBar(SnackBar(...))` | `shopping_item_new_page.dart`、`shopping_item_detail_page.dart` 等 |

```dart
// 旧パターン（shopping_item_new_page.dart）
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text(l10n.shoppingNewToastSuccess))
);

// 統一パターン（account_settings_page.dart）
AppSnackBar.showSuccess(val.successMessage!);
```

### ユーザーストーリー

**As a** 開発者
**I want to** SnackBar の呼び出しを `AppSnackBar` に統一したい
**So that** SnackBar のスタイル変更を一箇所で管理でき、コードの一貫性が保たれる

### Acceptance Criteria

- [x] AC1: `shopping_item_new_page.dart` の `ScaffoldMessenger` 直接呼び出しが `AppSnackBar` に置き換わる
- [x] AC2: `shopping_item_detail_page.dart` の `ScaffoldMessenger` 直接呼び出しが `AppSnackBar` に置き換わる
- [x] AC3: その他 `ScaffoldMessenger.of(context).showSnackBar()` を直接呼び出しているファイルが `AppSnackBar` に置き換わる
- [x] AC4: `ScaffoldMessenger` の直接呼び出しがコードベース内に残っていない

### 原因

`AppSnackBar` が導入される前に実装されたページが旧パターンのまま残っており、新規実装では `AppSnackBar` を使っているため混在が生じている。

### 実装案

#### 対象ファイルの差し替え

```dart
// 変更前
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text(l10n.shoppingNewToastSuccess))
);

// 変更後
AppSnackBar.showSuccess(l10n.shoppingNewToastSuccess);
```

#### 対象ファイル一覧

| ファイル | 対応 |
|---|---|
| `features/shopping/presentation/shopping_item_new/shopping_item_new_page.dart` | `AppSnackBar` に差し替え |
| `features/shopping/presentation/shopping_item_detail/shopping_item_detail_page.dart` | `AppSnackBar` に差し替え |
| その他 `ScaffoldMessenger` 直接呼び出し箇所（要調査） | `AppSnackBar` に差し替え |

### 改修方針

上記「実装案」の通り。

### 備考

- 依存関係：なし

---

## Issue #170: [mobile] 確認ダイアログの実装が AppDialog と showDialog() 直接呼び出しで混在している

**ラベル**: refactor
**ブランチ名**: DEV計画フェーズで決定（1ブランチ方針）
**コミット参照**: `(ryokkon624/hw-hub-manage#170)`

### 発生事象

確認ダイアログの表示方法が `AppDialog` ユーティリティと `showDialog()` の直接呼び出しで混在しており、統一されていない。

| 方式 | 使用箇所例 |
|-----|----------|
| `AppDialog.confirm()` / `AppDialog.alert()` | 一部のページ |
| `showDialog<bool>(context: context, builder: ...)` 直接呼び出し | `bulk_skip_dialog.dart`、`bulk_purchase_dialog.dart`、`inquiry_detail_page.dart` 等 |

```dart
// 旧パターン（bulk_skip_dialog.dart 等）
await showDialog<bool>(
  context: context,
  builder: (context) => AlertDialog(
    title: Text(...),
    actions: [...],
  ),
);

// 統一パターン
await AppDialog.confirm(
  context: context,
  title: '...',
  message: '...',
);
```

### ユーザーストーリー

**As a** 開発者
**I want to** 確認ダイアログの呼び出しを `AppDialog` に統一したい
**So that** ダイアログのデザイン変更を一箇所で管理でき、コードの一貫性が保たれる

### Acceptance Criteria

- [x] AC1: `bulk_skip_dialog.dart` の `showDialog()` 直接呼び出しが `AppDialog` に置き換わる
- [x] AC2: `bulk_purchase_dialog.dart` の `showDialog()` 直接呼び出しが `AppDialog` に置き換わる
- [x] AC3: `inquiry_detail_page.dart` の `showDialog()` 直接呼び出しが `AppDialog` に置き換わる
- [x] AC4: その他 `showDialog()` を直接呼び出しているファイルが `AppDialog` に置き換わる

### 原因

`AppDialog` が導入される前に実装されたページが旧パターンのまま残っており、新規実装では `AppDialog` を使っているため混在が生じている。

### 実装案

#### 対象ファイルの差し替え

```dart
// 変更前
await showDialog<bool>(
  context: context,
  builder: (context) => AlertDialog(
    title: Text(l10n.bulkSkipDialogTitle),
    content: Text(l10n.bulkSkipDialogMessage),
    actions: [
      TextButton(onPressed: () => Navigator.pop(context, false), child: Text(l10n.cancel)),
      TextButton(onPressed: () => Navigator.pop(context, true), child: Text(l10n.confirm)),
    ],
  ),
);

// 変更後
await AppDialog.confirm(
  context: context,
  title: l10n.bulkSkipDialogTitle,
  message: l10n.bulkSkipDialogMessage,
);
```

`AppDialog` に不足しているパターン（例：削除確認）があれば `AppDialog.confirmDelete()` 等のメソッドを追加する。

#### 対象ファイル一覧

| ファイル | 対応 |
|---|---|
| `features/housework_assign/presentation/widgets/bulk_skip_dialog.dart` | `AppDialog` に差し替え |
| `features/shopping/presentation/widgets/bulk_purchase_dialog.dart` | `AppDialog` に差し替え |
| `features/inquiry/presentation/inquiry_detail/inquiry_detail_page.dart` | `AppDialog` に差し替え |
| その他 `showDialog()` 直接呼び出し箇所（要調査） | `AppDialog` に差し替え |

### 改修方針

上記「実装案」の通り。

### 備考

- 依存関係：なし

---

## リスク・チャレンジ

- **3件すべてrefactor・要調査ファイルあり**: #169（ScaffoldMessenger直接呼び出し箇所）・#170（showDialog()直接呼び出し箇所）はIssue Bodyに「要調査」と記載されており、実際の対象ファイル数は計画フェーズで確認する
- **1ブランチ方針（Sprint 55 確立）**: 3件すべてを同一ブランチにIssue単位でコミットを積む。ブランチ名はDEVが計画フェーズで決定する
- **AppDialog のメソッド不足の可能性**: #170 で `showDialog()` を置き換える際、`AppDialog` に対応するメソッドが存在しない場合は新規追加が必要。DEVは計画フェーズで `AppDialog` の既存メソッドを確認すること
