// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var FriendEvent = require("friend_event");
var PathTool = require("pathtool");
var FriendController = require("friend_controller");
var CommonScrollView = require("common_scrollview");
var FriendListItem = require("friend_list_item");
var FriendConst = require("friend_const");

var FriendAddWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("friend", "friend_find_panel");
        this.ctrl = FriendController.getInstance();
        this.win_type = WinType.Big;
        this.scroll_width = 624;
        this.scroll_height = 570;
        this.create_index = 1;
        this.rend_list = new Array();
        this.cache_list = {};
        this.is_init = false;
    },

    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.panel = this.main_container.getChildByName("panel");
        this.container = this.panel.getChildByName("container");
        this.main_panel = this.container.getChildByName("main_panel");
        this.top_panel = this.main_panel.getChildByName("top_panel");
        this.recommend_label = this.top_panel.getChildByName("recommend_label").getComponent(cc.Label);
        this.close_btn = this.panel.getChildByName("close_btn");
        this.scroll_con = this.main_panel.getChildByName("scroll_con");
        //查找好友
        this.find_btn = this.top_panel.getChildByName("find_btn");
        this.edit_box = this.top_panel.getChildByName("edit_box").getComponent(cc.EditBox);
        this.edit_box.node.on("editing-return", function (event) {
            var str = event.string;
            // if GmCmd and GmCmd.show_from_chat and GmCmd:show_from_chat(str) then return end
        }, this);

        //刷新按钮
        this.flash_btn = this.main_panel.getChildByName("flash_btn");

        this.num_label = this.main_panel.getChildByName("rich_text").getComponent(cc.RichText);
        var all_num = this.ctrl.getModel().getBlackListOnlineAndTotal().total_num;
        var str = Utils.TI18N("好友数：") + all_num + "/100";
        this.num_label.string = str;

        var scroll_view_size = cc.size(this.scroll_width, this.scroll_height)
        var setting = {
            item_class: FriendListItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 624,               // 单元的尺寸width
            item_height: 114,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            once_num: 1,
            item_obj: { open_type: 5 },     //参数
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scroll_con, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))

        Utils.getNodeCompByPath("main_container/panel/container/main_panel/flash_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("刷新");
        Utils.getNodeCompByPath("main_container/panel/container/main_panel/top_panel/find_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("查找");
        Utils.getNodeCompByPath("main_container/panel/container/main_panel/top_panel/edit_box/PLACEHOLDER_LABEL", this.root_wnd, cc.Label).string = Utils.TI18N("请输入玩家姓名");
        Utils.getNodeCompByPath("main_container/panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("添加好友");
    },

    registerEvent: function () {
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            FriendController.getInstance().openFriendFindWindow(false);
        }, this);
        //申请好友列表返回
        if (!this.apply_list_event) {
            this.apply_list_event = gcore.GlobalEvent.bind(FriendEvent.UD_COMMEND_LIST, (function (data_list) {
                this.updateFriendList(data_list);
            }).bind(this))
        }

        if (!this.find_friend_event) {
            this.find_friend_event = gcore.GlobalEvent.bind(FriendEvent.FRIEND_QUERY_RESULT, (function (data_list) {
                this.recommend_label.string = Utils.TI18N("搜索结果");
                this.updateFriendList(data_list);
            }).bind(this))
        }

        this.flash_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            this.ctrl.recommend();
            this.recommend_label.string = Utils.TI18N("推荐好友");
        }).bind(this), this);

        this.find_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            
            var name = this.edit_box.string|| "";
            this.ctrl.queryFind(name);
        }).bind(this), this);

        //请求推荐列表
        this.ctrl.recommend();
    },

    //显示空白
    showEmptyIcon: function (bool) {
        if (!this.empty_con && bool == false) return
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
            this.empty_label = Utils.createLabel(26, new cc.Color(0x68, 0x45, 0x2a, 0xff), null, 0, -100, "", this.empty_con, 0, cc.v2(0.5, 0.5));
        }
        var str = Utils.TI18N("未搜索到玩家");
        this.empty_label.string = str;
        this.empty_con.active = bool;
    },


    openRootWnd: function (type) {
        type = type || FriendConst.Type.MyFriend;
    },

    closeCallBack: function () {
        this.ctrl.openFriendFindWindow(false);
        this.setscheduleUpdate(false);
        for (var i in this.cache_list) {
            var v = this.cache_list[i];
            if (v && v["DeleteMe"]){
                v.DeleteMe();
                v=null
            }
        }
        this.cache_list = null;
        if (this.apply_list_event) {
            gcore.GlobalEvent.unbind(this.apply_list_event);
            this.apply_list_event = null;
        }
        if (this.find_friend_event) {
            gcore.GlobalEvent.unbind(this.find_friend_event);
            this.find_friend_event = null;
        }
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null
        if (this.empty_con) {
            this.empty_con.destroy();
            this.empty_label.destroy();
            this.empty_bg.destroy();
            this.empty_con = null;
            this.empty_bg = null;
            this.empty_label = null;
        }
    },

    updateFriendList: function (data_list) {
        // return
        for (var i in this.cache_list) {
            var v = this.cache_list[i];
            // v.setVisible(false);
        }

        this.create_index = 1;
        var list = new Array();
        for (var i in data_list) {
            list.push(data_list[i]);
        }

        this.rend_list = list || [];
        this.showEmptyIcon(false);
        if (list.length <= 0) {
            {
                this.showEmptyIcon(true);
            }
        }
        if (this.is_init == true) {
            // this.setscheduleUpdate(true);
            this.is_init = false;
        } else {
            // for (var i = 0; i < list.length; i++) {
            // this.createItem(list[i]);
            // }

        }
        // list = [1,2,3]
        this.item_scrollview.setData(list)
    },

    setscheduleUpdate: function (status) {
        if (status == true) {
            if (this.queue_timer == null) {
                this.queue_timer = gcore.Timer.set((function () {
                    var vo = this.rend_list[this.create_index - 1];
                    if (vo)
                        this.createItem(vo);
                    if (this.create_index >= this.rend_list.length + 1)
                        this.setscheduleUpdate(false);
                }).bind(this), 1 / (60), -1);
            }
        } else {
            if (this.queue_timer != null) {
                gcore.Timer.del(this.queue_timer);
                this.queue_timer = null;
            }
        }
    },

    createItem: function (vo) {
        var item = null;
        if (this.cache_list[this.create_index] == null) {
            item = new FriendListItem(this.create_index, 5);
            this.cache_list[this.create_index] = item;
            this.scroll_view.addChild(item);
        }
        item = this.cache_list[this.create_index];
        var offy = this.scroll_height - 120 * this.create_index;
        // item:setPosition(cc.p(self.scroll_view:getContentSize().width/2,offy))
        // item:setVisible(true)
        // item:setExtendData(5)
        // item:setData(vo)
        this.create_index = this.create_index + 1
    },

});

module.exports = FriendAddWindow;