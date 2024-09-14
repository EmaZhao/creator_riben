// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-01 19:38:05
// --------------------------------------------------------------------
var BattleDramaHookRewardListPanel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.x = 0;
        this.y = 0;
    },

    // 设置父节点
    setParent: function (parent) {
        this.parent = parent
        this.is_show_name = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    show: function (params) {

    },

    setData: function (data) {
        if (this.backpack_item == null) {
            this.backpack_item = Utils.createClass("backpack_item");
            this.backpack_item.setParent(this.parent);
            this.backpack_item.initConfig(true, 1, false, true, this.is_show_name);
            this.backpack_item.show();
            this.backpack_item.setPosition(this.x, this.y);
        }
        this.backpack_item.setData(data);
    },

    addCallBack: function (callback) {

    },

    setPosition: function (x, y) {
        this.x = x;
        this.y = y
        if (this.backpack_item) {
            this.backpack_item.setPosition(x, y)
        }
    },

    setExtendData: function (data) {
        if (data) {
            this.is_show_name = data.is_show_name || false;
        }
    },

    suspendAllActions: function () {

    },

    // 设置可见与否
    setVisible: function (status) {
        this.backpack_item.setVisible(status)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    hide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    deleteMe: function () {
        if (this.backpack_item) {
            this.backpack_item.deleteMe()
        }
        this.backpack_item = null
    },
})
