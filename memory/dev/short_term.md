# Dev 短期記憶

**スプリント**: Sprint 29
**最終更新**: 2026-05-12

---

## スプリントゴール

Sprint 28 Review指摘対応 — My Tasks担当者フィルタバグ・デザインweb SP版合わせ・GoRoute定数化漏れを完了させる

---

## 対象Issue（全てbugラベル）

| Issue | 内容 | ブランチ |
|-------|------|---------|
| #76 | [mobile] My Tasks画面に自分の担当以外の家事タスクが表示される | `feature/67-mobile-my-tasks` |
| #77 | [mobile] My Tasks画面のデザインがwebのSP版と異なる | `feature/67-mobile-my-tasks` |
| #78 | [mobile] app_router.dartのGoRouteのpath引数がAppRoutes定数に未置換のまま残っている | `feature/67-mobile-my-tasks` |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`
コミット番号: `(ryokkon624/hw-hub-manage#76)` / `#77` / `#78`

---

## 承認済み実装方針

### 全体方針
- 同一ブランチ `feature/67-mobile-my-tasks` で #76 → #78 → #77 の順に実施
  - #76: ロジック改修・テストが固まりやすい
  - #78: 機械的なGoRoute path定数置換（低リスク）
  - #77: web SP版と照合してデザイン調整（最後にまとめてUI確認）
- 各IssueごとにコミットメッセージにIssue番号を付与する

---

### #76 My Tasks 担当者フィルタ追加

**原因**:
`MyTasksNotifier._load()` 内で `repo.fetchOpenTasks(householdId: ...)` の戻り値をそのまま past/future に振り分けている。`assigneeUserId == currentUserId` のフィルタが入っていないため、世帯全体のタスクが表示される。  
ホーム画面（`home_notifier.dart`）では `loadCurrentUserId()` を呼び出して `assigneeUserId == currentUserId` で絞り込んでいるが、My Tasks 側は同じ処理が未実装。

**改修方針**:
1. `MyTasksRepository` に `loadCurrentUserId()` を追加（`GET /api/users/me/profile` で `userId` を返す。HomeRepository と同一実装をコピーする方が依存をシンプルに保てる）
2. `MyTasksNotifier._load()` を `Future.wait` で `fetchOpenTasks` と `loadCurrentUserId` を並行取得し、 `tasks.where((t) => t.assigneeUserId == currentUserId)` で絞ってから past/future に振り分ける
3. 仕様書 `hw-hub-mobile/docs/mobile-spec/12_my_tasks.md` の「4. API」セクションの GET 行に「フロント側で `assigneeUserId == currentUserId` フィルタを実施」を明記
4. Notifier テスト追加（TDD）:
   - 「自分以外の assigneeUserId のタスクが past/future に含まれないこと」
   - 既存のテストは `assigneeUserId: 10` 固定だったため、`loadCurrentUserId` のモックを返すよう `setUp` を修正

**変更ファイル**:
- 編集: `lib/features/tasks/data/my_tasks_repository.dart`（interface + impl に `loadCurrentUserId` 追加）
- 編集: `lib/features/tasks/presentation/my_tasks_notifier.dart`（_load を改修）
- 編集: `test/features/tasks/presentation/my_tasks_notifier_test.dart`（フィルタテスト追加・既存テストの mockRepo に `loadCurrentUserId` のスタブ追加）
- 編集: `test/features/tasks/data/my_tasks_repository_test.dart`（`loadCurrentUserId` の成功・例外ケース追加）
- 編集: `test/features/tasks/tasks_mocks.dart`（必要に応じて `@GenerateMocks` 更新 → build_runner 実行）
- 編集: `hw-hub-mobile/docs/mobile-spec/12_my_tasks.md`

---

### #78 GoRoute path 引数の AppRoutes 定数化

**原因**:
Sprint 28 #75 で `context.go()` 引数のみ `AppRoutes` 定数に置換し、`GoRoute(path: ...)` 側はリテラルのまま残った（対応漏れ）。

**改修方針**:
1. `app_router.dart` の `_routes` 配列内の全 `GoRoute(path: 'XXX')` を `AppRoutes.xxx` 参照に置換
2. ネストされたサブルートの相対パス（例: `path: 'sent'`, `path: 'new'`, `path: ':id'`, `path: 'account'` 等）も `AppRoutes` クラスに追加（`forgotPasswordSentRelative`, `shoppingNewRelative` などの "相対パス用定数" を新設するか、サブルート専用の private const を追加）
   - 案A（採用候補）: `AppRoutes` 内に `static const _xxxRelative = 'xxx';` の private const を追加して GoRoute 側で参照。トップレベル定数（`/forgot-password/sent` など絶対パス）はそのまま保持してナビゲーション側との互換を維持
   - 案B: `AppRoutes` 内の絶対パス定数から `split('/')` 等でサブパスを切り出す → 動的処理が増えるので不採用
   - **採用: 案A**（明示的・grep可能・型安全）
3. `_publicPrefixes` はAC1で対象外なのでリテラルのまま残す
4. `flutter analyze` が警告ゼロであることを確認

**変更ファイル**:
- 編集: `lib/app_router.dart`（GoRoute 全置換・必要な相対パス定数追加）

---

### #77 My Tasks 画面 デザイン web SP 版合わせ

**原因**:
モバイル実装時に web の MyTasksPage.vue SP版を細かく参照せず、独自のレイアウト・配色になっている。
具体的な差分:
1. **過去セクションのレイアウト**: web は「説明文の右側に "すべて完了" ボタンを配置（横並び）」だが、モバイルは縦並びでOutlinedButton幅100%。
2. **過去タスクカードの色**: web は `bg-hwhub-palette-rose-soft` + `border-hwhub-palette-rose` + タイトル色 `text-hwhub-palette-rose`。モバイルは標準 Card（surfaceCard）のままで rose 色が反映されていない。
3. **今日のタスクカードの色**: web は `bg-hwhub-palette-emerald-soft` + `border-hwhub-palette-emerald`。モバイルは標準 Card のまま。
4. **これからのセクションのヘッダー**: web は「タイトル + 未対応件数」がヘッダー右端、フィルタはその下にセグメントコントロール風（白背景の選択中）。モバイルはタイトル右に件数・フィルタはチップ風で primary 色塗りつぶし。
5. **日付ラベル**: web は「今日」「明日」「M/D(曜日)」と曜日のみ。モバイルは「M月D日(曜日) N件」。
6. **過去セクションの "すべて完了" ボタン**: web は primary 色塗りつぶしの小さい pill ボタン。モバイルは rose 色の OutlinedButton で目立ちすぎる。
7. **介入文（intro）**: web には `myTasks.intro` の説明テキストがリスト最上部にあるが、モバイルにはない。

**改修方針**:
1. `SwipeableTaskCard` を「過去用（rose系）／今日用（emerald系）／通常」3スタイルに切り替えできるよう `variant` または `isPast` / `isToday` プロパティを追加
   - カードのborder色・背景色を切り替え
   - 過去タスクのタイトル色は paletteRoseText を適用
2. `PastTasksSection` のヘッダーを横並び（タイトル左・"すべて完了" ボタン右）に変更。ボタンは小型のElevatedButton（primary背景）に変更
3. `FutureTasksSection` のヘッダー: タイトル + 説明文（左）／フィルタ + 件数（右下）の2列レイアウト。フィルタは選択中=白背景＋影、非選択=透明背景のセグメントコントロール風に変更（primary塗りつぶしは不採用）
4. 日付ラベルを「今日」「明日」「M/D(曜日)」表記に変更。曜日名は既存i18nキー `myTasksWeekdayXxx` を流用
5. ページ最上部に `myTasksIntro` テキストを追加（i18n キー新規追加）
6. 関連i18nキー（intro・"今日"・"明日" など）を `app_ja.arb` / `app_en.arb` / `app_es.arb` に追加 → `flutter gen-l10n`
7. ウィジェットテスト（`my_tasks_page_test.dart`）は今回は **テスト不要**（規約: View / Component の見た目の変更はテスト対象外）。ただし `isPast` / `isToday` のような表示分岐を `SwipeableTaskCard` に追加する場合のみ最低限のウィジェットテストを追加する（カードのDecoration色を `find.byType(Container)` + 色比較で確認）

**変更ファイル**:
- 編集: `lib/features/tasks/presentation/widgets/swipeable_task_card.dart`（variant追加）
- 編集: `lib/features/tasks/presentation/widgets/past_tasks_section.dart`（ヘッダー横並び・ボタン小型化・カードvariant指定）
- 編集: `lib/features/tasks/presentation/widgets/future_tasks_section.dart`（ヘッダー2列・フィルタチップのスタイル変更・日付ラベル変更・カードvariant指定）
- 編集: `lib/features/tasks/presentation/my_tasks_page.dart`（intro 追加）
- 編集: `lib/l10n/app_ja.arb` / `app_en.arb` / `app_es.arb`
- 編集（自動生成）: `lib/l10n/app_localizations*.dart`（flutter gen-l10n）

---

## コミット前チェックリスト

- [ ] `dart format .`
- [ ] `flutter analyze`（警告ゼロ）
- [ ] `flutter test`（全グリーン）
- [ ] `git push -u origin feature/67-mobile-my-tasks`

---

## 作業ルール

- コミットメッセージ形式: `fix: [内容] (ryokkon624/hw-hub-manage#76)` 等
- [DEV] プレフィックスをDiscord投稿に必ずつける
- 作業スレッドID: `1503674278481104940`
- PRはSMが行う。DEVはpushまでが担当

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #76 担当者フィルタ追加 | 完了 ✅ |
| #78 GoRoute path定数化 | 完了 ✅ |
| #77 デザインweb SP版合わせ | 完了 ✅ |

**ブランチ**: `feature/67-mobile-my-tasks`  
**プッシュ済み**: 2026-05-12  
**コミット**: 3件（#76 / #78 / #77 各1コミット）

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
