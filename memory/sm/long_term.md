# SM 長期記憶

**最終更新**: 2026-04-13

---

## スプリント履歴

| スプリント | ゴール                                            | 達成度                                | 主な学び                                                                                                                                                                              |
| ---------- | ------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sprint 01  | Landing Page公開・初訪問ユーザーの導線完成        | ✅ 全AC達成（AC1〜AC8）               | ForumチャンネルにはCreate_forum_postが必要。Planningの未決事項はスプリント前にクリアする                                                                                              |
| Sprint 02  | Landing Page多言語対応・/振り分け完成             | ✅ 全AC達成（PBI-002/003/004）        | Planningで事前確認をDEVに依頼すると実装がスムーズ。PRレビュー・スタンドアップは必須プロセス化が必要                                                                                   |
| Sprint 03  | 「おうちの様子」タスク件数の集計バグ修正          | ✅ 全AC達成（PBI-005）                | 1行修正でクリーンに完了。GitルールはPR不要・コミットまでに確定。キャッシュ制御（force: true/false）の不統一に注意                                                                     |
| Sprint 04  | ホーム画面件数誤表示バグ修正 + APIデータ絞り込み  | ✅ 全AC達成（PBI-006/007/008 全10AC） | Agent Teams連携（sprint04チーム）を初運用して成功。Promise.all並列fetchによるstore上書き問題はcacheByKeyから直接参照することで解消                                                    |
| Sprint 05  | 家事テンプレートi18n対応 + 買い物アイテム削除機能 | ✅ 全AC達成（#10/#12 全9AC）          | コミットプレフィックスのstyle:使い分けを認識。format未実施コミットが発生→ルール化。DEV起動前のTaskCreateが漏れていた→必須化。UTコード整備が未対応（Issue#15で次スプリント以降に対応） |
| Sprint 06  | lightbulbアイコン復元・UTコード整備・レビュー観点追加 | ✅ 全AC達成（#16/#15 全6AC）       | DEVがDiscord投稿（作業開始・完了・レビュー指摘対応）を省いた。reviewerもDiscord投稿せずSMがフォロー。reviewer Skillsに投稿ルールがなかった→3ファイルv1.1.0に追加。API追加時のdoc更新漏れ検知（Issue#17）。 |
| Sprint 07  | APIドキュメント整備・パフォーマンス改善・SP版UI修正 | ✅ 全AC達成（#17/#18/#19 全7AC）  | DEVのDiscord投稿漏れが2スプリント連続→developer.md冒頭に⚠️必須事項追加・SMの起動メッセージに明示指示追加。新規API追加時のdoc更新漏れ再発（bulk-status→Issue#22）。MyBatisキャッシュで認可SQL重複は実害なし確認。 |

---

## チャレンジ結果ログ

| スプリント | チャレンジ内容                                      | 結果                                                                | Skillsへの反映                                              |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| Sprint 01  | Claudeモデル最新バージョン確認（claude-sonnet-4-6） | 継続中（現時点で最新）                                              | 次Planning時に再確認                                        |
| Sprint 02  | PRレビューフロー試行                                | ❌ 未実施（2スプリント連続）                                        | v1.4.0で必須プロセスに格上げ                                |
| Sprint 02  | スタンドアップ実施                                  | ❌ 未実施（2スプリント連続）                                        | v1.4.0でPlanning手順に追加                                  |
| Sprint 03  | PRレビューフロー                                    | ⚠️ りょこさん指示によりスキップ確定（PR不要・コミットまで）         | Gitルールとして確定                                         |
| Sprint 03  | Agent Teams連携（webhook廃止）                      | 🔄 Skills v1.6.0で方針更新済み、次スプリントで本格運用              | scrum_master.md v1.6.0に反映済み                            |
| Sprint 04  | Agent Teams連携の本格運用                           | ✅ TeamCreate + SendMessage による DEV 起動・完了報告受信が正常動作 | 今後のスタンダードとして継続                                |
| Sprint 05  | コミット前format自動実行ルール化                    | ✅ developer.md v1.8.0 に format コマンド必須ルールとして追加       | frontend: npm run format / backend: ./gradlew spotlessApply |
| Sprint 05  | DEV起動前のTaskCreate必須化                         | ✅ scrum_master.md v1.10.0 に反映。reviewer起動と統一               | 今後のスタンダードとして継続                                |
| Sprint 06  | reviewerのDiscord投稿ルール明記                     | ✅ convention/security/performance-reviewer.md v1.1.0 に報告手順を追加 | 今後のスタンダードとして継続                             |
| Sprint 07  | DEVのDiscord投稿を仕組みで担保                      | ✅ developer.md v1.10.0冒頭⚠️追加・scrum_master.md v1.12.0起動メッセージに明示指示追加 | 次スプリントで効果を検証                 |

---

## プロセス改善ログ

### Keep（継続すること）

- ACを1件ずつ実装コードと照合する品質チェック（Sprint 01〜）
- POへの質問ログをmemory/po/short_term.mdに記録する（Sprint 01〜）
- ハマりポイントをmemory/dev/short_term.mdに記録する（Sprint 01〜）
- Planningで事前確認事項をDEVに依頼する（Sprint 02〜）
- 既存コンポーネントの流用方針（Sprint 02〜）
- バグPBIには原因調査結果を記載してDEVに渡す（Sprint 03〜）
- 3観点レビュー（規約・セキュリティ・パフォーマンス）の並列実施（Sprint 05〜 定着確認）
- Agent Teams連携（TeamCreate + SendMessage）（Sprint 04〜）

### Stop（やめること）

- Discordチャンネルタイプを確認せずにsendを試みること（Sprint 01）
- Planningの未決事項をそのままスプリントに持ち込むこと（Sprint 01）
- PRレビューをチャレンジ項目に留めること（Sprint 02 → Sprint 03でりょこさん指示により確定）
- コメントのみの変更に `fix:` プレフィックスを使うこと（Sprint 05 → `style:` を使う）
- DEVがDiscord投稿（作業開始・完了・レビュー指摘対応）を省くこと（Sprint 06〜07 2スプリント連続 → developer.md v1.10.0で冒頭⚠️として強調・SM起動メッセージに明示追加）
- reviewerがレビュー結果を`#20-sprint`に投稿しないこと（Sprint 06 → reviewer Skills v1.1.0に投稿ルールを明記）

### Avoid（回避すること）

- コンテキスト制限近くで同一ファイルへのWrite操作を繰り返すこと（Sprint 01）
- バックログの未更新を後回しにしてスプリントを進めること（Sprint 01）
- チャレンジ項目を毎スプリント持ち越し続けること（Sprint 02）
- キャッシュ制御（force: true/false）の不統一（Sprint 03 → 今後のDEVレビューで注意）
- format未実施のままコミットすること（Sprint 05 → developer.md v1.8.0でルール化）
- UTコードを放置したまま機能実装を完了とすること（Sprint 05 → Issue#15で対応予定）
- API追加・変更時にapi_integration.md等のドキュメント更新を省くこと（Sprint 06・07と2スプリント連続 → Issue#22で対応予定・AC化を検討）

### Challenge（次に試すこと）

- api_integration.md更新をDEVの完了チェックリストに組み込む（バックログのAC化を検討）
- Claudeモデルの最新バージョン確認（Planning時に確認、現在: claude-sonnet-4-6）
