# Dev 短期記憶

**スプリント**: Sprint 26
**最終更新**: 2026-05-11

---

## スプリントゴール

モバイルアプリのホーム画面を実装し、家事・買い物の状況が一目で確認できるダッシュボードを完成させる

---

## 対象Issue

| Issue | 内容 | ブランチ |
|-------|------|---------|
| #66 | [mobile] ホーム画面を実装する (#10) | `feature/66-mobile-home`（hw-hub-mobileリポジトリ） |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`

---

## 実装方針（提示中・りょこさん承認待ち）

### 0. 事前調査の重要発見

- **`/api/households/me` は存在しない**。Web版・バックエンド実装は `GET /api/users/me/households`（UserController）。**こちらを採用する**
- バックエンドDTO `UserHouseholdDto`: `{ householdId: Long, name: String, ownerUserId: Long }`
- `Household.id` は現状 mobile 側で `String` 型の仮実装 → `int`（Long に対応）に修正する
- 現在のブランチは `docs/update-readme-ci-pages`。`main` から `feature/66-mobile-home` を切る
- HouseholdSwitcher 関連の UI（`household_indicator_bar.dart` / `household_switcher_sheet.dart` / `main_shell.dart` 組み込み）は既に存在。`HouseholdNotifier.build()` の TODO（仮実装の空リスト）を実API呼び出しに差し替える必要がある
- mobile 既存テスト構成：`flutter_test + mockito + @GenerateMocks` パターンが確立済み。`test/helpers/mocks.dart` でモック集中管理

### 1. 全体方針

- feature-first 構成に従い、`features/home/` を新設
- `core/household/` は既存 HouseholdNotifier を実APIに切り替える
- 6本のAPI呼び出しは `Future.wait` で並列化
- TDD: Notifier・Repository・ウィジェット全て先にテストを書く（mobile-conventions §7に従う）
- カバレッジ95%必達。fl_chart の BarChart は表示確認のみのテストでカバレッジ範囲外扱いとなる可能性があるため、ロジック（集計関数等）は Notifier 側に分離する

---

### 2. 新規作成・編集ファイル一覧

#### 修正（既存）

| ファイル | 変更内容 |
|---------|---------|
| `pubspec.yaml` | `fl_chart: ^0.69.0` 系を追加 |
| `lib/core/models/household.dart` | `id: String` → `id: int`（バックエンドの `Long householdId` に整合）。テストも修正 |
| `lib/core/household/household_notifier.dart` | TODO の仮実装を実装に差し替え。`dioProvider` から `GET /api/users/me/households` を呼びレスポンスを `Household` リストに変換 |
| `lib/core/storage/storage_keys.dart` | `selectedHouseholdId` 既存のまま使用（保存値型は String 化して保存） |
| `lib/app_router.dart` | ホームのプレースホルダ `_P('ホーム')` を `HomePage()` に差し替え |
| `lib/l10n/app_ja.arb` / `app_en.arb` / `app_es.arb` | ホーム画面用のテキスト追加（後述） |
| `test/core/household/household_notifier_test.dart` | API呼び出し化に伴うテスト書き換え（dio をモック化） |
| `test/core/household/household_state_test.dart` | `id: String → int` 整合修正 |
| `test/features/shell/household_indicator_bar_test.dart` | `id` 型変更追従 |
| `test/helpers/mocks.dart` | `@GenerateMocks` に `Dio` / 各Repositoryを追加 |
| `lcov_exclude.txt` | 必要に応じて `lib/features/home/presentation/home_page.dart` の BarChart 描画部を限定除外（カバレッジ95%を満たせない場合のみ） |

#### 新規（home feature）

| ファイル | 内容 |
|---------|------|
| `lib/features/home/home_providers.dart` | Repository / Notifier の Provider 配線 |
| `lib/features/home/data/home_repository.dart` | interface + impl。6つのAPIを Future.wait で並列呼び出し |
| `lib/features/home/data/home_api.dart` | Retrofit `@RestApi` 定義（GET 5本：households-members / houseworks / housework-tasks×2 / shopping-items） |
| `lib/features/home/data/models/household_member_dto.dart` | バックエンド `HouseholdMemberDto` に対応 |
| `lib/features/home/data/models/housework_dto.dart` | バックエンド `HouseworkDto` に対応 |
| `lib/features/home/data/models/housework_task_dto.dart` | バックエンド `HouseworkTaskResponse` に対応 |
| `lib/features/home/data/models/shopping_item_dto.dart` | バックエンド `ShoppingItemDto` に対応 |
| `lib/features/home/data/models/user_household_dto.dart` | バックエンド `UserHouseholdDto` に対応（`core/household` から呼ぶため `core` に置くか検討） |
| `lib/features/home/presentation/home_page.dart` | ホーム画面UI（4カード + オンボーディング） |
| `lib/features/home/presentation/home_notifier.dart` | `HomeNotifier` (AsyncNotifier)。world load・refresh・集計ロジック |
| `lib/features/home/presentation/home_state.dart` | `HomeState`（不変クラス） |
| `lib/features/home/presentation/widgets/my_tasks_card.dart` | My Tasks カード |
| `lib/features/home/presentation/widgets/unassigned_card.dart` | 家事未割り当てカード |
| `lib/features/home/presentation/widgets/shopping_card.dart` | 買い物リストカード |
| `lib/features/home/presentation/widgets/household_overview_card.dart` | おうちの様子（fl_chart BarChart） |
| `lib/features/home/presentation/widgets/onboarding_card.dart` | 世帯未所属時カード |
| `lib/features/home/presentation/widgets/home_app_bar.dart` | ヘッダ（タイトル + 通知アイコン + アカウント） |
| `test/features/home/data/home_repository_test.dart` | Repository テスト（成功・DioException 変換） |
| `test/features/home/presentation/home_notifier_test.dart` | Notifier テスト（成功・エラー・世帯切替時の再フェッチ・集計ロジック） |
| `test/features/home/presentation/home_page_test.dart` | ウィジェットテスト（4カード表示 / オンボーディング表示 / ボタンタップ遷移 / ローディング表示） |
| `test/features/home/presentation/widgets/*.dart` | 各カードのウィジェットテスト（カード単体テスト容易化のため切り出し） |

---

### 3. HouseholdSwitcher（core/household/）の設計方針

- `Household` モデルに `id: int` で型修正（バックエンドが Long）
- `HouseholdNotifier.build()`:
  - `ref.read(dioProvider).get('/api/users/me/households')` でフェッチ
  - レスポンス JSON → `Household` リストに変換
  - `SharedPreferences` から復元、なければ先頭にフォールバック
  - DioException は `AppException` に変換して `AsyncError` に流す
- `HouseholdNotifier.select(Household)`: 既存実装維持。ただし `prefs.setInt('selected_household_id', household.id)` に変更
- ボトムシート（既存）はそのまま利用。`HomeNotifier` は `householdNotifierProvider` を `ref.watch` し、`selectedHousehold.id` の変化に応じて再フェッチする（`ref.listen` パターン）

---

### 4. HomeNotifier・HomeState の設計

```dart
class HomeState {
  final MyTasksSummary myTasksSummary;
  final UnassignedSummary unassignedSummary;
  final List<ShoppingItem> shoppingItems;
  final List<DailyOverview> householdOverview;
  final List<HouseholdMember> members; // 凡例用
  final bool hasHousehold;
  final bool isLoading;
  final String? errorMessage;
}

class MyTasksSummary {
  final int todayCount;
  final int weekCount;
  final int overdueCount;
}

class UnassignedSummary {
  final int totalCount;
  final int urgentCount; // 今日〜3日以内
}

class DailyOverview {
  final DateTime date;
  final Map<int?, int> countsByAssignee; // null=未割当, key=userId
}
```

- `HomeNotifier` は `AsyncNotifier<HomeState>`
- `build()` で初回ロード（selectedHousehold が null なら hasHousehold=false 状態を返す）
- `ref.listen(householdNotifierProvider, ...)` で世帯切替を検知 → `state = AsyncData(state.value!.copyWith(isLoading: true))` → 再フェッチ
- 集計ロジック（タスクから today/week/overdue を抽出、未割当の totalCount/urgentCount、shopping の店別件数、daily overview の集計）は **pure function** として切り出し、テスト容易化する
- 認証ユーザーIDは `authNotifierProvider` の `AuthAuthenticated.userId` から取得

---

### 5. fl_chart BarChart の実装アプローチ

- パッケージ: `fl_chart: ^0.69.2`（最新安定版）
- `BarChart(BarChartData(...))` を `SizedBox(height: 200)` で囲んで使用
- 各日 `BarChartGroupData(x: dayIndex, barRods: [BarChartRodData(toY: total, rodStackItems: [...])])` の形で積み上げ
- `rodStackItems` の各セグメントはメンバー色（事前定義のカラーパレット6色＋未割当=グレー）でマッピング
- X軸ラベル: `bottomTitles` で `M/d` 表示
- 13日分（過去6+今日+未来6）。まずは画面幅に収める設計（barWidth=12, groupsSpace=4 程度）。横スクロールはAC範囲外として後回し
- 凡例はカード下部に `Wrap` で `_LegendDot(color, name)` を並べる
- ロジック（DailyOverview の集計）は Notifier 側に置き、BarChart ウィジェットは props で受け取って描画するだけにする（テスタビリティ確保）

---

### 6. API呼び出しの並列化方針

`HomeRepository.loadAll(householdId)`：

```dart
Future<HomeRawData> loadAll(int householdId) async {
  final results = await Future.wait([
    _api.getMembers(householdId),
    _api.getHouseworks(householdId),
    _api.getOpenTasks(householdId),       // status=0
    _api.getDoneTasks(householdId),       // status=1
    _api.getShoppingItems(householdId),
  ]);
  return HomeRawData(
    members: results[0] as List<HouseholdMemberDto>,
    houseworks: results[1] as List<HouseworkDto>,
    openTasks: results[2] as List<HouseworkTaskDto>,
    doneTasks: results[3] as List<HouseworkTaskDto>,
    shoppingItems: (results[4] as ShoppingItemListResponseDto).items,
  );
}
```

- `Future.wait` で並列化
- いずれか1つでも失敗したら全体エラー（partial 結果は扱わない）
- DioException は Repository 層で `AppException` に変換
- `/api/users/me/households` は HouseholdNotifier 側で別管理

---

### 7. テスト戦略（カバレッジ95%達成）

| 対象 | テスト種別 | 内容 |
|------|----------|------|
| `HouseholdNotifier`（実APIに修正） | Notifier テスト | dio モック・初期化・select・SharedPreferences 復元 |
| `HomeRepository` impl | Repository テスト | 成功パス・DioException→AppException 変換 |
| `HomeNotifier` | Notifier テスト | 初期ロード成功/失敗・世帯切替で再フェッチ・hasHousehold=false 経路・refresh |
| 集計 pure function | 単体 | today/week/overdue 抽出・urgent 件数・店別件数・DailyOverview 集計 |
| `HomePage` | ウィジェットテスト | ローディング表示・4カード表示・オンボーディング表示・ボタンタップで go_router 遷移 |
| 各 Card Widget | ウィジェットテスト | データ表示確認・タップ動作 |
| `HouseholdOverviewCard` | ウィジェットテスト | 凡例の表示確認のみ（BarChart 内部描画はカバレッジ範囲外） |

- `@GenerateMocks` に `Dio`, `HomeRepository` を追加
- `test/features/home/home_mocks.dart` を作成して集約管理
- カバレッジ計測は `coverage.ps1` で `lcov_exclude.txt` の除外を反映

---

### 8. i18n追加キー（仮）

ja:
- `homeTitle`: "ホーム"
- `homeMyTasksTitle`: "My Tasks"
- `homeMyTasksSubtitle`: "あなたに割り当てられている家事"
- `homeMyTasksToday`: "今日の家事"
- `homeMyTasksWeek`: "直近1週間"
- `homeMyTasksOverdue`: "期限超過"
- `homeMyTasksOpenButton`: "My Tasksを開く"
- `homeUnassignedTitle`: "家事の未割り当て"
- ...（en/es も同キーで追加）

---

## 申し送り事項（りょこさん承認時の指示）

- **HomeAppBar の通知・アカウントアイコンは未実装（SnackBar表示）。`#15` 対応時に必ず実装すること。**

---

## りょこさんへの確認事項（承認済み）

1. **API パス**: `/api/users/me/households` で進める。承認済み。
2. **`Household.id` の型変更**: `String → int`。承認済み。
3. **`fl_chart ^0.69.2`**: 承認済み。
4. **HomeAppBar のプレースホルダ実装**: 承認済み。ただし `#15` 対応時に必ず実装すること（申し送り事項参照）。
5. **HouseholdSwitcherSheet の subtitle 非表示**: バックエンド DTO に description がないため非表示。承認済み。

---

## 作業順（実装フェーズで実施・承認後）

1. **準備**: `feature/66-mobile-home` ブランチ作成（main 起点）、`fl_chart` 追加・`flutter pub get`
2. **core/household 修正**
   - RED: `household_notifier_test.dart` を実API呼び出し前提に書き換え（dio モック）
   - GREEN: `Household.id` 型変更・`HouseholdNotifier.build` 実装
   - 関連テスト・shell ウィジェットテストの追従修正
3. **home feature（モデル・Repository）**
   - RED: DTO ・ Repository テスト先行
   - GREEN: API クライアント・モデル・Repository 実装
   - `dart run build_runner build --delete-conflicting-outputs`
4. **home feature（Notifier・集計関数）**
   - RED: 集計 pure function のテスト → Notifier テスト
   - GREEN: 実装
5. **home feature（UI）**
   - 各カードウィジェット作成 → `HomePage` 統合
   - ウィジェットテスト追加
   - i18n キー追加・`flutter gen-l10n`
6. **router 差し替え**: `_P('ホーム')` → `HomePage()`
7. **コミット前**: `dart format .` / `flutter analyze` / `flutter test` / カバレッジ確認
8. コミット・push → SMにレビュー依頼

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #66 ホーム画面（モバイル） | 完了（コミット: b2470dc、ブランチ: feature/66-mobile-home、push済み） |
| #66 レビュー指摘対応 | 完了（コミット: ca03170、push済み） |
| #66 Round 2指摘対応 | 完了（コミット: 75daa39、push済み） |
| #66 Round 3指摘対応 | 完了（コミット: 18465ff、push済み） |

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|

---

*スプリント終了後、long_term.mdに要約して移す*
