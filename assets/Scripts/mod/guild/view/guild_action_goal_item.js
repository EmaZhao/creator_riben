// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      公会活跃item
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");

var GuildActionGoalItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_action_goal_item");
        this.ctrl = GuildController.getInstance();
    },

    initPanel: function () {
        this.container = this.seekChild("container");
        //日常
        this.title_1 = this.seekChild(this.container, "title_1");
        this.title_1.active = false;
        //周常
        this.title_2 = this.seekChild(this.container, "title_2");
        this.title_2.active = false;
        this.btn_goto = this.seekChild(this.container, "btn_goto");
        this.sprite_has = this.seekChild(this.container, "sprite_has");
        this.sprite_has.active = false;
        this.btn_commit = this.seekChild("btn_commit");
        this.btn_commit.active = false;

        this.item_desc = {};
        for (var i = 1; i < 4; i++) {
            this.item_desc[i] = this.seekChild("desc_" + i, cc.Label);
        }
    },

    registerEvent: function () {
        if (this.btn_goto) {
            this.btn_goto.on(cc.Node.EventType.TOUCH_END, function () {
                if (this.data.show_jump)
                    require("backpack_controller").getInstance().gotoItemSources(this.data.show_jump, {});
                else
                    message(Utils.TI18N("该活动未开启"));
            }, this)
        }

        if (this.btn_commit) {
            this.btn_commit.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.send16903(this.data.id);
            }, this)
        }
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    setExtendData:function(data){
        this.task_data = data;
    },

    onShow: function () {
        if (this.data == null)
            return
        var data = this.data
        if (data.desc)
            this.item_desc[1].string = data.desc;
        this.title_1.active = data.type == 1;
        this.title_2.active = data.type == 2;
        if (data.exp)
            this.item_desc[3].string = data.exp;
        this.changeItemStatus(this.data.index);
    },

    changeItemStatus: function (index) {
        this.btn_goto.active = this.task_data[index].finish == 0;
        this.btn_commit.active = this.task_data[index].finish == 1;
        this.sprite_has.active = this.task_data[index].finish == 2;

        var str = cc.js.formatStr("(%s/%s)", this.task_data[index].value, this.task_data[index].target_val);
        this.item_desc[2].string = str;
    },


    onDelete: function () {

    }
});

module.exports = GuildActionGoalItem;