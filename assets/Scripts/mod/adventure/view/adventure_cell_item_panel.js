// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-15 11:51:27
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");
var AdventureConst = require("adventure_const");
var AdventureController = require("adventure_controller");
var PlayerHead = require("playerhead");

var Adventure_cell_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_cell_item");
        this.ctrl = AdventureController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.cell_path = "ui_res/adventure/img/%s.png"
        this.evt_path = "ui_res/adventure/evt/%s.png"
        this.is_last_floor = false;       // 是否是最后一层
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container = this.root_wnd.getChildByName("container");
        this.background = this.container.getChildByName("background"); 
        this.cell = this.container.getChildByName("cell").getComponent(cc.Sprite);
        this.evt_container = this.container.getChildByName("evt_container");

        if(this.data){
            this.updateInfo();
        }
    },


    setVisible:function(status){
        this._super(status);
        
        if(status){
            this.updateEvtInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.container, function () {
            if(this.data && this.call_back){
                // 非下一关的over事件就不需要给点击回调了
                if(this.data){
                    if(this.data.config && this.data.status == AdventureConst.status.over){
                        if(this.data.config.evt_type != AdventureEvent.EventType.next && this.data.config.evt_type != AdventureEvent.EventType.shop){
                            return;
                        }
                    }
                }
                this.call_back(this)
            }
        }.bind(this), 1);
    },

    addCallBack:function(call_back){
        this.call_back = call_back;
    },

    setExtendData:function(is_update){
        this.is_update = is_update;
    },

    setData:function(data){
        this.data = data;
        if(this.root_wnd){
            this.updateInfo();
        }
    },

    updateInfo:function(){
        if(this.data){
            this.is_last_floor = false;
            var cell_key_str = Utils.getNorKey(this.data.lock, this.data.id, this.data.status, this.data.evt_id);
            if(this.cell_key_str == cell_key_str)return;
            this.cell_key_str  = cell_key_str;
    
            // 还原采集描述类
            this.setOtherDesc(false);
    
            // 层级问题
            if(this.cell_id != this.data.id){
                this.cell_id = this.data.id;
                // this:setvarZOrder(25 - this.data.id)
                // 引导需要
                // this.container:setName("guide_adventure_cell_"+this.data.id)
            }
            // -- 引导需要
            // if this.guide_evt_id ~= this.data.evt_id and this.data.evt_id ~= 0 then
            //     this.guide_evt_id  = this.data.evt_id
            //     this.container:setTag(this.data.evt_id)
            // end
    
            // 设置当前事件样式显示
            this.updateEvtInfo();
    
            // 地块的状态判断,以及资源的重载
            if(this.data.status == AdventureConst.status.open || this.data.status == AdventureConst.status.over){
                this.cell.node.active = false;
            }else if(this.data.config && this.data.config.evt_type == AdventureEvent.EventType.mysterious){
                this.cell.node.active = false;
            }else{
                this.createCellSytle();
            }
        }
    },

    // ==============================--
    // desc:创建地块样式
    // @return 
    // ==============================--
    createCellSytle:function(){
        if(this.data == null)return;
        var data = this.data;
        this.cell.node.active = true;
        var cell_res = cc.js.formatStr(this.cell_path, data.res_id);
        if(this.cell_res != cell_res){
            this.cell_res = cell_res;
            if(this.cell){
                this.loadRes(cell_res, function (sf_obj) {
                    this.cell.spriteFrame = sf_obj;
                }.bind(this));
                this.setCellStatus();
            }
        }else{
            this.setCellStatus();
        }
    },

    // ==============================--
    // desc:地块的状态,是暗调还是说亮起来可点
    // @return 
    // ==============================--
    setCellStatus:function(){
        if(this.data == null)return;
        if(this.cell_status == this.data.status)return;
        this.cell_status = this.data.status;
        if(this.data.status == AdventureConst.status.lock){
            this.cell.node.color = new cc.Color(115, 115, 115, 255);
        }else if(this.data.status == AdventureConst.status.can_open){
            this.cell.node.color = new cc.Color(255, 255, 255, 255);
        }
    },

    // ==============================--
    // desc:清掉数据资源
    // @return 
    // ==============================--
    clearEvtResources:function(){
        if(this.event_img){
            this.event_img.node.stopAllActions();
        }
        if(this.head){
            this.head.deleteMe();
        }
        this.head = null;

        if(this.head_node){
            this.head_node.stopAllActions();
        }
        this.head_node = null;
        
        if(this.event_model){
            if(this.event_model.setToSetupPose){
                this.event_model.setToSetupPose();
            }
            if(this.event_model.clearTracks){
                this.event_model.clearTracks();
            }

            if(this.event_model.node){
                this.event_model.node.removeAllChildren();
                this.event_model.node.removeFromParent();
            }
            this.event_model = null;
        }
        this.event_model_res = "";
    },

    // ==============================--
    // desc:事件的显示,加载不同事件资源
    // @return 
    // ==============================--
    updateEvtInfo:function(){
        if(this.data == null || !this.getVisible())return;
        var evt_config = this.data.evt_id >0?gdata("adventure_data","data_adventure_event",this.data.evt_id):null;
        this.data.config = evt_config;   // 储存配置
     
        // 事件数据不存在或者事件资源显示数据不存在
        if(evt_config == null || evt_config.res_id == null || evt_config.res_id[0] == null){
            this.clearEvtResources();
            return;
        }
        // 如果是下一层事件,需要判断是不是还有下一层,否则不需要显示
        if(evt_config.evt_type == AdventureEvent.EventType.next){
            var base_data = this.model.getAdventureBaseData();
            if(base_data == null || base_data.id == null){
                this.clearEvtResources() ;
                return;
            }
            var next_config = Config.adventure_data.data_floor_reward[base_data.id + 1];
            if(next_config == null && evt_config.evt_type == AdventureEvent.EventType.next){
                this.is_last_floor = true;
            }
        }
        // 其他事件处理
        if(this.data.status != AdventureConst.status.over || evt_config.evt_type == AdventureEvent.EventType.init 
        || evt_config.evt_type == AdventureEvent.EventType.next || evt_config.evt_type == AdventureEvent.EventType.block 
        || evt_config.evt_type == AdventureEvent.EventType.shop){
            this.createEvtShowInfo(evt_config);
        }else{
            this.clearEvtResources();   
        }
    },

    setOtherDesc:function(status, desc){
        if(!status){
            if(this.other_desc){
                this.other_desc.node.active = false;
            }
        }else{
            if(this.other_desc == null){
                this.other_desc = Utils.createLabel(24,new cc.Color(0xff,0xff,0xff, 0xff),new cc.Color(0x00,0x00,0x00, 0xff),71, 60,desc,this.container,null,cc.v2(0.5,0));
            }
            this.other_desc.string = desc;
            this.other_desc.node.active = true;
        }
    },

    // ==============================--
    // desc:创建事件显示效果
    // @evt_config:
    // @return 
    // ==============================--
    createEvtShowInfo:function(evt_config){
        if(evt_config == null)return;
        var res_data = evt_config.res_id[0];
        var res_type = res_data[0];    // 0.图片资源(如果是怪物或者boss事件的,就创建特效) 1.特效资源
        var res_id = res_data[1];  // 资源名字
        var is_shadow =(evt_config.shadow == 1);
        if(res_type == null || res_id == null)return;

        // 储存资源
        if(this.event_model_res == Utils.getNorKey(res_type, res_id))return;
        this.clearEvtResources();
        
        this.event_model_res = Utils.getNorKey(res_type, res_id);
        if(res_type == 2){
            var eff_node = new cc.Node();
            eff_node.setAnchorPoint(0.5,0.5)
            eff_node.setPosition(0, 5);
            this.evt_container.addChild(eff_node);
    
            this.event_model = eff_node.addComponent(sp.Skeleton);
            if(this.eff_time){
                gcore.Timer.del(this.eff_time);
            }
            this.eff_time = gcore.Timer.set(function () {
                var anima_path = PathTool.getSpinePath(res_id, "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.event_model.skeletonData = ske_data;
                    this.event_model.setAnimation(0, PlayerAction.action, true);
                }.bind(this));
            }.bind(this), 100, 1);

        }else{
            if(is_shadow == true){
                this.event_model = Utils.createImage(this.evt_container, null, 0, -33, cc.v2(0.5, 0.5), false);
                this.loadRes(PathTool.getUIIconPath("adventurewindow","adventurewindow_3"), function (sf_obj) {
                    this.event_model.spriteFrame = sf_obj;
                }.bind(this));

                this.head_node = new cc.Node();
                this.head_node.setAnchorPoint(0.5,0.5)
                this.head_node.setPosition(0, 0);
                this.event_model.node.addChild(this.head_node);

                var event_path = cc.js.formatStr(this.evt_path, res_id);
                if(this.ctrl.isMonster(evt_config.evt_type)){
                    if(this.head == null){
                        this.head = new PlayerHead();      
                        this.head.setFrameRes(event_path,1);
                        this.head.setPosition(0, 62);
                        this.head.setParent(this.head_node);
                        this.head.show();
                    }
                    CommonAction.breatheShineAction4(this.head_node);
                    this.head.setHeadRes(evt_config.face);
                }else{
                    this.event_img = Utils.createImage(this.event_model.node, null, 0, 66, cc.v2(0.5, 0.5), false);
                    CommonAction.breatheShineAction4(this.event_img.node);
                    if(this.event_img){
                        this.loadRes(event_path, function (sf_obj) {
                            this.event_img.spriteFrame = sf_obj;
                        }.bind(this));
                    }
                }
            }else{
                this.event_model = Utils.createImage(this.evt_container, null, 0, -31, cc.v2(0.5, 0), false);
                var event_path = cc.js.formatStr(this.evt_path, res_id);
                if(this.event_model){
                    this.loadRes(event_path, function (sf_obj) {
                        this.event_model.spriteFrame = sf_obj;
                    }.bind(this));
                }
            }
        }
    },

    // ==============================--
    // desc:摧毁BOSS雕像
    // @callback:
    // @action_name:
    // @return 
    // ==============================--
    changeBossEffectStatus:function(callback, action_name){
        if(this.is_in_playing == true)return;
        if(this.data == null || this.data.config == null)return;
        if(this.event_model == null)return;
        if(this.data.config.evt_type == AdventureEvent.EventType.mysterious){
            this.is_in_playing = true;
            this.event_model.setAnimation(0, action_name, false);
            Utils.delayRun(this.event_model.node, 1.5, function(){
                this.is_in_playing = false;
                callback(this.data.id)
            }.bind(this));
        }
    },

    // ==============================--
    // desc:获取事件图标,这个东西现在只有技能事件才需要,需要播放移动动作
    // @return 
    // ==============================--
    getEvtImg:function(){
        return this.event_img
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.eff_time){
            gcore.Timer.del(this.eff_time);
        }
        this.clearEvtResources();
    },
})