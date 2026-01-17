# Essential Singapore Financial Life Skills

A collection of skills for managing personal finance tasks in Singapore.

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

## Important Information

### Security & Privacy

- **Your credentials never go through LLMs.** When the agent reaches a login page, you'll need to manually enter your username, password, and complete any 2FA in the browser window that the agent opens.
- **Session cookies are not saved.** For safety reasons, we don't persist any session data. If you think we should save them securely (e.g., iCloud Keychain), please [create an issue](https://github.com/yemyat/essential-singapore-financial-life-skills/issues) to discuss.
- **No private APIs are used.** Everything is done through browser automation, which you can observe in real-time.

### Usage Tips

- **Browser closes after extraction.** By default, the agent closes the browser session after grabbing the information you need. If you want to ask follow-up questions or continue browsing, tell the agent explicitly to keep the browser window open.

### Feedback

If you have suggestions for improving the login flow or any other part of the experience, please [create a GitHub issue](https://github.com/yemyat/essential-singapore-financial-life-skills/issues). Looking for feedback!

## License

MIT
