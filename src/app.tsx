import React, { useState, useEffect } from 'react'

import { CameraPlayer } from './camera/player'
import { DeviceSelector } from './camera/device_selector'
import { AppStateDisplay, AppState } from './utils/state'
// import { WebSocketSession } from './utils/push_session'

import './app.css'
import { ImageSession } from './utils/image_session'
import { ImageService } from './utils/image'
import { Configuration } from './config'

export function AppMain(props: {
    config: Configuration
}) {
    const [stream, setStream] = useState<MediaStream>(undefined)
    const [appState, setAppState] = useState<AppState>('init')

    const videoConstriants = stream instanceof MediaStream
        ? stream.getVideoTracks()[0].getConstraints() : undefined

    const currentDeviceId = videoConstriants && videoConstriants.deviceId
        ? videoConstriants.deviceId[0] : undefined

    function configureDevice(deviceId: string) {
        const constrians = {
            audio: false,
            video: {
                frameRate: props.config.capture.frameRate,
                height: props.config.capture.height,
                width: props.config.capture.width,
            },
        } as MediaStreamConstraints

        if (typeof deviceId === 'string' && deviceId.length > 0) {
            (constrians.video as MediaTrackConstraints).deviceId = deviceId
        }

        navigator.mediaDevices.getUserMedia(constrians).then((media) => {
            setStream(media)
        }).catch((error) => {
            setStream(undefined)
            console.error(`Cannot start user device: ${error}`)
        })
    }

    if (stream === undefined) {
        // initialize default device
        configureDevice(undefined)
    }

    useEffect(() => {
        let imageClient: ImageSession
        const imageService = new ImageService(props.config.image)
        imageService.setVideoSourceObject(stream)

        if (videoConstriants) { // has active stream
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

        // let pushClient: WebSocketSession = undefined
        // let recorder: MediaRecorder

        // if (videoConstriants) {
        //     pushClient = new WebSocketSession({
        //         metadata: {
        //             camera: {
        //                 frameRate: Math.floor(videoConstriants.frameRate[0]),
        //                 height: videoConstriants.height[0],
        //                 width: videoConstriants.width[0]
        //             },
        //             video: {
        //                 bitRate: props.config.streaming.bitRate,
        //                 container: props.config.streaming.mime
        //             }
        //         },
        //         retry: props.config.streaming.retry,
        //         url: props.config.streaming.url
        //     })

        //     pushClient.events.addEventListener('connect', () => setAppState('connecting'))
        //     pushClient.events.addEventListener('handshake', () => setAppState('handshake'))
        //     pushClient.events.addEventListener('open', () => setAppState('connected'))
        //     pushClient.events.addEventListener('close', () => setAppState('retry'))

        //     const recorder = new MediaRecorder(stream, {
        //         bitsPerSecond: props.config.streaming.bitRate,
        //         mimeType: props.config.streaming.mime
        //     })
        //     recorder.ondataavailable = (event) => {
        //         const reader = new FileReader()
        //         reader.readAsArrayBuffer(event.data)
        //         reader.onload = (event) => {
        //             pushClient.send(event.target.result as ArrayBuffer)
        //         }
        //     }
        //     recorder.start(1000)
        //     console.log(recorder.state)
        // }

        // return () => {
        //     if (pushClient)
        //         pushClient.shutdown()
        //     if (recorder)
        //         recorder.stop()
        // }
    }, [stream, videoConstriants, props])

    return (
        <div className="app-container">
            <AppStateDisplay state={appState} />

            <CameraPlayer stream={stream} />

            <DeviceSelector
                currentDeviceId={currentDeviceId}
                onDeviceSelected={configureDevice}
                onStop={() => setStream(null)}
            />
        </div>
    )
}
