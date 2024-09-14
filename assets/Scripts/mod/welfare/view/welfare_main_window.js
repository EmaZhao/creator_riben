// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-04 11:29:34
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WelfareConst = require("welfare_const");
var WelfareController = require("welfare_controller");
var WelfareEvent = require("welfare_event");
var ActionEvent = require("action_event");
var ActionConst = require("action_const");
var ActionController = require("action_controller");
var MainuiConst = require("mainui_const")

var Welfare_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "welfare_main_view");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.sub_list = []
        this.tab_list = {}
        this.tab_width = 78
        this.off_space = 50
        this.panel_list = {}
        this.selected_tab = null
        this.selected_panel = null
        this.ctrl = WelfareController.getInstance();
        this.model = this.ctrl.getModel();
        this.action_ctrl = ActionController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = this.background.scale * FIT_SCALE;

        this.main_container_nd = this.seekChild("main_container");

        this.main_panel_nd = this.seekChild(this.main_container_nd, "main_panel");
        this.container_nd = this.seekChild(this.main_panel_nd, "container");

        this.close_btn_nd = this.seekChild(this.main_container_nd, "close_btn");
        this.tab_container_nd = this.seekChild(this.main_container_nd, "tab_container");
        this.tab_scroll_nd = this.seekChild(this.tab_container_nd, "tab_scroll");
        this.tab_scroll_sv = this.seekChild(this.tab_container_nd, "tab_scroll", cc.ScrollView);
        this.tab_scroll_content_nd = this.seekChild(this.tab_scroll_nd, "content");

        this.loadRes(PathTool.getBigBg("welfare/welfare_bg","jpg"), function (res) {
            this.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))
        //this.loadRes(PathTool.getBigBg("welfare/welfare_bg_1"), function (res) {
        //    this.main_panel_nd.getChildByName("tab_sprite_bg").getComponent(cc.Sprite).spriteFrame = res
        //}.bind(this))
        //Utils.getNodeCompByPath("main_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn_nd, function () {
            this.ctrl.openMainWindow(false);
        }.bind(this), ButtonSound.Close)

        this.addGlobalEvent(WelfareEvent.UPDATE_WELFARE_TAB_STATUS, function (vo) {
            this.setTabStatus(vo.bid);
        }, this)
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_TAB_STATUS, function (type, vo) {
            if (type != ActionConst.ActionType.Wonderful) return
            if (!this.action_ctrl.isSpecialBid(vo.bid)) return
            this.setTabStatus(vo.bid);
        }, this)
        this.addGlobalEvent(ActionEvent.UPDATA_FUND_RED_STATUS_EVENT, function () {
            if (this.auto_bid == MainuiConst.icon.fund) {
                this.setTabStatus(this.selected_tab.getData().bid)
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (bid) {
        if (bid) {
            if (bid == MainuiConst.icon.fund) {
                let fund_id_list = ActionController.getInstance().getModel().getOpenFundIds()
                for (let k = 0; k < fund_id_list.length; ++k) {
                    let v = fund_id_list[k]
                    let config = Config.month_fund_data.data_fund_data[v.id]
                    if (config) {
                        let sub_data = {}
                        sub_data.bid = v.id
                        sub_data.title = config.name
                        sub_data.ico = config.icon_id
                        this.sub_list.push(sub_data)
                    }
                }
                this.sub_list.sort(Utils.tableCommonSorter([["bid", false]]))
            } else {
                this.sub_list = this.ctrl.getWelfareSubList();
            }
        } else {
            this.sub_list = this.ctrl.getWelfareSubList();
        }
        var iBid = null;
        if(this.sub_list.length>0){
          iBid = this.sub_list[0].bid;
        }
        this.auto_bid = bid || iBid;
        this.createSubType();
    },

    createSubType: function () {
        if (this.sub_list == null || Utils.next(this.sub_list) == null) {

        } else {
            var sum = Utils.getArrLen(this.sub_list);            
            var max_width = sum * (this.tab_width + this.off_space) + 110;
            this.max_width = Math.max(this.tab_scroll_nd.width, max_width);
            this.tab_scroll_content_nd.width = this.max_width
            this.tab_scroll_sv.scrollToLeft(0);
            var call_back = function (item) {
                if (item.getData().bid == WelfareConst.WelfareIcon.quest) {
                    this.ctrl.openSureveyQuestView(true);
                } else {
                    this.handleSelectedTab(item);
                    if (item.getData().bid == ActionConst.FundType.type_one || item.getData().bid == ActionConst.FundType.type_two) {
                        let _model = require("action_controller").getInstance().getModel()
                        if (item.getData().bid == ActionConst.FundType.type_one) {
                            _model.updateFundRedStatus(ActionConst.FundRedIndex.fund_buy_one, false)
                        } else {
                            _model.updateFundRedStatus(ActionConst.FundRedIndex.fund_buy_two, false)
                        }
                    }

                }
            }.bind(this)

            var index_selected = -1;
            var tab_item = null;
            var _x = null;
            var data = null;
            for (let i = 0; i < sum; i++) {
                const data = this.sub_list[i];
                Utils.delayRun(this.tab_scroll_content_nd, 0.01 * (Number(i)), function () {
                    if (data != null && data.bid != null && this.tab_list[data.bid] == null && data.bid != 8003) {
                        let WelfareTab = require("welfare_tab_panel");
                        tab_item = new WelfareTab();
                        tab_item.show();
                        tab_item.setData(data);
                        _x = i * (this.tab_width + this.off_space) + 110;
                        tab_item.setPosition(_x, -68);
                        tab_item.setClickCallBack(call_back);
                        tab_item.setParent(this.tab_scroll_content_nd);
                        this.tab_list[data.bid] = tab_item;
                        if (this.auto_bid != null) {
                            if (this.auto_bid == data.bid) {
                                index_selected = i;
                            }else if(this.auto_bid == MainuiConst.icon.fund && (data.bid == ActionConst.FundType.type_one || data.bid == ActionConst.FundType.type_two)){
                                index_selected = 0
                            }
                        }
                        //设置红点状态
                        this.setTabStatus(data.bid);
                    }
                }.bind(this))
            }

            // if (index_selected == 0) {
            //     index_selected = 0;
            // }


            // //手动设置选中第一个
            this.timer_hander = this.startUpdate(20, function () {
                data = this.sub_list[index_selected];
                if (data != null) {
                    if (index_selected && index_selected != 1) {
                        this.tab_scroll_sv.scrollToPercentHorizontal(index_selected / sum, 0.5);
                    }
                    this.handleSelectedTab(this.tab_list[data.bid]);
                    this.stopUpdate(this.timer_hander);
                }
            }.bind(this), 100);
        }
    },

    //设置标签页红点状态
    setTabStatus: function (bid) {
        var vo
        if (bid == ActionConst.FundType.type_one || bid == ActionConst.FundType.type_two) {
            let _model = require("action_controller").getInstance().getModel()
            if (bid == ActionConst.FundType.type_one) {
                vo = _model.getFundRedStatusByBid(ActionConst.FundRedIndex.fund_get_one)
                if (!vo) {
                    vo = _model.getFundRedStatusByBid(ActionConst.FundRedIndex.fund_buy_one)
                }
            } else if (bid == ActionConst.FundType.type_two) {
                vo = _model.getFundRedStatusByBid(ActionConst.FundRedIndex.fund_get_two)
                if (!vo) {
                    vo = _model.getFundRedStatusByBid(ActionConst.FundRedIndex.fund_buy_two)
                }
            }
        } else {
            vo = this.ctrl.getWelfareStatusByID(bid);
        }

        if (this.action_ctrl.isSpecialBid(bid)) {
            vo = this.action_ctrl.getHolidayAweradsStatus(bid);
        }
        var tab_item = this.tab_list[bid];
        if (tab_item == null) return
        if (vo == null || vo.status == false || vo == false) {
            if (tab_item.updateTipsStatus) {
                tab_item.updateTipsStatus(false);
            }
        } else {
            if (tab_item.updateTipsStatus) {
                tab_item.updateTipsStatus(true);
            }
        }
    },

    handleSelectedTab: function (tab) {
        if (this.selected_tab != null && this.selected_tab == tab) return
        if (this.selected_tab != null) {
            this.selected_tab.setSelected(false);
        }
        this.selected_tab = tab;
        if (this.selected_tab != null) {
            this.selected_tab.setSelected(true);
        }
        this.changePanelByTab();
    },

    changePanelByTab: function () {
        if (this.selected_tab == null || this.selected_tab.data == null) return
        var data = this.selected_tab.data;
        if (data.bid == null || data.bid == 0) return
        if (data.panel_type == null || data.panel_type == 0 || WelfareConst.WelfarePanelTypeView[data.panel_type] == null) {
            if (data.bid == ActionConst.FundType.type_one || data.bid == ActionConst.FundType.type_two) {

            } else {
                return
            }
        }

        if (this.selected_panel != null) {
            if (this.selected_panel.setVisibleStatus) {
                this.selected_panel.setVisibleStatus(false);
            } else {
                this.selected_panel.setVisible(false)
            }
            this.selected_panel = null;
        }

        if (this.panel_list[data.bid] == null) {
            var view_str = WelfareConst.WelfarePanelTypeView[data.panel_type];
            if (view_str) {
                if (this.panel_list[data.bid] == null) {
                    this.panel_list[data.bid] = Utils.createClass(view_str);
                    this.panel_list[data.bid].show(data.bid);
                    this.panel_list[data.bid].setParent(this.container_nd)
                    // if(data.bid == 8003){
                    //   this.ctrl.openActivityWindow(true);
                    // }
                }
            } else {
                let panel_view
                if (data.bid == ActionConst.FundType.type_one || data.bid == ActionConst.FundType.type_two) {
                    let fundOnePanel = require("action_fund_one_panel")
                    panel_view = new fundOnePanel(data.bid)
                }
                // else if(data.bid == ActionConst.FundType.type_two){
                //     let fundTwoPanel = require("action_fund_two_panel")
                //     panel_view = new fundTwoPanel()
                // }
                if (panel_view) {
                    this.panel_list[data.bid] = panel_view
                    this.panel_list[data.bid].show();
                    this.panel_list[data.bid].setParent(this.container_nd)
                    this.panel_list[data.bid].setPosition(0, -20)
                }
            }
        }
        this.selected_panel = this.panel_list[data.bid];

        if (this.selected_panel != null) {
            if (this.selected_panel.setVisibleStatus) {
                this.selected_panel.setVisibleStatus(true);
            } else {
                this.selected_panel.setVisible(true);
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        for (var k in this.panel_list) {
            if (this.panel_list[k].deleteMe) {
                this.panel_list[k].deleteMe();
                this.panel_list[k] = null
            }
        }
        this.panel_list = null;

        for (var k in this.tab_list) {
            if (this.tab_list[k].deleteMe) {
                this.tab_list[k].deleteMe();
                this.tab_list[k] = null;
            }
        }
        this.tab_list = null;
        this.tab_scroll_content_nd.stopAllActions();
        this.ctrl.openMainWindow(false);
    },
})