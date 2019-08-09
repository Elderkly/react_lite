import {
    createComponent,
    setComponentProps
} from './diff'

import setAttribute from './dom'
/**
 * @param {*} vDom  虚拟dom
 * @param {*} container 父级Dom
 * 转换虚拟Dom并挂载组件
 * */
export default function render(vDom,container) {
    //  挂载渲染结果
    return container.appendChild(_render(vDom))
}

/**
 * @param {*} vnode 虚拟Dom
 * 根据虚拟Dom类型返回相应的真实Dom
 * */
export function _render(vnode) {

    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    if ( typeof vnode === 'number' ) vnode = String( vnode );

    //  文本
    if ( typeof vnode === 'string') {
        return document.createTextNode(vnode)
    }
    //  函数组件/基类组件    最后返回真实节点
    if ( typeof vnode.type === 'function') {
        //  无论是函数组件还是类组件 统一返回实例
        const component = createComponent(vnode.type, vnode.props)
        //  刷新props同时调用renderComponent生成真实Dom
        setComponentProps(component, vnode.props)
        //  component.base即组件最终得到的真实Dom
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
