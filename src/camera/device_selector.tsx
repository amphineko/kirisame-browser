import { default as React, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faExclamationTriangle, faVideo } from '@fortawesome/free-solid-svg-icons'

import './device_selector.css'

function DeviceSelectorRow(props: {
    device: MediaDeviceInfo
    isSelected: boolean
    onClick: () => void
}) {
    const className = `device-row ${props.isSelected ? 'selected' : ''}`
    return <a className={className} href="#" onClick={props.onClick}>
        <span className="label">
            <FontAwesomeIcon className="icon" icon={props.isSelected ? faCheckSquare : faVideo} />
            {props.device.label}
        </span>
        <span className="deviceId">{props.device.deviceId}</span>
    </a>
}

export function DeviceSelector(props: {
    currentDeviceId: string
    onDeviceSelected: (deviceId: string) => void
    onStop: () => void
}) {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>(undefined)

    function updateDeviceList() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            setDevices(devices.filter((device) => device.kind == 'videoinput'))
            console.log(`MediaDevice enumeration found ${devices.length} devices.`)
        })
    }

    function createDeviceElements() {
        if (!(devices instanceof Array))
            return false
        else {
            return devices.map((device) => {
                const isSelected = device.deviceId === props.currentDeviceId
                const onClick = isSelected
                    ? () => props.onDeviceSelected(device.deviceId)
                    : props.onStop
                return <DeviceSelectorRow
                    device={device} key={device.deviceId}
                    isSelected={isSelected} onClick={onClick} />
            })
        }
    }

    if (devices === undefined)
        updateDeviceList()

    useEffect(() => {
        const listener = () => updateDeviceList()
        navigator.mediaDevices.addEventListener('devicechange', listener)
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', listener)
        }
    })

    return <div className="device-selector">
        <span className="prompt">Available video input devices</span>
        {
            devices && devices.length > 0
                ? createDeviceElements()
                : <span className="not-found">
                    <FontAwesomeIcon className="icon" icon={faExclamationTriangle} />
                    No video input device found.
                </span>
        }
    </div>
}
