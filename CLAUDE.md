# CLAUDE.md - scrum-agent-base

HwHubプロジェクトのスクラムエージェント基盤。
SM・DEV・PO・各レビュアーが協調してスプリントを回す。

---

## プロジェクトのパス構成

| リポジトリ       | パス                              |
| ---------------- | --------------------------------- |
| エージェント基盤 | `C:\work\claude\scrum-agent-base` |
| フロントエンド   | `C:\work\hw-hub\hw-hub-frontend`  |
| バックエンド     | `C:\work\hw-hub\hw-hub-backend`   |
| バッチ           | `C:\work\hw-hub\hw-hub-batch`     |
| データベース     | `C:\work\hw-hub\hw-hub-database`  |
| モバイル         | `C:\work\hw-hub\hw-hub-mobile`    |
| ナレッジ         | `C:\work\hw-hub\hw-hub-knowledge` |
| インフラ         | `C:\work\hw-hub\hw-hub-infra`     |

---

## 技術スタック

| リポジトリ     | 主要技術                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| フロントエンド | Vue 3 / TypeScript / Pinia / Tailwind CSS / Vite / Vitest                  |
| バックエンド   | Java 21 / Spring Boot 4.x / MyBatis / Flyway / MySQL 8.4 / Groovy + Spock  |
| バッチ         | Java 21 / Spring Boot 4.x / Spring Batch / MyBatis / Groovy + Spock        |
| モバイル       | Flutter 3.x / Dart 3.x / Riverpod 2.x / go_router 14.x / Dio 5.x           |
| インフラ       | AWS ECS Fargate / RDS / S3 / CloudFront / ALB / Terraform / GitHub Actions |

---

## ロールの起動方法

ユーザーから「〇〇モードで動いて」と指示されたら、対応するagent定義を参照して行動する。

| 指示                  | 参照するagent定義                 |
| --------------------- | --------------------------------- |
| 「SMモードで動いて」  | `.claude/agents/scrum-master.md`  |
| 「DEVモードで動いて」 | `.claude/agents/developer.md`     |
| 「POモードで動いて」  | `.claude/agents/product-owner.md` |

---

## 行動原則

- バックログに書いていない追加実装は自己判断でやらない
- Agent Teamsが使えない場合はDiscord投稿のみで完了とする

---

## 環境制約

- `gh` CLI は未インストール → PR作成はcurl + GitHub REST API を使う

---

## バックログの場所

- 各スプリントバックログ: `backlog/sprint_XX/sprint_backlog.md`
