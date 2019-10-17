import React, { useState, useEffect } from 'react'

import { LocalCameraComplex } from './camera/component'
import { Configuration } from './config'
import { LambdaComplex } from './session/component'
import { ImageService } from './utils/image'

import './app.css'

let imageService: ImageService

export function AppMain(props: {
    config: Configuration
}) {
    const { config } = props
    const { capture: captureOptions, image: imageOptions, lambda: lambdaOptions } = config

    const [stream, setStream] = useState<MediaStream>(undefined)

    function updateStream(newStream: MediaStream) {
        if (newStream !== stream) {
            imageService.setVideoSourceObject(newStream)
            setStream(newStream)
        }
    }

    useEffect(() => {
        if (!imageService) {
            imageService = new ImageService(imageOptions)
        }
    }, [imageOptions])

    return (
        <div className="app-main">
            <LambdaComplex config={lambdaOptions} stream={stream} />
            <LocalCameraComplex
                streamOptions={captureOptions}
                onstreamchanged={(newStream) => { updateStream(newStream) }}
            />
        </div>
    )
}
