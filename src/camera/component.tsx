import React, { useState } from 'react'

import { DeviceSelectionMenu } from './menu'
import { CameraPlayer } from './player'

export interface CaptureStreamOptions {
    frameRate: number
    height: number
    width: number
}

async function openDeviceStream(options: CaptureStreamOptions, deviceId?: string) {
    const { frameRate, height, width } = options

    const constrians = {
        audio: false,
        video: { frameRate: frameRate, height: height, width: width },
    } as MediaStreamConstraints

    if (typeof deviceId === 'string' && deviceId.length > 0) {
        (constrians.video as MediaTrackConstraints).deviceId = deviceId
    }

    return navigator.mediaDevices.getUserMedia(constrians)
}

export function LocalCameraComplex(props: {
    streamOptions: CaptureStreamOptions
    onstreamchanged: (stream: MediaStream) => void
}) {
    const { streamOptions } = props

    const [deviceId, setDeviceId] = useState<string>(undefined)
    const [stream, setStream] = useState<MediaStream>(undefined)

    function updateDeviceId(newDeviceId?: string) {
        if (deviceId !== newDeviceId) {
            console.info(`Selecting device ${newDeviceId}`)
            setDeviceId(newDeviceId)
        }

        openDeviceStream(streamOptions, newDeviceId).then((newStream) => {
            if (newStream === stream) return // prevent unnecessary update

            if (newStream.getVideoTracks().length === 0) {
                // assert stream should has least one video track
                throw new Error('Unexpected empty video stream')
            }

            console.log('Switching active stream to ', newStream)

            if (stream instanceof MediaStream) {
                // shutdown previous stream
                stream.getVideoTracks().forEach((track) => track.stop())
            }

            setStream(newStream)
        }).catch(() => {
            if (stream === undefined) setStream(null)
        })
    }

    if (stream === undefined) {
        updateDeviceId(undefined)
    }

    return (
        <div className="local-camera">
            <CameraPlayer stream={stream} />

            <DeviceSelectionMenu
                currentDeviceId={deviceId}
                onselection={(newDeviceId) => { updateDeviceId(newDeviceId) }}
            />
        </div>
    )
}
