// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-28 10:22:08
// --------------------------------------------------------------------
var NoticeController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var NoticeModel = require("notice_model");

        this.model = new NoticeModel();
        this.model.initConfig();
        this.noticeData = [];
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(10810, this.on10810); // 反馈处理
    },

    // 发送反馈信息
    sender10810: function (issue_type, title, content) {
        var protocal = {};
        protocal.issue_type = issue_type;
        protocal.title = title;
        protocal.content = content;
        this.SendProtocal(10810, protocal);
    },

    // 反馈结果
    on10810: function (data) {
        message(data.msg);
    },

    // 打开bug反馈
    openBugPanel: function (status) {
        if (status) {
            Log.info("=====aaaaaaa");
            if (!this.bug_panel) {
                var BugPanel = require("bug_panel");
                this.bug_panel = new BugPanel();
            }
            this.bug_panel.open();
        } else {
            if (this.bug_panel) {
                this.bug_panel.close();
                this.bug_panel = null;
            }
        }
    },

    //打开游戏公告
    //默认请url请传nil值，改url为邮件超链接情况传值
    openNocticeWindow: function (status, url) {
        if (status) {
            if (!this.notice_view) {
                var notice_view = require("notice_window");
                this.notice_view = new notice_view();
            }
            this.notice_view.open(url);
        } else {
            if (this.notice_view) {
                this.notice_view.close();
                this.notice_view = null;
            }
        }
    },

    get_notice_url: function (days, loginData) {
        let loginInfo = require("login_controller").getInstance().getModel().getLoginInfo()
        let host = loginInfo && loginInfo.host || loginData.host;
        let channel = window.CHANNEL;
        //时间戳
        var str = "";
        if(loginInfo.ws){
          if(loginInfo.ws == "wss"){
            str = "s";
          }
        }
        let date_time = Math.ceil(Date.now() / 1000);
        // console.log(cc.js.formatStr("host=%s...channel=%s...time=%s"),host,channel,date_time);
        return cc.js.formatStr("http%s://%s/api.php/local/local/notice/?channel=%s&time=%s", str,host, channel, date_time)
    },

    setNoticeContent: function (str) {
        this.notice_content = str;
    },

    getNoticeContent: function () {
        return this.notice_content;
    },

    setNoticeData:function(data,callback){//数据保存一個
      var newData = [];
      for(let index in data){
        const infoData = data[index];
        newData.push(infoData);
      }
      if(newData.length>1){
        newData.sort((a,b)=>{
          return Number(b.start_time)-Number(a.start_time)
        });
      }
      data = this.checkEndTime(newData);
      if(data){
        this.noticeData = data;
      }
      if(callback){
        callback(data);
      }
    },

    checkEndTime(data){
      var newData = []
      for(let index in data){
        let infoData = data[index];
        infoData.index = index;
        let end_time = infoData.end_time;
        if(end_time - gcore.SmartSocket.getTime() >0){
          newData.push(infoData);
        }
      }
      return newData;
    },

    getNoticeData:function(){
      return this.noticeData
    },
});

module.exports = NoticeController;
