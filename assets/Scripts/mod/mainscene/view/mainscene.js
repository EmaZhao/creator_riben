// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      主城
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var LoaderManager = require("loadermanager");
var SceneCtrl = require("mainscene_controller");
var SceneEvent = require("mainscene_event");
var SceneConst = require("scene_const");
var BuildItem = require("build_item");
var GuideController = require("guide_controller");

var MainScene = cc.Class({
    extends: BaseClass,

    properties: {
        build_list: null,
        effect_render_list: [],
        config: null,
        cur_time_type: 1,           // 当前时间类型
        map_type: null,
        last_map_res: [],           // 存储地图的资源路径
        scene_effect: [],
        get_build_cb: {
            default: {}
        },
        build_items: {
            default: {}
        },        
    },

    ctor:function(){
        this.config = arguments[0];
        this.initConfig();
        this.createRootWnd();
        this.registerEvent()
        this.createScene();
    },

    // 初始化一些配置数据
    initConfig: function () {
        this.size = cc.size(1440, 1280);            // 地图尺寸
        this.layer_num = 4;                         // 当前地图层数
        this.map_layer = [];                        // 地图层级
        this.speed_list = [0.2, 0, -0.15, 0];   // 各层地图相对一定的速度
        this.init_x = 0;
        this.init_y = 0;
        this.map_cache = [];                        // 带创建的地图列表
        this.layer_img_list = ["1.png", "2.png", "3.png", "4.jpg"];

        this.last_point = null;
    },

    setTimeType: function(timevalue) {
        var cur_type;
        if (timevalue >= 6 && timevalue < 18) {
            cur_type = 1;
        } else {
            cur_type = 1;
        }

        if (this.cur_time_type !== cur_type) {
            this.cur_time_type = cur_type;
            if (this.root.active) this.changeSceneMap();
        }
    },

    getTiemType: function() {
        var myDate = new Date();
        var curTime = myDate.getHours();
        var cur_time_type = 1;
        if (curTime >= 6 && curTime <= 18) {
            cur_time_type = 1;
        }
        return cur_time_type;
    },

    // 创建主城相关节点
    createRootWnd: function(){
        this.root = new cc.Node("base_root");
        this.root.setAnchorPoint(0, 0);
        var scene_scale = this.scene_scale = 1;
        var width_scale = this.width_scale = 1;

        if (window.FIT_HEIDGHT) {
            width_scale = FIT_SCALE;            
        }

        if (window.FIT_WIDTH) {
            scene_scale = FIT_SCALE;            
        }

        this.root.setContentSize(SCREEN_WIDTH * width_scale, SCREEN_HEIGHT);
        this.root.setPosition(-SCREEN_WIDTH * 0.5 * width_scale, -SCREEN_HEIGHT * 0.5 * scene_scale);
        this.root.addComponent(cc.Mask);    // 设置剪辑区域

        ViewManager.getInstance().addToSceneNode(this.root, SCENE_TAG.scene);
        this.root.scale = scene_scale;

        this.rootShowY = this.root.y;
        this.rootHideY = - this.root.height * 2;

        // 主的操作节点
        this.root_wnd = new cc.Node("handle_root");
        this.root_wnd.setAnchorPoint(0, 0);
        this.root_wnd.setContentSize(this.size);
        this.root_wnd.parent = this.root;

        // 地图层级
        for (let index = 0; index < this.layer_num; index++) {
            var map_layer = new cc.Node("map_layer"+index);
            map_layer.setAnchorPoint(0, 0);
            map_layer.setContentSize(this.size);
            this.root_wnd.addChild(map_layer, (10-index));
            this.map_layer[index] = {node:map_layer, index:index, sprite:null, frame:null, res:null};
        }

        // 初始化坐标
        this.init_x = (SCREEN_WIDTH - this.size.width) * 0.5;
        this.init_y = (SCREEN_HEIGHT - this.size.height) * 0.5;
        this.updateMainScene(this.init_x, this.init_y);

        this.playBackgroundMusic();
    },

    // 注册监听事件,这里包含场景的
    registerEvent: function(){
        var self = this
        this.root.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.last_point = null;
            for (const iterator of self.map_layer) {
                if (iterator.node){
                    iterator.node.stopAllActions();
                }
            }
            self.root_wnd.stopAllActions()
        }, this);

        this.root.on(cc.Node.EventType.TOUCH_MOVE, function(event){
            var touches = event.getTouches();
            self.last_point = touches[0].getDelta();
            self.moveMainScene(self.last_point.x);
        }, this);

        this.root.on(cc.Node.EventType.TOUCH_END, function(event){
            if (self.last_point == null){ 
                return
            }
            var interval_x = self.last_point.x * 3;
            // var interval_x = (self.last_point.x/Math.abs(self.last_point.x)) * 30;
            var temp_x = self.root_wnd.getPosition().x + interval_x;
            var target_x = self.scaleCheckPoint(temp_x);
            for (const iterator of self.map_layer) {
                if (iterator.node){
                    var speed = self.speed_list[iterator.index];
                    var move_to = cc.moveTo(2, (target_x - self.init_x) * speed, 0).easing(cc.easeBackOut());
                    iterator.node.runAction(move_to);
                }
            }
            var root_move_to = cc.moveTo(2, target_x, self.init_y);
            self.root_wnd.runAction(root_move_to.easing(cc.easeBackOut()));

        }, this)
    },

    // 设置主城是否可见
    setVisible:function(status){
        if (!status) {
            // this.rootY = this.root.y;
            this.root.y = this.rootHideY;
            // this.root.active = status;
        } else {
            var cur_time_type = this.getTiemType();
            if (cur_time_type !== this.cur_time_type) {
                this.changeSceneMap();
            }
            this.root.y = this.rootShowY;
        }
    },

    // 移动主城位置
    updateMainScene:function(x, y){
        y = y ? y : this.init_y;
        for (let index = 0; index < this.map_layer.length; index++) {
            const element = this.map_layer[index];
            const speed = this.speed_list[index];
            element.node.setPosition((x-this.init_x) * speed, y - this.init_y)
        }
        this.root_wnd.setPosition(x, y);
    },

    // 创建具体显示数据,包括背景,马赛克等
    createScene:function(){
        this.cur_time_type = this.getTiemType();
        // this.changeSceneMap();
        this.renderSmallPic();
        gcore.Timer.set(function() {
            this.changeSceneMap();
        }.bind(this), 2000, 1)

        var build_list = SceneCtrl.getInstance().getBuildList();
        if (Utils.isEmpty(build_list) && !this.wait_create_build_event) {
            this.create_build_vo = gcore.GlobalEvent.bind(SceneEvent.CreateBuildVoOver, (function(){
                this.wait_create_build_event = null;
                gcore.GlobalEvent.unbind(this.create_build_vo);
                this.beforeCreateBuild();
            }).bind(this));
        } else {
            this.beforeCreateBuild();
        }
        // this.quequeCreateEffect();
        // 开始预加载资源
        DownloadManager.getInstance().checkAnimaCache()
    },

    // 延迟创建地图
    mainLoop:function(){
        if (this.map_cache && this.map_cache.length > 0){
            var map_info = this.map_cache.shift();
            if (map_info.res){
                LoaderManager.getInstance().loadRes(map_info.res, function(limit_num, res_object){
                    var map_layer = this.map_layer[map_info.layer];
                    if (map_layer && map_layer.node){
                        if (map_layer.sprite == null){
                            map_layer.sprite = new cc.Node();
                            map_layer.sprite.setPosition(map_info.pos)
                            map_layer.sprite.setAnchorPoint(map_info.ap);
                            if (map_info.layer == 3) {   //最后一层的时候需要放大4倍
                                if (this.cur_time_type == 1) {
                                    map_layer.sprite.setScale(4);
                                } else {
                                    map_layer.sprite.setScale(1);
                                }
                            }
                            map_layer.node.addChild(map_layer.sprite, -1);
                            map_layer.frame = map_layer.sprite.addComponent(cc.Sprite);
                        }
                        map_layer.frame.spriteFrame = res_object;
                        if (map_layer.res) {
                            LoaderManager.getInstance().releaseRes(map_layer.res);
                        }
                        map_layer.res = map_info.res        // 储存资源,到时候切换时间的时候要释放掉的
                    }
                    if (limit_num == 0) {
                        if (this.small_sprite){
                            this.small_sprite.destroy();
                            this.small_sprite = null;
                            LoaderManager.getInstance().deleteRes("res/centerscene/preview/centercity_1");
                        }                        
                    }
                }.bind(this, this.map_cache.length));
            }
        }

        if (this.effect_render_list.length > 0)
            this.quequeCreateEffect();

        if (this.effect_render_list == 0 && this.map_cache.length == 0) {
            gcore.Timer.del(this.timer);
            this.timer = null;
        }
    },

    // 创建马赛克地图
    renderSmallPic:function(){
        var small_path  = "res/centerscene/preview/centercity_" + this.cur_time_type + ".jpg"
        if (small_path && this.small_path) 
            return

        LoaderManager.getInstance().loadRes(small_path, function (res_object) {
            this.small_sprite = new cc.Node();
            this.small_sprite.setPosition(0, 0);
            this.small_sprite.setAnchorPoint(0, 0);
            this.root_wnd.addChild(this.small_sprite, 1);

            const sprite = this.small_sprite.addComponent(cc.Sprite);
            sprite.spriteFrame = res_object;
            var size = this.small_sprite.getContentSize();
            this.small_sprite.setScale(this.size.width / size.width, this.size.height / size.height);
        }.bind(this));
        this.small_path = small_path;
    },

    // 设置待创建资源
    renderMapPic: function(){
        var map_res = "res/centerscene/centercity/" + this.map_type;
        for (let index = 0; index < this.layer_img_list.length; index++) {
            var pos = cc.v2(0, 0)
            var ap = cc.v2(0, 0)
            const element = this.layer_img_list[index];
            // var res_path = map_res + "/" + (index + 1) + "/" + element;
            var res_path = map_res + "/"  + element;

            if (index == 0) {
                pos.x = -80;
            }else if (index == 1){

            }else if (index == 2){
                pos.x = 59;
                pos.y = 472;
            }else{
                pos.y = this.size.height;
                ap.y = 1
            }
            this.map_cache.push({res:res_path, layer:index, pos:pos, ap:ap});
        }
    },

    // 地图移动
    moveMainScene: function (x) {
        if (GuideController.getInstance().isInGuide())
            return

        x = this.root_wnd.getPosition().x + x;
        var _x = this.scaleCheckPoint(x);
        this.updateMainScene(_x);
    },

    moveToBuild: function(id) {
        if (this.build_items[id]) {
            var build_nd = this.build_items[id].root_wnd;
            var build_word_pos = build_nd.convertToWorldSpaceAR(cc.v2(0, 0));
            var final_pso = this.root_wnd.convertToNodeSpaceAR(build_word_pos);

            // var _x = this.scaleCheckPoint(-(final_pso.x - cc.winSize.width * 0.5));
            var _x = this.scaleCheckPoint(-(final_pso.x - SCREEN_WIDTH * 0.5));            
            this.updateMainScene(_x);
        }
    },

    // 判断点是否越界
    scaleCheckPoint: function (x) {
        var _x = x;
        if (x > 0) {
            _x = 0
        } else if (x < (this.root.width - this.size.width)) {
            _x = this.root.width - this.size.width;
        }
        return _x;
    },

    beforeCreateBuild: function() {
        var build_list = SceneCtrl.getInstance().getBuildList();
        var listNum = Object.keys(build_list).length;
        var scheIndex = 0;
        var createItemSche = gcore.Timer.set((function(){
            var buildKey = Object.keys(build_list)[scheIndex];
            var buildInfo = build_list[buildKey];
            this.createBuildItem(buildInfo);
            if (scheIndex == listNum - 1) {
                gcore.Timer.del(createItemSche);
            }
            scheIndex ++;
        }).bind(this), 100, listNum);


        // var battle_drama_model = require("battle_drama_controller").getInstance().getModel();
        // battle_drama_model.preloadDramaScene();
    },


    createBuildItem: function(buildInfo) {
        var build_item = new BuildItem(buildInfo, SceneConst.BuildItemType.build);
        var layerIndex = buildInfo.config.layer;
        this.map_layer[layerIndex - 1].node.addChild(build_item.root_wnd, 999);

        // 判断节点
        this.build_items[buildInfo.config.bid] = build_item;
        if (this.get_build_cb[buildInfo.config.bid]) {
            var calbacks = this.get_build_cb[buildInfo.config.bid];
            for (var cb_i in calbacks) {
                calbacks[cb_i](build_item);
            }
        }
    },

    changeSceneMap: function() {
        if (!this.map_type || this.map_type !== this.cur_time_type) {        
            this.map_type = this.cur_time_type;
            this.renderSmallPic();
            this.renderMapPic();
            this.changeSceneEffect();
            // 开始创建地图
            if (!this.timer){
                this.timer = gcore.Timer.set((function(){
                    this.mainLoop();
                }).bind(this), 400, -1);
            }   
        }
    },

    // 改变当前场景的一些特效
    changeSceneEffect: function() {
        if (this.effect_render_list.length > 0) {
            this.effect_render_list.length = [];
        }

        for (var effectIndex in this.scene_effect) {
            this.scene_effect[effectIndex].deleteMe();
            // var effectIten = this.scene_effect.shift();
            // effectIten.deleteMe();
        }

        this.analysisEffect()
    },

    // 解析特效数据
    analysisEffect: function() {
        this.effect_render_list = [];
        if (this.config && this.config.building_list) {
            for (var buildIndex in this.config.building_list) {
                var buildItem = this.config.building_list[buildIndex];
                if (buildItem.dun_id == 0 || this.cur_time_type == buildItem.dun_id) {
                    if (buildItem.type !==  SceneConst.BuildItemType.build) {                    
                        if (buildItem && buildItem.res) {
                            if (buildItem.res == "E54539" || buildItem.res == "E54540") {
                                continue;
                            }
                        }
                        this.effect_render_list.push(buildItem);
                    }
                }
            }
        }
    },

    // 创建场景特效
    quequeCreateEffect: function() {
        // for (var effectIndx = 0; effectIndx < this.effect_render_list.length; effectIndx ++) {
            var effectConf = this.effect_render_list.shift();
            var buildItem = new BuildItem(effectConf, effectConf.type);
            this.map_layer[effectConf.layer - 1].node.addChild(buildItem.root_wnd);
            this.scene_effect.push(buildItem);
        // }
    },

    playBackgroundMusic: function() {
        Utils.playMusic(AUDIO_TYPE.SCENE, "s_002", true);
    },

    getBuildById: function(id, finish_cb){
        if (this.build_items[id]) {
            finish_cb(this.build_items[id]);
        } else {
            if (!this.get_build_cb[id])
                this.get_build_cb[id] = [];
            this.get_build_cb[id].push(finish_cb);
        }

        cc.log(this.get_build_cb);
    },
});

module.exports = MainScene;