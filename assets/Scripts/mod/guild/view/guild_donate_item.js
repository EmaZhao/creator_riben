// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      捐献单列
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");

var GuildDonateItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_donate_item");
        this.ctrl = GuildController.getInstance();
        this.model = this.ctrl.getModel();
        this.awards_list = {};
    },

    initPanel: function () {
        this.donate_btn = this.seekChild("donate_btn", cc.Button);
        this.donate_btn_label = this.seekChild(this.donate_btn.node, "label", cc.Label);
        this.donate_btn_lo = this.seekChild(this.donate_btn.node, "label", cc.LabelOutline);
        this.donate_btn_label.string = Utils.TI18N("捐献");

        this.pass_donate = this.seekChild("pass_donate", cc.Sprite);
        this.img = this.seekChild("img", cc.Sprite);
        this.title_desc = this.seekChild("title_desc", cc.Label);
        this.item_img = this.seekChild("item_img", cc.Sprite);
        this.donate_value = this.seekChild("donate_value", cc.Label);

    },

    registerEvent: function () {
        this.donate_btn.node.on("click", function () {
            if (this.data != null)
                this.ctrl.requestGuildDonate(this.data.id);
        }, this)

    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null)
            return
        var data = this.data
        this.updateDonateStatus();

        this.title_desc.string = data.desc;
        if (this.data.loss != null) {
            var loss_config = this.data.loss[0];
            if (loss_config != null) {
                var item_config = Utils.getItemConfig(loss_config[0]);
                if (item_config) {
                    if (PathTool.getItemRes(item_config.icon)) {
                        this.loadRes(PathTool.getItemRes(item_config.icon), function (res_object) {
                            this.item_img.spriteFrame = res_object;
                        }.bind(this))
                    }
                    this.donate_value.string = loss_config[1];
                }
            }
        }

        if (this.data.gain != null) {
            for (var i in this.data.gain) {
                var v = this.data.gain[i];
                if (this.awards_list[i] == null) {
                    var item_config = Utils.getItemConfig(v[0]);
                    if (item_config != null) {
                        this.awards_list[i] = {}
                        this.awards_list[i].label = this.seekChild(cc.js.formatStr("rich_%s", Number(i) + 1), cc.RichText);
                        this.awards_list[i].img = this.seekChild(cc.js.formatStr("gold_%s", Number(i) + 1), cc.Sprite);
                        this.awards_list[i].label.string = cc.js.formatStr(" %s", v[1]);
                        var img = this.awards_list[i].img
                        this.updateImg(PathTool.getItemRes(item_config.icon), img);
                    }
                }
            }
        }

        var res_id = cc.js.formatStr("txt_cn_guild_100%s", this.data.id);
        if (this.res_id != res_id) {
            this.res_id = res_id;
            this.loadRes(PathTool.getUIIconPath("guild", res_id), function (res_object) {
                this.img.spriteFrame = res_object;
            }.bind(this))
        }
    },

    updateImg: function (res, img) {
        this.loadRes(res, function (obj) {
            img.spriteFrame = obj;
        }.bind(this))
    },

    //捐献情况的更新
    updateDonateStatus: function (list) {
        if (this.data == null)
            return
        var arr = this.model.checkDonateStatus(this.data.id);
        var status = arr[0];
        var self_status = arr[1];
        if (status == true) {
            if (self_status == true) {
                this.pass_donate.node.active = true;
                this.donate_btn.node.active = false;
                this.donate_btn_label.string = Utils.TI18N("已捐献");
            } else {
                Utils.setGreyButton(this.donate_btn)
                this.donate_btn_label.string = Utils.TI18N("不可捐献");
                this.donate_btn.active = true;
                this.donate_btn_lo.enabled = false;
                this.pass_donate.node.active = false;
            }
        } else {
            Utils.setGreyButton(this.donate_btn, false);
            this.donate_btn_label.string = Utils.TI18N("捐献");
            this.donate_btn.node.active = true;
            this.pass_donate.node.active = false;
        }
    },


    onDelete: function () {

    }
});

module.exports = GuildDonateItem;