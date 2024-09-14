// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      跨服天梯ctrl
// <br/>Create: 2019-07-24 10:23:54
// --------------------------------------------------------------------
var LadderEvent = require("ladder_event");
var BattleController = require("battle_controller");
var BattleConst = require("battle_const");
var CommonAlert = require("commonalert");
var RoleController = require("role_controller");

var LadderController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var LadderModel = require("ladder_model");

        this.model = new LadderModel();
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
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(24300, this.handle24300)     // 个人数据
        this.RegisterProtocal(24301, this.handle24301)     // 挑战对手列表
        this.RegisterProtocal(24302, this.handle24302)     // 对手数据
        this.RegisterProtocal(24303, this.handle24303)     // 挑战对手
        this.RegisterProtocal(24304, this.handle24304)     // 刷新对手
        this.RegisterProtocal(24305, this.handle24305)     // 购买挑战次数
        this.RegisterProtocal(24306, this.handle24306)     // 一键挑战
        this.RegisterProtocal(24307, this.handle24307)     // 挑战结算
        this.RegisterProtocal(24308, this.handle24308)     // 前三名玩家数据
        this.RegisterProtocal(24309, this.handle24309)     // 排行榜数据
        this.RegisterProtocal(24310, this.handle24310)     // 我的记录
        this.RegisterProtocal(24311, this.handle24311)     // 大神风采
        this.RegisterProtocal(24312, this.handle24312)     // 天梯是否开启
        this.RegisterProtocal(24313, this.handle24313)     // 英雄殿红点
        this.RegisterProtocal(24314, this.handle24314)     // 战报红点
        this.RegisterProtocal(24315, this.handle24315)     // 清除cd时间
        this.RegisterProtocal(24316, this.handle24316)     // 查看英雄信息
        this.RegisterProtocal(24317, this.handle24317)     // 挑战次数红点
        this.RegisterProtocal(24318, this.handle24318)     // 录像分享
    },

    //请求天梯个人信息
    requestLadderMyBaseInfo: function () {
        this.SendProtocal(24300, {});
    },

    //请求挑战列表
    requestLadderEnemyListData: function () {
        this.SendProtocal(24301, {});
    },

    //请求玩家信息
    requestLadderEnemyData: function (rid, srv_id) {
        let protocal = {}
        protocal.rid = rid
        protocal.srv_id = srv_id
        this.SendProtocal(24302, protocal);
    },

    //请求挑战玩家
    requestChallengeEnemy: function (rid, srv_id) {
        let protocal = {}
        protocal.rid = rid
        protocal.srv_id = srv_id
        this.SendProtocal(24303, protocal);
    },

    //请求刷新对手列表
    requestRefreshEnemyList: function () {
        this.SendProtocal(24304, {});
    },

    //请求购买挑战次数
    requestBuyChallengeCount: function () {
        this.SendProtocal(24305, {});
    },

    //请求一键挑战
    requestQuickChallenge: function () {
        this.SendProtocal(24306, {});
    },

    //请求前三名玩家数据（英雄殿）
    requestTopThreeRoleData: function () {
        this.SendProtocal(24308, {});
    },

    //请求排行榜信息
    requestLadderRankData: function () {
        this.SendProtocal(24309, {});
    },

    //请求日志记录
    requestMyLogData: function () {
        this.SendProtocal(24310, {});
    },

    //请求大神风采
    requestGodLogData: function () {
        this.SendProtocal(24311, {});
    },

    //请求天梯是否开启
    requestLadderIsOpen: function () {
        this.SendProtocal(24312, {});
    },

    //请求清除冷却时间
    requestCleanCDTime: function () {
        this.SendProtocal(24315, {});
    },

    //请求查看英雄信息
    requestCheckRoleInfo: function (rid, srv_id, pos) {
        let protocal = {}
        protocal.rid = rid
        protocal.srv_id = srv_id
        protocal.pos = pos
        this.SendProtocal(24316, protocal);
    },

    //请求天梯录像分享
    requestShareVideo: function (replay_id, srv_id, channel, target_name) {
        let protocal = {}
        protocal.replay_id = replay_id
        protocal.srv_id = srv_id
        protocal.channel = channel
        protocal.target_name = target_name
        this.SendProtocal(24316, protocal);
    },

    //-----------------------------------------------
    //个人数据
    handle24300: function (data) {
        if (data) {
            this.model.setLadderMyBaseInfo(data);
        }
        gcore.GlobalEvent.fire(LadderEvent.UpdateLadderMyBaseInfo);
    },

    //挑战对手列表
    handle24301: function (data) {
        if (data) {
            if (data.type == 0) {     //全部更新
                this.model.setLadderEnemyListData(data.f_list);
            } else {      //部分更新
                this.model.updateLadderEnemyListData(data.f_list);
            }
            gcore.GlobalEvent.fire(LadderEvent.UpdateAllLadderEnemyList);
        }
    },

    //对手数据
    handle24302: function (data) {
        if (data) {
            gcore.GlobalEvent.fire(LadderEvent.GetLadderEnemyData, data);
        }
    },

    //挑战对手
    handle24303: function (data) {
        message(data.msg);
        this.openLadderRoleInfoWindow(false);
    },

    //刷新对手
    handle24304: function (data) {
        message(data.msg);
    },

    //购买挑战次数
    handle24305: function (data) {
        message(data.msg);
        if (data.code == 1 && this._temp_rid != null && this._temp_srv_id != null) {
            this.requestChallengeEnemy(this._temp_rid, this._temp_srv_id);
            this._temp_rid = null;
            this._temp_srv_id = null;
        } else if (data.code == 1 && this._temp_quick_flag) {
            this.requestQuickChallenge();
            this._temp_quick_flag = null;
        }
    },

    //一键挑战
    handle24306: function (data) {
        message(data.msg);
    },

    //挑战结算
    handle24307: function (data) {
        BattleController.getInstance().openFinishView(true, BattleConst.Fight_Type.LadderWar, data)
    },

    //前三名数据
    handle24308: function (data) {
        if (data && data.rank_list) {
            gcore.GlobalEvent.fire(LadderEvent.UpdateLadderTopThreeRoleData, data.rank_list)
        }
    },

    //排行榜数据
    handle24309: function (data) {
        if (data) {
            gcore.GlobalEvent.fire(LadderEvent.UpdateLadderRankData, data);
        }
    },

    //我的记录
    handle24310: function (data) {
        if (data) {
            gcore.GlobalEvent.fire(LadderEvent.UpdateLadderMyLogData, data);
        }
    },

    //大神风采
    handle24311: function (data) {
        if (data) {
            gcore.GlobalEvent.fire(LadderEvent.UpdateLadderGodLogData, data);
        }
    },

    //天梯是否开启
    handle24312: function (data) {
        if (data) {
            this.model.setLadderOpenStatus(data.code);
            gcore.GlobalEvent.fire(LadderEvent.UpdateLadderOpenStatus);
        }
    },

    //英雄殿红点
    handle24313: function (data) {
        if (data.code != null) {
            if (!this._login_flag && data.code == 1) {
                this._login_flag = true;
                this.model.updateLadderRedStatus(LadderConst.RedType.TopThree, true);
            } else {
                this.model.updateLadderRedStatus(LadderConst.RedType.TopThree, false);
            }
        }
    },

    //英雄殿红点
    handle24314: function (data) {
        if (data.code != null) {
            gcore.GlobalEvent.fire(LadderConst.RedType.BattleLog, data.code == 1);
        }
    },

    //清除cd时间
    handle24315: function (data) {
        message(data.msg)
    },

    //查看英雄
    handle24316: function (data) {
        message(data.msg)
    },

    //挑战次数红点
    handle24317: function (data) {
        if (data.code != null) {
            gcore.GlobalEvent.fire(LadderConst.RedType.Challenge, data.code == 1);
        }
    },

    //录像分享
    handle24318: function (data) {
        message(data.msg)
    },

    //检测挑战次数并且进入战斗
    checkJoinLadderBattle: function (rid, srv_id, is_quick) {
        if (this.model.getLeftChallengeCount() > 0) {
            if (is_quick) {
                this.requestQuickChallenge();
            } else {
                this.requestChallengeEnemy(rid, srv_id)
            }
        } else if (this.model.getTodayLeftBuyCount() > 0) {
            let buy_combat_num = this.model.getTodayBuyCount();
            let cost_config = Config.sky_ladder_data.data_buy_num[buy_combat_num + 1];
            if (cost_config) {
                if (is_quick) {
                    let res = PathTool.getItemRes(3);
                    let str = cc.js.formatStr(Utils.TI18N("挑战次数不足，是否消耗<img src='%s'/>%d购买一次挑战次数并且进行一键挑战？"), 3, cost_config.cost);
                    CommonAlert.show(str, Utils.TI18N("确定"), function () {
                        this._temp_quick_flag = true;
                        this.requestBuyChallengeCount();
                    }.bind(this), Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
                } else {
                    let res = PathTool.getItemRes(3);
                    let str = cc.js.formatStr(TI18N("挑战次数不足，是否消耗<img src='%s'/>%d购买一次挑战次数并且进入战斗？"), 3, cost_config.cost);
                    CommonAlert.show(str, Utils.TI18N("确定"), function () {
                        //缓存布阵数据，购买次数成功返回后直接进入战斗
                        this._temp_rid = rid;
                        this._temp_srv_id = srv_id;
                        this.requestBuyChallengeCount();
                        this.openLadderRoleInfoWindow(false);
                    }.bind(this), Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
                }
            }
        } else {
            message(Utils.TI18N("挑战次数不足"));
            this.openLadderRoleInfoWindow(false);
        }
    },

    //-----------------------打开界面------------
    //天梯主界面
    openMainWindow: function (status) {
        if (status) {
            let role_vo = RoleController.getInstance().getRoleVo();
            var config = Config.sky_ladder_data.data.const.join_min_lev;
            if (role_vo.lev < config.val) {
                message(config.desc);
                return
            }
            if (this.ladder_main_window == null) {
                this.ladder_main_window = Utils.createClass("ladder_main_window");
            }
            this.ladder_main_window.open();
        } else {
            if (this.ladder_main_window) {
                this.ladder_main_window.close();
                this.ladder_main_window = null;
            }
        }
    },

    //天梯商店
    openLadderShopWindow: function (status) {
        if (status) {
            if (this.ladder_shop_window == null) {
                this.ladder_shop_window = Utils.createClass("ladder_shop_window");
            }
            this.ladder_shop_window.open();
        } else {
            if (this.ladder_shop_window) {
                this.ladder_shop_window.close();
                this.ladder_shop_window = null;
            }
        }
    },

    //天梯对手信息
    openLadderRoleInfoWindow: function (status, data) {
        if (status) {
            if (this.ladder_role_info_window == null) {
                this.ladder_role_info_window = Utils.createClass("ladder_role_info_window");
            }
            this.ladder_role_info_window.open(data);
        } else {
            if (this.ladder_role_info_window) {
                this.ladder_role_info_window.close();
                this.ladder_role_info_window = null;
            }
        }
    },

    //天梯战报
    openLadderLogWindow: function (status) {
        if (status) {
            if (this.ladder_log_window == null) {
                this.ladder_log_window = Utils.createClass("ladder_log_window");
            }
            this.ladder_log_window.open();
        } else {
            if (this.ladder_log_window) {
                this.ladder_log_window.close();
                this.ladder_log_window = null;
            }
        }
    },

    //天梯奖励
    openLadderAwardWindow: function (status) {
        if (status) {
            if (this.ladder_award_window == null) {
                this.ladder_award_window = Utils.createClass("ladder_award_window");
            }
            this.ladder_award_window.open();
        } else {
            if (this.ladder_award_window) {
                this.ladder_award_window.close();
                this.ladder_award_window = null;
            }
        }
    },

    //天梯排行榜
    openLadderRankWindow: function (status) {
        if (status) {
            if (this.ladder_rank_window == null) {
                this.ladder_rank_window = Utils.createClass("ladder_rank_window");
            }
            this.ladder_rank_window.open();
        } else {
            if (this.ladder_rank_window) {
                this.ladder_rank_window.close();
                this.ladder_rank_window = null;
            }
        }
    },

    //天梯英雄殿
    openLadderTopThreeWindow: function (status) {
        if (status) {
            if (this.ladder_top_three_window == null) {
                this.ladder_top_three_window = Utils.createClass("ladder_top_three_window");
            }
            this.ladder_top_three_window.open();
        } else {
            if (this.ladder_top_three_window) {
                this.ladder_top_three_window.close();
                this.ladder_top_three_window = null;
            }
        }
    },

    //天梯结算界面
    openLadderBattleResultWindow: function (status, data) {
        if (status) {
            if (this.ladder_result_window == null) {
                this.ladder_result_window = Utils.createClass("ladder_battle_result_window");
            }
            this.ladder_result_window.open(data);
        } else {
            if (this.ladder_result_window) {
                this.ladder_result_window.close();
                this.ladder_result_window = null;
            }
        }
    }
});

module.exports = LadderController;