// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-02 14:56:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var EquipmentCompRecordItem = require("equipment_comp_record_item");
var CommonScrollView = require("common_scrollview");
var ForgeHouseController = require("forgehouse_controller");

var Equipment_comp_recordWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "forgehouse_comp_record");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.ctrl = ForgeHouseController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/empty_bg/empty_label", this.root_wnd, cc.Label).string = Utils.TI18N("暂无合成记录，赶紧去合成吧");
        Utils.getNodeCompByPath("main_container/Image_2/Text_1_0", this.root_wnd, cc.Label).string = Utils.TI18N("确 定");
        Utils.getNodeCompByPath("main_container/btn_sure/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("确 定");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.empty_bg = this.seekChild("empty_bg");

        this.btn_sure = this.seekChild("btn_sure");

        var good_cons = this.seekChild("good_cons");
        var size = good_cons.getContentSize();
        var setting = {
            item_class: EquipmentCompRecordItem, // 单元类
            start_x: 10, // 第一个单元的X起点
            space_x: 0, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: -18, // y方向的间隔
            item_width: 651, // 单元的尺寸width
            item_height: 197, // 单元的尺寸height
            row: 0, // 行数，作用于水平滚动类型
            col: 1, // 列数，作用于垂直滚动类型
            // need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(good_cons, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        Utils.onTouchEnd(this.btn_sure, function() {
            this.ctrl.openEquipmentCompRecordWindow(false);
        }.bind(this), 1)

        this.addGlobalEvent(EventId.COMPOSITE_RECORD, function(data) {
            if (!data || Utils.next(data) == null) return
            if (Utils.next(data.logs) != null) {
                this.empty_bg.active = false;
            } else {
                this.empty_bg.active = true;
            }
            if (this.item_scrollview) {
                this.item_scrollview.setData(data.logs);
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function() {
        this.ctrl.send11082();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.ctrl.openEquipmentCompRecordWindow(false);
    },
})