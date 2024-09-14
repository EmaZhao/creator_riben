// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");

var GuildRewardItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_reward_item");
        this.ctrl = GuildController.getInstance();
        this.data = null;
        this.item_list = {};
    },

    initPanel: function () {
        this.container = this.seekChild("container");
        this.desc_label = this.seekChild("desc_label", cc.RichText);
    },

    registerEvent: function () {
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        var str = cc.js.formatStr(Utils.TI18N("活跃到达 <color=#249003>%d</c> 级领取"), data.lev);
        this.desc_label.string = str;
        for (var i in this.item_list) {
            this.item_list[i].setVisible(false);
        }
        for (var i = 0; i < data.items.length; i++) {
            var v = data.items[i];
            if (!this.item_list[i]) {
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 0.8, false, false)
                item.show();
                item.setPosition(i * 110 + 70, 62);
                item.setParent(this.container);
                this.item_list[i] = item;
            }
            item = this.item_list[i];
            if (item) {
                item.setVisible(true);
                item.setData({ bid: v[0], num: v[1] });
            }
        }
    },


    onDelete: function () {
        if(this.item_list){
            for (var i in this.item_list){
                var v = this.item_list[i];
                v.deleteMe();
                v = null;
            }
            this.item_list = null;
        }
    }
});

module.exports = GuildRewardItem;