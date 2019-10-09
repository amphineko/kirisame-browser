import { AssertionError } from 'assert'

type OperationType = 'request-frame'

interface Operation {
    op: OperationType
}

interface RequestCaptureAction extends Operation {
    op: 'request-frame'
}

export interface SessionConfiguration {
    retry: number
    url: string
}

export class ImageSession {
    public onclose: () => void

    public onopen: () => void

    public onrequest: () => void

    private readonly config: SessionConfiguration

    private isShutdown: boolean

    private socket: WebSocket

    public constructor(config: SessionConfiguration) {
        this.config = config
        this.connect()
    }

    public send(data: ArrayBuffer) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return
        }

        this.socket.binaryType = 'arraybuffer'
        this.socket.send(data)
    }

    public shutdown() {
        this.isShutdown = true
        this.socket.close(1000, 'Manual shutdown')
    }

    private connect() {
        if (this.isShutdown) {
            return
        }

        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
            this.socket.close(1000, 'Manual shutdown')
        }

        const socket = new WebSocket(this.config.url, 'image-request')
        socket.onclose = () => {
            setTimeout(() => this.connect(), this.config.retry)
            if (typeof this.onclose === 'function') {
                this.onclose()
            }
        }
        socket.onopen = () => {
            if (typeof this.onopen === 'function') {
                this.onopen()
            }
        }
        socket.onmessage = (event) => this.handleMessage(event)

        this.socket = socket
    }

    private handleMessage(event: MessageEvent) {
        const data = event.data as string

        if (typeof data !== 'string') {
            this.socket.close(4001, 'Invalid operation message')
            return
        }

        const operation = JSON.parse(data) as Operation
        switch (operation.op) {
            case 'request-frame':
                if (this.onrequest) {
                    if (typeof this.onrequest === 'function') {
                        this.onrequest()
                    } else {
                        throw new AssertionError({ message: 'onrequest should be a function' })
                    }
                }
                break
            default:
                this.socket.close(4001, 'Operation type is not implemented')
                break
        }
    }
}
