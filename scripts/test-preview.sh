#!/bin/bash
# Run Playwright E2E tests against the Vercel preview for the current branch.
# No auth token needed — polls the public GitHub Deployments API anonymously.
set -euo pipefail

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
SHA=$(git rev-parse HEAD)
echo "Polling Vercel preview for commit: $SHA"

for i in $(seq 1 12); do
  STATUSES_URL=$(curl -s "https://api.github.com/repos/$REPO/deployments?ref=$SHA" \
    | python3 -c "
import json, sys
deploys = json.load(sys.stdin)
previews = [d for d in deploys if d.get('environment','').startswith('Preview')]
print(previews[0]['statuses_url'] if previews else '')
" 2>/dev/null || echo "")

  if [ -n "$STATUSES_URL" ]; then
    STATUSES=$(curl -s "$STATUSES_URL")
    STATE=$(echo "$STATUSES" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['state'] if d else 'pending')" 2>/dev/null || echo "pending")
    URL=$(echo "$STATUSES" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['target_url'] if d else '')" 2>/dev/null || echo "")

    if [ "$STATE" = "success" ] && [ -n "$URL" ]; then
      echo "Preview URL: $URL"
      BASE_URL="$URL" npx playwright test "$@"
      exit 0
    elif [ "$STATE" = "failure" ] || [ "$STATE" = "error" ]; then
      echo "Vercel deployment failed — check the PR for details"
      exit 1
    fi
  fi

  echo "Waiting... attempt $i/12 — state: ${STATE:-no deployment yet}"
  sleep 10
done

echo "Timed out after 120s waiting for Vercel preview"
exit 1
