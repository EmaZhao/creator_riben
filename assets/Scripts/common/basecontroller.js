/*-----------------------------------------------------+
 * 控制处理类相关处理
 * @author whjing2012@163.com
 +-----------------------------------------------------*/
 window.BaseController = cc.Class({
    extends: BaseClass,
    ctor:function(){
        if(this.constructor.instance){
            throw new Error("不能重复实例化一个单例");
        }
        this.constructor.instance = this;
        if(this.initConfig){
            this.initConfig();
        }
        if(this.registerEvents){
            this.registerEvents();
        }
        if(this.registerProtocals){
            this.registerProtocals();
        }
    },
    statics: {
        instance: null
    },

    RegisterProtocal:function(cmd, func){
        gcore.SmartSocket.bindCmd(cmd, func.bind(this));
    },

    SendProtocal:function(cmd, data){
        if(!cmd){
            Log.error("发送失败，错误的协议号");
            return;
        }
        data = data || {};
        gcore.SmartSocket.send(cmd, data);
    }
    
})

// 实例化单利
BaseController.getInstance = function() {
    if (!this.instance) {
        new this();
    }
    return this.instance;
}