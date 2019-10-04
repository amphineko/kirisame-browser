import { default as React } from 'react'
import { faCheck, faExclamationTriangle, faSync, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './state.css'

export type AppState = 'init' | 'start-camera' | 'connecting' | 'handshake' | 'connected' | 'retry'

const stateIcon = {
    'init': faSync,
    'start-camera': faSync,
    'connecting': faSync,
    'handshake': faSync,
    'connected': faCheck,
    'retry': faExclamationTriangle
} as Record<AppState, IconDefinition>

const stateText = {
    'init': 'Initializing application',
    'start-camera': 'Starting camera capture',
    'connecting': 'Connecting to server',
    'handshake': 'Connected, waiting for initial handshake',
    'connected': 'Connected and streaming to server',
    'retry': 'Connection lost, retrying'
} as Record<AppState, string>

function StateIcon(props: {
    state: AppState
}) {
    return <FontAwesomeIcon className="icon" icon={stateIcon[props.state]} />
}

export function AppStateDisplay(props: {
    state: AppState
}) {
    console.log(`Application state changed to ${props.state}`)

    return <div className={`app-state ${props.state}`}>
        <StateIcon state={props.state} />
        <span className='text'>{stateText[props.state]}</span>
    </div>
}
