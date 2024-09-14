// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-24 16:55:57
// --------------------------------------------------------------------
var PlayerHead = require("playerhead");
var CommonScrollview = require('common_scrollview');
var LadderController = require("ladder_controller");

var PathTool = require("pathtool");
var Ladder_rankWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_rank_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.main_panel = this.seekChild("main_container");
        this.close_btn = this.seekChild("close_btn");

        let title_con = this.seekChild("title_con");
        let title_lb = this.seekChild(title_con, "title_label", cc.Label);
        title_lb.string = Utils.TI18N("排行榜");

        this.no_log_image_nd = this.seekChild(this.main_panel, "no_log_image");
        this.no_log_image_nd.active = false;

        this.rank_panel = this.seekChild("rank_panel");
        this.my_rank = this.seekChild(this.main_panel, "my_rank");
        let title = this.seekChild(this.my_rank, "title", cc.Label);
        title.string = Utils.TI18N("我的排名");

        this.no_rank_label_nd = this.seekChild(this.my_rank, "no_rank_label");
        this.no_rank_label_nd.active = false;
        this.my_rank_id_nd = this.seekChild(this.my_rank, "rank_id");
        this.my_name_lb = this.seekChild(this.my_rank, "my_name_label", cc.Label);
        this.my_attk_lb = this.seekChild(this.my_rank, "my_attk_label", cc.Label);
        this.my_guild_lb = this.seekChild(this.my_rank, "my_guild_label", cc.Label);
        this.best_rank_lb = this.seekChild(this.my_rank, "best_rank_label", cc.Label);

        this.my_head = new PlayerHead();
        this.my_head.setScale(0.8);
        this.my_head.setPosition(150, 66);
        this.my_head.setParent(this.my_rank);
        this.my_head.show();

        var bgSize = this.rank_panel.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height - 4);
        var setting = {
            item_class: LadderRankItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 612,               // 单元的尺寸width
            item_height: 112,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.order_scrollview = new CommonScrollView()
        this.order_scrollview.createScroll(this.rank_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openLadderRankWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLadderRankWindow(false);
        }.bind(this), 2)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {

    },
})