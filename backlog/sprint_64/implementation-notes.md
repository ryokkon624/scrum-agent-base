## #179: [mobile] AuthInterceptorにトークンリフレッシュ処理を実装する

### 仕様外の判断・変更・妥協点

- **`AuthNotifier.updateTokens()` の新設**: `saveTokens()` はログイン専用（`AuthUser` 必須・`householdNotifierProvider` invalidate あり）のため、リフレッシュ専用として `updateTokens(accessToken, refreshToken)` を追加した。既存ユーザー情報を保持したままトークンのみ差し替える設計。世帯切替不要のため invalidate なし（承認済み方針通り）。
- **テスト用Provider戦略**: `AuthInterceptor` のコンストラクタが `Ref` を受け取るため、テストで `mockUnauthDio` を注入するために `_testUnauthDioProvider` と `_authInterceptorTestProvider` をテストファイル内に定義した。これによりProviderContainer経由でrefを取得しつつ、unauthDioをモックに差し替えられるようにした。
- **`ErrorInterceptorHandler` のサブクラス化**: テスト用に `_CapturingErrorHandler extends ErrorInterceptorHandler` を定義し、`reject()`・`resolve()`・`next()` をoverride（super呼ばずに）してresult をキャプチャした。`_BaseHandler._completer` の状態管理をバイパスする唯一の方法。

## #180: README.mdへのhw-hub-mobile情報追加とmobile_README.mdの更新

### 仕様外の判断・変更・妥協点

- **README.md の構成を hw-hub-frontend/README.md に合わせて再構築**: 他リポジトリ共通形式（Overview・Architecture・Tech stack・Repository Structure・Development・Coverage Report・CI/CD等）を踏襲しつつ、hw-hub-mobileセクション（役割・セットアップ手順）を追加した。Flutter バッジも追加した。
- **mobile_README.md への追記は最小限**: ほぼすべての内容が既存ファイルに記載済みだったため、「依存方向ルール（Page→Notifier→Repository）」と「テスト対象分類・TDD方針」のみを追記した。
