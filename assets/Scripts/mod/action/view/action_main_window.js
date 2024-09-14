// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     活动主界面
// <br/>Create: 2019-04-18 16:29:40
// --------------------------------------------------------------------
var ActionConst = require("action_const");
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var ActionEvent = require("action_event");
var MainuiConst = require("mainui_const");

var Action_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "welfare_main_view");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = ActionController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.sub_list = [];
        this.tab_list = {};
        this.panel_list = {}
        this.tab_width = 78;
        this.off_space = 50;
        this.selected_tab = null;
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
            this.ctrl.openActionMainPanel(false);
        }.bind(this), ButtonSound.Close)
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_TAB_STATUS, function (function_id, vo) {
            if (function_id != this.function_id) return
            this.setTabStatus(vo.bid)
        }.bind(this))
        this.addGlobalEvent(ActionEvent.SHOW_ACTIVITY_RED_POINT, function (bid, status) {
            this.setSpecialTabStatus(bid, status)
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.function_id = params.function_id || MainuiConst.icon.action;
        this.sub_list = this.ctrl.getActionSubList(this.function_id);
        this.action_bid = params.action_bid;
        this.createSubType();
    },
    createSubType() {
        var self = this
        if (this.sub_list == null || Utils.next(this.sub_list) == null) {

        } else {
            let sum = self.sub_list.length;
            var max_width = sum * (this.tab_width + this.off_space) + 110;
            this.max_width = Math.max(this.tab_scroll_nd.width, max_width);
            this.tab_scroll_content_nd.width = this.max_width
            this.tab_scroll_sv.scrollToLeft(0);
            var call_back = function (item) {
                this.handleSelectedTab(item)
            }.bind(this)
            let index_selected = 0;
            let tab_item = null;
            let _x = null;
            let data = null;
            for (var i = 0; i < sum; i++) {
                data = this.sub_list[i];
                if (data != null && data.bid != null && this.tab_list[data.bid] == null) {
                    if(data.bid == 991027){
                      continue;
                    }
                    var WelfareTab = require("welfare_tab_panel");
                    tab_item = new WelfareTab();
                    tab_item.show();
                    tab_item.setData(data);
                    _x = (i) * (this.tab_width + this.off_space) + 110;
                    tab_item.setPosition(_x, -68);
                    tab_item.setClickCallBack(call_back);
                    tab_item.setParent(this.tab_scroll_content_nd);
                    this.tab_list[data.bid] = tab_item;
                    //设置红点状态
                    this.setTabStatus(data.bid);
                }
            }
            //手动设置选中第一个
            if(this.action_bid){
                this.handleSelectedTab(this.tab_list[this.action_bid]);
            }else{
                this.handleSelectedTab(this.tab_list[this.sub_list[0].bid]);
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
        
        if (this.selected_panel != null) {
            if (this.selected_panel.setVisibleStatus) {
                this.selected_panel.setVisibleStatus(false);
            } else {
                this.selected_panel.setVisible(false)
            }
            this.selected_panel = null;
        }

        if (this.panel_list[data.bid] == null) {
            let panel_type = data.panel_type
            if (data.panel_type == 18 || data.panel_type == 12 || data.panel_type == 21 || data.panel_type == 23 || data.panel_type == 22) {
                panel_type = 16
            }
            var view_str = ActionConst.ActionPanelTypeView[panel_type];
            if (view_str) {
                if (this.panel_list[data.bid] == null) {
                    this.panel_list[data.bid] = Utils.createClass(view_str,data.bid);
                    this.panel_list[data.bid].show({bid:data.bid,function_id:this.function_id});
                    this.panel_list[data.bid].setParent(this.container_nd);
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

    setTabStatus(bid) {
        let vo = this.ctrl.getHolidayAweradsStatus( bid)
        let tab_item = this.tab_list[bid]
        if (tab_item == null) return;
        if (vo == null || vo.status == false) {
            if (tab_item.updateTipsStatus) {
                tab_item.updateTipsStatus(false)
            }
        } else {
            if (tab_item.updateTipsStatus) {
                tab_item.updateTipsStatus(true)
            }
        }
        //特殊活动红点
        var status = this.model.getGiftRedStatusByBid(bid);
        this.setSpecialTabStatus(bid, status)
    },

    isSpecialTabByBid:function(bid){
        return bid == ActionConst.ActionRankCommonType.high_value_gift || bid == ActionConst.ActionRankCommonType.mysterious_store
    },

    setSpecialTabStatus:function(bid,status){
        if(this.specail_tab_status && this.specail_tab_status == status)  return

        this.specail_tab_status = status;
        if(this.isSpecialTabByBid(bid)){
            var tab_item = this.tab_list[bid];
            if(tab_item == null)return
            if(!status){
                if(tab_item.updateTipsStatus){
                    tab_item.updateTipsStatus(false)
                }
            }else{
                if(tab_item.updateTipsStatus){
                    tab_item.updateTipsStatus(true)
                }
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        for (var k in this.tab_list) {
            if (this.tab_list[k].deleteMe) {
                this.tab_list[k].deleteMe();
                this.tab_list[k] = null;
            }
        }
        this.tab_list = null;
        for (var k in this.panel_list) {
            if (this.panel_list[k].deleteMe) {
                this.panel_list[k].deleteMe();
                this.panel_list[k] = null
            }
        }
        this.panel_list = null;
        this.selected_tab = null;
        this.ctrl.openActionMainPanel(false);
    },
})