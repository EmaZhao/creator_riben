/*-----------------------------------------------------+
 * 公告数据模块
 * @author zys
 +-----------------------------------------------------*/
var NoticeVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.id = 0                         //邮件bid
        this.type = 1                       //1:更新 2:新服 3:活动 4:系统
        this.title = ""                     //标题
        this.summary = ""                   //概要
        this.content = ""                   //内容
        this.start_time = 0                 //开始时间
        this.end_time = 0                   //结束时间
        this.flag = 0                       //0:未读 1:已读
    },


    //数据赋值(对传过来的协议进行赋值)
    initAttrData: function (data_list) {
        if (data_list) {
            for (var k in data_list) {
                var v = data_list[k];
                this.update(k, v);
            }
        }
    },

    update: function (key, value) {
        if (this[key] != null)
            this[key] = value
    },

    setReaded: function () {
        this.flag = 1
    }
});