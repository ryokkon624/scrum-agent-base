# SM 長期記憶

**最終更新**: 2026-04-13

---

## スプリント履歴

| スプリント | ゴール | 達成度 | 主な学び |
|-----------|--------|--------|---------|
| Sprint 01 | Landing Page公開・初訪問ユーザーの導線完成 | ✅ 全AC達成（AC1〜AC8） | ForumチャンネルにはCreate_forum_postが必要。Planningの未決事項はスプリント前にクリアする |
| Sprint 02 | Landing Page多言語対応・/振り分け完成 | ✅ 全AC達成（PBI-002/003/004） | Planningで事前確認をDEVに依頼すると実装がスムーズ。PRレビュー・スタンドアップは必須プロセス化が必要 |
| Sprint 03 | 「おうちの様子」タスク件数の集計バグ修正 | ✅ 全AC達成（PBI-005） | 1行修正でクリーンに完了。GitルールはPR不要・コミットまでに確定。キャッシュ制御（force: true/false）の不統一に注意 |
| Sprint 04 | ホーム画面件数誤表示バグ修正 + APIデータ絞り込み | ✅ 全AC達成（PBI-006/007/008 全10AC） | Agent Teams連携（sprint04チーム）を初運用して成功。Promise.all並列fetchによるstore上書き問題はcacheByKeyから直接参照することで解消 |

---

## チャレンジ結果ログ

| スプリント | チャレンジ内容 | 結果 | Skillsへの反映 |
|-----------|--------------|------|--------------|
| Sprint 01 | Claudeモデル最新バージョン確認（claude-sonnet-4-6） | 継続中（現時点で最新） | 次Planning時に再確認 |
| Sprint 02 | PRレビューフロー試行 | ❌ 未実施（2スプリント連続） | v1.4.0で必須プロセスに格上げ |
| Sprint 02 | スタンドアップ実施 | ❌ 未実施（2スプリント連続） | v1.4.0でPlanning手順に追加 |
| Sprint 03 | PRレビューフロー | ⚠️ りょこさん指示によりスキップ確定（PR不要・コミットまで） | Gitルールとして確定 |
| Sprint 03 | Agent Teams連携（webhook廃止） | 🔄 Skills v1.6.0で方針更新済み、次スプリントで本格運用 | scrum_master.md v1.6.0に反映済み |
| Sprint 04 | Agent Teams連携の本格運用 | ✅ TeamCreate + SendMessage による DEV 起動・完了報告受信が正常動作 | 今後のスタンダードとして継続 |

---

## プロセス改善ログ

### Keep（継続すること）
- ACを1件ずつ実装コードと照合する品質チェック（Sprint 01〜）
- POへの質問ログをmemory/po/short_term.mdに記録する（Sprint 01〜）
- ハマりポイントをmemory/dev/short_term.mdに記録する（Sprint 01〜）
- Planningで事前確認事項をDEVに依頼する（Sprint 02〜）
- 既存コンポーネントの流用方針（Sprint 02〜）
- バグPBIには原因調査結果を記載してDEVに渡す（Sprint 03〜）

### Stop（やめること）
- Discordチャンネルタイプを確認せずにsendを試みること（Sprint 01）
- Planningの未決事項をそのままスプリントに持ち込むこと（Sprint 01）
- スタンドアップを実施しないこと（Sprint 02 → v1.4.0で対処）
- PRレビューをチャレンジ項目に留めること（Sprint 02 → Sprint 03でりょこさん指示により確定）

### Avoid（回避すること）
- コンテキスト制限近くで同一ファイルへのWrite操作を繰り返すこと（Sprint 01）
- バックログの未更新を後回しにしてスプリントを進めること（Sprint 01）
- チャレンジ項目を毎スプリント持ち越し続けること（Sprint 02）
- キャッシュ制御（force: true/false）の不統一（Sprint 03 → 今後のDEVレビューで注意）

### Challenge（次に試すこと）
- Agent Teams連携の本格運用（次スプリントから）
- Claudeモデルの最新バージョン確認（Planning時に確認、現在: claude-sonnet-4-6）
