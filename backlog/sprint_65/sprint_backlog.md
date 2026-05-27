# Sprint 65 バックログ

## スプリントゴール

hw-hub-knowledgeの `howto.md` に全画面の操作方法をHOWTO形式で追加し、AI一次回答の精度を向上させる

---

## 対象Issue

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #182 | hw-hub-knowledgeのHOWTOを拡充する | documentation | - |

---

## Issue #182: hw-hub-knowledgeのHOWTOを拡充する

### ユーザーストーリー

**As a** AI一次回答機能
**I want to** 各画面の使い方をHOWTOとして整理された知識を参照したい
**So that** ユーザーの操作方法に関する問い合わせに精度の高い一次回答を返せる

### Acceptance Criteria

- [x] AC1: hw-hub-frontend / hw-hub-mobile / hw-hub-backendの既存処理を参考に、各画面の使い方がHOWTO形式でhowto.mdにまとめられている
- [x] AC2: WEB版とMobile版でUIが異なる箇所は、どちらのUIかが明記されている

### 備考

- 優先順位の根拠：AI一次回答の精度向上による問い合わせ対応コスト削減
- 依存関係：なし
- 補足：hw-hub-knowledgeはスプリント開発でこれまで触ったことがないリポジトリ。AIの問い合わせ一次回答が参照するファイルは `C:\work\hw-hub\hw-hub-knowledge\howto.md`

### 実装方針（DEV向け）

**対象ファイルとリポジトリ（必ず確認すること）:**
- 更新対象ファイル: `C:\work\hw-hub\hw-hub-knowledge\howto.md`
- 更新対象リポジトリ: hw-hub-knowledge（他のリポジトリには変更を加えない）
- ブランチ: `docs/182-howto-expand`（hw-hub-knowledgeリポジトリで新規作成）

**現状の howto.md:** 3セクション（おうちの作成・参加、家事の登録、買い物リストの使い方）のみで簡素。全画面のHOWTOを追記する必要がある。

**コード参照先（読み取り専用。変更しない）:**
- hw-hub-frontend: `C:\work\hw-hub\hw-hub-frontend\src\views\` 配下のVueファイル
- hw-hub-mobile: `C:\work\hw-hub\hw-hub-mobile\lib\features\` 配下のDartファイル
- hw-hub-backend: `C:\work\hw-hub\hw-hub-backend\src\main\java\` 配下のControllerを参考にエンドポイント確認

**WEB版・Mobile版の違い:**
- 同じ機能でもWEB版（Vue）とMobile版（Flutter）でUIが異なる場合は必ずどちらのUIかを明記する

**注意事項（Sprint 64の教訓）:**
- hw-hub-knowledgeリポジトリ以外に変更を加えてはならない
- 別リポジトリに独自のドキュメントファイルを新規作成しないこと

### ブランチ名

`docs/182-howto-expand`（hw-hub-knowledgeリポジトリ）

### コミット参照

`(ryokkon624/hw-hub-manage#182)`
