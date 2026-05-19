# Sprint 46 バックログ

## スプリントゴール

世帯設定画面（画面#19）を実装し、所属世帯の管理・メンバー招待・権限譲渡・世帯削除を含む世帯運営機能を完成させる

---

## 対象 Issue 一覧

| Issue | タイトル | ラベル | ブランチ | SP |
|-------|---------|--------|---------|-----|
| #122 | [mobile] 世帯設定画面を実装する（画面#19） | feature | feature/122-household-settings | - |

---

## Issue #122: [mobile] 世帯設定画面を実装する（画面#19）

### ユーザーストーリー

**As a** ユーザー
**I want to** 世帯の管理とメンバーの招待・管理をアプリ上で行いたい
**So that** 家族との世帯運営を完結できる

### Acceptance Criteria

- [x] AC1: 所属世帯の一覧が表示され、タップで世帯を切り替えられる（currentHouseholdId 更新）
- [x] AC2: 「新しいおうちを追加」から世帯を新規作成できる
- [x] AC3: 世帯名（必須・空文字不可）を変更でき、変更があるときのみ「保存」ボタンが活性になる
- [x] AC4: ニックネーム（最大50文字）を設定でき、入力済みのときのみ「保存」ボタンが活性になる
- [x] AC5: メンバー一覧が表示され、ステータス（ACTIVE/INVITED/LEFT）がバッジで確認できる
- [x] AC6: OWNER は他の有効メンバーを「外す」・「OWNER に譲渡」できる（確認ダイアログ付き）
- [x] AC7: 非 OWNER は「この世帯から離脱」できる（確認ダイアログ付き）
- [x] AC8: メールアドレスでメンバーを招待でき、送信済み招待の一覧（コピー・取消）が表示される
- [x] AC9: 招待リンクのコピーは https URL を OS のシェアシートで共有できる
- [x] AC10: OWNER は有効メンバーが存在しない場合に世帯を削除でき、確認ダイアログに家事・買い物件数が表示される

### 備考

- 優先順位の根拠: Phase 3 Step 7 設定画面群
- 依存関係: #17（設定トップから遷移）、画面#16（通知からの遷移先にもなる）
- 招待リンク: `https://hwhub.familyapp-hwhub.com/invite/{token}`
- 仕様書: `docs/mobile-spec/19_household_settings.md`
- ブランチ: `feature/122-household-settings`
- コミット参照: `(ryokkon624/hw-hub-manage#122)`

### 主要 API

| メソッド | エンドポイント | 用途 |
|---|---|---|
| GET | `/api/households/{householdId}/members` | メンバー一覧取得 |
| PUT | `/api/households/{householdId}` | 世帯名更新 |
| PUT | `/api/households/{householdId}/members/me/nickname` | ニックネーム更新 |
| DELETE | `/api/households/{householdId}/members/me` | 世帯から離脱 |
| DELETE | `/api/households/{householdId}/members/{userId}` | メンバー除外（OWNER操作） |
| PUT | `/api/households/{householdId}/transfer-owner` | OWNER譲渡 |
| GET | `/api/households/{householdId}/invitations` | 招待一覧取得 |
| POST | `/api/households/{householdId}/invitations` | 招待作成 |
| POST | `/api/household-invitations/{token}/revoke` | 招待取消 |
| POST | `/api/households` | 世帯新規作成 |
| DELETE | `/api/households/{householdId}` | 世帯削除 |

---

## リスク・チャレンジ

### リスク

- AC6/AC7: OWNERのみの操作（外す・OWNER譲渡）と非OWNERの操作（離脱）の出し分けが複雑。ロール判定ロジックを慎重に設計する
- AC9: 招待リンクのコピーはUniversal Links方式 + OSシェアシート連携。iOS/Android両対応が必要
- AC10: 世帯削除の確認ダイアログに家事・買い物件数を表示するため、削除前にAPIからデータ取得が必要
- AC3/AC4: 世帯名・ニックネームの変更検知（dirty state管理）を複数セクションで正しく実装する必要がある

### チャレンジ

- 画面が多機能（世帯切り替え・名前変更・ニックネーム・メンバー管理・招待・削除）でスクロール量が多い。ScrollableウィジェットとProviderの分割設計をPlanningで整理する
- AC5のメンバーステータスバッジはカラートークンを使ってACTIVE=緑・INVITED=黄・LEFT=グレーを実装する
