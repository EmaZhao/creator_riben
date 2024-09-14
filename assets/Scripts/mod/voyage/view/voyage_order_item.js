// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-07 15:49:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VoyageController = require("voyage_controller");
var CommonScrollView = require("common_scrollview");
var VoyageConst = require("voyage_const");
var TimeTool = require("timetool")
var VoyageEvent = require("voyage_event");
var GuideEvent = require("guide_event");

var Voyage_order_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("voyage", "voyage_order_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = VoyageController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("container");
        this.rarity_image_sp = this.seekChild(this.container, "rarity_image", cc.Sprite);
        this.order_name_lb = this.seekChild(this.container, "order_name", cc.Label);
        // this.order_name_lo = this.seekChild(this.container, "order_name", cc.LabelOutline);

        this.get_btn_nd = this.seekChild(this.container, "get_btn");
        this.get_btn_lb = this.seekChild(this.get_btn_nd, "label", cc.Label);
        this.get_btn_sp = this.seekChild(this.get_btn_nd, "img", cc.Sprite);
        this.get_btn_sp.node.active = false;
        // this.btn_sp = this.seekChild(this.container, "get_btn", cc.Sprite);

        this.progress_bg_nd = this.seekChild(this.container, "progress_bg");
        this.progress_pb = this.seekChild(this.progress_bg_nd, "progress", cc.ProgressBar);
        this.progress_value_lb = this.seekChild(this.progress_bg_nd, "progress_value", cc.Label)

        this.special_sk = this.seekChild("effect").getComponent(sp.Skeleton);

        var goods_list = this.seekChild(this.container, "goods_list")
        var bgSize = goods_list.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height);
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 20,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BackPackItem.Width * 0.7,               // 单元的尺寸width
            item_height: BackPackItem.Height * 0.7,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                        // 列数，作用于垂直滚动类型
            scale: 0.7
        }
        this.expend_label_rt = this.seekChild(this.container, "expend_label", cc.RichText);
        this.good_scrollview = new CommonScrollView()
        this.good_scrollview.createScroll(goods_list, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.get_btn_nd, function () {
            if (this.data) {
                if (this.data.status == VoyageConst.Order_Status.Unget) {
                    this.ctrl.openVoyageDispatchWindow(true, this.data)
                } else if (this.data.status == VoyageConst.Order_Status.Underway) {
                    this.ctrl.requestFinishOrder(this.data.order_id, 1)
                } else if (this.data.status == VoyageConst.Order_Status.Finish) {
                    this.ctrl.requestFinishOrder(this.data.order_id, 0)
                }
                if (window.TASK_TIPS)
                    gcore.GlobalEvent.fire(GuideEvent.TaskNextStep, "get_btn_1");//任务引导用到
            }
        }.bind(this), 2)


        //远航活动开启/关闭时价格刷新
        this.addGlobalEvent(VoyageEvent.UpdateActivityStatusEvent, function () {
            this.refreshOrderBtnStatus();
        }, this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        if (this.update_self_event == null) {
            this.update_self_event = this.data.bind(VoyageEvent.UpdateOrderDataEvent, function () {
                this.refreshOrderInfo();
            }, this)
        }
        this.handleEffect(false);

        this.refreshOrderInfo();
    },

    refreshOrderInfo: function () {
        if (!this.data) return
        var config = this.data.config;
        if (!config || Utils.next(config) == null) return
        this.config = config;

        this.get_btn_nd.name = "get_btn_" + (this.tmp_index + 1);

        //稀有度背景
        var rarity_res = PathTool.getUIIconPath("voyage", VoyageConst.Order_Rarity_Res[config.quality]);
        this.loadRes(rarity_res, function (sf_obj) {
            this.rarity_image_sp.spriteFrame = sf_obj;
        }.bind(this))

        this.order_name_lb.string = config.name;
        // this.order_name_lo.color = VoyageConst.Order_Rarity_Color[config.quality];

        //奖励
        var award_data = [];
        for (var i in config.award) {
            var v = config.award[i]
            var bid = v[0];
            var num = v[1];
            var vo = {};
            vo.bid = bid;
            vo.num = num;
            award_data.push(vo)
        }
        this.good_scrollview.setData(award_data);
        this.good_scrollview.addEndCallBack(function () {
            var list = this.good_scrollview.getItemList();
            for (var k = 0; k < list.length; ++k) {
                list[k].setDefaultTip(true);
            }
        }.bind(this))

        this.refreshOrderBtnStatus();
    },

    //刷新按钮状态显示
    refreshOrderBtnStatus: function () {
        if (this.data.status == VoyageConst.Order_Status.Unget) {

            var expend = this.config.expend[0];
            if (expend) {
                var bid = expend[0];
                var num = expend[1];
                var item_config = Utils.getItemConfig(bid);
                var res = PathTool.getItemRes(item_config.icon);
                if (this.model.getActivityStatus() == 1) {
                    var discount_cfg = Config.shipping_data.data_const["discount"];
                    if (discount_cfg) {
                        num = num * discount_cfg.val / 1000
                    }
                }
                this.expend_label_rt.string = cc.js.formatStr(Utils.TI18N("消耗: <img src='%s' /> %s"), item_config.icon, num)
                this.loadRes(res, (function (resObject) {
                    this.expend_label_rt.addSpriteFrame(resObject);
                }).bind(this));
            }
            this.get_btn_lb.string = Utils.TI18N("接取");
            // this.get_btn_lb.node.color = new cc.Color(0x25, 0x55, 0x05, 0xff);
            // this.loadRes(PathTool.getUIIconPath("common", "common_1098"), function (sf_obj) {
            //     this.btn_sp.spriteFrame = sf_obj;
            // }.bind(this))
            this.get_btn_sp.node.active = false;

            this.openOrderTimer(false);
            this.expend_label_rt.node.active = true;
            this.progress_bg_nd.active = false;
        } else if (this.data.status == VoyageConst.Order_Status.Underway) {
            var cur_time = gcore.SmartSocket.getTime();
            this.left_time = this.data.end_time - cur_time;
            if (this.left_time < 0) {
                this.left_time = 0;
            }
            var gold_num = this.model.getQuickFinishNeedGoldByTime(this.left_time);
            this.get_btn_lb.string = cc.js.formatStr("%d 加速", gold_num);
            // this.get_btn_lb.node.color = new cc.Color(0x25, 0x55, 0x05, 0xff);
            // this.loadRes(PathTool.getUIIconPath("common", "common_1098"), function (sf_obj) {
            //     this.btn_sp.spriteFrame = sf_obj;
            // }.bind(this))
            this.loadRes(PathTool.getItemRes(3), function (sf_obj) {
                this.get_btn_sp.spriteFrame = sf_obj;
            }.bind(this))
            this.get_btn_sp.node.active = true;
            //进度
            var percent = 1 - (this.left_time / this.config.need_time);
            this.progress_pb.progress = percent;
            this.progress_value_lb.string = TimeTool.getTimeFormat(this.left_time);
            this.openOrderTimer(true);
            //只有未领取,转到领取的时候拨一下特效
            if (this.data.old_status == VoyageConst.Order_Status.Unget) {
                this.data.old_status = this.data.status;
                this.handleEffect(true)
            }
            if (this.expend_label_rt) {
                this.expend_label_rt.node.active = false;
            }
            this.progress_bg_nd.active = true;
        } else if (this.data.status == VoyageConst.Order_Status.Finish) {
            this.get_btn_lb.string = Utils.TI18N("完成");
            // this.get_btn_lb.node.color = new cc.Color(0x71, 0x28, 0x04, 0xff);
            // this.loadRes(PathTool.getUIIconPath("common", "common_1027"), function (sf_obj) {
            //     this.btn_sp.spriteFrame = sf_obj;
            // }.bind(this))
            this.progress_pb.progress = 1;
            this.progress_value_lb.string = Utils.TI18N("完成");
            this.openOrderTimer(false);
            if (this.expend_label_rt) {
                this.expend_label_rt.node.active = false;
            }
            this.progress_bg_nd.active = true;
        }

    },

    //剩余时间定时器
    openOrderTimer: function (status) {
        if (status == true) {
            if (this.order_timer == null) {
                this.order_timer = gcore.Timer.set((function () {
                    this.left_time = this.left_time - 1;
                    if (this.left_time >= 0) {
                        var percent = 1 - (this.left_time / this.config.need_time);
                        this.progress_pb.progress = percent;
                        this.progress_value_lb.string = TimeTool.getTimeFormat(this.left_time);
                    } else {
                        this.progress.progress = 1;
                        this.progress_value_lb.string = Utils.TI18N("完成");
                        gcore.Timer.del(this.order_timer);
                        this.order_timer = null;
                    }
                }).bind(this), 1000, -1)
            }
        } else {
            if (this.order_timer != null) {
                gcore.Timer.del(this.order_timer);
                this.order_timer = null;
            }
        }
    },

    handleEffect: function (status) {
        if (status == false) {
            if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.clearTracks();
                this.special_sk.node.active = false;
            }
        } else {
            if (this.special_sk) {
                this.special_sk.node.active = true;
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(629))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action, false)
                }.bind(this))
            }
        }
    },

    suspendAllActions: function () {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
            this.data = null;
        }
        this.handleEffect(false)
        this.openOrderTimer(false)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.update_self_event != null) {
            this.data.unbind(this.update_self_event);
            this.update_self_event = null
        }
        if (this.good_scrollview) {
            this.good_scrollview.deleteMe();
            this.good_scrollview = null;
        }
        if (this.order_timer != null) {
            gcore.Timer.del(this.order_timer);
            this.order_timer = null;
        }
        this.handleEffect(false)
        this.openOrderTimer(false)
    },
})