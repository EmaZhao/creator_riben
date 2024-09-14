// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      公会技能的属性单列
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ViewClass = require("viewclass");
var PartnerCalculate = require("partner_calculate");

var GuildSkillAttrItem = cc.Class({
    extends: ViewClass,
    ctor: function () {
        this.node = arguments[0];
        this.attr_key = arguments[1];
        this.size = this.node.getContentSize();

        var attr_config = gdata("attr_data", "data_key_to_name", [this.attr_key]) || "";


        this.attr_desc = this.node.getChildByName("attr_desc").getComponent(cc.RichText);
        this.attr_desc.string = cc.js.formatStr("<color=#ffffff>%s</c> <color=#52ff6f><size=26>%s</size></c>", attr_config, Utils.TI18N("+0"))

        var attr_res = PathTool.getAttrIconByStr(this.attr_key);
        var attr_icon = this.node.getChildByName("attr_icon").getComponent(cc.Sprite);
        this.attr_icon = attr_icon;
        this.loadRes(PathTool.getCommonIcomPath(attr_res), function (sf_obj) {
            this.attr_icon.spriteFrame = sf_obj;
        }.bind(this))
    },



    setData: function (data, attr_key) {
        data = data || 0;
        this.attr_key = attr_key;
        var attr_config = gdata("attr_data", "data_key_to_name", [this.attr_key]) || "";
        this.attr_desc.string = cc.js.formatStr("<color=#ffffff>%s</c> <color=#52ff6f><size=26>%s</size></c>", attr_config, Utils.TI18N("+0"))

        var attr_res = PathTool.getAttrIconByStr(this.attr_key);

        this.loadRes(PathTool.getCommonIcomPath(attr_res), function (sf_obj) {
            this.attr_icon.spriteFrame = sf_obj;
        }.bind(this))
        // this.attr_desc.string = cc.js.formatStr("<color=#ffffff>%s</c> <color=#249004><size=26>%s</size></c>", attr_config, data)
        if (PartnerCalculate.isShowPerByStr(this.attr_key) == true)
            this.attr_desc.string = cc.js.formatStr("<color=#ffffff>%s</c> <color=#52ff6f><size=26>%s</size></c>", attr_config, ("+" + (data * 0.1) + "%"))
        else
            this.attr_desc.string = cc.js.formatStr("<color=#ffffff>%s</c> <color=#52ff6f><size=26>%s</size></c>", attr_config, ("+" + data))

    },


    onDelete: function () {
    }
});

module.exports = GuildSkillAttrItem;