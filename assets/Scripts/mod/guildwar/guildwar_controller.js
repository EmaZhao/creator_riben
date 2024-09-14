// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-06 17:56:47
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var GuildwarEvent = require("guildwar_event");

var GuildwarController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var Guild_warModel = require("guildwar_model");

        this.model = new Guild_warModel(this);
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.init_role_event == null) {
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                gcore.GlobalEvent.unbind(this.init_role_event);
                this.init_role_event = null;

                this.role_vo = RoleController.getInstance().getRoleVo();
                if (this.role_vo != null) {
                    if (this.role_assets_event == null) {
                        this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                            if (key == "guild_lev") {
                                if (value == 0) { //退出联盟,清掉数据
                                    this.model.initConfig();
                                }
                            }
                        }, this)
                    }
                }
            }, this)
        }
    },

    //登陆时、联盟等级变化时请求
    requestInitProtocal: function () {
        this.reqestGuildWarStatus()
        this.requestAwardBoxData() //公会宝箱红点用到
    },

    //请求联盟战详细数据
    requestGuildWarData: function () {
        this.SendProtocal(24200, {});
    },

    //请求敌方单个据点数据
    requestEnemyPositionData: function (pos) {
        if (!pos) return
        var protocal = {};
        protocal.pos = pos;
        this.SendProtocal(24201, protocal);
    },

    //发起战斗
    requestGuildWarFighting: function (pos, hp, flag) {
        if (!pos) return
        var protocal = {};
        protocal.pos = pos;
        protocal.hp = hp;
        protocal.flag = flag;
        this.SendProtocal(24202, protocal);
    },

    //请求联盟战状态
    reqestGuildWarStatus: function () {
        this.SendProtocal(24204, {});
    },

    //请求对战列表数据
    requestGuildWarBattleList: function () {
        this.SendProtocal(24205, {});
    },

    //请求本方联盟战据点数据
    requestMyGuildPositionData: function () {
        this.SendProtocal(24208, {});
    },

    //请求据点防守记录
    requestPositionDefendData: function (g_id1, g_sid1, pos) {
        var protocal = {};
        protocal.pos = pos;
        protocal.g_id1 = g_id1;
        protocal.g_sid1 = g_sid1;
        this.SendProtocal(24209, protocal);
    },

    //请求战场日志
    requestBattleLogData: function () {
        this.SendProtocal(24212, {});
    },

    //请求联盟战详细排名数据
    requestGuildWarRankData: function () {
        this.SendProtocal(24213, {});
    },

    //请求宝箱数据
    requestAwardBoxData: function () {
        this.SendProtocal(24220, {});
    },

    //请求领取宝箱数据
    requestGetBoxAward: function (order) {
        var protocal = {};
        protocal.order = order;
        this.SendProtocal(24221, protocal);
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(24200, this.handle24200)     // 联盟战详细信息
        this.RegisterProtocal(24201, this.handle24201)     // 敌方单个据点信息
        this.RegisterProtocal(24202, this.handle24202)     // 发起战斗
        this.RegisterProtocal(24203, this.handle24203)     // 战斗结果
        this.RegisterProtocal(24204, this.handle24204)     // 联盟战的状态
        this.RegisterProtocal(24205, this.handle24205)     // 对战列表
        this.RegisterProtocal(24206, this.handle24206)     // 据点数据更新(只更新有变化的)
        this.RegisterProtocal(24207, this.handle24207)     // 联盟战基础数据更新（星数、buff等）
        this.RegisterProtocal(24208, this.handle24208)     // 本方联盟战据点数据
        this.RegisterProtocal(24209, this.handle24209)     // 防守记录
        this.RegisterProtocal(24210, this.handle24210)     // 有新的日志产生
        this.RegisterProtocal(24212, this.handle24212)     // 战场日志
        this.RegisterProtocal(24213, this.handle24213)     // 联盟战详细排名
        this.RegisterProtocal(24214, this.handle24214)     // 联盟战结果
        this.RegisterProtocal(24220, this.handle24220)     // 联盟战宝箱数据
        this.RegisterProtocal(24221, this.handle24221)     // 领取联盟战宝箱
        this.RegisterProtocal(24223, this.handle24223)     // 更新单个联盟战宝箱
    },

    //联盟战数据
    handle24200: function (data) {
        data = data || {};
        if (data.count) {     //已挑战次数
            this.model.setGuildWarChallengeCount(data.count);
        }
        if (data.result) {
            this.model.setGuildWarResult(data.result);
        }
        if (data.ranks) {
            this.model.setGuildWarTopThreeRank(data.ranks);
        }
        //我方联盟基础信息
        var myBaseInfo = {};
        myBaseInfo.gname = data.gname1;
        myBaseInfo.hp = data.hp1;
        myBaseInfo.buff_lev = data.buff_lev1;
        this.model.setMyGuildWarBaseInfo(myBaseInfo);
        //敌方联盟数据
        this.model.setEnemyGuildWarData(data);
        gcore.GlobalEvent.fire(GuildwarEvent.GuildWarEnemyPositionDataInitEvent);
    },

    //敌方单个据点数据
    handle24201: function (data) {
        if (data && this.attk_position_window) {
            this.attk_position_window.setData(data);
        }
    },

    //发起战斗
    handle24202: function (data) {
        message(data.msg);
        if (data.code == 1) {
            this.model.setGuildWarChallengeCount(data.count);
            gcore.GlobalEvent.fire(GuildwarEvent.UpdateGuildwarChallengeCountEvent);
            this.openAttkPositionWindow(false);
            this.openAttkLookWindow(false);
        }
    },

    //挑战据点的战斗结果
    handle24203: function (data) {
        var BattleConst = require("battle_const");
        require("battle_controller").getInstance().openFinishView(true, BattleConst.Fight_Type.GuildWar, data)
    },

    //联盟战状态
    handle24204: function (data) {
        if (data) {
            this.model.setGuildWarStatus(data);
            gcore.GlobalEvent.fire(GuildwarEvent.UpdateGuildWarStatusEvent, data.status, data.flag)
        }
    },

    //联盟战对阵列表
    handle24205: function (data) {
        if (data && this.battle_list_window) {
            this.battle_list_window.setData(data);
        }
    },

    //据点数据更新(本方与对方都走这里，变量更)
    handle24206: function (data) {
        if (data) {
            if (data.flag && data.flag == 1) {
                this.model.updateMyGuildWarPositionData(data.defense);
            } else {
                this.model.updateEnemyGuildWarPositionData(data.defense);
            }
        }
    },

    //联盟战基础数据更新(星数、buff等)
    handle24207: function (data) {
        if (data) {
            if (data.result) {
                this.model.setGuildWarResult(data.result)
            }
            if (data.hp && data.buff_lev) {
                var myBaseInfo = {};
                myBaseInfo.hp = data.hp;
                myBaseInfo.buff_lev = data.buff_lev;
                this.model.updateMyGuildWarBaseInfo(myBaseInfo);
            }
            if (data.hp2) {
                this.model.updateEnemyGuildWarBaseInfo(data.hp2);
            }
            if (data.ranks) {
                this.model.setGuildWarTopThreeRank(data.ranks);
            }
            gcore.GlobalEvent.fire(GuildwarEvent.UpdateGuildWarBaseInfoEvent)
        }
    },

    //本方据点数据
    handle24208: function (data) {
        if (data) {
            this.model.setMyGuildWarPositionData(data.defense);
            gcore.GlobalEvent.fire(GuildwarEvent.GetGuildWarMyPositionDataEvent)
        }
    },

    //防守记录
    handle24209: function (data) {
        if (data && this.defend_look_window) {
            this.defend_look_window.setData(data);
        }
    },

    //有新的日志产生
    handle24210: function () {
        var GuildConst = require("guild_const");
        this.model.updateGuildWarRedStatus(GuildConst.red_index.guildwar_log, true, true)
    },

    //战场日志
    handle24212: function (data) {
        if (this.battle_log_window && data) {
            this.battle_log_window.setData(data.guild_war_log);
        }
    },

    //联盟战详细排名
    handle24213: function (data) {
        if (data) {
            gcore.GlobalEvent.fire(GuildwarEvent.UpdateGuildWarRankDataEvent, data.ranks);
        }
    },

    //联盟战结果
    handle24214: function (data) {
        if (data && data.result) {
            this.model.setGuildWarResult(data.result);
            gcore.GlobalEvent.fire(GuildwarEvent.UpdateGuildWarBaseInfoEvent)
        }
    },

    //联盟战宝箱数据
    handle24220: function (data) {
        if (data) {
            this.model.setGuildWarBoxData(data);
            gcore.GlobalEvent.fire(GuildwarEvent.UpdateGuildWarBoxDataEvent, data);
        }
    },

    //领取宝箱
    handle24221: function (data) {
        message(data.msg);
    },

    //更新单个宝箱数据
    handle24223: function (data) {
        if (data) {
            this.model.updateGuildWarBoxData(data);
            //判断一下是否为玩家自己领取了宝箱，更新界面领取状态
            if (this.role_vo && data.rid == this.role_vo.rid && data.sid == this.role_vo.srv_id) {
                gcore.GlobalEvent.fire(GuildwarEvent.UpdateMyAwardBoxEvent)
            }
        }
    },

    //-----------------------------------------------界面
    //打开联盟战主界面
    openMainWindow: function (status) {
        if (status == false) {
            if (this.main_window) {
                this.main_window.close();
                this.main_window = null;
            }
        } else {
            if (IS_SHOW_CHARGE == false) {
                message(Utils.TI18N("功能暂未开放，敬请期待"));
                return
            }
            if (this.role_vo == null || this.role_vo.gid == 0) {
                message(Utils.TI18N("您当前未加入任何公会，加入公会后才能参与该玩法！"));
                return
            }
            var config = Config.guild_war_data.data_const.limit_lev;
            if (config == null) {
                message(Utils.TI18N("公会战数据异常!"));
                return
            }
            if (this.role_vo.guild_lev < config.val) {
                message(Utils.TI18N("您所在的公会未达参赛条件，不能参与哦，请努力提高公会等级！"));
                return
            }
            if (this.main_window == null) {
                this.main_window = Utils.createClass("guildwar_main_window");
            }
            this.main_window.open();
        }
    },

    //打开进攻一览
    openAttkLookWindow: function (status) {
        if (status == false) {
            if (this.attk_look_window) {
                this.attk_look_window.close();
                this.attk_look_window = null;
            }
        } else {
            if (this.attk_look_window == null) {
                this.attk_look_window = Utils.createClass("guildwar_attk_look_window");
            }
            this.attk_look_window.open();
        }
    },

    //打开防守记录
    openDefendLookWindow: function (status, g_id, g_sid, pos) {
        if (status == false) {
            if (this.defend_look_window) {
                this.defend_look_window.close();
                this.defend_look_window = null;
            }
        } else {
            if (this.defend_look_window == null) {
                this.defend_look_window = Utils.createClass("guildwar_defend_look_window");
            }
            this.defend_look_window.open({g_id:g_id, g_sid:g_sid, pos:pos});
        }
    },

    //打开对阵列表
    openBattleListWindow: function (status) {
        if (status == false) {
            if (this.battle_list_window) {
                this.battle_list_window.close();
                this.battle_list_window = null;
            }
        } else {
            if (this.battle_list_window == null) {
                this.battle_list_window = Utils.createClass("guildwar_battle_list_window");
            }
            this.battle_list_window.open();
        }
    },

    //打开战场日志
    openBattleLogWindow: function (status) {
        if (status == false) {
            if (this.battle_log_window) {
                this.battle_log_window.close();
                this.battle_log_window = null;
            }
        } else {
            if (this.battle_log_window == null) {
                this.battle_log_window = Utils.createClass("guildwar_battle_log_window");
            }
            this.battle_log_window.open();
        }
    },

    //打开战绩奖励
    openGuildWarAwardWindow: function (status) {
        if (status == false) {
            if (this.guildwar_award_window) {
                this.guildwar_award_window.close();
                this.guildwar_award_window = null;
            }
        } else {
            if (this.guildwar_award_window == null) {
                this.guildwar_award_window = Utils.createClass("guildwar_award_window");
            }
            this.guildwar_award_window.open();
        }
    },

    //打开挑战据点界面
    openAttkPositionWindow: function (status, pos) {
        if (status == false) {
            if (this.attk_position_window) {
                this.attk_position_window.close();
                this.attk_position_window = null;
            }
        } else {
            if (this.attk_position_window == null) {
                this.attk_position_window = Utils.createClass("guildwar_attk_position_window");
            }
            this.attk_position_window.open(pos);
        }
    },

    //打开战绩排行榜界面
    openGuildWarRankView: function (status, pos) {
        if (status == false) {
            if (this.guildwar_rank_window) {
                this.guildwar_rank_window.close();
                this.guildwar_rank_window = null;
            }
        } else {
            if (this.guildwar_rank_window == null) {
                this.guildwar_rank_window = Utils.createClass("guildwar_rank_window");
            }
            this.guildwar_rank_window.open(pos);
        }
    },

    //判断是否开启联盟战
    checkIsCanOpenGuildWarWindow: function (not_tips) {
        var isOpen = true;
        var limit_lev = Config.guild_war_data.data_const.limit_lev.val;
        var config_day = Config.guild_war_data.data_const.limit_open_time;      //开服天数限制
        var role_vo = RoleController.getInstance().getRoleVo();
        var open_srv_day = RoleController.getInstance().getModel().getOpenSrvDay();
        if (!role_vo.isHasGuild()) {
            if (!not_tips) {
                message(Utils.TI18N("您当前未加入任何公会，加入公会后才能参与该玩法！"))
            }
            isOpen = false;
        } else if (role_vo.guild_lev < limit_lev) {
            if (!not_tips) {
                message(Utils.TI18N("您所在的公会未达参赛条件，不能参与哦，请努力提高公会等级！"))
            }
            isOpen = false;
        } else if (open_srv_day <= config_day.val) {
            if (!not_tips) {
                message(config_day.desc);
            }
            isOpen = false;
        }
        return isOpen, limit_lev
    },

    //打开公会战宝箱奖励
    openAwardBoxWindow: function (status) {
        if (status == false) {
            if (this.award_box_window) {
                this.award_box_window.close();
                this.award_box_window = null;
            }
        } else {
            if (this.award_box_window == null) {
                this.award_box_window = Utils.createClass("guildwar_award_box_window");
            }
            this.award_box_window.open();
        }
    },

    //打开宝箱奖励预览
    openAwardBoxPreview: function (status) {
        if (status == false) {
            if (this.award_box_preview) {
                this.award_box_preview.close();
                this.award_box_preview = null;
            }
        } else {
            if (this.award_box_preview == null) {
                this.award_box_preview = Utils.createClass("guildwar_award_box_preview");
            }
            this.award_box_preview.open();
        }
    }
});

module.exports = GuildwarController;