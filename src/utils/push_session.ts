export interface SessionMetadata {
    camera: {
        frameRate: number
        height: number
        width: number
    }

    video: {
        bitRate: number
        container: string
    }
}

export interface SessionConfiguration {
    metadata: SessionMetadata
    retry: number
    url: string
}

type WebSocketData = Blob | ArrayBufferLike

interface SessionHandshake {
    op: 'start-stream'
    data: SessionMetadata
}

interface SessionAccept {
    op: 'accept-stream'
}

type SessionEventType = 'connect' | 'handshake' | 'open' | 'close'

export class WebSocketSession {
    private readonly config: SessionConfiguration

    private accepted: boolean = false
    private isShutdown: boolean = false

    private socket: WebSocket = undefined

    public readonly events: EventTarget = new EventTarget()

    public constructor(config: SessionConfiguration) {
        this.config = config
        this.connect()
    }

    private handleAccept(event: MessageEvent, socket: WebSocket) {
        if (socket !== this.socket)
            return

        const data = event.data

        if (typeof data !== 'string') {
            socket.close(4001, 'Handshake failure: Non-string response')
            return
        }

        let accept: SessionAccept
        try {
            accept = JSON.parse(data)
        } catch (SyntaxError) {
            socket.close(4001, 'Handshake failure: Non-JSON response')
            return
        }

        if (accept.op !== 'accept-stream') {
            socket.close(4001, 'Handshake failure: Not accepted by server')
            return
        }

        this.accepted = true

        this.events.dispatchEvent(new Event('open' as SessionEventType))
    }

    private handshake(socket: WebSocket) {
        if (socket !== this.socket)
            return

        socket.send(JSON.stringify({
            data: this.config.metadata,
            op: 'start-stream'
        } as SessionHandshake))

        socket.addEventListener('message', (event) => {
            this.handleAccept(event, socket)
        }, { once: true })

        this.events.dispatchEvent(new Event('handshake' as SessionEventType))
    }

    private connect() {
        if (this.isShutdown)
            return

        this.events.dispatchEvent(new Event('connect' as SessionEventType))

        const socket = new WebSocket(this.config.url)

        if (this.socket)
            this.socket.close(1000, 'Reconnect')
        this.socket = socket

        socket.addEventListener('close', () => {
            this.events.dispatchEvent(new Event('close' as SessionEventType))
            setTimeout(() => this.connect(), this.config.retry)
        })

        socket.addEventListener('error', (event) => {
            console.warn(`WebSocket failed: ${event}`)
        })

        socket.addEventListener('open', () => {
            this.handshake(socket)
        }, { once: true })
    }

    public shutdown() {
        this.isShutdown = true
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED)
            this.socket.close(1000, 'Reconnect')
    }
}