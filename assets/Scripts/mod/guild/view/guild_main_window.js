// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会主窗体
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildBossController = require("guildboss_controller");
var GuildskillController = require("guildskill_controller");
var RedbagController = require("redbag_controller");
var GuildWarController = require("guildwar_controller");
var RoleController = require("role_controller");
var GuildConst = require("guild_const");
var GuildEvent = require("guild_event");
var RoleEvent = require("role_event");

var TaskMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_main_window");
        this.win_type = WinType.Full;
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.rleasePrefab = false;

        this.ctrl = GuildController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.gb_model = GuildBossController.getInstance().getModel();
        this.skill_model = GuildskillController.getInstance().getModel();
        this.redbag_model = RedbagController.getInstance().getModel();
        this.gw_model = GuildWarController.getInstance().getModel();
    },



    openCallBack: function () {
        var main_container = this.seekChild("main_container");
        var main_panel = this.seekChild(main_container, "main_panel");
        this.seekChild(main_panel, "win_title", cc.Label).string = Utils.TI18N("公会");
        this.main_view = this.seekChild(main_panel, "container");
        this.sign_btn = this.seekChild(this.main_view, "sign_btn", cc.Button);
        this.guild_sign_value = this.seekChild(this.main_view, "guild_sign_value", cc.Label);
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("bigbg_2"),function(res){
            this.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))
        this.change_name_btn = this.seekChild(this.main_view, "change_name_btn", cc.Button);

        this.action_goal_btn = this.seekChild(this.main_view, "action_goal_btn", cc.Button);
        this.redpacket_btn = this.seekChild(this.main_view, "redpacket_btn", cc.Button);
        this.redpacket_btn.tips = this.seekChild(this.redpacket_btn.node, "tips");
        this.donate_btn = this.seekChild(this.main_view, "donate_btn", cc.Button);
        this.donate_btn.tips = this.seekChild(this.donate_btn.node, "tips");
        this.rank_btn = this.seekChild(this.main_view, "skill_btn", cc.Button);

        this.shop_container = this.seekChild(this.main_view, "shop_container");//公会商店标签
        this.shop_container.notice = this.seekChild(this.main_view, "guild_shop_notice", cc.Label);
        this.shop_container.tips = this.seekChild(this.shop_container, "tips");//红点状态
        this.shop_container.tips.active = false;
        this.shop_container.is_unlock = true;//解锁状态

        this.war_container = this.seekChild(this.main_view, "war_container");
        this.war_container.notice = this.seekChild(this.main_view, "guild_war_notice", cc.Label);
        this.war_container.tips = this.seekChild(this.war_container, "tips");
        this.war_container.tips.active = false;
        this.war_container.is_unlock = false;
        this.war_container.notice.node.active = false;
        this.war_container.notice.string = Utils.TI18N("敬请期待");

        this.dungeon_container = this.seekChild(this.main_view, "dungeon_container");
        this.dungeon_container.notice = this.seekChild(this.main_view, "guild_dun_notice", cc.Label);
        this.dungeon_container.tips = this.seekChild(this.dungeon_container, "tips");
        this.dungeon_container.is_unlock = false;

        this.skill_container = this.seekChild(this.main_view, "voyage_container");
        this.skill_container.notice = this.seekChild(this.main_view, "guild_voyage_notice", cc.Label);
        this.skill_container.tips = this.seekChild(this.skill_container, "tips");
        this.skill_container.is_unlock = false;

        this.check_member_btn = this.seekChild(this.main_view, "rank_btn", cc.Button);
        this.recruit_btn = this.seekChild(this.main_view, "recruit_btn", cc.Button);
        this.checkapply_btn = this.seekChild(this.main_view, "checkapply_btn", cc.Button);
        this.joinset_btn = this.seekChild(this.main_view, "joinset_btn", cc.Button);
        this.checkapply_btn.tips = this.seekChild(this.checkapply_btn.node, "tips");

        this.guild_name_value = this.seekChild(this.main_view, "guild_name_value", cc.Label);
        this.guild_leader_value = this.seekChild(this.main_view, "guild_leader_value", cc.Label);
        this.guild_lev_value = this.seekChild(this.main_view, "guild_lev_value", cc.Label);
        this.guild_exp_value = this.seekChild(this.main_view, "guild_exp_value", cc.Label);
        this.guild_member_value = this.seekChild(this.main_view, "guild_member_value", cc.Label);

        Utils.getNodeCompByPath("container/action_goal_btn/label", main_panel, cc.Label).string = Utils.TI18N("公会商店");
        Utils.getNodeCompByPath("container/redpacket_btn/label", main_panel, cc.Label).string = Utils.TI18N("公会红包");
        Utils.getNodeCompByPath("container/donate_btn/label", main_panel, cc.Label).string = Utils.TI18N("公会捐献");
        Utils.getNodeCompByPath("container/skill_btn/label", main_panel, cc.Label).string = Utils.TI18N("公会排名");
        Utils.getNodeCompByPath("container/rank_btn/label", main_panel, cc.Label).string = Utils.TI18N("查看成员");
        Utils.getNodeCompByPath("container/checkapply_btn/label", main_panel, cc.Label).string = Utils.TI18N("查看申请");
        Utils.getNodeCompByPath("container/joinset_btn/label", main_panel, cc.Label).string = Utils.TI18N("入会设置");
        Utils.getNodeCompByPath("container/recruit_btn/label", main_panel, cc.Label).string = Utils.TI18N("发布招募");
    },


    registerEvent: function () {
        this.sign_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openGuildChangeSignWindow(true);
        }, this)
        this.change_name_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openGuildChangeNameWindow(true);
        }, this)
        this.action_goal_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            require("mall_controller").getInstance().openMallPanel(true, require("mall_const").MallType.UnionShop);
        }, this)
        this.redpacket_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            RedbagController.getInstance().openMainView(true);
        }, this)
        this.donate_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openGuildDonateWindow(true);
        }, this)
        this.rank_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            require("rank_controller").getInstance().openRankView(true, require("rank_constant").RankType.union);
        }, this)
        this.shop_container.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if (this.role_vo != null) {
                var lev = gdata("guild_quest_data", "data_guild_action_data", "open_glev").val;
                if (this.role_vo.guild_lev >= lev)
                    this.ctrl.openGuildActionGoalWindow(true);
                else
                    message(cc.js.formatStr(Utils.TI18N("联盟达到%d级后开启"), lev));
            }
        }, this)
        this.war_container.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(require("battle_const").Fight_Type.GuildWar);
            //清除掉联盟战开启的红点
            this.gw_model.updateGuildWarRedStatus(GuildConst.red_index.guildwar_start, false);
        }, this)
        this.dungeon_container.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(require("battle_const").Fight_Type.GuildDun);
        }, this)
        this.skill_container.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            GuildskillController.getInstance().openGuildSkillMainWindow(true);
        }, this)
        this.check_member_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openGuildMemberWindow(true);
        }, this)
        this.recruit_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.requestGuildRecruit();
        }, this)
        this.checkapply_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openGuildApplyWindow(true);
        }, this)
        this.joinset_btn.node.on("click", function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openGuildApplySetWindow(true);
        }, this)

        if (this.role_vo != null) {
            if (this.role_assets_event == null) {
                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (key == "position")
                        this.updateJurisdiction();
                }, this)
            }
        }

        this.addGlobalEvent(GuildEvent.UpdateGuildRedStatus, function (type, status) {
            this.updateSomeRedStatus(type, status);
        }, this)

        //监听开服天数变化
        this.addGlobalEvent(RoleEvent.OPEN_SRV_DAY, function (type, status) {
            this.checkGuildWarStatus();
        }, this)
    },



    openRootWnd: function () {
        if (this.my_guild_info == null) {
            this.my_guild_info = this.model.getMyGuildInfo();
            if (this.my_guild_info != null) {
                this.addGlobalEvent(GuildEvent.UpdateMyInfoEvent, function (key, value) {
                    if (key == "sign") {
                        this.updateGuildSignInfo();
                    } else if (key == "members_num") {
                        this.updateGuildMemberInfo();
                    } else if (key == "lev" || key == "exp") {
                        this.updateGuildBaseInfo();
                    } else if (key == "name") {
                        this.updateGuildNameInfo();
                    } else if (key == "leader_name") {
                        this.updateGuildLeaderInfo();
                    }
                }, this)
            }

            this.updateGuildNameInfo();
            this.updateGuildSignInfo();
            this.updateGuildBaseInfo();
            this.updateGuildLeaderInfo();
            this.updateGuildMemberInfo();
            this.updateSomeRedStatus();
        }
        this.updateJurisdiction();
    },

    //一些权限控制
    updateJurisdiction: function () {
        if (this.role_vo == null)
            return
        if (this.role_vo.position == GuildConst.post_type.member) {
            this.sign_btn.node.active = false;
            this.change_name_btn.node.active = false;
            Utils.setGreyButton(this.joinset_btn, true);
            Utils.setGreyButton(this.recruit_btn, true);
            Utils.setGreyButton(this.checkapply_btn, true);
        } else {
            this.sign_btn.node.active = true;
            this.change_name_btn.node.active = true;
            Utils.setGreyButton(this.joinset_btn, false);
            Utils.setGreyButton(this.recruit_btn, false);
            Utils.setGreyButton(this.checkapply_btn, false);
        }
    },

    //更新宣言
    updateGuildSignInfo: function () {
        if (this.my_guild_info == null)
            return
        this.guild_sign_value.string = this.my_guild_info.sign;
    },

    //更新基础信息，等级，经验，成员数量，都是和等级相关的，所以在这里统一处理
    updateGuildBaseInfo: function () {
        if (this.my_guild_info == null)
            return
        this.guild_lev_value.string = cc.js.formatStr("%s", this.my_guild_info.lev);
        var config = gdata("guild_data", "data_guild_lev", [this.my_guild_info.lev]);
        if (config != null) {
            if (config.exp == 0)
                this.guild_lev_value.string = Utils.TI18N("已满级");
            else
                this.guild_exp_value.string = cc.js.formatStr("%s/%s", this.my_guild_info.exp, config.exp);
        }
        this.guild_member_value.string = cc.js.formatStr("%s/%s", this.my_guild_info.members_num, this.my_guild_info.members_max)
        //一些按钮权限开启的东西
        this.checkGuildDunLockStatus();
        this.checkGuildWarStatus();
    },

    //更新公会名称
    updateGuildNameInfo: function () {
        if (this.my_guild_info == null)
            return
        this.guild_name_value.string = this.my_guild_info.name;
    },

    //监测公会副本开启状态
    checkGuildDunLockStatus: function () {
        var is_unlock = false;
        if (this.dungeon_container.is_unlock == false) {
            var config = gdata("guild_dun_data", "data_const", "guild_lev");
            if (config) {
                is_unlock = this.my_guild_info && this.my_guild_info.lev >= config.val;
                this.dungeon_container.is_unlock = is_unlock;
                this.dungeon_container.notice.node.active = !is_unlock;
                Utils.setGreyButton(this.dungeon_container.getComponent(cc.Button), !is_unlock);
                if (is_unlock == false)
                    this.dungeon_container.notice.string = config.desc;
            }
        }
    },

    //公会战开启状态
    checkGuildWarStatus: function () {
        var is_unlock = false;
        if (this.war_container.is_unlock == false) {
            var config_lv = gdata("guild_war_data", "data_const", "limit_lev");   //公会等级显示
            var config_day = gdata("guild_war_data", "data_const", "limit_open_time");    //开服天数限制
            if (config_lv && config_day) {
                is_unlock = this.my_guild_info && this.my_guild_info.lev >= config_lv.val;
                var tips_str = "";
                if (is_unlock == true) {
                    var open_srv_day = RoleController.getInstance().getModel().getOpenSrvDay();
                    is_unlock = open_srv_day > config_day.val;
                    tips_str = config_day.desc;
                } else
                    tips_str = config_lv.desc;

                if (IS_SHOW_CHARGE == false) {
                    is_unlock = false;
                    tips_str = Utils.TI18N("敬请期待!");
                }

                this.war_container.is_unlock = is_unlock;
                this.war_container.notice.node.active = !is_unlock;
                Utils.setGreyButton(this.war_container.getComponent(cc.Button), !is_unlock);
                if (is_unlock == false)
                    this.war_container.notice.string = tips_str;
            }
        }
    },

    //更新公会帮主
    updateGuildLeaderInfo: function () {
        if (this.my_guild_info == null)
            return
        this.guild_leader_value.string = this.my_guild_info.leader_name;
    },

    //更新成员数量
    updateGuildMemberInfo: function () {
        if (this.my_guild_info == null)
            return
        this.guild_member_value.string = cc.js.formatStr("%s/%s", this.my_guild_info.members_num, this.my_guild_info.members_max);
    },

    //更新红点状态,如果type未指定，则全部更新
    updateSomeRedStatus: function (type, status) {
        var red_status = false;
        if (type == GuildConst.red_index.apply) {
            this.checkapply_btn.tips.active = status;
        } else if (type == GuildConst.red_index.boss_times) {
            red_status = this.gb_model.checkGuildDunRedStatus();
            this.dungeon_container.tips.active = red_status;
        } else if (type == GuildConst.red_index.donate || type == GuildConst.red_index.donate_activity) {
            red_status = this.model.getDonateRedStatus();
            this.donate_btn.tips.active = red_status;
        } else if (type == GuildConst.red_index.skill_2 || type == GuildConst.red_index.skill_3 ||
            type == GuildConst.red_index.skill_4 || type == GuildConst.red_index.skill_5) {
            this.skill_container.tips.active = this.skill_model.getRedTotalStatus();
        } else if (type == GuildConst.red_index.red_bag) {
            this.redpacket_btn.tips.active = status;
        } else if (type == GuildConst.red_index.goal_action) {
            this.shop_container.tips.active = status;
        } else if (type == GuildConst.red_index.guildwar_start || type == GuildConst.red_index.guildwar_match || type == GuildConst.red_index.guildwar_count) {
            this.war_container.tips.active = this.gw_model.checkGuildGuildWarRedStatus();
        } else {
            this.checkapply_btn.tips.active = this.model.getRedStatus(GuildConst.red_index.apply);
            this.donate_btn.tips.active = this.model.getDonateRedStatus();
            this.dungeon_container.tips.active = this.gb_model.checkGuildDunRedStatus();
            this.war_container.tips.active = this.gw_model.checkGuildGuildWarRedStatus();
            this.skill_container.tips.active = this.skill_model.getRedTotalStatus();
            this.redpacket_btn.tips.active = this.redbag_model.getAllRedBagStatus();
            this.shop_container.tips.active = this.model.getGoalRedStatus();
        }
    },

    closeCallBack: function () {
        if (this.role_vo != null) {
            if (this.role_assets_event != null) {
                this.role_vo.unbind(this.role_assets_event);
                this.role_assets_event = null;
            }
            this.role_vo = null
        }
        this.ctrl.openGuildMainWindow(false);
    }
});

module.exports = TaskMainWindow;