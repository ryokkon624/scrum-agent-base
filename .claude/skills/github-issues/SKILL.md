---
name: github-issues
description: HwHubプロジェクトのGitHub Issue参照・作成・更新の手順。SM・DEV・POがIssueを取得する、Issueを作成する、IssueのBodyを更新する操作が必要なときは必ずこのスキルを参照すること。GitHub MCPはPrivate repoに対応していないため、起動方法によってcurlとMCPを使い分ける必要があり、このスキルを読まずに操作してはならない。
---

# GitHub Issues Operations

HwHubスクラムチームのGitHub Issue参照・作成・更新の手順。

## 基本情報

- **リポジトリ**: `ryokkon624/hw-hub-manage`（Private）
- **認証**: 環境変数 `GITHUB_PERSONAL_ACCESS_TOKEN` に設定済み
- **GitHub Projects**: `@ryokkon624's Housework Hub project`
  - Project ID: `PVT_kwHODoPAds4BIV4c`
  - Ready フィールドID: `PVTSSF_lAHODoPAds4BIV4czhQksUs`
  - Sprint フィールドID: `PVTF_lAHODoPAds4BIV4czhQkvCg`
  - Story Points フィールドID: `PVTF_lAHODoPAds4BIV4czhQksZ0`
  - Status フィールドID: `PVTSSF_lAHODoPAds4BIV4czg41IJE`
  - Ready選択肢ID: `8af4afdd`=Ready / `12a25b5b`=NotReady / `832f7c5e`=Draft / `8fa84e1b`=Drop

---

## ツールの使い分け（最重要）

Claude Codeの起動方法によってGitHub MCPの使用可否が異なる。

| 起動方法 | GitHub MCP | 使用するツール |
|---|---|---|
| ターミナル（CLI）起動 | ✅ 使用可能 | `mcp__github__*` 系ツール |
| デスクトップアプリ起動 | ❌ Private repo不可 | curl |

**迷ったらcurlを使う。** curlはどちらの環境でも動作する。

---

## 操作パターン別の手順

### 1. Issue一覧を取得する

**CLIの場合（MCP）:**
```
ツール: mcp__github__list_issues
パラメータ:
  owner: ryokkon624
  repo: hw-hub-manage
  state: open
  per_page: 50
```

**curlの場合:**
```bash
curl -s \
  -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/ryokkon624/hw-hub-manage/issues?state=open&per_page=50"
```

### 2. 特定のIssueを取得する

```bash
curl -s \
  -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/ryokkon624/hw-hub-manage/issues/{N}"
```

取得後、以下を確認する：
- Acceptance Criteria（AC）
- ブランチ名（`備考` セクション）
- コミット番号（`(ryokkon624/hw-hub-manage#N)` の形式）

### 3. Issueを新規作成する

**Step 1: Issue作成（REST API）**

```bash
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/ryokkon624/hw-hub-manage/issues" \
  -d '{"title": "[タイトル]", "body": "[本文]", "labels": ["[ラベル]"]}'
```

レスポンスから `node_id`（`I_kwDOR5...` 形式）を取得する。

**Step 2: GitHub Projects #1 に追加（GraphQL）**

```bash
curl -s -X POST \
  -H "Authorization: bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { addProjectV2ItemById(input: { projectId: \\\"PVT_kwHODoPAds4BIV4c\\\", contentId: \\\"[node_id]\\\") { item { id } } }\"}" \
  "https://api.github.com/graphql"
```

レスポンスから `item.id`（`PVTI_lAH...` 形式）を取得する。

**Step 3: ReadyフィールドをDraftに設定（GraphQL）**

```bash
curl -s -X POST \
  -H "Authorization: bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { updateProjectV2ItemFieldValue(input: { projectId: \\\"PVT_kwHODoPAds4BIV4c\\\", itemId: \\\"[item_id]\\\", fieldId: \\\"PVTSSF_lAHODoPAds4BIV4czhQksUs\\\", value: { singleSelectOptionId: \\\"832f7c5e\\\" } }) { projectV2Item { id } } }\"}" \
  "https://api.github.com/graphql"
```

### 4. IssueのBodyを更新する

Bodyが長い場合はJSONファイルに書き出してから送る（文字化け・エスケープ対策）。

```bash
# Step1: JSONをファイルに書き出す
# ファイルパス例: C:/work/claude/issue{N}_body.json
# 内容例:
# {
#   "body": "## ユーザーストーリー\n\n..."
# }

# Step2: ファイルを使ってPATCH
curl -s -X PATCH \
  -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/ryokkon624/hw-hub-manage/issues/{N}" \
  --data-binary "@C:/work/claude/issue{N}_body.json"
```

### 5. GitHub ProjectsのフィールドをGraphQLで操作する

#### 5-1. Project一覧をReadyフィールド付きで取得する

```bash
curl -s -X POST \
  -H "Authorization: bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ user(login: \"ryokkon624\") { projectV2(number: 1) { items(first: 200) { nodes { id fieldValues(first: 20) { nodes { ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2SingleSelectField { name } } } ... on ProjectV2ItemFieldNumberValue { number field { ... on ProjectV2Field { name } } } } } content { ... on Issue { number title state } } } } } } }"}' \
  "https://api.github.com/graphql"
```

#### 5-2. ReadyフィールドをReadyに更新する（Refinement完了後）

```bash
curl -s -X POST \
  -H "Authorization: bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { updateProjectV2ItemFieldValue(input: { projectId: \\\"PVT_kwHODoPAds4BIV4c\\\", itemId: \\\"[PVTI_...]\\\", fieldId: \\\"PVTSSF_lAHODoPAds4BIV4czhQksUs\\\", value: { singleSelectOptionId: \\\"8af4afdd\\\" } }) { projectV2Item { id } } }\"}" \
  "https://api.github.com/graphql"
```

#### 5-3. SprintフィールドをNに設定する

```bash
curl -s -X POST \
  -H "Authorization: bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { updateProjectV2ItemFieldValue(input: { projectId: \\\"PVT_kwHODoPAds4BIV4c\\\", itemId: \\\"[PVTI_...]\\\", fieldId: \\\"PVTF_lAHODoPAds4BIV4czhQkvCg\\\", value: { number: N } }) { projectV2Item { id } } }\"}" \
  "https://api.github.com/graphql"
```

#### 5-4. Story PointsをNに設定する

```bash
curl -s -X POST \
  -H "Authorization: bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { updateProjectV2ItemFieldValue(input: { projectId: \\\"PVT_kwHODoPAds4BIV4c\\\", itemId: \\\"[PVTI_...]\\\", fieldId: \\\"PVTF_lAHODoPAds4BIV4czhQksZ0\\\", value: { number: N } }) { projectV2Item { id } } }\"}" \
  "https://api.github.com/graphql"
```

---

## 注意事項

- **GitHub ProjectsのカスタムフィールドはREST APIから参照・更新不可**（GraphQL APIを使うこと）
- Issue作成後は必ず手順3のStep 2〜3を実行し、Projectへの追加とReadyフィールド（Draft）の設定まで行う
- Refinement完了後のReady更新（Draft→Ready）およびStory Points設定はPOが手順5-2・5-4で実施する
- **りょこさんが引き続き手動で行う作業**: Planning前の優先順位並び替え
