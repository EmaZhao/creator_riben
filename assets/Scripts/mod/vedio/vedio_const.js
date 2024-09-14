var VedioConst = {
    Tab_Index : {
        Arena : 1,     //-- 竞技场
        Champion : 2,  //-- 冠军赛
        Solo : 3, 	   //-- 切磋
        Guildwar : 4,  //-- 公会战
        Ladder : 5,    //-- 天梯
        Elite : 6, 	   //-- 段位赛
        Hot : 98, 	   //-- 每周热门
    },
    Color : {
        Atk : new cc.Color(168, 46, 26),
        Def : new cc.Color(39,134,188)
    },
    Cham_Name : {
        [2] : "决赛",
        [4] : "半决赛",
        [8] : "8强赛",
        [16] : "16强赛",
        [32] : "32强赛",
        [128] : "选拔赛",
    },
    Left_Role_Battle_Index : {
        [1] : 9,
        [2] : 6,
        [3] : 3,
        [4] : 8,
        [5] : 5,
        [6] : 2,
        [7] : 7,
        [8] : 4,
        [9] : 1,
    },
    Right_Role_Battle_Index : {
        [1] : 3,
        [2] : 6,
        [3] : 9,
        [4] : 2,
        [5] : 5,
        [6] : 8,
        [7] : 1,
        [8] : 4,
        [9] : 7,
    },
    
    // -- 录像大厅一次请求的数据量
    ReqVedioDataNum : 30,

    // -- 个人录像类型
    MyVedio_Type : {
        Myself : 1,    //-- 我自己的录像记录
        Collect : 99,  //-- 我收藏的录像记录
    },
    // --分享按钮类型
    Share_Btn_Type : {
        eGuildBtn : 1, //--公会分享
        eWorldBtn : 2, //--世界分享
    }

}
module.exports = VedioConst;