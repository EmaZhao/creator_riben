// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      好友主界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var FriendController = require("friend_controller");
var RoleController = require("role_controller");
var CommonScrollView = require("common_scrollview");
var FriendListItem = require("friend_list_item");
var FriendConst = require("friend_const");
var FriendEvent = require("friend_event");
var FriendAwardPanel = require("friend_award_panel");
var FriendApplyPanel = require("friend_apply_panel");
var FriendBlackPanel = require("friend_black_panel");
var FriendListPanel = require("friend_list_panel");
var MainuiConst = require("mainui_const");

var FriendWindow = cc.Class({
    extends: CommonWindowTab,
    ctor: function () {
        this.ctrl = FriendController.getInstance();
        this.win_type = WinType.Full;
        this.viewTag = SCENE_TAG.ui; 
        this.tab_info_list = [
            { label: Utils.TI18N("我的好友"), index: FriendConst.Type.MyFriend, status: true },
            { label: Utils.TI18N("领取礼物"), index: FriendConst.Type.Award, status: true },
            { label: Utils.TI18N("申请列表"), index: FriendConst.Type.ApplyList, status: true },
            { label: Utils.TI18N("黑名单"), index: FriendConst.Type.BlackList, status: true }
        ];
        this.title_str = Utils.TI18N("好友");
        this.view_list = {};
        this.friend_list = {};
        this.scroll_width = 630;
        this.scroll_height = 614;

        this.rend_list = {};
        this.cache_lit = {};
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    initPanel: function () {
        var scroll_view_size = cc.size(this.scroll_width, this.scroll_height)
        var setting = {
            item_class: FriendListItem,      // 单元类
            start_x: 3,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 624,               // 单元的尺寸width
            item_height: 114,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            once_num: 1,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scroll_con, cc.v2(0, 65), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
    },

    registerEvent: function () {
        //申请好友列表返回
        this.addGlobalEvent(FriendEvent.FRIEND_APPLY, (function () {
            if (this.cur_type != FriendConst.Type.ApplyList)
                return
            this.updateFriendList(false);
        }).bind(this));

        //赠送返回
        this.addGlobalEvent(FriendEvent.STRENGTH_UPDATE, (function (data) {
            if (this.cur_type != FriendConst.Type.Award && this.cur_type != FriendConst.Type.MyFriend)
                return

            var list = data.list || {};
            var id_list = {};
            for (var i in list) {
                var v = list[i];
                id_list[v.rid + "_" + v.srv_id] = v
            }
            var item_list = this.item_scrollview.getItemList();
            if (item_list) {
                for (var k in item_list) {
                    var v = item_list[k];
                    var vo = v.getData();
                    if (vo && id_list[vo.rid + "_" + vo.srv_id]) {
                        v.setData(id_list[vo.rid + "_" + vo.srv_id]);
                    }
                }
            }
        }).bind(this))

        //删除好友返回
        this.addGlobalEvent(FriendEvent.FRIEND_DELETE, (function () {
            if (this.cur_type != FriendConst.Type.MyFriend && this.cur_type != FriendConst.Type.BlackList)
                return
            this.updateFriendList(false, true);
            this.changeFriendBtn(true)
        }).bind(this))

        //增加好友
        this.addGlobalEvent(FriendEvent.UPDATE_APPLY, (function () {
            if (this.cur_type != FriendConst.Type.MyFriend) {
                this.setTabTips(true, FriendConst.Type.MyFriend);
                if (this.cur_type == FriendConst.Type.ApplyList) {
                    this.updateFriendList(false);
                }
            } else {
                this.updateFriendList(false);
            }
            this.showRedPoint()
        }).bind(this))

        //友情点变化更新
        if (this.role_vo != null) {
            if (this.role_assets_event == null) {
                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function (key, value) {
                    if (key == "friend_point") {
                        if (this.cur_type == FriendConst.Type.MyFriend || this.cur_type == FriendConst.Type.Award) {
                            if (this.pre_panel && this.pre_panel.setFriendPoint)
                                this.pre_panel.setFriendPoint();
                        }
                    }
                }).bind(this))
            }
        }

        this.addGlobalEvent(FriendEvent.UPDATE_COUNT, (function () {
            this.updateFriendList(false);
            this.showRedPoint();
        }).bind(this))

        //被删好友

        this.addGlobalEvent(FriendEvent.UPDATE_GROUP_COUNT, (function () {
            this.updateFriendList(false, true);
            this.showRedPoint();
        }).bind(this))


        //有人来礼物
        this.addGlobalEvent(FriendEvent.FRIEND_LIST, (function () {
            this.updateFriendList(false);
            this.showRedPoint();
        }).bind(this))

        //更新红点用
        this.addGlobalEvent(FriendEvent.Update_Red_Point, (function () {
            this.showRedPoint();
        }).bind(this))
    },

    openRootWnd: function (type) {
        type = type || FriendConst.Type.MyFriend;
        this.setSelecteTab(type, true);
        this.showRedPoint();
    },


    //切换标签页
    selectedTabCallBack: function (type) {
        type = type || FriendConst.Type.MyFriend;
        if (this.cur_type == type)
            return
        this.changeFriendBtn(false);
        // //切换到好友列表就把红点清掉
        this.setTabTips(false, FriendConst.Type.MyFriend);

        this.cur_type = type;
        if (this.pre_panel != null) {
            if (this.pre_panel.setVisibleStatus)
                this.pre_panel.setVisibleStatus(false);
        }

        this.pre_panel = this.createSubPanel(this.cur_type);
        if (this.pre_panel != null) {
            if (this.pre_panel.setVisibleStatus)
                this.pre_panel.setVisibleStatus(true);
        }


        if (this.cur_type == FriendConst.Type.MyFriend) {
            // this.scroll_con.y = 433;
            // this.scroll_con.setContentSize(cc.size(this.scroll_width, this.scroll_height));
            // this.item_scrollview.resetSize(cc.size(this.scroll_width, this.scroll_height));
        } else if (this.cur_type == FriendConst.Type.Award) {
            // this.scroll_con.y = 375;
            // this.scroll_con.setContentSize(cc.size(this.scroll_width, 600));
            // this.item_scrollview.resetSize(cc.size(this.scroll_width, 674));
        } else {
            // this.scroll_con.y = 323;
            // this.scroll_con.setContentSize(cc.size(this.scroll_width, 724));
            // this.item_scrollview.resetSize(cc.size(this.scroll_width, 724));
        }
        // //更新列表数据
        this.updateFriendList(true);
    },


    createSubPanel: function (index) {
        var panel = this.view_list[index];
        if (panel == null) {
            if (index == FriendConst.Type.MyFriend) {
                panel = new FriendListPanel();
            } else if (index == FriendConst.Type.ApplyList) {
                panel = new FriendApplyPanel(this.container);
            } else if (index == FriendConst.Type.Award) {
                panel = new FriendAwardPanel();
            } else if (index == FriendConst.Type.BlackList) {
                panel = new FriendBlackPanel();
            }
            panel.show()
            var size = this.container.getContentSize();
            // panel.setPosition(cc.v2(size.width / 2, 405));
            panel.setParent(this.container);
            this.view_list[index] = panel;
        }

        if (panel && panel.setCallFun) {
            panel.setCallFun((function (is_del) {
                if (index == FriendConst.Type.MyFriend) {
                    is_del = is_del || false;
                    this.changeFriendBtn(is_del);
                }
            }).bind(this))
        }
        return panel
    },

    //变更好友子项的按钮作用，true变为删除好友，false还原为私聊
    changeFriendBtn: function (bool) {
        this.del_friend_status = bool;
        for(let i=0;i<this.rend_list.length;++i){
            this.rend_list[i].del_status = bool
        }
        this.item_scrollview.resetAddPosition(this.rend_list, null, this.cur_type);
        // var item_list = this.item_scrollview.getItemList();
        // if (item_list) {
        //     for (var k in item_list) {
        //         item_list[k].setDelStatus(bool)
        //     }
        // }
    },

    updateFriendList: function (change_index, is_del) {
        change_index = change_index || false;
        this.rend_list = [];
        var list = [];
        if (this.cur_type == FriendConst.Type.MyFriend) {
            list = this.ctrl.getModel().getArray() || [];
        } else if (this.cur_type == FriendConst.Type.ApplyList) {
            if (change_index == true) {
                this.ctrl.apply();
                return
            } else {
                var array = [];
                var apply_list = this.ctrl.getModel().getApplyList() || {};
                for (var i in apply_list) {
                    array.push(apply_list[i]);
                }
                list = array;
            }
            this.updateApplyNum();
        } else if (this.cur_type == FriendConst.Type.Award) {
            var array = this.ctrl.getModel().getArray() || [];
            var award_array = [];
            for (var i = 0; i < array.length; i++) {
                var vo = array[i];
                if (vo && vo.is_draw == 1) {
                    award_array.push(vo);
                }
            }
            list = award_array;
        } else if (this.cur_type == FriendConst.Type.BlackList) {
            list = this.ctrl.getModel().getBlackArray() || [];
        }
        if (list) {
            for (var k in list) {
                if (list[k]) {
                    this.rend_list.push(list[k]);
                }
            }
        }

        this.showEmptyIcon(false);
        if (this.rend_list.length <= 0) {
            this.showEmptyIcon(true);
        }
        this.pre_panel.setData(this.rend_list);
        if (is_del == true && change_index == false && Utils.next(this.rend_list) != null)
            this.item_scrollview.setData(this.rend_list, null);
        else {
            this.item_scrollview.setData(this.rend_list, null, this.cur_type);
        }
    },

    //更新申请数
    updateApplyNum: function () {
        if (this.pre_panel && this.pre_panel.setApplyNum) {
            var num = this.ctrl.getModel().getApplyNum() || 0;
            this.pre_panel.setApplyNum(num);
        }
    },


    //红点处理
    showRedPoint: function () {
        var award_num = this.ctrl.getModel().getAwardNum() || 0;
        this.setTabTipsII(award_num, FriendConst.Type.Award);
        var appl_num = this.ctrl.getModel().getApplyNum() || 0;
        this.setTabTipsII(appl_num, FriendConst.Type.ApplyList);
        var list = [{ bid: 1, num: award_num }, { bid: 2, num: appl_num }];
        require("mainui_controller").getInstance().setFunctionTipsStatus(MainuiConst.icon.friend, list)
    },

    //显示空白
    showEmptyIcon: function (bool) {
        if (!this.empty_con && bool == false)
            return

        var str = Utils.TI18N("暂无好友");
        if (this.cur_type == FriendConst.Type.Award) {
            str = Utils.TI18N("暂无好友赠送");
        } else if (this.cur_type == FriendConst.Type.ApplyList) {
            str = Utils.TI18N("暂无好友申请");
        } else if (this.cur_type == FriendConst.Type.BlackList) {
            str = Utils.TI18N("暂无拉黑名单");
        }
        this.empty_label.string = str;
        this.empty_con.active = bool;
    },
    closeCallBack: function () {
        this.ctrl.openFriendWindow(false);
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe();
            this.item_scrollview = null;
        }
        for (var i in this.view_list) {
            var v = this.view_list[i];
            if (v && v.deleteMe) {
                v.deleteMe();
                v = null;
            }
        }
        this.view_list = null;
        if (this.role_vo != null) {
            if (this.role_assets_event != null) {
                this.role_vo.unbind(this.role_assets_event);
                this.role_assets_event = null;
            }
        }

    }


});

module.exports = FriendWindow;