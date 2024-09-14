// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-27 17:33:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaController = require("battle_drama_controller");
var BattleController = require("battle_controller");

var Worldmap_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("worldmap", "world_map_windows");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.config = Config.dungeon_scene_data;
        this.size = cc.size(this.config.width, this.config.height)
    
        this.land_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.map_wnd = this.root_wnd.getChildByName("map_wnd");
        this.map_wnd.setContentSize(cc.size(1600,1280));
        this.map_wnd.scale = FIT_SCALE;
        var map_bg_res = PathTool.getUIIconPath("worldmap", "blayer", "jpg")
        this.map_layer = this.map_wnd.addComponent(cc.Sprite);
        this.map_layer.type = cc.Sprite.Type.SIMPLE;
        this.map_layer.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        this.loadRes(map_bg_res, (function(resObject){
            this.map_layer.spriteFrame = resObject;
        }).bind(this));
        
        this.top_info_container = this.root_wnd.getChildByName("top_info_container");
        this.top_info_container.y = 1025*FIT_SCALE;
        this.return_btn = this.top_info_container.getChildByName("return_btn");
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.return_btn, function () {
            this.ctrl.openWorldMapMainWindow(false,this.data);
        }.bind(this), 1);

        //当用户点击的时候记录鼠标点击状态
        this.map_wnd.on(cc.Node.EventType.TOUCH_START, function(event){
            this.last_point = null;
            this.map_layer.node.stopAllActions()
            return true
        },this);

        //只有当用户鼠标按下才能拖拽
        this.map_wnd.on(cc.Node.EventType.TOUCH_MOVE, function(event){
            var touches = event.getTouches();
            this.last_point = touches[0].getDelta();
            this.moveMainScene(this.last_point.x);
        },this);


        //当鼠标抬起的时候恢复状态
        this.map_wnd.on(cc.Node.EventType.TOUCH_END, function(event){
            if(this.last_point){               
                var interval_x = this.last_point.x * 3;
                var temp_x = this.map_layer.node.x + interval_x;
                var target_x = this.scaleCheckPoint(temp_x);
                var root_move_to = cc.moveTo(1, cc.v2(target_x, this.map_wnd.height/2))
                var call_fun = cc.callFunc(function(){
                })
                root_move_to.easing(cc.easeSineOut());
                this.map_layer.node.runAction(cc.sequence(root_move_to, call_fun));
            }
        },this);
    },

    moveMainScene:function(x){
        x = this.map_layer.node.x+ x;
        var _x = this.scaleCheckPoint(x);
        this.updateMainScene(_x);
    },

    
    scaleCheckPoint:function(_x){
        if(_x > 0){
            _x = 0
        }else if(_x < SCREEN_WIDTH - this.map_layer.node.width*FIT_SCALE){
            _x = SCREEN_WIDTH - this.map_layer.node.width*FIT_SCALE;
        }
        return _x
    },

    updateMainScene:function(x, y){
        y = y || 0;
        this.map_layer.node.setPosition(x, this.map_wnd.height/2 + y);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data
        if(this.data){//说明是章节解锁
            // WorldmapController:getInstance():addLockContainer(true)
            BattleController.getInstance().setUnlockChapterStatus(true)
        }
        var dungeon_data = BattleDramaController.getInstance().getModel().getDramaData();
        if(dungeon_data!=null){
            var dun_id = dungeon_data.dun_id;
            if(this.data){
                dun_id = this.data.dun_id;
            }
            var dungeon_config = gdata("dungeon_data", "data_drama_dungeon_info", dun_id);
            if(dungeon_config!=null){
                this.dungeon_config = dungeon_config;
                this.createWorldLand();
                this.updateScenePos();
            }
        }

        gcore.Timer.set(function () {
            var node = new cc.Node();
            node.setAnchorPoint(0,0)
            node.setPosition(0,-this.map_wnd.height/2);
            this.map_layer.node.addChild(node);

            this.spine = node.addComponent(sp.Skeleton);
            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(199), "action");
            LoaderManager.getInstance().loadRes(anima_path, function(ske_data) {
                if(this.spine){
                    this.spine.skeletonData = ske_data;
                    this.spine.setAnimation(0, PlayerAction.action, true);
                }
            }.bind(this));
        }.bind(this), 0.2, 1);
    },

    // 创建板块信息
    createWorldLand:function(){
        if(this.config != null && this.config.building_list != null){
            var click_callback = function(item){
                this.selectedMainLandItem(item);
            }.bind(this)
            var max_chapter_id = BattleDramaController.getInstance().getModel().getCurMaxChapterId(BattleDramaController.getInstance().getModel().getDramaData().mode)
            var count = 0;
            for(var i in this.config.building_list){
                var v = this.config.building_list[i];
                gcore.Timer.set(function (v) {
                    if(this.land_list[v.bid] == null){
                        count = count + 1
                        var WorldMapLand = require("worldmap_land");
                        this.land_list[v.bid] = new WorldMapLand(v, max_chapter_id, click_callback,this.data);
                        this.land_list[v.bid].addToParent(this.map_layer.node)
                        this.land_list[v.bid].info_data  = v
                        if(v.bid == this.dungeon_config.land_id){
                            this.selectedMainLandItem(this.land_list[v.bid])
                            // -- this:updateScenePos()
                        }
                    }
                }.bind(this,v), 1*i / 60, 1);
            }
        }
    },

    // 移到当前的位置,这个地方先不要这么高吧 因为有跳变
    updateScenePos:function(){
        var last_id 
        if(BattleDramaController.getInstance().getModel().getDramaData()){
            last_id = BattleDramaController.getInstance().getModel().getDramaData().max_dun_id;
        }
        if(this.data){
            last_id = this.data.dun_id;
        }
        if(last_id){
            if(gdata("dungeon_data", "data_drama_dungeon_info", last_id)){
                var next_id = gdata("dungeon_data", "data_drama_dungeon_info", last_id).next_id;
                if(next_id == 0){
                    next_id = last_id
                }
                if(gdata("dungeon_data", "data_drama_dungeon_info", next_id)){
                    this.target_config = gdata("dungeon_data", "data_drama_dungeon_info", next_id);
                }
                var scene_config = null;
                if(this.target_config!=null){
                    for(var i in this.land_list){
                        if(this.land_list[i].info_data.bid == this.target_config.land_id){
                            scene_config = this.land_list[i].info_data;
                            break
                        }
                    }
                }
                this.init_x = 0;
                this.init_y = (SCREEN_HEIGHT - this.size.height) * 0.5;
                if(scene_config){
                    if(scene_config = null){
                        this.init_x = (SCREEN_WIDTH - this.size.width) * 0.5;
                    }else{
                        var target_x;
                        if(scene_config.x < SCREEN_WIDTH / 2){
                            target_x = 0;
                        }else if(scene_config.x > this.size.width - SCREEN_WIDTH / 2){
                            target_x = SCREEN_WIDTH - this.size.width;
                        }else{
                            target_x = SCREEN_WIDTH / 2 - scene_config.x
                        }
                        this.init_x = target_x;
                    }
                }
                this.updateMainScene(this.init_x, this.init_y);
            }
        }
    },

    selectedMainLandItem:function(item){
        if(!item)return;
        if(this.cur_main_land != null && this.cur_main_land == item)return;
        if(this.cur_main_land!=null){
            this.cur_main_land.setSelectedLand(false)
            this.cur_main_land = null;
        }
        this.cur_main_land = item;
        this.cur_main_land.setSelectedLand(true) ;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.map_layer){
            this.map_layer.node.stopAllActions()
        }
        if(this.map_wnd){
            this.map_wnd.stopAllActions();
        }

        if(this.spine){
            this.spine.setToSetupPose();
            this.spine.clearTracks();
            this.spine = null;
        }

        // WorldmapController:getInstance():addLockContainer(false)
        BattleController.getInstance().setUnlockChapterStatus(false)
        for(var i in this.land_list){
            this.land_list[i].DeleteMe();
        }
        this.land_list = [];
        this.ctrl.openWorldMapMainWindow(false,this.data);
    },
})