// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-24 16:41:34
// --------------------------------------------------------------------

var FriendController = require("friend_controller");
var FriendVo = require("friend_vo");
var FriendEvent = require("friend_event")

var FriendModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = FriendController.getInstance();
        this.initConfig();
    },

    properties: {
    },

    initConfig: function () {

        this.list = {}			            // 好友列表
        this.apply = []			            // 好友申请列表
        this.plist = {}
        this.onlinelist = {}
        this.blacklist = []                 // 黑名单列表
        this.honey_list_count = 20          //最近联系人限制
        this.last_select_group = 1          //最后选择的分组(默认选择第一个分组)
        this.last_select_friend_srv_id = null
        this.last_select_friend_rid = null
        this.present_count = 0              //当天可以赠送好友体力剩余次数
        this.draw_count = 0                 //当天可以领取好友体力剩余次数
        this.draw_total_count = 0           //当天可以领取好友体力总次数
        this.last_select_index = 1          //默认上次选中的序号
    },

    //添加数据
    add: function (val) {
        if (this.list[val.srv_id + "_" + val.rid] == null)
            this.list[val.srv_id + "_" + val.rid] = val;
    },

    addPchat: function (val) {
        if (this.plist[val.srv_id + "_" + val.rid] == null)
            this.plist[val.srv_id + "_" + val.rid] = val;
    },

    getOnlineFriendList: function () {
        var online_list = [];
        for (var k in this.list) {
            var v = this.list[k]
            if (v && v.is_online == 1) { //在线
                online_list.push(v);
            }
        }
        return online_list
    },

    getFriendInfo: function(srv_id, rid) {
        var friend_i = srv_id + "_" + rid;
        return this.list[friend_i];
    },

    //申请列表
    setApplyList: function (list) {
        var arr = [];
        for (var i in list) {
            var v = list[i];
            if (v) {
                arr.push(v)
            }
        }
        this.apply = arr;

        gcore.Timer.set(function () {
            gcore.GlobalEvent.fire(FriendEvent.Update_Red_Point);
        }, 1000, -1);
    },

    getApplyList: function () {
        return this.apply || [];
    },

    getApplyNum: function () {
        return this.apply.length
    },

    //删除数据
    del: function (srv_id, rid) {
        if (this.list[srv_id + "_" + rid] != null)
            this.list[srv_id + "_" + rid] = null;
            // this.list.splice(srv_id + "_" + rid,1)
    },

    //更新单个数据
    updateVo: function (srv_id, rid, key, value) {
        var vo = this.list[srv_id + "_" + rid];
        if (vo != null) {
            vo.update(key, value);
        }
        return vo
    },

    //红点判断，要显示出可领取的数量，跟申请列表的数量
    getAwardNum: function () {
        var num = 0;
        for (var i in this.list) {
            var v = this.list[i]
            if (v && v.is_draw == 1) {
                num = num + 1;
            }
        }
        return num
    },

    updateSingleFriendData: function (srv_id, rid, data) {
        var key = srv_id + "_" + rid;
        if (this.list[key])
            this.list[key].setData(data);
    },

    //获取单个数据
    getVo: function (srv_id, rid) {
        return this.list[srv_id + "_" + rid];
    },

    //转化为数组
    getArray: function () {
        var array = new Array();
        for (var k in this.list) {
            if(this.list[k]){
                array.push(this.list[k]);
            }
        }
        array.sort(Utils.tableUpperSorter(["is_online", "lev", "power"]));
        return array
    },

    //获取跨服/同服好友数据
    getGroupList: function (name) {
        var array = new Array();
        for (var k in this.list) {
            var v = this.list[k]
            if (v.is_cross == 1 && name == "cross") {
                array.push(v);
            } else if (v.is_cross == 0 && name == "alike") {
                array.push(v);
            }
        }
        array.sort(Utils.tableUpperSorter(["is_online", "lev"]));
        return array
    },

    //获取跨服/同服好友在线数和总数
    getGroupOnlineAndTotal: function (group_name) {
        var online_num = 0;
        var total_num = 0;
        var group_data = this.getGroupList(group_name);
        var len = group_data.GetSize();
        total_num = len;
        for (var i = 1; i <= len; i++) {
            var friend_vo = group_data.Get(i - 1);
            if (friend_vo.srv_id && friend_vo.rid && friend_vo.is_online == 1) {
                online_num = online_num + 1;
            }
        }
        return { online_num: online_num, total_num: total_num }
    },

    //获取所有好友在线和总数量
    getFriendOnlineAndTotal: function () {
        var online_num = 0;
        var total_num = 0;
        if (this.list) {
            for (var k in this.list) {
                var friend_vo = this.list[k];
                if (friend_vo && friend_vo.srv_id && friend_vo.rid && friend_vo.is_online == 1) {
                    online_num = online_num + 1;
                }
                if (friend_vo)
                    total_num = total_num + 1;
            }
        }
        return { online_num: online_num, total_num: total_num }
    },

    //获取最近联系人在线数和总数
    getHoneyListOnlineAndTotal: function (is_require) {
        var total_num = 0;
        var online_num = 0;
        var honeyList = this.getHoneyList(is_require);
        var len = honeyList.GetSize();
        total_num = len;
        for (var i = 1; i <= len; i++) {
            var item = honeyList.Get(i - 1);
            if (item.srv_id && item.rid && item.is_online == 1) {
                online_num = online_num + 1;
            }
        }
        return { online_num: online_num, total_num: total_num }
    },

    //获取黑名单在线数和总数
    getBlackListOnlineAndTotal: function () {
        var total_num = 0;
        var online_num = 0;
        for (var k in this.blacklist) {
            var v = this.blacklist[k];
            if (v != null && v.is_online != null && v.is_online == 1) {
                online_num = online_num + 1;
            }
            total_num = total_num + 1;
        }
        return { online_num: online_num, total_num: total_num }
    },

    //获取索引
    getIndex: function (srv_id, rid) {
        var array = this.getArray();
        for (var i = 0; i < array.length; i++) {
            var vo = array[i];
            if (vo.srv_id == srv_id && vo.rid == rid) {
                return i
            }
        }
        return null
    },

    isFriend: function (srv_id, rid) {
        if (srv_id == null || rid == null) {
            return false
        }
        var vo = this.list[srv_id + "_" + rid];
        if (vo && vo.is_moshengren == 0)
            return true
        return false
    },

    isFriend2: function (key) {
        var vo = this.list[key];
        if (vo && vo.is_moshengren == 0)
            return true
        return false
    },

    //保存非好友联系人的在线数据
    setOnlineData: function (key) {
        this.onlinelist = [];
        for (var i in list) {
            var vo = list[i];
            var key = vo.srv_id + "+" + vo.id;
            this.onlinelist[key] = 1;
        }
    },

    getOnlineData: function (key) {
        if (this.onlinelist[key])
            return 1
        else
            return 0
    },

    setOnlineKey: function (key) {
        this.onlinelist[key] = 1;
    },

    setFriendPresentCount: function (count) {
        this.present_count = count
    },

    getFriendPresentCount: function () {
        return this.present_count
    },

    setFriendDrawCount: function (count) {
        this.draw_count = count;
    },

    getFriendDrawCount: function () {
        return this.draw_count
    },

    setFriendDrawTotalCount: function (total) {
        this.draw_total_count = total;
    },

    getFriendDrawTotalCount: function () {
        return this.draw_total_count;
    },

    //-------------------黑名单模块数据：

    //初始化
    initBlackList: function (list, is_add) {
        for (var k in list) {
            var vo = new FriendVo();
            var v = list[k];
            vo.setData(v);
            this.blacklist[v.rid + "_" + v.srv_id] = vo;
        }
    },

    //移除黑名单
    removeBlack: function (rid, srv_id) {
        if (rid && srv_id)
            delete this.blacklist[rid + "_" + srv_id] ;
    },

    //黑名单数组
    getBlackArray: function () {
        var array = new Array();
        for (var k in this.blacklist) {
            array.push(this.blacklist[k]);
        }
        array.sort(Utils.tableUpperSorter(["is_online", "lev", "power"]));
        return array
    },

    //是否在黑名单里面
    isBlack: function (rid, srv_id) {
        var isIn = false;
        if (rid && srv_id && this.blacklist[rid + "_" + srv_id]) {
            isIn = true;
        }
        return isIn;
    },

    setLastSelectGroup: function (value) {
        this.last_select_group = value;
    },

    getLastSelectGroup: function () {
        return this.last_select_group;
    },

    setLastSelectFriend: function (srv_id, rid) {
        this.last_select_friend_srv_id = srv_id;
        this.last_select_friend_rid = rid;
    },

    setLastSelectFriendIndex: function (index) {
        this.last_select_index = index || 1;
    },

    getLastSelectFriendIndex: function () {
        return this.last_select_index;
    },

    getLastSelectFriend: function () {
        return this.last_select_friend_srv_id, this.last_select_friend_rid;
    },

    __delete: function () {

    }
});

module.exports = FriendModel;