// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗播报动作控制
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var SkillAct = {
    newPos2Gird:function(pos, is_left, group, is_real){
        if (pos == 0 || pos == null){
            message(Utils.TI18N("位置不能为0"))
        }
        if(pos == 31 || pos == 32){       //神器的特殊位置
            pos = 10;
        } else if (group == 2) {
            pos = (pos - GIRD_POS_OFFSET)
        }
        pos = pos - 1 // lua 和js的下表不同
        pos = Math.max(0, pos);
        if (is_left == true){
            return Pos2GridLeft[pos];
        } else {
            if (is_real){
                return Pos2GridRight[pos];
            }else{
                return NormalPosGridRight[pos];
            }
        }
    },

    gridSizeX:function(){
        return SCREEN_WIDTH / 80
    },

    gridSizeY:function(){
        return SCREEN_HEIGHT / 80
    },

    // 格子站位转化成场景站位
    gridPosToScreenPos:function(pos){
        return cc.v2(pos.x * this.gridSizeX(), pos.y * this.gridSizeY());
    },

    // 场景坐标转换成格子坐标
    screenPosToGridPos:function(pos){
	    return cc.v2(pos.x / this.gridSizeX(), pos.y / this.gridSizeY())
    },

    //普通开始回调
    normalStart: function (attacker) {
        return cc.callFunc((function () {
            this.actStart(attacker)
        }).bind(this))
    },

    aaaaaa: 1,
    //普通结束回调
    normalFinish:function(attacker){
        var bbbbb = this.aaaaaa++;
        Log.info("SkillAct.normalFinish 1, attack_pos:" + attacker.pos + ", bbbbb:" + bbbbb + ', ts:' + new Date().getMilliseconds());
        return cc.callFunc((function (){
            Log.info("SkillAct.normalFinish 2, attack_pos:" + attacker.pos + ", bbbbb:" + bbbbb + ', ts:' + new Date().getMilliseconds());
            this.actFinish(attacker)
        }).bind(this))
    },

    actStart: function (attacker) {
        var model = require("battle_controller").getInstance().getModel()
        model.actStart(attacker)
    },

    actFinish: function (attacker) {
        var model = require("battle_controller").getInstance().getModel()
        model.actFinish(attacker)
    },

    // 延迟动作处理
    addDelay: function (attacker, delay_time, act, next_delay_time){
        Log.info("SkillAct.addDelay, attack_pos:" + attacker.pos + ", delay_time:" + delay_time + ', next_delay_time:' + next_delay_time + ', ts:' + new Date().getMilliseconds());
        if(delay_time == 0 || delay_time == null){
            if (next_delay_time == 0 || next_delay_time == null) {
                return cc.sequence(this.normalStart(attacker), act, this.normalFinish(attacker));
            }else{
                return cc.sequence(this.normalStart(attacker), act, cc.delayTime(next_delay_time / 30),  this.normalFinish(attacker));
            }
        } else {
            if (next_delay_time == 0 || next_delay_time == null) {
                return cc.sequence(this.normalStart(attacker), cc.delayTime(delay_time / 30), act, this.normalFinish(attacker));
            } else {
                return cc.sequence(this.normalStart(attacker), cc.delayTime(delay_time / 30), act, cc.delayTime(next_delay_time / 30), this.normalFinish(attacker));
            }
        }
    },

    // 近战攻击移动归位
    handleAttackerMove:function(attacker, is_back){
        if (attacker == null || attacker.play_order_index == null || attacker.anime_res == null) { return; }
        var model = require("battle_controller").getInstance().getModel()
        var spine_name = attacker.spine_name;
        var temp_config = null;
        var act_config = Config.battle_act_data.data_info[spine_name];
        if (attacker.play_action_name == null || act_config == null || act_config[attacker.anime_res] == null || act_config[attacker.anime_res][attacker.play_action_name] == null){
            temp_config = Config.battle_act_data.data_info[0]["action1"]["action1"];
        }else{
            temp_config = act_config[attacker.anime_res][attacker.play_action_name];
        }
        if(temp_config){
            if (is_back == true){
                model.moveBack(attacker, temp_config.back_delay_time, temp_config.back_move_time, temp_config.back_model_x, null, null, null, null, temp_config.is_move_map)
            }else{
                if (temp_config.shadow_time && temp_config.shadow_time != 0){        // 创建分身,暂时不处理了

                }
                if (temp_config.is_move_area == 1){
                    model.moveToArea(attacker, temp_config);
                }else{
                    model.moveTo(attacker, temp_config.move_delay_time, temp_config.move_time, temp_config.move_model_x, temp_config.move_model_y, null, null, 0, 0, temp_config.is_move_map, temp_config.is_reverse, temp_config.is_col_act)
                }
            }
        }
    },

    // 具体移动步骤
    move:function(attacker, target_pos, delay_time, move_time){
        var model = require("battle_controller").getInstance().getModel();
        if (attacker.is_die == false && model.getBuffTag(attacker) == true){
            attacker.runAction();
        }
        Log.info("SkillAct.move, attack_pos:" + attacker.pos + ', target_pos:' + JSON.stringify(target_pos) + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
        let move = cc.moveTo(move_time/60, target_pos).easing(cc.easeExponentialOut());
        return this.addDelay(attacker, delay_time, move);
    },

    /**
     * 主角动作播放事件
     * @param {*} attacker BattleRole
     * @param {*} anima_name 动作名,不同于动作资源名,资源里面可能有多个动作
     * @param {*} hit_callback
     * @param {*} finish_callback
     * @param {*} is_loop
     * @param {*} is_reverse
     * @param {*} attack_func
     * @param {*} anima_res 动作资源名字
     */
    setAnimationWithEvent:function(attacker, anima_name, hit_callback, finish_callback, is_loop, is_reverse, attack_func, anima_res){
        var model = require("battle_controller").getInstance().getModel()
        var callFunc = cc.callFunc((function(){
            var animationEventFunc = (function (event_name) {
                Log.info("SkillAct.setAnimationWithEvent.animationEventFunc, attack_pos:" + attacker.pos + ', anima_name:' + anima_name +', event_name:' + event_name + ', ts:' + new Date().getMilliseconds());
                if (event_name == "hit" || event_name == "Hit" || event_name == "HIT") {
                    if (attacker.hit_time < attacker.hit_num && hit_callback) {
                        hit_callback()
                        attacker.hit_time += 1;
                    }
                }else if(event_name == "back" || event_name == "Back" || event_name == "BACK"){
                    if (attacker.is_attack == anima_name){
                        this.handleAttackerMove(attacker, true);
                        attacker.is_attack = null;
                    }
                }else if(event_name == "attack"){                   // 攻击点
                    if (attacker.in_area_effect){
                        attacker.is_area_attack = true;
                        attacker.hit_time += 1;
                        model.areaHurt(attacker);
                    }else if(attack_func){
                        attack_func();
                    }
                    model.attackPoint(attacker);
                }else if(event_name == "hit_none"){                 // 无伤害的受击动作
                    model.actHurt(attacker);
                }else if(event_name == "hit_big"){                  // 播放受击特效
                    model.actHurt(attacker, true);
                }else if(event_name == "ready"){                    // 远程子弹发射点,以及远程出手前动作
                    model.attackReady(attacker);
                }else if(event_name == "shake_point"){              // 震屏点
                    model.playShakeScreen(attacker.shake_id);
                }else if(event_name == "move"){
                    this.handleAttackerMove(attacker);
                }else if(event_name.indexOf("hit_num") != -1){      // 多段攻击

                }
            }).bind(this);
            var animationCompleteFunc = (function(event_animation){
                Log.info("SkillAct.setAnimationWithEvent.animationCompleteFunc, attack_pos:" + attacker.pos + ', anima_name:' + anima_name + ', event_animation:' + event_animation + ', ts:' + new Date().getMilliseconds());
                if (event_animation == anima_name) {
                    if (attacker.hit_time < attacker.hit_num && hit_callback) {
                        Log.info("SkillAct.setAnimationWithEvent.animationCompleteFunc.hit_callback, attack_pos:" + attacker.pos + ', anima_name:' + anima_name + ', event_animation:' + event_animation + ', ts:' + new Date().getMilliseconds());
                        hit_callback();
                        attacker.hit_time += 1;
                    }
                    if (finish_callback){
                        finish_callback();
                    }else{
                        // 如果是群攻,直接播放完动作之后回到站立,不需要等特效
                        if (attacker.play_stand == 1){
                            if (attacker.is_real){
                                this.setAnimation(attacker, PlayerAction.battle_stand, true);
                            } else {
                                this.setAnimation(attacker, PlayerAction.run, true);
                            }
                            // attacker.doStand()
                        }
                        attacker.is_area_attack = false
                        this.actFinish(attacker)
                    }
                    attacker.setHallowsRound();
                    attacker.in_animation = false
                }
            }).bind(this);
            var callback = function(){
                attacker.hit_time = 0;
                attacker.hit_num = Math.max(1, attacker.split_hurt || 1)
                // attacker.current_anime = anima_name
                // attacker.anima_name = anima_name;
                attacker.in_animation = true;
                if (is_reverse == true){
                    attacker.reverse(-attacker.obj_type);
                }
            }
            Log.info("SkillAct.setAnimationWithEvent, attack_pos:" + attacker.pos + ", anima_name:" + anima_name + ', anima_res:' + anima_res + ', is_loop:' + is_loop + ', ts:' + new Date().getMilliseconds());
            attacker.setAnimationActionFunc(animationEventFunc, animationCompleteFunc, anima_name);
            this.setAnimation(attacker, anima_name, is_loop, callback, anima_res);
        }).bind(this));
        return callFunc;
    },

    // 设置动作
    setAnimation:function(attacker, anima_name, is_loop, callback, anima_res){
        if (anima_name && anima_name.indexOf("E") == -1 ){
            attacker.reverse(attacker.obj_type);
            Log.info("SkillAct.setAnimation, attack_pos:" + attacker.pos + ", anima_name:" + anima_name + ', anima_res:' + anima_res + ', is_loop:' + is_loop + ', ts:' + new Date().getMilliseconds());
            attacker.playActionOnce(anima_name, anima_res, is_loop);
        }
        if(callback){
            callback()
        }
    },

    /**
     * 普通近战攻击
     * @param {*} attacker
     * @param {*} delay_time
     * @param {*} anima_name
     * @param {*} hit_callback
     * @param {*} start_callback
     * @param {*} finish_callback
     * @param {*} is_reverse
     * @param {*} attack_func
     * @param {*} anima_res
     */
    attack:function(attacker, delay_time, anima_name, hit_callback, start_callback, is_reverse, attack_func, anima_res){
        // console.trace();
        var startfun = null;
        if (start_callback){
            startfun = cc.callFunc(start_callback)
        }
        this.actStart(attacker)            // 开始添加一下统计
        attacker.is_attack = anima_name;    // 记录一下攻击动作
        // 播放音效
        if (attacker.shout_trick != "" && attacker.is_real == true) {
            Utils.playEffectSound(AUDIO_TYPE.BATTLE, attacker.shout_trick);
        }
        Log.info("SkillAct.attack, attack_pos:" + attacker.pos + ", anima_name:" + anima_name + ', delay_time:' + delay_time + ', ts:' + new Date().getMilliseconds());
        if (startfun == null){
		    return this.addDelay(attacker, delay_time, this.setAnimationWithEvent(attacker, anima_name, hit_callback, null, false, is_reverse, attack_func, anima_res))
        }else{
            return this.addDelay(attacker, delay_time, cc.sequence(startfun, this.setAnimationWithEvent(attacker, anima_name, hit_callback, null, false, is_reverse, attack_func, anima_res)))
        }
    },

    /**
     * 播放范围特效
     * @param {*} attacker 施法者
     * @param {*} effect_list 特效列表
     * @param {*} reverse 是否需要反转.这个也是跟施法者的obj_type一致的
     * @param {*} is_release 是否播放完释放掉,这个可以有可无,到时候全部对象池回收
     * @param {*} scene_pos 所处位置
     * @param {*} hit_callback 打击回调
     * @param {*} bid 特效ID 非自愿id
     * @param {*} is_release 特效播放一次完成是否释放
     */
    effectArea:function(attacker, effect_list, reverse, is_release, scene_pos, hit_callback, bid){
        if (is_release == null){
            is_release = true;
        }

        var model = require("battle_controller").getInstance().getModel()
        var battle_scene = model.getBattleScene();
        if (battle_scene == null){
            return;
        }
        // 2个特效层
        var layer = [battle_scene.getBattleEffectLayer(1), battle_scene.getBattleEffectLayer(2)];
        // 记录只触发一次hitcallback
        var is_play_effect = false;
        // 效果
        const effect_config = Config.skill_data.data_get_effect_data[bid];

        // 可能因为编译器的问题 这个方法不能写到for循环里面去执行多次,那时候只会被调用一次
        var finish_callback = function (attacker, battle_effect, is_loop) {
            if (!is_loop){
                attacker.in_area_effect = null;
                model.delBattleEffect(battle_effect);
                battle_effect.setEffectScale(1000);
            }
            Log.info("SkillAct.effectArea.finish_callback, attack_pos:" + attacker.pos + ', effect_list:' + effect_list + ', ts:' + new Date().getMilliseconds());
            this.actFinish(attacker);
        }.bind(this);

        // 创建特效组
        for (let index = 0; index < effect_list.length; index++) {  // index == 0 是上层特效, 1 是下层特效
            const element = effect_list[index];
            if (element != ""){
                let action_name = "";
                if (effect_config){
                    if(index == 0){             // 上层特效
                        action_name = effect_config.up_action_name;
                    }else if(index == 1){       // 下层特效
                        action_name = effect_config.down_action_name;
                    }
                    if (action_name == ""){
                        action_name = PlayerAction.action;
                    }
                }
                // 创建特效单位, 这个特效暂时还没有清楚掉,后面要看放在哪里清楚掉,保证能完全回收
                if (action_name != ""){
                    var battle_effect = model.addBattleEfffect(layer[index], scene_pos, reverse, element, action_name)
                    if(is_release == false){    // 先储存到场景特效里面去
                        model.addSceneBuffEffect(attacker.group, bid, element, battle_effect);
                    }
                    this.actStart(attacker);
                    var start_callback = null;
                    if( !is_play_effect){
                        is_play_effect = true;
                        start_callback = function () {
                            Log.info("SkillAct.effectArea.start_callback, attack_pos:" + attacker.pos + ', effect_list:' + effect_list + ', ts:' + new Date().getMilliseconds());
                            if (hit_callback) {
                                hit_callback();
                            }
                        }.bind(this);
                    }
                    attacker.in_area_effect = true
                    var act = this.setAnimaWithEventFinish(attacker, action_name, start_callback, finish_callback, battle_effect, !is_release);
                    battle_effect.setEffectScale(effect_config.scale);
                    Log.info("SkillAct.effectArea, attack_pos:" + attacker.pos + ', effect_list:' + effect_list + ', ts:' + new Date().getMilliseconds());
                    battle_effect.runAction(act);
                }
            }
        }
    },

    /**
     * 播放特效
     * @param {*} attacker
     * @param {*} action_name 动作名
     * @param {*} hit_callback
     * @param {*} finish_callback
     * @param {*} battle_effect 对象为BattleEffect
     * @param {*} is_loop 是否循环
     */
    setAnimaWithEventFinish:function(attacker, action_name, hit_callback, finish_callback, battle_effect, is_loop){
        var model = require("battle_controller").getInstance().getModel()
        var callFunc = cc.callFunc(function(){
            var animationCompleteFunc = function (event_animation) {
                Log.info("SkillAct.setAnimaWithEventFinish.animationCompleteFunc, attack_pos:" + attacker.pos + ', action_name:' + action_name +', event_animation:' + event_animation + ', ts:' + new Date().getMilliseconds());
                if (event_animation == action_name){
                    if (battle_effect.hit_time < battle_effect.hit_num && hit_callback) {
                        hit_callback()
                        battle_effect.hit_time += 1;
                        if (attacker.in_area_effect) {
                            attacker.area_hit_time = battle_effect.hit_time;
                        }
                    }
                    if (finish_callback){
                        finish_callback(attacker, battle_effect, is_loop);
                    }
                }
            }
            var animationEventFunc = null;
            if (hit_callback){
                animationEventFunc = function (event_name) {
                    Log.info("SkillAct.setAnimaWithEventFinish.animationEventFunc, attack_pos:" + attacker.pos + ', action_name:' + action_name +', event_name:' + event_name + ', ts:' + new Date().getMilliseconds());
                    if (event_name == "hit" || event_name == "Hit" || event_name == "HIT") {
                        if (battle_effect.hit_time < battle_effect.hit_num && hit_callback) {
                            hit_callback();
                            battle_effect.hit_time += 1;
                            if (attacker.in_area_effect) {
                                attacker.area_hit_time = battle_effect.hit_time;
                            }
                        }
                    } else if (event_name == "hit_none") {
                        model.actHurt(attacker);
                    } else if (event_name == "hit_big") {
                        model.actHurt(attacker, true);
                    } else if (event_name == "shake_point"){               // 震屏

                    } else if (event_name.indexOf("hit_num") != -1) {      // 多段攻击

                    }
                }
            }
            Log.info("SkillAct.setAnimaWithEventFinish, attack_pos:" + attacker.pos + ', action_name:' + action_name +', is_loop:' + is_loop + ', ts:' + new Date().getMilliseconds());
            battle_effect.hit_time = 0
            battle_effect.hit_num = 1
            battle_effect.setAnimationActionFunc(animationEventFunc, animationCompleteFunc, action_name);
            battle_effect.playActionOnce(action_name, null, is_loop);
        });
        return callFunc;
    },

    /**
     * 播放受击动作
     * @param {*} attacker
     * @param {*} target
     * @param {*} hurt_action
     * @param {*} play_effect 是否播放音效,因为可能是群攻的时候,只需要播放一次音效
     */
    hurt:function(attacker, target, hurt_action, play_effect){
        if(attacker == null || target == null){
            return;
        }
        if (hurt_action == null || hurt_action == ""){
            hurt_action = PlayerAction.hurt
        }
        if (play_effect == null){
            play_effect = true;
        }

        var back_time = 0.02;                   // 过去时间
        var return_time = 0.05;                 // 回来时间
        var delay_time = 0.2;                   // 保持时间
        var off_width = 18 * target.obj_type;   // 受击偏移

        target.in_hurt_act = true   // 设置受击状态
        // 这里做切换状态,没有做被变形判断,如果是被变形了,就需要创建修改
        // 播放音效,暂时没实现
        if (play_effect == true && attacker.hit_sound != "" && attacker.is_real == true){
            Utils.playEffectSound(AUDIO_TYPE.BATTLE, attacker.hit_sound);
        }

        var animationCompleteFunc = function(event_animation){
            Log.info("SkillAct.hurt.animationCompleteFunc attack_pos:" + attacker.pos + ', target_pos:' + target.pos + ', event_animation=' + event_animation + ', hurt_action=' + hurt_action + ', target.in_hurt_act:' + target.in_hurt_act + ', ts:' + new Date().getMilliseconds());
            if (event_animation == hurt_action){
                target.in_hurt_act = false;
                target.checkIsDied();
            }
        }
        target.setAnimationActionFunc(null, animationCompleteFunc, hurt_action);

        var callFunc = cc.callFunc(function () {
            Log.info("SkillAct.hurt.callFunc attack_pos:" + attacker.pos + ', target_pos:' + target.pos + ', target.in_hurt_act:' + target.in_hurt_act + ', ts:' + new Date().getMilliseconds());
            if(target.in_hurt_act == true){
                target.playActionOnce(hurt_action, null, false)
            }
        })
        var mv_t_1 = cc.moveBy(back_time, -off_width, 0);
        var delay_time = cc.delayTime(delay_time);
        var mv_t_2 = cc.moveBy(return_time, off_width, 0);
        var finishFunc = cc.callFunc(function () {
            Log.info("SkillAct.hurt.finishFunc attack_pos:" + attacker.pos + ', target_pos:' + target.pos + ', target.is_hurt_play:' + target.is_hurt_play + ', ts:' + new Date().getMilliseconds());
            target.is_hurt_play = false
        })
        Log.info("SkillAct.hurt, attack_pos:" + attacker.pos + ', target_pos:' + target.pos + ', mv_t_1:' + mv_t_1 +', delay_time:' + delay_time + ', ts:' + new Date().getMilliseconds());
        var act = cc.sequence(callFunc, mv_t_1, delay_time, mv_t_2, finishFunc);
        target.runAction(act);
    },

    // 单位伴随特效,也就是挂在人身上的,包含技能出招特效,和buff特效,和受击特效
    effectSpineUser:function(attacker, is_release, x_fix, height, effect_list, target, scale, callback, bid, obj_type){
        if (effect_list == null || effect_list.length == 0 || bid == null){
            return;
        }
        target = target || attacker;
        var zoredr_offset = [99, -999]
        var is_fornt = false
        if (!height){
            height = 60;
        }
        height = height * attacker.model_height * 0.01;
        const effect_config = Config.skill_data.data_get_effect_data[bid];
        for (let index = 0; index < effect_list.length; index++) {
            const element = effect_list[index];
            if (element != ""){
                let action_name = "";
                if (effect_config) {
                    if (index == 0) {             // 上层特效
                        action_name = effect_config.up_action_name;
                    } else if (index == 1) {       // 下层特效
                        action_name = effect_config.down_action_name;
                    }
                    if (action_name == "") {
                        action_name = PlayerAction.action;
                    }
                    if (action_name != ""){
                        if(index == 0){

                        }else{
                            height = 0;
                            is_fornt = true;
                        }
                        // 这里有问题 不能这么判断,如果是多段攻击 还是需要的 一个动作没播完 就继续创建一个
                        var battle_effect_object = target.addBattleEfffect(x_fix, height, element, action_name, index, obj_type);
                        if (battle_effect_object){
                            var battle_effect = battle_effect_object.object;
                            var start_fun = cc.callFunc(function () {
                                Log.info("SkillAct.effectSpineUser.start_fun attack_pos:" + attacker.pos + ', target_pos:' + target.pos + ', action_name:' + action_name);
                                if (callback) {
                                    callback()
                                }
                            });
                            var finish_callback = function () {
                                Log.info("SkillAct.effectSpineUser.finish_callback attack_pos:" + attacker.pos + ', target_pos:' + target.pos + ', action_name:' + action_name);
                                if (is_release == true) {
                                    target.delBattleEffect(element, action_name);           //移除掉一个特效
                                }
                            };
                            // 这个不知道有啥用,暂时注释掉,保证特效会在目标上面的话,就需要把施法者放到上面来
                            var zorder = target.getLocalZOrder() + zoredr_offset[index];
                            if(effect_config.is_fornt == 1){
                                zorder = attacker.getLocalZOrder()-999;
                                is_fornt = true;
                            }
                            if(is_fornt == false){
                              var model = require("battle_controller").getInstance().getModel();
                                if(!model.getBattleScene().update_drama_battle){
                                    attacker.setLocalZOrder(zorder)
                                }
                            }
                            Log.info("SkillAct.effectSpineUser attack_pos:" + attacker.pos + ', target_pos:' + target.pos + ', action_name:' + action_name);
                            var act = this.setAnimaWithEventFinish(attacker, action_name, null, finish_callback, battle_effect, !is_release);
                            battle_effect.runAction(cc.sequence(start_fun, act));
                        }
                    }
                }
            }
        }
    },

    /**
     * 通用创建延迟接口
     * @param {*} time
     */
    dt:function(time){
        return cc.delayTime(time / 60 * 2);
    },

    /**
     * 设置旋转角度
     * @param {*} target
     * @param {*} pos
     */
    changeRotation:function(target, pos){
        var scene_pos = target.scene_pos;
        var temp_x = scene_pos.x - pos.x;
        var temp_y = scene_pos.y - pos.y;
        var radian = Math.atan(temp_y/temp_x);
        var degree = -(radian * (180 / Math.PI));
        target.setRotation(degree)
    },

    // 无动作返回的
    setNotAnimationWithEvent:function(attacker, hit_callback){
        return cc.callFunc(function(){
            if (hit_callback){
                hit_callback();
            }
            this.actFinish(attacker)
        }.bind(this));
    },

    // 援护者受击动作
    aid_hurt: function (attacker, target, hurt_action){
        var callback = function(){
            if (!target.is_die){
                target.resetBaseInfo()
            }
            target.in_act = false;
            this.actFinish(attacker);
        }.bind(this);
        target.runAction(cc.sequence(cc.callFunc(function(){
            this.setAnimation(target, hurt_action, false)
        }.bind(this)), cc.delayTime(0.3), cc.callFunc(function(){
            callback();
        }.bind(this))));
    },

    /**
     * 无动作并行攻击
     * @param {*} attacker
     * @param {*} delay_time
     * @param {*} hit_callback
     * @param {*} start_callback
     * @param {*} is_reverse
     */
    noActAttack:function(attacker, delay_time, hit_callback, start_callback, next_delay_time){
        var start_fun = null;
        if (start_callback != null){
            start_fun = cc.callFunc(function(){
                start_callback();
            }.bind(this));
        };
        this.actStart(attacker);
        Log.info("SkillAct.noActAttack, attack_pos:" + attacker.pos + ', delay_time:' + delay_time + ', next_delay_time:' + next_delay_time + ', ts:' + new Date().getMilliseconds());
        if (start_fun == null){
            return this.addDelay(attacker, delay_time, this.setNotAnimationWithEvent(attacker, hit_callback), next_delay_time);
        }else{
            return this.addDelay(attacker, delay_time, cc.sequence(start_fun, this.setNotAnimationWithEvent(attacker, hit_callback)), next_delay_time);
        }
    },

    /**
     * 飞行子弹
     * @param {*} attacker
     * @param {*} delay_time
     * @param {*} effect_name
     * @param {*} move_time
     * @param {*} hit_callback
     * @param {*} target_pos 目标位置
     * @param {*} scale
     * @param {*} bid
     * @param {*} x_fix
     * @param {*} y_fix
     */
    flyItem: function (attacker, delay_time, effect_name, move_time, hit_callback, start_height, target_pos, scale, bid, x_fix, y_fix){
        Log.info("SkillAct.flyItem 1 attack_pos:" + attacker.pos + ', target_pos:' + JSON.stringify(target_pos) + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
        if (attacker == null || effect_name == null || effect_name == ""){ return; }
        const effect_config = Config.skill_data.data_get_effect_data[bid];
        if (effect_config == null){ return; }
        var model = require("battle_controller").getInstance().getModel()
        var battle_scene = model.getBattleScene();
        if (battle_scene == null) {
            return;
        }
        var parent = battle_scene.getBattleRoleLayer()

        var action_name = PlayerAction.action;
        if (effect_config.up_action_name != ""){
            action_name = effect_config.up_action_name
        }
        var dt = this.dt(delay_time);
        var callFunc = cc.callFunc((function(){
            Log.info("SkillAct.flyItem.callFunc attack_pos:" + attacker.pos + ', target_pos:' + JSON.stringify(target_pos) + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
            this.actStart(attacker);
            // 这个子弹也需要创建到场景中去.而不能绑在施法者身上,因为会有层级问题
            var base_pos = attacker.scene_pos;
            var start_pos = cc.v2(base_pos.x, base_pos.y + start_height);
            var battle_effect = model.addBattleEfffect(parent, start_pos, attacker.obj_type, effect_name, action_name);
            battle_effect.playActionOnce(action_name, null, true);       // 手动播放特效

            var start_fun = cc.callFunc((function () {
                attacker.in_area_effect = true;
            }).bind(this));

            var hit_fun = cc.callFunc((function () {
                Log.info("SkillAct.flyItem.hit_fun attack_pos:" + attacker.pos + ', target_pos:' + JSON.stringify(target_pos) + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
                if (hit_callback) {
                    hit_callback();
                }
            }).bind(this));

            var finish_fun = cc.callFunc((function () {
                Log.info("SkillAct.flyItem.finish_fun attack_pos:" + attacker.pos + ', target_pos:' + JSON.stringify(target_pos) + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
                attacker.in_area_effect = null;
                this.actFinish(attacker);
                battle_effect.setEffectScale(1000);
                // 这里要干掉特效
                model.delBattleEffect(battle_effect);
            }).bind(this));

            var y_offset = (target_pos.y - start_pos.y) * Math.abs(x_fix) / (target_pos.x - base_pos.x - x_fix) * attacker.obj_type;
            var pos_temp = cc.v2(target_pos.x + x_fix, target_pos.y - y_offset);
            var moveTo = cc.moveTo(move_time/60, pos_temp);
            var setZorder = cc.callFunc((function(){
                battle_effect.setLocalZOrder(720+target_pos.y+999);
                this.changeRotation(battle_effect, pos_temp);
            }).bind(this))
            battle_effect.setEffectScale(scale);
            battle_effect.runAction(cc.sequence(start_fun, setZorder, moveTo, hit_fun, finish_fun));
        }).bind(this));
        Log.info("SkillAct.flyItem 2 attack_pos:" + attacker.pos + ', target_pos:' + JSON.stringify(target_pos) + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
        return cc.sequence(dt, callFunc);
    },

    // 渐隐播报
    fadeOut:function(attacker, delay_time, time){
        var out_time = time / 30;
        // var act = cc.callFunc(function () {
        //     attacker.runAction(cc.fadeOut(out_time));
        // }.bind(this));
        var act = cc.fadeOut(out_time)
        Log.info("SkillAct.fadeOut, attack_pos:" + attacker.pos + ', delay_time:' + delay_time + ', time:' + time + ', ts:' + new Date().getMilliseconds());
        return this.addDelay(attacker, delay_time, act);
    },

    // 渐现出来
    fadeIn:function(attacker, delay_time, time){
        var in_time = time / 30;
        // var act = cc.callFunc(function () {
        //     attacker.runAction(cc.fadeIn(in_time));
        // })
        var act = cc.fadeIn(in_time)
        Log.info("SkillAct.fadeIn, attack_pos:" + attacker.pos + ', delay_time:' + delay_time + ', time:' + time + ', ts:' + new Date().getMilliseconds());
        return this.addDelay(attacker, delay_time, act);
    },

    // 隐藏血条
    hideUI:function(attacker, delay_time){
        var start_fun = cc.callFunc((function(){
            attacker.showHpRoot(false);
        }).bind(this))
        Log.info("SkillAct.hideUI, attack_pos:" + attacker.pos + ', delay_time:' + delay_time + ', ts:' + new Date().getMilliseconds());
        return this.addDelay(attacker, delay_time, start_fun);
    },

    // 显示血条
    showUI:function(attacker, delay_time){
        var start_fun = cc.callFunc((function(){
            attacker.showHpRoot(true);
        }).bind(this))
        Log.info("SkillAct.showUI, attack_pos:" + attacker.pos + ', delay_time:' + delay_time + ', ts:' + new Date().getMilliseconds());
        return this.addDelay(attacker, delay_time, start_fun);
    },

    // 护盾的吸收, 用的是25号字体(height=31)
    playBuffAbsorbHurt: function (target, absorb_val){
        this.playDmgMessage(target, absorb_val, null, false, 0, true);
    },

    /**
     * 伤害飘血
     * @param {*} target
     * @param {*} dmg
     * @param {*} effect_hit 是否暴击,为 2的时候暴击
     * @param {*} is_normal
     * @param {*} is_buff
     * @param {*} camp_restrain
     */
    playDmgMessage:function(target, dmg, effect_hit, is_buff, camp_restrain, is_absorb){
        Log.info("SkillAct.playDmgMessage target_pos:" + target.pos + ', dmg:' + dmg + ', is_buff:' + is_buff);
        if (dmg == 0 || target == null) return;
        var font_type = 0       // 使用字体的类型
        if (effect_hit == 2){   // 暴击
            font_type = 7;
        }else if (is_absorb == true){
            font_type = 25;
        }else if (dmg > 0){     // 治疗
            font_type = 2;
        }else{
            if (is_buff == true){
                font_type = 24;
            } else if (camp_restrain == 1){
                font_type = 27;
            } else{
                font_type = 4
            }
        }
        // 预先加载资源.在创建文字
        require("battle_controller").getInstance().getModel().getDmgFontCacheObject(font_type, function(object, res_object){
            this.playDmgFontAction(font_type, object, res_object, dmg)
        }.bind(this, target));
    },

    // 创建伤害数字和移动
    playDmgFontAction:function(type, target, res_object, dmg){
        if(target == null || target.role == null) return;
        if (target.hurt_delay == null) {
            target.hurt_delay = 0;
        }
        var delay_time = (target.hurt_delay % 3) / 5;       // 因为可能是同一个目标的多次飘血,为了避免掉重叠.所以这个是每一个的延迟.
        target.hurt_delay += 1;

        var parent_layer = ViewManager.getInstance().getSceneNode(SCENE_TAG.battle);    // 存放伤害数字的父节点
        var dmgfont = this.getDmgNode(type);
        if(dmgfont == null) return;
        parent_layer.addChild(dmgfont, 10);                 // 添加深度值

        var world_pos = target.role.convertToWorldSpace(cc.v2(0, 0));                    // 单位的节点坐标
        var node_pos = parent_layer.convertToNodeSpace(world_pos);                       // 转成局部坐标

        var title = dmgfont.getChildByName("title");
        var title_sp = title.getComponent(cc.Sprite);
        title_sp.atlas = res_object;

        if(type == 7 || type == 25) {
            title_sp.spriteFrame = res_object.getSpriteFrame("type" + type + "_extend");
        }else {
            if (dmg < 0) {
                title_sp.spriteFrame = res_object.getSpriteFrame("type" + type + "_sub");
            } else {
                title_sp.spriteFrame = res_object.getSpriteFrame("type" + type + "_add");
            }
        }

        // 文字
        var label = dmgfont.getChildByName("label");
        var richText = label.getComponent(cc.RichText);
        richText.imageAtlas = res_object;
        var dmg_str = Math.abs(dmg) + "";
        var total_str = ""
        for (let index = 0; index < dmg_str.length; index++) {
            var desc = dmg_str[index];
            if (desc == "+"){
                desc = "add";
            }else if(desc == "-"){
                desc = "sub";
            }
            total_str = total_str + cc.js.formatStr("<img src='type%s_%s'/>", type, desc)
        }
        richText.string = total_str;
        var total_width = label.width;
        if (title){
            total_width += title.width;
            label.x = title.width;
        }
        dmgfont.x = node_pos.x - total_width * 0.5 - SCREEN_WIDTH * 0.5;
        dmgfont.y = node_pos.y + target.model_height + target.dmg_index * 15 - SCREEN_HEIGHT * 0.5;
        dmgfont.scale = 0.5;

        var delay = cc.delayTime(delay_time);
        var show = cc.fadeIn(0.01);
        var bigger = cc.scaleTo(Config.battle_act_data.data_get_act_data.hurt_num_scale_time1.val * 0.01 / 60, Config.battle_act_data.data_get_act_data.hurt_num_bigger.val * 0.01 * 0.5);
        var bigger2 = cc.scaleTo(Config.battle_act_data.data_get_act_data.hurt_num_scale_time2.val * 0.01 / 60, Config.battle_act_data.data_get_act_data.hurt_num_bigger2.val * 0.01);
        var smaller = cc.scaleTo(Config.battle_act_data.data_get_act_data.hurt_num_scale_time3.val * 0.01 / 60, Config.battle_act_data.data_get_act_data.hurt_num_smaller.val * 0.01);
        var bigger3 = cc.scaleTo(Config.battle_act_data.data_get_act_data.hurt_num_scale_time4.val * 0.01 / 60, Config.battle_act_data.data_get_act_data.hurt_num_bigger3.val * 0.01);
        var delay2 = cc.delayTime(Config.battle_act_data.data_get_act_data.hurt_num_delay_time.val * 0.01 / 60);
        var move = cc.moveBy(Config.battle_act_data.data_get_act_data.hurt_num_move_time.val * 0.01 / 60, 0, Config.battle_act_data.data_get_act_data.hurt_num_move_distance.val * 0.01)
        var hide = cc.fadeOut(Config.battle_act_data.data_get_act_data.hurt_num_hide_time.val * 0.02 / 60);
        var deleteDmgNum = cc.callFunc(function(){
            this.pushBackDmgNode(type, dmgfont);
        }.bind(this))
        var change = cc.sequence(bigger, bigger2, smaller, bigger3, delay2, cc.spawn(move, hide))
        dmgfont.runAction(cc.sequence(delay, show, change, deleteDmgNum));
    },

    // 从对象池中获取缓存
    getDmgNode:function(type){
        var battle_pools = require("battle_role_pool").getInstance();
        var pools = battle_pools.getDmgPools(type);
        var node = null;
        if (pools.size() > 0) {     // 只有暴击 的7号数字和吸收伤害的25号需要创建 title
            node = pools.get();
        } else {
            node = new cc.Node();
            node.setAnchorPoint(0.5, 0.5);

            // 如果是暴击或者吸收,则显示暴击吸收,否则显示 + 或者 -
            var title = new cc.Node();
            title.setAnchorPoint(0, 0.5);
            title.name = "title";
            node.addChild(title);
            title.addComponent(cc.Sprite);

            // 具体伤害数字的富文本
            var font_node = new cc.Node();
            font_node.setAnchorPoint(0, 0.5);
            font_node.name = "label";
            node.addChild(font_node);
            var font_label = font_node.addComponent(cc.RichText);
            font_label.lineHeight = 30;
            font_label.fontSize = 30;

        }
        return node;
    },

    // 回收伤害数字
    pushBackDmgNode:function(type, dmg){
        var battle_pools = require("battle_role_pool").getInstance();
        battle_pools.pushBackDmgPools(type, dmg);
    },

    // 黑屏处理
    blackScreen:function(attacker, delay_time, time, begin_fun, end_fun){
        var act = cc.sequence(cc.callFunc(begin_fun), cc.delayTime(time / 60), cc.callFunc(end_fun))
        return cc.sequence(this.dt(delay_time), act)
    },

};
module.exports = SkillAct;
