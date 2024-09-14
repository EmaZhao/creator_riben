var SeerpalaceConst = {
    Tab_Index : {
        Summon : 1,  // 先知殿(召唤)
        Change : 2,  // 英雄转换
    },
    
    Change_Index_Camp : {
        All : 1, 	// 全部
        Water : 2,  // 水
        Fire : 3,   // 火
        Wind : 4, 	// 风
    },
    
    // 不同星数时动态X坐标
    Change_Pos_X : {
        [1] : [100],
        [2] : [85, 115],
        [3] : [70, 100, 130],
        [4] : [55, 85, 115, 145],
        [5] : [40, 70, 100, 130, 160],
    },
    
    // 先知殿召唤下标对应的召唤id
    Index_To_GroupId : {
        [1] : 3000,
        [2] : 1000,
        [3] : 2000,
        [4] : 4000,
    },
    
    // 书本特效
    Book_EffectId : {
        [1000] : 634,
        [2000] : 635,
        [3000] : 633,
        [4000] : 636,
    },
    
    
    //书本召唤特效
    Effect_Pos : {
        [1000] : cc.v2(90, 240),
        [2000] : cc.v2(-87, 240),
        [3000] : cc.v2(268, 240),
        [4000] : cc.v2(-269, 240),
    },
    
    // 先知殿的道具id
    Good_ZhiHui  : 14001,  // 先知水晶
    Good_XianZhi : 14002,  // 先知精华
    Good_JieJing : 24, 	  // 先知结晶
}
module.exports = SeerpalaceConst;