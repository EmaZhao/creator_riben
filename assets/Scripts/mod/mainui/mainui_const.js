////------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      主ui界面的一些常量
// <br/>Create: new Date().toISOString()
////------------------------------------------------------------------
var MainUiConst = {
    // 界面匹配的战斗类型
    ui_fight_type: {
        normal: 0,
        main_scene: 1,                 // 主城
        partner: 2,                    // 英雄
        esecsice: 3,                   // 副本
        drama_scene: 4,                // 剧情
        backpack: 5,                   // 背包
        shop: 6,                        // 商店
        guild: 7,                      // 联盟

        arena: 8,               // 竞技场
        guild_dun: 9,           // 联盟副本
        star_tower: 10,         // 星命塔
        endless: 11,            // 无尽试炼
        dungeon_stone: 14,      // 材料副本
        guildwar: 17,           // 公会战
        primusWar: 18,          // 星河神殿
        ladderwar: 19,          // 天梯
        expedit_fight: 20,      //远征
        limit_boss: 12,         // 限时BOSS,暂时没有了
        escort: 13,             // 护送, 暂时没有了
        godbattle: 15,          // 众神战,暂时没有了

        elementWar: 25,         // 元素圣殿
        heavenwar: 27,          // 天界副本
    },

    // 主界面的按钮下标
    btn_index: {
        main_scene: 0,                 // 主城
        partner: 1,                    // 英雄
        backpack: 2,                   // 背包
        drama_scene: 3,                // 剧情
        esecsice: 4,                   // 历练
        guild: 5,                      // 联盟
        hallows: 6,                    // 神器


        boss: 991,                     //
        upgrade: 992,                  //
        recharge: 993,                 //
        assistant: 994,                //
        gemstone: 996,                 //
    },

    //新界面的按钮下标
    new_btn_index:{
        main_scene: 0,                 // 主城
        partner: 1,                    // 英雄
        esecsice: 2,                   // 副本
        drama_scene: 3,                // 剧情
        backpack: 4,                   // 背包
        shop: 5,                        // 商店
        guild: 6,                      // 联盟

        boss: 991,                     //
        upgrade: 992,                  //
        recharge: 993,                 //
        assistant: 994,                //
        gemstone: 996,                 //
    },

    // 通用获取物品面板的物品类型,默认是道具类型
    item_exhibition_type: {
        item_type: 1,       // 道具类型 默认是这个
        partner_type: 2     // 伙伴类型 
    },

    icon: {
        friend: 1,                //好友
        mail: 2,                  //邮件
        daily: 3,                 //日常
        stronger: 4,              //我要变强
        rank: 5,                  // 排行榜
        vedio: 6,                 // 录像馆
        festval: 908,              // 普通节日登录
        festval_spring: 1101,      // 春节登录
        festval_lover: 1102,       // 情人节登录
        welfare: 12,              //福利
        charge: 10,               // 充值
        action: 13,                //限时活动
        champion: 14,             // 冠军赛
        festival: 15,           // 节日活动
        escort: 17,               // 护送图标
        godbattle: 18,            // 众神战场
        godpartner: 19,            // 神将折扣
        combine: 21,            // 合服活动
        guildwar: 22,
        ladder: 23,               // 跨服天梯
        ladder_2: 24,             // 天梯
        download: 100,            // 边玩边下
        day_first_charge: 501,    //每日首充
        first_charge: 502,        //首冲
        seven_login: 505,         //七天登录
        limit_gift_entry: 506,    // 限时礼包入口 升星礼包 和 等级礼包
        first_charge_new1 : 522,    //首冲(新版本)
        direct_gift: 1001,         //直购礼包
        seven_rank: 108,          //7天排行
        crossserver_rank: 109,    //跨服排行
        icon_firt1: 900,          //首冲(3星雅典娜)
        icon_firt2: 901,          //首冲
        icon_firt3: 902,          //首冲
        icon_firt4: 903,          //首冲
        icon_firt5: 904,          //首冲
        icon_charge1: 905,        //首冲
        icon_charge2: 906,        //首冲
        day_charge: 907,          // 每日充值
        dungeon_double_time: 20,   // 双倍时间
        seven_goal: 503,  //七天目标(1--7)
        seven_goal1: 1503,  //七天目标(8--14)
        seven_goal2: 2503,  //七天目标(15--21)
        seven_goal3: 3503,  //七天目标(22--28)
        combine_login: 909,        // 合服登陆福利
        lucky_treasure: 1002,//幸运探宝
        preferential: 1003,        // 特惠礼包（3星直升礼包丁奥）
        other_preferential: 1004,
        certify: 110,     // 实名认证
        fund: 507,        // 基金
        first_charge_new: 512,     //首冲(新版本)
        limit_recruit: 504, //限时招募
        open_server_recharge: 513, //开服小额充值
        give_vip: 525, //vip免费送
        one_gift:528, //一元礼包
        skin:529, //皮肤
        shrh_share: 9997,//深海融合分享
        shrh_sub: 9998,//深海融合关注
        shrh_realname: 9999,//深海融合实名

        trigger_gift:526, //触发礼包
        privilege_shop:527, //特权商城

        shwx_collect: 9987,//深海小程序收藏有礼
        shwx_share: 9988,//深海小程序游戏分享
        shwx_sub: 9989,//深海小程序官微福利
        special_summon: 10001,//特殊抽卡
    },

    //部分页面的跳转需要进到主城中去
    sub_type: {
        arena_call: 1,
        dungeon_auto: 2,
        partner_zhenfa: 3,
        forge_house: 4, // 锻造屋
        guild_boss: 5,
        startower: 6,
        partnersummon: 7,
        champion_call: 8,
        endless: 9,
        escort: 10,
        dungeonstone: 11,
        endless: 12,
        wonderful: 13,
        godbattle: 14,
        world_boss: 15,
        function_icon: 16,      // 跳转特殊点击图标操作
        limit_action: 17,
        guildwar: 18,
        primuswar: 19,
        ladderwar: 20,
        expedit_fight: 21,  // 远征
        adventure: 22,         // 冒险
        eliteMatchWar: 23, //精英赛ui
        //  eliteKingMatchWar = 24, --王者赛赛ui
        seerpalace: 25, //先知殿
        elementWar: 26, //元素圣殿

    },

    //主ui图标分主要部分,包括下面6个以及充值,另外就是function_data那些.
    function_type: {
        main: 1,
        other: 2
    },
    //第一次时入口红点
    first_red_point:{
        [526]:true,//触发礼包
        [527]:true,//特权礼包
    },

    // 通用的获得物品界面，打开来源
    item_open_type: {
        normal: 1,     // 普通
        seerpalace: 2, // 先知召唤获得
        heavendial: 3, // 神装转盘
    },
};
module.exports = MainUiConst;
