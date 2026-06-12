# シェル外ルートからシェル内ルートへ push するときの HeroController 衝突

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

> **背景（Sprint 57 #157)**: 通知センター（`/notifications`、シェル外）からタスク画面（シェル内）へ `context.push()` したとき、`HeroController` アサーション失敗でアプリがクラッシュしていた。
