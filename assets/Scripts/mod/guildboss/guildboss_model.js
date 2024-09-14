// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-24 17:44:54
// --------------------------------------------------------------------
var GuildEvent = require("guild_event");
// var ActivityController = require("activity_controller");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");
var MainuiController = require("mainui_controller");
var GuildbossEvent = require("guildboss_event");
var GuildConst = require("guild_const");

var GuildbossModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        var ctrl = require("guildboss_controller");
        this.ctrl = ctrl.getInstance();
    },

    properties: {
    },

    initConfig: function () {
        this.guildboss_red_list = {};
        this.role_rank_list = {};//319排行协议列表
    },

    //退出公会的时候清空掉相关的数据
    clearGuildBossInfo: function () {
        this.base_info = {};//基础信息
        this.first_pass_list = {};//公会boss首通奖励
        this.day_bos_list = {};//每日宝箱
        this.guildboss_red_list = {};//公会红点相关，主要包含了首通奖励红点，每日击杀红点以及拥有次数的红点
        this._initFirstPassData = {};//首通
    },

    updateGuildRedStatus: function (bid, status) {
        RedMgr.getInstance().addCalHandler(function () {
            var base_data = Config.function_data.data_base;
            var bool = MainuiController.getInstance().checkIsOpenByActivate(base_data[6].activate);
            if (bool == false) return
            var _status = this.guildboss_red_list[bid];
            if (_status == status) return
            this.guildboss_red_list[bid] = status;
            //更新场景红点状态
            cc.log("更新场景红点状态",MainuiConst.new_btn_index.guild, { bid: bid, status: status })
            MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild, { bid: bid, status: status });
            //限时活动
            var limitRed = false;
            if (this.base_info && this.base_info.count) {
                // if (ActivityController.getInstance().getBossActivityDoubleTime() == true && this.base_info.count > 0) {
                //     limitRed = true;
                // }
            }
            //事件用于同步更新公会主ui的红点
            gcore.GlobalEvent.fire(GuildEvent.UpdateGuildRedStatus, bid, status);
        }.bind(this),RedIds.GuildBoss)
    },

    //公会副本是否有红点状态
    checkGuildDunRedStatus: function () {
        for (var k in this.guildboss_red_list) {
            var v = this.guildboss_red_list[k];
            if (v == true)
                return true
        }
        return false
    },

    //根据类型获取红点，
    getRedStatusByType: function (type) {
        return this.guildboss_red_list[type];
    },

    //公会副本基础信息,或者清除
    updateGuildDunBaseInfo: function (data) {
        var need_update_red_status = false;
        if (this.base_info == null || this.base_info.count != data.count) {
            need_update_red_status = true;
        }
        this.base_info = data;// fid:当前id max_id:历史最高副本id count:剩余挑战次数 type:重置类型（0：正常 1：章节回退）buy_count:购买次数
        gcore.GlobalEvent.fire(GuildbossEvent.UpdateGuildDunBaseInfo);
        //判断一下当前的Boss是否能打
        //更新红点
        if (need_update_red_status == true) {
            this.updateGuildRedStatus(GuildConst.red_index.boss_times, (this.base_info.count > 0));
        }
    },

    //获取挑战次数
    getChangeCount: function () {
        if (this.base_info) {
            if (!this.base_info.count) {
                return false
            }
            if (this.base_info.count > 0)
                return true
            else
                return false
        }
    },

    //获取基础信息
    getBaseInfo: function () {
        return this.base_info;
    },

    //更新剩余挑战次数以及购买次数
    //FALSE为普通购买TRUE为挑战购买
    updateBaseWithTimes: function (count, buy_count, buy_type) {
        if (this.base_info == null)
            this.base_info = {};
        this.base_info.count = count;
        this.base_info.buy_count = buy_count;
        gcore.GlobalEvent.fire(GuildbossEvent.UpdateGuildBossChallengeTimes, buy_type);
        //更新红点
        this.updateGuildRedStatus(GuildConst.red_index.boss_times, (this.base_info.count > 0));
    },

    getFirstPassRewardList: function () {
        var return_list = [];//0:未达成
        var return_list1 = [];//1:可领取
        var return_list2 = [];//2:已领取
        if (!this._initFirstPassData.award_list) return
        for (var i in this._initFirstPassData.award_list) {
            var v = this._initFirstPassData.award_list[i];
            if (v.status == 0) {
                return_list.push(v);
            } else if (v.status == 1) {
                return_list1.push(v);
            } else if (v.status == 3) {
                return_list2.push(v);
            }
        }
        if (return_list.length != 0) {
            for (var i in return_list) {
                var v = return_list[i];
                return_list1.push(v);
            }
        }
        if (return_list2.length != 0) {
            for (var i in return_list2) {
                var v = return_list[i];
                return_list1.push(v);
            }
        }
    },

    //根据排名获取伤害排名奖励
    getRankAward: function (rank) {
        rank = rank || 1;
        for (var k in Config.guild_dun_data.data_rank_reward) {
            var v = gdata("guild_dun_data", "data_rank_reward", [k]);
            if (v.rank1 < rank && rank <= v.rank2)
                return v.award
        }
        return []
    },

    //初始化每日宝箱奖励的
    initDayBoxRewardsStatus: function (data_list) {
        this.day_bos_list = {};
        for (var i = 1; i <= Config.guild_dun_data.data_chapter_box_length; i++) {
            this.day_bos_list[i] = 0;
        }
        var red_status = false;
        for (var i in data_list) {
            var v = data_list[i];
            this.day_bos_list[v.fid] = v.num;
            if (v.num > 0 && red_status == false) {
                red_status = true;
            }
        }
        gcore.GlobalEvent.fire(GuildbossEvent.UpdateBoxRewardsStatus);
    },

    //更新指定宝箱数量
    updateBoxRewards: function (fid, num) {
        if (this.day_bos_list[fid] == null) return
        this.day_bos_list[fid] = num;
    },

    //返回击杀宝箱的数量状态
    getBoxRewardList:function(){
        return this.day_bos_list || {};
    },

    //保存排行榜协议
    setRaknRoleList:function(list){
        this.role_rank_list = list;
    },

    //获取前三个
    getRaknRoleTopThreeList:function(){
        var list = [{rank:1,name:Utils.TI18N("虚位以待")},{rank:2,name:Utils.TI18N("虚位以待")},{rank:3,name:Utils.TI18N("虚位以待")}];
        if(this.role_rank_list.rank_list && Utils.next(this.role_rank_list.rank_list || {})!= null){
            var rank_list = this.role_rank_list.rank_list;
            for(var i in rank_list){
                var v = rank_list[i];
                for(var i2 in list){
                    var v1 = list[i2];
                    if(v.rank == v1.rank){
                        list[i2] = v;
                    }
                }
            }
        }
        return list
    }

});