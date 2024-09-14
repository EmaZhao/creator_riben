// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-25 17:22:06
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var ActionEvent = require("action_event");
var ActionLimitGiftMainPanel = require("action_limit_gift_main_panel")
var ActionLimitGiftMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "welfare_main_view");
        // this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl =  ActionController.getInstance()
        var NewfirstchargeController = require("newfirstcharge_controller")
        if(NewfirstchargeController.getInstance().getNewFirstChargeView()){
            NewfirstchargeController.getInstance().getNewFirstChargeView().setVisible(false)
        }
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.tab_width = 78;
        this.off_space = 50;
        this.tab_list = {};
        this.panel_list = {}
        this.selected_tab = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this;
        self.background = self.root_wnd.getChildByName("background");
        self.background.scale = self.background.scale * FIT_SCALE;
        if(self.background != null){
            this.loadRes(PathTool.getBigBg("welfare/welfare_bg","jpg"),function(res){
                this.background.getComponent(cc.Sprite).spriteFrame = res;
            }.bind(this))   
        }
        self.main_container_nd = self.root_wnd.getChildByName("main_container");
        this.close_btn_nd = this.seekChild(this.main_container_nd, "close_btn");
        this.container_nd = this.seekChild(this.main_container_nd, "container");
        let main_panel = self.main_container_nd.getChildByName("main_panel");
        self.container = main_panel.getChildByName("container");
        this.tab_container_nd = this.seekChild(this.main_container_nd, "tab_container");
        this.tab_scroll_nd = this.seekChild(this.tab_container_nd, "tab_scroll");
        this.tab_scroll_content_nd = this.seekChild(this.tab_scroll_nd, "content");
        this.tab_scroll_sv = this.seekChild(this.tab_container_nd, "tab_scroll", cc.ScrollView);
        // self.tab_sprite_bg = main_panel.getChildByName("tab_sprite_bg")
        // this.loadRes(PathTool.getUIIconPath("bigbg/welfare","welfare_bg_1"),function(res){
        //     this.tab_sprite_bg.getComponent(cc.Sprite).spriteFrame = res;
        // }.bind(this))
        // Utils.getNodeCompByPath("main_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn_nd.on('click',function(){
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openActionLimitGiftMainWindow(false)
        },this)
        this.addGlobalEvent(ActionEvent.LIMIT_GIFT_MAIN_EVENT, function(scdata){
            this.initData(scdata)
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(id){
        this.record_id = id
        this.ctrl.send21210()
    },
    initData(scdata){
        if (!scdata) return;
        var self = this
        if(scdata.gifts.length == 0){
            this.ctrl.openActionLimitGiftMainWindow(false)
            return 
        }
        
        self.sub_list = []
        for(let i=0;i<scdata.gifts.length;++i){
            let gift = scdata.gifts[i]
            let config = Config.star_gift_data.data_limit_gift[gift.id]
            if (config){
                gift.ico = config.ico
                gift.config = config
                gift.title = config.name
                self.sub_list.push(gift)
            }
        }
        self.sub_list.sort(function(a,b){
            return a.id - b.id
        })
        self.createSubType()
    },
    createSubType(){
        var self = this
        if(self.sub_list == null || Utils.next(self.sub_list) == null){
            return
        }
        let sum = self.sub_list.length
        let max_width = sum * (this.tab_width + this.off_space) + 110;
        this.max_width = Math.max(this.tab_scroll_nd.width, max_width);
        this.tab_scroll_content_nd.width = this.max_width
        this.tab_scroll_sv.scrollToLeft(0);
        let call_back = function (item) {
            this.handleSelectedTab(item)
        }.bind(this)
        for(let i in this.tab_list){
            let tab = this.tab_list[i].getData()
            let bool = true;
            for(let j=0;j<self.sub_list.length;++j){
                let v = self.sub_list[j]
                if(tab.id == v.id){
                    bool = false;
                    break
                }
            }
            if(bool){
                this.tab_list[i].deleteMe()
                this.tab_list[i] = null;
                delete this.tab_list[i] 
                this.panel_list[tab.id].deleteMe()
                this.panel_list[tab.id] = null;
                delete this.panel_list[tab.id]
                this.selected_tab = this.tab_list[this.sub_list[0].id]
                if (this.selected_tab != null) {
                    this.selected_tab.setSelected(true);
                }
            }
        }
        let tab_item = null;
        let _x = null;
        let data = null;
        let index_selected = 0
        for (var i = 0; i < sum; i++) {
            data = this.sub_list[i];
            tab_item = self.tab_list[data.id]
            if (tab_item == null) {
                var WelfareTab = require("welfare_tab_panel");
                tab_item = new WelfareTab();
                tab_item.show();
                tab_item.setData(data);
                tab_item.setClickCallBack(call_back);
                tab_item.setParent(this.tab_scroll_content_nd);
                this.tab_list[data.id] = tab_item;
                tab_item.updateTipsStatus(false)
            }else{
                tab_item.setData(data)
            }
            _x = (i ) * (this.tab_width + this.off_space) + 110;
            tab_item.setPosition(_x, -68);
            if(this.record_id != null && this.record_id == data.id){
                index_selected = i
            }
        }
        //手动设置选中第一个
        data = this.sub_list[index_selected];
        if (data != null && this.selected_tab == null) {
            this.handleSelectedTab(this.tab_list[data.id]);
        }else{
            this.changePanelByTab();
        }
    },
    handleSelectedTab(tab){
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
    changePanelByTab(){
        if (this.selected_tab == null || this.selected_tab.data == null) return
        var data = this.selected_tab.data;
        if (data.id == null || data.id == 0) return

        if (this.selected_panel != null) {
            if (this.selected_panel.setVisibleStatus) {
                this.selected_panel.setVisibleStatus(false);
            } else {
                this.selected_panel.setVisible(false)
            }
            this.selected_panel = null;
        }

        if (this.panel_list[data.id] == null) {
            this.panel_list[data.id] = new ActionLimitGiftMainPanel(data)
            this.panel_list[data.id].show();
            this.panel_list[data.id].setParent(this.container_nd);
        }else{
            this.panel_list[data.id].setData(data)
        }
        this.selected_panel = this.panel_list[data.id];

        if (this.selected_panel != null) {
            if (this.selected_panel.setVisibleStatus) {
                this.selected_panel.setVisibleStatus(true);
            } else {
                this.selected_panel.setVisible(true);
            }
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.tab_list){
            for (var k in this.tab_list) {
                if (this.tab_list[k]) {
                    this.tab_list[k].deleteMe();
                    this.tab_list[k] = null;
                }
            }
        }
        this.tab_list = null;
        if(this.panel_list){
            for(let i in this.panel_list){
                if(this.panel_list[i]){
                    this.panel_list[i].deleteMe()
                    this.panel_list[i] = null;
                }  
            }
            this.panel_list = null
        }
        this.selected_tab = null
        var NewfirstchargeController = require("newfirstcharge_controller")
        if(NewfirstchargeController.getInstance().getNewFirstChargeView()){
            NewfirstchargeController.getInstance().getNewFirstChargeView().setVisible(true)
        }
        this.ctrl.openActionLimitGiftMainWindow(false)
    },
})