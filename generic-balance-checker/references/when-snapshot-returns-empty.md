# When Snapshot Returns Empty or Navigation-Only Content

**Trigger condition:** `npx agent-browser snapshot -c` returns only navigation text or empty content instead of account data.

This happens with legacy frame-based architectures (framesets with nested iframes) from the pre-2010 era. Standard `document.body.innerText` returns empty because the actual data lives in nested frames.

## Known Frame-Based Sites

| Site | Architecture | Content Location |
|------|--------------|------------------|
| DBS iBanking | frameset + 13 nested iframes | `window.frames[1].frames[11]` (main content) |
| OCBC Online Banking | Similar frame structure | Varies by page |

## Detecting Frame-Based Pages

```bash
# Check if page uses frames
npx agent-browser eval "document.documentElement.outerHTML.substring(0, 500)"
# Look for <frameset> or multiple <frame> tags

# Count top-level frames
npx agent-browser eval "window.frames.length"

# Count nested frames (if user_area exists)
npx agent-browser eval "window.frames['user_area']?.frames?.length || 'no nested frames'"
```

## Frame Traversal Techniques

### Method 1: Direct Frame Access by Name

```bash
npx agent-browser eval "window.frames['user_area'].document.body.innerText"
npx agent-browser eval "window.frames['user_area'].frames['main'].document.body.innerText"
```

### Method 2: Frame Access by Index

```bash
# Check each nested frame for content
npx agent-browser eval "var results = []; for(var i = 0; i < window.frames[1].frames.length; i++) { try { var t = window.frames[1].frames[i].document.body.innerText.substring(0, 200); if(t.length > 20) results.push(i + ': ' + t); } catch(e) { results.push(i + ': error'); } } results.join('|||')"
```

### Method 3: Search All Frames for Content

```bash
npx agent-browser eval "var found = ''; for(var i = 0; i < window.frames[1].frames.length; i++) { try { var t = window.frames[1].frames[i].document.body.innerText; if(t.includes('Balance')) { found = 'Frame ' + i + ': ' + t.substring(0, 500); break; } } catch(e) {} } found || 'Not found'"
```

## DBS iBanking Specific

DBS uses this structure:
```
window (top)
├── frame[0] "timer" (session keepalive)
└── frame[1] "user_area" (navigation shell)
    ├── iframe[0-10] "inlineframe" (modals/overlays)
    ├── iframe[11] "main" ← account data here
    └── iframe[12-13] (analytics, chat)
```

**Navigate to Deposits:**
```bash
npx agent-browser eval "window.frames['user_area'].eval(\"goToState('000000000000275','95f99ab00a6567d900b5dac42c099c5b','DepositAccountSummary')\")"
npx agent-browser wait 2000
```

**Extract deposit balances:**
```bash
npx agent-browser eval "window.frames[1].frames[11].document.body.innerText"
```

## Alternative Approaches When Frames Fail

### Screenshot + Manual Reading

```bash
npx agent-browser screenshot /tmp/balances.png
# Then read the screenshot file to extract data visually
```

### Search for Balance Patterns in Raw HTML

```bash
npx agent-browser eval "window.frames['user_area'].document.body.innerHTML.match(/\\d{1,3}(,\\d{3})*\\.\\d{2}/g)"
npx agent-browser eval "window.frames['user_area'].document.body.innerHTML.match(/SGD[^<]*\\d+[,.]\\d+/g)"
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot read property 'document' of undefined" | Frame name/index is wrong; enumerate frames first |
| Empty string from innerText | Content in deeper nested frame; go one level deeper |
| Cross-origin error | Frame is from different domain; cannot access (security restriction) |
| Content shows navigation only | You're in the shell frame; find the content frame |
