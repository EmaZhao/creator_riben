// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     竖版星命塔挑战主界面
// <br/>Create: 2019-02-27 20:09:46
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BaseRole = require("baserole");
var StartowerEvent = require("startower_event");
var RoleController = require("role_controller");
var CommonAlert = require("commonalert");

var Star_tower_main_Window = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_main");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.item_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.root_wnd.getChildByName("main_panel");
    
        this.top_bg = this.main_panel.getChildByName("top_bg");
        this.top_bg.scale = 2;
        this.loadRes(PathTool.getBigBg("bigbg_26"), (function(resObject){
            if(this.top_bg){
                this.top_bg.getComponent(cc.Sprite).spriteFrame = resObject;
            }
        }).bind(this));

        this.title = this.main_panel.getChildByName("title").getComponent(cc.Label);
    
        this.top_panel = this.main_panel.getChildByName("top_panel");
        this.award_panel = this.main_panel.getChildByName("award_panel");

        // 引导需要
        this.fight_btn = this.main_panel.getChildByName("btn1");
        var fight_btn_Label = this.fight_btn.getChildByName("Label").getComponent(cc.Label);
        fight_btn_Label.string = Utils.TI18N("挑战");

        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.clean_btn = this.main_panel.getChildByName("btn2");
        this.clean_label = this.clean_btn.getChildByName("Label").getComponent(cc.RichText);
        this._dianmond = this.clean_btn.getChildByName("dianmond");
        this.loadRes(PathTool.getItemRes(15), (function(resObject){
            this._dianmond.getComponent(cc.Sprite).spriteFrame = resObject;
        }).bind(this));
        this._dianmond.active = false;

        this.video_btn = this.top_panel.getChildByName("video_btn");
        var label = this.video_btn.getChildByName("label").getComponent(cc.Label);
        label.string = Utils.TI18N("通关录像");

        var label  =this.award_panel.getChildByName("label").getComponent(cc.Label);
        label.string = Utils.TI18N("挑战奖励");

        this.no_label =  Utils.createLabel(20,new cc.Color(0x68,0x45,0x2a,0xff),null,190,15,"",this.main_panel,0,cc.v2(0,0));
        this.no_label.string = Utils.TI18N("挑战成功可进行扫荡");

        if(this.data){
            this.updateDate();
        }

    },

    updateDate:function() {
        if(!this.data)return;

        var title = this.data.name || "";
        this.title.string = title;

        this.updateModel(this.data);
 
        if(this.data){
            this.ctrl.sender11325(this.data.lev);
        }
        this.changeClearTitleText();
        this.updateDesc();
        this.updateGoodsList();
    },

    //改变扫荡按钮的状态
    changeClearTitleText:function(){
        //已购买次数
        var buyCount = this.model.getBuyCount() || 0;
        //剩余挑战次数
        var count = this.model.getTowerLessCount();
        //最大塔数
        var tower = this.model.getNowTowerId() || 0;
        this._dianmond.active = false;
        this.clean_label.node.x = 0;
        if(count > 0){
            this.clean_label.string = Utils.TI18N("<outline=1,color=#2B610D>扫荡</outline>");
        }else{
            var buy_data = Config.star_tower_data.data_tower_buy[buyCount + 1];
            if(buy_data){
                var str = cc.js.formatStr("<outline=1,color=#2B610D>%s%s</outline>", buy_data.expend[0][1],Utils.TI18N("扫荡"));
                this.clean_label.string = str;
                this._dianmond.active = true;
                this.clean_label.node.x = 10;
            }else{
                //容错的
                this.clean_label.string = Utils.TI18N("<outline=1,color=#2B610D>扫荡</outline>");
            }
        }
    },

    updateModel:function(data){
        if(!data)return;
        if(!this.partner_model){
            this.partner_model = new BaseRole();
            this.partner_model.setParent(this.top_panel);
            this.partner_model.node.setPosition(313,180); // 原来是310
            this.partner_model.setData(BaseRole.type.unit, data.unit_id, PlayerAction.show, true,0.72)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openStarTowerMainView(false);
        }, this)


        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openStarTowerMainView(false);
        }, this)

        this.fight_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(!this.data)return;
            var tower =this.data.lev || 0;
            this.ctrl.sender11322(tower);
            //最新版本显示阵容界面（服务端不是最新无法使用暂时屏蔽）
            // var HeroController = require("hero_controller");
            // var PartnerConst = require("partner_const");
            // HeroController.getInstance().openFormGoFightPanel(true, PartnerConst.Fun_Form.Startower, {tower_lev: tower})
        }, this)

        this.clean_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(!this.data)return;
            var count = this.model.getTowerLessCount() || 0;
            if(count <= 0){
                this.openBuyCountPanel();
                return;
            }
            var tower = this.data.lev || 0;
            this.ctrl.sender11324(tower);
        }, this)

        this.video_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(!this.video_data)return;
            if(!this.video_data.tower_replay_data || Utils.next(this.video_data.tower_replay_data) ==null){
                message(Utils.TI18N("暂时没有玩家通过此关，努力成为第一名吧！"));
                return;
            }
            this.ctrl.openVideoWindow(true,this.video_data,this.data.lev);
        }, this)

        this.addGlobalEvent(StartowerEvent.Video_Data_Event, function (data) {
            this.video_data = data
            this.updateVideoData(data);
        }.bind(this));

        this.addGlobalEvent(StartowerEvent.Fight_Success_Event, function (data) {
            //挑战完成请求一下录像，可能自己破记录了
            if(this.data){
                this.ctrl.sender11325(this.data.lev);
            }
            this.updateGoodsList();
        }.bind(this));

        this.addGlobalEvent(StartowerEvent.Count_Change_Event, function (data) {
            this.changeClearTitleText();
        }.bind(this));
    },

    //次数不足弹开购买次数界面
    openBuyCountPanel:function(){
        var free_count = Config.star_tower_data.data_tower_const["free_times"].val;
        var have_buycount = this.model.getBuyCount() || 0;
        var role_vo = RoleController.getInstance().getRoleVo();
        var config = Config.star_tower_data.data_tower_vip[role_vo.vip_lev];

        var fun = (function(){
            var tower = this.data.lev || 0;
            this.ctrl.sender11324(tower);
        }).bind(this);

        if(config && config.buy_count){
            if(have_buycount >= config.buy_count){
                message(Utils.TI18N("本日扫荡次数已达上限"));
            }else{
                var buy_config = Config.star_tower_data.data_tower_buy[have_buycount+1];
                if(buy_config && buy_config.expend && buy_config.expend[0] && buy_config.expend[0][0]){
                    var item_id = buy_config.expend[0][0];
                    var num = buy_config.expend[0][1] || 0;
                    
                    var item_config = Utils.getItemConfig(item_id);
                    if(item_config && item_config.icon){
                        var res = PathTool.getItemRes(item_config.icon)
                        var str = cc.js.formatStr(Utils.TI18N("是否花费<img src='%s'/> %s购买一次挑战次数？"),item_config.icon, num);
                        CommonAlert.show(str,Utils.TI18N("确定"),fun,Utils.TI18N("取消"),null,null,null,{resArr:[res]});
                    }
                }
            }
        }
    },

    updateVideoData:function(data){
        if(!data)return;
        if(!this.fast_desc){
            this.fast_desc = Utils.createRichLabel(24,new cc.Color(0x68,0x45,0x2a,0xff),cc.v2(0,1),cc.v2(20,-12),30,300);
            this.fast_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
            this.top_panel.addChild(this.fast_desc.node);
        }
        if(!this.power_desc){
            this.power_desc = Utils.createRichLabel(24,new cc.Color(0x68,0x45,0x2a,0xff),cc.v2(0,1),cc.v2(20,-52),30,300);
            this.power_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
            this.top_panel.addChild(this.power_desc.node);
        }
        this.fast_desc.string = Utils.TI18N("最快通关：暂无");
        this.power_desc.string = Utils.TI18N("最低战力：暂无");
        var list = data.tower_replay_data || {};
        for(var i in list){
            var v = list[i];
            if(v && v.type == 1){
                var str = cc.js.formatStr(Utils.TI18N("最快通关：%s"),v.name);
                this.fast_desc.string = str;
            }else{
                var str = cc.js.formatStr(Utils.TI18N("最低战力：%s"),v.name)
                this.power_desc.string = str;
            }
        }
    },

    updateDesc:function(){
        if(!this.data)return;
        // /boss描述 
        // this.boss_desc = Utils.createRichLabel(24,new cc.Color(0x68,0x45,0x2a,0xff),cc.v2(0,1),cc.v2(20,110),30,620);
        // this.boss_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
        // this.top_panel.addChild(this.boss_desc.node);

        //推荐战力 
        this.boss_power = Utils.createRichLabel(24,new cc.Color(0x68,0x45,0x2a,0xff),cc.v2(0,0),cc.v2(20,15),30,620);
        this.boss_power.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.top_panel.addChild(this.boss_power.node)

        // var desc = this.data.desc || "";
        // this.boss_desc.string = Utils.TI18N("怪物特点：")+desc;

        var power = this.data.recommend || 0;
        var str = cc.js.formatStr(Utils.TI18N("推荐战力：<color=#289b14>%s</c>"),power)
        this.boss_power.string = str;
    },
    

    //更新物品消耗
    updateGoodsList:function(){
        if(!this.data)return;
        for(var i in this.item_list){
            this.item_list[i].setVisible(false);
        }
        var expend_list = [];
        var now_id = this.model.getNowTowerId() || 0;
        if(now_id < this.data.lev){
            var first_id  = 0;
            var num = 0;
            if(this.data.first_show[0] && this.data.first_show[0][0] && this.data.first_show[0][1]){
                first_id = this.data.first_show[0][0];
                num = this.data.first_show[0][1];
            }
            expend_list.push({0:first_id,1:num,2:true});
        }

        for(var j in this.data.award){
            expend_list.push(this.data.award[j]);
        }
        var index  =1;
        for(var k in expend_list){
            if(!this.item_list[index]){
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.setParent(this.award_panel);
                item.initConfig(true, 0.9, false, true);
                item.show();

                // item:setDefaultTip()
                this.item_list[index] = item;
            }
            this.item_list[index].setPosition(90+150*(index-1),70);
            
            
            this.item_list[index].setData({bid:expend_list[k][0],num:expend_list[k][1]});
            this.item_list[index].setVisible(true);
          
            this.item_list[index].showBiaoQian(false);
            if(expend_list[k] && expend_list[k][2] && expend_list[k][2] == true){
                this.item_list[index].showBiaoQian(true,Utils.TI18N("首通"));
            }
            index = index +1;
        }
        var now_tower = this.model.getNowTowerId() || 0;
        if(this.data.lev > now_tower){
            this.clean_btn.active = false;
            this.fight_btn.setPosition(338,78);
            this.no_label.string = Utils.TI18N("挑战成功可进行扫荡");
        }else{
            this.clean_btn.active = true;
            this.no_label.string = "";
            this.fight_btn.setPosition(178,78);
        }
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.updateDate();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openStarTowerMainView(false);
        if(this.partner_model){
            this.partner_model.deleteMe();
            this.partner_model = null;
        }

        for(var i in this.item_list){
            this.item_list[i].deleteMe();
        }
        this.item_list = null;
    },
})