import Component from './component'

const React = {
    Component,
    createElement
}

export default React

function createElement(type, props, ...children) {
    return {
        type,
        props,
        children
    }
}

