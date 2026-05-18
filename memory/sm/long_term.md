# SM 長期記憶

**最終更新**: 2026-05-18（Sprint 44 Retro）

---

## long_term.md の目的

「次の自分がスプリント進行で迷わず判断できるための手掛かり」を蓄積する場所。

- スプリント進行上の判断パターン
- レビュー傾向の把握（DEV への注意喚起）
- Skills の更新履歴

---

## スプリント進行パターン（判断ガイダンス）

### Planning

- 計画フェーズは Opus 4.7 で実施。実装は Sonnet 4.6 で再起動（2フェーズモデル）
- sprint_backlog.md に Issue Body 全体（概要・ユーザーストーリー・AC・備考）を転記する。ACだけでは背景が伝わらない
- TaskCreate は実装フェーズの DEV が行う。計画フェーズでは作成しない
- bug ラベル Issue は計画フェーズで根本原因調査・改修方針を整理し、GitHub Issue Body に記録する。bug Sprint でも Opus 4.7 で丁寧に調査する
- 既存ブランチ継続時は DEV 起動メッセージにブランチ名を明示し「新規ブランチを作成しないこと」と指示する
- 計画フェーズでweb実装を参照してAC仕様を確定する手順は有効
- ACが曖昧・未定義な場合は実装前にりょこさんに確認するよう DEV への指示に含める
- Retro Issue起票前に `list_issues`（state: open）で既存Issue一覧を確認し、重複がないことを確認してから起票する（Sprint 34 で重複起票が発生）
- Issue別個別コミット方針はコミット履歴の可読性が高く有効。bug Sprint でも継続採用

### レビュー

- 既存ブランチ継続時は `git show --name-only [コミットハッシュ...]` で今スプリントの変更ファイルを特定してから、レビュアーへの指示にコミット範囲（`git diff <sprint-start-commit>^...HEAD`）を明示する
- レビュアーへの指示に「スコープ外ファイルは指摘不要」と明記する（Sprint 20, 35 で誤指摘発生）
- **reviewer起動前に `git diff --name-only` で変更ファイル一覧をSMが取得し、プロンプトに含める**（Sprint 36でconvention-reviewerがWindows環境でgit実行できず、後から提供する必要が生じた）
- **reviewerの指摘は実ファイルを確認してから対応要否を判断する**: convention-reviewerが実装済みコードを「未実装」と誤報告するケースが複数スプリントで発生（Sprint 38も#109で発生）。指摘を受けたらSMが実ファイルを確認し、実装済みであればスコープ外として対応不要と判断する
- 指摘対応後は必ず再レビューを実施してから Sprint Review に進む。省略禁止
- 横展開確認でスコープ外問題を発見した場合は即 Issue 化する
- **複数ブランチにまたがる実装の場合、修正が含まれるブランチをreviewerに明示すること（Sprint 44で発生）**: 例えばIssue Aの修正が `feature/A-xxx` にのみあり `feature/B-xxx` にない場合、「Issue Aの修正は `feature/A-xxx` ブランチで確認してください」と明示しないとreviewerが誤って未修正と判断する

### Sprint Review / Retro

- Sprint Review HTML は DEV に生成させてりょこさんに提出する（Sprint 30 〜 標準化）
- Retro で判明した新規バグ・改善点は Issue 起票 → Projects 追加 → ReadyをDraftに設定まで SM が行う（Ready更新・SP設定はりょこさん）
- **モバイルのUI変更はDEVのテスト通過・「実装完了」報告だけでAC達成とみなさない。りょこさんの実機確認を一次確認とする**（Sprint 37で#98がAC未達成のまま完了報告された実績）
- Shellレベルのウィジェット制御（route判定）は実装前に実機での表示状態を確認する。GoRouterのShellRouteの外にpushした画面ではbottomNavigationBarが消える構造の場合があり、route判定が不要になる可能性がある

---

## DEV レビュー指摘の傾向

モバイル実装スプリントで繰り返し発生したパターン。DEV計画フェーズ起動時に注意喚起するか、developer-workflow のセルフチェックで対応する。

| パターン | 発生スプリント | 備考 |
|---|---|---|
| マジックストリング（enum未使用） | Sprint 34, 35 | status/flag値を `'0'`/`'1'` で直接比較。`core/models/` の生成済みenum を使う |
| i18n ハードコード | Sprint 33, 34, 37 | 日本語・英語文字列をウィジェットに直書き。Sprint 37 は main_shell.dartのナビゲーションラベルで発生（既存コードだがファイルを触ったタイミングで指摘） |
| `catch (_) {}` 握りつぶし | Sprint 34（規約化）, 35（再発） | rethrow または AppException 変換が必要。ただし Notifier 層は catch → errorMessage 格納が正解（Sprint 36 で規約を層別化） |
| IndexedStack invalidate 漏れ | Sprint 35 Review, Sprint 36 | 詳細・作成画面からの操作後に一覧 Provider を invalidate していない。#93/#107/#108 で3回修正。詳細画面実装時の標準チェック項目 |

---

## Sprint Review で発覚しやすいパターン

- **APIレスポンスデシリアライズバグ**: テストがモックで通過していても、実APIのレスポンス形状が異なるとランタイムでクラッシュ（Sprint 33）。mobile-conventions にモック構造確認ルールを追記済み
- **詳細画面からの操作後の一覧反映漏れ**: 削除/ステータス変更/追加後に一覧が更新されない（#82, #107, #108）。`ref.invalidate(shoppingListNotifierProvider)` 追加が標準修正パターン。モバイル詳細画面実装時は必ずACに「一覧の反映」を含める
- **視覚的AC（幅・配置）の目視未確認**: シミュレーターまたはウィジェットテストで確認しないとSprint Reviewで指摘される（Sprint 31）
- **DEVのスコープクリープ**: ACに明記されていない動作を自己判断で含めることがある。計画フェーズでACが曖昧な箇所を事前確認する
- **ShellレベルUIの実機未確認**: GoRouterのShellRoute外にpushした画面でのBottomNavBar/HouseholdIndicatorBar表示状態は実機でないと分からない。route判定実装前に「そもそも表示されているか」をりょこさんに確認する（Sprint 37 #98でAC未達成が発覚）

---

## Skills更新履歴

| Sprint | ファイル | 更新内容 | 理由 |
|--------|---------|---------|------|
| Sprint 09 | scrum-master-workflow | 1スプリント1作業スレッド制約・再レビュー必須化 | DEVの着手遅延・指摘対応後の再レビュー省略の実績 |
| Sprint 10 | scrum-master-workflow / developer-workflow | Opus 4.7（計画）+ Sonnet 4.6（実装）の2フェーズモデル導入 | 計画品質とコスト最適化の両立 |
| Sprint 15 | scrum-master-workflow / developer-workflow | TaskCreateは実装フェーズのみ・sprint_backlog.mdにBody全体転記 | 計画フェーズTaskCreateが実装フェーズに引き継げない問題 |
| Sprint 20 | scrum-master-workflow | 既存ブランチ継続時のコミット範囲指定を必須化 | スコープ外ファイル指摘が4件発生 |
| Sprint 25 | scrum-master-workflow | 既存PR body PATCHでclosesを追加する手順追記 | 既存PRへのclosesのみ追加対応が必要になり手順未記載 |
| Sprint 26 | mobile-conventions | デザイン参照方針（specなき場合web SP版参照）を追加 | Sprint Review でデザイン差異が指摘 |
| Sprint 27 | mobile-conventions | コード値enumルール追加 | マジックストリング指摘（PurchaseLocationType） |
| Sprint 29 | scrum-master-workflow / developer-workflow | bugラベルIssueのGitHub Body更新フローを追加 | 計画フェーズでの根本原因・改修方針の記録標準化 |
| Sprint 30 | mobile-conventions | Notifier内Dio直接参照禁止ルール追記 | convention-reviewerがアーキテクチャ違反を検出 |
| Sprint 31 | mobile-conventions | 全幅表示ウィジェットパターン追加 | Sprint Reviewでカード幅がコンテンツ依存と指摘（#82） |
| Sprint 31 | developer-workflow | モバイルUI視覚的AC確認を追記 | Sprint 31でカード全幅表示ACを目視未確認のまま達成と報告 |
| Sprint 32 | scrum-master-workflow | DEV起動指示に既存ブランチ名明示を追加 | 計画フェーズDEVが誤ったブランチ名を誤記した実績 |
| Sprint 33 | mobile-conventions | Repositoryモック構造確認ルール追記 | ClassCastException 実績（ラッパー形式を未確認でモック） |
| Sprint 34 | mobile-conventions | catch握りつぶし禁止ルール追記 | レビュー指摘（エラーを `catch (_) {}` で無視） |
| Sprint 34 | scrum-master-workflow | Retro起票前の既存Issue確認を必須化 | Sprint 34で重複起票が発生 |
| Sprint 35 | mobile-conventions | IndexedStack配下の invalidate ルール追記 | Sprint Review指摘（#107/#108） |
| Sprint 36 | mobile-conventions | エラーハンドリングルールにNotifier層パターンを追加 | convention-reviewerの誤検知（catch→errorMessage格納をNG判定）を受け、層別パターンを明示 |
| Sprint 36 | scrum-master-workflow | reviewer起動前の変更ファイル一覧事前取得ステップを追加 | convention-reviewerがWindows環境でgit実行できず再対応が必要になった実績 |
| Sprint 37 | scrum-master-workflow | Sprint Review/RetroセクションにモバイルUI実機確認・Shellウィジェット制御の注意事項を追加（long_term.md） | #98でAC未達成がりょこさんの実機確認で初めて発覚した実績 |
| Sprint 38 | mobile-conventions | リスト生成時のkey付与（必須）セクションを新規追加 | `items.map()`で生成するウィジェットに`ValueKey`が未設定で、performance-reviewerが指摘 |
| Sprint 38 | scrum-master-workflow | reviewerの指摘検証ルール追記（long_term.md） | convention-reviewerが実装済みコードを誤指摘するケースが複数スプリントで継続発生 |
| Sprint 40 | mobile-conventions | Dismissibleスワイプ方向・Wrap折り返し・UserAvatar共通ウィジェットの3パターンを追加 | Sprint 39 Sprint Reviewで発覚したバグ（#110/#111/#112/#115）の修正で確立したパターンを規約化（DEV実施） |
| Sprint 41 | mobile-conventions | テキストoverflow対応（必須）・table_calendar採用実績を追加 | Sprint 41 Sprint Reviewでスワイプモードカードのオーバーフロー指摘（#117）を受け規約化（DEV実施） |
| Sprint 42 | mobile-conventions | Dismissibleスワイプ方向の背景事例にSprint 42 #116を追記・UserAvatar iconUrl:nullハードコード禁止ルールを強化 | 規約既存にもかかわらずSprint 40→42と同パターン再発。背景と禁止事項を強化（SM実施） |
| Sprint 43 | mobile-conventions | StatefulWidget event handler内エラーハンドリングパターン追記（DEV）・バックエンドキー値とARBキー突き合わせ確認ルール追記（SM） | catch(_)握りつぶしがSprint 43でも2件発生・Sprint Review指摘#124（i18nキー不一致）を受けて追記 |
| Sprint 44 | scrum-master-workflow | 複数ブランチにまたがる実装でreviewerに修正含有ブランチを明示する注意事項を追加（SM） | `feature/120`ブランチに`housework_assign`修正が含まれていないことに気づかずperformance-reviewerが「未修正」と誤判断した実績 |
