# フォームと TextEditingController の同期パターン

State の更新がフォーム表示に反映されないバグの防止パターン集。テンプレート流し込み・編集画面の初期値読み込み・Provider 変化への追従を実装するときに読むこと。

## 目次

- State と `TextEditingController.text` を両方更新する（テンプレート流し込み）
- `TextFormField(initialValue:)` から `StatefulWidget + TextEditingController` への移行
- `ref.listen` コールバック内は `setState()` でラップする

---

## State と `TextEditingController.text` を両方更新する（テンプレート流し込み）

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

## `TextFormField(initialValue:)` から `StatefulWidget + TextEditingController` への移行

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

## `ref.listen` コールバック内は `setState()` でラップする

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
