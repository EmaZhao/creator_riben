// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-22 20:43:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");

var Month_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "week_month_panel_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        this.btn_charge_btn = this.seekChild("btn_charge", cc.Button);
        this.charge_price_lb = this.seekChild(this.btn_charge_btn.node, "Text_4_0", cc.Label);
        this.text_remain_lb = this.seekChild(this.main_container, "Text_4", cc.Label);

        var good_list = this.seekChild(this.main_container, "good_cons");
        var tab_size = good_list.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BackPackItem.Width * 0.8,               // 单元的尺寸width
            item_height: BackPackItem.Height * 0.8,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
            scale: 0.8
        }
        this.tab_scrollview = new CommonScrollView()
        this.tab_scrollview.createScroll(good_list, cc.v2(0, -10), ScrollViewDir.horizontal, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.btn_charge_btn.node.on("click", function () {
            Utils.playButtonSound(1);
            if (this.data.limit_count > 0) {
              let charge_config = Config.charge_data.data_charge_data[this.data.charge_id]
                SDK.pay(this.data.val, 1, this.data.charge_id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image);  
            } else {
                message(Utils.TI18N("该礼包已售罄"))
            }
        }, this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    addCallBack: function (value) {
        this.callback = value;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        var data = this.data;
        this.charge_price_lb.string = data.val + Utils.TI18N("");
        if (data.count <= 0) {
            data.count = 0;
            Utils.setGreyButton(this.btn_charge_btn, true);
            this.charge_price_lb.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
        } else {
            Utils.setGreyButton(this.btn_charge_btn, false);
            this.charge_price_lb.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
        }
        this.text_remain_lb.string = cc.js.formatStr(Utils.TI18N("残り:%s"), data.count);

        var list = [];
        for (var k in data.reward) {
            var v = data.reward[k];
            var vo = Utils.deepCopy(Utils.getItemConfig(v[0]));
            vo.quantity = v[1];
            vo.bid = vo.id;
            vo.num = v[1];
            list.push(vo);
        }
        this.tab_scrollview.setData(list);
        this.tab_scrollview.addEndCallBack(function () {
            var list = this.tab_scrollview.getItemList();
            for (var k in list) {
                list[k].setDefaultTip();
            }
        }.bind(this))
    },

    setExtendData: function (_type) {
        this.reward_type = _type || 1
    },

    getData: function () {
        return this.data
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.tab_scrollview) {
            this.tab_scrollview.deleteMe();
            this.tab_scrollview = null;
        }
    },
})