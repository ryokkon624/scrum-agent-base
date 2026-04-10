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

| 指示                       | 読み込むファイル                                                           |
| -------------------------- | -------------------------------------------------------------------------- |
| POモード（対りょこさん）   | skills/product_owner.md + memory/po/short_term.md + memory/po/long_term.md |
| POモード（対エージェント） | skills/product_owner.md + memory/po/short_term.md                          |
| SMモード                   | skills/scrum_master.md + memory/sm/short_term.md + memory/sm/long_term.md  |
| DEVモード                  | skills/developer.md + memory/dev/short_term.md + memory/dev/long_term.md   |

---

## Discordの使い方

- mcp-discordを使ってDiscordのチャンネルに投稿できます
- 投稿時は必ずロールのプレフィックス（[PO][SM][DEV]）をつけてください
- 投稿前に対象チャンネルの最新メッセージを読んでください

### チャンネルID一覧

| チャンネル | ID | タイプ | 投稿ツール |
|-----------|-----|--------|-----------|
| #backlog-refinement | 1489422321424007178 | Forum | discord_create_forum_post / discord_reply_to_forum |
| #standup | 1489422372225155122 | Text | discord_send |
| #skills-changelog | 1489422432635850863 | Text | discord_send |
| #10-planning | 1489422519416131644 | Forum | discord_create_forum_post / discord_reply_to_forum |
| #20-sprint | 1489422592539623614 | Forum | discord_create_forum_post / discord_reply_to_forum |
| #30-sprint-review | 1489422648449695824 | Forum | discord_create_forum_post / discord_reply_to_forum |
| #40-retrospective | 1489422706435821701 | Forum | discord_create_forum_post / discord_reply_to_forum |

---

## バックログの場所

- プロダクトバックログ: backlog/product_backlog.md
- Sprint 01バックログ: backlog/sprint_01/sprint_backlog.md

---

## 重要なルール

- mainブランチへの直接pushは禁止
- バックログに書いていない追加実装は自己判断でやらない
- Skillsファイルを読まずにロールとして行動しない
