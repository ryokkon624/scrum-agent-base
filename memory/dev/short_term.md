# Dev 短期記憶

**スプリント**: Sprint 19
**最終更新**: 2026-05-01

---

## スプリントゴール

残存する生Tailwindカラークラスをカラートークンに完全移行し、ダークモードを全画面で一貫させる

---

## 担当タスクメモ

### Issue #51: 残存生Tailwindカラークラスをカラートークンに移行したい

- **ブランチ**: `feature/43-dark-mode`（hw-hub-frontend / Sprint18ブランチ継続）
- **コミット参照**: `(ryokkon624/hw-hub-manage#51)`
- **ステータス**: 実装完了・プッシュ済み（2026-05-01）

---

## 承認済み実装方針

### 現状

160箇所 / 49ファイルに生Tailwindカラークラスが残存（バックログ記載94箇所から実計測で増加）。
Sprint18完了後のrework後に再計測した実数。

### 置換ルール（確定）

| 旧 | 新 |
|---|---|
| `bg-white` | `bg-hwhub-surface-card` |
| `bg-gray-50` / `bg-slate-50` / `bg-gray-100` / `bg-slate-100` | `bg-hwhub-surface-subtle` |
| `bg-gray-200` / `bg-slate-200`（背景用途） | `bg-hwhub-border` |
| `bg-gray-300` / `bg-slate-300` | `bg-hwhub-swipe-disabled` |
| `text-slate-900` | `text-hwhub-heading` |
| `text-slate-800` / `text-gray-800` / `text-gray-700` / `text-slate-700` / `text-slate-600` / `text-gray-600` | `text-hwhub-body` |
| `text-slate-500` / `text-gray-500` / `text-gray-400` / `text-gray-300` | `text-hwhub-muted` |
| `border-slate-200` / `border-slate-300` / `border-gray-200` / `border-gray-300` | `border-hwhub-border` |
| `border-slate-100` | `border-hwhub-border-subtle` |
| `hover:bg-gray-50` / `hover:bg-slate-50` | `hover:bg-hwhub-surface-subtle` |

### 意図的な白固定（スコープ外・除外）

以下はダーク背景上の意図的な白固定なのでトークン化しない：

1. **LandingPage Header・Hero** 上の半透明白 (`bg-white/10`, `border-white/20`, `after:bg-white`, Signupボタン `bg-white text-[#1a2e1a]`)
2. **LoginPage** Googleサインインボタン (`bg-white text-gray-700` / `border-gray-300`)
3. **AccountSettingsPage** トグルつまみ `bg-white` 3箇所（通知/世帯/タスク）
4. **HouseholdSwitcherMobile** 選択行ハイライト `bg-white/95`

### SkeletonItem 2階調対応

- `bg-slate-200`（濃い灰・メイン要素）→ `bg-hwhub-border`（コード的にきれいなカラートークン代用）
- `bg-slate-100`（薄い灰・サブ要素）→ `bg-hwhub-surface-subtle`

### 作業順（3コミット）

#### コミット1: 共通コンポーネント・composable

- `src/components/ui/SkeletonItem.vue`（9箇所）
- `src/components/ui/ListPagination.vue`（3箇所）
- `src/components/LanguageSwitcher.vue`（1箇所）
- `src/components/LanguageSwitcherMobile.vue`（2箇所）
- `src/composables/useShoppingCodes.ts`（2箇所）
- `src/__tests__/composables/useShoppingCodes.spec.ts`（8箇所・期待値更新）

#### コミット2: 認証・ランディング系ページ

- `src/views/LandingPage.vue`（24箇所・意図的白固定を除く）
- `src/views/LoginPage.vue`（7箇所・Googleボタン除く）
- `src/views/SignupPage.vue`（3箇所）
- `src/views/SignupVerifyWaitPage.vue`（2箇所）
- `src/views/EmailVerifyPage.vue`（1箇所）
- `src/views/auth/OAuthResultPage.vue`（1箇所）
- `src/views/AuthActionResultPage.vue`（4箇所）
- `src/views/InvitationPage.vue`（3箇所）
- `src/views/PasswordForgotPage.vue`（7箇所）
- `src/views/PasswordResetPage.vue`（9箇所）
- `src/views/PasswordResetSentPage.vue`（7箇所）

#### コミット3: ホームカード・通知・ショッピング・家事・管理・Settings系

- `src/components/home/UnassignedTasksCard.vue`
- `src/components/home/ShoppingListCard.vue`
- `src/components/home/OnboardingStepCard.vue`
- `src/components/home/HouseholdSituationCard.vue`
- `src/components/home/MyTasksCard.vue`
- `src/components/notifications/NotificationBell.vue`
- `src/components/notifications/NotificationListItem.vue`
- `src/components/shopping/ShoppingListTabBar.vue`
- `src/components/shopping/ShoppingStoreTypeFilter.vue`
- `src/components/shopping/SwipeableShoppingItem.vue`
- `src/components/housework/SwipeableTaskCard.vue`
- `src/components/housework/SwipeableAssignmentCard.vue`
- `src/components/housework/HouseworkForm.vue`（12箇所）
- `src/components/housework/AssigneePickerModal.vue`
- `src/components/admin/InquiryStatusSummaryCard.vue`
- `src/components/admin/DailyInquiryMessageCard.vue`
- `src/components/admin/DailyInquiryStatusCard.vue`
- `src/components/admin/AdminCard.vue`
- `src/components/HouseholdSwitcherMobile.vue`（意図的白固定を除く）
- `src/components/HouseholdSwitcherField.vue`
- `src/components/inputs/ImageFileInput.vue`
- `src/views/shopping/ShoppingListPage.vue`
- `src/views/shopping/ShoppingItemDetailPage.vue`
- `src/views/settings/SettingsTopPage.vue`
- `src/views/settings/AccountSettingsPage.vue`（意図的白固定を除く）
- `src/views/settings/HouseholdSettingsPage.vue`
- `src/views/settings/inquiry/InquiryListPage.vue`
- `src/views/settings/inquiry/InquiryDetailPage.vue`
- `src/views/admin/AdminUsersPage.vue`
- `src/views/admin/AdminRolesPage.vue`
- `src/views/admin/AdminInquiriesPage.vue`
- `src/views/admin/AdminInquiryDetailPage.vue`

### TDD観点

- 全てVueテンプレートのクラス置換（見た目のみ）→ Vitestテスト不要
- `useShoppingCodes.spec.ts` の期待文字列はトークン化後の値に更新する（TDD対象外・既存テストの期待値修正）

### 完了後の検証コマンド

```bash
# スコープ内の残存チェック（意図的除外箇所が残るのみであること確認）
grep -rn "\b(bg-white|bg-gray-\d+|bg-slate-\d+|text-slate-\d+|text-gray-\d+|border-gray-\d+|border-slate-\d+)\b" src/

# テスト実行
npm run test:unit

# フォーマット
npm run format
```

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-05-01 | OAuthResultPage.vue のEdit失敗 | old_stringのインデント・空白がファイルと不一致 | ファイルをRead後に正確な文字列で再実行 |

---

*スプリント終了後、long_term.mdに要約して移す*
