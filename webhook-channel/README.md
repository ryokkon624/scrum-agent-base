# webhook-channel

scrum-agent-base のエージェント間連携用 webhook チャンネル。

## 仕組み

```
エージェントA（作業完了）
  ↓ Bashツールで curl POST localhost:8788
webhook-channel（受信）
  ↓ notifications/claude/channel
Claude Code（--dangerously-load-development-channels で起動中）
  ↓ 指示を受け取って実行
エージェントB（次の作業開始）
```

## セットアップ

### 1. 依存パッケージのインストール

```bash
cd webhook-channel
bun add @modelcontextprotocol/sdk
```

### 2. Claude Code の起動

```powershell
cd C:\work\claude\scrum-agent-base
claude --dangerously-load-development-channels server:webhook
```

`.mcp.json` が自動で読み込まれ、webhook.ts が起動します。

### 3. 動作確認

別のターミナル（Git Bash または WSL）から：

```bash
curl -X POST http://localhost:8788 \
  -H "X-Sender: ryoko" \
  -d "SMモードで動いて。skills/scrum_master.md を読んで挨拶してください。"
```

PowerShellの場合：

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8788" `
  -Headers @{"X-Sender" = "ryoko"} `
  -Body "SMモードで動いて。skills/scrum_master.md を読んで挨拶してください。" `
  -ContentType "text/plain"
```

Claude Code のターミナルにイベントが届き、SMとして動き始めれば成功です。

## エージェントからの使い方

各 Skills ファイルで次のエージェントを起動するときは Bash ツールで curl を使う。
**PowerShell の curl（Invoke-WebRequest のエイリアス）は使わない。**

```bash
# DEV完了 → SMへReview依頼
curl -X POST http://localhost:8788 \
  -H "X-Sender: scrum-agent" \
  -d "SMモードで動いて。skills/scrum_master.md と memory/sm/short_term.md を読んで、Sprint Reviewを実施してください。"

# SM Review完了 → Retro実施
curl -X POST http://localhost:8788 \
  -H "X-Sender: scrum-agent" \
  -d "SMモードで動いて。skills/scrum_master.md と memory/sm/short_term.md と memory/sm/long_term.md を読んで、レトロを実施してください。"

# SM Planning完了 → DEVへ作業開始依頼
curl -X POST http://localhost:8788 \
  -H "X-Sender: scrum-agent" \
  -d "DEVモードで動いて。skills/developer.md と memory/dev/short_term.md と backlog/sprint_XX/sprint_backlog.md を読んで、作業を開始してください。"
```

## セキュリティ

- `localhost:8788` のみリッスン（外部からアクセス不可）
- `X-Sender` ヘッダーで送信者を確認（`scrum-agent` または `ryoko` のみ許可）
