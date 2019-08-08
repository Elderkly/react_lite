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
    //  文本
    if ( typeof vDom === 'string') {
        const textNode = document.createTextNode(vDom)
        return container.appendChild(textNode)
    }

    const dom = document.createElement(vDom.type)

    if (vDom.props) {
        Object.keys(vDom.props).forEach(key => {
            const value = vDom.props[key]
            setAttribute(dom,key,value)
        })
    }

    //  递归插入子元素
    vDom.children.forEach( child => render(child,dom))

    //  挂载渲染结果
    return container.appendChild(dom)
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
