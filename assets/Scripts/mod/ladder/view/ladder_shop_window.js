// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-24 16:56:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var CommonScrollView = require("common_scrollview");
var MallItem = require("mall_item");
var MallController = require("mall_controller");
var MallConst = require("mall_const");
var LadderController = require("ladder_controller");
var MallEvent = require("mall_event");

var Ladder_shopWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_shop_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        if (this.background) {
            this.background.scale = FIT_SCALE;
        }
        this.container = this.seekChild("container");

        let win_title = this.seekChild(this.container, "win_title", cc.Label);
        win_title.string = Utils.TI18N("积分商店");

        this.close_btn = this.seekChild("close_btn");
        this.list_panel = this.seekChild("list_panel");
        this.res_label = this.seekChild("res_label", cc.Label);
        this.res_label.string = this.role_vo.sky_coin;

        var bgSize = this.list_panel.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height);
        var setting = {
            item_class: MallItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 306,               // 单元的尺寸width
            item_height: 143,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 2,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scroll_view = new CommonScrollView()
        this.item_scroll_view.createScroll(this.list_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openLadderShopWindow(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLadderShopWindow(false);
        }.bind(this), 2)

        this.addGlobalEvent(MallEvent.Open_View_Event, function (data) {
            let list = this.getConfig(data);
            this.item_scroll_view.setData(list, function (cell) {
                MallController.getInstance().openMallBuyWindow(true, cell.getData());
            }.bind(this))
        }, this)

        if (this.role_vo) {
            if (this.role_assets_event == null) {
                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (key == "sky_coin") {
                        this.res_label.string = value;
                    }
                }.bind(this))
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        MallController.getInstance().sender13401(MallConst.MallType.Ladder);
    },

    getConfig: function (data) {
        let item_list = [];
        let config = Config.exchange_data.data_shop_exchage_ladder;
        if (config) {
            let list = Utils.deepCopy(data.item_list);
            for (let a in config) {
                let j = config[a];
                if (list && Utils.next(list || {}) != null) {
                    for (let k in list) { //已经买过的限购物品
                        let v = list[k];
                        if (j.id == v.item_id) {
                            if (v.ext[0].val != null) {       //不管是什么限购 赋值已购买次数就好了。。
                                j.has_buy = v.ext[0].val;
                                list.splice(k, 1);
                            }
                        } else {
                            j.has_buy = 0;
                        }
                    }
                } else {
                    j.has_buy = 0;
                }
                item_list.push(j);
            }
        }
        let func = function (a, b) {
            if (a.limit_count && a.limit_count > 0 && a.has_buy >= a.limit_count && (!b.limit_count || b.limit_count == 0 || b.has_buy < b.limit_count)) {
                return 1
            } else if (b.limit_count && b.limit_count > 0 && b.has_buy >= b.limit_count && (!a.limit_count || a.limit_count == 0 || a.has_buy < a.limit_count)) {
                return -1
            } else {
                return a.order - b.order
            }
        }
        item_list.sort(func);
        return item_list
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.item_scroll_view) {
            this.item_scroll_view.deleteMe();
            this.item_scroll_view = null;
        }
        if (this.role_vo != null) {
            if (this.role_assets_event) {
                this.role_vo.unbind(this.role_assets_event);
                this.role_assets_event = null
            }
        }
        this.ctrl.openLadderShopWindow(false);
    },
})