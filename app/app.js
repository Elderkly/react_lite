import React from './react'

class Number extends React.Component {
    render() {
        return <h1>Number: {this.props.number}</h1>
    }
}
function Button(props) {
    return <button onClick={() => this.props.addNumberFun()}
    >Add Number</button>
}

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            number:0
        }
    }
    componentWillMount(){
        console.log('componentWillMount')
    }
    componentWillReceiveProps(){
        console.log('componentWillReceiveProps')
    }
    componentWillUpdate(){
        console.log('componentWillUpdate')
    }
    componentDieUpdate(){
        console.log('componentDieUpdate')
    }
    componentDieMount(){
        console.log('componentDieMount')
    }
    render() {
        return (
            <div>
                <Number number={this.state.number}/>
                <Button addNumberFun={() => this.setState({number: this.state.number + 1 })}/>
            </div>
        )
    }
}
