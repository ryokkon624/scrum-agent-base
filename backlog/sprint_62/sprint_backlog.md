# Sprint 62 バックログ

## スプリントゴール

モバイルのエラー表示を統一し、周期選択表示をWeb版と揃え、問合せ送信後のUXを改善する

---

## ブランチ方針

複数Issue実装は1ブランチにまとめる方針（Sprint 55確立）。
ブランチ名: `fix/160-mobile-ui-fixes`（リポジトリ: hw-hub-mobile）

---

## Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #160 | [mobile] エラーが発生した際の表示方法が画面によって異なる | bug | - |
| #162 | [mobile] 家事設定系の画面で周期「第n曜日」の選択肢と周期タイプの表記がWeb版と異なる | bug | - |
| #164 | [mobile] 問合せ追加画面で送信後、問い合わせ一覧画面に遷移する | feature | - |

---

## #160 [mobile] エラーが発生した際の表示方法が画面によって異なる

**⚠️ bugラベル: 計画フェーズで根本原因を調査・改修方針を確認すること（Issue Bodyに実装案・改修方針記載済み）**

### 発生事象

エラー発生時のUI表示が画面によって統一されていない。

| 画面 | 表示内容 |
|------|----------|
| ホーム画面 | !マーク ＋ エラーメッセージ ＋ 再読み込みボタン |
| 家事割り当て画面 | エラーメッセージのみ |
| My Tasks画面 | !マーク ＋ エラーメッセージ ＋ 再試行ボタン |
| 買い物リスト画面 | !マーク ＋ エラーメッセージ ＋ 再試行ボタン（My Tasks画面とは別デザイン） |
| 家事設定画面 | エラーメッセージのみ |

ホーム画面のデザイン（!マーク ＋ エラーメッセージ ＋ 再読み込みボタン）に統一する。

### ユーザーストーリー

**As a** アプリユーザー
**I want to** エラーが発生した際にどの画面でも一貫したUIで表示されてほしい
**So that** エラー時の操作方法が直感的にわかる

### Acceptance Criteria

- [x] AC1: 家事割り当て画面のエラー表示がホーム画面と同一デザイン（!マーク ＋ エラーメッセージ ＋ 再読み込みボタン）になる
- [x] AC2: My Tasks画面のエラー表示がホーム画面と同一デザインになる
- [x] AC3: 買い物リスト画面のエラー表示がホーム画面と同一デザインになる
- [x] AC4: 家事設定画面のエラー表示がホーム画面と同一デザインになる

### 原因

各画面が独自にエラーWidgetを実装しており、共通基盤がない。
`home_page.dart` の `_ErrorBody` がプライベートクラスとして定義されているため、他画面から参照できない。
エラーメッセージの変換ロジック（例外種別 → i18n キー）も `home_page.dart` にベタ書きされており、各画面が独自の文字列生成を行っている。

### 実装案

#### 1. 共通Widgetの作成

`home_page.dart` のプライベートクラス `_ErrorBody` を `core/ui/` に昇格させ、アプリ全体で使える共通Widgetとする。

**新規作成ファイル:** `lib/core/ui/app_error_view.dart`

```dart
class AppErrorView extends StatelessWidget {
  const AppErrorView({super.key, required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  // !マーク ＋ エラーメッセージ ＋ 再読み込みボタン のレイアウト
}
```

#### 2. エラーメッセージ変換ロジックの共通化

`home_page.dart` にベタ書きされている例外種別 → i18n キーの変換ロジックを共通関数として切り出す。

**追加先:** `lib/core/ui/app_error_view.dart`（または `lib/core/network/` 配下）

```dart
String resolveErrorMessage(Object error, AppLocalizations l10n) {
  if (error is NetworkException) return l10n.errorNetwork;
  if (error is UnauthorizedException) return l10n.errorUnauthorized;
  if (error is ServerException) return l10n.errorServer;
  if (error is AppException) return error.message;
  return l10n.errorUnexpected;
}
```

#### 3. 各画面の差し替え

対象4画面の `error:` ハンドラを `AppErrorView` に統一する。

```dart
// 変更前（例: housework_create_page.dart）
error: (e, _) => Center(child: Text(e.toString())),

// 変更後
error: (e, _) => AppErrorView(
  message: resolveErrorMessage(e, l10n),
  onRetry: () => ref.invalidate(xxxProvider),
),
```

#### 対象ファイル一覧

| ファイル | 現状 | 対応 |
|---|---|---|
| `core/ui/app_error_view.dart` | 存在しない | 新規作成（Widget ＋ 変換関数） |
| `features/home/presentation/home_page.dart` | `_ErrorBody` ＋ 変換ロジック定義 | `AppErrorView` ＋ `resolveErrorMessage` に差し替え |
| `features/housework_assign/presentation/housework_assign_page.dart` | 独自実装 | `AppErrorView` に差し替え |
| `features/my_tasks/presentation/my_tasks_page.dart` | 独自実装 | `AppErrorView` に差し替え |
| `features/shopping_list/presentation/shopping_list_page.dart` | 独自実装 | `AppErrorView` に差し替え |
| `features/housework_settings/presentation/housework_create/housework_create_page.dart` | `Center(child: Text(...))` | `AppErrorView` に差し替え |

### 改修方針

上記「実装案」の通り。

### 備考

- 依存関係：なし
- ブランチ: `fix/160-mobile-ui-fixes`

---

## #162 [mobile] 家事設定系の画面で周期「第n曜日」の選択肢と周期タイプの表記がWeb版と異なる

**⚠️ bugラベル: 計画フェーズで根本原因を調査し、GitHub Issue Body（原因・改修方針）を更新すること**

### 発生事象

家事設定系の画面において、以下2点の表示がWeb版と異なっている。

1. 周期「第n曜日」を選択している場合、第n週の最後の選択肢が「最終週」と表示されない
2. 周期タイプの表記が「第n週曜日」になっているが、正しくは「第n曜日」

### ユーザーストーリー

**As a** アプリユーザー
**I want to** 家事設定画面の周期選択の表示がWeb版と同じ表記で表示されてほしい
**So that** WebとモバイルでUI表記が一致しており混乱なく操作できる

### Acceptance Criteria

- [x] AC1: 周期「第n曜日」を選択している場合、第n週の最終の選択肢が「最終週」と表示される
- [x] AC2: 周期タイプの表記が「第n曜日」と表示される（「第n週曜日」から修正）

### 原因

<!-- 原因分析後に更新 -->

### 改修方針

<!-- 原因分析後に更新 -->

### 備考

- 依存関係：なし
- ブランチ: `fix/160-mobile-ui-fixes`（#160と同一ブランチ）

---

## #164 [mobile] 問合せ追加画面で送信後、問い合わせ一覧画面に遷移する

### ユーザーストーリー

**As a** アプリユーザー
**I want to** 問い合わせを送信後、問い合わせ一覧画面に遷移し送信した問い合わせが一覧に表示されてほしい
**So that** 送信が完了したことを一覧で確認できる

### Acceptance Criteria

- [x] AC1: 問合せ追加画面で送信後、問い合わせ一覧画面に遷移する
- [x] AC2: 遷移後の問い合わせ一覧に、送信した問い合わせが表示されている

### 備考

- 優先順位の根拠：送信後に詳細画面に遷移する意味がなく、一覧への直接遷移の方がUXが良い
- 依存関係：#149（問い合わせ一覧への遷移対応）
- ブランチ: `fix/160-mobile-ui-fixes`（#160/#162と同一ブランチ）
