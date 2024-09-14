// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     公告
// <br/>Create: 2019-08-8 20:53:13
// --------------------------------------------------------------------
var PathTool = require("pathtool")
var WelfareConst = require("welfare_const");

var PastePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "notice_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("notice_controller").getInstance();
        this.dengluMgr = require("login_controller").getInstance().getModel();
        this.node_list = [];
        this.color = new cc.Color(0x64, 0x32, 0x23, 0xff);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");

        this.title_lab = this.seekChild("title_lab", cc.Label);
        this.qq_lab = this.seekChild("qq_lab", cc.Label);
        this.qq_lab.string = "";
        this.notice_scroll = this.seekChild("notice_scroll");
        this.notice_scroll_sv = this.seekChild("notice_scroll", cc.ScrollView);
        this.scroll_content = this.seekChild(this.notice_scroll, "content");

        this.container_size = this.notice_scroll.getContentSize();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },


    setMessage: function () {
        
        this.notice_content = this.ctrl.getNoticeContent();
        if (this.notice_content == null) {
            var loginData = this.dengluMgr.getLoginInfo();
            var svrName = this.dengluMgr.getSvrName(loginData.srv_id);
            var svrTime = loginData.open_time || 0;
            var svrDays = 0;

            var srvurl = this.ctrl.get_notice_url(svrDays, loginData);
            if (srvurl) {
                DownloadManager.getInstance().downloadText(srvurl, function (status, responseText) {
                    var str = StringUtil.parseStr(responseText);
                    if (status == null && responseText != null) {
                        let str = responseText;
                        str = str.replace(/\r\n/g, "\\r\\n");
                        str = str.replace(/\t/g, "");
                        let _str = JSON.parse(str);
                        if (_str.data && _str.data[0]) {
                            this.notice_content = StringUtil.parseStr(_str.data[0].content).string;
                            var list = this.notice_content.split("|");
                            this.addNoticeContent(list)
                            this.ctrl.setNoticeContent(this.notice_content);
                        }

                    } else {
                        cc.log("status==>", status, "responseText==>", responseText);
                    }
                }.bind(this))
            }
        } else {
            var list = this.notice_content.split("|");
            this.addNoticeContent(list)
        }
    },


    addNoticeContent: function (list) {
        if (list == null || list.length == 0) return

        //更新先情况,防止加载不到文件时候多次加载

        this.main_container.stopAllActions();
        var curY = -80;

        //取出第一个用于称谓显示
        this.title_lab.string = list.shift() || "";

        this.list_index = 0;
        let _y = 0;
        this.startUpdate(list.length, function () {
            let index = this.list_index;
            let vo = list[index];
            let sub = this.createSubContent(2, 20, vo, this.container_size.width - 4, 0);
            this.node_list.push(sub);
            curY = curY + sub.node.getContentSize().height + 3;//60
            cc.log(curY);
            let maxY = Math.max(curY, this.container_size.height);
            this.scroll_content.setContentSize(this.container_size.width, maxY+80);

            sub.node.y = _y - sub.node.getContentSize().height + 5;
            _y = sub.node.y;
            this.list_index += 1;
        }.bind(this), 100)
        this.notice_scroll_sv.scrollToTop(0.5);
    },

    createSubContent: function (x, y, content, width, linespce) {
        var label = Utils.createRichLabel(24, this.color, cc.v2(0, 0), cc.v2(0, 0), 30, width, this.scroll_content);
        label.string = content;
        label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        label.node.setPosition(x, y);
        return label
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.setMessage();
    },



    setVisibleStatus: function (status) {
        this.setVisible(status)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
      if (this.node_list) {
            for (var i in this.node_list) {
                var v = this.node_list[i];
                if (v instanceof cc.Node) {
                    v.destroy();
                    v = null;
                } else {
                    v.node.destroy();
                    v = null;
                }
            }
            this.node_list = null;
        }
        if(this.main_container){
            this.main_container.stopAllActions();
        }
    },
})