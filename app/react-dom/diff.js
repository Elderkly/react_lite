import setAttribute from './dom'
import Component from '../component'
import {_render} from './render'
/**
 * diff算法
 * @param {HTMLElement} dom 真实dom
 * @param {vnode} vnode  虚拟dom
 * @returns {HTMLElement} 更新后的dom
 * */
function diff(dom, vnode) {
    let out

    //  diff text node
    if ( typeof vnode === 'string') {
        //  如果是文本节点则直接更新文本
        //  nodeType返回节点类型 nodeType === 3表示为文本节点
        if (dom && dom.nodeType === 3) {
            dom.textContent = dom.textContent !== vnode ? vnode : dom.textContent
        } else {
            //  如果不是文本节点则直接替换原来的节点
            out = document.createTextNode(vnode)

            if (dom && dom.parentNode) {
                dom.parentNode.replaceChild( out, dom)
            }
        }

        return out
    }

    //  diff dom
    //  真实dom不存在(表示该节点是新增的) || 真实dom与虚拟dom的标签类型不同 则新建一个dom元素
    if (!dom || dom.nodeName.toLowerCase() !== vnode.type.toLowerCase()) {

        out = document.createElement( vnode.type )

        if (dom) {
            /*
             * 将原来的子节点移到新节点下
             * [...dom.childNodes] 将childNodes这个类数组对象转换为数组
             * xx.map(out.appendChild) === xx.map(item => out.appendChild(item))
             * */
            [...dom.childNodes].map(out.appendChild)
            //  替换dom
            if (dom.parentNode) {
                dom.parentNode.replaceChild(dom, out)
            }
        }
    }

    //  diff children
    //  只要新旧dom其中一个有children就执行diff children函数
    if (vnode.children && vnode.children.length > 0 || (out.childNodes && out.childNodes.length > 0)) {
        diffChildren(out,vnode.children)
    }

    diffAttributes(out,vnode)

    return out
}

/**
 * diff dom的属性
 * */
function diffAttributes(dom,vnode) {
    //  当前dom的属性
    const old = {}
    //  虚拟dom的属性
    const attrs = vnode.props
    //  生成当前dom属性的数组
    for (let i in dom.attributes) {
        const res = dom.attributes[i]
        old[res.name] = res.value
    }

    for (let name in old) {
        //  如果原来的属性不再新属性中 则删除属性
        if (! (name in attrs)) {
            setAttribute(dom, name, undefined)
        }
    }

    for (let name in attrs) {
        //  如果新旧属性不同 则刷新属性
        if (old[name] !== attrs[name]) {
            setAttribute(dom, name, attrs[name])
        }
    }
}

/**
 * diff 子元素
 * */
function diffChildren(dom,vchildren) {

}

//  将基类组件或函数组件统一转换为实例返回
export function createComponent( component, props ) {
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

/**
 * @param {*} component 传入组件实例
 * @param {*} props 实例携带的props
 *
 * component.base 用于区分组件是否已存在
 * 根据base参数来判断调用componentWillMount事件 / componentWillReceiveProps事件
 * */
export function setComponentProps(component,props) {
    if (!component.base) {
        if (component.componentWillMount) component.componentWillMount()
    } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps()
    }

    component.props = props

    renderComponent(component)
}

/**
 * 根据实例构建真实Dom
 * 并根据base变量触发相应生命周期事件
 * */
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
        //  用刷新好的节点替换掉旧的节点
        //  replaceChild只能替换子节点 所以需要先获取dom的父级节点再进行替换
        component.base.parentNode.replaceChild(base, component.base)
    }

    component.base = base
    base._component = component
}

