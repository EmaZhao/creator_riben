
// 1:普通按钮音效 2:关闭按钮音效 3:标签页音效 4..自定义音效id
window.ButtonSound = {
    Normal: 1,
    Close: 2,
    Tab: 3,
    Cus: 4,
},

// 主scene的各个层级数据
window.SCENE_TAG = {
    scene: 0,
    battle: 1,
    effect: 2,
    ui: 3,
    win: 4,
    top: 5,
    dialogue: 6,
    msg: 7,
    reconnect: 8,
    loading: 9,
    pcLeft: 10,
    pcRight: 11,
},


window.LoadingDes = {
    "3": 18,
    "6": 8,
    "9": 20,
    "10": 16,
    "11": 55,
}

//滑动组件滑动方向（竖直还是横向）
window.ScrollViewDir = {
    vertical: 1,            //竖直
    horizontal: 2,          //横向
}

//滚动回调
window.ScrollViewFuncType = {
    UpdateCellByIndex: 1,        // 更新cell体
    CreateNewCell: 2,       // 创建 新的cell 
    NumberOfCells: 3,      // 返回 数据的数量
    OnCellTouched: 4,    // 点击cell回调方法
}

//滑动组件开始方向（头部还是底部）
window.ScrollViewStartPos = {
    top: 1,
    bottom: 2,
}
// 窗户的类型
window.WinType = {
    Tips: 1,
    Mini: 2,
    Big: 3,
    Full: 4,
},

// 物品给咱的大小
window.BackPackItem = {
    Width: 120,
    Height: 120,
},

// 事件
window.EventId = {
    EVT_ROLE_CREATE_SUCCESS : "EVT_ROLE_CREATE_SUCCESS",    // 角色更新事件
    UPDATE_ROLE_ATTRIBUTE: "UPDATE_ROLE_ATTRIBUTE",         // 角色更新时间
    ROLE_EVENT_BASE_ATTR: "ROLE_EVENT_BASE_ATTR",           // 橘色属性变化
    EVT_RE_LINK_GAME: "EVT_RE_LINK_GAME",                   // 断线重连事件
    GET_ALL_DATA: "GET_ALL_DATA",                           // 初始化背包
    ADD_GOODS: "ADD_GOODS",                                 // 增加物品
    DELETE_GOODS: "DELETE_GOODS",                           // 删除一个物品
    MODIFY_GOODS_NUM: "MODIFY_GOODS_NUM",                   // 更新物品
    COMPOSITE_RESULT: "COMPOSITE_RESULT",                   // 合成物品成功
    COMPOSITE_RECORD: "COMPOSITE_RECORD",                   // 物品合成日志
    ENTER_FIGHT: "ENTER_FIGHT",                             // 进入战斗
    EXIT_FIGHT: "EXIT_FIGHT",                               // 退出战斗
    CAN_OPEN_LEVUPGRADE:"CAN_OPEN_LEVUPGRADE",              // 触发这个事件的时候,就表示可以打开升级面板了
    OPEN_SRV_DAY: "OPEN_SRV_DAY",                           // 开服天数
    CHAT_NEWMSG_FLAG: "CHAT_NEWMSG_FLAG",                   // 未读消息数量
    LOADING_FINISH: "LOADING_FINISH",                       // 未读消息数量
    VOICE_SETTING: "VOICE_SETTING",                       // 未读消息数量    
    GUIDE_TO_CONTINUE:"GUIDE_TO_CONTINUE", // 引导继续
    POPUP_DORUN:"POPUP_DORUN",//登录弹窗相关
}

// spine动作
window.PlayerAction = {
    stand: "stand",
    stand_1: "stand2_1",
    run: "run",
    run_1: "run_1",
    sit: "sit",
    action: "action",
    action_1: "action1",
    action_2: "action2",
    action_3: "action3",
    action_4: "action4",
    action_5: "action5",
    action_6: "action6",
    action_7: "action7",
    action_8: "action8",
    battle_stand: "stand2",
    hurt: "hurt",
    fun: "fun",
    show: "show",
    special_action_0: "status_0",
    special_action_1: "status_1",
    special_action_2: "status_2"
}


window.SayConfig = {
    "default_bubble"         : {val:1000, desc:"默认聊天气泡"},
    "say_repeak_vip"         : {val:4, desc:"VIPX以下限制"},
    "say_repeak_lev"         : {val:80, desc:"X级以下限制"},
    "say_repeak_span"        : {val:5, desc:"最近X分钟内的发言条数"},
    "say_repeak_num"         : {val:3, desc:"筛选的发言条数"},
    "say_repeak_similar"     : {val:60, desc:"封禁的相似度（百分比）"},
    "say_repeak_time"        : {val:10, desc:"封禁的小时"},
    "say_string_length"      : {val:31, desc:"限制的字符串长度（中文3个字符，英/数一个字符）"},
    "cooldown_same_province" : {val:5, desc:"同省发言冷却"},
    "cooldown_cross_service" : {val:10, desc:"跨服发言冷却"},
    "cooldown_world"         : {val:10, desc:"世界发言冷却"},
    "cooldown_guild"         : {val:5, desc:"公会发言冷却"}
}

window.SCREEN_WIDTH = 720;
window.SCREEN_HEIGHT = 1280;

window.BATTLE_VIEW_BACK_LAYER_Z = 0
window.BATTLE_VIEW_BLACK_LAYER_Z0 = 3
window.BATTLE_VIEW_UI_LAYER_Z = 40
window.BATTLE_VIEW_UI_LAYER_TAG = 40
window.BATTLE_VIEW_ROLE_LAYER_Z = 25
window.BATTLE_VIEW_ROLE_LAYER_TAG = 20
window.BATTLE_VIEW_TOP = 999
window.BATTLE_VIEW_EFFECT_LAYER_Z0 = 20
window.BATTLE_VIEW_EFFECT_LAYER_Z2 = 15

window.FILTER_CHARGE = false//是否屏蔽充值
window.IS_VERIFYIOS = false //是否提审服
window.IS_SHOW_CHARGE = true;          //是否显示支付h5用
window.IS_LOADING = false //是否正在加载游戏中
window.IS_RESET = false //是否刷新游戏

// 战斗里面的位
window.GIRD_POS_OFFSET = 9
// 战斗左侧站位
window.Pos2GridLeft = [{ x: 27, y: 15 }, { x: 28, y: 21 }, { x: 29, y: 27 }, { x: 17, y: 15 }, { x: 18, y: 21 }, { x: 19, y: 27 }, { x: 7, y: 15 }, { x: 8, y: 21 }, { x: 9, y: 27 }, { x: 7, y: 43 }]
// 战斗右侧站位
window.Pos2GridRight = [{ x: 53, y: 15 }, { x: 52, y: 21 }, { x: 51, y: 27 }, { x: 63, y: 15 }, { x: 62, y: 21 }, { x: 61, y: 27 }, { x: 73, y: 15 }, { x: 72, y: 21 }, { x: 71, y: 27 }, { x: 73, y: 43 }]
// 假战斗的站位
window.NormalPosGridRight = [{ x: 42, y: 15 }, { x: 42, y: 21 }, { x: 42, y: 27 }, { x: 42, y: 15 }, { x: 42, y: 21 }, { x: 42, y: 27 }, { x: 42, y: 15 }, { x: 42, y: 21 }, { x: 42, y: 27 }, { x: 42, y: 43 }]
// 战斗人物层级
window.BattleRoleZorder = [[998, 995, 992, 999, 996, 993, 997, 994, 991, 990], [998, 995, 992, 999, 996, 993, 997, 994, 991, 990]]
// 不知道是啥
window.Pos_To_Col = [0,1,2,0,1,2,0,1,2];

//vip界面标签类型
window.VIPTABCONST = {
    CHARGE : 1,     // 充值
    ACC_CHARGE : 2, // 累充
    VIP : 3,        // VIP
    DAILY_GIFT : 4, // 每日礼包
    PRIVILEGE : 5,  // 特权商城
}

//vip红点类型
window.VIPREDPOINT = {
    MONTH_CARD : 1,     //月卡
    VIP_TAB : 2,        //VIP   TAB
    DAILY_AWARD : 3,    // 每日礼
    PRIVILEGE : 4,      // 特权礼包
}

//需要适配顶部充值的sdk
window.NEED_ADAPTIVE_SDK = {
    WX_SDK : "WX_SDK",     //微信小游戏
    SH_SDK : "SH_SDK",     //深海微信小游戏
    QQ_SDK : "QQ_SDK",    // QQ小游戏
}

window.SHOW_BAIDU_TIEBA = true  // 是否显示百度贴吧
window.SHOW_SINGLE_INVICODE = true   // 是否显示个人推荐码
window.SHOW_BIND_PHONE = true   // 是否需要显示手机绑定界面
window.SHOW_WECHAT_CERTIFY = true    // 是否显示微信公众号
window.SHOW_GAME_SHARE = true     // 游戏分享
window.WECHAT_SUBSCRIPTION = "sy_sszg"   // 微信公众号


window.cacheAtlas = [
    "res/item/equip",
    "res/item/heads",
    "res/item/items"
]

// 常驻内存胡节点
// 打开频率高
// 根节点
window.cachePrefabs = [
    "hero/hero_bag_window",
    "hero/hero_main_info_window",
    "hero/hero_main_tab_train_panel",
    "battle/battle_button_list",
    "battle/battle_real_role",
    "mainui/mainui_view",
    "partnersummon/partnersummon_window",
    "partnersummon/partnersummon_item",
]

window.CacheAnimas = [
    "H30009",
    "E53051",
    "E53052",
    "E53070",
    "H30012",
    "E53007",
    "E50012",
    "H30016",
    "E53010",
    "E50028",
    "E53204",
    "E53210",
    "H30091",
    "H31091",
    "H32091",
    "E53015",
    "E50030",
    "E53061",
    "E53813",
    "E53814",
    "E53265",
    "E53266",
    "E50033",
    "H30022",
    "E50007",
    "E53028",
    "E50001",
    "H30045",
    "E53009",
    "E50027",
    "E53057",
    "E53248",
    "H30003",
    "E53137",
    "E53073",
    "E50051",
    "E50002",
    "H30018",
    "E53005",
    "E50010",
    "E53259",
    "E50057",
    "H30027",
    "E53035",
    "E53033",
    "E50041",
    "E50053",
    "E53237",
    "H30088",
    "E53139",
    "E53138",
    "E50004",
    "H30025",
    "E53137"
]

window.WorshipType = {
    normal : 0,         // 普通点赞
    godbattle : 1,      // 众神战场
    ladder : 3,         // 跨服天梯
    crossarena : 4,     // 跨服竞技场
    home : 5,           // 家园
    crosschampion : 6,  // 跨服冠军赛
}

window.TASK_TIPS = false;   //是否开启任务引导
