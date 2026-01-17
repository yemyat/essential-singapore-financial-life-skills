# agent-browser Quick Reference

Fallback tool for when direct fetch fails due to Cloudflare protection changes.

## Installation

```bash
npm install -g agent-browser
agent-browser install  # Download Chromium
```

Or run `scripts/install-prerequisites.sh`.

## Core Workflow

1. **Navigate**: `agent-browser open <url>`
2. **Snapshot**: `agent-browser snapshot -i` (returns elements with refs like `@e1`, `@e2`)
3. **Interact**: Use refs from snapshot to click, fill, etc.
4. **Re-snapshot**: After navigation or DOM changes

## Essential Commands

### Navigation

```bash
agent-browser open <url>      # Navigate to URL
agent-browser back            # Go back
agent-browser reload          # Reload page
agent-browser close           # Close browser
```

### Snapshot (page analysis)

```bash
agent-browser snapshot        # Full accessibility tree
agent-browser snapshot -i     # Interactive elements only (recommended)
agent-browser snapshot -c     # Compact output
```

### Interactions (use @refs from snapshot)

```bash
agent-browser click @e1           # Click element
agent-browser fill @e2 "text"     # Clear and type in input
agent-browser type @e2 "text"     # Type without clearing
agent-browser press Enter         # Press key
agent-browser select @e1 "value"  # Select dropdown option
agent-browser scroll down 500     # Scroll page
```

### Get Information

```bash
agent-browser get text @e1        # Get element text
agent-browser get value @e1       # Get input value
agent-browser get url             # Get current URL
```

### Execute JavaScript

```bash
agent-browser eval "return document.title"
agent-browser eval "
  const res = await fetch('/api/endpoint');
  return await res.json();
"
```

### Screenshots

```bash
agent-browser screenshot          # Screenshot to stdout
agent-browser screenshot path.png # Save to file
agent-browser screenshot --full   # Full page
```

### Wait

```bash
agent-browser wait @e1                # Wait for element
agent-browser wait 2000               # Wait milliseconds
agent-browser wait --text "Success"   # Wait for text
agent-browser wait --load networkidle # Wait for network idle
```

## Sessions (parallel browsers)

Use sessions to run multiple browser instances:

```bash
agent-browser --session site1 open https://99.co
agent-browser --session site2 open https://propertyguru.com.sg
agent-browser session list
agent-browser --session site1 close
```

## JSON Output

Add `--json` for machine-readable output:

```bash
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

## Debugging

```bash
agent-browser open example.com --headed  # Show browser window
agent-browser console                    # View console messages
agent-browser errors                     # View page errors
```
