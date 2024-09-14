// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-28 20:21:24
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Vip_label_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "vip_label_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.label = this.seekChild("label",cc.RichText);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData:function(data){
        this.data = data;
        if(this.root_wnd)
        this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if(this.data == null)return
        this.label.string = this.data;
        
        var a = this.data.match(/\'([^\']*)\'/);
        if(a && a[1]){
            var res = PathTool.getItemRes(a[1]);
            this.loadRes(res, (function (resObject) {
                this.label.addSpriteFrame(resObject);
            }).bind(this));
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})