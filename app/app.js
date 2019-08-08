import React from './react'

class Welcome extends React.Component {
    render() {
        return <h1>Hello {this.props.name}</h1>
    }
}
function Dom2(props) {
    return <h2>Next Dom {props.name}</h2>
}

export default class App extends React.Component {
    render() {
        return (
            <div>
                <Dom2 name={'b'}/>
                <Welcome name={'a'}/>
                <p>Demo</p>
            </div>
        )
    }
}
