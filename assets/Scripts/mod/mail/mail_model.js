// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-08 14:17:36
// --------------------------------------------------------------------
var MailController = require("mail_controller");
var MailEvent = require("mail_event");
var MailVo = require("mail_vo");
var NoticeVo = require("notice_vo");

var MailModel_MAX_COUNT = 50 //最大邮件数量

var MailModel = cc.Class({
    extends: BaseClass,
    ctor: function() {
        this.ctrl = MailController.getInstance();
        this.initConfig()
    },

    properties: {},

    initConfig: function() {
        this.mail_list = {}; //所有邮件
        this.notice_list = {}; //公告列表
        this.red_status_list = {}; //红点状态
    },

    //初始化邮件列表
    initMailList: function(data_list) {
        if (data_list != null || Utils.next(data_list) != null) {
            for (var i in data_list) {
                var v = data_list[i];
                var key = Utils.getNorKey(v.id, v.srv_id);
                var mail_vo = this.mail_list[key];
                if (mail_vo == null) {
                    mail_vo = new MailVo();
                    this.mail_list[key] = mail_vo;
                }
                mail_vo.initAttrData(v)
            }
        }
        var m = new MailVo();
        m.type = 1;
        m.subject = "サービス終了のお知らせ";
        m.content = "サービス終了のお知らせ\n平素より「プロジェクトドラゴン」をご利用いただき、誠にありがとうございます。\nこの度「プロジェクトドラゴン」は2023年11月29日(水) 14:00をもちまして、\nサービスを終了させていただくことになりました。\n「プロジェクトドラゴン」をご愛顧いただいた皆様には、\n心より感謝を申し上げるとともに、深くお詫び申し上げます。\nまた、サービス終了に向けて、\n2023年10月25日(水) 14:00に実施するメンテナンスにて\n課金アイテムの販売を終了させていただきます。\n【サービス終了までのスケジュール】\n○2023年10月25日(水) 14:00\n・有償アイテム販売終了\n※ご購入されたアイテムはサービス終了までご利用いただけます。\n※購入済みアイテムのポイントへの返還はできません。\n　あらかじめご了承ください。\n○2023年11月29日(水) 14:00\n・サービス終了\n※スケジュールにつきましては、変更させていただく場合がございます。\n　変更する際はお知らせにてご案内させていただきます。\nサービス終了まで残り短い期間ではございますが、\n最後まで「プロジェクトドラゴン」をよろしくお願いいたします。\n「プロジェクトドラゴン」運営チーム";
        m.send_time = 1698163498;
        this.mail_list["key"] = m;
        //初始化红点
        this.checkMailRedSum();
    },

    //设置邮件红点状态
    checkMailRedSum: function() {
        var red_num = 0;
        for (var k in this.mail_list) {
            if (this.mail_list[k] && this.mail_list[k].status == 0) {
                red_num = red_num + 1;
            }
        }
        this.updateRedStatus(1, red_num);
    },

    //新增邮件 10803 
    addMailItem: function(data_list) {
        this.initMailList(data_list);
        //新增一个邮件的时候刷新邮件列表
        gcore.GlobalEvent.fire(MailEvent.UPDATE_ITEM);
    },

    //删除没有附件的邮件 10804 
    delMailItem: function(data_list) {
        if (data_list == null || Utils.next(data_list) == null) return
        for (var i in data_list) {
            var v = data_list[i];
            if (v) {
                var key = Utils.getNorKey(v.id, v.srv_id);
                this.mail_list[key] = null;
            }
        }
        //删除一个邮件的时候刷新邮件列表
        gcore.GlobalEvent.fire(MailEvent.UPDATE_ITEM);
    },

    //读取一封邮件,这个时候需要设置一些状态 10805 
    readMailItem: function(data) {
        if (data == null) return
        var key = Utils.getNorKey(data.id, data.srv_id);
        var mail_vo = this.mail_list[key];
        if (mail_vo == null) return
        mail_vo.setReaded(data.read_time);
        this.checkMailRedSum();
        //读取单封邮件的处理
        gcore.GlobalEvent.fire(MailEvent.READ_MAIL_INFO, key);
    },

    //提取一个邮件附件 10801 
    getMailGood: function(data) {
        if (data == null) return
        var key = Utils.getNorKey(data.id, data.srv_id);
        var mail_vo = this.mail_list[key];
        mail_vo.removeAssets();
        this.checkMailRedSum();
        //提取一个邮件的物品
        gcore.GlobalEvent.fire(MailEvent.GET_ITEM_ASSETS, key);
    },

    //一键提取所有邮件  10802 
    getAllMailGood: function(data_list) {
        if (data_list == null || Utils.next(data_list) == null) return
        for (var i in data_list) {
            var v = data_list[i];
            var key = Utils.getNorKey(v.id, v.srv_id);
            if (this.mail_list[key]) {
                this.mail_list[key].removeAssets(v.read_time)
            }
        }
        this.checkMailRedSum();
        gcore.GlobalEvent.fire(MailEvent.UPDATE_ITEM);
    },

    //获取邮件列表
    getAllMailArray: function() {
        var temp_list = [];
        // var m = new MailVo();
        // m.type = 1;
        // m.subject = "サービス終了のお知らせ";
        // m.content = "サービス終了のお知らせ\n平素より「プロジェクトドラゴン」をご利用いただき、誠にありがとうございます。\nこの度「プロジェクトドラゴン」は2023年11月29日(水) 14:00をもちまして、\nサービスを終了させていただくことになりました。\n「プロジェクトドラゴン」をご愛顧いただいた皆様には、\n心より感謝を申し上げるとともに、深くお詫び申し上げます。\nまた、サービス終了に向けて、\n2023年10月25日(水) 14:00に実施するメンテナンスにて\n課金アイテムの販売を終了させていただきます。\n【サービス終了までのスケジュール】\n○2023年10月25日(水) 14:00\n・有償アイテム販売終了\n※ご購入されたアイテムはサービス終了までご利用いただけます。\n※購入済みアイテムのポイントへの返還はできません。\n　あらかじめご了承ください。\n○2023年11月29日(水) 14:00\n・サービス終了\n※スケジュールにつきましては、変更させていただく場合がございます。\n　変更する際はお知らせにてご案内させていただきます。\nサービス終了まで残り短い期間ではございますが、\n最後まで「プロジェクトドラゴン」をよろしくお願いいたします。\n「プロジェクトドラゴン」運営チーム";
        // m.send_time = 1698163498;
        // temp_list.push(m);
        for (var k in this.mail_list) {
            var v = this.mail_list[k];
            // if (v.time_out <= gcore.SmartSocket.getTime() && Utils.getArrLen(v.assets) == 0 && Utils.getArrLen(v.items) == 0) {

            if (v && v.type == 1) {
                temp_list.push(v)
            }
        }
        if (temp_list.length > 0) {
            temp_list.sort(Utils.tableLowerSorter(["status", "is_has"]));
        }

        return temp_list
    },

    //获取已读且已经领取的邮件
    getHasReadNonRewardList: function() {
        var mail_ids = [];
        for (var i in this.mail_list) {
            var v = this.mail_list[i];
            //删除邮件的已经领取的邮件
            if (v && v.id != null && v.srv_id != null && (v.status == 2 || (v.status == 1 && Utils.getArrLen(v.assets) == 0 && Utils.getArrLen(v.items) == 0)) && v.type == 1) {
                var mail_data = {};
                mail_data.id = v.id;
                mail_data.srv_id = v.srv_id;
                mail_ids.push(mail_data)
            }
        }
        return mail_ids
    },

    //更新红点状态
    updateRedStatus: function(bid, num) {
        var red_num = this.red_status_list[bid];
        if (red_num == num) return
        this.red_status_list[bid] = num;
        //红点
        var list = { bid: bid, num: num };
        var MainuiConst = require("mainui_const");
        require("mainui_controller").getInstance().setFunctionTipsStatus(MainuiConst.icon.mail, list)
            //更新红点, 1为邮件 2位公告
        gcore.GlobalEvent.fire(MailEvent.UPDATEREDSTATUS, bid, num);
    },

    getRedSum: function(bid) {
        return this.red_status_list[bid]
    }

});

module.exports = MailModel;