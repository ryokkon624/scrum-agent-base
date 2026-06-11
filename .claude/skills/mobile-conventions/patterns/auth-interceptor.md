# AuthInterceptor のトークンリフレッシュと認証 Provider の invalidate 順序

認証トークン管理（リフレッシュ・ログアウト・再ログイン）に関わる実装をするときに読むこと。

## 目次

- トークンリフレッシュの並行制御（Completer）
- `AuthNotifier.updateTokens()` の実装パターン
- ログアウト時の `ref.invalidate` 順序と再入防止
- ログイン後（`saveTokens()`）の invalidate パターン

---

## トークンリフレッシュの並行制御（Completer）

複数リクエストが同時に 401 を受けた場合、リフレッシュ API を 1 回だけ呼んで全待機リクエストを再送するには `Completer<void>` を使う。

```dart
class AuthInterceptor extends Interceptor {
  bool _isRefreshing = false;
  Completer<void>? _completer;

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        await _doRefresh();
        // リフレッシュ成功 → 元のリクエストをリトライ
        final retryResponse = await _dio.fetch(err.requestOptions);
        return handler.resolve(retryResponse);
      } catch (_) {
        await _logoutIfAuthenticated();
        return handler.next(err);
      }
    }
    handler.next(err);
  }

  Future<void> _doRefresh() async {
    if (_isRefreshing) {
      // 他のリクエストがリフレッシュ中 → 完了を待つ
      return _completer!.future;
    }
    _isRefreshing = true;
    _completer = Completer<void>();
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken == null) throw Exception('No refresh token');
      // リフレッシュ API を直接呼ぶ（AuthInterceptor を通さない Dio インスタンスを使う）
      final response = await _rawDio.post('/api/auth/refresh', data: {'refreshToken': refreshToken});
      final newAccessToken = response.data['accessToken'] as String;
      final newRefreshToken = response.data['refreshToken'] as String;
      // AuthNotifier 経由でトークンを保存（state + TokenStorage を一元更新）
      await ref.read(authNotifierProvider.notifier).updateTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );
      _completer!.complete();
    } catch (e) {
      _completer!.completeError(e);
      rethrow;
    } finally {
      _isRefreshing = false;
      _completer = null;
    }
  }
}
```

**設計上のポイント**:

- `_isRefreshing` フラグで「リフレッシュ処理が走っているか」を管理する
- 2 つ目以降の 401 は `_completer!.future` を await して最初のリフレッシュ完了を待つ
- `_completer!.completeError(e)` で待機中のリクエスト全てにエラーを伝播できる
- リフレッシュ用の `_rawDio` は AuthInterceptor をアタッチしていない別インスタンスを使う（無限ループ防止）
- `updateTokens()` は `AuthNotifier` に追加するメソッド。`TokenStorage.saveTokens()` + `state = AuthAuthenticated(user.copyWith(...))` を1メソッドに集約する

> **背景（Sprint 64 #179）**: AuthInterceptor の `_doRefresh()` 実装。複数リクエストが同時に 401 を受ける場合の二重リフレッシュ防止と、トークン更新の一元管理（AuthNotifier）を設計した。

## `AuthNotifier.updateTokens()` の実装パターン

```dart
// auth_notifier.dart
Future<void> updateTokens({
  required String accessToken,
  required String refreshToken,
}) async {
  final current = state;
  if (current is! AuthAuthenticated) return;
  await _tokenStorage.saveTokens(
    accessToken: accessToken,
    refreshToken: refreshToken,
  );
  state = AuthAuthenticated(user: current.user);
}
```

## ログアウト時の `ref.invalidate` 順序と再入防止

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

## ログイン後（`saveTokens()`）の invalidate パターン

`householdNotifierProvider` のような非 AutoDispose グローバル Provider は `logout()` 時に invalidate するとトークンなしでビルドが走りエラー状態になる。別ユーザーでログイン後に正常データを取得するには、`saveTokens()`（ログイン成功後）のタイミングで invalidate するのが安全。

```dart
Future<void> saveTokens({required AuthUser user}) async {
  await _tokenStorage.saveTokens(...);
  state = AuthAuthenticated(user: user);
  ref.invalidate(householdNotifierProvider);  // ログイン成功後に invalidate
}
```

> **背景（Sprint 58 #158/#172）**: `logout()` 内で `state = AuthUnauthenticated()` より先に `ref.invalidate(householdNotifierProvider)` を呼んでいたため、トークンクリア後も AuthInterceptor が有効扱いで 401 → 再ログアウト → 無限ループが発生していた（#172）。また別ユーザーでログイン後も householdNotifier がエラー状態のままデータ取得できなかった（#158）。
