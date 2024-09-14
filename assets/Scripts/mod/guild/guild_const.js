// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会相关倡廉控制
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var GuildConst = {
    // 公会成员
    post_type: {
        leader: 1,
        assistant: 2,
        member: 3
    },

    //公会初始窗体的标签页下表
    init_type: {
        create: 2,
        list: 1,
        search: 3
    },

    list_type: {
        total: 1,
        search: 2
    },

    post_type: {
        leader: 1,
        assistant: 2,
        member: 3
    },

    status: {
        normal: 0,
        un_activity: 1,
        activity: 2,
        finish: 3
    },

    // 公会相关红点的处理
    red_index: {
        apply: 1,              // 公会申请
        boss_times: 2,         // 公会副本挑战次数
        boss_kill: 3,          // 公会副本击杀宝箱
        boss_first: 4,         // 公会副本首通
        donate: 5,             // 捐献
        voyage_escort: 6,       // 远航护送
        voyage_interaction: 7, // 远航互助
        voyage_order: 8,       // 登录的时候订单
        voyage_temp_escort: 9, // 零时的护送红点
        donate_activity: 10,   // 公会捐献宝箱
        red_bag: 12,             // 公会红包
        goal_action: 13,           //公会活跃
        guildwar_match: 14,    // 公会战匹配成功
        guildwar_start: 15,    // 公会战开战
        guildwar_count: 16,    // 公会战挑战次数
        guildwar_log: 17,      // 公会战日志
        guildwar_box : 18,     // 公会战宝箱
        skill_2: 1002,             // 公会技能
        skill_3: 1003,             // 公会技能
        skill_4: 1004,             // 公会技能
        skill_5: 1005,             // 公会技能
    }
}

module.exports = GuildConst