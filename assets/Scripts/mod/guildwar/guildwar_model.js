// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-06 17:56:47
// --------------------------------------------------------------------
var GuildConst = require("guild_const");
var GuildwarConst = require("guildwar_const");
var GuildWarPositionVo = require("guildwar_position_vo");
var GuildEvent = require("guild_event");
var GuildwarEvent = require("guildwar_event");
var GuildWarBoxVo = require("guildwar_box_vo");

var Guild_warModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = arguments[0];
    },

    properties: {
    },

    initConfig: function () {
        this.challengeCount = 0 		// 已挑战次数
        this.guildWarResult = GuildwarConst.result.fighting // 战斗结果
        this.myGuildWarBaseInfo = {}	// 我方联盟战基础数据(星数、buff等)
        this.enemyGuildWarBaseInfo = {} // 敌方联盟战基础数据(星数、名称)
        this.guildWarStatus = GuildwarConst.status.close // 联盟战状态
        this.guildWarStartTime = 0 		// 联盟战开始时间
        this.guildWarEndTime = 0 		// 联盟战结束时间
        this.guildWarEnemyFlag = 0 		// 是否匹配到对手
        this.guildWarTopThreeRank = {}  // 前三排名

        this.myGuildWarPositionList = {}  // 我方据点数据
        this.enemyGuildWarPositionList = {} // 敌方据点数据

        this.award_box_data = [];  		// 奖励宝箱数据

        this.guildwar_red_list = {};	// 红点数据
    },

    //本地是否有联盟战敌方数据
    checkIsHaveEnemyCacheData: function () {
        if (Utils.next(this.enemyGuildWarPositionList) == null) {
            return false
        } else {
            return true
        }
    },

    //设置已挑战次数
    setGuildWarChallengeCount: function (count) {
        this.challengeCount = count || 0;
        this.updateChallengeCountRedStatus(0);
    },

    getGuildWarChallengeCount: function () {
        return this.challengeCount;
    },

    //更新挑战次数红点
    updateChallengeCountRedStatus: function () {
        if (this.guildWarEnemyFlag == 1 && this.guildWarStatus == GuildwarConst.status.processing && this.challengeCount < Config.guild_war_data.data_const.challange_time_limit.val) {
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_count, true)
        } else {
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_count, false)
        }
    },

    //设置联盟战结果
    setGuildWarResult: function (result) {
        this.guildWarResult = result;
    },

    getGuildWarResult: function () {
        return this.guildWarResult
    },

    //设置我方联盟战基础数据(星数、buff等)
    setMyGuildWarBaseInfo: function (data) {
        this.myGuildWarBaseInfo = data || {};
    },

    getMyGuildWarBaseInfo: function () {
        return this.myGuildWarBaseInfo;
    },

    //更新我方联盟战基础数据
    updateMyGuildWarBaseInfo:function(data){
        for(var k in data){
            this.myGuildWarBaseInfo[k] = data[k];
        }
    },

    //更新敌方联盟战基础数据(目前只是星数)
    updateEnemyGuildWarBaseInfo: function (hp) {
        this.enemyGuildWarBaseInfo.hp = hp;
    },

    getEnemyGuildWarBaseInfo: function () {
        return this.enemyGuildWarBaseInfo
    },

    //设置敌方联盟战数据
    setEnemyGuildWarData: function (data) {
        //基础数据
        this.enemyGuildWarBaseInfo.gname = data.gname2 || "";
        this.enemyGuildWarBaseInfo.hp = data.hp2 || 0;
        this.enemyGuildWarBaseInfo.g_id = data.g_id || 0;
        this.enemyGuildWarBaseInfo.g_sid = data.g_sid || "";

        //据点数据
        this.enemyGuildWarPositionList = {};
        for (var k in (data.defense || {})) {
            var pdata = data.defense[k];
            var position_vo = new GuildWarPositionVo();
            position_vo.updateData(pdata);
            this.enemyGuildWarPositionList[pdata.pos] = position_vo
        }
    },

    getEnemyGuildWarPositionList: function () {
        var list = [];
        for (var i in this.enemyGuildWarPositionList) {
            var vo = this.enemyGuildWarPositionList[i];
            if (vo) {
                list.push(vo)
            }
        }
        return list;
    },

    //获取敌方某一据点的当前血量
    getEnemyPositionHpByPos: function (pos) {
        var position_vo = this.enemyGuildWarPositionList[pos];
        if (position_vo) {
            return position_vo.hp;
        }
        return 0
    },

    //敌方是否还有存活的据点
    checkEnemyIsHaveLivePosition: function () {
        var is_have = false;
        for (var k in this.enemyGuildWarPositionList) {
            var vo = this.enemyGuildWarPositionList[k];
            if (vo.hp > 0) {
                is_have = true;
                break
            }
        }
        return is_have;
    },

    //设置联盟战状态数据
    setGuildWarStatus: function (data) {
        this.guildWarStatus = data.status || GuildwarConst.status.close;
        this.guildWarStartTime = data.start_time || 0;
        this.guildWarEndTime = data.end_time || 0;
        this.guildWarEnemyFlag = data.flag || 0;

        //当状态变为未开启时，清掉缓存数据
        if (this.guildWarStatus == GuildwarConst.status.close) {
            this.initConfig();
        }
        this.checkGuildWarStatusRed()
        this.updateChallengeCountRedStatus()
    },

    //更新联盟战状态的红点
    checkGuildWarStatusRed: function () {
        if (this.guildWarEnemyFlag == 1 && this.guildWarStatus == GuildwarConst.status.showing) {
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_match, true);
        } else if (this.guildWarEnemyFlag == 1 && this.guildWarStatus == GuildwarConst.status.processing) {
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_start, true);
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_match, false);
        } else {
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_match, false);
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_start, false);
        }
    },

    getGuildWarStatus: function () {
        return this.guildWarStatus
    },

    getGuildWarSurplusTime: function () {
        return this.guildWarEndTime - gcore.SmartSocket.getTime();
    },

    getGuildWarEnemyFlag: function () {
        return this.guildWarEnemyFlag
    },

    //设置我方联盟战据点数据
    setMyGuildWarPositionData: function (dataList) {
        this.myGuildWarPositionList = {};
        for (var k in dataList) {
            var data = dataList[k];
            var position_vo = new GuildWarPositionVo();
            position_vo.updateData(data);
            this.myGuildWarPositionList[data.pos] = position_vo;
        }
    },

    getMyGuildWarPositionList: function () {
        return this.myGuildWarPositionList
    },

    //更新我方据点数据(变量更)
    updateMyGuildWarPositionData: function (dataList) {
        dataList = dataList || {};
        for (var k in dataList) {
            var data = dataList[k];
            var position_vo = this.myGuildWarPositionList[data.pos];
            if (position_vo) {
                position_vo.updateData(data);
            }
        }
    },

    //更新敌方据点数据(变量更)
    updateEnemyGuildWarPositionData: function (dataList) {
        dataList = dataList || {};
        for (var k in dataList) {
            var data = dataList[k];
            var position_vo = this.enemyGuildWarPositionList[data.pos];
            if (position_vo) {
                position_vo.updateData(data);
            }
        }
    },

    //设置联盟战前三名数据
    setGuildWarTopThreeRank: function (data) {
        this.guildWarTopThreeRank = data;
    },

    getGuildWarTopThreeRank: function () {
        return this.guildWarTopThreeRank
    },

    //更新联盟战红点
    updateGuildWarRedStatus: function (bid, status, is_just_guildwar) {
        if (this.guildwar_red_list == null) {
            this.guildwar_red_list = {};
        }
        var _status = this.guildwar_red_list[bid];
        if (_status == status) return
        this.guildwar_red_list[bid] = status;
        if (!is_just_guildwar) {
            //更新场景红点状态
            var MainuiConst = require("mainui_const");
            require("mainui_controller").getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild, { bid: bid, status: status });
            //更新公会主界面红点
            gcore.GlobalEvent.fire(GuildEvent.UpdateGuildRedStatus, bid, status)
        }
        //更新公会战主界面红点
        gcore.GlobalEvent.fire(GuildwarEvent.UpdateGuildWarRedStatusEvent, bid, status);
    },

    checkRedIsShowByRedType: function (redType) {
        return this.guildwar_red_list[redType] || false;
    },

    checkGuildGuildWarRedStatus: function () {
        for (var k in this.guildwar_red_list) {
            //排除日志红点，日志无需在入口处显示红点
            var v = this.guildwar_red_list[k];
            if (v == true && k != GuildConst.red_index.guildwar_log) {
                return true
            }
        }
        return false
    },

    //设置奖励宝箱数据
    setGuildWarBoxData: function (data) {
        var dataList = data.guild_war_box;
        var result = data.result;
        var status = data.status;
        var end_time = data.end_time;

        if (dataList) {
            this.award_box_data = [];
            for (var k in dataList) {
                var data = dataList[k];
                data.status = result;   // 在这里赋值宝箱类型（金和铜）
                var box_vo = new GuildWarBoxVo();
                box_vo.updateData(data);
                this.award_box_data.push(box_vo);
            }
        }
        var cur_time = gcore.SmartSocket.getTime();
        //是否有权限领取宝箱、是否已到领取截止时间
        if (status && status == 1 && end_time && end_time > cur_time) {
            this.is_can_get_box = true;
        } else {
            this.is_can_get_box = false;
        }
        if (this.is_can_get_box && !this.checkIsGetBoxAward()) {
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_box, true)
        } else {
            this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_box, false)
        }
    },

    //更新宝箱数据
    updateGuildWarBoxData: function (data) {
        if (data) {
            var box_vo = this.getGuildWarDataByOrder(data.order);
            if (box_vo) {
                box_vo.updateData(data)
            }
            if (this.is_can_get_box && !this.checkIsGetBoxAward()) {
                this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_box, true)
            } else {
                this.updateGuildWarRedStatus(GuildConst.red_index.guildwar_box, false)
            }
        }
    },

    //根据序号获取宝箱数据
    getGuildWarDataByOrder: function (order) {
        for (var k in this.award_box_data) {
            var box_vo = this.award_box_data[k];
            if (box_vo.order == order) {
                return box_vo
            }
        }
    },

    //获取全部宝箱数据
    getGuildWarBoxData: function () {
        return this.award_box_data
    },

    //玩家是否领取了宝箱数据
    checkIsGetBoxAward: function () {
        var is_get = false;
        var role_vo = require("role_controller").getInstance().getRoleVo();
        for (var k in this.award_box_data) {
            var box_vo = this.award_box_data[k];
            if (box_vo.rid == role_vo.rid && box_vo.sid == role_vo.srv_id) {
                is_get = true;
                break
            }
        }
        return is_get
    }
});