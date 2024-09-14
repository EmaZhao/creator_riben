// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-23 17:39:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WelfareConst = require("welfare_const");
var WelfareEvent = require("welfare_event");

var Bind_phonePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "bind_phone_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("welfare_controller").getInstance();
        this.bind_phone_status = 0;
        this.item_list = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.ok_btn = this.seekChild("ok_btn");
        this.ok_btn_lb = this.seekChild(this.ok_btn, "label", cc.Label);
        this.item_container = this.seekChild("item_container");

        this.bg_sp = this.seekChild("bg", cc.Sprite);
        this.loadRes(PathTool.getBigBg("welfare/txt_cn_bind_phone"), function (res) {
            this.bg_sp.spriteFrame = res
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.ok_btn, function () {
            if (this.bind_phone_status == 0) {        //前往绑定
                if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_BINDPHONE == true && PLATFORM_NAME == "shmix") {
                    SDK.bindphone({ apiType: 'askShow' });
                }else{
                    this.ctrl.openCertifyBindPhoneWindow(true)
                }
            } else if (this.bind_phone_status == 1) {  //已发送奖励
                message(Utils.TI18N("奖励已发送"))
            }

        }.bind(this), 1)

        this.addGlobalEvent(WelfareEvent.UpdateBindPhoneStatus, function () {
            this.updateBindPhoneStatus()
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.updateBindPhoneStatus();
        this.setItemList();
        this.ctrl.setWelfareStatus(WelfareConst.WelfareIcon.bindphone, false)
    },

    //设置绑定状态
    updateBindPhoneStatus: function () {
        var bind_data = this.ctrl.getBindPhoneData();
        if (bind_data == null) return
        if (this.bind_phone_status != bind_data.code) {
            this.bind_phone_status = bind_data.code;
            if (bind_data.code == 0) {
                this.ok_btn_lb.string = Utils.TI18N("前往绑定");
            } else if (bind_data.code == 1) {
                this.ok_btn_lb.string = Utils.TI18N("已发送")
            }
        }
    },

    setItemList: function () {
        var bind_data = this.ctrl.getBindPhoneData();
        if (bind_data == null || bind_data.items == null) return
        var index = 0;
        for (var i in bind_data.items) {
            const v = bind_data.items[i];
            if (!this.item_list[i]) {
                const item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 1, false, true);
                item.show();
                item.setParent(this.item_container);
                item.setData({ bid: v.bid, num: v.num });
                item.setPosition(index * 134 + 60, 0);
                this.item_list[i] = item;
                index = index + 1;
            }
        }
    },

    setVisibleStatus: function (status) {
        this.setVisible(status)
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