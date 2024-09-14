// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-07-08 20:48:58
// --------------------------------------------------------------------
var TimesummonEvent = require("timesummon_event")
var TimesummonController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var TimesummonModel = require("timesummon_model");

        this.model = new TimesummonModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },
    requestDMMSummonData(){//请求DP抽卡活动
      let protocal = {}
      this.SendProtocal(23223, protocal);
    },

    requestDMMSummon(){//请求DP召唤
      let protocal = {}
      this.SendProtocal(23224, protocal);
    },
    requestTimeSummonData(){
        let protocal = {}
        this.SendProtocal(23216, protocal)
    },
    // -- 请求限时召唤
    requestTimeSummon( times, recruit_type ){
        let protocal = {}
        protocal.times = times
        protocal.recruit_type = recruit_type
        this.SendProtocal(23217, protocal)
    },
    // -- 请求领取礼包
    requestSummonGetAward(  ){
        let protocal = {}
        this.SendProtocal(23218, protocal)
    },
    send23219(bid){
        let protocal = {}
        protocal.bid = bid
        this.SendProtocal(23219, protocal)
    },
    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(23216, this.handle23216)     //-- 限时召唤数据
        this.RegisterProtocal(23217, this.handle23217)     //-- 限时召唤
        this.RegisterProtocal(23218, this.handle23218)     //-- 领取保底礼包
        this.RegisterProtocal(23219, this.handle23219)     //-- 请求英雄试玩
        this.RegisterProtocal(23223, this.handle23223) // DP抽卡数据请求
        this.RegisterProtocal(23224, this.handle23224)  // DP召唤请求
    },

    handle23223(data){
      if(data){
        gcore.GlobalEvent.fire(TimesummonEvent.Update_DMMSUMMON_Data_Event, data)
      }
    },

    handle23224(data){
        message(data.msg);
    },

    handle23216(data){
        if(data){
            gcore.GlobalEvent.fire(TimesummonEvent.Update_Summon_Data_Event, data)
        }
    },
    handle23217(data){
        message(data.msg)
    },
    handle23218(data){
        message(data.msg)
    },
    handle23219(data){
        message(data.msg)
        if(data.flag == false){
            var BattleController = require("battle_controller")
            BattleController.getInstance().csFightExit()
        }
    },
    // -- 打开奖励预览 text_elite:内容描述
    openTimeSummonAwardView( status, group_id, data,text_elite ){
        if(status == true){
            if(this.summon_award_view == null){
                let TimeSummonAwardView = require("time_summon_award_window")
                this.summon_award_view = new TimeSummonAwardView(this)
            }
            if(this.summon_award_view.isOpen() == false){
                this.summon_award_view.open({group_id:group_id, data:data,text_elite:text_elite})
            }
        }else{
            if(this.summon_award_view){
                this.summon_award_view.close()
                this.summon_award_view = null
            }
        }
    },
    openTimeSummonProgressView(status, times, camp_id){
        if(status == true){
            if(this.summon_progress_view == null){
                let TimeSummonProgressView = require("time_summon_progress_window")
                this.summon_progress_view = new TimeSummonProgressView(this)
            }
            if(this.summon_progress_view.isOpen() == false){
                this.summon_progress_view.open({times:times, camp_id:camp_id})
            }
        }else{
            if(this.summon_progress_view){
                this.summon_progress_view.close()
                this.summon_progress_view = null
            }
        }
    },
    openTimeSummonpreviewWindow(status,index,typeId){
        if(status == true){
            if(this.SummonpreviewWindow == null){
                var TimeSummonPreviewWindow = require("time_summon_preview_window")
                this.SummonpreviewWindow = new TimeSummonPreviewWindow(this)
            }
            if(this.SummonpreviewWindow.isOpen() == false){
                this.SummonpreviewWindow.open({index:index,type:typeId})
            }
        }else{
            if(this.SummonpreviewWindow){
                this.SummonpreviewWindow.close()
                this.SummonpreviewWindow = null
            }
        }
    },
});

module.exports = TimesummonController;