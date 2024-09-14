// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-24 16:55:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LadderController = require("ladder_controller");
var PlayerHead = require("playerhead");
var BattleController = require("battle_controller");
var RoleController = require("role_controller");
var BattleEvent = require("battle_event");

var Ladder_battle_resultWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_battle_result_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.item_list = {};
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.container = this.seekChild("container");
        this.seekChild(this.container, "get_title", cc.Label).string = Utils.TI18N("获\\n得\\n奖\\n励");

        this.success_bg = this.seekChild(this.container, "success_bg");
        this.fail_bg = this.seekChild(this.container, "fail_bg");

        this.confirm_btn = this.seekChild(this.container, "confirm_btn");

        this.time_lb = this.seekChild(this.container, "time_label", cc.Label);
        this.left_time = 3;
        this.time_lb.string = Utils.TI18N("3秒后关闭");

        this.harm_btn = this.seekChild(this.container, "harm_btn");
        this.harm_btn.active = false;

        this.top_head = new PlayerHead();
        this.top_head.show();
        this.top_head.setScale(0.8);
        this.top_head.setPosition(153, 377);
        this.top_head.setParent(this.top_head);

        this.top_name_lb = this.seekChild(this.container, "top_name", cc.Label);
        this.top_result_rt = this.seekChild(this.container, "top_result", cc.RichText);

        this.bottom_head = new PlayerHead();
        this.bottom_head.show();
        this.bottom_head.setScale(0.8);
        this.bottom_head.setParent(this.container);
        this.bottom_name_lb = this.seekChild(this.container, "bottom_name", cc.Label);
        this.bottom_result_rt = this.seekChild(this.container, "bottom_result", cc.RichText);

        this.title_container = this.seekChild("title_container");
        this.title_width = this.title_container.getContentSize().width;
        this.title_height = this.title_container.getContentSize().height;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLadderBattleResultWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.confirm_btn, function () {
            this.ctrl.openLadderBattleResultWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.harm_btn, function () {
            if (this.data) {
                BattleController.getInstance().openBattleHarmInfoView(true, this.data);
            }
        }.bind(this), 1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        Utils.playButtonSound("c_arenasettlement");
        if (data != null) {
            this.data = data;
            this.setBaseInfo();
            this.setRewardsList();
            this.success_bg.active = data.result == 1;
            this.fail_bg.active = data.result == 2;
            this.handleEffect(true);
            this.openCloseWindowTimer(true);
            if (data.hurt_statistics) {
                this.harm_btn.active = true;
            }
        }
    },

    setBaseInfo: function () {
        if (this.data == null) return
        this.top_head.setHeadRes(this.role_vo.face_id);
        this.top_name_lb.string = this.role_vo.name;
        this.top_head.setLev(this.role_vo.lev);

        this.bottom_head.setHeadRes(this.data.def_face);
        this.bottom_name_lb.string = this.data.def_name;
        this.bottom_head.setLev(this.data.def_lev);

        let top_str = "";
        let up_res = PathTool.getUIIconPath("common", "common_1086");
        let down_res = PathTool.getUIIconPath("common", "common_1087");

        let my_rank = this.data.atk_rank;
        if (!my_rank || my_rank == 0) {
            my_rank = Utils.TI18N("暂无");
        } else {
            my_rank = String(my_rank);
        }
        if (this.data.atk_change_rank == 0) { //排名不变
            top_str = cc.js.formatStr(Utils.TI18N("排名：%s"), my_rank);
        } else {
            if (this.data.atk_change_rank > 0) {  //排名上升
                top_str = top_str + cc.js.formatStr("排名:<color=#14ff32>%s</c><img src='%s'/>", my_rank, up_res);
                if (this.data.is_change_best_rank == 1) {
                    top_str = top_str + cc.js.formatStr("    <img src='%s' />", PathTool.getUIIconPath("ladder", "txt_cn_ladder_highest"))
                }
            } else {
                top_str = cc.js.formatStr(Utils.TI18N("排名:<color=#ff5050>%s</c><img src='%s'/>"), my_rank, down_res);
            }
        }

        this.top_result_rt.string = top_str;

        let bottom_str = "";
        let def_rank = this.data.def_rank;
        if (!def_rank || def_rank == 0) {
            def_rank = Utils.TI18N("暂无");
        } else {
            def_rank = String(def_rank);
        }
        if (this.data.def_change_rank == 0) {
            bottom_str = cc.js.formatStr(Utils.TI18N("排名：%s"), def_rank)
        } else {
            if (this.data.def_change_rank > 1) {
                bottom_str = cc.js.formatStr(Utils.TI18N("排名:<color=#14ff32>%s</c><img src='%s'/>"), def_rank, up_res);
            } else {
                bottom_str = cc.js.formatStr(Utils.TI18N("排名:<color=#ff5050>%s</c><img src='%s'/>"), def_rank, down_res)
            }
        }
        this.bottom_result_rt.string = bottom_str;
    },

    setRewardsList: function () {
        if (this.data == null || this.data.reward == null || Utils.next(this.data.reward) == null) return
        let scale = 0.8;
        let off = 40 / (this.data.reward.length);
    },

    handleEffect: function (status) {
        if (status == false) {
            if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.clearTracks();
            }
        } else {
            let effect_id = 103;
            let action = PlayerAction.action_2;
            if (this.data.result == 2) {
                effect_id = 104;
                action = PlayerAction.action;
                this.title_container.y = 912;
            }
            if (this.special_sk) {
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(effect_id))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, action, true)
                }.bind(this))
            }
        }
    },

    openCloseWindowTimer: function (status) {
        if (status) {
            if (this.close_timer == null) {
                this.close_timer = gcore.Timer.set(function () {
                    this.left_time = this.left_time - 1;
                    if (this.left_time > 0) {
                        this.time_lb.string = cc.js.formatStr(Utils.TI18N("%s秒后关闭"), this.left_time);
                    } else {
                        gcore.Timer.del(this.close_timer)
                        this.close_timer = null;
                        this.ctrl.openLadderBattleResultWindow(false);
                    }
                }.bind(this), 1000, -1)
            }
        } else {
            if (this.close_timer != null) {
                gcore.Timer.del(this.close_timer)
                this.close_timer = null;
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.top_head) {
            this.top_head.deleteMe();
            this.top_head = null;
        }
        if (this.bottom_head) {
            this.bottom_head.deleteMe();
            this.bottom_head = null;
        }
        this.handleEffect(false);
        this.openCloseWindowTimer(false);
        if (this.item_list) {
            for (let k in this.item_list) {
                let v = this.item_list[k];
                if (v) {
                    v.deleteMe();
                    v = null;
                }
            }
            this.item_list = null;
        }
        gcore.GlobalEvent.fire(BattleEvent.CLOSE_RESULT_VIEW);
        this.ctrl.openLadderBattleResultWindow(false);
    },
})