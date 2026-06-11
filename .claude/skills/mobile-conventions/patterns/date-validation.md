# 日付入力の整合性バリデーション

Dart の `DateTime` は存在しない日付を自動繰り越しする（例: `2026-02-30` → `2026-03-02`）。日付を入力させるフォームでは、この仕様を踏まえて存在しない日付を弾くバリデーションを必ず実装すること。

入力形式によってチェック方法が異なる:

- Dropdown 等で**月と日を個別選択**させる場合 → `DateTime(year, month, day).month == month` チェック
- `TextFormField` に **YYYY-MM-DD 形式で直接入力**させる場合 → `DateTime.tryParse()` + ISO8601 ラウンドトリップ

---

## 月・日を個別入力するフォーム（月末日チェック）

「繰り返し設定」「有効期間」など、月と日を個別入力するフォームでは存在しない日付（例: 2月30日、4月31日）を弾く。

```dart
// 月末日チェック（month と day の組み合わせが実在する日付か確認する）
bool isValidDayForMonth(int month, int day) {
  // 閏年に依存しない固定年（例: 2000年など閏年）を使うか、
  // 現在年を使ってチェックする
  final date = DateTime(2000, month, day);  // 2000年は閏年（2月29日も有効）
  return date.month == month;
}

// 利用例（保存ボタン押下時）
bool _validate() {
  if (recurrenceType == RecurrenceType.monthly) {
    if (!isValidDayForMonth(selectedMonth, selectedDay)) {
      // 「指定した月に存在しない日付です」等のエラーを表示
      state = state.copyWith(errorMessage: 'invalidDayForMonth');
      return false;
    }
  }
  return true;
}
```

適用すべき場面:

- 月次繰り返しで「毎月N日」を入力するフォーム
- 有効期間の「開始日」「終了日」で月・日を個別入力するフォーム
- 誕生日など「月」「日」を別フィールドで入力するフォーム

**注意**: 「月末」を `dayOfMonth=31` 等の特殊値で表現している場合（バックエンド仕様）は、特殊値を除外してからチェックすること。

> **背景（Sprint 47 #138 Sprint Review）**: 家事編集画面の月次繰り返し日設定で、2月30日などを入力した状態で保存ボタンが押下できた。フロント側に月・日の組み合わせ整合性バリデーションがなかった。

## YYYY-MM-DD 形式テキスト入力（ラウンドトリップチェック）

`DateTime.tryParse()` の成功だけでは「有効な日付」と判定できない（自動繰り越しされた結果が返るため）。parse 後に文字列へ戻して元の入力と一致するかを確認する2段階チェックを行う。

```dart
// YYYY-MM-DD テキスト入力の日付有効性チェック
bool isValidDate(String value) {
  // Step1: 書式チェック（parse できない場合は null）
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return false;
  // Step2: ラウンドトリップチェック（自動繰り越し検知）
  // 2026-02-30 → parsed は 2026-03-02 になるため、stringify が元の値と一致しない
  return parsed.toIso8601String().substring(0, 10) == value;
}

// Notifier の validate() での利用例
if (startDate.isNotEmpty && !isValidDate(startDate)) {
  return state.copyWith(
    startDateError: 'houseworkCreateErrorInvalidDate',  // ARBキー
  );
}
```

> **背景（Sprint 54 #147）**: 家事設定画面の有効期間（startDate / endDate）入力欄で `2026-02-30` のような存在しない日付を入力しても保存できた。Notifier の `validate()` に書式チェックしかなく、自動繰り越し検知が未実装だった。
