# Sprint 43 バックログ

**スプリント期間**: 2026-05-18 〜
**スプリントゴール**: モバイルアプリに通知センターを実装し、ユーザーが見逃した通知をベルアイコンのポップオーバーおよび通知センター画面から確認・遷移できるようにする

---

## 共通情報

- **対象リポジトリ**: hw-hub-mobile
- **ブランチ**: `feature/119-mobile-notifications`
- **仕様書**: `docs/mobile-spec/16_notifications.md`

---

## Issue #119 — [mobile] 通知センターを実装する（画面#16）

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/119
**ラベル**: feature

### ユーザーストーリー

**As a** ユーザー
**I want to** 受け取った通知を一覧で確認し、タップで該当画面に移動したい
**So that** 見逃した通知を素早く確認できる

### Acceptance Criteria

- [x] AC1: ベルアイコンタップでポップオーバーが表示され、最新20件の通知が表示される
- [x] AC2: ポップオーバー表示時に全件既読になる（markRead=true）
- [x] AC3: ポップオーバーの「すべてみる」タップで通知センター画面に遷移する
- [x] AC4: 通知センター画面に最新50件が表示される（取得時 markRead=true）
- [x] AC5: 未読通知には●インジケーターが表示され、既読には表示されない
- [x] AC6: linkType に応じて対応画面に遷移する（NONE: 遷移なし / MY_TASKS: #12 / HOUSEHOLD・INVITATION: #19 / SETTINGS: #18 / INQUIRY: #25）
- [x] AC7: ベルアイコンに未読件数バッジが表示される（0件の場合は非表示）
- [x] AC8: バッジはアプリ起動時・フォアグラウンド復帰時・ポップオーバー/通知センター表示後に更新される
- [x] AC9: 「更新」ボタンで通知一覧を再取得できる
- [x] AC10: 複数世帯所属時は世帯切り替えコンポーネントが表示される（対象外: 通知センターは世帯で切り替わらないため）

### 機能仕様（仕様書より）

#### エントリーポイント

1. **ベルアイコン（ポップオーバー）**: ヘッダーのベルアイコンタップで表示。最新20件取得・表示と同時にmarkRead=true
2. **通知センター画面（#16）**: 「すべてみる」タップまたは直接遷移。最新50件取得・markRead=true

#### 通知一覧の表示要素

| 要素 | 内容 |
|---|---|
| 未読インジケーター | ●（未読）/ なし（既読） |
| タイトル | 通知のタイトル |
| 本文 | 通知の詳細テキスト |
| 日時 | 通知作成日時 |
| > アイコン | linkTypeがNONE以外の場合のみ表示 |

#### linkType別遷移先

| linkType | 遷移先 |
|---|---|
| NONE | 遷移なし |
| MY_TASKS | #12 My Tasks |
| HOUSEHOLD | #19 世帯設定 |
| SETTINGS | #18 アカウント設定 |
| INVITATION | #19 世帯設定 |
| INQUIRY | #25 問い合わせ詳細（linkIdを渡す） |

#### API

| メソッド | エンドポイント | パラメータ | 用途 |
|---|---|---|---|
| GET | `/api/notifications` | `limit=20&markRead=true` | ベルポップオーバー用 |
| GET | `/api/notifications` | `limit=50&markRead=true` | 通知センター用 |
| GET | `/api/notifications/unread-count` | - | 未読件数取得 |

#### 状態管理

```
NotificationState
├── notifications: List<NotificationModel>
├── unreadCount: int
└── isLoading: bool
```

#### ベルバッジ更新タイミング

- アプリ起動時
- フォアグラウンド復帰時
- ポップオーバー / 通知センター表示後（既読になるため0にリセット）

### 備考

- 優先順位の根拠: Phase 3 Step 6（設定画面群の前）
- 依存関係: Phase 2 共通基盤（HouseholdSwitcher）
- スコープ外: DB保存による複数デバイス間の設定同期
- 世帯切り替えコンポーネント（HouseholdSwitcher）の参照: `docs/mobile-spec/common/household_switcher.md`

---

## リスク・チャレンジ

### リスク

- ACが10件と多く、ポップオーバー・通知センター画面・ベルバッジの3つのUIコンポーネントをすべて1スプリントで実装するため規模が大きい
- バックエンドAPIの `/api/notifications` と `/api/notifications/unread-count` が実装済みかどうかを計画フェーズで確認する必要がある
- フォアグラウンド復帰時のバッジ更新（AC8）はAppLifecycleObserverの実装が必要で、既存コードに同パターンがあるか確認する
- linkType=INQUIRY は `linkId` を渡す必要があり、遷移実装が他のlinkTypeより複雑

### チャレンジ

- ポップオーバーはFlutterでの実装に `showMenu` or `OverlayEntry` or `PopupMenuButton` など複数の選択肢があり、計画フェーズでUIパターンを確定させる
