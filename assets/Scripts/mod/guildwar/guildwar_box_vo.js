/*-----------------------------------------------------+
 * 奖励宝箱的数据
 * @author zys
 +-----------------------------------------------------*/
 var GuildwarConst = require("guildwar_const");
 var GuildwarEvent = require("guildwar_event");
 
 var VoyageOrderVo = cc.Class({
     extends: gcore.BaseEvent,
     ctor: function () {
        this.order = 0 	   // 序号
        this.rid = 0 	   // 开启者id
        this.sid = 0 	   // 开启者sid
        this.name = ""     // 开启者名称
        this.item_id = 0   // 奖励物品bid
        this.item_num = 0  // 奖励物品数量
        this.status = GuildwarConst.box_type.gold  // 宝箱类型
     },
 
     updateData: function (data) {
         for (var key in data) {
             var value = data[key];
             this[key] = value;
         }
         this.fire(GuildwarEvent.UpdateSingleBoxDataEvent)
     },
 
     _delete: function () {
 
     },
 });
 
 module.exports = VoyageOrderVo;