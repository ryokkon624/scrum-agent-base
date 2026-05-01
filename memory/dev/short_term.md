# Dev 短期記憶

**スプリント**: Sprint 17
**最終更新**: 2026-05-01

---

## スプリントゴール

@CurrentUserId アノテーションとArgumentResolverを実装し、全ControllerのユーザーID取得コードをシンプル化する

---

## 担当タスクメモ

### Issue #41: Argument ResolverによるユーザーID取得の簡素化（SP:3）

- **ブランチ**: `refactor/41-argument-resolver-user-id`
- **コミット参照**: `(ryokkon624/hw-hub-manage#41)`
- **ステータス**: レビュー指摘対応（3回目）完了・再レビュー待ち（AuthUserResolver削除対応）

### 承認済み実装方針

#### 新規作成（バックエンド）

| ファイル | 内容 |
|---|---|
| `src/main/java/com/hwhub/backend/security/CurrentUserId.java` | カスタムアノテーション（`@Target(PARAMETER)`, `@Retention(RUNTIME)`） |
| `src/main/java/com/hwhub/backend/security/CurrentUserIdArgumentResolver.java` | `HandlerMethodArgumentResolver` 実装。`Authentication == null` または `getName() == null` 時は `ResponseStatusException(401)` |
| `src/main/java/com/hwhub/backend/config/WebMvcConfig.java` | `WebMvcConfigurer#addArgumentResolvers` でResolverを登録（CorsConfigとは別ファイル） |
| `src/test/groovy/com/hwhub/backend/security/CurrentUserIdArgumentResolverSpec.groovy` | 単体テスト（正常系・異常系） |

#### 編集（全Controller 15ファイル）

`Authentication authentication` + `Long.parseLong(authentication.getName())` を `@CurrentUserId Long userId` に一括置換。
- UserController（`requireUserId` private メソッドも削除）
- InquiryController / HouseholdInvitationController / NotificationController
- ShoppingItemController / ShoppingItemHistoryController / ShoppingItemAttachmentController
- HouseworkController / HouseworkTaskController
- AdminUserController / AdminInquiryController / AdminHouseworkTemplateController / AdminRoleController
- HouseholdController / HouseholdMemberController

#### 確認済み決定事項

- **未認証時**: `ResponseStatusException(401)` を投げる。`/api/auth` など `permitAll` エンドポイントはSecurityFilterChainで分離されているため影響なし
- **置換対象**: `authentication.getName()` からuserIdを取り出している全箇所。例外的に難しい箇所があれば随時相談

#### TDD進行順序

1. **RED**: `CurrentUserIdArgumentResolverSpec.groovy` を先に書いて落とす
2. **GREEN**: `CurrentUserId` / `CurrentUserIdArgumentResolver` / `WebMvcConfig` を実装してパス
3. **REFACTOR**: 全Controllerを置換 + 全ControllerSpecを修正 → `./gradlew test` 全グリーン確認

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 17ではまだなし) | | | |

---

*スプリント終了後、long_term.mdに要約して移す*
