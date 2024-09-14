// //-----------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-06 11:18:06
// --------------------------------------------------------------------
var MainSceneController = require("mainscene_controller");
var MainuiController    = require("mainui_controller");
var SceneConst          = require("scene_const");
var ArenaConst          = require("arena_const");
var RoleController      = require("role_controller");
var DramaEvent          = require("battle_drama_event");
var ArenaEvent          = require("arena_event");
var BattleConst         = require("battle_const");
var MainuiEvent = require("mainui_event");

var ArenaController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var ArenaModel = require("arena_model");
        var ChampionModel = require("arena_champion_model");

        this.model = new ArenaModel();
        this.model.initConfig();
        this.champion_model = new ChampionModel();
        this.champion_model.initConfig();

        this.cache_list = []; //缓存登录前打开的界面
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    getChamPionModel: function() {
        return this.champion_model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (!this.login_event_success) {
            this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function(){
                gcore.GlobalEvent.unbind(this.login_event_success);
                // this.role_vo = RoleController.getInstance().getRoleVo();
                // if (this.role_vo) {
                //     if (!this.update_self_event) {
                //         this.update_self_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                //         if (key == "lev")
                //             this.requestInitProtocal();
                //         }.bind(this))
                //     }
                // }
            }).bind(this))
        }

        // if (!this.battle_drama_event) {
        //     this.battle_drama_event = gcore.GlobalEvent.bind(DramaEvent.BattleDrama_Update_Max_Id, function(max_id){
        //         this.requestInitProtocal();
        //     }.bind(this));
        // }

        if (!this.re_link_game_event) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function() {
                var GuideController = require("guide_controller");
                if (!GuideController.getInstance().isInGuide())
                    this.openArenaLoopMathWindow(false);
                // this.requestInitProtocal();      
            }.bind(this))
        }

        if (this.loading_enter_scene == null) {
            this.loading_enter_scene = gcore.GlobalEvent.bind(MainuiEvent.LOADING_ENTER_SCENE, (function () {
                this.showCachePanel();
            }).bind(this))
        }
    },

    requestInitProtocal: function() {
        this.sender20208();              // 挑战次数奖励信息
        this.SendProtocal(20200, {});    // 竞技场个人信息 
        this.SendProtocal(20250, {});    // 冠军赛状态信息
        this.SendProtocal(20223, {});    // 防守信息
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(20200, this.handle20200.bind(this));
        this.RegisterProtocal(20201, this.handle20201.bind(this));
        this.RegisterProtocal(20202, this.handle20202.bind(this));
        this.RegisterProtocal(20203, this.handle20203.bind(this));
        this.RegisterProtocal(20206, this.handle20206.bind(this));
        this.RegisterProtocal(20207, this.handle20207.bind(this));
        this.RegisterProtocal(20208, this.handle20208.bind(this));     // 宝箱模式
        this.RegisterProtocal(20209, this.handle20209.bind(this));
        this.RegisterProtocal(20210, this.handle20210.bind(this));
        this.RegisterProtocal(20220, this.handle20220.bind(this));
        this.RegisterProtocal(20221, this.handle20221.bind(this));
        this.RegisterProtocal(20222, this.handle20222.bind(this));
        this.RegisterProtocal(20223, this.handle20223.bind(this));

        // 冠军赛
        this.RegisterProtocal(20250, this.handle20250.bind(this));     // 冠军赛赛程状态数据
        this.RegisterProtocal(20251, this.handle20251.bind(this));     // 个人排名以及可下注信息
        this.RegisterProtocal(20252, this.handle20252.bind(this));     // 我的比赛信息 
        this.RegisterProtocal(20253, this.handle20253.bind(this));     // 竞猜比赛信息 
        this.RegisterProtocal(20254, this.handle20254.bind(this));     // 押注返货
        this.RegisterProtocal(20255, this.handle20255.bind(this));     // 我的竞猜列表
        this.RegisterProtocal(20256, this.handle20256.bind(this));     // 结算展示
        this.RegisterProtocal(20257, this.handle20257.bind(this));     // 竞猜实时更新
        this.RegisterProtocal(20258, this.handle20258.bind(this));     // 我的战斗日志
        this.RegisterProtocal(20260, this.handle20260.bind(this));     // 32强数据
        this.RegisterProtocal(20261, this.handle20261.bind(this));     // 4强数据
        this.RegisterProtocal(20262, this.handle20262.bind(this));     // 32强或者4强赛竞猜位置信息
        this.RegisterProtocal(20263, this.handle20263.bind(this));     // 32强或者4强赛指定位置的信息
        this.RegisterProtocal(20280, this.handle20280.bind(this));     // 冠军赛前3名信息
        this.RegisterProtocal(20281, this.handle20281.bind(this));     // 冠军赛排行榜信息

        this.RegisterProtocal(20282, this.handle20282.bind(this));     // 赛季结算前3
        this.RegisterProtocal(20204, this.handle20204.bind(this));     // 查看剧情人数据        
    },

    handle20200: function(data) {
        this.model.updateMyLoopData(data);
    },
    
    sender20201: function() {                   // 请求挑战队列 
        this.SendProtocal(20201, {});
    }, 

    handle20201: function(data) {               // 挑战队列更新
        this.model.updateLoopChallengeList(data);
    },

    handle20202: function(data) {
        if(this.loop_challenge_role_rid != data.rid && this.loop_challenge_role_srv_id != data.srv_id)  return;
        this.openCheckLoopChallengeRole(true, data)
    },
    openCheckLoopChallengeRole(status, data){
        var self = this
        if(status == false){
            if(self.loop_challenge_check_window != null){
                self.loop_challenge_check_window.close()
                self.loop_challenge_check_window = null
            }
        }else{
            if(data == null) return;
            if(self.loop_challenge_check_window == null){
                let ArenaLoopChallengeCheckWindow = require("arena_loop_challenge_check_window")
                self.loop_challenge_check_window = new ArenaLoopChallengeCheckWindow()
            }
            self.loop_challenge_check_window.open(data)
        }
    },

    sender20203: function(rid, srv_id) {
        // if (!rid || !srv_id) return;

        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(20203, protocal);
    },

    handle20203: function(data) {
        message(data.msg)
    },

    sender20206: function() {                  // 请求刷新挑战队列
        this.SendProtocal(20206, {});
    },

    handle20206: function(data) {              // 请求刷新结果
        message(data.msg)
    },

    sender20207: function(num) {              // 购买挑战券
        var proto = {};
        proto.num = num;
        this.SendProtocal(20207, proto)
    },

    handle20207: function(data) {
        message(data.msg)
        if (data.code == 1) {
            gcore.GlobalEvent.fire(ArenaEvent.UpdateArena_Number);
        }
        this.openArenaLoopChallengeBuy(false);
    },

    sender20208: function() {
        this.SendProtocal(20208, {})
    },

    handle20208: function(data) {
        if (data)
            this.model.updateChallengeTimesAwards(data);            
    },

    sender20209: function(num) {
        var protocal = {};
        protocal.num = num;
        this.SendProtocal(20209, protocal);
    },

    handle20209: function(data) {
    },

    // 战斗计算，收到结算的，就同时请求一下个人信息吧，服务器要求
    handle20210: function(data) {
        var BattleConst = require("battle_const");
        var BattleController = require("battle_controller");
        BattleController.getInstance().openFinishView(true, BattleConst.Fight_Type.Arena, data);

        this.SendProtocal(20200, {});
    },

    sender20220: function() {
        this.SendProtocal(20220, {})
    },

    handle20220: function(data) {          // 循环赛前三
        if (data && data.rank_list) {
            gcore.GlobalEvent.fire(ArenaEvent.UpdateLoopChallengeStatueList, data.rank_list);
        }
    },

    sender20221: function() {
        this.SendProtocal(20221, {});
    },

    handle20221: function(data) {
        if (data) {
            gcore.GlobalEvent.fire(ArenaEvent.UpdateLoopChallengeRank, data);
        }
    },

    sender20222: function(data) {
        this.SendProtocal(20222, {});
    },

    handle20222: function(data) {
        if (data)
            gcore.GlobalEvent.fire(ArenaEvent.UpdateMylogListEvent, data.log_list);
    },

    handle20223: function(data) {
        this.model.updateArenaLoopLogStatus(data.flag);
    },

    /********************冠军赛相关********************/

    handle20250: function(data) {        // 冠军赛赛程状态
        this.champion_model.updateChampionBaseInfo(data);
        this.sender20251();

        // 引导和剧情中不需要弹出
        var GuideController = require("guide_controller");
        var StoryController = require("story_controller");
        if (GuideController.getInstance().isInGuide()) return;
        if (StoryController.getInstance().isInStory()) return;
        
        // 弹窗处理的相关逻辑
        var build_vo = MainSceneController.getInstance().getBuildVo(SceneConst.CenterSceneBuild.arena);
        if (!build_vo || build_vo.is_lock) return;

        if(IS_LOADING == true){
            this.cache_list.push({function:function(data){
                this.handle20250(data);
            }.bind(this,data)});
            return;
        }

        if (data.step_status === ArenaConst.champion_step_status.opened) {
            var ActivityController = require("activity_controller").getInstance();
            var ActivityConst = require("activity_const");
            if (!this.champion_window) {            
                if (data.round_status == ArenaConst.champion_round_status.guess) {
                    ActivityController.openSignView(true, ActivityConst.ActivitySignType.arena_champion_guess, {timer: true});
                } else {
                    if (!this.had_show_notice) {
                        ActivityController.openSignView(true, ActivityConst.ActivitySignType.arena_champion, {timer: true})
                        this.had_show_notice = true;
                    }
                }
            }
        } else {
            if (this.alert_window) {
                this.alert_window.close();
                this.alert_window = null;
            }
        }
    },

    sender20251: function(data) {
        this.SendProtocal(20251, {});
    },

    handle20251: function(data) {        // 个人排名以及可
        this.champion_model.setRoleInfo(data);
    },

    sender20252: function() {
        this.SendProtocal(20252, {});
    }, 

    handle20252: function(data) {        // 我的比赛信息 
        gcore.GlobalEvent.fire(ArenaEvent.UpdateMyMatchInfoEvent, data);
    },

    sender20253: function() {
        this.SendProtocal(20253, {});
    },

    handle20253: function(data) {        // 竞猜比赛信息 
        gcore.GlobalEvent.fire(ArenaEvent.UpdateGuessMatchInfoEvent, data);
    },

    // 请求押注某一方
    sender20254: function(bet_type, bet_val) {
        var proto = {};
        proto.bet_type = bet_type;
        proto.bet_val = bet_val;
        this.SendProtocal(20254, proto);
    },

    handle20254: function(data) {        // 押注返货
        message(data.msg)
        if (data.code == 1) {
            var role_info = this.champion_model.getRoleInfo()
            role_info.can_bet = data.can_bet
            gcore.GlobalEvent.fire(ArenaEvent.UpdateRoleInfoBetEvent, data.can_bet, data.bet_type)
            this.openArenaChampionGuessWindow(false);
        }
    },

    sender20255: function() {
        this.SendProtocal(20255, {})
    },

    handle20255: function(data) {        // 我的竞猜列表
        gcore.GlobalEvent.fire(ArenaEvent.UpdateMyGuessListEvent, data.list);
    },

    handle20256: function(data) {        // 结算展示
    },

    handle20257: function(data) {        // 竞猜实时更新
        gcore.GlobalEvent.fire(ArenaEvent.UpdateBetMatchValueEvent, data);
    },

    handle20258: function(data) {        // 我的战斗日志
    },

    sender20260: function() {
        this.SendProtocal(20260, {});
    },

    handle20260: function(data) {        // 32强数据
        gcore.GlobalEvent.fire(ArenaEvent.UpdateTop32InfoEvent, data);
    },

    sender20261: function() {
        this.SendProtocal(20261, {});
    },

    handle20261: function(data) {        // 4强数据
        gcore.GlobalEvent.fire(ArenaEvent.UpdateTop4InfoEvent, data);
    },

    sender20262: function() {
        this.SendProtocal(20262, {})
    },

    handle20262: function(data) {        // 32强或者4强赛竞猜位置信息        
        if (data)
            gcore.GlobalEvent.fire(ArenaEvent.UpdateTop324GuessGroupEvent, data.group, data.pos)
    },

    sender20263: function(group, pos) {
        var protocal = {};
        protocal.group = group;
        protocal.pos = pos;
        this.SendProtocal(20263, protocal);
    },

    handle20263: function(data) {        // 32强或者4强赛
        if (data)
            gcore.GlobalEvent.fire(ArenaEvent.UpdateTop324GroupPosEvent, data);      
    },

    sender20280: function() {
        this.SendProtocal(20280, {});
    },

    handle20280: function(data) {        // 冠军赛前3名信
        if (data && data.rank_list)
            gcore.GlobalEvent.fire(ArenaEvent.UpdateChampionTop3Event, data.rank_list);
    },

    sender20281: function() {
        this.SendProtocal(20281, {});
    },

    handle20281: function(data) {        // 冠军赛排行榜信
        gcore.GlobalEvent.fire(ArenaEvent.UpdateChampionRankEvent, data);
    },

    handle20282: function(data) {        // 赛季结算前3
    },

    handle20204: function(data) {        // 查看剧情人数据

    },

    //进入主场景后显示缓存的界面
    showCachePanel:function(){
        if(this.cache_list == null || this.cache_list.length<=0)return;
        for(var i in this.cache_list){
            if(this.cache_list[i].function){
                this.cache_list[i].function();
            }
        }
        this.cache_list = [];
    },

    // ==============================--
    // desc:请求打开竞技场面板,这个时候要判断一下,如果是冠军赛开始阶段,就不要直接进竞技场了,
    // 否则直接进竞技场吧,这个才是对外打开竞技场的请求,因为这里要判断是否在冠军赛七剑
    // time:2018-08-01 08:10:21
    // extend:扩展参数,如果是冠军赛,则需要判断具体的
    // @return 
    // ==============================--
    requestOpenArenWindow: function(status, extend) {
        var data = MainSceneController.getInstance().getBuildVo(SceneConst.CenterSceneBuild.arena);
        if (data && data.is_lock) {
            message(data.desc)
            return            
        }
        var controller = require("role_controller").getInstance()
        controller.openRoleInfoView(false);
        controller.openRoleDecorateView(false);
        // 如果是引导的话,那么这个肯定是进竞技场
        // if GuideController:getInstance():isInGuide() then 
        //     self:requestOpenArenaLoopMathWindow(true)
        // else
        if (extend == ArenaConst.arena_type.rank) {
            this.openArenaChampionMatchWindow(true);
        } else {
            var base_info = this.champion_model.getBaseInfo();
            if (!base_info || base_info.step_status != ArenaConst.champion_step_status.opened) {
                this.requestOpenArenaLoopMathWindow(true);
            } else {
                this.openArenaEnterWindow(true, ArenaConst.arena_type.rank);
            }
        }
    },

    // ==============================--
    // desc:请求打开竞技场界面
    // time:2018-08-01 08:19:25
    // @status:
    // @index:
    // @return 
    // ==============================--
    requestOpenArenaLoopMathWindow: function(status, index) {
        if (status) {
            MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Arena)        
        }
    },


    // ==============================--
    // desc:打开循环赛界面(这个接口外部只有一个,那就是真正的战斗请求回来之后打开的,也就是mainuicontroller里面打开的)
    // time:2018-07-31 09:52:23
    // @status:
    // @index:
    // @return 
    // ==============================--
    openArenaLoopMathWindow: function(status, index) {
        if (status) {
            var build_vo = MainSceneController.getInstance().getBuildVo(SceneConst.CenterSceneBuild.arena)
            if (build_vo && build_vo.is_lock) {
                message(build_vo.desc);
                return                
            } 

            index = index || ArenaConst.loop_index.challenge; 
            if (!this.loop_match_window) {
                var ArenaLoopMatchWindow = require("arena_loop_match_window");
                this.loop_match_window = new ArenaLoopMatchWindow(this);
            } 
            if (!this.loop_match_window.isOpen()) 
                this.loop_match_window.open(index);
        } else {
            if (this.loop_match_window) {
                this.loop_match_window.close();
                this.loop_match_window = null;
            }
        }
    },

    // ==============================--
    // desc:打开循环赛或者冠军赛入口界面
    // time:2018-07-31 09:52:04
    // @status:
    // @index:
    // @return 
    // ==============================--
    openArenaEnterWindow: function(status, index) {
        if (status) {
            var build_vo = MainSceneController.getInstance().getBuildVo(SceneConst.CenterSceneBuild.arena)
            if (build_vo && build_vo.is_lock) {
                message(build_vo.desc)
                return                
            }

            if (!this.enter_window) {
                var ArenaEnterWindow = require("arena_enter_window");
                this.enter_window = new ArenaEnterWindow(this);
            }
            index = index || ArenaConst.arena_type.loop;
            if (!this.enter_window.isOpen()) {
                this.enter_window.open(index)
            }
        } else {
            if (this.enter_window) {
                this.enter_window.close()
                this.enter_window = null;
            }
        }
    },

    // 打开冠军赛主界面
    openArenaChampionMatchWindow: function(status, index) {
        if (status) {
            if (!this.champion_window) {
                var ArenaChampionMatchWindow = require("arena_champion_match_window");
                this.champion_window = new ArenaChampionMatchWindow(this);
            } 
            this.champion_window.open(index);
        } else {
            if (this.champion_window) {
                this.champion_window.close();
                this.champion_window = null;                
            }
        }
        
    },

    openArenaChampionGuessWindow: function(status, data) {
        if (status) {
            if (!this.guess_window) {
                var ArenaChampionGuessWindow = require("arena_champion_guess_window");
                this.guess_window = new ArenaChampionGuessWindow(this);
            }
            this.guess_window.open(data);      
        } else {
            if (this.guess_window) {
                this.guess_window.close();
                this.guess_window = null;
            }
        } 
    },

    // 打开循环赛结算界面
    openLoopResultWindow: function(status, data) {
        if (status) {
            if (!this.loop_result_window) {
                var LoopResultWindow = require("arena_loop_result_window");
                this.loop_result_window = new LoopResultWindow(this);
            }
            this.loop_result_window.open(data);            
        } else {
            if (this.loop_result_window) {
                this.loop_result_window.close();
                this.loop_result_window = null;
            }
        }
    },

    openArenaLoopMyLogWindow: function(status) {
        if (status) {
            if (!this.loop_log_window) {
                var ArenaLoopMyLogWindow = require("arena_loop_my_log_window");
                this.loop_log_window = new ArenaLoopMyLogWindow(this);
            }
            this.loop_log_window.open();           
        } else {
            if (this.loop_log_window) {
                this.loop_log_window.close();
                this.loop_log_window = null;               
            }
        }
    },

    openArenaLoopChallengeBuy: function(status) {
        if (status) {
            if (!this.arena_champion_buy) {
                var ArenaChampionBuy = require("arena_loop_challenge_buy_window");
                this.arena_champion_buy = new ArenaChampionBuy(this);
            }
            this.arena_champion_buy.open();
        } else {
            if (this.arena_champion_buy) {
                this.arena_champion_buy.close();
                this.arena_champion_buy = null;
            }
        }
    },

    openArenaChampionMyGuessWindow: function(status) {
        if (status) {
            if (!this.my_guess_window) {
                var ArenaChampionMyGuessWindow = require("arena_champion_my_guess_window");
                this.my_guess_window = new ArenaChampionMyGuessWindow(this);
            }
            this.my_guess_window.open()
        } else {
            if (this.my_guess_window) {
                this.my_guess_window.close()
                this.my_guess_window = null;                
            }
        }

    },

    //==============================
    //desc:打开冠军赛排名奖励面板
    //time:2018-08-01 02:04:06
    //@status:
    //@return 
    //==============================
    openArenaChampionRankAwardsWindow: function(status) {
        if (status) {
            if (!this.champion_rank_awards) {
                var ArenaChampionRankAwardsWindow = require("arena_champion_rank_awards_window");
                this.champion_rank_awards = new ArenaChampionRankAwardsWindow(this);
            }
            this.champion_rank_awards.open();
        } else {
            if (this.champion_rank_awards) {
                this.champion_rank_awards.close()
                this.champion_rank_awards = null;                
            }
        }
    },

    //==============================
    //desc:打开
    //time:2018-07-31 05:23:58
    //@status:
    //@data:
    //@return 
    //==============================
    openArenaChampionRankWindow: function(status, data) {
        if (status) {
            if (!this.champion_rank) {
                var ArenaChampionRankWindow = require("arena_champion_rank_window");
                this.champion_rank = new ArenaChampionRankWindow(this);
            }
            this.champion_rank.open(data);
        } else {
            if (this.champion_rank) {
                this.champion_rank.close();
                this.champion_rank = null;        
            }
        }
    },

    getArenaRoot: function() {
        if (this.loop_match_window)
            return this.loop_match_window.root_wnd;
    },


    //==============================
    //desc:冠军赛战况的窗体
    //time:2018-08-03 08:40:54
    //@status:
    //@data:
    //@return 
    //==============================--
    openArenaChampionReportWindow: function(status, data) {
        if (status) {
            if (!this.report_window) {
                var ArenaChampionReportWindow = require("arena_champion_report_window");
                this.report_window = new ArenaChampionReportWindow(this);
            }
            this.report_window.open(data);
        } else {
            if (this.report_window) {
                this.report_window.close();
                this.report_window = null;                
            }
        }        
    },

    updateChampionTab: function(tab_index) {
        if (this.champion_window)
            this.champion_window.updateTab(tab_index);
    },

    requestLoopChallengeRoleInfo(rid, srv_id){
        if(rid == null || srv_id == null) return
        this.loop_challenge_role_rid = rid              //-- 记录一下当前请求查看的角色rid和srv_id
        this.loop_challenge_role_srv_id = srv_id
        let protocal = {}
        protocal.rid = rid
        protocal.srv_id = srv_id
        this.SendProtocal(20202, protocal)
    },
    
    requestRabotInfo(rid, srv_id, pos){
        let protocal = {}
        protocal.rid = rid
        protocal.srv_id = srv_id
        protocal.pos = pos
        this.SendProtocal(20204, protocal);
    },

    handle20204(data){
        if(data.code == 0){
            message(data.msg)
        }
        // var HeroController = require("hero_controller")
        // HeroController.getInstance().openHeroTipsPanel(true, data); 
    },
});

module.exports = ArenaController;