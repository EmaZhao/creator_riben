// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-25 10:03:05
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Battle_dramaEvent = require("battle_drama_event");
var BattleConst   = require("battle_const");
var MainuiController    = require("mainui_controller");
var BattleEvent = require("battle_event");
var BattleDramaMainPointItem = require("battle_drama_main_point_item");
var BaseRole = require("baserole");
var RoleController      = require("role_controller");


var Battle_drama_mapWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_map_windows");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("backgroundGroup");
        this.graphics = this.background.getComponent(cc.Graphics);
        this.background.scale = FIT_SCALE;

        var main_container = this.root_wnd.getChildByName("main_container");
        this.main_container = main_container
    
        this.map_layout = main_container.getChildByName("map_layout");
    
        this.pos_label = main_container.getChildByName("pos_label").getComponent(cc.Label);
        this.close_btn = main_container.getChildByName("close_btn");
        this.btn_world = main_container.getChildByName("btn_world");

        //  画网格线
        var space = 50
        var line_num_x = Math.floor(SCREEN_WIDTH/space/2)
        var line_num_y = Math.floor(SCREEN_HEIGHT/space/2)
        
        for(var i = 1;i<=line_num_y;i++){
            // gcore.Timer.set(function () {
                var beginPos = cc.v2(-this.background.width/2, i*space*2-this.background.height/2)
                var endPos = cc.v2(SCREEN_WIDTH-this.background.width/2, i*space*2-this.background.height/2)

                this.graphics.moveTo(beginPos.x,beginPos.y);

                this.graphics.lineTo(endPos.x,endPos.y);

            // }.bind(this), 4 * i/ 60, 1);
        }

        for(var i = 1;i<=line_num_x;i++){
            // gcore.Timer.set(function () {
                var beginPos = cc.v2(i*space*2-this.background.width/2, -this.background.height/2)
                var endPos = cc.v2(i*space*2-this.background.width/2, SCREEN_HEIGHT-this.background.height/2)

                this.graphics.moveTo(beginPos.x,beginPos.y);

                this.graphics.lineTo(endPos.x,endPos.y);

            // }.bind(this), 4 * i/ 60, 1);
        }
        this.graphics.stroke();
        //Utils.getNodeCompByPath("main_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this._onClickCloseBtn();
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_world, function () {
            this._onClickWorldBtn();
        }.bind(this), 1);

        //当用户点击的时候记录鼠标点击状态
        this.map_layout.on(cc.Node.EventType.TOUCH_START, function(event){
            this.map_layout.stopAllActions()
            return true
        },this);

        //只有当用户鼠标按下才能拖拽
        this.map_layout.on(cc.Node.EventType.TOUCH_MOVE, function(event){
            var touches = event.getTouches();
            this.last_point = touches[0].getDelta();
            this.moveMapLayer(this.last_point.x,this.last_point.y);
        },this);


        //当鼠标抬起的时候恢复状态
        this.map_layout.on(cc.Node.EventType.TOUCH_END, function(event){
            if(this.last_point){
                var pos_x = this.map_layout.x + this.last_point.x + 15;
                if(this.last_point.x < 0){
                    pos_x = this.map_layout.x + this.last_point.x - 15;
                }
                var return_pos = this.checkMapLayerPoint(pos_x);
                this.map_layout.stopAllActions();
                this.map_layout.runAction(cc.moveTo(0.4, return_pos));
            }
        },this);

        this.addGlobalEvent(Battle_dramaEvent.BattleDrama_Top_Update_Data, function(data) { 
            if(data.chapter_id != this.chapter_id){
                if(this.root_wnd){
                    this.drama_data = this.model.getDramaData();
                    this.chapter_id = this.drama_data.chapter_id;
                    this.updateMapImage();
                    this.updateMapPoint();
                    this.updateBaseInfo();
                    this.moveMapTag();
                }
            }else{
                if(this.root_wnd){
                    this.updateMapPointStatus();
                }
            }
        }.bind(this));

        this.addGlobalEvent(BattleEvent.MOVE_DRAMA_EVENT, function(combat_type) { 
            if(combat_type == BattleConst.Fight_Type.Darma && this.drama_data && MainuiController.getInstance().checkIsInDramaUIFight()){
                this.is_move_start = true
                this.moveMapTag(true)
                this.ctrl.send13020();
            }
        }.bind(this));

        this.addGlobalEvent(Battle_dramaEvent.UpdateDramaProgressDataEvent, function(val) { 
            var val_str = val/1000 + "%";
            this.progress_label.string = cc.js.formatStr(Utils.TI18N("已超过<color=5df660>%s</color>的玩家进度"), val_str);
        }.bind(this));
    
        this.addGlobalEvent(Battle_dramaEvent.BattleDrama_Top_Update_Data, function (data) {
            this.chapter_id = data.chapter_id;
            this.is_move_start = false;
            this.updateMapImage();
            this.updateMapPoint();
            this.updateBaseInfo();
            this.moveMapTag();
        }.bind(this));
    },

    moveMapLayer:function( x, y ){
        x = this.map_layout.x + x;
        y = this.map_layout.y + y;
        var return_pos = this.checkMapLayerPoint(x,y);
        this.map_layout.setPosition(return_pos.x,return_pos.y);
    },

    checkMapLayerPoint:function( x, y ){
        var map_layout_size = this.map_layout.getContentSize();
        if(x > 0){
            x = 0;    
        }else if(x < (SCREEN_WIDTH-map_layout_size.width)){
            x = SCREEN_WIDTH-map_layout_size.width
        }
        return cc.v2(x, 0);
    },

    _onClickCloseBtn:function(  ){
        this.ctrl.openBattleDramaMapWindows(false);
    },

    _onClickWorldBtn:function(  ){
        var WorldmapController      = require("worldmap_controller");
        WorldmapController.getInstance().openWorldMapMainWindow(true)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(chapter_id){
        this.drama_data = this.model.getDramaData();
        if(this.drama_data && Utils.next(this.drama_data)!=null){
            this.chapter_id = chapter_id || this.drama_data.chapter_id;
            this.updateMapImage();
            this.updateMapPoint();
            this.updateBaseInfo();
            this.ctrl.send13020();
        }
    },

    // 更新基础信息
    updateBaseInfo:function(  ){
        if(this.drama_data){
            var drama_config = gdata("dungeon_data", "data_drama_dungeon_info", this.drama_data.dun_id);
            if(drama_config){
                this.pos_label.string = cc.js.formatStr(Utils.TI18N("当前关卡:%s"), drama_config.name);
            }
        }
    },

    //  更新地图资源
    updateMapImage:function(  ){
        var _config = Config.dungeon_data.data_drama_world_info[this.drama_data.mode];
        if(_config && _config[this.chapter_id]){
            var map_id =_config[this.chapter_id].map_id;

            var map_bg_res = PathTool.getBattleSceneRes(cc.js.formatStr("%s/blayer/big_map", map_id), false);
            if(!this.map_bg){
                this.map_bg = Utils.createImage(this.map_layout,null, 0, 130, cc.v2(0, 0));
                this.map_bg.type = cc.Sprite.Type.SIMPLE;
                this.map_bg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                this.map_bg.node.setContentSize(cc.size(1024,1024));
            }
            this.loadRes(map_bg_res, (function(resObject){
                this.map_bg.spriteFrame = resObject;
                var map_bg_size = this.map_bg.node.getContentSize();
                this.map_layout.setContentSize(cc.size(map_bg_size.width,1280));
            }).bind(this));
        }
    },

    //  更新地图节点
    updateMapPoint:function(  ){
        if(this.main_point_list && Utils.next(this.main_point_list || []) != null){
            for(var i in this.main_point_list){
                if(this.main_point_list[i]){
                    this.main_point_list[i].clearInfo();
                    this.main_point_list[i].DeleteMe();
                }
            }
        }
        this.main_point_list = [];
        var dun_data = this.model.getInitDungeonList();
        if(dun_data){
            var item = null;
            var createNextNum = 0;
            for(var i in dun_data){
                var v = dun_data[i];
                
                v.v_data = this.model.getCurDunInfoByID(v.info_data.id);
                var isCreate = false;
                if(v.v_data.status>0){
                    isCreate = true;
                }else if(createNextNum<=0){
                    createNextNum = 1;
                    isCreate = true;
                }
                if(isCreate){
                    Utils.delayRun(this.main_container,4 * i/40,function (v){
                        if(!this.main_point_list[v.info_data.id]){
                            item = new BattleDramaMainPointItem();
                            this.main_point_list[v.info_data.id] = item;
                            if(this.map_layout){
                                this.map_layout.addChild(item.root_wnd, 98);
                            }
                        }
                        item = this.main_point_list[v.info_data.id];
                        if(item){
                            item.setPosition(v.info_data.pos[0], v.info_data.pos[1]+130);
                            item.setData(v);
                        }
                    }.bind(this,v));
                }
            }
        }

        if(!this.cur_tag_container){
            this.cur_tag_container = new cc.Node();
            this.cur_tag_container.setContentSize(cc.size(50, 50));
            this.cur_tag_container.setAnchorPoint(cc.v2(0.5, 0.5));
            this.map_layout.addChild(this.cur_tag_container, 99);
            this.createRole(PlayerAction.battle_stand)
        }

        this.updateMapPointStatus();
    },

    createRole:function( action_name ){
        if(this.spine_model){
            this.spine_model.deleteMe();
            this.spine_model = null;
        }

        if(!this.spine_model){
            this.cur_action_name = action_name
            var look_id = RoleController.getInstance().getRoleVo().look_id;
            var res_id = "110401" // 默认显示该模型
            res_id = look_id || res_id;
            this.spine_model = new BaseRole();
            this.spine_model.setParent(this.cur_tag_container);
            this.spine_model.setData(BaseRole.type.role, res_id, action_name, true, 0.7);
            if(this.cur_tag_container.getChildByName("effect")){
              this.cur_tag_container.getChildByName("effect").active = false;
            }
            if(this.spine_model.node){
                this.spine_model.node.scaleX = 0.7 * this.getDir();
                this.spine_model.node.setPosition(this.cur_tag_container.getContentSize().width / 2, -15);
            }
            var height = this.spine_model.node.getBoundingBox().height || 90;

            if(!this.cur_effect){
                var node = new cc.Node();
                node.setContentSize(cc.size(25, 130))
                node.setAnchorPoint(0.5,0.5)
                node.setPosition(25,height);
                this.cur_tag_container.addChild(node);
    
                this.cur_effect = node.addComponent(sp.Skeleton);
                var anima_path = PathTool.getSpinePath(Config.effect_data.data_effect_info[105], "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.cur_effect.skeletonData = ske_data;
                    this.cur_effect.setAnimation(0, PlayerAction.action, true);
                }.bind(this));
            }
            

            if(!this.progress_bg){
                this.progress_bg = Utils.createImage(this.cur_tag_container,null,this.cur_tag_container.getContentSize().width / 2, -35,cc.v2(0.5, 0.5));
                this.progress_bg.node.scaleX = 9;
                this.loadRes(PathTool.getUIIconPath("common", "Shadow_2_1"), (function(resObject){
                    this.progress_bg.spriteFrame = resObject;
                }).bind(this));
            }

            if(!this.progress_label){
                this.progress_label = Utils.createRichLabel(16, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(this.cur_tag_container.getContentSize().width / 2, -35),30,500);
                this.cur_tag_container.addChild(this.progress_label.node);
                this.progress_label.string = Utils.TI18N("已超过<color=5df660>?</color>的玩家进度");
            }
        }
    },
        
   

    getDir:function(){
        var scale = 1;
        var item = this.main_point_list[this.drama_data.dun_id];
        if(item){
            var max_item = this.main_point_list[this.drama_data.max_dun_id];
            var cur_x = item.getPositionX();
            var max_x = 0;
            if(max_item){
                max_x = max_item.getPositionX();
            }
            if(cur_x > max_x){
                scale = 1;
            }else{
                scale = -1;
            }
        }
        return scale
    },

    
    updateMapPointStatus:function(){
        this.drama_data = this.model.getDramaData();
        if(this.drama_data){
            var v_data = this.model.getCurDunInfoByID(this.drama_data.dun_id);
            var config = gdata("dungeon_data", "data_drama_dungeon_info", this.drama_data.dun_id);
            if(config){
                if(this.main_point_list && this.main_point_list[this.drama_data.dun_id]){
                    var item = this.main_point_list[this.drama_data.dun_id];
                    var is_big = config.is_big;
                    item.updateStatus(v_data.status, is_big);
                }

                if(!this.is_move_start){
                    this.moveMapTag();
                    this.is_move_start = true;
                }
            }
        }
    },

    //  移动角色形象
    moveMapTag:function( is_start ){
        if(this.drama_data){
            var info_config = gdata("dungeon_data", "data_drama_dungeon_info", this.drama_data.dun_id);
            if(info_config){
                var cur_main_point = info_config.pos;
                if(cur_main_point){
                    if(!is_start){
                        this.cur_tag_container.setPosition(cur_main_point[0]-50 / 2, cur_main_point[1]+140);
                    }else{
                        this.cur_tag_container.runAction(cc.sequence(cc.delayTime(0.1),cc.spawn(cc.callFunc(function(){
                            this.createRole(PlayerAction.run);
                        }.bind(this)),cc.moveTo(0.5, cc.v2(cur_main_point[0]-50 / 2, cur_main_point[1]+140))),cc.callFunc(function (){
                            this.createRole(PlayerAction.battle_stand);
                        }.bind(this))))
                    }
                }
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.main_point_list){
            for(var i in this.main_point_list){
                if(this.main_point_list[i]){
                    this.main_point_list[i].DeleteMe();
                }
            }
        }

        if(this.spine_model){
            this.spine_model.deleteMe();
            this.spine_model = null;
        }

        if(this.cur_effect){
            this.cur_effect.setToSetupPose();
            this.cur_effect.clearTracks();
            this.cur_effect = null;
        }
	    this.ctrl.openBattleDramaMapWindows(false);
    },
})