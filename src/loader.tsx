import React from 'react'
import ReactDOM from 'react-dom'

import { Configuration } from './config'
import { AppMain } from './app'

async function getConfiguration() {
    const file = await fetch('config.json')
    return file.json<Configuration>()
}

async function init() {
    console.log('Begin Early Initialization: Fetch Configuration')
    const config = await getConfiguration()
    console.log('Begin Early Initialization: Invoke Render(AppMain)')
    ReactDOM.render(<AppMain config={config} />, document.getElementById('app'))
    console.log('End Early Initialization :)')
}

init().catch((error) => {
    console.error(`Early Initialization Failed: ${error}`)
})
