// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     福利标签页
// <br/>Create: 2019-03-04 15:12:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Welfare_tabPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "welfare_tab");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container_nd = this.seekChild("main_container");
        this.name_lb = this.seekChild("name", cc.Label);
        this.red_point_nd = this.seekChild("red_point");
        this.icon_sp = this.seekChild("icon", cc.Sprite);
        this.select_nd = this.seekChild("select");

        if (this.red_status != null) {
            this.updateTipsStatus(this.red_status);
        }
        if (this.select_status != null) {
            this.setSelected(this.select_status);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Tab);
            if (this.call_back != null) {
                this.call_back(this)
            }
        }, this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        this.name_lb.string = this.data.title;
        var res = PathTool.getIconPath("welfare/action_icon", "welfare_icon_" + (this.data.ico || 1));
        this.loadRes(res, function (sf_obj) {
            this.icon_sp.spriteFrame = sf_obj;
        }.bind(this))
    },

    updateTipsStatus: function (status) {
        if (this.root_wnd == null) {
            this.red_status = status;
            return
        }
        this.red_point_nd.active = status;
        if(this.data.setRedPointStatus){
          this.data.setRedPointStatus(status);
        }
    },

    getData: function () {
        return this.data
    },

    setSelected: function (status) {
        if (this.root_wnd == null) {
            this.select_status = status;
            return
        }
        this.select_nd.active = status;
    },

    setClickCallBack: function (call_back) {
        this.call_back = call_back;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})