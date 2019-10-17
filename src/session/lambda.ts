interface FaceDetection {
    x1: number
    x2: number
    y1: number
    y2: number
}

interface FaceDetectionResult {
    faces: FaceDetection[]
}

type FaceRecognition = string

interface FaceRecognitionResult {
    faces: FaceRecognition[]
}

type MessageType = 'detection-result' | 'recognition-result' | 'user-info'

interface Message<T> {
    data: T
    op: MessageType
}

export interface LambdaServiceConfiguration {
    retry: number
    url: string
}

async function getArrayBufferFromBlob(blob: Blob) {
    return new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target.result as ArrayBuffer)
        reader.readAsArrayBuffer(blob)
    })
}

export class LambdaSession {
    public onclosed: (code: number, reason: string, remote: boolean) => void

    public ondetected: (detection: FaceDetection) => void

    public onrecognized: (recognition: FaceRecognitionResult) => void

    private closed: boolean

    private socket: WebSocket

    private stateHandler: (data: ArrayBuffer | string) => void = undefined

    public constructor(config: LambdaServiceConfiguration) {
        const socket = new WebSocket(config.url, 'lambda-complex')

        socket.addEventListener('close', (event) => {
            this.shutdown(event.code, event.reason, true, false)
        })

        socket.addEventListener('message', (event) => {
            this.handleMessage(event.data)
        })

        this.socket = socket
    }

    public getSocketState() {
        return this.socket.readyState
    }

    public async push(image: ArrayBuffer | Blob) {
        const buffer = image instanceof ArrayBuffer
            ? image
            : await getArrayBufferFromBlob(image)

        this.socket.binaryType = 'arraybuffer'
        this.socket.send(buffer)
    }

    public shutdown(code: number, reason: string, remote: boolean = false, close: boolean = true) {
        if (close) this.socket.close(code, reason)

        this.onclosed(code, reason, remote)
    }

    private handleMessage(data: ArrayBuffer | string) {
        if (this.closed) return

        if (this.stateHandler) {
            this.stateHandler(data)
            return
        }

        if (typeof data !== 'string') {
            this.shutdown(4001, 'Unexpected binary message')
            return
        }

        let message: Message<void>
        try {
            message = JSON.parse(data)
        } catch {
            this.shutdown(4001, 'Unexpected non-JSON message')
            return
        }

        try {
            switch (message.op) {
                case 'detection-result':
                    break

                default:
                    console.warn(`Unsupported server operation: ${message.op}`)
            }
        } catch (e) {
            this.shutdown(4002, `Failed to handle message: ${e.message}`)
        }
    }
}

export class LambdaService {
    public onclosed: (remote: boolean) => void

    public onconnect: () => void

    public ondetected: (detection: FaceDetection) => void

    public onrecognized: (recognition: FaceRecognitionResult) => void

    private readonly config: LambdaServiceConfiguration

    private isShutdown: boolean = false

    private session: LambdaSession

    public constructor(config: LambdaServiceConfiguration) {
        this.config = config
        this.retry()
    }

    public setShutdown() {
        this.isShutdown = true
    }

    private retry() {
        if (this.session && this.session.getSocketState() !== WebSocket.CLOSED) {
            this.session.shutdown(1000, 'Reconnect')
        }

        if (this.isShutdown) return

        const session = new LambdaSession(this.config)

        session.onclosed = (code, reason, remote) => {
            this.onclosed(remote)
            setTimeout(() => this.retry(), this.config.retry)
        }

        session.ondetected = (result) => this.ondetected(result)

        session.onrecognized = (result) => this.onrecognized(result)

        this.session = session

        if (this.onconnect) this.onconnect()
    }
}
