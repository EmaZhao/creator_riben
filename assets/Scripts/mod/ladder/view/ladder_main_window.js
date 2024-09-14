// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     跨服天梯mainview
// <br/>Create: 2019-07-24 16:56:38
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var LadderController = require("ladder_controller");
var LadderRoleItem = require("ladder_role_item");
var TimeTool = require("timetool");
var MainuiController = require("mainui_controller");
var CommonAlert = require("commonalert");
var LadderConst = require("ladder_const");
var LadderEvent = require("ladder_event");

var Ladder_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_main_window");
        // this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.role_panels = {};
        this.role_items = {};
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();

        this.white_color = new cc.Color(255, 255, 255, 255);
        this.color_1 = new cc.Color(71, 132, 37, 255);
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        let background = this.seekChild("background");
        background.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("bigbg_58"), function (sp) {
            background.getComponent(cc.Sprite).spriteFrame = sp;
        }.bind(this))

        this.main_container = this.seekChild("main_container");

        this.top_panel = this.seekChild(this.main_container, "top_panel");

        let win_title = this.seekChild(this.top_panel, "win_title", cc.Label);
        win_title.string = Utils.TI18N("天梯争霸");
        this.btn_rule = this.seekChild(this.top_panel, "btn_rule");
        this.btn_role = this.seekChild(this.top_panel, "btn_role");
        this.btn_log = this.seekChild(this.top_panel, "btn_log");
        this.btn_rank = this.seekChild(this.top_panel, "btn_rank");
        this.btn_award = this.seekChild(this.top_panel, "btn_award");
        this.btn_shop = this.seekChild(this.top_panel, "btn_shop");

        this.bottom_panel = this.seekChild(this.main_container, "bottom_panel");
        let black_bg = this.seekChild(this.bottom_panel, "black_bg");
        let count_title = this.seekChild(this.bottom_panel, "count_title", cc.Label);
        count_title.string = Utils.TI18N("挑战次数:");
        this.count_label_lb = this.seekChild(this.bottom_panel, "count_label", cc.Label);
        let tips_label = this.seekChild(this.main_container, "tips_label", cc.Label);
        tips_label.string = Utils.TI18N("快速挑战排名不变");
        this.time_title_lb = this.seekChild(this.bottom_panel, "time_title", cc.Label);
        this.time_title_lb.string = Utils.TI18N("距离结束：");
        this.time_label_lb = this.seekChild(this.bottom_panel, "time_label", cc.Label);

        let score_bg = this.seekChild(this.main_container, "score_bg");
        this.score_label_lb = this.seekChild(score_bg, "score_label", cc.Label);
        this.score_label_lb.string = this.role_vo.sky_coin;
        let rank_bg = this.seekChild(this.main_container, "rank_bg");
        let rank_title = this.seekChild(rank_bg, "rank_title", cc.Label);
        rank_title.string = Utils.TI18N("排名:");
        this.rank_label_lb = this.seekChild(rank_bg, "rank_label", cc.Label);

        this.close_btn = this.seekChild(this.main_container, "close_btn");
        this.refresh_btn = this.seekChild(this.main_container, "refresh_btn");
        this.refresh_btn._can_touch = true;
        this.refresh_btn_label_lb = this.seekChild(this.refresh_btn, "label", cc.Label);
        this.refresh_btn_label_lo = this.seekChild(this.refresh_btn, "label", cc.LabelOutline);
        this.refresh_btn_label_lb.string = Utils.TI18N("刷新");
        this.challenge_btn = this.seekChild(this.main_container, "challenge_btn");
        this.challenge_btn_label_lb = this.seekChild(this.challenge_btn, "label", cc.Label);
        this.challenge_btn_label_lb.string = Utils.TI18N("一键挑战");
        this.add_btn = this.seekChild(this.bottom_panel, "add_btn");

        for (let i = 1; i <= 5; i++) {
            let role_panel = this.seekChild(this.main_container, "role_pos_" + i);
            this.role_panels[i] = role_panel;
        }
        this.role_panel_size = this.role_panels[1].getContentSize();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openMainWindow(false);
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_rule, function () {
            MainuiController.getInstance().openCommonExplainView(true, Config.sky_ladder_data.data_explain);
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_role, function () {
            this.ctrl.openLadderTopThreeWindow(true);
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_log, function () {
            this.ctrl.openLadderLogWindow(true);
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_rank, function () {
            this.ctrl.openLadderRankWindow(true);
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_award, function () {
            this.ctrl.openLadderAwardWindow(true);
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_shop, function () {
            this.ctrl.openLadderShopWindow(true);
        }.bind(this), 1)

        //添加挑战次数
        Utils.onTouchEnd(this.add_btn, function () {
            let is_open = this.model.getLadderIsOpen();
            if (!is_open) {
                let txt_cfg = Config.sky_ladder_data.data_const["close_text"];
                if (txt_cfg) {
                    message(cc.js.formatStr(Utils.TI18N("每%s天梯争霸"), txt_cfg.desc));
                }
            }
            if (this.myBaseInfo) {
                let buy_combat_num = this.myBaseInfo.buy_combat_num || 0;
                let cost_config = Config.sky_ladder_data.data_buy_num[buy_combat_num + 1];
                if (cost_config) {
                    if (this.role_vo.vip_lev >= cost_config.vip) {
                        let res = PathTool.getItemRes(Config.ItemData.data_assets_label2id.gold)
                        let msg = cc.js.formatStr(Utils.TI18N("确定消耗<img src='%s'/>%s增加一次挑战次数吗？"), Config.ItemData.data_assets_label2id.gold, cost_config.cost);
                        CommonAlert.show(msg, Utils.TI18N("确定"), function () {
                            this.ctrl.requestBuyChallengeCount();
                        }.bind(this), Utils.TI18N("取消"), null, 2, null, { resArr: [res] });
                    } else {
                        message(Utils.TI18N("提升VIP等级可增加购买次数"))
                    }
                } else {
                    message(Utils.TI18N("当前已经购买达到上限"))
                }
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.refresh_btn, function () {
            let is_open = this.model.getLadderIsOpen();
            if (is_open) {
                this.ctrl.requestRefreshEnemyList();
            } else {
                let txt_cfg = Config.sky_ladder_data.data_const["clost_text"];
                if (txt_cfg) {
                    message(cc.js.formatStr(Utils.TI18N("每%s天梯争霸"), txt_cfg.desc));
                }
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.challenge_btn, function () {
            let is_open = this.model.getLadderIsOpen();
            if (!is_open) {
                let txt_cfg = Config.sky_ladder_data.data_const["close_text"];
                if (txt_cfg) {
                    message(cc.js.formatStr(Utils.TI18N("每%s天梯争霸"), txt_cfg.desc));
                }
                return
            }
            var fun = function () {
                this.ctrl.checkJoinLadderBattle(null, null, true);
            }.bind(this)
            let str = Utils.TI18N("一键挑战将直接获得奖励，是否继续？\n\n\n                          <size=22>(消耗一次挑战次数)</size>");
            CommonAlert.show(str, Utils.TI18N("确定"), fun, Utils.TI18N("取消"), null, 2, null);
        }.bind(this), 1)

        //个人数据更新
        this.addGlobalEvent(LadderEvent.UpdateLadderMyBaseInfo, function () {
            this.refreshMyBaseInfo();
        }, this)

        //更新所有对手列表
        this.addGlobalEvent(LadderEvent.UpdateAllLadderEnemyList, function () {
            this.refreshRoleList();
        }, this)

        //积分更新
        if (this.role_vo != null) {
            if (this.role_assets_event == null) {
                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (key == "sky_coin") {
                        this.score_label_lb.string = value;
                    }
                }.bind(this))
            }
        }

        //活动开启/关闭
        this.addGlobalEvent(LadderEvent.UpdateLadderOpenStatus, function () {
            this.refreshMyBaseInfo();
        }, this)

        //红点
        this.addGlobalEvent(LadderEvent.UpdateLadderRedStatus, function () {
            this.refrehsBtnRedStatus(bid, status);
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.ctrl.requestLadderMyBaseInfo();
        this.ctrl.requestLadderEnemyListData();
        this.refrehsBtnRedStatus();
    },

    refreshRoleList: function () {
        let enemy_datas = this.model.getLadderEnemyListData();
        cc.log("enemy_datas==", enemy_datas)
        let sortFunc = function (objA, objB) {
            if (objA.rank != 0 && objB.rank != 0) {
                return objA.rank - objB.rank
            } else if (objA.rank == 0 && objB.rank != 0) {
                return 1
            } else if (objA.rank != 0 && objB.rank == 0) {
                return -1
            } else {
                return 1
            }
        }
        // enemy_datas.sort(sortFunc);
        //循环
        this.list_index = 1;
        this.startUpdate(5, function () {
            let index = this.list_index;
            let role_item = this.role_items[index];
            if (!role_item) {
                role_item = new LadderRoleItem();
                let role_panel = this.role_panels[index];
                role_item.setPosition(cc.v2(this.role_panel_size.width / 2, this.role_panel_size.height - 140));
                role_item.setParent(role_panel);
                this.role_items[index] = role_item;
            }
            let enemy_data = enemy_datas[index];
            if (enemy_data && Utils.next(enemy_data) != null) {
                role_item.setData(enemy_data);
                role_item.setVisible(true);
            } else {
                role_item.setVisible(false);
            }
            this.list_index += 1;
        }.bind(this), 1000 / 5)
    },

    //刷新个人信息数据
    refreshMyBaseInfo: function () {
        this.myBaseInfo = this.model.getLadderMyBaseInfo();
        let is_open = this.model.getLadderIsOpen();
        this.count_label_lb.string = this.myBaseInfo.can_combat_num || 0;
        //今日剩余购买次数
        if (!this.left_buy_count) {
            this.left_buy_count = Utils.createRichLabel(20, this.white_color, cc.v2(0.5, 0.5), cc.v2(590, 10));
            this.left_buy_count.setParent(this.bottom_panel);
        }
        let left_count = this.model.getTodayLeftBuyCount();
        this.left_buy_count.string = cc.js.formatStr(Utils.TI18N("<color=#fff8bf><outline=2 color=#000000>(剩余购买次数:</outline></c><color=#39e522><outline=2 color=#000000>%d</outline></c><color=#fff8bf><outline=2 color=#000000>)</outline></c>", left_count));

        if (!is_open || !this.myBaseInfo.rank || this.myBaseInfo.rank == 0) {
            this.rank_label_lb.string = Utils.TI18N("暂无");
        } else {
            this.rank_label_lb.string = this.myBaseInfo.rank;
        }
        this.ref_time = this.myBaseInfo.ref_time || 0;      //下次可刷新时间
        this.combat_time = this.myBaseInfo.combat_time || 0;//结束时间

        let cur_time = gcore.SmartSocket.getTime();
        let com_left_time = this.combat_time - cur_time;
        if (com_left_time < 0) {
            com_left_time = 0;
        }
        //活动开启显示剩余时间、活动未开启显示参赛条件
        if (!is_open) {
            this.time_label_lb.node.active = false;
            this.time_title_lb.node.active = false;
            if (!this.join_text) {
                this.join_text = Utils.createRichLabel(22, this.white_color, cc.v2(0.5, 0.5), cc.v2(346, 38.5));
                this.join_text.setParent(this.bottom_panel);
            }
            this.join_text.node.active = true;
            let rank_cfg = Config.sky_ladder_data.data_const["arena_rank"];
            if (rank_cfg) {
                this.join_text.string = cc.js.formatStr(Utils.TI18N("color=#fff8bf><outline=2 color=#000000>参赛条件:竞技场排名前</outline></c>color=#39e522><outline=2 color=#000000>%d</outline></c>color=#fff8bf><outline=2 color=#000000>名</outline></c>", rank_cfg.val));
            }
        } else {
            this.time_label_lb.node.active = true;
            this.time_title_lb.node.active = true;
            this.time_label_lb.string = TimeTool.getTimeFormat(com_left_time);
            if (this.join_text) {
                this.join_text.node.active = false;
            }
            this.openLadderTimer(true);
        }

        let ref_left_time = this.ref_time - cur_time;
        if (ref_left_time <= 0 && this.refresh_btn._can_touch == false) {
            // setChildUnEnabled(true, self.refresh_btn)
            this.refresh_btn._can_touch = true;
            this.refresh_btn_label_lb.string = Utils.TI18N("刷新");
            // this.refresh_btn_label_lo.color = this.color_1;
            this.refresh_btn_label_lo.enabled = true;
        } else if (ref_left_time > 0 && this.refresh_btn._can_touch == true) {
            // setChildUnEnabled(true, self.refresh_btn)
            this.refresh_btn._can_touch = false;
            this.refresh_btn_label_lb.string = cc.js.formatStr(Utils.TI18N("%s秒"), ref_left_time);
            this.refresh_btn_label_lo.enabled = false;
        }
    },

    //计时器
    openLadderTimer: function (status) {
        if (status == true) {
            if (this.ladder_timer == null) {
                this.ladder_timer = gcore.Timer.set(function () {
                    let cur_time = gcore.SmartSocket.getTime();
                    let com_left_time = this.combat_time - cur_time;
                    let ref_left_time = this.ref_time - cur_time;
                    if (com_left_time <= 0 && ref_left_time <= 0) {
                        gcore.Timer.del(this.ladder_timer);
                        this.ladder_timer = null;
                    }
                    if (com_left_time < 0) {
                        com_left_time = 0;
                    }
                    if (com_left_time <= 0) {
                        this.time_label_lb.node.active = false;
                        this.time_title_lb.node.active = false;
                        if (this.join_text) {
                            this.join_text.node.active = true;
                        }
                    } else {
                        this.time_label_lb.node.active = true;
                        this.time_title_lb.node.active = true;
                        this.time_label_lb.string = TimeTool.getTimeFormat(com_left_time);
                    }
                    if (ref_left_time <= 0) {
                        if (this.refresh_btn._can_touch == false) {
                            this.refresh_btn._can_touch = true;
                            // this.refresh_btn_label_lo.color = this.color_1;
                            // setChildUnEnabled(true, self.refresh_btn)
                        }
                        this.refresh_btn_label_lb.string = Utils.TI18N("刷新");
                    } else if (ref_left_time > 0) {
                        if (this.refresh_btn._can_touch == true) {
                            // setChildUnEnabled(true, self.refresh_btn)
                            this.refresh_btn._can_touch = false;
                            this.refresh_btn_label_lo.enabled = false;
                        }
                        this.refresh_btn_label_lb.string = cc.js.formatStr(Utils.TI18N("%s秒"), ref_left_time);
                    }
                }.bind(this), 1000, 1)
            }
        } else {
            if (this.ladder_timer != null) {
                gcore.Timer.del(this.ladder_timer);
                this.ladder_timer = null;
            }
        }
    },

    //红点
    refrehsBtnRedStatus: function (bid, status) {
        if (bid == LadderConst.RedType.TopThree) {
            Utils.addRedPointToNodeByStatus(this.btn_role, status);
        } else if (bid == LadderConst.RedType.BattleLog) {
            Utils.addRedPointToNodeByStatus(this.btn_log, status);
        } else {
            let top_three_status = this.model.checkRedIsShowByRedType(LadderConst.RedType.TopThree);
            Utils.addRedPointToNodeByStatus(this.btn_role, top_three_status);
            let log_status = this.model.checkRedIsShowByRedType(LadderConst.RedType.BattleLog);
            Utils.addRedPointToNodeByStatus(this.btn_log, log_status);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.role_vo) {
            if (this.role_assets_event) {
                this.role_vo.unbind(this.role_assets_event);
                this.role_assets_event = null;
            }
            this.role_vo = null;
        }
        for (let k in this.role_items) {
            let item = this.role_items[k];
            if (item) {
                item.deleteMe();
                item = null;
            }
        }
        this.role_items = null;
        this.openLadderTimer(false);
        this.ctrl.openMainWindow(false);
    },
})