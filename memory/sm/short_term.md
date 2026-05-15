# SM 短期記憶

**スプリント**: Sprint 37（未開始）
**最終更新**: 2026-05-15

---

## 現在の状態

Sprint 36 完了。次スプリント開始時にリセット済み。

## 引き継ぎ事項

- HomeAppBarの通知・アカウントアイコンは未実装（SnackBar表示）。**#15対応時に必ず実装すること**
- Claudeモデル: 現在 Sonnet 4.6（実装）/ Opus 4.7（計画）が最新。変更なし
- Agent Teams messaging failureの既知問題: SMエージェントが停止後、DEVからのSendMessageが届かない。DEV起動後にSMが結果を受け取る設計のため実害なし
- hw-hub-mobile `feature/67-mobile-my-tasks` ブランチはPR #12でオープン中（#67・#75・#76・#77・#78・#81・#79・#80・#82のclosesを含む）。りょこさんがマージ予定
- hw-hub-mobile `feature/85-mobile-shopping-list` ブランチはPR #13でオープン中（#85・#86・#88・#93・#96・#94・#97・#99・#107・#108のclosesを含む）。りょこさんがマージ予定
- reviewer起動前に `git diff --name-only` で変更ファイル一覧をSMが取得してプロンプトに含めること（Sprint 36 Retro追加）
