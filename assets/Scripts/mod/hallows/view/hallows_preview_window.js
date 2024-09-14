// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     失落神器（所有神器预览界面）
// <br/>Create: 2019-02-20 14:14:19
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HallowsPreviewItem = require("hallows_preview_item_panel");

var Hallows_previewWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_preview_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.hallows_list = [];
        this.pos_nodes = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild(this.root_wnd, "background");
        this.background.scale = FIT_SCALE; 
        this.bg = this.seekChild(this.root_wnd, "background", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_69","jpg"), (function(resObject){
            this.bg.spriteFrame = resObject;
        }).bind(this));
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.seekChild("win_title", cc.Label).string = Utils.TI18N("失落神器")
        this.hallows_bg = this.main_panel.getChildByName("hallows_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_70"), (function(resObject){
            this.hallows_bg.spriteFrame = resObject;
        }).bind(this));
        this.close_btn = this.main_panel.getChildByName("close_btn");
    
    },

    refreshView:function(){
        var hallows_num = Config.hallows_data.data_base_length;
        for(var i = 1;i<=hallows_num;i++){
            var pos_node = this.main_panel.getChildByName("pos_node_" + i);
            if(pos_node){
                this.pos_nodes[i] = pos_node;
                var hallows_item = this.hallows_list[i];
				if (hallows_item == null){
                    hallows_item = new HallowsPreviewItem();
                    hallows_item.setParent(pos_node);
					this.hallows_list[i] = hallows_item
                }
				var config = Config.hallows_data.data_base[i] || {};
                hallows_item.setData(config);
                hallows_item.show();
                
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this._onClickCloseBtn();
        }, this)
    },

    _onClickCloseBtn:function(){
        this.ctrl.openHallowsPreviewWindow(false);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.refreshView();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.pos_nodes){
            this.pos_nodes[i].stopAllActions();
        }
        this.pos_nodes = null;
        for(var j in this.hallows_list){
            var item = this.hallows_list[j];
            item.deleteMe();
            item = null;
        }
        this.hallows_list = null;
	    this.ctrl.openHallowsPreviewWindow(false);
    },
})