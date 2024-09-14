// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-05 14:35:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");

var Action_time_shop_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "week_month_panel_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.touch_buy_limit_shop = true;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.has_get = this.seekChild("has_get");
        this.btn_charge = this.seekChild("btn_charge");
        this.charge_price_lb = this.seekChild("Text_4_0", cc.Label);
        this.text_remian_lb = this.seekChild("Text_4", cc.Label);

        var good_cons = this.seekChild("good_cons");
        var size = good_cons.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 3,                    // 第一个单元的X起点
            space_x: 5,                    // x方向的间隔
            start_y: 4,                    // 第一个单元的Y起点
            space_y: 4,                   // y方向的间隔
            item_width: 120 * 0.8,               // 单元的尺寸width
            item_height: 120 * 0.8,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
            scale: 0.8
        }
        this.good_scrollview = new CommonScrollView()
        this.good_scrollview.createScroll(good_cons, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.btn_charge, function () {
            if (!this.touch_buy_limit_shop) return
            if (this.buy_limit_shop_ticket == null) {
                this.buy_limit_shop_ticket = gcore.Timer.set(function () {
                    this.touch_buy_limit_shop = true;
                    if (this.buy_limit_shop_ticket != null) {
                        gcore.Timer.del(this.buy_limit_shop_ticket);
                        this.buy_limit_shop_ticket = null;
                    }
                }.bind(this), 2000, 1)
            }
            this.touch_buy_limit_shop = null;
            if (this.data && this.data.aim) {
                var charge_config = Config.charge_data.data_charge_data[this.data.aim];
                if (charge_config) {
                    SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image)
                }
            }
        }.bind(this), 1)
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
        var list = [];
        for (var k in data.item_list) {
            var v = data.item_list[k];
            var vo = {};
            vo.bid = v.bid;
            vo.num = v.num;
            list.push(vo);
        }
        this.good_scrollview.setData(list);
        this.good_scrollview.addEndCallBack(function () {
            var list = this.good_scrollview.getItemList();
            for (var k in list) {
                if (list[k])
                    list[k].setDefaultTip();
            }
        }.bind(this))

        if (data.status == 2) {   //卖完
            this.btn_charge.active = false;
            this.text_remian_lb.node.active = false;
            this.has_get.active = true;
        } else {
            this.btn_charge.active = true;
            this.text_remian_lb.node.active = true;
            this.has_get.active = false;

            //剩余数量
            var max_num = 0;
            var buy_num = 0;
            var price = 0;
            for (var k in data.aim_args) {
                var v = data.aim_args[k];
                if (v.aim_args_key == 2) {
                    max_num = v.aim_args_val;
                } else if (v.aim_args_key == 6) {
                    buy_num = v.aim_args_val;
                } else if (v.aim_args_key == 27) {
                    price = v.aim_args_val;
                }
            }
            this.text_remian_lb.string = cc.js.formatStr(Utils.TI18N("残り:%s"), max_num - buy_num);
            //价格
            this.charge_price_lb.string = cc.js.formatStr(Utils.TI18N("%s"), price);
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.good_scrollview) {
            this.good_scrollview.deleteMe();
            this.good_scrollview = null;
        }
        if (this.buy_limit_shop_ticket != null) {
            gcore.Timer.del(this.buy_limit_shop_ticket);
            this.buy_limit_shop_ticket = null;
        }
    },
})