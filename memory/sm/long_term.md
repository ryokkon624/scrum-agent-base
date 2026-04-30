# SM 長期記憶

**最終更新**: 2026-04-29

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
| Sprint 08  | セキュリティ脆弱性の修正とAPIドキュメントの整備   | ✅ 全AC達成（#20/#22 全5AC）          | reviewerが「指摘なし」時も観点別確認結果の投稿が必要→reviewer 3ファイルv1.2.0。DEVがbugPBIで実装方針の選択理由を記載していなかった→developer.md v1.11.0で「改修方針」に選択理由必須化。reviewer Discord投稿不可が3スプリント連続。 |
| Sprint 09  | SP版ヘッダーの視認性改善とUIボタン配置の統一      | ✅ 全AC達成（#23/#24 全10AC）         | SMが作業スレッドをIssueごとに作成→DEV #24着手遅延→scrum-master-workflow v1.1.0で1スプリント1スレッド制約を明記。SM・DEVの投稿にプレフィックス欠如（reviewerは順守）→developer-workflow v1.1.0で[DEV]プレフィックス必須化。指摘対応後の再レビューを省略→scrum-master-workflow v1.1.0で再レビュー必須化を明記。 |
| Sprint 10  | storeカプセル化とAPI URL統一によるフロントエンド・バックエンドのコード品質向上 | ✅ 全AC達成（#28・#31 全8AC） | 横展開確認でスコープ外問題（cacheByKey #32）を即Issue化。Opus 4.7（計画）+Sonnet 4.6（実装）の2フェーズモデル導入。reviewerのDiscord投稿問題をskillsパス移動+tools追加で根本解決。DEVのTaskCreate詳細化（承認後に自分でCreate）。 |
| Sprint 11  | フロントエンドstore設計とUI導線の品質向上：storeカプセル化の完結とおうち未所属ユーザーへのガイド導線整備 | ✅ 全AC達成（#32・#3 全10AC） | developer.md tools に TaskCreate/TaskUpdate/SendMessage/Edit/Write/Bash を追加（Opus DEV がTaskCreate不可の問題解消）。reviewer 3ファイルにgit diffスコープ外ファイルを読まない制約を追加（フォルスポジティブ防止）。reviewer の Discord投稿問題は未解決（enabledMcpjsonServersの設定が原因と推定 → Sprint 12チャレンジ）。 |
| Sprint 12  | SP版買い物リスト画面のタブ化とユーザアイコンフォールバック対応でSPユーザー体験を向上する | ✅ 全AC達成（#34: 7AC / #33: 3AC）Sprint Reviewりょこさん指摘なし | DEVのbugPBI改修方針選択理由記載チャレンジ達成（#33 fix PBIで確認）。convention-reviewerがgit checkoutできないブロッカー発生→git diffで代替解決→convention-reviewer.md v1.3.0にgit checkout禁止・フォールバック手順を追記。reviewerのDiscord投稿問題が4スプリント連続持ち越し（Sprint 13で必ず根本解決する）。 |
| Sprint 13  | 買い物リスト画面にスワイプジェスチャーを導入して、スマートフォンの片手操作体験を向上させる | ✅ 全AC達成（#42: 7AC）Sprint Reviewでりょこさん指摘1件（購入済み左スワイプの背景アイコン不要→Issue #45起票） | reviewerのDiscord投稿問題が全3観点で解消（5スプリントぶり。根本原因は特定できず）。DEVがコミット後にpushを忘れSMがカバー→developer-workflowにpush手順追記。gh不在でcurl+REST APIでPR作成→scrum-master-workflowのPR作成手順⑥にcurl代替を追記。 |

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
| Sprint 07  | DEVのDiscord投稿を仕組みで担保                      | ✅ developer.md v1.10.0冒頭⚠️追加・scrum_master.md v1.12.0起動メッセージに明示指示追加 | Sprint 08で効果確認→作業開始・完了投稿が定着        |
| Sprint 08  | reviewer「指摘なし」時の観点詳細投稿                | ✅ Sprint 09で全3観点が詳細フォーマットで投稿された | convention/security/performance-reviewer.md v1.2.0 |
| Sprint 08  | DEVのbugPBI改修方針に選択理由・トレードオフ必須化   | 🔄 Sprint 09はbugPBIなし・未検証。Sprint 10へ持ち越し | developer.md v1.11.0                               |
| Sprint 09  | 1スプリント1作業スレッド制約の明記                  | ✅ scrum-master-workflow v1.1.0で② DEV起動に⚠️として追記 | scrum-master-workflow v1.1.0 |
| Sprint 09  | SM・DEV投稿への役割プレフィックス必須化             | ✅ developer-workflow v1.1.0で⚠️必須事項に`[DEV]`プレフィックス追記 | developer-workflow v1.1.0 |
| Sprint 09  | 指摘対応後の再レビュー必須化                        | ✅ scrum-master-workflow v1.1.0で⑤ DEV再起動後に再レビュー必須を明記 | scrum-master-workflow v1.1.0 |
| Sprint 10  | Opus 4.7でDEV起動（計画フェーズ）                   | ✅ 有効性確認。計画品質向上とコスト最適化を両立 | scrum-master-workflow v1.2.0 / developer-workflow v1.2.0 |
| Sprint 10  | DEVのbugPBI改修方針に選択理由記載                   | 🔄 Sprint 09・10・11共にbugPBIなし・未検証 | Sprint 12へ持ち越し |
| Sprint 11  | developer.mdのtools:にTaskCreate/TaskUpdate/SendMessageを追加 | ✅ Opus DEV のTaskCreate不可問題を解消 | developer.md tools フィールド更新 |
| Sprint 11  | reviewer 3ファイルにgit diffスコープ制限を明記       | ✅ フォルスポジティブ防止の仕組みを構築 | convention/security/performance-reviewer.md 更新 |
| Sprint 11  | reviewerのDiscord投稿root cause調査                  | 🔄 enabledMcpjsonServers設定が原因と推定。Sprint 12へ持ち越し | - |
| Sprint 12  | DEVのbugPBI改修方針に選択理由記載（#33で検証）       | ✅ fix PBIで選択理由記載を確認。Sprint 09〜12の4スプリント継続チャレンジが達成 | developer.md v1.11.0（記録済み）として定着確認 |
| Sprint 12  | convention-reviewer.mdにgit checkout禁止・フォールバック手順追加 | ✅ ブロッカー再発防止として手順明文化 | convention-reviewer.md v1.3.0 |
| Sprint 12  | reviewerのDiscord投稿root cause調査                  | ❌ 未調査のまま4スプリント連続持ち越し。Sprint 13で必ず根本解決する | - |
| Sprint 13  | reviewerのDiscord投稿問題の解消（最優先）             | ✅ 全3観点のreviewerがDiscord投稿に成功（初回・再レビュー両方）。根本原因は不明だが実害解消。継続監視する | - |
| Sprint 13  | gh不在時のcurl代替PR作成手順整備                      | ✅ scrum-master-workflow⑥にWrite+curl手順を追記 | scrum-master-workflow ⑥更新 |
| Sprint 13  | DEVコミット後のpush手順をworkflowに明記               | ✅ developer-workflowの作業完了時手順4にpush追加 | developer-workflow 更新 |

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
- reviewerがDiscord投稿できない場合のSMによる代理投稿（Sprint 08〜）
- 横展開確認でスコープ外問題を即Issue化する判断（Sprint 10〜）
- Opus 4.7（計画フェーズ）+ Sonnet 4.6（実装フェーズ）の2フェーズモデル（Sprint 10〜）
- DEVが実装方針承認後に自分でTaskCreateする（Sprint 10〜）
- SMがreviewerのgit diff外ファイル指摘をgit diffコマンドで検証してから受け入れる（Sprint 11〜）
- DEVのbugPBI改修方針に選択理由・トレードオフを記載する（Sprint 12〜 定着確認）

### Stop（やめること）

- Discordチャンネルタイプを確認せずにsendを試みること（Sprint 01）
- Planningの未決事項をそのままスプリントに持ち込むこと（Sprint 01）
- PRレビューをチャレンジ項目に留めること（Sprint 02 → Sprint 03でりょこさん指示により確定）
- コメントのみの変更に `fix:` プレフィックスを使うこと（Sprint 05 → `style:` を使う）
- DEVがDiscord投稿（作業開始・完了・レビュー指摘対応）を省くこと（Sprint 06〜07 2スプリント連続 → developer.md v1.10.0で冒頭⚠️として強調・SM起動メッセージに明示追加 → Sprint 08で定着確認）
- reviewerがレビュー結果を`#20-sprint`に投稿しないこと（Sprint 06 → reviewer Skills v1.1.0に投稿ルールを明記）
- reviewerが「指摘なし」の場合にシンプルな1行報告で済ませること（Sprint 08 → reviewer v1.2.0で観点別確認結果フォーマットを追加）
- DEVがbugPBIで実装方針の選択理由を省いて報告すること（Sprint 08 → developer.md v1.11.0で「改修方針」に選択理由必須化）
- reviewerが別ブランチで修正済みのファイルをdiff外と判定せずに指摘すること（Sprint 11 → reviewer 3ファイルにgit diffスコープ制限を明記）
- convention-reviewerが `git checkout` でブランチを切り替えようとしてレビュー未完了になること（Sprint 12 → convention-reviewer.md v1.3.0でgit checkout禁止・フォールバック手順を明記）

### Avoid（回避すること）

- コンテキスト制限近くで同一ファイルへのWrite操作を繰り返すこと（Sprint 01）
- バックログの未更新を後回しにしてスプリントを進めること（Sprint 01）
- チャレンジ項目を毎スプリント持ち越し続けること（Sprint 02）
- キャッシュ制御（force: true/false）の不統一（Sprint 03 → 今後のDEVレビューで注意）
- format未実施のままコミットすること（Sprint 05 → developer.md v1.8.0でルール化）
- UTコードを放置したまま機能実装を完了とすること（Sprint 05 → Issue#15で対応予定）
- API追加・変更時にapi_integration.md等のドキュメント更新を省くこと（Sprint 06・07と2スプリント連続 → Issue#22で対応済み）
- reviewerがDiscord投稿できない問題が連続スプリントになること（Sprint 06〜12で問題継続 → Sprint 13で解消確認。継続監視）
- SMがIssueごとにスレッドを分割してDEV着手遅延を招くこと（Sprint 09 → scrum-master-workflow v1.1.0で制約明記）
- SM・DEVが投稿プレフィックスを省くこと（Sprint 09 → developer-workflow v1.1.0で必須化）
- 指摘対応後の再レビューを省いてSprintReviewに進むこと（Sprint 09 → scrum-master-workflow v1.1.0で必須化）
- DEVがコミット後にgit pushを忘れること（Sprint 13 → developer-workflow に push 手順を追記）

### Challenge（次に試すこと）

- Claudeモデルの最新バージョン確認（Planning時に確認、現在: claude-sonnet-4-6 / Opus 4.7）
- reviewerのDiscord投稿問題: Sprint 13で全員投稿成功。継続監視する（根本原因は未特定）
