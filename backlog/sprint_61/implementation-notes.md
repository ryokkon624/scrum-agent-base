## #177: tasks feature の命名統一

### 仕様外の判断・変更・妥協点
（実装中に随時追記）

---

## #165: 家事割り当てスワイプモードに自身のタスクが表示される

### 仕様外の判断・変更・妥協点
- **startSwipeMode のシグネチャ変更**: `startSwipeMode(SwipeTarget)` → `startSwipeMode(SwipeTarget, int currentUserId)` に変更。ACには「Page から currentUserId を渡す」と指定があったため確定。
- **swipeAssignToMe 内での currentUserId 取得**: `swipeAssignToMe` は `_swipeTargetTasksFor` を呼ぶために currentUserId が必要だが、シグネチャには含めず（swipe 中に currentUserId は変化しない前提）、`authNotifierProvider.future` から毎回取得する形を採用。既存の `assignToMe` と一貫したパターン。
- **既存テストの修正**: `startSwipeMode(others): assignedタスクのみが対象になる` は currentUserId=10 でタスク assignee=10（自分）のみという構成だったため、修正後は swipeTaskCount=0 になった。テストにタスク id=3（assignee=20、他人）を追加してテスト意図を明確にした。
