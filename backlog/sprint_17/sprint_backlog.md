# Sprint 17 バックログ

**スプリントゴール**: @CurrentUserId アノテーションとArgumentResolverを実装し、全ControllerのユーザーID取得コードをシンプル化する

**期間**: 2026-05-01 〜

---

## 対象Issue

| Issue | タイトル | SP | ブランチ |
|-------|---------|-----|---------|
| #41 | Argument ResolverによるユーザーID取得の簡素化を行いたい | 3 | refactor/41-argument-resolver-user-id |

---

## #41 Argument ResolverによるユーザーID取得の簡素化を行いたい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/41
**ラベル**: refactor
**ブランチ**: `refactor/41-argument-resolver-user-id`

### 概要

#### 現状
Controllerの引数で Authentication を受け取り、各メソッドで Long.parseLong(authentication.getName()) を実行してユーザーIDを取得している。

#### 問題点
全てのControllerで同じコードが繰り返されており、冗長。

#### 改善案
SpringのHandlerMethodArgumentResolver を実装する。これにより、Controllerのメソッド引数に @CurrentUserId Long userId と書くだけで、自動的にログインユーザーのIDが注入されるようにする。

### ユーザーストーリー

**As a** バックエンドを開発するエンジニア
**I want to** @CurrentUserId アノテーションでログインユーザーのIDを取得したい
**So that** 全Controllerで繰り返し書いている Long.parseLong(authentication.getName()) を排除し、コードをシンプルに保てる

### Acceptance Criteria

- [x] AC1: CurrentUserId アノテーションと CurrentUserIdArgumentResolver が実装されている
- [x] AC2: CurrentUserIdArgumentResolver が SpringMVC に登録されている
- [x] AC3: 既存の全Controllerで Long.parseLong(authentication.getName()) が @CurrentUserId Long userId に置き換わっている
- [x] AC4: @CurrentUserId を使うControllerのSpock統合テストが既存テストと同様に通過する

### 備考

- 優先順位の根拠：全Controllerに共通する冗長コードを排除し、保守性を向上させる
- 依存関係：なし
