// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-29 14:53:41
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Invitecode_myPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("invitecode", "invitecode_my_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("invitecode_controller").getInstance();
        this.tesk_list = Config.invite_code_data.data_tesk_list;
        this.item_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.btn_get = this.seekChild("btn_get");
        this.btn_get.active = false;
        this.btn_goto = this.seekChild("btn_goto");
        this.btn_goto.active = false;

        this.has_spr = this.seekChild("has_spr");
        this.has_spr.active = false;

        this.tesk_num_lb = this.seekChild("tesk_num", cc.Label);
        this.title_name_lb = this.seekChild("title_name", cc.Label);
        this.title_name_lb.string = "";
        this.good_cons = this.seekChild("good_cons");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.btn_get, function () {
            if (this.data) {
                this.ctrl.sender19805(this.data.id)
            }
        }.bind(this), 1)
        Utils.onTouchEnd(this.btn_goto, function () {
            message(Utils.TI18N("您邀请的用户还未达成目标哦~~~"))
        }.bind(this), 1)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        if (this.tesk_list[data.id]) {
            this.title_name_lb.string = this.tesk_list[data.id].desc || "";
        }

        var tesk_data = this.ctrl.getModel().getInviteCodeFinishData(data.id);
        if (tesk_data && Utils.next(tesk_data)) {
            this.btn_goto.active = false;
            var num = tesk_data.num || 0;
            var str = cc.js.formatStr("(%s/%s)", num, data.num);
            this.tesk_num_lb.string = str;
            var had = tesk_data.had || 0;
            if (num > had) {
                this.has_spr.active = false;
                this.btn_get.active = true;
            } else {
                this.has_spr.active = true;
                this.btn_get.active = false;
            }
        } else {
            this.has_spr.active = false;
            this.btn_goto.active = true;
            var str = cc.js.formatStr("(%s/%s)", 0, data.num);
            this.tesk_num_lb.string = str;
        }

        var list = {};
        var index = 0;
        if (this.tesk_list[data.id]) {
            for (var i in this.tesk_list[data.id].items) {
                const v = this.tesk_list[data.id].items[i];
                if (!this.item_list[i]) {
                    const item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, 0.7, false, true);
                    item.show();
                    item.setParent(this.good_cons);
                    item.setPosition(index * 100 + 60, 50);
                    this.item_list[i] = item;
                    index = index + 1;
                }
                const item = this.item_list[i];
                item.setData({ bid: v[0], num: v[1] });
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_list) {
            for (var k in this.item_list) {
                this.item_list[k].deleteMe();
                this.item_list[k] = null;
            }
            this.item_list = null;
        }
    },
})