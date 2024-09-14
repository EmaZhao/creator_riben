// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-20 20:59:54
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HallowsConst = require("hallows_const");
var HallowsController = require("hallows_controller");
var HallowsEvent = require("hallows_event");

var Hallows_preview_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_preview_item");
        this.hallows_status = HallowsConst.Status.close
        this.ctrl = HallowsController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container = this.root_wnd;
        this.hallows_select_node = this.root_wnd.getChildByName("hallows_select_node");
        this.hallows_select_sk    = this.seekChild("hallows_select_node", sp.Skeleton);

        this.hallows_pos_node = this.root_wnd.getChildByName("hallows_pos_node");
        this.hallows_pos_node.setScale(0.65)
        this.hallows_pos_sk    = this.seekChild("hallows_pos_node", sp.Skeleton);

        this.name_label = this.root_wnd.getChildByName("name_label").getComponent(cc.Label);;
        this.hallows_bg = this.root_wnd.getChildByName("bg");
    },

    setData:function( data ){
        this.data = data;
        if (this.root_wnd){
            this.updateData();
        }
        
        
    },

    updateData: function updateData() {
        if (this.data == null) return;
        var hallows_id = this.data.id;
        //引导需要
        this.container.name = "hallows_" + hallows_id;

        this.name_label.string = this.data.name;

        var action = PlayerAction.action_2;
      
        var cur_hallows_id = this.ctrl.getModel().getCurActivityHallowsId() // 当前进行中的神器id
        if(cur_hallows_id == hallows_id){
            this.hallows_status = HallowsConst.Status.underway;
            this.hallows_pos_node.color = new cc.Color(169,169,169,255);
            // setChildUnEnabled(true, this.hallows_model)
            
            var anima_path = PathTool.getSpinePath(this.data.effect, "action");
            this.loadRes(anima_path, function(ske_data) {
                this.hallows_pos_sk.skeletonData = ske_data;
                this.hallows_pos_sk.setAnimation(0, PlayerAction.action_1, true);
            }.bind(this));

            this.handleEffect(true)
        }else if(this.ctrl.getModel().getHallowsById(hallows_id)){
            this.hallows_status = HallowsConst.Status.open
            this.hallows_pos_node.color = new cc.Color(255,255,255,255);
            // setChildUnEnabled(false, this.hallows_model)
            var anima_path = PathTool.getSpinePath(this.data.effect, "action")
            this.loadRes(anima_path, function(ske_data) {
                this.hallows_pos_sk.skeletonData = ske_data;
                this.hallows_pos_sk.setAnimation(0, PlayerAction.action_2, true);
            }.bind(this));
        }else{
            this.hallows_status = HallowsConst.Status.close
            this.hallows_pos_node.color = new cc.Color(169,169,169,255);
            // setChildUnEnabled(true, this.hallows_model)
            var anima_path = PathTool.getSpinePath(this.data.effect, "action")
            this.loadRes(anima_path, function(ske_data) {
                this.hallows_pos_sk.skeletonData = ske_data;
                this.hallows_pos_sk.setAnimation(0, PlayerAction.action_1, true);
            }.bind(this));
        }
    },

    handleEffect:function(status){
        if(!status){
            if(this.hallows_select_sk){
                this.hallows_select_sk.setToSetupPose();
                this.hallows_select_sk.clearTracks();
            }
            if(this.hallows_pos_sk){
                this.hallows_pos_sk.setToSetupPose();
                this.hallows_pos_sk.clearTracks();
            }
        }else{
            
            
            var anima_path = PathTool.getSpinePath(Config.effect_data.data_effect_info[546], "action");
            this.loadRes(anima_path, function(ske_data) {
                this.hallows_select_sk.skeletonData = ske_data;
                this.hallows_select_sk.setAnimation(0, PlayerAction.action, true);
            }.bind(this));
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.container.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this._onClickContainer();
        }, this)
    },

    _onClickContainer:function(  ){
        if(this.hallows_status == HallowsConst.Status.close){
            message(Utils.TI18N("解锁上一神器后开启"));
        }else{
            //判断一下神器界面是否正在显示，没显示则打开它
            if(this.ctrl.getHallowsRoot()){
                gcore.GlobalEvent.fire(HallowsEvent.UndateHallowsInfoEvent, this.data.id);
            }else{
                this.ctrl.openHallowsMainWindow(true, this.data.id);   
            }
            this.ctrl.openHallowsPreviewWindow(false);
        }
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
        this.handleEffect(false);
    },
})