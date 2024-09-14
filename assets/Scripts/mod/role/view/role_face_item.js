// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     头像框子项
// <br/>Create: 2019-04-16 17:32:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");

var Role_face_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_face_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.icon_bg_nd = this.seekChild("icon_bg");

        this.select_nd = this.seekChild("select");
        this.select_nd.active = false;
        this.use_icon_nd = this.seekChild("use");
        this.use_icon_nd.active = false;

        this.face_icon_sp = this.seekChild("icon", cc.Sprite);
        this.face_name_lb = this.seekChild("label", cc.Label);
        this.face_name_bg_sp = this.seekChild("name_bg", cc.Sprite);

        this.active_nd = this.seekChild("active");
        this.active_nd.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END,function(){
            if(this.call_fun){
                this.call_fun(this,this.vo)
            }
        },this)
    },

    setTouchFunc:function(value){
        this.call_fun = value;
    },

    setData: function (data) {
        cc.log(data)
        // this.vo = data;
        // this.index = index;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.vo == null) return
        var data = this.vo;
        if (data.has != 0) {
            this.active_nd.active = false;
        } else {
            this.active_nd.active = true;
        }

        var face_id = data.res_id || 0;
        var res = PathTool.getUIIconPath("headcircle", "txt_cn_headcircle_" + face_id);
        if (face_id == 0) {
            this.face_icon_sp.node.scale = 1;
        } else {
            this.face_icon_sp.node.sacle = 0.95
        }

        this.loadRes(res, function (sp) {
            this.face_icon_sp.spriteFrame = sp;
        }.bind(this))

        var conifg = Config.avatar_data.data_avatar[data.base_id];
        if (config) {
            this.icon_bg_nd.y = this.icon_bg_nd.y - config.offy;
        }
        var name = data.name || "";
        this.face_name_lb.string = name;
        this.updateRedPoint();
    },

    updateRedPoint: function () {

    },

    setSelected: function (bool) {
        this.select_nd.active = bool;
    },

    showLock: function (bool) {
        this.is_can_active = false;
        this.is_lock = bool;

    },

    showUseIcon: function (bool) {
        this.is_use = bool;
        this.use_icon_nd.active = boo;
    },

    isHaveData: function () {
        if (this.vo) {
            return true
        }
        return false
    },

    getData: function () {
        return this.vo
    },

    getIsLock: function () {
        return this.is_lock
    },

    getIsActive: function () {
        return this.is_can_active
    },

    getIsUse: function () {
        return this.is_use
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})