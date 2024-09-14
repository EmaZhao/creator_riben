// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-16 10:23:00
// --------------------------------------------------------------------
var MainuiController    = require("mainui_controller");
var MainUiConst = require("mainui_const");
var EsecsiceConst = require("esecsice_const");
var RoleController = require("role_controller");

var PrimusModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        // 是否显示红点  策划要求.点一次界面就消除
        this.is_show_redpoint = true
        //  挑战次数
        this.challenge_count = 0
        //  挑战冷却时间
        this.challenge_time = 0
    },

    recordChallengeCount:function(data){
        this.challenge_count = data.num || 0;
        this.challenge_time = data.time || 0;
        
        this.updateRedPoint()
    },

    updateRedPoint: function() {
        RedMgr.getInstance().addCalHandler(this.checkRed.bind(this), RedIds.Primus);
    },

    checkRed:function(){
        var is_show = this.checkRedStatus();
        //var SceneConst = require("scene_const");
        //MainuiController.getInstance().setBtnRedPoint(MainUiConst.new_btn_index.esecsice, {bid:SceneConst.RedPointType.primus, status:is_show});
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.honourfane, is_show); 
    },

    checkRedStatus:function(){
        var open_data = Config.dailyplay_data.data_exerciseactivity;
        var bool = MainuiController.getInstance().checkIsOpenByActivate(open_data[EsecsiceConst.execsice_index.honourfane].activate);
        if(bool == false)return false;
        var status = this.is_show_redpoint;
        // 等级
        if(status){
            var role_vo = RoleController.getInstance().getRoleVo();
            var lev = role_vo && role_vo.lev || 0;
            var limit_lev = Config.primus_data.data_const.open_lev.val;
            if(lev < limit_lev){
                status = false;
            }
        }
        // 挑战次数
        if(status){
            var max = Config.primus_data.data_const.daily_challenge_limit.val;
            if(this.challenge_count >= max){
                status = false;
            }
        }
        // 冷却cd
        if(status){
            var time = gcore.SmartSocket.getTime();
            if(this.challenge_time != 0 && this.challenge_time > time){
                status = false;
            }
        }
        return status;
    },
});