// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      普通物品的tips,区分背包中和其他
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TipsConst = require("tips_const");
var StringUtil = require("string_util");
var TimeTool = require("timetool");

var HeadCircleTips = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "headcircle_tips");
        this.viewTag = SCENE_TAG.msg;
        this.win_type = WinType.Tips;
    },

    initConfig: function(){
        this.tips_controller = require("tips_controller").getInstance();
    },

    openCallBack:function(){
        this.background = this.seekChild("background");
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        this.main_panel = this.seekChild("main_panel");
        this.time_label = this.seekChild(this.main_panel, "time_label", cc.Label);
        this.desc = this.seekChild(this.main_panel, "desc", cc.RichText);
        this.name = this.seekChild(this.main_panel, "name", cc.Label);
        this.icon = this.seekChild(this.main_panel, "icon", cc.Sprite);
    },

    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_START, (function (event) {
            this.tips_controller.closeTIpsByType(TipsConst.type.HEAD_CIRCLE);
        }).bind(this));
    },

    openRootWnd:function(data){
        var config = Config.avatar_data.data_avatar[data.bid];
        this.loadRes(PathTool.getHeadcircle(config.res_id), (function(resObject){
            this.icon.spriteFrame = resObject;
        }).bind(this));
        this.name.string = config.name;
        this.desc.string = Utils.TI18N("激活条件：") + config.desc;
        if(config.expire_time > 0){
            this.time_label.string = Utils.TI18N("使用期限：") + TimeTool.getTimeFormatDay(config.expire_time * 60);
        }else{
            this.time_label.string = Utils.TI18N("使用期限：永久");
        }
    },

    closeCallBack: function () {
        this.tips_controller.closeTIpsByType(TipsConst.type.HEAD_CIRCLE);
    },
})