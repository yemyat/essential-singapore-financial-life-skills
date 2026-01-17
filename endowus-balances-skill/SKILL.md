---
name: endowus-checker
description: Check Endowus investment account balances, transactions, and portfolio holdings. Use when the user asks to check their Endowus portfolio, see investment balances, review transactions, or get holdings breakdown.
compatibility: Requires bun runtime, and agent-browser npm package.
---

# Endowus Portfolio Checker

Check your Endowus investment account for balances, transactions, and portfolio holdings.

## Prerequisites

- `bun` runtime for TypeScript scripts (installed via `curl -fsSL https://bun.com/install | bash`)
- `agent-browser` (installed via `npm install -g agent-browser && agent-browser install`)
  - Check `references/agent-browser.md` for further instructions on how to use the `agent-browser` command.
- Active Endowus account

## Quick Start

```bash
# 1. Open Endowus in browser (user logs in manually)
npx agent-browser open https://endowus.com/ --headed

# 2. User clicks "log in" and authenticates
# 3. Once logged in, run extraction scripts from this skill directory
```

## Workflow

### Step 1: Open Browser and Authenticate

```bash
npx agent-browser open https://endowus.com/ --headed
npx agent-browser snapshot -i
# Look for "log in" link and click it
npx agent-browser click @e9  # or find the login ref
```

**IMPORTANT**: Never ask for or handle user credentials. Always prompt the user to enter credentials directly in the browser window.

Once user confirms they are logged in, proceed to extraction.

### Step 2: Extract Account Summary

Navigate to Activity & Balances:

```bash
npx agent-browser snapshot -i
# Find "Activity & Balances" button and click
npx agent-browser click @e5  # adjust ref as needed
npx agent-browser wait 2000
npx agent-browser snapshot -c  # Get full data including balances
```

Key data points:

- **Investment value**: Total portfolio value (e.g., S$77,519.06)
- **Uninvested cash**: Available cash by currency
- **Transaction history**: All deposits, investments, fees, redemptions

### Step 3: Load All Transactions

Transactions are paginated. Run this to load all:

```bash
# Run from skill directory
bun run ~/.factory/skills/endowus-checker/extract-transactions.ts
```

Or manually:

```bash
# Click "Load more" until all transactions loaded
for i in {1..15}; do
  npx agent-browser find text "Load more" click 2>/dev/null || break
  npx agent-browser wait 800
done

# Extract all transaction data
npx agent-browser eval "Array.from(document.querySelectorAll('table')[1].querySelectorAll('tbody tr')).map(row => { const cells = row.querySelectorAll('td'); return cells.length >= 4 ? [cells[0].innerText.trim(), cells[1].innerText.replace(/\\n/g, ' ').trim(), cells[2].innerText.trim(), cells[3].innerText.trim()].join(' | ') : null; }).filter(x => x && !x.includes('Load more')).join('\\n')"
```

### Step 4: Extract Portfolio Holdings

Navigate to Portfolio section:

```bash
npx agent-browser find text "Portfolio" click
npx agent-browser wait 2000
npx agent-browser snapshot -c
```

Or run the extraction script:

```bash
bun run ~/.factory/skills/endowus-checker/extract-portfolio.ts
```

Key data points:

- **Asset allocation**: Fixed income vs Equities %
- **Underlying funds**: Fund names with ISIN and allocation %
- **Top 10 holdings**: Individual stocks/bonds
- **Top 10 markets**: Geographic allocation
- **Top 10 sectors**: Sector breakdown

### Step 5: Check Individual Goals

For each goal (Retirement, Kylo's College, etc.):

```bash
npx agent-browser snapshot -i
# Click on goal name in sidebar
npx agent-browser click @e13  # e.g., Retirement
npx agent-browser wait 1500
npx agent-browser snapshot -c  # Get goal overview
```

Each goal shows:

- Investment value
- Total return (amount and %)
- Recurring investment setup
- Target asset allocation
- Performance projections

To see goal performance history:

```bash
npx agent-browser find role tab click --name "Performance"
npx agent-browser wait 1500
npx agent-browser snapshot -c
```

## Output Format

### Balances Summary

```
Total Investment Value: S$XX,XXX.XX
Uninvested Cash: S$X.XX

Goals:
- Retirement: S$XX,XXX.XX (+XX.XX%)
- Kylo's College: S$XX,XXX.XX (+XX.XX%)
```

### Holdings Summary

```
Asset Allocation: XX% Equities, XX% Fixed Income

Top Holdings:
1. NVIDIA Corp - X.XX%
2. Apple Inc - X.XX%
...

Top Markets:
1. United States - XX.XX%
2. Japan - X.XX%
...
```

## Edge Cases

1. **Redeemed funds**: Will show N/A for current holdings but historical performance is available
2. **Multiple tables**: Use full `snapshot -c`, not CSS selector scoping
3. **Timeout on navigation**: Page usually loads anyway, proceed with snapshot
4. **Session expiry**: If logged out, restart from Step 1

## Cleanup

```bash
npx agent-browser close
```
