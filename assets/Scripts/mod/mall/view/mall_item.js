// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      竖版商城列表子项
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var MallController = require("mall_controller");
var MallEvent = require("mall_event");
var RoleController = require("role_controller");
var BackpackController = require("backpack_controller");

var MallItem = cc.Class({
    extends: BasePanel,

    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("mall", "mall_item");
        this.ctrl = MallController.getInstance();
        this.size = cc.size(306, 143);
        this.width = 306;
        this.height = 143;
        this.vo = null;
        this.data = null;
        this.is_touch = true;
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    initPanel: function() {
        this.main_container = this.root_wnd.getChildByName("main_container");

        this.name = this.main_container.getChildByName("name").getComponent(cc.Label);
        this.coin = this.main_container.getChildByName("count_bg").getChildByName("coin").getComponent(cc.Sprite);
        this.price = this.main_container.getChildByName("count_bg").getChildByName("price").getComponent(cc.Label);

        this.good = this.main_container.getChildByName("good");
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.goods_item.initConfig(false, 1, false, true)
            // this.goods_item.setPosition(10 + BackPackItem.Width / 2, this.root_wnd.getContentSize().height / 2)
        this.goods_item.setParent(this.good);
        this.goods_item.show();

        this.discount = this.main_container.getChildByName("discount");
        this.discount_num = this.discount.getChildByName("discount_num").getComponent(cc.Label);
        this.discount.active = false;
        this.discount_label = this.main_container.getChildByName("discount_label").getComponent(cc.RichText);

        this.sold = this.main_container.getChildByName("sold");
        this.sold.active = false;

        this.grey = this.main_container.getChildByName("grey");
        this.grey.active = false;

        this.need_icon = this.main_container.getChildByName("need_icon");
        this.need_label = this.main_container.getChildByName("need_label").getComponent(cc.Label);
        this.need_icon.active = false;
        this.need_label.node.active = false;

        this.setSellAll(false);
        this.setData(this.data);
    },

    registerEvent: function() {
        this.main_container.on(cc.Node.EventType.TOUCH_END, function() {
            if (!this.is_touch)
                return
            if (this.vip_limit_flag > 0) {
                message(cc.js.formatStr(Utils.TI18N("VIP%s以上可购买"), this.vip_limit_flag));
                return
            }
            if (this.rank_limit_flag) {
                message(Utils.TI18N("未满足购买条件"));
                return
            }
            if (this.limit_glev_status) {
                message(Utils.TI18N("该商品暂未达解锁条件哦，请努力提高公会等级"));
                return
            }
            if (this.callback)
                this.callback(this.data);
        }, this)

        //除神秘商城以外的购买成功
        this.addGlobalEvent(MallEvent.Buy_Success_Event, function(data) {
            if (this.data.id && data.eid == this.data.id && Utils.next(data.ext || {}) != null) {
                this.data.has_buy = data.ext[0].val;
                this.discount_label.string = cc.js.formatStr(Utils.TI18N("<color=#f7d85e>%s <color=#37ff58>%s/%s</color>个</color>"), this.str, this.data.has_buy, this.data.limit_num);
                if (this.data.has_buy == this.data.limit_num)
                    this.setSellAll(true);
            }
        }.bind(this))

        //神秘/神格商城购买成功
        this.addGlobalEvent(MallEvent.Buy_One_Success, function(data) {
            if (this.data.order && data.order == this.data.order) {
                this.data.has_buy = this.data.has_buy + 1;
                this.discount_label.string = cc.js.formatStr(Utils.TI18N("<color=#f7d85e>%s <color=#37ff58>%s/%s</color>个</color>"), this.str, this.data.has_buy, this.data.limit_num);
                var limit_num = this.data.limit_count || this.data.limit_num;
                if (limit_num != null || this.data.has_buy >= this.data.limit_num)
                    this.setSellAll(true);
            }
        }.bind(this))

        if (this.role_vo) {
            if (this.role_update_event == null) {
                this.role_update_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value) {
                    if (key == "gold" || key == "red_gold" || key == "hero_soul" || key == "arena_cent" || key == "friend_point" || key == "guild") {
                        if (this.data["limit_day"] == 0 && this.data["limit_month"] == 0 && this.data["limit_week"] == 0 && this.data["limit_count"] == 0) {
                            //不限购的非神秘神格商店物品
                            if (this.data.shop_type != 4 && this.data.shop_type != 2) {
                                if (this.pay_type != "red_gold_or_gold") {
                                    if (this.role_vo[this.pay_type] && BackpackController.getInstance().getModel().getRoleAssetByAssetKey(this.pay_type)< (20 * this.data.price)) {
                                        var temp = Math.floor(BackpackController.getInstance().getModel().getRoleAssetByAssetKey(this.pay_type) / this.data.price);
                                        if (temp >= 1) {
                                            this.data.limit_num = temp;
                                        } else {
                                            this.data.limit_num = 1
                                        }
                                    } else {
                                        this.data.limit_num = 20;
                                    }
                                } else {
                                    var own = this.role_vo.getTotalGold() + this.role_vo["red_gold"];
                                    if (own && own < (20 * this.data.price)) {
                                        var temp = Math.floor(own / this.data.price);
                                        if (temp >= 1) {
                                            this.data.limit_num = temp;
                                        } else {
                                            this.data.limit_num = 1;
                                        }
                                    } else {
                                        this.data.limit_num = 20;
                                    }
                                }
                            }
                        }
                    }
                    if (key == "vip_lev") {
                        if (this.vip_limit_flag > 0) {
                            this.setData(this.data);
                        }
                    }
                }, this)
            }
        }
    },

    setData: function(data) {
        this.data = data;
        if (this.root_wnd == null)
            return
            // return
        var shop_num = null; //商品类型
        if (data.shop_type != null)
            shop_num = data.shop_type;
        else
            shop_num = data.type;

        this.data = Utils.deepCopy(data);
        var config = Utils.getItemConfig(data.item_bid || data.item_id);
        config = Utils.deepCopy(config)
        var pay_config, pay_type;
        config.bid = data.item_bid || data.item_id;
        if (config) {
            if (data.item_num && data.item_num != 1) {
                config.num = data.item_num;
            }
            this.goods_item.setData(config);
            this.name.string = config.name;
        }
        // this.goods_item.setDefaultTips();
        if (typeof(data.pay_type) == "number") {
            pay_config = Utils.getItemConfig(data.pay_type);
            pay_type = gdata("item_data", "data_assets_id2label", [data.pay_type]);
        } else {
            pay_config = Utils.getItemConfig(gdata("item_data", "data_assets_label2id", [data.pay_type]));
            pay_type = data.pay_type;
        }
        this.pay_type = pay_type;
        this.price.string = data.price;
        var item_res_path = PathTool.getItemRes(pay_config.icon)
        if (item_res_path) {
            this.loadRes(item_res_path, function(res_object) {
                this.coin.spriteFrame = res_object;
            }.bind(this))
        }


        //限购
        this.str = "";
        var limit_num = 0;
        var limit_rank = 0;
        var limit_vip = 0;
        var is_show_limit_label = false;

        //天梯排名限购
        this.rank_limit_flag = false;
        if (data.limit_rank && data.limit_rank > 0) {
            if (shop_num == MallConst.MallType.Ladder) {
                var ladder_data = LadderController.getInstance().getModel().getLadderMyBaseInfo();
                if (ladder_data && ladder_data.best_rank == 0 || ladder_data.best_rank > data.limit_rank) {
                    limit_rank = data.limit_rank;
                    is_show_limit_label = true
                }
            }
        }

        //vip等级限购
        this.vip_limit_flag = 0;
        if (data.limit_vip && data.limit_vip > 0) {
            if (this.role_vo && this.role_vo.vip_lev < data.limit_vip) {
                is_show_limit_label = true;
                limit_vip = data.limit_vip;
            }
        }

        if (is_show_limit_label == false) {
            if (data.limit_count != null && data.limit_count > 0) {
                this.str = Utils.TI18N("限购");
                limit_num = data.limit_count;
                is_show_limit_label = true;
            } else if (data.limit_month != null && data.limit_month > 0) {
                this.str = Utils.TI18N("每月限购");
                limit_num = data.limit_month;
                is_show_limit_label = true;
            } else if (data.limit_week != null && data.limit_week > 0) {
                this.str = Utils.TI18N("每周限购");
                limit_num = data.limit_week;
                is_show_limit_label = true;
            } else if (data.limit_day != null && data.limit_day > 0) {
                this.str = Utils.TI18N("每日限购");
                limit_num = data.limit_day;
                is_show_limit_label = true;
            } else {
                if (data.shop_type == 4 || data.shop_type == 2) {
                    limit_num = 1;
                    is_show_limit_label = true;
                } else {
                    if (pay_type != "red_gold_or_gold") {
                        if (this.role_vo[pay_type] && BackpackController.getInstance().getModel().getRoleAssetByAssetKey(pay_type) < (20 * data.price)) { //取资产最大可买
                            var temp = Math.floor(BackpackController.getInstance().getModel().getRoleAssetByAssetKey(pay_type) / data.price);
                            if (temp >= 1)
                                limit_num = temp;
                            else
                                limit_num = 1;
                        } else {
                            limit_num = 20; //无限制购买的物品 一次购买上限20
                            is_show_limit_label = false;
                        }
                    } else {
                        var own = this.role_vo.getTotalGold() + this.role_vo.red_gold;
                        if (own != null && own < (20 * data.price)) {
                            var temp = Math.floor(own / data.price)
                            if (temp >= 1)
                                limit_num = temp;
                            else
                                limit_num = 1;
                        } else {
                            limit_num = 20; //无限制购买的物品 一次购买上限20
                            is_show_limit_label = false;
                        }
                    }
                }
            }
        }

        if (limit_vip > 0 && is_show_limit_label) {
            this.discount_label.node.active = true;
            this.discount_label.string = cc.js.formatStr(Utils.TI18N("<color=#f7d85e><color=#37ff58>      VIP%d</color>专属</color>"), limit_vip)
            this.setSellAll(false);
            this.vip_limit_flag = limit_vip;
        } else if (limit_num > 0 && is_show_limit_label) {
            this.discount_label.node.active = true;
            this.discount_label.string = cc.js.formatStr(Utils.TI18N("<color=#f7d85e>%s <color=#37ff58>%s/%s</color>个</color>"), this.str, data.has_buy, limit_num);
            if (data.has_buy == limit_num)
                this.setSellAll(true)
            else
                this.setSellAll(false)
        } else if (limit_rank > 0 && is_show_limit_label) {
            this.discount_label.node.active = true;
            this.discount_label.string = cc.js.formatStr(Utils.TI18N("<color=#f7d85e><color=#ff1f0e>需达到%s名</color></color>"), limit_rank);
            this.setSellAll(false);
            this.rank_limit_flag = true;
        } else {
            this.discount_label.node.active = false;
            if (data.has_buy == 1)
                this.setSellAll(true);
            else
                this.setSellAll(false);
        }

        this.data.limit_num = limit_num;
        this.data.is_show_limit_label = is_show_limit_label;

        //折扣标签和折扣价格
        if (data.label != null && data.label > 0) { //表里的
            this.discount.active = true;
            this.discount_num.string = data.label + Utils.TI18N("折");
        } else if (data.discount_type != null && data.discount_type > 0) { //服务器信息
            this.discount.active = true;
            this.discount_num.string = data.discount_type + Utils.TI18N("折");
        } else if (data.lable != null && data.lable > 0) {
            this.discount.active = true;
            this.discount_num.string = Utils.TI18N("超值");
        } else {
            this.discount.active = false;
        }

        if (data.discount != null && data.discount > 0) {
            this.price.string = data.discount;
        }

        if (this.data.type == 10 || this.data.type == 11 || this.data.type == 12 || this.data.type == 13) { //装备特殊处理显示等级显示
            this.isShowLevLimit(true, this.data.lev);
        } else {
            this.isShowLevLimit(false);
        }

        if (this.data.type == 5 && this.data.glev != null) {
            this.isShowGLevLimit(true, this.data.glev);
        } else {
            this.isShowGLevLimit(false, 0);
        }

        var bid = this.ctrl.getNeedBid();
        if (bid != null && (bid == data.item_id || bid == data.item_bid)) {
            this.need_icon.active = true;
            this.need_label.node.active = true;
        } else {
            this.need_icon.active = false;
            this.need_label.node.active = false;
        }

        if (this.data.type == 3) {
            var is_show = this.ctrl.getModel().checkHeroChips(data.item_id);
            this.showChipTag(is_show);
        } else {
            this.showChipTag(false);
        }
    },

    setSellAll: function(bool) {
        if (this.root_wnd == null) return
        this.sold.active = bool;
        this.grey.active = bool;
        this.is_touch = !bool;
    },

    showChipTag: function(status) {

    },

    isShowLevLimit: function(status, lev) {
        if (!this.limit_lev_label) {

        }
    },

    isShowGLevLimit: function(status, lev) {

    },

    addCallBack: function(value) {
        this.callback = value;
    },

    onShow: function() {

    },

    onDelete: function() {
        if (this.role_update_event) {
            if (this.role_vo) {
                this.role_vo.unbind(this.role_update_event);
                this.role_update_event = null;
                this.role_vo = null;
            }
        }
        if (this.goods_item) {
            this.goods_item.deleteMe();
            this.goods_item = null;
        }
        // if(this.main_container){
        //     this.main_container.off(cc.Node.EventType.TOUCH_END,function(){},this)
        // }

    }


});

module.exports = MallItem;