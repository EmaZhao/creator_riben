// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      抢红包
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RedbagController = require("redbag_controller");
var RedbagEvent = require("redbag_event");
var RedBagItem = require("redbag_item");
var RedBagListPanel = require("redbag_list_panel");
var BackpackController = require("backpack_controller");
var BackPackConst = require("backpack_const");

var RedBagGetPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_send");
        this.ctrl = RedbagController.getInstance();
        this.size = cc.v2(644, 740);

        this.is_can_save = false;
        this.item_list = {};
        this.need_list = {};
        this.default_msg = Utils.TI18N("身为土豪，有钱任性");
        this.is_send_proto = false;
        this.use_assert = 0; //使用道具还是资产法红包
        this.msg_list = {};
        this.extend_id = arguments[0] || this.ctrl.getModel().getHaveItemID() || 1;
        this.select_msg = null;
    },

    initPanel: function () {
        // this.background = this.seekChild("background");
        this.main_panel = this.seekChild("main_panel");
        this.top_panel = this.seekChild(this.main_panel, "top_panel");
        this.bottom_panel = this.seekChild(this.main_panel, "bottom_panel");
        this.bottom_panel.getChildByName("Image_1").active = false;
        this.bottom_panel.getChildByName("send_msg").active = false;
         this.bottom_panel.getChildByName("send_content").active = false;
        this.num_panel = this.seekChild(this.bottom_panel, "num_panel");
        this.send_btn = this.seekChild(this.bottom_panel, "send_btn");
        this.send_sprite = this.send_btn.getChildByName("sprite");
        this.send_btn_red_point = this.seekChild(this.send_btn, "red_point");
        this.send_btn_red_point.active = false;
        this.btn_label = this.seekChild(this.send_btn, "label", cc.RichText);
        this.send_tips_lb = this.seekChild("send_tips", cc.Label);

        this.left_btn = this.seekChild(this.top_panel, "left_btn");
        this.right_btn = this.seekChild(this.top_panel, "right_btn");
        this.right_btn_red_point = this.seekChild(this.right_btn, "red_point");
        this.right_btn_red_point.active = false;

        this.left_btn_red_point = this.seekChild(this.left_btn, "red_point");
        this.left_btn_red_point.active = false;

        this.item_container = this.seekChild(this.bottom_panel, "item_container");
        this.num_label = this.seekChild(this.bottom_panel, "num_label", cc.Label);

        this.send_content = this.seekChild(this.bottom_panel, "send_content", cc.Label);


        Utils.getNodeCompByPath("main_panel/bottom_panel/num_desc", this.root_wnd, cc.Label).string = Utils.TI18N("个数:");
        Utils.getNodeCompByPath("main_panel/bottom_panel/send_value", this.root_wnd, cc.Label).string = Utils.TI18N("红包金额:");
        Utils.getNodeCompByPath("main_panel/bottom_panel/send_msg", this.root_wnd, cc.Label).string = Utils.TI18N("红包寄语:");
        Utils.getNodeCompByPath("main_panel/bottom_panel/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("红包信息");
        Utils.getNodeCompByPath("main_panel/bottom_panel/title", this.root_wnd, cc.Label).string = Utils.TI18N("发放者奖励:");

        this.createDesc();
        this.requireProto();
    },


    createDesc: function () {
        this.send_notice = this.seekChild(this.top_panel, "send_notice", cc.RichText);
        this.send_notice.string = cc.js.formatStr(Utils.TI18N("(今日还可发<color=#249003>%s</c>)"), 100)

        //红包金额
        this.coin_label = this.seekChild(this.bottom_panel, "coin_label", cc.RichText);
        this.coin_img = this.seekChild(this.bottom_panel, "coin_img", cc.Sprite);

        this.updateBagList();
    },

    requireProto: function () {
        this.ctrl.send13546();
    },

    registerEvent: function () {
        this.send_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.red_send_info == null || this.select_vo == null) return
            if (this.cost_item_bid && this.cost_item_bid != 0) {
                this.ctrl.sender13535(this.select_vo.id, 1);
            } else {
                var charge_config = gdata("charge_data", "data_charge_data", [this.select_vo.charge_id]);
                if (charge_config) {
                    SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image);
                }
            }
        }.bind(this))

        this.left_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.list_view) {
                this.list_view.runLeftPostion();
            }
        }.bind(this))
        this.right_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.list_view) {
                this.list_view.runRightPostion();
            }
        }.bind(this))

        this.addGlobalEvent(RedbagEvent.Update_Red_Bag_Event, function (data) {
            this.updateRedInfo(data);
        }.bind(this))

        //道具数量更新
        this.addGlobalEvent(EventId.ADD_GOODS, function (bag_code, data_list) {
            this.updateItemNum(bag_code, data_list);
        }.bind(this))
        this.addGlobalEvent(EventId.DELETE_GOODS, function (bag_code, data_list) {
            this.updateItemNum(bag_code, data_list);
        }.bind(this))
        this.addGlobalEvent(EventId.MODIFY_GOODS_NUM, function (bag_code, data_list) {
            this.updateItemNum(bag_code, data_list);
        }.bind(this))
    },

    openRootWnd: function () {

    },

    updateBagList: function () {
        if (this.list_view == null) {
            var list_size = cc.size(580, 370);
            var setting = {
                item_class: RedBagItem,      // 单元类
                start_x: 0,                    // 第一个单元的X起点
                space_x: 0,                    // x方向的间隔
                start_y: 2,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 262,               // 单元的尺寸width
                item_height: 327,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 1,                        // 列数，作用于垂直滚动类型
            }
            this.list_view = new RedBagListPanel()
            this.list_view.createScroll(this.top_panel, cc.v2(270, 20), ScrollViewDir.horizontal, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
        }

        var config = Config.guild_data.data_guild_red_bag;
        var list = [];
        var index = 0;
        for (var i in config) {
            var v = config[i];
            list[index] = { data: v, open_type: 1 };
            index = index + 1;
        }
        for (var i in list) {
            var v = list[i];
            v.sort_index = 1;
            if (v.data.id == this.extend_id)
                v.sort_index = 0;
        }
        list.sort(Utils.tableLowerSorter(["sort_index", "id"]));
        this.list_view.setData(list);
        this.list_view.addEndCallBack(function () {
            this.updateMessage();
        }.bind(this))

        this.list_view.setData(list);

    },

    updateMessage: function () {
        var item = this.list_view.getSelectItem();
        var vo = null;
        if (item) {
            vo = item.getData();
        }
        if (item == null) return
        if (this.select_vo && this.select_vo == vo) return
        this.select_vo = vo;
        if (!this.select_vo) return
        var data = this.select_vo;
        //红包金额
        var coint = data.assets;
        var item_id = gdata("item_data", "data_assets_label2id", [coint]);
        var item_config = Utils.getItemConfig(item_id);
        if (item_config) {
            this.coin_label.string = String(data.val);
            var res = PathTool.getItemRes(item_config.icon);
            this.loadRes(res, function (res_object) {
                this.coin_img.spriteFrame = res_object;
            }.bind(this))
        }
        this.send_content.string = data.msg;
        this.num_label.string = data.num;
        this.fileRewardsItem(data.reward);
        this.showRedSendNum();
    },

    fileRewardsItem: function (list) {
        if (list == null || Utils.next(list) == null) return
        for (var k in this.item_list) {
            var v = this.item_list[k];
            v.setVisible(false);
        }

        var scale = 0.7;
        var off = 10;
        for (var i in list) {
            var v = list[i];
            if (this.item_list[i] == null) {
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, scale, false, false)
                item.show();
                var x = 20 + (120 * scale + off) * (i - 1) + 120 * scale * 0.5 - 388 / 2 + 60 * scale;
                item.setPosition(x, 50);
                item.setParent(this.item_container);
                this.item_list[i] = item;
            }
            var item = this.item_list[i];
            item.setData({ bid: v[0], num: v[1] });
            item.setVisible(true);
        }
    },

    //设置红包可发次数
    updateRedInfo: function (data) {
        this.red_send_info = data;
        this.showRedSendNum();
    },

    updateItemNum: function (bag_code, data_list) {
        if (this.cost_item_bid) {
            if (bag_code != null && data_list != null) {
                if (bag_code == BackPackConst.Bag_Code.BACKPACK) {
                    for (let i in data_list) {
                        let v = data_list[i];
                        if (v && v.base_id != null && this.cost_item_bid == v.base_id) {
                            this.showRedSendNum();
                            break
                        }
                    }
                }
            }
        }
    },

    showRedSendNum: function () {
        if (this.red_send_info == null || this.select_vo == null) return
        let red_config = Config.guild_data.data_guild_red_bag[this.select_vo.id];
        if (!red_config) return

        this.cost_item_bid = 0;     //可以消耗道具发红包的道具bid
        this.send_tips_lb.node.active = false;

        var send_num = 0;
        for (var i in this.red_send_info) {
            var v = this.red_send_info[i];
            if (v.id == this.select_vo.id) {
                send_num = v.num;
                break;
            }
        }
        send_num = this.select_vo.limit - send_num;
        if (send_num < 0) {
            send_num = 0;
        }
        this.send_notice.string = cc.js.formatStr(Utils.TI18N("(今日还可发<color=#249003>%s</c>)"), send_num);
        if (send_num == 0) {
            this.btn_label.string = Utils.TI18N("次数已达上限");
            this.send_sprite.active = false;
        } else {
            var charge_config = gdata("charge_data", "data_charge_data", [this.select_vo.charge_id]);
            if (this.checkLossItemIsEnough(red_config.loss_item)) {
                let bid = red_config.loss_item[0][0];
                let num = red_config.loss_item[0][1];
                let item_cfg = Utils.getItemConfig(bid);
                if (item_cfg) {
                    this.cost_item_bid = bid;
                    let res = PathTool.getItemRes(item_cfg.icon)
                    this.btn_label.string = cc.js.formatStr(Utils.TI18N("<img src='%s'/><outline width=2 color=#6C2B00>%s 发红包</outline>"), item_cfg.icon, num);
                    this.loadRes(res, (function (resObject) {
                        this.btn_label.addSpriteFrame(resObject);
                    }).bind(this));
                    this.send_sprite.active = false;
                    this.send_tips_lb.string = cc.js.formatStr(Utils.TI18N("当前拥有红包令，消耗%s个可发放1次该红包"), num);
                    this.send_tips_lb.node.active = true;
                }
            }
            else if (charge_config){
                this.send_sprite.active =true;
                this.btn_label.string = cc.js.formatStr(Utils.TI18N("<outline width=2 color=#6C2B00>%s 配布</outline>"), charge_config.val);
            }
                
        }
        if (this.cur_send_num != send_num) {
            this.cur_send_num = send_num;
            if (send_num == 0) {
                Utils.setGreyButton(this.send_btn, true);
                // this.btn_label
            } else {
                Utils.setGreyButton(this.send_btn, false);
                // enableOutline
            }
        }
    },

    //判断道具数量是否足够发红包
    checkLossItemIsEnough: function (loss_item) {
        let is_enough = false;
        if (loss_item && loss_item[0] != null) {
            let bid = loss_item[0][0];
            let need_num = loss_item[0][1];
            let have_num = BackpackController.getInstance().getModel().getItemNumByBid(bid);
            if (have_num >= need_num) {
                is_enough = true;
            }
        }
        return is_enough
    },

    setVisibleStatus: function (bool) {
        this.setVisible(bool);
    },

    onShow: function () {
    },

    setData: function (data) {

    },


    onDelete: function () {
        if (this.list_view) {
            this.list_view.deleteMe();
            this.list_view = null;
        }
        if (this.item_list) {
            for (var k in this.item_list) {
                var v = this.item_list[k];
                v.deleteMe();
            }
            this.item_list = null;
        }
    }
});

module.exports = RedBagGetPanel;