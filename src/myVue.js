// 定义一个类 用于创建vue实例
class myVue {
    constructor(options = {}) {
        //给vue实例增加属性
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods
        new Observer(this.$data)
        //把data中所有的数据都代理到vm上
        this.proxy(this.$data)
        //把methods中所有的数据都代理到vm上
        this.proxy(this.$methods)
        //如果指定了el参数，对el进行解析
        if (this.$el) {
            //compile负责解析模板的内容
            //需要：模板和数据,把整个vue实例传过去
            new Compile(this.$el, this)
        }
    }
    //把data和methods中所有的数据代理到vm上
    proxy(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(newValue) {
                    if (data[key] == newValue) {
                        return
                    }
                    data[key] = newValue
                }
            })
        })
    }
}