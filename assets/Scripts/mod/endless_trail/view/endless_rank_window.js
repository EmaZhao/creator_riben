// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     无尽试炼排行榜主界面
// <br/>Create: 2019-03-07 10:58:09
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Endless_trailEvent = require("endless_trail_event");

var Endless_rankWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_rank_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.selected_tab = null // 当前选中的标签
        this.tab_list = [];
        this.panel_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        
        this.root_csb = this.root_wnd.getChildByName("main_container");
        this.main_panel = this.root_csb.getChildByName("main_panel");
        this.main_view = this.main_panel.getChildByName("container");
        this.close_btn = this.root_csb.getChildByName("close_btn");
        this.win_title = this.main_panel.getChildByName("win_title").getComponent(cc.Label);
        this.win_title.string = Utils.TI18N("无尽试炼排行榜");


        var tab_container = this.main_view.getChildByName("tab_container");
        for(var i = 1;i<3;i++){
            var tab_btn = tab_container.getChildByName("tab_btn_" + i);
            if(tab_btn){
                var title = tab_btn.getChildByName("title").getComponent(cc.Label);
                var tab_btn_img = tab_container.getChildByName("tab_btn_" + i).getComponent(cc.Sprite);
                
                if(i == 1){
                    title.string = Utils.TI18N("排行榜");
                }else if(i == 2){
                    title.string = Utils.TI18N("奖励一览");
                }
                title.node.color = new cc.Color(255, 255, 255, 255);
                tab_btn.tab_btn_img = tab_btn_img;
                tab_btn.index = i
                tab_btn.label = title

                var res = PathTool.getCommonIcomPath("common_1012");
                this.loadRes(res, function (sf_obj) {
                    tab_btn.tab_btn_img.spriteFrame = sf_obj;
                }.bind(this));
                this.tab_list[i] = tab_btn
            }
        }
    
        this.scroll_container = this.main_view.getChildByName("scroll_container");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        for(var i in this.tab_list){
            Utils.onTouchEnd(this.tab_list[i], function (sender) {
                this.changeSelectedTab(sender.index)
            }.bind(this,this.tab_list[i]), 3);
        }
        
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEndlessRankView(false);
        }.bind(this), 2);

        this.addGlobalEvent(Endless_trailEvent.UPDATA_REDPOINT_SENDPARTNER_DATA,function(bool){
            if(this.tab_list && Utils.next(this.tab_list || []) != null && this.tab_list[2] && this.tab_list[2].red_point){
                this.tab_list[2].red_point.active = bool;
            }
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(type){
        type = type || Endless_trailEvent.type.rank;
        this.changeSelectedTab(type)
    },

    // 切换标签页
    changeSelectedTab:function(index){
        if(this.selected_tab!=null){
            if(this.selected_tab.index == index){
                return;
            }
        }
        if(this.selected_tab){
            var res = PathTool.getCommonIcomPath("common_1012");
            this.loadRes(res, function (sf_obj) {
                this.selected_tab.tab_btn_img.spriteFrame = sf_obj;
            }.bind(this));

            this.selected_tab.label.node.color = new cc.Color(255, 255, 255, 255);
            this.selected_tab = null
        }
        this.selected_tab = this.tab_list[index];
        if(this.selected_tab){
            var res = PathTool.getCommonIcomPath("common_1011");
            this.loadRes(res, function (sf_obj) {
                this.selected_tab.tab_btn_img.spriteFrame = sf_obj;
            }.bind(this));
            this.selected_tab.label.node.color = new cc.Color(255, 255, 255, 255);
        }

        if(this.cur_panel != null){
            this.cur_panel.setNodeVisible(false)
            this.cur_panel = null;
        }

        this.cur_panel = this.panel_list[index];
        if(this.cur_panel == null){
            if(index == Endless_trailEvent.type.rank){
                var EndlessRankPanel = require("endless_rank_panel");
                this.cur_panel = new EndlessRankPanel();
            }else if(index ==  Endless_trailEvent.type.reward){
                var EndlessAwardsPanel = require("endless_awards_panel");
                this.cur_panel = new EndlessAwardsPanel();
            }
            this.panel_list[index] = this.cur_panel;
            this.cur_panel.show();
            this.cur_panel.setParent(this.scroll_container);

        }
        this.cur_panel.setNodeVisible(true);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openEndlessRankView(false);
        for(var i in this.panel_list){
            this.panel_list[i].deleteMe();
        }
        this.panel_list = [];
        this.selected_tab = null;
        this.cur_panel = null;
    },
})