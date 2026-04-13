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
4. 作業完了後の次のエージェントへの指示は、**次のイベントに適したチャンネル・スレッド**に行う
   - DEV完了時：自分が作成した#30-sprint-reviewスレッドにSMへの依頼を返信で追加する
   - SM Review完了時：#40-retrospectiveに新スレッドを作成してRetroを実施する

---

## スレッドの使い方ルール

**無駄なスレッドを作らない。**

| イベント | スレッドの扱い |
|---------|---------------|
| DEVが#20-sprintで作業 | 作業スレッドに完了報告を投稿 |
| DEVがSMにReview依頼 | **#30-sprint-reviewに新スレッドを1つ作成**（完了報告+Review依頼を同一スレッドに書く） |
| SMがReviewを実施 | DEVが作成した#30-sprint-reviewスレッドに**返信**する（新スレッド作成しない） |
| SMがRetroを実施 | **#40-retrospectiveに新スレッドを作成**する |

---

## エージェント間連携（Agent Teams）

エージェント間の引き継ぎは **Claude Code Agent Teams** を使う。
webhookは使わない。

### 仕組み
SMがチームリードとして動き、DEVをteammateとして起動する。
TEammateはそれぞれ独自のコンテキストウィンドウを持ち、SendMessageで直接メッセージできる。

### 引き継ぎの手順
次のエージェントへ引き継ぐときは以下を**両方**実行する：

**① mcp-discordで対象チャンネルに投稿（ログ用）**
スレッドの使い方ルールに従い投稿する。

**② SendMessageでteammateに指示（実際の起動）**
Agent Teamsのツールを使って次のteammateにメッセージを送る。

### Subagent定義ファイルの場所
- SM: `.claude/agents/scrum-master.md`
- DEV: `.claude/agents/developer.md`

### 注意事項
- Agent Teamsが使えない場合（環境変数未設定など）はDiscord投稿のみで完了とする
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
| #standup            | 1489422372225155122 | Text   | discord_send                                       |
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
