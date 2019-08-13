import { renderComponent } from './react-dom/diff'

//  任务队列 通过push()和shift() 实现先进先出的特征
const setStateQueue = []
//  更新队列
const renderQueue = []

function defer(fn) {
    return Promise.resolve().then( fn )
}

//  入队
export default function enqueueSetState( stateChange, component) {
    /**
     * 如果setStateQueue是空的 代表第一次执行flush或者上次flush已经执行过了
     * 这时候调用defer函数生成注册一个异步函数 生成一个异步微任务
     * 等到当前任务队列中的所有同步任务执行完毕后 就会调用这个微任务更新状态
     */
    if (setStateQueue.length === 0) {
        defer(flush)
    }

    //  入队
    setStateQueue.push({
        stateChange,
        component
    })

    /**
     * 如果renderQueue中没有当前传入的组件 则添加到队列中
     * some 遍历数组测试至少有一个元素可以通过提供的函数方法 返回Boolean结果
     * */
    if (!renderQueue.some( item => item === component)) {
        renderQueue.push(component)
    }
}

//  清空
function flush() {

    let item,component

    /**
     * 遍历任务队列
     * shift()函数将队列中的第一个元素抽出
     * 只要item为真就会一直循环执行
     * 直到shift()函数取出来的队列为空为止
     * */
    while( item = setStateQueue.shift()) {

        const {stateChange, component } = item

        //  prevState变量主要是用于传入的stateChange是函数的情况
        if (!component.prevState) {
            component.prevState = Object.assign({}, component.state)
        }

        /**
         * 如果传入的stateChange是函数 则执行函数后于原来的state对象合并
         * 否则代表传入的额stateChange是个普通对象 则直接于旧state对象合并 刷新state
         * */
        if (typeof stateChange === 'function') {
            Object.assign( component.state, stateChange(component.prevState, component.props))
        } else {
            Object.assign(component.state, stateChange)
        }

        //  将更新后的结果赋值给prevState 用于下一次循环
        component.prevState = component.state
    }

    //  跟上面的while同理 遍历队列刷新组件
    while( component = renderQueue.shift()) {
        renderComponent(component)
    }
}
