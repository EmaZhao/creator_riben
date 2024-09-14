// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     战斗结算主界面
// <br/>Create: 2019-05-23 10:12:24
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleEvent = require("battle_event");
var BattleConst = require("battle_const");

var Battle_resultWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_result_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.result = arguments[0];
        this.fight_type = arguments[1];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("battle_controller").getInstance();
        this.item_list = {};
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.source_container = this.seekChild("container");
        this.title_container = this.seekChild("title_container");
        this.title_width = this.title_container.getContentSize().width;
        this.title_height = this.title_container.getContentSize().height;
        this.handleEffect(true);

        this.time_lb = this.seekChild("time_lb", cc.Label);
        this.comfirm_btn = this.seekChild("comfirm_btn");
        this.harm_btn = this.seekChild("harm_btn");
        this.harm_btn.active = false;
        this.scroll_view = this.seekChild("scroll_view");
        this.scroll_content_nd = this.seekChild(this.scroll_view, "content");

        Utils.getNodeCompByPath("container/title_lb", this.root_wnd, cc.Label).string = Utils.TI18N("获得物品");
        Utils.getNodeCompByPath("container/comfirm_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("确定");
        Utils.getNodeCompByPath("container/return_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("确定");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.harm_btn, function () {
            if (this.data && Utils.next(this.data) != null) {
                this.ctrl.openBattleHarmInfoView(true, this.data);
            }
        }.bind(this), 1)
        Utils.onTouchEnd(this.comfirm_btn, function () {
            this.ctrl.openFinishView(false, this.fight_type);
        }.bind(this), 1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        Utils.playButtonSound("c_win");
        this.setData(params.data, params.fight_type);
    },

    //剧情：{章节id,难度，副本id}
    setData: function (data, fight_type) {
        if (data) {
            this.data = data || {};
            this.fight_type = fight_type;
            this.reward_list = this.data.item_rewards;
            this.result = this.data.result;
            this.is_guide = this.data.is_guide;
            this.rewardViewUI();
            if (this.data && this.data.hurt_statistics) {
                this.harm_btn.active = true;
            } else {
                this.harm_btn.active = false;
            }
        }
    },

    handleEffect: function (status) {
        if (status == false) {
            if (this.play_effect) {
                this.play_effect.setToSetupPose();
                this.play_effect.clearTracks();
            }
        } else {
            if (this.play_effect == null) {
                this.play_effect = this.title_container.getComponent(sp.Skeleton);
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(103))
                this.loadRes(res, function (res_object) {
                    this.play_effect.skeletonData = res_object;
                    this.play_effect.setAnimation(1, PlayerAction.action_2, false)
                }.bind(this))
            }
        }
    },

    //奖励界面
    rewardViewUI: function () {
        var sum = this.reward_list.length;
        var col = 4;
        //算出最多多少行
        this.row = Math.ceil(sum / col);
        this.space = 30;
        var max_height = this.space + (this.space + 119) * this.row;
        this.max_height = Math.max(max_height, 210);
        this.scroll_content_nd.setContentSize(720, this.max_height);

        if (sum >= col) {
            sum = col;
        }
        var total_width = sum * 119 + (sum - 1) * this.space;
        this.start_x = (720 - total_width) * 0.5;
        if (this.row == 1) {
            this.start_y = this.max_height * 0.5;
        } else {
            this.start_y = this.max_height - this.space - 119 * 0.5;
        }
        for (var i in this.reward_list) {
            var v = this.reward_list[i];
            if (v.bid != null && v.num != null) {
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 1, false, true, true);
                item.setData({ bid: v.bid, num: v.num });
                var _x = this.start_x + 119 * 0.5 + (i % col) * (119 + this.space);
                var _y = this.start_y - Math.floor(i / col) * (119 + this.space);
                cc.log(_x, _y)
                item.setPosition(_x, _y);
                item.show();
                item.setParent(this.scroll_content_nd);
                this.item_list[i] = item;
            }
        }

        this.ItemAciton();
    },

    ItemAciton: function () {
        Utils.delayRun(this.source_container, 0.5, function () {
            this.updateTimer();
        }.bind(this))
    },

    updateTimer: function () {
        var time = 5;
        var call_back = function () {
            time = time - 1
            var new_time = Math.ceil(time);
            var str = new_time + Utils.TI18N("秒后关闭");
            if (this.time_lb) {
                this.time_lb.string = str;
            }
            if (new_time <= 0) {
                gcore.Timer.del("result_timer");
                this.ctrl.openFinishView(false, this.fight_type);
            }
        }.bind(this)
        gcore.Timer.set(call_back, 1000, -1, "result_timer");
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.root_wnd.stopAllActions();
        this.source_container.stopAllActions();
        gcore.Timer.del("result_timer");
        require("hero_controller").getInstance().openEquipTips(false)
        require("tips_controller").getInstance().closeAllTips();

        this.handleEffect(false)
        if (this.model.getBattleScene() && this.ctrl.getIsSameBattleType(this.fight_type)) {
            this.model.result(this.data, null)
        }
        if (this.fight_type == BattleConst.Fight_Type.Darma) {
            gcore.GlobalEvent.fire(BattleEvent.MOVE_DRAMA_EVENT, this.fight_type);
        }
        if (this.item_list) {
            for (var i in this.item_list) {
                var v = this.item_list[i];
                if (v) {
                    v.deleteMe();
                    v = null;
                }
            }
            this.item_list = null;
        }
        this.ctrl.openFinishView(false, this.fight_type)
        gcore.GlobalEvent.fire(BattleEvent.CLOSE_RESULT_VIEW, this.fight_type);
    },
})