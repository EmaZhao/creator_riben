// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-28 15:01:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var BattleController = require("battle_controller");
var BattleDramaController = require("battle_drama_controller");
var BattleConst = require("battle_const");
var BattleEvent = require("battle_event");

var Battle_failWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_fail_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.is_full_screen = false;

        this.fight_type = arguments[0];
        this.result = arguments[1];
        this.data = arguments[2];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.ctrl = BattleController.getInstance();
        this.model = this.ctrl.getModel();
        this.drama_ctrl = BattleDramaController.getInstance();
        this.jump_ctrl = require("jump_controller").getInstance();

        this.is_running = false;
        this.effect_list = {};
        this.x = 100;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        Utils.playButtonSound("c_fail");
        this.source_container = this.seekChild("container");
        this.title_container = this.seekChild("title_container");
        this.title_width = this.title_container.getContentSize().width;
        this.title_height = this.title_container.getContentSize().height;
        this.btn = this.seekChild(this.source_container, "btn");
        this.special_sk = this.seekChild("title_container", sp.Skeleton);

        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;

        var func = function () {
            this.createButton()
            this.is_running = false;
        }.bind(this)
        this.source_container.runAction(cc.sequence(cc.fadeIn(0, 2), cc.callFunc(func)))

        this.comfirm_btn = this.seekChild("comfirm_btn")
        this.help_btn = this.seekChild("help_btn")

        this.time_label_rt = this.seekChild("time_label", cc.RichText);
        this.harm_btn = this.seekChild("harm_btn");

        if (this.data && this.data.hurt_statistics) {
            this.harm_btn.active = true;
        } else {
            this.harm_btn.active = false;
        }
        var faildes = this.source_container.getChildByName("desc_fail_label").getComponent(cc.RichText);
        faildes.string = "<outline width=2,color=#7b5132>     失敗しても挫けないで！\n下記の方法で実力を上げよう</outline>";
        var strengthstr = this.source_container.getChildByName("help_btn").getChildByName("label").getComponent(cc.Label);
        strengthstr.string = "成長ヒント"
        this.handleEffect(true);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.comfirm_btn, function () {
            this.ctrl.openFailFinishView(false, this.fight_type)
        }.bind(this), 1)
        Utils.onTouchEnd(this.harm_btn, function () {
            if (this.data && Utils.next(this.data) != null) {
                this.ctrl.openBattleHarmInfoView(true, this.data);
            }
        }.bind(this), 1)
        Utils.onTouchEnd(this.help_btn, function () {
            this.ctrl.openFailFinishView(false, this.fight_type)
            this.jump_ctrl.jumpViewByEvtData([16]);
        }.bind(this), 1)
    },

    createButton: function () {
        var btn_list = [];
        var base_data = this.drama_ctrl.getModel().getDramaData();

        var config = Config.battle_act_data.data_get_fail_data;
        if (config && base_data) {
            var max_dun_id = base_data.max_dun_id;
            for (var i in config) {
                var v = config[i];
                if (v.open_dungeon <= max_dun_id) {
                    btn_list.push(v);
                }
            }
        }
        if (this.items_list == null) {
            this.items_list = {};
        }
        this.clearItems();
        var length = Math.min(4, btn_list.length);
        var func = function (go_btn, config) {
            go_btn.on(cc.Node.EventType.TOUCH_END, function () {
                this.openPanelByConfig(config);
                this.ctrl.openFailFinishView(false, this.fight_type);
            }, this)
        }.bind(this)
        for (var i = 0; i < length; i++) {
            var config = btn_list[i];
            if (config) {
                var obj = {};
                obj.btn = this.seekChild("btn_" + config.val_key);
                obj.img = obj.btn.getComponent(cc.Sprite);
                obj.label = this.seekChild(obj.btn, "label", cc.Label);
                this.loadRes(PathTool.getUIIconPath("battlefail", config.icon), function (bg_sf) {
                    obj.img.spriteFrame = bg_sf;
                }.bind(this));
                obj.label.string = config.icon_name;
                this.items_list[i] = obj;
            }
            var go_btn = this.items_list[i].btn;
            var btn_label = this.items_list[i].label;
            if (go_btn) {
                go_btn.active = true;;
                func(go_btn, config);
            }
            if (btn_label) {
                btn_label.string = config.icon_name;
            }
        }
        this.updateTimer();
    },

    updateTimer: function () {
        var time = 5;
        var call_back = function () {
            time = time - 1
            var new_time = Math.ceil(time);
            var str = new_time + Utils.TI18N("秒后关闭");
            if (this.time_label_rt) {
                this.time_label_rt.string = str;
            }
            if (new_time <= 0) {
                gcore.Timer.del("fail_result_timer");
                this.ctrl.openFailFinishView(false, this.fight_type);
            }
        }.bind(this)
        gcore.Timer.set(call_back, 1000, -1, "fail_result_timer");
    },

    handleEffect: function (status) {
        if (status == false) {
            if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.clearTracks();
                this.special_sk.node.active = false;
            }
        } else {
            if (this.special_sk) {
                this.special_sk.node.active = true;
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(104))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action, false)
                }.bind(this))
            }
        }
    },

    clearItems: function () {
        if (this.items_list) {
            for (var k in this.items_list) {
                var v = this.items_list[k];
                if (v.btn) {
                    v.btn.active = false;
                }
            }
        }
    },

    openPanelByConfig: function (config) {
        if (config.val_key == BattleConst.JumpType.Summon)
            this.jump_ctrl.jumpViewByEvtData([1])
        else if (config.val_key == BattleConst.JumpType.HeroBag)
            this.jump_ctrl.jumpViewByEvtData([19])
        else if (config.val_key == BattleConst.JumpType.Forge)
            this.jump_ctrl.jumpViewByEvtData([26])
        else if (config.val_key == BattleConst.JumpType.Hallows)
            this.jump_ctrl.jumpViewByEvtData([20])
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {

        // //联盟战战败有奖励需要展示
        // if (this.fight_type == BattleConst.Fight_Type.GuildWar && this.data && this.data.item_rewards) {
        //     var items = {};
        //     for (var i in this.data.item_rewards) {
        //         var v = this.data.item_rewards[i];
        //         items[i] = {};
        //         items[i].bid = v.bid;
        //         items[i].num = v.num;
        //     }
        //     require("mainui_controller").getInstance().openGetItemView(true, items, 0, { is_backpack: true });
        // }

        gcore.Timer.del("fail_result_timer");
        this.handleEffect(false);
        
        if (this.model.getBattleScene() && this.ctrl.getIsSameBattleType(this.fight_type)) {
            var data = { combat_type: this.fight_type, result: this.result };
            this.model.result(data, null)
        }
        this.ctrl.openFailFinishView(false, this.fight_type);
        gcore.GlobalEvent.fire(BattleEvent.CLOSE_RESULT_VIEW, this.fight_type)

    },
})