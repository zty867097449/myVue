/**
 * watcher模块负责把compile模块和observer模块关联起来
 */
class Watcher {
    /**
     * vm：当前的vue实例
     * expr：data中数据的名字
     * cb：一旦数据发生了改变，则需要调用cb
     */
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        /** 
         * this表示的就是新创建的watcher对象
         * 存储到Dep.target属性上
         * */
        Dep.target = this
        //把expr的旧值给存起来
        this.oldValue = this.getVMValue(vm, expr)
        //清空Dep.target
        Dep.target = null
    }
    //对外暴露的一个方法，这个方法用于更新页面
    update() {
        let oldValue = this.oldValue
        let newValue = this.getVMValue(this.vm, this.expr)
        if (oldValue != newValue) {
            this.cb(newValue)
        }
    }
    //这个方法用于获取vm中的数据
    getVMValue(vm, expr) {
        let data = vm.$data
        expr.split('.').forEach(item => {
            // log(item)
            data = data[item]
        })
        return data
    }
}
/**
 * dep对象管理订阅者和通知所有订阅者
 * */
class Dep {
    constructor() {
        //用于管理订阅者
        this.subs = []
    }
    //添加订阅者
    addSub(watcher) {
        this.subs.push(watcher)
    }
    //通知，发布
    notify() {
        //遍历所有的订阅者,调用watcher的update()方法
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}