// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-15 11:19:31
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Arena_champion_guessWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_guess_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.can_bet = 0; // 可竞猜数量

        this.guess_config = Config.arena_champion_data.data_const.guess_coin;
        this.max_config = Config.arena_champion_data.data_const.guess_limit;
        this.guess_coin = this.guess_config.val; // 竞猜单位
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        //Utils.getNodeCompByPath("container/cancel_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        Utils.getNodeCompByPath("container/confirm_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("确定");
        Utils.getNodeCompByPath("container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("竞猜");
        Utils.getNodeCompByPath("container/set_title", this.root_wnd, cc.Label).string = Utils.TI18N("竞猜数量：");
        Utils.getNodeCompByPath("container/can_guess_title", this.root_wnd, cc.Label).string = Utils.TI18N("可竞猜：");
        Utils.getNodeCompByPath("container/can_get_title", this.root_wnd, cc.Label).string = Utils.TI18N("可获得：");
        Utils.getNodeCompByPath("container/guess_title", this.root_wnd, cc.Label).string = Utils.TI18N("投入竞猜币数量");
        Utils.getNodeCompByPath("container/guess_max_title", this.root_wnd, cc.Label).string = Utils.TI18N("已达押注上限");
        this.set_left_nd = this.seekChild("set_left");
        this.set_right_nd = this.seekChild("set_right");
        this.set_max_nd = this.seekChild("set_max");
        this.cancel_btn_nd = this.seekChild("cancel_btn");
        this.confirm_btn_nd = this.seekChild("confirm_btn");
        this.mask_nd = this.seekChild("mask");
        this.close_btn_nd = this.seekChild("close_btn");
        this.mask_nd.scale = FIT_SCALE;

        this.set_value_lb = this.seekChild("set_value", cc.Label);
        this.guess_value_lb = this.seekChild("guess_value", cc.Label);
        this.get_value_lb = this.seekChild("get_value", cc.Label);
        this.guess_role_lb = this.seekChild("guess_role", cc.Label);
        let item_sp2 = this.seekChild("Sprite_2", cc.Sprite);
        let item_sp1 = this.seekChild("Sprite_1", cc.Sprite);

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.mask_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.cancel_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);

        this.set_left_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLeftBtn, this);
        this.set_right_nd.on(cc.Node.EventType.TOUCH_END, this.onClickRightBtn, this);
        this.set_max_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMaxBtn, this);

        this.confirm_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickConfirmBtn, this);
        let path = PathTool.getIconPath("item", "19")
        this.loadRes(path, function(res) {
            item_sp2.spriteFrame = res;
            item_sp1.spriteFrame = res;
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        if (!params) return;
        this.guess_data = params;
        this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        this.ctrl.openArenaChampionGuessWindow(false)
    },

    updateWidgets: function() {
        this.guess_role_lb.string = this.guess_data.name || "";
        this.guess_value_lb.string = this.guess_data.can_bet;

        var bet_ratio = this.guess_data.bet_ratio || 2000;
        this.guess_times = bet_ratio * 0.001;

        this.can_bet = this.guess_data.can_bet;
        if (this.max_config.val < this.can_bet)
            this.can_bet = this.max_config.val;

        this.guess_value_lb.string = this.can_bet;

        if (this.can_bet < this.guess_coin) {
            this.set_value_lb.string = 0;
            this.get_value_lb.string = 0;
        } else {
            this.setGuessValue(this.guess_coin);
        }
    },

    onClickCloseBtn: function(event) {
        this.ctrl.openArenaChampionGuessWindow(false);
    },

    // 设置竞猜数量
    setGuessValue: function(set_val) {
        if (!this.guess_data) return;
        this.cur_set_val = set_val;
        var get_val = Math.floor(this.cur_set_val * this.guess_times);
        this.set_value_lb.string = this.cur_set_val;
        this.get_value_lb.string = get_val;
    },

    onClickLeftBtn: function(event) {
        if (this.guess_data) {
            var target_value = this.cur_set_val - this.guess_coin;
            if (target_value < 0)
                target_value = 0;
            this.setGuessValue(target_value);
        }
    },

    onClickRightBtn: function(event) {
        if (this.guess_data) {
            var target_value = this.cur_set_val + this.guess_coin;
            if (target_value > this.can_bet)
                target_value = this.can_bet;
            this.setGuessValue(target_value);
        }
    },

    onClickMaxBtn: function(event) {
        if (this.guess_data && this.can_bet > this.guess_coin)
            this.setGuessValue(this.can_bet);
    },

    onClickConfirmBtn: function() {
        if (this.guess_data && this.cur_set_val > 0)
            this.ctrl.sender20254(this.guess_data.bet_type, this.cur_set_val);
    },

})