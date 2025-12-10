import { EventEmitter } from 'events'
import { ConversationHistory } from './history.ts'
import { MessageQueue } from './queue.ts'
import type { ClaudeBackend } from '../claude/backend.ts'
import { PermissionManager } from '../claude/permissions.ts'
import { isCommand, parseCommand } from '../whatsapp/messages.ts'
import type { Config, IncomingMessage, PermissionMode, AgentEvent } from '../types.ts'
import type { Logger } from '../utils/logger.ts'

export class ConversationManager extends EventEmitter {
    private history: ConversationHistory
    private queue: MessageQueue
    private permissions: PermissionManager
    private backend: ClaudeBackend
    private config: Config
    private logger: Logger

    constructor(backend: ClaudeBackend, config: Config, logger: Logger) {
        super()
        this.backend = backend
        this.config = config
        this.logger = logger
        this.history = new ConversationHistory()
        this.queue = new MessageQueue(logger)
        this.permissions = new PermissionManager(logger)

        // Wire up permission requests
        this.backend.setPermissionCallback((toolName, description, input) =>
            this.permissions.requestPermission(toolName, description, input)
        )

        this.permissions.on('permission-request', (request) => {
            this.emit('event', { type: 'permission-request', request } as AgentEvent)
        })
    }

    /**
     * Handle an incoming message
     */
    async handleMessage(
        message: IncomingMessage,
        sendResponse: (text: string) => Promise<void>,
        sendTyping: () => Promise<void>
    ): Promise<void> {
        // Check if this is a permission response
        if (this.permissions.pendingCount > 0) {
            const resolved = this.permissions.tryResolveFromMessage(message.text)
            if (resolved) {
                return
            }
        }

        // Check for commands
        if (isCommand(message.text)) {
            await this.handleCommand(message, sendResponse)
            return
        }

        // Regular message - process with Claude
        await this.processWithClaude(message, sendResponse, sendTyping)
    }

    private async handleCommand(
        message: IncomingMessage,
        sendResponse: (text: string) => Promise<void>
    ): Promise<void> {
        const parsed = parseCommand(message.text)
        if (!parsed) return

        switch (parsed.command) {
            case 'clear':
                this.history.clear()
                await sendResponse('✓ Conversation cleared.')
                break

            case 'readonly':
            case 'plan':
                this.setMode('plan')
                await sendResponse('✓ Switched to *plan* mode. Claude can only read files.')
                break

            case 'normal':
            case 'default':
                this.setMode('default')
                await sendResponse(
                    '✓ Switched to *default* mode. Claude will ask permission for writes.'
                )
                break

            case 'acceptedits':
            case 'accept-edits':
                this.setMode('acceptEdits')
                await sendResponse(
                    '✓ Switched to *acceptEdits* mode. Claude can edit files without asking.'
                )
                break

            case 'yolo':
            case 'bypass':
            case 'bypasspermissions':
                this.setMode('bypassPermissions')
                await sendResponse(
                    '⚠️ Switched to *bypassPermissions* mode. Claude has full access without confirmation!'
                )
                break

            case 'dontask':
            case 'dont-ask':
                this.setMode('dontAsk')
                await sendResponse(
                    '✓ Switched to *dontAsk* mode. Claude will not prompt, denies if not pre-approved.'
                )
                break

            case 'mode':
                await sendResponse(`Current mode: *${this.config.mode}*`)
                break

            case 'help':
                await sendResponse(this.getHelpMessage())
                break

            case 'status':
                await sendResponse(this.getStatusMessage())
                break

            default:
                await sendResponse(
                    `Unknown command: /${parsed.command}\n\nType /help for available commands.`
                )
        }
    }

    private async processWithClaude(
        message: IncomingMessage,
        sendResponse: (text: string) => Promise<void>,
        sendTyping: () => Promise<void>
    ): Promise<void> {
        this.logger.info('Processing message with Claude...')

        // Indicate typing
        await sendTyping()

        // Add to history
        this.history.addUserMessage(message)

        try {
            // Query Claude
            this.logger.info('Sending query to Claude backend...')
            const response = await this.backend.query(message.text, this.history.getHistory())
            this.logger.info(`Claude response received (${response.text.length} chars)`)

            if (response.error) {
                await sendResponse(`❌ Error: ${response.error}`)
                return
            }

            // Add response to history
            this.history.addAssistantMessage(response.text)

            // Log tools used (verbose only)
            if (response.toolsUsed && response.toolsUsed.length > 0) {
                this.logger.debug(`Tools used: ${response.toolsUsed.join(', ')}`)
            }

            await sendResponse(response.text)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            this.logger.error(`Error processing message: ${errorMessage}`)
            await sendResponse(`❌ An error occurred: ${errorMessage}`)
        }
    }

    private setMode(mode: PermissionMode): void {
        this.config.mode = mode
        this.backend.setMode(mode)
        this.logger.info(`Mode changed to: ${mode}`)
    }

    /**
     * Resolve a pending permission request
     */
    resolvePermission(requestId: string, allowed: boolean): boolean {
        return this.permissions.resolvePermission(requestId, allowed)
    }

    private getHelpMessage(): string {
        return `*Available Commands:*

/clear - Clear conversation history
/mode - Show current permission mode
/plan - Switch to plan mode (read-only)
/default - Switch to default mode (asks for permission)
/acceptEdits - Auto-accept file edits
/bypass - Bypass all permissions (dangerous!)
/dontAsk - Deny if not pre-approved
/status - Show agent status
/help - Show this help message

*Permission Modes:*
• *plan* - Claude can only read files
• *default* - Claude asks before writing
• *acceptEdits* - Auto-accept file edits
• *bypassPermissions* - Full access (dangerous!)
• *dontAsk* - Deny if not pre-approved`
    }

    private getStatusMessage(): string {
        return `*Agent Status:*

📁 Working directory: \`${this.config.directory}\`
🔐 Mode: ${this.config.mode}
🤖 Model: ${this.config.model}
💬 Conversation length: ${this.history.length} messages
⏳ Pending permissions: ${this.permissions.pendingCount}`
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.permissions.cancelAll()
        this.queue.clear()
        this.history.clear()
    }
}
