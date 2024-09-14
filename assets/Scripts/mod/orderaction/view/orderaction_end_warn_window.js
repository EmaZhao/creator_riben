// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     活动结束警告
// <br/>Create: 2019-08-10 16:25:54
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Orderaction_end_warnWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "orderaction_end_warn_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
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
        var main_container = this.root_wnd.getChildByName("main_container");
        var text_15 = main_container.getChildByName("Image_16").getChildByName("Text_15").getComponent(cc.Label);
        text_15.string = Utils.TI18N("活动提醒");
        this.btn_close = main_container.getChildByName("btn_close");
        this.btn_ok = main_container.getChildByName("btn_ok");
        var text_14 = this.btn_ok.getChildByName("Text_14").getComponent(cc.Label);
        text_14.string = Utils.TI18N("我知道了");
        
        var desc_text = main_container.getChildByName("desc_text").getComponent(cc.Label);
        desc_text.string = Utils.TI18N("              缤纷盛夏活动将于          后结束\n活动结束后，累积等级、任务进度及经验将会清\n除，请及时完成试炼任务，领取相应奖励，以免\n错过奖励哦！");
        
        this.reamin_day = main_container.getChildByName("reamin_day").getComponent(cc.Label);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEndWarnView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_close, function () {
            this.ctrl.openEndWarnView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_ok, function () {
            this.ctrl.openEndWarnView(false);
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(day){
        day = day || 0;
        var str = "";
        var remain_day = 30 - day;
        if(remain_day <= 0){
            remain_day = 0;
            str = Utils.TI18N("今天");
        }else{
            str = remain_day+Utils.TI18N("天");
        }
           
	    this.reamin_day.string = str;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openEndWarnView(false);
    },
})