// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-27 17:52:15
// --------------------------------------------------------------------
var InvitecodeModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.teskData = {}
        this.friend_data = {}
        this.friend_chat_data = {}
    },

    setInviteCode: function (code) {
        this.invite_code = code;
    },

    getInviteCode: function () {
        return this.invite_code
    },

    //是否可领取的数据
    setInviteCodeTeskData: function (data) {
        for (var i in data) {
            var v = data[i];
            this.teskData[v.id] = v;
        }
        this.checkoutInviteRedPoint()
    },

    //数据更新
    setUpdataInviteCodeTeskData: function (data) {
        if (this.teskData && this.teskData[data.id]) {
            var tab = {};
            tab.id = data.id;
            tab.had = data.had;
            tab.num = data.num;
            this.teskData[data.id] = tab;
        }
        this.checkoutInviteRedPoint()
    },
    checkoutInviteRedPoint(){
        let red_point = false
        if(this.teskData){
            for(let i in this.teskData){
                let v = this.teskData[i]
                if(v.num > v.had){
                    red_point = true
                    break
                }
            }
        }
        this.invite_redpoint = red_point;
        var WelfareConst = require("welfare_const");
        require("welfare_controller").getInstance().setWelfareStatus(WelfareConst.WelfareIcon.invicode, red_point)
    },
    getInviteCodeFinishData: function (id) {
        if (this.teskData && this.teskData[id]) {
            return this.teskData[id];
        }
        return {}
    },

    //配置表任务
    getInviteCodeTeskData: function () {
        var list = [];
        for (var i in Config.invite_code_data.data_tesk_list) {
            var v = Config.invite_code_data.data_tesk_list[i];
            v.status = 0;//未完成
            if (this.teskData[v.id] != null) {
                if (this.teskData[v.id].had >= v.num) {
                    v.status = 2;//完成
                } else {
                    v.status = 1;//领取
                }
            }
            list.push(v)
        }
        this.setSortItem(list);
        return list
    },

    setSortItem: function (data_list) {
        var tempsort = {
            [0]: 2,
            [1]: 1,
            [2]: 3
        }
        var sortFunc = function (objA, objB) {
            if (objA.status != objB.status) {
                if (tempsort[objA.status] && tempsort[objB.status]) {
                    return tempsort[objA.status] - tempsort[objB.status];
                } else {
                    return 1
                }
            } else {
                return objA.id - objB.id
            }
        }
        data_list.sort(sortFunc);
    },

    //获取个人信息，私聊用到
    setFriendChatData: function () {
        if (this.friend_data) {
            for (var i in this.friend_data) {
                var v = this.friend_data[i];
                var key = Utils.getNorKey(v.rid, v.srv_id);
                this.friend_chat_data[key] = v;
            }
        }
    },

    addFriendChatData: function (data) {
        if (!data || Utils.next(data) == null) return
        var key = Utils.getNorKey(data.rid, data.srv_id);
        if (this.friend_chat_data[key] == null) {
            this.friend_chat_data[key] = data;
        }
    },

    getFriendChatData: function (rid, srv_id) {
        if (this.friend_chat_data) {
            var key = Utils.getNorKey(rid, srv_id);
            return this.friend_chat_data[key] || null
        }
        return null
    },

    //已邀请好友
    setAlreadyFriendData: function (data) {
        for (var i in data) {
            var v = data[i];
            var key = Utils.getNorKey(v.rid, v.srv_id);
            this.friend_data[key] = v;
        }
        this.setFriendChatData();
    },

    getAlreadyFriendData: function () {
        if (!this.friend_data || Utils.next(this.friend_data) == null) return []
        var list = [];
        for (var i in this.friend_data) {
            list.push(this.friend_data[i])
        }
        return list
    },

    setUpdataAlreadyFriendData: function (data) {
        if (!this.friend_data || !data) return
        for (var i in this.friend_data) {
            var v = this.friend_data[i];
            var key = Utils.getNorKey(v.rid, v.srv_id);
            this.friend_data[key] = v;
        }
        var key = Utils.getNorKey(data.rid, data.srv_id);
        this.friend_data[key] = data;
        this.setFriendChatData();
    },

    //获取邀请好友个数   
    getFirendNum: function () {
        var num = this.getAlreadyFriendData();
        return num.length || 0
    },

    inviteRedPoint(){
        if(this.invite_redpoint){
            return this.invite_redpoint
        }
        return false
    },
});