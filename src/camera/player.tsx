import React, { useRef, useEffect } from 'react'
import { faCamera, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './player.css'

function CaptureInfo(props: {
    active: boolean
    constriants: MediaTrackConstraints
    label: string
}) {
    const { active, constriants, label } = props

    if (active) {
        return (
            <div className="info">
                <FontAwesomeIcon className="icon" icon={faCamera} />
                <span className="label">{label}</span>
                &nbsp;
                <span className="resolution">
                    {constriants.width}
                    &times;
                    {constriants.height}
                </span>
                <span className="frame-rate">
                    @
                    {constriants.frameRate}
                </span>
            </div>
        )
    }

    return (
        <div className="info">
            <FontAwesomeIcon className="icon" icon={faExclamationTriangle} />
            No active camera capture
        </div>
    )
}

export function CameraPlayer(props: {
    stream: MediaStream
}) {
    const { stream } = props

    const player = useRef<HTMLVideoElement>()

    const videoTrack = stream instanceof MediaStream
        ? stream.getVideoTracks()[0]
        : undefined

    const hasActiveVideoStream = videoTrack instanceof MediaStreamTrack

    const constriants = hasActiveVideoStream
        ? videoTrack.getConstraints()
        : undefined

    useEffect(() => {
        const currentPlayer = player.current

        if (hasActiveVideoStream) {
            currentPlayer.srcObject = props.stream
        }

        return () => {
            currentPlayer.srcObject = null
        }
    })

    return (
        <div className={`camera-player ${hasActiveVideoStream ? 'active' : 'idle'}`}>
            <video className="player" ref={player} autoPlay>
                <track />
            </video>
            <CaptureInfo
                active={hasActiveVideoStream}
                constriants={constriants}
                label={videoTrack ? videoTrack.label : undefined}
            />
        </div>
    )
}
