/**
 * observer用于给data中所有的数据添加getter和setter
 */
class Observer {
    constructor(data) {
        this.data = data
        this.walk(data)
    }
    /**核心方法
     * 遍历data中所有的数据，都添加上getter和setter
     */
    walk(data) {
        if (!data || typeof data != "object") {
            return
        }
        Object.keys(data).forEach(key => {
            // log(key) //给data对象的key设置getter和setter
            this.defineReactive(data, key, data[key])
            //如果data[key]是复杂数据类型，递归walk，直到简单数据类型后return
            this.walk(data[key])
        })
    }
    //data中的每一个数据都应该维护一个Dep对象
    //Dep保存了所有的订阅了该数据的订阅者
    defineReactive(obj, key, value) {
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                //如果Dep.target中有watcher对象，存储到订阅者数组中
                Dep.target && dep.addSub(Dep.target)
                // log('你获取了值', value)
                return value
            },
            set(newValue) {
                if (value === newValue) {
                    return
                }
                // log('你设置了newValue', newValue)
                value = newValue
                //如果newValue也是一个新对象，也要对其进行数据劫持
                that.walk(newValue)
                //发布通知，让所有订阅者更新内容
                dep.notify()
            }
        })
    }
}