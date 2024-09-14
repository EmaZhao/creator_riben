// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      当前战斗的详细数据,包含双方数据
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var BattleRoleData = require("battle_role_data");
var BattleBuffData = require("battle_buff_data");

var BattleData = cc.Class({
    extends: BaseClass,
    ctor:function(){
        this.fight_object_list = {};
        this.buff_play_list = {};
        this.halo_list = {};
        this.formation = {};
    },
    properties: {
        fight_object_list: null,        // 双方战斗单位数据
        buff_play_list: null,           // 拥有buff
        halo_list: null,                // 两边阵营光环信息 group, type
        formation: null,                // 战法信息,包含 group, formation_type, formation_lev
        combat_type: 0,                 // 战斗类型
        current_wave: 0,                // 当前波数
        total_wave: 0,                  // 总波数
        action_count: 0,                // 当前回合数
        target_role_name: "",           // 如果对方是玩家，则是对方的角色名
        actor_role_name: "",            // 发起方的玩家名字，用于看录像
        flag: 0,                        // 标识(0:正常进入 1:断线重连 2:切入观战)
        extra_args: [],                 // 战斗的额外参数，比如当前副本id，具体值跟战斗类型有关系
        is_active: false,               // 当前战斗是否处于激活状态
    },

    // 更新详细数据
    updateData:function(data){
        this.combat_type = data.combat_type;
        this.current_wave = data.current_wave;
        this.total_wave = data.total_wave;
        this.target_role_name = data.target_role_name;
        this.actor_role_name = data.actor_role_name;
        this.flag = (data.flag) ? data.flag : 0;

        if (data.extra_args) {
            this.extra_args = data.extra_args;
        }
        if (data.action_count) {
            this.action_count = data.action_count;
        }
        // 单位
        this.updateObjectData(data.objects);
        // buff
        this.updateBuffData(data.buffs);
        // 阵营
        this.updateHaloData(data.halo_list);
        // 阵法
        this.updateFormationData(data.formation);
        this.is_active = true;
    },

    // 更新单位数据
    updateObjectData:function(array){
        if(array == null) {return;}
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (this.fight_object_list[element.pos] == null) {
                this.fight_object_list[element.pos] = new BattleRoleData();
            }
            this.fight_object_list[element.pos].updateData(element)
        }
    },

    // 更新BUFF数据
    updateBuffData: function (array) {
        if (array == null) { return; }
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (this.buff_play_list[element.target] == null) {
                this.buff_play_list[element.target] = {}
            }
            if (this.buff_play_list[element.target][element.id] == null) {
                this.buff_play_list[element.target][element.id] = new BattleBuffData();
            }
            this.buff_play_list[element.target][element.id].updateData(element);
        }
    },

    // 更新阵营数据
    updateHaloData:function(array){
        if (array == null) {return;}
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (this.halo_list[element.group] == null) {
                this.halo_list[element.group] = {group: 0, type:0}
            }
            this.halo_list[element.group].group = element.group;
            this.halo_list[element.group].type = element.type;
        }
    },

    // 更新阵法数据
    updateFormationData: function (array) {
        if (array == null){return;}
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (this.formation[element.group] == null) {
                this.formation[element.group] = {formation_type: 0, formation_lev:0}
            }
            this.formation[element.group].formation_type = element.formation_type;
            this.formation[element.group].formation_lev = element.formation_lev;
        }
    },

    // 当前战斗是否是激活,不清除数据是想重复利用
    setActive:function(status){
        if (status == false){
            this.buff_play_list = {}
            this.is_active = false
        }
    },
});

module.exports = BattleData;