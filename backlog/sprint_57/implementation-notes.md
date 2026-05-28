## #157: 通知センターで通知をクリックするとエラーが発生する

### 仕様外の判断・変更・妥協点
- **`context.canPop()`チェックの追加**: `context.pop()`の前に`canPop()`でスタックに戻れるルートがあるかチェックを追加した。テスト環境でinitialLocationが`/notifications`の場合はpopできないため、チェックなしだとGoErrorが発生する。実際のアプリでは通知センターは他のルートからpushされるため`canPop()`は常にtrueになるが、防御的実装として残した。

## #163: おうちの様子カードでデータがない場合にデータがないことを明示する

### 仕様外の判断・変更・妥協点
- **`hasOverviewData`をHomeStateに追加し、Notifier側で事前計算**: ACではWidgetレベルの実装でもよかったが、build()内の重複計算を避けるルール（long_term.md）に従い、Notifier側で`hasOverviewData`フラグを計算してStateに持たせた。
- **`maxY`設定でAC1を解決**: `0.001`の最小バー表示は維持しつつ、`BarChartData.maxY`に全グループの最大値を明示的に設定することで、fl_chartが`0.001`を最大値として扱う問題を解決した。データが全件0の場合は`maxY: 1.0`を設定して軸が崩れないようにした（実際のアプリでは`hasOverviewData: false`の場合はBarChartが表示されないため問題なし）。

## #161: ホーム画面おうちの様子カードで棒グラフクリック時、凡例に明細を表示したい

### 仕様外の判断・変更・妥協点
- **ツールチップ生成ロジックを`overview_tooltip_builder.dart`に切り出し**: BarTouchTooltipDataのgetTooltipItemコールバック内にロジックを埋め込むとユニットテストが困難なため、`buildTooltipLines()`関数として独立ファイルに切り出した。この関数はl10nに依存しない（文字列を受け取る）ため純粋関数としてテスト可能。
- **`_OverviewChart`に`members`プロパティを追加**: ツールチップ生成時にメンバー名とnickname参照が必要なため、従来の`memberColorMap`に加えて`members`プロパティを追加した。
