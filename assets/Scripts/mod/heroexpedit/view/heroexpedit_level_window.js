// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 14:17:05
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const");
var PlayerHead = require("playerhead");
var HeroController = require("hero_controller");
var PartnerConst = require("partner_const");
var HeroExpeditEvent = require("heroexpedit_event");
var CommonScrollView = require("common_scrollview");

var Heroexpedit_levelWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("heroexpedit", "level_message");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.reward_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
    
        this.text_level_msg = this.main_container.getChildByName("Image_6").getChildByName("Text_7").getComponent(cc.Label);
        this.text_level_msg.string = Utils.TI18N("");
        var text_17_0 = this.main_container.getChildByName("reward").getChildByName("Text_17_0").getComponent(cc.Label);
        text_17_0.string = Utils.TI18N("奖励");
        
        
        this.reward_panel = this.main_container.getChildByName("reward").getChildByName("reward_panel");
        var text_17 = this.main_container.getChildByName("enemy").getChildByName("Text_17");
        text_17.string = Utils.TI18N("敌方阵容");
        
        this.enemy_panel = this.main_container.getChildByName("enemy").getChildByName("enemy_panel");
        this.btn_fight = this.main_container.getChildByName("btn_fight");
        var Text_6 = this.btn_fight.getChildByName("Text_6").getComponent(cc.Label);
        Text_6.string = Utils.TI18N("战斗");
    
        this.text_name = this.main_container.getChildByName("text_name").getComponent(cc.Label);
        this.text_fight_power = this.main_container.getChildByName("text_fight_power").getComponent(cc.Label);

        if(this.data){
            this.fightMessage(this.data);
        }
    },

    fightMessage:function(data){
        if(!this.root_wnd || !data)return;
        this.text_level_msg.string = Utils.TI18N("第")+Config.expedition_data.data_sign_info[data.id].floor+Utils.TI18N("关");

        this.my_head = new PlayerHead();
        this.my_head.setAnchorPoint(0.5, 0.5)
        this.my_head.setPosition(166-this.main_container.width/2,541-this.main_container.height/2);
        this.my_head.setLev(data.lev)
        this.my_head.setParent(this.main_container);
        this.my_head.setHeadRes(data.face);
        this.my_head.show();

        this.text_name.string = data.name;
        this.text_fight_power.string = data.power;
        // 关卡奖励
        if(data.rewards){
            var num = data.rewards.length;
            var pos = [];
            if(num == 2){
                pos = [166,423];
            }else{
                pos = [166,296,423];
            }
            for(var i = 0;i<num;i++){
                if(!this.reward_list[i]){
                    this.reward_list[i] = ItemsPool.getInstance().getItem("backpack_item");
                    this.reward_list[i].setParent(this.reward_panel);
                    this.reward_list[i].initConfig(null,0.9);
                    this.reward_list[i].show();
                }
                if(this.reward_list[i]){
                    this.reward_list[i].setPosition(pos[i], 55);
                    if(data.rewards[i].bid == 25 && data.is_holiday == 1){
                        this.reward_list[i].holidHeroExpeditTag(true, "限定アップ");
                    }else{
                        this.reward_list[i].holidHeroExpeditTag(false);
                    }
                    this.reward_list[i].setDefaultTip();
    		        this.reward_list[i].setData({bid:data.rewards[i].bid, num:data.rewards[i].num})
                }
            }
        }

        var scroll_view_size = this.enemy_panel.getContentSize();
        var setting = {
            item_class: "hero_exhibition_item",      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 4,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 119,               // 单元的尺寸width
            item_height: 119,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
        }

        this.enemy_list = new CommonScrollView();
        this.enemy_list.createScroll(this.enemy_panel, cc.v2(-5,10), ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);
        this.enemy_list.setClickEnabled(false);

        var enemy = [];
        for(var i in data.guards){
            var v = data.guards[i];
            var tab = {};
            tab.bid = v.bid;
            tab.star = v.star;
            tab.blood = v.hp_per;
            tab.lev = v.lev;
            enemy.push(tab);
        }
        this.enemy_list.setData(enemy,null,{scale: 0.8, can_click: false,from_type: HeroConst.ExhibitionItemType.eExpeditFight})
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(HeroExpeditEvent.levelMessageEvent, function(data) {
            if(!data)return;
            this.data = data;
            this.fightMessage(data);
        }.bind(this))

        Utils.onTouchEnd(this.btn_fight, function () {
            this.ctrl.openHeroExpeditLevelView(false);
            HeroController.getInstance().openFormGoFightPanel(true, PartnerConst.Fun_Form.Expedit_Fight);
            this.ctrl.sender24404()
        }.bind(this), 1);

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openHeroExpeditLevelView(false);
        }.bind(this), 2);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(!data)return;
        this.data = data;
        this.fightMessage(data);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.reward_list && Utils.next(this.reward_list || []) !=null){
            for(var i in this.reward_list){
                if(this.reward_list[i].deleteMe){
                    this.reward_list[i].deleteMe();
                }
            }
        }

        this.data = null;

        if(this.my_head){
            this.my_head.deleteMe();
            this.my_head = null;
        }

        if(this.enemy_list){
            this.enemy_list.deleteMe();
            this.enemy_list = null;
        }
        this.ctrl.openHeroExpeditLevelView(false);
    },
})