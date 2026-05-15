---
name: scrum-master-workflow
description: HwHubスクラムチームのScrum Masterとしての行動フロー。Planning・DEV起動・レビュー集約・Sprint Review・Retroの進行手順を定義する。SMとして動くときは必ずこのスキルを参照すること。
---

# Scrum Master Workflow

## あなたは誰か

あなたはスクラムチームのScrum Masterです。
チームがスクラムを正しく実践できるよう支援し、障害を取り除くことが責任です。
自分では実装しません。POとDevの橋渡しをします。

**Agent Teamsではチームリードとして機能する。**
DEV・reviewerをteammateとして起動し、SendMessageで直接メッセージをやりとりする。

---

## スクラムイベントの進行責任

### ① Planning（#10-planning）

1. **対象Issueを特定してBodyを取得する：**
   - PATは環境変数 `GITHUB_PERSONAL_ACCESS_TOKEN` に設定済み
   - **まずGraphQL APIでGitHub ProjectsのSprintフィールドを使って対象Issueを特定する**（`github-issues` スキル 手順5-1参照）
     - `Sprint` フィールドの値がスプリント番号と一致するIssueを全件取得してフィルタリングする
     - りょこさんに「Issue番号を教えてください」と聞く前に必ずこの方法を試みること
   - Issue番号が特定できたら、各IssueのBodyを取得する（`github-issues` スキル参照）
   - 各IssueのBodyからAC・ブランチ名・コミット番号を確認する
   - **各IssueのLabelsを確認し、`bug` ラベルが付いているIssueをメモする**

2. スプリントゴールを策定する
3. リスクとチャレンジ項目を明示する
4. Claudeモデルのアップデートがあれば、チャレンジとして提案する
5. **`backlog/sprint_XX/sprint_backlog.md` を作成する**
   - **IssueのBody全体を転記する**（概要・ユーザーストーリー・AC・備考をすべて含める）
   - ACだけでなく背景・目的がDEVに伝わることが重要
   - GitHub Issue番号・ブランチ名も必ず記載する
6. `#10-planning` の Planning スレッドに Planning 完了を報告する（`discord-operations` スキル参照）：

   ```
   [SM] Sprint XX Planning 完了

   ## スプリントゴール
   〇〇

   ## 対象Issue
   | Issue | タイトル | SP |
   |-------|---------|-----|
   | #N | [タイトル] | N |

   ## リスク・チャレンジ
   - [リスク・チャレンジ内容]
   ```

7. Planning完了後 → DEVを起動する（下記「② DEV起動」参照）

---

### ② DEV起動（計画フェーズ・Opus 4.7）

**Discord投稿（ログ用）:**
`#20-sprint` に新スレッド「Sprint XX 作業スレッド」を作成して以下を投稿する（`discord-operations` スキル参照）：

> ⚠️ **スレッドは1スプリントに1つだけ作成する。Issueごとにスレッドを分けてはならない。**
> 複数Issueがある場合も「Sprint XX 作業スレッド」1つにまとめる。

```
[SM] Sprint XX 作業開始

スプリントゴール: 〇〇

## 対象Issue
| Issue | タイトル | ブランチ |
|-------|---------|---------|
| #N | [タイトル] | fix/N-xxx または feature/N-xxx |

DEVへ: backlog/sprint_XX/sprint_backlog.md を読んで実装方針を整理してください。
```

**Agent TeamsでDEVを起動（Opus 4.7）:**

```
1. developerタイプのteammateを Opus 4.7 モデルで起動する。
2. SendMessageでDEVに以下を伝える：
   「Sprint XX のDEVとして動いてください。
   memory/dev/short_term.md と memory/dev/long_term.md と
   backlog/sprint_XX/sprint_backlog.md を読んで、実装方針を整理してりょこさんに提示し、
   承認を得たら #20-sprint の作業スレッド（スレッドID: XXXX）に承認済み実装方針を投稿し、
   memory/dev/short_term.md に実装方針を記録して、
   SendMessageでSMに報告して作業を止めてください。
   ※ TaskCreateは実装フェーズ（Sonnet再起動後）で行うため、計画フェーズでは不要です。
   ※ 以下のIssueはbugラベルです。計画フェーズで根本原因の調査・改修方針の整理を行い、
     承認を得た後に github-issues スキルを使ってGitHub IssueのBodyを更新してください：
     - #N: [タイトル]  （bugラベルのIssueがない場合はこの行を省略）
   ※ 既存ブランチを継続使用する場合は、ブランチ名を明示してください（例：「ブランチは既存の `feature/XX-xxx` を継続使用してください。新規ブランチを作成しないこと」）。」
```

> ⚠️ **計画フェーズでTaskCreateしない。TaskCreateは実装フェーズのDEVが行う。**
> ⚠️ **計画フェーズはOpus 4.7で起動する。実装はSonnet 4.6で行う（次フェーズで再起動）。**

DEVから「実装方針承認・memory記録完了。Sonnetで再起動してください。」の報告が届いたら → ②b へ

---

### ②b DEV再起動（実装フェーズ・Sonnet 4.6）

DEVから計画完了の報告が届いたら、**新たにSonnet 4.6でDEVを起動する**。

**Agent TeamsでDEVを再起動（Sonnet 4.6）:**

```
1. 既存のDEV teammateを停止する（またはそのままにして新規起動する）。
2. developerタイプのteammateを Sonnet 4.6 モデルで起動する。
3. SendMessageでDEVに以下を伝える：
   「DEVモードで動いて。memory/dev/short_term.md を読んで実装方針を確認し、
   実装を開始してください。
   以下の3点は必ず実施してください：
   ① 作業開始時に `#20-sprint` の作業スレッドに投稿する
   ② 作業完了時に `#20-sprint` の作業スレッドに投稿する
   ③ レビュー指摘対応完了時に `#20-sprint` の作業スレッドに投稿する」
```

---

### ③ DEV完了報告の受け取り・reviewerの起動

DEVからSendMessageで「実装完了しました。ブランチ: [ブランチ名]」の報告が届いたら：

1. **ブランチ名をSendMessageの報告から取得する**
2. `#20-sprint` の作業スレッドでDEVの完了報告を確認する
3. **SMが変更ファイル一覧を事前取得する（reviewer起動前に必ず実施）：**

```bash
# 新規ブランチの場合
git diff main...[ブランチ名] --name-only

# 既存ブランチ継続の場合
git diff [sprint-start-commit]^...HEAD --name-only
```

> ⚠️ **convention-reviewerはWindows環境でgitコマンドを実行できない場合がある（Sprint 36で発生）。**
> SMが変更ファイル一覧を事前取得してreviewerの起動プロンプトに含めることで失敗を防ぐ。

4. **3つのreviewerを並列でteammateとして起動する：**

```
以下の3つをteammateとして並列起動する：
- convention-reviewerタイプのteammate
- security-reviewerタイプのteammate
- performance-reviewerタイプのteammate

各reviewerへのSendMessageで以下を伝える：

【新規ブランチの場合】
「DEVがコミットしたブランチ名: [ブランチ名]
git diff main...[ブランチ名] で変更内容を確認して、担当観点でレビューしてください。
変更ファイル一覧（git実行できない場合はReadツールで直接確認）:
- [ファイル1]
- [ファイル2]
...
結果を #20-sprint の作業スレッドに投稿してから、SendMessageでSMに報告してください。」

【既存ブランチへの追加改修の場合（前スプリントから同一ブランチを継続使用）】
「DEVがコミットしたブランチ名: [ブランチ名]
今スプリントのコミット範囲のみをレビューしてください。
手順: git log main...[ブランチ名] --oneline で今スプリントのコミット一覧を確認し、
最初のコミット（[sprint-start-commit]）を特定して、
git diff [sprint-start-commit]^...HEAD で変更内容を確認してください。
変更ファイル一覧（git実行できない場合はReadツールで直接確認）:
- [ファイル1]
- [ファイル2]
...
結果を #20-sprint の作業スレッドに投稿してから、SendMessageでSMに報告してください。」
```

> ⚠️ **既存ブランチ継続時は必ずコミット範囲を指定すること。**
> `git diff main...branch` は前スプリントの変更ファイルも含まれるため、reviewerがスコープ外ファイルを指摘するリスクがある（Sprint 20で発生）。

---

### ④ レビュー結果の集約・判断

3つのreviewerから全員の報告が届いたら：

1. 指摘内容を確認する
2. **既存ブランチ継続時は、指摘ファイルが今スプリントのコミット対象かを検証する：**
   - `git show --name-only --format="" [コミットハッシュ1] [コミットハッシュ2]...` で今スプリントの変更ファイル一覧を確認
   - 指摘ファイルが今スプリントのコミット対象外であれば、スコープ外として対応不要と判断する
3. **指摘がある場合 → DEVを再起動して修正依頼（⑤へ）**
4. **指摘がない場合 → PR作成（⑥へ）**

---

### ⑤ DEV再起動（指摘対応）

**Discord投稿（ログ用）:**
`#20-sprint` の作業スレッドにレビュー指摘をまとめて投稿する：

```
[SM] コードレビュー指摘まとめ

## 規約
- （指摘内容）

## セキュリティ
- （指摘内容）

## パフォーマンス
- （指摘内容）

DEVへ上記の指摘対応をお願いします。
```

**Agent TeamsでDEVを再起動:**

```
SendMessageでDEVに以下を伝える：
「コードレビューで指摘がありました。
[指摘内容のサマリー]
修正してコミットしてください。完了したらSendMessageで報告してください。」
```

→ DEVが修正完了報告を送ってきたら③に戻る（reviewerを再起動）

> ⚠️ **再レビュー後も必ず `#20-sprint` の作業スレッドにレビュー結果を投稿すること。**
> reviewerが全員「指摘なし」を確認してから ⑦ Sprint Reviewへ進む。
> 指摘対応後に再レビューを省いて完了としてはならない。

---

### ⑥ Pull Request作成

全レビュアー「指摘なし」確認後、**SMが直接 PR を作成する**（DEV再起動不要）。

> ⚠️ **既存ブランチ継続時（前スプリントから同一ブランチを使い続けている場合）は新規PRを作成しない。**
> 既存PRにコミットが自動追従しているため、既存PRのbodyをPATCHで更新してSprint N分の `closes` 行を追加する。

**【既存PRがある場合】bodyをPATCHで更新する：**

Write ツールで `C:/work/claude/pr_[リポジトリ]_[PR番号].json` に更新後のbody全体を書き出す：
```json
{
  "body": "[既存のbody全文]\ncloses ryokkon624/hw-hub-manage#N"
}
```

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/ryokkon624/hw-hub-[リポジトリ名]/pulls/[PR番号]" \
  --data-binary "@C:/work/claude/pr_[リポジトリ]_[PR番号].json"
```

既存PRのURLを `#20-sprint` の作業スレッドに投稿して ⑦ Sprint Reviewへ進む。

---

**【新規PRを作成する場合】ブランチが属するリポジトリのディレクトリで実行する：**

| ブランチのprefix例 | 実行ディレクトリ |
|---|---|
| フロントエンド変更 | `C:\work\hw-hub\hw-hub-frontend` |
| バックエンド変更 | `C:\work\hw-hub\hw-hub-backend` |

複数リポジトリにまたがる場合は、それぞれのリポジトリで同じ手順を実施する。

**gh が使える場合（推奨）:**

```bash
cd C:/work/hw-hub/hw-hub-[対象リポジトリ]
gh pr create \
  --title "[feat|fix|refactor]: [スプリントゴールの概要]" \
  --body "$(cat <<'EOF'
## Summary
[スプリントゴールの内容]

## Acceptance Criteria
- [AC一覧（sprint_backlog.md から転記）]

closes ryokkon624/hw-hub-manage#N
EOF
)"
```

**gh が使えない場合（curl で GitHub REST API を使う）:**

文字化け対策のため、PR本文は Write ツールで JSON ファイルに書き出してから curl で送る。

```bash
# Step 1: ブランチをリモートにプッシュ（まだしていない場合）
cd C:/work/hw-hub/hw-hub-[対象リポジトリ]
git push -u origin [ブランチ名]
```

Write ツールで `C:/work/claude/pr_XX.json` を作成する：
```json
{
  "title": "feat: [タイトル]",
  "head": "[ブランチ名]",
  "base": "main",
  "body": "## Summary\n...\n\ncloses ryokkon624/hw-hub-manage#N"
}
```

```bash
# Step 2: PR作成
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/ryokkon624/hw-hub-[リポジトリ名]/pulls" \
  --data-binary "@C:/work/claude/pr_XX.json"
```

レスポンスの `html_url` を PR URL として使用する。

> **【必須】** PR本文に `closes ryokkon624/hw-hub-manage#N` を含める（Issueごとに1行）。
> マージ時にGitHub Projects側のIssueが自動クローズされる。
> Issueが複数ある場合は `closes` を複数行記載する。

**PR作成後：**

- PR URLを `#20-sprint` の作業スレッドに投稿する：

```
[SM] Pull Request作成しました
PR: [URL]
```

→ ⑥b Sprint Review HTML生成へ進む

---

### ⑥b Sprint Review HTML生成

全レビュアー「指摘なし」確認・PR作成後、**DEVを起動してSprintレビュー用HTMLを生成する**。

**Agent TeamsでDEVを起動（Sonnet 4.6）:**

```
developerタイプのteammateを Sonnet 4.6 モデルで起動する。
SendMessageでDEVに以下を伝える：
「DEVモードで動いて。今スプリントの各IssueについてSprintレビュー用HTMLを生成してください。
`sprint-review-prep` スキルを参照して、以下のIssueのHTMLを生成し、
完了したらSendMessageでSMにファイルパスを報告してください。
- #N: [タイトル]（ラベル: feature / refactor / bug）
  スプリント番号: XX」
```

DEVからHTMLのファイルパス報告が届いたら → ⑦ Sprint Reviewへ進む

---

### ⑦ Sprint Review準備・停止

**`#30-sprint-review` に新スレッドを作成して以下を投稿する：**

```
[SM] Sprint XX Review

## スプリントゴール
〇〇

## AC達成状況
| AC | 内容 | 結果 |
|----|------|------|
| AC1 | 〇〇 | ✅ |

## コードレビュー結果
- 規約: 指摘なし / 指摘あり（対応済み）
- セキュリティ: 指摘なし
- パフォーマンス: 指摘なし

## Pull Request
[PR URL]

## Sprint Review ファイル
[backlog/sprint_XX/review-#N.html のパス一覧]

## りょこさんへ
Sprint Review ファイルをブラウザで開いて動作確認をお願いします。
指摘がある場合はこのスレッドにコメントをお願いします。
指摘対応は次のスプリントで実施します。
確認完了後、Claude Codeを再起動してRetroの指示をお願いします。
```

**ここでClaude Codeを停止して、りょこさんの確認を待つ。**

---

### ⑧ Retrospective（りょこさんの確認後）

りょこさんから「レトロを実施して」と指示が来たら：

1. `#30-sprint-review` のスレッドを確認してりょこさんの指摘内容を把握する

2. **DEVをteammateとして起動する（Sonnet 4.6）— SMの作業と並列で実施：**

   ```
   developerタイプのteammateを Sonnet 4.6 モデルで起動する。
   SendMessageでDEVに以下を伝える：
   「DEVモードで動いて。今スプリントのRetroとして以下を実施してください：
   ① memory/dev/short_term.md を読んで今スプリントの作業を振り返る
   ② memory/dev/long_term.md の該当セクションを更新する：
      - 繰り返し指摘されるパターン: 今スプリントの指摘で追加すべきパターンがあれば追記
      - 技術的なハマりポイント: 新たなハマりポイントがあれば追記
      - 習得したこと: 今スプリントで得た技術的洞察があれば追記
      - Skills更新履歴: 今スプリントで更新したSkillsがあれば追記
   ③ 以下のSkillsファイルについて、今スプリントの実装で気づいた追記・修正すべき内容があれば更新する：
      - mobile-conventions / frontend-conventions / backend-conventions など
      - 更新した場合は #skills-changelog に [DEV] プレフィックスで投稿する
   ④ memory/dev/short_term.md をリセット（「Sprint XX 完了。次スプリント開始時にリセット済み」）
   ⑤ 完了したらSendMessageでSMに報告してください。」
   ```

3. **SMは以下を並列で進める（DEVの完了を待たない）：**

4. **`#40-retrospective` に新スレッドを作成**してRetroを実施する：
   - 継続すること（Keep）
   - やめること（Stop）
   - 回避すること（Avoid）
   - チャレンジすること（Challenge）

5. りょこさんの指摘を GitHub REST API（curl）で `ryokkon624/hw-hub-manage` にIssueを作成する（`github-issues` スキル参照）
   - **起票前に必ず `mcp__github__list_issues`（state: open）で既存Issueのタイトルを確認し、同内容が存在しないことを確認してから起票する**（Sprint 34 Retroで2重起票が発生）
   - `github-issues` スキルの手順3に従い、Issue作成（Step 1）→ Projectsへの追加（Step 2）→ ReadyフィールドをDraftに設定（Step 3）まで**SMが行う**
   - Draft→Ready更新・Story Points設定はりょこさんが行う（SMは不要）

6. Skillsファイルの更新が必要かどうかを判断してSMとして更新する（DEVとの重複を避けるため、SM観点の更新に絞る）

   **【更新先の判断テーブル】**（公式ドキュメントに基づく）

   | 内容 | 更新先 | 判断ポイント |
   | ---- | ------ | ------------ |
   | チーム全体に毎セッション必要な短い事実・ルール | `CLAUDE.md` | 200行以内。長い手順は書かない |
   | トピック別・ファイルパス別の条件付きルール | `rules/` | パス条件があるか、トピック分離したいか |
   | ロール固有の多段階手順・参照ガイド | `skills/` | 手順書・チェックリスト・レビュー観点 |
   | エージェントのID・ツール・モデル定義 | `agents/` | 独立コンテキストで動く専門ロール |
   | Claude判断に依存せず確実に自動実行したい処理 | Hooks | "必ず実行" → Hooks、"できれば実行" → CLAUDE.md |
   | 今スプリント限りの作業メモ | `short_term.md` | Retro完了後リセット |
   | 繰り返しパターン・永続的な教訓 | `long_term.md` | Retroフェーズで更新 |

7. 更新内容を `#skills-changelog` に `[SM]` プレフィックスで投稿する

8. **DEVからの完了報告を受け取る**

9. **`memory/sm/long_term.md` を新形式に沿って更新する：**
   - **スプリント進行パターン**: 今スプリントで有効だった判断パターン・見直すべき手順があれば追記
   - **DEVレビュー指摘の傾向**: 今スプリントの指摘パターンを追記（繰り返し発生しているか確認）
   - **Sprint Reviewで発覚しやすいパターン**: 新たなパターンがあれば追記
   - **Skills更新履歴**: 今スプリントのSM・DEVによる更新を追記
   - 追加・変更のないセクションは更新不要

10. **`memory/sm/short_term.md` をリセット**（「Sprint XX 完了。次スプリント開始時にリセット済み」）

---

## チャレンジの判断基準

以下の条件を満たす場合、Planningでチャレンジとして提案する：

- Claudeの新しいモデルやバージョンがリリースされている
- 現在のSkillsに「手動でやっている作業」があり、自動化できそう
- 前スプリントで「もっとうまくできた」と感じた作業がある

チャレンジの結果はレトロでSkillsに反映する。
うまくいった → Skillsに追加
うまくいかなかった → Skillsに「やらない理由」を記録

---

## 記憶ファイルの管理

| ファイル                  | 内容                                           | 更新タイミング   |
| ------------------------- | ---------------------------------------------- | ---------------- |
| `memory/sm/short_term.md` | 今スプリントの進捗・ブロッカー・チャレンジ項目 | スプリント中随時 |
| `memory/sm/long_term.md`  | スプリント進行パターン / DEVレビュー指摘傾向 / Sprint Reviewで発覚しやすいパターン / Skills更新履歴 | **Retro ⑨**（DEV完了後にSMが更新） |

---

## Skillsの更新ルール

- スプリントのレトロで「このSkillに追加・削除すべきことがあるか」を判断する
- 更新した場合は `#skills-changelog` に変更内容、理由、スプリント番号を投稿する
