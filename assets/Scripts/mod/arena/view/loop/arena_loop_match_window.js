// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 20:03:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");

var ArenaLoopMatchWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_match_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.rleasePrefab = false;

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.tab_index = null; // 当前标签页索引
        this.tab_panels = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/main_panel/tab_container/tab_btn_1/title", this.root_wnd, cc.Label).string = Utils.TI18N("挑战");
        Utils.getNodeCompByPath("main_container/main_panel/tab_container/tab_btn_2/title", this.root_wnd, cc.Label).string = Utils.TI18N("排行榜");
        Utils.getNodeCompByPath("main_container/main_panel/tab_container/tab_btn_3/title", this.root_wnd, cc.Label).string = Utils.TI18N("日常奖励");
        Utils.getNodeCompByPath("main_container/main_panel/tab_container/tab_btn_4/title", this.root_wnd, cc.Label).string = Utils.TI18N("排名奖励");
        Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("竞技场");
        //Utils.getNodeCompByPath("main_container/main_panel/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");

        this.close_btn_nd = this.seekChild("close_btn");
        this.container_nd = this.seekChild("container");
        this.background = this.seekChild("background");
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);

        this.loadRes(PathTool.getBattleSingleBg("10005"), function(res) {
            this.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))

        this.tab_btns = {};
        for (var tab_i = 1; tab_i <= 4; tab_i++) {
            this.tab_btns[tab_i] = {};
            var tab_btn_nd = this.seekChild("tab_btn_" + tab_i);
            this.tab_btns[tab_i]["normal_bg_nd"] = tab_btn_nd.getChildByName("unselect_bg");
            this.tab_btns[tab_i]["select_bg_nd"] = tab_btn_nd.getChildByName("select_bg");
            tab_btn_nd.tab_index = tab_i;
            tab_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTabBtn, this);
        }

        this.tab_panels = {};
        // for (var tab_i = 1; tab_i <= 4; tab_i++) {
        //     var cur_panel = null;
        //     switch(tab_i) {
        //         case 1: {
        //             var ArenaLoopChallengePanel = require("arena_loop_challenge_panel");
        //             cur_panel = new ArenaLoopChallengePanel(this.ctrl);
        //         }
        //         break;
        //         case 2: {
        //             var ArenaLoopRankPanel = require("arena_loop_rank_panel");
        //             cur_panel = new ArenaLoopRankPanel(this.ctrl);
        //         }
        //         break;
        //         case 3: {
        //             var ArenaLoopActivityPanel  = require("arena_loop_activity_panel");
        //             cur_panel = new ArenaLoopActivityPanel(this.ctrl);
        //         }
        //         break;
        //         case 4: {
        //             var ArenaLoopAwardsPanel = require("arena_loop_awards_panel");
        //             cur_panel = new ArenaLoopAwardsPanel(this.ctrl)
        //         }
        //         break;                             
        //     }

        //     if (cur_panel) {
        //         cur_panel.setParent(this.container_nd);
        //         cur_panel.show();
        //         cur_panel.setVisible(false);
        //         this.tab_panels[tab_i] = cur_panel;                
        //     }
        // }

        this.background.scale = FIT_SCALE;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateMyLoopData, function() {
            this.updateMyInfoData();
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.updateWidgets();
        this.updateTap(1);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        for (var panel_i in this.tab_panels) {
            if (this.tab_panels[panel_i])
                this.tab_panels[panel_i].deleteMe();
        }

        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        this.ctrl.openArenaLoopMathWindow(false);
    },

    updateWidgets: function() {

    },

    updateTap: function(cur_tab) {
        if (this.tab_index == cur_tab) return;
        if (this.tab_index) {
            this.tab_btns[this.tab_index]["normal_bg_nd"].active = true;
            this.tab_btns[this.tab_index]["select_bg_nd"].active = false;
            this.tab_panels[this.tab_index].setVisible(false);
        }
        this.tab_btns[cur_tab]["normal_bg_nd"].active = false;
        this.tab_btns[cur_tab]["select_bg_nd"].active = true;

        if (!this.tab_panels[cur_tab]) {
            var cur_panel = null;
            switch (cur_tab) {
                case 1:
                    {
                        var ArenaLoopChallengePanel = require("arena_loop_challenge_panel");
                        cur_panel = new ArenaLoopChallengePanel(this.ctrl);
                    }
                    break;
                case 2:
                    {
                        var ArenaLoopRankPanel = require("arena_loop_rank_panel");
                        cur_panel = new ArenaLoopRankPanel(this.ctrl);
                    }
                    break;
                case 3:
                    {
                        var ArenaLoopActivityPanel = require("arena_loop_activity_panel");
                        cur_panel = new ArenaLoopActivityPanel(this.ctrl);
                    }
                    break;
                case 4:
                    {
                        var ArenaLoopAwardsPanel = require("arena_loop_awards_panel");
                        cur_panel = new ArenaLoopAwardsPanel(this.ctrl)
                    }
                    break;
            }

            if (cur_panel) {
                cur_panel.setParent(this.container_nd);
                cur_panel.show();
                // cur_panel.setVisible(false);
                this.tab_panels[cur_tab] = cur_panel;
            }

        } else {
            this.tab_panels[cur_tab].setVisible(true);
        }

        this.tab_index = cur_tab;
    },

    onClickCloseBtn: function() {
        Utils.playButtonSound("c_close");
        this.ctrl.openArenaEnterWindow(true)
        this.ctrl.openArenaLoopMathWindow(false);
    },

    onClickTabBtn: function(event) {
        Utils.playButtonSound(ButtonSound.Tab);
        var cur_tab = event.target.tab_index;
        this.updateTap(cur_tab);
    },

    updateMyInfoData: function() {
        if (this.tab_index && 　this.tab_panels[this.tab_index])
            this.tab_panels[this.tab_index].updatePanelInfo();
    },

})