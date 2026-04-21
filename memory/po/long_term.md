# PO 長期記憶

**最終更新**: 2026-04-20

---

## SMやDevからの質問傾向

（レトロ後に short_term から移してくる）

### よく聞かれること
- 

### バックログに書いておくべきだった観点
- 

---

## 過去の意思決定ログ

| スプリント | 決定事項 | 理由 |
|-----------|---------|------|
| Sprint 05 Refinement | GitHub Issue更新はcurl経由で行う | GitHub MCPがPrivate repoに未対応のため |
| Sprint 05 Refinement | GitHub ProjectsのReady・Sprint列の更新はりょこさんが手動で行う | カスタムフィールドはREST API経由で変更不可（GraphQL必要） |
| Sprint 05 Refinement | 家事テンプレートの「おすすめ」フラグのi18n表記：英語「Yes」、スペイン語「Sí」 | 「おすすめコメントが入力済みか」を示すフラグのため、シンプルな肯定表現を採用 |

---

## バックログ起票時の先回りチェックリスト

（SMやDevの質問傾向から学んで追加していく）

- [ ] レスポンシブ対応の要否は明記したか
- [ ] エラー時の表示・挙動は記載したか
- [ ] 多言語対応（vue-i18n）が必要かどうか記載したか

---

## GitHub連携の運用メモ

### Issue取得・更新
- **Issue一覧取得**：curl + PAT で GitHub REST API を叩く
  - PATは `~/.claude/settings.json` の `env.GITHUB_PERSONAL_ACCESS_TOKEN` に設定済み
  - GitHub MCPツール（`mcp__github__*`）はPrivate repoに未対応
- **Issue Body更新**：JSONファイルを `C:/work/claude/issue{N}_body.json` に書き出し、curl PATCHで送る

### GitHub Projects（カスタムフィールド）
- **Ready列**・**Sprint列** はREST APIから変更不可（GitHub Projects v2はGraphQL API）
- りょこさんがGitHub Projects画面上で手動更新する
  - Refinement後：Ready: Draft → Ready: Ready
  - Planning前：対象SprintのSprint列に番号入力・優先順位並び替え
