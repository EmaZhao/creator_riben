// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     联盟战 进攻一览item
// <br/>Create: 2019-05-09 17:03:27
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GuildwarEvent = require("guildwar_event");
var GuildwarConst = require("guildwar_const");

var Guildwar_attk_look_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_attk_look_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("container");
        this.build_sp = this.seekChild("build", cc.Sprite);
        this.name_lb = this.seekChild("name_label", cc.Label);
        this.attk_lb = this.seekChild("attk_label", cc.Label);
        this.tips_lb = this.seekChild("tips_label", cc.Label);
        this.tips_lb.string = Utils.TI18N("已达被挑战上限");
        this.tips_lb_2 = this.seekChild("tips_label_2", cc.Label);
        this.tips_lb_2.string = Utils.TI18N("挑战废墟提升增益");
        this.confirm_btn = this.seekChild("confirm_btn");
        this.confirm_btn_lb = this.seekChild(this.confirm_btn, "label", cc.Label);

        var temp_index = {
            [1]: 3,
            [2]: 2,
            [3]: 1
        }
        this.star_list = {};
        for (var i = 1; i < 4; i++) {
            var star = this.seekChild("star_" + i);
            if (star) {
                star.active = false;
                var index = temp_index[i];
                this.star_list[index] = star;
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.confirm_btn, function () {
            var status = this.model.getGuildWarStatus();
            if (status == GuildwarConst.status.settlement) {
                message(Utils.TI18N("本次公会战已结束啦，不能再挑战了哦"));
            } else if (this.data) {
                this.ctrl.openAttkPositionWindow(true, this.data.pos);
            }
        }.bind(this), 1)
    },

    setData: function (data) {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
        }
        if (data != null) {
            this.data = data;
            if (this.update_self_event == null) {
                this.update_self_event = this.data.bind(GuildwarEvent.UpdateGuildWarPositionDataEvent, function () {
                    this.onShow();
                }, this)
            }
        }
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        if (this.data.hp <= 0) {
            this.loadRes(PathTool.getUIIconPath("guildwar", "guildwar_1020"), function (sp) {
                this.build_sp.spriteFrame = sp;
            }.bind(this))
            var max_count = 0;
            var count_config = Config.guild_war_data.data_const.ruins_challange_limit;
            if (count_config) {
                max_count = count_config.val;
            }
            if (this.data.relic_def_count >= max_count) {
                this.tips_lb.node.active = true;
                this.confirm_btn.active = false;
                this.tips_lb_2.node.active = false;
            } else {
                this.tips_lb.node.active = false;
                this.confirm_btn.active = true;
                this.tips_lb_2.node.active = true;
            }
            if (!this.special_sk) {
                this.special_sk = this.seekChild("special_sk", sp.Skeleton);
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(326))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action, true)
                }.bind(this))
            }
            this.special_sk.node.active = true;
        } else {
            this.loadRes(PathTool.getUIIconPath("guildwar", "guildwar_1017"), function (sp) {
                this.build_sp.spriteFrame = sp;
            }.bind(this))
            this.tips_lb.node.active = false;
            this.confirm_btn.active = true;
            this.tips_lb_2.node.active = false;
            if (this.special_sk) {
                this.special_sk.node.active = false;
            }
        }

        for (var i = 1; i < 4; i++) {
            var star = this.star_list[i];
            if (this.data.hp < i) {
                star.active = true;
            } else {
                star.active = false;
            }
        }

        this.name_lb.string = cc.js.formatStr(Utils.TI18N("所属玩家：%s"), this.data.name);
        this.attk_lb.string = cc.js.formatStr(Utils.TI18N("战力：%s"), this.data.power);
    },


    suspendAllActions: function () {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
            this.data = null;
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.special_sk) {
            this.special_sk.setToSetupPose();
            this.special_sk.clearTracks();
        }
        this.suspendAllActions();
    },
})