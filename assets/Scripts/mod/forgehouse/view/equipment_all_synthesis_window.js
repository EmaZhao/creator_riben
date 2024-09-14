// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     一键合成
// <br/>Create: 2019-07-02 14:55:03
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ForgeHouseController = require("forgehouse_controller");
var CommonScrollView = require("common_scrollview");

var Forgehouse_all_synthesisWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "forgehouse_all_synthesis");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = ForgeHouseController.getInstance();

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.btn_sure = this.seekChild("btn_sure");
        this.btn_comp = this.seekChild("btn_comp");
        this.comp_coin_rt = this.seekChild("comp_coin", cc.RichText);

        var good_cons = this.seekChild("good_cons");
        var size = good_cons.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 18,                    // 第一个单元的X起点
            space_x: 10,                    // x方向的间隔
            start_y: 5,                    // 第一个单元的Y起点
            space_y: 8,                   // y方向的间隔
            item_width: 120,               // 单元的尺寸width
            item_height: 120,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 5,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(good_cons, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.btn_sure, function () {
            var send_id = this.ctrl.getModel().getCompSendID();
            if (send_id) {
                this.ctrl.send11081(send_id);
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_comp, function () {
            this.ctrl.openEquipmentAllSynthesisWindow(false);
        }.bind(this), 1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        this.data = data;
        if (!this.data || Utils.next(this.data) == null) return
        var item_config = Utils.getItemConfig(1);
        var res = PathTool.getItemRes(item_config.icon);
        var str = cc.js.formatStr(Utils.TI18N("是否消耗 <img src='%s'/>%s 以及材料合成以下装备"), item_config.icon, Utils.getMoneyString(this.data.coin));
        this.comp_coin_rt.string = str;
        this.loadRes(res, (function (resObject) {
            this.comp_coin_rt.addSpriteFrame(resObject);
        }).bind(this));

        var list = [];
        for (var i in this.data.list) {
            var v = this.data.list[i];
            var vo = {};
            vo.bid = v.bid;
            vo.num = v.num;
            list.push(vo);
        }

        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function () {
            var list = this.item_scrollview.getItemList();
            for (var k in list) {
                if (list[k])
                    list[k].setDefaultTip();
            }
        }.bind(this))
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.ctrl.openEquipmentAllSynthesisWindow(false);
    },
})