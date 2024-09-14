// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗场景
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var BattleConst = require("battle_const");
var LoaderManager = require("loadermanager");
var PathTool = require("pathtool");
var AdventureController = require("adventure_controller");

var BattleScene = cc.Class({
    extends: BaseClass,
    // extends: cc.Component,
    ctor: function(){
        this.initConfig();
        this.createRootWnd();
        this.registerEvent();
    },
    // 初始化配置数据
    initConfig:function(){
        this.battle_controller = require("battle_controller").getInstance();
        this.battle_model = this.battle_controller.getModel();
        this.battle_hook_model = this.battle_controller.getHookModel()

        this.battle_drama_model = require("battle_drama_controller").getInstance().getModel();

        this.main_size = cc.size(SCREEN_WIDTH, SCREEN_HEIGHT)
        // this.main_size = cc.director.getVisibleSize();
        this.flayer_init_y = 716				//地图前景层
        this.map_init_y = 260				//角色和特效初始Y
        this.slayer_init_y = 0			//地图背景层
        // this.top_size_height = 400			//预留给剧情上面的可以滑动高度

        this.battle_res_id = 0              //当前战斗背景资源

        this.need_run_map = true            //是否需要移动地图
        this.f_speed = 0.4                    //地图移动速率
        this.bg_speed = 2                 // 背景层移动速率

        this.combat_type = BattleConst.Fight_Type.Nil   // 当前战斗类型

        this.real_role_list = {}            // 当前真实战斗的单位列表

        this.resources_list = {}            // 下载资源
    },

    setVisible:function(status){
        if (this.root){
            this.root.active = status
        }
    },

    // 改变状态
    changeVisible:function(status){
        if(this.root){
            if(!status){
                this.root.x = 10000;
            }else{
                this.root.x = 0
            }
        }
    },

    // 创建地图节点
    createRootWnd:function(){
        this.root = new cc.Node("base_root");
        this.root.setAnchorPoint(0.5, 0.5);
        this.root.setContentSize(this.main_size);
        this.root.setPosition(0, 0);
        // this.root.addComponent(cc.Mask);    // 设置剪辑区域
        ViewManager.getInstance().addToSceneNode(this.root, SCENE_TAG.battle)

        var layer_size = cc.size(SCREEN_WIDTH * FIT_SCALE, SCREEN_HEIGHT)

        // 场景主节点                         
        this.main_layer = new cc.Node();
		this.main_layer.setContentSize(layer_size);
		this.main_layer.setAnchorPoint(0.5, 0.5)
		this.main_layer.setPosition(0, 0)
		this.root.addChild(this.main_layer)

        // 远景层,
        this.map_fLayer = new cc.Node()
        this.map_fLayer.y = (-layer_size.height * 0.5 + this.flayer_init_y);
        this.map_fLayer.x = -layer_size.width * 0.5;
        this.map_fLayer.setAnchorPoint(0, 0)
        this.map_fLayer.scale = FIT_SCALE;
        this.main_layer.addChild(this.map_fLayer, BATTLE_VIEW_BLACK_LAYER_Z0)

        // 前景层
        this.map_sLayer = new cc.Node();				    
        this.map_sLayer.setName("map_sLayer")
        this.map_sLayer.setAnchorPoint(0, 0)
        this.map_sLayer.setPosition(-layer_size.width*0.5, -layer_size.height*0.5 * FIT_SCALE)
        this.map_sLayer.scale = FIT_SCALE;                    
        this.main_layer.addChild(this.map_sLayer, BATTLE_VIEW_BLACK_LAYER_Z0 + 1)

        // 单张场景
        this.map_oLayer = new cc.Node(); 
        // var layer_wdg = map_oLayer.addComponent(cc.Widget);
        // layer_wdg.isAlignHorizontalCenter = true;

        this.map_oLayer.setName("map_oLayer")
        this.map_oLayer.setAnchorPoint(0, 0)
        this.map_oLayer.setPosition(-layer_size.width*0.5, -layer_size.height*0.5 * FIT_SCALE)
        this.map_oLayer.scale = FIT_SCALE * 1.43;                    
        this.main_layer.addChild(this.map_oLayer, BATTLE_VIEW_BLACK_LAYER_Z0 + 1)
        this.map_oLayer.active =false;

        // 战斗
        this.battle_layer = new cc.Node();                    
        this.battle_layer.setName("battle_layer")
        this.battle_layer.setAnchorPoint(0, 0)
        this.battle_layer.setPosition(-SCREEN_WIDTH*0.5, -SCREEN_HEIGHT*0.5)
        this.main_layer.addChild(this.battle_layer, BATTLE_VIEW_BLACK_LAYER_Z0 + 1)
        
        // 特效层
        this.effect_layer_1 = new cc.Node()
        this.effect_layer_1.setName("effect_layer_1");
        this.effect_layer_1.y = this.map_init_y
        this.effect_layer_1.setAnchorPoint(0, 0)
		this.battle_layer.addChild(this.effect_layer_1, BATTLE_VIEW_ROLE_LAYER_Z + 1)
		
        // 特效层2
		this.effect_layer_2 = new cc.Node()
        this.effect_layer_2.y = this.map_init_y
        this.effect_layer_1.setName("effect_layer_2");
        this.effect_layer_2.setAnchorPoint(0, 0)
        this.battle_layer.addChild(this.effect_layer_2, BATTLE_VIEW_ROLE_LAYER_Z - 1)

        // 角色层, 角色层是加载 特效2 和特效1志健
        this.role_layer = new cc.Node()
        this.role_layer.y = this.map_init_y
        this.effect_layer_1.setName("role_layer");
        this.role_layer.setAnchorPoint(0, 0)
		this.battle_layer.addChild(this.role_layer, BATTLE_VIEW_ROLE_LAYER_Z)
    },

    // 监听一些事件
    registerEvent:function(){
      cc.game.on(cc.game.EVENT_SHOW, function () {
        var controller = require("mainui_controller").getInstance();
        var mainuiConst = require("mainui_const")
        if(this.update_drama_battle && this.init_drama_finish && controller.mainui.cur_select_index == mainuiConst.new_btn_index.drama_scene){
          require("battle_controller").getInstance().send20060(3);
        }
      }.bind(this));
    },

    /**
     * 更新或者创建战斗场景
     * @param {*} is_real 
     */
    updateBattleScene: function (is_real) {
        this.is_real_fight = is_real
        // 更新战斗地图
        this.changeBattleScene(is_real);
        // 初始化战斗单位
        if (is_real == true) {
            // 创建真战斗的角色
            var need_enter = this.battle_model.needPlayEnterAction();
            if (need_enter == true){    // 如果是初始化战斗的话,需要播放进场动画
                this.floorTips();
            }else{
                this.battle_model.createRoleList();
            }
            this.update_drama_battle = false;
            this.init_drama_finish = false;
            this.battle_res_id = null;

        } else {
            this.update_drama_battle = true;
            // 创建假战斗的角色
            if (this.init_drama_finish)
                this.battle_hook_model.prepareStarBattle(this.initDramaFinish.bind(this))
        }      
    },

    // 判断是否需要播放进出场的boss来袭或者是pk的VS动画
    floorTips:function(){
        var battle_data = this.battle_model.getCurBattleData();
        if (battle_data == null) return;
        var combat_config = Config.combat_type_data.data_fight_list[battle_data.combat_type];
        if (combat_config){
            if (BattleConst.isNeedSpecStart(battle_data.combat_type)) {  // 显示PK动画
                this.showSpecStart();
            }else{  // 显示BOSS来袭动画
                var start_effect = combat_config.start_effect;
                if (battle_data.combat_type == BattleConst.Fight_Type.Darma){
                    var drama_data = this.battle_drama_model.getDramaData();
                    if (drama_data && drama_data.dun_id){
                        var dun_config = Config.dungeon_data.data_drama_dungeon_info[drama_data.dun_id]
                        if (dun_config && dun_config.is_big != 1){
                            start_effect = "E51147";
                        }
                    }
                }
                Utils.playButtonSound("c_fightstart");
                Utils.playEffectOnce(start_effect, this.main_size.width * 0.5, 770 - this.map_init_y, this.effect_layer_1, function () {
                    if(this.update_drama_battle == true){
                      return;
                    }
                    this.battle_model.createRoleList();
                }.bind(this), PlayerAction.action, 1)
            }
        }else{
            if(this.update_drama_battle == true){
              return;
            }
           this.battle_model.createRoleList(); 
        }
    },

    // pk战斗的进场动画
    showSpecStart:function(){
        if (this.specail_enter) return;
        if (this.is_play_enter == true) return;
        this.is_play_enter = true;
        var prefab_path = PathTool.getPrefabPath("battle", "battle_pk_enter_node");
        this.loadRes(prefab_path, function (res_object){
            if (res_object) {
                this.playSpecialEnterAction(res_object);
            }
        }.bind(this))
    },

    // 播放pk进场动画
    playSpecialEnterAction:function(res_object){
        this.specail_enter = res_object;
        // this.specail_enter.x = this.main_size.width * 0.5;
        // this.specail_enter.y = this.main_size.height * 0.5 - this.map_init_y;
        // this.effect_layer_1.addChild(this.specail_enter);
        this.specail_enter.x = SCREEN_WIDTH*0.5;
        this.specail_enter.y = SCREEN_HEIGHT*0.5;
        ViewManager.getInstance().addToSceneNode(this.specail_enter, SCENE_TAG.win);
        var center_spine = this.specail_enter.getChildByName("center_spine").getComponent(sp.Skeleton);

        var background = this.specail_enter.getChildByName("background")
        background.scale = FIT_SCALE;

        var left_bg = this.specail_enter.getChildByName("left_bg");
        var left_spine = left_bg.getChildByName("spine").getComponent(sp.Skeleton);
        var left_form = left_bg.getChildByName("form_container");
        var left_icon = left_form.getChildByName("icon").getComponent(cc.Sprite);
        var left_name = left_bg.getChildByName("role_name").getComponent(cc.Label);

        var right_bg = this.specail_enter.getChildByName("right_bg");
        var right_spine = right_bg.getChildByName("spine").getComponent(sp.Skeleton);
        var right_form = right_bg.getChildByName("form_container");
        var right_icon = right_form.getChildByName("icon").getComponent(cc.Sprite);
        var right_name = right_bg.getChildByName("role_name").getComponent(cc.Label);

        left_bg.runAction(cc.sequence(cc.moveTo(0.4, -100, 100), cc.callFunc(function () {
            this.showLeftEffect(center_spine, left_spine, right_spine);
        }.bind(this)), cc.delayTime(2), cc.callFunc(function () {
            // 这里还需要释放掉这个预制
            if (this.specail_enter) {
                // this.specail_enter.destroyAllChildren()
                this.specail_enter.destroy();
                this.specail_enter = null;
            }
            this.battle_model.createRoleList();
        }.bind(this))))

        right_bg.runAction(cc.sequence(cc.moveTo(0.4, 100, -100), cc.callFunc(function () {
        }.bind(this))))

        var battle_data = this.battle_model.getCurBattleData();
        if (battle_data){
            // 设置名字
            var left_is_friend = this.battle_model.isFriend(BattleConst.Group_Type.Friend)
            var left_form = null;
            var right_form = null;
            if (left_is_friend == true) {
                left_name.string = battle_data.actor_role_name;
                right_name.string = battle_data.target_role_name;
                left_form = battle_data.formation[1];
                right_form = battle_data.formation[2];
            } else {
                left_name.string = battle_data.target_role_name;
                right_name.string = battle_data.actor_role_name;
                left_form = battle_data.formation[2];
                right_form = battle_data.formation[1];
            }
            // 设置阵法
            if (left_form) {
                var res_path = PathTool.getBattleFormIcon(left_form.formation_type)
                this.loadRes(res_path, function (res_object) {
                    left_icon.spriteFrame = res_object;
                }.bind(this))
            }
            if (right_form) {
                var res_path = PathTool.getBattleFormIcon(right_form.formation_type)
                this.loadRes(res_path, function (res_object) {
                    right_icon.spriteFrame = res_object;
                }.bind(this))
            }
        }
    },

    // pk特效加载
    showLeftEffect:function(center_spine, left_spine, right_spine){
        return;
        if (center_spine == null || left_spine == null) return;
        Utils.playButtonSound("c_fightstart");
        var skeleton_path = PathTool.getSpinePath("E51140");
        this.loadRes(skeleton_path, function(res_object){
            center_spine.skeletonData = res_object;
            left_spine.skeletonData = res_object;
            right_spine.skeletonData = res_object;

            center_spine.setAnimation(0, PlayerAction.action_2, true);
            left_spine.setAnimation(0, PlayerAction.action_1, false);
            right_spine.setAnimation(0, PlayerAction.action_1, false);

        }.bind(this))
    },

    // 获取当前战斗的资源
    curBattleResId:function(combat_type){
        var battle_res_id = 10001
        if (combat_type == BattleConst.Fight_Type.Darma) {
            var drama_data = this.battle_drama_model.getDramaData();
            if (drama_data && drama_data.mode && drama_data.chapter_id){
                var drama_config = Config.dungeon_data.data_drama_world_info[drama_data.mode][drama_data.chapter_id];
                battle_res_id = drama_config.map_id;
            }
        } else {
           var base_config = Config.battle_bg_data.data_info[combat_type];
            if (base_config == null){
                base_config = Config.battle_bg_data.data_info[BattleConst.Fight_Type.Default];
            }

            if(base_config == null){
                battle_res_id = 10001;
            }else{
                battle_res_id = base_config.bid;
            }
            // 冒险战斗后面加
            if (combat_type == BattleConst.Fight_Type.Adventrue){
                var base_data = AdventureController.getInstance().getModel().getAdventureBaseData();
                if(base_data){
                    var config = Config.adventure_data.data_battle_res[base_data.id];
                    if(config && config.battle_res_id){
                        battle_res_id = config.battle_res_id;
                    }
                }
            }
        }
        return battle_res_id;
    },

    // 更新战斗背景
    changeBattleScene:function(is_real){
        var battle_data = this.battle_model.getCurBattleData();
        var unreal_battle_data = this.battle_hook_model.getUnrealBattleData();
        if (battle_data == null && unreal_battle_data == null) { return; }

        var combat_type = BattleConst.Fight_Type.Nil;

        if (is_real == true) {
            combat_type = battle_data.combat_type; // 如果是真实战斗,并且是剧情战斗的话,就要去当前剧情id然后获取资源
        } else {
            combat_type = BattleConst.Fight_Type.Darma
        }
        this.combat_type = combat_type;         // 整场战斗唯一,也是判断的依据
        this.need_run_map = !is_real;           // 非真实战斗才需要移动地图

        var battle_res_id = this.curBattleResId(combat_type);
        this.loaderBattleScene(battle_res_id);  // 切换战斗背景资源

        // 这里做一次音乐的播放处理
        var music_config = null;
        if (this.combat_type == BattleConst.Fight_Type.Darma){
            var config = Config.battle_bg_data.data_info2[this.combat_type];
            if(config && config[battle_res_id]){
                music_config = config[battle_res_id];
            }
        }else{
            music_config = Config.battle_bg_data.data_info[this.combat_type];
        }
        if (music_config && music_config.bg_music != ""){
            Utils.playMusic(AUDIO_TYPE.BATTLE, music_config.bg_music, true);
        }
    },

    // 创建战斗背景,也用于更新下一章节的时候切换假战斗资源
    loaderBattleScene: function (battle_res_id) {
        if (battle_res_id == 0) return;
        if (this.battle_res_id != battle_res_id) {
            this.battle_res_id = battle_res_id;
            if (this.combat_type == BattleConst.Fight_Type.Darma) {
                var res_object = PathTool.getBattleDrameBg(battle_res_id);
                if (battle_res_id) {
                    this.createDramaScene(battle_res_id);
                }
            } else {
                this.createSingleScene(battle_res_id);
            }
        }
    },


    // 创建剧情副本的背景资源
    // s_parh:string 背景资源 f_path:string 前景资源
    createDramaScene: function (battle_res_id) {
        var bg_1_f = false;
        var bg_2_f = false;
        var drama_paths = PathTool.getBattleDrameBg(battle_res_id);   


        LoaderManager.getInstance().loadRes(drama_paths.s, function (res_object) {
            if(this.root && this.root.isValid == false)return;
            if (res_object) {
                if (this.drama_s_bg == null) {
                    this.drama_s_bg = new cc.Node();
                    this.drama_s_bg.scale = 1.43;
                    this.drama_s_bg.setAnchorPoint(0, 0);
                    this.drama_s_bg.setPosition(0, this.slayer_init_y);
                    this.map_sLayer.addChild(this.drama_s_bg, BATTLE_VIEW_BACK_LAYER_Z);
                    this.drama_s_bg_frame = this.drama_s_bg.addComponent(cc.Sprite);
                    // 创建第二张,
                    this.drama_s_bg_2 = cc.instantiate(this.drama_s_bg);
                    this.drama_s_bg_frame_2 = this.drama_s_bg_2.getComponent(cc.Sprite);
                    this.map_sLayer.addChild(this.drama_s_bg_2, BATTLE_VIEW_BACK_LAYER_Z);
                }
                this.drama_s_bg_frame.spriteFrame = res_object;
                this.drama_s_bg_frame_2.spriteFrame = res_object;
                // 设置第二张坐标
                if (this.drama_s_bg_width == null) {
                    this.drama_s_bg_width = this.drama_s_bg.getContentSize().width * 1.43;
                    this.drama_s_bg_2.setPosition(this.drama_s_bg.x + this.drama_s_bg_width, this.slayer_init_y);
                }

            }
            bg_1_f = true;
            if (bg_2_f) { 
                if (this.update_drama_battle && !this.init_drama_finish) {
                    this.battle_hook_model.prepareStarBattle(this.initDramaFinish.bind(this))                               
                }
                // this.init_drama_finish = true;
            }
        }.bind(this))

        LoaderManager.getInstance().loadRes(drama_paths.f, function (res_object) {
            if (res_object) {
                if(this.root && this.root.isValid == false)return;
                if (this.drama_f_bg == null) {
                    this.drama_f_bg = new cc.Node();
                    this.drama_f_bg.setAnchorPoint(0, 0);
                    this.drama_f_bg.scale = 1.43;
                    this.map_fLayer.addChild(this.drama_f_bg, BATTLE_VIEW_BACK_LAYER_Z);
                    this.drama_f_bg_frame = this.drama_f_bg.addComponent(cc.Sprite);
                    // 创建第二张,
                    this.drama_f_bg_2 = cc.instantiate(this.drama_f_bg);
                    this.drama_f_bg_frame_2 = this.drama_f_bg_2.getComponent(cc.Sprite);
                    this.map_fLayer.addChild(this.drama_f_bg_2, BATTLE_VIEW_BACK_LAYER_Z);
                }
                this.drama_f_bg_frame.spriteFrame = res_object
                this.drama_f_bg_frame_2.spriteFrame = res_object;
                // 设置第二张坐标
                if (this.drama_f_bg_width == null) {
                    this.drama_f_bg_width = this.drama_f_bg.getContentSize().width * 1.43;
                    this.drama_f_bg_2.x = this.drama_f_bg.x + this.drama_f_bg_width;
                }

                bg_2_f = true;
                if (bg_1_f) {
                    if (this.update_drama_battle && !this.init_drama_finish) {
                        this.battle_hook_model.prepareStarBattle(this.initDramaFinish.bind(this))                             
                    }
                    // this.init_drama_finish = true;
                }
            }

        }.bind(this))
    },

    initDramaFinish: function() {
        this.init_drama_finish = true;
    },

    // 创建单张战斗背景的
    createSingleScene:function(res_id){
        if (this.map_sLayer_frame == null) {
            this.map_sLayer_frame = this.map_oLayer.addComponent(cc.Sprite);
        }
        this.map_oLayer.active = true;
        var res_path = PathTool.getBattleSingleBg(res_id);
        this.loadRes(res_path, function (res_object) {
            this.map_sLayer_frame.spriteFrame = res_object;
        }.bind(this))
    },

    // 打开定帧处理
    mapMovescheduleUpdate:function(){
        if (this.need_run_map && this.init_drama_finish){
            this.moveMap()
        }
    },

    // 设置是否移动地图,只有剧情战斗才需要做这个处理
    changeMoveMapStatus:function(status){
        if (this.combat_type == BattleConst.Fight_Type.Darma){
            this.need_run_map = status;
        }
    },

    // 移动地图
    moveMap:function(){
        if (this.drama_s_bg == null || this.drama_f_bg == null) { return; }
        this.drama_s_bg.x = this.drama_s_bg.x - this.bg_speed;
        this.drama_s_bg_2.x = this.drama_s_bg_2.x - this.bg_speed;
        this.drama_f_bg.x = this.drama_f_bg.x - this.f_speed;
        this.drama_f_bg_2.x = this.drama_f_bg_2.x - this.f_speed;
        // 移动背景层
        this.changeBgPosition(this.drama_s_bg, this.drama_s_bg_2, this.drama_s_bg_width)
        this.changeBgPosition(this.drama_s_bg_2, this.drama_s_bg, this.drama_s_bg_width)
        // 移动前景层
        this.changeBgPosition(this.drama_f_bg, this.drama_f_bg_2, this.drama_f_bg_width)
        this.changeBgPosition(this.drama_f_bg_2, this.drama_f_bg, this.drama_f_bg_width)
    },

    // 设置地图位置可能移动越界了
    changeBgPosition:function(cur_bg, target_bg, width){
        if (cur_bg == null || target_bg == null) { return; }
        if (cur_bg.x <= -width){
            cur_bg.x = target_bg.x + width
        }
    },

    // 更新回合
    updateRound:function(round){
        // local fight_list_config = Config.combat_type_data.data_fight_list
        // if fight_list_config == nil or fight_list_config[self.battle_type] == nil then return end
        
        // local total_round = fight_list_config[self.battle_type].max_action_count or 0
        // if not _tolua_isnull(self.round_label) then
        //     self.round_label:setString(string.format(TI18N("第%d/%d回合"), round, total_round))
        // end
    },

    // 单位被动技能喊招
    showPassiveSkillName:function(battle_role, callback){
        if(callback){
            callback();
        }
    },

    // 获取战斗的特效层
    getBattleEffectLayer:function(index){
        if(index == 1){
            return this.effect_layer_1;
        }else{
            return this.effect_layer_2;
        }
    },

    // 返回角色层
    getBattleRoleLayer:function(){
        return this.role_layer
    },

    loadRes:function(res, callback){
        if (res == null || res == "") return;
        if (callback == null) return;
        LoaderManager.getInstance().loadRes(res, (function (res_object) {
            if (this.resources_list[res] == null) {
                this.resources_list[res] = res;
            }
            callback(res_object);
        }).bind(this));
    },

    // 释放掉战斗场景相关信息
    deleteMe:function(){
        if (this.black_layer){
            this.black_layer.stopAllActions();
        }
        if (this.specail_enter){
            this.specail_enter.destroy()
            this.specail_enter = null;
        }
        for(var key in this.resources_list){
            LoaderManager.getInstance().releaseRes(key)
        }
        this.root.destroy();
    },

    // 设置黑屏,战斗效果播放
    setBlack:function(status, alpha){
        if (!status){
            if (this.black_layer) {
                this.black_layer.stopAllActions();
                this.black_layer.active = false;
                this.black_on_show = false;
            }
        } else {
            if (this.black_on_show == true) return;
            this.black_on_show = true;

            if (this.black_layer) {
                this.black_layer.active = true;
            } else {
                this.black_layer = new cc.Node();
                this.black_layer.setAnchorPoint(0, 0);
                this.black_layer.setContentSize(this.main_size.width + 200, this.main_size.height + 200);
                this.black_layer.setPosition(-100, -100);
                this.black_layer.setName("black_layer")
                this.black_layer.scale = FIT_SCALE;
                this.battle_layer.addChild(this.black_layer, 1);

                var graphics_cp = this.black_layer.addComponent(cc.Graphics);
                graphics_cp.clear();
                graphics_cp.fillColor = cc.color(0, 0, 0, 168);
                graphics_cp.rect(0, 0, this.main_size.width + 200, this.main_size.height + 200);
                graphics_cp.fill()
            }
            this.black_layer.opacity = 0;
            this.black_layer.runAction(cc.fadeIn(0.2));
        }
    },

    // 震屏,战斗效果播放
    shakeScreen:function(shake_id){
        if (this.is_shake) return;
        if (shake_id == null) return;
        var data_config = Config.skill_data.data_get_shake_data[shake_id];
        if (data_config == null) return;
        this.is_shake = true;
        this.main_layer.stopAllActions();
        this.main_layer.setPosition(0, 0);
        // 重置位置
        var returnPos = function(){
            this.is_shake = false;
            this.main_layer.setPosition(0, 0);
        }.bind(this);

        var order = [0, 3, 6, 4, 7, 8, 5, 2, 1];
        var str = data_config.shake_strength;           // 振幅,单位像素
        var step = data_config.shake_rate * 0.001;      // 振幅间隔,单位秒
        var shakeTime = data_config.shake_time;         // 振动次数
        var shakeXTime = 0.25;                          // 横向加倍
        var shakeYTime = 0.25;                          // 纵向加倍
	    var xy_list = [[-0.7, 0.7], [0, 1], [0.7, 0.7], [-1, 0], [0, 0], [1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7]];

        // 随机设置坐标
        var setRandomPos = function (index){
            var pos_x = str * shakeYTime * xy_list[order[index]][0];
            var pos_y = -str * shakeXTime * xy_list[order[index]][1];
            this.main_layer.setPosition(pos_x, pos_y);
        }.bind(this);

        var base_call = null;
        for (let times = 0; times < shakeTime; times++) {
            for (let index = 0; index < order.length; index++) {
                var delay = cc.delayTime(step);
                if (base_call == null) {
                    base_call = cc.sequence(cc.callFunc(function () {
                        setRandomPos(index);
                    }.bind(this)), delay);
                }else{
                    base_call = cc.sequence(base_call, cc.callFunc(function(){
                        setRandomPos(index);
                    }.bind(this), delay));
                }
            }
            str = str - 3;
        }
        if (base_call){
            base_call = cc.sequence(base_call, cc.callFunc(returnPos));
            this.main_layer.runAction(base_call);
        }
    },
});