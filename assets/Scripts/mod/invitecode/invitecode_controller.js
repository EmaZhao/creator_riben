// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-27 17:52:15
// --------------------------------------------------------------------
var InviteCodeEvent = require("invitecode_event");

var InvitecodeController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var InvitecodeModel = require("invitecode_model");

        this.model = new InvitecodeModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(19800, this.handle19800)
        this.RegisterProtocal(19801, this.handle19801)
        this.RegisterProtocal(19802, this.handle19802)
        this.RegisterProtocal(19803, this.handle19803)
        this.RegisterProtocal(19804, this.handle19804)
        this.RegisterProtocal(19805, this.handle19805)
        this.RegisterProtocal(19807, this.handle19807)
    },

    requestProto: function () {
        this.sender19800()
        this.sender19804()
        this.sender19802()
    },

    //个人邀请码
    sender19800: function () {
        this.SendProtocal(19800, {});
    },

    handle19800: function (data) {
        this.model.setInviteCode(data.code);
        gcore.GlobalEvent.fire(InviteCodeEvent.Get_InviteCode_Event)
    },

    //绑定邀请码
    sender19801: function (code) {
        var proto = {};
        proto.code = code;
        this.SendProtocal(19801, proto);
    },

    handle19801: function (data) {
        message(data.msg);
        gcore.GlobalEvent.fire(InviteCodeEvent.BindCode_Invite_Event, data);
    },

    //奖励信息
    sender19804: function () {
        this.SendProtocal(19804, {});
    },

    handle19804: function (data) {
        this.model.setInviteCodeTeskData(data.list);
        // this.getInviteCodeRepoint(data.list);
        gcore.GlobalEvent.fire(InviteCodeEvent.InviteCode_My_Event)
    },

    getInviteCodeRepoint: function (data) {
        if (Utils.next(data) == null) return
        var status = false;
        if (SHOW_SINGLE_INVICODE) {
            for (var i in data) {
                if (data[i] && data[i].num > data[i].had) {
                    status = true;
                    break
                }
            }
        }
        var WelfareConst = require("welfare_const");
        require("welfare_controller").getInstance().setWelfareStatus(WelfareConst.WelfareIcon.invicode, status)
    },

    //奖励领取
    sender19805: function (id) {
        var proto = {};
        proto.id = id;
        this.SendProtocal(19805, proto);
    },

    handle19805: function (data) {
        message(data.msg);
        if (data.code == 1) {
            this.model.setUpdataInviteCodeTeskData(data);
            gcore.GlobalEvent.fire(InviteCodeEvent.InviteCode_My_Event);
        }
    },

    //绑定角色列表(已邀请的好友)
    sender19802: function () {
        this.SendProtocal(19802, {});
    },

    handle19802: function (data) {
        this.model.setAlreadyFriendData(data.list);
        gcore.GlobalEvent.fire(InviteCodeEvent.InviteCode_BindRole_Event);
    },

    //绑定角色列表（推送）
    handle19803: function (data) {
        this.model.setUpdataAlreadyFriendData(data);
        gcore.GlobalEvent.fire(InviteCodeEvent.InviteCode_BindRole_Updata_Event);
    },

    //自己所绑定的角色
    sender19807: function () {
        this.SendProtocal(19807, {});
    },

    handle19807: function (data) {
        this.model.addFriendChatData(data);
    }
});

module.exports = InvitecodeController;