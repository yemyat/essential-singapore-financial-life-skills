# Un-open Banking Agent Skill (Singapore)

A collection of AI [agent skills](https://agentskills.io/) that helps users pull their data from Singapore financial institutions.

## Installation

```bash
npx add-skill yemyat/essential-singapore-financial-life-skills
```

## Prerequisites

These skills require the following to be installed:

```bash
# Bun runtime
curl -fsSL https://bun.sh/install | bash

# Vercel's agent-browser and Chromium
npm install -g agent-browser
agent-browser install  # Download Chromium
```

## Available Skills

| Skill                     | Description                                                                   |
| ------------------------- | ----------------------------------------------------------------------------- |
| `generic-balance-checker` | Check balances from Singapore financial institutions using browser automation |

These skills use browser automation rather than private APIs whenever possible so that we can support web versions of as many financial institutions in Singapore as possible.

## Motivation

Singapore's "open banking" isn't really open. The latest attempt, [SG FinDex](https://www.mas.gov.sg/development/fintech/sgfindex), launched with great promises but quietly faded in 2024.

The problem? There are no fintechs in the program. I've never seen a single fintech integrated with SG FinDex—neither as a data provider nor as a consumer of financial data. We can speculate why, but the reality is clear: there's a gap in the market that no one seems able (or willing) to solve.

(Thus, the name un-open banking)

So this project takes a different approach: it teaches AI agents to scrape your own financial data on your behalf. And it does so in a more privacy-respecting way—your credentials stay local, you watch everything happen in real-time, and no credential data (username, password, cookies, tokens) passes through LLMs.

## Important Information

### Security & Privacy

- **Your credentials never go through LLMs.** When the agent reaches a login page, you'll need to manually enter your username, password, and complete any 2FA in the browser window that the agent opens.
- **Session cookies are not saved.** For safety reasons, we don't persist any session data. If you think we should save them securely (e.g., iCloud Keychain), please [create an issue](https://github.com/yemyat/essential-singapore-financial-life-skills/issues) to discuss.
- **No private APIs are used.** Everything is done through browser automation, which you can observe in real-time.

### Usage Tips

- **Browser closes after extraction.** By default, the agent closes the browser session after grabbing the information you need. If you want to ask follow-up questions or continue browsing, tell the agent explicitly to keep the browser window open.

## Example Use Cases

### 1. Net Worth Tracking

Ask Claude or any agent that supports [Skills](https://agentskills.io) to update your balances across all your financial accounts.

- **Automate it:** Set this up as a scheduled job on your machine so your computer does it automatically every week.
- **Track over time:** Ask the agent to dump balances into a markdown file with the date each week for historical analysis.

### 2. Portfolio Analysis

Ask the agent to export all your detailed holdings (even from robo-advisor portfolios) into an Excel or markdown file. You can then query and analyze your asset allocation, sector exposure, or performance.

## Supported Websites

See [supported-websites.md](./generic-balance-checker/references/supported-websites.md) for the full list of supported financial institutions.

### Feedback

If you have suggestions for improving the login flow or any other part of the experience, please [create a GitHub issue](https://github.com/yemyat/essential-singapore-financial-life-skills/issues). Looking for feedback!

## License

MIT
