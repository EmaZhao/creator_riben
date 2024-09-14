// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-24 19:53:25
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WelfareEvent = require("welfare_event");

var Certify_bind_phoneWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "certify_bind_phone_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("welfare_controller").getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.ok_btn = this.seekChild("ok_btn");

        this.send_btn = this.seekChild("send_btn", cc.Button);
        this.send_btn_label = this.seekChild(this.send_btn.node, "label", cc.Label);

        this.phone_box = this.seekChild("phone_box", cc.EditBox);
        this.certify_box = this.seekChild("certify_box", cc.EditBox);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openCertifyBindPhoneWindow(false)
        }.bind(this), 2)

        Utils.onTouchEnd(this.ok_btn, function () {
            this.sendBindPhone()
            Utils.playButtonSound(1)
        }.bind(this), 1)

        this.send_btn.node.on("click", function () {
            this.requestCertifyNumber();
            Utils.playButtonSound(1)
        }, this)

        this.addGlobalEvent(WelfareEvent.UpdateBindPhoneStatus, function (data) {
            this.updateBindStatus(data)
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {

    },

    //请求验证码
    requestCertifyNumber: function () {
        var phone_number = this.phone_box.string;
        if (phone_number == "" || phone_number.length != 11) {
            message(Utils.TI18N("请输入正确的手机号码!"));
            return
        }
        this.ctrl.requestBindPhone(phone_number, "")
    },

    //更新绑定状态
    updateBindStatus: function (data) {
        if (data && data.status == 2) {
            this.count_down_time = 60;
            this.send_btn_label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            Utils.setGreyButton(this.send_btn, true);
            this.clearEneTime();
            this.countDownEndTime();
            this.timeticket = gcore.Timer.set(function () {
                this.countDownEndTime()
            }.bind(this), 1000, -1)
        }
    },

    //验证码倒计时
    countDownEndTime: function () {
        this.count_down_time = this.count_down_time - 1;
        if (this.count_down_time == 0) {
            this.send_btn_label.string = Utils.TI18N("发送验证码");
            this.send_btn_label.node.color = new cc.Color(0x71, 0x28, 0x04, 0xff);
            Utils.setGreyButton(this.send_btn, false);
            this.clearEneTime();
            return
        }
        this.send_btn_label.string = Utils.TI18N("发送中..") + this.count_down_time
    },

    clearEneTime: function () {
        if (this.timeticket) {
            gcore.Timer.del(this.timeticket);
            this.timeticket = null;
        }
    },

    //绑定
    sendBindPhone: function () {
        var phone_number = this.phone_box.string;
        if (phone_number == "" || phone_number.length != 11) {
            message(Utils.TI18N("请输入正确的手机号码!"))
            return
        }
        var certify_number = this.certify_box.string;
        if (certify_number == "") {
            message(Utils.TI18N("验证码不能为空!"))
        }
        this.ctrl.requestBindPhone(phone_number, certify_number);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.clearEneTime();
        this.ctrl.openCertifyBindPhoneWindow(false);
    },
})