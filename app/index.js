import React from './react'
import ReactDom from './react-dom'

setInterval( () => {
    const element = (
        <div data-id={'22'}>
            <h1 style={{color:'#999',fontSize:20}} className={'H1'}>Hello, world!</h1>
            <h2>It is {new Date().toLocaleTimeString()}.</h2>
        </div>
    );
    ReactDom.render(
        element,
        document.querySelector('.app')
    )
}, 1000 );
