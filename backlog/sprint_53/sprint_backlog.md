# Sprint 53 バックログ

## スプリントゴール

モバイルの通知機能に関する2件のバグを根本解決する：通知ポップオーバーにi18nキーがそのまま表示される問題（#124）と、グローバル通知設定のOFF→ONで各グループ設定値が復活しない問題（#128）

---

## 対象 Issue 一覧

| Issue | タイトル | ラベル | SP | ブランチ |
|-------|---------|--------|-----|---------|
| #124 | [mobile] 通知ベルのポップオーバーにi18nキーがそのまま表示される | bug | - | `fix/124-mobile-notification-i18n-key` |
| #128 | [mobile] アカウント設定画面で通知設定をOFF→ONにした際に各グループ設定値が復活しない | bug | - | `fix/128-mobile-account-settings-notification-not-restored` |

---

## Issue #124 — [mobile] 通知ベルのポップオーバーにi18nキーがそのまま表示される

### 発生事象

通知ベルアイコンをタップして表示されるポップオーバーで、通知のタイトルと本文にi18nの翻訳文字列ではなくキー文字列（例: `notifications.messages.yourTaskWasTaken.title`）がそのまま表示されている。バックエンドが返す `titleKey` / `bodyKey` の値とFlutter側のARBキーが一致していないことが原因と推測される。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** 通知ポップオーバーで通知の内容が正しく表示されてほしい
**So that** 通知の内容を把握して適切な行動をとれる

### Acceptance Criteria

- [x] AC1: 通知ベルのポップオーバーで通知タイトルと本文がi18nキーではなく翻訳された文字列で表示される
- [x] AC2: 通知センター画面でも同様に翻訳された文字列で表示される

### 原因
<!-- 原因分析後に更新 -->

### 改修方針
<!-- 原因分析後に更新 -->

### 備考

- 対象: 通知ベルポップオーバー・通知センター画面の通知タイトル・本文
- Sprint 43 Sprint Reviewで発覚
- バックエンドが返す `titleKey`/`bodyKey` はフロントエンド形式（例: `notifications.messages.yourTaskWasTaken.title`）のため、モバイル側でARBキー形式（ドットなし・各単語先頭大文字で結合、例: `notificationsMessagesYourTaskWasTakenTitle`）に変換して対応する方針。バックエンド・DB・バッチへの影響を避けるため変換はモバイル側で完結させる。
- プッシュ通知は未実装のため対象外。
- **bugラベル → 計画フェーズで根本原因調査・改修方針を整理し、IssueのBodyを更新すること**
- ブランチ: `fix/124-mobile-notification-i18n-key`
- コミット参照: `(ryokkon624/hw-hub-manage#124)`

---

## Issue #128 — [mobile] アカウント設定画面で通知設定をOFF→ONにした際に各グループ設定値が復活しない

### 発生事象

アカウント設定画面でグローバル通知設定をON→OFFにすると、各通知グループの設定値（notification_group100/200/900）もOFFに更新される。その後OFFからONに戻しても各グループ設定値は変更されず、画面から変更できないnotification_group900がOFFのままになり操作不能になる。

WEB版の正しい動作では、通知設定のON/OFF切り替えはm_user.notification_enabledのみを更新し、各グループ設定値は変更しない。

### 現状の挙動

**通知設定のON→OFF時**
- m_user.notification_enabled: 0に更新
- m_user_notification_setting: notification_group100/200/900 それぞれ enabled=0 でレコード追加

**通知設定のOFF→ON時**
- m_user.notification_enabled: 1に更新
- m_user_notification_setting: 変更なし（notification_group900がOFFのまま）

### あるべき動作（WEB版の動作）

**通知設定のON→OFF時**
- m_user.notification_enabled: 0に更新
- m_user_notification_setting: **変更なし**

**通知設定のOFF→ON時**
- m_user.notification_enabled: 1に更新
- m_user_notification_setting: **変更なし**

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** 通知設定のグローバルON/OFFを切り替えても、各グループの通知設定値が保持されてほしい
**So that** グローバルをONに戻したときに以前の細かい設定が復活する

### Acceptance Criteria

- [x] AC1: グローバル通知設定のON→OFFでは m_user.notification_enabled のみ更新され、各グループ設定値は変更されない
- [x] AC2: グローバル通知設定のOFF→ONでは m_user.notification_enabled のみ更新され、各グループ設定値は変更されない
- [x] AC3: ON→OFF→ONの操作後、各グループのスイッチが操作前と同じ状態でアカウント設定画面に表示される

### 原因
<!-- 原因分析後に更新 -->

### 改修方針
<!-- 原因分析後に更新 -->

### 備考

- 対象: アカウント設定画面 notification_settings_section（モバイル側のみ。バックエンドの変更は不要）
- Sprint 45 Sprint Reviewで発覚
- **bugラベル → 計画フェーズで根本原因調査・改修方針を整理し、IssueのBodyを更新すること**
- ブランチ: `fix/128-mobile-account-settings-notification-not-restored`
- コミット参照: `(ryokkon624/hw-hub-manage#128)`
