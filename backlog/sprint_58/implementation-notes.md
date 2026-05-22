## #156: ログイン直後にuser_iconに画像が表示されない

### 仕様外の判断・変更・妥協点
- **LoginResponse の再構築方針**: Repository 側で `_applyS3UrlToLoginResponse()` ヘルパーを追加し、iconUrl が変換不要な場合（null または既に変換済み URL）は元のインスタンスをそのまま返す最適化を加えた。LoginResponse 自体に copyWith を追加するより Repository に閉じた方が上位層への影響が最小限になる判断。

---

## #155: プロフィール画像変更後、他画面のアイコンが更新されない

### 仕様外の判断・変更・妥協点
- **HouseholdMemberDto に copyWith 未実装問題**: `HouseholdMemberDto`（`home/data/models/`）は `@JsonSerializable()` 自動生成のため `copyWith` がなく、`HouseworkAssignRepository.fetchMembers` および `HomeRepository.loadAll` では手動でインスタンスを再生成して iconUrl を変換した。`HouseholdSettingsMemberDto` には `copyWith` があるため `.copyWith(iconUrl: ...)` で対応した。
- **account_settings_notifier_test.dart の Container 修正**: `uploadIcon` の Step5 に homeNotifierProvider などへの `ref.invalidate` を追加したことで、テスト Container に `dioProvider` が未登録のまま invalidate が走り `ServicesBinding` 未初期化エラーが発生した。`_makeContainer` に `dioProvider.overrideWithValue(mockDio)` を追加して解決した。

---

## #158: ログアウト後、別ユーザでデータが取得できない

### 仕様外の判断・変更・妥協点
- **invalidate 対象の選択**: `AuthNotifier.logout()` で invalidate する Provider として `homeNotifierProvider`・`houseworkAssignNotifierProvider`（IndexedStack でキャッシュが残りやすい autoDispose Provider）と `householdNotifierProvider`（グローバル非 autoDispose Provider）を選択した。`shoppingListNotifierProvider` なども候補だが autoDispose のため画面離脱時に自動破棄されるため含めなかった。
- **auth_notifier_test.dart への `StorageKeys` import 追加**: `logout()` の `selectedHouseholdId` 削除テストに `SharedPreferences` の初期値設定と値確認が必要なため、`storage_keys.dart` を import した。
