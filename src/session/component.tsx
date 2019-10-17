import React, { useEffect, useState } from 'react'

import { LambdaServiceConfiguration, LambdaService } from './lambda'
import { LambdaSessionStateDisplay, LambdaSessionState } from './state'

let service: LambdaService

export function LambdaComplex(props: {
    config: LambdaServiceConfiguration
    stream: MediaStream
}) {
    const { config } = props

    const [state, setState] = useState<LambdaSessionState>({ type: 'disconnected' })

    useEffect(() => {
        if (!service) {
            service = new LambdaService(config)
        }

        service.onclosed = () => setState({ type: 'disconnected' })
        service.onconnect = () => setState({ type: 'connecting' })
    }, [config])

    return (
        <div className="lambda-complex">
            <LambdaSessionStateDisplay state={state} />
        </div>
    )
}
