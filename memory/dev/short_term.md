# Dev 短期記憶

**スプリント**: Sprint 21
**最終更新**: 2026-05-04

---

## スプリントゴール

ダークモード設定のDB永続化によるマルチデバイス体験向上と、deleteHouseworkエンドポイントのセキュリティ修正（認可チェック追加または廃止）を実現する

---

## 実装状況

### Issue #54: Darkモード設定のDB永続化 - 完了（レビュー指摘対応②済み）

**ブランチ**: `feature/54-dark-mode-db`（全3リポジトリ、プッシュ済み）

- hw-hub-database: `feat: m_codeにThemeMode区分を追加、m_userにtheme_modeカラムを追加`
- hw-hub-backend: コミット2件（generateEnums/mybatisGenerator + API実装）
- hw-hub-frontend: `feat: ダークモード設定をDBと同期（ログイン時上書き・変更時API呼び出し）`
- hw-hub-frontend（レビュー指摘対応①）: `test: userApi.updateTheme() のテストを追加`
- hw-hub-backend（レビュー指摘対応②）: `test: ThemeModeSpec追加・UserConverterSpecにthemeMode変換検証を追加`

全AC完了。全テスト通過。3回のレビュー指摘対応済み（最終: ThemeModeSpec thrown(Exception)→thrown(IllegalArgumentException)）。

### Issue #50: deleteHousework エンドポイント削除 - 完了

**ブランチ**: `fix/50-delete-housework-auth`（hw-hub-backend、プッシュ済み）

- フロント未使用を確認 → AC2のパス（エンドポイント削除）
- HouseworkController / HouseworkService / HouseworkRepository / MyBatisHouseworkRepository から削除
- 関連Spockテストも削除
- 全テスト通過

---

## Sprint Review バグ修正

### Spring Boot起動エラー（Mapper XML重複定義）- 完了

- **ブランチ**: `feature/54-dark-mode-db`（hw-hub-backend、プッシュ済み）
- **原因**: mybatisGeneratorが既存XMLに追記する動作により、全22ファイルの定義が二重に
- **修正**: 各ファイルの重複部分（2番目のBaseResultMap以降）を削除し</mapper>で閉じた
- **コミット**: `fix: mybatisGeneratorによるMapper XMLの重複定義を修正`

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-05-04 | UserModel.reconstruct 既存テスト33件が全失敗 | themeMode引数追加でシグネチャ変更 | 全テストに ThemeMode.SYSTEM を追加 |
| 2026-05-04 | themeStore 未ログイン時テスト失敗 | vi.fn()モックがテスト間でリセットされていない | beforeEachにvi.clearAllMocks()追加 |
| 2026-05-04 | Spring Boot起動エラー（Mapper XML二重定義） | mybatisGeneratorが既存XMLに追記する動作 | 2番目のBaseResultMap以降を削除して</mapper>で閉じる |

---

*スプリント終了後、long_term.mdに要約して移す*
