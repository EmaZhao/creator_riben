// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-29 14:54:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var InvitecodeFriendItem = require("invitecode_friend_item");
var InviteCodeEvent = require("invitecode_event");
var CommonScrollView = require("common_scrollview");

var Invitecode_friendPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("invitecode", "invitecode_friend_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("invitecode_controller").getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        this.empty_bg_sp = this.seekChild("empty_bg", cc.Sprite);
        this.empty_bg_sp.node.active = false;

        var good_cons = this.seekChild(this.main_container, "good_cons")
        var bgSize = good_cons.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height);
        var setting = {
            item_class: InvitecodeFriendItem,      // 单元类
            start_x: 16,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 3,                   // y方向的间隔
            item_width: 690,               // 单元的尺寸width
            item_height: 117,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.order_scrollview = new CommonScrollView()
        this.order_scrollview.createScroll(good_cons, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(InviteCodeEvent.InviteCode_BindRole_Updata_Event, function () {
            if (this.empty_bg_sp.node) {
                this.empty_bg_sp.node.active = false;
            }
            var list = this.ctrl.getModel().getAlreadyFriendData();
            if (this.order_scrollview) {
                this.order_scrollview.setData(list);
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        //初始化好友
        this.setFriendList();
    },

    setFriendList: function () {
        if (this.order_scrollview) {
            var list = this.ctrl.getModel().getAlreadyFriendData();
            if (list.length == 0) {
                this.empty_bg_sp.node.active = true;
                this.loadRes(PathTool.getUIIconPath("bigbg", "bigbg_3"), function (sp) {
                    this.empty_bg_sp.spriteFrame = sp;
                }.bind(this))
            } else {
                this.empty_bg_sp.node.active = false;
                this.order_scrollview.setData(list);
            }
        }
    },

    setVisibleStatus: function (bool) {
        this.setVisible(bool)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.order_scrollview) {
            this.order_scrollview.deleteMe();
            this.order_scrollview = null;
        }
    },
})