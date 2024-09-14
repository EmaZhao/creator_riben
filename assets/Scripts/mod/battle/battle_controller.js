// @author: xxx@syg.com(必填, 创建模块的人员)
// --------------------------------------------------------------------
// @description:
//      战斗控制器
// <br/>Create: 2018-11-28 19:19:19
// --------------------------------------------------------------------
var BattleEvent = require("battle_event");
var BattleConst = require("battle_const");
var MainuiController = require("mainui_controller");
var LevupgradeController = require("levupgrade_controller")
var MainuiEvent = require("mainui_event");

var BattleController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        // var BattleModel = require("battle_model");
        this.model = Utils.createClass("battle_model")

        // var BattleHookModel = require("battle_hook_model");
        this.hook_model = Utils.createClass("battle_hook_model");

        this.model.initConfig();
        this.hook_model.initConfig()

        this.is_watch_replay = false;           // 是否属于观战状态

        this.is_unlock_chapter = false          // 是否解锁章节中 
        this.is_normal_battle = false;          // 是否是真战斗        
        this.finish_result_view_list = {};      // 胜利面板列表
        this.finish_fail_view_list = {};        // 失败面板列表;
        this.cache_list = [];                   //缓存界面列表
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 假战斗数据
    getHookModel: function () {
        return this.hook_model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.loading_enter_scene == null) {
            this.loading_enter_scene = gcore.GlobalEvent.bind(MainuiEvent.LOADING_ENTER_SCENE, (function () {
                this.showCachePanel();
            }).bind(this))
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(20027, this.scInitFightStart);            // 战斗真正初始化数据,从0到1的战斗
        this.RegisterProtocal(20002, this.scRoundFightStart);           // 回合开始的播报   -- 包含回合开始的buff
        this.RegisterProtocal(20004, this.scRoundFightOn);              // 回合中的播报     -- 包含回合结束buff和效果播报的buff
        this.RegisterProtocal(20006, this.scFightEnd);                  // 战斗结算的,也就是真是战斗结束的
        this.RegisterProtocal(20008, this.scFightExit);                 // 退出战斗
        this.RegisterProtocal(20009, this.scSkipFirstTeam);             // 跳过一队
        this.RegisterProtocal(20013, this.scReBattleFight);             // 战斗重连,切进战斗或者短线重连的战斗

        this.RegisterProtocal(20014, this.scBattlePk);                  // 战斗切磋请求
        this.RegisterProtocal(20015, this.scBattlePkRe);                // 战斗切磋返回
        this.RegisterProtocal(20016, this.scBattlePkTwice);             // 战斗切磋同意

        this.RegisterProtocal(20020, this.scRoundNextFight);            // 下一波怪物
        this.RegisterProtocal(20022, this.scFightSpeed);                // 改变播放速度

        this.RegisterProtocal(20029, this.scRecordBattle);              // 看录像
        this.RegisterProtocal(20033, this.handle20033);                 // 切磋结算
        this.RegisterProtocal(20034, this.handle20034);                 // 切磋视频分享
        this.RegisterProtocal(20036, this.handle20036);                 // 观看跨服录像,最后应该29协议全部转到这一条

        this.RegisterProtocal(20060, this.handle20060);                 // 请求战斗类型返回,这个时候只需要做对应ui操作的
        this.RegisterProtocal(20061, this.handle20061);                 // 假战斗初始化的,如果触发这个数据但是实际上是在真战斗中的时候,不做处理
        this.RegisterProtocal(20062, this.handle20062);                 // 跳过战斗
    },

    // 是否在战斗中
    isInFight: function () {
        return this.model.getFightStatus()
    },

    // 是否有战斗场景
    hadBattleScene:function(){
        return (this.model.getBattleScene() != null)
    },

    // 设置战斗场景的状态
    handleBattleSceneStatus: function (status) {
        this.model.handleBattleSceneStatus(status)
    },

    // 根据战斗类型请求数据,r如果是切出战斗的话 则 combat_type:BattleConst.Fight_Type.Nil
    send20060: function (combat_type) {
        cc.log("请求切出战斗");
        var protocal = {
            combat_type: combat_type
        }
        this.SendProtocal(20060, protocal);
    },
    //  返回战斗状态,
    handle20060: function (data) {
        // data.combat_type, data.type(0:不存在战斗 1:存在战斗 2:假战斗)
        if (data.combat_type == 0) {     // 这个就是切出战斗,
            this.clearBattleScene();
        } else {

        }
        gcore.GlobalEvent.fire(BattleEvent.COMBAT_TYPE_BACK, data.combat_type, data.type);
    },

    // 战斗结算的,也有可能不需要出结算面板
    scFightEnd: function (data) {
        cc.log("战斗结算的,也有可能不需要出结算面板---",data)
        var is_replay = false;
        if (data.combat_type > 1000){
            data.combat_type = data.combat_type - 1000;
            is_replay = true;
        }
        if(data.combat_type == BattleConst.Fight_Type.Endless){
            var PromptController = require("prompt_controller")
            var PromptTypeConst = require("prompt_type_const")
            PromptController.getInstance().getModel().removePromptDataByTpye(PromptTypeConst.Endless_trail)
        }
        this.model.showWin(data, is_replay);
    },

    // 清理战斗场景,在退出战斗或者战斗结算之后,如果个战斗是剧情副本的战斗,那么就不需要清理掉场景,而是直接切换到假战斗
    clearBattleScene: function () {
        this.model.clearBattleScene();
    },

    // 请求切出战斗
    requestCutOutBattle: function () {
        var BattleConst = require("battle_const");
        this.send20060(BattleConst.Fight_Type.Nil);
    },

    // 战斗初始化数据
    scInitFightStart: function (data) {
        var BattleConst = require("battle_const");
        if (BattleConst.canDoBattle(data.combat_type)) {
            this.model.updateCurBattleData(data, true);

            this.prepareLoaderBattleScene(data.combat_type, 2);
        }
    },

    // 切进战斗
    scReBattleFight: function (data) {
        var BattleConst = require("battle_const");
        if (BattleConst.canDoBattle(data.combat_type)) {
            this.model.updateCurBattleData(data, false);
            this.prepareLoaderBattleScene(data.combat_type, 2);
        }
    },

    // 回合开始的播报
    scRoundFightStart: function (data) {
        Log.info("回合开始播报");
        // cc.log(data);
        this.model.playRoundStart(data);
    },

    // 回合中的播报
    scRoundFightOn: function (data) {
        Log.info("回合播报");
        // cc.log(data);
        this.model.playRoundIn(data);
    },

    // 回合播报结束通知服务端,对应的是20004
    csSkillPlayEnd: function () {
        Log.info("20004 播报完成");
        this.SendProtocal(20005, {});
    },

    // 回合开始播报完成之后,通知服务端,对应的是20002
    csRoundFightEnd: function () {
        Log.info("20002 播报完成");
        this.SendProtocal(20019, {});
    },

    // 战斗初始化完成之后
    csReadyFightStart: function () {
        Log.info("战斗初始化完成,通知服务端可以开始播报了");
        this.SendProtocal(20001, {});
    },

    // 请求跳过战斗
    send20062:function(){
        this.SendProtocal(20062, {});
    },

    handle20062:function(data){
        message(data.msg);
    },

    // 假战斗数据
    handle20061: function (data) {
        cc.log("假战斗数据");
        cc.log(data);
        
        this.hook_model.updateUnrealBattleData(data);
        this.prepareLoaderBattleScene(data.combat_type, 1);
    },

    csRecordBattle: function (replay_id) {
        var protocal = {};
        protocal.replay_id = replay_id;
        this.SendProtocal(20029, protocal);
    },

    // 战斗录像,这里只是记录战斗录像状态
    scRecordBattle: function (data) {
        message(data.msg);
        if (data.code == 1) {
            // ChatController:getInstance():closeChatUseAction()
            this.setWatchReplayStatus(true);
        }
    },

    // 切磋结果返回
    handle20033:function(data){
        if (data.combat_type == null){
            data.combat_type = BattleConst.Fight_Type.PK;
        }
        if (data.show_panel_type == null){
            data.show_panel_type = 1
        }
        this.model.showWin(data);
    },

    // 分享切磋视频
    on20034:function(replay_id,channel,target_name,share_type){
        var protocal = {}
        protocal.replay_id = replay_id
        protocal.channel = channel
        protocal.target_name = target_name
        protocal.share_type = share_type
        this.SendProtocal(20034,protocal)
    },

    handle20034:function(data){
        message(data.msg);
    },

    /**
     * 切换进战斗的唯一接口
     * @param {*} combat_type 
     * @param {*} in_fight_type 0:没有战斗 1:假战斗 2:真战斗
     */
    prepareLoaderBattleScene: function (combat_type, in_fight_type) {
        this.model.createBattleScene(in_fight_type, combat_type);
        // 进入战斗,抛出事件
        if (in_fight_type == 2) {
            gcore.GlobalEvent.fire(EventId.ENTER_FIGHT, combat_type, in_fight_type);
        }
    },

    /**
     * 下一波怪物的入口
     * @param {*} data 
     */
    scRoundNextFight:function(data){
        if (data){
            this.model.upDateNextMon(data);
        }
    },

    // 战斗每一帧更新
    update: function (dt) {
        this.model.mapMovescheduleUpdate();
    },

    // 切换战斗背景移动状态,主要是用于真假剧情战斗切换
    changeMoveMapStatus: function (status) {
        this.model.changeMoveMapStatus()
    },

    // 查看录像返回
    sender_20036: function (replay_id, replay_srv_id) {
        var protocal = {
            replay_id: replay_id,
            replay_srv_id: replay_srv_id,
        }
        this.SendProtocal(20036, protocal);
    },
    handle20036: function (data) {
        if (data.code == 1) {
            this.setWatchReplayStatus(true)
        }
    },

    // 退出战斗
    csFightExit: function () {
        this.SendProtocal(20008, {});
    },
    scFightExit: function (data) {
        message(data.msg);
    },

    // 跳过一队
    csSkipFirstTeam:function(){
        this.SendProtocal(20009, {});
    },

    scSkipFirstTeam:function(data){
        message(data.msg);
    },

    // 是否是观战状态
    getWatchReplayStatus: function () {
        return this.is_watch_replay;
    },

    // 设置观战状态
    setWatchReplayStatus: function (status) {
        this.is_watch_replay = status;
    },

    // 是否是观战或者切磋状态
    getIsClickStatus: function () {
        var combat_type = this.model.getCombatType();
        return this.getWatchReplayStatus() || (combat_type == BattleConst.Fight_Type.PK) || (combat_type == BattleConst.Fight_Type.HeroTestWar);
    },

    setUnlockChapterStatus:function(status){
        this.is_unlock_chapter = status;
    },

    getUnlockChapterStatus:function(){
        return this.is_unlock_chapter;
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

    // 战斗结算界面
    openFinishView: function (status, combat_type, data) {
        if (status == true) {
            if(IS_LOADING == true){
                this.cache_list.push({function:function(status, combat_type, data){
                    this.openFinishView(status, combat_type, data);
                }.bind(this,status, combat_type, data)});
                return;
            }
            if (this.finish_result_view_list[combat_type]) {
                this.finish_result_view_list[combat_type].close();
                this.finish_result_view_list[combat_type] = null;
            }

            if (!this.is_unlock_chapter) {
                if (combat_type == BattleConst.Fight_Type.StarTower) {//试炼塔
                    var StartowerController = require("startower_controller");
                    StartowerController.getInstance().openResultWindow(true, data);
                } else if (combat_type == BattleConst.Fight_Type.Arena) {
                    var ArenaController = require("arena_controller");
                    ArenaController.getInstance().openLoopResultWindow(true, data);
                } else if (combat_type == BattleConst.Fight_Type.Darma && data && data.result == 1) { //剧情副本战斗胜利时
                    //设置不要马上显示升级
                    LevupgradeController.getInstance().waitForOpenLevUpgrade(true)
                    var BattleMvpWindow = require("battle_mvp_window");
                    this.finish_result_view_list[combat_type] = new BattleMvpWindow(data);
                    this.finish_result_view_list[combat_type].open();
                }else if (combat_type == BattleConst.Fight_Type.GuildDun ) {    //公会副本
                    require("guildboss_controller").getInstance().openGuildbossResultWindow(true,data);
                }else if (combat_type == BattleConst.Fight_Type.PK){        // PK
                    this.finish_result_view_list[combat_type] = Utils.createClass("battle_pk_result_window");
                    this.finish_result_view_list[combat_type].open(data)
                }else {
                    if (!this.finish_result_view_list[combat_type]) {
                        if (data.result == 1) {
                            //设置不要马上显示升级
                            LevupgradeController.getInstance().waitForOpenLevUpgrade(true)
                            
                            var BattleResultView = require("battle_result_window");
                            this.finish_result_view_list[combat_type] = new BattleResultView(data.result, combat_type);
                            this.finish_result_view_list[combat_type].open({data:data,fight_type: combat_type});
                        } else {
                            cc.log("打开失败界面")
                            this.openFailFinishView(true, combat_type, data.result, data);
                        }
                    }
                }
            }
        } else {
            if (this.finish_result_view_list[combat_type]) {
                this.finish_result_view_list[combat_type].close();
                this.finish_result_view_list[combat_type] = null;
            }
        }

    },

    getFinishView: function(combat_type) {
        if (this.finish_result_view_list) {
            return this.finish_result_view_list[combat_type]
        }
    },

    //打开战斗伤害统计界面
    openBattleHarmInfoView: function (status, data) {
        if (status == true) {
            if (this.harm_info_view == null) {
                this.harm_info_view = Utils.createClass("battle_harm_info_window");
            }
            this.harm_info_view.open(data);
        } else {
            if (this.harm_info_view) {
                this.harm_info_view.close();
                this.harm_info_view = null;
            }
        }
    },

    //失败结算界面
    openFailFinishView: function (status, combat_type, result, data) {
        if (status == true) {
            //如果是在剧情中,则不需要弹出这些
            // if(require("guide_controller").getInstance().isInGuide())return
            if (!this.is_unlock_chapter) {
                if (!this.finish_fail_view_list[combat_type]) {
                    //设置不要马上显示升级
                    LevupgradeController.getInstance().waitForOpenLevUpgrade(true)

                    var BattleFailView = require("battle_fail_window");
                    var finish_view = new BattleFailView(combat_type, result, data);
                    if (finish_view) {
                        finish_view.open();
                    }
                    this.finish_fail_view_list[combat_type] = finish_view;
                }
            } else {
                if (MainuiController.getInstance().checkIsInDramaUIFight()) {
                    this.battle_controller.send20060(BattleConst.Fight_Type.Darma);
                }
            }
        } else {
            if (this.finish_fail_view_list[combat_type]) {
                this.finish_fail_view_list[combat_type].close();
                this.finish_fail_view_list[combat_type] = null;
            }
        }
    },

    //获取是否相同的战斗类型
    getIsSameBattleType: function (combat_type) {
        return combat_type == this.model.getCombatType();
    },
    // -- 打开阵营详细面板
    openBattleCampView( status, form_id ){
        if(status == true ){
            if(!this.battle_camp_view){
                let BattleCampView = require("battle_camp_window")
                this.battle_camp_view = new BattleCampView()
            }
            if(this.battle_camp_view.isOpen() == false){
                this.battle_camp_view.open(form_id)
            }
        }else{
            if(this.battle_camp_view){
                this.battle_camp_view.close()
                this.battle_camp_view = null
            }
        }
    },

    // 记录是否为假战斗的战斗
    setIsNormaBattle: function(status) {
         this.is_normal_battle = status;        
    },

    // 是否是假战斗....
    getIsNoramalBattle: function() {
        return this.is_normal_battle; 
    },

    // 改变战斗速度
    csFightSpeed:function(speed){
        var protocal = {}
        protocal.speed = speed;
        this.SendProtocal(20022, protocal);
    },

    scFightSpeed:function(data){
        message(data.msg);
    },
 
    getCtrlBattleScene: function(cal_back) {
        var battle_scen = this.model.getBattleScene();
        cal_back(battle_scen);
    },

    getDramaFightUI: function(finish_cb) {
        if (finish_cb) {
            finish_cb(this.model.getDramaFightUI());
        } else {
            if (this.model)
                return this.model.getDramaFightUI();
        }
    },

    // ---------------------切磋请求
    csBattlePk: function (target_id, target_srv_id, is_province) {
        var protocal = {};
        protocal.target_id = target_id;
        protocal.target_srv_id = target_srv_id;
        protocal.is_province = is_province;
        this.SendProtocal(20014, protocal);
    },

    scBattlePk:function(data){
        message(data.msg);
        require("chat_controller").getInstance().closeChatPanel(false);
        require("friend_controller").getInstance().openFriendCheckPanel(false);
    },

    // 被切磋对象,在18600收到提示之后,调用这个接口同意或者取消掉
    confirmBattlePk:function(promptVo){

    },

    // 被切磋对象,同意切磋或者拒绝切磋
    csBattlePkRe:function(bool,data){
        var protocal = {};
        protocal.target_id = data.target_id;
        protocal.target_srv_id = data.target_srv_id;
        protocal.is_agree = bool ? 1 : 0;
        this.SendProtocal(20015, protocal);
    },

    scBattlePkRe:function(data){
        message(data.msg);
    },

    // 目标这统一了自己发起的请求.这时候自己的二次确认
    scBattlePkTwice:function(data){
        if(data){
            if( ! this.isInFight()){
                var accept_fun = function(){
                    this.csBattlePkTwiceConfirm(true, {target_srv_id: data.target_srv_id, target_id: data.target_id});
                }.bind(this);
                var refuse_fun = function(){
                    this.csBattlePkTwiceConfirm(false, {target_srv_id: data.target_srv_id, target_id: data.target_id});
                }.bind(this);
                var desc = cc.js.formatStr(Utils.TI18N("玩家<color=#0x249015>%s</color>同意了你的切磋请求,点击”立即切磋“立即进入切磋战斗？"), data.target_name || "");
                require("commonalert").show(desc, Utils.TI18N("立即切磋"), accept_fun, Utils.TI18N("取消"), refuse_fun);
            }
        }
    },

    // 发起者同意进战斗或者拒绝
    csBattlePkTwiceConfirm: function (bool, data) {
        var protocal = {};
        protocal.target_id = data.target_id;
        protocal.target_srv_id = data.target_srv_id;
        protocal.is_agree = bool ? 1 : 0;;
        this.SendProtocal(20016, protocal);
    },
    //  打开BUFF確認界面
    openBattleBuffInfoView(status, left_name, right_name){
        if(status == true){
            if(this.buff_info_view == null){
                var BattleBuffInfoView = require("battle_buff_info_window")
                this.buff_info_view = new BattleBuffInfoView()
            }
            if(this.buff_info_view.isOpen() == false){
                this.buff_info_view.open({left_name:left_name,right_name:right_name})
            }
        }else{
            if(this.buff_info_view){
                this.buff_info_view.close()
                this.buff_info_view = null
            }
        }
    },
    // - 更新buff列表界面数据
    updateBattleBuffListView( data, group, partner_bid ){
        if(this.buff_list_view && this.buff_list_view.checkIsChosedBuffList(group, partner_bid)){
            this.buff_list_view.setData(data)
        }
    },
    // -- 打开buff列表界面
    openBattleBuffListView( status, data, group, partner_bid ){
        if(status == true){
            if(this.buff_list_view == null){
                var BattleBuffListView = require("battle_buff_list_window")
                this.buff_list_view = new BattleBuffListView()
            }
            if(this.buff_list_view.isOpen() == false){
                this.buff_list_view.open({data:data, group:group, partner_bid:partner_bid})
            }
        }else{
            if(this.buff_list_view){
                this.buff_list_view.close()
                this.buff_list_view = null
            }
        }
    }
});

module.exports = BattleController;
