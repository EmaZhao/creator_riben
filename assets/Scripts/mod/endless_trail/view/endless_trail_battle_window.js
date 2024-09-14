// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 14:48:53
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleController = require("battle_controller");
var Endless_trailEvent = require("endless_trail_event");
var CusRichText = require("CusRichText");


var Endless_trail_battleWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_battle_view");
        this.viewTag = SCENE_TAG.effect;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.is_open = false;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.effect_num = this.root_wnd.getChildByName("floor_round").getComponent("CusRichText");
        this.effect_num.node.action = false;
        this.top_container = this.root_wnd.getChildByName("top_container");

        this.right_container = this.top_container.getChildByName("right_container");
        this.return_btn = this.right_container.getChildByName("return_btn");
        this.backpack_btn = this.right_container.getChildByName("backpack_btn")

        this.backpack_label = Utils.createRichLabel(20, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(0,-this.backpack_btn.height/2),22,120);
        // this.backpack_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.backpack_btn.addChild(this.backpack_label.node);
        this.backpack_red = this.backpack_btn.getChildByName("red_point");
        this.left_container = this.top_container.getChildByName("left_container");
        this.container_1 = this.left_container.getChildByName("container_1");
        this.container_1_width = this.container_1.getContentSize().width;
        this.container_1_height = this.container_1.getContentSize().height;
        this.container_2 = this.left_container.getChildByName("container_2");
        this.container_2_width = this.container_2.getContentSize().width;
        this.container_2_height = this.container_2.getContentSize().height;

        this.desc_label = Utils.createRichLabel(20, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0, 0.5), cc.v2(35,this.container_1.getContentSize().height/2 +2),30,550);
        this.desc_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.container_1.addChild(this.desc_label.node);
        
        this.desc_label_2 = Utils.createRichLabel(20, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0, 0.5), cc.v2(245,this.container_1.getContentSize().height/2 +2),30,550);
        this.desc_label_2.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.container_1.addChild(this.desc_label_2.node);
        
        this.reward_label = Utils.createRichLabel(20, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0, 0.5), cc.v2(0,this.container_2.getContentSize().height/2),30,550);
        this.reward_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.container_2.addChild(this.reward_label.node);

        this.reward_btn_eff_node = this.seekChild("backpack_eff_node");
        this.reward_btn_eff_node.setScale(0.5);
        this.reward_btn_eff_node.active = false;
        this.reward_btn_effect = this.seekChild("backpack_eff_node", sp.Skeleton);

        // var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(257), "action");
        // this.loadRes(anima_path, function(ske_data) {
        //     this.reward_btn_effect.skeletonData = ske_data;
        //     this.reward_btn_effect.setAnimation(0, PlayerAction.action, true);
        // }.bind(this));
     
        this.updateData();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.return_btn, function () {
            var str = Utils.TI18N("退出后本场战斗将判定为失败，且结束本次挑战并结算奖励，是否确认退出挑战？");
            var confirm_callback = function(){
                BattleController.getInstance().csFightExit();
            }
            var CommonAlert = require("commonalert");
            CommonAlert.show(str,Utils.TI18N("我要退出"),confirm_callback,Utils.TI18N("继续挑战"));
        }.bind(this), 1);

        Utils.onTouchEnd(this.backpack_btn, function () {
            if(this.backpack_btn){
                this.ctrl.openEndlessRewardTips(true,this.backpack_btn);
            }
        }.bind(this), 1);

        this.addGlobalEvent(Endless_trailEvent.UPDATA_ENDLESSBATTLE_DATA,function(data){
            if(data){
                this.updateData(data);
            }
        }.bind(this));

        this.addGlobalEvent(Endless_trailEvent.UPDATA_FIRST_DATA,function(data){
            if(data){
                this.updateBtnStatus(data);
            }
        }.bind(this));

    },

    updateData:function(data){
        var final_data = data || this.model.getEndlessBattleData();
        if(final_data){
            this.battle_data = final_data;
            var str = cc.js.formatStr(Utils.TI18N("第%s关"),final_data.round)
            this.playFightStartEffect(final_data.round);
            var str_2 = Utils.TI18N("增益效果:");
            if(final_data.buff_list && Utils.next(final_data.buff_list || {}) != null){
                for(var i in final_data.buff_list){
                    var v = final_data.buff_list[i];
                    if(Config.endless_data.data_buff_data[v.group_id] &&  Config.endless_data.data_buff_data[v.group_id][v.id]){
                        var config = Config.endless_data.data_buff_data[v.group_id][v.id];
                        if(config){
                            str_2 = str_2 + config.battle_desc;
                        }
                    }
                }
            }else{
                str_2 = str_2+Utils.TI18N("暂无");
            }

            this.desc_label_2.string = str_2;
            this.desc_label.string = str;

            var str_2 = Utils.TI18N("累計報酬:");
            if(final_data.acc_reward && Utils.next(final_data.acc_reward)){
                for(var j in final_data.acc_reward){
                    var temp_str = cc.js.formatStr(Utils.TI18N("<img src='%s'/> %s "),final_data.acc_reward[j].base_id,final_data.acc_reward[j].num)
                    str_2 = str_2 + temp_str
                    this.loadRes(PathTool.getItemRes(final_data.acc_reward[j].base_id), (function(resObject){
                        this.reward_label.addSpriteFrame(resObject);
                    }).bind(this));
                }
            }else{
                if(final_data.reward_flag == 1){
                    str_2 = str_2 + Utils.TI18N("当天已达上限,无法再结算奖励");
                }else{
                    str_2 = cc.js.formatStr(Utils.TI18N("%s再过%s关开始结算(今日至第%s关)"), str_2, final_data.rest_round || 0, final_data.max_reward_round || 0);
                }
            }

            this.reward_label.string = str_2;
            var data = {id: this.battle_data.id ,status: this.battle_data.status}
            this.updateBtnStatus(data);
        }
    },

    playFightStartEffect:function(round){
        if(this.cur_round == null){
            this.cur_round = round;
        }
        if(this.cur_round == round)return;
        this.cur_round = round;

        if(this.effect_container == null){
            this.effect_container = new cc.Node();
            this.effect_container.setContentSize(cc.size(470, 80))
            this.effect_container.setAnchorPoint(0.5,0.5);
            this.effect_container.setPosition(SCREEN_WIDTH*0.5, 670);
            this.root_wnd.addChild(this.effect_container);

            var top_node = new cc.Node();
            top_node.setContentSize(cc.size(470, 80))
            top_node.setAnchorPoint(0.5,0.5)
            top_node.setPosition(0, 40);
            this.effect_container.addChild(top_node);

            this.top_effect = top_node.addComponent(sp.Skeleton);

            this.effect_img_1 = Utils.createImage(this.effect_container,null,-50, 45,cc.v2(0.5, 0.5));
            var res = PathTool.getCommonIcomPath("txt_cn_common_90019");
            this.loadRes(res, function (sf_obj) {
                this.effect_img_1.spriteFrame = sf_obj;
            }.bind(this))

            // this.effect_img_2 = Utils.createImage(this.effect_container,null,32, 45,cc.v2(0.5, 0.5));
            // var res = PathTool.getCommonIcomPath("txt_cn_common_90020");
            // this.loadRes(res, function (sf_obj) {
            //     this.effect_img_2.spriteFrame = sf_obj;
            // }.bind(this))

            this.effect_width_1 = 94;
            this.effect_width_2 = 90;

            if(this.effect_num){
                this.effect_num.node.removeFromParent();
                this.effect_container.addChild(this.effect_num.node);
                this.effect_num.node.setPosition(100, 45)
            }
            
            var bottom_node = new cc.Node();
            bottom_node.setContentSize(cc.size(470, 80))
            bottom_node.setAnchorPoint(0.5,0.5)
            bottom_node.setPosition(0, 40);
            this.effect_container.addChild(bottom_node);

            this.bottom_effect = bottom_node.addComponent(sp.Skeleton);
            
        }
        var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(323), "action");
            this.loadRes(anima_path, function(ske_data) {
                this.top_effect.skeletonData = ske_data;
                this.top_effect.setAnimation(0, PlayerAction.action, true);
            }.bind(this));

        var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(324), "action");
        this.loadRes(anima_path, function(ske_data) {
            this.bottom_effect.skeletonData = ske_data;
            this.bottom_effect.setAnimation(0, PlayerAction.action, true);
        }.bind(this));

        this.effect_num.setNum(round);

        var left_x = -this.effect_width_1*0.5-50;
        var right_x = 63+this.effect_width_2*0.5;

        this.effect_container.active = true;
        this.effect_img_1.node.setPosition(-171,102);
        // this.effect_img_2.node.setPosition(240,102);
        this.effect_img_1.node.opacity = 0;
        // this.effect_img_2.node.opacity = 0;
        this.effect_num.node.opacity = 0;
        this.effect_num.node.scale = 0.5;

        var head_move_to = cc.moveTo(0.08, cc.v2(left_x, 45));
        var head_fade_in = cc.fadeIn(0.1);
        var head_delay = cc.delayTime(0.3);
        var head_delay_2 = cc.delayTime(0.5);

        var head_over =cc.callFunc((function(){
            this.effect_container.active = false;
        }).bind(this));
        this.effect_img_1.node.runAction(cc.sequence(cc.spawn(head_move_to ,head_fade_in), head_delay, head_delay_2, head_over));

        var label_move_to = cc.moveTo(0.08, cc.v2(right_x, 45));
        var label_fade_in = cc.fadeIn(0.1);
        // this.effect_img_2.node.runAction(cc.spawn(label_move_to,label_fade_in));

        var num_fade_in = cc.fadeIn(0.1);
        var num_scale = cc.scaleTo(0.1, 1);
        this.effect_num.node.runAction(cc.spawn(num_scale, num_fade_in));
    },

    updateBtnStatus:function(data){
        if(this.battle_data && data && Config.endless_data.data_first_data[data.id]){
            var first_data = Config.endless_data.data_first_data[data.id];
            if(first_data){
                var str = ""
                this.backpack_btn.id = data.id
                this.backpack_label.node.opacity = 255;
                this.backpack_label.node.stopAllActions();
                this.reward_btn_eff_node.active = false;
                if(data.status == 1){
                    this.backpack_btn.status = 1;
                    str = cc.js.formatStr(Utils.TI18N("<color=#ffffff><outline color=#581818 width=2>可领取</outline></color>"))
                    CommonAction.breatheShineAction(this.backpack_label.node);
                    this.reward_btn_eff_node.active = true;
                }else{
                    this.backpack_btn.status = 0
                    str = cc.js.formatStr(Utils.TI18N('<color=#ffffff><outline color=#581818 width=2>第</outline></color><color=#fff22a><outline color=#581818 width=2>%s</outline></color><color=#ffffff><outline color=#581818 width=2>关领取</outline></color>'), first_data.limit_id) // - this.battle_data.max_round
                }
                this.backpack_label.string = str;
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if(BattleController.getInstance().getModel().getBattleScene()){
            this.is_open = true;
            gcore.Timer.set(function () {
                this.ctrl.send23902();
            }.bind(this), 1 / 60, 1);
        } 
    },

    isOpen:function(  ){
        return this.is_open;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.reward_btn_effect){
            this.reward_btn_effect.setToSetupPose();
            this.reward_btn_effect.clearTracks();
        }

        if(this.backpack_label && this.backpack_label.node){
            this.backpack_label.node.stopAllActions();
        }
        
        this.is_open = false
        // this:removeAllChildren()
        // this:removeFromParent()
        this.ctrl.openEndlessBattleView(false);
        
    },
})