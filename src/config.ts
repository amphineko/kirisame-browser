import { SessionConfiguration as ImageSessionConfiguration } from './utils/image_session'
import { ImageServiceConfiguration } from './utils/image'

export interface CaptureOptions {
    frameRate: number
    height: number
    width: number
}

export interface StreamingOptions {
    bitRate: number
    mime: string
    retry: number // interval between every reconnect attempt
    url: string
}

export interface Configuration {
    capture: CaptureOptions
    image: ImageSessionConfiguration & ImageServiceConfiguration
    streaming: StreamingOptions
}
