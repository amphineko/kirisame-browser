import { default as React, useRef, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCamera, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

import './player.css'

function CaptureInfo(props: {
    active: true
    constriants: MediaTrackConstraints
    label: string
} | {
    active: false
}) {
    return props.active
        ? <div className="info">
            <FontAwesomeIcon className="icon" icon={faCamera} />
            <span className="label">{props.label}</span>
            &nbsp;
            <span className="resolution">{props.constriants.width}&times;{props.constriants.height}</span>
            <span className="frame-rate">@{props.constriants.frameRate}</span>
        </div>
        : <div className="info">
            <FontAwesomeIcon className="icon" icon={faExclamationTriangle} />
            No active camera capture
        </div>
}

export function CameraPlayer(props: {
    stream: MediaStream
}) {
    const player = useRef<HTMLVideoElement>()

    const videoTrack = props.stream instanceof MediaStream
        ? props.stream.getVideoTracks()[0]
        : undefined

    const hasActiveVideoStream = videoTrack instanceof MediaStreamTrack

    const constriants = hasActiveVideoStream
        ? videoTrack.getConstraints()
        : undefined

    useEffect(() => {
        if (hasActiveVideoStream)
            player.current.srcObject = props.stream
        return () => player.current.srcObject = null
    })

    return (
        <div className={`camera-player ${hasActiveVideoStream ? 'active' : 'idle'}`}>
            <video className="player" ref={player} autoPlay></video>
            {hasActiveVideoStream
                ? <CaptureInfo active={true} constriants={constriants} label={videoTrack.label} />
                : <CaptureInfo active={false} />}
        </div>
    )
}