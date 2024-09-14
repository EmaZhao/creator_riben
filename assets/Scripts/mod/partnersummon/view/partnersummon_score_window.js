// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-19 09:41:52
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var SummonConst = require("partnersummon_const");

var PartnersummonScoreWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("partnersummon", "partnersummon_score_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        var RoleController = require("role_controller");
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {},

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        Utils.getNodeCompByPath("main_panel/main_container/ScrollView/view/scrollcontent/tips_label", this.root_wnd, cc.Label).string = Utils.TI18N("（vip3方可召唤）");
        Utils.getNodeCompByPath("main_panel/main_container/ScrollView/view/scrollcontent/ok_btn/btn_label", this.root_wnd, cc.Label).string = Utils.TI18N("召唤");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.initWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        this.ctrl.openScoreTipWindow(false)
    },

    initWidgets: function() {
        this.close_btn_nd = this.seekChild("close_btn");
        this.close_btn_nd.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("关闭")
        this.ok_btn_nd = this.seekChild("ok_btn");
        this.ok_btn_bt = this.ok_btn_nd.getComponent(cc.Button);
        this.content_lb = this.seekChild("content_label", cc.Label);
        this.btn_title_ol = this.seekChild("btn_label", cc.LabelOutline);

        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        let hero_sp = this.seekChild("Image_9", cc.Sprite)
        this.loadRes(PathTool.getIconPath("item", "29999"), function(res) {
            hero_sp.spriteFrame = res
        }.bind(this))
        this.progressLabel = this.seekChild("progress_label",cc.Label);
        this.scrollcontent = this.seekChild("scrollcontent");
        var extend_label = this.seekChild("extend_label",cc.Label);
        extend_label.string = Utils.TI18N("注意事项");
        this.decs_label = this.seekChild("decs_label",cc.RichText);
        var descstr = Config.recruit_data.data_explain[7].desc;
        this.decs_label.string = descstr;
        this.decs_label._updateRichText();
        this.scrollcontent.height = 540 +this.decs_label.node.height;
        this.ok_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickOkBtn, this);
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didCloseBnt, this);

        this.updateWidgets();
    },

    updateWidgets: function() {
        var need_score = this.model.getScoreSummonNeedCount();
        var des_str = cc.js.formatStr(Utils.TI18N("消耗%d点积分可进行积分召唤，必出5星传说英雄"), need_score);
        this.content_lb.string = des_str;
        var have_score = this.role_vo.recruit_hero;
        if (have_score >= need_score) {
            this.ok_btn_bt.interactable = true;
            this.btn_title_ol.enabled = true;
        } else {
            this.ok_btn_bt.interactable = false;
            this.btn_title_ol.enabled = false;
        }
        this.progressLabel.string = `${have_score}/${need_score}`;
    },

    didCloseBnt: function(event) {
        this.ctrl.openScoreTipWindow(false);
    },

    didClickOkBtn: function(event) {
        if (this.ok_btn_bt.interactable) {
            var times = 1;
            var recruit_type = 2;

            this.ctrl.scoreRecruit(SummonConst.Summon_Type.Score, 1, 3);
            this.ctrl.openScoreTipWindow(false);
        }
    },
})