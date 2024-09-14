var ArenaEvent = require("arena_event");
var ArenaConst = require("arena_const");

var ArenaChampionModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.base_info = null;       // 冠军赛基础信息
        this.role_info = null;       // 个人基础信息
    },

    updateChampionBaseInfo: function(data) {
    	this.base_info = data;
        gcore.GlobalEvent.fire(ArenaEvent.UpdateChampionBaseInfoEvent, data);
    },

	getBaseInfo: function() {
	    return this.base_info;
	},

    setRoleInfo: function(data) {
        this.role_info = data;
        gcore.GlobalEvent.fire(ArenaEvent.UpdateChampionRoleInfoEvent, data);
    },

    getRoleInfo: function(data) {
        return this.role_info
    },

    // 获取我的比赛状态
    getMyMatchStatus: function() {
        if (this.base_info && this.role_info) {
            if (this.base_info.step == ArenaConst.champion_step.unopened) { 
                return ArenaConst.champion_my_status.unopened
            } else if (this.base_info.step == ArenaConst.champion_step.score && this.base_info.step_status == ArenaConst.champion_step_status.unopened) { 
                return ArenaConst.champion_my_status.unopened
            } else if (this.role_info.rank === 0) { 
                return ArenaConst.champion_my_status.unjoin
            } else {
                return ArenaConst.champion_my_status.in_match
            }
        }
        return ArenaConst.champion_my_status.unopened;
    },

});