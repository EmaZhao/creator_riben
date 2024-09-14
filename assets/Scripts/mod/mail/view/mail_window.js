// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      竖版邮件
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var MailController = require("mail_controller");
var CommonScrollView = require("common_scrollview");
var MailCell = require("mail_cell");
var MailEvent = require("mail_event");

var MailWindow = cc.Class({
    extends: CommonWindowTab,
    ctor: function () {
        this.path = PathTool.getPrefabPath("mail", "mail_window");
        this.model = MailController.getInstance().getModel();
        this.ctrl = MailController.getInstance();
        this.win_type = WinType.Full;
        this.tab_info_list = [
            { label: Utils.TI18N("邮件"), index: 1, status: true },
            // { label: Utils.TI18N("公告"), index: 2, status: true }
        ];
        this.title_str = Utils.TI18N("邮箱");
        this.scroll_width = 624;
        this.scroll_height = 570;
        this.cur_index = 1;
    },

    initPanel: function () {
        this.main_container = this.root_wnd.getChildByName("main_container");
        if (this.panel == null) {
            this.loadRes(this.path, (function (res_object) {
                var panel = res_object;
                this.createPanel(panel)
            }).bind(this))
        }
    },

    createPanel: function (panel) {
        this.panel = panel;
        this.panel.setParent(this.container);

        this.panel_container = this.panel.getChildByName("main_container");
        this.scrollCon = this.panel_container.getChildByName("scrollCon");
        this.scroll_bg = this.scrollCon.getChildByName("background");
        this.del_btn = this.panel_container.getChildByName("del_btn");
        this.get_btn = this.panel_container.getChildByName("get_btn");

        this.del_btn.active = this.del_btn_bool != null ? this.del_btn_bool : true;
        this.get_btn.active = this.get_btn_bool != null ? this.get_btn_bool : true;

        Utils.getNodeCompByPath("del_btn/Label", this.panel_container , cc.Label).string = Utils.TI18N("删除已读");
        Utils.getNodeCompByPath("get_btn/Label", this.panel_container , cc.Label).string = Utils.TI18N("一键领取");

        var scroll_view_size = this.scrollCon.getContentSize();
        this.scroll_con.active = false;
        var scroll_view_size = cc.size(622, 696)
        var setting = {
            item_class: MailCell,      // 单元类
            start_x: 5.5,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 610,               // 单元的尺寸width
            item_height: 124,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            once_num: 1,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scrollCon, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))



        this.del_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            var list = this.model.getHasReadNonRewardList();
            MailController.getInstance().deletMailSend(list);
        }, this);
        this.get_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            MailController.getInstance().getAllGoods();
        }, this);

        this.selectedTabCallBack(this.cur_index);
    },

    registerEvent: function () {
        //更新邮件
        if (this.update_list == null) {
            this.update_list = gcore.GlobalEvent.bind(MailEvent.UPDATE_ITEM, (function () {
                if (this.cur_index == 1)
                    this.selectedTabCallBack(this.cur_index);
            }).bind(this))
        }
        //更新公告
        // if (this.update_notice == null) {
        //     this.update_notice = gcore.GlobalEvent.bind(MailEvent.UPDATE_NOTICE, (function (flag, data) {
        //         if (this.cur_index == 2)
        //             this.selectedTabCallBack(this.cur_index);
        //     }).bind(this))
        // }

        //更新红点状态
        this.addGlobalEvent(MailEvent.UPDATEREDSTATUS, function (bid, num) {
            this.updateRedStatus(bid, num)
        }, this)

        //读取一封邮件的返回
        this.addGlobalEvent(MailEvent.READ_MAIL_INFO, function (key) {
            if (this.select_cellitem) {
                var data = this.select_cellitem.getData();
                if (data) {
                    var item_key = Utils.getNorKey(data.id || 0, data.srv_id || "");
                    if (item_key == key) {
                        this.select_cellitem.updateIconStatus();
                    }
                }
            }
        }, this)
    },

    selectedTabCallBack: function (index) {
        this.cur_index = index;
        if (this.panel_container == null)
            return
        if (index == 1) {
            if (this.get_btn) {
                this.get_btn.active = true;
            } else {
                this.get_btn_bool = true;
            }
            if (this.del_btn) {
                this.del_btn.active = true;
            } else {
                this.del_btn_bool = true;
            }
            var list = [];
            var array = this.model.getAllMailArray();
            for (var i = 0; i < array.length; i++) {
                list.push(array[i]);
            }
            this.scrollCon.setContentSize(cc.size(622, 696));
            this.scroll_bg.setContentSize(cc.size(622, 711));
            this.scrollCon.setPosition(0, 32)
            this.item_scrollview.resetSize(this.scrollCon.getContentSize(), cc.v2(0, 0));
            this.empty_con.active = list.length == 0;
            this.empty_label.string = Utils.TI18N("暂时没有邮件");
            this.item_scrollview.setData(list, function (cell) {
                MailController.getInstance().openMailInfo(true, cell.getData());
                this.select_cellitem = cell;
            }.bind(this))
        } else if (index == 2) {
            if (this.get_btn) {
                this.get_btn.active = false;
            } else {
                this.get_btn_bool = false;
            }
            if (this.del_btn) {
                this.del_btn.active = false;
            } else {
                this.del_btn_bool = false;
            }
            var list = [];
            // var array = this.model.getNoticeArray();
            
            // for (var i = 0; i < array.length; i++) {
            //     list.push(array[i]);
            // }
            this.scrollCon.setContentSize(cc.size(622, 775));
            this.scroll_bg.setContentSize(cc.size(622, 775));
            this.scrollCon.setPosition(0, 0)
            this.item_scrollview.resetSize(cc.size(622, 755), cc.v2(0, -28))
            this.empty_con.active = list.length == 0;
            this.empty_label.string = Utils.TI18N("暂时没有公告");
            this.item_scrollview.setData(list, function (cell) {
                MailController.getInstance().openMailInfo(true, cell);
            })
        }
    },

    openRootWnd: function (index) {
        index = index || 1;
        this.setSelecteTab(index, true);
        this.updateRedStatus();
    },

    //更新红点
    updateRedStatus: function (bid, num) {
        if (bid == null) {
            //邮件,公告
            for (var i = 1; i <= 1; i++) {
                var count = this.model.getRedSum(i);
                if (count == null) {
                    count = 0;
                }
                this.setTabTipsII(count, i);
            }
        } else {
            bid = 1;
            num = num || 0;
            this.setTabTipsII(num, bid)
        }
    },

    closeCallBack: function () {
        if (this.update_list) {
            gcore.GlobalEvent.unbind(this.update_list);
            this.update_list = null;
        }
        if (this.update_notice) {
            gcore.GlobalEvent.unbind(this.update_notice);
            this.update_notice = null;
        }
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null
        this.ctrl.openMailUI(false)
    }
});

module.exports = MailWindow;