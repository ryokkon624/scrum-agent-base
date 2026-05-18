# SM 短期記憶

**スプリント**: Sprint 42（未開始）
**最終更新**: 2026-05-18

---

## 現在の状態

Sprint 43 完了。次スプリント開始時にリセット済み。

## 引き継ぎ事項

- Sprint 43 Sprint Review指摘: #124（通知ベルポップオーバーにi18nキーがそのまま表示）→ Issue起票・Projects追加・Draft設定済み。次スプリントで対応
- `feature/119-mobile-notifications` PR #22 はりょこさんのマージ待ち

## 引き継ぎ事項

- HomeAppBarの通知・アカウントアイコンは未実装（SnackBar表示）。**#15対応時に必ず実装すること**
- Claudeモデル: 現在 Sonnet 4.6（実装）/ Opus 4.7（計画）が最新。変更なし
- Agent Teams messaging failureの既知問題: SMエージェントが停止後、DEVからのSendMessageが届かない。DEV起動後にSMが結果を受け取る設計のため実害なし
- hw-hub-mobile `feature/67-mobile-my-tasks` ブランチはPR #12でオープン中（#67・#75・#76・#77・#78・#81・#79・#80・#82のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `feature/89-mobile-shopping-ui-improvements` はPR #14でオープン中（#89・#90・#92・#95・#98のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `fix/109-nav-label-i18n` はPR #15でオープン中（#109のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `feature/91-purchased-swipe` はPR #16でオープン中（#91のclosesを含む）。PR #14マージ後にbaseをmainに変更してからマージ可能
- hw-hub-mobile `feature/87-mobile-housework-assign` はPR #18でオープン中（#87・#110・#111・#112・#115のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `feature/113-mobile-housework-assign-button-layout` はPR #19でオープン中（#113のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `feature/114-mobile-housework-assign-swipe-ux` はPR #20でオープン中（#114のclosesを含む）。りょこさんがマージ予定
- reviewer起動前に `git diff --name-only` で変更ファイル一覧をSMが取得してプロンプトに含めること（Sprint 36 Retro追加）
- **モバイルのUI変更はDEVの完了報告だけでAC達成とみなさない。りょこさんの実機確認を一次確認とする**（Sprint 37 #98でAC未達成が実機確認で発覚）
- **reviewerの指摘は実ファイルを確認してから対応要否を判断すること**（Sprint 38でconvention-reviewerが実装済みコードを誤指摘）
- **スワイプ方向は同一画面内で統一されているか必ず確認すること**（Sprint 41でスワイプモードと通常リストモードの方向不統一が発覚 #116）
- **スワイプモードカードはOverdueデータを含むケースでの表示確認を必ず行うこと**（Sprint 41でOVERFLOWが発覚 #117）
- **UserAvatarはプロフィール画像登録済みユーザでの表示確認を必ず行うこと**（Sprint 41でアイコン画像未表示が発覚 #118）
