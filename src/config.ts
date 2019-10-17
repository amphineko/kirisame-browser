import { CaptureStreamOptions } from './camera/component'
import { LambdaServiceConfiguration } from './session/lambda'
import { ImageServiceConfiguration } from './utils/image'

export interface Configuration {
    capture: CaptureStreamOptions
    image: ImageServiceConfiguration
    lambda: LambdaServiceConfiguration
}
