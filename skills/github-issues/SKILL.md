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

```bash
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/ryokkon624/hw-hub-manage/issues" \
  -d '{"title": "[タイトル]", "body": "[本文]"}'
```

**注意:** 作成後のReadyフィールド（Draft設定）とSprintフィールドの入力はりょこさんが行う。

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

---

## 注意事項

- **ReadyフィールドはREST APIから参照・更新不可**（GitHub Projectsのカスタムフィールドのため）
  - ReadyフィールドはりょこさんがGitHub Projects画面で操作する
  - `Ready: Draft` のIssueを確認したい場合はりょこさんに確認する

- **Sprintフィールドも同様にREST APIから更新不可**
  - 対象SprintへのIssue割り当てはりょこさんが行う

- IssueのBodyを更新した後、Readyフィールド（Draft→Ready）の変更はりょこさんが行う
