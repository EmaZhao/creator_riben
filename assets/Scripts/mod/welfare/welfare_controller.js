// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     福利
// <br/>Create: 2018-12-19 10:57:29
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");
var WelfareEvent = require("welfare_event");
var WelfareConst = require("welfare_const");
// var ActionConst = require("action_const");

var SHOW_BAIDU_TIEBA = true                  // 是否显示百度贴吧
var SHOW_SINGLE_INVICODE = true              // 是否显示个人推荐码
var SHOW_BIND_PHONE = true                  // 是否需要显示手机绑定界面
var SHOW_WECHAT_CERTIFY = true               // 是否显示微信公众号
var SHOW_GAME_SHARE = true                   // 游戏分享

var WelfareController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var WelfareModel = require("welfare_model");

        this.model = new WelfareModel();
        this.model.initConfig();

        this.welfare_list = {};
        this.welfare_status_list = {}  //福利状态列表
        this.welfare_cache_red = {};    //福利缓存红点状态
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.init_role_event == null) {
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                gcore.GlobalEvent.unbind(this.init_role_event);
                this.init_role_event = null;
                // this.requestInitProto();

                this.role_vo = RoleController.getInstance().getRoleVo();
                if (this.role_assets_event == null) {
                    this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                        if (key == "lev") {
                            this.updateWelfareRedStatus(value);
                        }
                    }, this)
                }
            }, this)
        }

        //断线重连请求月卡
        if (this.re_link_game_event == null) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function () {
                var GuideController = require("guide_controller");
                if (!GuideController.getInstance().isInGuide())
                    this.openMainWindow(false);
                //判断精彩活动图标在不在,请求精彩活动的数据
                var vo = MainuiController.getInstance().getFunctionIconById(MainuiConst.icon.welfare);
                if (vo != null) {
                    this.sender16705();
                }
            }, this)
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(14100, this.handle14100)     //签到信息
        this.RegisterProtocal(14101, this.handle14101)     //领取签到奖励

        this.RegisterProtocal(16705, this.handle16705)     //月卡信息
        this.RegisterProtocal(16706, this.handle16706)     //领取月卡

        this.RegisterProtocal(21002, this.handle21002)     //今日充值次数


        //调查问卷
        this.RegisterProtocal(24600, this.handle24600)
        this.RegisterProtocal(24601, this.handle24601)
        this.RegisterProtocal(24602, this.handle24602)
        this.RegisterProtocal(24603, this.handle24603)
        this.RegisterProtocal(24604, this.handle24604)

        this.RegisterProtocal(21007, this.handle21007)

        // 每日礼
        this.RegisterProtocal(21008, this.handle21008)
        this.RegisterProtocal(21009, this.handle21009)

        // 手机绑定奖励状态
        this.RegisterProtocal(16635, this.handle16635)
        this.RegisterProtocal(16636, this.handle16636)
        this.RegisterProtocal(16697, this.handle16697)
        this.RegisterProtocal(16698, this.handle16698)

        // 微信公众号
        this.RegisterProtocal(16633, this.handle16633)
        this.RegisterProtocal(16634, this.handle16634)

        //爱微游分享和关注
        this.RegisterProtocal(16691, this.handle16691)
        this.RegisterProtocal(16693, this.handle16693)
        this.RegisterProtocal(16692, this.handle16692)
        this.RegisterProtocal(16694, this.handle16694)

        //深海小游戏收藏
        this.RegisterProtocal(16695, this.handle16695)
        this.RegisterProtocal(16696, this.handle16696)
    },

    //登录请求的协议
    requestInitProto: function () {
        this.sender14100() //签到红点
        this.sender16705() //月卡信息
        this.sender24600() //问卷
        this.sender21008() //每日礼
        this.sender16635() //手机绑定奖励状态
        this.sender16633()
        this.send16693();
        this.send16691();
    },

    //签到信息
    sender14100: function () {
        var protocal = {};
        this.SendProtocal(14100, protocal);
    },

    //月卡信息
    sender16705: function () {
        var protocal = {};
        this.SendProtocal(16705, protocal);
    },

    //调查问卷状态
    sender24600: function () {
        this.SendProtocal(24600, {});
    },

    //请求每日礼状态
    sender21008: function () {
        this.SendProtocal(21008, {});
    },

    //请求手机绑定信息
    sender16635: function () {
        this.SendProtocal(16635, {});
    },

    sender16633: function () {
        this.SendProtocal(16633, {});
    },

    handle14100: function (data) {
        gcore.GlobalEvent.fire(WelfareEvent.Update_Sign_Info, data);
        var is_show = false;
        var recharge_count = this.model.getRechargeCount();
        if (data.status == 0 || (recharge_count > 0 && data.status == 1)) {
            is_show = true;
        }
        this.setWelfareStatus(WelfareConst.WelfareIcon.sign, is_show);
    },

    //领取签到奖励
    sender14101: function (activity) {
        var protocal = {
          
        };
        if(activity){
          protocal.month = activity.month;
          protocal.day1 = activity.day;
        }
        this.SendProtocal(14101, protocal);
    },

    handle14101: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(WelfareEvent.Sign_Success, data);
            var is_show = false;
            var recharge_count = this.model.getRechargeCount();
            if (data.status == 0 || (recharge_count > 0 && data.status == 1)) {
                is_show = true;
            }
            this.setWelfareStatus(WelfareConst.WelfareIcon.sign, is_show)
        }
    },

    handle16705: function (data) {
        this.model.setYueka(data);
        gcore.GlobalEvent.fire(WelfareEvent.Update_Yueka, data);

        var supre_status = false;//至尊月卡
        var honor_status = false;//荣耀月卡
        if (data.card1_is_reward == 1) {
            supre_status = true;
        }
        if (data.card2_is_reward == 1) {
            honor_status = true;
        }
        this.setWelfareStatus(WelfareConst.WelfareIcon.supre_yueka, supre_status);
        this.setWelfareStatus(WelfareConst.WelfareIcon.honor_yueka, honor_status);
    },

    sender16706: function (card_type) {
        var protocal = {};
        protocal.card_type = card_type;
        this.SendProtocal(16706, protocal)
    },

    handle16706: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(WelfareEvent.Update_Get_Yueka, data.card_type);
            if (data.card_type == 1) {
                this.setWelfareStatus(WelfareConst.WelfareIcon.supre_yueka, false);
            } else if (data.card_type == 2) {
                this.setWelfareStatus(WelfareConst.WelfareIcon.honor_yueka, false);
            }
        }
    },

    //今日充值次数
    sender21002: function () {
        var protocal = {};
        this.SendProtocal(21002, protocal);
    },

    handle21002: function (data) {
        this.model.setRechargeCount(data.count);
        this.sender14100() //更新下签到红点
    },

    //判断一个福利是否开启了
    checkCanAdd: function (bid) {
        var config = gdata("holiday_client_data", "data_info", [bid]);
        if (config == null) return false
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo.lev < config.open_lev) return false
        var is_verifyios = config.is_verifyios;
        if (is_verifyios == 1) return true//如果是提审服都要显示
        if (bid == WelfareConst.WelfareIcon.bindphone) {
            return SHOW_BIND_PHONE
        } else if (bid == WelfareConst.WelfareIcon.wechat) {
            return SHOW_WECHAT_CERTIFY
        } else if (bid == WelfareConst.WelfareIcon.poste) {
            return SHOW_BAIDU_TIEBA
        } else if (bid == WelfareConst.WelfareIcon.invicode) {
            return SHOW_SINGLE_INVICODE
        } else if (bid == WelfareConst.WelfareIcon.share_game) {
            return SHOW_GAME_SHARE
        } else {
            return IS_SHOW_CHARGE;
        }
    },

    //打开福利主界面 bid取WelfareConstants WelfareIcon 跳转指定标签页 
    openMainWindow: function (status, bid) {
        if (status == true) {
            if (IS_SHOW_CHARGE == false) //福利面板在不可充值不要打开了
                return
            var role_vo = RoleController.getInstance().getRoleVo();
            var data_info = Config.holiday_client_data.data_info;
            if (data_info && data_info[bid]) {
                if (role_vo.lev < data_info[bid].open_lev) {
                    message(cc.js.formatStr(Utils.TI18N("人物等级%s开启"), data_info[bid].open_lev));
                    return
                }
            }
            //默认福利
            //这里重新设置一下标签
            var sub_vo = null;
            for (var k in Config.holiday_client_data.data_info) {
                var v = gdata("holiday_client_data", "data_info", [k]);
                if (this.welfare_list[v.bid] == null) {
                    if (this.checkCanAdd(v.bid)) {
                        var WelfareSubTabVo = require("welfare_sub_tab_vo");
                        sub_vo = new WelfareSubTabVo();
                        if (sub_vo.update != null) {
                            sub_vo.update(v);
                        }
                        this.welfare_list[v.bid] = sub_vo;
                    }
                }
            }

            if (!this.welfare_win) {
                this.welfare_win = Utils.createClass("welfare_main_window");
            }
            this.welfare_win.open(bid);
        } else {
            if (this.welfare_win != null) {
                this.welfare_win.close();
                this.welfare_win = null;
            }
        }
    },

    //普通签到
    openActivityWindow:function(status){
      if(status){
        if (!this.activity_window) {
          this.activity_window = Utils.createClass("action_activity_window", this);;
        }
        if (this.activity_window && this.activity_window.isOpen() == false) {
            this.activity_window.open();
        }
      }else{
        if (this.activity_window) {
          this.activity_window.close();
          this.activity_window = null;
        }
      }
    },

    //获取福利标签列表
    getWelfareSubList: function () {
        var welfare_sub_list = [];
        var ActionController = require("action_controller");

        if (this.welfare_list != null && Utils.next(this.welfare_list) != null) {
            for (var k in this.welfare_list) {
                var v = this.welfare_list[k];
                var need_add = true;
                if (ActionController.getInstance().isSpecialBid(v.bid)) {
                    var vo = ActionController.getInstance().getActionSubTabVo(v.bid);
                    if (vo == null) {
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.quest) {
                    var open = this.model.getQuestOpenData();
                    if (open && open.status == 0) {
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.bindphone) {
                    var is_over = this.checkBindPhoneStatus();
                    if (is_over == true) {
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.wechat) {//官微福利
                    // if (PLATFORM_TYPR == "SH_RH") {   //已关注并且领取了奖励
                    //     if (window.SH_RH_IS_SUBSCRIBE == true && this.model.getSubscriptionAwardStatus() == 1) {
                    //         need_add = false;
                    //     }
                    // }
                    if (USE_SDK == true && (PLATFORM_TYPR == "QQ_SDK" || PLATFORM_TYPR == "SH_SDK")) {
                        need_add = false;
                    } else if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_SUBSCRIBE == false) {
                        need_add = false;
                    }else if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_SUBSCRIBE == false){
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.invicode) {//推荐码
                    if (USE_SDK == true && PLATFORM_TYPR == "QQ_SDK") {
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.poste) {//贴吧
                    if (USE_SDK == true && PLATFORM_TYPR == "QQ_SDK") {
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.share_game) {//邀请好友
                    if (USE_SDK == true && (PLATFORM_TYPR == "QQ_SDK" || PLATFORM_TYPR == "SH_SDK")) {
                        need_add = false;
                    } else if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_SHARE == false) {
                        need_add = false;
                    }else if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_SHARE == false){
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.qq_notice) {//QQ公告
                    if (USE_SDK == false || PLATFORM_TYPR != "QQ_SDK") {
                        need_add = false;
                    }
                } else if (v.bid == WelfareConst.WelfareIcon.sh_share_game || v.bid == WelfareConst.WelfareIcon.sh_collect) {//深海小程序游戏分享 深海小程序微信公众号 收藏有礼
                    if (USE_SDK == false || PLATFORM_TYPR != "SH_SDK") {
                        need_add = false;
                    }
                }else if(v.bid == WelfareConst.WelfareIcon.sh_wechat){//深海小程序微信公众号
                    if (USE_SDK == false || PLATFORM_TYPR != "SH_SDK" || window.SH_SDK_FOLLOW == true) { 
                        need_add = false;
                    }
                }

                if (need_add == true) {
                  if(v.bid == 8003){
                    continue;
                  }
                  welfare_sub_list.push(v);
                }
            }
        }
        if (Utils.next(welfare_sub_list) != null) {
            welfare_sub_list.sort(Utils.tableLowerSorter(["sort_val"]));
        }
        return welfare_sub_list;
    },

    //升级的时候判断红点
    updateWelfareRedStatus: function (level) {
        if (level == null) return
        if (this.welfare_cache_red == null || this.welfare_cache_red[level] == null) return
        var list = this.welfare_cache_red[level];
        for (var k in list) {
            this.setWelfareStatus(k, list[k]);
        }
    },

    //设置福利图标的状态,如果图标没有开启 应该不需要设置红点
    setWelfareStatus: function (bid, status) {
        if (this.checkCanAdd(bid) == false) {
            var config = gdata("holiday_client_data", "data_info", [bid]);
            if (config) {
                if (this.welfare_cache_red[config.open_lev] == null) {
                    this.welfare_cache_red[config.open_lev] = {};
                }
                this.welfare_cache_red[config.open_lev][bid] = status;
            }
        } else {
            if (this.welfare_status_list == null) {
                this.welfare_status_list = [];
            }
            var num = 0;
            if (status == true) num = 1;
            var vo = {
                bid: bid,
                num: num
            }
            var vo1 = {
                bid: bid,
                status: status
            }
            this.welfare_status_list[bid] = vo1;

            //贴吧的红点(由于没有用到协议只能特殊处理)
            this.setPosteWelfareStatus(true);

            //这是福利功能图标红点
            MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.welfare, vo)

            require("mall_controller").getInstance().getModel().setMallMainRedPointData(require("mall_const").MallFunc.Welfare,vo);
            //福利标签的面板
            gcore.GlobalEvent.fire(WelfareEvent.UPDATE_WELFARE_TAB_STATUS, vo1);
        }

    },

    ///贴吧的红点
    setPosteWelfareStatus: function (status) {

    },

    //根据id获取福利的标签页状态,主要是获取是否有红点
    getWelfareStatusByID: function (id) {
        if (this.welfare_status_list)
            return this.welfare_status_list[id];
    },

    handle21008: function (data) {
        this.model.setDailyAwardStatus(data.status);
        gcore.GlobalEvent.fire(WelfareEvent.Update_Daily_Awawd_Data);
    },

    //请求领取每日礼
    sender21009: function () {
        this.SendProtocal(21009, {})
    },

    handle21009: function (data) {
        message(data.msg)
    },


    openSureveyQuestView: function (status) {
        if (status == true) {
            if (!this.sureveyQuestWindow) {
                this.sureveyQuestWindow = Utils.createClass("sureveyquest_window", this)
            }
            this.sureveyQuestWindow.open();
        } else {
            if (this.sureveyQuestWindow) {
                this.sureveyQuestWindow.close();
                this.sureveyQuestWindow = null;
            }
        }
    },

    //调查问卷协议
    handle24600: function (data) {
        if (data.status == 1 && (data.flag == 0 || data.flag == 1)) {
            this.setWelfareStatus(WelfareConst.WelfareIcon.quest, true);
        } else {
            this.setWelfareStatus(WelfareConst.WelfareIcon.quest, false);
        }
        this.model.setQuestOpenData(data);
    },

    //获取答卷基本内容
    sender24601: function () {
        this.SendProtocal(24601, {});
    },

    handle24601: function (data) {
        gcore.GlobalEvent.fire(WelfareEvent.Get_SureveyQuest_Basic, data)
    },

    //获取答卷题目信息
    sender24602: function () {
        this.SendProtocal(24602, {});
    },

    handle24602: function (data) {
        gcore.GlobalEvent.fire(WelfareEvent.Get_SureveyQuest_Topic_Content, data)
    },

    //答卷
    sender24603: function (list) {
        var protocal = {};
        protocal.ret_list = list;
        this.SendProtocal(24603, protocal);
    },

    handle24603: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(WelfareEvent.SureveyQuest_Submit, data)
        }
    },

    //领取奖励
    sender24604: function () {
        this.SendProtocal(24604, {});
    },

    handle24604: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(WelfareEvent.Get_SureveyQuest_Get_Reward, data)
        }
    },

    //周、月礼包
    sender21007: function (index) {
        var protocal = {};
        protocal.type = index || 1;
        this.SendProtocal(21007, protocal);
    },

    handle21007: function (data) {
        gcore.GlobalEvent.fire(WelfareEvent.Updata_Week_Month_Data, data)
    },

    handle21008: function (data) {
        this.model.setDailyAwardStatus(data.status);
        gcore.GlobalEvent.fire(WelfareEvent.Update_Daily_Awawd_Data)
    },

    //请求领取每日礼
    sender21009: function () {
        var protocal = {};
        this.SendProtocal(21009, protocal);
    },

    handle21009: function (data) {
        message(data.msg)
    },

    openCertifyBindPhoneWindow: function (status) {
        if (!status) {
            if (this.certify_phone) {
                this.certify_phone.close();
                this.certify_phone = null;
            }
        } else {
            if (this.certify_phone == null) {
                this.certify_phone = Utils.createClass("certify_bind_phone_window");
            }
            this.certify_phone.open();
        }
    },

    //判断是否需要显示绑定手机标签
    checkBindPhoneStatus: function () {
        if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_BINDPHONE == false && PLATFORM_NAME == "shmix") {
            return true
        }
        if (this.bind_phone_data == null || this.bind_phone_data.code != 0 || (USE_SDK == true && (PLATFORM_TYPR == "QQ_SDK" || PLATFORM_TYPR == "SH_SDK"))) {
            return true
        }
        return false
    },

    //手机绑定信息
    getBindPhoneData: function () {
        return this.bind_phone_data
    },

    //手机绑定
    handle16635: function (data) {
        if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_BINDPHONE == false && PLATFORM_NAME == "shmix") {
            this.setWelfareStatus(WelfareConst.WelfareIcon.bindphone, false)
            return
        }
        this.bind_phone_data = data;
        this.bind_phone_data.status = data.code;
        if (data.code == 0 && SHOW_BIND_PHONE) {//未绑定的时候显示红点
            this.setWelfareStatus(WelfareConst.WelfareIcon.bindphone, true)
        }
    },

    //请求绑定手机
    requestBindPhone: function (number, code) {
        var protocal = {};
        protocal.number = number;
        protocal.code = code;
        if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_BINDPHONE == false && PLATFORM_NAME == "shmix") {
            return
        }
        this.SendProtocal(16636, protocal);
    },

    //领取手机奖励返回
    handle16636: function (data) {
        if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_BINDPHONE == false && PLATFORM_NAME == "shmix") {
            return
        }
        if (this.bind_phone_data == null) return
        message(data.msg);
        this.bind_phone_data.status = data.code;    //0:失败 1:领取奖励成功 2:发送验证码成功
        if (data.code != 0) {
            //发送手机验证完成
            if (data.code == 1) {
                this.bind_phone_data.code = 1;
                this.openCertifyBindPhoneWindow(false);
            }
            gcore.GlobalEvent.fire(WelfareEvent.UpdateBindPhoneStatus, this.bind_phone_data)
        }
    },

    //--------------微信公众号
    handle16633: function (data) {
        // if (SHOW_WECHAT_CERTIFY) {
        //     this.wechat_subscription_data = data;
        //     if (data.code == 0) {
        //         this.setWelfareStatus(WelfareConst.WelfareIcon.wechat, true)
        //     }
        // }
        // if (PLATFORM_TYPR == "SH_RH") {
        //     this.setWelfareStatus(WelfareConst.WelfareIcon.wechat, this.model.getSubscriptionAwardStatus() == 0);
        // }
    },

    //通知服务端已经激活查看微信公众号了
    tellServerWechatStatus: function () {
        // if (this.wechat_subscription_data && this.wechat_subscription_data.code == 1) return
        // this.SendProtocal(16634, {});
    },

    handle16634: function (data) {
        // if (this.wechat_subscription_data) {
        //     this.wechat_subscription_data.code = 1;
        //     this.setWelfareStatus(WelfareConst.WelfareIcon.wechat, false)
        // }
        // if (PLATFORM_TYPR == "SH_RH") {
        //     this.setWelfareStatus(WelfareConst.WelfareIcon.wechat, false);
        // }
    },

    getWechatData: function () {
        return this.wechat_subscription_data;
    },

    getWelfareRoot: function () {
        if (this.welfare_win)
            return this.welfare_win.root_wnd;
    },



    //深海sdk用到的分享和关注------------
    //请求分享奖励内容和状态
    send16691: function () {
        this.SendProtocal(16691, {});
    },

    //分享奖励内容
    handle16691: function (data) {
        // cc.log("16691", data)
        if (data) {
            this.model.setShareAward(data.items)
            this.model.setShareAwardStatus(data.code);
            if (data.code == 1) {
                if (PLATFORM_TYPR == "SH_SDK") {
                    MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shwx_share);
                } else {
                    MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shrh_share);
                }
            }
        }
    },

    //请求领取分享奖励
    send16692: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(16692, protocal);
    },

    //分享领取奖励返回
    handle16692: function (data) {
        // cc.log("16692", data)
        message(data.msg);
        if (data && data.code == 1) {
            this.model.setShareAwardStatus(data.code);
            gcore.GlobalEvent.fire(WelfareEvent.Update_get_SHRH_share_award_status, data.code)
            if (PLATFORM_TYPR == "SH_SDK") {
                MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shwx_share);
            } else {
                MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shrh_share);
            }
        }
    },

    //请求关注奖励内容和状态
    send16693: function () {
        this.SendProtocal(16693, {});
    },

    //关注奖励内容
    handle16693: function (data) {
        // cc.log("16693", data)
        if (data) {
            this.model.setSubscriptionAward(data.items)
            this.model.setSubscriptionAwardStatus(data.code);
            if (data.code == 1) {
                if (PLATFORM_TYPR == "SH_SDK") {
                    MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shwx_sub);
                } else {
                    MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shrh_sub);
                }
                // this.SendProtocal(16634, {});
            }
        }
    },

    //请求领取关注奖励
    send16694: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(16694, protocal);
        // RoleController.getInstance().sender10945(str)
    },

    //关注领取奖励返回
    handle16694: function (data) {
        // cc.log("16694", data)
        message(data.msg);
        if (data && data.code == 1) {
            gcore.GlobalEvent.fire(WelfareEvent.Update_SHRH_Award_Status, 1);
            this.model.setSubscriptionAwardStatus(data.code);
            // this.SendProtocal(16634, {});
            if (PLATFORM_TYPR == "SH_SDK") {
                MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shwx_sub);
            } else {
                MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shrh_sub);
            }
        }
    },

    //请求收藏奖励内容
    send16695: function () {
        var protocal = {};
        this.SendProtocal(16695, protocal);
    },

    //领取收藏内容返回
    handle16695: function (data) {
        if (data) {
            this.model.setCollectAward(data.items)
            this.model.setCollectAwardStatus(data.code);
            if (data.code == 1) {
                MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shwx_collect);
            }
        }
    },

    //请求领取收藏奖励
    send16696: function () {
        var protocal = {};
        this.SendProtocal(16696, protocal);
    },

    //领取收藏返回
    handle16696: function (data) {
        message(data.msg);
        if (data && data.code == 1) {
            this.model.setCollectAwardStatus(data.code);
            gcore.GlobalEvent.fire(WelfareEvent.Update_get_SHWX_collect_award_status, 1);
            MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shwx_collect);
        }
    },





    //深海融合分享状态
    shrhShareStatus: function (status, data) {
        // message("分享成功！！！！", data)
        gcore.GlobalEvent.fire(WelfareEvent.Update_get_SHRH_share_award_status, 2)
    },

    //深海融合实名情况
    shrhRealNameStatus: function (status) {
        if (status) {
            MainuiController.getInstance().removeFunctionIconById(MainuiConst.icon.shrh_realname);
        }
    },


    //请求手机绑定奖励内容和状态
    send16697: function () {
        this.SendProtocal(16697, {});
    },

    //手机绑定奖励内容
    handle16697: function (data) {
        if (PLATFORM_TYPR == "SH_RH" && SH_RH_IS_SHOW_BINDPHONE == false && PLATFORM_NAME == "shmix") {
            this.setWelfareStatus(WelfareConst.WelfareIcon.bindphone, false)
            return
        }
        if (data && PLATFORM_NAME == "shmix") {
            this.bind_phone_data = data;
            this.bind_phone_data.status = data.code;
            if (data.code == 0 && SHOW_BIND_PHONE) {//未绑定的时候显示红点
                this.setWelfareStatus(WelfareConst.WelfareIcon.bindphone, true)
            }
        }
    },

    //请求领取手机绑定奖励
    send16698: function () {
        var protocal = {};
        this.SendProtocal(16698, protocal);
    },

    //手机绑定领取奖励返回
    handle16698: function (data) {
        message(data.msg);
        this.bind_phone_data.status = data.code;
        if (data && data.code == 1) {
            this.bind_phone_data.code = data.code;
            gcore.GlobalEvent.fire(WelfareEvent.UpdateBindPhoneStatus, 1);
        }
    },
});

module.exports = WelfareController;