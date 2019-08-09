//  设置proprs
export default function setAttribute(dom,key,value) {
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
