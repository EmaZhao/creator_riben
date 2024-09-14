// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-19 17:37:33
// --------------------------------------------------------------------
var GuildskillConst = require("guildskill_const");
var GuildskillEvent = require("guildskill_event");
var RoleController = require("role_controller");
var BackpackController = require("backpack_controller");
var GuildConst = require("guild_const");
var MainuiConst = require("mainui_const");
var MainuiController = require("mainui_controller");
var GuildEvent = require("guild_event");

var GuildskillModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = require("guildskill_controller").getInstance();
        this.initConfig();
    },

    properties: {
    },

    initConfig: function () {
        this.career_skill_list = {};
        this.skill_wait_upgrade_list = {};
        this.skill_upgrade_cost_list = {};
        this.skill_red_status_list = {};

        this.had_send_mainui = false;
        this.had_close_mainui = false;
    },

    clearGuildCareerSkill: function () {
        this.career_skill_list = {};
        this.skill_wait_upgrade_list = {};
        this.skill_upgrade_cost_list = {};
        this.skill_red_status_list = {};
    },

    initGuildCareerSkill: function (data) {
        if (data == null || data.group_id == null)
            return
        var config = Config.guild_skill_data.data_info_group[data.group_id];
        if (config == null)
            cc.log("公会技能配置数据有问题，技能组id为：", data.group_id);
        else {
            var object = {};
            object.career = data.career                 // 当前职业
            object.group_id = data.group_id             // 当前激活的技能组
            object.group_ids = data.group_ids           // 已经激活的技能组
            object.skill_ids = []                       // 当前技能组的技能状态

            for (var i in config) {
                var v = config[i];
                object.skill_ids.push({ id: v.id, index: v.seq, status: GuildskillConst.status.un_activity });
            }

            for (var i in data.skill_ids) {
                var v = data.skill_ids[i];
                for (var n in object.skill_ids) {
                    var item = object.skill_ids[n];
                    if (v.skill_id == item.id) {
                        item.status = GuildskillConst.status.activity;
                        break;
                    }
                }
            }

            //对技能顺序做一个排序吧，主要是担心策划配置不是按照正常顺序来
            if (Utils.next(object.skill_ids)) {
                object.skill_ids.sort(function (a, b) {
                    return a.index < b.index
                })
            }
            this.career_skill_list[data.career] = object;
            gcore.GlobalEvent.fire(GuildskillEvent.UpdateGuildSkillEvent, data.career);
        }
    },

    //获取指定职业的技能信息
    getCareerSkillInfo: function (career) {
        return this.career_skill_list[career];
    },

    //激活指定职业的技能信息
    updateGuildCareerSkill: function (career, skill_id) {
        if (career == null || skill_id == null)
            return
        var object = this.career_skill_list[career];
        if (object && object.skill_ids) {
            for (var i in object.skill_ids) {
                var item = object.skill_ids[i];
                if (item.id == skill_id) {
                    item.status = GuildskillConst.status.activity;
                    break
                }
            }
            //升级之后，这边做一次保存当前待升级的技能id
            var red_skill_id = 0;
            for (var k in object.skill_ids) {
                var v = object.skill_ids[k];
                if (v.status == GuildskillConst.status.un_activity) {
                    red_skill_id = v.id;
                    break
                }
            }
            this.updateGuildSkillStatus(career, red_skill_id);

            gcore.GlobalEvent.fire(GuildskillEvent.UpdateSkillStatusEvent, career, skill_id);
        }
    },

    //升级指定职业的技能组，这个时候默认该技能组技能都未激活
    upgradeGuildCareerSkill: function (career, group_id) {
        if (career == null || group_id == null)
            return
        var object = this.career_skill_list[career];
        if (object == null) {
            object = {};
            object.group_ids = [];
            this.career_skill_list[career] = object;
        }

        if (object.group_ids) {
            object.group_ids.push({ group_id: object.group_id });
        }

        object.career = career;
        if (object.group_id != group_id) {
            object.group_id = group_id;
            object.skill_ids = [];

            var config = Config.guild_skill_data.data_info_group[group_id];
            if (config == null) {
                cc.log("更新技能组出错，配置数据有问题，技能组id为：", group_id);
                return
            }

            for (var i in config) {
                var v = config[i];
                object.skill_ids.push({ id: v.id, index: v.seq, status: GuildskillConst.status.un_activity });
            }

            if (Utils.next(object.skill_ids)) {
                object.skill_ids.sort(function (a, b) {
                    return a.index < b.index
                })
            }
        }

        //升级之后，这边做一次保存当前待升级的技能id
        var skill_id = 0;
        for (var k in object.skill_ids) {
            var v = object.skill_ids[k];
            if (v.status == GuildskillConst.status.un_activity) {
                skill_id = v.id;
                break
            }
        }

        this.updateGuildSkillStatus(career, skill_id);
        gcore.GlobalEvent.fire(GuildskillEvent.UpdateSkilUpgradeEvent, career, group_id);
    },

    //获取当前技能组上线
    getCareerGroupMax: function (career) {
        career = career || GuildskillConst.index.physics;
        if (this.career_group_max == null)
            this.career_group_max = {};
        if (this.career_group_max[career] == null) {
            var config = gdata("guild_skill_data", "data_career_list", [career]);
            if (config) {
                this.career_group_max[career] = config.length;
            } else {
                this.career_group_max[career] = 0;
            }
        }
        return this.career_group_max[career];
    },

    //公会技能的初始化红点状态
    initGuildSkillStatus: function (data) {
        if (data && data.outline) {
            this.skill_wait_upgrade_list = {};
            for (var i in data.outline) {
                var v = data.outline[i];
                this.skill_wait_upgrade_list[v.career] = v.skill_id;
            }
        }
        this.checkGuildSkillRedStatus();
    },

    //更新当前技能
    updateGuildSkillStatus(career, skill_id) {
        if (this.skill_wait_upgrade_list == null)
            this.skill_wait_upgrade_list = {};
        this.skill_wait_upgrade_list[career] = skill_id;
        this.checkGuildSkillRedStatus();
    },

    //公会技能红点的算法更新
    checkGuildSkillRedStatus: function () {
        if (this.skill_wait_upgrade_list == null || Utils.next(this.skill_wait_upgrade_list) == null)
            return
        RedMgr.getInstance().addCalHandler(function () {
            var role_vo = RoleController.getInstance().getRoleVo();
            var backpack_model = BackpackController.getInstance().getModel();
            var red_list = {};
            for (var k in this.skill_wait_upgrade_list) {
                var skill_id = this.skill_wait_upgrade_list[k];
                var config = gdata("guild_skill_data", "data_info", [skill_id]);
                if (config) {
                    red_list[k] = true;
                    if (config.guild_lev > role_vo.guild_lev) {
                        red_list[k] = false;
                    } else {
                        for (var i in config.loss || {}) {
                            var v = config.loss[i];
                            if (v[0] != null && v[1] != null) {
                                var bid = v[0];
                                var num = v[1];
                                var assert = Config.item_data.data_assets_id2label[bid];
                                if (assert) {
                                    if (num > backpack_model.getRoleAssetByAssetKey(assert)) {
                                        red_list[k] = false;
                                        break
                                    }
                                } else {
                                    var sum = backpack_model.getBackPackItemNumByBid(bid);
                                    if (num > sum) {
                                        red_list[k] = false;
                                        break
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for (var k in red_list) {
                var id = this.getCareerKey(k);
                this.updateGuildRedStatus(id, red_list[k]);
            }
        }.bind(this), RedIds.GuildSkill)
    },

    //设置一个唯一id吧, 跟 guildconst.skill_2 ,3 ,4 ,5对应
    getCareerKey: function (career) {
        career = career || GuildskillConst.index.physics;
        if (career == GuildskillConst.index.magic)
            return GuildConst.red_index.skill_2;
        else if (career == GuildskillConst.index.physics)
            return GuildConst.red_index.skill_3
        else if (career == GuildskillConst.index.defence)
            return GuildConst.red_index.skill_4
        else if (career == GuildskillConst.index.assist)
            return GuildConst.red_index.skill_5
        else
            return GuildConst.red_index.skill_3

    },

    //清楚主界面上面的红点
    clearGuildSkillIconRed: function () {
        if (this.had_close_mainui == true)
            return
        this.had_close_mainui = true;
        var is_red = false;
        for (var k in this.skill_red_status_list) {
            var v = this.skill_red_status_list[k];
            if (v == true) {
                is_red = true
                break
            }
        }

        if (is_red == true) {
            var data = [
                { bid: GuildConst.red_index.skill_2, status: false }, { bid: GuildConst.red_index.skill_3, status: false },
                { bid: GuildConst.red_index.skill_4, status: false }, { bid: GuildConst.red_index.skill_5, status: false }
            ];
            MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild, data);
        }
    },

    //更新公会技能红点
    updateGuildRedStatus: function (bid, status) {
        var base_data = Config.function_data.data_base;
        var bool = MainuiController.getInstance().checkIsOpenByActivate(base_data[6].activate);
        if (bool == false)
            return
        var _status = this.skill_red_status_list[bid];
        if (_status == status)
            return
        this.skill_red_status_list[bid] = status;

        //更新场景红点状态,只在登录的时候提示一次
        if (this.had_send_mainui == false) {
            this.had_send_mainui = true;
            MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild, { bid: bid, status: status });
        }

        //事件用于同步更新公会主ui的红点
        gcore.GlobalEvent.fire(GuildEvent.UpdateGuildRedStatus, bid, status);
    },

    getRedStatus: function (career) {
        var id = this.getCareerKey(career);
        return this.skill_red_status_list[id];
    },

    getRedTotalStatus: function () {
        for (var k in this.skill_red_status_list) {
            var _status = this.skill_red_status_list[k];
            if (_status == true)
                return true
        }
        return false
    },
    // --获取各职业的公会技能等级
    getCareerSkillLevel(career){
        if(this.career_skill_list[career]){
            let skill_ids = this.career_skill_list[career].skill_ids
            let count = this.career_skill_list[career].group_ids.length * 6
            for(let i=0;i<skill_ids.length;++i){
                let v = skill_ids[i]
                if(v.status == GuildskillConst.status.activity){
                    count = count + 1
                }
            }
            return count
        }
        return -1
    }
});