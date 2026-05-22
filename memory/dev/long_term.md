# Dev 長期記憶

**最終更新**: 2026-05-22（Sprint 59 Retro）

---

## long_term.md の目的

「次の自分が同じミスを繰り返さず、より速く正確に動くための手掛かり」を蓄積する場所。

- 技術的なハマりポイントと解決策
- 繰り返し指摘を受けるパターン（コミット前に参照）
- テスト・実装で躓きやすい罠

---

## 繰り返し指摘されるパターン（過去実績あり）

### hw-hub-frontend

| パターン                                                  | 発生スプリント | 対応                                                           |
| --------------------------------------------------------- | -------------- | -------------------------------------------------------------- |
| i18n ハードコード（文字列リテラルをテンプレートに直書き） | 33, 34         | `t('キー')` 形式。yup エラーメッセージも i18n キー文字列で渡す |

### hw-hub-mobile

| パターン                                                        | 発生スプリント | 対応                                                                          |
| --------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------- |
| マジックストリング（status/flag値を `'0'`/`'1'` で直接比較）    | 34, 35         | `core/models/` の生成済み enum（`ShoppingItemStatus.xxx.code`）を使う         |
| `catch (_) {}` でエラーを握りつぶし                             | 34, 35, 43, 45 | `rethrow` または `AppException` に変換。Notifier層は `on AppException catch (e)` で state に格納。StatefulWidget の event handler 内は AppSnackBar で汎用通知。`catch (e)` で `e.toString()` をそのまま state に格納するのも同様に NG |
| i18n ハードコード（日本語・英語文字列をウィジェット内に直書き） | 33, 34, 37, 38 | ARB ファイルに定義して `AppLocalizations.of(context).key` を使う（`features/shell` の BottomNavigationBar ラベルも例外なく適用）|
| `items.map()` / `ListView.builder` の `itemBuilder` で生成するウィジェットに `key` 未設定 | 38, 39, 59 | `ValueKey(item.id)` を最外ウィジェット（`Padding` / `Dismissible` 等）に付与する。`items.map()` だけでなく `ListView.builder` の `itemBuilder` 内 `Padding` にも同様に適用すること。スワイプ後のリスト更新でウィジェット状態が混乱する |
| `build()` 内で重いループ・重複計算を毎フレーム実行 | 39, 44, 46 | O(n×m) のような集計・`where().toList()` の複数回呼び出しは Notifier 側で事前計算し state に持たせ、ウィジェットは参照のみ（ex: `Map<int,int> memberTaskCounts`、`isCurrentUserOwner: bool` フラグ等も State に移す） |
| IndexedStack 配下で一覧 Provider の invalidate 漏れ             | 35             | 詳細・作成画面での追加/削除/ステータス変更後に `ref.invalidate(一覧Provider)` |
| `Dismissible` の `background`/`secondaryBackground` の中身と `confirmDismiss` の `direction` 判定が不一致（スワイプ方向逆） | 40, 41, 42 | 3箇所をセットで確認する。`background` → startToEnd（右スワイプ）、`secondaryBackground` → endToStart（左スワイプ）に対応 |
| `Text` ウィジェットで長い文字列が画面外にはみ出す（Overdue ラベル・タイトル等） | 41, 44 | `overflow: TextOverflow.ellipsis`（または `softWrap: true`）を設定する。特にカード内の固定幅コンテナ内のテキストは必須 |
| ユーザーアイコン表示に `UserAvatar` 共通ウィジェットを使わずにテキストラベルで実装 | 40, 41, 45 | `lib/core/ui/user_avatar.dart` の `UserAvatar` を使う。新機能でアイコン表示が必要なときに再実装しない。`iconUrl: null` のハードコードは「未割当表示」専用であり、ラベル（`displayName`）も親から渡すこと。ハードコード文字列（`'U'` 等）は禁止 |
| ウィジェットテストで日本語テキストを直接検証（`find.text('日本語')` 等） | 45, 50, 53, 59 | `find.byKey(const Key('xxx'))` を使い Key ベースで検証する。ARB 変更に強く、多言語対応のテストになる。`(tester.widget(...) as Text).data == '日本語'` 形式も同様に禁止 |
| `debugPrint` でエラーオブジェクト（`$e`）全体を出力 | 45 | スタックトレース・内部状態がログに露出するためセキュリティリスク。固定の警告文字列のみ出力する（例: `debugPrint('Google sign-in failed')`）|
| `AsyncNotifierProvider` / `NotifierProvider` の AutoDispose 未設定（画面離脱後もメモリに残る） | 45, 48, 51 | 画面固有の Provider は `AsyncNotifierProvider.autoDispose` / `NotifierProvider.autoDispose` にする。一覧画面の `Notifier` も対象（`InquiryListNotifier` 実績）。グローバル共有 Provider（未読数等）は AutoDispose なしで実装 |
| メソッドシグネチャのパラメータ型に `dynamic` を使用（型明示漏れ） | 48 | `Widget _buildBody(dynamic state)` のように `dynamic` でパラメータ型を書かず、`InquiryDetailState` 等の具体的な型を明示する。`dynamic` / `var` の乱用は全箇所で禁止 |
| 空データ（0件）をローディング中と区別せずに「読み込み中」表示のまま放置 | 47 | `AsyncValue` の状態遷移を正確にハンドリングする。`data.isEmpty` の場合は空状態ウィジェット（EmptyState）を表示する。`loading` / `error` / `data（0件）` / `data（1件以上）` の4ケースをすべて確認すること |
| フォームにテンプレート等から値を流し込む際に TextEditingController への反映漏れ | 47 | State の値を更新するだけでなく、対応する `TextEditingController.text = newValue` も必ずセットで更新すること。また横展開で「同じフォーム内に複数フィールドがある場合、全フィールドの反映漏れ」を確認すること |
| 月と日を個別入力するフォームで存在しない日付（例: 2月30日）の入力を許可してしまう | 47 | 月と日を組み合わせた日付の整合性バリデーションを実装すること。`DateTime(year, month, day).month == month` で存在チェックできる（Dartの`DateTime`は28日がない月に31日を指定すると自動繰り越しするため、チェック後の月が入力した月と一致しない場合は無効） |
| 操作ロジックを持つウィジェット（SegmentedButton 等）のウィジェットテスト漏れ | 52 | 「見た目の変更のみ」はテスト不要だが、「ユーザー操作 → Notifier 呼び出し」のロジックを持つウィジェットはウィジェットテスト必須。テスト対象の判断基準: コールバック（`onThemeModeChanged` 等）が Notifier への呼び出しを含む場合はテストを書く |
| `ref.listen` コールバック内で `_controller.text` を直接更新しても UI が再描画されない（`setState()` 呼び出し漏れ） | 55 | `StatefulWidget` 内の `ref.listen` コールバックで `TextEditingController.text` 等を更新する場合は必ず `setState(() { _controller.text = newValue; })` でラップすること。`setState()` なしでは `controller.text` は更新されるが Flutter のフレームが再描画されず画面に反映されない |
| `_dio.get<dynamic>()` 等 Dio の型パラメータに `<dynamic>` を使用（具体型指定漏れ） | 46, 58 | `_dio.get<List<dynamic>>()` / `_dio.get<Map<String, dynamic>>()` のように具体型を指定する。`<dynamic>` のままにすると 2 段階キャストが必要になり、テストのモックスタブも型パラメータを合わせないとスタブが効かなくなる |

### hw-hub-backend

| パターン | 発生スプリント | 対応 |
| -------- | -------------- | ---- |
| 例外メッセージに内部ユーザーID（userId 等）を含める | 45 | エラーメッセージには内部IDを含めない。固定のメッセージ文字列を使う（例: `"他のユーザーに連携済みです"` → `"このGoogleアカウントはすでに別のアカウントに連携されています"`）|
| ループ内でリポジトリ呼び出し（N+1問題） | 45 | `deleteAccount()` の OWNER 判定チェックなど、複数IDをループで検索する場合は `findByIds()` / `countByIds()` のような一括クエリに変更する |

### hw-hub-batch

（現時点で繰り返し指摘の実績なし）

---

## 技術的なハマりポイント

### hw-hub-frontend

- store の内部状態フィールド（`lastFetchedAtByHouseholdId` 等）はコンポーネントから直接参照せず、getter（`isFetchedFor` 等）経由でアクセスする（カプセル化）
- スワイプジェスチャーは `composables/useSwipeGesture.ts` に切り出し、touchstart/touchmove/touchend のみ扱う（マウスイベントは無視）。translateX をリアルタイム返却して2層構成（背景＋前面）でドラッグ追従を実現
- スワイプ背景色は `main.css` に `bg-hwhub-swipe-action/delete/back/disabled` のカラートークンで指定する（生クラス禁止）
- ユーザーアイコンの broken image 対策は `components/ui/UserAvatar.vue`（`imageError = ref(false)` + `@error="imageError = true"` パターン）
- SP/PCのレイアウト分岐はTailwindの `md:` ブレークポイントで切り替え（`md:hidden` でSP専用、`md:block` でPC専用）
- スケルトンスクリーンは `components/ui/SkeletonItem.vue`（variant別 + count指定）として共通化。初回ロード中は `withLoading` を使わず `isInitialLoading` フラグで制御（二重ローディング表示を回避）
- Tailwind v4 では `@custom-variant dark (&:where(.dark, .dark *):not(.light *):not(.light));` で `dark:` バリアントを定義する
- FOUC防止は `index.html` の `<head>` 内インラインスクリプトで LS から読んで即 `<html class>` をセットする方式が確実
- `themeStore.init()` を `main.ts` で `app.use(router)` の前に呼ぶ（matchMedia リスナー登録のため）
- フロントの sessionStorage 永続化（`Set<number>`）は `JSON.stringify([...set])` ⇔ `new Set(JSON.parse())` で変換する
- 認証経路が複数ある場合（login/register/completeOAuthLogin）、不要な再フェッチを避けるため `if (!store.isLoaded)` ガードを各経路に入れる
- API契約のDTO型は `string` のままにして `toModel` でブランド型へキャストするのが最小影響

### hw-hub-mobile

- `showDialog(builder: (context) => ...)` 内で `Navigator.pop(context)` を使うと go_router 環境では外側 context が解決されページが閉じる。`builder: (dialogContext)` で明示的に受け取り `Navigator.pop(dialogContext)` を使うこと
- `IndexedStack` 配下では `AutoDispose` が破棄されず古い state が残る。詳細・作成画面で一覧が変わる操作後は必ず `ref.invalidate(一覧Provider)` を呼ぶ（操作の種類を問わず網羅すること）
- S3 Presigned URL への PUT は `AuthInterceptor` を通してはいけない（Authorization ヘッダが付くと S3 が 403）。`Dio()`（baseUrl 無し・interceptor 無し）の別インスタンスを使う
- Repository の API レスポンス形状（ラッパー `{"items":[...]}` か フラット配列か）はバックエンドの Controller / Response クラスを必ず確認してからモックを書く
- ウィジェットテストで `find.text('削除')` のような短いテキストはスワイプ背景ラベルと確認ダイアログボタンの両方にヒットしやすい。`find.text('...').last` や `find.descendant` で特定する
- Flutter の `Container` は子サイズに自動でフィットするため、全幅表示は明示的に `width: double.infinity` を指定する（Dismissible 内のカードは特に注意）
- `AppRoutes` 定数化は `context.go()` 引数の置換から先行し、`GoRoute(path: ...)` 側の置換は別 Issue で分離すると安全
- AssigneeUserId フィルタ忘れ注意: バックエンドが全世帯員分を返す画面ではフロント側フィルタが必要
- `AuthUser` のような共有ドメインモデルは `lib/core/models/` 配下に置く（core→features 依存を作らないため）
- `ServerException` などのカスタム例外が named パラメータ（`message:`）か positional かはテスト書き始める前に必ず確認する
- `GoRouterState.of(context).matchedLocation` を `StatefulShellRoute.indexedStack` 配下の shell ウィジェット内で使って現在ルートを判定しようとしたとき、実機では sub-route のパスが反映されず HouseholdIndicatorBar の非表示ロジックが効かなかった（Sprint 37 #98、実害なしでOK判断）。shell route 配下での GoRouter state 参照は動作確認必須
- `showDialog` ベースのポップオーバーで `barrierColor: transparent` を指定するとタップ外で閉じるが、`Navigator.pop` の引数は必ずダイアログの `BuildContext`（`builder: (dialogContext)` で受け取る）を使うこと。外側の `context` を使うと go_router 環境でページごと閉じる
- `AppLifecycleObserver`（`WidgetsBindingObserver`）で `didChangeAppLifecycleState` を使う場合、`main.dart` で `WidgetsBinding.instance.addObserver(observer)` を呼ぶ際は `observer` のライフサイクル管理（`removeObserver`）も必ずセットで行うこと。Notifier の dispose で removeObserver しないとメモリリークになる
- Flutter の `AppLocalizations` は動的なキー参照（`AppLocalizations.of(context)[key]`）をサポートしない。通知メッセージのような動的キーディスパッチが必要な場合は `Map<String, String Function(AppLocalizations, ...)>` 形式のテーブルを実装して switch/lookup する（`NotificationMessageRenderer` パターン）
- `StatefulShellRoute.indexedStack` のシェル外独立ルートからシェル内ルートへ `context.push()` すると、両方の Navigator に Hero（AppBar の戻る矢印等）が同時に乗り `HeroController` のアサーション失敗でクラッシュする。シェル外ルートから遷移する場合は必ず `context.pop()` で現在画面を閉じてから `context.push(遷移先)` を呼ぶこと（Sprint 57 #157: 通知センターからタスク画面への遷移）
- fl_chart の `BarChart` で「データ0件の日に最小バー（`0.001` 等）を表示する」実装をすると、`BarChartData.maxY` を未指定の場合に fl_chart が `0.001` を最大値と見なして全バーがMAX表示になる。`maxY` には `groups` 内の最大値を計算して明示的に指定すること（最大値が0の場合は `maxY: 1` のような最小値を設定）（Sprint 57 #163）

### hw-hub-backend

- AWS SDK v2 を使う。`spring-cloud-aws` は Spring Boot 4.x と非互換なので使わない
- STG環境はEphemeral構成。使うときだけ `terraform apply`、終わったら `terraform destroy`
- `mybatisGenerator` は既存XMLに追記する動作のため、実行前に `rm -rf src/main/resources/mapper/generated` を必ず実行する。省略すると全Mapper XMLに定義が二重になってSpring Boot起動不可
- `m_code.code_value` は **VARCHAR(10)** 制限。長いコード値を入れると Flyway 失敗の原因になりやすい（例: `HOUSEWORK_ASSIGN` → `HW_ASSIGN`）
- Flyway失敗で `Already exists` エラー発生時: `DELETE FROM flyway_schema_history WHERE version='XX.XXX.XXX'` → 部分的成功分を手動削除 → 再実行
- Spockで例外検証する場合は `thrown(IllegalArgumentException)` のように具体的な型を指定する（想定外の例外をパスしないように）
- ShoppingItem系の認可チェックパターンは `item.getHouseholdId()` + `householdAuthorizationService.canAccessHousehold` で統一（updateStatus / updateFavorite / update / delete すべて同じ）
- `@RequiresPermission` 1つで複数ロール（ADMIN/SUPPORT）を許可する場合、`m_role_permission` に複数行入れるだけ（コード側に分岐を増やさない）
- Domain Model と全フィールド一致する Inner record は不要なボイラープレート。Service は Domain Model を直接返してよい

### hw-hub-batch

（現時点で実績なし）

---

## 習得したこと

### hw-hub-frontend

- Tailwind v4 の `@custom-variant dark` で `dark:` バリアントを定義し、`:root`/`:root.dark`/`@media prefers-color-scheme` の三段構成でライト/ダーク/OS追従を実現する
- パッケージ移動を含むリファクタは GREEN 状態を維持しながら段階的に進める（先に移動・参照更新で全テスト通る状態を作ってから新機能追加に入る）
- `as const` + `(typeof X)[keyof typeof X]` パターンで code.constants.ts に定数とブランド型を定義し、ベタ書き文字列を `XXX.YY` 参照に置換すると安全に横展開できる
- `route.meta.featureScope` を Banner 側で読み取り、Store getter のシグネチャに渡す（`visibleForRoute(routeName, currentScope)`）形にすると子ルート対応が一発で効く
- yup の `required()` メッセージは i18n キー文字列を渡しておき、テンプレ側で `t(errors.xxx)` の形にしないとロケール切替で動かない
- yup の `byte-length` テストは `new TextEncoder().encode(s).length` で計算する（マルチバイト・絵文字も安全）
- 「同名文字列」が別意味で使われる箇所（`'ALL'` のローカルフィルタ等）は横展開対象外として明示的に除外する
- vee-validate の `errors` が空でない場合 `Object.keys(errors).length > 0` でボタン無効化制御すると AC「エラー時ボタン無効化」を防御的に満たせる

### hw-hub-mobile

- Flutter標準 `Dismissible` で「キャンセル可能なスワイプ削除」: `confirmDismiss` 内で `showDialog` を `await` し、キャンセル時は `false` を返すとカードが元の位置に戻る。スワイプ実装のデファクトとして継続採用
- 詳細画面で itemId をキーにした画面ごとの状態は `AutoDisposeFamilyNotifier`／`NotifierProvider.autoDispose.family` で実装する
- `Notifier.build()` が同期の場合、初期非同期ロードは `Future.microtask(() => _initialize(itemId))` で蹴り、`isLoading: true` の初期 state を返す
- `AsyncNotifier.build()` で `ref.watch(householdNotifierProvider.future)` を await することで世帯切り替えに自動追従（AutoDispose + invalidate不要）
- image_picker のモックは Notifier に差し込まず、`setPickedImage(bytes, fileName)` に `XFile` を読んだ結果を渡す契約にするとテスタビリティが上がる
- ログインユーザー情報のような「全画面共通の認証コンテキスト」は `AuthAuthenticated(user)` のように auth state 自体に持たせるのが最小コスト。各 Notifier に個別呼び出しを持たせるのは早期の重複の兆候
- Riverpod テストで authState を差し替える際は `_FakeAuthNotifier extends AuthNotifier` を作って `build()` だけ override すれば十分
- `AuthNotifier.build()` で `/me` を呼ぶ場合、ネットワーク失敗時は `AuthUnauthenticated` にフォールバックし、router 側で `/login` リダイレクトに任せる方が UX が破綻しない
- AC違反の動作を既存テストが「正」として通過させていた場合、DEV・reviewer・SM誰も気づかない。Sprint Review HTML生成時にACとコードを対応させる作業が再発防止の機能を果たす
- `isNotPurchased` のような否定ゲッターは「対象ステータスのみ true」に限定する。他ステータスを含めない設計が直感的
- web SP版とモバイルでデザインが異なると Sprint Review で指摘されやすい。specに明記がない要素は hw-hub-frontend の SP版を参照する
- Notifier 層のエラーハンドリングは `on AppException catch (e)` でメッセージを state に格納し、予期しない例外は汎用メッセージを格納する（空ボディの `catch (_) {}` は禁止。rethrow は Riverpod に吸収されるだけで UI に反映されない）（Sprint 36 で確立・横展開完了）
- `enableSwipe: bool = true` のようなオプションパラメータを既存ウィジェットに追加することで、後続 feature で同ウィジェットを「スワイプ無効カード」として再利用できる（Sprint 37 #90: SwipeableShoppingCard を purchased_tab でも流用）。既存 API を拡張することで UI 一貫性を維持しつつコードを共有する設計パターンとして有効
- `items.map((item) => ...)` で生成するウィジェットには必ず `key: ValueKey(item.uniqueId)` を最外ウィジェットに付与すること。`Dismissible` はもともと `key` 必須だが、その外側の `Padding` にも同じ key を付けないとスワイプ後のリスト更新時にウィジェット状態が意図しない要素に紐づいたままになる（Sprint 38 レビュー指摘）
- `build()` メソッド内で O(n×m) の集計や同一フィルタの複数回呼び出しを行うとフレームごとに無駄な計算が走る。タスク数カウントのような集計は Notifier の操作完了後（`_computeMemberTaskCounts()` 等）に一度だけ計算して `Map<int, int>` として state に持たせ、ウィジェットは `state.memberTaskCounts[memberId]` で参照するだけにするのがFlutter のパフォーマンスベストプラクティス（Sprint 39 レビュー指摘）
- スワイプモード中にリストが動的に変化する場合、スワイプ開始時のタスク数スナップショット（`swipeTaskCount`）を state に持つことでスワイプモードの早期終了を防げる。完了件数のカウントは動的リストの長さではなくスナップショットとの差分で計算する設計が堅牢
- `Dismissible` のスワイプ方向（左右どちらで何が起きるか）は `background`（startToEnd）と `secondaryBackground`（endToStart）の中身と、`confirmDismiss` の `direction == DismissDirection.startToEnd` 判定を対応させる必要がある。中身だけ入れ替えて判定を変え忘れると逆の操作が実行される（Sprint 40 #115 の根本原因）
- 水平スクロールリスト（`ListView(scrollDirection: Axis.horizontal)`）をコンテナ高さ固定で実装すると画面外に項目が流れて非表示になる。項目を折り返して表示したい場合は `Wrap(spacing: 8, runSpacing: 8)` を使う。`SizedBox` の高さ固定も不要になり、コンテンツ量に応じて高さが伸縮する（Sprint 40 #111）
- アイコンURL + イニシャルフォールバック + 未割当表示が必要なアバターは `core/ui/user_avatar.dart` に共通ウィジェットとして実装し、複数画面から参照する。iconUrl が null または読み込み失敗時はイニシャル（CircleAvatar + Text）で表示し、未割当は「未」ラベルを持つ別スタイルで表示する設計が Web 版と一致する（Sprint 40 #112）
- `table_calendar` パッケージで読み取り専用カレンダーを実装する場合、`onDaySelected` を指定しない・`headerStyle` で formatButton と navigation を非表示にすることでタップ・月遷移を無効化できる。`focusedDay` と `selectedDayPredicate` だけを制御すれば対象日ハイライト表示が実現できる（Sprint 41 #114 SwipeDateCalendar）
- スワイプモード中に「現在のカードの対象日」をカレンダーで可視化する場合、カレンダーウィジェット（`SwipeDateCalendar`）をカードとは独立した `Column` の要素として配置し、`targetDate` を props で受け取る設計にするとカード変更時の自動更新がシンプルになる（親が再描画するだけで focusedDay が更新される）
- スワイプモード進捗を AppBar actions の小さなテキストから body 最上部の `headlineSmall`（24sp）中央寄せに変更すると、ユーザーが現在の進行状況を視認しやすくなる。共通の `SwipeProgressHeader` ウィジェットに切り出しておくと他のスワイプ型フローでも再利用できる（Sprint 41 #114 AC1）
- `showDialog` + `barrierColor: Colors.transparent` + `Align` + `Padding` + `Material(elevation)` の組み合わせで「右上アンカーのポップオーバー UI」を実現できる。`StatefulDialog` で独自の state を持たせれば通知リストのような複雑な UI も showDialog ベースで実装可能（Sprint 43 #119）
- 未読件数のような「全画面共通のグローバル状態」は `AsyncNotifier`（AutoDispose なし）で実装し、`refreshUnreadCount()` と `resetToZero()` の2メソッドのみ公開する設計がシンプル。バッジ表示上限（99+）はこの Notifier 側で計算して state に持たせる（Sprint 43 #119）
- `WidgetsBindingObserver.didChangeAppLifecycleState` で `AppLifecycleState.resumed` を検知し、フォアグラウンド復帰時に未読件数を再取得するパターン。main.dart でトップレベルの `StatefulWidget` か専用の Observer クラスで実装する（Sprint 43 #119）
- ARB の `AppLocalizations` は動的キー参照不可のため、通知メッセージのように titleKey/bodyKey が API から動的に返ってくる場合は `Map<String, String Function(AppLocalizations, Map<String, String>)>` のディスパッチテーブルを実装する。未知キーはキー文字列をそのまま fallback 表示する設計が Web 版と挙動一致（Sprint 43 #119 NotificationMessageRenderer）
- Repository の `_dio.get<dynamic>()` 等の型パラメータは必ず具体型（`_dio.get<List<dynamic>>()`・`_dio.get<Map<String, dynamic>>()` 等）を指定すること。`<dynamic>` のままにすると 2 段階キャストが必要になりコードが汚くなる上、テストのモックも型パラメータを合わせて書かないとスタブが効かなくなる（Sprint 46 #122 2回目レビュー）
- `copyWith` を実装する際は全フィールドを必ず列挙する。フィールドの一部しか書かないと他のフィールドが更新できず、後で「バグか仕様か」と混乱する（Sprint 46 #122 2回目レビュー: `HouseholdSettingsMemberDto.copyWith` に role フィールドしかなかった）

- 一覧のメンバー操作（削除・OWNER譲渡）後に全件再取得（`fetchMembers()`）するのはリスト件数が多い場合に無駄なAPI呼び出しになる。成功時は操作対象のエントリだけローカルリストを差分更新（`state.members.where((m) => m.userId != targetId).toList()` 等）することで API 呼び出しを削減できる（Sprint 46 #122 1回目レビュー）
- 世帯の家事件数・買い物件数を取得する専用 API がない場合、全リストを `List<T>` で取得してから即 `.length` でカウントして変数に入れ、リスト自体は破棄するパターンが最小メモリで実現できる。`state` に件数（`int`）だけ持ち、リストを保持しない設計を意識する（Sprint 46 #122 1回目レビュー）
- OWNER 判定・他アクティブメンバー存在確認など「ウィジェットが分岐に使うフラグ」は `bool isCurrentUserOwner`・`bool hasOtherActiveMembers` のように State に明示的なフィールドとして持たせ、Notifier でデータ変化時に再計算する。`build()` 内で `members.any(...)` を呼び出すのはパフォーマンス違反（Sprint 46 #122 2回目レビュー）
- `package_info_plus` パッケージの `PackageInfo.fromPlatform()` は非同期のため `AsyncNotifier.build()` 内で `await` して使う。バックエンドAPI呼び出しと並行させる場合は `Future.wait([api.getServerVersion(), PackageInfo.fromPlatform()])` で同時取得するとレイテンシを最小化できる（Sprint 49 #142 アプリ情報画面）
- API呼び出しも状態管理も不要な情報表示画面（利用規約・プライバシーポリシー等）は `StatelessWidget` + `SingleChildScrollView` のみで実装する。Notifier / Repository / State の3点セットを作る必要はない。ウィジェットテストも「キーワードKey が存在するか」の確認だけで十分（Sprint 49 #143/#144）
- デバッグ環境（LocalStack/エミュレーター）向けの URL 変換は `kDebugMode` フラグでガードし、`core/network/` 配下の単一クラス（`S3UrlResolver`）に閉じ込めると変換漏れを防げる。`localhost`/`127.0.0.1` → `10.0.2.2` のような変換はアップロード時だけでなく表示用 URL にも適用が必要（アップロード成功後も画像が表示されない問題の根本原因）（Sprint 52 #126）
- アプリレベルのグローバル設定（テーマモード等）は `SharedPreferences` でデバイスローカルに保存し、ログイン後に DB 値を取得して上書きする二層設計が堅牢。未ログイン時もデバイスローカルの設定を適用できる（Sprint 52 #130）
- 外観設定のような「ユーザーが選択 → 即座に全画面に反映」が必要な設定は、`main.dart` の `MaterialApp.themeMode` を `ref.watch(themeModeNotifierProvider)` で参照することで実現できる。`ThemeModeNotifier`（`AsyncNotifier`）が state を更新すると自動的に全画面が再描画される（Sprint 52 #130）
- `TextFormField(initialValue: ...)` は最初の build 時にしか反映されず、その後 State が変化しても表示は更新されない。テンプレート選択・既存データ読み込みで後から値を流し込む必要があるフォームは `StatefulWidget` に変更し、`TextEditingController` を内部で管理する。`didUpdateWidget` で `widget.form.name != oldWidget.form.name` を検知して `_nameController.text = widget.form.name` に反映するパターンが確実。既存値と一致する場合はスキップして無限ループを防ぐ（Sprint 54 #146）
- YYYY-MM-DD 形式のテキスト入力で日付有効性チェックが必要な場合、`DateTime.tryParse(value) == null` で書式チェックし、さらに `result.toIso8601String().substring(0, 10) != value` で自動繰り越し検知（例: `2026-02-30` → `2026-03-02` になる）ができる。この2段階チェックで存在しない日付を確実に弾ける。月・日個別入力の `DateTime(year, month, day).month == month` チェックとは別パターンとして使い分ける（Sprint 54 #147）
- `AsyncValue.data` が空リストの場合は空状態ウィジェット（EmptyState）を表示する。カテゴリフィルタ等の絞り込み状態に応じて「データなし（未登録）」と「絞り込み結果なし」を出し分けることで UX が改善される。`loading` / `error` / `data（0件）` / `data（1件以上）` の4ケースを必ず区別すること（Sprint 54 #145）
- fl_chart のウィジェット内でツールチップ生成ロジックが複雑な場合（メンバーごとの件数構築・未割当の扱い等）は、`_buildTooltipText(members, dailyOverview, l10n)` のような純粋関数として別ファイル（`overview_tooltip_builder.dart` 等）に切り出すとウィジェットテストで直接検証できる。flutter_test では `BarChart` のツールチップ実動作はテスト困難なため、ロジックを純粋関数に分離してユニットテストするのがベストプラクティス（Sprint 57 #161）
- シェル外独立ルートからシェル内ルートへ遷移する場合は必ず先に `context.pop()` してから `context.push(遷移先)` を呼ぶこと。両 Navigator に Hero が同時に乗ると `HeroController` のアサーション失敗でクラッシュする。`GoRouterState.of(context).matchedLocation` でシェル外ルートかどうか判定できる（Sprint 57 #157）
- `ref.invalidate(householdNotifierProvider)` を `logout()` 内でトークンクリア後に呼ぶと、トークンなしでビルドが走り 401 → `AuthInterceptor` が再び `logout()` を呼ぶ無限ループが発生する。解決策は2点セット: (1) `state = AuthUnauthenticated()` を `ref.invalidate` より前に移動して「既に未認証」フラグを立てる、(2) `AuthInterceptor._logoutIfAuthenticated()` を追加して現在の state が既に `AuthUnauthenticated` ならログアウト処理をスキップする再入防止ガード。`invalidate` のタイミングは「state がセットされてから」が原則（Sprint 58 #158/#172）
- グローバル `AsyncNotifier`（AutoDispose なし）Provider は `logout()` 時に invalidate すると直後のビルドでトークンなし → エラー状態になる。再ログイン後に別ユーザーのデータを正常取得するには、`saveTokens()`（ログイン成功後）のタイミングで `ref.invalidate` する方が安全。`logout()` 側では State を未認証にするだけで十分（Sprint 58 #158）

### hw-hub-backend

- MyBatisはJava recordをサポートしている
- UserModel.reconstruct のシグネチャ変更は既存テスト全体に影響するため、影響範囲を grep で先に把握してから着手する
- HwHub 規約の依存ルールに従い、Domain Model と完全一致する Inner record は不要なボイラープレート。Service は Domain Model を直接返してよい

### hw-hub-batch

（現時点で実績なし）

---

## Skills更新履歴

| Sprint    | ファイル           | 更新内容                                 | 理由                                                                        |
| --------- | ------------------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| Sprint 31 | mobile-conventions | 全幅表示ウィジェットセクション追加       | Dismissible内 Container の width 未指定でカード幅がタスク名依存になった実績 |
| Sprint 33 | mobile-conventions | Repositoryモック構造確認ルール追記       | ClassCastException 実績（ラッパー形式を未確認でモック）                     |
| Sprint 34 | mobile-conventions | catch握りつぶし禁止ルール追記            | レビュー指摘（エラーを `catch (_) {}` で無視）                              |
| Sprint 35 | mobile-conventions | IndexedStack配下の invalidate ルール追記 | Sprint Review指摘（#107/#108）                                              |
| Sprint 36 | mobile-conventions | Notifier層エラーハンドリングパターン追記 | #99 全 Notifier への AppSnackBar 横展開で確立（`on AppException → state 格納`） |
| Sprint 37 | （更新なし）       | —                                        | i18nハードコード禁止はすでに記載済みのため Skill 更新不要（long_term.md の繰り返し指摘パターンに 37 を追記）|
| Sprint 38 | mobile-conventions | `items.map()` の key 付与ルール追記      | レビュー指摘（スワイプリストで ValueKey 未設定によるウィジェット状態混乱）|
| Sprint 39 | mobile-conventions | `build()` 内の重い計算を Notifier 事前計算に移す指針を追記 | レビュー指摘（O(n×m) ループを build() 毎フレーム実行していた実績） |
| Sprint 40 | mobile-conventions | Dismissible スワイプ方向修正パターン・Wrap折り返し・UserAvatar共通ウィジェットを追記 | Sprint 40 バグ修正（#115/#111/#112）で確立した設計パターン |
| Sprint 41 | mobile-conventions | Overdue テキスト overflow 対応ルール・table_calendar 読み取り専用カレンダーパターンを追記 | Sprint 41 レビュー指摘（Overdue オーバーフロー）・#114 実装で確立 |
| Sprint 43 | mobile-conventions | エラーハンドリングルールに StatefulWidget event handler 内パターンを追記 | #119 レビュー指摘（StatefulWidget 内での `catch (_) {}` 握りつぶし） |
| Sprint 44 | （更新なし）       | —                                                                        | Sprint 44 の指摘はいずれも既存ルール（`overflow: TextOverflow.ellipsis` / Notifier 事前計算）に既に記載があるため新規追記不要。繰り返し指摘パターンの発生スプリント欄に 44 を追記のみ |
| Sprint 45 | mobile-conventions | テストで日本語テキスト直接検証禁止・debugPrint でエラーオブジェクト全体出力禁止・AutoDispose 設定ルールを追記 | Sprint 45 レビュー指摘（ウィジェットテスト Key ベース検証・セキュリティ・パフォーマンス） |
| Sprint 45 | backend-conventions | 例外メッセージに内部IDを含めない・N+1問題防止パターンを追記 | Sprint 45 レビュー指摘（セキュリティ・パフォーマンス） |
| Sprint 46 | mobile-conventions | `build()` 内フラグ事前計算の適用場面に `bool` フィールドを追記・Dio 型パラメータ具体型指定ルール追加・`copyWith` 全フィールド列挙ルール追加 | Sprint 46 #122 2回目レビュー指摘（パフォーマンス・型安全性・不完全 copyWith） |
| Sprint 47 | mobile-conventions | 空状態ハンドリングルール・TextEditingController 反映漏れ防止ルール・月日整合性バリデーションルールを追記 | Sprint 47 Sprint Review指摘（#136 空状態/読み込み中区別・#137 テンプレート選択時反映漏れ・#138 日付バリデーション漏れ） |
| Sprint 48 | mobile-conventions | AutoDispose 設定ルールの背景に「一覧画面 Notifier も対象」の実績を追記（Sprint 48 背景） | Sprint 48 レビュー指摘（`InquiryListNotifier` が `NotifierProvider` 非 autoDispose で実装されていた実績）|
| Sprint 49 | mobile-conventions | `package_info_plus` でアプリバージョン取得パターン・静的コンテンツ画面の設計パターンを追記 | Sprint 49 #142〜#144 実装（アプリ情報・利用規約・プライバシーポリシー画面）で確立したパターン |
| Sprint 50 | （更新なし）       | —                                                                        | Sprint 50 の指摘（ウィジェットテスト日本語テキスト直接検証）は既存ルール（Sprint 45 追記済み）に既に記載があるため新規追記不要。繰り返し指摘パターンの発生スプリント欄に 50 を追記のみ |
| Sprint 51 | mobile-conventions | pull-to-refresh（RefreshIndicator）実装必須ルールを追記                  | Sprint 51 #151 で8画面に RefreshIndicator が未実装だった実績。`AlwaysScrollableScrollPhysics` との組み合わせを含む実装チェックリストを追加 |
| Sprint 52 | mobile-conventions | 操作ロジックを持つウィジェットのウィジェットテスト必須ルールを追記        | Sprint 52 #130 convention-reviewer 指摘（`AppearanceSection` の SegmentedButton 選択 → Notifier 呼び出し確認テスト未追加） |
| Sprint 53 | mobile-conventions | 日本語テキスト直接検証禁止ルールの NG パターンに `(tester.widget(...) as Text).data` 形式を追記・背景欄に Sprint 53 事例を追記 | Sprint 53 #124 指摘（`notification_message_renderer_test.dart` でキャスト経由の日本語テキスト検証を行っていた）|
| Sprint 54 | mobile-conventions | StatefulWidget + didUpdateWidget による TextEditingController 更新パターン追記・YYYY-MM-DD 形式テキスト入力の日付有効性チェック（DateTime.tryParse + ISO8601 ラウンドトリップ）追記 | Sprint 54 #146（HouseworkForm StatefulWidget 化）・#147（日付バリデーション）の実装で確立したパターン |
| Sprint 55 | mobile-conventions | `ref.listen` コールバック内での `setState()` 必須ルールを追記 | Sprint 55 #131 レビュー指摘（`NicknameSection` の `ref.listen` コールバックで `setState()` 漏れ）|
| Sprint 57 | mobile-conventions | シェル外ルートからシェル内ルートへ push するときの HeroController 衝突対処法を追記 | Sprint 57 #157 バグ修正（通知センターからタスク画面遷移でアプリクラッシュ）で確立したパターン |
| Sprint 58 | mobile-conventions | ログアウト時の `ref.invalidate` タイミングと AuthInterceptor 再入防止パターンを追記 | Sprint 58 #158/#172 バグ修正（logout 時の無限ループ・別ユーザーログイン後のデータ取得不可）で確立したパターン |
| Sprint 59 | mobile-conventions | `ListView.builder` の `itemBuilder` 内ウィジェットへの `ValueKey` 付与ルールを既存 `items.map()` ルールに明記追加 | Sprint 59 レビュー指摘（`unpurchased_tab` / `basket_tab` の itemBuilder 内 Padding に ValueKey 未付与）。既存ルールは `items.map()` のみ記載で `ListView.builder` が明示されていなかった |
