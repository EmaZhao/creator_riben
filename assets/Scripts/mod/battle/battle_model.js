// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      战战斗数据控制器,其中包括了战斗场景的创建
//      flyItem attack hideUI showUI fadeOut fadeIn moveBack moveTo noActAttack  暂时实现的播报动作只有这一些
//      blackScreen blackScreen2 blackScreen3 hide show shadow 这一些已经废弃的
// <br/>Create: 2018-11-28 19:19:19
// --------------------------------------------------------------------
var BattleData = require("battle_data");
var BattleConst = require("battle_const");
var LoaderManager = require("loadermanager");
var BattleResPool = require("battle_res_pool");

var AniRes = [
    "hit_effect_list",   // 受击点特效
    "area_effect_list",  // 范围特效
    "act_effect_list",   // 出手点特效
    "bact_effect_list",  // 施法特效
    "trc_effect_list"    // 弹道特效
]

var BattleModel = cc.Class({
    ctor: function () {
    },

    properties: {
        init_fight_status:false,
    },

    initConfig:function () {
        this.battle_controller = require("battle_controller").getInstance();
        this.hook_model = this.battle_controller.getHookModel();
        this.skill_act = require("skill_act");

        this.battle_pools = require("battle_role_pool").getInstance();      // 现在这个对象池主要是存放buff飘字以及主动技能飘字等,退出战斗没有移除掉这个对象池

        this.battle_dmg_cache_list = {};     // 战斗伤害数字的缓存纹理数据,现在退出战斗没有移除掉

        this.battle_effect_list = {};        // 当前战斗存在的非挂接角色的特效,这里存放的,退出战斗就会移除掉
        this.battle_effect_pool = {};        // 已经播放过的特效缓存对象,退出战斗就会移除掉

        this.role_time_scale = 1.1;          // 二倍速下面的模型动作速率
        this.battle_speed = 1;               // 当前战斗速率,服务端速率

        this.button_list_panel_time = 0;     // 假战斗详情面板关闭的时间戳
        this.form_panel_time = 0;            // 真战斗对战面板关闭的时间戳
        this.is_clear = true;

        this.resetInitData();
    },

    // 重设初始化数据
    resetInitData:function(){
        this.my_group = 0;                      // 战斗中我自己的分组,主要区分是否是己方
        this.init_fight_status = false;         // 是否是初始化进詹欧的,主要是做进场
        this.alive_num = 0                      // 存活单位
        this.create_over_num = 0                // 已经创建完成的单位数量
        this.skill_plays_order_list = []        // 当前播放列表
        this.round_data_temp = {}
        this.order_list = [];
        this.round_data = {};
        this.cur_round_data = {}
        this.actor_sum = 0;
        this.actor_play_sum = 0;
        this.act_playing = false;
        this.is_play_round_start = false;
        this.cur_round = null;
        this.next_round = null;
        this.battle_data = null;
        this.combat_type = BattleConst.Fight_Type.Nil;  // 当前战斗类型
        this.real_role_list = {};                       // 真是战斗单位列表
        this.cur_fight_type = 0;                        // 当前战斗类型,如果是0:没有战斗 1:假战斗 2:真战斗
        this.buffs = {};                                // 重连buff
        this.hallows_list = {};                         // 神器数据
        this.scene_buff_effect_list = {};               // 场景buff特效缓存对象
    },

    // 创建一个场景特效,主要是群攻之类的,这类特效在退出战斗的时候会移除掉
    addBattleEfffect: function (parent, scene_pos, reverse, effect_id, action_name){
        var BattleEffect = require("battle_effect");
        var battle_effect = null;
        var effect_key = Utils.getNorKey(effect_id, action_name)

        if (this.battle_effect_pool[effect_key] != null){
            if (this.battle_effect_pool[effect_key].length > 0)
            {
                battle_effect = this.battle_effect_pool[effect_key].shift();          // 从头取出一个
            }
        }
        if(battle_effect == null){
            battle_effect = new BattleEffect();
            battle_effect.createEffect(parent, scene_pos, reverse, effect_id);
        } else {
            battle_effect.resetScenePos(scene_pos);
            battle_effect.resetReverse(reverse);
            battle_effect.setTimeScale(this.role_time_scale);
            battle_effect.setActiveEffect(true);
        }

        if (this.battle_effect_list[effect_key] == null){
            this.battle_effect_list[effect_key] = []
        }
        this.battle_effect_list[effect_key].push(battle_effect);
        return battle_effect;
    },

    // 移除一个场景战斗特效
    delBattleEffect:function(battle_effect){
        var effect_key = battle_effect.getEffectKey();
        if (effect_key == "_") return;
        if (this.battle_effect_pool[effect_key] == null){
            this.battle_effect_pool[effect_key] = []
        }
        var array = this.battle_effect_list[effect_key];
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element == battle_effect){
                array.splice(index, 1);
                battle_effect.setActiveEffect(false);
                this.battle_effect_pool[effect_key].push(battle_effect);
                break;
            }
        }
    },

    // 获取伤害数字的缓存纹理数据
    getDmgFontCacheObject:function(type, callback){
        var res_path = PathTool.getPlistPath("num", "type" + type);
        var res_object = this.battle_dmg_cache_list[res_path];
        if(res_object == null){
            LoaderManager.getInstance().loadRes(res_path, function(res_object){
                this.battle_dmg_cache_list[res_path] = res_object;
                callback(res_object);
            }.bind(this))
        }else{
            callback(res_object);
        }
    },

    // 释放掉战斗资源,退出战斗场景之后释放掉吧,但是这里可能存在一个问题就是退出战斗场景是即时的,但是伤害数字还在处于动作中,这个时候还是释放不掉,战斗艺术字不是特别大,暂时考虑不清除
    releaseDmgFont:function(){
        for(var path in this.battle_dmg_cache_list){
            LoaderManager.getInstance().releaseRes(path);
        }
        this.battle_dmg_cache_list = {};
    },

    // 获取一个普通文字.带背景的,暂时退出战斗没有移除对象池
    getNormalFont:function(){
        var pools = this.battle_pools.getFontPools();
        var node = null;
        if (pools.size() > 0) {
            node = pools.get();
        } else {
            node = new cc.Node();
            node.setAnchorPoint(0.5, 0.5);
            node.width = 176;
            node.height = 44;

            var bg_node = new cc.Node();
            bg_node.addComponent(cc.Sprite);
            node.addChild(bg_node);

            var font_node = new cc.Node();
            var font_label = font_node.addComponent(cc.Label);
            font_label.lineHeight = 20;
            font_label.fontSize = 20;
            font_node.addComponent(cc.LabelOutline);
            font_node.name = "font_label";
            node.addChild(font_node);

            var bg_path = PathTool.getUIIconPath("battle", "battle_buff_name_bg");
            LoaderManager.getInstance().loadRes(bg_path, function (bg_node, res_object) {
                bg_node.getComponent(cc.Sprite).spriteFrame = res_object;
            }.bind(this, bg_node))
        }
        return node;
    },
    /**
     * 回收对象池
     * @param {*} font
     */
    pushBackBattleFont: function (font) {
        this.battle_pools.pushBackFont(font)
    },

    /**
     * 真是战斗的初始化数据.战斗单位可能存在hp为0的时候,这个时候需要特殊处理
     */
    updateCurBattleData:function(data, is_init){
        this.deleteCurBattleData();

        this.init_fight_status = is_init;
        if (this.battle_data == null){
            this.battle_data = new BattleData();
        }
        this.battle_data.updateData(data);

        // 保存战斗速度
        this.saveSpeed(data.play_speed);

        // 更新神器数据
        for (let index = 0; index < data.hallows_list.length; index++) {
            const element = data.hallows_list[index];
            this.hallows_list[element.group] = element;
        }

        // 先判断对战列表中是否有自己的
        var RoleController = require("role_controller");
        var role_vo = RoleController.getInstance().getRoleVo();
        for(var key in this.battle_data.fight_object_list){
            var role_data = this.battle_data.fight_object_list[key];
            if (Utils.getNorKey(role_data.owner_id, role_data.owner_srv_id) == Utils.getNorKey(role_vo.rid, role_vo.srv_id) && this.my_group == 0) {
                this.my_group = role_data.group;
            }
            if (role_data.hp > 0){
                this.alive_num += 1;
            }
            // 处理神器的
            if (role_data.object_type == BattleConst.Unit_Type.Hallows) {
                var hallows_data = this.hallows_list[role_data.group];
                hallows_data.pos = role_data.pos;
                role_data.hallows_val = hallows_data.val;
                role_data.hallows_max = hallows_data.max;
            }
        }
        if(this.my_group == 0){
            this.my_group = 1;
        }
    },

    /**
     * 创建完成之后通知服务端准备报了
     */
    addReadySum:function(){
        this.create_over_num += 1;
        if (this.create_over_num >= this.alive_num){
            this.battle_controller.csReadyFightStart();
        }
    },

    // 获取所有战斗单位
    getAllObject:function(){
        return this.real_role_list;
    },

    // 设置战斗场景可见与否
    handleBattleSceneStatus:function(status){
        if(this.battle_scene){
            this.battle_scene.changeVisible(status)
            // this.battle_scene.setVisible(status)
        }
    },

    // 是否在战斗中
    getFightStatus:function(){
        return this.is_real_combat;
    },

    // 返回战斗场景
    getBattleScene:function(){
        return this.battle_scene;
    },

    // 是否在真战斗中
    isInRealBattle:function(){
        return this.is_real_combat;
    },

    /**
     * 创建战斗场景,这里是唯一的入口,这里需要判断真假战斗切换,等
     * @param {*} in_fight_type 0:没有战斗 1:假战斗 2:真战斗
     */
    createBattleScene:function(in_fight_type, combat_type){
        // 不同类的战斗或者不同类的战斗状态类型,都清掉单位
        if(this.combat_type != combat_type || this.cur_fight_type != in_fight_type || in_fight_type == 1){  // 假战斗也移除掉单位重新创建吧
            this.clearRealRole();
            this.hook_model.clearRealRole();
        }
        this.combat_type = combat_type;         // 储存当前战斗类型
        this.cur_fight_type = in_fight_type;    // 保存当前之战斗状态类型
        this.is_real_combat = (in_fight_type == BattleConst.Battle_In_Type.Real);

        if (this.battle_scene == null) {
            this.battle_scene = Utils.createClass("battle_scene");
        }
        if(this.battle_scene.map_oLayer){
          this.battle_scene.map_oLayer.active = false;
          
        }
        if(this.battle_scene.black_layer){
          this.battle_scene.black_layer.active = false;
        }
        this.battle_scene.updateBattleScene(this.is_real_combat);

        // 只有剧情战斗的时候才需要显示战斗ui
        var is_show = (combat_type == BattleConst.Fight_Type.Darma)
        this.openDramaFightUI(is_show);

        // 只有真战斗才需要显示
        this.openFormViewUI(this.is_real_combat, combat_type);
        this.battle_controller.setIsNormaBattle(this.is_real_combat);

        // 这里把主城设置不可见
        require("mainscene_controller").getInstance().handleSceneStatus(false);

        this.is_clear = false;
    },

    // 剧情战斗的ui部分
    openDramaFightUI:function(status){
        if (this.show_fight_ui_status == status && this.fight_ui_combat == this.is_real_combat){
            return;
        }
        this.show_fight_ui_status = status;
        this.fight_ui_combat = this.is_real_combat;

        if (!status){
            if (this.drama_fight_ui){
                this.drama_fight_ui.hide();
                this.button_list_panel_time = gcore.SmartSocket.getTime();
            }
        }else{
            if (this.drama_fight_ui == null) {
                this.drama_fight_ui = Utils.createClass("battle_button_list_panel");
                var partner = ViewManager.getInstance().getSceneNode(SCENE_TAG.ui);
                this.drama_fight_ui.setParent(partner);
                this.drama_fight_ui.show(this.is_real_combat);
                this.drama_fight_ui.setZIndex(-2);
            }else{
                if (this.drama_fight_ui.is_onshow == false) {
                    this.drama_fight_ui.show(this.is_real_combat);
                }else{
                    this.drama_fight_ui.changeBattleStatus(this.is_real_combat);
                }
            }
            this.button_list_panel_time = 0;
        }
        this.battle_controller.setIsNormaBattle(this.is_real_combat);

        this.startCountDownToDelete();
    },

    // 真战斗中的阵型以及其他相关显示部分
    openFormViewUI:function(status, combat_type){
        if(!status){
            if(this.form_fight_ui){
                this.form_fight_ui.hide();
                this.form_panel_time = gcore.SmartSocket.getTime();
            }
        }else{
            if (this.form_fight_ui){
                this.form_fight_ui.show(combat_type);
            } else {
                this.form_fight_ui = Utils.createClass("battle_form_panel");
                var partner = ViewManager.getInstance().getSceneNode(SCENE_TAG.ui);
                this.form_fight_ui.setAnchorPoint(0, 0);
                this.form_fight_ui.setPosition(-partner.width * 0.5, -partner.height * 0.5);

                this.form_fight_ui.setParent(partner);
                this.form_fight_ui.show(combat_type);
                this.form_fight_ui.setZIndex(-1);
            }
            this.form_panel_time = 0;
        }
        this.startCountDownToDelete();
    },

    // 关闭面板的倒计时
    startCountDownToDelete:function(){
        if (this.form_panel_time == 0 && this.button_list_panel_time == 0){
            if (this.close_panel_timer){
                gcore.Timer.del(this.close_panel_timer);
                this.close_panel_timer = null;
            }
        }else{
            if (this.close_panel_timer == null){
                this.close_panel_timer = gcore.Timer.set(function(){
                    this.waitDeletePanel();
                }.bind(this), 1000, -1);
            }
        }
    },

    // 倒计时准备清楚面板
    waitDeletePanel:function(){
        if (this.form_panel_time == 0 && this.button_list_panel_time == 0){
            this.startCountDownToDelete();  // 移除掉定时器
        }else{
            if (this.button_list_panel_time != 0) {
                var button_pass_time = gcore.SmartSocket.getTime() - this.button_list_panel_time;
                if (button_pass_time > 100) {
                    if (this.drama_fight_ui) {
                        this.drama_fight_ui.deleteMe();
                        this.drama_fight_ui = null;
                    }
                    this.button_list_panel_time = 0;
                }
            }
            if (this.form_panel_time != 0) {
                var form_pass_time = gcore.SmartSocket.getTime() - this.form_panel_time;
                if (form_pass_time > 100) {
                    if (this.form_fight_ui) {
                        this.form_fight_ui.deleteMe();
                        this.form_fight_ui = null;
                    }
                    this.form_panel_time = 0;
                }
            }
        }
    },

    // 引导需要
    getDramaFightUI: function () {
        if (this.drama_fight_ui)
            return this.drama_fight_ui.root_wnd;
        return null;
    },

    /**
     * 彻底移除一个战斗场景,比如说切换出战斗,或者非剧情战斗结束,这个结束
     */
    clearBattleScene: function () {
        if (this.battle_scene && !this.is_clear) {
            // 先移除掉单位定时器
            var role_list = this.getAllBattleRoleList();
            for(var pos in role_list){
                gcore.Timer.del("attackerActTimeout" + pos);
            }
            this.combat_type = BattleConst.Fight_Type.Nil;
            this.cur_fight_type = BattleConst.Battle_In_Type.Nil;       // 移除掉战斗类型
            this.is_real_combat = false;                                // 战斗

            // 清楚掉场景单位
            this.clearRealRole();
            this.hook_model.clearRealRole();    // 假战斗模型资源

            this.battle_scene.deleteMe();
            this.battle_scene = null;

            this.openDramaFightUI(false);
            this.openFormViewUI(false);

            // 移除掉所有的战斗特效--,群攻类和子弹类
            this.cleanAllBattleEffect();

            // 移除真实战斗场景的数据
            this.deleteCurBattleData();

            // 这里切回主城音乐
            Utils.playMusic(AUDIO_TYPE.SCENE, "s_002", true);
            this.is_clear = true;
        }
    },

    // 清空所有的场景战斗特效
    cleanAllBattleEffect:function(){
        // 回收掉场景特效资源
        for (var key in this.battle_effect_list) {
            var array = this.battle_effect_list[key]
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                element.deleEffect();
            }
        }
        this.battle_effect_list = {};

        // 回收掉场景特效资源
        for (var key in this.battle_effect_pool) {
            var array = this.battle_effect_pool[key]
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                element.deleEffect();
            }
        }
        this.battle_effect_pool = {};
    },

    /**
     * 假战斗定帧移动地图处理,现在卸载gamestart 的update里面
     */
    mapMovescheduleUpdate: function () {
        if (this.battle_scene) {
            this.battle_scene.mapMovescheduleUpdate();
        }
    },

    /**
     * 切换战斗移动状态,比如真实剧情战斗切换到假战斗的时候,就需要开启地图移动
     * @param {*} status Bool
     */
    changeMoveMapStatus: function (status) {
        if (this.battle_scene) {
            this.battle_scene.changeMoveMapStatus(status);
        }
    },

    /**
     * 进入真实战斗时,是否需要播放进场动作,中途切进去的不需要处理,这个值针对初始化单位的时候需要,战斗创建一个单位不需要
     */
    needPlayEnterAction:function(){
        return this.init_fight_status;
    },

    /**
     * 真实战斗中的单位是否是友方判断
     * @param {*} group BattleRoleData.group
     */
    isFriend:function(group){
        return (group == this.my_group);
    },

    /**
     * 当前真实战斗的初始化数据
     */
    getCurBattleData:function(){
        return this.battle_data;
    },

    // 获取当前战斗类型
    getCombatType:function(){
        return this.combat_type;
    },

    /**
     * 退出战斗,清空战斗数据,针对真实战斗
     */
    deleteCurBattleData:function(){
        this.resetInitData();
    },

    // 判断是否可以改变战斗速度
    checkIsCanChangeBattleSpeed:function(){
        if(this.battle_data == null){
            return false;
        }
        var next_speed = 1;
        if (this.battle_speed == 1){
            next_speed = 2;
        }
        var speed_config = Config.combat_type_data.data_combat_speed[next_speed];
        if (speed_config == null){
            return false;
        }
        var role_vo = require("role_controller").getInstance().getRoleVo();
        if (role_vo == null){
            return false;
        }
        if (speed_config.limit_lev > role_vo.lev && speed_config.limit_vip_lev > role_vo.vip_lev){
            var desc = cc.js.formatStr(Utils.TI18N("等级达到%s级或VIP%s开启"), speed_config.limit_lev, speed_config.limit_vip_lev);
            message(desc);
            return false;
        }
        var fight_config = Config.combat_type_data.data_fight_list[this.battle_data.combat_type];
        if(fight_config == null){
            return false;
        }
        if (fight_config.is_pvp == 1){
            message(cc.js.formatStr(Utils.TI18N("%s不能更改速度"), fight_config.desc));
            return false;
        }
        return true;
    },

    /**
     * 修改一下当前战斗速度
     */
    changeSpeed:function(){
        if (this.battle_speed == 1) {
            this.saveSpeed(2);
            this.battle_controller.csFightSpeed(2);
        } else {
            this.saveSpeed(1);
            this.battle_controller.csFightSpeed(1);
        }
    },

    /**
     * 当前战斗速度
     */
    getTimeScale:function(){
        var time_scale = 1
        if (this.isInRealBattle() == true){
            time_scale = this.role_time_scale;
        }
        // time_scale = 1.5
        // 要根据当前帧频调整播放速度
        return time_scale
    },

    // 设置当前动作速度
    setBattleTimeScale: function (is_reset) {
        if(this.battle_time_status == is_reset) return;
        this.battle_time_status = is_reset;
        var base_config = null;
        if (is_reset == true){      // 这个时候是1倍速
            base_config = Config.battle_act_data.data_get_act_data.base_speed_scale;
        }else{
            base_config = Config.battle_act_data.data_get_act_data.speed_scale;
        }
        if(base_config){
            this.role_time_scale = base_config.val * 0.01;
        }
        this.setRoleTimeScale();
    },

    // 保存速率之后马上设置模型动作
    setRoleTimeScale: function () {
        if(this.real_role_list){
            for(var key in this.real_role_list){
                var object = this.real_role_list[key];
                if(object){
                    object.setTimeScale(this.role_time_scale);
                }
            }
        }

        // 设置场景特效
        if(this.battle_effect_list){
            for(var key in this.battle_effect_list){
                var array = this.battle_effect_list[key]
                for (let index = 0; index < array.length; index++) {
                    const element = array[index];
                    if (element){
                        element.setTimeScale(this.role_time_scale);
                    }
                }
            }
        }
    },

    // 保存当前战斗速度,这个速度只是为了改变显示
    saveSpeed: function (speed) {
        if (this.battle_speed == speed) return;
        this.battle_speed = speed;
        if(this.form_fight_ui){
            this.form_fight_ui.setSpeed(speed);
        }
    },

    // 获取当前速度
    getSpeed:function(){
        return this.battle_speed;
    },

    /**
     * 一个回合播报的动作计数,最后保证值为0就表示播完了当前动作
     * @param {*} attacker
     */
    actStart:function(attacker){
        // 如果结算面板已经出来了,就不需要播报了
        if (this.checkoutIsRightFight(attacker) == true){
            attacker.wait_act += 1;
            gcore.Timer.del("attackerActTimeout" + attacker.pos);
            gcore.Timer.set((function () {
                this.actTimeout(attacker)
            }).bind(this), 3000, 1, "attackerActTimeout" + attacker.pos)
        }
    },

    /**
     * 某一个动作播放完成之后,计数 -1,当为0的时候,就表示当前小回合播报结束
     * @param {*} attacker
     */
    actFinish:function(attacker){
        if (this.checkoutIsRightFight(attacker) == true){
            if (attacker.wait_act > 0) {
                attacker.wait_act -= 1;
                if (attacker.wait_act <= 0) {
                    if (attacker.is_real) {
                        this.playOrder(attacker);
                        gcore.Timer.del("attackerActTimeout" + attacker.pos);
                    } else {
                        this.hook_model.playOrder(attacker);
                    }
                }
            }
        }
    },

    /**
    * 判断是都是正式战斗
    *
    */
    checkoutIsRightFight:function(attacker){
        if(attacker.is_real == true){
            if(this.battle_data && this.cur_round_data && this.battle_data.combat_type == this.cur_round_data.combat_type){
                return true;
            }
        }else{
            var battle_data = this.hook_model.getUnrealBattleData();
            if(battle_data && battle_data.combat_type == BattleConst.Fight_Type.Darma){
                return true;
            }
        }
        return false;
    },

    /**
     * 小回合播报超时处理
     * @param {*} attacker
     */
    actTimeout:function(attacker){
        if(attacker == null) return;
        attacker.wait_act = 1;
        this.actFinish(attacker);
    },

    /**
     * 回合开始的播报,包括站位的初始化等,因为有一些是需要在回合开始的时候播放的播报  包含回合开始的buff
     * @param {*} data 协议 20002 的数据
     */
    playRoundStart:function(data){
        if (this.getBattleScene() == null || this.battle_data == null || this.battle_data.combat_type != data.combat_type){
            return;
        }
        this.is_play_round_start = true;
        // 处理回合buff
        this.dealRoundBuff(data.round_buff);

        // 处理神器的回合进度
        if(data && data.hallows_list){
            for (let index = 0; index < data.hallows_list.length; index++) {
                const element = data.hallows_list[index];
                if(element){
                    var hallows = this.hallows_list[element.group];
                    if (hallows && hallows.pos){
                        var role = this.real_role_list[hallows.pos];
                        if (role){
                            role.setHallowsRound(element.val);
                        }
                    }
                }
            }
        }
        // 回合开始也处理掉那些假死的模型
        if (data && data.all_alive){
            var temp_list = {};
            for (let index = 0; index < data.all_alive.length; index++) {
                const element = data.all_alive[index];
                if (element){
                    temp_list[element.pos] = true;
                }
            }
            for(var key in this.real_role_list){
                if ( !temp_list[key]){
                    var role = this.real_role_list[key];
                    if (role && !role.is_die && role.role_data && role.role_data.object_type != BattleConst.Unit_Type.Hallows){
                        role.doDied();
                    }
                }
            }
        }
        // 没有技能播报列表,直接通知服务端结束
        if (data == null || data.skill_plays.length == 0){
            this.battle_controller.csRoundFightEnd();
            // 初始化位置层级等相关信息
            this.handlePlayRoundStart(data);
        }else{
            this.addRoundData(data);
        }
        if (this.form_fight_ui) {
            this.form_fight_ui.updateRound(data.action_count);
        }
    },

    /**
     * 正常回合播报,回合开始播报结束之后,进入正常回合播报 包含回合结束buff和效果播报的buff
     * @param {*} data 协议 20004 的数据
     */
    playRoundIn: function (data) {
        this.is_play_round_start = false
        // 回合结束后的buff可能需要处理的
        if (data.round_buff && data.round_buff.length > 0) {
            this.act_after_buff_list = data.round_buff;
        }else{
            this.act_after_buff_list = null;
        }
        this.addRoundData(data);
    },

    // 更新buff
    setBuffsList:function(data){
        this.buffs = data
    },

    /**
     * 更新下一波怪物的数据
     * @param {*} data
     */
    upDateNextMon:function(data){
        if(this.real_role_list == null || data == null) return;
        // 清掉上一回合的死亡对象
        for(var key in this.real_role_list){
            var role = this.real_role_list[key];
            if (role && role.is_die == true){
                role.deleteRole();
                this.real_role_list[key] = null;
            }
        }
        this.setBuffsList(data.buffs);
        if(this.getBattleScene()){
            for (let index = 0; index < data.objects.length; index++) {
                const element = data.objects[index];
                var role = this.real_role_list[element.pos]
                if (this.isFriend(element.group) && role){
                    role.updataNextBattleRole(element);
                }else{
                    this.createRole(element, true, null, true)
                }
            }
        }

        // 更新战斗基本数据
        if(this.battle_data){
            this.battle_data.updateData(data)

            if(this.form_fight_ui){
                this.form_fight_ui.updateBaseInfo();
            }
        }
    },

    /**addReConnectReadySum
     *
     * 处理回合开始的数据
     * @param {*} data 协议 20002 的数据
     */
    handlePlayRoundStart: function (data) {
        if (this.battle_data == null || this.battle_data.combat_type != data.combat_type) { return; }
        if (this.battle_scene == null) { return; }
        this.resetBattleRoleBaseInfo();
    },

    // 处理回合buff
    dealRoundBuff: function(buff_list, attacker){
        if (buff_list == null || buff_list.length == 0) return;
        for (let index = 0; index < buff_list.length; index++) {
            const element = buff_list[index];
            var battle_role = this.real_role_list[element.target];
            var buff_config = Config.skill_data.data_get_buff[element.buff_bid];
            if (battle_role && buff_config){
                this.playRoundBuff(battle_role, element, attacker);
            }
        }
    },

    /**
     * 回合中的播报,这个是播报的主入口
     * @param {*} data 协议 20004 的数据
     */
    addRoundData: function (data) {
        if (this.getBattleScene() == null || this.battle_data == null || this.battle_data.combat_type != data.combat_type){
            return;
        }
        Log.info("BattleModel.addRoundData" + ', data:' + JSON.stringify(data) + ', ts:' + new Date().getMilliseconds());
        // 更新当前回合数
        if (this.form_fight_ui && data.action_count) {
            this.form_fight_ui.updateRound(data.action_count);
        }

        // 播报数据
        this.cur_round = null;
        this.next_round = null;

        this.cur_round_data = data;
        this.skill_plays_order_list = [];
        this.round_data_temp = {};

        if (this.form_fight_ui) {
            this.form_fight_ui.updateRound(data.action_count);
        }
        // 技能播报数据, 解析技能数据
        for (let j = 0; j < data.skill_plays.length; j++) {
            const skill_element = data.skill_plays[j];
            for (let i = 0; i < skill_element.effect_play.length; i++) {
                const effect_element = skill_element.effect_play[i];
                if (this.round_data_temp[skill_element.order] == null){
                    this.round_data_temp[skill_element.order] = []
                    this.skill_plays_order_list.push({ skill_order: skill_element.order, priority: skill_element.order * 1000 + j})
                }
                effect_element.skill_bid = effect_element.skill_bid_of_effect
                effect_element.talk_pos = skill_element.talk_pos
                effect_element.talk_content = skill_element.talk_content
                effect_element.index = i
                effect_element.skill_order = skill_element.order
                effect_element.priority = effect_element.order * 10000 + j * 100 + i

                this.round_data_temp[skill_element.order].push(effect_element)
            }
        }
        // 对出手进行排序
        this.skill_plays_order_list.sort(function(a, b){
            return a.priority - b.priority ;
        })

        // cc.log("HHHHHHHHHHHHHHHHHHHHH");
        // cc.log(this.skill_plays_order_list);
        Log.info("BattleModel.addRoundData" + ', this.skill_plays_order_list:' + JSON.stringify(this.skill_plays_order_list) + ', ts:' + new Date().getMilliseconds());

        this.preloadBattleRes(data, function() {
            this.analyseTempRoundData();
        }.bind(this));

    },

    // 分析当前播报数据
    analyseTempRoundData: function () {
        this.order_list = [];
        this.round_data = {};
        if (Object.keys(this.round_data_temp).length > 0){
            for (let index = 0; index < this.skill_plays_order_list.length; index++) {
                const element = this.skill_plays_order_list[index];
                const temp = this.round_data_temp[element.skill_order];
                for (let i = 0; i < temp.length; i++) {
                    const one_temp = temp[i];
                    if (this.round_data[one_temp.order] == null){
                        this.round_data[one_temp.order] = {};
                        this.order_list.push({order:one_temp.order, priority:one_temp.priority});
                    }
                    if (this.round_data[one_temp.order][one_temp.actor] == null){
                        this.round_data[one_temp.order][one_temp.actor] = {
                            order: one_temp.order,
                            actor: one_temp.actor,
                            skill_bid: one_temp.skill_bid,
                            talk_content: one_temp.talk_content,
                            talk_pos: one_temp.talk_pos,
                            index: one_temp.index,
                            target_list: [],
                        }
                    }

                    const object = this.round_data[one_temp.order][one_temp.actor];
                    object.target_list.push(one_temp);
                }
            }
            // 对出售惊醒排序
            this.order_list.sort(function (a, b) {
                return a.priority - b.priority;
            })
            this.round_data_temp = {};
        }

        // cc.log("出售顺序HHHHH");
        // cc.log(Utils.deepCopy(this.order_list));
        // cc.log(Utils.deepCopy(this.round_data));

        this.round();
    },

    // 回合播报
    round:function(){
        if (this.round_num && this.round_num > 0) return;
        this.round_num = 0
        this.actor_sum = 0;
        this.actor_play_sum = 0;
        this.cur_round = null;
        this.next_round = null;

        // 回合播报之前重置掉所有单位受击状态
        if(this.battle_scene){
            var role_list = this.getAllBattleRoleList();
            for(var key in role_list){
                var role = role_list[key];
                if (role) {
                    role.dmg_index = 0;
                    role.dmg_aid_y_offset = 0;
                    role.is_hurt_play = false;
                    role.is_big_play = false;
                }
            }
        }

        if (this.order_list.length == 0){
            this.cancleBlackScreen();
            // 回合后的buff处理
            if (this.act_after_buff_list && this.act_after_buff_list.length > 0){
                this.dealRoundBuff(this.act_after_buff_list);
                this.act_after_buff_list = null;
            }
            // 重置一些状态,可能是一些数值类的
            if(this.real_role_list){
                for(var key in this.real_role_list){
                    var battle_role = this.real_role_list[key];
                    if(battle_role){
                        battle_role.temp_skill_bid = 0;
                    }
                }
            }
            // 通知服务端播报完成,区分回合开始和中间回合播报
            if (this.is_play_round_start == true) {
                this.battle_controller.csRoundFightEnd();
            }else{
                this.battle_controller.csSkillPlayEnd();
            }
            // 这个时候设置所有的单位初始状态
        } else {
            var first_data = this.order_list.shift();
            var round_data = this.round_data[first_data.order];
            if(this.order_list.length > 0){
                var second_order = this.order_list[0].order
                var second_data = this.round_data[second_order];
                // 找到下一个回合播报,于当前回合播报做比较判断是不是多段攻击,从而在当前播报结束之后,是否需要重置
                for (var actor in second_data){
                    if(this.next_round == null){
                        this.next_round = second_data[actor];
                        break;
                    }
                }
            }
            this.round_num = Object.keys(round_data).length;

            for (var actor in round_data){
                this.round_num -= 1;
                var round_one_temp = round_data[actor];
                if (this.cur_round == null){
                    this.cur_round = round_one_temp;
                }
                if (round_one_temp.target_list.length > 0){
                    var attacker = this.getBattleRoleByPos(round_one_temp.actor)
                    if (attacker){
                        this.actor_sum = this.actor_sum + 1;
                        this.initOrder(attacker, round_one_temp)
                    }else{
                        this.round();
                    }
                }else{
                    this.round();
                }
            }
        }
    },

    // 播放回合buff,可能是回合开始,效果播报结束,也可能是回合结束, 这个buff是协议数据来的
    playRoundBuff:function(target, buff, attacker, effect_hit){
        if (target == null || buff == null) return;
        this.addBuff(attacker, target, buff);

        if (buff.change_type == 1) { // 血量变化的时候
            this.battleRoleHPChange(target, buff.change_value, buff.is_dead, effect_hit, true);
        }
    },

    // buff类的气血上号
    battleRoleHPChange:function(target, value, is_dead, effect_hit, is_buff, camp_restrain){
        if (target == null) return;
        target.updateHP(value, is_dead, true, 0);
        this.mutiHurtNum(target, value, effect_hit, is_buff, camp_restrain);
    },

    // 初始化动作列表,准备开战了,初始化一些数据
    initOrder: function (attacker, one){
        Log.info("BattleModel.initOrder, attack_pos:" + attacker.pos + ',one:' + JSON.stringify(one) + ', ts:' + new Date().getMilliseconds());
        one.target_list.sort(function(a, b){
            return a.priority - b.priority;
        })
        // 这个后续再看看要不要动态设置层级
        if (this.cur_round && this.last_round_actor && this.cur_round.actor == this.last_round_actor){

        }else{
            attacker.resetZOrder();
            attacker.targe_zorder = 9999;
        }

        var list = one.target_list;
        var col_target = list[0].target;
        if (col_target > GIRD_POS_OFFSET) {
            col_target = col_target - GIRD_POS_OFFSET;
        }
        var col = Pos_To_Col[col_target - 1];
        var target = this.getBattleRoleByPos(col_target);
        if (target){
            target.resetZOrder();
            attacker.targe_zorder = target.getLocalZOrder();
        }
        attacker.col = col;
        attacker.is_round = false;
        attacker.attacker_info = one;
        attacker.skill_data = gdata('skill_data', 'data_get_skill', one.skill_bid);
        attacker.target_pos = attacker.grid_pos;
        attacker.play_order_index = one.target_list[0].effect_bid;
        this.calcTargetPos(attacker);

        // 如果没有效果id则不处理,所有播报驱动都是效果驱动
        if (attacker.play_order_index == null || attacker.play_order_index == 0){
            this.actor_play_sum += 1;
            var effect_play = one.target_list[0];
            if (effect_play) {
                if (effect_play.sub_effect_play_list && effect_play.sub_effect_play_list.length > 0){
                    this.handleSubEffectPlaylist(effect_play, attacker);
                }
                this.dealRoundBuff(effect_play.buff_list, attacker);
            }
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
            attacker.is_must_die = effect_config.is_must_die;                                                   // 死亡的时候是否移除,这个主要是判断连击中的时候
            attacker.anime_user_atk = effect_config.anime_user_atk;                                             // 攻击动作名
            attacker.attack_sound = effect_config.attack_sound;                                                 // 攻击音效
            attacker.ready_sound = effect_config.ready_sound;                                                   // 准备音效
            attacker.shout_trick = effect_config.shout_trick;                                                   // 喊招音效
            attacker.hit_sound = effect_config.hit_sound;                                                       // 受击音效
            attacker.hit_effect_list = Utils.deepCopy(this.getCurEffectList(effect_config.hit_effect_list));    // 记录打击特效列表
            attacker.area_effect_list = Utils.deepCopy(this.getCurEffectList(effect_config.area_effect_list));  // 记录范围人物特效
            attacker.act_effect_list = Utils.deepCopy(this.getCurEffectList(effect_config.act_effect_list));    // 记录出手点特效
            attacker.bact_effect_list = Utils.deepCopy(this.getCurEffectList(effect_config.bact_effect_list));  // 记录施法特效
            attacker.trc_effect_list = Utils.deepCopy(this.getCurEffectList(effect_config.trc_effect_list));    // 记录弹道特效
        }
        // 是否有群攻
        if (attacker.area_effect_list.length > 0){
            attacker.attacker_info.is_calc = false
            attacker.in_area_effect = true
            attacker.area_hit_num = 1
            attacker.area_hit_time = 0
        }else{
            attacker.in_area_effect = false
        }
        var start_attack = (function(){
            this.playOrder(attacker);
        }).bind(this);

        // 主动技能和被动技能喊招处理
        var show_skill_nme = (function(){
            var skill_type = attacker.skill_data.type
            if (skill_type == BattleConst.Skill_Type.PASSIVE_SKILL && attacker.skill_data.passive_skill_show == 1){
                this.playFontMessage(attacker, attacker.skill_data.name, null, null, null, null, null, function(){
                    start_attack()
                }.bind(this))
            }else if(skill_type == BattleConst.Skill_Type.ACTIVE_SKILL){
                if(this.form_fight_ui){
                    this.form_fight_ui.showActiveSkillName(attacker, function (){
                        start_attack()
                    })
                }
            }else{
                start_attack()
            }
        }).bind(this);

        if(attacker.skill_data == null){
            this.talk(attacker, start_attack);
        } else {
            this.talk(attacker, show_skill_nme);
        }
        this.act_playing = true
    },

    /**
     * 计算目标点
     * @param {*} attacker
     * @param {*} object_list
     */
    calcTargetPos:function(attacker, object_list){
        if (attacker == null || attacker.attacker_info == null){
            return;
        }
        var target_list = attacker.attacker_info.target_list;
        var target = null;
        for (let index = 0; index < target_list.length; index++) {
            const element = target_list[index];
            if (object_list){
                target = object_list[element.target];
            }else{
                target = this.getBattleRoleByPos(element.target);
            }
            if (target && target.obj_type != attacker.obj_type){
                break;
            }
        }
        if (target){
            attacker.target_pos = target.grid_pos;
            attacker.target_pos_base = target.grid_pos;
            attacker.target_name = target.role_data.object_name;
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

    // 单位喊话
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

    // 获取播报动作
    singleAct:function(act_data, attacker){
        if ((act_data instanceof Array)){
            return this.mutiAct(act_data, attacker);
        }else{
            var act_config = Utils.deepCopy(Config.skill_data.data_get_act_data[act_data])
            if (act_config){
                var args = act_config.act_args;
                var funname = args[0];

                if(funname == null || this[funname] == null){
                    return;
                }
                if(this[funname] instanceof Function){
                    var params = args[1] || [];
                    params.unshift(attacker);
                    Log.info("BattleModel.singleAct 1, attack_pos:" + attacker.pos + ', funname:' + funname +', params:' + params + ', ts:' + new Date().getMilliseconds());
                    var aa = this[funname].apply(this, params);
                    Log.info("BattleModel.singleAct 2, attack_pos:" + attacker.pos + ', funname:' + funname +', params:' + params + ', ts:' + new Date().getMilliseconds());
                    return aa;
                } else {
                    Log.info("动作错误,动作BID:"+act_data);
                }
            }
        }
    },

    // 获取多段播报动作
    mutiAct:function(args, attacker){
        var acts = [];
        for (let index = 0; index < args.length; index++) {
            const element = args[index];
            var act = this.singleAct(element, attacker);
            acts.push(act);
        }

        if (acts.length == 1){
            return acts[0];
        }else{
            return cc.spawn.apply(null, acts);
        }
    },

    /**
     * 技能动作附带糊掉函数
     * @param {*} attacker
     * @param {*} args
     */
    callfun: function (attacker, args){
        var funname = "";
        var params = null;
        if( args instanceof Array){
            funname = args[0];
            params = args[1] || [];
        }else{
            funname = args
        }
        if (funname == ""){
            return;
        }
        if(this[funname] instanceof Function){
            if (params == null){
                params = [];
            }
            params.unshift(attacker);
            this[funname].apply(this, params);
        }else if(typeof(funname) == "number"){
            var act = this.singleAct(funname, attacker)
            attacker.runAction(act);
        }
    },

    /**
     * 普通近战攻击
     * @param {*} attack
     * @param {*} delay_time
     * @param {*} hit_fun
     * @param {*} start_fun 攻击开始动作
     * @param {*} is_reverse 是否是移动到背面
     */
    attack:function(attacker, delay_time, hit_fun, start_fun, is_reverse){
        if (attacker && attacker.anime_user_atk) {
            delay_time = delay_time || 0;
            is_reverse = (is_reverse == 1);

            var start_callback = (function () {
                Log.info("BattleModel.attack.start_callback, attack_pos:" + attacker.pos + ', hit_fun:' + hit_fun + ', ts:' + new Date().getMilliseconds());
                this.callfun(attacker, start_fun)
            }).bind(this);

            var hit_callback = (function () {
                Log.info("BattleModel.attack.hit_callback, attack_pos:" + attacker.pos + ', hit_fun:' + hit_fun + ', ts:' + new Date().getMilliseconds());
                this.callfun(attacker, hit_fun)
            }).bind(this);
            return this.skill_act.attack(attacker, delay_time, attacker.anime_user_atk, hit_callback, start_callback, is_reverse, null, attacker.anime_res)
        }
    },

    /**
     * 远程攻击子弹
     * @param {*} attacker
     * @param {*} delay_time
     * @param {*} move_time
     * @param {*} is_back
     * @param {*} funname
     * @param {*} start_height
     */
    flyItem: function (attacker, delay_time, move_time, is_back, funname, start_height){
        Log.info("BattleModel.flyItem 1, attack_pos:" + attacker.pos + ', funname:' + funname + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
        if(this.checkIsInBattle(attacker) == false){
            return;
        }
        const effect_list = attacker.trc_effect_list;       // 这个效果可能有多个,这个时候主要取第一个吧
        if (effect_list == null || effect_list.length == 0){
            Log.info("播放远程攻击效果失败,不存在远程的效果,效果id为:  " + attacker.play_order_index);
            this.actStart(attacker)
            return;
        }
        const effect_object = effect_list[0];       // 主要第一个
        const is_friend = attacker.is_friend;       // 是否是友方
        var res_up = effect_object.res_up;          //
        if (is_friend == true && effect_object.spec_res_up != ""){
            res_up = effect_object.spec_res_up
        }
        let scale = effect_object.scale;
        let x_fix = effect_object.x_fix * attacker.obj_type;
        let y_fix = (effect_object.y_fix == 0) ? 50 : effect_object.y_fix;
        let anima_name = attacker.anime_user_atk || PlayerAction.action_2;
        var attack_func = (function(){
            const target_list = attacker.attacker_info.target_list;
            if(target_list.length <= 1){            // 只有一个攻击对象的时候
                var target_pos = this.center_pos(attacker, y_fix);
                return this.item(attacker, delay_time, res_up, move_time, funname, start_height, target_pos, scale, effect_object.bid, x_fix, y_fix);
            }else{
                this.playSelfEffect();
                var act_list = []; // 动作列表
                var array = attacker.attacker_info.target_list;
                for (let index = 0; index < array.length; index++) {
                    const element = array[index];
                    const target = this.getBattleRoleByPos(element.target);
                    if(target){     // 目标
                        var target_pos = {x:target.scene_pos.x, y:target.scene_pos.y + y_fix};
                        if (target.group != attacker.group){
                            var func = this.getItem(attacker, delay_time, res_up, move_time, "hurtOne", start_height, target_pos, scale, effect_object.bid, x_fix, y_fix)
                            act_list.push(func);
                        }
                    }
                }

                // 关键数据
                var finish_func = cc.callFunc(function(){
                    if (attacker.attacker_info.last_effect){
                        for (let index = 0; index < attacker.attacker_info.last_effect.length; index++) {
                            const element = attacker.attacker_info.last_effect[index];
                            if (attacker.is_real){
                                this.playMagic(attacker, element)
                            } else {
                                this.hook_model.playMagic(attacker, element)
                            }
                        }
                    }
                }.bind(this))

                if(act_list.length > 0){
                    var act_start = this.skill_act.normalStart(attacker);
                    var act_finish = this.skill_act.normalFinish(attacker);
                    var act = cc.sequence(act_start, cc.spawn.apply(null, act_list), act_finish);
                    attacker.runAction(act);
                }
            }

        }).bind(this);
        Log.info("BattleModel.flyItem 2, attack_pos:" + attacker.pos + ', funname:' + funname + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
        return this.skill_act.attack(attacker, delay_time, anima_name, null, null, false, attack_func, attacker.anime_res);
    },

    // 渐隐掉的播报
    fadeOut:function(attacker, delay_time, time){
        time = time || 10;
        return this.skill_act.fadeOut(attacker, delay_time, time);
    },

    // 渐现出来
    fadeIn:function(attacker, delay_time, time){
        time = time || 1;
        return this.skill_act.fadeIn(attacker, delay_time, time);
    },

    // 处理友方特效
    playSelfEffect:function(attacker){
        if (attacker == null || attacker.attacker_info == null || attacker.attacker_info.target_list == null) return;
        var last_effect = [];
        var target = null;
        for (let index = 0; index < attacker.attacker_info.target_list.length; index++) {
            const element = attacker.attacker_info.target_list[index];
            target = this.getBattleRoleByPos(element.target);
            if (target && attacker.group == target.group){
                last_effect.push(element);
            }
        }
        attacker.attacker_info.effect_play = last_effect;
        attacker.attacker_info.last_effect = last_effect;
    },

    // 回合播报结束设置施法者战力动作
    resetAttackerStandStatus:function(attacker){
        if(this.battle_scene == null || attacker == null){
            return;
        }
        var next_round_actor = 0;
        if (this.next_round) {
            next_round_actor = this.next_round.actor;
        }
        if (this.cur_round){
            this.last_round_actor = this.cur_round.actor;
        }
        if (next_round_actor == 0 || (this.cur_round && this.cur_round.actor != next_round_actor)) {
            this.skill_act.setAnimation(attacker, PlayerAction.battle_stand, true);
            this.cancleBlackScreen();
            attacker.resetZOrder();
        }
    },

    /**
     * 实例化远程子弹动作
     * @param {*} attacker
     * @param {*} delay_time
     * @param {*} effect_name
     * @param {*} move_time
     * @param {*} funname
     * @param {*} start_height
     * @param {*} target_pos
     * @param {*} scale
     * @param {*} bid
     * @param {*} x_fix
     * @param {*} y_fix
     */
    item:function(attacker, delay_time, effect_name, move_time, funname, start_height, target_pos, scale, bid, x_fix, y_fix){
        if(attacker == null || this.battle_scene == null){
            return;
        }
        start_height = (start_height || 0) * attacker.model_height * 0.01;
        move_time = move_time || 10;
        var hit_callback = (function(){
            this.callfun(attacker, funname);
            // 这里暂时注释掉不知道有没有问题
            // if(attacker.attacker_info.target_list.length > 0){
            //     attacker.attacker_info.target_list.unshift();
            // }
        }).bind(this);

        if (!attacker.is_real){
            hit_callback();
        }else{
            attacker.runAction(this.skill_act.flyItem(attacker, delay_time, effect_name, move_time, hit_callback, start_height, target_pos, scale, bid, x_fix, y_fix));
        }
    },

    /**
     * 获取移动动作
     * @param {*} attacker
     * @param {*} delay_time
     * @param {*} effect_name
     * @param {*} move_time
     * @param {*} funname
     * @param {*} start_height
     * @param {*} target_pos
     * @param {*} scale
     * @param {*} bid
     * @param {*} x_fix
     * @param {*} y_fix
     */
    getItem:function(attacker, delay_time, effect_name, move_time, funname, start_height, target_pos, scale, bid, x_fix, y_fix){
        start_height = start_height || 60;
        move_time = move_time || 10;
        var hit_callback = (function(){
            Log.info("BattleModel.getItem.hit_callback, attack_pos:" + attacker.pos + ', target_pos:' + JSON.stringify(target_pos) + ', effect_name:' + effect_name + ', funname:' + funname + ', delay_time:' + delay_time + ', move_time:' + move_time + ', ts:' + new Date().getMilliseconds());
            this.callfun(attacker, funname);
            // 这里暂时注释掉不知道有没有问题
            // if(attacker.attacker_info.target_list.length > 0){
            //     attacker.attacker_info.target_list.unshift();
            // }
        }).bind(this);
        var act = this.skill_act.flyItem(attacker, delay_time, effect_name, move_time, hit_callback, start_height, target_pos, scale, bid, x_fix, y_fix);
        return act;
    },

    // 播报,动作施法者
    playOrder:function(attacker){
        Log.info("BattleModel.playOrder 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds() + ', stack:' + new Error().stack);
        if (attacker == null) return;
        if (attacker.wait_act && attacker.wait_act != 0) return;
        // 没有技能效果的时候,直接移除掉
        if (attacker.play_order_index == null || attacker.play_order_index == 0) return;
        // 每个动作的计数器,当一个动作开始之后开始计数,为0标识这个动作做完了
        attacker.wait_act = 0;

        if (attacker.play_order == null || attacker.play_order.length == 0){
            this.actor_play_sum += 1;

            if(!attacker.is_die){
                Log.info("BattleModel.playOrder 3, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
                this.resetAttackerStandStatus(attacker);
            }

            if(!attacker.is_round){
                this.act_playing = false;
                if (this.actor_play_sum >= this.actor_sum){
                    Log.info("BattleModel.playOrder 4, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
                    this.round();
                }
                Log.info("BattleModel.playOrder 5, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            }
        }else{
            var index = attacker.play_order.shift();
            var act = this.singleAct(index, attacker);
            Log.info("BattleModel.playOrder 2, attack_pos:" + attacker.pos + ', act:' + JSON.stringify(act) + ', ts:' + new Date().getMilliseconds());
            if(act){
                attacker.runAction(act);
            }
        }
    },

    // 处理群攻效果,比如说音效不要播太多
    batchPlayHurt:function(attacker){
        if(attacker == null || attacker.attacker_info == null || attacker.attacker_info.target_list == null){
            return;
        }
        var target_list = attacker.attacker_info.target_list;
        if (target_list.length == 0){
            return
        }
        Log.info("BattleModel.batchPlayHurt, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        var had_play = false;           // 多个受击音效只需要播放一次
        for (let index = 0; index < target_list.length; index++) {
            const element = target_list[index];
            if (attacker.is_real){
                var play_effect = false;
                if (element.hp_changed && element.hp_changed < 0 && had_play == false){
                    had_play = true;
                    play_effect = true;
                }
                this.playMagic(attacker, element, play_effect)
            }else{
                this.hook_model.playMagic(attacker, element, play_effect)
            }
        }
    },

    /**
     * 播放普通战斗飘字
     * @param {*} target 战斗目标单位
     * @param {*} desc 当前文本
     * @param {*} parent 父节点,如果没有,则默认是战斗场景特效层1
     * @param {*} x x方向的偏移值
     * @param {*} y y方向的偏移值
     * @param {*} color 文字颜色
     * @param {*} outline 文字描边色
     */
    playFontMessage:function(target, desc, parent, x, y, color, outline, callback){
        if(this.checkIsInBattle(target) == false){
            return;
        }
        if(parent == null){
            parent = this.battle_scene.getBattleEffectLayer(1)      // 默认放在特效1层上面
        }
        x = x || 0;
        y = y || 0;
        var target_x = target.scene_pos.x + x;
        var target_y = target.scene_pos.y + y + target.model_height/2;
        if (color == null){
            color = 217;
        }
        if (outline == null){
            outline = 218;
        }

        // 设置字体默认颜色
        var normal_node = this.getNormalFont();
        normal_node.setPosition(target_x, target_y);

        var font_node = normal_node.getChildByName("font_label");
        var hex = Config.color_data.data_color16[color];
        var _color = font_node.color;
        _color.fromHEX(hex);
        font_node.color = _color;

        // 设置描边颜色
        var out_hex = Config.color_data.data_color16[outline];
        var out_line = font_node.getComponent(cc.LabelOutline);
        var _color1 = out_line.color;
        _color1.fromHEX(out_hex);
        out_line.color = _color1;

        // 设置字体
        var label = font_node.getComponent(cc.Label);
        label.string = desc;
        parent.addChild(normal_node);

        if (target.buff_show_index == null){
            target.buff_show_index = 0;
        }
        target.buff_show_index = target.buff_show_index + 1;

        var show = cc.show();
        var delay = cc.delayTime(0.3 * target.buff_show_index);
        var delay_over = cc.callFunc(function () {
            target.buff_show_index -= 1;
        }.bind(this))
        var scale_to_1 = cc.scaleTo(0.4, 1.2);
        var move_by_1 = cc.moveBy(0.4, 0, 50);
        var fade_in = cc.fadeIn(0.4);

        var scale_to_2 = cc.scaleTo(0.6, 0.9);
        var fade_out = cc.fadeOut(0.6);
        var move_by_2 = cc.moveBy(0.6, 0, 25);
        var hide = cc.hide();

        normal_node.runAction(cc.sequence(show, delay, delay_over, cc.spawn(scale_to_1, move_by_1, fade_in), cc.spawn(scale_to_2, fade_out, move_by_2), hide, cc.callFunc(function () {
            if (callback) {
                callback();
            }
            this.pushBackBattleFont(normal_node);
        }.bind(this))));
    },

    /**
     * 播放魔法特效
     * @param {*} attacker
     * @param {*} effect_play
     * @param {*} no_die
     * @param {*} play_effect
     */
    playMagic: function (attacker, effect_play, play_effect){
        Log.info("BattleModel.playMagic 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        if (this.battle_scene == null){ return; }
        Log.info("BattleModel.playMagic 1.1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        if (effect_play.target == null){ return; }
        Log.info("BattleModel.playMagic 1.2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        if (attacker == null){ return; }
        Log.info("BattleModel.playMagic 1.3, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        if (effect_play.play_num != null && effect_play.play_num <= 0){ return; }
        Log.info("BattleModel.playMagic 1.4, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        if (effect_play.play_num == null && attacker.split_hurt){
            effect_play.play_num = attacker.split_hurt || 1;
            if(effect_play.play_num > 1){
                effect_play.avg_hp_changed = Math.ceil(effect_play.hp_changed / effect_play.play_num)
            }
        }
        effect_play.play_num = effect_play.play_num || 1;
        effect_play.play_num -= 1;
        var effect_hit = 1;
        var target = this.getBattleRoleByPos(effect_play.target);
        Log.info("BattleModel.playMagic 1.5, attack_pos:" + attacker.pos + ', target = ' + !!target + ', ts:' + new Date().getMilliseconds());
        if (target){
            if (effect_play.is_hit == 0 || effect_play.is_blind == 1){          // 闪躲或者未命中
                effect_hit = 0
                var desc = Utils.TI18N("闪躲");
                if(effect_play.is_blind == 1){
                    desc = Utils.TI18N("未命中");
                }
                if(effect_play.is_dead == 0){       // 非死亡情况下才飘字
                    this.playFontMessage(target, desc, null, null, null, 227, 228);
                }
            }
            var hp_changed = effect_play.avg_hp_changed || effect_play.hp_changed || 0;
            var dmg = Math.floor(hp_changed);
            if(effect_play.is_crit == 1){   // 暴击
                effect_hit = 2;
            }
            var is_dead = effect_play.is_dead;
            if(effect_play.play_num > 0){       // 多次伤害的话第一次不能死
                is_dead = 0
            }
            // 处理召唤列表
            Log.info("BattleModel.playMagic addRoleList 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            if (effect_play.summon_list.length > 0){
                this.addRoleList(effect_play.summon_list, attacker)
            }
            Log.info("BattleModel.playMagic addRoleList 2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            // 处理子效果
            Log.info("BattleModel.playMagic handleSubEffectPlaylist 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            if (effect_play.sub_effect_play_list.length > 0){
                this.handleSubEffectPlaylist(effect_play, attacker)
            }
            Log.info("BattleModel.playMagic handleSubEffectPlaylist 2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            // 副本中需要的特殊处理
            Log.info("BattleModel.playMagic handleExtendDungeon 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            this.handleExtendDungeon(effect_play)
            Log.info("BattleModel.playMagic handleExtendDungeon 2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            // 处理援护
            Log.info("BattleModel.playMagic handleAidActor 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            if (effect_play.aid_actor != 0){
                this.handleAidActor(effect_play, attacker, effect_hit, target)
            }
            Log.info("BattleModel.playMagic handleAidActor 2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            // 播放受击处理
            Log.info("BattleModel.playMagic playBattleRoleHurt 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            this.playBattleRoleHurt(attacker, target, dmg, play_effect);
            Log.info("BattleModel.playMagic playBattleRoleHurt 2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());

            // 飘字处理
            Log.info("BattleModel.playMagic showbuffName 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            if(attacker.effect_desc != "" && effect_play.is_hit != 0 && effect_play.play_num <= 0){
                this.showbuffName(target, attacker.effect_desc, 229, 230, attacker.play_order_index);
            }
            Log.info("BattleModel.playMagic showbuffName 2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            // 把扣血放到最后,因为有死亡动作
            Log.info("BattleModel.playMagic updateTargetHp 1, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            this.updateTargetHp(attacker, target, dmg, is_dead, effect_hit, effect_play);
            Log.info("BattleModel.playMagic updateTargetHp 2, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());

            // 处理buff列表,非死亡的时候才处理,如果上面播报已经说死了,不需要处理buff了
            if (effect_play.play_num <= 0 && effect_play.buff_list.length > 0) {
                this.handleBufflist(attacker, effect_play.buff_list, 1)
            }
        }
    },

    // 播放受击处理
    playBattleRoleHurt:function(attacker, target, dmg, play_effect){
        if (attacker == null || target == null) return;
        if (target.is_hurt_play == true) return;
        target.is_hurt_play = true

        if (!target.is_big_play) {
            target.is_big_play = true
            this.playHurtEffect(attacker, target)
        }
        if (attacker.pos != target.pos && dmg < 0 && attacker.group != target.group) {    // 播放受击动作
            if (attacker.hit_action != "no-hurt") {
                this.skill_act.hurt(attacker, target, attacker.hit_action, play_effect)
            }
        }
    },

    /**
     * 更新血条处理
     * @param {*} attacker
     * @param {*} target
     * @param {*} dmg
     * @param {*} is_die
     * @param {*} effect_hit 1是是普通, 2是暴击
     * @param {*} is_yuanhu
     * @param {*} is_normal
     * @param {*} effect_play
     */
    updateTargetHp:function(attacker, target, dmg, is_die, effect_hit, effect_play){
        if (target == null) return;
        if (attacker == null) return;
        if (dmg == 0) return;
        effect_hit = effect_hit || 1;
        this.mutiHurtNum(target, dmg, effect_hit, false, effect_play.camp_restrain);
        // 储存具体数据
        target.updateHP(dmg, is_die, false, attacker.is_must_die);
    },

    /**
     * 播放伤害飘血
     * @param {*} tatget
     * @param {*} dmg
     * @param {*} effect_hit 1是是普通, 2是暴击
     * @param {*} is_normal
     * @param {*} is_buff
     * @param {*} camp_restrain
     */
    mutiHurtNum:function(target, dmg, effect_hit, is_buff, camp_restrain){
        if(this.checkIsInBattle(target) == false || dmg == 0 || target.is_real == false){
            return;
        }
        // 这个数值用于处理飘血高度的...放置叠加到一起
        if (target.dmg_index == null){
            target.dmg_index = 0;
        }
        target.dmg_index += 1;
        this.skill_act.playDmgMessage(target, dmg, effect_hit, is_buff, camp_restrain);
    },

    /**
     * 处理buff效果
     * @param {*} attacker
     * @param {*} list
     * @param {*} effect_hit 是否是暴击
     */
    handleBufflist:function(attacker,list,effect_hit){
        if(this.checkIsInBattle(attacker) == false){
            return;
        }
        for (let index = 0; index < list.length; index++) {
            const buff = list[index];
            const target = this.getBattleRoleByPos(buff.target);
            if(target){
                this.playRoundBuff(target, buff, attacker, effect_hit);
            }
        }
    },

    /**
     * 添加一个buf
     * @param {*} attacker buff的发起者.可能没有
     * @param {*} target
     * @param {*} buff
     */
    addBuff:function(attacker, target, buff){
        if (target == null || buff == null) return;
        var buff_data = Config.skill_data.data_get_buff[buff.buff_bid];
        if (buff_data == null) return;
        if (buff_data.is_passive == 1){
            this.playBuffEffect(attacker, target, buff, buff_data);
        }
        if (buff.action_type == 4) return;
        if (buff.action_type == 2){
            this.removeBuff(target, buff, buff_data);
        }else{

            if (buff_data.is_passive == 1 || buff_data.group == 3211){    // 不可复活组的buff额外处理
                if (buff.action_type == 1 || buff.action_type == 3){    // 主处理新增或者是展示的buff
                    if (buff_data.group != 3211) {
                        if (buff_data.buff_spine && buff_data.buff_data != "") {    // 存在变身的buff
                            target.changeSpine(true, buff_data.buff_spine, PlayerAction.battle_stand);
                        }
                        if (buff_data.group == 3703) {        // 隐身buff
                            target.setOpacity(true, 155);
                        }
                    }
                    if (buff.action_type == 1 && buff.remain_round != 0){     // 新增buff才处理,这里主要是开始增加血条下面的bufficon
                        target.updateBuffList(buff, buff_data);
                    }
                }
            }
        }
    },

    // 移除一个buff,包含移除一个对象的特效和移除一个buff图标
    removeBuff:function(target, buff, buff_data){
        if(this.getBattleScene() == null || target == null) return;
        if(buff == null || buff_data == null) return;
        var had_buff = target.hadBuff(buff.id);
        if (had_buff == true){
            target.removeBuffList(buff.id); // 移除一个buff,并且包含移除buff图标
            if (buff_data.group == 3703){   // 隐身buff
                target.setOpacity(false);
            }
            if (buff_data.buff_spine && buff_data.buff_spine != ""){    // 移除变身效果
                target.changeSpine(false);
            }
            // 如果是场景buff,则移除
            var effect_config = Config.skill_data.data_get_effect_data[buff_data.res];
            if (effect_config && effect_config.play_type == BattleConst.Effect_Play_Type.ROLE_SCENE){
                this.removeSceneBuffEffect(target.group, effect_config.bid);
            }
            // 移除buff存在的特效绑在自身上的
            if (effect_config){
                this.removeBattleSpineEffect(target, effect_config);
            }
        }
    },

    // 添加一个场景buff特效
    addSceneBuffEffect:function(group, bid, effect_res, effect){
        if(group == null || bid == null || effect_res == null || effect == null) return;
        var key = Utils.getNorKey(group, bid);
        if (this.scene_buff_effect_list[key] == null){
            this.scene_buff_effect_list[key] = {};
        }
        // 如果存在的话,先丢到对象池里面去
        if (this.scene_buff_effect_list[key][effect_res]){
            this.delBattleEffect(this.scene_buff_effect_list[key][effect_res]);
        }
        this.scene_buff_effect_list[key][effect_res] = effect;
    },

    // 移除一个场景buff特效
    removeSceneBuffEffect:function(group, effect_bid){
        if(group == null || effect_bid == null){
            if (this.scene_buff_effect_list){
                for(var key in this.scene_buff_effect_list){
                    for(var res in this.scene_buff_effect_list[key]){
                        var effect = this.scene_buff_effect_list[key][res];
                        this.delBattleEffect(this.scene_buff_effect_list[key][effect]);
                    }
                }
                this.scene_buff_effect_list = {};
            }
        }else{
            var key = Utils.getNorKey(group, effect_bid);
            var effect_list = this.scene_buff_effect_list[key];
            if (effect_list){
                for (var key in effect_list){
                    this.delBattleEffect(effect_list[key]);
                }
            }
            this.scene_buff_effect_list[key] = null;
        }
    },

    // 移除一个绑在单位身上的buff特效,这里会根据特效配置去判断上下层特效资源
    removeBattleSpineEffect:function(target, effect_config){
        if(target == null || effect_config == null) return;
        var action_name = PlayerAction.action;
        if (effect_config.up_action_name != ""){
            action_name = effect_config.up_action_name;
        }
        target.delBattleEffect(effect_config.res_up, action_name);  // 移除上层特效

        action_name = PlayerAction.action;
        if (effect_config.down_action_name != "") {
            action_name = effect_config.down_action_name;
        }
        target.delBattleEffect(effect_config.res_down, action_name);  // 移除下层特效
    },

    // 播放buff效果,以及添加bufficon等
    playBuffEffect:function(attacker, target, buff, buff_data){
        if(buff == null || buff_data == null) return;
        var text_color = null;
        var outline_color = null;
        if (buff_data.client_desc != ""){
            if (buff.action_type == 1 || buff.action_type == 4){    // 增益
                if (buff_data.positive_or_negative == 1) {
                    text_color = 221
                    outline_color = 222
                } else if (buff_data.positive_or_negative == 2) {    // 减益
                    text_color = 223
                    outline_color = 224
                } else if (buff_data.positive_or_negative == 3) {    // 控制
                    text_color = 225
                    outline_color = 226
                }
                this.showbuffName(target, buff_data.client_desc, text_color, outline_color, buff.buff_bid);
            }
        }
        if (attacker == null) return;
        var hadbuff = target.hadBuff(buff.id);
        if (!hadbuff && buff.action_type == 1 && buff_data.res != 0){  // 不存在的buff才需要处理
            var config = Config.skill_data.data_get_effect_data[buff_data.res];
            if(config){
                if(config.play_type == BattleConst.Effect_Play_Type.ROLE_SCENE){
                    var key = Utils.getNorKey(target.group, buff_data.res)
                    if (this.scene_buff_effect_list[key] == null || Utils.next(this.scene_buff_effect_list[key]) == false){
                        this.effectArea(attacker, [config.res_up, config.res_down], 0, null, config.play_type, config.x_fix, config.y_fix, buff_data.res, config.is_col_effect, false);
                    }
                }else{
                    this.effectSpineUser(attacker, (buff_data.is_release == 1), config.x_fix * target.obj_type, config.y_fix, [config.res_up, config.res_down], target, 1, null, buff_data.bid, buff_data.res);
                }
            }
        }
        // 一次效果
        if(buff.action_type == 3 && buff_data.efftive_effect != 0){
            var config = Config.skill_data.data_get_effect_data[buff_data.efftive_effect];
            if(config){
                this.effectSpineUser(attacker, true, config.x_fix * target.obj_type, config.y_fix, [config.res_up, config.res_down], target, 1, null, buff_data.bid, buff_data.res);
            }
        }
    },

    // 播放buff描述文字,这里需要对这个对象做判断,如果bid的飘字存在,则不处理了...
    showbuffName:function(target, desc, color, outline_color, bid){
        if (target == null || bid == null) return;
        if (target.tips_list[bid]) return;
        target.addTips(bid);
        var callback = function(){
            target.removeTips(bid);
        }.bind(this);
        this.playFontMessage(target, desc, null, null, null, color, outline_color, callback)
    },

    /**
     * 添加召唤列表
     * @param {*} list
     * @param {*} attacker
     */
    addRoleList:function(list, attacker){
        if(list == null || list.length == 0) return;
    },

    /**
     * 处理子效果
     * @param {*} effect_play
     * @param {*} attacker
     */
    handleSubEffectPlaylist:function(effect_play, attacker){
        if (effect_play == null || effect_play.sub_effect_play_list == null || effect_play.sub_effect_play_list.length == 0) return;
        for (let index = 0; index < effect_play.sub_effect_play_list.length; index++) {
            const element = effect_play.sub_effect_play_list[index];
            var sub_target = this.real_role_list[element.sub_target];
            if (sub_target) {
                // 播放气血变化的
                this.battleRoleHPChange(sub_target, element.sub_hp_changed, false, 1, true);
                if (element.extra_effect && element.extra_effect.length > 0){
                    for (let n = 0; n < element.extra_effect.length; n++) {
                        const extra = element.extra_effect[n];
                        if (extra.extra_key == 2){   // 护盾吸收
                            this.skill_act.playBuffAbsorbHurt(sub_target, extra.extra_param);
                        }
                    }
                }
                // 技能效果是否飘字
                var effect_config = gdata('skill_data', 'data_get_effect', element.sub_effect_id);
                if (effect_config && effect_config.effect_desc != "" && element.sub_is_hit != 0){
                    this.showbuffName(sub_target, effect_config.effect_desc, 229, 230, element.sub_effect_id);
                }
                // 被动技能是否飘字
                var skill_config = gdata('skill_data', 'data_get_skill', element.sub_skill_id);
                if (skill_config && skill_config.passive_skill_show == 1) {
                    this.showbuffName(sub_target, skill_config.name, 217, 218, element.sub_skill_id);
                }
                // 闪躲处理
                if (element.sub_is_hit == 0 && effect_play.is_dead == 0){
                    this.showbuffName(sub_target, Utils.TI18N("躲闪"), 227, 228, element.sub_effect_id);
                }
            }
        }
    },

    /**
     * 副本数据特殊处理
     * @param {*} effect_play
     */
    handleExtendDungeon:function(effect_play){
        if (this.battle_data == null || this.battle_data.combat_type != BattleConst.Fight_Type.GuildDun) return;
        if(this.form_fight_ui){
            this.form_fight_ui.addGuildBossUI(effect_play.total_hurt)
        }
    },

    /**
     * 处理援护
     * @param {*} effect_play
     * @param {*} attacker
     * @param {*} effect_hit 是否暴击
     * @param {*} target
     */
    handleAidActor:function(effect_play, attacker, effect_hit, target){
        if (effect_play == null || effect_play.aid_actor == 0) return;
        var aid_target = this.real_role_list[effect_play.aid_actor];
        if (aid_target){
            var aid_dmg = effect_play.actor_hp_changed;     // 援护者血量变化
            var friend_pos = target.scene_pos;              //
            var role_width = target.model_width * target.obj_type;
            var camp_restrain = effect_play.camp_restrain;  // 是否是阵营压制
            aid_target.setLocalZOrder(target.getLocalZOrder() + 1);     // 层级放到上面来
            aid_target.setScenePos(cc.v2(friend_pos.x + role_width, friend_pos.y)); // 设置援护坐标
            this.actStart(attacker);
            this.skill_act.aid_hurt(attacker, aid_target, "hurt");
            this.battleRoleHPChange(aid_target, aid_dmg, effect_play.actor_is_dead, effect_hit, false, camp_restrain);
            this.playHurtEffect(attacker, aid_target);
        }
    },

    /**
     * 播放伤害特效
     * @param {*} attacker
     * @param {*} target
     */
    playHurtEffect:function(attacker, target){
        if(this.battle_scene == null || attacker == null || attacker.hit_effect_list == null || attacker.hit_effect_list.length == 0){
            return;
        }
        const array = attacker.hit_effect_list;
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            this.effectSpineUser(attacker, true, element.x_fix * attacker.obj_type, element.y_fix, [element.res_up, element.res_down], target, element.scale * 0.001, null, element.bid);
        }
    },

    /**
     * 出手前动作
     * @param {*} attacker
     */
    attackReady:function(attacker){
        if(attacker == null){
            return;
        }
        if(attacker.bact_effect_list == null || attacker.bact_effect_list.length == 0){
            return;
        }
        // 播放出手前音效
        if (attacker.ready_sound && attacker.ready_sound != "" && attacker.is_real == true ) {
            Utils.playEffectSound(AUDIO_TYPE.BATTLE, attacker.ready_sound);
        }
        const array = attacker.bact_effect_list;
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if(element && element.play_type == BattleConst.Effect_Play_Type.ROLE){
                if(element.res_up != "" || element.res_down != ""){
                    this.effectSpineUser(attacker, true, element.x_fix*attacker.obj_type, element.y_fix, [element.res_up, element.res_down], attacker, element.scale*0.001, null, element.bid);
                }
            }
        }
    },

    /**
     * 创建单位跟随特效
     * @param {*} attacker
     * @param {*} is_release
     * @param {*} x_fix
     * @param {*} height
     * @param {*} effect_list
     * @param {*} target 目标对象,也可能是自己,也可能是被攻击者
     * @param {*} scale
     * @param {*} callback
     * @param {*} bid
     * @param {*} buff_bid 如果这个值不为0,即最终值
     */
    effectSpineUser: function (attacker, is_release, x_fix, height, effect_list, target, scale, callback, bid, buff_bid){
        if (buff_bid && buff_bid != 0){
            bid = buff_bid
        }
        var obj_type = BattleConst.Battle_Type_Conf.TYPE_ROLE;
        if (attacker){
            obj_type = attacker.obj_type;
        }
        this.skill_act.effectSpineUser(attacker, is_release, x_fix, height, effect_list, target, scale, callback, bid, obj_type);
    },

    // 群攻
    areaHurt:function(attacker){
        var hurt_func = (function(){
            if(this.battle_scene){
                var role_list = this.getAllBattleRoleList();
                for (var key in role_list){
                    const role = role_list[key];
                    if (role) {
                        role.is_hurt_play = false
                        role.is_big_play = false
                    }
                }
            }
            Log.info("BattleModel.areaHurt.hurt_func, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            this.batchPlayHurt(attacker);
        }).bind(this);
        Log.info("BattleModel.areaHurt, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        this.playSceneAreaEffect(attacker, hurt_func);
    },

    // 播放范围特效
    playSceneAreaEffect:function(attacker, callback){
        if(attacker == null || attacker.play_order_index == null || attacker.area_effect_list == null || attacker.area_effect_list.length == 0){
            return;
        }
        var array = attacker.area_effect_list;
        Log.info("BattleModel.playSceneAreaEffect, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element && (element.res_down != "" || element.res_up != "")){
                this.effectArea(attacker, [element.res_up, element.res_down], 0, callback, element.play_type, element.x_fix, element.y_fix, element.bid, element.is_col_effect)
            }
        }
    },

    /**
     * 播放范围特效
     * @param {*} attacker
     * @param {*} effect_list
     * @param {*} height
     * @param {*} is_reverse
     * @param {*} hit_callback
     * @param {*} play_type
     * @param {*} x_fix
     * @param {*} y_fix
     * @param {*} bid
     * @param {*} is_col_effect
     * @param {*} is_release 播完是否释放
     */
    effectArea:function(attacker, effect_list, height, hit_callback, play_type, x_fix, y_fix, bid, is_col_effect, is_release){
        height = height || 0;
        var reverse = attacker.obj_type;
        var is_left = attacker.is_friend;
        var scene_pos = null;
        if (is_col_effect == 1){
            var temp_list = null;
            if(is_left){
                temp_list = [{x:34,y:17},{x:34,y:23},{x:34,y:29}]
            }else{
			    temp_list = [{x:44,y:17},{x:44,y:23},{x:44,y:29}]
            }
            var pos = temp_list[attacker.col]
            if(pos){
                var temp_pos = this.skill_act.gridPosToScreenPos(pos);
                scene_pos = { x: temp_pos.x + x_fix, y: temp_pos.y + y_fix};
            }
        }else{
            if (play_type == BattleConst.Effect_Play_Type.SCENE){           // 暂时看到是作废的
                scene_pos = {x: SCREEN_WIDTH*0.5, y: SCREEN_HEIGHT*0.5}
            } else if (play_type == BattleConst.Effect_Play_Type.ROLE_SCENE || play_type == BattleConst.Effect_Play_Type.ENEMY_SCENE){
                x_fix = attacker.obj_type * x_fix;
                if(is_left){
                    if (play_type == BattleConst.Effect_Play_Type.ROLE_SCENE){  //  友方阵型
                        scene_pos = {x: SCREEN_WIDTH * 22 / 100 + x_fix, y: SCREEN_HEIGHT * 1 / 4 + y_fix}
                    }else{                                              // 敌方阵型
                        scene_pos = {x: SCREEN_WIDTH * 78 / 100 + x_fix, y: SCREEN_HEIGHT * 1 / 4 + y_fix}
                    }
                }else{
                    if (play_type == BattleConst.Effect_Play_Type.ENEMY_SCENE){
                        scene_pos = {x: SCREEN_WIDTH * 22 / 100 + x_fix, y: SCREEN_HEIGHT * 1 / 4 + y_fix}
                    }else{
                        scene_pos = {x: SCREEN_WIDTH * 78 / 100 + x_fix, y: SCREEN_HEIGHT * 1 / 4 + y_fix}
                    }
                }
            }else{
                scene_pos = this.center_pos(attacker);
            }
        }
        Log.info("BattleModel.effectArea, attack_pos:" + attacker.pos + ', scene_pos:' + scene_pos + ', ts:' + new Date().getMilliseconds());
        if (scene_pos){
            scene_pos.y = scene_pos.y + height;
            this.skill_act.effectArea(attacker, effect_list, reverse, is_release, scene_pos, hit_callback, bid)
        }
    },

    // 获取施法者目标对象的中心位置
    center_pos: function (attacker, height_fix){
        height_fix = height_fix || 0;
        var scene_pos = {x:0, y:0}
        if (this.battle_scene && attacker && attacker.attacker_info && attacker.attacker_info.target_list && attacker.attacker_info.target_list.length > 0){
            var array = attacker.attacker_info.target_list
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                const target = this.getBattleRoleByPos(element.target)
                if (target && target.scene_pos){
                    scene_pos.x = target.scene_pos.x;
                    scene_pos.y = target.scene_pos.y + target.model_height * height_fix * 0.01;   // 这个计算位置好奇葩..竟然不是直接用偏移高度去算..
                    break;
                }
            }
        }
        return scene_pos;
    },

    // 播放攻击动作之类的
    actHurt:function(attacker, is_big){
        if (attacker == null || attacker.attacker_info == null || attacker.attacker_info.target_list == null) return;
        var had_play = false;
        for (let index = 0; index < attacker.attacker_info.target_list.length; index++) {
            const effect_list = attacker.attacker_info.target_list[index];
            var play_effect = false;
            if (effect_list.hp_changed && effect_list.hp_changed < 0 && had_play == false){
                had_play = true;
                play_effect = true;
            }
            Log.info("BattleModel.actHurt, attack_pos:" + attacker.pos + " effect_list:" + JSON.stringify(effect_list) + ' play_effect:' + play_effect);
            this.playMagic2(attacker, effect_list, is_big, play_effect)
        }
    },

    // 提前播放受击特效,回播受击动作
    playMagic2:function(attacker, effect_play, is_big, play_effect){
        if(attacker == null || effect_play == null) return;
        var target = this.real_role_list[effect_play.target];
        if (target == null) return;

        if (is_big == true){
            if(!target.is_big_play){
                target.is_big_play = true;
                this.playHurtEffect(attacker, target);
            }
        }else{
            if (attacker.pos != target.pos && attacker.group != target.group){
                this.skill_act.hurt(attacker, target, PlayerAction.hurt, play_effect)
            }
        }
    },

    // 攻击上层特效处理
    attackPoint:function(attacker){
        if (attacker && attacker.attack_sound != "" && attacker.is_real == true){
            Utils.playEffectSound(AUDIO_TYPE.BATTLE, attacker.attack_sound);
        }

        if(attacker.act_effect_list == null || attacker.act_effect_list.length == 0){
            return;
        }
        var is_friend = attacker.is_friend;
        var array = attacker.act_effect_list;
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            var anime_res_up = element.res_up;
            if (element.spec_res_up != "" && is_friend == true) {
                anime_res_up = element.spec_res_up;
            }
            if (anime_res_up != "" || element.res_down != ""){
                this.effectSpineUser(attacker, true, element.x_fix * attacker.obj_type, element.y_fix, [anime_res_up, element.res_down], attacker, element.scale * 0.001, null, element.bid);
            }
        }
    },

    /**
     * 处理普通伤害
     * @param {*} attacker
     * @param {*} role_list
     */
    hurt: function (attacker, object_list){
        if (this.battle_scene == null || attacker == null){
            Log.info("BattleModel.hurt null, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            return;
        }
        if (attacker.area_effect_list.length == 0){
            var hit_num = (!attacker.in_area_effect) ? attacker.hit_num : (attacker.area_hit_num || 1);
            var split_hurt = attacker.split_hurt || 1;
            if (hit_num == 1 || split_hurt > 1){

            }else{
                var role_list = object_list || this.getAllBattleRoleList();
                for (var key in role_list){
                    const role = role_list[key];
                    if (role) {
                        role.is_hurt_play = false;
                        role.is_big_play = false;
                    }
                }
            }
            Log.info("BattleModel.hurt, attack_pos:" + attacker.pos + ', ts:' + new Date().getMilliseconds());
            this.batchPlayHurt(attacker)
        } else {
            Log.info("BattleModel.hurt: skip, attacker.area_effect_list.length > 0, attack_pos:" + attacker.pos + ',attacker.area_effect_list:' + attacker.area_effect_list + ', ts:' + new Date().getMilliseconds());
        }
    },

    /**
     * 伤害一个人的时候
     * @param {*} attacker
     */
    hurtOne:function(attacker){
        if(this.checkIsInBattle(attacker) == false){
            return
        }
        var effect_play_num = attacker.attacker_info.target_list.length;
        if (effect_play_num > 0){
            if (attacker.is_real){
			    this.playMagic(attacker, attacker.attacker_info.target_list[0]);
            }else{
                this.hook_model.playMagic(attacker, attacker.attacker_info.target_list[0]);
            }
        }
    },

    // 隐藏血条
    hideUI:function(attacker, delay_time){
        if(attacker){
            return this.skill_act.hideUI(attacker, delay_time);
        }
    },

    // 无动作并行攻击
    noActAttack:function(attacker, delay_time, hit_fun, start_fun, next_delay_time){
        if(!this.getBattleScene()) return;
        if(!attacker) return;
        var start_callback = function(){
            this.callfun(attacker, start_fun);
        }.bind(this);

        var hit_callback = function(){
            this.callfun(attacker, hit_fun);
        }.bind(this);
        return this.skill_act.noActAttack(attacker, delay_time, hit_callback, start_callback, next_delay_time);
    },

    // 显示血条
    showUI:function(attacker, delay_time){
        if(attacker){
            return this.skill_act.showUI(attacker, delay_time);
        }
    },

    // 判断是否存在反击buff
    getBuffTag:function(attacker){
        if(attacker == null || attacker.buff_list == null || attacker.buff_list.length == null){
            return false;
        }
        var array = attacker.buff_list;
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            const config = Config.skill_data.data_get_buff[element.bid]
            if (config && config.group == 3108){
                return true;
            }
        }
        return false;
    },

    // 近战移动归位
    moveBack:function(attacker, delay_time, move_time, grid_pos_x, action_name, is_jump, is_jump_delay, is_get_point, is_move, is_reverse){
        if(!this.getBattleScene()) return;
        if(!attacker) return;
        var target_pos = attacker.scene_pos;
        var skill_act = this.skill_act.move(attacker, target_pos, delay_time, move_time);
        attacker.runAction(skill_act);
    },

    // 移动到指定区域
    moveToArea:function(attacker, config){
        if(!this.getBattleScene()) return;
        if(!attacker) return;
        if(!config) return;
        var grid_pos_x = config.move_model_x * this.skill_act.gridSizeX();
        var grid_pos_y = config.move_model_y * this.skill_act.gridSizeY();
        var target_pos = { x: SCREEN_WIDTH * 32 / 64 + grid_pos_x * attacker.obj_type, y: SCREEN_HEIGHT * 11 / 36 + grid_pos_y };
        var skill_act = this.skill_act.move(attacker, target_pos, config.move_delay_time, config.move_time);
        attacker.runAction(skill_act);
    },

    // act_args={ [[moveTo]],{ 0, 10,- 7, 0, [[run]], 0, 0, 0, 1, 1}}},

    // 移动到目标处
    moveTo:function(attacker, delay_time, move_time, grid_pos_x, grid_pos_y, action_name, is_jump, is_jump_delay, is_get_point, is_move, is_reverse, is_col_act){
        if(!this.getBattleScene()) return;
        if(!attacker) return;
        move_time = move_time || 30;
        if (grid_pos_x == null){
            grid_pos_x = 0;
        }
        if (grid_pos_y == null){
            grid_pos_y = 0;
        }
        var direct = (is_reverse == 1) ? -1 : 1;
        var target_pos = null;
        var scene_pos = attacker.scene_pos;
        if (is_col_act == 1) {
            var is_left = attacker.is_friend;         // 是否是己方,己方就是在左边
            var temp_list = null;
            if (is_left) {
                temp_list = [{ x: 34, y: 17 }, { x: 34, y: 23 }, { x: 34, y: 29 }]
            } else {
                temp_list = [{ x: 44, y: 17 }, { x: 44, y: 23 }, { x: 44, y: 29 }]
            }
            var pos = temp_list[attacker.col]
            if (pos) {
                var temp_pos = this.skill_act.gridPosToScreenPos(pos);
                target_pos = { x: temp_pos.x + grid_pos_x, y: temp_pos.y + grid_pos_y };
            }
        } else if (grid_pos_x > 0) {
            target_pos = { x: scene_pos.x + grid_pos_x * attacker.obj_type * direct, y: scene_pos.y + grid_pos_y };
        } else {
            if (is_reverse == 1 && attacker.target_pos_base) { // 反转
                target_pos = this.skill_act.gridPosToScreenPos({ x: attacker.target_pos_base.x + grid_pos_x * attacker.obj_type * direct, y: attacker.target_pos_base.y + grid_pos_y * attacker.obj_type * direct })
            } else {
                target_pos = this.skill_act.gridPosToScreenPos({ x: attacker.target_pos.x + grid_pos_x * attacker.obj_type * direct, y: attacker.target_pos.y + grid_pos_y })
            }
        }
        if ( is_get_point == null || is_get_point == 0){
            var skill_act = this.skill_act.move(attacker, target_pos, delay_time, move_time);
            attacker.runAction(skill_act);
        }else{
            return this.skill_act.move(attacker, target_pos, delay_time, move_time);
        }
    },

    // 一些播报判断
    checkIsInBattle:function(attacker){
        if(this.battle_scene == null || attacker == null){
            return false;
        }
        return true;
    },

    // -------------------------------创景单位这一块,真是战斗单位
    createRoleList:function(){
        var battle_data = this.battle_data;
        var need_enter = this.needPlayEnterAction();
        for (var key in battle_data.fight_object_list) {
            var role_data = battle_data.fight_object_list[key];
            this.createRole(role_data, need_enter, true, true)
        }
    },

    // 创建具体单位
    createRole:function(role_data, enter_run, talk_back, is_real){
        if (this.battle_scene == null || this.battle_scene.update_drama_battle) return;
        if (role_data == null || role_data.hp == 0) return;
        var role_layer = this.battle_scene.getBattleRoleLayer();
        if (role_layer == null) return;
        if(this.real_role_list[role_data.pos] != null) return;

        var role = Utils.createClass("battle_role");
        role.createRole(role_layer, role_data, enter_run, talk_back, is_real);
        this.real_role_list[role_data.pos] = role;
    },

    // 重置战斗单位初始化信息,比如位置层级和动作状态
    resetBattleRoleBaseInfo:function(){
        for(var key in this.real_role_list){
            var battle_role = this.real_role_list[key];
            if (battle_role){
                battle_role.resetBaseInfo();
            }
        }
    },

    // 清楚掉单位
    clearRealRole: function () {
        if (Object.keys(this.real_role_list).length == 0) { return; }
        for (var key in this.real_role_list) {
            // 清楚掉定时器
            gcore.Timer.del("attackerActTimeout" + key);

            var battle_role = this.real_role_list[key];
            if(battle_role){
                battle_role.deleteRole();
                battle_role = null;
            }
        }
        this.real_role_list = {};
    },

    // 当前所有单位
    getAllBattleRoleList:function(){
        return this.real_role_list;
    },

    // 指定单位上的对象
    getBattleRoleByPos: function (pos) {
        if (this.real_role_list[pos]) {
            return this.real_role_list[pos]
        }
    },

    // 魅魔技能黑屏,暂时也没配置了
    blackScreen: function (attacker) {

    },

    // 只显示攻击于被攻击放,暂时都没有配置
    blackScreen2: function (attacker) {

    },

    // 黑屏------后续一律使用这个黑屏
    blackScreen3: function (attacker, delay_time, time, alpha) {
        if(time == null){
            time = 15;
        }
        var begin_fun = function(){
            if(this.battle_scene){
                this.battle_scene.setBlack(true, alpha);
            }
            this.is_black = true;
        }.bind(this);

        var end_fun = function(){
        }.bind(this);
        return this.skill_act.blackScreen(attacker, delay_time, time, begin_fun, end_fun);
    },

    // 取消黑屏
    cancleBlackScreen:function(){
        this.is_black = false;
        if(this.battle_scene){
            this.battle_scene.setBlack(false);
        }
    },

    // 震屏
    playShakeScreen:function(shake_id){
        if(shake_id == null || shake_id == 0) return;
        if(this.battle_scene){
            this.battle_scene.shakeScreen(shake_id);
        }
    },

    // 隐身,暂时没有配置了
    hide: function (attacker) {

    },

    // 显示,暂时也没有配置了
    show: function (attacker) {

    },

    // 残影,也是没有配置了
    shadow: function (attacker) {

    },

    // 返回主界面控制器
    getMainUICtrl:function(){
        if(this.mainui_ctrl == null){
            this.mainui_ctrl = require("mainui_controller").getInstance();
        }
        return this.mainui_ctrl;
    },

    // -------------------------战斗结束
    //结算界面
    showWin: function (data, is_replay) {
        if(data.show_panel_type == null || data.combat_type == null) return;
        if (data.show_panel_type == 1){     // 显示战斗结算界面,这个时候不要立即清除掉,
            if ((data.combat_type == this.combat_type && this.battle_controller.getWatchReplayStatus()) || is_replay == true){

            }
            // 这个时候都需要显示结算界面
            this.setBattleTimeScale(true);
            this.showWinView(data);
        } else {
            if (data.combat_type == this.combat_type){  //
                if (is_replay == true){
                    this.clearView();
                } else {
                    this.clearBattleScene();
                    gcore.GlobalEvent.fire(EventId.EXIT_FIGHT, data.combat_type);
                }
            }
        }
    },

    //游戏退出结算
    showWinView:function(data){
        if(data == null)return
        this.battle_controller.openFinishView(true, data.combat_type,data);
    },

    //战斗结果
    result:function(data,is_self_exit){
        if (data == null) return;
        if (this.cur_fight_type == 2 && this.combat_type == data.combat_type){
            this.clearView();
        }
    },

    clearView:function(){
        this.setBattleTimeScale(true);      // 还原动作速率
        if (this.battle_controller.getWatchReplayStatus() == true){ // 如果是录像状态下,退出录像
            this.battle_controller.setWatchReplayStatus(false)
        }

        // 派发退出战斗事件,通知各个系统处理
        gcore.GlobalEvent.fire(EventId.EXIT_FIGHT, this.combat_type);

        var MainuiController = require("mainui_controller")
        if(this.combat_type == BattleConst.Fight_Type.Darma){
            if (MainuiController.getInstance().checkIsInDramaUIFight()) {       // 剧情副本中结束战斗,则切到假战斗
                this.battle_controller.send20060(BattleConst.Fight_Type.Darma);
            }
        }else{
            if (this.battle_controller.getWatchReplayStatus() == true || this.combat_type == BattleConst.Fight_Type.PK || this.combat_type == BattleConst.Fight_Type.HeroTestWar) {
                if (MainuiController.getInstance().checkIsInDramaUIFight()) {       // 剧情副本中结束战斗,则切到假战斗
                    this.battle_controller.send20060(BattleConst.Fight_Type.Darma);
                }else{
                    this.clearBattleScene();
                }
            }else{
                this.clearBattleScene();
            }
        }
    },

    // 播放资产掉落的动作
    playResourceCollect:function(x, y, pos){
        if (this.drama_fight_ui){
            this.drama_fight_ui.playResourceCollect(x, y, pos);
        }
    },
    //获取group
    getGroup(){
        return this.my_group
    },
    getCampIconConfigByIds(id_list){
        if(!id_list || Utils.next(id_list) == null) return;
        if(id_list.length == 1){
            let id = id_list[0]
            return Config.combat_halo_data.data_halo_icon[id]
        }else{
            let min_id = Math.min(id_list[0], id_list[1])
            let max_id = Math.max(id_list[0], id_list[1])
            let id = min_id*100 + max_id
            return Config.combat_halo_data.data_halo_icon[id]
        }
    },


    getEffectRes: function(effect_id) {

    },


    // 开始准备战斗资源
    preloadBattleRes: function(data, finish_cb) {
        // skill_plays
        var battle_res = {};
        for (var skill_i in data.skill_plays) {
            var skill_data = data.skill_plays[skill_i]
            for (var effect_i in skill_data.effect_play) {
                var effect_data = skill_data.effect_play[effect_i];
                if (!effect_data.effect_bid)
                    continue;
                var effect_config = gdata('skill_data', 'data_get_effect', effect_data.effect_bid);

                if (!effect_config) {
                    continue;
                }

                var actor = this.real_role_list[effect_data.actor];
                var target = this.real_role_list[effect_data.target];

                // 攻击动作资源
                if (effect_config.anime_res && actor) {
                    var anime_res_path = actor.getResPath(effect_config.anime_res);
                    if (anime_res_path) {
                        battle_res[anime_res_path] = true;
                    }
                }

                // 受击动作资源
                if (effect_config.hit_action && target) {
                    if (effect_config.hit_action != "no-hurt") {
                        var hit_action_path = target.getResPath(effect_config.hit_action);
                        if (hit_action_path) {
                            battle_res[hit_action_path] = true;
                        }
                    }
                }

                // 特效资源加载
                for (var effect_d in AniRes) {
                    var effct_list = Utils.deepCopy(this.getCurEffectList(effect_config[AniRes[effect_d]]));
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
        }

        for (var battle_i in battle_res) {
            var skeleton_path = battle_i + ".atlas";
            BattleResPool.getInstance().preLoadRes(skeleton_path, function (skeleton_path, res_object) {
                finish_num ++;
                if (finish_num == total_num) {
                    if (finish_cb)
                        finish_cb();
                }
            }.bind(this, skeleton_path))
        }

        if (total_num == 0) {
            if (finish_cb)
                finish_cb();
        }
    },

});

module.exports = BattleModel;
