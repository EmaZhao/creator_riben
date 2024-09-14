// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 10:24:25
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");
var ArenaConst = require("arena_const");
var TimeTool = require("timetool");
var HeroController = require("hero_controller")
var HeroConst = require("hero_const");
var PatrnerConst = require("partner_const");
var MallController = require("mall_controller");
var MallConst = require("mall_const");

var Arena_champion_matchWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_match_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.cur_tab = null; // 当前标签而页
        this.cur_panel = null; // 当前面板页
        this.update_timer = null;

        this.tab_panels = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/tab_container/tab_btn_1/title", this.root_wnd, cc.Label).string = Utils.TI18N("我的竞赛");
        Utils.getNodeCompByPath("main_container/tab_container/tab_btn_2/title", this.root_wnd, cc.Label).string = Utils.TI18N("竞猜");
        Utils.getNodeCompByPath("main_container/tab_container/tab_btn_3/title", this.root_wnd, cc.Label).string = Utils.TI18N("32强赛");
        Utils.getNodeCompByPath("main_container/tab_container/tab_btn_4/title", this.root_wnd, cc.Label).string = Utils.TI18N("排行榜");
        Utils.getNodeCompByPath("main_container/tab_container/shop_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("竞猜商店");
        //Utils.getNodeCompByPath("main_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        Utils.getNodeCompByPath("main_container/awards_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("奖励");
        this.select_img_nd = this.seekChild("select_img");
        this.container_nd = this.seekChild("container");
        this.close_btn_nd = this.seekChild("close_btn");

        this.panel_title_nd = this.seekChild("panel_title");
        this.panel_title_lb = this.seekChild("panel_title", cc.Label);
        this.match_time_nd = this.seekChild("match_time");
        this.match_time_lb = this.seekChild("match_time", cc.Label);

        this.my_guess_btn_nd = this.seekChild("my_guess_btn");
        this.guess_btn_title_lb = this.seekChild("guess_btn_title", cc.Label);
        this.explain_btn_nd = this.seekChild("explain_btn");
        this.shop_btn_nd = this.seekChild("shop_btn");
        this.awards_btn_nd = this.seekChild("awards_btn");

        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE

        this.loadRes(PathTool.getBattleSingleBg("10005"), function(res) {
            this.background.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))
        this.tab_btn_infos = {};
        for (var btn_i = 1; btn_i <= 4; btn_i++) {
            var tab_btn_info = this.tab_btn_infos[btn_i] = {};
            tab_btn_info["btn_nd"] = this.seekChild("tab_btn_" + btn_i);
            tab_btn_info["btn_lb_nd"] = this.seekChild(tab_btn_info["btn_nd"], "title");
            tab_btn_info["btn_nd"].tab_tag = btn_i;
            tab_btn_info["btn_nd"].on(cc.Node.EventType.TOUCH_END, this.onClickTabBtn, this);
        }

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.my_guess_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickBtnTitle, this);
        this.explain_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickExplainBtn, this);
        this.shop_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickShopBtn, this);
        this.awards_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickAwardsBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateChampionRoleInfoEvent, function(role_info) { // 冠军赛个人信息
            if (role_info)
                this.updateBaseInfo();
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.ChangeTanFromTop324, function() { // 冠军赛个人信息

        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.updateTab(1);
        this.updateBaseInfo();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        for (var tap_i in this.tab_panels) {
            if (this.tab_panels[tap_i]) {
                this.tab_panels[tap_i].deleteMe();
                this.tab_panels[tap_i] = null;
            }

        }
        this.ctrl.openArenaChampionMatchWindow(false);
    },

    onClickTabBtn: function(event) {
        if (event && event.target) {
            if (event.target.tab_tag !== this.cur_tab) {
                this.updateTab(event.target.tab_tag);
            }
        }
    },

    updateTab: function(tab_index) {
        if (!tab_index) return;
        if (this.cur_tab) {
            var last_btn_info = this.tab_btn_infos[this.cur_tab];
            last_btn_info["btn_lb_nd"].color = new cc.Color().fromHEX('#ffffff');
        }

        var tab_btn_info = this.tab_btn_infos[tab_index];
        this.select_img_nd.position = tab_btn_info["btn_nd"].position;
        tab_btn_info["btn_lb_nd"].color = new cc.Color().fromHEX('#ffffff');

        // 按钮设置
        if (tab_index <= 3) {
            this.my_guess_btn_nd.active = true;
            if (tab_index == 1) {
                this.guess_btn_title_lb.string = Utils.TI18N("我的布阵");
            } else {
                this.guess_btn_title_lb.string = Utils.TI18N("我的竞猜");
            }
        } else {
            this.my_guess_btn_nd.active = false;
        }

        var panel_index = tab_index;
        if (tab_index === 1) {
            panel_index = this.getMyMacthPanelIndex();
        }

        if (!this.tab_panels[panel_index]) {
            var panel_res = null;
            switch (panel_index) {
                case 1:
                    {
                        panel_res = require("arena_champion_my_match_ready_panel");
                    }
                    break;
                case 2:
                    {
                        panel_res = require("arena_champion_cur_guess_panel");
                    }
                    break;
                case 3:
                    {
                        panel_res = require("arena_champion_top_32_panel");
                    }
                    break;
                case 4:
                    {
                        panel_res = require("arena_champion_cur_rank_panel");
                    }
                    break;
                case 5:
                    {
                        panel_res = require("arena_champion_my_match_panel");
                    }
                    break;
            }
            this.tab_panels[panel_index] = new panel_res(this.ctrl);
            this.tab_panels[panel_index].setParent(this.container_nd);
            this.tab_panels[panel_index].show();
        } else {
            this.tab_panels[panel_index].setVisible(true);
        }

        if (this.cur_panel && this.tab_panels[this.cur_panel]) {
            this.tab_panels[this.cur_panel].setVisible(false);
        }

        this.cur_tab = tab_index;
        this.cur_panel = panel_index;
        this.updateBaseInfo();
    },

    getMyMacthPanelIndex: function() {
        var match_status = this.model.getMyMatchStatus();
        var panel_index = ArenaConst.champion_index.my_match_ready;

        if (match_status === ArenaConst.champion_my_status.in_match) {
            panel_index = ArenaConst.champion_index.my_match;
        }

        return panel_index;
    },

    // 更新我的竞赛信息以及冠军赛基础信息
    updateBaseInfo: function() {
        // 时间相关
        var base_info = this.base_info = this.model.getBaseInfo();
        var role_info = this.role_info = this.model.getRoleInfo();

        if (!base_info) return;

        if (this.cur_panel == ArenaConst.champion_index.my_match_ready || this.cur_panel == ArenaConst.champion_index.rank) {
            this.panel_title_nd.active = false;
            this.match_time_nd.active = false;
            // this.cleanTimer();
        } else {
            this.panel_title_nd.active = true;
            this.setChampionStepInfo();

            if (base_info.step == ArenaConst.champion_step.match_4 && base_info.step_status == ArenaConst.champion_step_status.over) {
                this.cleanTimer();
                this.match_time_nd.active = false;
            } else {
                this.match_time_nd.active = true;
                // 时间开头
                this.time_title = "";
                if (base_info.step == ArenaConst.champion_step.unopened && base_info.step_status == ArenaConst.champion_step_status.unopened) {
                    this.time_title = Utils.TI18N("距离开始:%s");
                } else {
                    if (base_info.round_status == ArenaConst.champion_round_status.prepare) {
                        this.time_title = Utils.TI18N("准备阶段:%s");
                    } else if (base_info.round_status == ArenaConst.champion_round_status.guess) {
                        this.time_title = Utils.TI18N("竞猜阶段:%s");
                    } else {
                        this.time_title = Utils.TI18N("比赛阶段:%s");
                    }
                }
                // 倒计时

                var end_time = gcore.SmartSocket.getTime();
                if (base_info.step == ArenaConst.champion_step.unopened) {
                    end_time = base_info.step_status_time;
                } else if (base_info.step == ArenaConst.champion_step.score && base_info.step_status == ArenaConst.champion_step_status.unopened) {
                    end_time = base_info.step_status_time;
                } else {
                    end_time = base_info.round_status_time;
                }
                this.less_time = this.init_time = end_time - gcore.SmartSocket.getTime();
                if (this.less_time < 0)
                    this.less_time = 0;

                this.startUpdate();
            }
        }

        // 更新当前面板信息
        this.updateCurPanelInfo();
    },

    // 更新当前面板信息
    updateCurPanelInfo: function() {
        // 判断是否显示红点

        // 处理tab1特殊情况

        if (this.cur_tab === 1) {
            var need_panel_index = this.getMyMacthPanelIndex();
            if (need_panel_index !== this.cur_panel) {
                this.updateTab(this.cur_tab);
                // this.tab_panels[this.cur_panel].setVisible(false);
                // this.tab_panels[need_panel_index].setVisible(true);
                // this.cur_panel = need_panel_index;
            }
        }

        if (this.tab_panels[this.cur_panel] && this.tab_panels[this.cur_panel].updateBaseInfo)
            this.tab_panels[this.cur_panel].updateBaseInfo(true);
    },

    cleanTimer: function() {
        if (this.update_timer) {
            this.stopUpdate()
            this.update_timer = null;
        }
    },

    update: function(dt) {
        var cur_time = Math.ceil(this.less_time - dt);
        if (cur_time < Math.ceil(this.less_time) || this.less_time === this.init_time) {
            var time_str = TimeTool.getTimeFormat(cur_time);
            this.match_time_lb.string = cc.js.formatStr(this.time_title, time_str);
        }
        if (this.less_time < 0)
            this.stopUpdate();
        this.less_time -= dt;
    },

    // 设置冠军赛阶段显示,这里需要判断自己是否进入了对应的阶段
    setChampionStepInfo: function() {
        var base_info = this.base_info;
        var role_info = this.role_info;
        var title_str = "";
        if (base_info.step == ArenaConst.champion_step.unopened) {
            title_str = cc.js.formatStr(Utils.TI18N("下次冠军赛 %s"), TimeTool.getYMD5(base_info.step_status_time));
        } else if (base_info.step == ArenaConst.champion_step.score) {
            if (base_info.step_status == ArenaConst.champion_step_status.unopened) {
                title_str = cc.js.formatStr(Utils.TI18N("下次冠军赛 %s"), TimeTool.getYMD5(base_info.step_status_time));
            } else if (base_info.step_status == ArenaConst.champion_step_status.opened) {
                title_str = cc.js.formatStr(Utils.TI18N("%s第%s回合"), ArenaConst.getMatchStepDesc(base_info.step), base_info.round);
            }
        } else if (base_info.step == ArenaConst.champion_step.match_32) {
            if (base_info.step_status == ArenaConst.champion_step_status.unopened) {
                title_str = Utils.TI18N("下轮32强赛");
            } else if (base_info.step_status == ArenaConst.champion_step_status.opened) {
                if (base_info.round <= 1) {
                    if (role_info.rank > 32) {
                        title_str = Utils.TI18N("16强赛");
                    } else {
                        title_str = cc.js.formatStr(Utils.TI18N("16强赛%s"), ArenaConst.getGroup(role_info.group));
                    }
                } else if (base_info.round == 2) {
                    if (role_info.rank > 16) {
                        title_str = Utils.TI18N("8强赛");
                    } else {
                        title_str = cc.js.formatStr(Utils.TI18N("8强赛%s"), ArenaConst.getGroup(role_info.group));
                    }
                } else if (base_info.round == 3) {
                    if (role_info.rank > 8) {
                        title_str = Utils.TI18N("4强赛")
                    } else {
                        title_str = cc.js.formatStr(Utils.TI18N("4强赛%s"), ArenaConst.getGroup(role_info.group));
                    }
                }
            }
        } else if (base_info.step == ArenaConst.champion_step.match_4) {
            if (base_info.step_status == ArenaConst.champion_step_status.opened) {
                if (base_info.round == 1) {
                    title_str = Utils.TI18N("半决赛")
                } else if (base_info.round == 2) {
                    title_str = Utils.TI18N("决赛")
                }
            } else if (base_info.step_status == ArenaConst.champion_step_status.over) {
                title_str = Utils.TI18N("本轮冠军赛已结束")
            }
        }
        this.panel_title_lb.string = title_str;
    },

    onClickCloseBtn: function() {
        if (this.cur_panel == 3 && this.tab_panels[this.cur_panel].isShowVS()) {
            this.tab_panels[this.cur_panel].closeVS();
            return;
        }

        this.ctrl.openArenaChampionMatchWindow(false);
    },

    onClickBtnTitle: function() {
        if (this.cur_tab == 1) {
            HeroController.getInstance().openFormGoFightPanel(true, PatrnerConst.Fun_Form.ArenaChampion, null, HeroConst.FormShowType.eFormSave);
        } else {
            this.ctrl.openArenaChampionMyGuessWindow(true);
        }
    },

    onClickExplainBtn: function() {
        var MainUiController = require("mainui_controller");
        MainUiController.getInstance().openCommonExplainView(true, Config.arena_champion_data.data_explain);
    },

    onClickShopBtn: function() {
        MallController.getInstance().openMallPanel(true, MallConst.MallType.ArenaShop);
    },

    onClickAwardsBtn: function() {
        this.ctrl.openArenaChampionRankAwardsWindow(true);
    },

})