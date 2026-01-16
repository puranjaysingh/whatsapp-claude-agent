# Integration Instructions

This guide explains how to integrate the QR web server into the WhatsApp Claude Agent.

---

## Overview

The original `whatsapp-claude-agent` app already emits QR events. We need to:

1. Add the `qr-server.ts` module
2. Start the QR server on app initialization
3. Listen for QR and connection events
4. Add the `qrcode` npm package

---

## Step 1: Add Dependencies

Add the `qrcode` package to your `package.json`:

```bash
bun add qrcode
bun add -d @types/qrcode
```

Or manually add to `package.json`:

```json
{
    "dependencies": {
        "qrcode": "^1.5.3"
    },
    "devDependencies": {
        "@types/qrcode": "^1.5.5"
    }
}
```

---

## Step 2: Add the QR Server Module

Copy `src/qr-server.ts` to your forked repo's `src/` directory.

---

## Step 3: Modify src/index.ts

Find the main entry point (`src/index.ts`) and add the QR server integration.

### 3a. Add Import

At the top of `src/index.ts`, add:

```typescript
import { startQRServer, setQR, setAuthenticated, clearQR } from './qr-server'
```

### 3b. Start QR Server

In the initialization section (before WhatsApp client connects), add:

```typescript
// Start QR code web server
const port = parseInt(process.env.PORT || '3000', 10)
startQRServer(port)
```

### 3c. Listen for Events

The WhatsApp client emits events. Find where the client is created and add event listeners:

```typescript
// Example: If client emits 'event' with { type: 'qr', qr: string }
client.on('event', (event) => {
    if (event.type === 'qr') {
        setQR(event.qr)
    }
    if (event.type === 'authenticated' || event.type === 'ready') {
        setAuthenticated()
    }
    if (event.type === 'disconnected') {
        clearQR()
    }
})
```

---

## Step 4: Expose Port in Dockerfile

The provided `Dockerfile` already includes:

```dockerfile
EXPOSE 3000
```

This tells Railway to expose port 3000.

---

## Step 5: Update railway.json (Optional)

If you want Railway health checks, the provided `railway.json` includes:

```json
{
    "deploy": {
        "healthcheckPath": "/health",
        "healthcheckTimeout": 30
    }
}
```

The QR server responds to `/health` with a JSON status.

---

## Full Example: Modified index.ts

Here's a conceptual example of what the modified `src/index.ts` might look like:

```typescript
import { WhatsAppClient } from './whatsapp/client'
import { startQRServer, setQR, setAuthenticated, clearQR } from './qr-server'

async function main() {
    // Start QR web server
    const port = parseInt(process.env.PORT || '3000', 10)
    startQRServer(port)

    // Initialize WhatsApp client
    const client = new WhatsAppClient(config, logger)

    // Listen for QR and connection events
    client.on('event', (event) => {
        switch (event.type) {
            case 'qr':
                setQR(event.qr)
                break
            case 'authenticated':
            case 'ready':
                setAuthenticated()
                break
            case 'disconnected':
                clearQR()
                break
        }
    })

    // Connect to WhatsApp
    await client.connect()
}

main().catch(console.error)
```

> **Note:** The actual code structure may differ. Examine the real `src/index.ts` and `src/whatsapp/client.ts` files in the repo to find the correct integration points.

---

## Verification

After integration:

1. Build the project:

    ```bash
    bun run build
    ```

2. Run locally:

    ```bash
    bun run start
    ```

3. Open `http://localhost:3000` in your browser

4. You should see:
    - "Initializing..." message while waiting
    - QR code once generated
    - "Connected!" message after scanning

---

## Troubleshooting

### "Cannot find module './qr-server'"

Make sure `src/qr-server.ts` is in the correct location and the import path matches.

### QR not appearing on web page

Check that the event listener is correctly wired up. Add console logs:

```typescript
client.on('event', (event) => {
    console.log('Event received:', event.type)
    // ...
})
```

### Port already in use

Change the `PORT` environment variable or modify the default in `qr-server.ts`.

---

## Files Summary

After integration, your repo should have these new/modified files:

```
whatsapp-claude-agent/
├── Dockerfile              # NEW
├── railway.json            # NEW
├── .env.example            # NEW
├── README.md               # MODIFIED (add deploy section)
├── package.json            # MODIFIED (add qrcode dep)
├── src/
│   ├── qr-server.ts        # NEW
│   ├── index.ts            # MODIFIED
│   └── ...
└── ...
```
