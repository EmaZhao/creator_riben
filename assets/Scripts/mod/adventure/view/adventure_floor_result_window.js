// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     每层结算展示
// <br/>Create: 2019-05-14 10:36:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var AdventureFloorResultItem = require("adventure_floor_result_item_panel");

var Adventure_floor_resultWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_floor_result_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
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
    
        this.list_view = this.root_wnd.getChildByName("list_view");
        var size = this.list_view.getContentSize();
        var setting = {
            item_class: AdventureFloorResultItem,
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
        this.scroll_view.createScroll(this.list_view, cc.v2(-size.width/2,-size.height/2), null, null, size, setting);

        this.item = this.root_wnd.getChildByName("item");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAdventureFloorResultWindow(false);
        }.bind(this), 2);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        Utils.playButtonSound("c_get");
        this.handleEffect(true);

        var item_list = data.items_list;
        if(item_list){
            item_list.sort(function(a, b){
                return b.num - a.num;
            });
        }
        this.scroll_view.setData(item_list);
    },

    handleEffect:function(status){
        if(status == false){
            if(this.play_effect){
                this.play_effect.setToSetupPose();
                this.play_effect.clearTracks();
                this.play_effect = null;
            }
        }else{
            var effect_id = 274;
            var action = PlayerAction.action_4;
            if(this.title_container && this.play_effect == null){
                var eff_node = new cc.Node();
                eff_node.setAnchorPoint(0.5,0.5)
                eff_node.setPosition(0,0);
                this.title_container.addChild(eff_node);

                this.play_effect = eff_node.addComponent(sp.Skeleton);
                var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(effect_id), "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.play_effect.skeletonData = ske_data;
                    this.play_effect.setAnimation(0, action, false);
                }.bind(this));
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.scroll_view) {
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
        this.ctrl.openAdventureFloorResultWindow(false);
    },
})