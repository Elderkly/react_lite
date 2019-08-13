import React from './react'

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            num: 0
        }
    }
    componentDieMount() {
        for ( let i = 0; i < 100; i++ ) {
            this.setState( prevState => {
                console.log(prevState.num)
                return {
                    num: prevState.num + 1
                }
            });
            // this.setState({num:this.state.num + 1})
            // console.log(this.state.num)
        }
    }
    render() {
        return (
            <div className="App">
                <h1>{ this.state.num }</h1>
            </div>
        );
    }
}
