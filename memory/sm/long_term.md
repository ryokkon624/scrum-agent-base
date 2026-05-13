# SM 長期記憶

**最終更新**: 2026-05-12（Sprint 27 Retro後）

---

## スプリント履歴

| スプリント | ゴール                                                                                                         | 達成度                                                                                                        | 主な学び                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sprint 01  | Landing Page公開・初訪問ユーザーの導線完成                                                                     | ✅ 全AC達成（AC1〜AC8）                                                                                       | ForumチャンネルにはCreate_forum_postが必要。Planningの未決事項はスプリント前にクリアする                                                                                                                                                                                                                                    |
| Sprint 02  | Landing Page多言語対応・/振り分け完成                                                                          | ✅ 全AC達成（PBI-002/003/004）                                                                                | Planningで事前確認をDEVに依頼すると実装がスムーズ。PRレビュー・スタンドアップは必須プロセス化が必要                                                                                                                                                                                                                         |
| Sprint 03  | 「おうちの様子」タスク件数の集計バグ修正                                                                       | ✅ 全AC達成（PBI-005）                                                                                        | 1行修正でクリーンに完了。GitルールはPR不要・コミットまでに確定。キャッシュ制御（force: true/false）の不統一に注意                                                                                                                                                                                                           |
| Sprint 04  | ホーム画面件数誤表示バグ修正 + APIデータ絞り込み                                                               | ✅ 全AC達成（PBI-006/007/008 全10AC）                                                                         | Agent Teams連携（sprint04チーム）を初運用して成功。Promise.all並列fetchによるstore上書き問題はcacheByKeyから直接参照することで解消                                                                                                                                                                                          |
| Sprint 05  | 家事テンプレートi18n対応 + 買い物アイテム削除機能                                                              | ✅ 全AC達成（#10/#12 全9AC）                                                                                  | コミットプレフィックスのstyle:使い分けを認識。format未実施コミットが発生→ルール化。DEV起動前のTaskCreateが漏れていた→必須化。UTコード整備が未対応（Issue#15で次スプリント以降に対応）                                                                                                                                       |
| Sprint 06  | lightbulbアイコン復元・UTコード整備・レビュー観点追加                                                          | ✅ 全AC達成（#16/#15 全6AC）                                                                                  | DEVがDiscord投稿（作業開始・完了・レビュー指摘対応）を省いた。reviewerもDiscord投稿せずSMがフォロー。reviewer Skillsに投稿ルールがなかった→3ファイルv1.1.0に追加。API追加時のdoc更新漏れ検知（Issue#17）。                                                                                                                  |
| Sprint 07  | APIドキュメント整備・パフォーマンス改善・SP版UI修正                                                            | ✅ 全AC達成（#17/#18/#19 全7AC）                                                                              | DEVのDiscord投稿漏れが2スプリント連続→developer.md冒頭に⚠️必須事項追加・SMの起動メッセージに明示指示追加。新規API追加時のdoc更新漏れ再発（bulk-status→Issue#22）。MyBatisキャッシュで認可SQL重複は実害なし確認。                                                                                                            |
| Sprint 08  | セキュリティ脆弱性の修正とAPIドキュメントの整備                                                                | ✅ 全AC達成（#20/#22 全5AC）                                                                                  | reviewerが「指摘なし」時も観点別確認結果の投稿が必要→reviewer 3ファイルv1.2.0。DEVがbugPBIで実装方針の選択理由を記載していなかった→developer.md v1.11.0で「改修方針」に選択理由必須化。reviewer Discord投稿不可が3スプリント連続。                                                                                          |
| Sprint 09  | SP版ヘッダーの視認性改善とUIボタン配置の統一                                                                   | ✅ 全AC達成（#23/#24 全10AC）                                                                                 | SMが作業スレッドをIssueごとに作成→DEV #24着手遅延→scrum-master-workflow v1.1.0で1スプリント1スレッド制約を明記。SM・DEVの投稿にプレフィックス欠如（reviewerは順守）→developer-workflow v1.1.0で[DEV]プレフィックス必須化。指摘対応後の再レビューを省略→scrum-master-workflow v1.1.0で再レビュー必須化を明記。               |
| Sprint 10  | storeカプセル化とAPI URL統一によるフロントエンド・バックエンドのコード品質向上                                 | ✅ 全AC達成（#28・#31 全8AC）                                                                                 | 横展開確認でスコープ外問題（cacheByKey #32）を即Issue化。Opus 4.7（計画）+Sonnet 4.6（実装）の2フェーズモデル導入。reviewerのDiscord投稿問題をskillsパス移動+tools追加で根本解決。DEVのTaskCreate詳細化（承認後に自分でCreate）。                                                                                           |
| Sprint 11  | フロントエンドstore設計とUI導線の品質向上：storeカプセル化の完結とおうち未所属ユーザーへのガイド導線整備       | ✅ 全AC達成（#32・#3 全10AC）                                                                                 | developer.md tools に TaskCreate/TaskUpdate/SendMessage/Edit/Write/Bash を追加（Opus DEV がTaskCreate不可の問題解消）。reviewer 3ファイルにgit diffスコープ外ファイルを読まない制約を追加（フォルスポジティブ防止）。reviewer の Discord投稿問題は未解決（enabledMcpjsonServersの設定が原因と推定 → Sprint 12チャレンジ）。 |
| Sprint 12  | SP版買い物リスト画面のタブ化とユーザアイコンフォールバック対応でSPユーザー体験を向上する                       | ✅ 全AC達成（#34: 7AC / #33: 3AC）Sprint Reviewりょこさん指摘なし                                             | DEVのbugPBI改修方針選択理由記載チャレンジ達成（#33 fix PBIで確認）。convention-reviewerがgit checkoutできないブロッカー発生→git diffで代替解決→convention-reviewer.md v1.3.0にgit checkout禁止・フォールバック手順を追記。reviewerのDiscord投稿問題が4スプリント連続持ち越し（Sprint 13で必ず根本解決する）。               |
| Sprint 13  | 買い物リスト画面にスワイプジェスチャーを導入して、スマートフォンの片手操作体験を向上させる                     | ✅ 全AC達成（#42: 7AC）Sprint Reviewでりょこさん指摘1件（購入済み左スワイプの背景アイコン不要→Issue #45起票） | reviewerのDiscord投稿問題が全3観点で解消（5スプリントぶり。根本原因は特定できず）。DEVがコミット後にpushを忘れSMがカバー→developer-workflowにpush手順追記。gh不在でcurl+REST APIでPR作成→scrum-master-workflowのPR作成手順⑥にcurl代替を追記。                                                                               |
| Sprint 14  | スケルトンスクリーン導入とスワイプUX修正で、主要画面のローディング体験とスワイプ操作の視覚的一貫性を向上させる | ✅ 全AC達成（#45: 2AC / #44: 5AC）Sprint Reviewりょこさん指摘なし                                             | パフォーマンスレビューが有効に機能（不要computedの削除・memberMapのO(1)改善）。GraphQL APIでSprintフィールドを使いりょこさんに聞かずにIssue特定できることを確認→scrum-master-workflow手順①に追記。reviewer Discord投稿が3スプリント連続成功。                                                                               |
| Sprint 15  | SP版のスワイプ体験を統一・改善する                                                                             | ✅ 全AC達成（#48: 4AC / #49: 3AC）Sprint Reviewりょこさん指摘なし                                             | DEVが仕様の懸念点（スキップ時window.prompt有無）を自ら提起して方針確定・別Issue化まで整理できた。convention-reviewerタイムアウトが1回発生したが即再起動で解決。reviewer Discord投稿が4スプリント連続成功。Retro後: 計画フェーズTaskCreate廃止（案A採用）・sprint_backlog.mdにIssue Body全体転記の2件をスキル更新。          |
| Sprint 16  | SP版の家事割り当て画面でスワイプ操作による直感的な担当変更体験を実現する                                       | ✅ 全AC達成（#47: 6AC）Sprint Reviewりょこさん指摘なし                                                        | Sprint15で作ったSwipeableTaskCard.vueの構造・useSwipeGestureをそのまま流用でき効率的に実装。convention-reviewerがaltのi18n未統一（既存コード `t('assign.avatarAlt')` vs 新規 `alt="icon"`）を検出→対応済み。reviewer Discord投稿が5スプリント連続成功。Skillsの更新なし。                                                   |
| Sprint 17  | @CurrentUserId アノテーションとArgumentResolverを実装し、全ControllerのユーザーID取得コードをシンプル化する      | ✅ 全AC達成（#41: 4AC / 1018テスト全グリーン）Sprint Reviewりょこさん指摘なし                                  | 横断的リファクタリングでUserController.changePasswordの置き換え漏れが発生→convention-reviewerが検出・対応済み。developer-workflowにgrep残存確認を追加。security-reviewerがdeleteHouseworkの認可チェック欠如（既存問題）を発見→Issue #50起票。reviewer Discord投稿が6スプリント連続成功。 |
| Sprint 18  | ダークモード対応を完成させ、システム設定連動と手動切り替えを両立した快適な夜間利用体験を実現する                 | ✅ 全AC達成（#43: 4AC / 622テスト全グリーン）Sprint Reviewりょこさん指摘なし                                   | りょこさんが色定義を事前にmain.cssで確定済みで渡してくれたことでDEVが色検討不要で実装に集中できた。大規模色置換はスコープを主要レイアウト/ページコンテナ/モーダルに絞り、残存94箇所/34ファイルをgrep集計して別Issue（#51）化する有効フローを確立。convention-reviewerがSMへのSendMessageで内容を送らずidle通知のみになったがDiscord投稿は成功（実害なし、継続監視）。reviewer Discord投稿が7スプリント連続成功。 |
| Sprint 19  | 残存する生Tailwindカラークラスをカラートークンに完全移行し、ダークモードを全画面で一貫させる                       | ✅ 全AC達成（#51: 4AC）Sprint Review りょこさん指摘1件（OnboardingCardのダークモード対応漏れ→bug Issue #53起票） | 大規模CSS置換でgrepのみに頼った確認では全コンポーネントの漏れが発生する（OnboardingCard）。reviewer Discord投稿が8スプリント連続成功。 |
| Sprint 20  | OnboardingCardのダークモード対応漏れを修正し、設定画面の意味的カラークラスをカラートークン化することで、ダークモードの全画面一貫体験を完成させる | ✅ 全AC達成（#53: 2AC / #52: 4AC）Sprint Reviewりょこさん指摘なし | 既存ブランチへの追加改修時に `git diff main...branch` でreviewerに指示すると前スプリントのファイルも含まれスコープ外指摘が発生（convention-reviewerが4件誤指摘）。コミット範囲指定（`git diff <sprint-start-commit>^...HEAD`）で解決。scrum-master-workflow③④を更新。reviewer Discord投稿が9スプリント連続成功。 |
| Sprint 21  | ダークモード設定のDB永続化によるマルチデバイス体験向上と、deleteHouseworkエンドポイントのセキュリティ修正（認可チェック追加または廃止）を実現する | ✅ 全AC達成（#54: 7AC / #50: 5AC）Sprint Review指摘1件（フロントの未使用deleteHousework関連コード削除→Issue #55起票） | mybatisGenerator実行時に既存XMLを削除せずに実行したため全22 Mapper XMLに定義が重複しSpring Boot起動不可になった。`database.md` に手順はあったが、developer-workflowのコミット前チェックリストにも追記。reviewer Discord投稿が10スプリント連続成功。convention-reviewerが5ラウンドの指摘（userApi.spec.tsテスト不足・テスト名誤り・ThemeModeSpec未作成・UserConverterSpec不足・thrown型不正確）を全件検出して対応済み。 |
| Sprint 22  | アナウンスバナー機能を追加し、DBスキーマ整備・バックエンドAPI実装・フロントエンドUI実装を完了させ、システム管理者が重要なお知らせをユーザーに周知できる基盤を構築する | ✅ 全AC達成（#56: 10AC）Sprint Review指摘4件（m_announcement重複→りょこさん対応済み / severity定数化→Issue #58 / AnnouncementScope定数化→Issue #59 / featureScope子ルート未設定→Issue #60） | flyway migrateで既存テーブルm_announcementと重複エラーが発生。DEVがSMに報告せず自己判断で対処しようとした→developer-workflowにブロッカー＝予期せぬエラーはSM報告必須を明記。convention-reviewerがisExpanded getter化・generateEnums未使用を検出。performance-reviewerがLIMIT句・isLoadedガードを検出。reviewer Discord投稿が11スプリント連続成功。 |
| Sprint 23  | フロントエンドのコード品質向上 — デッドコード削除・マジックストリングの定数化・アナウンスバナーの子ルート対応 | ✅ 全AC達成（#55: 4AC / #58: 4AC / #59: 4AC / #60: 4AC）Sprint Reviewりょこさん指摘なし | DEVが実装フェーズでPRを作成してしまった（禁止事項に記載あり「PRはりょこさんが行う」が古い表現だったため混乱と推定）→developer-workflowを「PRはSMが行う」に修正。convention-reviewerがSCOPE_TO_ROUTE_MAPの未使用定数（#60実装でデッドコード化）を検出・対応済み。reviewer Discord投稿が12スプリント連続成功。 |
| Sprint 24  | アナウンスマスタメンテ画面を管理画面配下に追加し、システム管理者が開発者の手を借りずにアナウンスを管理できる機能を完成させる | ✅ 全AC達成（#57: 5AC）Sprint Review指摘4件（yupメッセージi18n未対応→#62 / タイトル200バイト超入力可→#63 / 重要度バッジDARKモード未対応→#64 / AnnouncementSummary不要マッピング→#65） | security-reviewerが権限保護済み管理者専用エンドポイントのエラーメッセージを5回のレビューで計3回指摘（いずれもりょこさん判断でスコープ外）→security-reviewer.mdに「指摘対象外の判断基準」セクションを追加。Planningで承認した設計（AnnouncementSummary再利用）が後からHwHub規約違反と判明→#65で次スプリント以降に対応。reviewer Discord投稿が13スプリント連続成功。 |
| Sprint 25  | Sprint 24レビュー指摘4件（フロントエンドバグ3件・バックエンドリファクタリング1件）を解消し、アナウンス管理機能を完成品質に引き上げる | ✅ 全AC達成（#62/#63/#64/#65）Sprint Reviewりょこさん指摘なし | 既存ブランチへの追加コミット時に既存PRのbody PATCH更新でclosesを追加する手順がSkillsに未記載 → scrum-master-workflow⑥に追記。reviewer Discord投稿が14スプリント連続成功。コードレビュー3者全員一発「指摘なし」。 |
| Sprint 26  | モバイルアプリのホーム画面を実装し、家事・買い物の状況が一目で確認できるダッシュボードを完成させる | ✅ 全AC達成（#66: 9AC / 190件全通過）Sprint Review指摘5件（①デザインwebSP版合わせ→#69 / ②My Tasks件数集計バグ→#70 / ③買い物リスト場所名称→#71 / ④グラフ積み上げ順序→#72 / ⑤縦軸目盛り→#73） | 初モバイルスプリント: mobile-conventions・3観点reviewerのモバイル対応が正常に機能した。レビュー4ラウンドを経て全員「指摘なし」。Mobileのspecで指定がない場合webのSP版を参照する原則をmobile-conventionsに追加（Sprint Reviewで指摘あり）。reviewer Discord投稿が15スプリント連続成功。 |
| Sprint 27  | モバイルホーム画面のSprint 26 Review指摘5件を全件解消し、webのSP版と完全に統一されたUIを実現する | ✅ 全AC達成（#69/#70/#71/#72/#73）Sprint Reviewりょこさん指摘なし | Agent Teams messaging failure: dev/dev2がSendMessageに応答せずSMが直接計画フェーズを担当（Sonnet DEVでの実装は正常動作）。convention-reviewerがBashでgit diffを実行できずSMが手動でファイル一覧を送付→convention-reviewer.mdにBashフォールバック手順を追記。りょこさんからの規約指摘でshopping_card.dartのマジックストリング'1'/'2'/'3'をPurchaseLocationTypeEnum（core/models/）に抽出→mobile-conventionsにenumルールを追記。reviewer Discord投稿が16スプリント連続成功。 |
| Sprint 28  | モバイルMy Tasks画面を実装してスワイプ操作で日々の家事管理を快適にし、AppRoutes定数クラス導入でルーティング品質を向上させる | ✅ 全AC達成（#67: 10AC / #75: 3AC / 全219件グリーン）Sprint Review指摘3件（①My Tasks担当者フィルタバグ→#76 / ②デザインweb SP版合わせ→#77 / ③GoRoute path引数の定数化漏れ→#78） | convention-reviewerがi18n漏れ・dynamic型・スキップコード値バグ（'2'→'9'）を検出・修正済み。モバイルAppLocalizationsインポートパスをpackage:flutter_genではなく相対パスに修正（flutter runビルドエラー）→developer.mdコミット前チェックリストに追記。担当者フィルタ・デザインSP版合わせがホーム画面に続き2回連続でSprint Review指摘→ACや仕様書の記載不足が根本原因のためPOと改善対応予定。reviewer Discord投稿が17スプリント連続成功。 |
| Sprint 29  | Sprint 28 Review指摘対応 — My Tasks担当者フィルタバグ・デザインweb SP版合わせ・GoRoute定数化漏れを完了させる | ⚠️ 部分達成（#78全AC達成 / #76 AC1未達成・未割当タスク表示 / #77 カードレイアウト未対応）Sprint Review指摘2件（①未割当タスク表示→#79 / ②カードレイアウト→#80） | DEVが「未割当タスクは含める」と自己判断してAC1に反する実装をした（ACに明記されているのに）→ACが曖昧な場合はりょこさんに確認してから実装する原則を再確認。bugラベルIssueの計画フェーズでの原因・改修方針記録フローを初適用（GitHub Issue Bodyに記録）。convention-reviewerがapp_es.arb未作成・provider定義位置・HouseworkTaskDto配置・テストスタブ値不一致の4件を検出・全対応済み。reviewer Discordタイムアウト2回発生→即再起動で解決。reviewer Discord投稿が18スプリント連続成功。 |

---

## チャレンジ結果ログ

| スプリント | チャレンジ内容                                                   | 結果                                                                                                      | Skillsへの反映                                              |
| ---------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Sprint 01  | Claudeモデル最新バージョン確認（claude-sonnet-4-6）              | 継続中（現時点で最新）                                                                                    | 次Planning時に再確認                                        |
| Sprint 02  | PRレビューフロー試行                                             | ❌ 未実施（2スプリント連続）                                                                              | v1.4.0で必須プロセスに格上げ                                |
| Sprint 02  | スタンドアップ実施                                               | ❌ 未実施（2スプリント連続）                                                                              | v1.4.0でPlanning手順に追加                                  |
| Sprint 03  | PRレビューフロー                                                 | ⚠️ りょこさん指示によりスキップ確定（PR不要・コミットまで）                                               | Gitルールとして確定                                         |
| Sprint 03  | Agent Teams連携（webhook廃止）                                   | 🔄 Skills v1.6.0で方針更新済み、次スプリントで本格運用                                                    | scrum_master.md v1.6.0に反映済み                            |
| Sprint 04  | Agent Teams連携の本格運用                                        | ✅ TeamCreate + SendMessage による DEV 起動・完了報告受信が正常動作                                       | 今後のスタンダードとして継続                                |
| Sprint 05  | コミット前format自動実行ルール化                                 | ✅ developer.md v1.8.0 に format コマンド必須ルールとして追加                                             | frontend: npm run format / backend: ./gradlew spotlessApply |
| Sprint 05  | DEV起動前のTaskCreate必須化                                      | ✅ scrum_master.md v1.10.0 に反映。reviewer起動と統一                                                     | 今後のスタンダードとして継続                                |
| Sprint 06  | reviewerのDiscord投稿ルール明記                                  | ✅ convention/security/performance-reviewer.md v1.1.0 に報告手順を追加                                    | 今後のスタンダードとして継続                                |
| Sprint 07  | DEVのDiscord投稿を仕組みで担保                                   | ✅ developer.md v1.10.0冒頭⚠️追加・scrum_master.md v1.12.0起動メッセージに明示指示追加                    | Sprint 08で効果確認→作業開始・完了投稿が定着                |
| Sprint 08  | reviewer「指摘なし」時の観点詳細投稿                             | ✅ Sprint 09で全3観点が詳細フォーマットで投稿された                                                       | convention/security/performance-reviewer.md v1.2.0          |
| Sprint 08  | DEVのbugPBI改修方針に選択理由・トレードオフ必須化                | 🔄 Sprint 09はbugPBIなし・未検証。Sprint 10へ持ち越し                                                     | developer.md v1.11.0                                        |
| Sprint 09  | 1スプリント1作業スレッド制約の明記                               | ✅ scrum-master-workflow v1.1.0で② DEV起動に⚠️として追記                                                  | scrum-master-workflow v1.1.0                                |
| Sprint 09  | SM・DEV投稿への役割プレフィックス必須化                          | ✅ developer-workflow v1.1.0で⚠️必須事項に`[DEV]`プレフィックス追記                                       | developer-workflow v1.1.0                                   |
| Sprint 09  | 指摘対応後の再レビュー必須化                                     | ✅ scrum-master-workflow v1.1.0で⑤ DEV再起動後に再レビュー必須を明記                                      | scrum-master-workflow v1.1.0                                |
| Sprint 10  | Opus 4.7でDEV起動（計画フェーズ）                                | ✅ 有効性確認。計画品質向上とコスト最適化を両立                                                           | scrum-master-workflow v1.2.0 / developer-workflow v1.2.0    |
| Sprint 10  | DEVのbugPBI改修方針に選択理由記載                                | 🔄 Sprint 09・10・11共にbugPBIなし・未検証                                                                | Sprint 12へ持ち越し                                         |
| Sprint 11  | developer.mdのtools:にTaskCreate/TaskUpdate/SendMessageを追加    | ✅ Opus DEV のTaskCreate不可問題を解消                                                                    | developer.md tools フィールド更新                           |
| Sprint 11  | reviewer 3ファイルにgit diffスコープ制限を明記                   | ✅ フォルスポジティブ防止の仕組みを構築                                                                   | convention/security/performance-reviewer.md 更新            |
| Sprint 11  | reviewerのDiscord投稿root cause調査                              | 🔄 enabledMcpjsonServers設定が原因と推定。Sprint 12へ持ち越し                                             | -                                                           |
| Sprint 12  | DEVのbugPBI改修方針に選択理由記載（#33で検証）                   | ✅ fix PBIで選択理由記載を確認。Sprint 09〜12の4スプリント継続チャレンジが達成                            | developer.md v1.11.0（記録済み）として定着確認              |
| Sprint 12  | convention-reviewer.mdにgit checkout禁止・フォールバック手順追加 | ✅ ブロッカー再発防止として手順明文化                                                                     | convention-reviewer.md v1.3.0                               |
| Sprint 12  | reviewerのDiscord投稿root cause調査                              | ❌ 未調査のまま4スプリント連続持ち越し。Sprint 13で必ず根本解決する                                       | -                                                           |
| Sprint 13  | reviewerのDiscord投稿問題の解消（最優先）                        | ✅ 全3観点のreviewerがDiscord投稿に成功（初回・再レビュー両方）。根本原因は不明だが実害解消。継続監視する | -                                                           |
| Sprint 13  | gh不在時のcurl代替PR作成手順整備                                 | ✅ scrum-master-workflow⑥にWrite+curl手順を追記                                                           | scrum-master-workflow ⑥更新                                 |
| Sprint 13  | DEVコミット後のpush手順をworkflowに明記                          | ✅ developer-workflowの作業完了時手順4にpush追加                                                          | developer-workflow 更新                                     |
| Sprint 14  | Claudeモデル最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。アップグレード不要。継続監視             | 次Planning時に再確認                                        |
| Sprint 14  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点・初回＆再レビュー両方で投稿成功（3スプリント連続）。実害解消定着を確認                         | 継続監視                                                    |
| Sprint 14  | GraphQL APIでSprintフィールドからIssue番号を自律取得             | ✅ SprintフィールドでフィルタリングしてIssue #44・#45を自律特定。りょこさんに確認不要                     | scrum-master-workflow手順①を更新                            |
| Sprint 15  | Claudeモデル最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。継続監視                                 | 次Planning時に再確認                                        |
| Sprint 15  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点で投稿成功（4スプリント連続）。定着確認                                                         | 継続監視                                                    |
| Sprint 16  | Claudeモデル最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                 | 次Planning時に再確認                                        |
| Sprint 16  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・再レビュー両方）で投稿成功（5スプリント連続）。定着確認                                 | 継続監視                                                    |
| Sprint 17  | Claudeモデル最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                 | 次Planning時に再確認                                        |
| Sprint 17  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・複数回再レビュー）で投稿成功（6スプリント連続）。定着確認                               | 継続監視                                                    |
| Sprint 18  | Claudeモデル最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                 | 次Planning時に再確認                                        |
| Sprint 18  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・再レビュー両方）で投稿成功（7スプリント連続）。convention-reviewerのSMへのSendMessageがidle通知のみだったがDiscord投稿は成功（実害なし） | 継続監視                                                    |
| Sprint 19  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 19  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・2ラウンド再レビュー両方）で投稿成功（8スプリント連続）。定着確認                               | 継続監視                                                    |
| Sprint 20  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 20  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・再レビュー両方）で投稿成功（9スプリント連続）。convention-reviewerがタイムアウト1回発生したが即再起動で解決。定着確認 | 継続監視                                                    |
| Sprint 20  | 既存ブランチ継続時のreviewerへのコミット範囲指定（りょこさん提案）   | ✅ scrum-master-workflow③④を更新。新規ブランチは従来通り、既存ブランチ継続時は `git diff <sprint-start-commit>^...HEAD` を指定する手順を追加 | 次スプリントで効果確認（Sprint 21は新規ブランチのため不要）  |
| Sprint 21  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 21  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・複数回再レビュー両方）で投稿成功（10スプリント連続）。定着確認                                    | 継続監視                                                    |
| Sprint 21  | mybatisGenerator実行前の既存XML削除をdeveloper-workflowに追記     | ✅ developer-workflowのコミット前チェックリストに「mybatisGenerator使用時の事前削除確認」を追加。database.mdには既述だがDEVが見落とした経緯から二重管理で防止 | 次スプリントで効果確認                                       |
| Sprint 22  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 22  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・複数回再レビュー両方）で投稿成功（11スプリント連続）。定着確認                                    | 継続監視                                                    |
| Sprint 22  | ブロッカー発生時のSM報告必須をdeveloper-workflowに明記             | ✅ developer-workflowに「予期せぬエラーはすべてブロッカーとして扱う・自己判断で回避禁止・SMに報告してりょこさんの判断を仰ぐ」を追記 | 次スプリントで効果確認                                       |
| Sprint 23  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 23  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・再レビュー両方）で投稿成功（12スプリント連続）。定着確認                                         | 継続監視                                                    |
| Sprint 23  | developer-workflowのPR作成禁止事項の記述修正                      | ✅ 「PRはりょこさんが行う」→「PRはSMが行う。DEVはpushまでが担当」に修正。DEVが実装フェーズでPRを作成してしまった原因と推定される古い記述を更新 | 次スプリントで効果確認                                       |
| Sprint 24  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 24  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・複数回再レビュー両方）で投稿成功（13スプリント連続）。定着確認                                    | 継続監視                                                    |
| Sprint 24  | security-reviewer.mdに指摘対象外の判断基準を追加                   | ✅ 権限保護済み管理者専用エンドポイントのエラーメッセージ・自動生成コードのエラーメッセージを指摘対象外とする基準を追記。Sprint 24で計3回スコープ外判断が発生した実績を受けてルール化 | 次スプリントで効果確認                                       |
| Sprint 25  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 25  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回）で投稿成功（14スプリント連続）。コードレビュー一発クリア。定着確認                               | 継続監視                                                    |
| Sprint 25  | 既存ブランチ継続時の既存PR body PATCH更新手順をSkillsに追記         | ✅ scrum-master-workflow⑥に「既存PRがある場合はbodyをPATCHで更新してclosesを追加する」手順を明記。Sprint 25で初めて既存PRへのclosesのみ追加対応が必要になり、手順未記載だった | 次スプリントで効果確認                                       |
| Sprint 26  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 26  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（Round 1〜4 全投稿）で投稿成功（**15スプリント連続**）。定着確認                                       | 継続監視                                                    |
| Sprint 26  | 初モバイルスプリント: mobile-conventions・reviewer3観点のモバイル対応確認 | ✅ fl_chart・HouseholdSwitcher等のモバイル固有実装にもreviewerが正常に対応。mobile-conventionsのデザイン参照方針がSprint Review指摘を受けて不足と判明→section 11追加 | mobile-conventions SKILL.md section 11追加                 |
| Sprint 27  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 27  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・複数回再レビュー）で投稿成功（**16スプリント連続**）。定着確認                                   | 継続監視                                                    |
| Sprint 27  | convention-reviewerのBash未使用時フォールバック手順追加           | ✅ convention-reviewer.mdのレビュー手順2に「⚠️ Bash が使えない場合はSMに変更ファイル一覧を要求する」を追記。Sprint 27でBash利用不可のブロッカー発生→手順明文化で再発防止 | convention-reviewer.md更新                                  |
| Sprint 27  | mobile-conventionsにコード値enumルール追加                        | ✅ shopping_card.dartのマジックストリング'1'/'2'/'3'をPurchaseLocationType enumに抽出（りょこさん指摘）。backend Java enum / frontend as constと同じ命名・コード値で統一する原則をsection 3に追記 | mobile-conventions SKILL.md section 3追記                  |
| Sprint 28  | Claudeモデルの最新バージョン確認                                   | ✅ 確認済み。Opus 4.7（計画）/ Sonnet 4.6（実装）が現時点の最新。変更なし                                        | 次Planning時に再確認                                        |
| Sprint 28  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（初回・再レビュー両方）で投稿成功（**17スプリント連続**）。定着確認                                    | 継続監視                                                    |
| Sprint 28  | developer.mdにモバイルi18nインポートパスの確認項目を追加           | ✅ `package:flutter_gen/gen_l10n/` → `lib/l10n/` への相対パスを使う旨をコミット前チェックリストに追記。flutter runビルドエラーを受けて再発防止 | developer.md更新                                            |
| Sprint 29  | bugラベルIssueの計画フェーズでのGitHub Issue Body更新フロー導入    | ✅ SMがPlanning①でLabels確認→DEV起動メッセージにbugラベル情報を含める→DEVが計画フェーズで原因・改修方針をIssue Bodyに記録する。初適用で正常動作確認 | developer-workflow / scrum-master-workflow / developer.md 更新 |
| Sprint 29  | reviewerのDiscord投稿継続監視                                    | ✅ 全3観点（複数ラウンド）で投稿成功（**18スプリント連続**）。タイムアウト2回発生→即再起動で解決               | 継続監視                                                    |

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
- PlanningでGraphQL APIのSprintフィールドフィルタリングを使って対象Issueを自律特定する（Sprint 14〜）
- sprint_backlog.mdにIssue Body全体（概要・ユーザーストーリー・AC・備考）を転記し、DEVが背景・目的を把握した上で実装方針・代替案を考える（Sprint 15〜）
- TaskCreateは実装フェーズのDEVが行う（計画フェーズでは作成しない）（Sprint 15〜）
- 横断的リファクタリングのコミット前にgrepで置き換え対象パターンの残存を確認する（Sprint 17〜 → developer-workflow更新）
- 大規模CSSリファクタリング時はスコープを絞り（主要レイアウト/ページコンテナ/モーダル）、残存箇所をgrepで集計して別Issue化する（Sprint 18〜）
- デザイントークン系タスクでは事前にりょこさんから色定義をCSSファイルで確定してもらい、DEVに渡す（Sprint 18〜）

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
- 計画フェーズ（Opus 4.7）でTaskCreateすること（Sprint 15 → 別エージェントインスタンスの実装フェーズが引き継げず無視される。scrum-master-workflow・developer-workflow更新）
- DEVが実装フェーズでPRを作成すること（Sprint 23 → developer-workflowの禁止事項の記述が「PRはりょこさんが行う」と古く「PRはSMが行う」に修正）

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
- 横断的リファクタリングで対象箇所の置き換え漏れが発生すること（Sprint 17 → developer-workflowにgrep残存確認を追加）
- 大規模CSS置換タスクでgrepのみに頼って全コンポーネントの動作確認を省くこと（Sprint 19 → OnboardingCardの漏れ発生 → bug Issue #53起票）
- 既存ブランチへの追加改修時に `git diff main...branch` でreviewerに指示すること（Sprint 20 → 前スプリントのファイルも含まれスコープ外指摘が4件発生 → scrum-master-workflow③④でコミット範囲指定を必須化）
- mybatisGenerator実行時に既存XMLを削除せずに実行すること（Sprint 21 → 全22 Mapper XMLに定義が重複してSpring Bootが起動不可になった → developer-workflowのコミット前チェックリストに追記）
- モバイルでAppLocalizationsのインポートに `package:flutter_gen/gen_l10n/` を使うこと（Sprint 28 → flutter runビルドエラー → developer.mdコミット前チェックリストに追記）
- 同じバグ（担当者フィルタ・デザインSP版合わせ）がSprint Reviewで2スプリント連続指摘されること（Sprint 26・28 → ACや仕様書の記載不足が根本原因 → POとAC改善で対応）
- DEVがACに明記されていない動作を自己判断でスコープに含めること（Sprint 29 → 「未割当タスクは含める」と自己判断してAC1に反する実装 → ACが曖昧な場合はりょこさんに確認してから実装する）

### Challenge（次に試すこと）

- Claudeモデルの最新バージョン確認（Planning時に確認、現在: Sonnet 4.6 / Opus 4.7）
- reviewerのDiscord投稿継続監視（Sprint 13〜26で15スプリント連続成功。根本原因は未特定）
