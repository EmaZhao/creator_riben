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
var CommonScrollView = require("common_scrollview");

var RedBagGetPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_get");
        this.ctrl = RedbagController.getInstance();
        this.size = cc.v2(644, 740);
        this.bool = false;
    },

    initPanel: function () {
        this.main_panel = this.seekChild("main_panel");
        if (this.empty_con) {
            this.showEmptyIcon(this.bool);
        }
        this.updateBagList();
        if (this.is_event != null) {
            this.updateBagList(this.is_event);
        }
    },

    registerEvent: function (status) {
        // if (!status) {
        //     if (this.update_data_event) {
        //         gcore.GlobalEvent.unbind(this.update_data_event);
        //         this.update_data_event = null;
        //     }
        // } else {
        //     if (!this.update_data_event) {
        //         this.update_data_event = gcore.GlobalEvent.bind(RedbagEvent.Get_Data_Event, function () {
        //             this.updateBagList(true);
        //         }.bind(this))
        //     }
        // }
        if (!this.update_data_event) {
            this.update_data_event = gcore.GlobalEvent.bind(RedbagEvent.Get_Data_Event, function () {
                this.updateBagList(true);
            }.bind(this))
        }
    },

    updateBagList: function (is_event) {
        if (this.root_wnd == null) {
            this.is_event = is_event;
            return
        }
        var red_bag_list = this.ctrl.getModel().getRedBagList() || [];
        var list = Utils.deepCopy(red_bag_list);
        if (!list || Utils.next(list) == null) {
            this.showEmptyIcon(true);
            if (this.scroll_view) {
                this.scroll_view.setRootVisible(false);
            }
        } else {
            this.showEmptyIcon(false);
            var sort_func = Utils.tableUpperSorter(["order"]);
            list.sort(sort_func);
            if (!this.scroll_view) {
                var scroll_view_size = cc.size(570, 790);
                var setting = {
                    item_class: RedBagItem,      // 单元类
                    start_x: 10,                    // 第一个单元的X起点
                    space_x: 23,                    // x方向的间隔
                    start_y: 5,                    // 第一个单元的Y起点
                    space_y: 10,                   // y方向的间隔
                    item_width: 262,               // 单元的尺寸width
                    item_height: 327,              // 单元的尺寸height
                    row: 2,                        // 行数，作用于水平滚动类型
                    col: 2,                        // 列数，作用于垂直滚动类型
                    need_dynamic: true
                }
                this.scroll_view = new CommonScrollView()
                this.scroll_view.createScroll(this.main_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
            }
            this.scroll_view.setRootVisible(true);
            // if (is_event == true) {
            //     this.scroll_view.resetAddPosition(list);
            // } else {
            var call_back = function (item, vo) {
                if (vo && Utils.next(vo) != null) {
                    var is_can_get = item.getIsCanGet();
                    if (is_can_get == true) {
                        this.ctrl.sender13536(vo.id);
                        this.ctrl.setRedBagVo(vo);
                    } else {
                        this.ctrl.openLookWindow(true, vo);
                    }
                }
            }.bind(this)
            this.scroll_view.setData(list, call_back);

            // }
        }
    },

    setVisibleStatus: function (bool) {
        this.setVisible(bool);
        this.registerEvent(bool);

        //这里做一次处理是因为可能切换了标签页之后,自己发了红包没更新
        if (bool == true && this.root_wnd)
            this.updateBagList();
    },

    //仅仅更新，不全部重新创建
    updateListData: function (red_bag_list) {
        var list = this.scroll_view.getItemList();
        var index = 1;
        for (var i in red_bag_list) {
            var v = red_bag_list[i];
            if (list[index]) {
                list[index].setData(v);
            }
            index = index + 1;
        }
    },

    showEmptyIcon: function (bool) {
        if (!this.empty_con && bool == false || this.main_panel == null) return
        this.bool = bool;
        if (!this.empty_con) {
            var size = cc.size(200, 200);
            this.empty_con = new cc.Node();
            this.empty_con.setContentSize(size);
            this.empty_con.setAnchorPoint(cc.v2(0.5, 0.5));
            this.empty_con.setPosition(cc.v2(0, 0));
            this.main_panel.addChild(this.empty_con);
            var res = PathTool.getBigBg("bigbg_3");
            this.empty_bg = Utils.createImage(this.empty_con, null, 0, 0, cc.v2(0.5, 0.5), false)
            this.loadRes(res, function (sf_obj) {
                this.empty_bg.spriteFrame = sf_obj;
            }.bind(this))
            this.empty_label = Utils.createLabel(22, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 0, -100, "", this.empty_con, 0, cc.v2(0.5, 0.5));
        }
        var str = Utils.TI18N("当前没有可以抢的红包，不来一发吗？");
        this.empty_label.string = str;
        this.empty_con.active = bool;

    },

    openRootWnd: function () {

    },

    onShow: function () {
    },

    setData: function (data) {

    },

    onDelete: function () {
        if (this.empty_con) {
            this.empty_con.destroy();
            this.empty_label.destroy();
            this.empty_bg.destroy();
            this.empty_con = null;
            this.empty_bg = null;
            this.empty_label = null;
        }
        if (this.scroll_view) {
            this.scroll_view.DeleteMe();
            this.scroll_view = null;
        }
        if (this.update_data_event) {
            gcore.GlobalEvent.unbind(this.update_data_event);
            this.update_data_event = null;
        }
    }
});

module.exports = RedBagGetPanel;