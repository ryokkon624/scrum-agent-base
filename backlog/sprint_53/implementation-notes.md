## #124: [mobile] 通知ベルのポップオーバーにi18nキーがそのまま表示される

### 仕様外の判断・変更・妥協点

特になし。

---

## #128: [mobile] アカウント設定画面で通知設定をOFF→ONにした際に各グループ設定値が復活しない

### 仕様外の判断・変更・妥ického点

- **Repository インターフェースは変更しない判断**: `updateNotificationSettings(NotificationSettingsDto)` の interface を変えず、Notifier 側で送信用の DTO を組み立てる形にした。`NotificationSettingsDto` の `groupSettings` フィールドは空 Map や単一エントリを受け入れる汎用型なのでそのまま活用できた。
- **`NotificationSettingsDto.toUpdateJson()` は引き続きレスポンス解析専用**: `toUpdateJson()` メソッドはリポジトリ側で削除しなかった（念のため残存）。ただし Notifier 側では `toUpdateJson()` を経由せず直接 DTO を組み立てるため、実質的に `toUpdateJson()` は使用されていない状態。将来の混乱を防ぐためにコメントを追加することも検討したが今回はスコープ外とした。
