// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     答题开始提面板
// <br/>Create: 2019-05-11 11:20:03
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Adventure_evt_answer_startWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_answer_start_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.config = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("root");
        this.item_icon_node = this.main_container.getChildByName("item_icon");
        this.item_icon_node.scale = 2;
        this.item_icon = this.item_icon_node.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_47"), function (sf_obj) {
            this.item_icon.spriteFrame = sf_obj;
        }.bind(this));
        
    
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.ack_button = this.main_container.getChildByName("ack_button");
        this.ack_label = this.ack_button.getChildByName("Label").getComponent(cc.Label);
        this.ack_label.string = Utils.TI18N("开始答题");
        
        this.title_label = this.main_container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("智力大乱斗");
        
        this.swap_desc_label = Utils.createRichLabel(26, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(0, -this.main_container.getContentSize().height / 2 + 440),30,600);
        this.swap_desc_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.main_container.addChild(this.swap_desc_label.node);
        this.swap_desc_label.node.active = true;
    
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.ack_button, function () {
            if(this.config){
                this.ctrl.openEvtViewByType(false);
                this.ctrl.openAnswerView(true,this.data);
            }
        }.bind(this), 1);
    },

    updatedata:function(){
        if(this.config){
            this.swap_desc_label.string = this.config.desc;
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.config = data.config;
        this.updatedata();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openEvtViewByType(false);
    },
})