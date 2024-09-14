// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-20 20:59:54
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HallowsController = require("hallows_controller");
var TaskController = require("task_controller");

var Hallows_task_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_task_item");
        this.is_completed = false
        this.ctrl = HallowsController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.background = this.root_wnd.getChildByName("background").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("hallows","hallows_1002"), (function(resObject){
            this.background.spriteFrame = resObject;
        }).bind(this));

        this.finish_icon = this.root_wnd.getChildByName("finish_icon")

        this.finish_icon_img = this.finish_icon.getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1000"), (function(resObject){
            this.finish_icon_img.spriteFrame = resObject;
        }).bind(this));

        this.get_btn = this.root_wnd.getChildByName("get_btn");
		var get_title = this.get_btn.getChildByName("label").getComponent(cc.Label);
        get_title.string = Utils.TI18N("领取");

		this.goto_btn = this.root_wnd.getChildByName("goto_btn");
        var goto_title = this.goto_btn.getChildByName("label").getComponent(cc.Label);
        goto_title.string = Utils.TI18N("前往");

		

		this.backpack_item = ItemsPool.getInstance().getItem("backpack_item");
        this.backpack_item.setParent(this.root_wnd);
        this.backpack_item.setPosition(-103.5, -20);
        this.backpack_item.initConfig(false, 0.7, false, true);
        this.backpack_item.show();
    
        this.task_desc = this.root_wnd.getChildByName("title_label").getComponent(cc.RichText);
        
    },

    setData:function( data ){
        this.data = data;
        if (this.root_wnd){
            this.updateData();
        }
        
        
    },

    updateData: function updateData() {
        if (this.data == null) return;
        
       
		// 引导需要
		// self.get_btn:setName("get_btn_" .. data.id)
        // self.goto_btn:setName("goto_btn_" .. data.id)
        
        var config = gdata("hallows_data","data_task",this.data.id);

        this.get_btn.name = "get_btn_" + this.data.id;
        this.goto_btn.name = "goto_btn_" + this.data.id;

        if(config){
            this.task_desc.string = cc.js.formatStr("%s(%s/%s)", config.desc, this.data.value || 0, this.data.target_val || 0);
            var item_list = config.items;
            //取出第一个物品
            if(item_list && item_list[0]){
                var itemVo = {bid:item_list[0][0], num:item_list[0][1]};
                this.backpack_item.setData(itemVo)
            }
            this.config = config;
        }

        this.goto_btn.active = false;
        this.get_btn.active = false;
        this.finish_icon.active = false;

        if(this.data.finish == 0){
            this.goto_btn.active = true;
        }else if(this.data.finish == 1){
            this.get_btn.active = true;
            Utils.addRedPointToNodeByStatus(this.get_btn, true, 5, 5)
        }else if(this.data.finish == 2){
            this.finish_icon.active = true;
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.get_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(this.data && this.config){
                this.ctrl.requestSubmitHallowsTask(this.data.id);
            }
        }, this)

        this.goto_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(this.data && this.config){
                TaskController.getInstance().gotoTagertFun(this.config.progress[0], this.config.extra);
                // this.ctrl.openHallowsMainWindow(false)
            }
        }, this)

        
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.updateData();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.backpack_item){
            this.backpack_item.deleteMe();
        }
        this.backpack_item = null;
		
    },
})