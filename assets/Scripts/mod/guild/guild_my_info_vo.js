/*-----------------------------------------------------+
自己公会的基础信息
 +-----------------------------------------------------*/
 var GuildEvent = require("guild_event");

 var GuildMyInfoVo = cc.Class({
     extends: gcore.BaseEvent,
     ctor: function () {
         this.initData();
     },
 
     //初始化数据
     initData: function () {
        this.gid            = 0                 // 公会的id
        this.gsrv_id        = ""                // 公会的服务器id
        this.name           = ""                // 公会的名字
        this.lev            = 0                 // 等级
        this.members_num    = 0                 // 成员人数
        this.members_max    = 0                 // 成员上限
        this.leader_name    = 0                 // 会长名字
        this.rid            = 0                 // 会长角色id
        this.srv_id         = ""                // 会长角色服务器id
        this.sign           = ""                // 宣言
        this.exp            = 0                 // 公会经验
        this.day_exp        = 0                 // 今天公会经验
        this.apply_type     = 0                 // 申请类型(0:自动审批 1:手动审批 2:不允许申请)
        this.apply_lev      = 0                 // 申请等级条件
        this.recruit_num    = 0                 // 已招募次数
        this.rank_idx       = 0                 // 排名
     },
 
     updateData: function (data) {
         for (var k in data) {
             if (this[k] != null) {
                 this.setGuildAttribute(k, data[k])
             }
         }
     },
 
     setGuildAttribute:function(key,value){
         if (this[key] != value){
             this[key] = value;
             this.dispatchUpdateAttrByKey(key,value);
         }
     },
 
 
     dispatchUpdateAttrByKey:function(key,value){
         gcore.GlobalEvent.fire(GuildEvent.UpdateMyInfoEvent,key,value);
     },
 
     _delete: function () {
 
     }
 });
 
 module.exports = GuildMyInfoVo;