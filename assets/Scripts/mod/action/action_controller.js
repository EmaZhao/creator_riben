// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-02 16:49:03
// --------------------------------------------------------------------
var ActionConst = require("action_const");
var MainuiController = require("mainui_controller")
var MainuiConst = require("mainui_const")
var ActionEvent = require("action_event");
var ActivityEvent = require("activity_event");
var RoleController = require("role_controller")
var WelfareController = require("welfare_controller")
var OrderactionConst = require("orderaction_const");
var ActionController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var ActionModel = require("action_model");

        this.model = new ActionModel();
        this.model.initConfig();

        this.mainui_ctrl = MainuiController.getInstance()
        this.holiday_list = {};     // 活动列表类型

        this.holiday_del_list = {}                    //  -- 需要移除的标签页缓存列表
        this.holiday_award_list = {}                    //未领取活动奖励的列表
        this.need_show_init_red = {}                    //-- 登录的时候需要显示红点的列表
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.init_role_event == null) {
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                gcore.GlobalEvent.unbind(this.init_role_event)
                this.needRequireData()
                this.init_role_event = null
                // this.requestActionStatus() //-- 请求所有活动图标
                //超值基金
                // this.sender24700()
                // 七天登录红点
                // this.cs21100();
                // 七天目标
                // this.cs13601();
            }.bind(this))
        }
    },
    // --- 断线重连或者0点更新或者初始化需要请求的
    needRequireData() {
        var self = this
        self.openActionMainPanel(false)
        self.holiday_list = {}
        self.holiday_award_list = {}
        self.need_show_init_red = {}
        self.holiday_del_list = {}
        self.is_init_require = true
        self.model.clearFundSrvData()  					    // 断线时需要清掉基金缓存数据
        self.requestActionStatus()                          // 请求所有活动图标
        self.requestHolidayList(ActionConst.ActionType.Wonderful)       					//-- 登陆的时候请求一下精彩活动的
    },
    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on16602);
        this.RegisterProtocal(10922, this.on10922)              //-- 全服活动状态,服务端广播 
        this.RegisterProtocal(16601, this.on16601)            // -- 所有子活动的显示数据,主要用于活动面板左侧标签显示,以及部分面板内容显示
        this.RegisterProtocal(16603, this.on16603)            // -- 请求子活动
        this.RegisterProtocal(16604, this.on16604)             //   领取奖励
        this.RegisterProtocal(10923, this.on10923)             //- 主要是用于服务段更新全服活动状态数据的
        this.RegisterProtocal(10924, this.on10924)             //-- 个人活动状态,服务端广播 
        this.RegisterProtocal(10925, this.on10925)             //-- 主要是用于服务段更新个人活动状态数据的
        this.RegisterProtocal(16602, this.on16602)                // 请求所有活动未领取奖励
        this.RegisterProtocal(16606, this.on16606)             // 领取活动返回
        this.RegisterProtocal(16607, this.on16607)                  // 0点 5点更新
        // -- 基金相关
        this.RegisterProtocal(24700, this.handle24700)
        this.RegisterProtocal(24701, this.handle24701)
        this.RegisterProtocal(24702, this.handle24702)
        //7天登录
        this.RegisterProtocal(21100, this.on21100)              // 7天登录信息
        this.RegisterProtocal(21101, this.on21101)              // 领取7天登录奖励
        // 七天目标
        this.RegisterProtocal(13601, this.handle13601);
        this.RegisterProtocal(13602, this.handle13602);
        // --升级有礼
        this.RegisterProtocal(21200, this.handle21200)
        this.RegisterProtocal(21201, this.handle21201)

        //奖励排行信息(以后可以是活动的通用)
        this.RegisterProtocal(16650, this.handle16650);

        // 幸运转盘
        this.RegisterProtocal(16637, this.handle16637);
        this.RegisterProtocal(16638, this.handle16638);
        this.RegisterProtocal(16639, this.handle16639);
        this.RegisterProtocal(16641, this.handle16641);
        this.RegisterProtocal(16642, this.handle16642);
        this.RegisterProtocal(16643, this.handle16643);

        //神秘杂货铺
        this.RegisterProtocal(16688, this.handle16688);
        this.RegisterProtocal(16689, this.handle16689);

        // --限时礼包入口
        this.RegisterProtocal(21210, this.handle21210)
        this.RegisterProtocal(21211, this.handle21211) //-- 推送激活了显示礼包.

        
        this.RegisterProtocal(21016, this.handle21016)
        this.RegisterProtocal(16687, this.handle16687)

        // --元宵冒险
        this.RegisterProtocal(24810, this.handle24810) //--获取元宵冒险 任务信息
        this.RegisterProtocal(24811, this.handle24811) //--推送任务变化"
        this.RegisterProtocal(24812, this.handle24812) //--任务领取
        
        //触发礼包
        this.RegisterProtocal(21220, this.handle21220)

        this.RegisterProtocal(24813, this.handle24813)
        this.RegisterProtocal(24814, this.handle24814)

        //时装
        this.RegisterProtocal(30101, this.handle30101)
        this.RegisterProtocal(30100, this.handle30100)
        this.RegisterProtocal(30102, this.handle30102)
    },
    requestActionStatus() {
        this.SendProtocal(10922, {})
        this.SendProtocal(10924, {})
        this.on10925(OrderactionConst.OrderActionEntranceID.entrance_id);
    },
    handleActionStatusData(data) {
        if (data) {
            let config = Config.function_data.data_info[data.id];
            if (config == null) return;
            if (data.status == ActionConst.ActionStatus.un_finish) {
                this.mainui_ctrl.removeFunctionIconById(data.id)
            } else {
                this.mainui_ctrl.addFunctionIconById(data.id, data)

                // -- 如果是7天排行就请求一下任务
                if (data.id == MainuiConst.icon.seven_rank) {  // 7天排行
                    // self:requestSevenDaysRank()
                } else if (data.id == MainuiConst.icon.fund) {
                    this.model.checkFundRedStatus()
                }
            }
        }
        // require("activity_controller").getInstance().getModel().refreshActivityData();
        // gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
    },
    setHolidayStatus(bid, status) {
        var self = this
        if(self.holiday_list == null || self.holiday_list[bid] == null) return;
        if (self.holiday_award_list == null) {
            self.holiday_award_list = {}
        }
        let vo = { bid: bid, status: status }

        let vo1
        if (status) {
            vo1 = { bid: bid, num: 1 }
        } else {
            vo1 = { bid: bid, num: 0 }
        }
        self.holiday_award_list[bid] = vo
        let action_sub_vo = self.holiday_list[bid]
	    let function_id = MainuiConst.icon.welfare
        if (self.isSpecialBid(bid)) {
            self.mainui_ctrl.setFunctionTipsStatus(MainuiConst.icon.welfare, vo1)
            require("mall_controller").getInstance().getModel().setMallMainRedPointData(require("mall_const").MallFunc.Welfare,vo1);
        } else {
            self.mainui_ctrl.setFunctionTipsStatus(action_sub_vo.cli_type, vo1)
            function_id = action_sub_vo.cli_type
        }
        gcore.GlobalEvent.fire(ActionEvent.UPDATE_HOLIDAY_TAB_STATUS, function_id, vo)
        // gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
    },
    // --desc:更新全服活动全部数据
    on10922(data) {
        if (this.protocal_list_22 == null) {
            this.protocal_list_22 = {}
        }

        if (data != null && data.act_list) {
            for (let i = 0; i < data.act_list.length; ++i) {
                let v = data.act_list[i]
                this.handleActionStatusData(v)
                // -- 先储存一下吧
                if (v.status == ActionConst.ActionStatus.un_finish) {
                    this.protocal_list_22[v.id] = null
                } else {
                    this.protocal_list_22[v.id] = v.id
                }
            }
        }
          gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
    },
    on10923(data) {
        this.handleActionStatusData(data)
        if (data) {
            if (this.protocal_list_22 == null) {
                this.protocal_list_22 = {};
            }
            if (data.status == ActionConst.ActionStatus.un_finish) {
                this.protocal_list_22[data.id] = null;
            } else {
                this.protocal_list_22[data.id] = data.id
            }
        }
          gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
    },
    on10924(data) {
        cc.log("个人活动on10924",data)
        if (data != null && data.act_list) {
            for (let i = 0; i < data.act_list.length; ++i) {
                let v = data.act_list[i]
                this.handleActionStatusData(v)
                if(MainuiConst.first_red_point[v.id] && v.status == 1){
                    this.mainui_ctrl.setFunctionTipsStatus(v.id, MainuiConst.first_red_point[v.id]);
                }
            }
        }
        gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
    },
    on10925(data) {
        this.handleActionStatusData(data)
        if(MainuiConst.first_red_point[data.id] && data.status == 1){
            this.mainui_ctrl.setFunctionTipsStatus(data.id, MainuiConst.first_red_point[data.id]);
        }
        gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
    },
    //请求所有活动未领取奖励状态
    requestActionAwardStatus: function (type) {
        var proto = {};
        proto.type = type;
        this.SendProtocal(16602, proto)
    },
    requestHolidayList(type) {
        var proto = {};
        proto.type = type;
        this.SendProtocal(16601, proto)
    },
    on16602: function (data) {
        for (let i = 0; i < data.holiday_list.length; ++i) {
            let v = data.holiday_list[i]
            this.setHolidayStatus(v.bid, (v.can_get_num != false))
        }
        // require("activity_controller").getInstance().getModel().refreshActivityData()
        gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
        
    },

    on16601: function (data) {
        cc.log(data,"on16601")
        var temp_sub_vo;
        var type_list = {};
        for (var i=0;i<data.holiday_list.length;++i) {
            var v = data.holiday_list[i];
            if (this.holiday_del_list[v.bid] == null) {
                temp_sub_vo = this.holiday_list[v.bid];
                if (temp_sub_vo == null) {
                    let ActionSubTabVo = require("action_sub_tab_vo");
                    temp_sub_vo = new ActionSubTabVo();
                    this.holiday_list[v.bid] = temp_sub_vo;
                }
                temp_sub_vo = this.holiday_list[v.bid];
                if (temp_sub_vo != null) {
                    temp_sub_vo.update(v);
                }
                //活动类的投资计划和基金不在活动面板显示
                if (this.isSpecialBid(v.bid)) {
                    temp_sub_vo.setShowStatus(false);
                    this.cs16603(v.bid);
                }
                //判断这个活动所属的图标,并且动态设置他的名字
                if (temp_sub_vo.cli_type != 0 && temp_sub_vo.cli_type != MainuiConst.icon.special_summon) {
                    if (type_list[temp_sub_vo.cli_type] == null) {
                        type_list[temp_sub_vo.cli_type] = { action_num: 0, action_name: "" };
                    }
                    if (!this.isSpecialBid(temp_sub_vo.bid)) {
                        type_list[temp_sub_vo.cli_type].action_num = type_list[temp_sub_vo.cli_type].action_num + 1;
                        if (temp_sub_vo.cli_type_name != "" && temp_sub_vo.cli_type_name != "null" && type_list[temp_sub_vo.cli_type].action_name == "") {
                            type_list[temp_sub_vo.cli_type].action_name = temp_sub_vo.cli_type_name;
                        }
                    }
                }
            }
        }

        //	-- 初始化之后请求对应的活动红点状态
        if (this.is_init_require == true) {
            this.requestActionAwardStatus();
            this.is_init_require = false;
        }
        //判断是增删图标
        for (var function_id in type_list) {
            var object = type_list[function_id];
            if (object) {
                if (object.action_num > 0) {
                    this.mainui_ctrl.addFunctionIconById(function_id, object.action_name);
                } else {
                    this.mainui_ctrl.removeFunctionIconById(function_id);
                }
            }
        }
    },

    on16603(data) {
        //节日登录红点
        if(data.bid == ActionConst.ActionRankCommonType.common_day || data.bid == ActionConst.ActionRankCommonType.festval_day || data.bid == ActionConst.ActionRankCommonType.lover_day){
            this.model.updataFestvalRedStatus(data.bid,data.aim_list)
        }else if(data.bid == 1011){
            this.model.updataCombineLoginRedStatus(data.aim_list)
        }else if(data.bid == 991014){
            this.model.updataPreferentialRedStatus(true, MainuiConst.icon.preferential)
        }else if(data.bid == 91014){
            this.model.updataPreferentialRedStatus(true, MainuiConst.icon.other_preferential)
        }
        // -- 没有子活动列表了,直接移除掉标签,下次有效(现在作废)
        // if(data.aim_list.length == 0 ){
        //     this.handleHolidayList(0, data.bid)
        // }
        // -- 首充连冲
        if (data.bid == 91005) {
            this.handle91005Data(data)
        }else if(data.bid == ActionConst.ActionRankCommonType.seven_charge){
            // 暂时没有
            // this.model.setSevenChargeData(data)
        }
        // - 现在只要活动列表是空的,那么是投资计划后者是基金就删掉标签页
        if (this.isSpecialBid(data.bid)) {
            if (data.finish == 0 && this.need_show_init_red[data.bid] == null && data.aim_list.length != 0) {
                let status = false
                let base_config = Config.holiday_client_data.data_info[data.bid]
                if (base_config) {
                    let is_open = base_config.open_lev
                    let role_vo = RoleController.getInstance().getRoleVo()
                    if (is_open && role_vo.lev) {
                        if (role_vo.lev >= is_open) {
                            status = true
                        }
                    }
                }
                this.need_show_init_red[data.bid] = status
                this.setHolidayStatus(data.bid, status)
                if (data.bid == ActionConst.ActionSpecialID.growfund) {
                    WelfareController.getInstance().setWelfareStatus(ActionConst.ActionSpecialID.growfund, status)
                }
            }
        }
        gcore.GlobalEvent.fire(ActionEvent.UPDATE_HOLIDAY_SIGNLE, data)
    },
    isSpecialBid: function (bid) {
        return bid == ActionConst.ActionSpecialID.invest || bid == ActionConst.ActionSpecialID.growfund;
    },
    //每日充值额外处理
    handle91005Data(data) {
        // --找出今日累充和累充天数的数据
        if (!this.today_list) {
            this.today_list = {}
        }

        if (data.aim_list && Utils.next(data.aim_list) != null) {
            for (let k = 0; k < data.aim_list.length; ++k) {
                let v = data.aim_list[k]
                for (let a = 0; a < v.aim_args.length; ++a) {
                    let j = v.aim_args[a]
                    if (j.aim_args_key == 3) {
                        if (j.aim_args_val == 1) {    //--今日累充
                            this.today_list[k] = v
                            this.today_list[k].has_num = this.has_num
                            this.today_list[k].item_effect_list = this.item_effect_list
                        }
                    } else if (j.aim_args_key == 4) {// --需要充值多少钱
                        if (this.today_list[k]) {
                            this.today_list[k].need_charge = j.aim_args_val
                        }
                    } else if (j.aim_args_key == 5) { // --目标值 需要冲多少天
                        if (this.today_list[k]) {
                            this.today_list[k].charge_day = j.aim_args_val
                        }
                    } else if (j.aim_args_key == 6) { // --计数
                        if (this.today_list[k]) {
                            this.today_list[k].has_charge = j.aim_args_val
                        }
                    }
                }
            }
        }
        // this.checkShowDayCharge()
    },
    //获取指定类型和指定活动的id的子活动基础数据
    getActionSubTabVo: function (bid) {
        if (this.holiday_list != null) {
            return this.holiday_list[bid]
        }
    },
    getAllActionList(){
        return this.holiday_list
    },
    // --desc:请求子活动列表
    // --time:2017-07-26 07:56:10
    // --@bid:子活动ID
    // --@return 
    cs16603(bid) {
        let protocal = {}
        protocal.bid = bid
        this.SendProtocal(16603, protocal)
    },
    //领取奖励
    cs16604(bid, aim, arg) {
        let protocal = {}
        protocal.bid = bid
        protocal.aim = aim
        protocal.arg = arg || 0
        this.SendProtocal(16604, protocal)
    },
    on16604(data) {
        message(data.msg)
        // showAssetsMsg(data.msg)
    },

    // ------------------@ 基金相关协议
    // -- 请求基金开启数据
    sender24700() {
        let protocal = {}
        this.SendProtocal(24700, protocal)
    },
    handle24700(data) {
        if (data && data.ids) {
            this.model.setOpenFundIds(data.ids)
            gcore.GlobalEvent.fire(ActionEvent.UPDATA_FUND_ID_LIST_EVENT)
        }
    },
    //-- 请求基金数据
    sender24701(id) {
        let protocal = {}
        protocal.id = id
        this.SendProtocal(24701, protocal)
    },

    handle24701(data) {
        if (data) {
            this.model.setFundSrvData(data)
            gcore.GlobalEvent.fire(ActionEvent.UPDATA_FUND_DATA_EVENT, data.id)
        }
    },
    // -- 请求领取基金
    sender24702(id) {
        let protocal = {}
        protocal.id = id
        this.SendProtocal(24702, protocal)
    },
    handle24702(data) {
        if (data.msg) {
            message(data.msg)
        }
    },
    // -- 打开超值基金奖励预览界面
    openActionFundAwardWindow(status, group_id, fund_id) {
        var self = this
        if (status) {
            if (!self.fund_award_win) {
                let actionFundAward = require("action_fund_award_window")
                self.fund_award_win = new actionFundAward()
            }
            if (self.fund_award_win.isOpen() == false) {
                self.fund_award_win.open({ group_id: group_id, fund_id: fund_id })
            }
        } else {
            if (self.fund_award_win) {
                self.fund_award_win.close()
                self.fund_award_win = null
            }
        }
    },

    // ==============================
    // desc:7天登录状态
    // ==============================
    cs21100: function () {
        this.SendProtocal(21100, {});
    },

    on21100: function (data) {
        var show_red = false;
        for (var i in data.status_list) {
            if (data.status_list[i].status == 2) {
                this.mainui_ctrl.setFunctionTipsStatus(MainuiConst.icon.seven_login, true);
                break;
            }
        }
        var i = 0;
        for (var k in data.status_list) {
            if (data.status_list[k].status == 3) {
                i = i + 1;
            }
        }
        if (i == data.status_list.length) {
            this.mainui_ctrl.setFunctionTipsStatus(MainuiConst.icon.seven_login, false);
        }
        this.model.updateSevenLoginData(data);
        gcore.GlobalEvent.fire(ActionEvent.UPDATE_SEVEN_LOGIN_STATUS, data)
    },

    // ==============================
    // desc:7天登录领取奖励
    // ==============================
    cs21101: function (day) {
        var protocal = {};
        protocal.day = day;
        this.SendProtocal(21101, protocal);
    },

    on21101: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(ActionEvent.UPDATE_SEVEN_LOGIN_REWARDS, data);
            this.cs21100();
        }
    },

    // 打开七天登录界面
    openSevenLoginWin: function (status) {
        if (status) {
            if (!this.seven_login_win) {
                this.seven_login_win = Utils.createClass("action_seven_login_window", this);
            }
            if (this.seven_login_win && this.seven_login_win.isOpen() == false) {
                this.seven_login_win.open();
            }
        } else {
            if (this.seven_login_win) {
                this.seven_login_win.close();
                this.seven_login_win = null;
            }
        }
    },
    // 活动七天界面
    openSevenActivityWindow:function(status){
      if(status){
        if (!this.seven_activity_window) {
          this.seven_activity_window = Utils.createClass("action_seven_activity_window", this);;
        }
        if (this.seven_activity_window && this.seven_activity_window.isOpen() == false) {
            this.seven_activity_window.open();
        }
      }else{
        if (this.seven_activity_window) {
          this.seven_activity_window.close();
          this.seven_activity_window = null;
        }
      }
    },

    // 打开七天目标界面
    openSevenGoalView: function (status) {
        if (status) {
            if (!this.seven_goal_win) {
                this.seven_goal_win = Utils.createClass("action_seven_goal_window", this);
            }
            if (this.seven_goal_win && this.seven_goal_win.isOpen() == false) {
                this.seven_goal_win.open();
            }
        } else {
            if (this.seven_goal_win) {
                this.seven_goal_win.close();
                this.seven_goal_win = null;
            }
        }
    },
    getHasSummonRedPoint:function(){
        let vo1 = this.getHolidayAweradsStatus(ActionConst.ActionRankCommonType.time_summon)||this.getHolidayAweradsStatus(ActionConst.ActionRankCommonType.old_time_summon);
        let vo2 = this.getHolidayAweradsStatus(ActionConst.ActionRankCommonType.elite_summon)||this.getHolidayAweradsStatus(ActionConst.ActionRankCommonType.old_elite_summon);
        let status = vo1&&vo1.status || vo2&&vo2.status;
        // if ((vo1 == null || vo1.status == false )&& (vo1 == null || vo1.status == false )) {
        //     status = false;
        // }else{
        //     status = true;
        // }
        return status;
    },
    checkHasActionSummonOpen: function(){
        let timeSummon = this.checkActionExistByActionBid(ActionConst.ActionRankCommonType.time_summon)||this.checkActionExistByActionBid(ActionConst.ActionRankCommonType.old_time_summon);
        let eliteSummon = this.checkActionExistByActionBid(ActionConst.ActionRankCommonType.elite_summon)||this.checkActionExistByActionBid(ActionConst.ActionRankCommonType.old_elite_summon);
        let openDmm = this.checkActionExistByActionBid(ActionConst.ActionRankCommonType.dmm_summon);
        return timeSummon||eliteSummon || openDmm;
    },
    //打开特殊召唤界面
    openActionSummonView: function(status,bid){
        if (status) {
            if (!this.action_summon_window) {
                this.action_summon_window = Utils.createClass("action_summon_window");
            }
            if (this.action_summon_window && this.action_summon_window.isOpen() == false) {
                this.action_summon_window.open({iType:bid});
                this.mainui_ctrl.setMainUIBottomStatus(false);
            }else if(this.action_summon_window && this.action_summon_window.isOpen() == true){
                this.action_summon_window.clicksummonTypeBtn(bid)
            }
        } else {
            if (this.action_summon_window) {
                this.mainui_ctrl.setMainUIBottomStatus(true);
                this.action_summon_window.close();
                this.action_summon_window = null;
            }
        }
    },

    openSummonGiftWindow(status,data){
        if(status){
            if(!this.summonGiftWindow){
                this.summonGiftWindow = Utils.createClass("action_summon_gift_window");
            }
            this.summonGiftWindow.open({data});
        }else{
            if(this.summonGiftWindow){
                this.summonGiftWindow.close();
                this.summonGiftWindow = null;
            }
        }
    },

    cs13601: function () {
        this.SendProtocal(13601, {});
    },

    handle13601: function (data) {
        if (data.period == 0) return;
        this.model.setSevenGoldPeriod(data.period || 1);
        this.model.initSevenWalfare(data.period || 1);

        this.model.setSevenGoalWelfareList(data.welfare_list);
        this.model.setSevenGoalGrowList(data.grow_list);
        this.model.setHalfGiftList(data.price_list);

        this.model.setSevenGoalBoxList(data.finish_list, data.num);
        this.model.checkRedPoint(data.cur_day);

        gcore.GlobalEvent.fire(ActionEvent.UPDATE_SEVENT_GOAL, data);
    },

    // 请求七日活动领取
    cs13602: function (type, day, id, item) {
        var protocal = {};
        protocal.type = type;
        protocal.day_type = day;
        protocal.id = id;
        protocal.item = item;
        this.SendProtocal(13602, protocal);
    },

    handle13602: function (data) {
        message(data.msg);
        if (data.flag == 1) {
            gcore.GlobalEvent.fire(ActionEvent.UPDATE_SEVENT_GET, data);
        }
    },


    //活动主界面
    //属于竞猜活动 还是属于节日活动,MainuiConst.icon.action 或者 MainuiConst.icon.festival

    openActionMainPanel(status, function_id, action_bid) {
      // 限时召唤 精英召唤,新服限购特殊处理
        var controller = require("vip_controller").getInstance()
        if(controller.vip_window){
          controller.openVipMainWindow(false);
        }
        controller = require("battle_drama_controller").getInstance();
        if(controller.battle_drama_quick_win){
          controller.openDramBattleQuickView(false)
        }
        if(this.action_open_server_recharge){
          this.openActionOpenServerGiftWindow(false);
        }
        var partnersummoncontroller = require("partnersummon_controller").getInstance();
        if(partnersummoncontroller.partner_summon_window){
            partnersummoncontroller.openPartnerSummonWindow(false);
        }
        if(action_bid == ActionConst.ActionRankCommonType.time_summon||action_bid ==ActionConst.ActionRankCommonType.old_time_summon){
          this.openActionSummonView(status,action_bid);
          return;
        }else if(action_bid == ActionConst.ActionRankCommonType.elite_summon ||action_bid == ActionConst.ActionRankCommonType.old_elite_summon){
          this.openActionSummonView(status,action_bid);
          return;
        }else if(action_bid == ActionConst.ActionRankCommonType.dmm_summon){
          this.openActionSummonView(status,action_bid);
          return;
        }
        if(this.action_summon_window){
          this.openActionSummonView(false);
        }
        if(action_bid == ActionConst.ActionRankCommonType.open_server){
          this.openActionOpenServerGiftWindow(status,action_bid);
          return;
        }
        if (action_bid != null) {
          var action_vo = this.holiday_list[action_bid];
          if (action_vo) {
              function_id = action_vo.cli_type;
          }
        }
        if(function_id==15){
          if(!this.lastStatus){
            if(this.action_operate){
              this.action_operate.close();
              this.action_operate = null;
            }
          }
          this.lastStatus = true;
        }else if(function_id== 13){
          if(this.lastStatus){
            this.lastStatus = false;
            if(this.action_operate){
              this.action_operate.close();
              this.action_operate = null;
            }
          }
        }
        if (status == false) {
            if (this.action_operate != null) {
                this.action_operate.close();
                this.action_operate = null;
            }
        } else {
            if (function_id == null) {
                function_id = MainuiConst.icon.action;
            }

            if (this.action_operate == null) {
                this.action_operate = Utils.createClass("action_main_window");
            }
            if (this.action_operate.isOpen() == false){
              this.action_operate.open({ function_id: function_id, action_bid: action_bid });
            }else{
              if(action_bid){
                  if(this.action_operate.tab_list)
                      this.action_operate.handleSelectedTab(this.action_operate.tab_list[action_bid]);
              }else{
                  if(this.action_operate.sub_list && this.action_operate.tab_list)
                      this.action_operate.handleSelectedTab(this.action_operate.tab_list[this.action_operate.sub_list[0].bid]);
              }
            }
        }
        
    },

    //获得指定类型活动的所有子活动列表,用于主界面显示,这里做一个排序处理吧
    getActionSubList(function_id) {
        var action_sub_list = [];
        if (this.holiday_list) {
            for (var k in this.holiday_list) {
                var v = this.holiday_list[k];
                if (v.cli_type == function_id && v.isShowInAction() == true) {
                    action_sub_list.push(v);
                }
            }
        }
        if (Utils.next(action_sub_list) != null) {
            action_sub_list.sort(function (a, b) {
                return a.sort_val - b.sort_val
            })
        }
        return action_sub_list
    },

    // -------------------------------升级有礼协议-------------------------------------
    send21200() {
        let protocal = {}
        this.SendProtocal(21200, protocal)
    },
    handle21200(data) {
        gcore.GlobalEvent.fire(ActionEvent.UPDATE_LEVEL_UP_GIFT, data)
    },
    send21201(id) {
        let protocal = {}
        protocal.id = id
        this.SendProtocal(21201, protocal)
    },
    handle21201(data) {
        message(data.msg)
    },

    //获取一个指定类型活动指定子活动可领取状态数据
    getHolidayAweradsStatus: function (bid) {
        if (this.holiday_award_list != null && this.holiday_award_list[bid] != null) {
            return this.holiday_award_list[bid]
        }
    },


    //排行榜奖励预览协议(以后可能是活动通用排行奖励信息)
    send16650: function (bid) {
        var protocal = {};
        protocal.bid = bid;
        this.SendProtocal(16650, protocal)
    },

    handle16650: function (data) {
        message(data.msg);
        gcore.GlobalEvent.fire(ActionEvent.RANK_REWARD_LIST, data)
    },

    // --desc:活动领取返回
    on16606(data) {
        this.setHolidayStatus(data.bid, (data.can_get_num != false))
        // gcore.GlobalEvent.fire(ActivityEvent.RefreshActivityData);
        // require("activity_controller").getInstance().getModel().refreshActivityData()
    },
    on16607(data){
        if(data && data.type == 0){ //--0点更新
            this.needRequireData(true)
        }
    },
    //  幸运转盘
    requestLucky: function () {
        this.SendProtocal(16637, {});
    },

    handle16637: function (data) {
        this.model.setTreasureInitData(data.dial_data);
        this.model.lucklyRedPoint();
        gcore.GlobalEvent.fire(ActionEvent.UPDATE_LUCKYROUND_GET, data);
    },

    send16638: function (type, count) {
        var protocal = {};
        protocal.type = type;
        protocal.type2 = count;
        this.SendProtocal(16638, protocal);
    },

    handle16638: function (data) {
        gcore.GlobalEvent.fire(ActionEvent.TREASURE_SUCCESS_DATA, data);
    },

    handle16639: function (data) {
        gcore.GlobalEvent.fire(ActionEvent.UPDATE_LUCKLY_DATA, data);
    },

    send16640: function (type, id) {
        var protocal = {};
        protocal.type = type;
        protocal.id = id;
        this.SendProtocal(16640, protocal);
    },

    handle16641: function (data) {
        gcore.GlobalEvent.fire(ActionEvent.UPDATA_TREASURE_LOG_DATA, data);
    },

    send16642: function (type) {
        var protocal = {};
        protocal.type = type;
        this.SendProtocal(16642, protocal);
    },

    handle16642: function (data) {
        message(data.msg)
        // -- GlobalEvent:getInstance():Fire(ActionEvent.UPDATA_TREASURE_REFRESH, data)
    },

    // 弹窗的
    send16643: function (type, count) {
        var protocal = {};
        protocal.type = type;
        protocal.type2 = count;
        this.SendProtocal(16643, protocal);
    },

    handle16643: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(ActionEvent.UPDATA_TREASURE_POPUPS_SEND, data);
        }
    },

    // -----打开幸运探宝界面-----
    openLuckyTreasureWin: function (status, index) {
        index = index || 1;
        if (status) {
            var is_open = this.mainui_ctrl.checkMainFunctionOpenStatus(MainuiConst.icon.lucky_treasure, MainuiConst.function_type.other, false);
            if (is_open == false) {
                return;
            }
            // 高级探宝的时候
            if (index == 2) {
                this.model.setBuyRewardData();
                var open_data = this.model.getBuyRewardData(index);
                var open = this.mainui_ctrl.checkIsOpenByActivate(open_data[1].limit_open);
                if (open == false) {
                    message(Utils.TI18N("人物等级不足"));
                    return;
                }
            }

            if (!this.treasure_win) {
                this.treasure_win = Utils.createClass("action_treasure_window", this);
            }
            if (this.treasure_win && this.treasure_win.isOpen() == false) {
                this.treasure_win.open(index);
            }
        } else {
            if (this.treasure_win) {
                this.treasure_win.close();
                this.treasure_win = null;
            }
        }
    },
    getTreasureView:function(){
        if (this.treasure_win) {
            return this.treasure_win
        }
    },
    checkOpenActionLimitGiftMainWindow() {
        var self = this;
        if (self.active_limit_gift_id == 2001) { 	//-- 18级的不提示
            self.active_limit_gift_id = null
            return
        }

        if (self.active_limit_gift_id != null) {
            let config = Config.star_gift_data.data_limit_gift[self.active_limit_gift_id]
            if (config) {
                let gift_id = self.active_limit_gift_id
                var CommonAlert = require("commonalert");
                CommonAlert.show(config.desc, Utils.TI18N('前往'), function () {
                    this.openActionLimitGiftMainWindow(true, gift_id)
                }.bind(this), Utils.TI18N('取消'))
            }
        }
        self.active_limit_gift_id = null
    },
    // --打开限时礼包入口
    // --打开显示礼包id
    openActionLimitGiftMainWindow(status, id) {
        var self = this;
        if (status) {
            if (!self.action_limit_gift) {
                let ActionLimitGiftMainWindow = require("action_limit_gift_main_window")
                self.action_limit_gift = new ActionLimitGiftMainWindow()
            }
            self.action_limit_gift.open(id)
        } else {
            if (self.action_limit_gift) {
                self.action_limit_gift.close()
                self.action_limit_gift = null
            }
        }
    },
    send21210() {
        let protocal = {}
        this.SendProtocal(21210, protocal)
    },
    handle21210(data) {
        message(data.msg)
        gcore.GlobalEvent.fire(ActionEvent.LIMIT_GIFT_MAIN_EVENT, data)
    },
    // --推送激活了显示礼包.并且在某些操作后需要显示
    handle21211(data) {
        this.active_limit_gift_id = data.id
    },

    //  探宝获得物品界面
    openTreasureGetItemWindow: function (status, data, index, count_type) {
        if (status) {
            if (!this.treasure_get_win) {
                let ActionTreasureGetWindow = require("action_treasure_get_window")
                this.treasure_get_win = new ActionTreasureGetWindow(this, data, index, count_type);
            }
            if (this.treasure_get_win && this.treasure_get_win.isOpen() == false) {
                this.treasure_get_win.open();
            }
        } else {
            if (this.treasure_get_win) {
                this.treasure_get_win.close();
                this.treasure_get_win = null;
            }
        }
    },

    getSevenLoginRoot: function () {
        if (this.seven_login_win)
            return this.seven_login_win.root_wnd
    },

    getTreasureRoot: function () {
        if (this.treasure_win)
            return this.treasure_win.root_wnd;
    },

    //是否可以创建指定活动类型,只有活动总列表里面有这个活动类型才可以创建
    checkCanAddWonderful(function_id) {
        if (function_id == null) return false
        if (this.holiday_list == null || Utils.next(this.holiday_list) == null) return false
        for (var k in this.holiday_list) {
            var v = this.holiday_list[k];
            if (v.cli_type == function_id) {
                return true
            }
        }
        return false
    },


    //--------------------杂货铺协议开始-------------------------------------
    sender16688: function () {
        this.SendProtocal(16688, {});
    },

    handle16688: function (data) {
        this.model.setStoneShopData(data.buy_info);
        gcore.GlobalEvent.fire(ActionEvent.UPDATE_STORE_DATA_EVENT);
    },

    sender16689: function (id, num) {
        var protocal = {};
        protocal.id = id;
        protocal.num = num;
        this.SendProtocal(16689, protocal);
    },

    handle16689: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(ActionEvent.UPDATE_STORE_DATA_SUCCESS_EVENT, data)
        }
    },

    //--------------------新服限购协议结束-------------------------------------

    // --------------------新服限购协议开始-------------------------------------
    // 红点
    sender16687:function(send_protocal){
        var protocal = send_protocal || {};
        var len = 0;
        for(var i in send_protocal){
            len+=1;
            break;
        }

        if(len == 0){
            protocal.bid = 91029;
        }

        this.SendProtocal(16687, protocal);
    },

    handle16687:function(data){
        var status = false;
        if(data.code == 1){
            status = true;
        }
        data.status = status;
        if(data.bid == ActionConst.ActionRankCommonType.open_server){
            MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.open_server_recharge, status)
        }else if(data.bid == ActionConst.ActionRankCommonType.high_value_gift || data.bid == ActionConst.ActionRankCommonType.mysterious_store){
            this.model.updateGiftRedPointStatus(data);
        }
    },

    //--------------------新服限购协议结束-------------------------------------

    // 判断是否能充值
    sender21016:function(charge_id){
        var protocal = {};
        protocal.charge_id = charge_id;
        this.SendProtocal(21016, protocal);
    },

    handle21016:function(data){
        gcore.GlobalEvent.fire(ActionEvent.Is_Charge_Event, data);
    },

    // ==============================--
    // desc:登录时候请求一些特殊活动id的红点数据
    // time:2017-07-18 05:15:10
    // @return 
    // ==============================--
    requestActionRedStatus:function(){
        this.sender16687({bid:ActionConst.ActionRankCommonType.open_server})     //小额直购请求红点
        this.sender16687({bid:ActionConst.ActionRankCommonType.high_value_gift}) //小额礼包请求红点
        this.sender16687({bid:ActionConst.ActionRankCommonType.mysterious_store}) //神秘杂货店请求红点
    },

    //--------------------元宵冒险协议开始-------------------------------------
    // -- 请求任务信息
    sender24810(){
        let protocal = {}
        this.SendProtocal(24810, protocal)
    },

    handle24810( data ){
        message(data.msg)
        gcore.GlobalEvent.fire(ActionEvent.YUAN_ZHEN_DATA_EVENT, data)
    },

    // --推送任务
    handle24811( data ){
        gcore.GlobalEvent.fire(ActionEvent.YUAN_ZHEN_UPDATA_EVENT, data)
    },

    // -- 完成任务
    sender24812(id){
        let protocal = {}
        protocal.id = id
        this.SendProtocal(24812, protocal)
    },

    handle24812( data ){
        message(data.msg)
        if(data.code == true){
            gcore.GlobalEvent.fire(ActionEvent.YUAN_ZHEN_TASK_EVENT, data)
        }
    },
    //--------------------元宵冒险协议结束-------------------------------------

    // 触发礼包
    openTriggerGiftWindow: function (status) {
        if (status) {
            if (!this.action_time_gift_big) {
                let ActionTimeGiftBigWindow = require("action_time_gift_big_window")
                this.action_time_gift_big = new ActionTimeGiftBigWindow(this);
            }
            if (this.action_time_gift_big && this.action_time_gift_big.isOpen() == false) {
                this.action_time_gift_big.open();
            }
        } else {
            if (this.action_time_gift_big) {
                this.action_time_gift_big.close();
                this.action_time_gift_big = null;
            }
        }
    },
    sender21220(){
        this.SendProtocal(21220, {})
    },
    handle21220(data){
        message(data.msg)
        gcore.GlobalEvent.fire(ActionEvent.TRIGGER_GIFT_EVENT, data)
    },
	// --开服超值礼包界面
    openActionOpenServerGiftWindow(status, bid){
        if(status){
            if(!this.action_open_server_recharge){
                let ActionOpenServerGiftWindow = require("action_open_server_gift_window")
                this.action_open_server_recharge = new ActionOpenServerGiftWindow(this)
            }
            if (this.action_open_server_recharge && this.action_open_server_recharge.isOpen() == false) {
                this.action_open_server_recharge.open(bid);
            }
        }else{
            if(this.action_open_server_recharge){
                this.action_open_server_recharge.close()
                this.action_open_server_recharge = null
            }
        }
    },
    //--试炼之境
    sender24813(){
	    this.SendProtocal(24813, {})
    },
    handle24813( data ){
        message(data.msg)
        gcore.GlobalEvent.fire(ActionEvent.YUAN_ZHEN_DATA_EVENT, data)
    },



    //检查活动是否存在exist
    //@action_bid 活动基础id
    //@camp_id 活动id 属于可以选参数, 如果有值表示需要判定  如果为nil 表示 不需要判定
    checkActionExistByActionBid: function (action_bid) {
        if(!action_bid) return false
        let tab_vo = this.getActionSubTabVo(action_bid);
        if(tab_vo) return true
        return false
    },
    
    sender24814(id){
        let protocal = {}
        protocal.id = id
        this.SendProtocal(24814, protocal)
    },
    handle24814( data ){
        message(data.msg)
        gcore.GlobalEvent.fire(ActionEvent.YUAN_ZHEN_TASK_EVENT, data)
    },

    //时装---------
    sender30101(){
        this.SendProtocal(30101, {})
    },
    handle30101( data ){
        message(data.msg)
        gcore.GlobalEvent.fire(ActionEvent.SKIN_INFO_EVENT, data)
    },
    sender30100(){
        this.SendProtocal(30100, {})
    },
    handle30100(data){
        message(data.msg)
    },
    handle30102(data){
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.skin, data.code == 1)
    },
    openBuySkinWindow(status){
        if(status){
            if(!this.action_buy_skin){
                let ActionBuySkinWindow = require("action_buy_skin_window")
                this.action_buy_skin = new ActionBuySkinWindow(this)
                if (this.action_buy_skin && this.action_buy_skin.isOpen() == false) {
                    this.action_buy_skin.open();
                }
            }
        }else{
            if(this.action_buy_skin){
                this.action_buy_skin.close()
                this.action_buy_skin = null;
            }
        }

    },
});

module.exports = ActionController;