# One-Click Deploy

Deploy your own WhatsApp Claude Agent in minutes.

## Quick Start

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YOUR_TEMPLATE_ID)

> **Note:** Replace `YOUR_TEMPLATE_ID` with your actual Railway template ID after creating it.

---

## Setup Steps

### 1. Click the Deploy Button

Click the "Deploy on Railway" button above. You'll need a [Railway account](https://railway.app/) (free tier available, $5/mo for persistent sessions).

### 2. Configure Environment Variables

Railway will prompt you for these values:

| Variable             | Required | Description                                                               |
| -------------------- | -------- | ------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`  | ✅ Yes   | Your API key from [console.anthropic.com](https://console.anthropic.com/) |
| `WHATSAPP_WHITELIST` | ✅ Yes   | Your phone number with country code (e.g., `14155551234`)                 |

### 3. Deploy and Wait

Click **"Deploy"** and wait 2-3 minutes for the build to complete.

### 4. Scan the QR Code

**Option A: Web Page (Easiest)**

1. Once deployed, click on your service in Railway
2. Find the public URL (e.g., `https://your-app.up.railway.app`)
3. Open it in your browser — you'll see the QR code
4. Scan with WhatsApp

**Option B: Deployment Logs**

1. Go to your Railway dashboard
2. Click on your deployment
3. Click **"View Logs"**
4. Find the QR code in the terminal output
5. Scan with WhatsApp

**To scan:**

1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices**
3. Tap **"Link a Device"**
4. Point your camera at the QR code

### 5. Start Chatting!

Send a message via WhatsApp. Your Claude agent will respond!

---

## Configuration Options

| Variable             | Default                    | Description                                                                    |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| `ANTHROPIC_API_KEY`  | —                          | Your Anthropic API key (required)                                              |
| `WHATSAPP_WHITELIST` | —                          | Allowed phone numbers, comma-separated (required)                              |
| `PERMISSION_MODE`    | `default`                  | Claude permission mode (`default`, `acceptEdits`, `bypassPermissions`, `plan`) |
| `WORKING_DIRECTORY`  | `/app`                     | Directory for file operations                                                  |
| `AGENT_NAME`         | `Claude`                   | Custom name for your agent                                                     |
| `MODEL`              | `claude-sonnet-4-20250514` | Claude model to use                                                            |
| `PORT`               | `3000`                     | Port for QR web server                                                         |

---

## Troubleshooting

### QR code expired or not showing

**Solution:** Restart your deployment

1. Go to Railway Dashboard → Your Project
2. Click **Deployments** → **Redeploy**
3. Wait for restart, then scan new QR

### Bot not responding

**Check these:**

- ✅ Your phone number is in `WHATSAPP_WHITELIST`
- ✅ Your `ANTHROPIC_API_KEY` is valid
- ✅ Check deployment logs for errors

### "Session disconnected" messages

WhatsApp sessions can disconnect periodically. Simply redeploy to generate a new QR code.

### Rate limited by WhatsApp

WhatsApp limits messages to ~1000-2000 per day. If you hit this limit, wait 24 hours.

---

## Costs

| Service             | Cost                                                       |
| ------------------- | ---------------------------------------------------------- |
| Railway (Free tier) | $0/mo (sessions may not persist)                           |
| Railway (Paid)      | ~$5/mo (persistent sessions)                               |
| Anthropic API       | Pay-per-use ([pricing](https://www.anthropic.com/pricing)) |

---

## Security Notes

- **API Key:** Your Anthropic API key is stored securely in Railway's environment variables
- **Whitelist:** Only phone numbers in `WHATSAPP_WHITELIST` can interact with your bot
- **Sessions:** WhatsApp sessions are stored in a volume (paid tier) or regenerated on restart (free tier)

---

## Updating

To update to the latest version:

1. Go to Railway Dashboard → Your Project
2. Click **Settings** → **Check for updates** (if using template)
3. Or manually redeploy from the latest commit

---

## Support

- [GitHub Issues](https://github.com/YOUR_USERNAME/whatsapp-claude-agent/issues)
- [WhatsApp Claude Agent Documentation](https://github.com/dsebastien/whatsapp-claude-agent)
