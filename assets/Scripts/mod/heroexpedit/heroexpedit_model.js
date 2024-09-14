// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-11 14:13:49
// --------------------------------------------------------------------
var MainuiController = require("mainui_controller");
var RoleController = require("role_controller");
var HeroExpeditEvent = require("heroexpedit_event");
var EsecsiceConst = require("esecsice_const");
var MainUiConst = require("mainui_const");

var HeroexpeditModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = arguments[0];
    },

    properties: {
    },

    initConfig: function () {
        this.levelRedPointStatus = 0
	      this.sendRedPointStatus = 0
        this.status = 0;
    },

    // 24406
    setEmployPartner:function(data){
        this.employPartner = data;
    },

    getEmployPartner:function(){
        return this.employPartner || {};
    },
        
    //24404
    setPartnerMessage:function(data){
        this.partnerMessage = data;
    },

    getPartnerMessage:function(){
        return this.partnerMessage || {};
    },

    //远征的主界面数据
    setExpeditData:function(data){
        if(!data)return;
        this.expeditData = data;
        this.guard_id = data.guard_id;
        this.updateRedPoint();
    },

    updateRedPoint: function() {
        RedMgr.getInstance().addCalHandler(this.checkRed.bind(this), RedIds.Heroexpedit);
    },

    checkRed:function(){
        var status = this.checkRedStatus();
        //var SceneConst = require("scene_const");
        //MainuiController.getInstance().setBtnRedPoint(MainUiConst.new_btn_index.esecsice, {bid:SceneConst.RedPointType.heroexpedit, status:status}) ;
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.heroexpedit, status);
    },

    getExpeditData:function(){
        return this.expeditData || {};
    },

    // 通关红点
    setLevelRedPoint:function(status){
        this.levelRedPointStatus = status
    },

    // 派遣红点
    setHeroSendRedPoint:function(status){
        if(status == 0){
            status = 1
        }else{
            status = 0
        }

        this.sendRedPointStatus = status;
        gcore.GlobalEvent.fire(HeroExpeditEvent.Red_Point_Event);

    },

    getHeroSendRedPoint:function(){
        if(this.sendRedPointStatus == 1){
            return true;
        }else{
            return false;
        }
    },

    //远征红点
    checkRedStatus:function(){
        var open_data = Config.dailyplay_data.data_exerciseactivity;
        var bool = MainuiController.getInstance().checkIsOpenByActivate(open_data[EsecsiceConst.execsice_index.heroexpedit].activate);
        if(bool == false)return false;
        var num = this.status + this.sendRedPointStatus;
        var status = false;
        if(num <= 0){
            status = false
        }else{
            status = true;
        }
        return status;
    },

    //获取宝箱的位置
    getExpeditBoxData:function(){
        var box = [];
        var data = Config.expedition_data.data_sign_info;
        for(var i in data){
            if(data[i].type == 2){
                box.push(i);
            }
        }
        return box
    },

    // 血条
    setHeroBloodById:function(data){
        this.HeroBloodData = [];
        this.hireHeroData = [];
        this.hireHeroIsUsedData = [] //雇佣的英雄是否使用过
        this.setExpeditEmployData(data.list);
        // 本身的
        var role_vo = RoleController.getInstance().getRoleVo();
	    var rid = 0;
        var srv_id = "";
        if(role_vo){
            rid = role_vo.rid;
		    srv_id = role_vo.srv_id;
        }
        for(var i in data.p_list){
            var key = Utils.getNorKey(rid, srv_id, data.p_list[i].id)
		    this.HeroBloodData[key] = data.p_list[i].hp_per;
        }
        // 雇佣的
        if(Utils.next(data.list)!=null){
            for(var j in data.list){
                var key = Utils.getNorKey(data.list[j].rid, data.list[j].srv_id, data.list[j].id)
                this.hireHeroData[key] = true
                this.HeroBloodData[key] = data.list[j].hp_per
                this.hireHeroIsUsedData[key] = data.list[j].is_used
            }
        }
    },

    getHeroBloodById:function(id, rid, srv_id){
        if(!this.HeroBloodData)return 100;
        if(!id || (typeof id != "number"))return 100;
        rid = rid || 0;
        srv_id = srv_id || "";
        var key = Utils.getNorKey(rid, srv_id, id)
        if(this.HeroBloodData[key] == null){
            return 100;
        }
        return this.HeroBloodData[key];
    },

    // 雇佣的
    getHireHero:function(id, rid, srv_id){
        if(!this.hireHeroData)return false;
        if(!id || (typeof id != "number"))return false;
        rid = rid || 0
        srv_id = srv_id || ""
        var key = Utils.getNorKey(rid, srv_id, id)
        return this.hireHeroData[key] || false;
    },

    // 雇佣使用的
    getHireHeroIsUsed:function(id, rid, srv_id){
        if(!this.hireHeroIsUsedData)return 0;
        if(!id || (typeof id != "number"))return 0;
        rid = rid || 0;
        srv_id = srv_id || "";
        var key = Utils.getNorKey(rid, srv_id, id);
        return this.hireHeroIsUsedData[key] || 0;
    },

    // 英雄出征的雇佣英雄
    setExpeditEmployData:function(data){
        this.expeditEmployData = data
    },

    getExpeditEmployData:function(){
        return this.expeditEmployData || {};
    },

    __delete:function(){

    },
});