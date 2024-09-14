// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-07 11:23:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var CommonScrollView = require("common_scrollview");
var VoyageController = require("voyage_controller");
var VoyageEvent = require("voyage_event");
var BackPackConst = require("backpack_const");
var BackpackController = require("backpack_controller");
var VoyageOrderItem = require("voyage_order_item");
var VoyageConst = require("voyage_const");

var Voyage_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("voyage", "voyage_main_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.ctrl = VoyageController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.seekChild("main_container");

        this.top_bg_sp = this.seekChild(this.main_container, "top_bg", cc.Sprite);
        this.loadRes(PathTool.getBigBg("txt_cn_bigbg_22"), function (res) {
            this.top_bg_sp.spriteFrame = res
        }.bind(this))

        this.refresh_btn_nd = this.seekChild("refresh_btn");
        this.refresh_btn_lb = this.seekChild(this.refresh_btn_nd, "label", cc.Label);
        this.refresh_btn_img_sp = this.seekChild(this.refresh_btn_nd, "img", cc.Sprite);
        this.refresh_btn_img_sp.node.active = false;

        this.special_btn_nd = this.seekChild("special_btn");
        this.explain_btn_nd = this.seekChild("explain_btn");
        this.special_sk = this.seekChild(this.special_btn_nd, "special_sk", sp.Skeleton);

        this.progress_pb = this.seekChild(this.main_container, "progress", cc.ProgressBar);
        this.progress_pb.progress = 0;
        this.progress_value_lb = this.seekChild(this.main_container, "progress_value", cc.Label);

        this.no_order_image_nd = this.seekChild(this.main_container, "no_order_image");
        this.no_order_image_nd.active = false;

        //刷新道具消耗
        var cost_config = Config.shipping_data.data_const["refresh_cost"];
        this.cost_item_bid = cost_config.val[0][0];
        this.cost_item_num = cost_config.val[0][1];
        this.item_count_lb = this.seekChild(this.main_container, "item_count", cc.Label);

        var item_config = Utils.getItemConfig(this.cost_item_bid);

        var res_icon_sp = this.seekChild(this.main_container, "res_icon", cc.Sprite);
        var item_icon_sp = this.seekChild(this.main_container, "item_icon", cc.Sprite);
        this.loadRes(PathTool.getItemRes(7), function (sf_obj) {
            res_icon_sp.spriteFrame = sf_obj;
        }.bind(this))
        this.loadRes(PathTool.getItemRes(item_config.icon), function (sf_obj) {
            item_icon_sp.spriteFrame = sf_obj;
        }.bind(this))

        var order_list_nd = this.seekChild(this.main_container, "order_list")
        var bgSize = order_list_nd.getContentSize();
        var tab_size = cc.size(bgSize.width - 10, bgSize.height - 10);
        var setting = {
            item_class: VoyageOrderItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 631,               // 单元的尺寸width
            item_height: 171,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.order_scrollview = new CommonScrollView()
        this.order_scrollview.createScroll(order_list_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("main_container/no_order_image/label", this.root_wnd, cc.Label).string = Utils.TI18N("刷新获取新的订单");
        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("远航商人");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openVoyageMainWindow(false)
        }.bind(this), 2)

        this.explain_btn_nd.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var explain_config = Config.shipping_data.data_explain[1];
            var pos = event.touch.getLocation();
            if (explain_config)
                require("tips_controller").getInstance().showCommonTips(StringUtil.parse(explain_config.desc), pos);
        });

        this.special_btn_nd.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            this._onClickSpecialBtn(pos)
        }, this);
        Utils.onTouchEnd(this.refresh_btn_nd, function () {
            var is_first = this.model.getFirstFresh();
            var p_1 = RoleController.getInstance().getModel().checkPrivilegeStatus(3);
            var p_2 = RoleController.getInstance().getModel().checkPrivilegeStatus(2);
            if (is_first && !p_1 && !p_2) {
                var refresh_config = Config.shipping_data.data_refresh[this.role_vo.vip_lev];
                if (!refresh_config) return
                var free_times = this.model.getFreeTimes();
                var free_count = refresh_config.free_times;//免费刷新上限
                if (free_times >= free_count) {
                    this.ctrl.send23820();
                    var fun = function () {
                        require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.PRIVILEGE)
                        this.ctrl.openVoyageMainWindow(false);
                    }.bind(this)
                    var str = cc.js.formatStr(Utils.TI18N("获取远航特权，<color=#c92606>每日首次</c>钻石、刷新券刷新必出<color=#c92606>高品质</c>远航任务，完成可获高额奖励！！！"));
                    require("commonalert").show(str, Utils.TI18N("立即前往"), fun, Utils.TI18N("残忍拒绝"), null, 1)
                    return
                }
            }
            if (this.model.checkIsHaveHigherEpicOrder()) {
                var fun = function () {
                    this.ctrl.requestRefreshOrder();
                }.bind(this)
                var str = cc.js.formatStr(Utils.TI18N("有紫色以上的远航任务未接取，是否继续？"));
                require("commonalert").show(str, Utils.TI18N("确定"), fun, Utils.TI18N("取り消し"), null, 1)
            } else {
                this.ctrl.requestRefreshOrder();
            }

        }.bind(this), 1)

        //更新所有订单数据
        this.addGlobalEvent(VoyageEvent.UpdateVoyageDataEvent, function () {
            this.refreshOrderList()
            this.refreshBtnStatus()
        }, this)

        //删除订单
        this.addGlobalEvent(VoyageEvent.DeleteOrderDataEvent, function () {
            this.refreshOrderList()
        }, this)

        if (this.role_assets_event == null) {
            if (this.role_vo == null) {
                this.role_vo = RoleController.getInstance().getRoleVo();
            }
            this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                if (key == "energy") {
                    this.refreshProgressInfo();
                } else if (key == "vip_lev") {
                    this.refreshBtnStatus()
                }
            }, this)
        }

        //刷新道具数量更新
        this.addGlobalEvent(EventId.ADD_GOODS, function (bag_code, item_list) {
            if (bag_code != BackPackConst.Bag_Code.BACKPACK) return
            this.checkNeedUpdateItemNum(item_list);
        }, this)

        this.addGlobalEvent(EventId.MODIFY_GOODS_NUM, function (bag_code, item_list) {
            if (bag_code != BackPackConst.Bag_Code.BACKPACK) return
            this.checkNeedUpdateItemNum(item_list);
        }, this)

        this.addGlobalEvent(EventId.DELETE_GOODS, function (bag_code, item_list) {
            if (bag_code != BackPackConst.Bag_Code.BACKPACK) return
            this.checkNeedUpdateItemNum(item_list);
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function () {
        //判断本地是否有订单缓存数据，没有则请求
        if (this.model.checkIsHaveOrderData()) {
            this.refreshOrderList()
            this.refreshBtnStatus()
        } else {
            this.ctrl.requestVoyageInfo()
        }

        this.refreshProgressInfo()
        this.refreshItemNum()
        this.updateSpecialEffectStatus()
    },

    //更新所有订单列表
    refreshOrderList: function () {
        var order_data = this.model.getAllOrderList();
        if (!order_data || Utils.next(order_data) == null) {
            // this.no_order_image_nd.active = true;
            this.no_order_image_nd.setPosition(0, 0);
            if (this.no_order_image_sp == null) {
                this.no_order_image_sp = this.no_order_image_nd.getComponent(cc.Sprite);
                this.loadRes(PathTool.getBigBg("bigbg_3"), function (sp) {
                    this.no_order_image_sp.spriteFrame = sp;
                }.bind(this))
            }
            this.order_scrollview.setData([]);
        } else {
            //排序规则 已完成>可接取>进行中
            var temp_sort_index = {
                [VoyageConst.Order_Status.Finish]: 1,
                [VoyageConst.Order_Status.Unget]: 2,
                [VoyageConst.Order_Status.Underway]: 3,
            }
            var sortFunc = function (objA, objB) {
                var sort_index_a = temp_sort_index[objA.status];
                var sort_index_b = temp_sort_index[objB.status];
                //引导需要订单号为1的放在最前面
                if (objA.order_id == 1 && objA.status == VoyageConst.Order_Status.Unget && objB.order_id != 1) {
                    return -1
                } else if (objA.order_id != 1 && objB.order_id == 1 && objB.status == VoyageConst.Order_Status.Unget) {
                    return 1
                } else if (sort_index_a == sort_index_b) {
                    //未接取的按照品质排序，已接取和已完成的按照完成时间排序
                    if (objA.status == VoyageConst.Order_Status.Unget) {
                        return objB.config.quality - objA.config.quality
                    } else {
                        return objA.end_time - objB.end_time
                    }
                } else {
                    return sort_index_a - sort_index_b
                }
            }
            order_data.sort(sortFunc);

            for (var i in order_data) {
                order_data[i].index = i;
            }
            this.order_scrollview.setData(order_data);
            // this.no_order_image_nd.active = false;
            this.no_order_image_nd.setPosition(1000, 0);
        }
    },

    //更新刷新按钮状态
    refreshBtnStatus: function () {
        var refresh_config = Config.shipping_data.data_refresh[this.role_vo.vip_lev];
        if (!refresh_config) return
        var free_times = this.model.getFreeTimes();
        var free_count = refresh_config.free_times;//免费刷新上限
        if (free_times < free_count) {
            this.refresh_btn_lb.string = Utils.TI18N("免费刷新")
            this.refresh_btn_img_sp.node.active = false;
            return
        }

        //道具
        var count = BackpackController.getInstance().getModel().getItemNumByBid(this.cost_item_bid);
        if (count >= this.cost_item_num) {
            var item_config = Utils.getItemConfig(this.cost_item_bid);
            var res = PathTool.getItemRes(item_config.icon);
            this.refresh_btn_lb.string = cc.js.formatStr(Utils.TI18N("    %d 更新"), this.cost_item_num);
            this.loadRes(res, function (sf_obj) {
                this.refresh_btn_img_sp.spriteFrame = sf_obj;
            }.bind(this))
            this.refresh_btn_img_sp.node.active = true;
            return
        }
        //钻石
        var coin_times = this.model.getCoinTimes();
        var coin_count = refresh_config.all_times;
        if (coin_times < coin_count) {
            var bid = refresh_config.expend[0][0];
            var num = refresh_config.expend[0][1];
            var item_config = Utils.getItemConfig(bid);
            var res = PathTool.getItemRes(item_config.icon);
            this.refresh_btn_lb.string = cc.js.formatStr("    %d 更新", num);
            this.loadRes(res, function (sf_obj) {
                this.refresh_btn_img_sp.spriteFrame = sf_obj;
            }.bind(this))
            this.refresh_btn_img_sp.node.active = true;
            return
        }

        this.refresh_btn_lb.string = Utils.TI18N("刷新");
        this.refresh_btn_img_sp.node.active = false;
    },

    //更新冒险情报进度
    refreshProgressInfo: function () {
        if (this.role_vo) {
            var cur_energy = this.role_vo.energy;
            var max_energy = this.role_vo.energy_max;
            var percent = cur_energy / max_energy;
            this.progress_value_lb.string = cur_energy + "/" + max_energy;
            this.progress_pb.progress = percent;
        }
    },

    //更新刷新道具数量
    refreshItemNum: function () {
        var count = BackpackController.getInstance().getModel().getItemNumByBid(this.cost_item_bid);
        this.item_count_lb.string = count;
    },

    checkNeedUpdateItemNum: function (item_list) {
        if (item_list == null || Utils.next(item_list) == null) return
        for (var k in item_list) {
            var v = item_list[k];
            if (v.config) {
                var bid = v.config.id;
                if (this.cost_item_bid && bid == this.cost_item_bid) {
                    this.refreshItemNum()
                    this.refreshBtnStatus()
                    break
                }
            }
        }
    },

    //刷新特效显示状态
    updateSpecialEffectStatus: function () {
        var one_time_pri = RoleController.getInstance().getModel().checkPrivilegeStatus(2);
        var three_time_pri = RoleController.getInstance().getModel().checkPrivilegeStatus(3);
        if (one_time_pri || three_time_pri) {
            this.handleEffect(true);
        } else {
            this.handleEffect(false);
        }
    },

    //激活特权特效显示
    handleEffect: function (status) {
        if (status == false) {
            if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.clearTracks();
            }
        } else {
            if (this.special_sk) {
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(628))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action, true)
                }.bind(this))
            }
        }
    },

    _onClickSpecialBtn: function (pos) {
        var tips_str = "";
        for (var i = 1; i <= 2; i++) {
            var explain_config = Config.shipping_data.data_explain[i + 1];
            if (explain_config) {
                var status = RoleController.getInstance().getModel().checkPrivilegeStatus(i + 1);
                var str = StringUtil.parse(explain_config.desc || "");
                if (status) {
                    str = str + Utils.TI18N("<color=#249003>                                 （已激活）</c>")
                } else {
                    str = str + Utils.TI18N("<color=#c92606>                                 （未激活）</c>")
                }
                if (i == 1) {
                    tips_str = str;
                } else {
                    tips_str = tips_str + "\n\n\n" + str;
                }
            }
        }
        require("tips_controller").getInstance().showCommonTips(tips_str, cc.v2(pos.x, pos.y - 80))
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.order_scrollview) {
            this.order_scrollview.deleteMe();
            this.order_scrollview = null;
        }
        if (this.role_assets_event) {
            this.role_vo.unbind(this.role_assets_event);
            this.role_assets_event = null;
            this.role_vo = null;
        }
        this.handleEffect(false);
        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        this.ctrl.openVoyageMainWindow(false);
    },
})