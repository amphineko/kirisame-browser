export interface ImageServiceConfiguration {
    height: number
    type: string
    width: number
}

export class ImageService {
    private readonly canvas: HTMLCanvasElement

    private readonly config: ImageServiceConfiguration

    private readonly video: HTMLVideoElement

    public constructor(config: ImageServiceConfiguration) {
        this.config = config

        this.canvas = document.createElement('canvas')
        this.canvas.height = config.height
        this.canvas.width = config.width

        this.video = document.createElement('video')
        this.video.autoplay = true
        this.video.height = config.height
        this.video.muted = true
        this.video.width = config.width
    }

    public async getBlob(): Promise<Blob> {
        return new Promise((resolve) => {
            const ctx = this.canvas.getContext('2d')
            ctx.drawImage(this.video, 0, 0)
            this.canvas.toBlob((blob) => resolve(blob), this.config.type)
        })
    }

    public setVideoSourceObject(srcObject: MediaStream | MediaSource | Blob | null) {
        this.video.srcObject = srcObject
        this.video.play()
    }
}
