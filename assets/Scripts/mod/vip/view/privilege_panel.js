// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-27 19:29:52
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipController = require("vip_controller");
var PrivilegeItem = require("privilege_item");
var CommonScrollView = require("common_scrollview");
var VipEvent = require("vip_event");

var PrivilegePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "privilege_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = VipController.getInstance();
        this.model = this.ctrl.getModel();
        this.model.setPrivilegeOpenFlag(true)
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container_nd = this.seekChild("main_container");

        var scrollCon_nd = this.seekChild(this.main_container_nd, "scrollCon");
        var bgSize = scrollCon_nd.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height);
        var setting = {
            item_class: PrivilegeItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 636,               // 单元的尺寸width
            item_height: 170,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.tab_scrollview = new CommonScrollView()
        this.tab_scrollview.createScroll(scrollCon_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    
        this.setData();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(VipEvent.PRIVILEGE_INFO, function () {
            this.setData();
        }, this)
    },

    setData: function () {
        var privilege_list = [];
        for(var k in Config.privilege_data.data_privilege_data){
            privilege_list.push(gdata("privilege_data","data_privilege_data",[k]));
        }
        var sort_func = Utils.tableLowerSorter(["id"]);
        privilege_list.sort(sort_func);
        this.tab_scrollview.setData(privilege_list);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

    },

    setVisibleStatus:function(status){
        this.setVisible(status);
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if(this.tab_scrollview){
            this.tab_scrollview.deleteMe();
            this.tab_scrollview = null
        }
    },
})