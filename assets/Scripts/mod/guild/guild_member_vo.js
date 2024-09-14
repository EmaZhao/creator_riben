/*-----------------------------------------------------+
公会列表vo
 +-----------------------------------------------------*/
var GuildEvent = require("guild_event");
var GuildConst = require("guild_const");

var GuildListVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.initData();
    },

    //初始化数据
    initData: function () {
        this.rid = 0                 //id
        this.srv_id = ""                //服务器id
        this.name = ""                //名字
        this.lev = 0                 //等级
        this.face = 0					//头像
        this.post = 0					//职位
        this.online = 0					//0:不在线 1:在线
        this.vip_lev = 0					//vip等级
        this.power = 0					//战力
        this.join_time = 0					//入会时间
        this.login_time = 0					//最后在线时间
        this.donate = 0					//贡献
        this.day_donate = 0					//今日贡献
        this.avatar_bid = 0					//头像框
        this.sex = 0					//性别
        this.active_lev = 0;
        this.is_self = false;//是否是自己
        this.role_post = GuildConst.post_type.member		//当前玩家的职位，而不是该条数据的职位，也是外部设置
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
        //
        if (key == "post")
            this.post_sort = 99 - value;
    },


    dispatchUpdateAttrByKey: function (key, value) {
        gcore.GlobalEvent.fire(GuildEvent.UpdateMyMemberItemEvent, key, value);
    },

    _delete: function () {

    }
});

module.exports = GuildListVo;