// --------------------------------------------------------------------
// @author: zhangyusong@syg.com(必填, 创建模块的人员)
// @description:
//      好友协议和逻辑控制层
// <br/>Create: 2018-12-24 16:41:34
// --------------------------------------------------------------------
var FriendEvent = require("friend_event");
var RoleController = require("role_controller");
var FriendVo = require("friend_vo");
var FriendEvent = require("friend_event");
var FriendCheckInfoWindow = require("friend_check_info_winodw");
var FriendConst = require("friend_const");
var ChatController = require("chat_controller");

var FriendController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var FriendModel = require("friend_model");
        this.model = new FriendModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.login_success == null) {
            this.login_success = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                this.friendList();
                if (this.time_ticket) {
                    gcore.Timer.del(this.time_ticket);
                    this.time_ticket = null;
                }
                this.time_ticket = gcore.Timer.set((function () {
                    this.updateFriendTishi();
                }).bind(this), 60, 1)
            }, this)
        }
        if (!this.request_event) {
            this.request_event = gcore.GlobalEvent.bind(FriendEvent.REQUEST_LIST, function () {
                this.friendList();
                this.getBlackList();
            }, this)
        }
        if (!this.add_event) {
            this.add_event = gcore.GlobalEvent.bind(FriendEvent.FRIEND_ADD, function (srv_id, rid) {
                this.addOther(srv_id, rid);
            }, this)
        }
        if (!this.query_event) {
            this.query_event = gcore.GlobalEvent.bind(FriendEvent.FRIEND_QUERY_FIND, function (value) {
                this.queryFind(value);
            }, this)
        }
        if (!this.recommend_event) {
            this.recommend_event = gcore.GlobalEvent.bind(FriendEvent.FRIEND_RECOMMEND, function () {
                this.recommend();
            }, this)
        }
        if (!this.infom_event) {  //好友邮件界面
            this.infom_event = gcore.GlobalEvent.bind(FriendEvent.OPEN_FRIEND_INFOM, function (data, count, begin_pos, group_type) {
                this.openInfom(data, count, begin_pos, group_type)
            }, this)
        }
        //增加私聊数据
        if (!this.private_msg) {
            this.private_msg = gcore.GlobalEvent.bind(EventId.CHAT_UPDATE_SELF, function (chatVo) {
                this.addPrivateMsg(chatVo);
            }, this)
        }
        if (!this.update_chat_and_apply_event) {
            this.update_chat_and_apply_event = gcore.GlobalEvent.bind(FriendEvent.UPDATE_COUNT, function () {
                this.updateFriendTishi();
            }, this)
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(13300, this.friendListHandler);       //好友列表
        this.RegisterProtocal(13301, this.onlineHandler);           //好友在线状态
        this.RegisterProtocal(13302, this.friendStateHandler);      //单个好友一些状态改变
        this.RegisterProtocal(13303, this.addOtherHandler);         //请求加好友;A向服务端请求想加B为好友;会返回消息告诉A这次请求是否成功
        this.RegisterProtocal(13304, this.addMeHandler);            //被加好友，服务端告诉客户端;A想加B为好友
        this.RegisterProtocal(13305, this.acceptHandler);           //B告诉服务端，加或不加A为好友;服务端会告诉B这次结果怎么样
        this.RegisterProtocal(13306, this.batchAddHandler);         //批量加好友
        this.RegisterProtocal(13307, this.delOtherHandler);         //主动删除好友;需要客户端把好友删除
        this.RegisterProtocal(13308, this.delMeHandler);            //被动删除好友
        this.RegisterProtocal(13310, this.addToListHandler);        //添加好友到列表（添加好友成功后服务端推送）
        this.RegisterProtocal(13311, this.applyListHandler);        //好友申请列表
        this.RegisterProtocal(13312, this.refuseApplyListHandler);        //全部拒绝申请列表
        this.RegisterProtocal(13314, this.queryFindHandler);        //查询好友信息
        this.RegisterProtocal(13315, this.queryFriendTeamHandler);  //查询好友是否有队伍
        this.RegisterProtocal(13316, this.strengthHandler);         //好友体力赠送领取
        this.RegisterProtocal(13317, this.batchStrengthHandler);    //好友体力一键赠送领取
        this.RegisterProtocal(13320, this.recommendHandler);        //推荐好友
        this.RegisterProtocal(10388, this.getRolesOnline);          // 查询其它玩家是否在线

        //黑名单
        this.RegisterProtocal(13330, this.handle13330); //获取黑名单列表信息
        this.RegisterProtocal(13331, this.handle13331); //获取增加更新黑名单列表信息
        this.RegisterProtocal(13332, this.handle13332); //拉黑
        this.RegisterProtocal(13333, this.handle13333); //移除黑名

        this.RegisterProtocal(13334, this.handle13334); //全部同意好友申请
    },

    isFriend: function (srv_id, rid) {
        if (this.model == null)
            return null;
        else
            return this.model.isFriend(srv_id, rid);
    },

    updateFriendTishi: function () {
        var award_num = this.getModel().getAwardNum() || 0;
        var appl_num = this.getModel().getApplyNum() || 0;
        var list = [{ bid: 1, num: award_num }, { bid: 2, num: appl_num }];
        var MainuiConst = require("mainui_const");
        require("mainui_controller").getInstance().setFunctionTipsStatus(MainuiConst.icon.friend, list)
    },

    //获取好友列表
    friendList: function () {
        this.SendProtocal(13300, {});
    },

    friendListHandler: function (data) {
        if (this.model == null) {
            this.model = new FriendModel();
        }
        this.model.setFriendPresentCount(data.present_count);
        this.model.setFriendDrawCount(data.draw_count);
        this.model.setFriendDrawTotalCount(data.draw_all);

        for (var k in data.friend_list) {
            var v = data.friend_list[k];
            var friend = null;
            if (this.model.isFriend(v.srv_id, v.rid)) {
                friend = this.model.getVo(v.srv_id, v.rid);
                friend.setData(v);
            } else {
                friend = new FriendVo();
                friend.setData(v);
                this.model.add(friend);
            }
        }
        gcore.GlobalEvent.fire(FriendEvent.FRIEND_LIST, this.model.getArray());
        this.apply();
        this.updateFriendTishi();
    },

    //好友是否上线
    onlineHandler: function (data) {
        var old_index = this.model.getIndex(data.srv_id, data.rid);
        var vo1 = this.model.updateVo(data.srv_id, data.rid, "is_online", data.is_online);
        var vo2 = this.model.updateVo(data.srv_id, data.rid, "login_out_time", data.login_out_time);
        var new_index = this.model.getIndex(data.srv_id, data.rid);
        if (old_index != null && new_index != null && vo2 != null) {
            if (vo1 != null) {
                if (data.is_online == 1) {
                    gcore.GlobalEvent.fire(FriendEvent.FRIEND_UPDATE_ITEM, vo1, 0);
                    message(cc.js.formatStr(Utils.TI18N("您的好友<color=#00ff00>%s</c>上线了"), vo1.name))
                }
            }
        }
    },

    //单个好友一些状态改变
    friendStateHandler: function (data) {
        if (data.srv_id != null && data.rid != null) {
            this.model.updateSingleFriendData(data.srv_id, data.rid, data);
            gcore.GlobalEvent.fire(FriendEvent.FRIEND_LIST, this.model.getArray());
        }
        this.updateFriendTishi();
    },

    //好友申请列表
    apply: function () {
        this.SendProtocal(13311, {});
    },

    applyListHandler: function (data) {
        //亲密度设置为-1(表示陌生人)
        //Debug.info(data)
        for (var k in data.friend_req_list) {
            data.friend_req_list[k].intimacy = -1;
        }
        this.model.setApplyList(data.friend_req_list);

        gcore.GlobalEvent.fire(FriendEvent.FRIEND_LIST, this.model.getApplyList());
        gcore.GlobalEvent.fire(FriendEvent.FRIEND_APPLY);

        this.updateFriendTishi();

    },

    send_refuseApplyList: function () {
        this.SendProtocal(13312, {});
    },

    refuseApplyListHandler: function (data) {
        if (data.code == 1) {
            gcore.GlobalEvent.fire(FriendEvent.UPDATE_APPLY_LIST);
            this.model.apply = [];
            this.updateFriendTishi();
        }
    },

    //全部同意好友申请
    send_acceptApplyList: function (list) {
        var protocal = {};
        protocal.role_ids = list;
        this.SendProtocal(13334, protocal);
    },

    handle13334: function (data) {
        gcore.GlobalEvent.fire(FriendEvent.UPDATE_APPLY_LIST);
        this.model.apply = [];
        this.updateFriendTishi();
        gcore.GlobalEvent.fire(FriendEvent.Update_Red_Point);
    },

    //好友申请个数
    appCount: function () {
        if (this.model) {
            return this.model.apply.length;
        }
        return 0
    },

    //推荐好友
    recommend: function () {
        this.SendProtocal(13320, {});
    },

    recommendHandler: function (data) {
        var list = [];
        var srv_id = RoleController.getInstance().getRoleVo().srv_id;
        var rid = RoleController.getInstance().getRoleVo().rid;
        for (var k in data.recommend_list) {
            var v = data.recommend_list[k];
            if (!this.isFriend(v.srv_id, v.rid) && !(srv_id == v.srv_id && rid == v.rid)) {
                v.intimacy = -1; //标记为陌生人
                list.push(v);
            }
        }
        gcore.GlobalEvent.fire(FriendEvent.UD_COMMEND_LIST, list);
    },

    //模糊查询
    queryFind: function (name) {
        var protocal = {};
        protocal.name = name;
        this.SendProtocal(13314, protocal);
    },

    queryFindHandler: function (data) {
        var t = [];
        if (Utils.next(data.role_list)) {
            var srv_id = RoleController.getInstance().getRoleVo().srv_id;
            var rid = RoleController.getInstance().getRoleVo().rid;
            var count = 0;
            for (var k in data.role_list) {
                var v = data.role_list[k];
                if (!this.isFriend(v.srv_id, v.rid) && !(srv_id == v.srv_id && rid == v.rid)) {
                    v.intimacy = -1; //标记为陌生人
                    t.push(v);
                    count = count + 1;
                }
                if (count > 25)
                    break;
            }
            t.sort(function (a, b) {
                return a.lev > b.lev;
            })
            if (!t || Utils.next(t) == null) {
                message(Utils.TI18N("找不到玩家"));
            }
        } else {
            message(Utils.TI18N("找不到玩家"));
        }
        gcore.GlobalEvent.fire(FriendEvent.FRIEND_QUERY_RESULT, t);
    },

    queryFriendIsHasTeam: function (rid, srv_id) {
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(13315, protocal);
    },

    queryFriendTeamHandler: function (data) {
        if (data.code == 1) {   //有队伍
            this.openFrinedInfo(1);
        } else if (data.code == 0) { //没队伍
            this.openFrinedInfo(0)
        }
    },

    //好友体力领取 赠送 code: 0 赠送 ，1领取
    sender_13316: function (code, rid, srv_id) {
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        protocal.code = code;
        this.SendProtocal(13316, protocal);
    },

    strengthHandler: function (data) {
        if (data.code == 1) {
            this.model.setFriendPresentCount(data.present_count);
            this.model.setFriendDrawCount(data.draw_count);
            //更新数据
            this.model.updateVo(data.srv_id, data.rid, "is_draw", data.is_draw)
            this.model.updateVo(data.srv_id, data.rid, "is_present", data.is_present)

            gcore.GlobalEvent.fire(FriendEvent.STRENGTH_UPDATE, { list: { data } });

            gcore.Timer.set(function () {
                gcore.GlobalEvent.fire(FriendEvent.Update_Red_Point)
            }, 60, 1)
        }
        message(data.msg);
    },

    //好友体力领取 赠送 code: 0 赠送 ，1领取
    sender_13317: function (code, list) {
        var protocal = {};
        protocal.list = list;
        protocal.code = code;
        this.SendProtocal(13317, protocal);
    },

    batchStrengthHandler: function (data) {
        if (data.code == 1) {
            gcore.GlobalEvent.fire(FriendEvent.STRENGTH_UPDATE, data);
            gcore.GlobalEvent.fire(FriendEvent.Update_Red_Point);
        }
        message(data.msg);
    },

    //请求加好友;A向服务端请求想加B为好友;会返回消息告诉A这次请求是否成功
    addOther: function (srv_id, rid) {
        var protocal = {};
        protocal.srv_id = srv_id;
        protocal.rid = rid;
        this.SendProtocal(13303, protocal);
    },

    addOtherHandler: function (data) {
        message(data.msg);
        if (data.code == 1) {
            this.closeInfo();
        }
    },

    //被加好友，服务端告诉客户端;A想加B为好友
    addMeHandler: function (data) {
        if (this.model.isBlack(data.rid, data.srv_id))
            return
        this.apply();
    },

    //B告诉服务端，加或不加A为好友;服务端会告诉B这次结果怎么样
    accept: function (srv_id, rid, agreed) {
        var protocal = {};
        protocal.srv_id = srv_id;
        protocal.rid = rid;
        protocal.agreed = agreed;
        this.SendProtocal(13305, protocal);
    },

    //删除客户端缓存的好友申请数据
    acceptHandler: function (data) {
        if (data != null) {
            for (var k in this.model.apply) {
                var v = this.model.apply[k];
                if (v != null && v.srv_id == data.srv_id && v.rid == data.rid) {
                    this.model.apply.splice(k, 1);
                }
            }
            gcore.GlobalEvent.fire(FriendEvent.UPDATE_COUNT, 2, this.model.apply.length); //单个数据增加
            this.updateFriendTishi();
            if (data.code == 1) {
                ChatController.getInstance().getModel().saveTalkTime(data.srv_id, data.rid)
                message(data.msg);
            } else {
                message(data.msg);
            }
        }
    },

    //添加好友到列表（添加好友成功后服务端推送）
    addToListHandler: function (data) {
        if (this.model == null)
            return
        var friend = new FriendVo();
        friend.setData(data);
        this.model.add(friend);
        if (this.model.apply != null) {
            for (var m in this.model.apply) {
                var n = this.model.apply[m];
                if (n && data.srv_id == n.srv_id && data.rid == n.rid) {
                    this.model.apply.splice(m, 1);
                }
            }
        }
        gcore.Timer.set(function () {
            gcore.GlobalEvent.fire(FriendEvent.UPDATE_APPLY);
        }, 1000, 1)
        message(cc.js.formatStr(Utils.TI18N("成功添加<color=#00ff00>%s</c>为好友"), data.name))
    },

    //批量加好友
    batchAdd: function (role_ids) {
        var protocal = {};
        protocal.role_ids = role_ids;
        this.SendProtocal(13306, protocal);
    },

    batchAddHandler: function (data) {
        message(data.msg);
    },

    //主动删除好友;需要客户端把好友删除
    delOther: function (srv_id, rid) {
        var confirm_handler = (function () {
            var protocal = {};
            protocal.srv_id = srv_id;
            protocal.rid = rid;
            this.SendProtocal(13307, protocal);
        }).bind(this)
        var CommonAlert = require("commonalert");
        CommonAlert.show(Utils.TI18N("好友删除后，将清空聊天记录，是否删除好友？"), Utils.TI18N("删除"), confirm_handler, Utils.TI18N("取り消し"))
        // confirm_handler();
    },

    //删除数据
    //删除视图
    delOtherHandler: function (data) {
        if (data.code == 1) {
            var old_data = this.model.getVo(data.srv_id, data.rid);
            if (old_data != null) {
                this.model.del(data.srv_id, data.rid);
                var role_vo = RoleController.getInstance().getRoleVo();
                ChatController.getInstance().getModel().deltePrivateTarget(data)
                gcore.GlobalEvent.fire(FriendEvent.FRIEND_DELETE, old_data, this.group_type);
            }
            this.closeInfom();
        }
        message(data.msg);
    },

    //被动删除好友（被人删）
    delMeHandler: function (data) {
        var old_data = this.model.getVo(data.srv_id, data.rid);
        if (old_data != null) {
            this.model.del(data.srv_id, data.rid);
            var role_vo = RoleController.getInstance().getRoleVo();
            ChatController.getInstance().getModel().deltePrivateTarget(data)
            gcore.GlobalEvent.fire(FriendEvent.UPDATE_GROUP_COUNT);
        }
    },

    deleteConnecter: function (vo) {
        var confirm_handler = function () {
            ChatController.getInstance().getModel().clearTalkTime(vo.srv_id, vo.rid)
            // gcore.GlobalEvent.fire(ContactEvent.CLOSE_TALK_INFO)
            this.closeInfom();
            gcore.GlobalEvent.fire(FriendEvent.FRIEND_DELETE, vo, FriendConst.FriendGroupType.communicate)
        }.bind(this)
        var CommonAlert = require("commonalert");
        CommonAlert.show("是否从列表中删除该联系人？", "删除", confirm_handler, "取り消し")
    },

    deleteBlackConnecter: function (srv_id, rid) {
        ChatController.getInstance().getModel().clearTalkTime(srv_id, rid)
        // gcore.GlobalEvent.fire(ContactEvent.CLOSE_TALK_INFO)
        this.closeInfom();
        gcore.GlobalEvent.fire(FriendEvent.FRIEND_DELETE, { srv_id: srv_id, rid: rid }, FriendConst.FriendGroupType.friend)
    },

    sender_10388: function (list) {
        var protocal = {};
        protocal.id_list = list;
        this.SendProtocal(10388, protocal);
    },

    //获取常用联系人上线情况
    getRolesOnline: function (data) {
        if (data != null) {
            gcore.GlobalEvent.fire(FriendEvent.UPDATE_ONLINE, data.online_roles);
        }
    },

    //竖版好友主界面
    openFriendWindow: function (bool, index) {
        if (bool == true) {
            if (!this.friend_window) {
                var FriendWindow = require("friend_window");
                this.friend_window = new FriendWindow();
            }
            this.friend_window.open(index);
        } else {
            if (this.friend_window) {
                this.friend_window.close();
                this.friend_window = null;
            }
        }
    },

    //竖版好友推荐查找界面
    openFriendFindWindow: function (bool) {
        if (bool == true) {
            if (!this.friend_find_window) {
                var FriendAddWindow = require("friend_add_window");
                this.friend_find_window = new FriendAddWindow();
            }
            this.friend_find_window.open();
        } else {
            if (this.friend_find_window) {
                this.friend_find_window.close();
                this.friend_find_window = null;
            }
        }
    },

    //关闭好友信息界面
    closeInfo: function () {
        // if (!this.info && this.info.isOpen()) {
        //     this.info.close();
        //     this.info = null;
        // }
    },

    openFrinedInfo: function (code_type) {
        this.closeRecommendPanel();
        var show_type = null;
        if (this.group_type == 1) {  //我的好友
            show_type = [11, 12, 15];
        } else if (this.group_type == 3) {
            show_type = [2, 13, 15]; //黑名单
        }
    },

    //打开好友信息查看界面 data有srv_id,rid就行
    openFriendCheckPanel: function (status, data) {
        if (status == true) {
            if (!this.friend_check_view) {
                this.friend_check_view = new FriendCheckInfoWindow();
            }
            this.friend_check_view.open(data);
        } else {
            if (this.friend_check_view) {
                this.friend_check_view.close();
                this.friend_check_view = null;
            }
        }
    },

    //打开好友个人荣誉界面
    openFriendGloryWindow: function (status, data) {
        if (status == true) {
            if (!this.friend_glory_view) {
                var FriendGloryWindow = require("friend_glory_window")
                this.friend_glory_view = new FriendGloryWindow();
            }
            this.friend_glory_view.open(data);
        } else {
            if (this.friend_glory_view) {
                this.friend_glory_view.close();
                this.friend_glory_view = null;
            }
        }
    },

    openInfom: function (data, count, begin_pos, group_type) {
        this.begin_pos = begin_pos;
        this.group_type = group_type || 1;
        this.select_data = data;
        this.openFrinedInfo();
    },

    //关闭好友邮件面板
    closeInfom: function () {
        // if (this.infom && this.infom.isOpen()) {
        //     this.infom.close();
        //     this.infom = null;
        // }
    },

    closeRecommendPanel: function () {
        // if (this.commend_ui && this.commend_ui.isOpen()) {
        //     this.commend_ui.close();
        //     this.commend_ui = null;
        // }
    },

    //私聊未读数据显示
    addPrivateMsg: function (chat_vo) {

    },

    //删除聊天数量
    delPriCount: function (key) {
        this.pri_list[key] = null;
        gcore.GlobalEvent.fire(FriendEvent.UPDATE_COUNT, 1, key, 0); //单个数据增加
    },

    //获取好友联系人聊天的总数目
    getLpriCount: function () {
        var count = 0;
        for (var i in this.pri_list) {
            var value = this.model.isFriend2(v);
            if (value == true) {
                count = count + v;
            }
        }
        return count;
    },

    allPriCount: function () {
        var count = 0;
        for (var i in this.pri_list) {
            count = count + v;
        }
        return count
    },

    singlePriCount: function (key) {
        if (this.pri_list[key]) {
            return this.pri_list[key];
        }
        return 0
    },

    __delete: function () {
        if (this.model != null) {
            this.model.DeleteMe();
            this.model = null;
        }
        this.closeRecommendPanel();
    },

    //--------------黑名单部分
    handle13330: function (data) {
        this.model.initBlackList(data.black_list);
    },

    //获取黑名单列表
    getBlackList: function () {
        this.SendProtocal(13330, {});
    },

    //拉黑和移除黑名单推送
    handle13331: function (data) {
        if (data.type == 1) { //加黑名单
            this.model.initBlackList(data.black_list);
            gcore.GlobalEvent.fire(FriendEvent.UPDATE_GROUP_COUNT);
        } else if (data.type == 2) { //移除黑名单

        }
    },

    //拉黑
    addToBlackList: function (rid, srv_id) {
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(13332, protocal);
    },

    //拉黑是否成功返回
    handle13332: function (data) {
        message(data.msg);
        if (data.code == 1) {
            var old_data = this.model.getVo(data.srv_id, data.rid);
            //拉黑后在好友列表里面删掉该好友
            if (old_data) {
                this.model.del(data.srv_id, data.rid);
                //删除最近联系人
                // var role_vo = RoleController.getInstance().getRoleVo();
                // ChatController:getInstance():getModel():deleteCache(role_vo.srv_id,role_vo.rid,data.srv_id,data.rid)
                gcore.GlobalEvent.fire(FriendEvent.FRIEND_DELETE, old_data, this.group_type);
            }
        }
    },

    //删除黑名单
    deleteBlackList: function (rid, srv_id) {
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(13333, protocal);
    },

    //删除黑名单返回
    handle13333: function (data) {
        if (data.code == 1) {
            this.model.removeBlack(data.rid, data.srv_id);
            gcore.GlobalEvent.fire(FriendEvent.FRIEND_DELETE, data, this.group_type || FriendConst.FriendGroupType.black_list); //类型2是黑名单分组
        }
    }
});

module.exports = FriendController;