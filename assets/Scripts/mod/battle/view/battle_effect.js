// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗特效单位
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var BattleRolePool = require("battle_role_pool");
var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")
var BattleResPool = require("battle_res_pool");

var BattleEffect = cc.Class({
    extends: BaseClass,

    properties: {
        skelon_cache: {
            default: {}
        }
    },

    ctor: function () {
        this.initConfig()
    },

    initConfig:function(){
        this.effect = null;                     // 特效单位
        this.skelon_cache = {};                 // 动画缓存
        this.effect_active = true;
        this.action_call_list = {};             // 制动动作回调

        this.model = require("battle_controller").getInstance().getModel();
    },

    /**
     * 创建特效
     * @param {*} parent 特效父节点
     * @param {*} scene_pos 场景位置,像素坐标不是格子
     * @param {*} reverse 是否反转
     * @param {*} res_id 特效id
     */
    createEffect:function(parent, scene_pos, reverse, res_id){
        this.parent = parent;
        this.scene_pos = scene_pos;
        this.reverse = reverse || 1;
        this.res_id = res_id;
        let pools = BattleRolePool.getInstance().getEffectPools()
        let effect = null;
        if(pools.size() > 0){
            effect = pools.get();
            effect.active = true;
            this.createEffectWnd(effect)
        }else{
            this.createEffectWnd()
        }
        // 对特效资源进行计数
        // LoaderManager.getInstance().countSkeleton(this.res_id);
    },

    // 创建特效具体
    createEffectWnd:function(effect){
        if (effect == null){
            effect = new cc.Node();
            effect.setAnchorPoint(0.5, 0.5);
            effect.addComponent(sp.Skeleton);
        }
        this.effect = effect;
        this.effect.scaleX = this.reverse;
        this.effect.rotation = 0;

        if (this.parent){
            this.parent.addChild(this.effect);
        }
        this.skeleton = this.effect.getComponent(sp.Skeleton);
        // 设置位置
        this.effect.setPosition(this.scene_pos.x, this.scene_pos.y);
        // 设置当前的模型速率
        if (this.skeleton_time_scale) {
            this.skeleton.timeScale = this.skeleton_time_scale;
            this.skeleton_time_scale = null;
        } else {
            var timeScale = this.model.getTimeScale();
            // if(this.model.isInRealBattle() == true){
                // timeScale = this.model.getTimeScale();
            // }
            this.skeleton.timeScale = timeScale;
        }
        this.resetInitStatus();
        this.registerEvent();
    },

    // 设置特效位置
    resetScenePos:function(scene_pos){
        this.scene_pos = scene_pos;
        if(this.effect){
            this.effect.setPosition(this.scene_pos.x, this.scene_pos.y);
        }
    },

    // 特效缩放
    setEffectScale:function(scale) {
        if(this.effect) {
            const new_scale = scale * 0.001;
            this.effect.scaleX *= new_scale;
            this.effect.scaleY = new_scale;
        }
    },

    // 特效反转
    resetReverse:function(reverse){
        this.reverse = reverse;
        if(this.effect){
            this.effect.scaleX = this.reverse;
        }
    },

    // 添加对象
    registerEvent:function(){
        this.skeleton.setCompleteListener((function (trackEntry, loopCount) {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            if (this.over_func) {
                this.over_func(animationName);
                // 清掉动作事件
                this.over_func = null;
                this.event_func = null;
                // 单循环特效,可以直接清掉,这里可能会有问题,暂时这样处理
                this.play_action_name = ""
            }
        }).bind(this))

        this.skeleton.setEventListener((function (trackEntry, event) {
            if (this.event_func){
                this.event_func(event.data.name)
            }
        }).bind(this))
    },

    // 设置动作伴随事件和动作结束事件回调
    setAnimationActionFunc: function (event_func, over_func) {
        this.event_func = event_func;
        this.over_func = over_func;
    },

    // 播放动作
    playActionOnce:function(action_name, res_name, is_loop){
        res_name = res_name || "action";
        if(is_loop == null){
            is_loop = true;
        }
        this.effect_play_key = Utils.getNorKey(this.res_id, action_name); //储存一下当前特效资源和动作

        var target_key = Utils.getNorKey(this.res_id, res_name);
        Log.info("BattleEffect.playActionOnce, action_name:" + action_name + ', res_name:' + res_name +', is_loop:'
            + is_loop + ', this.play_action_res:' + this.play_action_res
            + ', target_key: ' + target_key + ', ts:' + new Date().getMilliseconds());
        if (this.play_action_res == target_key) {
            if (this.play_action_name != action_name) {
                this.play_action_name = action_name;
                this.skeleton.setAnimation(0, action_name, is_loop);
            }
            return;
        }
        this.play_action_res = target_key;
        var skeleton_path = PathTool.getSpinePath(this.res_id, res_name);
        // var skeletonData = this.skelon_cache[skeleton_path]
        // if (skeletonData) {
        //     this.play_action_name = action_name
        //     this.skeleton.skeletonData = skeletonData;
        //     this.skeleton.setAnimation(0, action_name, is_loop);
        // } else {
        //     LoaderManager.getInstance().loadRes(skeleton_path, function (res_object) {
        //         this.play_action_name = action_name
        //         this.skeleton.skeletonData = res_object;
        //         this.skeleton.setAnimation(0, action_name, is_loop);
        //         if (!this.skelon_cache[skeleton_path]) {
        //             this.skelon_cache[skeleton_path] = res_object;
        //         }
        //     }.bind(this))
        // }

        if (this.skelon_cache[skeleton_path]) {
                this.play_action_name = action_name
                this.skeleton.skeletonData = this.skelon_cache[skeleton_path];
                this.skeleton.setAnimation(0, action_name, is_loop);
        } else {
            BattleResPool.getInstance().getRes(skeleton_path, function (res_object) {
                this.play_action_name = action_name
                this.skeleton.skeletonData = res_object;
                this.skeleton.setAnimation(0, action_name, is_loop);
                if (!this.skelon_cache[skeleton_path]) {
                    this.skelon_cache[skeleton_path] = res_object;
                }
            }.bind(this))
        }

    },

    getEffectKey:function(){
        return this.effect_play_key || "";
    },

    // 当前深度值
    setLocalZOrder: function (zIndex) {
        if (this.effect) {
            this.effect.zIndex = zIndex;
        }
    },

    // 战斗动作播报
    runAction: function (action) {
        if (this.effect) {
            this.effect.stopAllActions();
            this.effect.runAction(action);
        }
    },

    // 挂接到战斗单位身上的特效,当引用次数为0的时候,不需要移除掉,只要不可见,退出单位统一移除
    setActiveEffect:function(status){
        if (this.effect_active == status){
            return;
        }
        this.effect_active = status;
        if(this.effect){
            this.effect.active = status;
        }
    },

    // 初始化众泰
    resetInitStatus:function(){
        if (this.skeleton) {
            this.skeleton.setToSetupPose();
            this.skeleton.clearTracks();
        }
    },

    // 子弹需要旋转角度
    setRotation:function(degree){
        if(this.effect){
            this.effect.rotation = degree
        }
    },

    // 设置特效的播放速率
    setTimeScale:function(speed){
        if (this.skeleton == null || this.skeleton.skeletonData == null) {
            this.skeleton_time_scale = speed;
        } else {
            if (this.skeleton_timeScale == speed) return;
            this.skeleton_timeScale = speed;
            this.skeleton.timeScale = speed;
        }
    },

    deleEffect:function(){
        this.effect.stopAllActions();
        this.skeleton.skeletonData = null;

        // 清掉加载资源
        for (var skeletonIndex in this.skelon_cache) {
            BattleResPool.getInstance().delRes(skeletonIndex);
            // LoaderManager.getInstance().releaseRes(skeletonIndex);
        }

        this.skelon_cache = {};

        // 回收掉
        BattleRolePool.getInstance().pushBackEffect(this.effect);
    }
});
