#!/bin/bash
# Detect if current page uses frame-based architecture
# Returns frame count and structure info

echo "=== Frame Detection ==="

echo "Top-level frames:"
npx agent-browser eval "window.frames.length"

echo ""
echo "Checking for frameset in HTML:"
npx agent-browser eval "document.documentElement.outerHTML.substring(0, 500).includes('frameset') ? 'FRAMESET DETECTED' : 'No frameset'"

echo ""
echo "Nested frames (if user_area exists):"
npx agent-browser eval "window.frames['user_area']?.frames?.length || 'no user_area frame'"

echo ""
echo "Frame content preview:"
npx agent-browser eval "var results = []; for(var i = 0; i < Math.min(window.frames.length, 5); i++) { try { var t = window.frames[i].document.body?.innerText?.substring(0, 100) || 'empty'; results.push('Frame ' + i + ': ' + t.replace(/\\n/g, ' ')); } catch(e) { results.push('Frame ' + i + ': access denied'); } } results.join('\\n')"
