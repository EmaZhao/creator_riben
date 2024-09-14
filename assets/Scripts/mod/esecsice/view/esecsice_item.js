// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-07 17:18:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var EsecsiceController = require("esecsice_controller");
var EsecsiceItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("esercise", "esercise_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.listReward = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.itemBG_node = this.main_container.getChildByName("itemBG");
        // this.itemBG_node.scale = 2;
        this.itemBG = this.itemBG_node.getComponent(cc.Sprite);
        this.redPoint = this.main_container.getChildByName("redPoint");
        this.redPoint.active = false;

        this.limitMask = this.main_container.getChildByName("limitMask");
        this.limitMask.zIndex = 10;
        this.textLimitLev = this.main_container.getChildByName("textLimitLev").getComponent(cc.Label);
        this.textLimitLev.string = "";
        this.textLimitLev.node.zIndex = 10;
        this.textLimitLev.node.active = false;
        this.textTimeStart = this.main_container.getChildByName("textTimeStart").getComponent(cc.Label);
        this.textTimeStart.string = "";
        this.textTimeStart.node.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.main_container.on(cc.Node.EventType.TOUCH_END, function(event){
            if(this.limitMask.active){
                // message(this.data.lock_desc);
                return;
            }
            EsecsiceController.getInstance().switchEcecsiceActivityView(this.data.goto_id);
        }, this);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if(!this.data){
            return;
        }

        this.main_container.name = "guide_activity_item_" + this.data.id;

        this.loadRes(PathTool.getActivityBig(this.data.pic_name), (function(resObject){
            this.itemBG.spriteFrame = resObject;
        }).bind(this));
        if(this.data.desc){
            this.textTimeStart.string = this.data.desc;
            this.textTimeStart.node.active = true;
        }
        if(this.data.is_open == 1){
            this.textLimitLev.string = this.data.lock_desc;
            var MainuiController = require("mainui_controller");
            var bool = MainuiController.getInstance().checkIsOpenByActivate(this.data.activate);
            if(bool){
                this.limitMask.active = false;
                this.textLimitLev.node.active = false;
            }else{
                this.limitMask.active = true;
                this.textLimitLev.node.active = true;
            }
        }else{
            this.limitMask.active = true;
            this.textLimitLev.node.active = true;
        }
        for(let i in this.data.val[0]){
            let bid = this.data.val[0][i];
            let item = this.listReward[i];
            if(!item){
                item = ItemsPool.getInstance().getItem("backpack_item");
                this.listReward[i] = item; 
                item.setParent(this.main_container);
                item.initConfig(null, 0.5, false, true);
            }
            item.setPosition(80 * i - 260, -40);
            item.setData(bid);
            item.show();
        }
        this.updateRedStatus();
    },

    // 设置显示数据
    setData:function(data){
        this.data = data;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    updateRedStatus:function(){
        if(this.data && this.redPoint){
            var red_status = false;
            var EsecsiceConst = require("esecsice_const");
            if(this.data.id == EsecsiceConst.execsice_index.endless){//日常副本
                var Stone_dungeonController = require("stone_dungeon_controller");
                red_status = Stone_dungeonController.getInstance().getModel().checkRedStatus()
            }else if(this.data.id == EsecsiceConst.execsice_index.stonedungeon){//无尽试炼
                var Endless_trailController = require("endless_trail_controller");
                red_status = Endless_trailController.getInstance().getModel().checkRedStatus();
            }else if(this.data.id == EsecsiceConst.execsice_index.honourfane){//神殿
                var PrimusController = require("primus_controller");
                red_status = PrimusController.getInstance().getModel().checkRedStatus();
            }else if(this.data.id == EsecsiceConst.execsice_index.heroexpedit){//远征
                var HeroExpeditController = require("heroexpedit_controller");
                red_status = HeroExpeditController.getInstance().getModel().checkRedStatus();
            }
            this.redPoint.active = red_status;
        }
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        for(let k in this.listReward){
            this.listReward[k].deleteMe();
        }
        this.listReward = null;
    },
})
