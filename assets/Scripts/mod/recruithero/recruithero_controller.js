// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-07-02 16:51:49
// --------------------------------------------------------------------
var RecruitHeroEvent = require("recruithero_event")

var RecruitheroController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var RecruitheroModel = require("recruithero_model");

        this.model = new RecruitheroModel();
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
        this.RegisterProtocal(25100, this.handle25100);
        this.RegisterProtocal(25101, this.handle25101);
        this.RegisterProtocal(25102, this.handle25102);
    },

    
    // 限时招募信息
    sender25100:function(){
        this.SendProtocal(25100,{});
    },

    handle25100:function(data){
        this.model.setRecruitEndTime(data.end_time);
        this.model.setRecruitBaseData(data);
        this.model.setStatusRedPoint(data);
        gcore.GlobalEvent.fire(RecruitHeroEvent.RecruitHeroBaseInfo,data);
    },

    // 领取奖励
    sender25101:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(25101,proto);
    },
        
    handle25101:function(data){
        message(data.msg)
    },

    //战斗预览
    sender25102:function(){
        var proto = {};
        this.SendProtocal(25102,proto);
    },

    handle25102:function(data){
        message(data.msg)
    },

    openRecruitHeroWindow:function(status){
        if(status == true){
            if(!this.recruit_hero_window){
                this.recruit_hero_window = Utils.createClass("recruit_hero_window",this);
            }

            if(this.recruit_hero_window && this.recruit_hero_window.isOpen() == false){
                this.recruit_hero_window.open();
            }
        }else{
            if(this.recruit_hero_window){
                this.recruit_hero_window.close();
                this.recruit_hero_window = null;
            }
        }
    },

});

module.exports = RecruitheroController;