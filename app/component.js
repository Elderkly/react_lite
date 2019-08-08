
export class Component {
    constructor(props = {}) {
        this.state = {}
        this.props = props
    }

    setState(stateChange) {
        Object.assign(this.state, stateChange)
    }
}


//  创建组件
function createComponent( component, props ) {
    let inst
    //  如果传递进来的是类组件 则直接返回实例
    if (component.prototype && component.prototype.render) {
        inst = new component(props)
    } else {
        //  否则为函数组件，将其扩展为类组件
        inst = new Component(props);
        inst.constructor = component;
        inst.render = function() {
            return this.constructor(props)
        }
    }
    return inst
}

/* component.base 用于区分组件是否已存在 */
//  更新props
function setComponentProps(component,props) {
    if (!component.base) {
        if (component.componentWillMount) component.componentWillMount()
    } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps()
    }

    component.props = props

}

function renderComponent(component) {
    let base
    //  获取虚拟dom
    const renderer = component.render()

    if (component.base && component.componentWillUpdate) {
        component.componentWillUpdate()
    }
    //  获取真实dom
    base = generateDom(renderer)

    if (component.base) {
        if (component.componentDieUpdate) component.componentDieUpdate()
    } else if (component.componentDieMount) {
        component.componentDieMount()
    }

    if (component.base && component.base.parentNode) {
        component.base
    }
}
