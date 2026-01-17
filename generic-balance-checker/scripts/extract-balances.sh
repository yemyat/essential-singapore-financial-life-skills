#!/bin/bash
# Generic balance extraction helper
# Searches for common balance patterns in page content

echo "=== Balance Extraction ==="

echo "Attempting standard extraction:"
npx agent-browser eval "document.body.innerText" --json 2>/dev/null | head -100

echo ""
echo "Searching for SGD amounts:"
npx agent-browser eval "document.body.innerText.match(/SGD[\\s]*[\\d,]+\\.\\d{2}/g) || 'No SGD amounts found'"

echo ""
echo "Searching for currency patterns:"
npx agent-browser eval "document.body.innerText.match(/\\d{1,3}(,\\d{3})*\\.\\d{2}/g)?.slice(0, 10) || 'No currency patterns found'"
