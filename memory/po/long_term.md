# PO 長期記憶

**最終更新**: 2026-04-27

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
| Sprint 05 Refinement | GitHub Issue更新はcurl経由で行う | デスクトップアプリ起動時はGitHub MCPでPrivate repoに未対応のため。ターミナル（CLI）起動時はMCP経由でも参照可能（2026-04-22確認）。起動方法によって挙動が異なる可能性あり |
| Sprint 05 Refinement | GitHub ProjectsのReady・Sprint列の更新はりょこさんが手動で行う | カスタムフィールドはREST API経由で変更不可（GraphQL必要） |
| Sprint 05 Refinement | 家事テンプレートの「おすすめ」フラグのi18n表記：英語「Yes」、スペイン語「Sí」 | 「おすすめコメントが入力済みか」を示すフラグのため、シンプルな肯定表現を採用 |

---

## バックログ起票時の先回りチェックリスト

（SMやDevの質問傾向から学んで追加していく）

- [ ] レスポンシブ対応の要否は明記したか
- [ ] エラー時の表示・挙動は記載したか
- [ ] 多言語対応（vue-i18n）が必要かどうか記載したか

### モバイル画面Issue作成時の標準チェック（Sprint 28 Refinementで追加）

- [ ] 担当者フィルタが必要な画面か？→ 必要なら `AC: assigneeUserId == currentUserId でフィルタすること` を明記する（明記しないとDEVが全員分のデータを表示するバグを出す。Sprint 26 #70・Sprint 28 #76で2連続発生）
- [ ] デザイン参照先を明記したか？→ `hw-hub-frontend/src/views/...` の対応するSP版ファイルをACまたは備考に明示する（明示しないとwebと異なるデザインで実装される。Sprint 27 #69・Sprint 28 #77で2連続発生）

---

## GitHub連携の運用メモ

### Issue取得・更新
- **Issue一覧取得**：起動方法によってMCPの挙動が異なる
  - **ターミナル（CLI）起動時**：`mcp__github__list_issues` でPrivate repoへのアクセス可能（2026-04-22確認済み）
  - **デスクトップアプリ起動時**：GitHub MCPでPrivate repoにアクセス不可。curlを使う（PATは `~/.claude/settings.json` の `env.GITHUB_PERSONAL_ACCESS_TOKEN`）
- **Issue Body更新**：MCP経由の更新は未検証。現状はJSONファイルを `C:/work/claude/issue{N}_body.json` に書き出し、curl PATCHで送る
- **Issue新規作成 → Project追加**（2026-04-27確認済み）
  1. curl POST で Issue作成 → `node_id` を取得
  2. GraphQL mutation `addProjectV2ItemById` で Project（`PVT_kwHODoPAds4BIV4c`）に追加 → `item.id`（PVTI_...）を取得
  3. 必要に応じて Ready・Sprint フィールドを `updateProjectV2ItemFieldValue` で設定

### GitHub Projects（カスタムフィールド）
- **Ready列**・**Sprint列** はREST APIから変更不可（GitHub Projects v2はGraphQL API）
- **GraphQL経由での読み取りは可能**（2026-04-27確認済み）
  - エンドポイント: `https://api.github.com/graphql`
  - PATを `Authorization: bearer $TOKEN` で渡す
  - Project ID: `PVT_kwHODoPAds4BIV4c`（Project番号1 = りょこさんのHousework Hub project）
  - Ready フィールドID: `PVTSSF_lAHODoPAds4BIV4czhQksUs`（options: Ready/NotReady/Draft/Drop）
  - Sprint フィールドID: `PVTF_lAHODoPAds4BIV4czhQkvCg`
  - Status フィールドID: `PVTSSF_lAHODoPAds4BIV4czg41IJE`
- **GraphQL mutationでの更新も可能**（2026-04-27確認済み）
  - mutation: `updateProjectV2ItemFieldValue`
  - singleSelectOptionId — Ready: `8af4afdd` / NotReady: `12a25b5b` / Draft: `832f7c5e` / Drop: `8fa84e1b`
  - Refinement後の `Draft → Ready` 変更はPOが実施可能（りょこさんの手動更新不要）
- Sprint列（Number型）の更新も可能（2026-04-27確認済み）
  - value: `{ number: N }` を指定する
- りょこさんが引き続き手動で行う作業
  - Planning前：優先順位並び替え
