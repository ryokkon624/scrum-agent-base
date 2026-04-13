# Sprint 02 Sprint Backlog

**期間**: 2026-04-10〜（未定）  
**スプリントゴール**: Landing Pageを多言語対応し、どのユーザーにも適切な導線を完成させる

---

## スプリントバックログ

| タスク | 担当 | ステータス | 備考 |
|--------|------|-----------|------|
| PBI-002 Landing Page i18n対応 | DEV | 完了 | AC全3件確認済み |
| PBI-003 Landing Page LanguageSwitcher配置 | DEV | 完了 | AC全4件確認済み |
| PBI-004 / アクセス時の認証状態による振り分け | DEV | 完了 | AC全3件確認済み |

---

## Acceptance Criteria

### PBI-002: Landing Page i18n対応

- [ ] AC1: Landing Page内のすべての固定文言がvue-i18nのキーに置き換えられている
- [ ] AC2: 日本語（ja）・英語（en）・スペイン語（es）の翻訳ファイルにLanding Page用のキーが追加されている
- [ ] AC3: 既存の翻訳ファイル構造に準拠している

### PBI-003: Landing Page LanguageSwitcher配置

- [ ] AC1: ヘッダー右上の「ログイン」ボタンの左にLanguageSwitcherが配置されている
- [ ] AC2: LanguageSwitcherをクリックすると日本語・英語・スペイン語が切り替わる
- [ ] AC3: 切り替え後、Landing Pageの文言が即座に切り替わる
- [ ] AC4: src/components/LanguageSwitcher.vue が既存コンポーネントとして使用できる場合はそれを流用する

### PBI-004: / アクセス時の認証状態による振り分け

- [ ] AC1: 未認証状態で / にアクセスすると /landing にリダイレクトされる
- [ ] AC2: 認証済み状態で / にアクセスすると /home にリダイレクトされる
- [ ] AC3: 既存の認証フロー（requiresAuthチェック）に影響を与えない
