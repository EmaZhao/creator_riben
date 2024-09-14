// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-02 11:36:56
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var VipController = require("vip_controller");
var RoleController = require("role_controller");

var Daily_gift_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "daily_gift_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = VipController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.limit_num = 0;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container_nd = this.seekChild("container");
        this.image_bg_sp = this.seekChild("image_bg", cc.Sprite);
        this.title_txt_lb = this.seekChild("title_txt", cc.Label);
        this.buy_btn = this.seekChild("buy_btn", cc.Button);
        this.sprite_nd = this.buy_btn.node.getChildByName("sprite");
        this.buy_btn_lb = this.seekChild(this.buy_btn.node, "Label", cc.Label);
        this.gift_desc_rt = this.seekChild("gift_desc_txt", cc.RichText);

        this.left_num_lb = this.seekChild("left_num", cc.Label);

        var good_list_nd = this.seekChild("good_list");
        var tab_size = good_list_nd.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 25,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BackPackItem.Width * 0.7,               // 单元的尺寸width
            item_height: BackPackItem.Width * 0.7,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
            scale: 0.7
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(good_list_nd, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.buy_btn.node, function () {
            if (this.limit_num > 0) {
                this._onClickBuyBtn();
            }
        }.bind(this), 1)
    },

    //点击购买
    _onClickBuyBtn: function () {
        if (this.gift_config) {
            var limit_vip = this.gift_config.limit_vip;
            if (this.role_vo.vip_lev >= limit_vip) {
                var charge_id = this.gift_config.charge_id;
                var charge_config = gdata("charge_data", "data_charge_data", [charge_id || 0]);
                if (charge_config) {
                    SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image)
                }
            } else {
                message(cc.js.formatStr(Utils.TI18N("VIP%d可购买"), limit_vip));
            }
        }
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        this.gift_config = this.data;
        var data = this.data;
        var gift_bid = data.id;
        var buy_count = this.model.getDailyGiftBuyCountById(gift_bid);
        var gift_res = PathTool.getBigBg(this.gift_config.bg_res);
        this.loadRes(gift_res, function (sf_obj) {
            this.image_bg_sp.spriteFrame = sf_obj;
        }.bind(this))

        this.title_txt_lb.string = this.gift_config.name || "";

        if (this.gift_config.limit_count <= buy_count) {
            this.sprite_nd.active = false;
            Utils.setGreyButton(this.buy_btn, true)
            this.buy_btn_lb.string = Utils.TI18N("今日已购");
            this.buy_btn_lb.node.color = new cc.Color(255, 255, 255);
        } else {
            this.sprite_nd.active = true;
            Utils.setGreyButton(this.buy_btn, false)
            this.buy_btn_lb.string = cc.js.formatStr(Utils.TI18N("%d"), this.gift_config.val || 0);
            this.buy_btn_lb.node.color = new cc.Color(255, 255, 255);
        }

        this.left_num_lb.string = cc.js.formatStr(Utils.TI18N("限定:%d回"), this.gift_config.limit_count - buy_count);
        this.limit_num = this.gift_config.limit_count - buy_count

        //描述内容
        var desc = StringUtil.parse(this.gift_config.desc)
        var res_str = cc.js.formatStr("<img src='%s' /></img>", 3)
        var str_ = cc.js.formatStr(desc, res_str, res_str);
        this.gift_desc_rt.string = str_

        this.loadRes(PathTool.getItemRes(3), (function (resObject) {
            this.gift_desc_rt.addSpriteFrame(resObject);
        }).bind(this));

        //奖励物品
        var gift_award_cfg = gdata("charge_data", "data_daily_gift_award", [gift_bid]);
        if (gift_award_cfg) {
            var award_data = {};
            for (var k in gift_award_cfg) {
                var v = gift_award_cfg[k];
                if (v.min <= this.role_vo.lev && v.max >= this.role_vo.lev) {
                    award_data = Utils.deepCopy(v.reward);
                    break
                }
            }
            var item_list = [];
            for (var k in award_data) {
                var v = award_data[k];
                var vo = Utils.deepCopy(Utils.getItemConfig(v[0]));
                if (vo) {
                    vo.num = v[1];
                    vo.bid = v[0];
                    vo.quantity = v[1];
                    item_list.push(vo);
                }
            }
            let is_show_double = false
            if (this.gift_config && this.gift_config.is_double && this.gift_config.is_double == 1) {
                is_show_double = true
            }
            this.item_scrollview.setData(item_list);
            this.item_scrollview.addEndCallBack(function () {
                var list = this.item_scrollview.getItemList();
                for (var k = 0; k < list.length; ++k) {
                    if (is_show_double) {
                        //显示双倍
                        let item_cfg = list[k].getData()
                        if (item_cfg && item_cfg.id == 3) {
                            list[k].setDoubleIcon(true)
                        } else {
                            list[k].setDoubleIcon(false)
                        }
                    }
                    if (list[k]) {
                        list[k].setDefaultTip();
                    }
                }
            }.bind(this))
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }

    },
})