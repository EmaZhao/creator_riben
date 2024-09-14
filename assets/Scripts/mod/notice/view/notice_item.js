// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     公告Item项
// <br/>Create: 2019-05-06 14:34:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool")
var NoticeController = require("notice_controller");

let NOTICE_TYPE = {
    1: "版本更新",
    2: "活动",
    3: "bug",
    4: "公告",
    5: "商城",
    6: "其他",
}

var NoticeItem = cc.Class({
    extends: BasePanel,
    ctor: function(params) {
        this.prefabPath = PathTool.getPrefabPath("notice", "notice_item");
        this.ctrl = NoticeController.getInstance();
        if (params) {
            this.params = params;
        }
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

        this.iType = 1; //默认是不展开，2是展开状态
        this.color = new cc.Color(0x64, 0x32, 0x23, 0xff);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        if (this.params) {
            if (this.params.width) {
                this.root_wnd.width = this.params.width;
            }
            if (this.params.height) {
                this.root_wnd.height = this.params.height;
            }
        }
        this.top = this.root_wnd.getChildByName("top");
        this.mainContainer_top = this.top.getChildByName("main_container");
        this.bg = this.mainContainer_top.getChildByName("bg");

        this.title_nd = this.mainContainer_top.getChildByName("title");

        this.type_nd = this.mainContainer_top.getChildByName("type");
        this.time_nd = this.mainContainer_top.getChildByName("time");
        this.btn_nd = this.mainContainer_top.getChildByName("btn");
        this.select = this.mainContainer_top.getChildByName("select");

        //展开
        this.bottom_nd = this.root_wnd.getChildByName("bottom");
        this.bottom_nd.active = true;
        this.content = this.bottom_nd.getChildByName("content");
        // this.redPoint = this.mainContainer_top.getChildByName("redPoint");
        // this.redPoint.active = false;
        this.refreshUI();
    },


    setData: function(data) {
        this.data = data;
        cc.log(data.type);
    },

    getData: function() {
        return this.data;
    },

    addCallBack: function(value) {
        this.callback = value;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        // Utils.onTouchEnd(this.btnRule, function () {
        // }.bind(this), 1)

        //当用户点击的时候记录鼠标点击状态
        this.btn_nd.on(cc.Node.EventType.TOUCH_START, function(event) {
            var touches = event.getTouches();
            this.touch_began = touches[0].getDelta();
        }, this);



        //当鼠标抬起的时候恢复状态
        this.btn_nd.on(cc.Node.EventType.TOUCH_END, function(event) {
            var touches = event.getTouches();
            this.touch_end = touches[0].getDelta();
            var is_click = true;
            if (this.touch_began != null) {
                is_click = Math.abs(this.touch_end.x - this.touch_began.x) <= 20 &&
                    Math.abs(this.touch_end.y - this.touch_began.y) <= 20;
            }
            if (is_click == true) {
                Utils.playButtonSound(ButtonSound.Normal);
                if (this.callback) {
                    this.callback();
                }
                this.updateBottomStatus()
            }
        }, this);

    },

    refreshUI: function() {
        if (this.data) {
            if (this.data.summary) {
                this.type_nd.getComponent(cc.Label).string = Utils.TI18N(this.data.summary);
            }
            if (this.data.start_time) {
                this.time_nd.getComponent(cc.Label).string = Utils.TI18N(this.data.start_time);
                // var str = TimeTool.getYMD3(this.data.start_time)
                // this.time_nd.getComponent(cc.Label).string = Utils.TI18N(str);
            }
            if (this.data.title) {
                this.title_nd.getComponent(cc.Label).string = Utils.TI18N(this.data.title);
            }
            if (this.data.content) {
                this.content.getComponent(cc.RichText).string = Utils.TI18N(this.data.content);
                this.contentSize = this.content.getContentSize();
                this.bottom_nd.active = false;
            }
        }
    },

    updateBottomStatus: function() {
        var changeH = 0;
        if (this.iType == 1) {
            this.iType = 2;
            this.btn_nd.rotation = 0;
            this.bottom_nd.active = true;
            this.select.active = true;
            this.bg.active = false;
            // this.root_wnd.parent.height += this.bottom_nd.height;
            changeH = this.contentSize.height + 10;
        } else {
            this.iType = 1;
            this.btn_nd.rotation = 90;
            // this.root_wnd.parent.height -= this.bottom_nd.height;
            this.bottom_nd.active = false;
            this.select.active = false;
            this.bg.active = true;
            changeH = -this.contentSize.height - 10;
        }
        // this.updateLayout(changeH);
        // if(changeH <0){
        //   return;
        // }
        // this.root_wnd.parent.y -= changeH;
    },

    updateLayout: function(changeH) {
        let cur_index = this.root_wnd.parent.children.indexOf(this.root_wnd);
        for (let index in this.root_wnd.parent.children) {
            let item = this.root_wnd.parent.children[index];
            if (Number(index) == cur_index) {
                continue;
            }
            if (item.y > this.root_wnd.y) {
                continue;
            }
            item.y -= changeH;
        }
        this.root_wnd.parent.height += changeH;
        for (let index in this.root_wnd.parent.children) {
            let item = this.root_wnd.parent.children[index];
            item.y += changeH;
        }
        if (changeH < 0) {
            return;
        }
        this.root_wnd.parent.y -= changeH;
    },


    setExtendData: function(extend) {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {},



    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },


    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {

    },
})