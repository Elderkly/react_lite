const React = {
    createElement
}

function createElement(type, props, ...children) {
    return {
        type,
        props,
        children
    }
}

export default React
