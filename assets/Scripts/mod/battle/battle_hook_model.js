// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      假战斗数据
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
// var BattleLoop = require("battle_loop")
var AniRes = [
    "hit_effect_list",   // 受击点特效
    "area_effect_list",  // 范围特效
    "act_effect_list",   // 出手点特效
    "bact_effect_list",  // 施法特效
    "trc_effect_list"    // 弹道特效
]

var BattleResPool = require("battle_res_pool");

var BattleHookModel = cc.Class({
    ctor: function () {
    },

    initConfig: function () {
        this.unreal_battle_data = null;     // 假战斗数据
        this.battle_controller = require("battle_controller").getInstance();
        this.battle_model = this.battle_controller.getModel();
        this.skill_act = require("skill_act");

        this.resetInitData()
    },

    // 更新假战斗数据
    updateUnrealBattleData: function (data) {
        this.unreal_battle_data = data
    },

    // 返回假战斗数据
    getUnrealBattleData: function () {
        return this.unreal_battle_data;
    },
    
    // 移除假战斗数据
    deleteUnrealBattleData: function () {
        this.unreal_battle_data = null;
    },

    // 重置所有假战斗数据
    resetInitData: function () {
        this.all_object = {};               //所有人物
        this.group = 0;
        this.act_playing = false
        this.one = null;                    //每个效果数据
        this.ready_wait = 0;                //角色等待出场
        this.round_data = {};               //回合数据
        this.order_list = [];
        this.skill_plays_order_list = [];
        this.round_data_temp = {};          //临时保存过期的回合数据
        this.sum = 0;                       //准备人员统计
        this.actor_sum = 0;                 //施法者总数
        this.actor_play_sum = 0;            //施法者动作完成总数
        this.our_num = 0;                   //自己总数
        this.is_real_battle_ready = false;  //
        this.res_num = 0;                   
        this.res_list = {};
        this.a_object_num = 1;

        this.actor_plays_list = {};
    },

    // 假战斗初始化部分,
    prepareStarBattle:function(start_cb){
        this.start_cb = start_cb;
        this.resetInitData();               // 初始化所有的数据
        var data = BattleLoop.init(this.unreal_battle_data);
        this.startBattle(data);
    },

    startBattle:function(data){
        this.createBattleRole(data);
        this.battle_controller.setIsNormaBattle(true);

    },

    // 返回战斗场景
    getBattleScene:function(){
        return this.battle_model.getBattleScene()
    },

    // 创建单位
    createBattleRole:function(data){
        cc.log("创建假战斗的角色");
        cc.log(data);

        if (!data || !data.objects || !data.target_list ) return;
        if ( !this.getBattleScene() ) return;
        this.ready_wait = 0;
        this.sum = 0;
        this.our_num = Object.keys(data.objects).length;
        this.role_finish = 0;
        var role_num = 0;
        for(var key in data.objects){
            const play = data.objects[key];
            this.group = play.group;
            role_num ++;
            this.createRole(play, null, function() {
                if (this.start_cb) {
                    this.start_cb()
                    this.start_cb = null;
                }
                this.role_finish += 1;
                if (this.role_finish == role_num) {

                }
            }.bind(this));
        }

        // 创建敌对目标
        for(var key in data.target_list){
            const play = data.target_list[key];
            this.createRole(play);
        }
    },

    // 创建举起单位
    createRole:function(role_data, is_next_offset, finish_cb){
        if (!this.getBattleScene()) return;
        if (role_data == null) return;
        var role_layer = this.getBattleScene().getBattleRoleLayer();
        if (role_layer == null) return;
        this.ready_wait += 1;
        if (is_next_offset == null){
            is_next_offset = false;
        }
        var BattleRole = require("battle_role");
        var role = new BattleRole(is_next_offset);
        role.createRole(role_layer, role_data, false, false, false, finish_cb);
        this.all_object[role_data.pos] = role;
    },

    /**
     * 技能播报对象列表,返回的是一个数组
     * @param {*} target 
     */
    getSkillPlayData:function(target){
        if (this.actor_plays_list[target]){
            return this.actor_plays_list[target];
        }

    },

    // 更新技能
    updateActorPlaysList:function(data){
        if(data){
            if (this.actor_plays_list[data.actor] == null){
                this.actor_plays_list[data.actor] = [];
            }
            this.actor_plays_list[data.actor].push(data);
        }
    },

    // 开始处理处理技能播报
    handleSkillPlayData:function(data, init_cb){
        this.preloadBattleRes(data, function(data) {        
            if (init_cb) {
                init_cb(function(data) {
                    cc.log("开始技能播报");
                    this.skill_plays_order_list = [];
                    this.act_playing = false;
                    if(data){
                        this.playSkillPlayData(data);
                    }
                }.bind(this, data));                
            } else {
                this.skill_plays_order_list = [];
                this.act_playing = false;
                if(data){
                    this.playSkillPlayData(data);
                }
            }
        }.bind(this, data));
    },

    // 技能播报
    playSkillPlayData:function(data){
        if(!data) return;
        for (let j = 0; j < data.skill_plays.length; j++) {
            const skill_element = data.skill_plays[j];
            for (let i = 0; i < skill_element.effect_play.length; i++) {
                const effect_element = skill_element.effect_play[i];
                if (this.round_data_temp[effect_element.order] == null){
                    this.round_data_temp[effect_element.order] = [];
                    this.skill_plays_order_list.push({ skill_order: effect_element.order});
                }
                effect_element.skill_bid = skill_element.skill_bid;
                effect_element.index = i;
                effect_element.skill_order = skill_element.order;
                effect_element.talk_content = skill_element.talk_content;
                effect_element.talk_pos = skill_element.talk_pos;
                this.round_data_temp[effect_element.order].push(effect_element)
            }
        }
        // 对出手进行排序
        this.skill_plays_order_list.sort(function (a, b) {
            return a.skill_order - b.skill_order;
        })
        this.analyseTempRoundData()
    },

    // 分析当前的播报数据
    analyseTempRoundData:function(){
        this.order_list = [];
        this.round_data = {};
        if (Object.keys(this.round_data_temp).length > 0) {
            for (let index = 0; index < this.skill_plays_order_list.length; index++) {
                const element = this.skill_plays_order_list[index];
                const temp = this.round_data_temp[element.skill_order];
                for (let i = 0; i < temp.length; i++) {
                    const one_temp = temp[i];
                    if (this.round_data[one_temp.order] == null) {
                        this.round_data[one_temp.order] = {};
                        this.order_list.push({ order: one_temp.order, target: one_temp.target });
                    }
                    if (this.round_data[one_temp.order][one_temp.actor] == null) {
                        this.round_data[one_temp.order][one_temp.actor] = {
                            order:one_temp.order,
                            actor:one_temp.actor,
                            target:one_temp.target,
                            skill_bid:one_temp.skill_bid,
                            index:one_temp.index,
                            talk_content:one_temp.talk_content,
                            talk_pos:one_temp.talk_pos,
                            target_list:[]
                        }
                    }
                    const object = this.round_data[one_temp.order][one_temp.actor];
                    object.target_list.push(one_temp);
                }
            }
            // 对出售惊醒排序
            this.order_list.sort(function (a, b) {
                return a.order - b.order;
            })
            this.round_data_temp = {};
        }
        this.round();
    },

    // 处理回合播报
    round:function(){
        this.round_data_temp = {};
        this.actor_sum = 0;
        this.actor_play_sum = 0;
        this.next_round = null;
        this.cur_round = null;
        if (this.order_list.length == 0){
            if (!this.is_real_battle_ready){
                this.act_playing = false;
            }
        }else{
            var first_data = this.order_list.shift();
            var round_data = this.round_data[first_data.order];
            if (this.order_list.length > 0) {
                var second_order = this.order_list[0].order
                var second_data = this.round_data[second_order];
                // 找到下一个回合播报,于当前回合播报做比较判断是不是多段攻击,从而在当前播报结束之后,是否需要重置
                for (var actor in second_data) {
                    if (this.next_round == null) {
                        this.next_round = second_data[actor];
                        break;
                    }
                }
            }
            for (var actor in round_data) {
                var round_one_temp = round_data[actor];
                if (this.cur_round == null) {
                    this.cur_round = round_one_temp;
                }
                if(round_one_temp.target_list.length > 0){
                    var attacker = this.getBattleRoleByPos(round_one_temp.actor);
                    if (attacker){
                        this.actor_sum = this.actor_sum + 1;
                        this.initOrder(attacker, round_one_temp);
                    }else{
                        this.round();
                    }
                }else{
                    this.round();
                }
            }
        }
    },

    // 初始化播报
    initOrder:function(attacker, one){
        one.target_list.sort(function(a, b){
            return a.index - b.index;
        })
        var list = one.target_list;
        var col_target = list[0].target;
        if (col_target > GIRD_POS_OFFSET){
            col_target = col_target - GIRD_POS_OFFSET;
        }
        var col = Pos_To_Col[col_target - 1];
        attacker.col = col;
        attacker.is_round = false;
        attacker.attacker_info = one;
        attacker.skill_data = gdata('skill_data', 'data_get_skill', one.skill_bid);
        attacker.target_pos = attacker.grid_pos;
        attacker.play_order_index = one.target_list[0].effect_bid;
        this.battle_model.calcTargetPos(attacker, this.all_object);

        // 如果没有效果id则不处理,所有播报驱动都是效果驱动
        if (attacker.play_order_index == null || attacker.play_order_index == 0) {
            this.round()
            return
        }
        var effect_config = gdata('skill_data', 'data_get_effect', attacker.play_order_index);
        if (effect_config) {
            attacker.play_order = Utils.deepCopy(effect_config.action_list);                                    // 动作列表
            attacker.shake_id = effect_config.shake_id;                                                         // 震屏ID
            attacker.effect_type = effect_config.effect_type;                                                   // 效果类型
            attacker.play_stand = effect_config.play_stand;                                                     // 是否收招
            attacker.anime_res = effect_config.anime_res;                                                       // 攻击动作资源
            attacker.split_hurt = effect_config.split_hurt;
            attacker.hit_action = effect_config.hit_action;                                                     // 受击处理
            attacker.effect_desc = effect_config.effect_desc;                                                   // 效果飘字
            attacker.is_must_die = effect_config.is_must_die;                                                   // 这个效果是否触发无法复活
            attacker.anime_user_atk = effect_config.anime_user_atk;                                             // 攻击动作名
            attacker.attack_sound = effect_config.attack_sound;                                                 // 攻击音效
            attacker.ready_sound = effect_config.ready_sound;                                                   // 准备音效
            attacker.shout_trick = effect_config.shout_trick;                                                   // 喊招音效
            attacker.hit_sound = effect_config.hit_sound;                                                       // 受击音效
            attacker.hit_effect_list = Utils.deepCopy(this.battle_model.getCurEffectList(effect_config.hit_effect_list));    // 记录打击特效列表
            attacker.area_effect_list = Utils.deepCopy(this.battle_model.getCurEffectList(effect_config.area_effect_list));  // 记录范围人物特效
            attacker.act_effect_list = Utils.deepCopy(this.battle_model.getCurEffectList(effect_config.act_effect_list));    // 记录出手点特效
            attacker.bact_effect_list = Utils.deepCopy(this.battle_model.getCurEffectList(effect_config.bact_effect_list));  // 记录施法特效
            attacker.trc_effect_list = Utils.deepCopy(this.battle_model.getCurEffectList(effect_config.trc_effect_list));    // 记录弹道特效
        }
        // 是否有群攻
        if (attacker.area_effect_list.length > 0) {
            attacker.attacker_info.is_calc = false
            attacker.in_area_effect = true
            attacker.area_hit_num = 1
            attacker.area_hit_time = 0
        } else {
            attacker.in_area_effect = false
        }
        var start_attack = (function () {
            this.playOrder(attacker);
        }).bind(this);
        this.talk(attacker, start_attack);
        this.act_playing = true
    },

    // 正式播报
    playOrder:function(attacker){
        if(attacker == null){
            return;
        }
        // 没有技能效果的时候,直接移除掉
        if (attacker.play_order_index == null || attacker.play_order_index == 0){
            return;
        }
        // 每个动作的计数器,当一个动作开始之后开始计数,为0标识这个动作做完了
        attacker.wait_act = 0;
        if (attacker.play_order == null || attacker.play_order.length == 0) {
            this.actor_play_sum += 1;
            // 初始施法者战力动作
            this.resetAttackerStandStatus(attacker);

            if(!attacker.is_die){
                attacker.resetZOrder()
            }

            if(!attacker.is_round){
                if (this.actor_play_sum >= this.actor_sum){
                    this.round();
                }
            }
        } else {
            var index = attacker.play_order.shift();
            var act = this.battle_model.singleAct(index, attacker);
            if(act){
                attacker.runAction(act);
            }
        }
    },

    // 喊话回调
    talk:function(attacker, callback){
        var msg = attacker.attacker_info.talk_content || ""
        var actor = attacker.attacker_info.talk_pos
        if (msg == ""){
            if(callback){
                callback()
            }
            return;
        }
        // 然后播放气泡.....
        if(callback){
            callback()
        }
    },

    // 一个假战斗怪物被杀死之后
    playEnd:function(pos){
        if(!this.getBattleScene()) return;
        BattleLoop.playEnd(pos);
        this.delBattleRoleByPos(pos);

        for(var key in this.all_object){
            var battle_role = this.all_object[key];
            if (battle_role){
                var pos = battle_role.pos;
                if (this.actor_plays_list[pos]) {
                    this.actor_plays_list[pos].shift();
                    var temp_data = this.actor_plays_list[pos][0];
                    if (temp_data){
                        this.handleSkillPlayData(temp_data);
                    }
                }
            }
        }
    },
 
    // 下一个怪,在创建怪物定时创建下一波的时候,以及打死一只怪物之后调用创建下一波怪物
    updateNextRoundData: function () {

        // return;

        if (!this.getBattleScene()) return;
        var target_list = [];
        var next_data = BattleLoop.nextTarget();
        if (!next_data) return;
        this.getMoveTime(next_data.actor, next_data.effect_bid);
        target_list.push(next_data);
        for (let index = 0; index < target_list.length; index++) {
            const element = target_list[index];
            var next_col = [element.pos - GIRD_POS_OFFSET - 1];
            if (element.group == 2){
                this.createRole(element, this.checkColObjet(next_col))
            }
        }
    },

    // 判断当前pos的行上面是否已经有单位了
    checkColObjet:function(next_col){
        if(!this.getBattleScene()){
            return false;
        }
        var had_col = false;
        for(var key in this.all_object){
            var element = this.all_object[key];
            if (element && element.group == 2){
                var cur_col = Pos_To_Col[element.pos - GIRD_POS_OFFSET - 1];
                if (cur_col == next_col){
                    had_col = true
                }
            }
        }
        return had_col;
    },

    // 获取移动时间
    getMoveTime:function(actor, play_order_index){
        var move_time = 200
        var skill_config = gdata('skill_data', 'data_get_effect', play_order_index);
        if (!skill_config) return;
        var battle_role = this.getBattleRoleByPos(actor);
        if (!battle_role) return;
        var spine_name = battle_role.spine_name;                // 模型id
        var play_order_anime_res = skill_config.anime_res;      // 该效果所需要播放的动作文件
        var action_name = PlayerAction.action_1;                // 所播放的动作

        var temp_config = null;
        var act_config = Config.battle_act_data.data_info[spine_name];
        if (!act_config || !act_config[play_order_anime_res] || !act_config[play_order_anime_res][action_name]){
            temp_config = Config.battle_act_data.data_info[0]["action1"]["action1"];
        }else{
            temp_config = act_config[play_order_anime_res][action_name];
        }
        if (temp_config){
            move_time = temp_config.move_delay_time + temp_config.move_time;
        }
        this.setAckMoveTime(1000 * move_time / 60); //由于配置是继承lua那边的.按照每帧配置所以转一下到毫秒
    },

    // 保存下一个播报需要移动的时间
    setAckMoveTime:function(time){
        this.move_time = time;
    },

    // 用于处理播假战斗的时间
    getFinalMoveTime: function () {
        return this.move_time || 200;
    },

    // 获取指定单位
    getBattleRoleByPos: function (pos) {
        if (this.all_object[pos]) {
            return this.all_object[pos]
        }
    },

    // 移除一个对象
    delBattleRoleByPos:function(pos){
        var target = this.getBattleRoleByPos(pos);
        if (target){
            target.deleteRole();
        }
        this.all_object[pos] = null;
    },

    // 清空所有单位
    clearRealRole: function () {
        this.battle_controller.setIsNormaBattle(false);

        if (Object.keys(this.all_object).length == 0) { return; }
        for (var key in this.all_object) {
            gcore.Timer.del("attackerActTimeout" + key);
            
            var battle_role = this.all_object[key];
            if (battle_role){
                battle_role.deleteRole()
            }
        }
        this.all_object = {};
    },

    // 回合播报结束设置施法者战力动作,假战斗必定重置移动动作
    resetAttackerStandStatus:function(attacker){
        if(this.getBattleScene() == null || attacker == null){
            return;
        }
        this.skill_act.setAnimation(attacker, PlayerAction.run, true);
    },

    // 播放伤害和受击
    playMagic:function(attacker, effect_play, no_die){
        if(!this.getBattleScene()) return;
        if (!attacker || !effect_play || !effect_play.target) return;
        var target = this.getBattleRoleByPos(effect_play.target);
        if (!target) return;
        var dmg = Math.floor(effect_play.hurt);
        var is_dead = 0;
        if (effect_play.hp <= 0){
            is_dead = 1;
        }
        // 要先处理受击,再更新血量,要不然播放死亡动作会被受击给重置掉了
        if (!target.is_hurt_play){
            target.is_hurt_play = true;
            this.battle_model.playHurtEffect(attacker, target)   
                if (attacker.pos != target.pos && dmg < 0 && attacker.group != target.group) {    // 播放受击动作
                if (attacker.hit_action != "no-hurt") {
                    this.skill_act.hurt(attacker, target, attacker.hit_action, false)
                }
            }
        }
        this.battle_model.updateTargetHp(attacker, target, dmg, is_dead, 1, effect_play);
    },

    getEffectRes: function() {

    },

    // 开始准备战斗资源
    preloadBattleRes: function(data, finish_cb) {
        // skill_plays
        cc.log("开始加载假战斗资源");
        var battle_res = {};
        for (var skill_i in data.skill_plays) {
            var skill_data = data.skill_plays[skill_i]
            for (var effect_i in skill_data.effect_play) {
                var effect_data = skill_data.effect_play[effect_i];
                var effect_config = gdata('skill_data', 'data_get_effect', effect_data.effect_bid);

                var actor = this.all_object[effect_data.actor];
                var target = this.all_object[effect_data.target];

                if (!effect_data.effect_bid)
                    continue;

                var effect_config = gdata('skill_data', 'data_get_effect', effect_data.effect_bid);

                if (!effect_config)
                    continue;


                // 攻击动作资源
                if (effect_config.anime_res && actor) {
                    var anime_res_path = actor.getResPath(effect_config.anime_res);
                    if (anime_res_path)
                        battle_res[anime_res_path] = true;
                }

                // 受击动作资源
                if (effect_config.hit_action && target) {
                    var hit_action_path = target.getResPath(effect_config.hit_action);
                    if (effect_config.hit_action != "no-hurt") {                    
                        if (hit_action_path)
                            battle_res[hit_action_path] = true;
                    }
                }


                for (var effect_d in AniRes) {
                    var effct_list = this.getCurEffectList(effect_config[AniRes[effect_d]]);
                    for (var effect_i in effct_list) {
                        var effect_info = effct_list[effect_i];
                        if (effect_info.res_up) {
                            var action_name = PlayerAction.action;
                            // if (effect_info.up_action_name)
                            //     action_name = effect_info.up_action_name;
                            var res_path = "spine/" + effect_info.res_up + "/" + action_name;
                            battle_res[res_path] = true;
                        }

                        if (effect_info.res_down) {
                            var action_name = PlayerAction.action;
                            // if (effect_info.down_action_name) {
                            //     action_name = effect_info.down_action_name;
                            // }
                            var res_path = "spine/" + effect_info.res_down + "/" + action_name;                            
                            battle_res[res_path] = true;                            
                        }

                    }
                }

            }
        }

        var total_num = 0;
        var finish_num = 0;
        for (var battle_i in battle_res) {
            total_num ++;
            var skeleton_path = battle_i + ".atlas";
            BattleResPool.getInstance().preLoadRes(skeleton_path, function (res_object) {
                finish_num ++;
                if (finish_num == total_num) {
                    cc.log("假战斗资源加载完成");
                    if (finish_cb) {
                        finish_cb();
                    }
                }
            }.bind(this))         
        }

    },

    // 效果列表
    getCurEffectList: function(list){
        var effect_list = []
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            var effect_data = Config.skill_data.data_get_effect_data[element]
            effect_list.push(effect_data)
        }

        return effect_list;
    },



});