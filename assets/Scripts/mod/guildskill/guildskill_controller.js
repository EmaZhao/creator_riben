// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-19 17:37:33
// --------------------------------------------------------------------
var BackpackConst = require("backpack_const");
var GuildskillConst = require("guildskill_const");
var RoleController = require("role_controller");

var GuildskillController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var GuildskillModel = require("guildskill_model");

        this.model = new GuildskillModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        //背包初始化之后,再请求公会信息,因为要判断是否可以升级技能的
        if (this.backpack_init_event == null) {
            this.backpack_init_event = gcore.GlobalEvent.bind(EventId.GET_ALL_DATA, function (bag_code) {
                if (bag_code != BackpackConst.Bag_Code.BACKPACK)
                    return
                this.role_vo = RoleController.getInstance().getRoleVo();
                if (this.role_vo == null) {
                    if (this.init_role_event == null) {
                        this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                            gcore.GlobalEvent.unbind(this.init_role_event);
                            this.role_vo = RoleController.getInstance().getRoleVo();
                            if (this.role_vo)
                                this.registerRoleEvent();
                        }.bind(this))
                    }
                } else {
                    this.registerRoleEvent();
                }
            }.bind(this))

            if (this.re_link_game_event == null) {
                this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, (function () {
                    var GuideController = require("guide_controller");
                    if (!GuideController.getInstance().isInGuide())
                        this.openGuildSkillMainWindow(false);
                    this.model.clearGuildCareerSkill();
                    this.requestInitProtocal();
                }).bind(this))
            }
        }
    },

    registerRoleEvent: function () {
        this.requestInitProtocal(true);
        if (this.role_assets_event == null) {
            this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                if (key == "gid")
                    this.requestInitProtocal();
                else if (key == "guild")
                    this.model.checkGuildSkillRedStatus();
            }, this)
        }
    },

    //请求技能状态，用于初始化红点
    requestInitProtocal: function () {
        if (this.role_vo != null) {
            if (this.role_vo.gid != 0) {
                this.SendProtocal(23703, {});
            } else {
                this.openGuildSkillMainWindow(false);
                this.model.clearGuildCareerSkill();
            }
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(23700, this.handle23700)         // 获取指定职业技能信息
        this.RegisterProtocal(23701, this.handle23701)         // 激活技能
        this.RegisterProtocal(23702, this.handle23702)         // 更新当前分组技能
        this.RegisterProtocal(23703, this.handle23703)         // 可学习技能状态
    },

    //打开公会技能的主界面
    openGuildSkillMainWindow: function (status) {
        if (status == false) {
            if (this.main_window != null) {
                this.main_window.close();
                this.main_window = null;
            }
        } else {
            if (this.main_window == null)
                this.main_window = Utils.createClass("guildskill_main_window");
            this.main_window.open();
        }
    },

    //请求指定职业的技能信息
    requestCareerSkillInfo: function (career) {
        career = career || GuildskillConst.index.physics;
        var protocal = {};
        protocal.career = career;
        this.SendProtocal(23700, protocal);
    },

    handle23700: function (data) {
        this.model.initGuildCareerSkill(data);
    },

    //请求激活技能
    requestActivitySkill: function (skill_id) {
        var protocal = {};
        protocal.skill_id = skill_id;
        this.SendProtocal(23701, protocal);
    },

    handle23701: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.model.updateGuildCareerSkill(data.career, data.skill_id);
    },

    //更新指定职业的分组技能信息，这个时候是主要升级
    handle23702: function (data) {
        this.model.upgradeGuildCareerSkill(data.career, data.group_id);
    },

    //可学习技能状态
    handle23703: function (data) {
        this.model.initGuildSkillStatus(data);
    }
});

module.exports = GuildskillController;