# CLAUDE.md - scrum-agent-base

このリポジトリはスクラムエージェント基盤です。
Claude Codeがこのディレクトリで起動したとき、このファイルを読んで行動してください。

---

## プロジェクトのパス構成

- エージェント基盤: C:\work\claude\scrum-agent-base
- フロントエンド: C:\work\hw-hub\hw-hub-frontend
- バックエンド: C:\work\hw-hub\hw-hub-backend

---

## ロールの指定方法

起動時またはりょこさんから「POモードで動いて」「SMモードで動いて」「DEVモードで動いて」と
指示されたら、該当のSkillsファイルとmemoryを読み込んで行動してください。

| 指示                       | 読み込むファイル                                                            |
| -------------------------- | --------------------------------------------------------------------------- |
| POモード（対りょこさん）   | skills/product_owner.md + memory/po/short_term.md + memory/po/long_term.md |
| POモード（対エージェント） | skills/product_owner.md + memory/po/short_term.md                           |
| SMモード                   | skills/scrum_master.md + memory/sm/short_term.md + memory/sm/long_term.md  |
| DEVモード                  | skills/developer.md + memory/dev/short_term.md + memory/dev/long_term.md   |

---

## メンションで指示を受けたときのルール

Discordで `@scrum-agent` を含むメッセージを受け取ったら以下のルールに従う：

1. メッセージの内容を指示として実行する
2. 「XXモードで動いて」という指示があれば該当Skillsを読み込む
3. 作業中の報告・質問は**指示を受けたチャンネル・スレッド**に投稿する
4. 次のエージェントへの引き継ぎはAgent Teamsを使う（下記参照）

---

## スレッドの使い方ルール

**無駄なスレッドを作らない。**

| イベント | スレッドの扱い |
|---------|---------------|
| SMがPlanningを実施 | `#10-planning` のPlanningスレッドに報告 |
| SMがDEVに作業指示 | **`#20-sprint` に新スレッドを作成** |
| DEVが作業・修正完了 | `#20-sprint` の作業スレッドに投稿 |
| SMがReviewerの指摘をまとめる | `#20-sprint` の作業スレッドに投稿 |
| SMがSprint Reviewを実施 | **`#30-sprint-review` に新スレッドを作成** |
| SMがRetroを実施 | **`#40-retrospective` に新スレッドを作成** |

---

## エージェント間連携（Agent Teams）

エージェント間の引き継ぎは **Claude Code Agent Teams** を使う。

### 仕組み
SMがチームリードとして動き、DEV・reviewerをteammateとして起動する。
各teammateは独自のコンテキストウィンドウを持ち、SendMessageで直接メッセージできる。

### Subagent定義ファイルの場所
- SM: `.claude/agents/scrum-master.md`
- DEV: `.claude/agents/developer.md`
- 規約レビュアー: `.claude/agents/convention-reviewer.md`
- セキュリティレビュアー: `.claude/agents/security-reviewer.md`
- パフォーマンスレビュアー: `.claude/agents/performance-reviewer.md`

### 注意事項
- Agent Teamsが使えない場合はDiscord投稿のみで完了とする
- SendMessageが成功したら、そのセッションの作業は終了する（無限ループ防止）

---

## Discordの使い方

- mcp-discordを使ってDiscordのチャンネルに投稿できます
- 投稿時は必ずロールのプレフィックス（[PO][SM][DEV]）をつけてください
- 投稿前に対象チャンネルの最新メッセージを読んでください

### チャンネルID一覧

| チャンネル          | ID                  | タイプ | 投稿ツール                                         |
| ------------------- | ------------------- | ------ | -------------------------------------------------- |
| #backlog-refinement | 1489422321424007178 | Text   | discord_send                                       |
| #skills-changelog   | 1489422432635850863 | Text   | discord_send                                       |
| #10-planning        | 1489422519416131644 | Forum  | discord_create_forum_post / discord_reply_to_forum |
| #20-sprint          | 1489422592539623614 | Forum  | discord_create_forum_post / discord_reply_to_forum |
| #30-sprint-review   | 1489422648449695824 | Forum  | discord_create_forum_post / discord_reply_to_forum |
| #40-retrospective   | 1489422706435821701 | Forum  | discord_create_forum_post / discord_reply_to_forum |

### サーバー情報

- Guild ID: 1489421564439797780（scrum-agents）

---

## バックログの場所

- プロダクトバックログ: backlog/product_backlog.md
- 各スプリントバックログ: backlog/sprint_XX/sprint_backlog.md

---

## 重要なルール

- mainブランチへの直接pushは禁止
- PRは作成しない（コミットまで実施。PR作成はりょこさんが行う）
- バックログに書いていない追加実装は自己判断でやらない
- Skillsファイルを読まずにロールとして行動しない
