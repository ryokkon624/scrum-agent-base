# Sprint 66 バックログ

## スプリントゴール

AI一次回答の精度向上のためのhw-hub-knowledgeドキュメント拡充（FAQ追加・HOWTO PC/SP分離）

---

## Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #181 | hw-hub-knowledgeのFAQを拡充する | documentation | - |
| #183 | hw-hub-knowledgeのHOWTOのWEBでPC版、SP版を明示的に分けたい | documentation | - |

---

## Issue #181: hw-hub-knowledgeのFAQを拡充する

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/181  
**ブランチ**: `docs/181-faq`

### ユーザーストーリー

**As a** AI一次回答機能  
**I want to** FAQとして整理された知識を参照したい  
**So that** ユーザーの問い合わせに精度の高い一次回答を返せる

### Acceptance Criteria

- [x] AC1: hw-hub-frontend / hw-hub-mobile / hw-hub-backendの既存処理を参考に、ユーザーが問い合わせしやすい内容がFAQ形式でfaq.mdにまとめられている
- [x] AC2: 各FAQに質問（Q）と回答（A）が記載されている

### 備考

- 優先順位の根拠：AI一次回答の精度向上による問い合わせ対応コスト削減
- 依存関係：なし
- 補足：hw-hub-knowledgeはスプリント開発でこれまで触ったことがないリポジトリ。AIの問い合わせ一次回答が参照するファイルは `C:\work\hw-hub\hw-hub-knowledge\faq.md`

---

## Issue #183: hw-hub-knowledgeのHOWTOのWEBでPC版、SP版を明示的に分けたい

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/183  
**ブランチ**: `docs/183-howto-pc-sp`

### 概要

#182 にてHOWTOは拡充済みであるため、WEBとMobileは分離して記載した。
しかし、WEB版については、PC版とSP版でレイアウトが異なっており、機能的にもドラッグ&ドロップやスワイプの操作の違いがあったりする。
そのため、[WEB]、[WEB PC]、[WEB SP]、[Mobile]の4つを区別して記載したい。
WEBでPC版SP版で共通の場合は[WEB]で記載。

### ユーザーストーリー

**As a** AI一次回答機能  
**I want to** WEB版のPC版・SP版それぞれの操作方法を参照したい  
**So that** ユーザーがどのデバイスからアクセスしているかに応じて、より正確な操作案内を返せる

### Acceptance Criteria

- [x] AC1: howto.md内のすべての `[WEB]` 記述について、PC版とSP版で操作・レイアウトが異なる箇所が `[WEB PC]` / `[WEB SP]` に分離されている（例: ドラッグ&ドロップによる家事割り当てはPC版のみ、2カラムレイアウトはPC版のみ）
- [x] AC2: PC版・SP版で操作が同じ箇所は引き続き `[WEB]` で統一されている
- [x] AC3: `[WEB PC]` / `[WEB SP]` / `[WEB]` / `[Mobile]` の4つのラベルが使われており、各ラベルの意味を説明する凡例が howto.md の冒頭に追加されている
- [x] AC4: WEB SP版固有のスワイプ操作（家事割り当て・買い物ステータス変更など）が `[WEB SP]` で明記されている

### 備考

- 優先順位の根拠：AI一次回答の精度向上。PC/SPデバイス別の操作案内を可能にする
- 依存関係：#182（HOWTO拡充。完了済み）
- 補足：対象ファイルは `C:\work\hw-hub\hw-hub-knowledge\howto.md` のみ（hw-hub-knowledgeリポジトリ）。hw-hub-frontendのコードを参照してPC/SPの操作差異を特定する。

---

## リスク・チャレンジ

- **リスク**: hw-hub-knowledgeはスプリント開発でこれまで触ったことがないリポジトリ。リポジトリ構造の把握が必要
- **リスク**: #183はhw-hub-frontendのコードを参照してPC/SPの操作差異を特定する必要があり、コード調査が発生する
- **チャレンジ**: documentationタイプのIssueのみのスプリント。Sprint Review HTMLのtemplate選択（feature/refactor/bug）に注意
