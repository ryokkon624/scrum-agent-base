# Sprint 36 バックログ

## スプリントゴール

買い物リスト機能のバグ4件を修正し、メモ欄更新・エラー通知・削除反映・ステータス反映をすべてリアルタイムに正しく動作させる

## ブランチ

既存ブランチ `feature/85-mobile-shopping-list` を継続使用する（新規ブランチ作成不要）。
**各Issueごとに個別コミットを作成すること。**

---

## Issue一覧

| Issue | タイトル | SP |
|-------|---------|-----|
| #97 | [mobile]買い物アイテム追加画面でお気に入りから選んだ際に、メモ欄が更新されない | - |
| #99 | [mobile]共通エラー通知インフラが実装済みにも関わらず、hw-hub-mobile全体の各Notifierで利用されていない | - |
| #108 | [mobile]買い物アイテム詳細画面でアイテムを削除後、一覧から該当カードが消えていない | - |
| #107 | [mobile]買い物アイテム詳細画面でステータス変更後に一覧へ戻ると該当カードがタブ移動されていない | - |

---

## #97: お気に入り選択時にメモ欄が更新されない

**ブランチ**: `feature/85-mobile-shopping-list`
**コミット番号**: `fix: お気に入り選択時のメモ欄更新漏れを修正 (ryokkon624/hw-hub-manage#97)`

### 発生事象

買い物アイテム追加画面でお気に入りから選択した際に、メモ欄が更新されない。

### 期待動作

メモを入力後、お気に入りから選択すると以下になるべき：
- メモがないものを選択：空欄に更新される
- メモがあるものを選択：メモ欄が選択したメモで更新される

### ユーザーストーリー

**As a** 買い物リストを使うユーザー
**I want to** お気に入りや購入履歴から選択したときに全フィールドが正しく反映されてほしい
**So that** 選択内容を手動で修正する手間なく素早くアイテムを追加できる

### Acceptance Criteria

- [x] AC1: お気に入りからメモなしのアイテムを選択すると、メモ欄が空欄に更新される
- [x] AC2: お気に入りからメモありのアイテムを選択すると、メモ欄が選択アイテムのメモで更新される
- [x] AC3: 購入履歴からの選択時も同様にメモ欄が正しく更新される（メモなし→空欄、メモあり→そのメモで更新）
- [x] AC4: 他の入力欄（アイテム名・購入場所等）の更新動作はリグレッションしない

### 原因
<!-- 原因分析後に更新 -->

### 改修方針
<!-- 原因分析後に更新 -->

### 備考

- 依存関係：なし

---

## #99: 全NotifierへのAppSnackBarエラー通知横展開

**ブランチ**: `feature/85-mobile-shopping-list`
**コミット番号**: `fix: 全NotifierへのAppSnackBarエラー通知横展開 (ryokkon624/hw-hub-manage#99)`

### 発生事象

`AppSnackBar`（`core/ui/app_snack_bar.dart`）・`AppException`（`core/network/app_exception.dart`）の共通エラー通知インフラが実装済みにも関わらず、hw-hub-mobile全体の各Notifierで利用されていない。
そのため、API通信等でエラーが発生してもユーザーへの通知が行われず、操作が無言で失敗する。

また、`catch (_) {}` の握りつぶし修正時に `try { ... } catch (_) { rethrow; }` という意味のないコードが残存している（Notifier末端でのrethrowはRiverpodに吸収されるだけでUIへの反映がない）。

### ユーザーストーリー

**As a** ユーザー
**I want to** 操作が失敗した際にエラーメッセージが表示されてほしい
**So that** 何が起きたか把握し、再操作の判断ができる

### Acceptance Criteria

- [x] AC1: 意味のない `try { ... } catch (_) { rethrow; }` が hw-hub-mobile全体から除去されている
- [x] AC2: 各Notifierの catchブロックで `AppException` を捕捉し、`state = AsyncData(current.copyWith(errorMessage: e.message))` にエラーを格納している
- [x] AC3: 予期しない Exception は汎用エラーメッセージを errorMessage としてstateに格納している（Notifierでrethrowしない）
- [x] AC4: 各Pageで errorMessage を `ref.listen` で監視し、変化時に `AppSnackBar.showError()` を呼んでいる
- [x] AC5: 対象は hw-hub-mobile 全体（shopping / task / household / その他全feature）

### 対応方針

`shopping_item_detail_notifier.dart` / `shopping_item_detail_page.dart` の既存実装パターンをリファレンスに、全featureへ横展開する。

**Notifier側パターン（リファレンス: shopping_item_detail_notifier.dart）**

```dart
try {
  await repo.someOperation();
  state = AsyncData(current.copyWith(...));
} on AppException catch (e) {
  state = AsyncData(current.copyWith(errorMessage: e.message));
} catch (e) {
  state = AsyncData(current.copyWith(errorMessage: 'エラーが発生しました'));
}
```

**Page側パターン（リファレンス: shopping_item_detail_page.dart）**

```dart
ref.listen(someNotifierProvider, (_, next) {
  final errorMessage = next.valueOrNull?.errorMessage;
  if (errorMessage != null) {
    AppSnackBar.showError(errorMessage);
  }
});
```

### 原因

`catch (_) {}` の握りつぶし修正時に、共通SnackBarインフラの存在を把握せずに `rethrow` で対応したため、ユーザー通知までの実装が未完了となった。

### 備考

- 依存関係：なし

---

## #108: 詳細画面削除後、一覧から該当カードが消えていない

**ブランチ**: `feature/85-mobile-shopping-list`
**コミット番号**: `fix: 買い物アイテム詳細画面削除後の一覧即時反映を修正 (ryokkon624/hw-hub-manage#108)`

### 発生事象

買い物アイテム詳細画面でアイテムを削除後、買い物リスト一覧画面に戻っても該当カードが消えていない。
アプリ再起動後は消えている。

### ユーザーストーリー

**As a** 買い物リストを使うユーザー
**I want to** 詳細画面でアイテムを削除したら即座に一覧から消えてほしい
**So that** 削除結果がリアルタイムに反映されることを確認できる

### Acceptance Criteria

- [x] AC1: 詳細画面でアイテムを削除後、買い物リスト一覧画面に戻ると該当カードが一覧から消えている
- [x] AC2: アプリ再起動なしで反映が確認できる

### 原因
<!-- 原因分析後に更新 -->

### 改修方針
<!-- 原因分析後に更新 -->

### 備考

- Sprint 35 Review で発覚（#94 AC2未達）
- 依存関係：なし

---

## #107: 詳細画面ステータス変更後、一覧でタブ移動されていない

**ブランチ**: `feature/85-mobile-shopping-list`
**コミット番号**: `fix: 買い物アイテム詳細画面ステータス変更後の一覧即時反映を修正 (ryokkon624/hw-hub-manage#107)`

### 発生事象

買い物アイテム詳細画面でステータスを変更し、一覧に戻ると該当カードがタブ移動されていない。
「保存ボタン」押下で戻る場合は反映される。

### 原因（推定）

ステータス変更は即時APIコールであるため、保存ボタン押下せずともステータスは変更される。このタイミングで `shoppingListNotifierProvider` の state が更新されていないと、一覧に戻った際にAPIコール前の状態で残ってしまう。

### ユーザーストーリー

**As a** 買い物リストを使うユーザー
**I want to** 詳細画面でステータス変更後に一覧へ戻ったとき最新の状態で表示させたい
**So that** 操作結果が即時反映され、意図しない状態で表示されなくなる

### Acceptance Criteria

- [x] AC1: 詳細画面でステータスを変更後（保存ボタン押下なし）、一覧に戻ると該当カードが変更後のタブに移動している
- [x] AC2: 未購入→かご・かご→購入済みいずれのステータス変更でも一覧に即時反映される
- [x] AC3: 保存ボタン押下で一覧へ戻る動作が引き続き正常に動作する（リグレッションなし）

### 原因
<!-- 原因分析後に更新 -->

### 改修方針
<!-- 原因分析後に更新 -->

### 備考

- Sprint 35 Review で発覚
- 依存関係：なし
