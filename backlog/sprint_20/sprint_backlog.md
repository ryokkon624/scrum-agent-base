# Sprint 20 バックログ

**スプリント期間**: 2026-05-02 〜
**スプリントゴール**: OnboardingCardのダークモード対応漏れを修正し、設定画面の意味的カラークラスをカラートークン化することで、ダークモードの全画面一貫体験を完成させる

---

## 対象Issue

| Issue | タイトル | SP | ブランチ |
|-------|---------|-----|---------|
| #53 | OnboardingCardのダークモード対応漏れを修正したい | 2 | feature/43-dark-mode |
| #52 | 意味的カラークラス（emerald/amber/red/green/yellow系）をカラートークンに移行したい | 5 | feature/43-dark-mode |

**⚠️ 注意**: 両Issueとも同一ブランチ `feature/43-dark-mode` 上に継続してコミットすること。#53（bug）を先に対応し、その後#52（feature）に着手すること。

---

## Issue #53: OnboardingCardのダークモード対応漏れを修正したい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/53
**ラベル**: bug
**SP**: 2
**ブランチ**: `feature/43-dark-mode`（継続）

---

### 発生事象

ダークモード有効時に、OnboardingCardが白背景・黒文字のまま表示され、ライトモードと区別がつかない状態になっている。Sprint 19 Sprint Reviewにてユーザーが確認（スクリーンショットあり）。

### ユーザーストーリー

**As a** ダークモードを使うユーザー
**I want to** OnboardingCardがダークモードで正しく表示されるようにしたい
**So that** オンボーディング画面でも他の画面と同様のダークモード体験を得たい

### Acceptance Criteria

- [x] AC1: OnboardingCard（コンポーネント）の生Tailwindカラークラスがカラートークンに置換され、ダークモード時に背景・テキスト・ボーダーが適切に反転して表示される
- [x] AC2: ライトモード時のOnboardingCardの表示が変わらない

### 原因

<!-- 原因分析後に更新 -->

### 改修方針

<!-- 原因分析後に更新 -->

### 備考

- Sprint 19 Sprint Review にてユーザーが指摘（スクリーンショットあり）
- 対応ブランチ: `feature/43-dark-mode`（継続）
- 参照: [Sprint 19 Sprint Reviewスレッド](https://discord.com/channels/1489417408950046782/1499764155169767505/1499925134692323388)
- 依存関係: なし（#52とは独立して着手可能）

---

## Issue #52: 意味的カラークラス（emerald/amber/red/green/yellow系）をカラートークンに移行したい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/52
**ラベル**: feature
**SP**: 5
**ブランチ**: `feature/43-dark-mode`（継続）

---

### 概要

#### 現状
Sprint 19（Issue #51）でグレー系・スレート系のニュートラルカラークラスのトークン移行が完了したが、意味的なカラークラス（ステータス・エラー・警告・成功表示等に使われる emerald / amber / red / green / yellow 系）が以下ファイルに残存している。

#### 残存箇所

**`src/views/settings/AccountSettingsPage.vue`**

| 行 | 残存クラス | 推奨トークン |
|----|-----------|-------------|
| 261 | `bg-emerald-50 text-emerald-700 border-emerald-200` | `bg-hwhub-primary-50 text-hwhub-primary border-hwhub-primary` |
| 305 | `border-amber-200 bg-amber-50 text-amber-900` | `border-hwhub-accent bg-hwhub-accent-soft`（`text-amber-900` は新規トークン追加が必要） |
| 63, 86, 313, 315, 318, 325 | `text-red-600` / `border-red-200` / `bg-red-600` / `hover:bg-red-700` | `text-hwhub-danger` / `border-hwhub-danger` |

**`src/views/settings/HouseholdSettingsPage.vue`**

| 行 | 残存クラス | 推奨トークン |
|----|-----------|-------------|
| 231, 271, 363, 758 | amber系生カラー | `bg-hwhub-accent-soft` / `text-hwhub-accent-badge` / `border-hwhub-accent` |
| 249, 261, 344, 353, 465, 479-492 | red系生カラー | `text-hwhub-danger` / `border-hwhub-danger` |
| 571, 573, 584-590 | `bg-green-100 text-green-700` / `bg-yellow-100 text-yellow-700` / `border-l-green-400` 等 | 対応トークンが `main.css` に未定義のため、新規トークン追加が必要 |

#### 問題点
ダークモード有効時に、ステータス表示・エラー表示・警告バナー等の色がライトモード固定になる可能性がある。

### ユーザーストーリー

**As a** ダークモードを使うユーザー
**I want to** ステータス・エラー・警告などの意味的な色表示もダークモードに対応してほしい
**So that** 設定画面でも視覚的に一貫したダークモード体験が得られる

### Acceptance Criteria

- [x] AC1: `AccountSettingsPage.vue` の emerald / amber / red 系カラークラスが既存カラートークンに置換される
- [x] AC2: `HouseholdSettingsPage.vue` の amber / red 系カラークラスが既存カラートークンに置換される
- [x] AC3: `HouseholdSettingsPage.vue` の green / yellow 系カラークラスについて、新規カラートークンを `main.css` に追加した上で置換される（トークン名はDEVの判断に委ねる）
- [x] AC4: 置換後、`AccountSettingsPage.vue` および `HouseholdSettingsPage.vue` において意味的カラークラス（emerald/amber/red/green/yellow系）が grep でゼロになる（除外箇所がある場合は備考に明記する）

### 備考

- 依存関係: #51（グレー系カラートークン移行）完了済み
- Sprint 19 convention-reviewerレビューで検出された残存箇所
- 対応ブランチ: `feature/43-dark-mode`（継続）
