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
            number:0,
            userObj:[
                {
                    name:'张三',
                    sex:'男',
                },
                {
                    name:'李四',
                    sex:'女',
                },
                {
                    name:'王五',
                    sex:'男',
                },
                {
                    name:'赵六',
                    sex:'男',
                },
            ]
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
                {
                    this.state.userObj.map((e,index) => (
                        <div>
                            <text>{e.sex === '男' ? '老子' : '老娘'}</text>
                            <text>叫</text>
                            <text>{e.name}</text>
                        </div>
                    ))
                }
            </div>
        )
    }
}
