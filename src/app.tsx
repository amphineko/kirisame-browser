import { AssertionError } from 'assert'
import React, { useState, useEffect } from 'react'

import { CameraPlayer } from './camera/player'
import { DeviceSelector } from './camera/device_selector'
import { Configuration, CaptureOptions } from './config'
import { ImageSession } from './utils/image_session'
import { ImageService } from './utils/image'
import { AppStateDisplay, AppState } from './utils/state'

import './app.css'

function configureDevice(config: CaptureOptions, deviceId?: string): Promise<MediaStream> {
    const constrians = {
        audio: false,
        video: {
            frameRate: config.frameRate,
            height: config.height,
            width: config.width,
        },
    } as MediaStreamConstraints

    if (typeof deviceId === 'string' && deviceId.length > 0) {
        (constrians.video as MediaTrackConstraints).deviceId = deviceId
    }

    return navigator.mediaDevices.getUserMedia(constrians)
}

export function AppMain(props: {
    config: Configuration
}) {
    const [stream, setStream] = useState<MediaStream>(undefined)
    const [appState, setAppState] = useState<AppState>('init')

    const videoConstriants = stream instanceof MediaStream
        ? stream.getVideoTracks()[0].getConstraints()
        : undefined

    const currentDeviceId = videoConstriants && videoConstriants.deviceId
        ? videoConstriants.deviceId[0] : undefined

    function updateDeviceId(deviceId?: string) {
        configureDevice(props.config.capture, deviceId).then((newStream) => {
            if (newStream !== stream) { // prevent unnecessary update
                if (stream.getVideoTracks().length === 0) {
                    throw new AssertionError({ message: 'Stream should has at lease one video track' })
                }
                setStream(newStream)
            }
        }).catch((error) => {
            setStream(undefined)
            console.error(`Cannot start user device: ${error}`)
        })
    }

    if (stream === undefined) {
        // initialize default device
        updateDeviceId(undefined)
    }

    useEffect(() => {
        let imageClient: ImageSession
        const imageService = new ImageService(props.config.image)
        imageService.setVideoSourceObject(stream)

        if (stream) { // has active stream
            imageClient = new ImageSession(props.config.image)
            imageClient.onclose = () => setAppState('retry')
            imageClient.onopen = () => setAppState('connected')
            imageClient.onrequest = () => imageService.getBlob().then((blob) => {
                const reader = new FileReader()
                reader.readAsArrayBuffer(blob)
                reader.onload = (event) => {
                    imageClient.send(event.target.result as ArrayBuffer)
                }
            })
        }

        return () => {
            if (imageClient) {
                imageClient.shutdown()
            }
        }
    }, [stream, props])

    return (
        <div className="app-container">
            <AppStateDisplay state={appState} />

            <CameraPlayer stream={stream} />

            <DeviceSelector
                currentDeviceId={currentDeviceId}
                onDeviceSelected={(deviceId) => updateDeviceId(deviceId)}
                onStop={() => setStream(undefined)}
            />
        </div>
    )
}
