// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-30 10:38:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ChatItemController = require("chat_item_controller");

var GoodsItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.rleasePrefab = false;
        this.prefabPath = PathTool.getPrefabPath("chat", "goods_item");
        this.chat_item_ctrl = ChatItemController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.backpack_item = ItemsPool.getInstance().getItem("backpack_item");
        this.backpack_item.setParent(this.root_wnd);
        this.backpack_item.setExtendData({scale: 0.8});
        this.backpack_item.addCallBack(this.onClickItem.bind(this));
        this.backpack_item.show();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params) {
        this.udpateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.backpack_item){
            this.backpack_item.deleteMe()
            this.backpack_item = null;
        }
    },

    setData: function(data) {
        this.data  = data;
        if (this.root_wnd)
            this.udpateWidgets();
    },

    udpateWidgets: function() {
        if (this.data) {
            this.backpack_item.setData(this.data);
        }
    },
    
    addCallBack: function(select_cb) {
        this.select_cb = select_cb;
    },

    onClickItem: function(item) {
        if (item.data && this.select_cb) {
            this.select_cb(item.data);
        }
    },

})