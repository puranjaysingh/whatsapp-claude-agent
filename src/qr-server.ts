/**
 * QR Code Web Server
 *
 * Serves a web page displaying the WhatsApp QR code for easy scanning.
 * This is an alternative to viewing the QR in deployment logs.
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'http'
import QRCode from 'qrcode'

interface QRServerState {
    currentQR: string | null
    isAuthenticated: boolean
    lastUpdate: Date | null
}

const state: QRServerState = {
    currentQR: null,
    isAuthenticated: false,
    lastUpdate: null
}

let server: Server | null = null

/**
 * Update the current QR code
 */
export function setQR(qr: string): void {
    state.currentQR = qr
    state.isAuthenticated = false
    state.lastUpdate = new Date()
    console.log('[QR Server] New QR code received')
}

/**
 * Mark as authenticated (hides QR, shows success message)
 */
export function setAuthenticated(): void {
    state.isAuthenticated = true
    state.currentQR = null
    state.lastUpdate = new Date()
    console.log('[QR Server] WhatsApp authenticated')
}

/**
 * Clear QR code (e.g., on disconnect)
 */
export function clearQR(): void {
    state.currentQR = null
    state.lastUpdate = new Date()
}

/**
 * Generate the HTML page
 */
async function generateHTML(): Promise<string> {
    // Authenticated state
    if (state.isAuthenticated) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Claude Agent - Connected</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    .checkmark {
      font-size: 80px;
      margin-bottom: 20px;
    }
    h1 { font-size: 28px; margin-bottom: 10px; }
    p { font-size: 16px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h1>WhatsApp Connected!</h1>
    <p>Your Claude agent is now active.</p>
    <p style="margin-top: 15px; font-size: 14px;">Send a message to start chatting.</p>
  </div>
</body>
</html>`
    }

    // QR code available
    if (state.currentQR) {
        const qrDataUrl = await QRCode.toDataURL(state.currentQR, {
            width: 280,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        })

        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Claude Agent - Scan QR</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 30px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      max-width: 400px;
    }
    h1 { font-size: 24px; margin-bottom: 20px; }
    .qr-wrapper {
      background: white;
      padding: 15px;
      border-radius: 15px;
      display: inline-block;
      margin: 20px 0;
    }
    .qr-wrapper img { display: block; }
    .instructions {
      background: rgba(255,255,255,0.15);
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
    }
    .instructions p {
      font-size: 14px;
      margin: 5px 0;
      text-align: left;
    }
    .instructions strong { color: #ffd700; }
    .refresh-note {
      margin-top: 20px;
      font-size: 12px;
      opacity: 0.7;
    }
  </style>
  <script>
    // Auto-refresh every 3 seconds to check for auth status
    setTimeout(() => location.reload(), 3000);
  </script>
</head>
<body>
  <div class="container">
    <h1>📱 Scan with WhatsApp</h1>
    <div class="qr-wrapper">
      <img src="${qrDataUrl}" alt="WhatsApp QR Code" />
    </div>
    <div class="instructions">
      <p><strong>1.</strong> Open WhatsApp on your phone</p>
      <p><strong>2.</strong> Go to Settings → Linked Devices</p>
      <p><strong>3.</strong> Tap "Link a Device"</p>
      <p><strong>4.</strong> Point your camera at this QR code</p>
    </div>
    <p class="refresh-note">Page auto-refreshes every 3 seconds</p>
  </div>
</body>
</html>`
    }

    // Waiting for QR code
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Claude Agent - Loading</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 24px; margin-bottom: 10px; }
    p { font-size: 14px; opacity: 0.8; }
  </style>
  <script>
    // Auto-refresh every 2 seconds while waiting
    setTimeout(() => location.reload(), 2000);
  </script>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Initializing...</h1>
    <p>Waiting for WhatsApp QR code</p>
    <p style="margin-top: 10px;">This page will update automatically</p>
  </div>
</body>
</html>`
}

/**
 * Handle HTTP requests
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url || '/'

    // Health check endpoint for Railway
    if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
            JSON.stringify({
                status: 'ok',
                authenticated: state.isAuthenticated,
                hasQR: !!state.currentQR
            })
        )
        return
    }

    // Status API endpoint
    if (url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
            JSON.stringify({
                authenticated: state.isAuthenticated,
                hasQR: !!state.currentQR,
                lastUpdate: state.lastUpdate?.toISOString() || null
            })
        )
        return
    }

    // Main page - serve QR code
    try {
        const html = await generateHTML()
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
    } catch (error) {
        console.error('[QR Server] Error generating page:', error)
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
    }
}

/**
 * Start the QR code web server
 */
export function startQRServer(port: number = 3000): Server {
    if (server) {
        console.log('[QR Server] Server already running')
        return server
    }

    server = createServer((req, res) => {
        handleRequest(req, res).catch((err) => {
            console.error('[QR Server] Request error:', err)
            res.writeHead(500)
            res.end('Error')
        })
    })

    server.listen(port, '0.0.0.0', () => {
        console.log(`[QR Server] Running at http://localhost:${port}`)
        console.log(`[QR Server] Open this URL in your browser to scan the QR code`)
    })

    return server
}

/**
 * Stop the QR code web server
 */
export function stopQRServer(): void {
    if (server) {
        server.close()
        server = null
        console.log('[QR Server] Stopped')
    }
}

export default {
    startQRServer,
    stopQRServer,
    setQR,
    setAuthenticated,
    clearQR
}
