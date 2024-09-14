// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗单位实例对象
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var BattleRolePool = require("battle_role_pool");
var BattleResPool = require("battle_res_pool");
var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")
var BattleConst = require("battle_const");
var BattleEffect = require("battle_effect");

var BattleRole = cc.Class({
    extends: BaseClass,

    properties: {
        skelon_cache: {
            default: {}
        }
    },

    ctor:function(){
        // 假战斗才需要,当前这一排是否有其他单位,确定初始位置
        if (arguments && arguments.length > 0){
            this.is_next_offset = arguments[0];
        }else{
            this.is_next_offset = false;
        }
        this.initConfig();
    },

    initConfig:function(){
        this.role = null;
        this.parent = null;
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_real_role");
        this.role_data = null;

        this.top_off_y = 45;                    // 血条向上的偏移量

        this.is_real = false;                   // 是否是真战斗单位
        this.play_enter = false;                // 是否需要播放进场动画
        this.talk_back = false;                 // 是否需要通知播放完成

        this.grid_pos = null;                   // 格子坐标,
        this.scene_pos = null;                  // 场景坐标
        this.is_friend = false;                 // 是否是友方
        this.obj_type = 0;                      // 是己方还是敌方
        // this.skeletonData_list = {}             // 动作列表
        this.model_height = 120;                // 模型的高度
        this.model_width = 60;                 // 模型的宽度,暂时先这样,后面加接口计算

        this.pos = 0;                           // 当前站位
        this.group = 0;                         // 当前分组

        this.spine_name = "";                   // 单位资源名字 ,H10000这种
        this.play_action_name = "";             // 当前动作名字,

        this.is_round = false;                  // 当前技能播报是否播放完成
        this.effect_list = {};                  // 挂在身上的特效列表

        this.hp_show_status = true;             // 是否显示或者隐藏血条

        this.is_die = false;                    // 该单位是否是死亡 == role_data.hp == 0
        this.role_cur_zorder = 0;               // 当前单位深度值

        this.in_hurt_act = false;               // 是否在播放受击效果中
        this.need_play_die = false;             // 需要播放死亡动作

        var BattleController = require("battle_controller");
        this.model = BattleController.getInstance().getModel();
        this.hook_model = BattleController.getInstance().getHookModel();
        this.skill_act = require("skill_act");

        this.wait_action_name = null;
        this.wait_res_name = null;
        this.wait_is_loop = null;

        this.tips_list = {};                    // 当前飘字记录
        this.buff_list = {};                    // 当前buff列表信息,以唯一id作为key
        this.buff_list_data = {};               // 当前buff信息,以buff_config.icon作为key
        this.buff_list_item = {};               // 当前buff的实例化显示对象,以buff_config.icon作为key

        this.action_call_list = {};             // 制动动作回调

        this.wait_add_effect_list = {};         // 待添加特效
        this.resources_list = {};            // 下载资源

        this.dmg_index = 0;                     // 当前伤害数字的个数
    },

    /**
     * 创建战斗单位
     * @param {*} parent 所在父节点
     * @param {*} battle_role_data 对象基础数据,BattleRoleData
     * @param {*} play_enter 是否需要播放进场动画
     * @param {*} talk_back 是否需要通知进场完成
     * @param {*} is_real 是否是真实战斗
     * @param {*} finish_cb 创建完成之后的回调
     */
    createRole:function(parent, battle_role_data, play_enter, talk_back, is_real, finish_cb){
        this.parent = parent;
        this.role_data = battle_role_data;
        // this.play_enter = play_enter || false;
        this.play_enter = false;
        this.finish_cb = finish_cb;
        if (!is_real)
            this.play_enter = false;

        this.talk_back = talk_back || false;
        this.is_real = is_real || false;
        this.pos = battle_role_data.pos;
        this.group = battle_role_data.group;

        let pools = BattleRolePool.getInstance().getRealPools()
        let role = null;
        if (pools.size() > 0){
            role = pools.get();
            this.createRootWnd(role);
        }else{
            LoaderManager.getInstance().loadRes(this.prefabPath, (function(res_object){
                role = res_object;
                this.createRootWnd(role);
            }).bind(this))
        }
    },
    // 初始化状态
    resetInitStatus: function () {
        if (this.skeleton) {
            this.skeleton.setToSetupPose();
            this.skeleton.clearTracks();
        }
    },

    // 初始化创建对象
    createRootWnd: function (role) {
        let valid  = this.parent && this.parent.isValid && role && role.isValid ? true : false;
        if(!valid)return;
        this.role = role;
        if (this.parent) {
            this.parent.addChild(this.role);
        }
        this.role_node = this.role.getChildByName("role_node");                         // 模型节点
        this.container = this.role_node.getChildByName("container");                    // spine节点
        this.top_container = this.role_node.getChildByName("top_container");            // 血条部分
        this.shadow = this.role_node.getChildByName("shadow");                          // 脚底阴影

        this.progress = this.top_container.getChildByName("hp").getComponent(cc.ProgressBar);
        this.level = this.top_container.getChildByName("level").getComponent(cc.Label);
        this.camp = this.top_container.getChildByName("camp").getComponent(cc.Sprite);
        this.buff_container = this.top_container.getChildByName("buff_container");      // buff的主节点

        this.hallow_node = this.role.getChildByName("hallow_node");             // 神器节点
        this.round_progress = this.hallow_node.getChildByName("progress").getComponent(cc.ProgressBar); // 回合进度条

        // 神器和模型区分
        if (this.role_data.object_type == BattleConst.Unit_Type.Hallows){
            this.spine = this.hallow_node.getChildByName("spine");
            this.skeleton = this.spine.getComponent(sp.Skeleton);
            this.role_node.active = false;
            this.hallow_node.active = true;
            // 更新神器
            this.setHallowsRound(this.role_data.hallows_val, this.role_data.hallows_max);
        }else{
            this.spine = this.container.getChildByName("spine");
            this.skeleton = this.spine.getComponent(sp.Skeleton);
            this.effect = this.container.getChildByName("effect");          // 10星光环特效
            if(this.effect_skeleton == null){
              this.effect_skeleton = this.effect.addComponent(sp.Skeleton);
            }

            this.hallow_node.active = false;
            this.role_node.active = true;
            // this.setActive(true);
            // 真实战斗才需要显示这些东西
            if (this.is_real) {
                this.level.string = this.role_data.lev;
            } else {
                this.role.active = false;
            }
        }
        this.spine_zorder = this.spine.zIndex;

        // 设置当前的模型速率
        if (this.skeleton_time_scale){
            this.skeleton.timeScale = this.skeleton_time_scale;
            this.setEffectScale(this.skeleton_time_scale);
            this.skeleton_time_scale = null;
        }else{
            var timeScale = this.model.getTimeScale();
            this.skeleton.timeScale = timeScale;
            this.setEffectScale(timeScale);
        }

        // 监听事件
        this.registerEvent();
        // 初始化
        this.resetInitStatus();
        // 设置当前位置
        this.setGridPos();
        // 实例化模型
        this.instantModelRole();
        // 设置气血
        this.setHP(0);
        // 看看有没有待添加的特效
        this.checkEffectNeedAdd();
    },

    // 设置10星特效的播放速率
    setEffectScale:function(time_scale){
        if (this.effect_skeleton){
            // this.effect_skeleton.timeScale = time_scale;
        }
    },

    registerEvent:function(){
        this.skeleton.setCompleteListener((function (trackEntry, loopCount) {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            var action_object = this.action_call_list[animationName];
            if (action_object && action_object.over){
                action_object.over(animationName);
                this.action_call_list[animationName] = null;
            }
        }).bind(this))

        this.skeleton.setEventListener((function (trackEntry, event) {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            var action_object = this.action_call_list[animationName];
            if (action_object && action_object.event){
                action_object.event(event.data.name);
            }
        }).bind(this))
    },

    // 设置角色格子位置,这个是要确定站位是在左边还是在右边
    setGridPos:function(){
        var is_friend = false;
        if (this.role_data == null){ return; }
        if (this.role == null){ return; }
        // 站位要区分真假战斗
        if (this.is_real == true){
            is_friend = this.model.isFriend(this.role_data.group);
        }else{
            is_friend = (this.role_data.group == 1);
        }
        if(is_friend){
            this.obj_type = BattleConst.Battle_Type_Conf.TYPE_ROLE
        }else{
            this.obj_type = BattleConst.Battle_Type_Conf.TYPE_ENEMY
        }
        this.is_friend = is_friend;

        // 非己方的需要反转处理
        if (this.is_friend == false){
            this.spine.scaleX = -1;
        }else{
            this.spine.scaleX = 1;
        }
        // 获取当前格子站位
        this.grid_pos = this.skill_act.newPos2Gird(this.role_data.pos, is_friend, this.role_data.group, this.is_real);
        this.scene_pos = this.skill_act.gridPosToScreenPos(this.grid_pos);
        this.role.setPosition(this.scene_pos);
        this.resetZOrder();
    },

    // 设置坐标
    setScenePos:function(pos){
        this.role.setPosition(pos);
    },

    // 是否需要反转劫色,因为可能存在背刺技能
    reverse:function(rev){
        rev = rev || -1;
        if (this.rev_value == rev) return;
        this.rev_value = rev;

        if (this.spine){
            this.spine.scaleX = rev;
        }
    },

    // 实例化角色模型数据
    instantModelRole: function () {
        if (this.role_data == null){ return; }
        // 去配置表数据
        var camp_type = 0;          // 当前阵营
        var spine_name = "";
        var encircle_effect = "";   // 10星英雄特效
        var fashion = 0;            // 时装数据
        if (this.role_data.object_type == BattleConst.Unit_Type.Hero){
            var key = Utils.getNorKey(this.role_data.object_bid, this.role_data.star);
            var config_data = gdata("partner_data", "data_partner_star", key);
            if (config_data){
                spine_name = config_data.res_id;
                encircle_effect = config_data.fight_effect;
            }
            var base_config = Config.partner_data.data_partner_base[this.role_data.object_bid];
            if(base_config){
                camp_type = base_config.camp_type;
            }
        }else if(this.role_data.object_type == BattleConst.Unit_Type.Hallows){
            var config_data = Config.hallows_data.data_base[this.role_data.object_bid]
            if (config_data){
                spine_name = config_data.c_res_id;
            }
        }else{
            var config_data = Utils.getUnitConfig(this.role_data.object_bid);
            if(config_data){
                spine_name = config_data.body_id;
                camp_type = config_data.camp_type;
                encircle_effect = config_data.fight_effect;
            }
        }
        // 真是战斗就从服务端那边去,否则从battleloop2里面去数值
        if(this.is_real == true){
            fashion = this.getBattleRoleExtendData(5); // 时装数据
        }else{
            fashion = this.role_data.fashion;
        }
        this.role_data.face_id = this.role_data.object_bid;
        if(fashion != 0){
            let skin_config = Config.partner_skin_data.data_skin_info[fashion];
            if(skin_config){
                spine_name = skin_config.res_id;
                this.role_data.face_id = skin_config.head_id;
                if(skin_config.fight_effect != "" && encircle_effect != ""){
                    encircle_effect = skin_config.fight_effect;
                }
            }
        }

        if (spine_name == ""){return;}
        this.spine_name = spine_name;

        // 设置阵营
        if (this.is_real && this.role_data.object_type != BattleConst.Unit_Type.Hallows){
            this.setCampIcon(camp_type);
        }

        // 设置10星光环特效
        if (encircle_effect != ""){
            this.createEncircleEffect(encircle_effect);
        }

        // 设置模型的高度
        var config_model = Config.skill_data.data_get_model_data[spine_name];
        if (config_model){
            this.model_height = config_model.model_height ; // 模型的高度再上浮20个像素
        }
        this.top_container.y = this.model_height + this.top_off_y;
        //是否需要播放进场动作
        if (this.play_enter) {
            this.showEnterAction();
        } else {
            if (this.is_real){
                this.doStand(function() {
                    this.role.active = true;
                    this.setActive(true);
                }.bind(this));
            }else{
                this.doRun(function() {
                    if (!this.is_real) {
                        this.role.active = true;
                        if (this.finish_cb)
                            this.finish_cb();
                    }
                    this.setActive(true);
                    if (this.role_data.group == BattleConst.Group_Type.Enemgy){
                        this.playUnrealEnterAction();
                    }
                }.bind(this))
            }
        }
    },

    // 获取指定类型的额外数据
    getBattleRoleExtendData:function(key){
        if (this.role_data == null) return 0;
        for (let index = 0; index < this.role_data.extra_data.length; index++) {
            const element = this.role_data.extra_data[index];
            if (element.extra_key == key){
                return element.extra_value;
            }
        }
        return 0;
    },

    // 设置神器回合进度条
    setHallowsRound:function(val, max){
        if(this.role_data == null || this.role_data.object_type != BattleConst.Unit_Type.Hallows) return;
        if(val == 0 || val == null){
            this.round_progress.progress = 0;
        }else{
            if (max == 0 || max == null){
                max = 3;
            }
            var per = Math.min(1, Math.max(val / max))
            this.round_progress.progress = per;
        }
    },

    // 是否需要播放进场动作
    showEnterAction:function(){
        if(this.role_data && this.role_data.object_type == BattleConst.Unit_Type.Hallows){  // 神器不需要走任何处理
            this.doStand();
            return;
        }

        var time = 0.5;
        var start_x = this.scene_pos.x
        var offset_x = SCREEN_WIDTH * 0.25
        var move_by = null
        if (this.is_friend == true){
            start_x = start_x - offset_x
            move_by = cc.moveTo(time, this.scene_pos.x, this.scene_pos.y)
        } else {
            start_x = start_x + offset_x
            move_by = cc.moveTo(time, this.scene_pos.x, this.scene_pos.y)
        }

        this.doRun();
        this.role.x = start_x;
        this.role.runAction(cc.sequence(move_by, cc.callFunc(function () {
            this.doStand();
        }.bind(this))))
    },

    // 设置阵营
    setCampIcon:function(camp_type){
        var camp_icon = PathTool.getBattleCampIconByType(camp_type);
        this.loadRes(camp_icon, function (icon, res_object) {
            icon.spriteFrame = res_object;
        }.bind(this), this.camp)
    },

    // 假战斗地方的进场效果
    playUnrealEnterAction:function(){
        if (this.role == null) return;
        this.clearNextActTimer();
        this.clearNextCallTimer();

        var start_point_x = SCREEN_WIDTH * 1.1;
        if (this.is_next_offset){
            start_point_x = SCREEN_WIDTH * 1.2;
        }
        // var time = 2;
        // var final_point_x = this.skill_act.gridPosToScreenPos(NormalPosGridRight[0]).x;
        // var offset_x = final_point_x - start_point_x;
        this.role.x = start_point_x;

        // 下一波怪
        var next_time = 280
        var call_back = function(){
            // this.hook_model.updateNextRoundData();
            // this.clearNextCallTimer();
        }.bind(this);
        if (this.next_call_mon_timer == null){
            this.next_call_mon_timer = gcore.Timer.set(function(){
                call_back();
            }.bind(this), next_time, 1)
        }

        // 开始播放攻击动作
        // var wait_time = 1590 - this.hook_model.getFinalMoveTime();
        // var atk_back = function(){
        //     var skill_plays_data = BattleLoop.play(this.pos);
        //     if (skill_plays_data){
        //         var skill_plays_list = this.hook_model.getSkillPlayData(skill_plays_data.actor);
        //         if (skill_plays_list == null || skill_plays_list.length == 0){
        //             this.hook_model.handleSkillPlayData(skill_plays_data, function() {

        //             }.bind(this));
        //         }
        //         this.hook_model.updateActorPlaysList(skill_plays_data);
        //     }
        //     this.clearNextActTimer();
        // }.bind(this);
        // if (this.next_ack_mon_timer == null) {
        //     this.next_ack_mon_timer = gcore.Timer.set(function () {
        //         atk_back();
        //     }.bind(this), wait_time, 1)
        // }

        // // 移动
        // var move_by = cc.moveBy(time, offset_x, 0);
        // this.role.runAction(move_by);


        var skill_plays_data = BattleLoop.play(this.pos);
        if (skill_plays_data) {
            cc.log("开始准备假战斗");
            var skill_plays_list = this.hook_model.getSkillPlayData(skill_plays_data.actor);
            if (skill_plays_list == null || skill_plays_list.length == 0) {
                this.hook_model.handleSkillPlayData(skill_plays_data, function(start_cb) {
                    cc.log("开始进行假战斗0");
                    var wait_time = 1590 - this.hook_model.getFinalMoveTime();
                    if (!this.next_ack_mon_timer) {
                        this.next_ack_mon_timer = gcore.Timer.set(function () {
                            cc.log("准备攻击1");
                            if (start_cb)
                                start_cb();
                            this.clearNextActTimer();
                        }.bind(this), wait_time, 1)
                    }

                    var time = 2;
                    var final_point_x = this.skill_act.gridPosToScreenPos(NormalPosGridRight[0]).x;
                    var offset_x = final_point_x - start_point_x;

                    this.role.stopAllActions();
                    var move_by = cc.moveBy(time, offset_x, 0);

                    if (!this.is_real && this.role_data.group == BattleConst.Group_Type.Enemgy){
                        this.role.runAction(move_by);
                    }
                }.bind(this));
            }
            this.hook_model.updateActorPlaysList(skill_plays_data);
        }
    },

    // 清楚下一个攻击的定时器
    clearNextActTimer:function(){
        if (this.next_ack_mon_timer){
            gcore.Timer.del(this.next_ack_mon_timer);
            this.next_ack_mon_timer = null;
        }
    },

    // 清除下一波怪物刷新定时器
    clearNextCallTimer:function(){
        if (this.next_call_mon_timer) {
            gcore.Timer.del(this.next_call_mon_timer);
            this.next_call_mon_timer = null;
        }
    },

    doRun:function(cb){
        this.playActionOnce(PlayerAction.run, null, null, null, cb)
    },

    doStand:function(finish_cb){
        this.playActionOnce(PlayerAction.battle_stand, null, null, null, finish_cb);
        if (this.talk_back == true){
            this.talk_back = false;
            this.model.addReadySum();
        }
    },

    // 设置动作伴随事件和动作结束事件回调
    setAnimationActionFunc:function(event_func, over_func, action_name){
        if (action_name == null) return;
        if(this.action_call_list[action_name] == null){
            this.action_call_list[action_name] = {over:null, event:null};
        }
        this.action_call_list[action_name].over = over_func;
        this.action_call_list[action_name].event = event_func;
    },

    /**
     * 切换动作,由于处于待机的时候,可能马上切换到其他动作,所以这里要看看要不要处理成待机播放完成之后
     * @param {*} action_name 目标动作名字
     * @param {*} res_name 目标资源名字
     */
    playActionOnce:function(action_name, res_name, is_loop, force, load_fini){
        res_name = res_name || action_name;

        if(is_loop == null){
            is_loop = true
        }
        if (this.play_action_res == res_name){
            if (this.play_action_name != action_name){
                this.play_action_name = action_name;
                this.skeleton.setToSetupPose();
                this.skeleton.setAnimation(0, action_name, is_loop);
            }
            return;
        }
        this.play_action_res = res_name;
        Log.info("BattleRole.playActionOnce, pos:" + this.pos + ", action_name:" + action_name + ', res_name:' + res_name + ', is_loop:' + is_loop + ', ts:' + new Date().getMilliseconds());
        var skeleton_path = PathTool.getSpinePath(this.spine_name, res_name);
        if (!this.skelon_cache[skeleton_path]) {
            BattleResPool.getInstance().getRes(skeleton_path, function (load_fini, res_object) {
                this.play_action_name = action_name;
                this.skeleton.skeletonData = res_object;
                this.skeleton.setAnimation(0, action_name, is_loop);
                if (!this.skelon_cache[skeleton_path]) {
                    this.skelon_cache[skeleton_path] = res_object;
                }
                if (load_fini)
                    load_fini();
            }.bind(this, load_fini))

            // LoaderManager.getInstance().loadRes(skeleton_path, function (load_fini, res_object) {
            //     this.play_action_name = action_name;
            //     this.skeleton.skeletonData = res_object;
            //     this.skeleton.setAnimation(0, action_name, is_loop);
            //     if (!this.skelon_cache[skeleton_path]) {
            //         this.skelon_cache[skeleton_path] = res_object;
            //     }
            //     if (load_fini)
            //         load_fini();
            // }.bind(this, load_fini))
        } else {
            this.play_action_name = action_name;
            this.skeleton.skeletonData = this.skelon_cache[skeleton_path];
            this.skeleton.setToSetupPose();
            this.skeleton.setAnimation(0, action_name, is_loop);
            if (load_fini)
                load_fini();
        }
    },

    // 重设基础数据,包含切换到战力动作等
    resetBaseInfo:function(){
        this.playActionOnce(PlayerAction.battle_stand);
        this.role.setPosition(this.scene_pos);
        this.resetZOrder();
        this.reverse(this.obj_type);
    },

    // 设置深度值
    resetZOrder: function () {
        if (this.role_data == null) { return; }
        if (this.role == null) { return; }
        if (this.role_base_zorder){
            if(this.role_cur_zorder != this.role_base_zorder){
                this.role_cur_zorder = this.role_base_zorder;
                this.role.zIndex = this.role_base_zorder;
            }
            return;
        }

        var zorder = 0
        var group = this.role_data.group - 1;
        var pos = this.role_data.pos - 1;
        if (this.role_data.group == BattleConst.Group_Type.Enemgy){
            zorder = BattleRoleZorder[group][pos-GIRD_POS_OFFSET];
        }else{
            zorder = BattleRoleZorder[group][pos]
        }
        this.role_base_zorder = zorder;
        this.role_cur_zorder = zorder;
        this.role.zIndex = zorder;
    },

    // 设置深度
    setLocalZOrder:function(zIndex){
        if(this.role_cur_zorder == zIndex){ return; }
        this.role_cur_zorder = zIndex;
        if(this.role){
            this.role.zIndex = zIndex;
        }
    },

    // 当前深度值
    getLocalZOrder:function(){
        return this.role_cur_zorder || 0;
    },

    // 战斗动作播报
    runAction:function(action){
        if(this.role){
            // this.role.stopAllActions();
            if (action) {
                this.role.runAction(action);
            }
        }
    },

    // 添加一个战斗特效,可能是buff, index:0 为上层特效 1:为下层特效
    addBattleEfffect:function(fix, fiy, effect_id, action_name, index, obj_type){
        if (this.container == null){
            if (this.wait_add_effect_list[effect_id] == null){
                this.wait_add_effect_list[effect_id] = {};
            }
            if (this.wait_add_effect_list[effect_id][action_name] == null) {
                this.wait_add_effect_list[effect_id][action_name] = { fix: fix, fiy: fiy, effect_id: effect_id, action_name: action_name, index: index };
            }
            return
        }
        // 这个确定是否要反转特效
        if (obj_type == null){
            obj_type = this.obj_type;
        }
        if(this.effect_list[effect_id] == null){
            this.effect_list[effect_id] = {}
        }
        if (this.effect_list[effect_id][action_name] == null){
            this.effect_list[effect_id][action_name] = {num:1, object:null}
        }
        var effect_object = this.effect_list[effect_id][action_name];
        if (effect_object.object == null){
            effect_object.object = new BattleEffect();
            effect_object.object.createEffect(this.container, cc.v2(fix, fiy), obj_type, effect_id);
        }else{
            effect_object.num += 1;
            if(effect_object.num > 0){
                effect_object.object.setActiveEffect(true);
            }
        }
        // 设置特效的深度值
        var zorder = this.spine_zorder + 1;
        if (index == 1){
            zorder = this.spine_zorder - 1;
        }
        effect_object.object.setLocalZOrder(zorder);

        return effect_object;
    },

    // 监测是否有待添加特效
    checkEffectNeedAdd:function(){
        for(var effect_id in this.wait_add_effect_list){
            for (var action_name in this.wait_add_effect_list[effect_id]){
                var object = this.wait_add_effect_list[effect_id][action_name];
                if (object && object.effect_id){
                    this.addBattleEfffect(object.fix, object.fiy, object.effect_id, object.action_name, object.index);
                }
            }
        }
        this.wait_add_effect_list = {};
    },

    // 移除一个特效,并不是强制移除,只是把计数器-1,如果计数器为0,才是彻底移除
    delBattleEffect:function(effect_id, action_name, force){
        if (this.wait_add_effect_list[effect_id]){
            if (this.wait_add_effect_list[effect_id][action_name] != null) {
                this.wait_add_effect_list[effect_id][action_name] = null;
            }
        }

        if(this.effect_list[effect_id] == null){
            return;
        }
        var effect_object = this.effect_list[effect_id][action_name];
        if(effect_object == null){
            return;
        }
        effect_object.num -= 1;
        if (effect_object.num <= 0) {
            effect_object.object.setActiveEffect(false)
        }
    },

    // 显示或者隐藏掉血条
    showHpRoot:function(status){
        if (this.is_real == false ) return;         // 假战斗不需要管这个
        if(this.hp_show_status == status){ return; }
        this.hp_show_status = status;
        if(this.top_container){
            this.top_container.active = status
        }
    },

    /**
     * 血量变化的值
     * @param {*} dmg 正数是治疗,负数是扣血
     * @param {*} is_die 是否死亡
     * @param {*} without 是否提出掉非死亡状态
     * @param {*} is_must_die 如果为0,就标识可以移除了.否则就算死了也不移除.因为可能在连击中
     */
    updateHP:function(dmg, is_die, without, is_must_die){
        if(this.role_data == null) { return; }
        if(this.top_container == null) { return; }
        if(this.role_data && this.role_data.object_type == BattleConst.Unit_Type.Hallows) return;

        this.setHP(dmg);
        if (without == null){
            without = false
        }
        Log.info("BattleRole.updateHP, pos:" + this.pos + ', dmg=' + dmg + ', is_die=' + is_die + ', without:' + without + ', is_must_die:' + is_must_die + ', ts:' + new Date().getMilliseconds());
        if (is_die == 1 && is_must_die == 0){
            if (this.is_die == false){
                this.died()
            }
        }else{
            if(this.is_die == true && without == false){
                this.relive()
            }
        }
    },

    // 处理角色复活
    relive: function () {
        if (this.is_die == false) { return };
        this.is_die = false;
        this.resetBaseInfo();
        this.showHpRoot(true);
        this.setActive(true)
        var cur_hp = this.role_data.hp;
        var per = Math.min(1, Math.max(cur_hp / this.role_data.hp_max))
        this.progress.progress = per;
    },

    // 立刻移除对象
    doDied:function(){
        if(this.is_die == true) {
            return;
        }
        this.is_die = true;
        this.showHpRoot(false);
        this.setActive(false)
        this.clearAllEffect();
    },

    // 处理角色死亡
    died: function () {
        // console.trace("1111111111111");

        if(this.in_hurt_act == true){
            Log.info("BattleRole.died skip, in_hurt_act, pos:" + this.pos + ', ts:' + new Date().getMilliseconds());
            this.need_play_die = true;
            return;
        }
        if(this.role == null) {
            Log.info("BattleRole.died skip, this.role == null, pos:" + this.pos + ', ts:' + new Date().getMilliseconds());
            return;
        }
        if(this.is_die == true) {
            Log.info("BattleRole.died skip, this.is_die == true, pos:" + this.pos + ', ts:' + new Date().getMilliseconds());
            return;
        }
        this.is_die = true;
        var delay_time = 0.25;
        var blink = cc.blink(0.25,2);
        var fadeOut = cc.fadeOut(0.25);
        var callFunc_1 = cc.callFunc((function(){
            Log.info("BattleRole.died.callFunc_1, pos:" + this.pos + ', ts:' + new Date().getMilliseconds());
            this.showHpRoot(false);
            this.is_act_die = true;
            this.setActive(false);
            if(this.is_real == false){  //假战斗怪物死掉了的话,需要通知要创建了
                this.assetJumpTo();
                this.hook_model.playEnd(this.pos);
                this.hook_model.updateNextRoundData();
            }
        }).bind(this))
        Log.info("BattleRole.died, pos:" + this.pos + ', ts:' + new Date().getMilliseconds());
        var act = cc.sequence(cc.delayTime(delay_time), blink, fadeOut, callFunc_1);
        this.runAction(act);
        // 清除所有的特效
        this.clearAllEffect(false);
        // 回收掉所有buff图标
        this.removeBuffItemRes();
        this.removeBuffList();
    },

    // 设置是否激活
    setActive:function(status){
        if (this.is_real == true){
            this.top_container.active = status;
        }else{
            this.top_container.active = false;
        }
        this.role.opacity = 255;
        this.shadow.active = status;
        this.skeleton.markForRender(status);
        if (this.effect){
            this.effect.active = status;
        }
    },

    // 受击动作播放完成之后的处理
    checkIsDied:function(){
        Log.info("BattleRole.checkIsDied, pos:" + this.pos + ', this.need_play_die=' + this.need_play_die + ', ts:' + new Date().getMilliseconds());
        if (this.need_play_die == true){
            this.need_play_die = false;
            this.died();
        }else{
            this.doStand()
        }
    },

    // 设置气血
    setHP:function(dmg){
        if(this.role_data == null) { return; }
        var cur_hp = 0
        if(dmg <= 0){       // 伤害
            cur_hp = Math.max(0, dmg + this.role_data.hp);
        }else{              // 恢复
            cur_hp = Math.min(this.role_data.hp_max, dmg + this.role_data.hp)
        }
        this.role_data.hp = cur_hp;
        var per = Math.min(1, Math.max(cur_hp / this.role_data.hp_max))
        this.progress.progress = per;
    },

    // 下一波怪如果是己方需要清掉所有的buff之类的
    updataNextBattleRole:function(data){
        if (this.role_data){
            this.role_data.updateData(data);
            this.clearAllEffect(false);
            if(this.role_data.hp <= 0){
                this.died();
            }else{
                var per = Math.min(1, Math.max(this.role_data.hp / this.role_data.hp_max))
                this.progress.progress = per;
            }
        }
    },

    // 变身操作
    changeSpine:function(status, spine_res, action_name){

    },

    // 通知播放假战斗资源掉落
    assetJumpTo:function(){
        var node_root_pos = this.role.convertToWorldSpace(cc.v2(0, 0));     // 转到世界坐标
        this.model.playResourceCollect(node_root_pos.x, node_root_pos.y + this.model_height * 0.5, this.pos);         //
    },

    // 隐身
    setOpacity:function(status, value){

    },

    // 更新buff,包含更新buff列表
    updateBuffList:function(buff, buff_cfg){
        if(buff == null || buff_cfg == null){
            return;
        }
        this.buff_list[buff.id] = null;
        this.buff_list[buff.id] = {buff:buff, config:buff_cfg, res_id: buff_cfg.icon};

        var temp_group_list = {};
        var res_id = buff_cfg.icon;
        if(res_id != 0){
            var buff_data = this.buff_list_data[res_id];
            if (buff_data == null){
                buff_data = {res_id: res_id, num: 0, list: []};
                this.buff_list_data[res_id] = buff_data;
            }

            if (buff_data.num == 0 || (buff_cfg.join_type && buff_cfg.join_type != 3)) {
                buff_data.num += 1;
                if (buff_cfg.group) {
                    temp_group_list[buff_cfg.group] = true;
                }
            } else if (buff_cfg.join_type && buff_cfg.join_type == 3 && buff_cfg.group && !temp_group_list[buff_cfg.group]) {
                temp_group_list[buff_cfg.group] = true;
                buff_data.num += 1;
            }
            buff_data.list.push(buff.id);

            var temp_ary = []
            for(var key in this.buff_list_data){
                var data = this.buff_list_data[key];
                if(data){
                    temp_ary.push(data);
                }
            }
            if (temp_ary.length > 0){
                temp_ary.sort(Utils.tableLowerSorter(["res_id"]));
                var length = Math.min(3, temp_ary.length);  // 最多值创建4个
                for (let index = 0; index < length; index++) {
                    var data = temp_ary[index];
                    var buff_object = this.buff_list_item[data.res_id];
                    if (buff_object == null){
                        buff_object = this.createBuffItem();
                        this.buff_list_item[data.res_id] = buff_object;
                    }
                    buff_object.label.string = data.num;
                    buff_object.node.x = 22 * index;
                    var buff_path = PathTool.getBuffRes(data.res_id);
                    if(buff_object.path != buff_path){
                        buff_object.path = buff_path;
                        this.loadRes(buff_path, function(icon, res_object){
                            icon.spriteFrame = res_object;
                        }.bind(this), buff_object.icon)
                    }
                }
            }
        }
    },

    // 移除buff没如果没有传参数,就是移除全部
    removeBuffList:function(buff_id){
        if(buff_id == null){
            this.buff_list = {};
            this.buff_list_data = {};
            for (var key in this.buff_list_item){
                var buff_object = this.buff_list_item[key];
                if(buff_object && buff_object.node){
                    BattleRolePool.getInstance().pushBackBuffPools(buff_object.node);
                }
            }
            this.buff_list_item = {};
        }else{
            var data = this.buff_list[buff_id];         // {buff:buff, config:buff_data, res_id: buff_data.icon};
            if(data){
                var buff_object = this.buff_list_item[data.res_id];
                if (buff_object){
                    var buff_data = this.buff_list_data[data.res_id];   // 取出具体数字
                    if (buff_data){
                        buff_data.num -= 1;
                        // 将该buff从列表中删除
                        for (let index = 0; index < buff_data.list.length; index++) {
                            const element = buff_data.list[index];
                            if (element == buff_id){
                                buff_data.list.splice(index, 1);
                                break;
                            }
                        }
                        // 当前没有可用于显示的buff了,把buff节点丢到对象池里面去
                        if (buff_data.num <= 0){
                            buff_object.icon.spriteFrame = null;        // 回收对象的时候,优先清掉旧的纹理信息
                            BattleRolePool.getInstance().pushBackBuffPools(buff_object.node);
                            this.buff_list_item[data.res_id] = null;
                            this.buff_list_data[data.res_id] = null;
                            this.resetBuffPostion();
                        }else{
                            buff_object.label.string = buff_data.num;
                        }
                    }
                }

            }
            this.buff_list[buff_id] = null;
        }
    },

    // 回收buff图标的时候,优先清理掉缓存的纹理信息
    removeBuffItemRes:function(){
        for (var key in this.buff_list_item) {
            var buff_object = this.buff_list_item[key];
            if (buff_object && buff_object.icon) {
                buff_object.icon.spriteFrame = null;        // 回收对象的时候,优先清掉旧的纹理信息
            }
        }
    },

    // 创建10星环绕特效
    createEncircleEffect:function(effect_res){
        if (this.encircle_effect == effect_res) return;
        if(this.effect_skeleton == null){
            this.effect_skeleton = this.effect.addComponent(sp.Skeleton);
        }

        this.encircle_effect = effect_res;
        var skeleton_path = PathTool.getSpinePath(effect_res);
        this.loadRes(skeleton_path, function (skeleton, res_object) {
            skeleton.skeletonData = res_object;
            skeleton.setAnimation(0, PlayerAction.action, true);
            skeleton.enabled = true;
        }.bind(this), this.effect_skeleton)
    },

    // 创建buff,手动创建,但是对象池获取,包含 node, label, path icon
    createBuffItem:function(){
        var pools = BattleRolePool.getInstance().getBuffPools();
        var buff_object = {node:null, label:null, icon:null, path:""};
        var node = null;
        var label = null;
        var icon = null;
        if (pools.size() > 0) {
            node = pools.get();
            label = node.getChildByName("font_label").getComponent(cc.Label);
            icon = node.getChildByName("icon_sprite").getComponent(cc.Sprite);
        } else {
            node = new cc.Node();
            node.setAnchorPoint(0, 0.5);
            node.width = 20;
            node.height = 20;

            var icon_node = new cc.Node();
            icon_node.setAnchorPoint(0, 0.5);
            icon_node.name = "icon_sprite";
            node.addChild(icon_node);
            icon = icon_node.addComponent(cc.Sprite);

            var font_node = new cc.Node();
            font_node.color = new cc.Color(cc.Color.WHITE);
            font_node.setAnchorPoint(1, 0.5);
            font_node.x = 20;
            font_node.y = -3;
            font_node.name = "font_label";
            node.addChild(font_node);

            label = font_node.addComponent(cc.Label);
            label.lineHeight = 14;
            label.fontSize = 14;
            label.horizontalAlign = cc.macro.TextAlignment.RIGHT;

            var outline_label = font_node.addComponent(cc.LabelOutline);
            outline_label.color = new cc.Color(cc.Color.BLACK);
        }
        this.buff_container.addChild(node);

        buff_object.node = node;
        buff_object.label = label;
        buff_object.icon = icon;
        return buff_object;
    },

    // 重新设置buff的位置
    resetBuffPostion:function(){
        if (this.buff_list_item){
            var temp_ary = []
            for (var res_id in this.buff_list_item) {
                if (this.buff_list_item[res_id]) {
                    temp_ary.push({ res_id: res_id, object: this.buff_list_item[res_id] });
                }
            }
            if (temp_ary.length > 0){
                temp_ary.sort(Utils.tableLowerSorter(["res_id"]));
                for (let index = 0; index < temp_ary.length; index++) {
                    const element = temp_ary[index];
                    if (element && element.object && element.object.node) {
                        element.object.node.x = 22 * index;
                    }
                }
            }
        }
    },

    // 判断是否拥有当前id的buff
    hadBuff:function(buff_id){
        return (this.buff_list && this.buff_list[buff_id] != null)
    },

    getRoleData:function(){
        return this.role_data;
    },

    addTips:function(bid){
        this.tips_list[bid] = true;
    },

    removeTips:function(bid){
        this.tips_list[bid] = false;
    },

    loadRes: function (res, callback, node) {
        if (res == null || res == "") return;
        if (callback == null) return;
        var temp_object = this.resources_list[res];
        if (temp_object){
            callback(node, temp_object);
        }else{
            LoaderManager.getInstance().loadRes(res, (function (object, res_object) {
                if (this.resources_list[res] == null) {
                    this.resources_list[res] = res_object;
                }
                callback(object, res_object);
            }).bind(this, node));
        }
    },

    // 设置当前模型和绑在模型上面的特效播放速率
    setTimeScale:function(speed){
        if (this.skeleton == null || this.skeleton.skeletonData == null){
            this.skeleton_time_scale = speed;
        }else{
            if (this.skeleton_timeScale == speed) return;
            this.skeleton_timeScale = speed
            this.skeleton.timeScale = speed;
            this.setEffectScale(speed);
            // 设置特效
            for (var effect_id in this.effect_list) {
                var effect_object = this.effect_list[effect_id]
                for (var action_name in effect_object) {
                    var effect = effect_object[action_name]
                    if (effect && effect.object) {
                        effect.object.setTimeScale(speed);
                    }
                }
            }
        }
    },

    // 显示聊天气泡
    showTalkBubble:function(msg){

    },

    // 清空所有特效
    clearAllEffect:function(is_force){
        for (var effect_id in this.effect_list) {
            var effect_object = this.effect_list[effect_id]
            for (var action_name in effect_object) {
                var effect = effect_object[action_name]
                if (effect && effect.object) {
                    effect.object.deleEffect();
                }
            }
        }
        if (is_force == true) {
            this.effect_list = null;
            this.wait_add_effect_list = null;
        }else{
            this.effect_list = {};
            this.wait_add_effect_list = {};
        }
    },

    /**
     * 从场景中移除这个单位,回收掉所有的创建节点和预制,并且删除掉所有的资源纹理信息
     */
    deleteRole: function () {
        if(this.role){
            this.role.stopAllActions();
        }
        this.clearAllEffect(true);
        this.clearNextActTimer();
        this.clearNextCallTimer();
        this.removeBuffItemRes();                       // 优先清掉buff缓存的纹理信息
        // this.skeleton.skeletonData = null;              // 释放之前先把节点对象的资源清除
        if (this.effect_skeleton){
            this.effect_skeleton.enabled = false;
            // this.effect.removeComponent(sp.Skeleton);
            // this.effect_skeleton = null;       // 10星光环特效
        }
        if(this.camp){
            this.camp.spriteFrame = null;                   // 先释放掉节点对象资源引用对象
        }
        this.action_call_list = {};
        this.tips_list = {};

        for (var skeletonIndex in this.skelon_cache) {
            BattleResPool.getInstance().delRes(skeletonIndex);
        }
        // 这两处释放res 资源有问题
        for (var key in this.resources_list) {
            LoaderManager.getInstance().releaseRes(key);
        }

        this.skelon_cache = {};
        // 移除掉所有的buff节点,并且丢到对象池中
        this.removeBuffList();
        // 把当前节点对象,重新放到缓存池中区
        BattleRolePool.getInstance().pushBackRole(this.role);
    },

    getResPath: function(action_name) {
      // var strList = this.spine_name.split("");
      //   if(strList[0]=="H"){
      //     if(this.spine_name == "H30009" && action_name != "show"){//合josn后统一读取一样图集
      //       action_name = PlayerAction.action;
      //     }
      //   }
        return "spine/" + this.spine_name + "/" + action_name;
    },

});
