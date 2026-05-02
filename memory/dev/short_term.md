# Dev 短期記憶

**スプリント**: Sprint 20
**最終更新**: 2026-05-02

---

## スプリントゴール

OnboardingCardのダークモード対応漏れを修正し、設定画面の意味的カラークラスをカラートークン化することで、ダークモードの全画面一貫体験を完成させる

---

## 担当タスクメモ

### Issue #53: OnboardingCardのダークモード対応漏れを修正したい

- **ブランチ**: `feature/43-dark-mode`（継続）
- **コミット参照**: `(ryokkon624/hw-hub-manage#53)`
- **ステータス**: 完了（コミット: db65630）

### Issue #52: 意味的カラークラス（emerald/amber/red/green/yellow系）をカラートークンに移行したい

- **ブランチ**: `feature/43-dark-mode`（継続）
- **コミット参照**: `(ryokkon624/hw-hub-manage#52)`
- **ステータス**: 完了（コミット: 452660c）

### レビュー指摘対応（#53/#52 関連）

- **ステータス**: 完了（コミット: ae1e86f）
- LoginPage.vue: border-gray-300 / text-gray-700 / hover:bg-gray-50 → カラートークンに置換
- HouseholdSettingsPage.vue: border-l-gray-400 / border-l-gray-300 → border-hwhub-border に置換
- OnboardingCard.vue: border-hwhub-primary-200（未定義）→ border-hwhub-border-subtle に置換

---

## 承認済み実装方針

### 作業順序

#53（bug）→ #52（feature）の順。両Issue同一ブランチ `feature/43-dark-mode` で継続コミット。

---

### Issue #53 実装詳細

**原因**: `OnboardingCard.vue` の `bg-linear-to-r from-teal-50 to-blue-50` が固定色。ダーク時もライト色のまま。

**改修方針（案B・グラデーション維持）**:
- `src/assets/main.css` に `--hwhub-onboarding-from` / `--hwhub-onboarding-to` CSS変数を追加
  - ライト: from=teal-50(#f0fdfa), to=blue-50(#eff6ff)
  - ダーク: from/to を暗色相当（例: rgba(20,184,166,0.1) / rgba(59,130,246,0.1)）
- `@layer utilities` に `.bg-hwhub-onboarding` utility を追加
- `OnboardingCard.vue` の `bg-linear-to-r from-teal-50 to-blue-50` を `bg-hwhub-onboarding` に置換

**変更ファイル**:
- 編集: `src/assets/main.css`
- 編集: `src/components/home/OnboardingCard.vue`

**テスト**: Vueテンプレート変更のみ → Vitest不要

**コミット1**: `fix: OnboardingCardのダークモード対応漏れを修正 (ryokkon624/hw-hub-manage#53)`

---

### Issue #52 実装詳細

**変更ファイル**:
- 編集: `src/assets/main.css`（status系トークン + `bg-hwhub-danger` utility 追加）
- 編集: `src/views/settings/AccountSettingsPage.vue`
- 編集: `src/views/settings/HouseholdSettingsPage.vue`

**main.css 追加内容**:

新規トークン（:root ライト + :root.dark + @media prefers-color-scheme: dark の3か所に追加）:
```
--hwhub-status-active-bg       ライト: #dcfce7(green-100) / ダーク: rgba(34,197,94,0.13)
--hwhub-status-active-text     ライト: #15803d(green-700) / ダーク: #4ade80(green-400)
--hwhub-status-active-border   ライト: #4ade80(green-400) / ダーク: rgba(34,197,94,0.5)
--hwhub-status-pending-bg      ライト: #fef9c3(yellow-100) / ダーク: rgba(234,179,8,0.13)
--hwhub-status-pending-text    ライト: #a16207(yellow-700) / ダーク: #facc15(yellow-400)
--hwhub-status-pending-border  ライト: #facc15(yellow-400) / ダーク: rgba(234,179,8,0.5)
--hwhub-danger-bg              ライト: #e11d48(rose-600) / ダーク: #fb7185(rose-400)
--hwhub-danger-bg-hover        ライト: #be123c(rose-700) / ダーク: #f43f5e(rose-500)
--hwhub-onboarding-from        ライト: #f0fdfa(teal-50) / ダーク: rgba(20,184,166,0.1)
--hwhub-onboarding-to          ライト: #eff6ff(blue-50) / ダーク: rgba(59,130,246,0.1)
```

新規utility:
```
.bg-hwhub-status-active    { background-color: var(--hwhub-status-active-bg); color: var(--hwhub-status-active-text); }
.border-hwhub-status-active { border-color: var(--hwhub-status-active-border); }
.bg-hwhub-status-pending   { background-color: var(--hwhub-status-pending-bg); color: var(--hwhub-status-pending-text); }
.border-hwhub-status-pending { border-color: var(--hwhub-status-pending-border); }
.bg-hwhub-danger           { background-color: var(--hwhub-danger-bg); }
.hover:bg-hwhub-danger     { background-color: var(--hwhub-danger-bg-hover); }
.bg-hwhub-onboarding       { background-image: linear-gradient(to right, var(--hwhub-onboarding-from), var(--hwhub-onboarding-to)); }
```

**AccountSettingsPage.vue 置換**:
- L261 `bg-emerald-50 text-emerald-700 border border-emerald-200` → `bg-hwhub-primary-50 text-hwhub-primary border border-hwhub-primary`
- L305 `border border-amber-200 bg-amber-50 ... text-amber-900` → `border border-hwhub-accent bg-hwhub-accent-soft ... text-hwhub-accent-badge`
- L63/86/315/318 `text-red-600` → `text-hwhub-danger`
- L313 `border-red-200` → `border-hwhub-danger`
- L325 `bg-red-600 ... hover:bg-red-700` → `bg-hwhub-danger ... hover:bg-hwhub-danger`

**HouseholdSettingsPage.vue 置換**:
- L231 `bg-amber-50 text-amber-700 border border-amber-200` → `bg-hwhub-accent-soft text-hwhub-accent-badge border border-hwhub-accent`
- L271/363 `text-amber-600 hover:bg-amber-50` → `text-hwhub-accent-badge hover:bg-hwhub-accent-soft`
- L249/261/344/353 `text-red-600 hover:bg-red-50` → `text-hwhub-danger hover:bg-hwhub-danger-soft`
- L465 `text-red-600 hover:bg-hwhub-surface-card` → `text-hwhub-danger hover:bg-hwhub-surface-card`
- L479 `border-red-200` → `border-hwhub-danger`
- L481/484 `text-red-600` → `text-hwhub-danger`
- L491 `bg-red-600 ... hover:bg-red-700` → `bg-hwhub-danger ... hover:bg-hwhub-danger`
- L571 statusBadgeClass ACTIVE `bg-green-100 text-green-700` → `bg-hwhub-status-active`（color込み）
- L573 statusBadgeClass INVITED `bg-yellow-100 text-yellow-700` → `bg-hwhub-status-pending`（color込み）
- L584 statusBorderClass ACTIVE `border-l-green-400` → `border-hwhub-status-active`
- L586 statusBorderClass INVITED `border-l-yellow-400` → `border-hwhub-status-pending`
- L758 invitationStatusClass PENDING `bg-emerald-50 text-emerald-700 border-emerald-200` → `bg-hwhub-primary-50 text-hwhub-primary border-hwhub-primary`

**テスト**: テンプレート + JS関数内のクラス文字列変更（見た目）→ Vitest不要

**コミット2**: `feat: main.cssにstatus系カラートークンとbg-hwhub-danger utilityを追加 (ryokkon624/hw-hub-manage#52)`
**コミット3**: `refactor: AccountSettingsPage/HouseholdSettingsPageの意味的カラークラスをトークンに置換 (ryokkon624/hw-hub-manage#52)`

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| | | | |

---

*スプリント終了後、long_term.mdに要約して移す*
