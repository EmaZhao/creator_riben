// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      星命塔
// <br/>Create: 2019-02-27 11:03:16
// --------------------------------------------------------------------
var MainuiController = require("mainui_controller");
var BattleEvent = require("battle_event");
var BattleController = require("battle_controller");
var BattleConst = require("battle_const");
var StartowerEvent = require("startower_event");
var LevupgradeController = require("levupgrade_controller")


var StartowerController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var StartowerModel = require("startower_model");

        this.model = new StartowerModel();
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
        this.RegisterProtocal(11320, this.handle11320)     //星命塔信息
        this.RegisterProtocal(11321, this.handle11321)     //购买挑战次数
        this.RegisterProtocal(11322, this.handle11322)     //挑战星命塔
        this.RegisterProtocal(11323, this.handle11323)     //推送星命塔结算
        this.RegisterProtocal(11324, this.handle11324)     //扫荡星命塔
        this.RegisterProtocal(11325, this.handle11325)     //请求星命塔通关录像
        this.RegisterProtocal(11326, this.handle11326)     //推送星命塔有解锁
        this.RegisterProtocal(11333, this.handle11333)     //分享通关录像
        this.RegisterProtocal(11327, this.handle11327)     // 星命塔排行榜

        this.RegisterProtocal(11328, this.handle11328)     //通关奖励
        this.RegisterProtocal(11329, this.handle11329)
    },

    checkIsOpen:function(show_desc){
        var open_config = Config.star_tower_data.data_tower_const.open_floor;
        if(open_config == null)return false;
        var is_open = MainuiController.getInstance().checkIsOpenByActivate(open_config.val);
        if(is_open == false && show_desc == true){
            message(open_config.desc)    
        }
        return is_open;
    },
    
    //打开主界面
    openMainView:function(bool){
        if(!bool){
            if(this.main_view){
                this.main_view.close();
                this.main_view = null;
            }
        }else{
            if(!this.checkIsOpen(true))return;
            if(!this.main_view){
                this.main_view = Utils.createClass("star_tower_window_window",this);
            }
            if(this.main_view && this.main_view.isOpen() == false){
                this.main_view.open();
            }
            
        }
    },

    //打开挑战主界面
    openStarTowerMainView:function(bool,data){
        if(bool){
            if(!this.star_tower_window){
                this.star_tower_window = Utils.createClass("star_tower_main_window",this);
            }
            if(this.star_tower_window && this.star_tower_window.isOpen() == false){
                this.star_tower_window.open(data);
            }
            
        }else{
            if(this.star_tower_window){
                this.star_tower_window.close();
                this.star_tower_window = null;
            }
        }
    },

    //打开奖励总览
    openAwardWindow:function(bool){
        if(bool){
            if(!this.award_window){
                this.award_window = Utils.createClass("star_tower_award_window",this);
            }
            if(this.award_window && this.award_window.isOpen() == false){
                this.award_window.open();
            }
            
        }else{
            if(this.award_window){
                this.award_window.close();
                this.award_window = null;
            }
        }
    },

    //打开录像界面
    openVideoWindow:function(bool,data,tower){
        if(bool){
            if(!this.video_window){
                this.video_window = Utils.createClass("star_tower_video_window",this);
            }
            if(this.video_window && this.video_window.isOpen() == false){
                this.video_window.open([data,tower]);
            }
            
        }else{
            if(this.video_window){
                this.video_window.close();
                this.video_window = null;
            }
        }
    },

    //星命塔结算
    getResultWindow:function(){
        return this.result_window;
    },

    

    //打开结算界面
    openResultWindow:function(bool,data){
        if(bool == true){
            // -- 不能直接出剧情或者引导
            LevupgradeController.getInstance().waitForOpenLevUpgrade(true) 
            if(!this.result_window){
                this.result_window = Utils.createClass("star_tower_result_window",this);
            }
            if(this.result_window && this.result_window.isOpen() == false){
                this.result_window.open(data, BattleConst.Fight_Type.StarTower);
            }
            
        }else{
            if(this.result_window){
                this.result_window.close();
                this.result_window = null;
            }
            if(this.is_show_lock == true && this.show_data){
                //  --this.openGetWindow(true,this.show_data.tower)
            }else{
                gcore.GlobalEvent.fire(BattleEvent.CLOSE_RESULT_VIEW);
            }
            this.is_show_lock =false;
            this.show_data = null;
        }
    },

    //打开结算界面
    openGetWindow:function(bool,data){
        if(bool == true){
            if(!this.get_window){
                this.get_window = Utils.createClass("star_tower_get_window",this);
            }
            if(this.get_window && this.get_window.isOpen() == false){
                this.get_window.open(data);
            }
            
        }else{
            if(this.get_window){
                this.get_window.close();
                this.get_window = null;
            }
        }
    },


    //请求星命塔数据
    sender11320:function(){
        this.SendProtocal(11320,{})
    },

    handle11320:function( data ){
        this.model.setStarTowerData(data);
    },

    //购买挑战次数
    sender11321:function(){
        var protocal ={};
        this.SendProtocal(11321,protocal);
    },
        
    handle11321:function( data ){
        message(data.msg);
        this.model.updateLessCount(data);
    },

    //挑战星命塔
    sender11322:function(tower){
        var protocal ={};
        protocal.tower = tower;
        this.SendProtocal(11322,protocal);
    },

    handle11322:function( data ){
        message(data.msg);
        this.openStarTowerMainView(false);
    },

    //推送星命塔结算
    handle11323:function( data ){
        if(data.result == 1){
            BattleController.getInstance().openFinishView(true, BattleConst.Fight_Type.StarTower, data);
            this.model.updateMaxTower(data);
            this.model.updateLessCount(data);
        }else{
            BattleController.getInstance().openFailFinishView(true, BattleConst.Fight_Type.StarTower, data.result, data)
        }
    },

    //扫荡星命塔
    sender11324:function(tower){
        var protocal ={};
        protocal.tower = tower;
        this.SendProtocal(11324,protocal);
    },

    handle11324:function( data ){
        message(data.msg);
        this.model.updateLessCount(data);
    },

    //请求星命塔通关录像
    sender11325:function(tower){
        var protocal ={};
        protocal.tower = tower;
        this.SendProtocal(11325,protocal);
    },
    
    handle11325:function( data ){
        message(data.msg);
        gcore.GlobalEvent.fire(StartowerEvent.Video_Data_Event,data)
    },

    handle11326:function( data ){
        this.show_data = data;
        this.is_show_lock = true;
        // --self:openGetWindow(true,data.tower)
    },

    //分享通关录像
    sender11333:function(replay_id,channel,tower){
        var protocal ={};
        protocal.replay_id = replay_id;
        protocal.channel = channel;
        protocal.tower = tower;
        this.SendProtocal(11333,protocal);
    },

    handle11333:function( data ){
        message(data.msg);
        if(data.result == 1){
            this.openVideoWindow(false);
        }
    },

    requestStarTowerRank:function(){
        this.SendProtocal(11327,{});
    },

    handle11327:function(data){
        gcore.GlobalEvent.fire(StartowerEvent.Update_Top3_rank, data.rank_lists);
    },

    //领取通关奖励
    sender11328:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(11328, proto);
    },

    handle11328:function(data){
        message(data.msg);
        if(data.result == 1){
            gcore.GlobalEvent.fire(StartowerEvent.Update_Reward_Event);
        }
    },

    handle11329:function(data){
        this.model.setRewardData(data.award_list);
        gcore.GlobalEvent.fire(StartowerEvent.Update_First_Reward_Msg);
    },

    __delete: function () {
        if (this.model != null) {
            this.model.DeleteMe();
            this.model = null;
        }
    },

    getStarTowerRoot: function() {
        if (this.main_view)
            return this.main_view.root_wnd;
    },

    getStarTowerChallengeRoot: function() {
        if (this.star_tower_window)
            return this.star_tower_window.root_wnd;
    },


});

module.exports = StartowerController;