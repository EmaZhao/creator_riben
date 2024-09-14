// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      头像框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TimeTool = require("timetool");
var RoleController = require("role_controller");
var BackpackController = require("backpack_controller");
var PartnerCalculate = require("partner_calculate");

var RoleTitlePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_title_panel");
        this.x = 0;//必须设置的两个变量
        this.y = 0;
        this.data = null;
        this.has_list = {};
        this.item_list = {};
    },

    initPanel: function () {
        this.setPosition(0, 0);
        this.scroll_con = this.root_wnd.getChildByName("scroll_con");
        this.view = this.scroll_con.getChildByName("view");
        this.content = this.view.getChildByName("content");
        this.ok_btn = this.root_wnd.getChildByName("ok_btn");
        this.ok_label = this.ok_btn.getChildByName("Label").getComponent(cc.Label);
        this.item = this.root_wnd.getChildByName("item");
        this.roleVo = RoleController.getInstance().getRoleVo();
        RoleController.getInstance().send23300();
    },

    registerEvent: function () {
        this.ok_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.select_item) {
                var config = Config.honor_data.data_title[this.select_bid];
                if (this.select_item.v.status == 1) {
                    RoleController.getInstance().send23301(this.select_bid);
                } else if (this.select_item.v.status == 0 && config.source > 0) {
                    var data = Config.source_data.data_source_data[config.source];
                    if (data.evt_type != null && data.extend != null) {
                        BackpackController.getInstance().gotoItemSources(data.evt_type, data.extend);
                    }
                } else {
                    RoleController.getInstance().send23303(this.select_bid);
                }
            }
        }, this);
        var RoleEvent = require("role_event");
        this.addGlobalEvent(RoleEvent.GetTitleList, function (data) {
            this.updateList(data.honor);
        });
        this.addGlobalEvent(RoleEvent.UpdateTitleList, function (data) {
            this.updateList(data.honor);
        });
        this.addGlobalEvent(RoleEvent.UseTitle, function (data) {
            this.updateList();
        });
    },

    onShow: function () {
    },

    // 更新头像框列表信息
    updateList: function (has_list) {
        if (has_list) {
            this.has_list = this.has_list || {};
            for (var k in has_list) {
                this.has_list[has_list[k].base_id] = has_list[k];
            }
        }
        this.list = [];
        for (var k in Config.honor_data.data_title) {
            var v = Config.honor_data.data_title[k];
            if (v.is_show != 1) {
            } else if (v.base_id == this.roleVo.title_id) {
                this.list.push({ bid: v.base_id, use: 1, status: 1, sort: 1100000 - v.base_id });
            } else if (this.has_list[v.base_id]) {
                this.list.push({ bid: v.base_id, use: 0, status: 1, sort: 100000 - v.base_id });
            } else if (v.loss && v.loss[0]) {
                if (BackpackController.getInstance().getModel().getBackPackItemNumByBid(v.loss[0][0]) >= v.loss[0][1]) {
                    this.list.push({ bid: v.base_id, use: 0, status: 2, sort: 2000000 - v.base_id, res_id: v.res_id });
                } else {
                    this.list.push({ bid: v.base_id, use: 0, status: 0, sort: -v.base_id, res_id: v.res_id });
                }
            } else {
                this.list.push({ bid: v.base_id, use: 0, status: 0, sort: -v.base_id });
            }
        }
        //Log.info(has_list, this.has_list, this.list, this.roleVo);
        this.list.sort(function (a, b) { return a.sort > b.sort });
        var i = 0;
        var func = (function (num) {
            if (!this.list || !this.item_list || this.list.length == 0) {
                return;
            }
            num = num || 2;
            for (let j = 0; j < num; j++) {
                if (this.list.length == 0) {
                    return;
                }
                this.createItem(i, this.list.pop());
                i++;
            }
            gcore.Timer.set(func, 20, 1, "role_title_panel_timer");
        }).bind(this);
        func(10);
    },

    // 创建更新一个头像框
    createItem: function (i, v) {
        var item = this.item_list[v.bid];
        if (!item) {
            var config = Config.honor_data.data_title[v.bid];
            item = cc.instantiate(this.item);
            this.content.addChild(item);
            this.item_list[v.bid] = item;
            item.active = true;
            item.icon = item.getChildByName("icon").getComponent(cc.Sprite);
            item.use = item.getChildByName("use");
            item.select = item.getChildByName("select");
            item.active_node = item.getChildByName("active");
            item.bg = item.getChildByName("bg").getComponent(cc.Sprite);
            item.label = item.getChildByName("label").getComponent(cc.Label);
            item.attr_desc = item.getChildByName("attr_desc").getComponent(cc.RichText);
            item.desc = item.getChildByName("desc").getComponent(cc.RichText);
            item.desc.string = cc.js.formatStr(Utils.TI18N("<color=#F8EB56>獲得条件:%s</color>"), config.desc);
            item.attr_desc.string = this.attrString(config);
            item.on(cc.Node.EventType.TOUCH_END, (function () {
                this.setSelected(v.bid);
            }).bind(this));
            this.loadRes(PathTool.getHonorRes(config.res_id), (function (resObject) {
                item.icon.spriteFrame = resObject;
            }).bind(this));
        }
        item.v = v;
        var y = -(i * 127 + 65);
        item.setPosition(302, y);
        this.content.height = 65 - y;
        item.active_node.active = (v.status == 2);
        if (i == 0) {
            this.setSelected(v.bid);
        }
        if (v.use == 1) {
            item.use.active = true;
            this.setSelected(v.bid);
        } else {
            item.use.active = false;
        }
        if (this.has_list[v.bid]) {
            if (this.has_list[v.bid].expire_time > 0) {
                item.label.string = TimeTool.getTimeFormatDay(this.has_list[v.bid].expire_time - gcore.SmartSocket.getTime());
            } else {
                item.label.string = Utils.TI18N("永久");
            }
        } else {
            item.label.string = Utils.TI18N("未获得");
        }
    },

    attrString: function (config) {
        cc.log("title", config)
        var attr_list = Utils.deepCopy(config.attr);
        if (config.add_exp > 0) {
            attr_list.push(["add_exp", config.add_exp]);
        }
        if (attr_list.length == 0) {
            return Utils.TI18N("<color=#F8EB56>无属性加成</color>");
        }
        var attr_desc = "";
        for (let i = 0, n = attr_list.length; i < n; i++) {
            let attr = attr_list[i];
            if (i > 0 && i % 2 == 0) {
                attr_desc += "<br/>";
            } else if (i > 0) {
                attr_desc += "        ";
            }
            if (attr[0] == "add_exp") {
                attr_desc += cc.js.formatStr(Utils.TI18N("挂机经验: %d"), attr[1]);
            }
            else {
                if (PartnerCalculate.isShowPerByStr(attr[0]) == true) {
                    attr_desc += cc.js.formatStr("%s: %d%", Config.attr_data.data_key_to_name[attr[0]], attr[1] * 0.1);
                }
                else {
                    attr_desc += cc.js.formatStr("%s: %d", Config.attr_data.data_key_to_name[attr[0]], attr[1]);
                }
            }
        }
        return "<color=#F8EB56>" + attr_desc + "</color>";
    },

    // 设置选择状态 
    setSelected: function (bid) {
        if (this.select_bid == bid) {
            return;
        }
        this.select_bid = bid;
        if (this.select_item) {
            var common_res_path = PathTool.getCommonIcomPath("Currency_7_1");
            this.changeImage(this.select_item.bg, common_res_path)
        }
        this.select_item = this.item_list[bid];
        if (this.select_item) {
            var common_res_path = PathTool.getCommonIcomPath("Currency_2_2");
            this.changeImage(this.select_item.bg, common_res_path)
            var config = Config.honor_data.data_title[bid];
            if (this.select_item.v.status == 1) {
                this.ok_label.string = Utils.TI18N("更 换");
            } else if (this.select_item.v.status == 0 && config.source > 0) {
                this.ok_label.string = Utils.TI18N("前往获取");
            } else {
                this.ok_label.string = Utils.TI18N("激 活");
            }
        }
    },

    changeImage: function (sp, res) {
        this.loadRes(res, function (sf_obj) {
            sp.spriteFrame = sf_obj;
        }.bind(this))
    },

    onHide: function () {

    },

    onDelete: function () {
        this.list = null;
        this.item_list = null;
    }
});

module.exports = RoleTitlePanel;