# タイマーを含む Notifier のテスト（fakeAsync）

クールダウンタイマー等、`Timer` / `Duration` を含む Notifier をテストするときに読むこと。

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
      (_, _) {},
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
