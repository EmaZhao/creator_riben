// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 11:42:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");
var ArenaConst = require("arena_const");
var BattleController = require("battle_controller");

var ArenaChampionCurGuessPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_cur_guess_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("container/main_panel/guess_container/guess_label", this.root_wnd, cc.Label).string = Utils.TI18N("可竞猜");
        this.main_panel_nd = this.seekChild("main_panel");
        this.container_nd = this.seekChild("container");

        this.guess_value_lb = this.seekChild("guess_value", cc.Label);
        this.left_name_lb = this.seekChild("left_name", cc.Label);
        this.right_name_lb = this.seekChild("right_name", cc.Label);
        this.left_total_value_lb = this.seekChild("left_total_value", cc.Label);
        this.right_total_value_lb = this.seekChild("right_total_value", cc.Label);

        this.left_guess_btn_nd = this.seekChild("left_guess_btn");
        this.right_guess_btn_nd = this.seekChild("right_guess_btn");
        this.left_btn_title_lb = this.seekChild("left_btn_title", cc.Label);
        this.right_btn_title_lb = this.seekChild("right_btn_title", cc.Label);

        this.left_guess_btn_nd.btn_tag = 1;
        this.right_guess_btn_nd.btn_tag = 2;
        this.left_guess_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickGussBtn, this);
        this.right_guess_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickGussBtn, this);

        this.progress_bar_pb = this.seekChild("progress_bar", cc.ProgressBar);

        let img = this.seekChild("item_img_2", cc.Sprite);
        this.loadRes(PathTool.getIconPath("item", "19"), function(res) {
            img.spriteFrame = res;
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        // 更新竞猜的比赛数据
        this.addGlobalEvent(ArenaEvent.UpdateGuessMatchInfoEvent, function(data) {
            cc.log("竞猜数据");
            cc.log(data);
            if (data) {
                this.updateFightInfo(data);
            }
        }.bind(this));

        // 冠军赛可押注资产变化
        this.addGlobalEvent(ArenaEvent.UpdateRoleInfoBetEvent, function(can_bit, bit_type) {
            can_bit = can_bit || 0;
            this.guess_value_lb.string = can_bit;
            this.changeGuessBtnStatus(bit_type);
        }.bind(this));

        // 押注某场比赛的返回
        this.addGlobalEvent(ArenaEvent.UpdateBetMatchValueEvent, function(data) {
            if (data) {
                this.bet_data = data;
                this.updateBetMatchValue(data);
            }
            cc.log("押注后返回");
            cc.log(data);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updageWidget(params);
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.vs_panel) {
            this.vs_panel.deleteMe();
            this.vs_panel = null;
        }
    },

    onVisible: function(status) {
        if (status) {
            this.is_change_tab = true;
        }
    },


    // 更新竞猜信息
    updateMyGuessList: function() {

    },

    // 主界面基础信息更新
    updateBaseInfo: function() {
        if (this.root_wnd) {
            this.updageWidget();
            // this.ctrl.sender20253();
        }
    },

    updageWidget: function() {
        var base_info = this.base_info = this.model.getBaseInfo();
        var role_info = this.role_info = this.model.getRoleInfo();
        if (!base_info || !role_info) return;

        // self.is_change_tab = status // 是否是切换面板的,如果是切换面板,在收到20252协议之后,要判断base是2的就要根据20252的录像id进去查看录像
        if (base_info.step == ArenaConst.champion_step.unopened ||
            (base_info.step == ArenaConst.champion_step.score && (base_info.round == 0 ||
                (base_info.round === 1 && base_info.round_status == ArenaConst.champion_round_status.prepare)))) {
            this.root_wnd.active = false;
        } else {
            this.root_wnd.active = true;
            // if (base_info.flag !== 0) {
            this.ctrl.sender20253();
            // }
        }

        this.guess_value_lb.string = role_info.can_bet;
    },

    updateFightInfo: function(data) {
        if (!data) return;
        if (!this.vs_panel) {
            var VsPanel = require("arena_champion_vs_panel");
            this.vs_panel = new VsPanel();
            this.vs_panel.setParent(this.container_nd);
            this.vs_panel.show();
        }
        this.vs_panel.updateFightInfo(data);
        // if (!this.bet_data) {
        this.bet_data = data;
        this.updateBetMatchValue(data);
        // }
        if (this.root_wnd && this.root_wnd.active && !this.is_change_tab) {
            if (this.base_info && this.base_info.flag == 2 && data.replay_id != 0 && this.cur_data && !this.cur_data.replay_id) {
                var base_info_key = this.base_info.step + "_" + this.base_info.round;
                var data_key = data.step + "_" + data.round;
                if (base_info_key == data_key) {
                    BattleController.getInstance().csRecordBattle(data.replay_id);
                }
            }
        }

        this.cur_data = data;
        this.is_change_tab = false;
    },

    updateBetMatchValue: function(data) {
        var a_bet = data.a_bet || 0;
        var b_bet = data.b_bet || 0;
        this.left_total_value_lb.string = cc.js.formatStr(Utils.TI18N("赔率:%s"), parseInt(data.a_bet_ratio / 10) / 100);
        this.right_total_value_lb.string = cc.js.formatStr(Utils.TI18N("赔率:%s"), parseInt(data.b_bet_ratio / 10) / 100);

        if (this.bet_data) {
            this.bet_data.a_bet_ratio = data.a_bet_ratio;
            this.bet_data.b_bet_ratio = data.b_bet_ratio;
        }

        var total_bet = a_bet + b_bet;
        if (total_bet === 0) {
            this.progress_bar_pb.progress = 0.5;
        } else {
            this.progress_bar_pb.progress = a_bet / total_bet;
        }

        // name
        if (data.a_name)
            this.left_name_lb.string = data.a_name;

        if (data.b_name)
            this.right_name_lb.string = data.b_name;

        if (data.bet_type !== undefined)
            this.changeGuessBtnStatus(data.bet_type);

    },

    changeGuessBtnStatus: function(bet_type) {
        bet_type = bet_type || 0;
        if (this.guess_bet_type == bet_type) return;
        this.guess_bet_type = bet_type;
        var l_btn_str = "";
        var r_btn_str = "";

        if (bet_type == 0) {
            l_btn_str = Utils.TI18N("竞猜");
            r_btn_str = Utils.TI18N("竞猜");
        } else {
            if (bet_type == 1) {
                l_btn_str = Utils.TI18N("已竞猜");
                r_btn_str = Utils.TI18N("竞猜");
            } else {
                l_btn_str = Utils.TI18N("竞猜");
                r_btn_str = Utils.TI18N("已竞猜");
            }
        }
        this.left_btn_title_lb.string = l_btn_str;
        this.right_btn_title_lb.string = r_btn_str;
    },

    onClickGussBtn: function(event) {
        cc.log(event.target.btn_tag);

        var info_index = "a_";
        if (event.target.btn_tag == 2)
            info_index = "b_";

        if (this.guess_bet_type !== 0) {
            message(Utils.TI18N("已经竞猜过啦"))
        } else {
            if (this.base_info && this.role_info && this.bet_data) {
                if (this.base_info.round_status == ArenaConst.champion_round_status.guess) {
                    var data = {};
                    data.name = this.bet_data[info_index + "name"];
                    data.srv_id = this.bet_data[info_index + "srv_id"];
                    data.rid = this.bet_data[info_index + "rid"];
                    data.bet_ratio = this.bet_data[info_index + "bet_ratio"];
                    data.can_bet = this.role_info.can_bet;
                    data.bet_type = event.target.btn_tag;
                    this.ctrl.openArenaChampionGuessWindow(true, data);
                } else {
                    message(Utils.TI18N("当前阶段不可以押注"));
                }
            }
        }
    },
})