# Sprint 27 バックログ

**スプリント**: Sprint 27
**期間**: 2026-05-12〜
**スプリントゴール**: モバイルホーム画面のSprint 26 Review指摘5件を全件解消し、webのSP版と完全に統一されたUIを実現する

---

## 対象Issue

| Issue | タイトル | ブランチ | SP |
|-------|---------|---------|-----|
| #70 | [mobile] ホーム画面「My Tasks」カードの件数が多く表示される | `feature/66-mobile-home` | - |
| #71 | [mobile] ホーム画面「買い物リスト」カードの購入場所が名称ではなくコードで表示されている | `feature/66-mobile-home` | - |
| #69 | [mobile] ホーム画面のデザインをwebのSP版に合わせる | `feature/66-mobile-home` | - |
| #72 | [mobile] ホーム画面「おうちの様子」グラフの積み上げ順序を修正する（未割当を一番上に） | `feature/66-mobile-home` | - |
| #73 | [mobile] ホーム画面「おうちの様子」グラフに縦軸目盛りを追加する | `feature/66-mobile-home` | - |

> **優先順位**: bug系（#70, #71）を先に対応し、その後UI改善系（#69, #72, #73）に着手する

---

## Issue #70: [mobile] ホーム画面「My Tasks」カードの件数が多く表示される

**ラベル**: bug
**ブランチ**: `feature/66-mobile-home`

### 概要

「My Tasks」カードの件数集計がログインユーザーに割り当てられた件数ではなく、おうち全体のタスク数になっていると考えられ、想定よりも件数が多い。

### 背景

Sprint 26のSprint Reviewで、My Tasksカードの件数がログインユーザーの件数ではなくおうち全体の件数になっていることが指摘された。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** My Tasksカードにログインユーザーだけのタスク件数が表示されてほしい
**So that** 自分がやるべき家事を正確に把握できる

### Acceptance Criteria

- [x] AC1: My Tasksカードの「今日の件数」がログインユーザーに割り当てられた今日のタスク件数のみを表示する
- [x] AC2: My Tasksカードの「直近1週間の件数」がログインユーザーに割り当てられた1週間以内のタスク件数のみを表示する
- [x] AC3: My Tasksカードの「期限超過の件数」がログインユーザーに割り当てられた期限超過タスク件数のみを表示する

### 原因

<!-- 原因分析後に更新 -->

### 改修方針

<!-- 原因分析後に更新 -->

### 備考

- 依存関係: なし
- バックエンドAPIのフィルタリング仕様（割り当て者IDによるフィルタリング）を確認してから実装すること
- 関連: `hw-hub-backend` の `/api/housework-tasks` エンドポイント
- ブランチ: `feature/66-mobile-home`

---

## Issue #71: [mobile] ホーム画面「買い物リスト」カードの購入場所が名称ではなくコードで表示されている

**ラベル**: bug
**ブランチ**: `feature/66-mobile-home`

### 概要

「買い物リスト」カードで購入場所が名称（スーパー、ドラッグストア、オンライン等）表示されるべきところ、ID（1, 3, 2）で表示されている。

### 背景

Sprint 26のSprint Reviewで、買い物リストカードの購入場所が名称ではなくIDで表示されていることが指摘された。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** 買い物リストカードで購入場所が名称で表示されてほしい
**So that** どのお店に何を買いに行けばよいか一目でわかる

### Acceptance Criteria

- [x] AC1: 買い物リストカードの購入場所がIDではなく名称（スーパー、ドラッグストア、オンライン等）で表示される
- [x] AC2: 購入場所の名称がi18nから取得されている
- [x] AC3: 名称の取得に失敗した場合でも画面が正常に表示される（フォールバック処理あり）

### 原因

<!-- 原因分析後に更新 -->

### 改修方針

<!-- 原因分析後に更新 -->

### 備考

- 依存関係: なし
- 購入場所の名称はi18nから取得する（フロントエンドと同方針）
- ブランチ: `feature/66-mobile-home`

---

## Issue #69: [mobile] ホーム画面のデザインをwebのSP版に合わせる

**ラベル**: feature
**ブランチ**: `feature/66-mobile-home`

### 概要

ホーム画面の色・レイアウトをhw-hub-frontendのSP版に合わせる。モバイルspecで指定がない場合はwebのSP版を参照することを標準とする。

### 背景

Sprint 26のSprint Reviewで、ホーム画面のデザインがwebのSP版と異なることが指摘された。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** モバイルアプリのホーム画面がwebのデザインと統一されていてほしい
**So that** どちらのデバイスでも一貫した体験ができる

### Acceptance Criteria

- [x] AC1: ホーム画面の各カードの色・レイアウトがhw-hub-frontendのホーム画面SP版と合っている
- [x] AC2: Mobileのspecで指定がない項目はwebのSP版を参照して実装されている

### 備考

- 優先順位の根拠: Sprint 26 Sprint Review指摘事項（bug対応後に着手）
- 依存関係: なし
- 参照: `hw-hub-frontend` のホーム画面SP版
- specに記載がない要素はすべてwebのSP版に従うこと
- ブランチ: `feature/66-mobile-home`

---

## Issue #72: [mobile] ホーム画面「おうちの様子」グラフの積み上げ順序を修正する（未割当を一番上に）

**ラベル**: feature
**ブランチ**: `feature/66-mobile-home`

### 概要

「おうちの様子」カードの積み上げ棒グラフで、未割当を一番下ではなく一番上（頂点）に変更する。hw-hub-frontendの表示順序に合わせる。

### 背景

Sprint 26のSprint Reviewで、frontendは未割当が一番上なのに対してmobileは一番下になっていることが指摘された。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** おうちの様子グラフの積み上げ順序がwebと同じになっていてほしい
**So that** webとmobileで同じ視覚的表現が得られる

### Acceptance Criteria

- [x] AC1: 積み上げ棒グラフで未割当の積み上げ部分が一番上（頂点）に表示される
- [x] AC2: 積み上げの順序がhw-hub-frontendのホーム画面グラフと一致している

### 備考

- 優先順位の根拠: Sprint 26 Sprint Review指摘事項（bug対応後に着手）
- 依存関係: なし
- 実装箇所: `lib/features/home/presentation/widgets/household_overview_card.dart` の `rodStackItems` 構築ロジック
- fl_chartの `BarChartRodStackItem` の順序を「メンバー → 未割当」に変更する（現在は「未割当 → メンバー」）
- 技術的に対応可能であることを確認済み（Sprint 26 Retro）
- ブランチ: `feature/66-mobile-home`

---

## Issue #73: [mobile] ホーム画面「おうちの様子」グラフに縦軸目盛りを追加する

**ラベル**: feature
**ブランチ**: `feature/66-mobile-home`

### 概要

「おうちの様子」カードの積み上げ棒グラフにWeb版のような縦軸（Y軸）の目盛りを追加する。

### 背景

Sprint 26のSprint Reviewで、グラフの件数が読み取りづらいためWeb版のように縦軸に目盛りを付けてほしいと指摘された。

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** おうちの様子グラフで件数をもっと読み取りやすくしてほしい
**So that** グラフを見ただけで家事の件数を把握できる

### Acceptance Criteria

- [x] AC1: 積み上げ棒グラフの左側に縦軸の目盛り（整数値）が表示される
- [x] AC2: 目盛りのデザインがhw-hub-frontendのホーム画面グラフと整合している
- [x] AC3: 目盛りの文字サイズ・色がアプリのデザイントークンに従っている

### 備考

- 優先順位の根拠: Sprint 26 Sprint Review指摘事項（bug対応後に着手）
- 依存関係: なし
- 実装箇所: `lib/features/home/presentation/widgets/household_overview_card.dart` の `leftTitles` 設定
- fl_chartの `SideTitles` で `showTitles: true` に変更し、`getTitlesWidget` で整数ラベルを返すよう設定する
- 追加パッケージ不要（fl_chartが縦軸ラベルをネイティブサポート）
- 技術的に対応可能であることを確認済み（Sprint 26 Retro）
- ブランチ: `feature/66-mobile-home`

---

## リスク・チャレンジ

### リスク

| リスク | 対応方針 |
|---|---|
| 全5件が既存ブランチ `feature/66-mobile-home` への追加改修 | reviewerへのコミット範囲指定（`git diff <sprint-start-commit>^...HEAD`）を必ず実施すること（Sprint 20の教訓） |
| #70はAPIのフィルタリング仕様確認が必要 | `hw-hub-backend` の `/api/housework-tasks` エンドポイントの実装を確認してから実装方針を決定する |
| #71はi18nキーの確認が必要 | フロントエンドの購入場所i18nキー定義を確認してから実装する |
| 既存PRがある場合はbody PATCHでclosesを追加が必要 | Sprint 25で確立した手順（scrum-master-workflow⑥）に従う |

### チャレンジ

- Claudeモデル最新バージョン確認（現在: Opus 4.7計画 / Sonnet 4.6実装。変更なし）
- reviewerのDiscord投稿継続監視（Sprint 13〜26で15スプリント連続成功。16スプリント連続を目指す）
