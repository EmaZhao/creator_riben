// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-02-26 21:07:32
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var VipEvent = require("vip_event");

var VipController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var VipModel = require("vip_model");

        this.model = new VipModel();
        this.model.initConfig();

        this.vip_redpoint_status = {};
        this.vip_privilege_redpoint = {};//vip特权 item 红点
        this.is_first = true;
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.login_event_success == null) {
            this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                gcore.GlobalEvent.unbind(this.login_event_success);
                this.login_event_success = null;
                this.role_vo = RoleController.getInstance().getRoleVo();
                if (this.role_vo) {
                    if (this.role_assets_event == null) {
                        this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                            if (key == "vip_lev") {
                                this.setIsFirst(true);
                                var get_list = this.model.getGetGiftList();
                                var item_status = (get_list[this.role_vo.vip_lev] == null) && this.getIsFirst();
                                this.setTipsVIPStstus(VIPREDPOINT.VIP_TAB, item_status);
                                gcore.GlobalEvent.fire(VipEvent.UPDATA_ITEM_REDPOINT)
                            }
                        }.bind(this))
                    }
                }
                // this.sender16707() //月卡领取
                // this.sender16710() //VIP礼包红点用
                // this.sender16712() //累充红点
                // this.sender21006() //每日礼包
                // this.sender24502() //特权礼包
            }, this)
        }

        if (this.re_link_game_event == null) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function () {
                // this.sender21006();
            }, this)
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(16700, this.handle16700) //获取充值列表信息
        this.RegisterProtocal(16710, this.handle16710) //VIP礼包领取信息
        this.RegisterProtocal(16711, this.handle16711) //VIP等级奖励领取
        this.RegisterProtocal(16712, this.handle16712) //获取永久累充信息
        this.RegisterProtocal(16713, this.handle16713) //领取累充奖励
        this.RegisterProtocal(21005, this.handle21005) //三倍返利信息
        this.RegisterProtocal(21006, this.handle21006) //每日礼包数据
        this.RegisterProtocal(24501, this.handle24501) //购买VIP特权礼包
        this.RegisterProtocal(24502, this.handle24502) //VIP特权礼包数据

        this.RegisterProtocal(16707, this.handle16707)
        this.RegisterProtocal(16708, this.handle16708)
        
        this.RegisterProtocal(16730, this.handle16730);
        this.RegisterProtocal(16731, this.handle16731);
      
        this.RegisterProtocal(21020, this.handle21020);//每日一元红点
    },

    setPrivilegeRedpoint: function (index, status) {
        this.vip_privilege_redpoint[index] = status;
    },

    getPrivilegeRedpoint: function (index) {
        var status = this.vip_privilege_redpoint[index];
        return status
    },

    getIsFirst: function () {
        return this.is_first
    },

    setIsFirst: function (status) {
        this.is_first = status
    },

    //获取充值列表信息
    sender16700: function () {
        this.SendProtocal(16700, {})
    },

    handle16700: function (data) {
        gcore.GlobalEvent.fire(VipEvent.UPDATE_CHARGE_LIST, data.list);
    },

    //三倍返利信息
    sender21005: function () {
        this.SendProtocal(21005, {})
    },

    handle21005: function (data) {
        gcore.GlobalEvent.fire(VipEvent.THREE_RECHARGE, data);
    },

    //请求每次礼包数据
    sender21006: function () {
        this.SendProtocal(21006, {})
    },

    handle21006: function (data) {
        if (data) {
            this.model.setDailyGiftData(data.first_gift);
            gcore.GlobalEvent.fire(VipEvent.DAILY_GIFT_INFO);
        }
    },

    //请求购买VIP特权礼包
    sender24501: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(24501, protocal);
    },

    handle24501: function (data) {
        if (data.msg) {
            message(data.msg);
        }
    },

    //请求VIP特权礼包数据
    sender24502: function () {
        this.SendProtocal(24502, {});
    },

    handle24502: function (data) {
        if (data) {
            this.model.setPrivilegeList(data.list);
            var status = this.model.getPrivilegeRedStatus();
            this.setTipsVIPStstus(VIPREDPOINT.PRIVILEGE, status);
            gcore.GlobalEvent.fire(VipEvent.PRIVILEGE_INFO);
        }
    },

    //VIP界面月卡领取
    sender16707: function () {
        this.SendProtocal(16707, {});
    },

    handle16707: function (data) {
        var status = false;
        if (data.status == 1) {
            status = true;
        }
        this.model.setMonthCard(data.status);
        this.setTipsVIPStstus(VIPREDPOINT.MONTH_CARD, status);
        gcore.GlobalEvent.fire(VipEvent.SUPRE_CARD_GET, data.status);
    },

    sender16708: function () {
        this.SendProtocal(16708, {});
    },

    handle16708: function (data) {
        message(data.msg)
    },

    //VIP礼包领取信息
    sender16710: function () {
        this.SendProtocal(16710, {});
    },

    handle16710: function (data) {
        this.model.setGetGiftList(data.list);
        if (this.role_vo == null) {
            this.role_vo = RoleController.getInstance().getRoleVo();
        }
        var get_list = this.model.getGetGiftList();
        var item_status = (get_list[this.role_vo.vip_lev] == null) && this.getIsFirst();
        this.setTipsVIPStstus(VIPREDPOINT.VIP_TAB, item_status);
        gcore.GlobalEvent.fire(VipEvent.UPDATA_ITEM_REDPOINT)
    },

    //红点
    setTipsVIPStstus: function (bid, status) {
        this.vip_redpoint_status[bid] = status
        let redpoint = false
        for (let i in this.vip_redpoint_status) {
            let v = this.vip_redpoint_status[i]
            if (v == true) {
                redpoint = true
                break
            }
        }
        var MainuiController = require("mainui_controller")
        var MainuiConst = require("mainui_const")
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.charge, redpoint);
        require("mall_controller").getInstance().getModel().setMallMainRedPointData(require("mall_const").MallFunc.Charge,redpoint);
    },

    //VIP等级奖励领取
    sender16711: function (lev) {
        var protocal = {};
        protocal.lev = lev;
        this.SendProtocal(16711, protocal);
    },

    handle16711: function (data) {
        message(data.msg)
    },

    //累充奖励信息
    sender16712: function () {
        this.SendProtocal(16712, {});
    },

    handle16712: function (data) {
        this.charge_sum = data.charge_sum //当前总充值数
        this.model.setAccList(data.list);
        gcore.GlobalEvent.fire(VipEvent.ACC_RECHARGE_INFO, data);
    },

    getChargeSum: function () {
        return this.charge_sum || 0;
    },

    //领取累充奖励
    sender16713: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(16713, protocal);
    },

    handle16713: function (data) {
        message(data.msg);
    },

    //
    sender16730: function () {
        var protocal = {};
        this.SendProtocal(16730, protocal);
    },

    // time
    // state
    handle16730: function (data) {
        this.model.setGiveVipInfo(data);
        this.model.setGiveVipStatus();
        gcore.GlobalEvent.fire(VipEvent.GIVE_VIP_UPDATE);
    },

    //
    sender16731: function () {
        var protocal = {};
        this.SendProtocal(16731, protocal);
    },

    //领取vip
    handle16731: function (data) {
        message(data.msg);
        if(data.code == 1){
            this.openVipAwardWindow();
            this.sender16730();
        }
    },

    //index是大标签页 VIPTABCONST
    //sub_type是vip特权界面的 要跳哪个等级就传哪个等级
    openVipMainWindow: function (status, index, sub_type ,callFunc) {
        if (status) {
            if (IS_SHOW_CHARGE == false) {
                message(Utils.TI18N("功能暂未开放，敬请期待"));
                return
            }

            var charge_cfg = gdata("charge_data", "data_constant", ["open_lv"]);
            if (charge_cfg) {
                if (this.role_vo && this.role_vo.lev < charge_cfg.val) {
                    message(charge_cfg.desc);
                    return
                }
            }

            if (!this.vip_window) {
                this.vip_window = Utils.createClass("vip_main_window");
            }
            index = index || 1;
            if (this.vip_window) {
                this.vip_window.open(index, sub_type);
            }
            if(callFunc){
                this.deleteCallFunc = callFunc
            }
        } else {
            if (this.vip_window) {
                this.vip_window.close();
                this.vip_window = null;
                if(this.deleteCallFunc){
                    this.deleteCallFunc()
                    this.deleteCallFunc = null;
                }
            }
        }
    },

    // 打开奖励VIP界面
    openVipAwardWindow:function(status){
        if(status == true){
            if(!this.vip_award_window){
                this.vip_award_window = Utils.createClass("vip_award_window",this);
            }
            if(this.vip_award_window && this.vip_award_window.isOpen() == false){
                this.vip_award_window.open();
            }
            
        }else{
            if(this.vip_award_window)   {
                this.vip_award_window.close();
                this.vip_award_window = null;
            }
        }
    },

    //切换vip面板的标签页
    changeMainWindowTab: function (index) {
        if (this.vip_window) {
            this.vip_window.changeTabView(index);
        }
    },

    handle21020(data){
        var status = false;
        if(data.code == 1){
            status = true;
        }
        var MainuiController = require("mainui_controller")
        var MainuiConst = require("mainui_const")
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.one_gift, status)
    },
});

module.exports = VipController;