// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      冒险形象
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RoleController = require("role_controller");
var RoleHeadItem = require("role_head_item");
var BaseRole = require("baserole");
var BackpackController = require("backpack_controller");
var CommonScrollView = require("common_scrollview");
var HeroController = require("hero_controller");
var PartnerCalculate = require("partner_calculate");

var RoleBodyPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_body_panel");
        this.x = 0;//必须设置的两个变量
        this.y = 0;
        this.data = null;
        this.has_list = {};
        this.item_list = {};
        this.select_bid = 0;
    },

    initPanel: function () {
        Utils.getNodeCompByPath("desc", this.root_wnd, cc.Label).string = Utils.TI18N("该形象可在部分玩法中展示");
        Utils.getNodeCompByPath("attr_con/title", this.root_wnd, cc.Label).string = Utils.TI18N("形象属性");
        Utils.getNodeCompByPath("cond_con/title", this.root_wnd, cc.Label).string = Utils.TI18N("解锁条件");
        this.setPosition(0, 0);
        this.scroll_con = this.root_wnd.getChildByName("scroll_con");
        this.ok_btn = this.root_wnd.getChildByName("ok_btn");
        this.ok_label = this.ok_btn.getChildByName("Label").getComponent(cc.Label);
        this.body_con = this.root_wnd.getChildByName("body_con");
        this.attr_desc = this.root_wnd.getChildByName("attr_con").getChildByName("desc").getComponent(cc.RichText);
        this.cond_desc = this.root_wnd.getChildByName("cond_con").getChildByName("desc").getComponent(cc.RichText);
        this.spine = new BaseRole();
        this.spine.setParent(this.body_con);
        this.spine.node.setPosition(0, -100); // 原来是10
        var effect_nd = this.body_con.getChildByName("effect")
        if(effect_nd){
          effect_nd.active = false;
        }
        this.spine.scale = 0.6;
        var setting = {
            item_class: RoleHeadItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 4,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 125,               // 单元的尺寸width
            item_height: 145,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 2,                        // 列数，作用于垂直滚动类型
            once_num: 4,
            need_dynamic: true
        };
        var scroll_view_size = cc.size(250, 470);
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scroll_con, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5));
        RoleController.getInstance().send10345();
    },

    registerEvent: function () {
        this.ok_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.select_item) {
                if (this.select_item.data.status == 1) {
                    RoleController.getInstance().send10346(this.select_bid);
                } else if (this.cond_msg) {
                    message(this.cond_msg);
                } else {
                    RoleController.getInstance().send10347(this.select_bid);
                }
            }
        }, this);
        this.roleVo = RoleController.getInstance().getRoleVo();
        if (!this.role_update_evt) {
            var RoleEvent = require("role_event");
            this.role_update_evt = this.roleVo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function (key, val) {
                if (key == "look_id") {
                    this.updateList();
                }
            }), this);
            this.addGlobalEvent(RoleEvent.GetModelList, function (data) {
                this.updateList(data.list);
            })
        }
    },

    onShow: function () {
    },

    updateList: function (has_list) {
        if (has_list) {
            this.has_list = this.has_list || {};
            for (var k = 0; k < has_list.length; ++k) {
                this.has_list[has_list[k].id] = 1;
            }
        }
        // var list = [];
        // for (var k in Config.looks_data.data_data) {
        //     var v = Config.looks_data.data_data[k];
        //     if (v.id == this.roleVo.look_id) {
        //         list.push({ bid: v.id, face_id: v.partner_id, name: v.name, use: 1, status: 1, sort: 1100000 - v.id });
        //     } else if (this.has_list[v.id]) {
        //         list.push({ bid: v.id, face_id: v.partner_id, name: v.name, use: 0, status: 1, sort: 100000 - v.id });
        //     } else {
        //         list.push({ bid: v.id, face_id: v.partner_id, name: v.name, use: 0, status: 0, sort: -v.id });
        //     }
        // }
        // list.sort(Utils.tableCommonSorter([["use", true], ["show", true], ["id", true]]));
        if (this.list == null) {
            this.list = [];
            for (let k in Config.looks_data.data_data) {
                let v = Config.looks_data.data_data[k];
                let data = {};
                data.tips = v.tips;
                data.bid = v.id;
                data.skin_id = v.skin_id;
                data.face_id = v.partner_id;
                if (data.skin_id != 0) {
                    let config = Config.partner_skin_data.data_skin_info[data.skin_id];
                    if (config) {
                        data.face_id = config.head_id;
                    }
                }
                data.name = v.name;
                if (this.has_list) {
                    if (this.has_list[v.id]) {
                        data.status = 1;    //拥有
                    } else {
                        data.status = 0;    //未拥有
                    }
                } else {
                    data.status = 0;
                }
                if (this.roleVo.look_id == v.id) {
                    data.use = 1;
                } else {
                    data.use = 0;
                }
                this.list.push(data);
            }
        } else {
            for (let i in this.list) {
                let data = this.list[i];
                if (this.roleVo.look_id == data.bid) {
                    data.use = 1;
                } else {
                    data.use = 0;
                }
            }
        }

        // this.list.sort(Utils.tableUpperSorter(["use", "status", "bid"]));
        this.list.sort(Utils.tableCommonSorter([["use", true], ["status", true], ["bid", true]]));
        if (this.select_bid == 0) {
            this.select_bid = this.roleVo.look_id;
        }

        this.item_scrollview.setData(this.list, (function (cell) {
            if (cell.data.status != 1) {
                message(Utils.TI18N("该形象未解锁"));
            }
            this.select_bid = cell.data.bid;
            if (this.select_item) {
                this.select_item.setSelected(false);
            }
            this.select_item = cell;
            this.setSelected(cell);
        }).bind(this), { resObject: this.face_res_object, select_func: this.setSelected.bind(this) });
    },

    setSelected: function (item) {
        if (item) {
            item.setSelected(this.select_bid == item.data.bid)
            if (this.select_item == null) {
                this.select_item = item;
            }
        }
        if (this.select_bid != item.data.bid) return
        this.spine.setData(BaseRole.type.role, this.select_bid, PlayerAction.show, true, 0.6, { skin_id: item.data.skin_id });
        var config = Config.looks_data.data_data[this.select_bid];
        this.attr_desc.string = this.attrString(config);
        this.cond_desc.string = this.condString(config);
        if (this.select_item.data.status == 1) {
            this.ok_label.string = Utils.TI18N("更 换");
        } else {
            this.ok_label.string = Utils.TI18N("激 活");
        }
    },

    attrString: function (config) {
        var attr_list = config.attr;
        if (attr_list.length == 0) {
            return Utils.TI18N("<color=#a95f0f>当前形象无属性加成</color>");
        }
        var attr_desc = "";
        for (let i = 0, n = attr_list.length; i < n; i++) {
            let attr = attr_list[i];
            if (i > 0 && i % 2 == 0) {
                attr_desc += "<br/>";
            } else if (i > 0) {
                attr_desc += "     ";
            }
            // attr_desc += cc.js.formatStr("%s: %d", Config.attr_data.data_key_to_name[attr[0]], attr[1]);

            if (PartnerCalculate.isShowPerByStr(attr[0]) == true) {
                attr_desc += cc.js.formatStr("%s: %d%", Config.attr_data.data_key_to_name[attr[0]], attr[1] * 0.1);
            }
            else {
                attr_desc += cc.js.formatStr("%s: %d", Config.attr_data.data_key_to_name[attr[0]], attr[1]);
            }
        }
        return "<color=#a95f0f>" + attr_desc + "</color>";
    },

    condString: function (config) {
        this.cond_msg = null;
        if (this.select_item.data.status == 1) {
            return Utils.TI18N("<color=#3F3234>当イメージはアンロック済みです</color>");
        }
        var cond_desc = [];
        if (config.star > 0) {
            // cond_desc.push(cc.js.formatStr("◆ %s达到%d星 <color=#F8EB56>已达成</color>", config.name, config.star));
            this.cond_msg = cc.js.formatStr(Utils.TI18N("%s未达到%d星"), config.name, config.star);
            cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ %sが★%d星    <color=#329119>未達成</color>"), config.name, config.star));
        }
        if (config.skin_id) {
            let status = HeroController.getInstance().getModel().isUnlockHeroSkin(config.skin_id);
            if (status) {
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ スキン%s開放    <color=#3F3234>已達成</color>"), config.name));
            } else {
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ スキン%s開放    <color=#329119>未達成</color>"), config.name));
            }
        }
        if (config.lev > 1) {
            if (this.roleVo.lev >= config.lev) {
                this.cond_msg = this.cond_msg || Utils.TI18N("等级不足");
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ 勇者様のLv.%d     <color=#3F3234>已達成</color>"), config.lev));
            } else {
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ 勇者様のLv.%d     <color=#329119>未達成</color>"), config.lev));
            }
        }
        if (config.vip_lev > 0) {
            if (this.roleVo.vip_lev >= config.vip_lev) {
                this.cond_msg = this.cond_msg || Utils.TI18N("VIP等级不足");
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ 勇者様のVIPLv.%d   <color=#3F3234>已達成</color>"), config.vip_lev));
            } else {
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ 勇者様のVIPLv.%d   <color=#329119>未達成</color>"), config.vip_lev));
            }
        }
        for (let i = 0, n = config.expend; i < n; i++) {
            let loss = config.expend[i];
            let itemdata = Utils.getItemConfig(loss[0]);
            if (BackpackController.getInstance().getModel().getBackPackItemNumByBid(loss[0]) >= loss[1]) {
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ %sを%s個獲得   <color=#3F3234>已達成</color>"), itemdata.name, loss[1]));
            } else {
                cond_desc.push(cc.js.formatStr(Utils.TI18N("◆ %sを%s個獲得   <color=#329119>未達成</color>"), itemdata.name, loss[1]));
            }
        }
        return "<color=#a95f0f>" + cond_desc.join("<br/>") + "</color>";
    },

    onHide: function () {

    },

    onDelete: function () {
        if (this.role_update_evt) {
            this.roleVo.unbind(this.role_update_evt);
        }
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null
    }
});

module.exports = RoleBodyPanel;