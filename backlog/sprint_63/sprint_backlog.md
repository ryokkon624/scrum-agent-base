# Sprint 63 バックログ

## スプリントゴール

問い合わせのUIクライアント・バージョン情報を全層（DB・API・Web・Mobile）で保存・表示する

---

## ブランチ方針

複数リポジトリにまたがるため、各リポジトリで同名ブランチを作成する。

| リポジトリ | ブランチ名 |
|-----------|-----------|
| hw-hub-database | `feature/178-inquiry-client-version` |
| hw-hub-backend | `feature/178-inquiry-client-version` |
| hw-hub-frontend | `feature/178-inquiry-client-version` |
| hw-hub-mobile | `feature/178-inquiry-client-version` |

実装順序（依存関係あり）：DB → Backend → Frontend / Mobile（並列可）

---

## Issue一覧

| Issue | タイトル | ラベル | SP |
|-------|---------|--------|-----|
| #178 | 問い合わせ起票時のUIクライアント・バージョン情報をt_inquiryに保存する | feature | - |

---

## #178 問い合わせ起票時のUIクライアント・バージョン情報をt_inquiryに保存する

**GitHub Issue**: https://github.com/ryokkon624/hw-hub-manage/issues/178
**ラベル**: feature

### ユーザーストーリー

**As a** 管理者
**I want to** 問い合わせがどのUIクライアント（web/mobile）のどのバージョンから起票されたかを確認したい
**So that** 問い合わせ対応時にユーザーの利用環境を把握し、バージョン固有の問題を早期に特定できる

### Acceptance Criteria

#### DB
- [x] AC1: m_codeにcode_type 0029「UIクライアント」として code_value: "mobile" および "web" の2レコードが追加されている
- [x] AC2: t_inquiryテーブルに以下のカラムが追加されている
  - `ui_client` VARCHAR(10)：m_code(code_type 0029)のコード値（mobile/web）
  - `ui_version` VARCHAR(20)：問い合わせ起票時のUIバージョン
  - `api_version` VARCHAR(20)：問い合わせ起票時のAPIバージョン

#### Backend
- [x] AC3: 問い合わせ作成APIがリクエストボディに `ui_client`, `ui_version`, `api_version` を受け付ける
- [x] AC4: 受け取った値をt_inquiryテーブルに保存する
- [x] AC5: 問い合わせ取得APIのレスポンスに `ui_client`, `ui_version`, `api_version` が含まれる

#### Frontend (Web)
- [x] AC6: 問い合わせ作成時、アプリ情報画面に表示しているUIバージョン・APIバージョンを問い合わせ作成APIに送信する（ui_client="web"）。ユーザーの入力フォームにはバージョン情報の入力欄を表示しない
- [x] AC7: 問い合わせ詳細（管理）画面の問い合わせカテゴリの上にUIクライアント・UIバージョン・APIバージョンを表示する
- [x] AC8: ユーザー向け問い合わせ詳細画面の問い合わせカテゴリの上にUIクライアント・UIバージョン・APIバージョンを表示する

#### Mobile
- [x] AC9: 問い合わせ作成時、アプリ情報画面に表示しているUIバージョン・APIバージョンを問い合わせ作成APIに送信する（ui_client="mobile"）。ユーザーの入力フォームにはバージョン情報の入力欄を表示しない
- [x] AC10: ユーザー向け問い合わせ詳細画面の問い合わせカテゴリの上にUIクライアント・UIバージョン・APIバージョンを表示する

### 備考

- 優先順位の根拠：問い合わせ対応効率化・バージョン固有不具合の早期特定
- 依存関係：なし
- **実装注意**: api_versionの取得方法（APIから取得するか・設定ファイルから取得するか）を計画フェーズで調査・確認すること
- **実装注意**: web側のUIバージョン取得は既存のアプリ情報画面のロジックを流用する
- **実装注意**: mobile側のUIバージョン取得はpackage_info_plus（Sprint 49で採用済み）を使う
