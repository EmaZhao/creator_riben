// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-29 09:50:07
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Ladder_award_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_award_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.size = cc.size(608,124);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container = this.seekChild("container");

        this.rank_label_lb = this.seekChild("rank_label",cc.Label);
        this.image = this.seekChild("image");
        this.good_con = this.seekChild("good_con");
        
        this.good_con_size = this.good_con.getContentSize();

        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },
})