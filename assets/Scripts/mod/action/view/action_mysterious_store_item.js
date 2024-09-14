// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     神秘杂货铺item,zys
// <br/>Create: 2019-07-03 19:40:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var ActionConst = require("action_const");
var CommonAlert = require("commonalert");
var ActionController = require("action_controller");
var MallConst = require("mall_const");

var Action_mysterious_store_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_mysterious_store_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = ActionController.getInstance();
        this.color_1 = new cc.Color(255, 255, 255, 255);
        this.color_2 = new cc.Color(113, 40, 4, 255);
        this.item_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        var main_container = this.seekChild("main_container");
        this.txt_title_lb = this.seekChild(main_container, "txt_title", cc.Label);
        this.txt_task_lb = this.seekChild(main_container, "txt_task", cc.Label);
        this.btn_exchange = this.seekChild(main_container, "btn_exchange");
        this.btn_exchange_btn = this.btn_exchange.getComponent(cc.Button);
        this.txt_exchange_lb = this.seekChild(this.btn_exchange, "txt_exchange", cc.Label);
        this.img_has_get = this.seekChild(main_container, "img_has_get");
        this.img_has_get.active = false;
        this.img_equal_nd = this.seekChild(main_container, "img_equal");

        this.cost_good_cons = this.seekChild("cost_good_cons");
        var size = this.cost_good_cons.getContentSize();
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
        this.cost_item_scrollview = new CommonScrollView()
        this.cost_item_scrollview.createScroll(this.cost_good_cons, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5))

        this.get_good_cons = this.seekChild("get_good_cons");
        // var size = this.get_good_cons.getContentSize();
        // var setting = {
        //     item_class: _BackPackItem,      // 单元类
        //     start_x: 3,                    // 第一个单元的X起点
        //     space_x: 5,                    // x方向的间隔
        //     start_y: 4,                    // 第一个单元的Y起点
        //     space_y: 4,                   // y方向的间隔
        //     item_width: 120 * 0.8,               // 单元的尺寸width
        //     item_height: 120 * 0.8,              // 单元的尺寸height
        //     row: 1,                        // 行数，作用于水平滚动类型
        //     col: 0,                        // 列数，作用于垂直滚动类型
        //     // need_dynamic: true
        //     scale: 0.8
        // }
        // this.get_item_scrollview = new CommonScrollView()
        // this.get_item_scrollview.createScroll(this.get_good_cons, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.btn_exchange.on("click",function(){
            Utils.playButtonSound(1);
            this.btnExchange();
        },this)
    },

    btnExchange: function () {
        if (this.data && this.data.award && this.data.award[0]) {
            var count = 0;
            if (this.data.sub_type == ActionConst.ActonExchangeType.Perday) {      //每日限兑
                count = this.data.sort || 0;
            } else if (this.data.sub_type == ActionConst.ActonExchangeType.AllServer) {   //全服限兑
            } else if (this.data.sub_type == ActionConst.ActonExchangeType.Activity) {    //活动限兑
                count = this.data.sort || 0;
            }
            if (count <= 1) {
                var tips_str = cc.js.formatStr(Utils.TI18N("是否消耗<color=#289b14><size=26>%s</></c>兑换物品？"), this.data.name_str);
                CommonAlert.show(tips_str, Utils.TI18N("确定"), function () {
                    if (this.data && this.data.charge_id) {
                        this.ctrl.sender16689(this.data.charge_id, 1);
                    }
                }.bind(this), Utils.TI18N("取消"), null, 2);
            } else {
                var buy_data = {};
                buy_data.bid = this.data.award[0][0];
                buy_data.item_bid = this.data.award[0][0];
                buy_data.num = this.data.award[0][1];
                buy_data.shop_type = MallConst.MallType.SteriousShop;
                buy_data.limit_num = count; //限购个数
                buy_data.has_buy = 0;
                buy_data.is_show_limit_label = true;
                var item_config = Utils.getItemConfig(this.data.award[0][0]);
                buy_data.name = item_config.name;
                buy_data.aim = this.data.charge_id || 0;
                buy_data.pay_type = 3;
                buy_data.price = 1;
                buy_data.quantity = 1;
                require("mall_controller").getInstance().openMallBuyWindow(true, buy_data);
            }
        }
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        var data = this.data;
        this.data.charge_id = data.id;
        this.txt_title_lb.string = data.title;
        this.txt_task_lb.string = cc.js.formatStr(Utils.TI18N("剩余:%s"), data.count);

        var show_type = 1;
        var cost_size = cc.size(100, 100);
        var get_size = cc.size(270, 100);
        if (Utils.getArrLen(data.expend) > 1) {
            show_type = 2;
            cost_size = cc.size(200, 100);
            get_size = cc.size(220, 100);
        }
        this.cost_good_cons.x = -279 + (show_type - 1) * 50;
        this.cost_item_scrollview.resetSize(cost_size);
        this.img_equal_nd.x = -176.5 + (show_type - 1) * 77;
        this.get_good_cons.x = 6 + (show_type - 1) * 50;
        // this.get_item_scrollview.resetSize(get_size);


        //加载礼包物品列表
        this.updateItemList(this.cost_item_scrollview, data.expend);
        // this.updateItemList(this.get_item_scrollview, data.award);
        var list = [];
        for (var k in data.award) {
            var v = data.award[k];
            var vo = {};
            vo.bid = v[0];
            vo.num = v[1];
            list.push(vo);
        }

        for (var i in list) {
            const v = list[i];
            if (!this.item_list[i]) {
                const item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 0.8, false, true);
                item.show();
                item.setParent(this.get_good_cons);
                item.setPosition(i * 100 - 80, 0);
                this.item_list[i] = item;
            }
            var item = this.item_list[i];
            item.setData({ bid: v.bid, num: v.num });
        }

        if (data.count == 0) {
            this.txt_exchange_lb.string = Utils.TI18N("不可兑换");
            this.txt_exchange_lb.node.color = this.color_1;
            Utils.setGreyButton(this.btn_exchange_btn);
        } else {
            this.txt_exchange_lb.string = Utils.TI18N("兑换");
            Utils.setGreyButton(this.btn_exchange_btn, false);
            this.txt_exchange_lb.node.color = this.color_2;
        }
    },

    updateItemList: function (parent, data_list) {
        //物品列表
        var list = [];
        for (var k in data_list) {
            var v = data_list[k];
            var vo = {};
            vo.bid = v[0];
            vo.num = v[1];
            list.push(vo);
        }
        parent.setData(list);
        parent.addEndCallBack(function () {
            var list = parent.getItemList();
            for (var k in list) {
                if (list[k])
                    list[k].setDefaultTip();
            }
        }.bind(this))

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.cost_item_scrollview) {
            this.cost_item_scrollview.deleteMe();
            this.cost_item_scrollview = null;
        }
        if(this.item_list){
            for(var k in this.item_list){
                var v = this.item_list[k];
                if(v){
                    v.deleteMe();
                    v = null;
                }
            }
            this.item_list = null;
        }
    },
})