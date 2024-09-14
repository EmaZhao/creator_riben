// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-14 10:57:08
// --------------------------------------------------------------------
var GuildListVo = require("guild_list_vo");
var GuildConst = require("guild_const");
var GuildEvent = require("guild_event");
var GuildMyInfoVo = require("guild_my_info_vo");
var RoleController = require("role_controller");
var GuildMemberVo = require("guild_member_vo");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");

var GuildModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        var GuildController = require("guild_controller");
        this.ctrl = GuildController.getInstance();

        this.guild_cache_list = {};      // 缓存的当前服务器列表
        this.guild_apply_list = {};      // 公会申请列表
        this.donate_sum = 0;             // 今天已经捐献的次数
        this.guild_member_list = {};     // 成员列表
        this.guild_list = [];            // 当前所有的公会列表
        this.guild_search_list = [];     // 当前待查找的公会列表
        this.my_guild_assistant = {};    // 当前副会长的数据
        this.guild_red_status_list = {}; // 公会红点的状态
        this.guild_donate_activity_list = [];    // 捐献活跃宝箱清空
    },

    properties: {
    },

    initConfig: function () {
    },

    updateGuildList: function (name, data_list) {
        if (name == "") {
            this.guild_list = [];
            for (var i in data_list) {
                var v = data_list[i];
                var guild_vo = this.guild_cache_list[Utils.getNorKey(v.gid, v.gsrv_id)];
                if (guild_vo == null) {
                    guild_vo = new GuildListVo();
                    this.guild_cache_list[Utils.getNorKey(v.gid, v.gsrv_id)] = guild_vo;
                }
                guild_vo.updateData(v);
                this.guild_list.push(guild_vo);
            }
        } else {
            this.guild_search_list = [];
            for (var i in data_list) {
                var v = data_list[i];
                var guild_vo = this.guild_cache_list[Utils.getNorKey(v.gid, v.gsrv_id)];
                if (guild_vo == null) {
                    guild_vo = new GuildListVo();
                    this.guild_cache_list[Utils.getNorKey(v.gid, v.gsrv_id)] = guild_vo;
                }
                guild_vo.updateData(v);
                this.guild_search_list.push(guild_vo);
            }
        }
        var type = GuildConst.list_type.total;
        var guild_list = this.guild_list;
        if (name != "") {
            type = GuildConst.list_type.search;
            guild_list = this.guild_search_list;
        }
        gcore.GlobalEvent.fire(GuildEvent.UpdateGuildList, type, guild_list);
    },

    //申请某个公会的返回
    updateGuildApplyStatus: function (gid, gsrv_id, is_apply) {
        var guild_list_vo = this.guild_cache_list[Utils.getNorKey(gid, gsrv_id)];
        if (guild_list_vo != null)
            guild_list_vo.setGuildAttribute("is_apply", is_apply);
    },

    //更新自己公会的基础信息
    updateMyGuildInfo: function (data) {
        if (this.my_guild_info == null)
            this.my_guild_info = new GuildMyInfoVo();
        this.my_guild_info.updateData(data);
    },

    // 清楚联盟相关缓存数据
    clearMyGuildInfo: function () {
        this.my_guild_info = null
        this.guild_red_status_list = {};
        this.my_guild_assistant = {};
        this.guild_member_list = {};
        this.guild_donate_activity_list = [];

        // 这里需要做清楚红点操作
        MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild);
    },

    //获取自己公会信息
    getMyGuildInfo: function () {
        return this.my_guild_info;
    },

    //更新成员列表，增删
    //type:"0:更新 1:添加 2:删除" 
    updateMyGuildMemberList: function (data_list, type) {
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo == null)
            return
        if (type == 2) {
            for (var i in data_list) {
                var v = data_list[i];
                this.guild_member_list[Utils.getNorKey(v.rid, v.srv_id)] = null;
                if (this.my_guild_assistant[Utils.getNorKey(v.rid, v.srv_id)] != null) {
                    this.my_guild_assistant[Utils.getNorKey(v.rid, v.srv_id)] = null;
                    //这里抛出时间更新副会长的数量吧
                    if (role_vo.position != GuildConst.post_type.member)
                        gcore.GlobalEvent.fire(GuildEvent.UpdateAssistantNumEvent);
                }
            }
        } else {
            var member_vo = null;
            for (var i in data_list) {
                var v = data_list[i];
                member_vo = this.guild_member_list[Utils.getNorKey(v.rid, v.srv_id)];
                //如果之前存在副会长，但是现在没有了的话，就移除掉
                if (this.my_guild_assistant[Utils.getNorKey(v.rid, v.srv_id)] != null) {
                    if (v.post != GuildConst.post_type.assistant) {
                        this.my_guild_assistant[Utils.getNorKey(v.rid, v.srv_id)] = null;
                        if (role_vo.position != GuildConst.post_type.member)
                            gcore.GlobalEvent.fire(GuildEvent.UpdateAssistantNumEvent);
                    }
                } else {
                    if (v.post == GuildConst.post_type.assistant) {
                        this.my_guild_assistant[Utils.getNorKey(v.rid, v.srv_id)] = v;
                        if (role_vo.position != GuildConst.post_type.member)
                            gcore.GlobalEvent.fire(GuildEvent.UpdateAssistantNumEvent);
                    }
                }

                if (member_vo == null) {
                    member_vo = new GuildMemberVo();
                    this.guild_member_list[Utils.getNorKey(v.rid, v.srv_id)] = member_vo;
                }
                if (v.is_self == null) {
                    v.is_self = RoleController.getInstance().checkIsSelf(v.srv_id, v.rid);   //当前是不是自己
                }
                v.role_post = role_vo.position;
                member_vo.updateData(v);
            }
        }
        gcore.GlobalEvent.fire(GuildEvent.UpdateMyMemberListEvent, type);
    },

    //自己职位变化的时候更改一下成员列表里面的自己职位数据
    updateMemberByPosition: function (value) {
        if (this.guild_member_list != null) {
            for (var k in this.guild_member_list) {
                this.guild_member_list[k].setGuildAttribute("role_post", value);
            }
        }
    },

    //获取当前副会长的总数
    getAssistantSum: function () {
        if (this.my_guild_assistant == null)
            return
        var sum = 0;
        for (var k in this.my_guild_assistant) {
            if (this.my_guild_assistant[k] != null)
                sum = sum + 1;
        }
        return sum
    },

    //获取成员列表
    getGuildMemberList: function () {
        var member_list = [];
        for (var k in this.guild_member_list) {
            if(this.guild_member_list[k] != null)
                member_list.push(this.guild_member_list[k]);
        }

        if (member_list.length > 0) {
            member_list.sort(Utils.tableUpperSorter(["online", "post_sort", "donate"]));
        }
        return member_list
    },

    //更新玩家捐献情况
    updateDonateInfo: function (data_list) {
        if (data_list == null)
            return
        this.donate_sum = 0;
        this.donate_list = [];
        for (var i in data_list) {
            var v = data_list[i];
            this.donate_list[v.type] = v.num;
            this.donate_sum = this.donate_sum + v.num;
        }
        gcore.GlobalEvent.fire(GuildEvent.UpdateDonateInfo);

        this.updateGuildRedStatus(GuildConst.red_index.donate, (this.donate_sum <= 0));
    },

    //这里表示捐献成功了
    setGuildDonateStatus: function () {
        this.donate_sum = this.donate_sum + 1;
        this.updateGuildRedStatus(GuildConst.red_index.donate, false);
    },

    //判断某一个捐献状态
    checkDonateStatus: function (type) {
        var num = this.donate_list[type];
        return [(this.donate_sum > 0), (num && num > 0)]
    },

    //更新申请列表，
    updateGuildApplyList: function (data_list) {
        this.guild_apply_list = {};
        for (var i in data_list) {
            var v = data_list[i];
            this.guild_apply_list[Utils.getNorKey(v.rid, v.srv_id)] = v;
        }
        gcore.GlobalEvent.fire(GuildEvent.UpdateApplyListInfo);
        this.clearApplyRedStatus();
    },

    //处理完成某个玩家申请请求之后，在总的申请列表中删除这个数据    
    deleteApplyInfo: function (rid, srv_id) {
        if (this.guild_apply_list[Utils.getNorKey(rid, srv_id)] != null) {
            this.guild_apply_list[Utils.getNorKey(rid, srv_id)] = null;
            gcore.GlobalEvent.fire(GuildEvent.UpdateApplyListInfo);
            this.clearApplyRedStatus();
        }
    },

    //清除公会申请红点状态
    clearApplyRedStatus: function () {
        if (Utils.getArrTrueLen(this.guild_apply_list) == 0)
            this.updateGuildRedStatus(GuildConst.red_index.apply, false);
    },

    //获取当前申请列表，按照在线，战力以及vip等级从打到小排序
    getGuildApplyList: function () {
        var apply_list = [];
        for (var k in this.guild_apply_list) {
            if(this.guild_apply_list[k] != null)
                apply_list.push(this.guild_apply_list[k]);
        }
        if (apply_list.length > 0)
            apply_list.sort(Utils.tableUpperSorter(["is_online", "power", "vip_lev"]));
        return apply_list
    },

    //处理公会红点的状态
    updateGuildRedStatus: function (type, status) {
        var base_data = Config.function_data.data_base;
        var bool = MainuiController.getInstance().checkIsOpenByActivate(base_data[6].activate);
        if (bool == false)
            return
        var _status = this.guild_red_status_list[type];
        if (_status == status)
            return
        this.guild_red_status_list[type] = status;

        //更新场景红点状态
        MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild, { bid: type, status: status });
        //事件用于同步更新公会主ui的红点
        gcore.GlobalEvent.fire(GuildEvent.UpdateGuildRedStatus, type, status);
    },

    //联盟活跃红点
    updataGuildActionRedStatus: function (data) {
        RedMgr.getInstance().addCalHandler(function () {
            this.goal_data = data;
            var red = false;
            var lev_data = Config.guild_quest_data.data_lev_data;
            var lev_data_len = Config.guild_quest_data.data_lev_data_length;
            if (data.lev < lev_data_len && data.exp >= lev_data[data.lev].exp)
                red = true
            MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild, { bid: GuildConst.red_index.goal_action, status: red });
            gcore.GlobalEvent.fire(GuildEvent.UpdateGuildRedStatus, GuildConst.red_index.goal_action, red);
        }.bind(this), RedIds.GuildActive)
    },

    getGoalRedStatus: function () {
        if (this.goal_data == null || !Utils.next(this.goal_data)) return false
        var status = false;
        var lev_data = Config.guild_quest_data.data_lev_data;
        if (this.goal_data.lev < Config.guild_quest_data.data_lev_data_length && this.goal_data.exp >= lev_data[this.goal_data.lev].exp) {
            status = true;
        }
        return status
    },

    //判断某个类型的红点状态
    getRedStatus: function (type) {
        return this.guild_red_status_list[type];
    },

    //判断是否有捐献红点
    getDonateRedStatus: function () {
        var status = this.getRedStatus(GuildConst.red_index.donate);
        if (status == true)
            return status
        status = this.getRedStatus(GuildConst.red_index.donate_activity);
        return status
    },

    //捐献活跃宝箱情况
    updateDonateBoxInfo: function (boxes, donate_exp) {
        this.guild_donate_activity_list = {};
        this.guild_donate_activity = donate_exp; //当前公会捐献活跃度
        for (var i in boxes) {
            this.guild_donate_activity_list[boxes[i].box_id] = true;
        }
        this.checkDonateActivity();
    },

    //设置某个捐献宝箱的状态
    setDonateBoxStatus: function (box_id) {
        if (this.guild_donate_activity_list == null)
            this.guild_donate_activity_list = {};
        this.guild_donate_activity_list[box_id] = true;
        gcore.GlobalEvent.fire(GuildEvent.UpdateDonateBoxStatus, box_id);
        this.checkDonateActivity();
    },

    //别人捐献的时候更新当前捐献进度,可能同步会有红点提示
    updateDonateActivity: function (value) {
        this.guild_donate_activity = value;
        gcore.GlobalEvent.fire(GuildEvent.UpdateDonateBoxStatus);
        this.checkDonateActivity();
    },

    //监测是否有公会捐献活跃宝箱
    checkDonateActivity: function () {
        RedMgr.getInstance().addCalHandler(function () {
            var activity = this.guild_donate_activity || 0;
            var red_status = false;
            for (var i in Config.guild_data.data_donate_box) {
                var v = Config.guild_data.data_donate_box[i];
                if (activity >= v.box_val && !this.guild_donate_activity_list[i]) {
                    red_status = true;
                    break
                }
            }
            this.updateGuildRedStatus(GuildConst.red_index.donate_activity, red_status);
        }.bind(this), RedIds.GuildDonate)
    },

    //返回捐献活跃度的值
    getDonateActivityValue: function () {
        return this.guild_donate_activity || 0;
    },

    //获取捐献宝箱状态
    getDonateBoxStatus: function (id) {
        return this.guild_donate_activity_list[id];
    }
});
