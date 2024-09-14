// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      竖版邮件单个
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TimeTool = require("timetool");

var MailCell = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mail", "mail_item");
        this.data = null;
    },


    initPanel: function () {
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.mail_con = this.main_container.getChildByName("mail_con");
        this.icon = this.mail_con.getChildByName("icon").getComponent(cc.Sprite);
        this.mail_title = this.mail_con.getChildByName("title").getComponent(cc.Label);
        this.time = this.mail_con.getChildByName("time").getComponent(cc.Label);
        this.unread = this.mail_con.getChildByName("unread").getComponent(cc.Label);
        this.unread.string = ("未確認")

        this.notice_con = this.main_container.getChildByName("notice_con");
        this.notice_title = this.notice_con.getChildByName("title").getComponent(cc.Label);
        this.notice_content = this.notice_con.getChildByName("content").getComponent(cc.Label);

        this.onShow()
    },


    registerEvent: function () {
        if (this.main_container == null) return
        this.main_container.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.data != null && this.callback != null)
                this.callback(this);
        }, this)

    },

    addCallBack: function (value) {
        this.callback = value
    },

    //必要添加的数据传入方法
    setData: function (data) {
        this.data = data;
        this.onShow()
    },

    onShow: function () {
        if (this.data == null)
            return
        if (this.root_wnd == null)
            return
        // this.root_wnd.setPosition(this.x, this.y);
        if (this.data.status >= 0) { //邮件
            this.mail_con.active = true;
            this.notice_con.active = false;
            var show_time = TimeTool.getDayOrHour(gcore.SmartSocket.getTime() - this.data.send_time);
            if (show_time) {
                this.time.string = show_time + "前";
            } else {
                this.time.string = "";
            }
            this.changeIcon(this.data.status);
            this.mail_title.string = this.data.subject;
        } else if (this.data.flag >= 0) {  //公告
            this.mail_con.active = false;
            this.notice_con.active = true;
            this.notice_title.string = this.data.title;
            this.notice_content.string = this.data.summary;
            this.setGray(this.data.flag == 1);
        }
    },

    //邮件的icon改变
    changeIcon: function (status) {
        if (status != null) {
            if (status == 1) {  //已读
                this.setGray(true);
                if (Utils.getArrLen(this.data.assets) > 0 || Utils.getArrLen(this.data.items) > 0) {
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon4"), function (sf_obj) {
                        this.icon.spriteFrame = sf_obj;
                    }.bind(this))
                } else if (Utils.getArrLen(this.data.assets) == 0 || Utils.getArrLen(this.data.items) == 0) {
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon3"), function (sf_obj) {
                        this.icon.spriteFrame = sf_obj;
                    }.bind(this))
                }
            } else if (status == 2) {  //领了
                this.setGray(true);
                this.loadRes(PathTool.getUIIconPath("mail", "mail_icon3"), function (sf_obj) {
                    this.icon.spriteFrame = sf_obj;
                }.bind(this))
            } else if (status == 0) {  //未读
                this.setGray(false);
                if (Utils.getArrLen(this.data.assets) > 0 || Utils.getArrLen(this.data.items) > 0) {  //有物品
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon2"), function (sf_obj) {
                        this.icon.spriteFrame = sf_obj;
                    }.bind(this))
                } else {
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon1"), function (sf_obj) {
                        this.icon.spriteFrame = sf_obj;
                    }.bind(this))
                }
            }
        }
    },

    setGray: function (status) {
        if (status) {
            this.root_wnd.opacity = 178;
            this.unread.node.active = false;
        } else {
            this.root_wnd.opacity = 255;
            this.unread.node.active = true;
        }
    },

    getData: function () {
        return this.data
    },

    updateIconStatus:function(){
        if(this.data == null)return
        var status = this.data.status;
        this.changeIcon(status)
    },

    onHide: function () {

    },

    onDelete: function () {

    }

});

module.exports = MailCell;