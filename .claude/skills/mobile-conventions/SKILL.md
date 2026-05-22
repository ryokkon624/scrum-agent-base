---
name: mobile-conventions
description: HwHubモバイル（hw-hub-mobile）の設計規約・実装方針。Dartファイル・Flutterウィジェット・RiverpodのNotifier・Retrofitクライアント・テストファイルを新規作成・編集するときは必ずこのスキルを参照すること。feature-first構成・アーキテクチャ層・状態管理・テスト方針・i18nなど、実装の判断に必要な規約をすべてここに集約している。
---

# Mobile Conventions

hw-hub-mobileの設計規約・実装方針。

---

## 1. アーキテクチャ（feature-first + 簡略 Clean Architecture）

```
presentation/ (Page・Notifier・State)
      ↓
data/         (Repository interface + impl・API・モデル)
      ↓
core/network/ (Dio・例外・インターセプター)
```

- **domain 層は省略**する。Repository interface は `data/` に同居させる
- UseCase は設けない。Notifier が直接 Repository を呼ぶ
- 複数機能をまたぐビジネスロジックが必要になった場合のみ `domain/usecase/` を切り出す
- `features/shell` はナビゲーションシェル（BottomNavigationBar・世帯切替UI）であり、ドメイン機能ではない

### 依存方向ルール

- Page は Notifier を呼ぶ。Repository を直接呼ばない
- Notifier は Repository interface に依存する。実装クラスには依存しない
- **Notifier 内で `Dio` を直接使用してはならない**。必ず `Repository` 経由で API を呼ぶこと（`Notifier → Repository → Api` の依存方向を守ること）
- `core/` 配下は全機能から参照できる共通基盤

---

## 2. ディレクトリ構成

```
lib/
├── main.dart
├── app_router.dart            # GoRouter 全ルート定義
├── core/                      # 全機能共通基盤
│   ├── auth/                  # 認証状態管理（AuthNotifier・TokenStorage）
│   ├── config/                # 環境設定（AppConfig・ベースURL）
│   ├── di/                    # Provider 定義（DI配線）
│   ├── household/             # 世帯状態管理
│   ├── models/                # 共有ドメインモデル
│   ├── network/               # Dio クライアント・例外定義・インターセプター
│   ├── storage/               # ストレージキー定数
│   ├── theme/                 # テーマ・カラー・スペーシング定数
│   └── ui/                    # 共通UIコンポーネント（SnackBar・Dialog）
└── features/
    └── {feature}/
        ├── {feature}_providers.dart   # Provider 定義
        ├── data/
        │   ├── {feature}_api.dart     # Retrofit @RestApi 定義
        │   ├── {feature}_repository.dart  # interface + impl
        │   └── models/                # レスポンスモデル
        └── presentation/
            └── {screen}/
                ├── {screen}_page.dart      # UI
                ├── {screen}_notifier.dart  # ロジック + Provider定義
                └── {screen}_state.dart     # 不変状態クラス
```

---

## 3. 基本記述スタイル

- `dynamic` / `var` の乱用は禁止。適切な型を明示する
- テキストはハードコード禁止。必ず ARB ファイルに定義して `AppLocalizations.of(context).key` を使う
- i18n キー構造: `{screen}{Context}` のキャメルケース

```
例:
  loginTitle
  signupSubmitButton
  inviteInviterLabel
  passwordResetSentResendSuccess
```

- `const` コンストラクタを積極的に使い、不要な再ビルドを避ける
- コード値（APIから返される文字列/数値の区分値）はマジックストリングで直接比較せず、`core/models/` 配下の enum を使う

### m_code で管理されている区分値（自動生成）

`lib/core/models/` には `hw-hub-database` の `./gradlew generateEnums` で生成した enum が配置済み。  
`PurchaseLocationType`, `TaskStatus`, `Category` など m_code に登録されている区分値はすべてここにある。  
**新しく作らず、生成済みのファイルを import して使うこと。**

```dart
// 生成済みの enum を import して使う例
import 'package:hw_hub_mobile/core/models/purchase_location_type.dart';

// コード値との比較
if (item.storeType == PurchaseLocationType.supermarket.code) { ... }

// コード値から enum に変換
final type = PurchaseLocationType.fromCode(item.storeType); // 不正値は null
```

生成済み enum はすべて以下の形式になっている。

```dart
enum PurchaseLocationType {
  supermarket('1'),
  online('2'),
  drugstore('3');

  const PurchaseLocationType(this.code);
  final String code;

  static PurchaseLocationType? fromCode(String? code) {
    for (final v in values) {
      if (v.code == code) return v;
    }
    return null;
  }
}
```

m_code が更新された場合は `./gradlew generateEnums`（hw-hub-database）を実行し、生成ファイルを `lib/core/models/` に上書きコピーしてコミットする。

### m_code で管理されていない区分値（カスタム定義）

画面固有の状態や API の仕様に由来するが m_code に登録されていない区分値は、`core/models/` に手動で作成する。

```dart
// lib/core/models/password_reset_result.dart の例（m_codeに無いカスタム enum）
enum PasswordResetResult { success, expired, invalid }
```

- カスタム enum はコード値を持たない（画面状態の分岐にのみ使う）ことが多い
- API レスポンスのフラグなど文字列/数値のマッピングが必要な場合は生成済み enum と同じ形式（`fromCode` + null 安全）で作る

### copyWith は全フィールドを必ず列挙する

State クラス・DTO クラスに `copyWith` を実装する際は、**すべてのフィールドを列挙すること**。一部フィールドのみ書くと他のフィールドが更新できず、実装時または後のメンテナンスで「バグか仕様か」と混乱する原因になる。

```dart
// NG: role フィールドしかない copyWith → nickname など他フィールドを変更不能
HouseholdSettingsMemberDto copyWith({String? role}) {
  return HouseholdSettingsMemberDto(
    userId: userId,
    nickname: nickname,
    role: role ?? this.role,
  );
}

// OK: 全フィールドを列挙する
HouseholdSettingsMemberDto copyWith({
  int? userId,
  String? nickname,
  String? role,
  String? iconUrl,
  String? status,
}) {
  return HouseholdSettingsMemberDto(
    userId: userId ?? this.userId,
    nickname: nickname ?? this.nickname,
    role: role ?? this.role,
    iconUrl: iconUrl ?? this.iconUrl,
    status: status ?? this.status,
  );
}
```

> **背景（Sprint 46 #122 2回目レビュー）**: `HouseholdSettingsMemberDto.copyWith` に `role` フィールドしかなく、他のフィールドを copyWith で変更できない状態だった。

### 全幅表示が必要なウィジェット

カードや一覧アイテムを親コンテナ幅いっぱいに広げる場合は、以下のいずれかを明示的に指定すること。
Flutter の `Container` はデフォルトでコンテンツサイズになるため、指定がないとタスク名の長さによって幅がバラバラになる。

```dart
// パターン1: SizedBox で全幅指定
SizedBox(
  width: double.infinity,
  child: MyCard(...),
)

// パターン2: Container に width を指定
Container(
  width: double.infinity,
  child: MyCard(...),
)

// パターン3: Column の crossAxisAlignment で子を伸ばす
Column(
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: [MyCard(...)],
)
```

> **背景（Sprint 31 Retro）**: `swipeable_task_card.dart` のmarginを削除したが `width: double.infinity` を設定しなかったため、カード幅がタスク名に依存したままになりSprint Reviewで指摘された。

### Dismissible のスワイプ方向とアクションの対応

`Dismissible` で「左スワイプ」「右スワイプ」それぞれに異なるアクションを割り当てる場合、以下の3箇所を必ず一致させること。

| 要素 | 役割 |
|---|---|
| `background` | startToEnd（右スワイプ）のアイコン・色 |
| `secondaryBackground` | endToStart（左スワイプ）のアイコン・色 |
| `confirmDismiss` の `direction` 判定 | `DismissDirection.startToEnd` で右スワイプのアクションを実行 |

```dart
Dismissible(
  key: ValueKey(task.taskId),
  background: _buildBackground(Colors.blue, Icons.person, Alignment.centerLeft),   // 右スワイプ
  secondaryBackground: _buildBackground(Colors.red, Icons.delete, Alignment.centerRight), // 左スワイプ
  confirmDismiss: (direction) async {
    if (direction == DismissDirection.startToEnd) {
      // 右スワイプのアクション（例: 自分にアサイン）
      await ref.read(notifier).assignToMe(task.taskId);
    } else {
      // 左スワイプのアクション（例: 削除確認）
      return await showDialog(...);
    }
    return false;
  },
  child: ...,
)
```

> **背景（Sprint 40 #115 / Sprint 42 #116）**: Sprint 40 では `confirmDismiss` の `direction` 判定が逆になっていた。Sprint 42 では `SwipeModeCard`（スワイプモード専用 Widget）の `background`/`secondaryBackground` 自体が逆に設定されており、同じパターンで再発した。通常の `Dismissible` に限らず、スワイプモード専用 Widget にも同じルールを適用すること。3点（`background`・`secondaryBackground`・`confirmDismiss` の `direction` 判定）は常にセットで確認する。

### 折り返しレイアウト（Wrap）vs 水平スクロール（ListView）

複数アイテムを横並びにする際、画面外に溢れる可能性がある場合は `Wrap` を使う。

```dart
// NG: 水平スクロール → 高さ固定 + スクロールで項目が画面外に流れて非表示になりやすい
SizedBox(
  height: 72,
  child: ListView(
    scrollDirection: Axis.horizontal,
    children: items.map((item) => ItemChip(item: item)).toList(),
  ),
)

// OK: Wrap → 折り返しで全項目が表示される。コンテンツ量に応じて高さが伸縮する
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: items.map((item) => ItemChip(item: item)).toList(),
)
```

使い分け:
- 項目数が固定で少ない、または水平スクロールが UX 仕様として必要 → `ListView(scrollDirection: Axis.horizontal)`
- 項目数が可変・増減する、または全項目を一覧で見せたい → `Wrap`

> **背景（Sprint 40 #111）**: メンバーサマリを `SizedBox(height: 72) + ListView(scrollDirection: Axis.horizontal)` で実装していたため、メンバー数が増えると画面外に流れて非表示になっていた。`Wrap(spacing: 8, runSpacing: 8)` に変更することで全メンバーを折り返し表示できるようになった。

### アバター表示（UserAvatar）共通ウィジェット

ユーザーアイコンを表示する場合は `lib/core/ui/user_avatar.dart` の `UserAvatar` ウィジェットを使う。新しい機能でアイコン表示が必要になった場合も、新規作成せずこのウィジェットを参照すること。

```dart
// 通常のユーザーアバター（iconUrl があればアイコン表示、なければイニシャル）
UserAvatar(
  iconUrl: member.iconUrl,
  displayName: member.nickname ?? member.displayName,
  radius: 16,
)

// 未割当状態を表示する場合（丸い円に「未」ラベル）
UserAvatar(
  iconUrl: null,
  displayName: null,  // null を渡すと「未」表示になる設計
  radius: 16,
)
```

実装パターン:
- `iconUrl` が非 null → `CircleAvatar(backgroundImage: NetworkImage(iconUrl))` で表示
- 読み込み失敗時 → `onError` フォールバックでイニシャル表示
- `displayName` が null（未割当） → 「未」ラベルの円を表示（Web 版踏襲）
- `displayName` が非 null（割当済み） → イニシャル（最初の1文字）を表示

> **背景（Sprint 40 #112 / Sprint 42 #118）**: Sprint 40 でコア Widget として確立。Sprint 42 では新規画面（家事割り当て画面）で `assigneeIconUrl: null` をハードコードしたまま実装しており、プロフィール画像が常にイニシャル表示になっていた。**呼び出し元で `state.members.where((m) => m.userId == task.assigneeUserId).firstOrNull?.iconUrl` のように members から lookup して渡すこと。`iconUrl: null` のハードコードは「未割当表示」専用であり、割当済みユーザのアイコンに使ってはならない。**

### テキストの overflow 対応（必須）

カード内・固定幅コンテナ内に表示するテキストは、コンテンツが長い場合にはみ出しが発生する。以下のパターンで overflow を設定すること。

```dart
// NG: overflow 未指定 → 長い文字列で画面外にはみ出す
Text(task.title)

// OK: ellipsis で末尾を省略
Text(
  task.title,
  overflow: TextOverflow.ellipsis,
  maxLines: 1,
)

// OK: 複数行に折り返す（タイトル等）
Text(
  task.title,
  softWrap: true,
  maxLines: 2,
  overflow: TextOverflow.ellipsis,
)
```

適用すべき場面:
- カード内のタイトル・サブタイトル
- `Overdue` / 期限ラベルなど状態バッジの隣のテキスト
- Row の中に配置された `Text`（親が固定幅または `Expanded` でない場合）

`Row` の中の `Text` がはみ出す場合は `Expanded` または `Flexible` で囲む：

```dart
Row(
  children: [
    const Icon(Icons.warning, size: 14),
    const SizedBox(width: 4),
    Expanded(
      child: Text(
        label,
        overflow: TextOverflow.ellipsis,
        maxLines: 1,
      ),
    ),
  ],
)
```

> **背景（Sprint 41 レビュー）**: Overdue ラベルを含む Row 内のテキストが `overflow` 未指定で画面外にはみ出していた。

### リスト生成時の key 付与（必須）

`items.map((item) => ...)` でウィジェットを生成する際は、最外ウィジェットに必ず `key: ValueKey(item.uniqueId)` を付与すること。

```dart
// NG: key なし → スワイプ後のリスト更新でウィジェット状態が混乱する
items.map((item) => Padding(
  padding: const EdgeInsets.symmetric(vertical: 4),
  child: SwipeableCard(item: item),
)).toList()

// OK: 最外ウィジェットに ValueKey を付与
items.map((item) => Padding(
  key: ValueKey(item.shoppingItemId),
  padding: const EdgeInsets.symmetric(vertical: 4),
  child: SwipeableCard(item: item),
)).toList()
```

`Dismissible` は `key` が必須だが、その外側の `Padding` 等にも同じ key を付与しないと `setState` や `invalidate` 後にウィジェット状態が意図しない要素に紐づいたままになる。

> **背景（Sprint 38 Review）**: `purchased_tab.dart` の `items.map()` で `Padding` に key を付与しておらず、スワイプ後のリスト更新時にウィジェット状態が混乱する可能性を指摘された。
> **Sprint 39**: `member_picker_bottom_sheet` / `member_summary_strip` でも同様の指摘。`members.map()` のような別モデルのリスト生成でも同様に適用すること。

### 空状態（0件）とローディング中を必ず区別する（必須）

一覧画面の `AsyncValue` ハンドリングでは、`data` が空リストの場合に空状態ウィジェットを表示すること。`loading` / `error` / `data（0件）` / `data（1件以上）` の4ケースをすべて実装する。

```dart
// NG: data が空のときにローディングと同じ表示になる（0件なのに「読み込み中」が消えない）
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(houseworkListNotifierProvider);
  return state.when(
    loading: () => const CircularProgressIndicator(),
    error: (e, _) => ErrorWidget(e),
    data: (items) => items.isEmpty
        ? const CircularProgressIndicator()  // ← NG: loading と同じ扱い
        : ListView.builder(...),
  );
}

// OK: 0件は専用の空状態ウィジェットを表示する
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(houseworkListNotifierProvider);
  return state.when(
    loading: () => const CircularProgressIndicator(),
    error: (e, _) => ErrorWidget(e),
    data: (items) => items.isEmpty
        ? const _EmptyState()   // ← OK: 「家事がまだ登録されていません」等の空状態
        : ListView.builder(...),
  );
}
```

実装チェックリスト（一覧画面を実装するたびに確認）:
- [ ] `loading:` → ローディングインジケーター
- [ ] `error:` → エラー表示
- [ ] `data:` + `items.isEmpty` → 空状態ウィジェット（EmptyState）
- [ ] `data:` + `items.isNotEmpty` → 一覧表示

> **背景（Sprint 47 #136 Sprint Review）**: 家事設定一覧画面で家事が0件の場合に `CircularProgressIndicator` が表示され続けた。`data` が空リストであっても `loading` と同じ表示になっていた。

### 一覧画面への pull-to-refresh（RefreshIndicator）実装（必須）

スクロール可能な一覧画面（`ListView`・`SingleChildScrollView` 等）には `RefreshIndicator` でラップして pull-to-refresh を実装すること。データが最新化されない問題はユーザー体験を著しく損なう。

```dart
// NG: RefreshIndicator なし
body: ListView.builder(
  itemCount: state.items.length,
  itemBuilder: (context, index) => _ItemCard(item: state.items[index]),
)

// OK: RefreshIndicator でラップ + AlwaysScrollableScrollPhysics
body: RefreshIndicator(
  onRefresh: () async {
    await ref.read(notifierProvider.notifier).reload();
    // または: ref.invalidate(notifierProvider);
  },
  child: ListView.builder(
    physics: const AlwaysScrollableScrollPhysics(), // コンテンツが画面未満でもスワイプ可
    itemCount: state.items.length,
    itemBuilder: (context, index) => _ItemCard(item: state.items[index]),
  ),
)
```

実装チェックリスト（スクロール可能な一覧・詳細画面を実装するたびに確認）:
- [ ] `RefreshIndicator` でスクロール可能領域をラップしているか
- [ ] `onRefresh` は `async`（`Future<void>`）で実装しているか
- [ ] `physics: const AlwaysScrollableScrollPhysics()` を指定しているか（コンテンツが少ない場合でもスワイプ可能にするため）
- [ ] `onRefresh` 内で Notifier の reload メソッドまたは `ref.invalidate(provider)` を呼んでいるか

> **背景（Sprint 51 #151）**: 8画面で `RefreshIndicator` が未実装だった。一覧画面だけでなく詳細画面（`inquiry_detail_page.dart`）にも適用が必要。

### フォームにテンプレートや既存データから値を流し込む際の反映チェック

テンプレート選択・既存データ読み込みなどで State を一括更新する場合、`TextEditingController.text` への反映も必ずセットで行うこと。State の更新だけでは、`TextEditingController` をベースにしたウィジェット（`TextFormField` 等）の表示が更新されない。

また、フォーム内に複数フィールドがある場合は**全フィールドが反映されているか**を横展開で確認すること。

```dart
// NG: State だけ更新して TextEditingController を更新しない
void applyTemplate(HouseworkTemplate template) {
  state = state.copyWith(name: template.name);  // State は更新される
  // _nameController.text = template.name; ← これを忘れると画面に反映されない
}

// OK: State と TextEditingController を必ず両方更新する
void applyTemplate(HouseworkTemplate template) {
  state = state.copyWith(
    name: template.name,
    description: template.description,  // 全フィールドを横展開
  );
  _nameController.text = template.name;
  _descriptionController.text = template.description ?? '';  // 横展開
}
```

横展開チェックリスト（テンプレート/既存データ反映を実装するとき）:
- [ ] 名前（name）フィールドが反映されているか
- [ ] 説明（description）などの補助フィールドも反映されているか
- [ ] 各 `TextEditingController.text` への代入が全フィールド分あるか

> **背景（Sprint 47 #137 Sprint Review）**: テンプレート選択時に家事名が画面に反映されなかった（画面非表示だがDB登録はされていた）。State の更新はできていたが、`_nameController.text = ...` への反映が漏れていた。説明欄も同様のリスクがあることが横展開確認で判明した。

#### `TextFormField(initialValue: ...)` から `StatefulWidget + TextEditingController` への移行パターン

`TextFormField(initialValue: ...)` は最初の build 時にしか反映されない。後から State 変化（テンプレート選択・画面間遷移での Props 変化）で値を流し込む必要がある場合は、`StatefulWidget` に変更して `TextEditingController` を内部で管理し、`didUpdateWidget` で親からの値変化を検知して反映すること。

```dart
// NG: TextFormField(initialValue: ...) → State が変化しても表示が更新されない
class HouseworkForm extends StatelessWidget {
  const HouseworkForm({super.key, required this.form, ...});
  final HouseworkFormState form;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: form.name,  // 初回 build 時にしか反映されない
      ...
    );
  }
}

// OK: StatefulWidget + TextEditingController + didUpdateWidget
class HouseworkForm extends StatefulWidget {
  const HouseworkForm({super.key, required this.form, ...});
  final HouseworkFormState form;

  @override
  State<HouseworkForm> createState() => _HouseworkFormState();
}

class _HouseworkFormState extends State<HouseworkForm> {
  late final TextEditingController _nameController;
  late final TextEditingController _descriptionController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.form.name);
    _descriptionController = TextEditingController(text: widget.form.description ?? '');
  }

  @override
  void didUpdateWidget(HouseworkForm oldWidget) {
    super.didUpdateWidget(oldWidget);
    // 既存値と一致する場合はスキップ（無限ループ防止）
    if (widget.form.name != oldWidget.form.name) {
      _nameController.text = widget.form.name;
    }
    if (widget.form.description != oldWidget.form.description) {
      _descriptionController.text = widget.form.description ?? '';
    }
    // 全フィールドを横展開すること
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: _nameController,  // initialValue ではなく controller を使う
      ...
    );
  }
}
```

適用すべき場面:
- テンプレート選択で複数フィールドを一括更新するフォーム
- 編集画面で初期データを読み込むフォーム（既存データが非同期で取得される場合）
- 同じフォームウィジェットを登録・編集で共用する場合（Props が後から変化する）

> **背景（Sprint 54 #146）**: `HouseworkForm` が `TextFormField(initialValue: form.name)` を使っていたため、テンプレート選択後に Notifier の state は更新されていたが画面上のテキスト欄は空欄のまま残っていた。`StatefulWidget` 化 + `didUpdateWidget` パターンに移行することで解決した。

### `ref.listen` コールバック内で StatefulWidget の状態を更新する場合は `setState()` でラップする

`StatefulWidget` 内の `ref.listen` コールバックで `TextEditingController.text` 等を変更する際は、必ず `setState()` でラップすること。`setState()` なしで `controller.text` を更新しても Flutter のビルドサイクルがトリガーされず、画面表示が更新されない。

```dart
// NG: setState() なし → controller.text は更新されるが画面は再描画されない
ref.listen(householdNotifierProvider, (previous, next) {
  final nextNickname = next.selectedHousehold?.nickname;
  _controller.text = nextNickname ?? '';  // 画面に反映されない
});

// OK: setState() でラップ → controller.text の変化が Flutter フレームに通知される
ref.listen(householdNotifierProvider, (previous, next) {
  final nextNickname = next.selectedHousehold?.nickname;
  setState(() {
    _controller.text = nextNickname ?? '';
  });
});
```

適用すべき場面:
- `ref.listen` コールバック内で `TextEditingController.text` を変更するとき
- `ref.listen` コールバック内で `setState` 管理下の変数（`_selectedValue` 等）を変更するとき
- Riverpod の Provider 変化に追従して StatefulWidget の内部状態を更新するとき全般

> **背景（Sprint 55 #131 レビュー）**: `NicknameSection`（`StatefulWidget`）の `ref.listen` コールバックで `_controller.text = nextNickname` を直接代入していたため、世帯切り替え後もニックネームが画面上で更新されなかった。`setState(() { _controller.text = nextNickname; })` に修正して解決した。

### 月と日を個別に入力するフォームの日付整合性バリデーション

「繰り返し設定」「有効期間」など、月と日を個別入力するフォームでは**存在しない日付**（例: 2月30日、4月31日）を弾くバリデーションを必ず実装すること。

Dart の `DateTime` は無効な日付を自動繰り越しするため、`DateTime(year, month, day).month == month` で存在チェックできる。

```dart
// 月末日チェック（month と day の組み合わせが実在する日付か確認する）
bool isValidDayForMonth(int month, int day) {
  // 閏年に依存しない固定年（例: 2000年など閏年）を使うか、
  // 現在年を使ってチェックする
  final date = DateTime(2000, month, day);  // 2000年は閏年（2月29日も有効）
  return date.month == month;
}

// 利用例（保存ボタン押下時）
bool _validate() {
  if (recurrenceType == RecurrenceType.monthly) {
    if (!isValidDayForMonth(selectedMonth, selectedDay)) {
      // 「指定した月に存在しない日付です」等のエラーを表示
      state = state.copyWith(errorMessage: 'invalidDayForMonth');
      return false;
    }
  }
  return true;
}
```

適用すべき場面:
- 月次繰り返しで「毎月N日」を入力するフォーム
- 有効期間の「開始日」「終了日」で月・日を個別入力するフォーム
- 誕生日など「月」「日」を別フィールドで入力するフォーム

**注意**: 「月末」を `dayOfMonth=31` 等の特殊値で表現している場合（バックエンド仕様）は、特殊値を除外してからチェックすること。

> **背景（Sprint 47 #138 Sprint Review）**: 家事編集画面の月次繰り返し日設定で、2月30日などを入力した状態で保存ボタンが押下できた。フロント側に月・日の組み合わせ整合性バリデーションがなかった。

#### YYYY-MM-DD 形式テキスト入力の日付有効性チェック

月・日の個別入力ではなく YYYY-MM-DD 形式のテキスト入力（`TextFormField`）で日付を受け取る場合は、`DateTime.tryParse()` + ISO8601 ラウンドトリップの2段階チェックで存在しない日付を弾くこと。

Dart の `DateTime` は存在しない日付を自動繰り越しするため（例: `2026-02-30` → `2026-03-02`）、parse 結果をそのまま使うと無効な入力を受け入れてしまう。

```dart
// YYYY-MM-DD テキスト入力の日付有効性チェック
bool isValidDate(String value) {
  // Step1: 書式チェック（parse できない場合は null）
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return false;
  // Step2: ラウンドトリップチェック（自動繰り越し検知）
  // 2026-02-30 → parsed は 2026-03-02 になるため、stringify が元の値と一致しない
  return parsed.toIso8601String().substring(0, 10) == value;
}

// Notifier の validate() での利用例
if (startDate.isNotEmpty && !isValidDate(startDate)) {
  return state.copyWith(
    startDateError: 'houseworkCreateErrorInvalidDate',  // ARBキー
  );
}
```

使い分け:
- `TextFormField` に YYYY-MM-DD 形式で直接入力させる場合 → `DateTime.tryParse()` + ISO8601 ラウンドトリップ
- Dropdown で月と日を個別選択させる場合 → `DateTime(year, month, day).month == month` チェック

> **背景（Sprint 54 #147）**: 家事設定画面の有効期間（startDate / endDate）入力欄で `2026-02-30` のような存在しない日付を入力しても保存できた。Notifier の `validate()` に書式チェックしかなく、自動繰り越し検知が未実装だった。

### build() 内の重い計算を Notifier 側で事前計算する（パフォーマンス必須）

`build()` メソッドはフレームごとに呼ばれる。O(n×m) の集計・同一フィルタの複数回呼び出しは `build()` 内に書かない。

```dart
// NG: build() 内で毎フレーム O(n × m) のループを実行
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(houseworkAssignNotifierProvider).valueOrNull;
  return Row(
    children: state!.members.map((m) {
      // tasks.where(...).toList() を毎フレーム実行
      final count = state.tasks.where((t) => t.assigneeId == m.memberId).length;
      return _SummaryChip(member: m, count: count);
    }).toList(),
  );
}

// OK: Notifier 側で事前計算し Map として state に持たせる
// housework_assign_notifier.dart 側
Map<int, int> _computeMemberTaskCounts(List<HouseworkTask> tasks) {
  final counts = <int, int>{};
  for (final task in tasks) {
    if (task.assigneeId != null) {
      counts[task.assigneeId!] = (counts[task.assigneeId!] ?? 0) + 1;
    }
  }
  return counts;
}
// state に memberTaskCounts: Map<int, int> を持たせ、
// tasks が変化するたびに _computeMemberTaskCounts() を呼んで更新する

// ウィジェット側
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(houseworkAssignNotifierProvider).valueOrNull;
  return Row(
    children: state!.members.map((m) {
      final count = state.memberTaskCounts[m.memberId] ?? 0; // O(1)参照
      return _SummaryChip(member: m, count: count);
    }).toList(),
  );
}
```

適用すべき場面:
- `items.where(条件).length` を `build()` 内の `map()` の中で呼んでいる場合
- 同じ `where().toList()` を `build()` 内で複数回呼んでいる場合
- `DTO.copyWith()` が使えるのに全フィールドを明示して再生成している場合（可読性・保守性）
- `members.any((m) => m.role == 'OWNER' && m.userId == myId)` のような「ウィジェットが条件分岐に使うフラグ」を `build()` 内で判定している場合 → `bool isCurrentUserOwner` / `bool hasOtherActiveMembers` のような bool フィールドを State に持たせ、Notifier で data 変化時に計算する

> **背景（Sprint 39 Review）**: `MemberSummaryStrip.build()` でメンバーごとにタスク数を `tasks.where(...).length` で計算していた。O(メンバー数 × タスク数) のループが毎フレーム走るため、Notifier 側で `_computeMemberTaskCounts()` として事前計算し `Map<int, int>` を state に持たせる改修を行った。
> **Sprint 46 Review（#122）**: 世帯設定画面で `build()` 内に `members.any(...)` で OWNER 判定・他アクティブメンバー存在確認を書いていた。`isCurrentUserOwner: bool` / `hasOtherActiveMembers: bool` を State フィールドに移し Notifier 側で計算する形に修正した。

---

## 4. 状態管理（Riverpod）

| Provider 種別 | 用途 |
|---|---|
| `NotifierProvider` | 同期的な画面状態（フォーム入力・ローディングフラグ） |
| `AsyncNotifierProvider` | 非同期の画面状態（API呼び出しを含む操作） |
| `FutureProvider.family` | 一度だけ実行する非同期処理（トークン検証など） |
| `AutoDispose` | 画面を離れたら破棄するプロバイダに付与 |

- Provider 定義は各 `{screen}_notifier.dart` の末尾に記述する
- グローバルに参照する Provider は `{feature}_providers.dart` または `core/di/providers.dart` に置く
- `ref.watch` は build メソッド内のみ。ハンドラ内では `ref.read` を使う

### AutoDispose の設定ルール（重要）

画面固有の `AsyncNotifierProvider` / `NotifierProvider` には原則 `autoDispose` を付与すること。付与しないとユーザーが画面を離れてもプロバイダーがメモリに残り続ける。

```dart
// NG: autoDispose なし → 画面離脱後もメモリに残る
final accountSettingsNotifierProvider =
    AsyncNotifierProvider<AccountSettingsNotifier, AccountSettingsState>(
        AccountSettingsNotifier.new);

// OK: autoDispose あり → 画面離脱時に自動破棄
final accountSettingsNotifierProvider =
    AsyncNotifierProvider.autoDispose<AccountSettingsNotifier, AccountSettingsState>(
        AccountSettingsNotifier.new);
```

**autoDispose を付けてはいけないプロバイダー（グローバル共有 Provider）**:
- 未読件数など全画面共通で参照するグローバル Provider（`core/di/providers.dart` に置くもの）
- `authNotifierProvider` など認証状態 Provider

> **背景（Sprint 45 レビュー）**: `accountSettingsNotifierProvider` に `autoDispose` が未設定のまま実装していた。
> **背景（Sprint 48 レビュー）**: `InquiryListNotifier`（一覧画面）も `NotifierProvider.autoDispose` にすべきところ、`NotifierProvider`（非 autoDispose）で実装していた。詳細・設定系画面に限らず、**一覧画面の Notifier も autoDispose が必要**。

### IndexedStack 配下の一覧画面における invalidate（重要）

`StatefulShellRoute.indexedStack` 配下では、一覧画面ウィジェットが `IndexedStack` で保持されるため `AutoDispose` が破棄されず古い state が残る。

**詳細・作成画面で一覧の内容が変わる操作（追加・削除・ステータス変更）を行った場合は、一覧画面に戻る前に必ず一覧 Provider を explicit に invalidate すること。**

```dart
// Page 側の ref.listen や操作コールバックで invalidate する
ref.invalidate(shoppingListNotifierProvider);
```

対象となる操作パターン:
- アイテム追加後（作成画面 submit 成功時）
- アイテム削除後（詳細画面 deleteItem 成功時）
- ステータス変更後（詳細画面 updateStatus 成功時）
- お気に入り操作後（詳細画面 toggleFavorite 成功時）

> **背景（Sprint 35）**: 追加後・お気に入り操作後の反映漏れを Sprint 35 で修正したが、ステータス変更後の invalidate が漏れており Sprint Review で指摘された（#107）。削除後の反映も同様（#108）。

### ログアウト時の `ref.invalidate` タイミング（重要）

`logout()` 内でグローバル Provider（`householdNotifierProvider` 等）を `ref.invalidate` する場合、必ず **`state = AuthUnauthenticated()` を先にセットしてから** invalidate すること。順序が逆になると以下の無限ループが発生する。

**問題フロー（順序が逆の場合）:**
1. `ref.invalidate(householdNotifierProvider)` → ビルドが走る
2. トークンがまだ有効扱いのまま → API を呼ぶ
3. 401 → `AuthInterceptor` が `logout()` を呼ぶ
4. → 無限ループ

**正しい順序:**

```dart
// OK: state を先に未認証にしてから invalidate
Future<void> logout() async {
  await _tokenStorage.clearTokens();
  state = const AuthUnauthenticated();  // 先に state を更新
  ref.invalidate(householdNotifierProvider);  // その後 invalidate
}
```

**`AuthInterceptor` の再入防止も必須:**

```dart
// AuthInterceptor 側に再入防止ガードを追加
Future<void> _logoutIfAuthenticated() async {
  final current = ref.read(authNotifierProvider);
  if (current is AuthUnauthenticated) return;  // 既に未認証なら何もしない
  await ref.read(authNotifierProvider.notifier).logout();
}
```

**ログイン後（`saveTokens()`）の invalidate パターン:**

`householdNotifierProvider` のような非 AutoDispose グローバル Provider は `logout()` 時に invalidate するとトークンなしでビルドが走りエラー状態になる。別ユーザーでログイン後に正常データを取得するには、`saveTokens()`（ログイン成功後）のタイミングで invalidate するのが安全。

```dart
Future<void> saveTokens({required AuthUser user}) async {
  await _tokenStorage.saveTokens(...);
  state = AuthAuthenticated(user: user);
  ref.invalidate(householdNotifierProvider);  // ログイン成功後に invalidate
}
```

> **背景（Sprint 58 #158/#172）**: `logout()` 内で `state = AuthUnauthenticated()` より先に `ref.invalidate(householdNotifierProvider)` を呼んでいたため、トークンクリア後も AuthInterceptor が有効扱いで 401 → 再ログアウト → 無限ループが発生していた（#172）。また別ユーザーでログイン後も householdNotifier がエラー状態のままデータ取得できなかった（#158）。

---

## 5. ナビゲーション（go_router）

- 全ルートは `app_router.dart` に集約する
- 認証状態（`authNotifierProvider`）を `redirect` で監視し、未認証→`/login` へリダイレクト
- ディープリンクパス（`/email-verify`・`/invite/:token`・`/password/reset`）は `_publicPrefixes` に含め、認証不要として扱う
- `context.go()` と `context.push()` を使い分ける（履歴スタックを置き換えるか積むか）
  - `context.push()`: 詳細閲覧など「戻る操作が自然」な遷移に使う
  - `context.go()`: フォーム送信成功後など「前の画面に戻ってほしくない」遷移に使う
  - **⚠️ 新規作成成功後の詳細画面遷移は `context.go()` を使う**: `context.push()` を使うと戻るスタックに新規作成画面が残り、「←」で新規作成画面に戻ってしまう（Sprint 48 #149）

### シェル外ルートからシェル内ルートへ push するときの HeroController 衝突（重要）

`StatefulShellRoute.indexedStack` の**シェル外**独立ルート（例: `/notifications`）から、シェル内ルートへ `context.push()` すると、シェル外 Navigator とシェル内 Navigator の両方に Hero（AppBar の戻る矢印等）が同時に乗り `HeroController` のキーが衝突してアサーション失敗が発生する。

**対処法**: シェル外ルートからシェル内ルートへ遷移する前に、必ず `context.pop()` で現在のシェル外ルートを閉じてから `context.push(遷移先)` を呼ぶこと。

```dart
// NG: シェル外ルートが表示中のまま、シェル内ルートへ push → Hero キー衝突でクラッシュ
context.push(AppRoutes.tasks);

// OK: まず現在のシェル外ルートを pop してからシェル内ルートへ push
if (GoRouterState.of(context).matchedLocation == '/notifications') {
  context.pop();
}
context.push(AppRoutes.tasks);
```

判定ポイント:
- `GoRouterState.of(context).matchedLocation` で現在のルートパスが取得できる
- シェル外ルートのパスと一致する場合のみ `pop()` を先行させる
- ポップオーバー（`showDialog` ベース）から遷移する場合は `Navigator.of(context).pop()` が先行済みのため修正不要

> **背景（Sprint 57 #157）**: 通知センター（`/notifications`、シェル外）からタスク画面（シェル内）へ `context.push()` したとき、`HeroController` アサーション失敗でアプリがクラッシュしていた。

---

## 6. ネットワーク層（Retrofit / Dio）

- API クライアントは `@RestApi` アノテーションで定義し、`build_runner` でコード生成する
- リクエスト/レスポンスモデルは `data/models/` に置き、`fromJson` は `json_serializable` で生成する
- エラーは `DioException` をキャッチし `AppException` サブクラスに変換して上位へ伝播させる

```dart
// Repository impl のエラーハンドリングパターン
} on DioException catch (e) {
  if (e.error is AppException) throw e.error!;
  throw NetworkException(e.message ?? 'Network error');
}
```

- 認証トークンの付与・リフレッシュは `AuthInterceptor` で一元管理する

### Dio の型パラメータは必ず具体型を指定する

`_dio.get<T>()` / `_dio.post<T>()` 等の型パラメータには `<dynamic>` ではなく具体的な型を指定すること。`<dynamic>` のままにすると 2 段階キャストが必要になりコードが汚くなる。テストでモックのスタブを書く際も型パラメータを合わせないとスタブが効かない。

```dart
// NG: <dynamic> → キャスト地獄・テストスタブも壊れやすい
final res = await _dio.get<dynamic>('/api/households/$id/members');
final list = (res.data as List<dynamic>).cast<Map<String, dynamic>>();

// OK: 具体型を指定 → 1段階のキャストで済む
final res = await _dio.get<List<dynamic>>('/api/households/$id/members');
final list = (res.data as List<dynamic>).cast<Map<String, dynamic>>();
// ラッパー形式の場合
final res = await _dio.get<Map<String, dynamic>>('/api/invitations');
final items = (res.data!['items'] as List<dynamic>).cast<Map<String, dynamic>>();
```

> **背景（Sprint 46 #122 2回目レビュー）**: Repository の `_dio.get<dynamic>()` を全箇所で使っており、2段階キャストが随所に発生していた。

### デバッグログのセキュリティルール

`debugPrint` でキャッチした例外オブジェクト（`$e`）を直接出力してはならない。スタックトレース・内部状態がログに露出し、セキュリティリスクになる。

```dart
// NG: エラーオブジェクト全体を出力（スタックトレース・内部 userId 等が露出）
} catch (e) {
  debugPrint('Google sign-in error: $e');
}

// OK: 固定の警告文字列のみ出力
} catch (e) {
  debugPrint('Google sign-in failed');
}
```

> **背景（Sprint 45 レビュー）**: `google_link_section.dart` で `debugPrint('Google sign-in error: $e')` とエラーオブジェクト全体を出力していた。

### エラーハンドリングルール

- **`catch (_) {}` でエラーを握りつぶしてはならない**（Sprint 34 Review で指摘）。コンテキストに応じて以下のいずれかを行うこと：
  - **Repository / Service 層**: `rethrow` または `AppException` サブクラスに変換して `throw`
  - **Notifier 層**: `on AppException catch (e)` でメッセージを state に格納し、予期しない例外は汎用メッセージを格納する（rethrow しない）。空ボディの `catch (_) {}` は引き続き禁止
  - **StatefulWidget の event handler 内**: `on AppException catch (e)` でメッセージを `setState` で保持して画面内に表示、それ以外は `AppSnackBar` で汎用通知を表示する

```dart
// NG: エラーを握りつぶす（空ボディ）
} catch (_) {}

// NG: 意味のない rethrow（Riverpod に吸収されるだけで UI に反映されない）
} catch (_) { rethrow; }

// OK（Repository層）: rethrow
} catch (e) {
  rethrow;
}

// OK（Repository層）: AppException に変換
} on DioException catch (e) {
  if (e.error is AppException) throw e.error!;
  throw NetworkException(e.message ?? 'Network error');
}

// OK（Notifier層）: state に格納して UI へ通知（Sprint 36 で確立）
} on AppException catch (e) {
  state = AsyncData(current.copyWith(errorMessage: e.message));
} catch (_) {
  state = AsyncData(current.copyWith(errorMessage: 'errorUnexpected'));
}

// OK（StatefulWidget event handler内）: AppException はメッセージを setState で保持、その他は AppSnackBar で汎用通知（Sprint 43 で追加）
} on AppException catch (e) {
  setState(() => _errorMessage = e.message);
} catch (_) {
  AppSnackBar.showError(context, 'errorUnexpected');
}
```

---

## 7. テスト方針（flutter_test + mockito）

### テスト対象の分類

| 種別 | テスト | 備考 |
|---|---|---|
| Repository impl | **必須** | 成功パス + DioException→AppException 変換 |
| Notifier | **必須** | 各操作の状態遷移（成功・エラー） |
| Page（ウィジェット） | **必須** | 主要な表示確認・ユーザー操作のゴールデンパス |
| 操作ロジックを持つウィジェット | **必須** | ユーザー操作 → コールバック（Notifier 呼び出し等）を含む子ウィジェットはページ外でもウィジェットテスト必須（例: `SegmentedButton` 選択 → `onThemeModeChanged` 呼び出しを確認） |
| 見た目のみの子ウィジェット | **不要** | 表示ロジックがない純粋な描画ウィジェット（ラベル・装飾等）はテスト対象外 |
| 自動生成ファイル（`.g.dart` / `.mocks.dart`） | **不要** | 除外対象 |

**判断基準**: コールバック引数（`onXxx`）が Notifier 呼び出しや状態変更を含む場合はウィジェットテスト必須。純粋に表示だけなら不要。

> **背景（Sprint 52 #130 convention-reviewer 指摘）**: `AppearanceSection`（`SegmentedButton` で外観設定を選択するウィジェット）に「選択時に `setThemeMode()` が呼ばれること」を確認するウィジェットテストが未追加だった。Page のゴールデンパステストでカバーできていると判断していたが、独立したウィジェットとして操作ロジックを持つ場合はそのウィジェット単体のテストも必要。

### Repository impl テスト時のモック構造確認（重要）

Repository のモックを作成する前に、バックエンドの実際の API レスポンス構造を必ず確認すること。

- **ラッパー形式 `{"items": [...]}` か、フラットなリスト `[...]` かを確認する**
- バックエンドの `@RestApi` / Controller の戻り値型・レスポンスクラスを `hw-hub-backend` で確認する
- モックを誤った構造で作成すると、テストが通過してもランタイムで `ClassCastException` が発生する（Sprint 33 で発生）

```dart
// NG: フラットリストをレスポンスとしてモック
when(mockDio.get(...)).thenAnswer((_) async => Response(data: [{"id": 1, ...}], ...));

// OK: ラッパー形式を確認してモック
when(mockDio.get(...)).thenAnswer((_) async => Response(data: {"items": [{"id": 1, ...}]}, ...));
```

### ウィジェットテストで日本語テキストを直接検証しない（重要）

`find.text('日本語文字列')` でウィジェットを検索・検証することは禁止。ARB の文字列変更に脆く、多言語テスト環境に対応できない。

**代わりに `Key` ベースで検証すること。**各ウィジェット（セクション・バッジ・ボタン等）に `Key` を付与し、`find.byKey` で検索する。

```dart
// NG: 日本語テキスト直接検証 → ARB変更・多言語対応で壊れる
expect(find.text('パスワード変更'), findsOneWidget);
expect(find.text('保存'), findsOneWidget);

// NG: キャスト経由の日本語テキスト検証も同様に禁止
expect((tester.widget(find.byType(Text).first) as Text).data, '通知メッセージ');

// OK: Key ベースで検証 → 表示文字列に依存しない
// ウィジェット側
PasswordChangeSection(key: const Key('passwordChangeSection'), ...),
ElevatedButton(key: const Key('saveButton'), ...)

// テスト側
expect(find.byKey(const Key('passwordChangeSection')), findsOneWidget);
expect(find.byKey(const Key('saveButton')), findsOneWidget);
```

適用すべき場面:
- セクションウィジェット（`AccountInfoSection`, `ProfileSection` 等）の表示/非表示確認
- バッジや状態ラベルの検証
- ボタン・アイコンボタンのタップ・検索

例外（英語固定文字列のみ許容）:
- テスト用のルーティング先 Scaffold の body テキスト（例: `Text('signup-page')`）など、テスト専用プレースホルダーは引き続き `find.text` で参照可

> **背景（Sprint 45 レビュー）**: `account_settings_page_test.dart` で `find.text('パスワード変更')` 等の日本語テキスト直接検証を多用していた。ARB 変更や多言語テスト環境への対応として Key ベース検証に全面移行した。
> **背景（Sprint 53 レビュー）**: `notification_message_renderer_test.dart` で `(tester.widget(...) as Text).data == '日本語'` 形式（キャスト経由の日本語テキスト検証）を使っていた。`find.text()` と同様に禁止。`find.byKey(const Key('...'))` に修正した。

### ウィジェットテストのヘルパー

`test/helpers/widget_test_helpers.dart` に共通ヘルパーがある。

```dart
// 通常のウィジェットテスト（GoRouter不要な場合）
await tester.pumpWidget(buildTestPage(const LoginPage(), overrides: [...]));

// ナビゲーションテスト（context.go/push を含む場合）
await tester.pumpWidget(buildTestPageWithRouter(
  routes: [
    GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
    GoRoute(path: '/signup', builder: (_, __) => const Scaffold(body: Text('signup-page'))),
  ],
  overrides: [...],
  initialLocation: '/login',
));
await tester.pumpAndSettle();
await tester.tap(find.text('新規登録'));
await tester.pumpAndSettle();
expect(find.text('signup-page'), findsOneWidget);
```

### Provider オーバーライドのパターン

```dart
// 非ファミリープロバイダー
loginNotifierProvider.overrideWith(() => _FakeLoginNotifier())

// ファミリープロバイダー（引数あり）
// NG: passwordResetSentNotifierProvider('email').overrideWith(...)  ← コンパイルエラー
// OK: ファミリープロバイダー本体に対して呼ぶ
passwordResetSentNotifierProvider.overrideWith(() => _FakeNotifier())
```

### フェイク Notifier の実装パターン

```dart
// 初期状態だけ差し替える（最もシンプル）
class _ErrorLoginNotifier extends LoginNotifier {
  @override
  LoginState build() => const LoginState(errorMessage: 'エラー');
}

// build() 後に状態遷移させて ref.listen / SnackBar / ナビゲーションをトリガーする
class _SentEmailNotifier extends PasswordForgotNotifier {
  @override
  PasswordForgotState build() {
    Future.microtask(() => state = state.copyWith(sentEmail: 'test@example.com'));
    return const PasswordForgotState();
  }
}
```

### `pump()` vs `pumpAndSettle()` の選択ルール

```
CircularProgressIndicator が画面にある → pumpAndSettle() でタイムアウトする
→ pump() を使う（アニメーションを1フレーム進めるだけで十分）

画面遷移・SnackBar表示など、アニメーションが終わるまで待ちたい → pumpAndSettle()
Future.microtask による状態遷移を待つ場合 → pump(); pump(); で2フレーム進める
```

### Notifier テストの書き方

```dart
ProviderContainer makeContainer(String email) {
  final container = ProviderContainer(
    overrides: [
      secureStorageProvider.overrideWithValue(mockStorage),
      authRepositoryProvider.overrideWithValue(mockRepo),
    ],
  );
  addTearDown(container.dispose);
  return container;
}

// 操作してから状態を確認
await container.read(someNotifierProvider.notifier).doSomething();
expect(container.read(someNotifierProvider).isSending, false);
```

### タイマーを含む Notifier のテスト（fakeAsync）

`fake_async` を `pubspec.yaml` の `dev_dependencies` に直接追加する（`flutter_test` 経由では使えない）。

```yaml
dev_dependencies:
  fake_async: ^1.3.1
```

```dart
import 'package:fake_async/fake_async.dart';

test('1秒後にcooldownが減少する', () {
  fakeAsync((fake) {
    final container = makeContainer('test@example.com');
    // AutoDispose を防ぐためサブスクリプションを保持する（必須）
    final sub = container.listen(
      emailVerifyWaitNotifierProvider('test@example.com'),
      (_, __) {},
    );

    container.read(emailVerifyWaitNotifierProvider('test@example.com').notifier).resend();
    fake.flushMicrotasks(); // async処理を完了させる

    fake.elapse(const Duration(seconds: 1));
    expect(container.read(emailVerifyWaitNotifierProvider('test@example.com')).cooldownSeconds, 59);

    sub.close();
  });
});
```

**注意**: `container.listen()` がないと AutoDispose が `fake.flushMicrotasks()` のタイミングでプロバイダーを破棄し、タイマーが消えて状態が初期値に戻る。

### 複数の使い捨て引数は `_` を繰り返す（unnecessary_underscores）

Dart の `unnecessary_underscores` lint は `__`（2つ以上のアンダースコア変数）を禁止する。複数の無視引数は全て `_` を使う。

```dart
// NG: GoRoute builder / container.listen などで __ を使うとlintエラー
GoRoute(path: '/login', builder: (_, __) => const LoginPage())
container.listen(provider, (_, __) {})

// OK
GoRoute(path: '/login', builder: (_, _) => const LoginPage())
container.listen(provider, (_, _) {})
```

### モックの定義場所

- `test/features/{feature}/auth_mocks.dart` にまとめて `@GenerateMocks([...])` を定義する
- `@GenerateMocks` の更新後は `dart run build_runner build --delete-conflicting-outputs` を実行する

### カバレッジ除外パターン

除外パターンは `lcov_exclude.txt` で管理する。以下は除外対象。

- `lib/main.dart` / `lib/app_router.dart`
- `lib/l10n/*`（自動生成）
- `lib/core/config/*` / `lib/core/storage/*` / `lib/core/theme/*`（定数・設定のみ）
- `lib/core/di/*`（Provider 配線のみ）
- `lib/features/shell/*`（ナビゲーションシェル）
- `*/*.g.dart` / `*/*.mocks.dart`（コード生成）

カバレッジ計測は `coverage.ps1` を実行する（Windows PowerShell ネイティブで lcov フィルタリングを行う）。

CI（`coverage-mobile.yml`）の lcov コマンドには `--ignore-errors unused` を付ける。除外パターンが lcov.info に存在しない場合、lcov が exit code 25 で終了するため。

```yaml
lcov --remove coverage/lcov.info $PATTERNS --ignore-errors unused --output-file coverage/lcov_filtered.info
```

### 構造的に到達できないコード

以下は現行実装の制約上テストで到達できない。カバレッジ除外対象にしてよい。

- `household_notifier.dart` build() のハードコード空リスト返却（実APIコール前の仮実装）
- `auth_notifier.dart` の `Platform.isIOS` 分岐（iOS ビルドが存在しないため）

---

## 8. コード生成

生成が必要な場面と実行コマンド。

| 目的 | コマンド |
|---|---|
| Retrofit `.g.dart` 生成 | `dart run build_runner build --delete-conflicting-outputs` |
| Mockito `.mocks.dart` 生成 | 上と同じ（同時に生成される） |
| i18n Dart ファイル生成 | `flutter gen-l10n` |

- `.g.dart` / `.mocks.dart` / `lib/l10n/app_localizations*.dart` は自動生成ファイル。**直接編集禁止**

---

## 9. i18n 追加手順

1. `lib/l10n/app_ja.arb` にキーと日本語文字列を追加
2. `lib/l10n/app_en.arb` に同じキーと英語文字列を追加
3. `lib/l10n/app_es.arb` に同じキーとスペイン語文字列を追加
4. `flutter gen-l10n` を実行
5. 各 Page で `AppLocalizations.of(context).キー名` を使う

ハードコードの日本語・英語文字列は追加しないこと。

### バックエンドからキー値を受け取って翻訳する機能の注意事項

通知メッセージなど「バックエンドが文字列キーを返し、Flutter側でARBキーに変換して翻訳する」設計では、**計画フェーズでバックエンドが実際に返すキー値を確認し、Flutter ARBキーと突き合わせること**。

```dart
// Flutter は動的ARBキー参照ができないため、ディスパッチテーブルで変換する
// notification_message_renderer.dart の例
Map<String, String Function(AppLocalizations, Map<String, Object>)> get _table => {
  'notifications.messages.yourTaskWasTaken.title': (l10n, p) =>
      l10n.notificationsMessagesYourTaskWasTakenTitle(p['actorName'] as String),
  // ...
};
```

確認事項（計画フェーズ）:
- バックエンドDBの実際のキー値（例: `t_notification.title_key` の値）
- Flutter ARBキーとの命名規則の一致
- `params` の型・キー名

> **背景（Sprint 43 #124）**: バックエンドが返す `titleKey`/`bodyKey` の実データを未確認のままARBキーを定義したため、キーが不一致でi18nキーがそのまま表示された。

---

## 10. コミット前の必須作業

```bash
dart format .
flutter analyze
flutter test
```

フォーマット未適用・解析エラーありの状態でコミットしない。

---

## 11. デザイン参照方針

- **Mobileのspecで指定がない場合は `hw-hub-frontend` のホーム画面SP版を参照する**
- 色・レイアウト・表示順序・グラフ仕様など、specに明記されていない要素はwebのSP版に揃えること
- webのSP版と異なる実装が必要な場合は、specに明示的に記載する

> **背景（Sprint 26 Retro）**: 積み上げ棒グラフの未割当の表示順序など、specに記載がなかった要素がwebと異なっていたことがSprint Reviewで指摘された。

---

## 12. 外部パッケージ採用実績

### table_calendar（読み取り専用カレンダー）

カレンダー表示が必要な場合は `table_calendar` パッケージを使う（自作しない）。

```yaml
# pubspec.yaml
dependencies:
  table_calendar: ^3.x.x
```

**読み取り専用カレンダーの実装パターン**（タップ・月遷移を無効化して特定日をハイライトするだけ）:

```dart
TableCalendar(
  firstDay: DateTime.utc(2020, 1, 1),
  lastDay: DateTime.utc(2030, 12, 31),
  focusedDay: targetDate,                       // 表示する月をここで制御
  selectedDayPredicate: (day) =>
      isSameDay(day, targetDate),               // ハイライトする日
  // タップ・スワイプ無効化
  onDaySelected: null,                          // タップ無効
  availableGestures: AvailableGestures.none,   // スワイプ無効
  headerStyle: const HeaderStyle(
    formatButtonVisible: false,                 // 週/月切替ボタン非表示
    leftChevronVisible: false,                  // 前月ボタン非表示
    rightChevronVisible: false,                 // 次月ボタン非表示
  ),
)
```

- `focusedDay` を親ウィジェットの props として受け取り、カード変更時に親が再描画するだけで月フォーカスが自動更新される
- 読み取り専用ラッパーとして `SwipeDateCalendar` のような専用ウィジェットに切り出すと再利用しやすい

> **背景（Sprint 41 #114 AC3）**: スワイプモードのカード上部に対象日をカレンダー表示するために導入。りょこさんの確認で「自作しない・`table_calendar` を使う」方針が承認された。

### package_info_plus（アプリバージョン取得）

アプリのバージョン番号（`pubspec.yaml` の `version:`）をランタイムで取得する場合は `package_info_plus` パッケージを使う。

```yaml
# pubspec.yaml
dependencies:
  package_info_plus: ^8.x.x
```

**AsyncNotifier での取得パターン**（バックエンドAPIと並行して取得する例）:

```dart
@override
Future<AppInfoState> build() async {
  // バックエンドAPI呼び出しと PackageInfo 取得を並行実行
  final results = await Future.wait([
    _repository.getServerVersion(),        // バックエンドのバージョン
    PackageInfo.fromPlatform(),            // アプリのバージョン
  ]);
  final serverVersion = results[0] as String;
  final packageInfo = results[1] as PackageInfo;

  return AppInfoState(
    serverVersion: serverVersion,
    appVersion: packageInfo.version,       // "1.2.3" 形式
  );
}
```

- `PackageInfo.fromPlatform()` は非同期のため `AsyncNotifier.build()` 内で `await` が必要
- 複数の非同期処理は `Future.wait()` で並行実行するとレイテンシを最小化できる
- `packageInfo.version` → バージョン番号（例: `"1.2.3"`）
- `packageInfo.buildNumber` → ビルド番号（例: `"42"`）。通常は `version` だけ使えば十分

> **背景（Sprint 49 #142）**: アプリ情報画面でバックエンドバージョンとアプリバージョンを同時表示するために導入。

---

## 13. 静的コンテンツ画面の設計パターン

利用規約・プライバシーポリシーなど「APIコールも状態管理も不要な情報表示画面」では Notifier / Repository / State の3点セットを作らない。

**設計指針**:
- `StatelessWidget` で実装する（`ConsumerWidget` も不要）
- `SingleChildScrollView` + `Column` でスクロール可能なコンテンツを表示する
- テキストはすべて ARB ファイルに定義して `AppLocalizations.of(context).key` を使う
- ウィジェットテストは「画面が表示できること」と「主要なセクション Key が存在すること」の確認だけで十分

```dart
// 静的コンテンツ画面の実装パターン
class TermsPage extends StatelessWidget {
  const TermsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.termsTitle)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.termsSection1Title, key: const Key('termsSection1Title')),
            Text(l10n.termsSection1Body),
            // ...各条文...
          ],
        ),
      ),
    );
  }
}
```

**ウィジェットテストの最小パターン**:

```dart
testWidgets('利用規約画面が表示される', (tester) async {
  await tester.pumpWidget(buildTestPage(const TermsPage()));
  await tester.pumpAndSettle();
  expect(find.byKey(const Key('termsSection1Title')), findsOneWidget);
});
```

> **背景（Sprint 49 #143/#144）**: 利用規約・プライバシーポリシー画面を実装。状態管理不要なコンテンツ表示画面に Notifier / Repository を作るのは過剰設計のため、StatelessWidget のみで実装する方針をりょこさんが承認した。
