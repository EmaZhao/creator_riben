// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var MallController = require("mall_controller");
var MallConst = require("mall_const");
var BackpackController = require("backpack_controller")
var RoleController = require("role_controller")
var CommonAlert = require("commonalert")
var MallBuyWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mall", "mall_buy_panel");
        this.ctrl = MallController.getInstance();
        this.is_can_buy_max = false;
        this.win_type = WinType.Mini;
    },

    openCallBack: function () {
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.title_con = this.main_container.getChildByName("title_con");
        this.title_label = this.title_con.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("购买");

        this.ok_btn = this.main_container.getChildByName("ok_btn");
        this.ok_btn_label = this.ok_btn.getChildByName("Label").getComponent(cc.Label);
        this.ok_btn_label.string = Utils.TI18N("购买");

        this.cancel_btn = this.main_container.getChildByName("cancel_btn");
        this.cancel_btn_label = this.cancel_btn.getChildByName("Label").getComponent(cc.Label);
        this.cancel_btn_label.string = Utils.TI18N("取消");

        this.close_btn = this.main_container.getChildByName("close_btn");

        this.item_con = this.main_container.getChildByName("item_con");
        this.name = this.item_con.getChildByName("name").getComponent(cc.Label);
        this.coin = this.item_con.getChildByName("coin").getComponent(cc.Sprite);
        this.price = this.item_con.getChildByName("price").getComponent(cc.Label);
        this.limit = this.item_con.getChildByName("limit").getComponent(cc.Label);
        this.icon_bg_nd = this.seekChild(this.item_con, "Image_1");

        this.goods = this.main_container.getChildByName("goods");
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.goods_item.initConfig(false, 1, false, false)
        this.goods_item.setParent(this.goods);
        this.goods_item.show();

        this.info_con = this.main_container.getChildByName("info_con");
        this.slider = this.info_con.getChildByName("slider").getComponent(cc.Slider);
        this.progress = this.info_con.getChildByName("ProgressBar").getComponent(cc.ProgressBar);
        // this.buy_count_title = this.info_con.getChildByName("buy_count_title").getComponent(cc.Label);
        // this.buy_count_title.string = Utils.TI18N("购买数量：");
        this.plus_btn = this.info_con.getChildByName("plus_btn");
        this.buy_count = this.info_con.getChildByName("buy_count").getComponent(cc.Label);
        this.num = 1;
        this.buy_count.string = this.num;
        this.min_btn = this.info_con.getChildByName("min_btn");
        this.max_btn = this.info_con.getChildByName("max_btn");

        this.total_price_title_lb = this.seekChild(this.info_con, "total_price_title", cc.Label);
        this.total_price = this.info_con.getChildByName("total_price").getComponent(cc.Label);

        this.buy_desc_lb = this.seekChild("buy_desc", cc.Label);
        this.tips_label = this.seekChild("tips_label");
        this.setData(this.data);
    },

    registerEvent: function () {
        if (this.slider) {
            this.slider.node.on("slide", function () {
                // if (this.slider.progress == 1 && this.is_can_buy_num >= this.limit_num && this.is_can_buy_max == false)
                //     this.tips_label.active = true;
                // else
                //     this.tips_label.active = false;
                this.setCurUseItemInfoByPercent(this.slider.progress);
                this.progress.progress = this.slider.progress;
            }, this)
        }
        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openMallBuyWindow(false);
            }, this)
        }
        if (this.background) {
            this.background.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openMallBuyWindow(false);
            }, this)
        }
        if (this.min_btn) {
            this.min_btn.on(cc.Node.EventType.TOUCH_END, function () {
                var percent = this.slider.progress;
                if (percent == 0)
                    return
                if (this.num == 0)
                    return
                this.num = this.num - 1;
                this.setCurUseItemInfoByNum(this.num);
            }, this)
        }
        if (this.plus_btn) {
            this.plus_btn.on(cc.Node.EventType.TOUCH_END, function () {
                var percent = this.slider.progress;
                if (percent == 1)
                    return
                if (this.num >= (this.limit_num - this.data.has_buy))
                    return
                this.num = this.num + 1;
                this.setCurUseItemInfoByNum(this.num);
            }, this)
        }
        if (this.max_btn) {
            this.max_btn.on(cc.Node.EventType.TOUCH_END, function () {
                var percent = this.slider.progress;
                if (percent == 1)
                    return
                if (this.num >= (this.limit_num - this.data.has_buy))
                    return
                this.num = this.limit_num - this.data.has_buy;
                this.setCurUseItemInfoByNum(this.num);
            }, this)
        }
        if (this.ok_btn) {
            this.ok_btn.on(cc.Node.EventType.TOUCH_END, function () {
                if (this.data) {
                    this.ctrl.openMallBuyWindow(false);
                    if(this.num<=0){
                      message(Utils.TI18N("購入回数が無効です"));
                      return       
                    }
                    if (this.data.shop_type == 2) { //神格特殊处理
                        this.showAlert(this.data);
                    } else if (this.data.shop_type == MallConst.MallType.ActionShop) { //活动购买
                        this.ctrl.send16661(this.data.bid, this.data.aim, this.num);
                    }  else if (this.data.shop_type == MallConst.MallType.SteriousShop){
                        require("action_controller").getInstance().sender16689(this.data.aim,this.num);
                    }
                     else {
                        if (this.data.shop_type != 4 && this.data.shop_type != 2 && this.data.shop_type != 15) {
                            if (this.data.shop_type == 16) {
                                this.ctrl.sender13407(this.data.order, this.data.shop_type, 1);
                            } else if (this.data.shop_type == MallConst.MallType.SkillShop) {
                                this.showGoldAlert(this.data)
                            } else {
                                this.ctrl.sender13402(this.data.id, this.num);
                            }
                        } else {
                            this.ctrl.sender13407(this.data.order, this.data.shop_type, 1);
                        }
                    }
                }
            }, this)
        }

        if (this.cancel_btn) {
            this.cancel_btn.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openMallBuyWindow(false);
            }, this)
        }
    },


    //data结构:
    //data.item_bid data.item_id   道具id
    //data.name = 道具名字  如果没有 用道具id原本名字
    //data.limit_num  //购买上限
    //data.discount or data.price //购买价格
    //data.pay_type 支付类型 道具id
    setData: function (data) {
        this.data = data;
        if (this.root_wnd == null)
            return
        var config = Utils.getItemConfig(data.item_bid || data.item_id);
        config.bid = data.item_bid || data.item_id
        config = Utils.deepCopy(config)
        if (data.item_num && data.item_num != 1) {
            config.num = data.item_num;
        }
        if (data.shop_type == MallConst.MallType.FestivalAction) {
            this.goods_item.setData(data.item_bid, data.quantity || data.num);
            this.num = data.limit_num - data.has_buy;
            this.buy_desc_lb.string = Utils.TI18N("活跃值购买后仅增加该活动总活跃值");
        } else if (data.shop_type == MallConst.MallType.SuitShop) {
            this.goods_item.setData(data.item_bid);
        } else if (data.shop_type == MallConst.MallType.SteriousShop) {
            this.goods_item.setData({bid:data.item_bid,num:data.num});
            this.total_price.node.x = -1000;
            this.total_price_title_lb.node.x = -1111;
            this.ok_btn_label.string = Utils.TI18N("兑换");
            this.title_label.string = Utils.TI18N("兑换");
            this.icon_bg_nd.x = -1000;
            this.price.node.active = false;
            this.coin.node.active = false;
            this.limit.node.x = -61;
        } else {
            this.goods_item.setData(config);

        }

        if (data.name != null) {
            this.name.string = data.name;
        } else {
            this.name.string = config.name;
        }
        this.limit_num = this.data.limit_num;
        if (data.discount != null && this.data.discount > 0) {
            this.price.string = data.discount;
            this.price_val = data.discount;
        } else {
            this.price.string = data.price;
            this.price_val = data.price;
        }

        if (data.shop_type == MallConst.MallType.ActionShop)
            this.is_can_buy_num = this.ctrl.getModel().checkActionMoenyByType(data.pay_type, this.price_val);
        else
            this.is_can_buy_num = this.ctrl.getModel().checkMoenyByType(data.pay_type, this.price_val);

        var pay_config;
        if (typeof (data.pay_type) == "number")
            pay_config = Utils.getItemConfig(data.pay_type);
        else
            pay_config = Utils.getItemConfig(gdata("item_data", "data_assets_label2id", [data.pay_type]));

        var item_res_path = PathTool.getItemRes(pay_config.icon)
        if (item_res_path) {
            this.loadRes(item_res_path, function (res_object) {
                this.coin.spriteFrame = res_object;
            }.bind(this))
        }

        if (this.limit_num > 0 && data.is_show_limit_label && data.has_buy != null) {
            this.limit.string = cc.js.formatStr("限定%s個", this.limit_num - data.has_buy);
            this.is_can_buy_max = true;
        } else {
            this.limit.string = "";
            if (data.shop_type != MallConst.MallType.Recovery) {
                if (this.is_can_buy_num < this.limit_num) {
                    this.limit_num = this.is_can_buy_num;
                    // this.tips_label.active = false;
                    this.is_can_buy_max = false;
                }
            }
        }

        this.setCurUseItemInfoByNum(this.num);
    },

    setCurUseItemInfoByNum: function (num) {
        this.num = num;
        var percent = this.num / (this.limit_num - this.data.has_buy);
        this.slider.progress = percent;
        this.progress.progress = this.slider.progress;
        this.buy_count.string = this.num;
        this.total_price.string = this.num * this.price_val;
    },

    setCurUseItemInfoByPercent: function (percent) {
        this.num = Math.floor(percent * (this.limit_num - this.data.has_buy));
        this.buy_count.string = this.num;
        this.total_price.string = this.num * this.price_val;
    },

    showAlert: function (data) {
        if (!data)
            return
        this.ctrl.sender13407(data.order, data.shop_type, 1, data);
    },

    openRootWnd: function (type) {
    },
    // --处理技能商城的购买
    showGoldAlert(data) {
        if (!data) return;
        // --非钻石购买
        if (data.pay_type != 3) {
            this.ctrl.sender13407(data.order, data.shop_type, 1)
        } else {
            let cost = data.price
            if (data.discount != 0) {
                cost = data.discount
            }
            let role_vo = RoleController.getInstance().getRoleVo()
            if (!role_vo) return;
            let cur_gold = role_vo.getTotalGold()

            if (cur_gold >= cost) {
                let item_cfg = Utils.getItemConfig(data.item_id)
                let good_res_path = "3";
                let text = Utils.TI18N("是否使用<img src='%s' /><color=#289b14>%s</color>购买<color=#289b14>%s</color>？");
                let frame_arrays = [];
                let good_path = PathTool.getIconPath("item", "3");
                frame_arrays.push(good_path);
                let tips_str = cc.js.formatStr(text, good_res_path, cost, item_cfg.name)
                CommonAlert.show(tips_str, Utils.TI18N("确定"), function () {
                    this.ctrl.sender13407(data.order, data.shop_type, 1)
                }.bind(this), Utils.TI18N("取消"), null, null, null, { resArr: frame_arrays })
            } else {
                // --钻石不足
                let config = Utils.getItemConfig(data.pay_type)
                if (config) {
                    BackpackController.getInstance().openTipsSource(true, config)
                }
            }
        }
    },
    closeCallBack: function () {
        if (this.goods_item)
            this.goods_item.deleteMe();
        this.goods_item = null;
        this.ctrl.openMallBuyWindow(false);
    },

});

module.exports = MallBuyWindow;