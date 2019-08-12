import setAttribute from './dom'
import Component from '../component'
/**
 * diff算法
 * @param {HTMLElement} dom 真实dom
 * @param {vnode} vnode  虚拟dom
 * @returns {HTMLElement} 更新后的dom
 * */
function diff(dom, vnode) {

    let out = dom;

    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    if ( typeof vnode === 'number' ) vnode = String( vnode );

    //  diff text node
    if ( typeof vnode === 'string') {
        //  如果是文本节点则直接更新文本
        //  nodeType返回节点类型 nodeType === 3表示为文本节点
        if (dom && dom.nodeType === 3) {
            if (dom.textContent !== vnode) {
                dom.textContent = vnode;
            }
        } else {
            //  如果不是文本节点则直接替换原来的节点
            out = document.createTextNode(vnode)

            if (dom && dom.parentNode) {
                dom.parentNode.replaceChild( out, dom)
            }
        }

        return out
    }

    //  diff fun/class dom
    if ( typeof vnode.type === 'function' ) {
        return diffComponent( dom, vnode );
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

        /*
         *  过滤掉jsx函数写法编译后的数组
         *  将函数写法得到的虚拟dom统一编译为跟普通jsx得到的虚拟dom同一层
         * */
        vnode.children.map( (e) => {

            if (!e.children && typeof e === 'object') {

                e.map(m => vnode.children.push(m))

            }
        })

        diffChildren(out, vnode.children)

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
    for (let i = 0; i < dom.attributes.length; i++) {
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
 * diff 组件
 * */
function diffComponent(dom,vnode) {
    //  找到这个真实dom的实例
    let c = dom && dom._component
    let oldDom = dom;

    //  如果当前这个实例的构造函数与虚拟节点中的type字段对应 则代表是同一个节点
    if (c && c.constructor === vnode.type) {
        setComponentProps(c, vnode.props)
        //  赋值更新过的dom
        dom = c.base
    //  如果类型发生变化则移除原来的组件 渲染一个新的组件
    } else {
        if (c) {
            unmountComponent(c)
            oldDom = null
        }
        //  重新渲染一个新组件
        c = createComponent(vnode.type, vnode.props)
        //  设置props
        setComponentProps(c, vnode.props)
        //  获取新组件的dom
        dom = c.base

        //  如果重新渲染出来的dom与原本传递进来的dom不匹配 则将原来的dom清除掉
        if (oldDom && dom !== oldDom) {
            oldDom._component = null
            removeNode(oldDom)
        }
    }

    return dom
}


/**
 * diff 子元素
 * */
function diffChildren(dom,vchildren) {
    // console.log(vchildren)
    const domChildren = dom.childNodes
    const children = []

    const keyed = {}

    //  区分有key和没key的节点
    if (domChildren.length > 0) {
        for (let i = 0; i < domChildren.length; i ++) {
            const child = domChildren[i]
            const key = child.key
            key ? keyed[key] = child : children.push(child)
        }
    }

    if (vchildren && vchildren.length > 0) {

        let min = 0
        let childrenLen = children.length

        for (let i = 0; i < vchildren.length; i++) {
            /*
            * 下面这段代码的作用
            * 循环传入的虚拟dom的children列表
            * 遍历每一个children 找出对应的真实dom
            * 将找到的真实dom与children传入diff函数获取根据虚拟dom更新过的真实dom
            * 获取经过对比更新后的真实dom
            * */

            //  获取虚拟节点的key
            const vchild = vchildren[i]
            const key = vchild.key
            let child

            //  如果虚拟节点中有key 则在真实dom中的children中找到这个节点 进行对比
            if (key) {

                if (keyed[key]) {
                    child = keyed[key]
                    keyed[key] = undefined
                }
            //  如果没有key 则优先找类型相同的节点
            } else if (min < childrenLen) {

                for (let j = min; j < childrenLen; j++) {

                    let c = children[j]

                    //  如果这个节点存在 并且这个节点与当前循环的这个虚拟节点对应
                    if (c && isSameNodeType(c,vchild)) {
                        //  存储当前这个真实dom 表示找到与当前虚拟children对应的真实dom了
                        child = c
                        children[j] = undefined

                        /* 这块min的操作没看懂 */

                        if (j === childrenLen - 1) childrenLen --
                        if (j === min) min ++
                        break
                    }
                }
            }

            /**
             *  走到这里表示已经找到与之一一对应的dom 或child为null表示 dom是新增的
             *  传入diff函数进行对比更新
             *  获取更新后的dom
             * */

            child = diff( child, vchild)

            //  这里将jsx函数写法的得到的虚拟dom没有type字段的数组过滤掉 避免编译出<undefined></undefined>的情况
            if (!child && typeof(vchild) === 'object' && !vchild.type) continue

            // 更新DOM
            const f = domChildren[ i ];
            if ( child && child !== dom && child !== f ) {
                // 如果更新前的对应位置为空，说明此节点是新增的
                if ( !f ) {
                    dom.appendChild(child);
                    // 如果更新后的节点和更新前对应位置的下一个节点一样，说明当前位置的节点被移除了
                } else if ( child === f.nextSibling ) {
                    removeNode( f );
                    // 将更新后的节点移动到正确的位置
                } else {
                    // 注意insertBefore的用法，第一个参数是要插入的节点，第二个参数是已存在的节点
                    dom.insertBefore( child, f );
                }
            }
        }
    }
}

//  判断节点类型是否相同
function isSameNodeType(dom,vnode) {
    //  文本
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return dom.nodeType === 3
    }

    //  tyoe === string表示不是 函数组件/基类组件
    if (typeof vnode.type === 'string') {
        return dom.nodeName.toLowerCase() === vnode.type.toLocaleString()
    }

    //  如果是基类或函数组件 当他的构造函数与虚拟dom的type字段(即构造函数)相同则返回true
    return dom && dom._component && dom._component.constructor === vnode.type
}

//  卸载组件
function unmountComponent( component ) {
    if ( component.componentWillUnmount ) component.componentWillUnmount();
    removeNode( component.base);
}

//  用于删除节点
function removeNode( dom ) {

    if ( dom && dom.parentNode ) {
        dom.parentNode.removeChild( dom );
    }

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
    // base = _render(renderer)
    base = diff(component.base, renderer)

    if (component.base) {
        if (component.componentDieUpdate) component.componentDieUpdate()
    } else if (component.componentDieMount) {
        component.componentDieMount()
    }

    // //  刷新节点
    // if (component.base && component.base.parentNode) {
    //     //  用刷新好的节点替换掉旧的节点
    //     //  replaceChild只能替换子节点 所以需要先获取dom的父级节点再进行替换
    //     component.base.parentNode.replaceChild(base, component.base)
    // }

    component.base = base
    base._component = component
}

