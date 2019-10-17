import React from 'react'

import { faCheck, faExclamationTriangle, faSync } from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type LambdaSessionStateType = 'connecting' | 'connected' | 'disconnected'

export interface LambdaSessionState {
    icon?: IconDefinition
    message?: string
    type: LambdaSessionStateType
}

function AppStateIcon(props: {
    icon: IconDefinition
}) {
    const { icon } = props
    return (
        <FontAwesomeIcon className="icon" icon={icon} />
    )
}

const defaultStateIcon = {
    connected: faCheck,
    connecting: faSync,
    disconnected: faExclamationTriangle,
} as Record<LambdaSessionStateType, IconDefinition>

const defaultStateMessage = {
    connected: 'Connected to server',
    connecting: 'Retrying connection to server',
    disconnected: 'Disconnected',
} as Record<LambdaSessionStateType, string>

export function LambdaSessionStateDisplay(props: {
    state: LambdaSessionState
}) {
    const { state } = props

    const icon = state.icon || defaultStateIcon[state.type]
    const message = state.message || defaultStateMessage[state.type]

    console.info(`Application state changed to ${state.type}: ${message}`)

    return (
        <div className={`lambda-state ${state}`}>
            <AppStateIcon icon={icon} />
            <span className="message">{message}</span>
        </div>
    )
}
