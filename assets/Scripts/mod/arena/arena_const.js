 // 一些常量
var ArenaConst = {}

// 竞技场类型，分为循环赛和排名赛
ArenaConst.arena_type = {
    loop : 1,
    rank : 2
}


// 循环赛窗体的标签值
ArenaConst.loop_index = {
    challenge : 1,
    activity  : 2,
    rank      : 3,
    awards    : 4,
}

// 红点状态
ArenaConst.red_type = {
    loop_challenge : 1,
    loop_artivity  : 2,
    loop_reward    : 5,
    champion_guess : 3,         // 冠军赛竞猜阶段红点
    loop_log       : 4,         // 挑战记录
}

// 冠军赛主窗体的标签
ArenaConst.champion_index = {
    my_match_ready : 1,
    guess          : 2,
    match          : 3,
    rank           : 4,
    my_match       : 5,
}

// 冠军赛阶段状态
ArenaConst.champion_step_status = {
    unopened : 0,      // 未到时间 
    opened   : 1,      // 进行中
    over     : 2,      // 结束
}

ArenaConst.champion_round_status = {
    prepare : 1,       // 准备阶段
    guess   : 2,       // 竞猜阶段
    fight   : 3        // 对战阶段
}

// 冠军赛阶段
ArenaConst.champion_step = {
    unopened : 0, // 未开始
    score    : 1, // 选拔赛
    match_32 : 32, // 32强赛
    match_4  : 4, //4强赛
}

ArenaConst.champion_my_status = {
    unopened : 0,   // 未开启
    unjoin   : 1,     // 没资格
    in_match : 2,   // 可pk
}


// 冠军赛阶段描述
ArenaConst.getMatchStepDesc = function(step) {
    if (step == ArenaConst.champion_step.unopened ) {
        return Utils.TI18N("暂未开始");
     } else if (step == ArenaConst.champion_step.score) {
        return Utils.TI18N("选拔赛");
     } else if (step == ArenaConst.champion_step.match_32) {
        return Utils.TI18N("32强赛");
     } else if (step == ArenaConst.champion_step.match_4) {
        return Utils.TI18N("4强赛");
     } 
    return Utils.TI18N("暂未开始");  
}

// 冠军赛阶段描述 16强 8强 这样的
ArenaConst.getMatchStepDesc2 = function(step, round) {
    if (step == ArenaConst.champion_step.match_32) {
        if (round <= 1) {
            return Utils.TI18N("16强赛");
        } else if (round == 2) {
            return Utils.TI18N("8强赛");
        } else {
            return Utils.TI18N("4强赛");
        }
    } else if (step == ArenaConst.champion_step.match_4) {
        if (round == 1) {
            return Utils.TI18N("半决赛");
        } else if (round == 2) {
            return Utils.TI18N("决赛");
        } else {
            return Utils.TI18N("本轮冠军赛已结束");
        }
    } else if (step == ArenaConst.champion_step.score) {
        if (round == 0) {
            return Utils.TI18N("下次冠军赛");
        } else {
            return cc.js.formatStr(Utils.TI18N("%s第%s回合"), ArenaConst.getMatchStepDesc(step), round);
        }
    } else if (step == ArenaConst.champion_step.unopened) {
        return Utils.TI18N("下次冠军赛");
    } else {
        return Utils.TI18N("冠军赛暂未开始");
    }
}

// 所在组的转换
ArenaConst.getGroup = function(group) {
    if (group == 1) {
        return Utils.TI18N("A组");
    } else if (group == 2) {
        return Utils.TI18N("B组");
    } else if (group == 3) {
        return Utils.TI18N("C组");
    } else if (group == 4 ) {
        return Utils.TI18N("D组");
    } else {
        return "";
    }
}

module.exports = ArenaConst;