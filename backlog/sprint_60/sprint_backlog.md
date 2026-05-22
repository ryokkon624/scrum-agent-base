# Sprint 60 バックログ

## スプリントゴール

モバイルコードベースの構造的負債を解消する：エラーハンドリングの共通化・Provider定義の集約・フォルダ構成の整理を通じて、各 Notifier のコードを簡潔で一貫性のある状態にする。

---

## 対象 Issue

| Issue | タイトル | ラベル | SP |
|-------|---------|-------|-----|
| #168 | [mobile] Notifier のエラーハンドリングコードが複数箇所に重複している | refactor | - |
| #173 | [mobile] Notifier Provider の定義が各 Notifier ファイルに分散している | refactor | - |
| #174 | [mobile] 単一ページの feature で presentation 配下に不要なサブフォルダがある | refactor | - |
| #175 | [mobile] テストフォルダの構成が lib フォルダの構成と対応していない | refactor | - |

---

## Issue #168: [mobile] Notifier のエラーハンドリングコードが複数箇所に重複している

**GitHub Issue**: ryokkon624/hw-hub-manage#168  
**ラベル**: refactor  
**ブランチ名**: `refactor/168-notifier-error-handling`（複数Issue実装のため他Issueのコミットも同ブランチに積む）

### 発生事象

`AppException` を捕捉して `state.copyWith(errorMessage: ...)` にセットする try/catch ブロックが、複数の Notifier に全く同じ形で繰り返し実装されている。

```dart
// shopping_list_notifier.dart（moveToBasket / markPurchased / moveBackToUnpurchased / toggleFavorite の4箇所）
} on AppException catch (e) {
  state = AsyncData(current.copyWith(errorMessage: e.message));
} catch (_) {
  state = AsyncData(current.copyWith(errorMessage: 'errorUnexpected'));
}
```

```dart
// my_tasks_notifier.dart でも同一パターン
} on AppException catch (e) {
  state = AsyncData(current.copyWith(errorMessage: e.message));
} catch (_) {
  state = AsyncData(current.copyWith(errorMessage: 'errorUnexpected'));
}
```

`shopping_list_notifier.dart` 内だけでこのパターンが **4回** 重複している。

### ユーザーストーリー

**As a** 開発者  
**I want to** エラーハンドリングの定型コードを1箇所に集約したい  
**So that** エラー処理の変更を一括で適用でき、各 Notifier のコードを簡潔に保てる

### Acceptance Criteria

- [ ] AC1: `shopping_list_notifier.dart` の重複する try/catch ブロック（4箇所）がヘルパーに置き換わる
- [ ] AC2: `my_tasks_notifier.dart` の try/catch ブロックがヘルパーに置き換わる
- [ ] AC3: 同様のパターンを持つ他の Notifier も同じヘルパーを使うよう修正される
- [ ] AC4: ヘルパーを使用した後も既存のエラーハンドリング動作が変わらない

### 原因

エラーハンドリングのための共通基盤（基底クラス・ミックスイン・ヘルパー関数）が存在せず、各 Notifier が同じパターンを独自に実装している。

### 実装案

#### 各 Notifier に `_runCatching()` ヘルパーを追加する

```dart
// 変更後（各 Notifier のメソッド）
Future<void> moveToBasket(int itemId) async {
  await _runCatching(() async {
    await _repository.moveToBasket(itemId);
    // 成功時の state 更新
  });
}

// ヘルパーメソッド（各 Notifier に追加）
Future<void> _runCatching(
  Future<void> Function() operation, {
  required T Function(String errorMessage) onError,
}) async {
  final current = state.requireValue;
  try {
    await operation();
  } on AppException catch (e) {
    state = AsyncData(onError(e.message));
  } catch (_) {
    state = AsyncData(onError('errorUnexpected'));
  }
}
```

#### 対象ファイル一覧

| ファイル | 重複箇所数 | 対応 |
|---|---|---|
| `features/shopping/presentation/shopping_item_list/shopping_list_notifier.dart` | 4箇所 | `_runCatching()` に統一 |
| `features/tasks/presentation/my_tasks_notifier.dart` | 1箇所以上 | `_runCatching()` に統一 |
| その他同パターンの Notifier | 要調査 | `_runCatching()` に統一 |

### 改修方針

上記「実装案」の通り。各 Notifier の `onError` の型は State の型に合わせて調整する。

### 備考

- 依存関係：なし

---

## Issue #173: [mobile] Notifier Provider の定義が各 Notifier ファイルに分散している

**GitHub Issue**: ryokkon624/hw-hub-manage#173  
**ラベル**: refactor  
**ブランチ名**: `refactor/168-notifier-error-handling`（同ブランチに積む）

### 発生事象

Riverpod の Provider 定義は `{feature}_providers.dart` に集約する規約だが、ほとんどの feature で各 `*_notifier.dart` ファイルの末尾に直接書かれており、分散している。

```dart
// 現状：my_tasks_notifier.dart の末尾
class MyTasksNotifier extends AutoDisposeAsyncNotifier<MyTasksState> {
  // ロジック...
}

// ← Notifier クラスと同じファイルに Provider が混在
final myTasksNotifierProvider =
    AsyncNotifierProvider.autoDispose<MyTasksNotifier, MyTasksState>(
      MyTasksNotifier.new,
    );
```

```dart
// 現状：my_tasks_providers.dart（Repository しかない）
final myTasksRepositoryProvider = Provider<MyTasksRepository>(...);
// ← myTasksNotifierProvider がない
```

唯一 `app_info` feature だけが正規パターンで実装されている。

```dart
// 正規パターン：app_info_providers.dart
final appInfoRepositoryProvider = Provider<AppInfoRepository>(...);
final appInfoNotifierProvider =
    NotifierProvider.autoDispose<AppInfoNotifier, AppInfoState>(
      AppInfoNotifier.new,
    );
```

### ユーザーストーリー

**As a** 開発者  
**I want to** 各 feature の Provider を `{feature}_providers.dart` 1ファイルで把握したい  
**So that** Provider の追加・変更・参照が素早くできる

### Acceptance Criteria

- [ ] AC1: `tasks` feature の `myTasksNotifierProvider` が `my_tasks_providers.dart` に移動し、`my_tasks_notifier.dart` 末尾から削除される
- [ ] AC2: `shopping` feature の各 Notifier Provider（`shoppingListNotifierProvider` 等）が `shopping_providers.dart` に集約される
- [ ] AC3: `housework_settings` feature の各 Notifier Provider が `housework_settings_providers.dart` に集約される
- [ ] AC4: `inquiry` feature の各 Notifier Provider が `inquiry_providers.dart` に集約される
- [ ] AC5: `notifications` feature の Notifier Provider が `notifications_providers.dart`（または相当ファイル）に集約される
- [ ] AC6: `auth` feature の各 Notifier Provider が `auth_providers.dart`（または相当ファイル）に集約される
- [ ] AC7: `housework_assign` feature の Notifier Provider が `housework_assign_providers.dart` に集約される
- [ ] AC8: `home` feature の Notifier Provider が `home_providers.dart` に集約される
- [ ] AC9: 各 `*_notifier.dart` ファイルには Notifier クラス定義のみが残り、Provider 定義が含まれない

### 原因

`app_info_providers.dart` の規約パターンが他 feature に横展開されずに実装が進んだため。

### 実装案

#### 各 feature の `_providers.dart` に Provider 定義を移動する

```dart
// 変更後：my_tasks_providers.dart
final myTasksRepositoryProvider = Provider<MyTasksRepository>(...);

// ここに移動
final myTasksNotifierProvider =
    AsyncNotifierProvider.autoDispose<MyTasksNotifier, MyTasksState>(
      MyTasksNotifier.new,
    );
```

```dart
// 変更後：my_tasks_notifier.dart
class MyTasksNotifier extends AutoDisposeAsyncNotifier<MyTasksState> {
  // ロジックのみ（末尾の Provider 定義を削除）
}
```

#### 対象ファイル一覧

| Feature | 移動元 | 移動先 |
|---------|-------|-------|
| `tasks` | `my_tasks_notifier.dart` 末尾 | `my_tasks_providers.dart` |
| `shopping` | `shopping_list_notifier.dart`, `shopping_item_detail_notifier.dart`, `shopping_item_new_notifier.dart` 末尾 | `shopping_providers.dart` |
| `housework_settings` | `housework_create_notifier.dart`, `housework_edit_notifier.dart`, `housework_list_notifier.dart` 末尾 | `housework_settings_providers.dart` |
| `inquiry` | `inquiry_create_notifier.dart`, `inquiry_list_notifier.dart`, `inquiry_detail_notifier.dart` 末尾 | `inquiry_providers.dart` |
| `notifications` | `notification_center_notifier.dart`, `notification_global_notifier.dart` 末尾 | `notifications_providers.dart` |
| `auth` | 各 auth 系 notifier 末尾 | `auth_providers.dart`（新規） |
| `housework_assign` | `housework_assign_notifier.dart` 末尾 | `housework_assign_providers.dart` |
| `home` | `home_notifier.dart` 末尾 | `home_providers.dart` |

### 改修方針

上記「実装案」の通り。Provider の移動に伴い、import パスの更新が必要な場合は合わせて修正する。

### 備考

- 依存関係：なし

---

## Issue #174: [mobile] 単一ページの feature で presentation 配下に不要なサブフォルダがある

**GitHub Issue**: ryokkon624/hw-hub-manage#174  
**ラベル**: refactor  
**ブランチ名**: `refactor/168-notifier-error-handling`（同ブランチに積む）

### 発生事象

画面が1つしかない feature で、`presentation/{feature_name}/` という不要なサブフォルダが1層余分に存在する。

```
// 現状（1画面なのに3層）
account_settings/
  presentation/
    account_settings/        ← 不要な中間フォルダ
      account_settings_page.dart
      account_settings_notifier.dart
      account_settings_state.dart
      widgets/

household_settings/
  presentation/
    household_settings/      ← 不要な中間フォルダ
      household_settings_page.dart
      ...

settings/
  presentation/
    settings_top/            ← 不要な中間フォルダ
      settings_top_page.dart
      ...
```

```
// あるべき姿（1画面なら2層で十分）
account_settings/
  presentation/
    account_settings_page.dart
    account_settings_notifier.dart
    account_settings_state.dart
    widgets/
```

### ユーザーストーリー

**As a** 開発者  
**I want to** 単一ページ feature のフォルダ構成を他の単一ページ feature と統一したい  
**So that** ファイルがどの階層にあるか直感的にわかる

### Acceptance Criteria

- [ ] AC1: `account_settings/presentation/account_settings/` 配下のファイルが `account_settings/presentation/` 直下に移動する
- [ ] AC2: `household_settings/presentation/household_settings/` 配下のファイルが `household_settings/presentation/` 直下に移動する
- [ ] AC3: `settings/presentation/settings_top/` 配下のファイルが `settings/presentation/` 直下に移動する
- [ ] AC4: 移動に伴う import パスが全ファイルで更新される

### 原因

複数画面 feature の命名規則（`presentation/{screen_name}/`）が、単一画面 feature にも誤って適用されたため。

### 実装案

各 feature の中間フォルダを削除し、ファイルを `presentation/` 直下に移動する。router 等で import しているパスを合わせて更新する。

### 改修方針

上記「実装案」の通り。

### 備考

- 依存関係：なし

---

## Issue #175: [mobile] テストフォルダの構成が lib フォルダの構成と対応していない

**GitHub Issue**: ryokkon624/hw-hub-manage#175  
**ラベル**: refactor  
**ブランチ名**: `refactor/168-notifier-error-handling`（同ブランチに積む）

### 発生事象

`test/` 配下のフォルダ・ファイル構成が `lib/` 配下と対応していない箇所がある。主に `shopping` feature で顕著。

```
// lib 側の構成
lib/features/shopping/presentation/
  shopping_item_list/
    shopping_list_notifier.dart
    shopping_list_page.dart
    ...
  shopping_item_detail/
    ...
  shopping_item_new/
    ...
  widgets/
    basket_tab.dart
    purchased_tab.dart
    ...

// test 側の構成（lib と対応していない）
test/features/shopping/presentation/
  shopping_list_notifier_test.dart   ← shopping_item_list/ サブフォルダなしで直置き
  pull_refresh_test.dart             ← lib 側のどこに対応するか不明
  purchased_tab_test.dart            ← widgets/ 配下のはずだが直置き
  shopping_item_detail/              ✓ 対応している
  shopping_item_new/                 ✓ 対応している
  widgets/
```

### ユーザーストーリー

**As a** 開発者  
**I want to** テストファイルと実装ファイルの対応関係を構造から一目で把握したい  
**So that** テストの追加・修正時にファイルを探す手間がなくなる

### Acceptance Criteria

- [ ] AC1: `shopping_list_notifier_test.dart` が `shopping_item_list/` サブフォルダ配下に移動する
- [ ] AC2: `purchased_tab_test.dart` が `widgets/` サブフォルダ配下に移動する
- [ ] AC3: `pull_refresh_test.dart` の対応する実装ファイルが特定され、適切なサブフォルダに移動する
- [ ] AC4: 他 feature のテストフォルダも lib 構成と対応しているか確認し、乖離があれば修正する

### 原因

テストファイル追加時に lib のフォルダ構成と対応させるルールが徹底されていなかったため。

### 実装案

各テストファイルを lib 側のフォルダ構成に対応するサブフォルダへ移動する。`pull_refresh_test.dart` については対応する実装ファイルを確認した上で移動先を決める。

### 改修方針

上記「実装案」の通り。

### 備考

- 依存関係：なし

---

## リスク・チャレンジ

### リスク

- **#173 import パス更新漏れ**: 対象 feature が 8 個あり、Notifier Provider 移動後に参照先の import パスが更新されない箇所が発生しやすい。`flutter analyze` で漏れを検出すること
- **#174 router 更新漏れ**: ファイル移動時に `router.dart` 等のナビゲーション定義の import パスが更新されていないと実行時エラーが発生する。移動後は必ず `flutter run` で動作確認すること
- **#175 pull_refresh_test.dart の対応先不明**: 対応する実装ファイルが不明のため、調査が必要。見つからない場合はテスト自体の妥当性を確認する

### チャレンジ

- 特になし（モデル更新なし、作業効率化の余地なし）
