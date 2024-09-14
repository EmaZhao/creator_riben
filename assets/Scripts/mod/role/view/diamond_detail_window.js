// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RoleController = require("role_controller");
var BaseRole = require("baserole");
var PlayerHead = require("playerhead");
var LoginController = require("login_controller");

var DiamondDetailWindow = cc.Class({
    extends: BaseView,
    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "diamond_detail_window");
        this.viewTag = SCENE_TAG.dialogue;
    },

    openCallBack: function () {
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.close_btn_2 = this.main_container.getChildByName("close_btn_2");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var info_con = this.main_container.getChildByName("info_con");
        this.total_diamond = info_con.getChildByName("total_diamond_num").getComponent(cc.Label);
        this.charge_diamond = info_con.getChildByName("charge_diamond_num").getComponent(cc.Label);
        this.free_diamond = info_con.getChildByName("free_diamond_num").getComponent(cc.Label);

        this.roleVo = RoleController.getInstance().getRoleVo();
    },

    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function (event){
            RoleController.getInstance().openDiamondDetailPanel(false);
        }, this);
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function (event){
            RoleController.getInstance().openDiamondDetailPanel(false);
        }, this);
        this.close_btn_2.on(cc.Node.EventType.TOUCH_END, function (event){
            RoleController.getInstance().openDiamondDetailPanel(false);
        }, this);
    },

    openRootWnd: function(){
        this.updateData();
    },

    updateData : function(){
        var total = this.roleVo.gold_hard + this.roleVo.gold;
        this.total_diamond.string = `${total}`;
        this.charge_diamond.string = `${this.roleVo.gold_hard}`;
        this.free_diamond.string = `${this.roleVo.gold}`;
    },


    closeCallBack: function () {
    }
});

module.exports = DiamondDetailWindow;