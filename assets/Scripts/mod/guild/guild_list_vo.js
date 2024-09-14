/*-----------------------------------------------------+
公会列表vo
 +-----------------------------------------------------*/
var GuildEvent = require("guild_event");

var GuildListVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.initData();
    },

    //初始化数据
    initData: function () {
        this.gid = 0
        this.gsrv_id = ""
        this.name = ""
        this.lev = 0
        this.members_num = 0
        this.members_max = 0
        this.leader_name = 0
        this.apply_type = 0
        this.apply_lev = 0
        this.is_apply = 0;//false
    },

    updateData: function (data) {
        for (var k in data) {
            if (this[k] != null) {
                this.setGuildAttribute(k, data[k])
            }
        }
    },

    setGuildAttribute: function (key, value) {
        if (this[key] != value) {
            this[key] = value;
            this.dispatchUpdateAttrByKey(key, value);
        }
    },


    dispatchUpdateAttrByKey: function (key, value) {
        this.fire(GuildEvent.UpdateGuildItemEvent, key, value);
    },

    _delete: function () {

    }
});

module.exports = GuildListVo;