#!/bin/bash
# Load all transactions by clicking "Load more" repeatedly
# Usage: ./load-all-transactions.sh [max_iterations]

MAX_ITERATIONS=${1:-15}

for i in $(seq 1 $MAX_ITERATIONS); do
  npx agent-browser find text "Load more" click 2>/dev/null || break
  npx agent-browser wait 800
done

# Verify all loaded
npx agent-browser eval "document.body.innerText.match(/\\d+-\\d+ of \\d+/)?.[0] || 'Count not found'"
