// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会boss主窗体
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RedbagController = require("redbag_controller");

var RedBagOpenView = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbg_open_view");
        this.win_type = WinType.Mini;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = RedbagController.getInstance();
        this.model = this.ctrl.getModel();

    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.seekChild("main_container");
        this.after_effect = this.seekChild("after_effect", sp.Skeleton);
        this.begin_effect = this.seekChild("begin_effect", sp.Skeleton);
        this.red_bg_sp = this.seekChild("red_bg", cc.Sprite);
    },



    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openRegBagWindow(false)
        }.bind(this))

    },

    openRootWnd: function (data) {
        this.data = data;
        if (data)
            this.showAfterEffect();
    },

    showAfterEffect: function () {
        if (this.red_bg_sp) {
            var config = Config.guild_data.data_guild_red_bag[this.data.type];
            if (config) {
                var res = PathTool.getUIIconPath("redbag", config.res_name);
                this.loadRes(res, function (sp) {
                    this.red_bg_sp.spriteFrame = sp;
                }.bind(this))
                this.red_bg_sp.node.opacity = 0;
                this.red_bg_sp.node.scale = 0.8;
                this.red_bg_sp.node.runAction(cc.fadeIn(0.5));
            }
        }

        if (this.after_effect) {
            this.after_effect.setToSetupPose();
            this.after_effect.clearTracks();
        }
        if (this.after_effect) {
            var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(261))
            this.loadRes(res, function (res_object) {
                this.after_effect.skeletonData = res_object;
                this.after_effect.setAnimation(1, PlayerAction.action_1, false)
            }.bind(this))
        }

        this.timer = gcore.Timer.set(function () {
            if (this.data) {
                var assets = Config.guild_data.data_guild_red_bag[this.data.type].assets;
                var list = [{ bid: Config.item_data.data_assets_label2id[assets], num: this.data.val }];
                require("mainui_controller").getInstance().openGetItemView(true, list, null, { is_backpack: true, is_red_bag: true, info_data: this.data });
                this.ctrl.openRegBagWindow(false);
            }
        }.bind(this), 1000, 1)


        if (this.begin_effect) {
            this.begin_effect.setToSetupPose();
            this.begin_effect.clearTracks();
        }
        if (this.begin_effect) {
            var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(261))
            this.loadRes(res, function (res_object) {
                this.begin_effect.skeletonData = res_object;
                this.begin_effect.setAnimation(1, PlayerAction.action_2, false)
            }.bind(this))
        }

    },

    closeCallBack: function () {
        if (this.after_effect) {
            this.after_effect.setToSetupPose();
            this.after_effect.clearTracks();
        }
        if (this.begin_effect) {
            this.begin_effect.setToSetupPose();
            this.begin_effect.clearTracks();
        }

        this.ctrl.openRegBagWindow(false)

    }

});

module.exports = RedBagOpenView;