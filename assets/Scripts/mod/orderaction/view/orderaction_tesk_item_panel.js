// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     战令三期 任务itme
// <br/>Create: 2019-08-12 14:31:05
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StrongerController = require("stronger_controller");
var OrderactionController = require("orderaction_controller");

var Orderaction_tesk_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "tesk_item1");
        this.ctrl =  OrderactionController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.tab_name = [Utils.TI18N("每日"),Utils.TI18N("每周"),Utils.TI18N("每月")];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var main_container = this.root_wnd.getChildByName("main_container");
        this.btn_goto = main_container.getChildByName("btn_goto");
        var goto_lab = this.btn_goto.getChildByName("Text_3").getComponent(cc.Label);
        goto_lab.string = Utils.TI18N("前往");
        this.btn_goto.active = false;
        this.btn_get = main_container.getChildByName("btn_get");
        var get_lab = this.btn_get.getChildByName("Text_3").getComponent(cc.Label);
        get_lab.string = Utils.TI18N("领取");
        this.btn_get.active = false;
        this.spr_get = main_container.getChildByName("spr_get");
        this.spr_get.active = false;

        this.big_title_head = main_container.getChildByName("big_title_head").getComponent(cc.Label);
        this.big_title_head.string = "";
        this.big_title = main_container.getChildByName("big_title").getComponent(cc.Label);
        this.big_title.string = "";
        this.small_title = main_container.getChildByName("small_title").getComponent(cc.Label);
        this.small_title.string = "";

        if(!this.task_reward){
            this.task_reward = ItemsPool.getInstance().getItem("backpack_item");
            this.task_reward.initConfig(false, 0.7);
            this.task_reward.setParent(main_container);
            this.task_reward.setPosition(59, 57);
            this.task_reward.setDefaultTip();
            this.task_reward.show();
        }

        if(this.data){
            this.updateData(this.data);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_get, function () {
            if(this.data && this.data.goal_id){
                this.ctrl.send25302(this.data.goal_id);
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_goto, function () {
            if(this.data && this.data.show_icon != ""){
                this.ctrl.openOrderActionMainView(false);
                StrongerController.getInstance().clickCallBack(this.data.show_icon);
            }
        }.bind(this), 1);
    },

    updateData:function(data){
        if(this.task_reward){
            if(data.award && data.award[0]){
                this.task_reward.setData({bid:data.award[0][0], num:data.award[0][1]});
            }
        }

        if(data.tab_index){
            this.big_title_head.string = "【"+this.tab_name[data.tab_index-1]+"】";
        }

        this.big_title.string = data.title || "";
        var desc = data.desc || "";

        var value = Utils.getMoneyString(data.value || 0);
        var target_val = Utils.getMoneyString(data.target_val || 0);
        var str = cc.js.formatStr("%s (%s/%s)",desc,value,target_val);
        this.small_title.string = str;

        this.btn_goto.active = data.status == 0;
        this.btn_get.active = data.status == 1;
        this.spr_get.active = data.status == 2;
    },

    setData:function(data){
        if(!data)return;
        this.data = data;
        if(this.root_wnd){
            this.updateData(data);
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.task_reward){
            this.task_reward.deleteMe();
            this.task_reward = null;
        }
    },
})