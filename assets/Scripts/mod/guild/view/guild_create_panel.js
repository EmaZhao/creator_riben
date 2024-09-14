// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      创建公会标签面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");


var GuildCreatePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_create_panel");
        this.ctrl = GuildController.getInstance();
        this.set_index = 0; //默认不验证
        this.condition_index = 0;
        // this.had_fill = false;
        this.condition_list = [];
        this.desc_ = "";
        this.initConditionList();
    },

    initPanel: function () {
        var container = this.root_wnd.getChildByName("container");


        this.set_value = this.seekChild(container, "set_value", cc.Label);
        this.condition_value = this.seekChild(container, "condition_value", cc.Label);
        this.condition_left = this.seekChild(container, "condition_left", cc.Button);
        this.condition_right = this.seekChild(container, "condition_right", cc.Button);
        this.set_left = this.seekChild(container, "set_left", cc.Button);
        this.set_right = this.seekChild(container, "set_right", cc.Button);

        this.edit_title = this.seekChild(container, "edit_title", cc.EditBox);
        this.declaration_value = this.seekChild(container, "declaration_value", cc.EditBox);
        this.declaration_value.string = this.desc_;
        this.declaration_text = this.seekChild(this.declaration_value.node, "TEXT_LABEL", cc.Label);
        this.declaration_text.enableWrapText = true;

        this.create_btn = this.seekChild(container, "create_btn", cc.Button);
        this.create_btn_label = this.seekChild(this.create_btn.node, "Label", cc.Label);
        this.create_btn_img = this.seekChild(this.create_btn.node, "Sprite", cc.Sprite);
        this.create_btn_img.node.setScale(0.3, 0.3);

        var config = gdata("guild_data", "data_const", "create_gold");
        var gold_num = 100;
        if (config != null)
            gold_num = config.val;
        var item_config = Utils.getItemConfig(gdata("item_data", "data_assets_label2id", "gold"));
        var item_icon = 2;
        if (item_config != null)
            item_icon = item_config.icon;
        this.create_btn_label.string = cc.js.formatStr("%s %s", gold_num, Utils.TI18N("创建公会"))
        if (PathTool.getItemRes(item_icon)) {
            this.loadRes(PathTool.getItemRes(item_icon), function (res_object) {
                this.create_btn_img.spriteFrame = res_object;
            }.bind(this))
        }

        this.desc_vip_lb = this.seekChild("desc_vip",cc.Label);
        var condition = gdata("guild_data", "data_const", "maintain_vip_condition");
        if(condition.val > 0){
            this.desc_vip_lb.string = cc.js.formatStr(Utils.TI18N("需达VIP%s才可创建公会"),condition.val);
        }else{
            this.desc_vip_lb.node.active = false;
        }
    },

    registerEvent: function () {
        this.condition_left.node.on("click", function () {
            if (this.condition_index == 0)
                return
            this.condition_index = this.condition_index - 1;
            this.setGuildConditionInfo(this.condition_index);
        }, this)

        this.condition_right.node.on("click", function () {
            if (this.condition_index + 1 >= this.condition_list.length)
                return
            this.condition_index = this.condition_index + 1;
            this.setGuildConditionInfo(this.condition_index);
        }, this)
        this.set_left.node.on("click", function () {
            if (this.set_index == 0)
                return
            this.set_index = this.set_index - 1;
            this.setGuildSetInfo(this.set_index);
        }, this)
        this.set_right.node.on("click", function () {
            if (this.set_index == 1)
                return
            this.set_index = this.set_index + 1;
            this.setGuildSetInfo(this.set_index);
        }, this)

        this.create_btn.node.on(cc.Node.EventType.TOUCH_END, function () {
            var config = this.condition_list[this.condition_index];
            var guild_name = this.edit_title.string;
            if (guild_name == "") {
                message(Utils.TI18N("公会名称不能为空"));
            } else if (Utils.getByteLen(guild_name) > 12) {
                message(Utils.TI18N("公会名字不得超过6个文字"));
            } else {
                var sign = this.declaration_value.string;
                if (config != null)
                    this.ctrl.requestCreateGuild(guild_name, sign, self.set_index, config.lev);
            }
        }, this)
    },

    openRootWnd: function () {
    },

    onShow: function () {
        this.setGuildSetInfo(this.set_index);
        this.setGuildConditionInfo(this.condition_index);
        if (Config.guild_data.data_sign_length > 0) {
            var index = Math.floor(Math.random() *Config.guild_data.data_sign_length + 1);
            var config = Config.guild_data.data_sign[index];
            if (config != null) {
                this.declaration_value.string = config.sign;
                this.desc_ = config.sign;
            }
        }
    },

    addToParent: function (status) {
        this.showStatus = status
        if (this.root_wnd == null)
            return
        this.setVisible(status)
        // this.root_wnd.active = status;
    },

    initConditionList: function () {
        this.condition_list = [
            { index: 1, lev: 1, desc: Utils.TI18N("1级") },
            { index: 2, lev: 10, desc: Utils.TI18N("10级") },
            { index: 3, lev: 20, desc: Utils.TI18N("20级") },
            { index: 4, lev: 30, desc: Utils.TI18N("30级") },
            { index: 5, lev: 40, desc: Utils.TI18N("40级") },
            { index: 6, lev: 50, desc: Utils.TI18N("50级") },
            { index: 7, lev: 60, desc: Utils.TI18N("60级") },
        ]
    },

    setGuildConditionInfo: function (index) {
        var config = this.condition_list[index];
        if (config != null)
            this.condition_value.string = config.desc;
        var status = 1;
        if (index == 0) {
            status = 1;
        } else if (index + 1 == this.condition_list.length) {
            status = 2;
        } else {
            status = 3;
        }
        if (this.condition_status != status) {
            this.condition_status = status;
            if (status == 1) {
                Utils.setGreyButton(this.condition_left, true);
                Utils.setGreyButton(this.condition_right, false);
            } else if (status == 2) {
                Utils.setGreyButton(this.condition_left, false);
                Utils.setGreyButton(this.condition_right, true);
            } else {
                Utils.setGreyButton(this.condition_left, false);
                Utils.setGreyButton(this.condition_right, false);
            }
        }
    },

    setGuildSetInfo: function (index) {
        if (index == 0) {
            this.set_value.string = Utils.TI18N("不需要验证");
            Utils.setGreyButton(this.set_left, true);
            Utils.setGreyButton(this.set_right, false);
        } else if (index == 1) {
            this.set_value.string = Utils.TI18N("需要验证");
            Utils.setGreyButton(this.set_left, false);
            Utils.setGreyButton(this.set_right, true);
        }
    },

    onDelete: function () {
    }
});

module.exports = GuildCreatePanel;