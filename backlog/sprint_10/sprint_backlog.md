# Sprint 10 バックログ

**スプリント期間**: 2026-04-28 〜  
**スプリントゴール**: storeカプセル化とAPI URL統一によるフロントエンド・バックエンドのコード品質向上

---

## 対象Issue

| Issue | タイトル | ラベル | SP | ブランチ |
|-------|---------|--------|-----|---------|
| #28 | storeの内部状態フィールドをコンポーネントから直接参照している箇所を修正したい | refactor | 5 | `refactor/28-store-internal-field-encapsulation` |
| #31 | 買い物アイテム更新APIのurlを変更したい | refactor | 2 | `refactor/31-shopping-item-put-url` |

**合計SP**: 7

---

## Acceptance Criteria

### #28: storeの内部状態フィールドをコンポーネントから直接参照している箇所を修正したい

> Issue参照: `(ryokkon624/hw-hub-manage#28)`

- [ ] AC1: `houseworkStore.ts` に `isFetchedFor(householdId: number): boolean` getterが追加されている
- [ ] AC2: `OnboardingCard.vue` が `lastFetchedAtByHouseholdId` に直接アクセスせず、`isFetchedFor` getter経由で参照している
- [ ] AC3: 横展開確認の結果、他のコンポーネントに同様のstoreの内部フィールド直接参照がないことを確認している（問題なし）
- [ ] AC4: 既存のVitest単体テストがすべて通る（振る舞いの変化がない）

**規約参照**: frontend-conventions「アーキテクチャ & データフロー（Flux構造）— カプセル化の違反」

---

### #31: 買い物アイテム更新APIのurlを変更したい

> Issue参照: `(ryokkon624/hw-hub-manage#31)`

- [ ] AC1: バックエンドの `PUT /api/households/{householdId}/shopping-items/{shoppingItemId}` のURLを `PUT /api/shopping-items/{shoppingItemId}` に変更する
- [ ] AC2: フロントエンドのAPI呼び出しURLを新しいエンドポイントに合わせて更新する
- [ ] AC3: `hw-hub-frontend/doc/api_integration.md` のURL記載を更新する
- [ ] AC4: バックエンドの既存テストが新しいURLに対応していること

---

## リスク

- #31はバックエンド・フロントエンド・ドキュメントの3箇所更新が必要。ドキュメント更新漏れが過去2スプリント連続で発生しているため注意（AC3で明示的に管理）

---

## チャレンジ

- Claudeモデルのアップデート確認: Opus 4.7（`claude-opus-4-7`）がリリース済み。DEVエージェント起動にOpus 4.7を使ってみる
- DEVのbugPBI改修方針の選択理由記載（今Sprint はrefactorのため未検証。Sprint 11以降へ持ち越し）
