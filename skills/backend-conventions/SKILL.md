---
name: backend-conventions
description: HwHubバックエンド（hw-hub-backend）およびバッチ（hw-hub-batch）の設計規約・実装方針。Javaファイル・Groovyファイル・MyBatisマッパー・Flywayマイグレーションファイルを新規作成・編集するときは必ずこのスキルを参照すること。DDDライク3層構造・ドメインモデル・セキュリティ・テスト方針など、実装の判断に必要な規約をすべてここに集約している。
---

# Backend Conventions

hw-hub-backend・hw-hub-batchの設計規約・実装方針。

---

## 1. アーキテクチャ（DDDライク 3層構造）

```
Presentation層  →  Application層  →  Domain層
                                          ↑
                    Infrastructure層  ─────┘
```

- Controller は Application Service を呼び出す。Repository を直接呼ばない
- Request/Response DTO は Controller 層に閉じる。Application Service には渡さない
- Entity（MyBatis Generator生成）は Infrastructure 層に閉じる。上位層へ出さない
- `com.hwhub.backend.domain.enums` 配下の自動生成Enumは編集禁止

### オブジェクト種別と層ごとの依存ルール

| 層             | オブジェクト種別            | Presentation | Application | Domain | Infrastructure | メモ                                                       |
| -------------- | --------------------------- | :----------: | :---------: | :----: | :------------: | ---------------------------------------------------------- |
| Presentation   | request/response DTO        |      ○       |      ×      |   ×    |       ×        | class / record どちらでも可                                |
| Application    | Presentation層への戻り値DTO |      ○       |      ○      |   ×    |       ×        | Service の Inner Class として record で実装                |
| Domain         | Model                       |      ○       |      ○      |   ○    |       ○        | 業務的な単位・業務処理あり                                 |
| Domain         | 参照系Model                 |      ○       |      ○      |   ○    |       ○        | record で実装                                              |
| Domain         | 検索条件VO                  |      ○       |      ○      |   ○    |       ○        | record で実装（MyBatis mapper のパラメータとして対応済み） |
| Infrastructure | generated entity            |      ×       |      ×      |   ×    |       ○        | MBG生成・テーブルと1対1                                    |
| Infrastructure | custom entity               |      ×       |      ×      |   ×    |       ○        | JOINの結果を受け取るための手書きEntity                     |

**重要な制約**

- `generated entity` / `custom entity` は Infrastructure 層に閉じる。Service / Controller には絶対に出さない
- Presentation 層の DTO は Controller 内で完結させ、Service には渡さない

---

## 2. ドメインモデル & コンバーター

- Domainクラスのコンストラクタは `private` とし、再構築には `reconstruct()` ファクトリメソッドを使用する
- Infrastructure層からDomainに変換する際は、手書きの `XxxConverter` を作成し `toModel` メソッド内で `reconstruct()` を呼ぶ
- Enumは `m_code` テーブルから生成する（自動生成ファイルは編集禁止）

```java
// 例: Domainクラスの reconstruct() パターン
public class HouseworkTask {
    private final Long id;
    private final String title;

    private HouseworkTask(Long id, String title) { ... }

    public static HouseworkTask reconstruct(Long id, String title) {
        return new HouseworkTask(id, title);
    }
}

// 例: XxxConverter の toModel パターン
public class HouseworkTaskConverter {
    public HouseworkTask toModel(HouseworkTaskCustomEntity entity) {
        return HouseworkTask.reconstruct(entity.getId(), entity.getTitle());
    }
}
```

---

## 3. バリデーション & 例外

- Controller での `@Valid`（Bean Validation）と Domain での整合性チェックの二段構え
- 例外は `GlobalExceptionHandler`（`@RestControllerAdvice`）で一括ハンドリング
- 基本は `ResourceNotFoundException` / `IllegalArgumentException` を使用

---

## 4. トランザクション

- Service層のメソッドには `@Transactional` を適切に付与する
- 参照系メソッドは `@Transactional(readOnly = true)`

---

## 5. セキュリティ & パーミッション

- 認証: JWT（jjwt）+ Google OAuth / Spring Security で保護
- `/actuator/health`, `/actuator/info` は認証不要（permitAll）

### CORS設定（罠あり・注意）

CORS設定は `CorsConfig`（`CorsConfigurationSource` @Bean）で管理すること。

```java
// ✅ 正しい: CorsConfigurationSource を使う
@Bean
public CorsConfigurationSource corsConfigurationSource() { ... }

// ❌ 禁止: WebMvcConfigurer#addCorsMappings は使わない
// → Spring Security の CorsFilter（FilterChain 5番目）に届かないため
```

### パーミッションチェック（AOP）

管理系機能は `@RequiresPermission` アノテーションで宣言的に権限を制御する。

```java
@RequiresPermission(Permission.INQUIRY_REPLY)
public List<AdminInquiryRow> findPendingStaff() { ... }
```

- `RequiresPermissionAspect`（AOP）が SecurityContext の userId からロールを取得
- `m_role_permission` テーブルのマッピングと照合して 403 を返す
- build.gradle に `implementation 'org.aspectj:aspectjweaver'` が必要

### ロール・パーミッション対応表

| ロール  | code_value | 保有パーミッション                                   |
| ------- | ---------- | ---------------------------------------------------- |
| ADMIN   | `ADMIN`    | USER_LIST_VIEW / ROLE_MANAGE / INQUIRY_REPLY（全て） |
| SUPPORT | `SPPRT`    | INQUIRY_REPLY のみ                                   |

---

## 6. DB命名規約

```
テーブル種別
  m_xxx   マスターテーブル
  t_xxx   トランザクションテーブル

全テーブル共通カラム（WHOカラム必須）
  create_user / create_time / update_user / update_time

Flywayマイグレーションファイル命名
  V00_000_001__create_user.sql
```

---

## 7. テスト方針（Groovy / Spock）

### 単体テスト

- Groovy + Spock で記述する
- `where:` ブロックを活用し、カバレッジ（Instruction/Branch）を限りなく100%にする

```groovy
// where: ブロックの例
def "タスクのステータス更新"() {
    expect:
    task.updateStatus(input) == expected

    where:
    input           || expected
    Status.DONE     || true
    Status.PENDING  || false
}
```

### 統合テスト

- Groovy + Spock + Testcontainers で記述する
- `@Tag("integration")` を付与し、UTとITを分離する
- `IntegrationTestBase` を継承して作成する
- MySQLコンテナ（mysql:8.4）を使用し、Flywayマイグレーションを自動適用する
- S3等の外部依存は `@MockitoBean` でモックに差し替える
- PRマージ時にCIで自動実行される

---

## 8. hw-hub-batch 固有の注意事項

- backendと同じDDDライク3層構造・命名規約・実装方針を適用する
- バッチ処理は Spring Batch の Job / Step / Tasklet で構成する
- HTTPサーバーとして起動しない（エンドポイントなし）
- EventBridge Scheduler → ECS Fargate の単発タスクとして実行される
- Dockerfileはシングルステージ（JARをCOPYするだけ）
- backendのマルチステージとは異なるため注意
