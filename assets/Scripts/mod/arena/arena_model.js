// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-06 11:18:06
// --------------------------------------------------------------------
var ArenaEvent = require("arena_event");
var ArenaLoopChallengeVo = require("arena_loop_challenge_vo");
var ArenaConst = require("arena_const");

var ArenaModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
    	this.my_loop_data = null;
    	this.times_awards = null;
        this.loop_challenge_list = null;
        this.arena_loop_red_list = {};
        this.had_combat_num = 0
    },

    updateMyLoopData: function(data) {
    	this.my_loop_data = data;
    	gcore.GlobalEvent.fire(ArenaEvent.UpdateMyLoopData);

    	// 更新挑战次数红点
        this.updateArenaRedStatus(ArenaConst.red_type.loop_challenge, data.can_combat_num > 0);        
    },

    // 循环赛信息
    getMyLoopData: function() {
	    return this.my_loop_data;
    },

    // 更新挑战次数奖励信息
    updateChallengeTimesAwards: function(data) {
    	this.times_awards = data; 
    	// 更新奖励红点
        var bool_status = {};
        this.had_combat_num = data.had_combat_num || 0;

        for (var reward_i in Config.arena_data.data_season_num_reward) {
            var reward_info = Config.arena_data.data_season_num_reward[reward_i];
            bool_status[reward_i] = 0;
            if (data.had_combat_num) {
                if (reward_info.num <= data.had_combat_num) {
                    bool_status[reward_i] = 1;
                    for (var num_i in data.num_list) {
                        var num_info = data.num_list[num_i];
                        if (num_info.num == reward_info.num) {
                            bool_status[reward_i] = 2;
                        }
                    }
                }
            }
        }

        var need_red = false
        for (var status_i in bool_status) {
            if (bool_status[status_i] === 1) {
                need_red = true;
                break;
            }
        }

        this.updateArenaRedStatus(ArenaConst.red_type.loop_reward, need_red);
        gcore.GlobalEvent.fire(ArenaEvent.UpdateLoopChallengeTimesList, data);        
    },

    getChallengeTimesAwards: function() {
    	return this.times_awards;
    }, 

    updateLoopChallengeList: function(data) {
        if (!this.loop_challenge_list && data.type === 1) return;
        if (!this.loop_challenge_list)
            this.loop_challenge_list = {};

        for (var list_i in data.f_list) {
            if (!this.loop_challenge_list[data.f_list[list_i].idx])
                this.loop_challenge_list[data.f_list[list_i].idx] = new ArenaLoopChallengeVo();
            this.loop_challenge_list[data.f_list[list_i].idx].updatetAttributeData(data.f_list[list_i]);
        }

        if (data.type === 0)
            gcore.GlobalEvent.fire(ArenaEvent.UpdateLoopChallengeList);
    },

    getLoopChallengeList: function() {
        var challente_list = [];
        for (var cha_i in this.loop_challenge_list) {
            challente_list.push(this.loop_challenge_list[cha_i]);
        }

        return challente_list;
    },

    cleanChallengeList: function() {
        this.loop_challenge_list = null;
    },


    // 根据积分获取奖杯配置数据，统一一个接口,如果不传入，就默认用自己的
    getZoneConfigBySoure: function(score) {
        score = score || this.my_loop_data.score;

        var cur_config = null;
        var first_config = Config.arena_data.data_cup[0];
        if (!score || score < first_config.min_score) {
            cur_config = first_config;
        } else {
            for (var cfg_i in Config.arena_data.data_cup) {
                if (Config.arena_data.data_cup[cfg_i].min_score <= score && score <= Config.arena_data.data_cup[cfg_i].max_score) {
                    cur_config = Config.arena_data.data_cup[cfg_i];
                    break;
                }
            }
        }

        // var next_config = null;
        // if (cur_config) {
        //     var next_config_index = cur_config.index + 1;
        //     for (var cfg_i in Config.arena_data.data_cup) {
        //         if (Config.arena_data.data_cup[cfg_i].index === next_config_index) {
        //             next_config = Config.arena_data.data_cup[cfg_i];
        //             break;
        //         }
        //     }
        // }

        return cur_config;
        // {cur_config: cur_config, next_config: next_config}         
    },

    // 红点相关
    updateArenaRedStatus: function(type, status) {
        var cur_status = this.arena_loop_red_list[type];
        if (cur_status === status) return;

        this.arena_loop_red_list[type] = status;

        var SceneConst = require("scene_const");
        var MainSceneController = require("mainscene_controller");
        MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.arena, {bid: type, status: status});
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.arena, this.status);
        gcore.GlobalEvent.fire(ArenaEvent.UpdateArenaRedStatus, type);
    },

    // 挑战记录红点更新
    updateArenaLoopLogStatus: function(flag) {
        this.updateArenaRedStatus(ArenaConst.red_type.loop_log, !!flag);
    },

    getHadCombatNum:function(){
        return this.had_combat_num || 0;
    },

    getArenaLoopLogStatus: function() {
        return this.arena_loop_red_list[ArenaConst.red_type.loop_log];
    },

});