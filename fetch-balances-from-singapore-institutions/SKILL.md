---
name: generic-balance-checker
description: Check balances from Singapore financial institutions using browser automation.
compatibility: Requires bun runtime, and agent-browser npm package.
---

# Singapore Financial Website Browser Automation Methods

This document outlines techniques for extracting data from Singapore financial websites via browser automation.

## Supported Websites

| Type              | Institution         | Direct Login URL                                                      |
| ----------------- | ------------------- | --------------------------------------------------------------------- |
| **Robo-advisors** | Endowus             | https://app.sg.endowus.com/                                           |
|                   | StashAway           | https://app.stashaway.sg/log-in                                       |
|                   | Syfe                | https://www.syfe.com/login                                            |
|                   | AutoWealth          | https://www.autowealth.sg/v3/pages/login.php                          |
|                   | MoneyOwl            | https://www.moneyowl.com.sg/login                                     |
| **Bank Robo**     | DBS digiPortfolio   | https://internet-banking.dbs.com.sg/ (via iBanking)                   |
|                   | OCBC RoboInvest     | https://internet.ocbc.com/internet-banking/ (via Online Banking)      |
|                   | UOBAM Invest        | https://secure.uobam.com.sg/login                                     |
| **Banks**         | DBS                 | https://internet-banking.dbs.com.sg/                                  |
|                   | OCBC                | https://internet.ocbc.com/internet-banking/                           |
|                   | UOB                 | https://pib.uob.com.sg/PIBLogin/Public/processPreCapture.do?keyId=lpc |
|                   | Standard Chartered  | https://retail.sc.com/sg/nfs/login.htm                                |
|                   | Citibank            | https://www.citibank.com.sg/SGGCB/JSO/signon/DisplayUsernameSignon.do |
|                   | HSBC                | https://www.hsbc.com.sg/ways-to-bank/online-banking/                  |
|                   | Maybank             | https://www.maybank2u.com.sg/                                         |
| **Brokerages**    | Tiger Brokers       | https://www.itiger.com/login                                          |
|                   | moomoo              | Mobile app only (no web login)                                        |
|                   | Interactive Brokers | https://www.interactivebrokers.com.sg/sso/Login                       |
|                   | Saxo                | https://www.home.saxo/en-sg/login                                     |
|                   | DBS Vickers         | https://www1.dbsvonline.com/OTS/English/Login                         |
|                   | POEMS (Phillip)     | https://www.poems.com.sg/ (login form on homepage)                    |
|                   | FSMOne              | https://secure.fundsupermart.com/fsm/account/login                    |
|                   | uSmart              | https://www.usmart.sg/sign-in                                         |
|                   | OCBC Securities     | https://www.iocbc.com/Pages/Login.aspx                                |
|                   | UOB Kay Hian        | https://www.utrade.com.sg/                                            |
|                   | CGS-CIMB            | https://www.cgsitrade.com.sg/                                         |
| **CPF/SRS**       | CPF Board           | https://www.cpf.gov.sg/member/ds/dashboards                           |
| **Insurance**     | Singlife            | https://singlife.com/en/login                                         |
|                   | FWD                 | https://www.fwd.com.sg/portal/                                        |
|                   | Great Eastern       | https://uip.greateasternlife.com/econnect-new/#/login                 |
|                   | AIA                 | https://www.aia.com.sg/en/my-aia.html                                 |
|                   | Prudential          | https://www.prudential.com.sg/services/pruaccess                      |
|                   | NTUC Income         | https://www.income.com.sg/myincome                                    |
|                   | AXA                 | https://mypage.axa.com.sg/                                            |

## Tool Used

- **agent-browser** - CLI tool for browser automation (installed via `npm install -g agent-browser`. And then run `agent-browser install` to install Chromium)

## Authentication

### Opening the Browser (Direct Login Pages)

```bash
# Robo-advisors (direct login pages)
npx agent-browser open https://app.sg.endowus.com/ --headed
npx agent-browser open https://app.stashaway.sg/log-in --headed
npx agent-browser open https://www.syfe.com/login --headed
npx agent-browser open https://www.autowealth.sg/v3/pages/login.php --headed

# Bank Robo-advisors
npx agent-browser open https://secure.uobam.com.sg/login --headed

# Banks (internet banking login)
npx agent-browser open https://internet-banking.dbs.com.sg/ --headed
npx agent-browser open https://internet.ocbc.com/internet-banking/ --headed
npx agent-browser open "https://pib.uob.com.sg/PIBLogin/Public/processPreCapture.do?keyId=lpc" --headed
npx agent-browser open https://retail.sc.com/sg/nfs/login.htm --headed

# Brokerages (direct login pages)
npx agent-browser open https://www.itiger.com/login --headed
npx agent-browser open https://www.interactivebrokers.com.sg/sso/Login --headed
npx agent-browser open https://www.home.saxo/en-sg/login --headed
npx agent-browser open https://www1.dbsvonline.com/OTS/English/Login --headed
npx agent-browser open https://www.poems.com.sg/ --headed
npx agent-browser open https://secure.fundsupermart.com/fsm/account/login --headed
npx agent-browser open https://www.usmart.sg/sign-in --headed

# CPF
npx agent-browser open https://www.cpf.gov.sg/member/ds/dashboards --headed

# Insurance (customer portals)
npx agent-browser open https://singlife.com/en/login --headed
npx agent-browser open https://www.fwd.com.sg/portal/ --headed
npx agent-browser open "https://uip.greateasternlife.com/econnect-new/#/login" --headed
```

**CRITICAL Security Rules:**

- Always use `--headed` flag so user can see and interact
- **NEVER** ask for or handle credentials programmatically
- **NEVER** store or log passwords, OTPs, or 2FA codes
- User must log in manually in the browser window
- Many SG sites require Singpass/2FA - user must complete this themselves

### Finding Login Elements (if needed)

Note: Most URLs in the Supported Websites table go directly to login pages, so this step is often unnecessary.

```bash
npx agent-browser snapshot -i
# Common patterns:
# - link "log in" / "login" / "sign in"
# - button "Login" / "Sign In"
# - link "Personal Banking"
npx agent-browser click @e9  # Click the login ref
```

### Handling Singpass Login

Many SG financial sites use Singpass. After clicking login:

1. Wait for Singpass QR or redirect
2. User scans with Singpass app or enters credentials
3. User completes 2FA on their phone
4. Wait for redirect back to the financial site

```bash
# After user initiates Singpass login, wait for redirect
npx agent-browser wait --url "**/dashboard**"
# or
npx agent-browser wait 30000  # Wait up to 30s for user to complete
```

### Handling OTP / TOTP verification

Many SG financial sites use 2 factor authentication through SMS / EMAIL OTP or TOTP. After clicking login:

1. Wait for the user to login
2. Once you are on the OTP page, ask the user to enter the OTP into the browser.

## Navigation Methods

### Interactive Snapshot (for navigation)

```bash
npx agent-browser snapshot -i
```

Returns only interactive elements with refs like `@e1`, `@e2`, etc.

### Compact Snapshot (for data extraction)

```bash
npx agent-browser snapshot -c
```

Returns full accessibility tree with text content, useful for reading values.

### Clicking by Reference

```bash
npx agent-browser click @e5  # Click element with ref e5
```

### Clicking by Text (semantic)

```bash
npx agent-browser find text "Activity & Balances" click
npx agent-browser find text "Portfolio" click
npx agent-browser find text "Load more" click
```

### Clicking by Role

```bash
npx agent-browser find role tab click --name "Performance"
```

### Waiting

```bash
npx agent-browser wait 2000           # Wait 2 seconds
npx agent-browser wait 1500           # Wait 1.5 seconds
npx agent-browser wait --load networkidle  # Wait for network (can timeout)
```

## Data Extraction Methods

### Using JavaScript Eval

#### Extract Transaction Table

```bash
npx agent-browser eval "Array.from(document.querySelectorAll('table')[1].querySelectorAll('tbody tr')).map(row => { const cells = row.querySelectorAll('td'); return cells.length >= 4 ? [cells[0].innerText.trim(), cells[1].innerText.replace(/\\n/g, ' ').trim(), cells[2].innerText.trim(), cells[3].innerText.trim()].join(' | ') : null; }).filter(x => x && !x.includes('Load more')).join('\\n')"
```

#### Check Transaction Count

```bash
npx agent-browser eval "document.body.innerText.match(/\\d+-\\d+ of \\d+/)?.[0] || 'Count not found'"
# Returns: "1-194 of 194"
```

#### Get JSON Output

```bash
npx agent-browser eval "..." --json
```

Adds `--json` flag for machine-parseable output.

### Pagination Handling

#### Load All Transactions (loop)

```bash
for i in {1..15}; do
  npx agent-browser find text "Load more" click 2>/dev/null || break
  npx agent-browser wait 800
done
```

#### Verify All Loaded

```bash
npx agent-browser eval "document.body.innerText.match(/\\d+-\\d+ of \\d+/)?.[0]"
# Should show "1-194 of 194" (first equals total)
```

## Common Page Patterns by Platform Type

### Robo-Advisors (Endowus, StashAway, Syfe)

Common navigation elements:

- Dashboard / Home / Overview
- Portfolio / Investments
- Activity / Transactions / History
- Performance / Returns
- Goals / Portfolios (multiple accounts)

Data locations:

- Total portfolio value on dashboard
- Individual goal/portfolio breakdowns
- Transaction history with pagination
- Asset allocation charts
- Underlying fund holdings

### Banks (DBS, OCBC, UOB)

Common navigation elements:

- Accounts / My Accounts
- Deposits / Savings
- Investments / Wealth
- Cards / Credit Cards
- Transactions / History

Data locations:

- Account balances on main dashboard
- Transaction history per account
- Investment portfolio under Wealth section
- Statement downloads (PDF)

### Brokerages (Tiger, moomoo, Saxo)

Common navigation elements:

- Portfolio / Holdings
- Positions / Assets
- Orders / Trade History
- Watchlist
- Account / Balance

Data locations:

- Stock positions with P&L
- Cash balances (multi-currency)
- Trade history
- Dividends received
- Fees and commissions

### CPF Board

Key sections:

- Dashboard overview
- Ordinary Account (OA)
- Special Account (SA)
- Medisave Account (MA)
- Retirement Account (RA)
- CPF Investment Scheme holdings

Data locations:

- Account balances on dashboard
- Contribution history
- Investment scheme holdings
- Withdrawal eligibility

## Common Data Points to Extract

### Account/Portfolio Summary

| Data Point   | Common Patterns                                    |
| ------------ | -------------------------------------------------- |
| Total Value  | "Total", "Portfolio Value", "Net Worth", "Balance" |
| Cash Balance | "Cash", "Available", "Uninvested", "Buying Power"  |
| Returns      | "Return", "P&L", "Gain/Loss", "Performance"        |
| Currency     | SGD, USD, multi-currency balances                  |

### Transaction/Activity History

| Field  | Common Labels                                           |
| ------ | ------------------------------------------------------- |
| Date   | "Date", "Transaction Date", "Trade Date"                |
| Type   | Buy, Sell, Deposit, Withdrawal, Dividend, Fee, Transfer |
| Amount | "Amount", "Value", "Quantity"                           |
| Status | Completed, Pending, Processing, Failed, Cancelled       |

### Holdings/Positions

| Data Point    | Description                        |
| ------------- | ---------------------------------- |
| Asset Name    | Stock ticker, fund name, bond name |
| Quantity      | Units, shares, lots held           |
| Current Value | Market value in SGD                |
| Cost Basis    | Original purchase price            |
| P&L           | Unrealized gain/loss               |
| Allocation %  | Percentage of total portfolio      |

### Asset Allocation

| Category       | Examples                                   |
| -------------- | ------------------------------------------ |
| By Asset Class | Equities, Fixed Income, Cash, Alternatives |
| By Geography   | Singapore, US, China, Emerging Markets     |
| By Sector      | Technology, Financials, Healthcare         |
| By Risk Level  | Aggressive, Balanced, Conservative         |

### Platform-Specific Data

**Robo-advisors:**

- Goal-based portfolios with target allocations
- Underlying fund holdings with ISIN
- Projected returns and retirement simulations

**Banks:**

- Account numbers (partial/masked)
- Interest rates
- Fixed deposit maturity dates
- Credit card limits and outstanding

**Brokerages:**

- Individual stock positions
- Options/derivatives if applicable
- Margin details
- Dividend history

**CPF:**

- OA/SA/MA/RA balances
- Accrued interest
- Housing withdrawal limits
- Retirement sum status

## Error Handling

### Timeout on Network Idle

```bash
# This can timeout but page usually loads anyway
npx agent-browser wait --load networkidle
# Solution: Just proceed with snapshot
```

### Multiple Table Selector Conflict

```bash
# This fails with "strict mode violation"
npx agent-browser snapshot -s "table"
# Solution: Use full snapshot instead
npx agent-browser snapshot -c
```

### Element Not Found

```bash
# Use 2>/dev/null to suppress errors in loops
npx agent-browser find text "Load more" click 2>/dev/null || break
```

## Cleanup

```bash
npx agent-browser close
```

## Security Best Practices for SG Financial Sites

### DO:

- Always use `--headed` mode for financial sites
- Let users authenticate manually (Singpass, OTP, 2FA) -> when you face these pages, ask the user to authenticate manually
- Close browser sessions after use
- Verify you're on the correct domain before proceeding

### DON'T:

- Never capture, store, or transmit passwords
- Never ask the user to tell you their password
- Never screenshot login pages or OTP screens
- Never automate credential entry
- Never store session cookies for financial sites

### Session Management

```bash
# Save state for non-sensitive sites only
npx agent-browser state save session.json

# For financial sites, always start fresh
npx agent-browser close
npx agent-browser open <url> --headed
```

## Summary of Key Commands

| Action                   | Command                                                    |
| ------------------------ | ---------------------------------------------------------- |
| Open browser (visible)   | `npx agent-browser open <url> --headed`                    |
| Get interactive elements | `npx agent-browser snapshot -i`                            |
| Get full page data       | `npx agent-browser snapshot -c`                            |
| Click by ref             | `npx agent-browser click @e5`                              |
| Click by text            | `npx agent-browser find text "X" click`                    |
| Click by role            | `npx agent-browser find role button click --name "Submit"` |
| Wait for time            | `npx agent-browser wait 2000`                              |
| Wait for URL             | `npx agent-browser wait --url "**/dashboard**"`            |
| Run JavaScript           | `npx agent-browser eval "..."`                             |
| Get JSON output          | `npx agent-browser eval "..." --json`                      |
| Scroll page              | `npx agent-browser scroll down 500`                        |
| Take screenshot          | `npx agent-browser screenshot output.png`                  |
| Close browser            | `npx agent-browser close`                                  |

## Quick Start Template

```bash
# 1. Open financial site directly to login page (see Supported Websites table for URLs)
npx agent-browser open https://app.sg.endowus.com/ --headed

# 2. USER LOGS IN MANUALLY (Singpass, 2FA, etc.)
# Wait for user confirmation before proceeding

# 3. Navigate to portfolio/accounts
npx agent-browser snapshot -i
npx agent-browser find text "Portfolio" click
npx agent-browser wait 2000

# 4. Extract data
npx agent-browser snapshot -c  # View full page data
npx agent-browser eval "document.body.innerText" --json  # Get all text

# 5. Handle pagination if needed
npx agent-browser find text "Load More" click
npx agent-browser wait 1000

# 6. Close when done
npx agent-browser close
```
