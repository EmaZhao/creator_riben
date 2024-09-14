// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-27 14:37:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Arena_champion_report_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_report_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.desc_1_lb     = this.seekChild("desc_1", cc.Label);
        this.desc_2_lb     = this.seekChild("desc_2", cc.Label);
        this.desc_3_lb     = this.seekChild("desc_3", cc.Label);
        
        this.progress_1_pb = this.seekChild("progress_1", cc.ProgressBar);
        this.progress_2_pb = this.seekChild("progress_2", cc.ProgressBar);
        this.progress_3_pb = this.seekChild("progress_3", cc.ProgressBar);

        this.role_con_nd   = this.seekChild("role_con");

        var hero_item = this.hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        hero_item.setParent(this.role_con_nd);
        hero_item.setExtendData({scale: 0.8});
        hero_item.show();        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if (this.data)
            this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },

    setData: function(data) {
        // cc.log("DDDDDDDDDDDDDDDDDDDDDD");
        // cc.log(data);
        this.data = data;

        if (this.root_wnd)
            this.updateWidgets();
    },

    setExtendData: function(data) {
        this.total_hurt = data.total_hurt;
        this.total_behurt = data.total_behurt;
        this.total_curt = data.total_curt;   
    },

    updateWidgets: function() {
        var data = this.data;

        this.desc_1_lb.string = data.hurt;
        this.desc_2_lb.string = data.behurt;
        this.desc_3_lb.string = data.curt;

        if (this.total_hurt == 0) {
            this.progress_1_pb.progress = 0;
        } else {
            this.progress_1_pb.progress = data.hurt/this.total_hurt;
        }

        if (this.total_behurt == 0) {
            this.progress_2_pb.progress = 0;
        } else {
            this.progress_2_pb.progress = data.behurt/this.total_behurt;
        }

        if (this.total_curt == 0) {
            this.progress_3_pb.progress = 0;
        } else {
            this.progress_3_pb.progress = data.curt/this.total_curt; 
        }

        this.hero_item.setData(data);
    },
 })