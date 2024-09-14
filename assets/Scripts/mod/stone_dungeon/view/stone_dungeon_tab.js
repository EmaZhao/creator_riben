// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-08 12:02:54
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MainuiController    = require("mainui_controller");

var StoneDungeonTab = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("stonedungeon", "stone_dungeon_tab");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.item_list = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.normal = this.root_wnd.getChildByName("normal").getComponent(cc.Sprite);
        this.title = this.root_wnd.getChildByName("title").getComponent(cc.Label);
        this.condite = this.root_wnd.getChildByName("condite");
        this.condite_img = this.condite.getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("activity","txt_cn_activity_3"), (function(resObject){
            this.condite_img.spriteFrame = resObject;
        }).bind(this));

        this.redpoint = this.root_wnd.getChildByName("redpoint");

        this.select = this.root_wnd.getChildByName("select");
        this.select_img = this.select.getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("activity","activity_7"), (function(resObject){
            this.select_img.spriteFrame = resObject;
        }).bind(this));

        this.select.active = false;
        
        this.effect = this.root_wnd.getChildByName("seleEff").getComponent(sp.Skeleton);
        var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(547), "action");
        this.loadRes(anima_path, function(ske_data) {
            this.effect.skeletonData = ske_data;
            this.effect.setAnimation(0, PlayerAction.action, true);
        }.bind(this));
        this.effect.node.active = false;
        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.root_wnd.on(cc.Node.EventType.TOUCH_START, function(event){
            Utils.playButtonSound(ButtonSound.Tab);
            var touches = event.getTouches();
            this.touch_began = touches[0].getLocation();
        },this);
        
        //当鼠标抬起的时候恢复状态
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function(event){
            var touches = event.getTouches();
            this.touch_end =  touches[0].getLocation();
            var is_click = true;
            if(this.touch_began!=null){
                is_click = Math.abs(this.touch_end.x - this.touch_began.x) <= 20 && Math.abs(this.touch_end.y - this.touch_began.y) <= 20
            }
            if(is_click == true){
                if(this.callback){
                    this.callback(this);
                }
            }
        },this);
    },

    setData:function(data){
        if(!data || Utils.next(data) == null)return;
        this.data = data;    
        this.updateInfo();
    },

    updateInfo:function(){
        if(!this.root_wnd)return;
        var res = PathTool.getUIIconPath("activity", "activity_tab_"+this.data.id, false, false)
        this.loadRes(res, (function(resObject){
            this.normal.spriteFrame = resObject;
        }).bind(this));
        this.title.string = Config.dungeon_stone_data.data_type_open[this.data.id].name;
        if(this.data.id == 1){
            this.setSelect(true);
        }
        var bool = MainuiController.getInstance().checkIsOpenByActivate(Config.dungeon_stone_data.data_type_open[this.data.id].activate);
        if(bool == true){
            this.condite.active = false;
        }else{
            this.condite.active = true;
        }
    },

    setSelect:function(visible){
        if(this.select && this.effect){
            this.select.active = visible;
            this.effect.node.active = visible;
        }
    },

    setSelectRedPoint:function(visible){
        if(this.redpoint){
            this.redpoint.active = visible;
        }
    },

    getData:function(){
        return this.data
    },

    addCallBack:function(value){
        this.callback = value;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        
    },

    
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.effect){
            this.effect.setToSetupPose();
            this.effect.clearTracks();
        }
        // self:removeAllChildren()
        // self:removeFromParent()
    },
})
