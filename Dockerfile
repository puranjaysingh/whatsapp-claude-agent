FROM oven/bun:1-debian

# Install Chrome/Chromium dependencies for Puppeteer
# These are required for whatsapp-web.js to run headless Chrome
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    dumb-init \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configure Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build || true

# Create directories for WhatsApp session persistence
RUN mkdir -p /app/.wwebjs_auth /app/.wwebjs_cache \
    && chown -R appuser:appuser /app

# Note: For session persistence, attach a Railway volume to /app/.whatsapp-claude-agent
# See: https://docs.railway.com/reference/volumes

# Expose port for QR code web server
EXPOSE 3000

# Switch to non-root user
USER appuser

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "run", "start"]
