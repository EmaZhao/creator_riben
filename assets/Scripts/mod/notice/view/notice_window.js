// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-25 09:41:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var NoticeWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("notice", "notice_window");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.ctrl = require("notice_controller").getInstance();
        this.dengluMgr = require("login_controller").getInstance().getModel();
        this.node_list = [];
        this.color = new cc.Color(0x64, 0x32, 0x23, 0xff);
        this.data = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        Utils.getNodeCompByPath("main_panel/container/txt_container/txt_title", this.root_wnd, cc.Label).string = Utils.TI18N("亲爱的冒险者大人:");
        Utils.getNodeCompByPath("main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("公告");
        Utils.getNodeCompByPath("main_panel/ok_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("确定");
        var background = this.seekChild("background");
        background.scale = FIT_SCALE;
        this.main_panel = this.seekChild("main_panel");
        this.close_btn = this.seekChild("close_btn");
        this.scrollView = this.seekChild("scrollview");
        this.newscrollView = this.seekChild("scrollview1");
        this.content = this.newscrollView.getChildByName("view").getChildByName("content");


        this.ok_btn = this.seekChild("ok_btn");

        this.container = this.seekChild("container");
        this.txt_container = this.seekChild("txt_container");
        this.txt_title_lb = this.seekChild(this.txt_container, "txt_title", cc.Label);
        this.notice_scroll = this.seekChild("notice_scroll");
        this.notice_scroll_sv = this.seekChild("notice_scroll", cc.ScrollView);
        this.scroll_content = this.seekChild(this.notice_scroll, "content");

        this.container_size = this.notice_scroll.getContentSize();

        // this.layoutWebView();
        this.web_view = this.seekChild(this.container, "web_view", cc.WebView);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        Utils.onTouchEnd(this.close_btn, function() {
            this.ctrl.openNocticeWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.ok_btn, function() {
            this.ctrl.openNocticeWindow(false);
        }.bind(this), 2)

    },

    createScrollView: function(data) { //创建公告主体scrollview
        let list = data;
        for (let index in data) {
            var infoData = data[index];
            var itemPanel = require("notice_item");
            var item = new itemPanel(this);
            item.setParent(this.content);
            item.show();
            item.setZIndex(index);
            item.setData(infoData);

        }
    },

    //分离处理webview，如果有问题可以只修改局部代码
    layoutWebView: function() {
        if (cc.WebView && this.url && this.url != "") {
            var node = new cc.Node();
            this.web_view = node.addComponent(cc.WebView);
            node.setAnchorPoint(0.5, 0.5);
            node.setPosition(this.container_size.width / 2, this.container_size.height / 2);
            node.setContentSize(this.container_size.width, this.container_size.height);
            node.active = false;
            this.txt_container.addChild(node, 99);
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(url) {
        this.url = url;
        //this.setMessage(url); 关服不请求公告
        var data = [{
            summary: "公告",
            title: "サービス終了のお知らせ",
            start_time: "2023/10/25",
            content: "サービス終了のお知らせ\n平素より「プロジェクトドラゴン」をご利用いただき、誠にありがとうございます。\nこの度「プロジェクトドラゴン」は2023年11月29日(水) 14:00をもちまして、\nサービスを終了させていただくことになりました。\n「プロジェクトドラゴン」をご愛顧いただいた皆様には、\n心より感謝を申し上げるとともに、深くお詫び申し上げます。\nまた、サービス終了に向けて、\n2023年10月25日(水) 14:00に実施するメンテナンスにて\n課金アイテムの販売を終了させていただきます。\n【サービス終了までのスケジュール】\n○2023年10月25日(水) 14:00\n・有償アイテム販売終了\n※ご購入されたアイテムはサービス終了までご利用いただけます。\n※購入済みアイテムのポイントへの返還はできません。\n　あらかじめご了承ください。\n○2023年11月29日(水) 14:00\n・サービス終了\n※スケジュールにつきましては、変更させていただく場合がございます。\n　変更する際はお知らせにてご案内させていただきます。\nサービス終了まで残り短い期間ではございますが、\n最後まで「プロジェクトドラゴン」をよろしくお願いいたします。\n「プロジェクトドラゴン」運営チーム",
        }];

        this.createScrollView(data);
    },

    setMessage: function(url) {
        if (this.web_view != null) {
            this.web_view.node.active = false;
        }
        if (url != null) {
            this.setWebViewUrl(url);
        } else {
            this.ok_btn.active = true;
            this.data = this.ctrl.getNoticeData();
            // this.notice_content = this.ctrl.getNoticeContent()
            // if (this.data == null||this.data.length == 0) {
            var loginData = this.dengluMgr.getLoginInfo();
            var svrName = this.dengluMgr.getSvrName(loginData.srv_id);
            var svrTime = loginData.open_time || 0;
            var svrDays = 0;
            var srvurl = this.ctrl.get_notice_url(svrDays, loginData);
            if (srvurl) {
                DownloadManager.getInstance().downloadText(srvurl, function(status, responseText) {
                    var str = responseText;
                    if (responseText) {
                        str = StringUtil.parseStr(str);
                    }
                    if (status == null && responseText != null) {
                        let str = responseText;
                        str = str.replace(/\r\n/g, "\\r\\n");
                        str = str.replace(/\t/g, "");
                        let _str = JSON.parse(str);
                        if (_str.data && _str.data[0]) {
                            this.data = _str.data;
                            var callback = function(data) {
                                this.createScrollView(data);
                                this.data = data;

                            }.bind(this)
                            this.ctrl.setNoticeData(this.data, callback);
                        }

                    } else {
                        cc.log("status==>", status, "responseText==>", responseText);
                    }
                }.bind(this))
            }
        }
    },

    setWebViewUrl: function(url) {
        if (!this.web_view) return
        if (this.web_view) {
            this.web_view.node.active = true;
        }
        this.web_view.url = url;
        this.ok_btn.active = false;
    },

    addNoticeContent: function(list) {
        if (list == null || list.length == 0) return
            //更新先情况,防止加载不到文件时候多次加载

        this.main_panel.stopAllActions();
        var curY = -80;

        //取出第一个用于称谓显示
        this.txt_title_lb.string = list.shift() || "";

        this.list_index = 0;
        let _y = 0;
        this.startUpdate(list.length, function() {
            let index = this.list_index;
            let vo = list[index];
            let sub = this.createSubContent(2, 20, vo, this.container_size.width - 4, 0);
            this.node_list.push(sub);
            curY = curY + sub.node.getContentSize().height + 3;
            let maxY = Math.max(curY, this.container_size.height);
            this.scroll_content.setContentSize(this.container_size.width, maxY + 80);

            sub.node.y = _y - sub.node.getContentSize().height + 5;
            _y = sub.node.y;
            this.list_index += 1;
        }.bind(this), 100)

        this.notice_scroll_sv.scrollToTop(1);
    },

    createSubContent: function(x, y, content, width, linespce) {
        var label = Utils.createRichLabel(22, this.color, cc.v2(0, 0), cc.v2(0, 0), 30, width, this.scroll_content);
        label.string = content;
        label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        label.node.setPosition(x, y);
        return label
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        this.url = null;
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
        this.main_panel.stopAllActions();
        this.ctrl.openNocticeWindow(false);
    },
})