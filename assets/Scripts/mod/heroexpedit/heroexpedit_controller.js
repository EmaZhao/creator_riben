// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-11 14:13:49
// --------------------------------------------------------------------
var LoginEvent = require("login_event");
var HeroController = require("hero_controller");
var EsecsiceConst = require("esecsice_const");
var HeroExpeditEvent = require("heroexpedit_event");
var MainuiController = require("mainui_controller");

var HeroexpeditController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var HeroexpeditModel = require("heroexpedit_model");

        this.model = new HeroexpeditModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if(this.role_event == null){
            this.role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS,(function(){
                gcore.GlobalEvent.unbind(this.role_event)
                this.role_event = null;
                this.sender24410();
                this.sender24405();
                // this.sender24400();
            }).bind(this))
        }
        
        if(this.re_link_game_event == null){
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME,(function(){
                this.openHeroExpeditView(false);
                this.openHeroExpeditLevelView(false);
                this.openEmpolyPanelView(false);
                this.openBrowsePanelView(false);
                this.sender24405();
                this.sender24410();
                // this.sender24400();
            }).bind(this))
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(24400, this.handle24400);
        this.RegisterProtocal(24401, this.handle24401);
        this.RegisterProtocal(24402, this.handle24402);
        this.RegisterProtocal(24403, this.hander24403);
        this.RegisterProtocal(24404, this.hander24404);
        this.RegisterProtocal(24405, this.hander24405);
        this.RegisterProtocal(24406, this.hander24406);
        this.RegisterProtocal(24407, this.hander24407);
        this.RegisterProtocal(24408, this.hander24408);
        this.RegisterProtocal(24409, this.hander24409);
        this.RegisterProtocal(24410, this.hander24410);
    },

    // 请求远征数据
    sender24400:function(){
        this.SendProtocal(24400, {});
    },

    handle24400:function(data){
        this.model.setExpeditData(data);
        this.grard_id = data.guard_id;
        gcore.GlobalEvent.fire(HeroExpeditEvent.HeroExpeditViewEvent, data);
        gcore.GlobalEvent.fire(HeroExpeditEvent.Red_Point_Event);
    },

    // 获取关卡
    getGrardID:function(){
        return this.grard_id || 1;
    },

    // 获取关卡守将信息
    sender24401:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(24401, proto);
    },

    handle24401:function(data){
        if(!data)return;
        var box_pos = this.model.getExpeditBoxData();
        var status = false;
        for(var i in box_pos){
            if(box_pos[i] == data.id){
                status = true;
                break;
            }
        }
        if(status == true){
            this.openBrowsePanelView(true, data);
        }else{
            if(data.id <= this.grard_id){
                this.openHeroExpeditLevelView(true,data);
                gcore.GlobalEvent.fire(HeroExpeditEvent.levelMessageEvent, data);
            }else{
                message(Utils.TI18N("先通关前置关卡"))
            }
        }
    },

    // 领取关卡宝箱
    sender24402:function(id){
        var proto = {}
        proto.id = id
        this.SendProtocal(24402,proto);
    },

    handle24402:function(data){
        message(data.msg);
        if(data.code == 1){
            var expedit_data = this.model.getExpeditData();
            expedit_data.reward.push({reward_id: data.id});
            gcore.GlobalEvent.fire(HeroExpeditEvent.Get_Box_Event, data.id);
        }
    },

    // 挑战
    sender24403:function(formation_type,pos_info,hallows_id){
        var proto = {}
        proto.formation_type = formation_type;
        proto.pos_info = pos_info;
        proto.hallows_id = hallows_id;
        this.SendProtocal(24403, proto);
    },

    hander24403:function(data){
        message(data.msg)
        if(data.code == 1){
            HeroController.getInstance().openFormGoFightPanel(false);
        }
    },

    // 伙伴信息
    sender24404:function(){
        this.SendProtocal(24404,{});
    },

    hander24404:function(data){
        this.model.setPartnerMessage(data.list);
        gcore.GlobalEvent.fire(HeroExpeditEvent.EmployEvent);
    },

    // 已派出伙伴信息
    sender24405:function(){
        this.SendProtocal(24405,{});
    },

    hander24405:function(data){
        this.model.setHeroSendRedPoint(data.list.length);
        gcore.GlobalEvent.fire(HeroExpeditEvent.EmploySendEvent,data);
    },

    // 雇佣伙伴
    sender24406:function(){
        this.SendProtocal(24406,{});    
    },

    hander24406:function(data){
        this.model.setEmployPartner(data.list);
    },

    // 派出伙伴
    sender24407:function(id){
        var proto = {};
        proto.id = id 
        this.SendProtocal(24407,proto)
    },

    hander24407:function(data){
        message(data.msg);
        if(data.code == 1){
            gcore.GlobalEvent.fire(HeroExpeditEvent.EmploySendEvent_Success,data.id);
        }
    },

    // 英雄出战
    sender24409:function(){
        this.SendProtocal(24409,{});
    },

    hander24409:function(data){
        this.model.setHeroBloodById(data);
    },

    // 远征红点,仅限过关
    sender24410:function(){
        this.SendProtocal(24410,{});
    },

    hander24410:function(data){
        this.model.setLevelRedPoint(data.is_show)
    },

    // 雇佣伙伴
    sender24408:function(rid,srv_id,id){
        var proto = {};
        proto.rid = rid;
        proto.srv_id = srv_id;
        proto.id = id;
        this.SendProtocal(24408,proto);
    },

    hander24408:function(data){
        message(data.msg)
    },

    // 打开远征界面
    openHeroExpeditView:function(bool){
        if(bool == true){
            var open_data = Config.dailyplay_data.data_exerciseactivity[EsecsiceConst.execsice_index.heroexpedit];
            if(open_data == null){
                message(Utils.TI18N("远征数据异常"));
                return;
            }
            var bool = MainuiController.getInstance().checkIsOpenByActivate(open_data.activate);
            if(bool == false){
                message(open_data.lock_desc);
                return;
            }

            if(!this.heroExpeditView){
                this.heroExpeditView = Utils.createClass("heroexpedit_window",this);
            }
            if(this.heroExpeditView && this.heroExpeditView.isOpen() == false){
                this.heroExpeditView.open()
            }
            

        }else{
            if(this.heroExpeditView){
                this.heroExpeditView.close();
                this.heroExpeditView = null;
            }
        }
    },

    // 打开远征关卡信息界面
    openHeroExpeditLevelView:function(bool,data){
        if(bool == true){
            if(!this.heroExpeditLevelView){
                this.heroExpeditLevelView = Utils.createClass("heroexpedit_level_window",this);
            }
            if(this.heroExpeditLevelView && this.heroExpeditLevelView.isOpen() == false){
                this.heroExpeditLevelView.open(data);
            }
            
        }else{
            if(this.heroExpeditLevelView){
                this.heroExpeditLevelView.close();
                this.heroExpeditLevelView = null;
            }
        }
    },

    // 打开远征雇佣界面
    openEmpolyPanelView:function(bool){
        if(bool == true)   {
            if(!this.empolyPanelView){
                this.empolyPanelView = Utils.createClass("empoly_window",this);
            }
            if(this.empolyPanelView && this.empolyPanelView.isOpen() == false){
                this.empolyPanelView.open();
            }
            
        }else{
            if(this.empolyPanelView){
                this.empolyPanelView.close();
                this.empolyPanelView = null;
            }
        }
    },

    // 打开查看宝箱奖励
    openBrowsePanelView:function(bool, data){
        if(bool == true && data){
            if(!this.browsePanelView){
                this.browsePanelView = Utils.createClass("browse_window",this);
            }
            if(this.browsePanelView && this.browsePanelView.isOpen() == false){
                this.browsePanelView.open(data);
            }
            
        }else{
            if(this.browsePanelView){
                this.browsePanelView.close();
                this.browsePanelView = null;
            }
        }
    },

    __delete:function(){
       
    },
});

module.exports = HeroexpeditController;