/*-----------------------------------------------------+
 * 好友数据模块
 * 单个好友数据
 * @author zys
 +-----------------------------------------------------*/
var FriendVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.initData();
    },

    //初始化数据
    initData: function () {
        //body
        this.srv_id = "";
        this.rid = 0;
        this.name = "";
        this.sex = 1;
        this.lev = 0;
        this.career = 1;
        this.power = 0;
        this.login_time = 0;
        this.login_out_time = 0;
        this.face_id = 0;
        this.is_online = 1;
        this.group_id = 0;
        this.is_cross = 0;
        this.intimacy = 0;
        this.is_vip = 0;
        this.avatar_bid = 0;
        this.gift_status = 1;               //0:已赠送 1：未赠送 2:被赠送
        this.gid = 0;
        this.gsrv_id = "";
        this.is_moshengren = 0;             //是否陌生人 0:不是  1：是 (收到陌生人私聊信息的时候，客户端会创建一些陌生人显示在好友列表里面)
        this.talk_time = 0;                 //交谈时间
        this.dun_id = 0;

        //好友伙伴
        this.gname = "";                    //公会名
        this.main_partner_id = 0;           // 主伙伴Id
        this.partner_bid = 0;               //伙伴bid
        this.partner_lev = 0;		        //等级
        this.partner_star = 0;              // 星级
        this.is_awake = 0;                  // 是否觉醒 1 觉醒 0 没有觉醒
        this.is_used = 0;                   //是否已使用

        this.is_present = 0;                //"赠送体力情况(0:可赠送   1:已赠送
        this.is_draw = 0;                   // "是否可领取(0:不可领取   1:可领取 )
    },

    setData: function (data) {
        //body
        for (var k in data) {
            if (this[k] != null) {
                // this[k] = data[k];
                this.setKey(k, data[k])
            }
        }
    },

    update: function (key, value) {
        if (this[key] != null && this[key] != value) {     
            this[key] = value;

            if(key == "login_out_time"){
                this.fire(FriendVo.UPDATE_FRIEND_ATTR_LOGIN_OUT_TIME, this);
            }
        }
    },

    setKey: function (key, value) {
        // this[key] = value;
        this.update(key, value)
    },

    _delete: function () {

    }
});

FriendVo.UPDATE_FRIEND_ATTR_LOGIN_OUT_TIME = "UPDATE_FRIEND_ATTR_LOGIN_OUT_TIME";

module.exports = FriendVo;