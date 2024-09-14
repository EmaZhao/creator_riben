// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 15:05:29
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleConst = require("battle_const");
var BattleEvent = require("battle_event")
var Battle_formPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_form_view");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.rleasePrefab = false;        
        this.controller = require("battle_controller").getInstance();
        this.model = this.controller.getModel();

        this.arena_notice_num = 0;              // 竞技场挑战次数达到才可以跳过
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.form_container = this.seekChild("form_container");
        var left_btn = this.seekChild(this.form_container, "left_btn");
        var right_btn = this.seekChild(this.form_container, "right_btn");
        this.buff_btn = this.seekChild(this.form_container,"buff_btn")
        this.round_label = this.seekChild(this.form_container, "round_label", cc.Label);            // 当前回合数
        this.left_icon = this.seekChild(left_btn, "icon", cc.Sprite);                               // 左边阵法图标
        this.right_icon = this.seekChild(right_btn, "icon", cc.Sprite);                             // 右边阵法图标
        this.left_camp_btn = this.seekChild(this.form_container, "left_camp_btn");                  // 左边阵营图标
        this.right_camp_btn = this.seekChild(this.form_container, "right_camp_btn");                // 右边阵营图标
        this.left_name_label = this.seekChild(this.form_container, "left_name_label", cc.Label);    // 左边名字
        this.right_name_label = this.seekChild(this.form_container, "right_name_label", cc.Label);  // 右边名字
        this.form_container_Widget = this.form_container.getComponent(cc.Widget)
        this.left_camp_sprite = this.left_camp_btn.getComponent(cc.Sprite);
        this.right_camp_sprite = this.right_camp_btn.getComponent(cc.Sprite);

        this.speed_btn = this.seekChild("speed_btn");                                               // 速率
        this.speed_btn_label = this.seekChild(this.speed_btn, "Label", cc.Label);
        this.guilddun_node = this.seekChild("guilddun_node");

        this.showskill_node = this.seekChild("showskill_node");                                     // 主动技能展示
        this.skill_spine = this.seekChild(this.showskill_node, "spine", sp.Skeleton);               // 技能特效
        this.skill_head_img = this.seekChild(this.showskill_node, "head", cc.Sprite);               // 施法者头像
        this.skill_name = this.seekChild(this.showskill_node, "skill_name", cc.Label);              // 技能文本

        this.pass_btn = this.seekChild("pass_btn");                                                 // 跳过战斗

        this.exit_btn = this.seekChild("exit_btn");                                                 // 退出战斗

        this.left_camp_top_nd = this.left_camp_btn.getChildByName("top_sp")
        this.left_camp_top_num = this.left_camp_top_nd.getChildByName("top_num_txt").getComponent(cc.Label);
        this.left_camp_bottom_nd = this.left_camp_btn.getChildByName("bottom_sp")
        this.left_camp_bottom_num = this.left_camp_bottom_nd.getChildByName("bottom_num_txt").getComponent(cc.Label);
        this.left_effect_nd = this.left_camp_btn.getChildByName("left_effect_nd")

        this.right_camp_top_nd = this.right_camp_btn.getChildByName("top_sp")
        this.right_camp_top_num = this.right_camp_top_nd.getChildByName("top_num_txt").getComponent(cc.Label);
        this.right_camp_bottom_nd = this.right_camp_btn.getChildByName("bottom_sp")
        this.right_camp_bottom_num = this.right_camp_bottom_nd.getChildByName("bottom_num_txt").getComponent(cc.Label);
        this.right_effect_nd = this.right_camp_btn.getChildByName("right_effect_nd")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.speed_btn, function(){
            if (this.model.checkIsCanChangeBattleSpeed()){
                this.model.changeSpeed();
            }
        }.bind(this), 1);
        Utils.onTouchEnd(this.pass_btn, function () {
            if (this.arena_notice_num == 0) {
                this.controller.send20062();
            }else{
                message(cc.js.formatStr(Utils.TI18N("本赛季挑战%s次之后可跳过"), this.arena_notice_num));
            }
        }.bind(this), 1);
        Utils.onTouchEnd(this.left_camp_btn, function () {
            this.controller.openBattleCampView(true,this.left_halo_id)
        }.bind(this), 1);
        Utils.onTouchEnd(this.right_camp_btn, function () {
            this.controller.openBattleCampView(true,this.right_halo_id)
        }.bind(this), 1);
        Utils.onTouchEnd(this.exit_btn, function () {
            this.controller.csFightExit();
        }.bind(this), 1);
        this.buff_btn.on('click',function(){
            var battle_data = this.model.getCurBattleData();
            let left_name = battle_data.actor_role_name
            let right_name = battle_data.target_role_name
            let group = this.controller.getModel().getGroup()
            if(group == BattleConst.BattleGroupTypeConf.TYPE_GROUP_ENEMY && !this.controller.getWatchReplayStatus()){
                left_name = data.target_role_name
                right_name = data.actor_role_name
            }
            this.controller.openBattleBuffInfoView(true, left_name, right_name)
        },this)
    },

    // 改变速率
    setSpeed: function (speed) {
        if (speed == null) {
            speed = 1;
        }
        this.speed_btn_label.string = "X" + speed;
        // 设置场景上的模型和特效的速率
        if(speed == 2){
            this.model.setBattleTimeScale(false);
        } else {
            this.model.setBattleTimeScale(true);
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(combat_type){
        if (combat_type == BattleConst.Fight_Type.Darma) {        // 根据战斗类型不同,阵法位置不同
            this.form_container_Widget.bottom = 408;
            this.exit_btn.setPosition(595,900)
        } else {
            this.form_container_Widget.bottom = 160;
            this.exit_btn.setPosition(646,1150)
        }
        this.form_container_Widget.updateAlignment()
        // 更新回合数
        if (this.update_round_num){
            this.updateRound(this.update_round_num);
            this.update_round_num = null;
        }

        // 重置一些特殊显示
        this.initExtendShowStatus();
        
        // 区分观战以及战斗状态等
        if (this.controller.getWatchReplayStatus() == false){
            if (combat_type == BattleConst.Fight_Type.GuildDun){
                this.addGuildBossUI(0);
            } else if (combat_type == BattleConst.Fight_Type.PK || combat_type == BattleConst.Fight_Type.HeroTestWar) {
                this.addExitBtnUI();
            } else if(combat_type == BattleConst.Fight_Type.LimitExercise){ //试炼之境
                this.addLimitExerciseBossFightUI()
            }
        }else{
            this.addExitBtnUI();
        }

        // 设置跳过按钮状态
        this.updatePassBtnStatus(combat_type);

        // 初始化显示,包括名字,阵容等数据,这个中途不会变化只做一次判断
        this.updateBaseInfo();

        // 显示初始速率
        var speed = this.model.getSpeed();
        this.setSpeed(speed);
    },

    // 初始化一些特殊战斗需要显示的东西
    initExtendShowStatus:function(){
        this.exit_btn.active = false;
        this.guilddun_node.active = false;
        this.guilddun_getlabel = null;
        if(this.star_panel){
            this.star_panel.active = false;
        }
    },

    // 当前回合数
    updateRound: function (round) {
        if (this.round_label == null){
            this.update_round_num = round;
        }else{
            var combat_type = this.model.getCombatType();
            if(combat_type == null || combat_type == BattleConst.Fight_Type.Nil) return;
            var config = Config.combat_type_data.data_fight_list[combat_type];
            if (!config) return;
            var total_round = config.max_action_count;
            this.round_label.string = cc.js.formatStr(Utils.TI18N("第%s/%s回合"), round, total_round);
            gcore.GlobalEvent.fire(BattleEvent.UPDATE_ROUND_NUM)
        }
    },

    //更新基础数据,不过在无尽试炼的时候需要额外调用一次 每波可能都不一样
    updateBaseInfo:function(){
        if(!this.root_wnd)return
        var battle_data = this.model.getCurBattleData();
        if (!battle_data) return;
        if (battle_data.formation){     //更新左右阵法
            this.updateFormIcon(battle_data.formation);
        }
        if (battle_data.halo_list){     // 更新左右阵营
            this.updateHaloIcon(battle_data.halo_list);
        }

        // 判断左边是不是队友
        var left_is_friend = this.model.isFriend(BattleConst.Group_Type.Friend)     
        if (left_is_friend == true) {
            this.left_name_label.string = battle_data.actor_role_name;
            this.right_name_label.string = battle_data.target_role_name;
        }else{
            this.left_name_label.string = battle_data.target_role_name;
            this.right_name_label.string = battle_data.actor_role_name;
        }
        this.buff_btn.opacity = 0;
        this.buff_btn.runAction(cc.fadeIn(0.7))
    },

    // 更新阵法
    updateFormIcon:function(data_list){
        if (data_list == null || Object.keys(data_list).length < 2) return;
        var left_form = null;
        var right_form = null;
        var left_is_friend = this.model.isFriend(BattleConst.Group_Type.Friend)
        if (left_is_friend){    // 如果group==1位队友,则去第一位,否则第二位
            left_form = data_list[1];
            right_form = data_list[2];
        }else{
            left_form = data_list[2];
            right_form = data_list[1];
        }

        if (left_form){
            if (this.left_form_type != left_form.formation_type){
                this.left_form_type = left_form.formation_type;
                var res_path = PathTool.getBattleFormIcon(this.left_form_type)
                this.loadRes(res_path, function (icon, res_object) {
                    icon.spriteFrame = res_object;
                }.bind(this, this.left_icon))
            }
        }
        if (right_form) {
            if (this.right_form_type != right_form.formation_type) {
                this.right_form_type = right_form.formation_type;
                var res_path = PathTool.getBattleFormIcon(this.right_form_type)
                this.loadRes(res_path, function (icon, res_object) {
                    icon.spriteFrame = res_object;
                }.bind(this, this.right_icon))
            }
        }
    },

    // 更新阵营
    updateHaloIcon: function (data_list) {
        if (data_list == null || Object.keys(data_list).length < 2) return;
        this.left_camp_top_nd.active = false
        this.right_camp_bottom_nd.active = false
        var left_camp = null;
        var right_camp = null;
        for(var key in data_list){
            var info = data_list[key]
            if(info.group == 1){
                left_camp = info.type
            }else if(info.group == 2){
                right_camp = info.type
            }
        }
        let left_halo_id_list = []
        let right_halo_id_list = []
        // this.left_halo_id = left_camp.type;
        // this.right_halo_id = right_camp.type;
        // -- 兼容旧的录像数据，可能发过来的阵营光环id还是旧的，需要转换为新的id
		if(left_camp < 100){
			left_halo_id_list = BattleConst.Old_Halo_Id_Change[left_camp] || []
        }else{
			let left_id_1 = Math.floor(left_camp/100)
			let left_id_2 = left_camp%100
			if(left_id_1 > 0){
                left_halo_id_list.push(left_id_1)
            }
			if(left_id_2 > 0){
                left_halo_id_list.push(left_id_2)
            }
        }
        if(right_camp < 100){
			right_halo_id_list = BattleConst.Old_Halo_Id_Change[right_camp] || []
        }else{
			let right_id_1 = Math.floor(right_camp/100)
			let right_id_2 = right_camp%100
			if(right_id_1 > 0){
                right_halo_id_list.push(right_id_1)
            }
			if(right_id_2 > 0){
                right_halo_id_list.push(right_id_2)
            }
        }
        let BattleController = require("battle_controller")
        if(this.left_camp_btn){
            var halo_res = PathTool.getUIIconPath("campicon", "campicon_1000")
            let halo_icon_config = BattleController.getInstance().getModel().getCampIconConfigByIds(left_halo_id_list)
            this.left_halo_id = left_halo_id_list
            if(halo_icon_config && halo_icon_config.icon){
                halo_res = PathTool.getUIIconPath("campicon","campicon_"+halo_icon_config.icon)
                this.updateHaloEffect(this.left_effect_nd,true); 
                let v = halo_icon_config.nums 
                let top_num = v[0]
                let bottom_num = v[1]
                if(top_num != null && top_num > 0){
                    this.left_camp_top_num.string  = top_num
                    this.left_camp_top_nd.active = true;
                }else{
                    this.left_camp_top_nd.active = false;
                }
                if(bottom_num != null && bottom_num > 0){
                    this.left_camp_bottom_num.string  = bottom_num
                    this.left_camp_bottom_nd.active = true;
                }else{
                    this.left_camp_bottom_nd.active = false;
                }
            }else{
                this.left_camp_top_nd.active = false;
                this.left_camp_bottom_nd.active = false;
                this.updateHaloEffect(this.left_effect_nd,false); 
            }
            if (this.left_camp_res != halo_res){
                this.left_camp_res = halo_res;
                this.loadRes(halo_res, function (res_object) {
                    this.left_camp_sprite.spriteFrame = res_object;
                }.bind(this))
            }
        }

        if(this.right_camp_btn){
            var halo_res = PathTool.getUIIconPath("campicon", "campicon_1000")
            let halo_icon_config = BattleController.getInstance().getModel().getCampIconConfigByIds(right_halo_id_list)
            this.right_halo_id = right_halo_id_list
            if(halo_icon_config && halo_icon_config.icon){
                this.updateHaloEffect(this.right_effect_nd,true);
                halo_res = PathTool.getUIIconPath("campicon","campicon_"+halo_icon_config.icon)
                let v = halo_icon_config.nums 
                let top_num = v[0]
                let bottom_num = v[1]
                if(top_num != null && top_num > 0){
                    this.right_camp_top_num.string  = top_num
                    this.right_camp_top_nd.active = true;
                }else{
                    this.right_camp_top_nd.active = false;
                }
                if(bottom_num != null && bottom_num > 0){
                    this.right_camp_bottom_num.string  = bottom_num
                    this.right_camp_bottom_nd.active = true;
                }else{
                    this.right_camp_bottom_nd.active = false;
                }
            }else{
                this.updateHaloEffect(this.right_effect_nd,false);
                this.right_camp_bottom_nd.active = false;
                this.right_camp_top_nd.active = false;
            }
            if (this.right_camp_res != halo_res){
                this.right_camp_res = halo_res;
                this.loadRes(halo_res, function (icon, res_object) {
                    icon.spriteFrame = res_object;
                }.bind(this, this.right_camp_sprite))
            }
        }
    },
    
    updateHaloEffect: function(node,status) {
        if (status) {
            node.scale = 0.8;
            node.active = true;
            var effect_path = PathTool.getUIIconPath("common", "common_1101");
            this.loadRes(effect_path, function(effect_sp) {
                node.getComponent(cc.Sprite).spriteFrame = effect_sp;
            }.bind(this));
            var fadein_act = cc.fadeIn(0.6);
            var fadeout_act = cc.fadeOut(0.6);
            var halo_act = cc.sequence(fadein_act, fadeout_act);
            var halo_act2 = cc.repeatForever(halo_act);
            node.runAction(halo_act2);
        } else {
            node.active = false;
            node.stopAllActions();
        }
    },
    // 联盟BOSS的时候的伤害统计
    addGuildBossUI:function(total_hurt){
        if (this.guilddun_getlabel == null) {
            this.guilddun_node.active = true;
            this.guilddun_getlabel = this.seekChild(this.guilddun_node, "get_label", cc.Label);
        }
        this.guilddun_getlabel.string = total_hurt;
    },
    getStarPanelUI(callFunc){
        if(this.root_wnd){
            if(!this.star_panel){
                this.loadRes(PathTool.getPrefabPath("battle","battle_star_panel"),function(cell){
                    this.star_panel = cell
                    this.root_wnd.addChild(cell)
                    let star_list = {}
                    let desc_txt_list = {}
                    for(let i=1;i<4;++i){
                        let star = this.star_panel.getChildByName("container").getChildByName("star_" + i)
                        if(star){
                            star.active = (false)
                            star_list[i] = star
                        }
                        let desc_txt = this.star_panel.getChildByName("container").getChildByName("star_desc_" + i).getComponent(cc.Label)
                        if(desc_txt){
                            desc_txt.string = ("")
                            desc_txt_list[i] = desc_txt
                        }
                    }
                    callFunc(desc_txt_list, star_list)
                }.bind(this))
            }else{
                this.star_panel.active = true
                let star_list = {}
                let desc_txt_list = {}
                for(let i=1;i<4;++i){
                    let star = this.star_panel.getChildByName("container").getChildByName("star_" + i)
                    if(star){
                        star.active = (false)
                        star_list[i] = star
                    }
                    let desc_txt = this.star_panel.getChildByName("container").getChildByName("star_desc_" + i).getComponent(cc.Label)
                    if(desc_txt){
                        desc_txt.string = ("")
                        desc_txt_list[i] = desc_txt
                    }
                }
                callFunc(desc_txt_list, star_list)
            }
        }
    },
    addLimitExerciseBossFightUI(){
        let callFunc = function(desc_txt_list,star_list){
            if(desc_txt_list && star_list){
                for(let i=1;i<4;++i){
                    let star = this.star_panel.getChildByName("container").getChildByName("gary_star_" + i)
                    if(star){
                        star.active = (false)
                    }
                }
                var battle_data = this.model.getCurBattleData();
                let dunge_data = battle_data.extra_args
                if(dunge_data[0] && dunge_data[1] && dunge_data[2] && dunge_data[3]){
                    let round = dunge_data[0].param || 1
                    let diff = dunge_data[1].param || 1
                    let order_type = dunge_data[2].param || 1
                    let order_id = dunge_data[3].param || 1

                    let boss_list = Config.holiday_boss_new_data.data_change_boss_list

                    if(boss_list[round] && boss_list[round][diff] && boss_list[round][diff][order_type] && boss_list[round][diff][order_type][order_id]){
                        let config = boss_list[round][diff][order_type][order_id]
                        if(config){
                            for(let i=1;i<=3;++i){
                                if(desc_txt_list[i]){
                                    desc_txt_list[i].node.x = -187
                                    if(i == 1){
                                        desc_txt_list[i].string = (Utils.TI18N("关卡效果:"))
                                    }else{
                                        if(config.add_skill_decs[i-2]){
                                            desc_txt_list[i].string = (config.add_skill_decs[i-2])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }.bind(this)
        this.getStarPanelUI(callFunc)
    },
    // 观战等退出
    addExitBtnUI: function () {
        this.exit_btn.active = true;
    },

    // 跳过按钮状态
    updatePassBtnStatus:function(combat_type){
        this.arena_notice_num = 0;
        if (combat_type == null || this.controller.getWatchReplayStatus()) {
            this.pass_btn.active = false;
            return;
        }
        var _config = Config.combat_type_data.data_fight_list[combat_type];
        if (_config == null || _config.is_skip != "true") {
            this.pass_btn.active = false;
            return;
        }
        // 如果是竞技场,则判断次数
        if (combat_type == BattleConst.Fight_Type.Arena){
            var count = require("arena_controller").getInstance().getModel().getHadCombatNum(); // 当前已经挑战过的次数
            var arena_config = Config.arena_data.data_const.arena_skip_count;
            if (arena_config == null) {
                this.pass_btn.active = false;
                return;
            }else{
                if (count < arena_config.val) {  // 这种情况下也需要显示,但是保留计算判断
                    this.arena_notice_num = arena_config.val
                }
            }
        }
        this.pass_btn.active = true;
    },

    // 单位主动技能喊招
    showActiveSkillName:function(attacker, callback){
        if (attacker == null || attacker.skill_data == null){
            if (callback) {
                callback();
            }
            return;
        }
        var battle_role = attacker.getRoleData();
        if (battle_role == null){
            if (callback) {
                callback();
            }
            return;
        }
        if (attacker.temp_skill_bid != attacker.attacker_info.skill_bid){
            attacker.temp_skill_bid = attacker.attacker_info.skill_bid
            var action = PlayerAction.action_1;
            if (attacker.is_friend == true){
                action = PlayerAction.action_2;
            }
            // 设置技能名字
            this.skill_name.string = attacker.skill_data.name;

            // 获取头像资源id,以及加载头像
            var object_type = battle_role.object_type;
            var object_bid = battle_role.object_bid;
            var head_icon = battle_role.face_id;
            if(battle_role.face_id == 0){
                head_icon = battle_role.object_bid;
            }
            if(object_type == BattleConst.Unit_Type.Monster){
                var config = Utils.getUnitConfig(object_bid);
                if (config){
                    head_icon = config.head_icon;
                }
            }
            var head_path = PathTool.getHeadRes(head_icon);
            if(this.skill_head_path != head_path){
                this.skill_head_path = head_path;
                this.loadRes(head_path, function(sprite, res_object){
                    sprite.spriteFrame = res_object;
                }.bind(this, this.skill_head_img))
            }

            this.skill_head_img.node.stopAllActions();
            this.skill_name.node.stopAllActions();

            this.showskill_node.active = true;
            this.skill_head_img.node.x = -121;  // -62
            this.skill_name.node.x = 190;       // 34
            this.skill_head_img.node.opacity = 0;
            this.skill_name.node.opacity = 0;

            // 动作
            var action_fun = function(){
                var call_back_fun = cc.callFunc(function () {
                    if (callback) {
                        callback();
                    }
                }.bind(this))
                var head_move_by = cc.moveTo(0.08, -125, 0);
                var head_fade_in = cc.fadeIn(0.1);
                var head_delay = cc.delayTime(0.3);
                var head_delay_2 = cc.delayTime(0.3);
                var head_over = cc.callFunc(function(){
                    this.showskill_node.active = false;
                }.bind(this))

                this.skill_head_img.node.runAction(cc.sequence(cc.spawn(head_move_by, head_fade_in), head_delay, call_back_fun, head_delay_2, head_over));

                var label_move_to = cc.moveTo(0.08, 60, 0);
                var label_fade_in = cc.fadeIn(0.1);
                this.skill_name.node.runAction(cc.spawn(label_move_to, label_fade_in));

            }.bind(this)

            // 设置头像以及播放动作
            if (this.skill_spine.skeletonData != null){
                this.skill_spine.setAnimation(0, action, false);
                // action_fun();
                this.key1 = setTimeout(()=>{
                  action_fun();
                },200)
            }else{
                var skill_eff_path = PathTool.getSpinePath("E31321");
                this.loadRes(skill_eff_path, function(spine, res_object){
                    spine.skeletonData = res_object;
                    spine.setAnimation(0, action, false);
                    
                    this.key2 = setTimeout(()=>{
                      action_fun();
                    },200)
                }.bind(this, this.skill_spine))
            }
        }else{
            if(callback){
                callback();
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){
        let ChatController = require("chat_controller")
        ChatController.getInstance().closeChatPanel()
        gcore.GlobalEvent.fire(BattleEvent.EXIT_FIGHT)
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.key1){
          clearTimeout(this.key2);
        }
        if(this.key2){
          clearTimeout(this.key2);
        }
    },
})
