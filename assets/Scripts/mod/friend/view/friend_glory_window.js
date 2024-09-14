// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     竖版个人荣誉
// <br/>Create: 2019-03-14 16:59:55
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var FriendController = require("friend_controller");
var PlayerHead = require("playerhead");
var CommonScrollView = require("common_scrollview");
var FriendGloryItem = require("friend_glory_item")

var Friend_gloryWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("friend", "friend_glory_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = FriendController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.main_panel = this.seekChild("main_panel");
        this.close_btn = this.seekChild("close_btn");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.title_container_nd = this.seekChild("title_container");
        this.title_lb = this.seekChild(this.title_container_nd, "title_label", cc.Label);
        this.title_lb.string = Utils.TI18N("个人荣誉");

        this.info_con_nd = this.seekChild("info_con");
        this.name_lb = this.seekChild(this.info_con_nd, "name", cc.Label);
        this.guild_lb = this.seekChild(this.info_con_nd, "guild", cc.Label);

        this.country_nd = this.seekChild(this.info_con_nd, "country");

        //头像
        if (this.head == null) {
            this.head = new PlayerHead();
            this.head.setParent(this.info_con_nd);
            this.head.show()
            this.head.setPosition(-227, 50);
        }

        this.vip_label_lb = this.seekChild(this.info_con_nd, "vip_label").getComponent("CusRichText");
        this.vip_label_lb.setNum(0);

        this.scrollCon = this.seekChild("scrollCon")
        var size = this.scrollCon.getContentSize()
        var list_size = cc.size(size.width, size.height - 10);
        var setting = {
            item_class: FriendGloryItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 2,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 554,               // 单元的尺寸width
            item_height: 94,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scrollCon, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, (function () {
                this.ctrl.openFriendGloryWindow(false);
                Utils.playButtonSound(2)
            }).bind(this));
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        this.data = data;
        this.updateData();
    },

    updateData: function () {
        if (this.data == null) return
        var data = this.data;
        this.name_lb.string = this.data.name;
        this.country_nd.x = this.name_lb.node.x + this.name_lb.node.width + 5;
        this.head.setHeadRes(this.data.face_id);
        if (this.data.gname != "") {
            this.guild_lb.string = this.data.gname;
        }

        //头像框
        var vo = gdata("avatar_data", "data_avatar", [data.avatar_bid]);
        if (vo) {
            var res_id = vo.res_id || 0;
            var res = PathTool.getHeadcircle(res_id);
            this.head.showBg(res, null, false, vo.offy)
        }

        this.head.setSex(this.data.sex, cc.v2(70, 4));
        this.vip_label_lb.setNum(this.data.vip_lev);

        var list = this.data.honor_list;
        list.sort(Utils.tableLowerSorter(["type"]));
        this.item_scrollview.setData(list);
    },

    close_inheritback: function () {
        this.ctrl.openFriendGloryWindow(false)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        if (this.head) {
            this.head.deleteMe();
            this.head = null;
        }
        this.ctrl.openFriendGloryWindow(false)
    },
})