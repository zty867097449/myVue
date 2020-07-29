let {
    log,
    dir
} = console
//负责解析模板内容
class Compile {
    //参数1：模板容器
    //参数2：vue实例
    constructor(el, vm) {
        //el:new vue传递的选择器
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        //vm:new的vue实例
        this.vm = vm
        //编译模板
        if (this.el) {
            //1.把el中所有子节点都放入到内存中,fragment
            let fragment = this.node2fragment(this.el)
            // log(fragment)
            //2.在内存中编译fragment
            this.compile(fragment)
            //3.把fragment一次性的添加到页面
            this.el.appendChild(fragment)
        }
    }
    //核心方法
    node2fragment(node) {
        let fragment = document.createDocumentFragment()
        //把el中所有的子节点添加到文档碎片中
        let childNodes = node.childNodes
        this.toArray(childNodes).forEach(node => {
            //把所有的子节点添加到fragment中
            fragment.appendChild(node)
        })
        return fragment
    }
    /**
     * 编译文档碎片(内存中进行)
     * 
     * @param {*} fragment
     */
    compile(fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach(node => {
            //编译子节点
            // log(node)
            //如果是元素，需要解析指令
            if (this.isElementNode(node)) {
                //如果是元素，需要解析指令
                this.compileElement(node)
            }
            //如果是文本节点，需要解析插值表达式
            if (this.isTextNode(node)) {
                //如果是文本节点，需要解析插值表达式
                this.compileText(node)
            }
            //如果当前节点还有子节点，需要递归的解析
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }
    //解析html标签
    compileElement(node) {
        // log('需要解析html')
        //1.获取当前节点下所有的属性
        let attributes = node.attributes
        // log(attributes)
        this.toArray(attributes).forEach(attr => {
            //2.解析vue的指令(所有以v-开头的属性)
            // log(attr)
            let attrName = attr.name
            if (this.isDirective(attrName)) {
                let type = attrName.slice(2)
                let expr = attr.value
                // log(type)
                if (this.isEventDirective(type)) {
                    compileUtil['eventHandler'](node, this.vm, type, expr)
                } else {
                    compileUtil[type] && compileUtil[type](node, this.vm, expr)
                }
            }
        })
    }
    //解析文本节点
    compileText(node) {
        compileUtil.mustache(node, this.vm)
    }
    //工具方法
    toArray(likeArray) {
        return [].slice.call(likeArray)
    }
    isElementNode(node) {
        //nodeType：节点的类型  如果是1：元素节点   3：文本节点
        return node.nodeType === 1
    }
    isTextNode(node) {
        return node.nodeType === 3
    }
    isDirective(attrName) {
        return attrName.startsWith('v-')
    }
    isEventDirective(attrName) {
        return attrName.split(':')[0] === 'on'
    }
}
let compileUtil = {
    //解析插值表达式复杂数据类型
    mustache(node, vm) {
        // log('需要解析文本')
        let txt = node.textContent
        //用()给正则表达式做分组，方便下面获取到插值表达式里面的变量
        let reg = /\{\{(.+)\}\}/
        if (reg.test(txt)) {
            // log(txt) //需要解析的文本
            let expr = RegExp.$1.trim()
            // log(expr) //获取到插值表达式里面的变量
            node.textContent = txt.replace(reg, compileUtil.getVMValue(vm, expr))
            new Watcher(vm, expr, newValue => {
                node.textContent = txt.replace(reg, newValue)
            })
        }
    },
    //解析v-text指令
    text(node, vm, expr) {
        node.textContent = this.getVMValue(vm, expr)
        // log(node)
        //通过watcher对象，监听expr的数据的变化，一旦变化了，执行下面的回调函数
        new Watcher(vm, expr, newValue => {
            node.textContent = newValue
        })
    },
    // 解析v-html指令
    html(node, vm, expr) {
        node.innerHTML = this.getVMValue(vm, expr)
        new Watcher(vm, expr, newValue => {
            node.innerHTML = newValue
        })
    },
    //解析v-model指令
    model(node, vm, expr) {
        let self = this
        node.value = this.getVMValue(vm, expr)
        //实现双向数据绑定，给node注册input事件，当当前value值发生改变时，修改对应的数据
        node.addEventListener('input', function () {
            self.setVMValue(vm, expr, this.value)
        })
        new Watcher(vm, expr, newValue => {
            node.value = newValue
        })
    },
    //解析v-on指令
    eventHandler(node, vm, type, expr) {
        let eventType = type.split(':')[1]
        // log(eventType)
        let fn = vm.$methods && vm.$methods[expr]
        if (eventType && fn) {
            //使用bind改变methods里的this指向vm实例
            node.addEventListener(eventType, fn.bind(vm))
        }
    },
    //这个方法用于获取vm中的数据
    getVMValue(vm, expr) {
        let data = vm.$data
        expr.split('.').forEach(item => {
            // log(item)
            data = data[item]
        })
        return data
    },
    //处理数据双向绑定的复杂数据类型
    setVMValue(vm, expr, value) {
        let data = vm.$data
        let arr = expr.split('.')
        arr.forEach((key, index) => {
            // log(key)
            if (index < arr.length - 1) {
                data = data[key]
            } else {
                data[key] = value
            }
        })
    }
}