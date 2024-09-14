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
var TipsController = require("tips_controller");

var RoleFacePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_face_panel");
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
        RoleController.getInstance().send21500();
    },

    registerEvent: function () {
        this.ok_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.select_item) {
                if (this.select_item.v.status == 1) {
                    RoleController.getInstance().send21501(this.select_bid);
                } else {
                    RoleController.getInstance().send21503(this.select_bid);
                }
            }
        }, this);
        this.roleVo = RoleController.getInstance().getRoleVo();
        if (!this.role_update_evt) {
            var RoleEvent = require("role_event");
            this.role_update_evt = this.roleVo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function (key, val) {
                if (key == "avatar_base_id") {
                    this.updateList();
                }
            }), this);
            this.addGlobalEvent(RoleEvent.GetFaceList, function (data) {
                this.updateList(data.avatar_frame);
            });
        }
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
        for (var k in Config.avatar_data.data_avatar) {
            var v = Config.avatar_data.data_avatar[k];
            if (v.is_show != 1) {
            } else if (v.base_id == this.roleVo.avatar_base_id) {
                this.list.push({ bid: v.base_id, use: 1, status: 1, sort: 1100000 - v.base_id });
            } else if (this.has_list[v.base_id]) {
                this.list.push({ bid: v.base_id, use: 0, status: 1, sort: 100000 - v.base_id });
            } else if (v.loss && v.loss[0]) {
                if (BackpackController.getInstance().getModel().getBackPackItemNumByBid(v.loss[0][0]) >= v.loss[0][1]) {
                    this.list.push({ bid: v.base_id, use: 0, status: 2, sort: 2000000 - v.base_id });
                } else {
                    this.list.push({ bid: v.base_id, use: 0, status: 0, sort: -v.base_id });
                }
            } else {
                this.list.push({ bid: v.base_id, use: 0, status: 2, sort: 2000000 - v.base_id });
            }
        }
        // Log.info(has_list, this.has_list, this.list, this.roleVo);
        this.list.sort(Utils.tableUpperSorter(["has", "base_id"]));
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
            gcore.Timer.set(func, 20, 1, "role_face_panel_timer");
        }).bind(this);
        func(10);
    },

    // 创建更新一个头像框
    createItem: function (i, v) {
        var item = this.item_list[v.bid];
        if (!item) {
            var config = Config.avatar_data.data_avatar[v.bid];
            item = cc.instantiate(this.item);
            this.content.addChild(item);
            this.item_list[v.bid] = item;
            item.active = true;
            item.icon = item.getChildByName("icon").getComponent(cc.Sprite);
            item.use = item.getChildByName("use");
            item.select = item.getChildByName("select");
            item.active_node = item.getChildByName("active");
            item.label = item.getChildByName("label").getComponent(cc.Label);
            item.label.string = config.name;
            item.icon_bg = item.getChildByName("icon_bg");
            if (config.offy) {
                item.icon_bg.y = item.icon_bg.y - config.offy
            }

            item.on(cc.Node.EventType.TOUCH_END, (function () {
                this.setSelected(v.bid);
                // TipsController.getInstance().showHeadCircleTips({bid:v.bid});
            }).bind(this));
            this.loadRes(PathTool.getHeadcircle(config.res_id), (function (resObject) {
                item.icon.spriteFrame = resObject;
            }).bind(this));
        }
        item.v = v;
        var y = -(parseInt(i / 4) * 170 + 70);
        item.setPosition(i % 4 * 150 + 75, y);
        // this.content.height = 55-y;
        if (v.use == 1) {
            item.use.active = true;
            this.setSelected(v.bid);
        } else {
            item.use.active = false;
        }
        item.active_node.active = (v.status == 2);
        if (v.status == 1) {
            item.icon.setState(cc.Sprite.State.NORMAL);
        } else {
            item.icon.setState(cc.Sprite.State.GRAY);
        }
    },

    // 设置选择状态 
    setSelected: function (bid) {
        if (this.select_bid == bid) {
            return;
        }
        this.select_bid = bid;
        if (this.select_item) {
            this.select_item.select.active = false;
        }
        this.select_item = this.item_list[bid];
        if (this.select_item) {
            this.select_item.select.active = true;
            if (this.select_item.v.status == 1) {
                this.ok_label.string = Utils.TI18N("更 换");
            } else {
                this.ok_label.string = Utils.TI18N("激 活");
            }
        }
    },

    onHide: function () {

    },

    onDelete: function () {
        if (this.role_update_evt) {
            this.roleVo.unbind(this.role_update_evt);
        }
        this.list = null;
        this.item_list = null;
    }
});

module.exports = RoleFacePanel;