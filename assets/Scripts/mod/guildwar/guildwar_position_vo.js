/*-----------------------------------------------------+
 * 联盟战据点数据
 * @author zys
 +-----------------------------------------------------*/
var GuildwarConst = require("guildwar_const");
var GuildwarEvent = require("guildwar_event");

var VoyageOrderVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.pos = 0      // 序列号（唯一标识）
        this.rid = 0
        this.srv_id = 0
        this.name = ""
        this.lev = 0
        this.face = 0
        this.power = 0
        this.hp = 0
        this.hp_max = 0
        this.relic_def_count = 0 // 废墟状态被进攻次数
        this.status = GuildwarConst.position_status.normal
    },

    updateData: function (data) {
        for (var key in data) {
            var value = data[key];
            this[key] = value;
        }
        this.fire(GuildwarEvent.UpdateGuildWarPositionDataEvent)
    },

    _delete: function () {

    },
});

module.exports = VoyageOrderVo;