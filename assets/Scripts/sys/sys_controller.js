var PartnerConst = require("partner_const")
var ActionConst = require("action_const");
var RoleController = require("role_controller");
var RoleEvent = require("role_event");
var AdventureActivityController = require("adventureactivity_controller");
var AdventureActivityConst= require("adventureactivity_const");

var SysController = cc.Class({
    extends: BaseController,

    ctor: function () {
        this.initAttrProtocalsFunList();
    },

    registerEvents: function() {
        this.role_vo = RoleController.getInstance().getRoleVo();
        if (this.role_vo) {
            this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value){
                if(key == "lev" || key == "open_day"){
                    this.requestAttrProtocals();
                }
            }.bind(this))
        }

        this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, (function () {
            var GuideController = require("guide_controller");
            if  (!RoleController.getInstance().checkRoleSetNameViewIsOpen() && !GuideController.getInstance().isInGuide()){ // 取名界面没打开，并且不在引导中，则跳到主城
                var MainuiController = require("mainui_controller");
                var MainuiConst = require("mainui_const");
                MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene);
            }
            this.resetAttrProtocals();
            this.requestReLinkProtocals();            
        }).bind(this))        
    },

    // 登陆时请求的协议
    requestLoginProtocals: function(finish_cb) {
    	var function_list = [
            // function () { this.SendProtocal(10906, {}) }.bind(this),   // 开服天数
            // function () { this.SendProtocal(10380, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(24600, {}) }.bind(this),   // 问卷
            function () {
                var id = 0;
                if (PLATFORM_TYPR == "SH_SDK") {//深海小程序
                    id = 1;
                }
                this.SendProtocal(16691, {id:id})
            }.bind(this),   // 爱微游分享状态
            function () {
                var id = 0;
                if (PLATFORM_TYPR == "SH_SDK") {//深海小程序
                    id = 1;
                }
                this.SendProtocal(16693, {id:id})
            }.bind(this),   // 爱微游关注状态

            function () {
                if (PLATFORM_TYPR == "SH_SDK") {//深海小程序
                    this.SendProtocal(16695, {})
                }
            }.bind(this),   // 深海小程序收藏状态

            
            function () { this.SendProtocal(10500, {}) }.bind(this),   // 背包
            function () { this.SendProtocal(10501, {}) }.bind(this),   // 背包
            function () { this.SendProtocal(10325, {}) }.bind(this),   // 头像信息
            function () { this.SendProtocal(13006, {}) }.bind(this),   // 剧情副本基础信息
            function () { this.SendProtocal(13008, {}) }.bind(this),   // 剧情副本通关奖励
            function () { this.SendProtocal(13011, {}) }.bind(this),   // 剧情副本Buff数据
            function () { this.SendProtocal(13017, {}) }.bind(this),   // 剧情副本挂机数据
            // function () { this.SendProtocal(10905, {}) }.bind(this),   // 世界等级
            function () { this.SendProtocal(20700, {}) }.bind(this),   // 星河神殿挑战次数
            function () { this.SendProtocal(30001, {}) }.bind(this),   // 新主线任务
            function () { this.SendProtocal(10317, {}) }.bind(this),   // 点赞数量
            function () { this.SendProtocal(21100, {}) }.bind(this),   // 七天登陆
            function () { this.SendProtocal(13601, {}) }.bind(this),   // 七日目标
            function () { this.SendProtocal(16637, {}) }.bind(this),   // 探宝
            function () { this.SendProtocal(24700, {}) }.bind(this),   // 基金
            function () { this.SendProtocal(21012, {}) }.bind(this),   // 首充
            function () { this.SendProtocal(21010, {}) }.bind(this),   // 每日首充
            // function () { this.SendProtocal(25000, {}) }.bind(this),   // 元素圣殿
            function () { this.SendProtocal(23606, {}) }.bind(this),   // 点金
            function () { this.SendProtocal(24204, {}) }.bind(this),   // 公会战状态
            function () { this.SendProtocal(24220, {}) }.bind(this),   // 公会战宝箱
            // function () { this.SendProtocal(22200, {}) }.bind(this),   // 圣物
            // function () { this.SendProtocal(24125, {}) }.bind(this),   // 神器幻化
            // function () { this.SendProtocal(24128, {}) }.bind(this),   // 神器任务
            function () { this.SendProtocal(11000, {}) }.bind(this),   // 英雄数据
            function () { this.SendProtocal(11040, {}) }.bind(this),   // 英雄图鉴
            function () { this.SendProtocal(11037, {}) }.bind(this),   // 符文祝福
            function () { this.SendProtocal(11213, {type_list: [{type: PartnerConst.Fun_Form.Drama}, {type: PartnerConst.Fun_Form.Arena}]}) }.bind(this),     // 阵法
            function () { this.SendProtocal(24410, {}) }.bind(this),   // 远征红点
            // function () { this.SendProtocal(24411, {}) }.bind(this),   // 远征派遣红点
            function () { this.SendProtocal(24400, {}) }.bind(this),   // 远征数据
            function () { this.SendProtocal(24405, {}) }.bind(this),   // 远征支援
            function () { this.SendProtocal(19807, {}) }.bind(this),   // 邀请码（自己绑定的角色）
            function () { this.SendProtocal(19804, {}) }.bind(this),   // 邀请码红点
            function () { this.SendProtocal(19800, {}) }.bind(this),   // 邀请码
            function () { this.SendProtocal(19802, {}) }.bind(this),   // 邀请码
            // function () { this.SendProtocal(24312, {}) }.bind(this),   // 天梯是否开启
            function () { this.SendProtocal(10800, {}) }.bind(this),   // 邮件
            function () { this.SendProtocal(10926, {}) }.bind(this),   // 在线奖励
            function () { this.SendProtocal(23200, {}) }.bind(this),   // 召唤数据
            function () { this.SendProtocal(23214, {}) }.bind(this),   // 英雄置换
            // function () { this.SendProtocal(13604, {}) }.bind(this),   // 七日目标任务
            // function () { this.SendProtocal(13607, {}) }.bind(this),   // 七日目标等级奖励
            function () { this.SendProtocal(13030, {}) }.bind(this),   // 材料副本
            function () { this.SendProtocal(10400, {}) }.bind(this),   // 任务列表
            function () { this.SendProtocal(16400, {}) }.bind(this),   // 成就列表
            function () { this.SendProtocal(20300, {}) }.bind(this),   // 活跃度
            function () { this.SendProtocal(19906, {}) }.bind(this),   // 录像馆点赞
            function () { this.SendProtocal(16707, {}) }.bind(this),   // 月卡奖励
            function () { this.SendProtocal(16710, {}) }.bind(this),   // VIP礼包红点
            function () { this.SendProtocal(16712, {}) }.bind(this),   // 累充红点
            function () { this.SendProtocal(30102, {}) }.bind(this),   // 皮肤购买红点
            function () { this.SendProtocal(21006, {}) }.bind(this),   // 每日礼包
            function () { this.SendProtocal(24502, {}) }.bind(this),   // 特权礼包
            function () { this.SendProtocal(14100, {}) }.bind(this),   // 签到红点
            function () { this.SendProtocal(16705, {}) }.bind(this),   // 月卡信息
            function () { this.SendProtocal(21008, {}) }.bind(this),   // 每日礼
            function () { this.SendProtocal(16635, {}) }.bind(this),   // 手机绑定奖励状态
            function () { this.SendProtocal(16697, {}) }.bind(this),   // 手机绑定奖励状态
            function () { this.SendProtocal(16633, {}) }.bind(this),   // 微信公众号状态
            function () { this.SendProtocal(23205, {}) }.bind(this),   // 召唤5星必出
            function () { this.SendProtocal(13040, {}) }.bind(this),   // 快速作战
            
            function () { this.SendProtocal(11320, {}) }.bind(this),   // 星命塔数据
            // function () { this.SendProtocal(20706, {}) }.bind(this),   // 星河神殿每天第一次登录红点
            function () { this.SendProtocal(16687, {bid: ActionConst.ActionRankCommonType.open_server}) }.bind(this),      // 新服限购
            function () { this.SendProtocal(16687, {bid: ActionConst.ActionRankCommonType.high_value_gift}) }.bind(this),  // 小额礼包
            function () { this.SendProtocal(16687, {bid: ActionConst.ActionRankCommonType.mysterious_store}) }.bind(this), // 神秘杂货店
            function () { this.SendProtocal(21020, {} )}.bind(this), // 每日1元
            // function () { this.SendProtocal(25200, {}) }.bind(this),   // 天界副本
            // function () { this.SendProtocal(25219, {}) }.bind(this),   // 神装转盘
            function () { this.SendProtocal(25300, {}) }.bind(this),   // 战令活动
            function () { this.SendProtocal(25303, {}) }.bind(this),
            function () { this.SendProtocal(16730, {}) }.bind(this), //赠送VIP
            
            function () {this.guildRedBagProtocal() }.bind(this),     // 公会红包
            function () {this.adventrueProtocal() }.bind(this),       // 冒险
            function () {this.endlessProtocal() }.bind(this),         // 无尽试炼
            function () {this.voyageProtocal() }.bind(this),          // 远航     
            function () { this.SendProtocal(19804, {}) }.bind(this),          // 邀请码红点     
            
    	]

    	var cur_index = 0;
    	this.ping_timer_id = gcore.Timer.set(function() {
    		function_list[cur_index]();
            cur_index ++;
            // game.updateProtoProgress(cur_index / function_list.length);
            if (cur_index == function_list.length -1) {
                if (finish_cb)
                    finish_cb();
            }

    	}.bind(this), 20, function_list.length)
    },

    requestReLinkProtocals: function() {
        var function_list = [
            function () { this.SendProtocal(10500, {}) }.bind(this),   // 开服天数
            function () { this.SendProtocal(10501, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(13006, {}) }.bind(this),   // 问卷
            function () { this.SendProtocal(13008, {}) }.bind(this),   // 开服天数
            function () { this.SendProtocal(13011, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(13017, {}) }.bind(this),   // 问卷
            // function () { this.SendProtocal(25000, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(24204, {}) }.bind(this),   // 问卷
            function () { this.SendProtocal(11000, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(11040, {}) }.bind(this),   // 问卷
            function () { this.SendProtocal(11037, {}) }.bind(this),   // 开服天数
            function () { this.SendProtocal(11213, {type_list: [{type: PartnerConst.Fun_Form.Drama}, {type: PartnerConst.Fun_Form.Arena}]}) }.bind(this),     // 阵法
            function () { this.SendProtocal(24410, {}) }.bind(this),   // 问卷
            // function () { this.SendProtocal(24411, {}) }.bind(this),   // 开服天数
            function () { this.SendProtocal(24400, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(24405, {}) }.bind(this),   // 问卷
            // function () { this.SendProtocal(24312, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(23200, {}) }.bind(this),   // 问卷
            function () { this.SendProtocal(10400, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(16400, {}) }.bind(this),   // 问卷
            function () { this.SendProtocal(20300, {}) }.bind(this),   // 开服天数
            // function () { this.SendProtocal(19906, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(21006, {}) }.bind(this),   // 问卷
            function () { this.SendProtocal(16705, {}) }.bind(this),   // 开服天数
            function () { this.SendProtocal(24700, {}) }.bind(this),   // 开服时间
            function () { this.SendProtocal(25300, {}) }.bind(this),   // 战令任务红点

            function () { this.guildRedBagProtocal() }.bind(this),     // 公会红包
            function () { this.adventrueProtocal() }.bind(this),       // 冒险
            function () { this.endlessProtocal() }.bind(this),         // 无尽试炼
            function () { this.voyageProtocal() }.bind(this),           // 远航
            function () { this.arenaProtocal() }.bind(this),           // 竞技场
            function () { this.SendProtocal(30001, {}) }.bind(this),   // 新主线任务
            
        ]

        var cur_index = 0;
        this.ping_timer_id = gcore.Timer.set(function() {
            function_list[cur_index]();
            cur_index ++;
        }.bind(this), 10, function_list.length)

    },

    /******************以下是一些特殊的协议请求*********************/

    initAttrProtocalsFunList: function(force) {
        if (force || !this.attr_fun_list) {
            this.attr_fun_list = [
                {func: function () {this.adventrueProtocal()}.bind(this), req_flag: false},
                {func: function () {this.arenaProtocal() }.bind(this), req_flag: false},            
                {func: function () {this.endlessProtocal() }.bind(this), req_flag: false},         
                {func: function () {this.voyageProtocal() }.bind(this), req_flag: false},
            ]
        }
    },

    // 检测是否请求过数据
    checkProtocalIsCanRequest: function(id) {
        if (this.attr_fun_list && this.attr_fun_list[id] && !this.attr_fun_list[id].req_flag)
            return true
        return false
    },

    // 公会红包(只需要登陆和断线时请求，加入公会时，后端会主动推)
    guildRedBagProtocal: function() {
        if (this.role_vo && this.role_vo.gid != 0 && this.role_vo.gsrv_id != "")
            this.SendProtocal(13534, {})
    },

    // 冒险的协议请求
    adventrueProtocal: function(forces) {
        var is_open = forces;
        if(is_open == null){
            is_open = AdventureActivityController.getInstance().isOpenActivity(AdventureActivityConst.Ground_Type.adventure);
        }
        if(is_open == false)return;
        if(!this.checkProtocalIsCanRequest(0))return;
        
        this.SendProtocal(20600, {})  // 冒险基础信息
        this.SendProtocal(20601, {})  // 冒险buff信息
        this.SendProtocal(20604, {})  // 冒险伙伴信息数据
        this.SendProtocal(20634, {})  // 冒险宝箱
        if(this.attr_fun_list[0]){
            this.attr_fun_list[0].req_flag = true;
        }
    },

    endlessProtocal: function() {
        var open_config = Config.endless_data.data_const.open_lev;
        if (!open_config) return;
        var MainuiController = require("mainui_controller");
        var is_open = MainuiController.getInstance().checkIsOpenByActivate(open_config.val);
        if (!is_open) return
        if (!this.checkProtocalIsCanRequest(2)) return;

        this.SendProtocal(23900, {})
        this.SendProtocal(23903, {})
        this.SendProtocal(23906, {})
        if (this.attr_fun_list[2])
            this.attr_fun_list[2].req_flag = true;
    },

    // 远航协议请求
    voyageProtocal: function() {
        var lev_config = Config.shipping_data.data_const["guild_lev"];
        if (!lev_config || !this.role_vo || lev_config.val > this.role_vo.lev)
            return

        if (!this.checkProtocalIsCanRequest(3)) return;

        this.SendProtocal(23800, {})
        this.SendProtocal(23805, {})
        this.SendProtocal(23821, {})

        if (this.attr_fun_list[3])
            this.attr_fun_list[3].req_flag = true;

    },

    resetAttrProtocals: function() {
        this.initAttrProtocalsFunList(true);
    },

    requestAttrProtocals: function() {
        if (!this.attr_fun_list) return;

        for (var fun_i in this.attr_fun_list) {
            var fun_info = this.attr_fun_list[fun_i];
            if (!fun_info.req_flag) {
                fun_info.func();
            }
        }
    },
    //竞技场的协议请求
    arenaProtocal: function() {
        var config = Config.arena_data.data_const.limit_lev;
        if (!config || !this.role_vo || this.role_vo.lev < config.val)
            return

        if (!this.checkProtocalIsCanRequest(1)) return

        this.SendProtocal(20208, {})
        this.SendProtocal(20200, {})
        this.SendProtocal(20250, {})
        this.SendProtocal(20223, {})
        if (this.attr_fun_list[1])
            this.attr_fun_list[1].req_flag = true
    },
})

module.exports = SysController;