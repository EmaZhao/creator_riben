// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      公会查找面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildEvent = require("guild_event");
var RoleController = require("role_controller");

var GuildRequestItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_list_item");
        this.ctrl = GuildController.getInstance();
        this.data = null;
    },

    initPanel: function () {
        var container = this.seekChild("container");
        this.request_btn = this.seekChild(container, "request_btn", cc.Button);
        this.request_btn_label = this.seekChild(this.request_btn.node, "label", cc.Label);
        this.request_btn_lo = this.seekChild(this.request_btn.node, "label", cc.LabelOutline);
        this.request_btn_label.string = Utils.TI18N("申请加入");
        this.request_btn_img = this.seekChild(container, "request_btn", cc.Sprite);

        this.condition_desc = this.seekChild(container, "condition_desc",cc.Label);
        this.guild_name = this.seekChild("guild_name", cc.Label);
        this.guild_lev = this.seekChild("guild_lev", cc.Label);
        this.leader_value = this.seekChild("leader_value", cc.Label);
        this.member_value = this.seekChild("member_value", cc.Label);

        this.btn_res_id = PathTool.getCommonIcomPath("common_1018");
    },

    registerEvent: function () {
        this.request_btn.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.request_btn.interactable == false)
                return
            if (this.data != null) {
                if (this.data.is_apply == 1)    //这个时候点击就是取消掉状态
                    this.ctrl.requestJoinGuild(this.data.gid, this.data.gsrv_id, 2);
                else
                    this.ctrl.requestJoinGuild(this.data.gid, this.data.gsrv_id, 1);
            }
        }, this)
    },

    setData: function (data) {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
        }
        this.data = data
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null)
            return
        var data = this.data;
        if (this.update_self_event == null) {
            this.update_self_event = this.data.bind(GuildEvent.UpdateGuildItemEvent, function (key, value) {
                if (key == "is_apply")
                    this.setApplyStatus();
            }, this)
        }
        this.guild_name.string = data.name;
        this.guild_lev.string = cc.js.formatStr(Utils.TI18N("(%s级)"), data.lev);
        this.leader_value.string = cc.js.formatStr(Utils.TI18N("会长：%s"), data.leader_name);
        this.member_value.string = cc.js.formatStr(Utils.TI18N("%s/%s"), data.members_num, data.members_max);
        if (data.members_num >= data.members_max)
            this.member_value.node.color = new cc.Color(255, 86, 112, 255);
        else
            this.member_value.node.color = new cc.Color(82, 255, 111, 255);
        this.guild_lev.x = this.guild_name.node.x + this.guild_name.node.getContentSize().width + 5;
        this.setApplyStatus();
    },

    setApplyStatus: function () {
        if (this.data == null)
            return
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo == null)
            return
        var data = this.data;
        var color1 = { r: 255, g: 86, b: 112, a: 255 };
        var color2 = { r: 225, g: 222, b: 94, a: 255 };
        if (data.is_apply == 1) {
            // setChildUnEnabled(false, this.request_btn) 
            this.request_btn_label.string = Utils.TI18N("取消申请");
            this.loadRes(PathTool.getCommonIcomPath("Btn_3_2"), function(sf_obj){
                this.request_btn_img.spriteFrame = sf_obj;
            }.bind(this))
            this.request_btn_lo.color = new cc.Color(0x6c,0x2b,0x00,0xff)
            if (data.apply_type == 2) {
                Utils.setGreyButton(this.request_btn,true)
                this.condition_desc.node.color = new cc.Color(color1.r, color1.g, color1.b, color1.a);
                this.condition_desc.string = Utils.TI18N("公会不允许加入");
            } else {
                if (data.apply_lev > role_vo.lev) {
                    // this.request_btn.interactable = false;
                    Utils.setGreyButton(this.request_btn,true)
                    this.condition_desc.node.color = new cc.Color(color1.r, color1.g, color1.b, color1.a);
                } else {
                    // this.request_btn.interactable = true;
                    Utils.setGreyButton(this.request_btn,false)
                    this.condition_desc.node.color = new cc.Color(color2.r, color2.g, color2.b, color2.a);
                }
                if (data.apply_lev == 1)
                    this.condition_desc.string = Utils.TI18N("无等级需求");
                else
                    this.condition_desc.string = cc.js.formatStr("レベル%sに達する必要が", data.apply_lev);
            }
        } else {
            this.loadRes(PathTool.getCommonIcomPath("Btn_3_1"), function(sf_obj){
                this.request_btn_img.spriteFrame = sf_obj;
            }.bind(this))
            if (data.apply_type == 2) {
                // setChildUnEnabled(false, this.request_btn)
                // this.request_btn.interactable = false;
                Utils.setGreyButton(this.request_btn,true)
                this.request_btn_label.string = Utils.TI18N("申请加入");
                this.request_btn_lo.enabled = false;
                this.condition_desc.node.color = new cc.Color(color1.r, color1.g, color1.b, color1.a);
                this.condition_desc.string = Utils.TI18N("公会不允许加入");
            } else {
                if (data.apply_lev > role_vo.lev) {
                    // this.request_btn_label.interactable = false;
                    Utils.setGreyButton(this.request_btn,true)
                    this.request_btn_lo.enabled = false;
                    this.request_btn_label.string = Utils.TI18N("申请加入");
                    this.condition_desc.node.color = new cc.Color(color1.r, color1.g, color1.b, color1.a);
                } else {
                    // this.request_btn_label.interactable = true;
                    Utils.setGreyButton(this.request_btn,false)
                    this.request_btn_label.string = Utils.TI18N("申请加入");
                    this.request_btn_lo.color = new cc.Color(0x2b,0x61,0x0d,0xff);
                    this.request_btn_lo.enabled = true;
                    this.condition_desc.node.color = new cc.Color(color2.r, color2.g, color2.b, color2.a);
                }
                if (data.apply_lev == 1)
                    this.condition_desc.string = Utils.TI18N("无等级需求");
                else
                    this.condition_desc.string = cc.js.formatStr("レベル%sに達する必要が", data.apply_lev);
            }
        }
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

    onDelete: function () {
        this.suspendAllActions();
    }
});

module.exports = GuildRequestItem;