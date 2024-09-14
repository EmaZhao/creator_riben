// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     限时招募
// <br/>Create: 2019-07-02 17:07:38
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller");
var HeroController = require("hero_controller");
var JumpController = require("jump_controller");
var RecruitHeroEvent = require("recruithero_event");

var Recruit_heroWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("recruithero", "recruit_hero_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.player_item  = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
    
        this.main_container = this.root_wnd.getChildByName("main_container");
    
        this.load_bg = this.main_container.getChildByName("load_bg").getComponent(cc.Sprite);
        var res = PathTool.getBigBg("action_bigbg_3",null,"action");
        this.loadRes(res, (function(resObject){
            this.load_bg.spriteFrame = resObject;
        }).bind(this));
    
        var Text_1 = this.main_container.getChildByName("Text_1").getComponent(cc.Label);
        Text_1.string = Utils.TI18N("活动时间：");
        
        var Text_3 = this.main_container.getChildByName("Text_3").getComponent(cc.Label);
        Text_3.string = Utils.TI18N("完成上方任务即可免费领取5星英雄斯芬克斯");

        this.remain_time = this.main_container.getChildByName("remain_time").getComponent(cc.Label);
        this.remain_time.string = "";
    
        this.all_get = this.main_container.getChildByName("all_get");
        this.all_get.active = false;
        var all_get_lab = this.all_get.getChildByName("label").getComponent(cc.Label);
        all_get_lab.string = Utils.TI18N("领取");
        
        this.all_goto = this.main_container.getChildByName("all_goto");
        this.all_goto.active = false;
        var all_goto_lab = this.all_goto.getChildByName("label").getComponent(cc.Label);
        all_goto_lab.string = Utils.TI18N("未完成");

        this.btn_paint = this.main_container.getChildByName("btn_paint");
        var Text_2 = this.btn_paint.getChildByName("Text_2").getComponent(cc.Label);
        Text_2.string = Utils.TI18N("战斗预览");
    
        this.finish_text = this.main_container.getChildByName("finish_text").getComponent(cc.Label);
        this.finish_text.string = "";
        this.setPlayerItem();
    
        this.btn_close = this.main_container.getChildByName("btn_close");
    },

    setPlayerItem:function(){
        var pos_x = 100;
        var pos_y = 114;
        var bid = [29905,26900,28900];
        for(var i=0;i<3;i++){
            var tab = {};
            var item = this.main_container.getChildByName("item_"+(parseInt(i)+1));
            tab.btn_goto = item.getChildByName("btn_goto");
            tab.btn_goto.active = false;
            var tab_goto_lab = tab.btn_goto.getChildByName("label").getComponent(cc.Label);
            tab_goto_lab.string = Utils.TI18N("前往完成");
            
            tab.btn_get = item.getChildByName("btn_get");
            tab.btn_get.active = false;
            tab.btn_get_label = tab.btn_get.getChildByName("label").getComponent(cc.Label);
            tab.btn_get_label.string = Utils.TI18N("前往领取");
            tab.has = item.getChildByName("has");
            tab.has.active = false;
    
            tab.title_label = item.getChildByName("title").getComponent(cc.Label);

            this.player_item[i] = ItemsPool.getInstance().getItem("backpack_item");
            this.player_item[i].setParent(item);
            this.player_item[i].initConfig(false, 0.8);
            this.player_item[i].setPosition(pos_x-item.width/2, pos_y-item.height/2);
            this.player_item[i].setData({ bid: bid[i], num: 50 });
            this.player_item[i].show();
            this.player_item[i].setDefaultTip();

            this.player_item[i] = tab;
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(RecruitHeroEvent.RecruitHeroBaseInfo,function(data){
            var ctr = ActionController.getInstance();
            var time = data.end_time - gcore.SmartSocket.getTime();
            ctr.getModel().setCountDownTime(this.remain_time,time);
            this.showBtnStatus(data);
        }.bind(this));

        Utils.onTouchEnd(this.btn_close, function () {
            this.ctrl.openRecruitHeroWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openRecruitHeroWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.all_get, function () {
            this.ctrl.sender25101(0);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_paint, function () {
            // this.ctrl.openRecruitHeroWindow(false);
            this.ctrl.sender25102();
            // HeroController.getInstance().openHeroInfoWindowByBidStar(30508, 10);
        }.bind(this), 1);

        for(var i in this.player_item){
            Utils.onTouchEnd(this.player_item[i].btn_goto, function (i) {
                var status = this.model.getRecruitEndTime();
                if(status){
                    if(i!=1){
                        this.ctrl.openRecruitHeroWindow(false);
                    }
                    this.jumpGotoTeskView(i);
                }else{
                    message(Utils.TI18N("活动已结束"));
                }
            }.bind(this,i), 1);

            Utils.onTouchEnd(this.player_item[i].btn_get, function (i) {
                this.jumpGetTeskView(i);
            }.bind(this,i), 1);
        }
    },

    // 任务
    showBtnStatus:function(data){
        if(!data)return;
        var title = [Utils.TI18N("通关%d/%d关"),Utils.TI18N("次日登录"),Utils.TI18N("激活至尊月卡")];
        var tesk_dun = Config.welfare_data.data_welfare_const.dun_max_id;
        var finish_num = 0;
        var pos = [2,1,3];
        for(var i=0;i<3;i++){
            var base_data = this.model.getRecruitBaseData(pos[i]);
            if(base_data){
                if(i == 0){
                    this.player_item[i].title_label.string = cc.js.formatStr(title[i],base_data.val,tesk_dun.val);
                }else{
                    this.player_item[i].title_label.string = title[i];
                }
                // 特殊处理
                if(i == 2 && base_data.status == 1){
                    this.player_item[i].btn_get_label.string = Utils.TI18N("领取");
                }
                this.player_item[i].btn_goto.active = base_data.status == 0;
                this.player_item[i].btn_get.active = base_data.status == 1;
                this.player_item[i].has.active = base_data.status == 2;
                if(base_data.status == 1 || base_data.status == 2){
                    finish_num = finish_num + 1;
                }
            }
        }

        var str = cc.js.formatStr(Utils.TI18N("完成进度: %d/3"),finish_num);
        this.finish_text.string = str;
        if(data.state!=null){
            this.all_goto.active = data.state == 0;
		    this.all_get.active = data.state == 1 || data.state == 1;
        }
    },

    // 前往的跳转
    jumpGotoTeskView:function(num){
        if (num==null)return;
        if(num == 0){
            JumpController.getInstance().jumpViewByEvtData([5]);
        }else if(num == 1){
            ActionController.getInstance().openSevenLoginWin(true);
        }else if(num == 2){
            JumpController.getInstance().jumpViewByEvtData([44]);
        }
    },

    // 领取的跳转
    jumpGetTeskView:function(num){
        if (num==null)return;
        if(num == 0){
            JumpController.getInstance().jumpViewByEvtData([46]);
        }else if(num == 1){
            ActionController.getInstance().openSevenLoginWin(true);
        }else if(num == 2){
            this.ctrl.sender25101(parseInt(num)+1);
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(){
        this.ctrl.sender25100();
        this.model.setDayFirstLogin(false);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.player_item && Utils.next(this.player_item || [])!=null){
            for(var i in this.player_item){
                if(this.player_item[i] && this.player_item[i].deleteMe){
                    this.player_item[i].deleteMe();
                }
            }
        }
        this.player_item = [];

        if(this.remain_time && this.remain_time.node){
            this.remain_time.node.stopAllActions();
        }

        this.ctrl.openRecruitHeroWindow(false);
    },
})