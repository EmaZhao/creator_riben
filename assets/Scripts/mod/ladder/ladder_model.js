// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      跨服天梯model
// <br/>Create: 2019-07-24 10:23:54
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var MainSceneController = require("mainscene_controller");
var SceneConst = require("scene_const");
var LadderEvent = require("ladder_event");

var LadderModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.myBaseInfo = {};      // 个人数据
        this.enemyListData = [];	  // 挑战对手数据
        this.ladderOpenStatus = 0; // 天梯是否开启

        this.guildwar_red_list = {};	// 红点数据
    },

    //个人数据
    setLadderMyBaseInfo: function (data) {
        this.myBaseInfo = data;
    },

    getLadderMyBaseInfo: function () {
        return this.myBaseInfo;
    },

    //获取剩余挑战次数
    getLeftChallengeCount: function () {
        if (this.myBaseInfo) {
            return this.myBaseInfo.can_combat_num || 0;
        }
        return 0
    },

    //获取今日购买次数
    getTodayBuyCount: function () {
        if (this.myBaseInfo) {
            return this.myBaseInfo.buy_combat_num || 0;
        }
        return 0
    },

    //获取今日剩余购买次数
    getTodayLeftBuyCount: function () {
        let role_vo = RoleController.getInstance().getRoleVo();
        let buy_count = this.myBaseInfo.buy_combat_num || 0;
        let max_count = 0;
        for (let k in Config.sky_ladder_data.data_buy_num) {
            let v = Config.sky_ladder_data.data_buy_num[k];
            if (v.vip <= role_vo.vip_lev) {
                max_count = max_count + 1;
            }
        }
        let left_count = max_count - buy_count;
        if (left_count < 0) {
            left_count = 0;
        }
        return left_count
    },

    //设置挑战对手数据
    setLadderEnemyListData: function (data) {
        this.enemyListData = data || {};
    },

    updateLadderEnemyListData: function (data) {
        data = data || {};
        for (let k in data) {
            let newData = data[k];
            for (let _ in this.enemyListData) {
                let oldData = this.enemyListData[_];
                if (newData.idx == oldData.idx) {
                    for (let key in newData) {
                        oldData[key] = newData[key];
                    }
                    break
                }
            }
        }
    },

    getLadderEnemyListData: function () {
        return this.enemyListData
    },

    getLadderEnemyDataByIndex: function (index) {
        let enemy_data = {};
        for (let k in this.enemyListData) {
            let eData = this.enemyListData[k];
            if (eData.idx == index) {
                enemy_data = eData;
                break
            }
        }
        return enemy_data
    },

    //天梯是否开启
    setLadderOpenStatus: function (status) {
        this.ladderOpenStatus = status;
    },

    //天梯活动是否开启
    getLadderIsOpen: function () {
        return this.ladderOpenStatus && this.ladderOpenStatus == 1;
    },

    //是否满足天梯功能开启条件 not_tips 不飘字提示
    getLadderOpenStatus: function (not_tips) {
        not_tips = not_tips || false;
        let role_vo = RoleController.getInstance().getRoleVo();
        let config = config.sky_ladder_data.data_const.join_min_lev;
        if (config && config.val <= role_vo.lev) {
            return { bool: false }
        } else {
            if (!not_tips) {
                message(config.desc);
            }
            return { bool: false, desc: config.desc }
        }
    },

    //更新天梯红点
    updateLadderRedStatus: function (bid, status) {
        RedMgr.getInstance().addCalHandler(function () {
            let _status = this.guildwar_red_list[bid];
            if (_status == status) return
            this.guildwar_red_list[bid] = status;
            //更新主界面图标红点
            let ladder_status = this.checkLadderRedStatus();
            MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.ladder, { bid: CrossgroundConst.Red_Type.ladder, status: ladder_status })
            //更新天梯界面红点
            gcore.GlobalEvent.fire(LadderEvent.UpdateLadderRedStatus, bid, status);
        }.bind(this), RedIds.Ladder)
    },

    checkRedIsShowByRedType: function (redType) {
        return this.guildwar_red_list[redType] || false
    },

    checkLadderRedStatus: function () {
        for (let k in this.guildwar_red_list) {
            let v = this.guildwar_red_list[k];
            if (v == true) {
                return true
            }
        }
        return false
    }
});