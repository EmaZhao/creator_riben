// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-19 16:38:43
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Charge_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "charge_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");

        this.price_container = this.seekChild("price_container");
        this.coin_sp = this.seekChild(this.price_container, "coin", cc.Sprite);
        this.price_lb = this.seekChild(this.price_container, "price", cc.Label);
        this.icon_sp = this.seekChild(this.main_container, "icon", cc.Sprite);

        this.loadRes(PathTool.getItemRes(3), function (sp) {
            this.coin_sp.spriteFrame = sp;
        }.bind(this))

        this.charge_price_lb = this.seekChild("charge_price", cc.Label);
        this.extra_bg_nd = this.seekChild("extra_bg");
        this.extra_bg_nd.active = false;
        this.extra_desc_lb = this.seekChild(this.extra_bg_nd, "give", cc.Label);

        this.extra_rt = this.seekChild("extra_label", cc.RichText);

        this.confirm_bg_nd = this.seekChild("confirm_bg");
        this.confirm_bg_nd.active = false;
        this.confirm_tips_nd = this.seekChild("confirm_tips");
        this.confirm_tips_nd.active = false;

        this.first_bg_nd = this.seekChild("first_bg");
        this.first_bg_nd.active = false;
        this.first_lb = this.seekChild(this.first_bg_nd, "first_label", cc.Label);
        this.first_lb.string = "初チャージ";
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.callback) {
                this.callback(this);
            }
            if (this.confirm_tips_nd.active) {
                let charge_config = Config.charge_data.data_charge_data[this.data.id]
                SDK.pay(this.data.need_rmb / 100, 1, this.data.id, charge_config.name,charge_config.product_desc,null,null,charge_config.pay_image) 
                this.confirm_tips_nd.active = false;
                this.confirm_bg_nd.active = false;
            } else {
                this.confirm_tips_nd.active = true;
                this.confirm_bg_nd.active = true;
            }
        }, this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        this.charge_price_lb.string = data.need_rmb / 100;
        this.price_lb.string = data.get_gold;
        if (data.is_first == 1) {
            this.first_bg_nd.active = true;
        } else {
            this.first_bg_nd.active = false;
        }

        if (data.add_gold > 0) {
            this.extra_bg_nd.active = true;
            this.extra_desc_lb.string = "オマケ\n(無償分)";
            var res = PathTool.getItemRes(Utils.getItemConfig(4).icon)
            this.extra_rt.string = cc.js.formatStr("<img src='%s' scale=0.3 /><outline width=2 color=#5b2c06>%s</outline>", Utils.getItemConfig(4).icon, data.add_gold);
            this.loadRes(res, (function (resObject) {
                this.extra_rt.addSpriteFrame(resObject);
            }).bind(this));
        } else if (data.id == 1 || data.id == 2) {
            this.coin_sp.node.active = false;
            this.price_lb.string = data.name;
            this.extra_bg_nd.active = true;
            this.extra_desc_lb.string = Utils.TI18N("即得");
            var res = PathTool.getItemRes(Utils.getItemConfig(Config.item_data.data_assets_label2id.gold).icon)
            this.extra_rt.string = cc.js.formatStr("<img src='%s' scale=0.3 /><outline width=2 color=#5b2c06>%s</outline>", Utils.getItemConfig(Config.item_data.data_assets_label2id.gold).icon, data.get_gold);
            this.loadRes(res, (function (resObject) {
                this.extra_rt.addSpriteFrame(resObject);
            }).bind(this));
            this.icon_sp.node.scale = 0.8;
            this.updateYuekaInfoData(data)
        }else{
            this.extra_rt.string = "";
        }
        this.loadRes(PathTool.getUIIconPath("vip", "vip_icon" + data.pic), function (sp) {
            this.icon_sp.spriteFrame = sp;
        }.bind(this))
    },

    updateYuekaInfoData: function (data) {
        
    },

    getData: function () {
        return this.data
    },

    setSelect: function (status) {
        this.confirm_tips_nd.active = status;
        this.confirm_bg_nd.active = status;
    },

    addCallBack: function (value) {
        this.callback = value;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})