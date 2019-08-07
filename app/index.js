//  将jsx代码编译为虚拟Dom
function createElement(type, props, ...children){
    return {
        type,
        props,
        children
    }
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

//  判断两个元素是否相同
function isNodeChanged(node1,node2) {
    //  如果有type值证明是标签元素 判断标签名是否相同
    if (!!node1.type && !!node2.type) {
        return node1.type === node2.type
    }
    //  否则元素为文本元素 判断文本是否相等
    return node1 === node2
}


function vDom($parent, oldNode, newNode, index = 0) {
    //  获取oldNode
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
    if (!isNodeChanged(oldNode,newNode)) {
        //  update
        //  替换原来那个元素
        return $parent.replaceChild(generateDom(newNode),$currentNode)
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
const newDom = <div class="BoxDom" data-user-id={1}><div><p>第一层</p><div><p>第二层</p></div></div></div>

vDom($app,oldDom,newDom)
const nodeChange = <div className="BoxDom" data-user-id={1}><div><p>第三层</p></div></div>
setTimeout(() => vDom($app,newDom,nodeChange),5000)
