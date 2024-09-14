// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-07 10:59:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var EndlessAwardsItem = require("endless_awards_item_panel");
var CommonScrollView = require("common_scrollview");

var Endless_awardsPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_awards_panel");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var container = this.root_wnd.getChildByName("container");
        var rank_title = container.getChildByName("rank_title").getComponent(cc.Label);
        rank_title.string = Utils.TI18N("排名");
        var award_title = container.getChildByName("award_title").getComponent(cc.Label);
        award_title.string = Utils.TI18N("奖励");
    
        var scroll_container = container.getChildByName("scroll_container");
        var size = scroll_container.getContentSize();
        var setting = {
            item_class: EndlessAwardsItem,
            start_x: 4,
            space_x: 4,
            start_y: 0,
            space_y: 0,
            item_width: 614,
            item_height: 124,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(scroll_container, null, null, null, size, setting);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    setNodeVisible:function(status){
        if(this.root_wnd){
            this.root_wnd.active = status;
        }  
    },

    addToParent:function(){
        var tmp_list = Utils.deepCopy(Config.endless_data.data_rank_reward_data)
        for(var i in tmp_list){
            tmp_list[i].index = parseInt(i)+1;
        }
        this.scroll_view.setData(tmp_list);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.addToParent()
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
    },
})