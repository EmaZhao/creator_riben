// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-20 10:32:09
// --------------------------------------------------------------------
var PathTool       = require("pathtool");
var RoleController = require("role_controller");

var Arena_loop_challenge_buyWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("arena", "arean_loop_challenge_buy");
        this.viewTag = SCENE_TAG.dialogue;                // 该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;                     // 是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.buy_num = 0;

        this.role_vo = RoleController.getInstance().getRoleVo();
        this.arena_ticketcost_item = Config.arena_data.data_const.arena_ticketcost.val[0][0];
        this.item_config_item      = gdata("item_data", "data_unit1", this.arena_ticketcost_item, false);
        this.ticket_price_info     = Config.arena_data.data_const.ticket_price;
        this.ticket_price          = this.ticket_price_info.val[0][1];
        this.ticket_id             = this.ticket_price_info.val[0][0];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.btn_close_nd  = this.seekChild("btn_close");
        this.mask_nd       = this.seekChild("mask");
        this.item_con_nd   = this.seekChild("item_con");
        
        this.btn_add_nd    = this.seekChild("btn_add");
        this.btn_redu_nd   = this.seekChild("btn_redu");
        this.btn_buy_nd    = this.seekChild("btn_buy");
        
        this.buy_num_lb    = this.seekChild("buy_num", cc.Label);
        this.expand_num_rt = this.seekChild("expand_num", cc.RichText);
        this.icon_img_sp   = this.seekChild("icon_img", cc.Sprite);

        this.background_nd       = this.seekChild("background");
        this.background_nd.scale = FIT_SCALE;
        
        this.backpack_item = ItemsPool.getInstance().getItem("backpack_item");
        this.backpack_item.setParent(this.item_con_nd);
        // this.backpack_item.setExtendData();
        this.backpack_item.show();

        this.btn_close_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.mask_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.btn_add_nd.on(cc.Node.EventType.TOUCH_END, this.onClickAddBtn, this);
        this.btn_redu_nd.on(cc.Node.EventType.TOUCH_END, this.onClickRedBtn, this);
        this.btn_buy_nd.on(cc.Node.EventType.TOUCH_END, this.onClickBuyBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        // this.updateValue();
        this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.backpack_item){
            this.backpack_item.deleteMe()
            this.backpack_item = null;
        }
        this.ctrl.openArenaLoopChallengeBuy(false);
    },

    onClickCloseBtn: function() {
        this.ctrl.openArenaLoopChallengeBuy(false);
    },

    onClickAddBtn: function() {
        if (this.buy_num < this.can_buy - 1) {
            this.buy_num += 1;
            this.updateValue();            
        } else {
            message(Utils.TI18N("已达最大购买值"));            
        }
    },

    onClickRedBtn: function() {
        if (this.buy_num > 1) {
            this.buy_num -= 1;
            this.updateValue();
        } else {
            message(Utils.TI18N("购买数量不能小于0"));
        }
    },

    updateWidgets: function() {
        if (this.item_config_item)
            this.backpack_item.setData(this.item_config_item.id);
        
        if (this.role_vo.getTotalGold() > this.ticket_price)
            this.buy_num = 1;

        this.can_buy  = Math.floor(this.role_vo.getTotalGold() / this.ticket_price);

        var icon_path = PathTool.getIconPath("item", this.ticket_id);
        this.loadRes(icon_path, function(icon_sf) {
            this.icon_img_sp.spriteFrame = icon_sf;
        }.bind(this));

        this.updateValue();
    },

    updateValue: function() {
        this.buy_num_lb.string = this.buy_num;
        var expand_str = cc.js.formatStr("<color=#ffffff>%s/</color><color=#52ff6f>%s</color>", Utils.getMoneyString(this.role_vo.getTotalGold()), this.ticket_price * this.buy_num);
        this.expand_num_rt.string = expand_str;
    },

    onClickBuyBtn: function() {
        this.ctrl.sender20207(this.buy_num);
    },
})