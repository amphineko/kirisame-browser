import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faExclamationTriangle, faVideo } from '@fortawesome/free-solid-svg-icons'

import './menu.css'

function DeviceRow(props: {
    deviceInfo: MediaDeviceInfo
    selected: boolean
    onselection: () => void
}) {
    const { deviceInfo: device, selected, onselection } = props

    const className = `row ${selected ? 'selected' : ''}`

    return (
        <a className={className} href="#" onClick={() => onselection()}>
            <span className="label">
                <FontAwesomeIcon className="icon" icon={selected ? faCheckSquare : faVideo} />
                {device.label}
            </span>
            <span className="deviceId">{device.deviceId}</span>
        </a>
    )
}

export function DeviceSelectionMenu(props: {
    currentDeviceId: string
    onselection: (deviceId: string) => void
}) {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>(undefined)

    const { currentDeviceId, onselection } = props

    function updateDeviceList() {
        navigator.mediaDevices.enumerateDevices().then((userDevices) => {
            const videoDevices = userDevices.filter((device) => device.kind === 'videoinput')
            setDevices(videoDevices)
            console.log(`MediaDevice enumeration found ${videoDevices.length} video devices.`)
        })
    }

    if (devices === undefined) {
        updateDeviceList()
    }

    useEffect(() => {
        const listener = () => updateDeviceList()
        navigator.mediaDevices.addEventListener('devicechange', listener)
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', listener)
        }
    })

    const deviceRows = devices instanceof Array
        ? devices.map((device) => {
            const { deviceId } = device
            const selected = deviceId === currentDeviceId
            return (
                <DeviceRow
                    key={deviceId}
                    deviceInfo={device}
                    selected={selected}
                    onselection={() => onselection(deviceId)}
                />
            )
        })
        : (
            <span className="not-found">
                <FontAwesomeIcon className="icon" icon={faExclamationTriangle} />
                No video input device available.
            </span>
        )

    return (
        <div className="device-menu">
            <span className="prompt">Available video input devices</span>
            {deviceRows}
        </div>
    )
}
