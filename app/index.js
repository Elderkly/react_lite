//  将jsx代码编译为虚拟Dom
function createElement(type, props, ...children){
    return {
        type,
        props,
        children
    }
}

//  工具方法
const types = {
    //  获取传入参数的类型
    get: type => toString.call(type),
    string: '[object String]',
    number: '[object Number]',
    array: '[object Array]',
    object: '[object Object]',
    function: '[object Function]',
    null: '[object Null]',
    undefined: '[object Undefined]',
    boolean: '[object Boolean]',
};

//  判断两个虚拟dom是否不同
function isNodeChanged(node1,node2) {
    //  如果有type值证明是标签元素 判断标签名是否相同
    if (!!node1.type && !!node2.type) {
        return node1.type !== node2.type
    }
    //  否则元素为文本元素 判断文本是否相同
    return node1 !== node2
}

//  判断两个props是否不同
function isObjectChanged(obj1,obj2) {
    //  如果类型不同返回true
    if (types.get(obj1) !== types.get(obj2)) {
        return true
    }

    //  如果两个参数都是对象
    if (types.get(obj1) === types.object) {
        const [obj1Keys,obj2Keys] = [Object.keys(obj1),Object.keys(obj2)]

        //  如果两个对象的长度不同证明对象修改过
        if (obj1Keys.length !== obj2Keys.length) {
            return true
        }

        //  两个都是空对象
        if (obj1Keys.length === 0) {
            return false
        }

        //  遍历判断对象下的每个key对应的值是否相同
        for (let i = 0; i < obj1Keys.length; i++) {
            const key = obj1Keys[i]

            if (obj1[key] !== obj2[key]) {
                return true
            }
        }
    }
    return false
}

//  将虚拟Dom转换为真实Dom
function generateDom(Vdom) {
    let $el

    //  如果该对象没有type属性则代表是文本标签
    if (Vdom.type) {
        $el = document.createElement(Vdom.type)
    } else {
        $el = document.createTextNode(Vdom)
    }

    //  判断该对象是否有其他属性
    if (Vdom.props) {
        Object.keys(Vdom.props).forEach(key => {
            $el.setAttribute(key, Vdom.props[key])
        })
    }

    //  判断是否有子元素 有的话就递归插入
    if (Vdom.children) {
        Vdom.children.forEach(child => $el.appendChild(generateDom(child)))
    }

    return $el
}

//  render Fun
function vDom($parent, oldNode, newNode, index = 0) {
    //  获取oldNode的真实Dom
    const $currentNode = $parent.childNodes[index]

    if (!oldNode) {
        //  append
        return $parent.appendChild(generateDom(newNode))
    }

    if (!newNode) {
        //  delete
        return $parent.removeChild($currentNode)
    }

    //  如果两个元素不等
    if (isNodeChanged(oldNode, newNode)) {
        //  update
        //  替换原来那个元素
        return $parent.replaceChild(generateDom(newNode),$currentNode)
    }

    //  props diff
    if (isObjectChanged(oldNode, newNode)) {
        //  过滤props为null的情况
        const oldProps = oldNode.props || {}
        const newProps = newNode.props || {}
        //  获取props的key
        const [oldPropsKeys,newPropsKeys] = [Object.keys(oldProps),Object.keys(newProps)]

        //  如果新的props为空则清空原来的props
        if (newPropsKeys.length === 0) {
            oldPropsKeys.forEach(prop => {
                $currentNode.removeAttribute(prop)
            })
        } else {
            //  合并新老props 剔除重复的key
            const allPropsKeys = new Set([...oldPropsKeys, ...newPropsKeys])

            allPropsKeys.forEach(prop => {
                //  如果这个属性是原来没有的 则添加属性
                if (!oldProps[prop]) {
                    return $currentNode.setAttribute(prop, newProps[prop])
                }
                //  如果这个属性在newProps中找不到则证明被删除了
                if (!newProps[prop]) {
                    return $currentNode.removeAttribute(prop)
                }
                //  如果同时拥有这个属性 则刷新这个属性
                if (oldProps[prop] !== newProps[prop]) {
                    return $currentNode.setAttribute(prop, newProps[prop])
                }
            })
        }
    }

    //  递归对比子元素变化
    if ((oldNode.children && oldNode.children.length) || (newNode.children && newNode.children.length)) {
        const maxLength = Math.max(oldNode.children.length, newNode.children.length)

        for (let i = 0; i < maxLength; i++) {
            vDom($currentNode, oldNode.children[i], newNode.children[i], i)
        }
    }
}


const $app = document.querySelector('.app')

const oldDom = null
const newDom = <div class="BoxDom" data-user-id={1}>
    <div>
        <p>第一层</p>
        <div className={"middleBox"}>
            <p>第二层</p>
        </div>
    </div>
</div>
const nodeChange = <div className="BigDom" data-user-id={3}>
    <div>
        <p>第三层</p>
        <div className={"ending"}>
            <p>第四层</p>
        </div>
    </div>
</div>

//  插入元素
vDom($app,oldDom,newDom)
//  延时刷新元素
setTimeout(() => vDom($app,newDom,nodeChange),5000)
