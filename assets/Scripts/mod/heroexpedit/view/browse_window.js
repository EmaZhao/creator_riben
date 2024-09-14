// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 14:17:34
// --------------------------------------------------------------------
var PathTool = require("pathtool");


var BrowseWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("heroexpedit", "browse_reward_panel");
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
        var main_container = this.root_wnd.getChildByName("main_container");
        var text_32 = main_container.getChildByName("Image_33").getChildByName("Text_32").getComponent(cc.Label);
        text_32.string = Utils.TI18N("奖励预览");
        this.btn_con = main_container.getChildByName("btn_con");
        var text_33 = this.btn_con.getChildByName("Text_33").getComponent(cc.Label);
        text_33.string = Utils.TI18N("确认");
        this.good_con = main_container.getChildByName("good_con");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openBrowsePanelView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_con, function () {
            this.ctrl.openBrowsePanelView(false);
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(!data)return;
        // 关卡奖励
        var data_reward = null;
        if(data.rewards){
            data_reward = data.rewards;
        }
        
        if(data_reward){
            var num = data_reward.length;
            var pos = [];
            if(num == 2){
                pos = [166,423];
            }else{
                pos = [166,296,423];
            }
            for(var i = 0;i<num;i++){
                if(!this.reward_list[i]){
                    this.reward_list[i] = ItemsPool.getInstance().getItem("backpack_item");
                    this.reward_list[i].setParent(this.good_con);
                    this.reward_list[i].initConfig();
                    this.reward_list[i].show();
                }
                if(this.reward_list[i]){
                    this.reward_list[i].setPosition(pos[i], 79);
                    if(data_reward[i].bid == 25 && data.is_holiday == 1){
                        this.reward_list[i].holidHeroExpeditTag(true, "限定アップ");
                    }else{
                        this.reward_list[i].holidHeroExpeditTag(false);
                    }
                    this.reward_list[i].setDefaultTip();
                    this.reward_list[i].setData({bid:data_reward[i].bid, num:data_reward[i].num})
                }
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.reward_list){
            this.reward_list[i].deleteMe();
            this.reward_list[i] = null;
        }
        this.reward_list = null;
        this.ctrl.openBrowsePanelView(false);
    },
})