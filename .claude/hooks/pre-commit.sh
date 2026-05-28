#!/bin/bash
input=$(cat)

# Parse bash command from JSON input
command=$(echo "$input" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tool_input = data.get('tool_input', data)
    print(tool_input.get('command', ''))
except:
    print('')
" 2>/dev/null)

# Skip if not a git commit (or is a dry-run)
if ! echo "$command" | grep -qE "git\s+commit"; then
    exit 0
fi
if echo "$command" | grep -q "\-\-dry-run"; then
    exit 0
fi

# Detect repository
if echo "$command" | grep -q "hw-hub-frontend"; then
    repo="C:/work/hw-hub/hw-hub-frontend"
    format_cmd="npm run format"
elif echo "$command" | grep -q "hw-hub-backend"; then
    repo="C:/work/hw-hub/hw-hub-backend"
    format_cmd="./gradlew spotlessApply"
elif echo "$command" | grep -q "hw-hub-batch"; then
    repo="C:/work/hw-hub/hw-hub-batch"
    format_cmd="./gradlew spotlessApply"
elif echo "$command" | grep -q "hw-hub-mobile"; then
    repo="C:/work/hw-hub/hw-hub-mobile"
    format_cmd="dart format ."
else
    exit 0
fi

# Block commits to main
branch=$(git -C "$repo" branch --show-current 2>/dev/null)
if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
    echo "ERROR: mainへの直接コミットは禁止されています。($repo)" >&2
    echo "使用可能なプレフィックス: feature/ fix/ refactor/ docs/ hotfix/" >&2
    exit 1
fi

# Run formatter + re-stage
echo "[Format Hook] $(basename $repo): $format_cmd を実行中..." >&2
(cd "$repo" && eval "$format_cmd" && git add -u) || exit 1

exit 0
