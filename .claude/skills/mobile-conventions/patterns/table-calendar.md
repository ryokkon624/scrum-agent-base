# table_calendar による読み取り専用カレンダー

カレンダー表示が必要な場合は `table_calendar` パッケージを使う（自作しない）。

```yaml
# pubspec.yaml
dependencies:
  table_calendar: ^3.x.x
```

**読み取り専用カレンダーの実装パターン**（タップ・月遷移を無効化して特定日をハイライトするだけ）:

```dart
TableCalendar(
  firstDay: DateTime.utc(2020, 1, 1),
  lastDay: DateTime.utc(2030, 12, 31),
  focusedDay: targetDate,                       // 表示する月をここで制御
  selectedDayPredicate: (day) =>
      isSameDay(day, targetDate),               // ハイライトする日
  // タップ・スワイプ無効化
  onDaySelected: null,                          // タップ無効
  availableGestures: AvailableGestures.none,   // スワイプ無効
  headerStyle: const HeaderStyle(
    formatButtonVisible: false,                 // 週/月切替ボタン非表示
    leftChevronVisible: false,                  // 前月ボタン非表示
    rightChevronVisible: false,                 // 次月ボタン非表示
  ),
)
```

- `focusedDay` を親ウィジェットの props として受け取り、カード変更時に親が再描画するだけで月フォーカスが自動更新される
- 読み取り専用ラッパーとして `SwipeDateCalendar` のような専用ウィジェットに切り出すと再利用しやすい

> **背景（Sprint 41 #114 AC3）**: スワイプモードのカード上部に対象日をカレンダー表示するために導入。ユーザーの確認で「自作しない・`table_calendar` を使う」方針が承認された。
