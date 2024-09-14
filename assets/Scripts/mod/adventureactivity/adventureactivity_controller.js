// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-08 14:25:57
// --------------------------------------------------------------------
var MainuiController = require("mainui_controller")
var BattleConst         = require("battle_const");
var AdventureActivityConst= require("adventureactivity_const");
var AdventureController= require("adventure_controller");

var AdventureactivityController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var AdventureactivityModel = require("adventureactivity_model");

        this.model = new AdventureactivityModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
    },

    //---------------------------@ 界面相关
    //  打开冒险活动主界面
    openAdventureActivityMainWindow:function(status){
        if(status == true){
            if(this.adventure_activity_window == null){
                this.adventure_activity_window = Utils.createClass("adventureactivity_window",this);
            }
            if(this.adventure_activity_window.isOpen() == false){
                this.adventure_activity_window.open();
            }
        }else{
            if(this.adventure_activity_window){
                this.adventure_activity_window.close();
                this.adventure_activity_window = null;
            }
        }
    },

    //  点击冒险活动item
    onClickGotoAdvenTureAcivity:function(id){
        if(id == AdventureActivityConst.Ground_Type.adventure){ //冒险
            AdventureController.getInstance().requestEnterAdventure();
        }else if(id == AdventureActivityConst.Ground_Type.element){ //元素神殿
            MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.ElementWar);
        }else if(id == AdventureActivityConst.Ground_Type.heaven){ //天界副本
            MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.HeavenWar);
        }
    },

    // 判断活动是否开启 true:开启  false：未开启
    isOpenActivity:function(id){
        var data = Config.cross_ground_data.data_adventure_activity;
        var status = false;
        if(data[id]){
            var is_open = MainuiController.getInstance().checkIsOpenByActivate(data[id].activate);
            if(is_open == true){
                status = true;
            }
        }
        return status;
    },

});

module.exports = AdventureactivityController;