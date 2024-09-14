// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     杂货店
// <br/>Create: 2019-03-07 21:30:19
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var MallConst = require("mall_const");
var MallEvent = require("mall_event");
var VarietyStoreItem = require("variety_store_item_panel");
var TimeTool = require("timetool");

var Variety_storeWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("mall", "varietystore_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.bg = this.background.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_72"), (function(resObject) {
            this.bg.spriteFrame = resObject;
        }).bind(this));

        var main_container = this.root_wnd.getChildByName("main_container");
        this.main_container = main_container

        this.image_1 = this.main_container.getChildByName("image_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_74"), (function(resObject) {
            this.image_1.spriteFrame = resObject;
        }).bind(this));

        this.image_2_node = this.main_container.getChildByName("image_2");
        this.image_2 = this.image_2_node.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_73"), (function(resObject) {
            this.image_2.spriteFrame = resObject;
        }).bind(this));

        this.image_3 = this.main_container.getChildByName("image_3").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_75"), (function(resObject) {
            this.image_3.spriteFrame = resObject;
        }).bind(this));

        this.image_4 = this.main_container.getChildByName("image_4").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_76"), (function(resObject) {
            this.image_4.spriteFrame = resObject;
        }).bind(this));

        this.refresh_label = main_container.getChildByName("refresh_label").getComponent(cc.Label);
        this.time_label = main_container.getChildByName("time_label").getComponent(cc.Label);
        this.time_label.string = "0:00:00";

        this.refresh_btn = main_container.getChildByName("refresh_btn");
        this.refresh_red_point = this.refresh_btn.getChildByName("red_point");
        this.refresh_btn_label = Utils.createRichLabel(26, new cc.Color(0xff, 0xff, 0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(0, 0), 30);
        this.refresh_btn.addChild(this.refresh_btn_label.node);
        this.close_btn = main_container.getChildByName("close_btn");

        var item_list = main_container.getChildByName("item_list");
        var bg_size = item_list.getContentSize();
        var scroll_view_size = cc.size(bg_size.width, bg_size.height + 50);
        var setting = {
            item_class: VarietyStoreItem, // 单元类
            start_x: 20, // 第一个单元的X起点
            space_x: 38, // x方向的间隔
            start_y: 30, // 第一个单元的Y起点
            space_y: 85, // y方向的间隔
            item_width: 158, // 单元的尺寸width
            item_height: 214, // 单元的尺寸height
            row: 0, // 行数，作用于水平滚动类型
            col: 3, // 列数，作用于垂直滚动类型
        }

        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(item_list, cc.v2(0, -40), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);
        // this.item_scrollview.setSwallowTouches(false)
        this.item_scrollview.setBounceEnabled(false);
        //Utils.getNodeCompByPath("main_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        Utils.onTouchEnd(this.close_btn, function() {
            this._onClickCloseBtn();
        }.bind(this), 2);

        Utils.onTouchEnd(this.refresh_btn, function() {
            this._onClickRefreshBtn();
        }.bind(this), 2);

        // 商店数据
        this.addGlobalEvent(MallEvent.Get_Buy_list, function(data) {
            if (data.type == MallConst.MallType.VarietyShop) {
                this.setData(data);
            }
        }.bind(this));

        // 刷新数据
        this.addGlobalEvent(MallEvent.Free_Refresh_Data, function(data) {
            if (data.type == MallConst.MallType.VarietyShop && data && this.data) {
                for (var i in data) {
                    this.data[i] = data[i];
                }
                this.updateRefreshInfo();
            }
        }.bind(this));

    },

    setData: function(data) {
        this.data = data || [];

        this.updateRefreshInfo();
        //  添加位置标识，引导需要
        if (data.item_list) {
            for (var i in data.item_list) {
                data.item_list[i].index = i;
            }
        }
        this.item_scrollview.setData(data.item_list || []);
    },

    updateRefreshInfo: function() {
        if (this.data) {
            // 总刷新次数
            var max_num_cfg = Config.exchange_data.data_shop_exchage_cost["maximum_number"];
            this.refresh_label.string = cc.js.formatStr(Utils.TI18N("刷新次数:%d/%d"), this.data.count, max_num_cfg.val);
            // 按钮上刷新文字
            var btn_str = "";
            var res = "";
            if (this.data.free_count > 0) {
                this.refresh_red_point.active = this.data.free_count == 5 ? true : false;
                var free_num_cfg = Config.exchange_data.data_shop_exchage_cost["max_free_times"]
                btn_str = cc.js.formatStr("<color=#ffffff><outline=2,color=#2B610D>更新(%d/%d)</outline></color>", this.data.free_count, free_num_cfg.val);
            } else {
                var refresh_cost_cfg = Config.exchange_data.data_shop_list[MallConst.MallType.VarietyShop];
                if (refresh_cost_cfg && refresh_cost_cfg.cost_list) {
                    var bid = refresh_cost_cfg.cost_list[0][0];
                    var num = refresh_cost_cfg.cost_list[0][1];
                    var item_config = Utils.getItemConfig(bid);
                    if (item_config) {
                        res = PathTool.getItemRes(item_config.icon)
                        btn_str = cc.js.formatStr(Utils.TI18N("<img src='%s'/><color=#ffffff><outline=2,color=#2B610D> %d 刷新</outline></color>"), item_config.icon, num)
                    }
                }
            }
            this.refresh_btn_label.string = btn_str;
            if (res) {
                this.loadRes(res, (function(resObject) {
                    this.refresh_btn_label.addSpriteFrame(resObject);
                }).bind(this));
            }

            if (this.data.refresh_time > 0) {
                var left_time = this.data.refresh_time - gcore.SmartSocket.getTime();
                if (left_time < 0) {
                    left_time = 0;
                    this.openRefreshTimer(false);
                } else {
                    this.openRefreshTimer(true);
                }
                this.time_label.string = TimeTool.getTimeFormat(left_time);
            } else {
                this.openRefreshTimer(false);
                this.time_label.string = "0:00:00";
            }
        }
    },

    openRefreshTimer: function(status) {
        if (status == true) {
            if (this.refresh_timer == null) {
                this.refresh_timer = gcore.Timer.set(function() {
                    if (this.data && this.data.refresh_time > 0) {
                        var left_time = this.data.refresh_time - gcore.SmartSocket.getTime();
                        if (left_time < 0) {
                            gcore.Timer.del(this.refresh_timer);
                            this.refresh_timer = null;
                        }
                        this.time_label.string = TimeTool.getTimeFormat(left_time);
                    } else {
                        this.time_label.string = "0:00:00";
                        gcore.Timer.del(this.refresh_timer);
                        this.refresh_timer = null;
                    }
                }.bind(this), 1, -1)
            }
        } else {
            if (this.refresh_timer != null) {
                gcore.Timer.del(this.refresh_timer);
                this.refresh_timer = null;
            }
        }
    },

    _onClickCloseBtn: function() {
        this.ctrl.openVarietyStoreWindows(false);
    },

    _onClickRefreshBtn: function() {
        if (this.data) {
            this.ctrl.sender13405(MallConst.MallType.VarietyShop);
        }
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.ctrl.sender13403(MallConst.MallType.VarietyShop);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.openRefreshTimer(false);
        this.ctrl.openVarietyStoreWindows(false);
    },
})