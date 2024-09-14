var GuildwarConst = {

    // 标签页
    index: {
        list: 1,         // 对阵列表
        positions: 2,    // 战场阵地
        award: 3,        // 奖励预览
    }

    // 据点状态
    , position_status: {
        normal: 0, 	   // 正常
        attacked: 1,      // 正在被攻击
        fall: 2, 		   // 已沦陷
    }

    // 阵地类型
    , positions: {
        myself: 1, 	  // 我方阵地
        others: 2, 	  // 敌方阵地
    }

    // 联盟战状态
    , status: {
        close: 1, 		// 未开启
        matching: 2, 	// 匹配中
        showing: 3,	// 匹配结果展示中
        processing: 4, // 开战中
        settlement: 5, // 结算中
    }

    // 据点难度
    , difficulty: {
        easy: 1, 		// 简单
        common: 2, 	// 普通
        difficult: 3,	// 困难
    }

    // 联盟战战斗结果
    , result: {
        fighting: 0,  // 战斗中
        lose: 1, 	   // 失败
        win: 2, 	   // 胜利
        dogfall: 3,   // 平局
    }

    // 对阵列表文字提示颜色
    , against_color: {
        [1]: new cc.Color(104, 69, 42),  // 已结束
        [2]: new cc.Color(58, 120, 196), // 进行中
        [3]: new cc.Color(121, 121, 121),// 平局
    }

    // 宝箱类型
    , box_type: {
        copper: 0, // 铜宝箱
        gold: 1,   // 金宝箱
    }

}

module.exports = GuildwarConst