# Dev 短期記憶

**スプリント**: Sprint 18
**最終更新**: 2026-05-01

---

## スプリントゴール

ダークモード対応を完成させ、システム設定連動と手動切り替えを両立した快適な夜間利用体験を実現する

---

## 担当タスクメモ

### Issue #43: ダークモードへ対応したい

- **ブランチ**: `feature/43-dark-mode`（hw-hub-frontend）
- **コミット参照**: `(ryokkon624/hw-hub-manage#43)`
- **ステータス**: 計画フェーズ完了・実装待ち

### 承認済み実装方針

#### 1. CSS（AC4 基盤）

| ファイル | 操作 |
|---|---|
| `src/assets/main.css` | `backlog/sprint_18/main.css` の中身でまるごと上書き |

→ 既存の `.bg-hwhub-*` `.text-hwhub-*` 系クラスは自動でダークに追従。HTML側のクラス名変更は不要。

#### 2. テーマ管理ロジック（AC1 / AC3）

| 種別 | パス | 役割 |
|---|---|---|
| 定数追加 | `src/constants/code.constants.ts` | **0026: THEME_MODE** を追加。`SYSTEM` / `LIGHT` / `DARK` の3択。型 `ThemeModeCode` を export |
| 新規 store | `src/stores/themeStore.ts` | Pinia composition API。`mode`、`effectiveTheme` (getter)、`init()` / `setMode()`。LS キー `hwhub_theme` |
| 新規テスト | `src/stores/__tests__/themeStore.spec.ts` | TDD RED→GREEN 用 Vitest。`window.matchMedia` を `vi.stubGlobal` でモック |
| 編集 | `index.html` | `<head>` 内に FOUC 防止インラインスクリプト（LS 値を見て即 `<html class>` セット） |
| 編集 | `src/main.ts` | `useThemeStore().init()` を `app.use(router)` の前で呼ぶ |

##### themeStore 振る舞い
- `init()`: LS から mode 読込（無ければ `SYSTEM`）→ `applyTheme()` → SYSTEM 時は matchMedia の change 監視
- `setMode(mode)`: state 更新 → LS 保存 → `applyTheme()` → matchMedia リスナー付替え
- `applyTheme()`:
  - LIGHT → `<html>` に `light` クラス、`dark` を外す
  - DARK → `<html>` に `dark`、`light` を外す
  - SYSTEM → 両方外す（CSS の `@media (prefers-color-scheme: dark)` で連動）
- `effectiveTheme` (getter): SYSTEM時は matchMedia の現在値返却

##### init() タイミング
FOUC 防止は `index.html` インラインスクリプトが担保するので、`main.ts` での `themeStore.init()` 呼出タイミング（`app.use(router)` 前）でも見た目差なし。matchMedia リスナー登録を忘れないために main.ts で確実に呼ぶ。

##### Vitest テストケース
- LS 空 → init で `mode === SYSTEM`、html に light/dark クラスなし
- LS `'DARK'` → init で `<html>` に `dark` 付与
- `setMode('LIGHT')` → `<html>` に `light`、LS に `'LIGHT'` 保存
- `setMode('SYSTEM')` → LS に `'SYSTEM'`、html クラス外れる
- 不正値 → `SYSTEM` にフォールバック

#### 3. UI（AC2）SegmentControl

| ファイル | 操作 |
|---|---|
| 新規 | `src/components/settings/ThemeSwitcher.vue` | ピル型 SegmentControl（LanguageSwitcher と同じトーン）。3択 System/Light/Dark。テストなし（見た目のみ） |
| 編集 | `src/views/settings/AccountSettingsPage.vue` | 「外観」セクションを言語設定の下に追加し `<ThemeSwitcher />` を配置 |
| 編集 | `src/i18n/{ja,en,es}.json` | `settings.account.theme.{title, description, options.system, options.light, options.dark}` 追加 |

##### SegmentControl 仕様
| モード | アイコン | ラベル |
|---|---|---|
| SYSTEM | `Monitor` | システム連動 |
| LIGHT | `Sun` | ライト |
| DARK | `Moon` | ダーク |

選択中: `bg-hwhub-primary text-on-primary`、非選択: muted 系。横並び1行。

#### 4. 既存 .vue 色置換（AC4 必須スコープ）
**スコープ：主要レイアウト・ページコンテナ・モーダルのみ**。細部は本スプリント対象外。

##### 必須対象
- `src/layouts/AppLayout.vue` / `src/components/AppHeader.vue` / Sidebar 系
- 各 Page コンテナ（Account/Settings系/Shopping/MyTasks/Inquiry/Admin の枠の `bg-white` `border-slate-200` `text-slate-900` 等）
- モーダル系（BaseModal、各 Modal）、トースト、スケルトン

##### 置換ルール
| 旧 | 新 |
|---|---|
| `bg-white` | `bg-hwhub-surface-card` |
| `bg-gray-50` `bg-slate-50` | `bg-hwhub-surface-subtle` |
| `text-slate-900` | `text-hwhub-heading` |
| `text-slate-800` `text-gray-700` | `text-hwhub-body` |
| `text-slate-500` `text-gray-500` | `text-hwhub-muted` |
| `border-slate-200` `border-gray-200` `border-gray-300` | `border-hwhub-border` |

##### スコープ外
- 個別フォーム要素・小バッジ等の生 Tailwind 色は本スプリントでは触らない
- **実装完了時、残った生Tailwind色（bg-white / text-slate-* / bg-gray-* 等）の箇所数を grep で計測し、SM に報告**
- SM が箇所数をもとに別Issueを起票（DEV は報告までが責務）

#### TDD進行順序
1. **RED**: `themeStore.spec.ts` を先に書いて落とす
2. **GREEN**: `code.constants.ts` 0026追加 → `themeStore.ts` 実装 → `index.html` FOUC スクリプト → `main.ts` 配線
3. **REFACTOR**: `main.css` 取込 → `ThemeSwitcher.vue` 新規 → `AccountSettingsPage.vue` 編集 → i18n 追加 → 主要レイアウト/ページ/モーダル色置換
4. **REPORT**: 残存生 Tailwind 色を grep で集計し SM へ報告

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 18 ではまだなし) | | | |

---

*スプリント終了後、long_term.mdに要約して移す*
