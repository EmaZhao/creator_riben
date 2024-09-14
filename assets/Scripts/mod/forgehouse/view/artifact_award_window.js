// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-08 21:01:16
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");

var Artifact_awardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "artifact_award_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var main_panel = this.seekChild("main_panel");
        var main_container = this.seekChild(main_panel, "main_container");

        this.close_btn = this.seekChild("close_btn");
        this.ok_btn = this.seekChild("ok_btn");
        this.ok_btn_btn = this.ok_btn.getComponent(cc.Button);
        this.ok_btn_lb = this.seekChild(this.ok_btn, "label", cc.Label);
        this.ok_btn_lo = this.seekChild(this.ok_btn, "label", cc.LabelOutline);
        this.ok_btn_lb.string = Utils.TI18N("领取");

        var content_lb = this.seekChild(main_container, "content_label", cc.Label);

        var lucky_cfg = Config.partner_artifact_data.data_artifact_const["change_condition"];
        var award_cfg = Config.partner_artifact_data.data_artifact_const["change_gift"];
        if (lucky_cfg && award_cfg && award_cfg.val && award_cfg.val[0]) {
            var bid = award_cfg.val[0][0];
            var num = award_cfg.val[0][1];
            var item_config = Utils.getItemConfig(bid);
            if (item_config) {
                this.award_item_bid = bid;
                content_lb.string = cc.js.formatStr(Utils.TI18N("熔炼值达到%s点后可领取[%s]x%s"), lucky_cfg.val, item_config.name, num)
                if (!this.award_item) {
                    this.award_item = ItemsPool.getInstance().getItem("backpack_item");
                    this.award_item.initConfig(false, 1, false, true);
                    this.award_item.addCallBack(this._onClickItemCallBack.bind(this));
                    this.award_item.setData({ bid: bid, num: num });
                    this.award_item.setPosition(0, -20);
                    this.award_item.show();
                    this.award_item.setParent(main_container);
                }
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openArtifactAwardWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openArtifactAwardWindow(false)
        }.bind(this), 2)
        this.ok_btn.on("click", function () {
            this.ctrl.sender11038()
            this.ctrl.openArtifactAwardWindow(false)
            Utils.playButtonSound(1)
        }, this)
    },

    _onClickItemCallBack: function () {
        if (this.award_item_bid) {
            this.ctrl.openArtifactComTipsWindow(true, this.award_item_bid)
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.refreshBtnStatus();
    },

    //刷新领取按钮状态
    refreshBtnStatus: function () {
        var cur_lucky = this.ctrl.getModel().getArtifactLucky();
        var max_lucky = 0;
        var lucky_cfg = Config.partner_artifact_data.data_artifact_const["change_condition"];
        if (lucky_cfg && lucky_cfg.val) {
            max_lucky = lucky_cfg.val;
        }
        if (cur_lucky >= max_lucky) {
            Utils.setGreyButton(this.ok_btn_btn, false);
            this.ok_btn_lo.enabled = true;
        } else {
            Utils.setGreyButton(this.ok_btn_btn, true)
            this.ok_btn_lo.enabled = false;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openArtifactAwardWindow(false)
        if (this.award_item) {
            this.award_item.deleteMe();
            this.award_item = null;
        }
    },
})