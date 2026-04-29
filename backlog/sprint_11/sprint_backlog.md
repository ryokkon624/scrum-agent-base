# Sprint 11 バックログ

## スプリントゴール

フロントエンドのstore設計とUI導線の品質向上：storeカプセル化の完結とおうち未所属ユーザーへのガイド導線整備

---

## 対象Issue

| Issue | タイトル | SP | ブランチ | 状態 |
|-------|---------|-----|---------|------|
| #32 | houseworkTaskStoreの内部状態（cacheByKey）をコンポーネントから直接参照している箇所を修正したい | 2 | DEVが決定 | 未着手 |
| #3 | おうち未作成&未所属の場合のガード＆導線を整理したい | 5 | `feature/3-household-guard-guide` | 未着手 |

**合計SP**: 7

---

## Acceptance Criteria

### #32: houseworkTaskStoreカプセル化

- [ ] AC1: `houseworkTaskStore` に `cacheByKey` の内容を返す適切な getter が追加されている
- [ ] AC2: 以下3箇所のコンポーネントが getter 経由で参照しており、`cacheByKey` への直接参照がゼロ
  - `src/components/home/MyTasksCard.vue` (29行目)
  - `src/components/home/UnassignedTasksCard.vue` (27行目)
  - `src/components/home/HouseholdSituationCard.vue` (64-65行目)
- [ ] AC3: 既存の Vitest 単体テストがすべて通る（必要に応じて新規テスト追加）

### #3: おうち未所属ガード＆導線整理

- [ ] AC1: 買い物リスト画面（おうち未所属時）OnboardingCardの「おうちに参加・作成する」カードを表示し、「おうちに参加すると、買い物アイテムを追加して家族と共有できるようになります。」のメッセージを追加表示する
- [ ] AC2: 買い物リスト画面（おうち未所属時）「追加する」ボタンを非活性にする（URL直遷移時も含む）
- [ ] AC3: 家事テンプレート一覧画面（おうち未所属時）OnboardingCardの「おうちに参加・作成する」カードを表示し、「おうちに参加すると、この画面から家事テンプレートの登録ができるようになります。」のメッセージを追加表示する
- [ ] AC4: 家事テンプレート登録ボタンを非活性にする（URL直遷移時も含む）
- [ ] AC5: PC版左メニューで「おうちが選択されていません」の代わりに「＋ おうちに参加・作成」ボタン／リンクを表示し、クリックでおうち設定画面に遷移する
- [ ] AC6: SP版HouseholdSwitcherFieldの「世帯が選択されていません」を「＋ おうちに参加・作成」に変更し、おうち設定画面に遷移できる
- [ ] AC7: OnboardingCard.vueからカード部分をコンポーネントとして切り出し、呼び出し元から追加メッセージを渡せるようにする

---

## リスク・チャレンジ

### リスク
- #3 はAC7件・OnboardingCard.vueのコンポーネント切り出しを伴う大きめの改修（SP:5）。既存のOnboardingCard使用箇所への影響範囲の確認が必要
- #32・#3 ともにフロントエンドのみの変更のため、バックエンド変更なし

### チャレンジ
- DEVのbugPBI改修方針に選択理由記載（Sprint 09・10・11連続でrefactorのため未検証 → bugPBIが来たら検証）
- Claudeモデルアップデート確認: 現在 Sonnet 4.6 / Opus 4.7 / Haiku 4.5 が最新。新モデルなし → チャレンジなし
