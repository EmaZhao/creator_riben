// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-18 15:00:39
// --------------------------------------------------------------------
var PathTool         = require("pathtool");
var MainuiController = require("mainui_controller");
var PlayerHead       = require("playerhead");
var RoleController   = require("role_controller");
var MainUiConst      = require("mainui_const");
var ArenaController = require("arena_controller")
var ArenaLoopResultWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_result_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.role_vo = RoleController.getInstance().getRoleVo();

        this.score_iocn =  Config.arena_data.data_const.score_iocn;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){

        Utils.getNodeCompByPath("container/get_title", this.root_wnd, cc.Label).string = Utils.TI18N("获\n得\n奖\n励");
        Utils.getNodeCompByPath("container/cancel_btn/label", this.root_wnd, cc.Label).string = "戻る";
        Utils.getNodeCompByPath("container/confirm_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("确定");
        this.confirm_btn_nd         = this.seekChild("confirm_btn");
        this.cancel_btn_nd          = this.seekChild("cancel_btn");
        this.mask_nd                = this.seekChild("mask");
        this.background_nd          = this.seekChild("background");
        
        this.top_head_nd            = this.seekChild("top_head");
        this.bottom_head_nd         = this.seekChild("bottom_head");
        
        this.success_bg_nd          = this.seekChild("success_bg");
        this.fail_bg_nd             = this.seekChild("fail_bg");
        
        this.top_name_lb            = this.seekChild("top_name", cc.Label);
        this.bottom_name_lb         = this.seekChild("bottom_name", cc.Label);
        
        this.top_sk_node            = this.seekChild("title_container");
        this.top_sk                 = this.seekChild("title_container", sp.Skeleton);
        this.items_con_nd           = this.seekChild("items_con");
        
        // score相关
        this.top_item_img_sp        = this.seekChild("top_item_img", cc.Sprite);
        this.top_score_val_lb       = this.seekChild("top_score_val", cc.Label);
        this.top_score_val_nd       = this.seekChild("top_score_val");        
        this.top_fight_result_lb    = this.seekChild("top_fight_result", cc.Label);
        this.top_fight_result_nd    = this.seekChild("top_fight_result");        
        this.top_down_arrow_nd      = this.seekChild("top_down_arrow");
        this.top_up_arrow_nd        = this.seekChild("top_up_arrow");
        
        this.bottom_item_img_sp     = this.seekChild("bottom_item_img", cc.Sprite);
        this.bottom_score_val_lb    = this.seekChild("bottom_score_val", cc.Label);
        this.bottom_score_val_nd    = this.seekChild("bottom_score_val");        
        this.bottom_fight_result_lb = this.seekChild("bottom_fight_result", cc.Label);
        this.bottom_fight_result_nd = this.seekChild("bottom_fight_result");        
        this.bottom_down_arrow_nd   = this.seekChild("bottom_down_arrow");
        this.bottom_up_arrow_nd     = this.seekChild("bottom_up_arrow");
        this.harm_nd = this.seekChild("harm_btn");

        this.top_head = new PlayerHead();
        this.top_head.setParent(this.top_head_nd);
        this.top_head.setScale(0.8);
        this.top_head.show();

        this.bottom_head = new PlayerHead();
        this.bottom_head.setParent(this.bottom_head_nd);
        this.bottom_head.setScale(0.8);        
        this.bottom_head.show();

        this.background_nd.scale = FIT_SCALE;
        this.confirm_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.cancel_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCancelBtn, this);
        this.mask_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.harm_nd.on('click',function(){
            Utils.playButtonSound(1)
            if(this.data){
                var BattleController = require("battle_controller")
                BattleController.getInstance().openBattleHarmInfoView(true, this.data)
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params) {
        this.data = params;
        this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this._backpack_item_list) {
            for (var item_i in this._backpack_item_list)
                this._backpack_item_list[item_i].deleteMe();
        }
        this.ctrl.openLoopResultWindow(false);
    },

    onClickCloseBtn: function() {
        Utils.playButtonSound(1)
        this.ctrl.openLoopResultWindow(false);
    },

    onClickCancelBtn: function() {
        Utils.playButtonSound(1)
        this.ctrl.openLoopResultWindow(false);
        if(ArenaController.getInstance().getArenaRoot() == null){
            MainuiController.getInstance().changeMainUIStatus(MainUiConst.new_btn_index.main_scene, MainUiConst.sub_type.arena_call);
        }
        
    },

    updateWidgets: function() {
        if (!this.data) return;

        var data = this.data;
        this.top_head.setHeadRes(this.role_vo.face_id);
        this.top_head.setLev(this.role_vo.lev);

        this.bottom_head.setHeadRes(this.data.tar_face);
        this.bottom_head.setLev(this.data.tar_lev);

        this.top_name_lb.string = this.role_vo.name;
        this.bottom_name_lb.string = this.data.tar_name;

        // score
        if (this.score_iocn) {
            var item_path = PathTool.getIconPath("item", this.score_iocn.val);
            this.loadRes(item_path, function(item_sf) {
                this.top_item_img_sp.spriteFrame = item_sf;
                this.bottom_item_img_sp.spriteFrame = item_sf;                
            }.bind(this));            
        }

        this.top_score_val_lb.string = data.score;
        this.bottom_score_val_lb.string = data.tar_score;

        var top_result_str = "";
        if (data.get_score !== 0) {
            if (data.result === 1) {
                this.top_up_arrow_nd.active = true;
                this.top_score_val_nd.color    = new cc.Color().fromHEX('#ffcc00');
                this.top_fight_result_nd.color = new cc.Color().fromHEX('#ffcc00');               
            } else {
                this.top_down_arrow_nd.active = true;
                this.top_score_val_nd.color    = new cc.Color().fromHEX('#e14737');
                this.top_fight_result_nd.color = new cc.Color().fromHEX('#ff3a3a');                               
            }
            this.top_fight_result_lb.string = Math.abs(data.get_score);
        }

        var bottom_result_str = "";
        if (data.lose_score !== 0) {
            if (data.result === 1) {
                this.bottom_down_arrow_nd.active = true;
                this.bottom_score_val_nd.color    = new cc.Color().fromHEX('#ffffff');
                this.bottom_fight_result_nd.color = new cc.Color().fromHEX('#ff3a3a');
            } else {
                this.bottom_up_arrow_nd.active = true;                
                this.bottom_score_val_nd.color    = new cc.Color().fromHEX('#ffffff');
                this.bottom_fight_result_nd.color = new cc.Color().fromHEX('#ffcc00');
            }
            this.bottom_fight_result_lb.string = Math.abs(data.lose_score);            
        }

        this.updateRewardList();
        this.handleEffect();        
    },

    updateRewardList: function() {
        this._backpack_item_list = [];
        if (!this.data || !this.data.items) return;
        for (var item_i in this.data.items) {
            var item_info = this.data.items[item_i];

            var con_nd = new cc.Node();
            con_nd.setContentSize(130, 130);
            this.items_con_nd.addChild(con_nd);
            var backpack_item = ItemsPool.getInstance().getItem("backpack_item");
            backpack_item.setParent(con_nd);
            backpack_item.setExtendData({scale: 0.8});
            backpack_item.show();
            backpack_item.setData(item_info);
            this._backpack_item_list.push(backpack_item);
        }
    },

    handleEffect: function(status) {
        var effect_id = 103;
        var temp_y = 890;
        var action = PlayerAction.action_2

        if (this.data.result === 2) {
            temp_y = 930;
            effect_id = 104;
            action = PlayerAction.action;
            Utils.playButtonSound("c_fail");
        } else {
            Utils.playButtonSound("c_arenasettlement");
        }

        this.top_sk_node.y = temp_y;
        var effect_res = PathTool.getEffectRes(effect_id);
        var effect_path = PathTool.getSpinePath(effect_res, "action");

        this.loadRes(effect_path, function(effect_sd) {
            this.top_sk.skeletonData = effect_sd;
            this.top_sk.setAnimation(0, action, false);
        }.bind(this));
    },
})