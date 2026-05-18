# SM 短期記憶

**スプリント**: Sprint 41（未開始）
**最終更新**: 2026-05-18

---

## 現在の状態

Sprint 40 完了。次スプリント開始時にリセット済み。

## 引き継ぎ事項

- HomeAppBarの通知・アカウントアイコンは未実装（SnackBar表示）。**#15対応時に必ず実装すること**
- Claudeモデル: 現在 Sonnet 4.6（実装）/ Opus 4.7（計画）が最新。変更なし
- Agent Teams messaging failureの既知問題: SMエージェントが停止後、DEVからのSendMessageが届かない。DEV起動後にSMが結果を受け取る設計のため実害なし
- hw-hub-mobile `feature/67-mobile-my-tasks` ブランチはPR #12でオープン中（#67・#75・#76・#77・#78・#81・#79・#80・#82のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `feature/89-mobile-shopping-ui-improvements` はPR #14でオープン中（#89・#90・#92・#95・#98のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `fix/109-nav-label-i18n` はPR #15でオープン中（#109のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `feature/91-purchased-swipe` はPR #16でオープン中（#91のclosesを含む）。PR #14マージ後にbaseをmainに変更してからマージ可能
- hw-hub-mobile `feature/87-mobile-housework-assign` はPR #18でオープン中（#87・#110・#111・#112・#115のclosesを含む）。りょこさんがマージ予定
- reviewer起動前に `git diff --name-only` で変更ファイル一覧をSMが取得してプロンプトに含めること（Sprint 36 Retro追加）
- **モバイルのUI変更はDEVの完了報告だけでAC達成とみなさない。りょこさんの実機確認を一次確認とする**（Sprint 37 #98でAC未達成が実機確認で発覚）
- **reviewerの指摘は実ファイルを確認してから対応要否を判断すること**（Sprint 38でconvention-reviewerが実装済みコードを誤指摘）
