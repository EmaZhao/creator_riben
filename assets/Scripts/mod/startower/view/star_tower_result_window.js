// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     星命塔的胜利战斗结算
// <br/>Create: 2019-02-27 20:07:40
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StartowerController = require("startower_controller");
var CommonScrollView = require("common_scrollview");
var TimeTool = require("timetool");
var BattleModel = require("battle_model");
var MainuiController    = require("mainui_controller");
var BattleConst         = require("battle_const");

var Star_tower_resultWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_result_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.result = null;
        this.fight_type = null;
        this.item_list = []
        this.dungeon_data = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        
        this.source_container = this.root_wnd.getChildByName("container");
        this.title_container = this.source_container.getChildByName("title_container");
        this.title_width = this.title_container.width;
        this.title_height = this.title_container.height;
        this.handleEffect(true);
        
        // this.time_label = Utils.createRichLabel(22,new cc.Color(0xff,0xff,0xff,0xff),cc.v2(0.5,0.5),cc.v2(this.root_wnd.width/2+5, 420),30,1000);
	    // this.time_label.string = Utils.TI18N("5秒后关闭");
        // this.root_wnd.addChild(this.time_label.node);
        this.time_label = this.seekChild("time_lb",cc.Label);
        this.time_label.node.active = false;
    
        this.comfirm_btn = this.source_container.getChildByName("comfirm_btn");         
        var btn_lab = this.comfirm_btn.getChildByName("Label").getComponent(cc.Label);
        btn_lab.string = Utils.TI18N("确定");
        // this.comfirm_btn.setPosition(this.root_wnd.width / 2 + 5,470);
        // this.comfirm_btn.active = true;
        this.comfirm_btn.x = 190;
        this.comfirm_btn.y = 54;

        this.return_btn = this.source_container.getChildByName("return_btn");
        this.return_btn.active = true;
        var btn_lab = this.return_btn.getChildByName("Label").getComponent(cc.Label);
        btn_lab.string = "戻る";

        this.harm_btn = this.source_container.getChildByName("harm_btn");
        this.harm_btn.active = false;
        this.harm_btn.y = 484;

        let bg = this.seekChild(this.source_container,"background");
        let sp_2 = this.seekChild(this.source_container,"Sprite_2");
        let sp_3 = this.seekChild(this.source_container,"Sprite_3");
        let sp_4 = this.seekChild(this.source_container,"Sprite_4");
        bg.height = 400;
        bg.y = 302.5;
        sp_2.y = 100;
        sp_3.y = 92;
        sp_4.y = 92;


        var result_get_bg = Utils.createImage(this.source_container, null, 360,462, cc.v2(0.5,1), true, 0, false);
        result_get_bg.node.scaleX = 5;
        var q_res = PathTool.getCommonIcomPath("common_90044");
        this.loadRes(q_res, function (sf_obj) {
            result_get_bg.spriteFrame = sf_obj;
        }.bind(this));
        
        this.pass_time = Utils.createRichLabel(24,new cc.Color(0xff,0xb4,0x00,0xff),cc.v2(0.5,0.5),cc.v2(360, 440),30,1000);
        this.pass_time.string = Utils.TI18N("通关时间：00:00:00");
        this.source_container.addChild(this.pass_time.node);

        
        this.gain_label = Utils.createRichLabel(22,new cc.Color(0xff,0xff,0xff,0xff),cc.v2(0.5,0.5),cc.v2(360, 100),30,1000);
        this.gain_label.handleTouchEvent = false;
	    this.source_container.addChild(this.gain_label.node);
        
        // var label  = Utils.createRichLabel(22,new cc.Color(0xff,0xb4,0x00,0xff),cc.v2(0.5,0.5),cc.v2(360, 382),30,1000);
        // label.string = Utils.TI18N("获得物品");
        // this.source_container.addChild(label.node);

        // var result_line_bg = Utils.createImage(this.source_container, null, 320, 398, cc.v2(0,1), true, 0, false);
        // result_line_bg.node.scaleX = -1;
        // var r_res = PathTool.getCommonIcomPath("common_1094");
        // this.loadRes(r_res, function (sf_obj) {
        //     result_line_bg.spriteFrame = sf_obj;
        // }.bind(this));

        // var result_line_bg_2 = Utils.createImage(this.source_container, null, 400, 398, cc.v2(0,1), true, 0, false);
        // this.loadRes(r_res, function (sf_obj) {
        //     result_line_bg_2.spriteFrame = sf_obj;
        // }.bind(this));
        this.seekChild("scroll_view").active = false;

        var tab_size = cc.size(SCREEN_WIDTH, 190);//230
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 94,                    // 第一个单元的X起点
            space_x: 20,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: 120*1.3,               // 单元的尺寸width
            item_height: 120*1.3,              // 单元的尺寸height
            row: 4,                        // 行数，作用于水平滚动类型
            col: 4,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView()
        this.scroll_view.createScroll(this.source_container, cc.v2(this.source_container.width/2, this.source_container.height/2 - 30), null, null, tab_size, setting, cc.v2(0.5, 0.5))
    },


    // 注册事件监听的接口,不需要手动调用, 如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.comfirm_btn, function () {
            this.ctrl.openResultWindow(false);
        }.bind(this), 1)
        Utils.onTouchEnd(this.return_btn, function () {
            this.ctrl.openResultWindow(false);
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.startower);
        }.bind(this), 1)
        Utils.onTouchEnd(this.harm_btn, function () {
            if(this.data && Utils.next(this.data) != null){
                require("battle_controller").getInstance().openBattleHarmInfoView(true, this.data)
            }
        }.bind(this), 1)
    },

    //剧情：{章节id,难度，副本id}
    setData:function(data, fight_type, dungeon_data){
        if(data){
            this.data = data || {};
            this.dungeon_data = dungeon_data;
            this.fight_type = fight_type;
            this.result = data.result;
            var pass_time = data.timer || 0;
            var item_list =[]
            var asset_list = {}
            var first_award = this.data.first_award || {};

            this.harm_btn.active = true;
            for(var i in first_award){
                first_award[i].is_first = true;
                item_list.push(first_award[i]);
            }

            for(var j in this.data.award){
                this.data.award[j].is_first = false;
                item_list.push(this.data.award[j]);
            }
            var str = "";
            if(asset_list && Utils.next(asset_list || {}) != null){
                for(var i in asset_list){
                    if(Utils.getItemConfig(asset_list[i].item_id)){
                        var icon = Utils.getItemConfig(asset_list[i].item_id).icon;
                        var str_ = cc.js.formatStr("<div><img src='%s' scale=0.4 /></div><color=#ffffff fontsize=24>+%s            </color>", PathTool.getItemRes(icon), asset_list[i].num)
					    str = str + str_;
                    }
                }
            }

            if(this.gain_label){
                this.gain_label.string = str;
            }
            this.reward_list = item_list
            this.result = this.data.result
            this.is_guide = this.data.is_guide
            this.pass_time.string = cc.js.formatStr(Utils.TI18N("通关时间：%s"),TimeTool.getTimeFormat(pass_time));
            // --this.source_container:runAction(cc.Sequence:create(cc.FadeTo:create(0.2,150),cc.CallFunc:create(function ()
            this.rewardViewUI();
            // --end)))
        }
    },

    handleEffect:function(status){
        if(status == false){
            if(this.play_effect){
                this.play_effect.setToSetupPose();
                this.play_effect.clearTracks();
                this.play_effect = null;
            }
        }else{
            if(this.title_container && this.play_effect == null){
                // var node = new cc.Node();
                // node.setAnchorPoint(0.5,0.5)
                // node.setPosition(this.title_width * 0.5, this.title_height * 0.5);
                // this.title_container.addChild(node,0);
                // this.play_effect = node.addComponent(sp.Skeleton);
                // var anima_path = PathTool.getSpinePath("E51300", "action");
                // this.loadRes(anima_path, function(ske_data) {
                //     this.play_effect.skeletonData = ske_data;
                //     this.play_effect.setAnimation(0, PlayerAction.action_2, false);
                // }.bind(this));
                this.play_effect = this.title_container.getComponent(sp.Skeleton);
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(103))
                this.loadRes(res, function (res_object) {
                    this.play_effect.skeletonData = res_object;
                    this.play_effect.setAnimation(1, PlayerAction.action_2, false)
                }.bind(this))
            }
        }
    },

    // 奖励界面
    rewardViewUI:function(){
        var itemArr = [];
        
        for(var i in this.reward_list){
            itemArr.push({bid:this.reward_list[i].item_id,num:this.reward_list[i].num});
        }
        this.scroll_view.setData(itemArr);
        this.scroll_view.addEndCallBack(function(){
            var list = this.scroll_view.getItemList();
            for(var k in list){
                var item = list[k];
                var itemData = item.getItemData();
                for(var j in this.reward_list){
                    if(itemData && itemData.bid == this.reward_list[j].item_id && itemData.num == this.reward_list[j].num && this.reward_list[j].is_first && this.reward_list[j].is_first ==true){
                        item.showBiaoQian(true,Utils.TI18N("首通"));
                    }
                }
            }
        }.bind(this));
        this.ItemAciton();
    },

    ItemAciton:function(){
        if(this.item_list && Utils.next(this.item_list || []) != null){
            var show_num = 0;
            for(var i in this.item_list){
                if(this.item_list[i]){
                    gcore.Timer.set(function () {
                        this.item_list[i].setVisible(true);
                        var move_to = cc.scaleTo(0.1, 1);
                        this.item_list[i].runAction(cc.sequence(move_to, cc.callFunc(function () {
                            show_num = show_num + 1;
                            if(show_num>=this.item_list.length){
                                // this.updateTimer();
                            }
                        })))
                    }.bind(this), 0.1 * (i - 1), 1);
                }
            }
        }else{
            // this.updateTimer()
        }
    },

    updateTimer:function(){
        return
        var time = 5;
        var call_back = function(){
            time = time - 1
            var new_time = Math.ceil(time)
            var str = new_time+Utils.TI18N("秒后关闭");
            if(this.time_label){
                this.time_label.string = str;
            }
            if(new_time <= 0){
                StartowerController.getInstance().openResultWindow(false);
                if (this.close_result_reward) {
                    gcore.Timer.del(this.close_result_reward);
                    this.close_result_reward = null;
                }
            }
        }.bind(this)
        if(!this.close_result_reward){
            this.close_result_reward = gcore.Timer.set(call_back,1000,-1)
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data, fight_type, battle_extend_data){
        Utils.playButtonSound("c_win");
        this.setData(data, fight_type, battle_extend_data)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.handleEffect(false);
        if (this.close_result_reward) {
            gcore.Timer.del(this.close_result_reward);
            this.close_result_reward = null;
        }

        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }

        if(!MainuiController.getInstance().checkIsInDramaUIFight()){
            // AudioManager:getInstance():playLastMusic()
        }

        // if(BattleModel.getInstance().getBattleScene()){
            // var data = {result: this.result ,combat_type: BattleConst.Fight_Type.StarTower}
            // BattleModel.getInstance().result(data, this.is_leave_this)
        // }
        this.result = null;
        this.fight_type = null;
        this.item_list = null;
        this.dungeon_data = null;

        this.ctrl.openResultWindow(false);
    },
})