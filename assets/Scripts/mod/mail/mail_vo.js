/*-----------------------------------------------------+
 * 邮件数据模块
 * @author zys
 +-----------------------------------------------------*/
var MailVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function() {
        this.initData();
    },

    setContent: function(value) {
        this.mail_count = value
    },

    //初始化数据
    initData: function() {
        this.id = 0; //邮件bid
        this.srv_id = ""; //邮件服务器id
        this.type = 1; //0:私人 1:系统 2:公告
        this.from_name = ""; //发件人用户名
        this.subject = ""; //标题
        this.content = ""; //内容
        this.assets = []; //'资产类型 coin/gold'
        this.items = []; //'物品
        this.send_time = 0; //'发送时间
        this.send_time_order = 0; //用于排升序的发送时间
        this.read_time = 0; //阅读时间
        this.time_out = 0; //超时时间搓
        this.status = 0; //0:未读 1:已读 2:已领
        this.is_has = 1; //是否有附件 0有1没
    },

    //数据赋值(对传过来的协议进行赋值)
    initAttrData: function(data_list) {
        if (data_list) {
            for (var k in data_list) {
                var v = data_list[k];
                this.update(k, v)
                if (data_list.send_time) {
                    this.send_time_order = -data_list.send_time || 0;
                }
                if (data_list.assets || data_list.items) {
                    if (data_list.assets.length > 0 || data_list.items.length > 0) {
                        this.is_has = 0;
                    } else {
                        this.is_has = 1;
                    }
                }
            }
        }
    },

    update: function(key, value) {
        if (this[key] != null) { this[key] = value }
    },

    setReaded: function(read_time) {
        if (read_time) {
            this.read_time = read_time;
        }
        this.status = 1
    },

    removeAssets: function(read_time) {
        if (read_time) {
            this.read_time = read_time;
        }
        this.items = {};
        this.assets = {};
        this.status = 2;
    }
});

module.exports = MailVo;