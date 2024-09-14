// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-08 14:17:36
// --------------------------------------------------------------------

var MailController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var MailModel = require("mail_model");
        this.model = new MailModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function () { this.send10800(); }).bind(this));
    },

    // 注册协议接受事件
    registerProtocals: function () {
        //------邮件-----
        this.RegisterProtocal(10800, this.mailListHandler);          //邮件列表
        this.RegisterProtocal(10801, this.getGoodsHandler);          //提取单个邮件的附件
        this.RegisterProtocal(10802, this.getAllGoodsHandler);          //一键提取附件
        this.RegisterProtocal(10803, this.handle10803);          //新邮件推送
        this.RegisterProtocal(10804, this.delMailHandler);          //删除没有附件的邮件
        this.RegisterProtocal(10805, this.readMailHandler);          //读取邮件
    },

    // 打开邮件主界面
    openMailUI: function (status) {
        if (status == true) {
            if (this.mail_ui == null) {
                var MailWindow = require("mail_window");
                this.mail_ui = new MailWindow();
            }
            this.mail_ui.open();
        } else {
            if (this.mail_ui) {
                this.mail_ui.close();
                this.mail_ui = null;
            }
        }
    },

    //打开邮件内容
    openMailInfo: function (bool, data) {
        if (bool == true) {
            if (this.mail_info == null) {
                var MailInfoWindow = require("mail_info_window");
                this.mail_info = new MailInfoWindow();
            }
            this.mail_info.open();
            this.mail_info.setData(data);
        } else {
            if (this.mail_info) {
                this.mail_info.close();
                this.mail_info = null;
            }
        }
    },

    //获取邮件信息
    send10800: function () {
        this.SendProtocal(10800, {});
    },

    //初始化邮件列表
    mailListHandler: function (data) {
        this.model.initMailList(data.mail)
    },

    //新增一个邮件
    handle10803:function(data){
        this.model.addMailItem(data.mail);
    },

    //请求删除一个邮件
    deletMailSend:function(ids){
        var protocal = {};
        protocal.ids = ids;
        this.SendProtocal(10804,protocal);
    },

    //推送删除邮件
    delMailHandler:function(data){
        message(data.msg);
        this.model.delMailItem(data.ids);
    },

    //读取一个邮件
    read:function(bid,srv_id){
        var protocal = {};
        protocal.id = bid;
        protocal.srv_id = srv_id;
        this.SendProtocal(10805,protocal);
    },

    //读取一个邮件状态之后
    readMailHandler:function(data){
        if(data.code == 1){
            this.model.readMailItem(data)
        }
    },

    //提取邮件附件
    getGoods:function(id,srv_id){
        var protocal = {};
        protocal.id = id;
        protocal.srv_id = srv_id;
        this.SendProtocal(10801,protocal)
    },

    //提取邮件返回
    getGoodsHandler:function(data){
        message(data.msg);
        if(data.code == 1){
            this.model.getMailGood(data)
        }
    },

    //一键提取邮件
    getAllGoods:function(){
        this.SendProtocal(10802,{})
    },

    //一键提取返回
    getAllGoodsHandler:function(data){
        message(data.msg);
        if(data.ids == null || Utils.next(data.ids) == null)return
        this.model.getAllMailGood(data.ids);
    },

    //获取已经读取过的 且没有附件的邮件,用于一键删除
    getHasReadNonRewardList:function(){
        return this.model.getHasReadNonRewardList();
    },

    getMailInfoView:function(){
        if(this.mail_info){
            return this.mail_info
        }
        return null
    },

});

module.exports = MailController;