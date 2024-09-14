// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     星河神殿 战斗结算界面
// <br/>Create: 2019-03-16 10:25:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var RoleController = require("role_controller");
var PrimusChallengeResultItem = require("primus_challenge_result_item_panel");

var Primus_challenge_resultWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("primus", "primus_challenge_result_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.title_container = this.main_container.getChildByName("title_container");
        this.title_width = this.title_container.getContentSize().width;
        this.title_height = this.title_container.getContentSize().height;
    
        this.title_img = this.main_container.getChildByName("title_img").getComponent(cc.Sprite);
        this.harm_btn = this.main_container.getChildByName("harm_btn");
        this.harm_btn.active = false;
    
        this.list_view = this.root_wnd.getChildByName("list_view");
        var size = this.list_view.getContentSize();
        var setting = {
            item_class: PrimusChallengeResultItem,
            start_x: 0,
            space_x: 0,
            start_y: 8,
            space_y: 12,
            item_width: 720,
            item_height: 43,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(this.list_view, null, null, null, size, setting);
    
        this.goto_btn = this.main_container.getChildByName("goto_btn");
        var goto_lab = this.goto_btn.getChildByName("label").getComponent(cc.Label);
        goto_lab.string = Utils.TI18N("前往装备称号");
        
        this.comfirm_btn = this.main_container.getChildByName("comfirm_btn");
        var comfirm_lab = this.comfirm_btn.getChildByName("label").getComponent(cc.Label);
        comfirm_lab.string = Utils.TI18N("确 定");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openPrimusChallengeResultWindow(false);
        }.bind(this), 1);

        Utils.onTouchEnd(this.goto_btn, function () {
            this._onGoToEquipTitle();
        }.bind(this), 2);

        Utils.onTouchEnd(this.comfirm_btn, function () {
            this.ctrl.openPrimusChallengeResultWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.harm_btn, function () {
            this._onClickHarmBtn();
        }.bind(this), 1);
    },

    _onClickHarmBtn:function(  ){
        if(this.data && Utils.next(this.data)!= null ){
            require("battle_controller").getInstance().openBattleHarmInfoView(true, this.data)
        }
    },

    // 前往装备称号
    _onGoToEquipTitle:function(){
        this.ctrl.openPrimusChallengeResultWindow(false);
        RoleController.getInstance().openRoleDecorateView(true, 4);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        Utils.playButtonSound("c_win");
        this.handleEffect(true);
        if(data){
            this.data = data;
            this.harm_btn.active = true;
        }
        this.local_data = Config.primus_data.data_upgrade[data.pos];
        if(this.local_data){
            var honor_data =Config.honor_data.data_title[this.local_data.honor_id];
            this.scroll_view.setData(honor_data.attr);
            if(honor_data && this.title_img){
                var res = PathTool.getHonorRes(honor_data.res_id);
                this.loadRes(res, (function(resObject){
                    if(this.title_img){
                        this.title_img.spriteFrame = resObject;
                    }
                }).bind(this));
            }
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
            var effect_id = 274
            var action = PlayerAction.action_3;
            if(this.title_container && this.play_effect == null){
                var node = new cc.Node();
                node.setAnchorPoint(0.5,0.5)
                node.setPosition(0, 10);
                this.title_container.addChild(node,0);

                this.play_effect = node.addComponent(sp.Skeleton);
                var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(effect_id), "action");
                this.loadRes(anima_path, function(ske_data) {
                    if(this.play_effect){
                        this.play_effect.skeletonData = ske_data;
                        this.play_effect.setAnimation(0, action, false);
                    }
                }.bind(this));
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
        this.handleEffect(false);
        this.ctrl.openPrimusChallengeResultWindow(false);
    },
})