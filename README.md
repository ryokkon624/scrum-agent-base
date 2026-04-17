# scrum-agent-base

HwHubプロジェクトのAIスクラムチーム基盤。
Claude Code Agent Teamsを使ってSM・DEV・レビュアーが連携し、スクラムを自律的に回す。

---

## 全体構成

```
りょこさん（PO）
  ↓ Sprintバックログを起票・優先順位付け
SM（チームリード）
  ↓ Planning → DEV起動 → Reviewerを起動
DEV（teammate）
  ↓ 実装・コミット・SMに報告
Reviewer × 3（teammate・並列）
  ↓ 規約/セキュリティ/パフォーマンスをレビュー・SMに報告
SM
  ↓ 指摘があればDEV再起動（ラリー）
  ↓ 指摘なければSprintレビュー投稿・停止
りょこさん
  ↓ Discordで動作確認・指摘を記録
  ↓ Claude Codeを再起動してRetro指示
SM
  ↓ Retro・指摘をPBI化・Skills更新
```

---

## ターミナルの起動方法

### 基本（Agent Teams + Discordメンション受信）

```powershell
# scrum-agent-baseに移動して起動
cd C:\work\claude\scrum-agent-base
claude --channels plugin:discord@claude-plugins-official
```

### Discordのメンション受信が不要な場合（ターミナルから指示するとき）

```powershell
cd C:\work\claude\scrum-agent-base
claude
```

---

## Sprintの開始方法

### ターミナルから指示する場合

```
SMモードで動いて。
skills/scrum_master.md と memory/sm/short_term.md と memory/sm/long_term.md と
backlog/product_backlog.md を読んで、
Sprint XXのPlanningを開始してください。
```

### Discordから指示する場合（--channelsで起動中のターミナルが必要）

scrum-agentsサーバーの `#10-planning` の該当スレッドや `#standup` などで：

```
@scrum-agent SMモードで動いて。skills/scrum_master.md と memory/sm/short_term.md と
memory/sm/long_term.md を読んで、Sprint XXのPlanningを開始してください。
```

---

## タスク進捗の可視化（claude-task-viewer）

Agent Teamsが動いているとき、別ターミナルで以下を実行するとブラウザでKanbanが見える：

```powershell
npx claude-task-viewer --open
```

`http://localhost:3456` が自動で開く。
SMが作成したタスクの進捗（pending / in_progress / completed）がリアルタイムで更新される。

> **仕組み：** Agent Teamsはタスクを `~/.claude/tasks/{team-name}/` 配下のJSONファイルに保存する。
> claude-task-viewerはそのJSONを監視してUIに反映するだけ。サーバー不要・インストール不要で動く。

---

## Sprint Reviewの流れ

SMが `#30-sprint-review` にReviewスレッドを投稿した時点でClaude Codeは停止する。

1. Discordの `#30-sprint-review` を確認する
2. 動作確認を行い、指摘があればスレッドにコメントする
3. 指摘対応は次のSprintで実施（このSprintでは追加実装しない）
4. Claude Codeを再起動してRetroを指示する：

```
SMモードで動いて。
skills/scrum_master.md と memory/sm/short_term.md と memory/sm/long_term.md を読んで、
#30-sprint-reviewの最新スレッドを確認してレトロを実施してください。
```

---

## ディレクトリ構成

```
scrum-agent-base/
├── CLAUDE.md                    # エージェントが起動時に読む設定ファイル
├── README.md                    # このファイル
├── .claude/
│   ├── settings.json            # Agent Teams有効化設定
│   └── agents/
│       ├── scrum-master.md      # SMのsubagent定義
│       ├── developer.md         # DEVのsubagent定義
│       ├── convention-reviewer.md    # 規約レビュアーのsubagent定義
│       ├── security-reviewer.md      # セキュリティレビュアーのsubagent定義
│       └── performance-reviewer.md   # パフォーマンスレビュアーのsubagent定義
├── skills/
│   ├── scrum_master.md          # SMの行動規範
│   ├── developer.md             # DEVの行動規範
│   └── product_owner.md         # POの行動規範
├── memory/
│   ├── sm/
│   │   ├── short_term.md        # SMの今スプリントの記憶
│   │   └── long_term.md         # SMの過去スプリントの教訓
│   ├── dev/
│   │   ├── short_term.md        # DEVの今スプリントの記憶
│   │   └── long_term.md         # DEVの過去スプリントの教訓
│   └── po/
│       ├── short_term.md        # POの今スプリントの記憶
│       └── long_term.md         # POの過去スプリントの教訓
└── backlog/
    ├── product_backlog.md       # プロダクトバックログ
    └── sprint_XX/
        └── sprint_backlog.md    # スプリントバックログ（SMがPlanning時に作成）
```

---

## 設定ファイル

### Agent Teamsの有効化（`~/.claude/settings.json`）

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

> **注意：** `C:\work\claude\scrum-agent-base\.claude\settings.json` ではなく、
> ユーザーレベルの `C:\Users\ryokk\.claude\settings.json` に設定する。

---

## Discordサーバー（scrum-agents）のチャンネル構成

| チャンネル          | タイプ | 用途 |
| ------------------- | ------ | ---- |
| #backlog-refinement | Text   | POとのバックログ詳細化 |
| #skills-changelog   | Text   | Skillsファイル更新履歴 |
| #10-planning        | Forum  | Sprint Planning |
| #20-sprint          | Forum  | Sprint作業・コードレビュー |
| #30-sprint-review   | Forum  | Sprint Review・りょこさんへの確認依頼 |
| #40-retrospective   | Forum  | Retrospective |

---

## 技術スタック

- **エージェント基盤**: Claude Code + Agent Teams
- **エージェント間メッセージング**: SendMessage（Agent Teams組み込み）
- **Discordとの連携（投稿）**: mcp-discord
- **Discordとの連携（受信）**: Claude Code Channels（`--channels`フラグ）
- **タスク可視化**: claude-task-viewer（`npx claude-task-viewer`）
