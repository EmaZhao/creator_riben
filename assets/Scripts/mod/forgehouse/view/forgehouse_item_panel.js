// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-05 15:17:27
// --------------------------------------------------------------------
var ForgehouseItemPanel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.x = 0;
        this.y = 0;
    },

    // 设置父节点
    setParent:function(parent){
        this.parent = parent

        this.backpack_item = Utils.createClass("backpack_item");
        this.backpack_item.setParent(this.parent);
        this.backpack_item.initConfig(true, 1, true, true);
        this.backpack_item.show();
        this.registerEvent();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    show:function(params){

    },

    // 设置配置数据不会拿原始数据做操作处理
    setData:function(object){
        if (object == null || object.data == null) return;
        this.data = object.data
        this.is_select = object.is_select           // 是否选中
        this.is_red = object.is_red                 // 是否有红点
        this.backpack_item.setData(this.data.id)

        // 默认选中处理
        if (this.is_select == true && this.callback){
            this.callback(this)
        }
        // 红点状态
        this.backpack_item.setRedStatus(this.is_red)
    },

    // 点击回调
    addCallBack:function(callback){
        this.callback = callback
        this.backpack_item.addCallBack(function(){
            callback(this)
        }.bind(this))
    },

    setPosition:function(x, y){
        this.x = x;
        this.y = y;
        this.backpack_item.setPosition(x, y)
    },

    // 扩展参数
    setExtendData:function(data){

    },

    // 设置选中状态
    setSelectStatus:function(status){
        this.is_select = status
        this.backpack_item.setMaskVisible(status)
    },

    suspendAllActions:function(){

    },

    // 设置可见与否
    setVisible:function(status){
        this.backpack_item.setVisible(status)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    hide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    deleteMe:function(){
        if (this.backpack_item){
            this.backpack_item.deleteMe()
        }
        this.backpack_item = null
    },
})
