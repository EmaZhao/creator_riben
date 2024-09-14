var ActionConst = {
    ActionType: {
        Operate: 0,        // 运营活动
        OpenServer: 1,     // 开服活动
        Combine: 2,        // 合服活动
        Wonderful: 4,      // 精彩活动(包含0,1,3)
        SingleWonderful: 3,// 个人精彩活动
    },

    //- 活动所有标签页的类型控制器
    ActionPanelTypeView: {
        // [1]: "ActionInvestPanel",         //投资计划
        // [2]: "ActionGiftPanel",           //超值礼包
        // [3]: "ActionAccChargePanel",      //首冲+累充
        // [4]: "ActionAccCostPanel",        //累计消费
        [5]: "action_limit_buy_panel",       //礼包抢购
        // [6]: "ActionLimitBossPanel",	   //限时BOSS
        // [7]: "ActionGrowFundPanel",	   // 成长基金
        // [8]: "ActionChongZhiPanel",       //充值返好礼
        // [11]: "ActionSignRebatePanel",    //单笔充值
        // [12]: "ActionTotalChargePanel",   //累计充值 当前用到的19-1-14
        // [13]: "ActionAccChenghaoPanel",   //称号礼
        // [14]: "ActionPartnerSummonPanel", //召唤福利
        [15]: "action_acc_level_up_gift_panel", //升级有礼
        [16]: "action_common_panel", //--点金活动、远航夺宝、速战达人、远征精英、冒险排行、积天豪礼、累计充值、累计消费、升星有礼、融合祝福、节日登录好礼、砸蛋豪礼、觉醒豪礼
        [17]: "action_limit_change_panel", //限时兑换活动
        // [18]: "ActionLuxuryWelfarePanel", //积天豪礼
        // [19]: "ActionTotalConsumePanel",   //累计消费 当前用到的19-1-14
        // [20]: "ActionLimitGroupbuyPanel", //限时团购
        // [24]: "ActionLimitChangePanel", //纳福迎春
        // [25]: "ActionLimitChangePanel", //白雪献礼
        // [26]: "ActionLimitChangePanel", //游园祭点
        // [27]: "ActionLimitCommonPanel", //升星有礼
        // [28]: "ActionLimitCommonPanel", //融合祝福
        // [29]: "ActionLimitChangePanel", //元宵兑换
        [30] : "start_work_panel", //开工福利
        // [100]: "AnimateActionFestvalPanel", //元宵灯会
        // [101]: "AnimateYuanzhenKitchenPanel",//元宵厨房
        [102]: "action_limit_yuanzhen_panel", //元宵冒险
        [103] : "action_time_summon_panel", //限时召唤
        [104] : "action_time_shop_panel",   //限时商城
        [111]: "action_high_value_gift_panel", // 超值礼包活动
        [113] : "action_mysterious_store_panel", //神秘杂货铺
        [115] : "action_buy_skin_panel", //皮肤购买
        [118] : "limitexercise_panel", //限时试炼之境
        [120] : "elitesummon_panel", //精英限时招募
        // [255]: "ActionChargeDoublePanel", //充值双倍
    },

    // //是否存在需要转换为类型4
    // ActionTypeChange: {
    //     [0]: this.ActionType,
    //     [1]: 1,
    //     [3]: 3,
    // },

    // 活动额外参数类型
    ActionExtType: {
        ActivityMaxCount: 2  // 单笔充值限制次数
        , RechageTotalCount: 4  // 限购购买总次数
        , RechageCurCount: 5  // 限购已购买次数
        , ActivityCurrentCount: 6  // 单笔充值当前次数
        , BossId: 8  // BOSSID
        , BossIcon: 9  // BOSS展示图标 
        , BossMinPower: 10 // BOSS最小通关战力
        , BossReplayId: 11 // BOSS击杀录像ID  
        , BossRecommendPower: 12 // BOSS推荐通关战力
        , RechargeMaxCount: 13 // 充值返利最大次数
        , RechargeUseCount: 14 // 充值返利已用最大次数
        , RechargeAvailableCount: 15 // 充值返利可用次数
        , RechargeBackOutItem: 16 // 充值返利已出物品
        , RechargeRMB: 17 // 充值返利充值人民币
        , GodPartnerId: 18 // 神将id
        , ItemId: 19 // 消耗道具id
        , ItemNum: 20 // 消耗道具数量
        , PopItemId: 21 // 弹窗道具id
        , PopItemNum: 22 // 弹窗道具数量
        , ActivityAddCount: 23 // 累积可领取次数
        , ActivityFestvalTime: 24 // 节日登录时间
        , ActivityFestvalDiscount: 25 // 活动打折
        , ActivityOldPrice: 26 // 活动原价
        , ActivityCurrentPrice: 27 // 活动现价
        , ItemRechargeId: 33 // 物品支付ID
        , ItemDesc : 34 // 物品描述
    },


    ActionStatus: {
        un_finish: 0,              // 进行中
        finish: 1,                 // 可提交
        completed: 2,              // 已提交
    },

    //- 特殊活动这类活动不显示在活动面板,而是显示在福利界面
    ActionSpecialID: {
        invest: 991003,
        growfund: 991008
    },

    // 基金类型
    FundType: {
        type_one: 101,  // 128元基金
        type_two: 102,  // 328元基金
    },

    // 基金红点类型
    FundRedIndex: {
        fund_get_one: 1, // 128元基金可领取
        fund_get_two: 2, // 328元基金可领取
        fund_buy_one: 3, // 购买128元基金红点
        fund_buy_two: 4, // 购买328元基金红点
    },

    //限时活动通用面板
    ActionRankCommonType: {

        //排行榜
        epoint_gold  : 97001,      //点金
        speed_fight  : 97002,      //快速作战
        voyage       : 97003,      //远航
        hero_expedit : 97004,      //远征
        adventure    : 97005,     //冒险
        yuanzhen_adventure : 93018, //元宵冒险
        exercise_1 : 93031, //试炼有礼
        exercise_2 : 93032, //试炼有礼2
        exercise_3 : 93033, //试炼有礼3
        time_summon : 91041, // 限时召唤
        start_welfare : 93020, // 开工福利
    
        dial : 93022,   // 星辰转盘
        qingming : 93023,//踏青
        smashegg : 93024, // 砸金蛋
    
        //全面屏的活动    
        common_day : 991011, //普通节日
        festval_day : 991024, //春节活动
        lover_day   : 991025, //情人节活动
    
        longin_gift : 991027, //登录好礼
        limit_charge : 991028, //限时累充
        luckly_egg : 93025, //砸蛋好礼
        acc_luxury : 991021, // 积天豪礼
        totle_charge : 91022, //累计充值
        totle_consume : 991023, //累计消费
        fusion_blessing : 993013,   //融合祝福
        updata_star : 993014,       //升星有礼
        hero_awake : 993026,       //觉醒豪礼
        open_server : 91029,   //开服限购
        mysterious_store : 993028, //神秘杂货铺
        week_gift: 991034, //周卡礼包
        high_value_gift: 991030, //超值小额礼包
        seven_charge : 991036, //7天连充
        elite_summon : 91040,//精英招募
        dmm_summon : 93035,//dp召唤

        action_wolf : 93018, //魔狼传说活动

        limit_exercise : 97007,     //试炼之境

        action_skin_buy : 991032, //皮肤购买

        old_elite_summon :93034,//旧精英召唤

        old_time_summon :93019//旧限时召唤

    },

    //限时活动兑换通用面板
    ActionChangeCommonType: {
        limit_change: 93003, //限时兑换
        limit_change1: 993003, //限时兑换
        limit_festive: 93011, //纳福迎春
        limit_festive1: 993011, //纳福迎春
        limit_gift: 93010, //白雪献礼
        limit_gift1: 993010, //白雪献礼
        limit_garden: 93012, //游园祭点
        limit_garden1: 993012, //游园祭点
        limit_yuanzhen: 93017, //元宵兑换
        limit_yuanzhen1: 993017, //元宵兑换
    }
}

//是否存在需要转换为类型4
ActionConst.ActionTypeChange = {
    [0]: ActionConst.ActionType.Operate,
    [1]: ActionConst.ActionType.OpenServer,
    [3]: ActionConst.ActionType.SingleWonderful
}

ActionConst.ActonExchangeType = {
    Other : 0,          //其他
    Perday : 1,         //每日限兑
    AllServer : 2,      //全服限兑
    Activity : 3,       //活动限兑
}

module.exports = ActionConst