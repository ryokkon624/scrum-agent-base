# Dev 長期記憶

**最終更新**: -

---

## 技術的なハマりポイントと解決策

（スプリントごとのshort_termから移してくる）

### AWS / インフラ
- AWS SDK v2を使う。spring-cloud-awsはSpring Boot 4.xと非互換なので使わない
- STG環境はEphemeral構成。使うときだけ `terraform apply`、終わったら `terraform destroy`

### Spring Boot / バックエンド
- MyBatisはJava recordをサポートしている
- ドメインRepositoryインターフェースを使ったレイヤードアーキテクチャを守る

### Vue 3 / フロントエンド
- ローカライズユーティリティはcomposablesに移動済み
- Pinia + Composition APIで状態管理

---

## 習得したスキルログ

| スプリント | 習得内容 | 備考 |
|-----------|---------|------|
| | | |

---

## 削除したスキルログ

（モデルアップデートなどで不要になったSkill）

| スプリント | 削除内容 | 削除理由 |
|-----------|---------|---------|
| | | |
