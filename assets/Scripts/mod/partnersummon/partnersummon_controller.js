// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: {DATE}
// --------------------------------------------------------------------
var SummonEvent = require("partnersummon_event");
var MainuiEvent = require("mainui_event")
var BattleEvent = require("battle_event")
var PartnersummonController = cc.Class({
    extends: BaseController,

    properties: {
        partner_summon_window: null,
    },

    ctor: function () {

    },

    // 初始化配置数据
    initConfig: function () {
        var PartnersummonModel = require("partnersummon_model");
        this.model = new PartnersummonModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // 登录先请求一下 
        if (!this.init_role_event) {            
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function() {
                gcore.GlobalEvent.unbind(this.init_role_event);
                // this.send23200();                 
            }.bind(this))
        }

        // 断线重连的时候
        if (!this.re_link_game_event) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function() {
                var GuideController = require("guide_controller");
                if (!GuideController.getInstance().isInGuide())
                    this.openPartnerSummonWindow(false);
            }.bind(this))
        }
        

        // 新获得伙伴弹窗
        if (!this.get_new_partner_event){
            this.get_new_partner_event = gcore.GlobalEvent.bind(MainuiEvent.CLOSE_ITEM_VIEW, function() {            
                if (this.is_add_partner && this.add_partner_data) {
                    this.openSummonGainShowWindow(true,[this.add_partner_data]);
                    this.is_add_partner = false;
                    this.add_partner_data = null;
                }
            }.bind(this));
        }

        // 关闭召唤界面后弹出
        if (!this.battle_result_event) {            
            this.battle_result_event = gcore.GlobalEvent.bind(BattleEvent.CLOSE_RESULT_VIEW, function() {
                if (this.is_add_partner && this.add_partner_data) {                    
                    this.openSummonGainShowWindow(true, [this.add_partner_data]);
                    this.is_add_partner = false;
                    this.add_partner_data = null;
                }
            }.bind(this));
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // 普通召唤
        this.RegisterProtocal(23200,this.handle23200.bind(this)) //请求召唤信息
        this.RegisterProtocal(23201,this.handle23201.bind(this)) //召唤
        this.RegisterProtocal(23202,this.handle23202.bind(this)) //更新召唤通用信息
        this.RegisterProtocal(23203,this.handle23203.bind(this)) //领取召唤分享奖励
        this.RegisterProtocal(23204,this.handle23204.bind(this)) //跟新单个召唤卡库信息
        this.RegisterProtocal(11095,this.handle11095.bind(this)) //其他途径获得伙伴推送
        this.RegisterProtocal(23212,this.handle23212.bind(this)) //推送新卡库开启

        this.RegisterProtocal(23205,this.handle23205.bind(this)) //必出5星
        // 11001
    },

    // 请求召唤信息
    send23200: function () {
        var protocal = {}
        this.SendProtocal(23200, protocal);
    },

    handle23200: function (summon_data) {
        if (summon_data)
            this.model.setSummonData(summon_data);
    },

    send23201: function(group_id, times, recruit_type) {
        var protocal = {}
        protocal.group_id = group_id;
        protocal.times = times;
        protocal.recruit_type = recruit_type;

        this.SendProtocal(23201, protocal);
    },

    handle23201: function (recruit_data) {
        // 召唤信息
        if (recruit_data) {
            this.model.setRecruitData(recruit_data);
            gcore.GlobalEvent.fire(SummonEvent.PartnerSummonSuccess);
        }
        // this.openSummonGainWindow(true);
    },

    handle23202: function (summon_data) {
        if (summon_data) 
            this.model.updateSummonData(summon_data);
    },

    handle23203: function () {

    },

    handle23204: function () {

    },

    sender23205:function(){
        this.SendProtocal(23205,{});
    },

    handle23205: function (data) {
        this.five_star_data = data;
        gcore.GlobalEvent.fire(SummonEvent.PartnerSummonFiveStar,data);
    },

    //获取5星必出数据
    getFiveStarData:function(){
        return this.five_star_data;
    },

    handle11095: function (data) {
        if(data.status == 1){
            this.openSummonGainShowWindow(true, data)
        }else{
            this.is_add_partner = true
            this.add_partner_data = data
        }
    },


    handle23212: function () {

    },

    scoreRecruit: function(group_id, times, recruit_type) {
        if (this.partner_summon_window) {
            this.partner_summon_window.startRecruit(group_id, times, recruit_type);
        }
    },

    // 再次召唤
    againRecruit: function() {
        if (this.partner_summon_window) {
            this.partner_summon_window.regainRecruit();
        }
    },

    recurit: function(group_id, times, recruit_type) {
        this.partner_summon_window.sendRecruitProtocal(group_id, times, recruit_type);
        // againRecruit
    },

    // 主界面
    openPartnerSummonWindow: function(status) {
        if (status === false) {
            if (this.partner_summon_window) {
                this.partner_summon_window.close();
                this.partner_summon_window = null;
            }
        } else {
            if (!this.partner_summon_window) {
                var SummonWindow = require("partnersummon_window");
                this.partner_summon_window = new SummonWindow(this);
            }
            this.partner_summon_window.open();
            this.model.setOpenPartnerSummonFlag(true);
        }
    },

    // 获得伙伴弹窗
    openSummonGainWindow: function(status, data,iType) {
        if (!status) {
            if (!this.summon_gain_window) return
            this.summon_gain_window.close();
            this.summon_gain_window = null;
        } else {
            if (!this.summon_gain_window) {
                var SummonGainWindow = require("partnersummon_gain_window");
                this.summon_gain_window = new SummonGainWindow(this, data,iType);
            }
            this.summon_gain_window.open();
        }
    },

    // 展示高级英雄
    openSummonGainShowWindow: function(status, show_bids, finish_cb,bg_type) {
        if (!status) {
            if (!this.summon_show_window) return;
            this.summon_show_window.close();
            this.summon_show_window = null;
        } else {
            if(show_bids.length == 1){
                let config
                config = Config.partner_data.data_partner_base[show_bids[0].partner_bid]
                if(!config || !config.show_effect || config.show_effect != 1)return
            }
            if (!this.summon_show_window) {
                var SummonShowWindow = require("partnersummon_show_window");
                this.summon_show_window = new SummonShowWindow(this, show_bids, finish_cb,bg_type);
            }
            this.summon_show_window.open();
        }
    },

    // 积分召唤提示
    openScoreTipWindow: function(status) {
        if (!status){
            if (!this.summon_score_window) require;
            this.summon_score_window.close();
            this.summon_score_window = null;
        } else {
            if (!this.summon_score_window) {
                var SummonScoreWindow = require("partnersummon_score_window");
                this.summon_score_window = new SummonScoreWindow(this);
            }
            this.summon_score_window.open();            
        }
    },

    getSummonItemRoot: function(name, get_cb) {
        if (this.partner_summon_window) {
            return this.partner_summon_window.root_wnd
        }
    },

    getSummonResultRoot: function() {
        if (this.summon_gain_window) {
            return this.summon_gain_window.root_wnd;
        }
    },

    getSummonShowRoot: function() {
        if (this.summon_show_window)
            return this.summon_show_window.root_wnd;
    }

});

module.exports = PartnersummonController;