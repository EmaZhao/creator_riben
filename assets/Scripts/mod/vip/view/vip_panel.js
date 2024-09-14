// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-27 21:36:38
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipController = require("vip_controller");
var RoleController = require("role_controller");
var VipEvent = require("vip_event");
var CommonScrollView = require("common_scrollview");
var VipLabelItemPanel = require("vip_label_item_panel");

var VipPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "vip_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = VipController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.item_list = {}
        this.desc_list = {}

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container_nd = this.seekChild("main_container");
        this.chargeCon_nd = this.seekChild(this.main_container_nd, "chargeCon");
        this.goods_scroll_nd = this.seekChild(this.chargeCon_nd, "goods_scroll");
        this.giftCon_nd = this.seekChild(this.chargeCon_nd, "giftCon");
        this.buy_btn_nd = this.seekChild(this.chargeCon_nd, "buy_btn");
        this.buy_btn_nd.active = true;
        this.buy_complete_nd = this.seekChild(this.chargeCon_nd, "buy_complete");
        this.buy_complete_nd.active = false;
        this.buy_btn_lb = this.seekChild(this.buy_btn_nd, "buy_btn_label", cc.Label);
        this.buy_btn_sp = this.seekChild(this.buy_btn_nd, "buy_price", cc.Sprite);

        this.buy_red_nd = this.seekChild(this.buy_btn_nd, "red");
        this.buy_red_nd.active = false;
        this.title_lb = this.seekChild(this.chargeCon_nd, "title", cc.Label);

        this.old_price_rt = this.seekChild(this.chargeCon_nd, "old_price", cc.RichText);
        this.buy_price_sp = this.seekChild(this.buy_btn_nd, "buy_price", cc.Sprite);
        this.sprite_1_nd = this.seekChild(this.main_container_nd, "Sprite_1");
        this.sprite_1_sp = this.seekChild(this.main_container_nd, "Sprite_1",cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("vip","vipbg5"),function(res){
            this.sprite_1_sp.spriteFrame = res
        }.bind(this))

        //月卡领取
        this.supre_good_con_nd = this.seekChild(this.sprite_1_nd, "good_con");
        var tab_size = this.supre_good_con_nd.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BackPackItem.Width * 0.6,               // 单元的尺寸width
            item_height: BackPackItem.Height * 0.6,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
            scale: 0.6
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.supre_good_con_nd, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

        var tab_size = this.goods_scroll_nd.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: BackPackItem.Width * 0.65,               // 单元的尺寸width
            item_height: BackPackItem.Height * 0.8,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
            scale: 0.65
        }
        this.reward_scrollview = new CommonScrollView();
        this.reward_scrollview.createScroll(this.goods_scroll_nd, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

        var tab_size = this.giftCon_nd.getContentSize();
        var setting = {
            item_class: VipLabelItemPanel,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 400,               // 单元的尺寸width
            item_height: 30,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.info_scroll = new CommonScrollView();
        this.info_scroll.createScroll(this.giftCon_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

        this.supre_card_get_nd = this.seekChild(this.sprite_1_nd, "btn_get");
        this.supre_card_get_btn = this.seekChild(this.sprite_1_nd, "btn_get", cc.Button);
        this.supre_card_get_nd.active = false;
        this.supre_card_get_lb = this.seekChild(this.supre_card_get_nd, "Text_3_0", cc.Label);
        this.supre_card_get_lb.string = Utils.TI18N("领取");
        this.supre_card_get_red_nd = this.seekChild(this.supre_card_get_nd, "red_point");
        this.supre_card_get_red_nd.active = false;

        this.des_labellist = {};
        this.red_line_nd = this.seekChild(this.old_price_rt.node, "red_line");
        this.desc_rt = this.seekChild(this.main_container_nd, "desc_label", cc.RichText);

        if (this.role_vo.vip_lev > Config.vip_data.data_get_reward_length - 1) {
            this.setData(Config.vip_data.data_get_reward_length - 1)
        } else {
            this.setData(this.role_vo.vip_lev);
        }

        Utils.getNodeCompByPath("main_container/Sprite_1/Text_3", this.root_wnd, cc.Label).string = Utils.TI18N("至尊月卡每日额外获得专属奖励");
        Utils.getNodeCompByPath("main_container/chargeCon/gift_title", this.root_wnd, cc.Label).string = Utils.TI18N("特权礼包");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.buy_btn_nd.on(cc.Node.EventType.TOUCH_END, function () {
            var role_vip = this.role_vo.vip_lev;
            var is_vip = this.role_vo.is_vip;
            if (role_vip == 0 && is_vip == 1) {
                if (this.config.lev == 0) {
                    this.ctrl.sender16711(this.index);
                } else {
                    var str = cc.js.formatStr('VIP%sに達していません', this.config.lev);
                    message(str)
                }
            } else {//如果是vip先判断等级足够不
                if (this.config) {
                    if (this.config.lev > role_vip) {
                        var str = cc.js.formatStr("VIP%sに達していません", this.config.lev)
                        message(str);
                    } else {
                        this.ctrl.sender16711(this.index);
                    }
                }
            }
        }, this)

        this.addGlobalEvent(VipEvent.UPDATE_GET_LIST, function () {
            var get_list = this.model.getGetGiftList();
            if (get_list[this.index] != null) {
                this.buy_price_sp.node.active = false;
                this.buy_btn_nd.active = false;
                this.buy_complete_nd.active = true;
            } else {
                this.buy_price_sp.node.active = true;
                this.buy_btn_nd.active = true;
                this.buy_complete_nd.active = false;
            }
            this.updateRed();
        }, this)

        if (this.role_vo) {
            if (this.role_update_event == null) {
                this.role_update_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    this.timer = gcore.Timer.set((function () {
                        if (key == "vip_lev")
                            this.updateRed();
                    }).bind(this), Math.random() * 1000, 1)
                }, this)
            }
        }

        this.addGlobalEvent(VipEvent.SUPRE_CARD_GET, function (status) {
            this.supre_card_get_nd.active = true;
            if (status == 1) {
                // this.supre_card_get_btn.interactable = true;
                Utils.setGreyButton(this.supre_card_get_btn, false)
                this.supre_card_get_lb.string = Utils.TI18N("领取");
                // this.supre_card_get_lb.node.color = new cc.Color(113, 40, 4)
                this.supre_card_get_red_nd.active = true;
            } else {
                this.supre_card_get_red_nd.active = false;
                if (status == 0) {
                    Utils.setGreyButton(this.supre_card_get_btn)
                    this.supre_card_get_btn.interactable = true;
                    this.supre_card_get_lb.string = Utils.TI18N("待激活");
                    // this.supre_card_get_lb.node.color = new cc.Color(113, 40, 4)
                } else {
                    // this.supre_card_get_btn.interactable = false;
                    Utils.setGreyButton(this.supre_card_get_btn)
                    this.supre_card_get_lb.string = "受取済";
                    // this.supre_card_get_lb.node.color = new cc.Color(255, 255, 255)
                }
            }
        }, this)

        this.supre_card_get_nd.on("click", function () {
            this.ctrl.sender16708();
        }, this)

        this.ctrl.sender16707()
        this.ctrl.sender16710()
        this.ctrl.setIsFirst(false)
    },

    updateRed: function () {
        var get_list = this.model.getGetGiftList();
        if (this.index == this.role_vo.vip_lev) {
            if (get_list[this.index] == null && this.ctrl.getIsFirst()) {
                this.buy_red_nd.active = true;
            } else {
                this.buy_red_nd.active = false;
            }
        } else {
            this.buy_red_nd.active = false;
        }
    },

    setData: function (index) {
        this.index = index;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.index == null) return
        var index = this.index;

        var config = gdata("vip_data", "data_get_reward", [index]);
        var list = [];
        var reward_list = gdata("charge_data", "data_supre_reward_data", [index]).reward
        for (var i in reward_list) {
            var v = reward_list[i];
            var tab = {};
            tab.bid = v[0];
            tab.num = v[1];
            list.push(tab);
        }

        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function () {
            var list = this.item_scrollview.getItemList();
            for (var k in list) {
                if (list[k])
                    list[k].setDefaultTip();
            }
        }.bind(this))

        this.config = config;
        this.title_lb.string = cc.js.formatStr(Utils.TI18N("VIP%d特权"), index);
        var item_id = gdata("item_data", "data_assets_label2id", "gold");
        var res = PathTool.getItemRes(item_id);
        
        var desc_str = cc.js.formatStr(Utils.TI18N("合計チャージ<color=#8ff147>%s </c><img src='%s'/>で以下の特権がもらえる"), this.config.gold, item_id)
        this.desc_rt.string = desc_str;
        this.loadRes(res, (function (resObject) {
            this.desc_rt.addSpriteFrame(resObject);
        }).bind(this));

        //特权礼包内容
        var items = config.items;
        var list = [];
        for(var i in items){
            var v = items[i];
            var tab = {};
            tab.bid = v[0];
            tab.num = v[1];
            list.push(tab);
        }
        var extend = {scale: 0.65,is_show_tips: true};
        this.reward_scrollview.setData(list,null,extend);
        

        //特权信息
        var desc_list = config.spe_desc;

        this.info_scroll.setData(desc_list);

        var item_id2 = Utils.getItemConfig(config.old_price[0][0]).icon;
        var res2 = PathTool.getItemRes(item_id2);
        this.old_price_rt.string = cc.js.formatStr(Utils.TI18N("原价<img src='%s'/>%s"),item_id2 , config.old_price[0][1]);
        this.loadRes(res2, (function (resObject) {
            this.old_price_rt.addSpriteFrame(resObject);
        }).bind(this));

        this.buy_btn_lb.string = cc.js.formatStr(Utils.TI18N("%d 购买"), config.price[0][1]);
        this.loadRes(PathTool.getItemRes(Utils.getItemConfig(config.old_price[0][0]).icon), function (bg_sf) {
            this.buy_btn_sp.spriteFrame = bg_sf;
        }.bind(this));

        var get_list = this.model.getGetGiftList();
        if (get_list && get_list[index] != null) {
            this.buy_price_sp.node.active = false;
            this.buy_btn_nd.active = false;
            this.buy_complete_nd.active = true;
        } else {
            this.buy_price_sp.node.active = true;
            this.buy_btn_nd.active = true;
            this.buy_complete_nd.active = false;
        }
        this.updateRed()
    },

    clearItemList: function () {
        if (this.item_list) {
            for (var k in this.item_list) {
                var item = this.item_list[k];
                if (item) {
                    item.setVisible(false);
                }
            }
        }
    },

    setVisibleStatus: function (status) {
        this.setVisible(status);
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        for (var k in this.item_list) {
            if (this.item_list[k]) {
                this.item_list[k].deleteMe();
                this.item_list[k] = null;
            }
        }
        this.item_list = null;
        if (this.role_vo) {
            if (this.role_update_event != null) {
                this.role_vo.unbind(this.role_update_event);
                this.role_update_event = null;
            }
        }
        this.role_vo = null;
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null;
        if (this.info_scroll) {
            this.info_scroll.DeleteMe()
        }
        this.info_scroll = null
    },
})