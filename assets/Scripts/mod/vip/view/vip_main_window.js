// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-27 10:29:54
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipController = require("vip_controller");
var RoleController = require("role_controller");
var CommonScrollView = require("common_scrollview");
var VipPanelItem = require("vip_panel_item");
var VipEvent = require("vip_event");
var WelfareEvent = require("welfare_event");
var WelfareController = require("welfare_controller");
var VipMainTabBtn = require("vip_main_tab_panel");

var Vip_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "vip_main_window");
        // this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = VipController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();

        this.tab_array = [
            { label: Utils.TI18N("充值"), index: VIPTABCONST.CHARGE, status: true, notice: "" },
            //{ label: Utils.TI18N("累充返利"), index: VIPTABCONST.ACC_CHARGE, status: true, notice: "" },
            { label: "VIP", index: VIPTABCONST.VIP, status: true, notice: "" },
            { label: Utils.TI18N("每日礼包"), index: VIPTABCONST.DAILY_GIFT, status: true, notice: "" },
            { label: Utils.TI18N("特权商城"), index: VIPTABCONST.PRIVILEGE, status: true, notice: "" }
        ];

        this.tab_btn_list = {};
        this.view_list = {};
        this.cur_index = null;
        this.cur_tab = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background_nd = this.seekChild("background");
        this.background_nd.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("bigbg_23"), function (res) {
            this.background_nd.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))

        this.mainContainer_nd = this.seekChild("main_container");
        this.main_panel_nd = this.seekChild("main_panel");
        this.table_container_nd = this.seekChild("tab_container");
        this.tab_scrollview_sv = this.seekChild(this.table_container_nd, "scrollview", cc.ScrollView);
        this.sv_content_nd = this.seekChild(this.tab_scrollview_sv.node, "content");
        for (let i = 1; i <= this.tab_array.length; i++) {
            // Utils.delayRun(this.sv_content_nd, 0.05 * (Number(i) ), function () {
                var tab_data = this.tab_array[i - 1];
                var tab_btn = this.tab_btn_list[tab_data.index];
                if (tab_btn == null) {
                    tab_btn = new VipMainTabBtn();
                    tab_btn.show();
                    tab_btn.addCallBack(this.changeTabView.bind(this))
                    tab_btn.setParent(this.sv_content_nd);
                    this.tab_btn_list[tab_data.index] = tab_btn;
                    if (IS_SHOW_CHARGE == false) {
                        tab_btn.setVisible(false);
                    }
                }
                tab_btn.setPosition(78 + (i - 1) * 155 - 333, 0);
                tab_btn.setData(tab_data);
            // }.bind(this))
        }

        var list = Config.vip_data.data_get_reward;
        for (var i in list) {
            var v = gdata("vip_data", "data_get_reward", [i]);
            var status = this.ctrl.getPrivilegeRedpoint(v.lev);
            if (status == null && v.lev <= this.role_vo.vip_lev) {
                this.ctrl.setPrivilegeRedpoint(v.lev, true);
            }
        }

        this.title_con_nd = this.seekChild(this.mainContainer_nd, "titleCon");
        this.loadingbar_pb = this.seekChild(this.title_con_nd, "loadingbar", cc.ProgressBar);
        this.loadingbar_pb.progress = 0;
        this.exp_lb = this.seekChild(this.title_con_nd, "exp", cc.Label);
        this.exp_lb.string = "0/0";

        this.title_bg_nd = this.seekChild(this.title_con_nd, "bg");
        this.loadRes(PathTool.getBigBg("bigbg_24"), function (res) {
            this.title_bg_nd.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))

        this.now_vip_cr = this.seekChild(this.title_con_nd, "now_vip").getComponent("CusRichText");
        this.next_vip_cr = this.seekChild(this.title_con_nd, "next_vip").getComponent("CusRichText");
        this.charge_num_cr = this.seekChild(this.title_con_nd, "charge_num").getComponent("CusRichText");

        this.yuan_nd = this.seekChild(this.title_con_nd, "yuan");
        this.sprite_6_nd = this.seekChild(this.title_con_nd, "Sprite_6");
        this.sprite_6_0_nd = this.seekChild(this.title_con_nd, "Sprite_6_0");

        this.qq_balance = this.seekChild(this.title_con_nd, "qq_balance");
        this.balance_num = this.seekChild(this.qq_balance, "balance_num", cc.Label);
        this.balance_num.string = "0";
        this.banner_image_sp = this.seekChild(this.mainContainer_nd, "banner_image", cc.Sprite);

        this.container_1_nd = this.seekChild(this.main_panel_nd, "container_1");
        this.container_nd = this.seekChild(this.main_panel_nd, "container");

        this.tabLayer_nd = this.seekChild(this.container_nd, "tabLayer");
        var bgSize = this.tabLayer_nd.getContentSize();
        var tab_size = cc.size(bgSize.width + 10, bgSize.height);
        var setting = {
            item_class: VipPanelItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 153,               // 单元的尺寸width
            item_height: 79,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: false
        }
        this.tab_scrollview = new CommonScrollView()
        this.tab_scrollview.createScroll(this.tabLayer_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        this.tab_scrollview.addEndCallBack(function () {
            var jumpitem = this.role_vo.vip_lev;
            if (jumpitem >= 5) {
                this.tab_scrollview.jumpToMove_2(cc.v2(0, 183 * (jumpitem - 4) + (jumpitem - 4) * 2), 0.2);
            }
        }.bind(this))

        this.close_btn = this.seekChild(this.main_panel_nd, "close_btn");
        this.next_vip_desc_sp = this.seekChild(this.title_con_nd, "next_vip_desc", cc.Sprite);

        this.updateBar()
        this.setVisibleVIPTabRedPoint()
        this.resetTitlePos()
        this.setTabRedStatus(this.model.getIsGetAcc(), VIPTABCONST.ACC_CHARGE)
        this.updateDailyAwardRed()
        this.updatePrivilegeTabRedPoint()

        if (IS_SHOW_CHARGE == false) {
            this.title_con_nd.active = false;
            this.banner_image_sp.node.active = false;
        }

        //Utils.getNodeCompByPath("main_container/main_panel/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound("c_close");
            this.ctrl.openVipMainWindow(false);
        }, this)

        if (this.role_vo) {
            if (this.role_update_event == null) {
                this.role_update_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (key == "vip_lev") {
                        this.updateBar();
                    } else if (key == "vip_exp") {
                        this.updateBar();
                    }
                }, this)
            }
        }

        //更新累充的红点
        this.addGlobalEvent(VipEvent.ACC_RECHARGE_INFO, function () {
            this.setTabRedStatus(this.model.getIsGetAcc(), VIPTABCONST.ACC_CHARGE);
        }, this)

        //VIP+tab红点
        this.addGlobalEvent(VipEvent.SUPRE_CARD_GET, function () {
            this.setVisibleVIPTabRedPoint();
        }, this)

        this.addGlobalEvent(WelfareEvent.Update_Daily_Awawd_Data, function () {
            this.updateDailyAwardRed();
        }, this)

        //VIP特权礼包
        this.addGlobalEvent(VipEvent.PRIVILEGE_INFO, function () {
            this.updatePrivilegeTabRedPoint();
        }, this)

        //更新累充的红点
        this.addGlobalEvent(VipEvent.UPDATA_QQ_BALANCE, function (remainder) {
            if (this.balance_num) {
                this.balance_num.string = remainder.toString();
            }
        }, this)

        this.addGlobalEvent(VipEvent.UPDATA_ITEM_REDPOINT, function (remainder) {
            this.setVisibleVIPTabRedPoint();
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (index, sub_type) {
        var index = index || 1;
        this.sub_type = sub_type;
        if (IS_SHOW_CHARGE == false) {//提审服始终是第一个
            index = 1
        }
        if (index == 1 && PLATFORM_TYPR == "QQ_SDK" && USE_SDK == true) {
            SDK.checkBalance();
        }
        this.changeTabView(index);
    },

    changeTabView: function (index) {
        Utils.playButtonSound(ButtonSound.Tab);
        if (this.cur_index == index) return

        if (index == 1 && PLATFORM_TYPR == "QQ_SDK" && USE_SDK == true) {
            this.qq_balance.active = true;
        } else {
            this.qq_balance.active = false;
        }

        if (this.cur_tab != null) {
            this.cur_tab.setSelect(false);
        }
        if (this.pre_panel != null) {
            if (this.pre_panel.setVisibleStatus) {
                this.pre_panel.setVisibleStatus(false);
            }
        }
        this.cur_index = index;
        this.cur_tab = this.tab_btn_list[index];
        if (this.cur_tab == null) return
        this.cur_tab.setSelect(true);
        this.pre_panel = this.createSubPanel(this.cur_tab.tab_type || index);
        if (this.pre_panel != null) {
            if (this.pre_panel.setVisibleStatus) {
                this.pre_panel.setVisibleStatus(true);
            }
        }

        //特权礼包红点点击则消失
        if (index == VIPTABCONST.PRIVILEGE && this.cur_tab.getRedTipsStatus()) {
            this.updatePrivilegeTabRedPoint();
            this.ctrl.setTipsVIPStstus(VIPREDPOINT.PRIVILEGE, false);
        }
    },

    createSubPanel: function (index) {
        var panel = this.view_list[index];
        this.container_1_nd.active = (index == VIPTABCONST.ACC_CHARGE || index == VIPTABCONST.CHARGE || index == VIPTABCONST.DAILY_GIFT || index == VIPTABCONST.PRIVILEGE);
        this.container_nd.active = index == VIPTABCONST.VIP;
        this.banner_image_sp.node.active = (index == VIPTABCONST.DAILY_GIFT || index == VIPTABCONST.PRIVILEGE);
        this.title_con_nd.active = (index == VIPTABCONST.VIP || index == VIPTABCONST.ACC_CHARGE || index == VIPTABCONST.CHARGE);

        var banner_res = null;
        if (index == VIPTABCONST.DAILY_GIFT) {
            banner_res = PathTool.getBigBg("txt_cn_bigbg_24");
        } else if (index == VIPTABCONST.PRIVILEGE) {
            banner_res = PathTool.getBigBg("txt_cn_bigbg_23");
        }
        if (banner_res) {
            this.loadRes(banner_res, function (sf_obj) {
                this.banner_image_sp.spriteFrame = sf_obj;
            }.bind(this))
        }
        if (panel == null) {
            if (index == VIPTABCONST.VIP) {//vip特权
                var VipPanel = require("vip_panel");
                panel = new VipPanel();
                panel.show();
                panel.setData(this.sub_type);
                panel.setParent(this.container_nd);
                if (this.tab_scrollview) {
                    var list = Config.vip_data.data_get_reward;
                    var list_data = [];
                    var num = 0;//根据VIP等级来显示标签栏
                    if (this.role_vo.vip_lev <= 9) {
                        num = 10;
                    } else if (this.role_vo.vip_lev == 10) {
                        num = 12;
                    } else if (this.role_vo.vip_lev == 11) {
                        num = 13;
                    } else {
                        num = Config.vip_data.data_get_reward_length;
                    }
                    for (var i = 0; i < num; i++) {
                        list_data[i] = list[i];
                    }
                    this.tab_scrollview.setData(list_data, function (cell) {
                        var item_list = this.tab_scrollview.getItemList();
                        if (item_list) {
                            for (var k in item_list) {
                                var item = item_list[k];
                                item.select_index = cell.getData().lev;
                                if (cell.getData().lev == item.data.lev) {
                                    this.ctrl.setPrivilegeRedpoint(k, false);
                                    var status = this.ctrl.getPrivilegeRedpoint(k);
                                    item.setVisibleRedStatus(false)
                                    item.setSelect(true)
                                    item.setNormal(false)
                                    item.setTextColor(new cc.Color(255, 255, 255, 255), new cc.Color(24, 65, 32, 255))
                                    panel.setData(cell.getData().lev)
                                } else {
                                    item.setSelect(false);
                                    item.setNormal(true);
                                    item.setTextColor(new cc.Color(255, 255, 255, 255), new cc.Color(247, 216, 94, 255))
                                }
                            }
                        }
                    }.bind(this))
                }
            } else if (index == VIPTABCONST.ACC_CHARGE) {//累冲
                var AccChargePanel = require("accCharge_panel");
                panel = new AccChargePanel();
                panel.show();
                panel.setParent(this.container_1_nd);
            } else if (index == VIPTABCONST.CHARGE) {//充值
                var ChargePanel = require("charge_panel");
                panel = new ChargePanel();
                panel.show();
                panel.setParent(this.container_1_nd);
            } else if (index == VIPTABCONST.DAILY_GIFT) {//每日礼包
                var DailyGiftPanel = require("daily_gift_panel");
                panel = new DailyGiftPanel();
                panel.show();
                panel.setParent(this.container_1_nd);
            } else if (index == VIPTABCONST.PRIVILEGE) {
                var PrivilegePanel = require("privilege_panel");//特权商城
                panel = new PrivilegePanel();
                panel.show();
                panel.setParent(this.container_1_nd);
            }
            this.view_list[index] = panel;
        }
        return panel
    },

    updateBar: function () {
        var config = Config.vip_data.data_get_reward[this.role_vo.vip_lev]
        var max_lev = Config.vip_data.data_get_reward_length - 1
        var next_config = Config.vip_data.data_get_reward[this.role_vo.vip_lev + 1]
        // if (next_config && next_config.gold - this.role_vo.vip_exp > 10000) {
        //     this.charge_num_cr.node.x = -195.5
        // } else {
        //     this.charge_num_cr.node.x = -204.5;
        // }
        if (config) {
            if (next_config) {
                this.loadingbar_pb.progress = ((this.role_vo.vip_exp + this.role_vo.vip_card_exp) / next_config.gold)
                this.exp_lb.string = ((this.role_vo.vip_exp + this.role_vo.vip_card_exp) + "/" + next_config.gold)
                this.next_vip_cr.setNum(this.role_vo.vip_lev + 1)
                this.charge_num_cr.setNum(next_config.gold - (this.role_vo.vip_exp + this.role_vo.vip_card_exp))
            } else {
                this.loadingbar_pb.progress = 1
                this.exp_lb.string = (config.gold + "/" + config.gold)
                this.next_vip_cr.setNum(this.role_vo.vip_lev)
                this.charge_num_cr.setNum(0)
            }
        } else {
            this.loadingbar_pb.progress = 1
            this.exp_lb.string = (Config.vip_data.data_get_reward[max_lev].gold + "/" + Config.vip_data.data_get_reward[max_lev].gold)
            this.charge_num_cr.setNum(0)
            this.next_vip_cr.setNum(this.role_vo.vip_lev)
        }
        // this.charge_num.setCallBack(function () {
        //     this.resetTitlePos()
        // }.bind(this))
        this.resetTitlePos();
        if (String(this.charge_num_cr.getNum()).length * 28 > 0) {
            if(this.yuan_nd.active == false) this.yuan_nd.active = true;
            var x = (this.charge_num_cr.x + String(this.charge_num_cr.getNum()).length * 32 + 20);
            cc.log("----------nodex = " + x);
            if(!isNaN(x)){//NAN
                cc.log("settttttttttt" + x);
            this.yuan_nd.x = x;
            }
        }

        this.now_vip_cr.setNum(this.role_vo.vip_lev);

        var num = 1
        if (this.role_vo.vip_lev + 1 >= max_lev) {
            num = max_lev
        } else {
            num = this.role_vo.vip_lev + 1
        }

        if (IS_SHOW_CHARGE == false) {
            return;
        }

        var res_id = PathTool.getBigBg(cc.js.formatStr("vip_lev_desc_%d", num), null, "vip");
        this.loadRes(res_id, function (sf_obj) {
            this.next_vip_desc_sp.spriteFrame = sf_obj;
        }.bind(this))
    },

    resetTitlePos: function () {
        var x = (this.charge_num_cr.node.x + String(this.charge_num_cr.getNum()).length * 32 - 25);
        cc.log("----------nodex = " + x);
        if(!isNaN(x)){//排除NAN
            cc.log("settttttttttt" + x);
        this.yuan_nd.x = x;
        }
        this.sprite_6_nd.x = (this.yuan_nd.x + this.yuan_nd.getContentSize().width + 5)
        this.sprite_6_0_nd.x = (this.sprite_6_nd.x + this.sprite_6_nd.getContentSize().width -240)
        this.next_vip_cr.node.x = (this.sprite_6_0_nd.x + this.sprite_6_0_nd.getContentSize().width - 5)
    },

    setVisibleVIPTabRedPoint: function () {
        // return
        var status = this.model.getMonthCard();
        var get_list = this.model.getGetGiftList();
        var item_status = (get_list[this.role_vo.vip_lev] == null) && this.ctrl.getIsFirst();
        var tab_status = status || item_status;
        this.setTabRedStatus(tab_status, VIPTABCONST.VIP);
    },

    updatePrivilegeTabRedPoint: function () {
        var status = this.model.getPrivilegeRedStatus();
        this.setTabRedStatus(status, VIPTABCONST.PRIVILEGE);
    },

    //每日礼包按钮红点更新
    updateDailyAwardRed: function () {
        var red_status = false;
        var award_status = WelfareController.getInstance().getModel().getDailyAwardStatus();
        if (award_status == 0) {
            red_status = true;
        }
        this.setTabRedStatus(red_status, VIPTABCONST.DAILY_GIFT)
    },

    setTabRedStatus: function (status, index, num) {
        // return
        var tab_btn = this.tab_btn_list[index];
        if (tab_btn) {
            tab_btn.showRedTips(status, num);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        for (var i in this.view_list) {
            if (this.view_list[i]) {
                this.view_list[i].deleteMe();
                this.view_list[i] = null;
            }
        }
        this.view_list = null;
        if (this.tab_btn_list) {
            for (var i in this.tab_btn_list) {
                if (this.tab_btn_list[i]) {
                    this.tab_btn_list[i].deleteMe();
                    this.tab_btn_list[i] = null;
                }
            }
            this.tab_btn_list = null;
        }

        if (this.tab_scrollview) {
            this.tab_scrollview.deleteMe()
            this.tab_scrollview = null;
        }

        if (this.role_vo) {
            if (this.role_update_event) {
                this.role_vo.unbind(this.role_update_event);
                this.role_update_event = null;
            }
            this.role_vo = null;
        }
        this.ctrl.openVipMainWindow(false);
    },
})