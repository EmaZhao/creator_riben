// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 20:34:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var CommonScrollView = require("common_scrollview");
var PlotHistoryItem = require("plotHistory_item");
var SoundManager = require("soundmanager");

var Hero_main_plotHistory_panel= cc.Class({
    extends: BaseView,
    ctor: function () {
        const prefabName = window.IS_PC ? "hero_main_plotHistory_pc_panel" : "hero_main_plotHistory_panel";
        this.prefabPath = PathTool.getPrefabPath("hero", prefabName) ;
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack() {
          if(window.IS_PC) {
            this.root_wnd.x = -2200 * 0.5;
        }
        this.panel = this.seekChild("panel");
        this.close_btn = this.seekChild("closeBtn");
        this.name_label = this.seekChild("name_label", cc.Label);
        this.scrollView = this.seekChild("scrollview");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent () {
        Utils.onTouchEnd(this.close_btn, ()=> {
            this.ctrl.openHeroPlotHistoryPanel(false);
        }, 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd (data) {
        const name = Config.partner_data.data_partner_base[data.hero_id].name;
        this.name_label.string = name;

        let scroll_view_size = null;
        let setting = null;
        if(window.IS_PC) {
            scroll_view_size = cc.size(1050, 520);
            setting = {
                item_class: PlotHistoryItem,      // 单元类
                start_x: 0,
                space_x: 0,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 10,                   // y方向的间隔
                item_width: 1050,               // 单元的尺寸width
                item_height: 143,              // 单元的尺寸height
                row: 0,                        // 行数，作用于水平滚动类型
                col: 1,                        // 列数，作用于垂直滚动类型
            }
        } else {
            scroll_view_size = cc.size(400, 1050);
            setting = {
                item_class: PlotHistoryItem,      // 单元类
                start_x: 0,
                space_x: 10,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 143,               // 单元的尺寸width
                item_height: 1050,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 0,                        // 列数，作用于垂直滚动类型
            }
        }
        this.item_scrollview = new CommonScrollView();
        if(window.IS_PC) {
            this.item_scrollview.createScroll(this.scrollView, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5));
        } else {
            this.item_scrollview.createScroll(this.scrollView, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.bottom, scroll_view_size, setting, cc.v2(0.5, 0.5));
        }
        const plotList = data.historyList.slice(0);
        this.item_scrollview.setData(plotList.reverse(), ()=> { });
    },
    
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack () {
        SoundManager.getInstance().stopPlotHeroVoice();
        this.ctrl.openHeroPlotHistoryPanel(false);
    },
})