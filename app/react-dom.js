import Component from './component'

const ReactDom = {
    render: (vnode,container) => {
        container.innerHTML = ''
        return render(vnode,container)
    }
}

export default ReactDom

/**
 * @param {*} vDom  虚拟dom
 * @param {*} container 父级Dom
 * */
function render(vDom,container) {
    //  挂载渲染结果
    return container.appendChild(_render(vDom))
}

function _render(vnode) {

    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    if ( typeof vnode === 'number' ) vnode = String( vnode );

    //  文本
    if ( typeof vnode === 'string') {
        return document.createTextNode(vnode)
    }
    //  函数组件    最后返回真实节点
    if (typeof vnode.type === 'function') {
        const component = createComponent(vnode.type, vnode.props)

        setComponentProps(component, vnode.props)

        return component.base
    }

    const dom = document.createElement(vnode.type)

    if (vnode.props) {
        Object.keys(vnode.props).forEach(key => {
            const value = vnode.props[key]
            setAttribute(dom,key,value)
        })
    }

    //  递归插入子元素
    vnode.children.forEach( child => render(child,dom))

    return dom
}

//  设置proprs
function setAttribute(dom,key,value) {
    key = key === 'className' ? 'class' : key

    //  以on开头的属性为事件 需绑定事件
    if (/on\w+/.test(key)) {
        //  转换为小写
        key = key.toLowerCase()
        dom[key] = value || ''
    } else if (key === 'style') {
        //  style接受两种类型 string|object
        if (!value || typeof value === 'string') {
            dom.style.cssText = value || ''
        } else if (value && typeof value === 'object') {
            for (let name in value) {
                //  这一步可以处理{width：20}这种类型的数据
                dom.style[name] = typeof value[name] === 'number' ? value[name] + 'px' : value[name]
            }
        }
    } else {
        // in操作符 如果指定属性在指定对象或其原型链中 则返回true
        if ( key in dom ) {
            dom[ key ] = value || '';
        }
        //  如果找得到这个属性就则设置 否则删除该属性
        if ( value ) {
            dom.setAttribute( key, value );
        } else {
            dom.removeAttribute( key );
        }
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
        /**
         * 这里将inst的构造函数赋值为component
         * 而此时component就是函数组件的函数本身
         * 所以当render执行this.constructor(props)时其实就是调用函数本身返回虚拟DOM
         * */
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

    renderComponent(component)
}

export function renderComponent( component ){
    let base
    //  获取虚拟dom
    const renderer = component.render()

    if (component.base && component.componentWillUpdate) {
        component.componentWillUpdate()
    }
    //  获取真实dom
    base = _render(renderer)

    if (component.base) {
        if (component.componentDieUpdate) component.componentDieUpdate()
    } else if (component.componentDieMount) {
        component.componentDieMount()
    }

    //  刷新节点
    if (component.base && component.base.parentNode) {
        component.base.parentNode.replaceChild(base, component.base)
    }

    component.base = base
    base._component = component
}
