# Sprint 26 バックログ

**スプリント**: Sprint 26
**期間**: 2026-05-11〜
**スプリントゴール**: モバイルアプリのホーム画面を実装し、家事・買い物の状況が一目で確認できるダッシュボードを完成させる

---

## 対象Issue

| Issue | タイトル | ブランチ | SP |
|-------|---------|---------|-----|
| #66 | [mobile] ホーム画面を実装する (#10) | `feature/66-mobile-home` | - |

---

## Issue #66: [mobile] ホーム画面を実装する (#10)

### ユーザーストーリー

**As a** HwHubモバイルアプリのユーザー
**I want to** ホーム画面で家事・買い物の状況をひとめで確認したい
**So that** 日々の家事状況を素早く把握し、次にやるべきことへ移れる

### Acceptance Criteria

- [x] AC1: 世帯所属済みの場合、My Tasksカード / 家事未割り当てカード / 買い物リストカード / おうちの様子カードの4枚を表示する
- [x] AC2: My Tasksカードに「今日の件数」「直近1週間の件数」「期限超過の件数（赤字）」を表示し、[My Tasksを開く]ボタンで#12へ遷移できる
- [x] AC3: 家事未割り当てカードに「未割り当て（全期間）」「今日〜3日以内」の件数を表示し、[家事割り当てを開く]ボタンで#11へ遷移できる
- [x] AC4: 買い物リストカードに購入場所別の未購入件数と直近2日以内の追加件数を表示し、[買い物リストを開く]ボタンで#13へ遷移できる
- [x] AC5: おうちの様子カードに過去6日〜未来6日の積み上げ棒グラフ（fl_chart: BarChart）を表示する。メンバーごと・未割当で色分けし、グラフ下部に凡例を表示する
- [x] AC6: 世帯未所属の場合、オンボーディングカード（おうち設定へ / 家事設定への2ボタン）を最上部に追加表示する。各機能カードは件数ゼロで表示する
- [x] AC7: 複数世帯所属時は世帯インジケーターバーを表示し、タップで世帯切り替えボトムシートが開く。切り替え後は全カードのデータを再取得する（HouseholdSwitcher共通仕様。本Issueで初実装）
- [x] AC8: 画面表示時・世帯切り替え時にAPIからデータを取得し、ローディング中はインジケーターを表示する
- [x] AC9: テストカバレッジ ≥95%（Notifier・ウィジェットテスト）

### 仕様詳細（`hw-hub-mobile/docs/mobile-spec/10_home.md` より転記）

#### 画面構成（世帯所属済み）

```
┌─────────────────────────────────────┐
│ ホーム                       🔔 👤  │
├─────────────────────────────────────┤
│ [My Tasksカード]                     │
│ [家事未割り当てカード]                │
│ [買い物リストカード]                  │
│ [おうちの様子カード（積み上げ棒グラフ）] │
├─────────────────────────────────────┤
│  自宅 ▼  （複数世帯所属時のみ）      │
├─────────────────────────────────────┤
│ 🏠    📋    ✅    🛒    ⚙️          │
└─────────────────────────────────────┘
```

#### 機能カード仕様

**My Tasksカード**
- 今日の家事件数: 今日が実施日の自分担当タスク件数
- 直近1週間: 今日から7日以内の自分担当タスク件数
- 期限超過: 今日より前の未対応タスク件数（赤字表示）
- [My Tasksを開く]ボタン → #12へ遷移

**家事未割り当てカード**
- 未割り当て（全期間）: 担当者未設定のタスク総件数
- 今日〜3日以内: 今日から3日以内に実施予定の未割り当て件数
- [家事割り当てを開く]ボタン → #11へ遷移

**買い物リストカード**
- 購入場所別の未購入件数
- 直近2日以内に追加されたアイテム件数
- [買い物リストを開く]ボタン → #13へ遷移

**おうちの様子カード（グラフ）**
- 積み上げ棒グラフ（fl_chart: BarChart）
- 表示期間: 過去6日〜未来6日（計13日分）
- X軸: 日付（M/d形式）、Y軸: タスク件数
- 色分け: メンバーごと + 未割当
- 凡例: グラフ下部にメンバー名と色を表示
- レイアウト: まず画面幅内に収める。ラベルが重なる場合は横スクロールに切り替え

**オンボーディングカード（世帯未所属時のみ）**
- おうち設定へ移動ボタン → #19 世帯設定
- 家事設定へ移動ボタン → #20 家事設定一覧

#### HouseholdSwitcher共通UI仕様（本Issueで初実装）

- 複数世帯所属時のみ: ボトムナビ直上に「世帯インジケーターバー」を表示
- タップで世帯切り替えボトムシートが開く（所属全世帯リスト・現在選択世帯にチェック）
- 切り替え後: データ再取得・再描画
- 選択世帯の永続化: `SharedPreferences`（`selected_household_id`）
- HouseholdState: `households / selectedHousehold / isMultiple` をグローバル管理

#### 状態管理

```
HomeState
├── myTasksSummary: MyTasksSummary
│   ├── todayCount: int
│   ├── weekCount: int
│   └── overdueCount: int
├── unassignedSummary: UnassignedSummary
│   ├── totalCount: int
│   └── urgentCount: int
├── shoppingItems: List<ShoppingItem>
├── householdOverview: List<DailyOverview>
├── hasHousehold: bool
└── isLoading: bool
```

#### API一覧

| メソッド | エンドポイント | 用途 |
|---|---|---|
| GET | `/api/households/me` | 所属世帯一覧（HouseholdSwitcher用） |
| GET | `/api/households/{householdId}/members` | メンバー一覧（グラフ凡例用） |
| GET | `/api/houseworks?householdId={householdId}` | 家事マスタ一覧（タスク名解決用） |
| GET | `/api/housework-tasks?householdId={householdId}&status=0` | 未対応タスク |
| GET | `/api/housework-tasks?householdId={householdId}&status=1` | 完了タスク（グラフ用） |
| GET | `/api/households/{householdId}/shopping-items` | 買い物リスト |

#### 追加パッケージ

| パッケージ | 用途 |
|---|---|
| `fl_chart` | おうちの様子の積み上げ棒グラフ |

### 備考

- ブランチ名: `feature/66-mobile-home`
- 仕様書: `hw-hub-mobile/docs/mobile-spec/10_home.md`
- 依存: `fl_chart` パッケージ導入が必要
- HouseholdSwitcher共通UIを本Issueで初実装する
- `/api/households/me` エンドポイントはWeb版の実装を確認してから正確なパスを使うこと

---

## リスク・チャレンジ

### リスク

| リスク | 対応方針 |
|---|---|
| fl_chartの初導入で棒グラフ実装が複雑になる | 仕様書のレイアウト方針（まず画面幅内に収める）を厳守し、横スクロールは後回しにする |
| HouseholdSwitcher（グローバル世帯状態）の初実装 | `core/household/` に `HouseholdState + HouseholdNotifier` を実装。Notifierテストを徹底する |
| テストカバレッジ95%（Notifier+ウィジェット両方必須） | 実装と並行してテスト作成（TDD）。fl_chartウィジェットは表示確認のみでカバレッジ除外対象とならないか事前確認 |
| 6本のAPI並列呼び出し | `Future.wait` で並列化してローディング時間を最小化する |

### チャレンジ

- Claudeモデル最新バージョン確認（現在: Opus 4.7計画 / Sonnet 4.6実装。変更なし）
- reviewerのDiscord投稿継続監視（Sprint 13〜25で14スプリント連続成功。15スプリント連続を目指す）
- **初モバイルスプリント**: mobile-conventions・reviewer3観点のモバイル対応が実際に機能するかを確認
