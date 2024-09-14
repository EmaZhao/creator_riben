// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-24 17:44:54
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var MainuiController = require("mainui_controller");
var GuildbossEvent = require("guildboss_event");
var BattleController = require("battle_controller");
var BattleConst = require("battle_const");
var GuildbossConst = require("guildboss_const");

var GuildbossController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var GuildbossModel = require("guildboss_model");

        this.model = new GuildbossModel();
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
                    this.requestInitProtocal(true);
                    if (this.role_assets_event == null) {
                        this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                            if (key == "guild_lev") {
                                this.requestInitProtocal();
                            } else if (key == "gid") {
                                if (value == 0) {
                                    this.openMainWindow(false);
                                }
                            }
                        }, this)
                    }
                }
            }, this)
        }

        if (this.re_link_game_event == null) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function () {
                this.requestInitProtocal(true);
            }, this)
        }
    },

    //请求或者清除一些基础信息的东西
    requestInitProtocal: function (force) {
        if (this.role_vo == null)
            return
        var config = gdata("guild_dun_data", "data_const", "guild_lev");
        if (config == null)
            return
        if (this.role_vo.gid == 0 || this.role_vo.guild_lev < config.val) {
            this.model.clearGuildBossInfo({});
        } else {
            if (force == true) {
                this.requestGuildDunBaseInfo();
            } else {
                var base_info = this.model.getBaseInfo();
                if (base_info == null || Utils.next(base_info) == null) {
                    this.requestGuildDunBaseInfo();
                }
            }
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(21300, this.handle21300)         // 公会副本的基础信息

        this.RegisterProtocal(21307, this.handle21307)         // 重置返回
        this.RegisterProtocal(21308, this.handle21308)         // 请求挑战返回

        this.RegisterProtocal(21312, this.handle21312)         // 购买挑战次数返回

        this.RegisterProtocal(21318, this.handle21318)         // 公会排行榜
        this.RegisterProtocal(21319, this.handle21319)         // 个人排行榜

        this.RegisterProtocal(21303, this.handle21303)         // 公会宝箱情况
        this.RegisterProtocal(21304, this.handle21304)         // 领取公会宝箱

        this.RegisterProtocal(21309, this.handle21309)         // 战斗结果，用于显示战斗结算
        this.RegisterProtocal(21317, this.handle21317)         // 扫荡结果，用于显示战斗结算

        this.RegisterProtocal(21305, this.handle21305)         // 加buff
        this.RegisterProtocal(21323, this.handle21323)         //集结

    },

    //开关主窗体
    openMainWindow: function (status) {
        if (!status) {
            if (this.main_window) {
                this.main_window.close();
                this.main_window = null;
            }
        } else {
            if (this.role_vo == null || this.role_vo.gid == 0) {
                message(Utils.TI18N("你当前还没有加入任何公会!"));
                return
            }
            var config = gdata("guild_dun_data", "data_const", "guild_lev");
            if (config == null) {
                message(Utils.TI18N("公会副本数据异常!"));
                return
            }
            if (this.role_vo.guild_lev < config.val) {
                message(config.desc);
                return
            }
            var open_data = gdata("function_data", "data_base", [6]);
            var bool = MainuiController.getInstance().checkIsOpenByActivate(open_data.activate);
            if (bool == false) {
                message(open_data.desc);
                return
            }
            if (this.main_window == null) {
                this.main_window = Utils.createClass("guildboss_main_window");
            }
            this.main_window.open();
        }
    },

    //开关boss总览窗体
    openGuildBossPreviewWindow: function (status) {
        if (!status) {
            if (this.boss_preview_window) {
                this.boss_preview_window.close();
                this.boss_preview_window = null;
            }
        } else {
            if (this.boss_preview_window == null) {
                this.boss_preview_window = Utils.createClass("guildboss_preview_window");
            }
            this.boss_preview_window.open();
        }
    },


    //挑战或者扫荡结算面板
    openGuildbossResultWindow: function (status, data) {
        if (!status) {
            if (this.result_window) {
                this.result_window.close();
                this.result_window = null;
            }
        } else {
            if (this.result_window == null) {
                this.result_window = Utils.createClass("guildboss_result_window");
            }
            this.result_window.open(data);
        }
    },


    //伤害排行榜
    openGuildBossRankWindow: function (status, data) {
        if (!status) {
            if (this.rank_window) {
                this.rank_window.close();
                this.rank_window = null;
            }
        } else {
            if (this.rank_window == null) {
                this.rank_window = Utils.createClass("guildboss_rank_window");
            }
            this.rank_window.open(data);
        }
    },

    //打开总览奖励界面
    oepnGuildRewardShowView: function (status) {
        if (!status) {
            if (this.reward_view) {
                this.reward_view.close();
                this.reward_view = null;
            }
        } else {
            if (this.reward_view == null) {
                this.reward_view = Utils.createClass("guildboss_reward_view");
            }
            this.reward_view.open();
        }
    },


    //请求公会副本的基础信息，这个在每次打开面板的时候都请求一下吧
    requestGuildDunBaseInfo: function () {
        this.SendProtocal(21300, {});
    },

    //公会副本的基础信息返回
    handle21300: function (data) {
        this.model.updateGuildDunBaseInfo(data);
        gcore.GlobalEvent.fire(GuildbossEvent.MusterCoolTime, data.coldtime || 0);
    },

    //购买次数提示，FALSE为普通购买次数 TRUE是挑战购买次数
    requestBuyChallengeTimes: function (buy_type) {
        var base_info = this.model.getBaseInfo();
        if (base_info == null || base_info.buy_count == null) return
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo == null) return
        if (base_info.count != 0) {
            message(Utils.TI18N("挑战次数为0时可购买，请努力挑战Boss！"));
            return
        }
        var buy_callback = function (type) {
            var protocal = {};
            protocal.type = type;
            this.SendProtocal(21312, protocal);
        }.bind(this)

        var buy_next_num = base_info.buy_count + 1;
        var buy_config = gdata("guild_dun_data", "data_buy_count", [buy_next_num]);
        if (buy_config == null) {
            message(Utils.TI18N("当前购买次数已到达本日上限"));
        } else {
            if (role_vo.vip_lev < buy_config.vip_lev) {
                var msg = cc.js.formatStr(Utils.TI18N("提升至<color=#289b14>vip%s</c>可提高<color=#289b14>1</c>点次数购买上限，是否前往充值提升vip等级"), buy_config.vip_lev);
                var CommonAlert = require("commonalert");
                CommonAlert.show(msg, Utils.TI18N("我要提升"), function () {
                    require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE)
                }, Utils.TI18N("取消"), null, 2)
            } else {
                var cost = buy_config.expend;
                if (cost == null || Utils.getArrLen(cost) < 2) return
                var item_config = Utils.getItemConfig(cost[0]);
                if (item_config) {
                    var msg = cc.js.formatStr(Utils.TI18N("是否花费 <img src='%s' scale=0.35 />%s 购买<color=#289b14>1</c>点挑战次数？"), item_config.icon, cost[1])
                    var res = PathTool.getItemRes(item_config.icon)
                    var CommonAlert = require("commonalert");
                    CommonAlert.show(msg, Utils.TI18N("确定"), function () {
                        buy_callback(buy_type)
                    }, Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
                }
            }
        }
    },

    //购买次数返回
    handle21312: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.model.updateBaseWithTimes(data.count, data.buy_count, data.type);
    },

    //请求重置公会章节信息
    requestResetGuildDun: function (type) {
        var protocal = {};
        protocal.type = type;
        this.SendProtocal(21307, protocal);
    },

    //重置返回
    handle21307: function (data) {
        message(data.msg);
    },

    //请求挑战指定的boss
    send21308: function (boss_id, formation_type, pos_info, hallows_id) {
        var protocal = {};
        protocal.boss_id = boss_id;
        protocal.formation_type = formation_type;
        protocal.pos_info = pos_info;
        protocal.hallows_id = hallows_id;
        this.SendProtocal(21308, protocal);
    },

    //请求挑战返回
    handle21308: function (data) {
        message(data.msg);
    },


    //更新每日宝箱
    handle21303: function (data) {
        this.model.initDayBoxRewardsStatus(data.bos_list);
    },

    //领取宝箱返回
    handle21304: function (data) {
        message(data.msg)
        if (data.code == 1)
            this.model.updateBoxRewards(data.fid, data.num);
    },

    handle21321: function (data) {
        message(data.msg);
    },

    //集结
    send21323: function () {
        this.SendProtocal(21323, {});
    },

    handle21323: function (data) {
        if (data.code == 0) {
            message(data.msg);
        } else if (data.code == 1) {
            var less_time = data.coldtime - gcore.SmartSocket.getTime();
            gcore.GlobalEvent.fire(GuildbossEvent.MusterCoolTime, less_time || 0);
        }
    },

    //加buff数据
    send21305: function () {
        this.SendProtocal(21305, {});
    },

    handle21305: function (data) {
        message(data.msg);
    },

    //请求排行榜数据
    requestGuildDunRank: function (index, protocal) {
        if (index == GuildbossConst.rank.guild) {
            this.SendProtocal(21327, {});
        } else if (index == GuildbossConst.rank.role) {
            if (protocal)
                this.SendProtocal(21319, protocal);
        }
    },

    //公会排行榜

    handle21318: function (data) {
        gcore.GlobalEvent.fire(GuildbossEvent.UpdateGuildDunRank, data, GuildbossConst.rank.guild)
    },

    //个人排行榜
    handle21319: function (data) {
        this.model.setRaknRoleList(data);
        gcore.GlobalEvent.fire(GuildbossEvent.UpdateGuildDunRank, data, GuildbossConst.rank.role);
    },

    //挑战结果，用于显示结算面板的
    handle21309: function (data) {
        BattleController.getInstance().openFinishView(true, BattleConst.Fight_Type.GuildDun, data);
    },

    //扫荡结算
    handle21317: function (data) {
        message(data.msg);
        if (data.code == 1)
            BattleController.getInstance().openFinishView(true, BattleConst.Fight_Type.GuildDun, data)
    },

    //请求扫荡指定boss
    requestMopupMonster: function (boss_id) {
        var protocal = {};
        protocal.boss_id = boss_id;
        this.SendProtocal(21317, protocal);
    },

    getGuildBossMainRootWnd:function(){
        if(this.main_window){
            return this.main_window.root_wnd;
        }
    }
});

module.exports = GuildbossController;