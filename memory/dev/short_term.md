# Dev 短期記憶

**スプリント**: Sprint 02  
**最終更新**: 2026-04-10

---

## 担当タスクメモ

- PBI-001: Landing Page実装完了（AC1〜AC8）
- PBI-002: Landing Page i18n対応完了（AC1〜AC3）
- PBI-003: Landing Page LanguageSwitcher配置完了（AC1〜AC4）
- PBI-004: / アクセス時の認証状態による振り分け完了（AC1〜AC3）
- ブランチ: feature/sprint01-landing-page（PBI-001〜004すべて同ブランチ）
- URL: /landing（meta: { public: true }）
- キャッチコピー: 「家事を、チームで。」（かっこいい・スタイリッシュ方向でDEV作成）
- ロゴ: テキストロゴ「HwHub」（既存ロゴ画像なし）
- カラーテーマ: 既存hw-hub-frontendに準拠（bg-hwhub-primary, #1a2e1a, hwhub-surface等）
- フッターリンク: /settings/app/terms, /settings/app/privacy（requiresAuth: falseでオーバーライド）
- #20-sprint フォーラムスレッド作成済み（Sprint 02: ID: 1492046988374573056）

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-04-09 | /settings/app/terms が認証必須 | AppLayout親ルートがrequiresAuth: true | 子ルートにrequiresAuth: falseを追加（Vue Router 4はchildが優先） |
| 2026-04-09 | #20-sprint にsendで投稿できない | フォーラムチャンネルのためtext channel APIが使えない | discord_create_forum_postで新規スレッド作成 |
| 2026-04-10 | Sprint 02ブランチをmainベースで作成した | product_backlog.mdにsprint01-landing-page上で作業と明記されていた | ブランチをsprint01-landing-pageに切り替えて作業 |

---

## POへの未解決質問

| 質問内容 | 状況 |
|---------|------|
| キャッチコピー文言 | 回答済み（「かっこいい・スタイリッシュ」方向でDEV一任） |
| ロゴ素材 | 回答済み（テキストロゴでOK） |
| カラーテーマ | 回答済み（既存hw-hub-frontendに準拠） |
| フッターリンク先 | 回答済み（/settings/app/terms, /settings/app/privacy） |

---

*スプリント終了後、long_term.mdに要約して移す*
