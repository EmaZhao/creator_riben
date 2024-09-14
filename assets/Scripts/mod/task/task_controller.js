// ////////////////////////////////////////////////////////////////////
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      任务，日常，成就
// <br/>Create: 2019-01-09 11:26:10
// ////////////////////////////////////////////////////////////////////
var RoleController = require("role_controller");
var TaskConst = require("task_const");
var MainuiConst = require("mainui_const");
var MainuiController = require("mainui_controller");
var JumpController = require("jump_controller");

var TaskController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var TaskModel = require("task_model");
        this.model = new TaskModel(this);
        this.model.initConfig();
        this.successRewardList = [];
        this.status = false;//是否是一键领取
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.init_quest_event == null) {
            this.init_quest_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                gcore.GlobalEvent.unbind(this.init_quest_event);
                this.init_quest_event = null;

                if (this.notice_view == null) {
                    var TaskNoticeView = require("task_notice_view");
                    this.notice_view = new TaskNoticeView();
                    this.notice_view.open();
                }

                //角色更新之后请求3条任务相关数据
                // this.requestBaseQuestData();

                this.role_vo = RoleController.getInstance().getRoleVo();
                if (this.role_assets_event == null) {
                    this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                        if (key == "activity")
                            this.model.checkQuestAndFeatStatus(TaskConst.update_type.activity);
                    }.bind(this))
                }
            }.bind(this))
        }


        if (this.re_link_game_event == null) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function () {
                var GuideController = require("guide_controller");
                if (!GuideController.getInstance().isInGuide())
                    this.openTaskMainWindow(false);
                // this.requestBaseQuestData();
            }.bind(this))
        }
    },

    requestBaseQuestData: function () {
        this.SendProtocal(10400, {});                //请求所有任务列表
        this.SendProtocal(16400, {});                //请求当前所有的成就列表
        this.requestActivityInfo();                //请求活跃度
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(10400, this.on10400);         //全部任务列表
        this.RegisterProtocal(10403, this.on10403)             //增加已接任务
        this.RegisterProtocal(10406, this.on10406)             //提交任务返回，客户端自己更新内存缓存数据
        this.RegisterProtocal(10409, this.on10409)             //更新已接任务进度

        this.RegisterProtocal(16400, this.on16400)             //全部成就列表
        this.RegisterProtocal(16401, this.on16401)             //更新成就进度，也可能是新增成就
        this.RegisterProtocal(16402, this.on16402)             //提交成就返回

        this.RegisterProtocal(20300, this.on20300)             //已领取的活跃宝箱
        this.RegisterProtocal(20301, this.on20301)             //请求领取活跃宝箱

        //新主线
        this.RegisterProtocal(30001, this.on30001)             //进度更新时返回
        this.RegisterProtocal(30002, this.on30002)             //提交任务返回
    },

    // @desc:打开日常任务主界面
    // author:{author}
    // time:2018-05-22 11:32:35
    // //@status:打开或者关闭
    // //@index:自动跳转到
    // return
    openTaskMainWindow: function (status, index) {
        if (status == false) {
            if (this.task_main_window != null) {
                this.task_main_window.close();
                this.task_main_window = null;
            }
        } else {
            if (this.task_main_window == null) {
                var TaskMainWindow = require("task_main_window");
                this.task_main_window = new TaskMainWindow();
            }
            // if (this.task_main_window.isOpen() == false)
            //     this.task_main_window.open(index);
            this.task_main_window.open(index);
        }
    },

    // @desc:点击任务前往
    // author:{author}
    // time:2018-05-22 21:00:26
    // //@data:
    // //@index:
    // //@open_type: 
    // return
    handleTaskProgress: function (data, index, open_type) {
        index = index || 1;
        if (data.config.progress == null || Utils.next(data.config.progress) == null) {
            if (data.id != null)
                cc.log("=================> 处理任务进度时出错,任务id为 " + data.id + " 的没有配置任务进度");
            return
        }
        var progressConfig = data.config.progress[index];
        if (progressConfig == null) {
            if (data.id != null)
                cc.log("=================> 处理任务id为 " + data.id + " 的第 " + index + " 个进度要求时出错");
            return
        }

        //拓展参数用于跳转
        var extra = data.config.extra;
        this.gotoTagertFun(progressConfig, extra, open_type);
    },

    //desc:任务和成就的跳转
    //time:2018-07-07 03:57:59
    //@progressConfig:
    //@extra:
    //@open_type:
    //@return 
    gotoTagertFun: function (progressConfig, extra, open_type) {
        // this.openTaskMainWindow(false)
        if (progressConfig == null)
            return
        var _progress = Config.quest_data.data_progress_lable;

        if (progressConfig.cli_label == _progress.evt_recruit) {  //进行X次英雄召唤
            JumpController.getInstance().jumpViewByEvtData([1]);
        } else if (progressConfig.cli_label == _progress.evt_partner) {       //获得1个SS英雄2.获得XX个英雄3.集齐冰雪领域（图书馆XX类型收集）的所有英雄4.获得XX个SS英雄
            if (extra && Utils.next(extra)) {
                var extra_type = extra[0];
                var extra_val = extra[1];
                JumpController.getInstance().jumpViewByEvtData([2, extra_type, extra_val]);
            } else {
                var PartnersummonController = require("partnersummon_controller");
                PartnersummonController.getInstance().openPartnerSummonWindow(true);
            }
        } else if (progressConfig.cli_label == _progress.evt_arena_fight ||         //竞技场挑战X次（无论成败）
            progressConfig.cli_label == _progress.evt_arena_fight_result ||         //竞技场挑战胜利X次
            progressConfig.cli_label == _progress.evt_arena_score ||                //竞技场
            progressConfig.cli_label == _progress.evt_arena_rank) {                 //竞技场排行达到前XX名
            JumpController.getInstance().jumpViewByEvtData([3]);
        } else if (progressConfig.cli_label == _progress.evt_friend_present || //向好友赠送
            progressConfig.cli_label == _progress.evt_friend) { //拥有XX个好友
            JumpController.getInstance().jumpViewByEvtData([4]);
        }
        else if (progressConfig.cli_label == _progress.evt_dungeon_pass) { //通过指定副本id
            JumpController.getInstance().jumpViewByEvtData([5]);
        }
        else if (progressConfig.cli_label == _progress.evt_levup ||   //人物角色达到XX级
            progressConfig.cli_label == _progress.evt_get_item ||   // 获得一个物品
            progressConfig.cli_label == _progress.evt_dungeon_enter) { //每日挑战X次地下城副本
            JumpController.getInstance().jumpViewByEvtData([5]);
        } else if (progressConfig.cli_label == _progress.evt_loss_silver_coin) {//累计消耗xx银币    elseif progressConfig.cli_label == _progress.evt_loss_coin then --累计消耗xx金币,
            JumpController.getInstance().jumpViewByEvtData([6]);
        } else if (progressConfig.cli_label == _progress.evt_gain_gold) { //拥有xx蓝钻
            JumpController.getInstance().jumpViewByEvtData([7]);
        } else if (progressConfig.cli_label == _progress.evt_eqm_sell) { //装备熔炼
            JumpController.getInstance().jumpViewByEvtData([8]);
        } else if (progressConfig.cli_label == _progress.evt_say) { //世界聊天
            JumpController.getInstance().jumpViewByEvtData([9]);
        } else if (progressConfig.cli_label == _progress.evt_friend_sns) { //私聊
            JumpController.getInstance().jumpViewByEvtData([10]);
        } else if (progressConfig.cli_label == _progress.evt_dungeon_fast_combat) { //快速作战X次
            JumpController.getInstance().jumpViewByEvtData([11]);
        } else if (progressConfig.cli_label == _progress.evt_adventure_explore || //探险X间未探索的房间
            progressConfig.cli_label == _progress.evt_adventure_plunder || //任意掠夺他人X次（无论成败
            progressConfig.cli_label == _progress.evt_adventure_goto_floor || //进入神界冒险第X层
            progressConfig.cli_label == _progress.evt_adventure_box || //开启宝箱XX次(宝箱总数)7.宝箱开出X次神器
            progressConfig.cli_label == _progress.evt_adventure_finger_guessing || //猜拳累计获胜X次8.猜拳累计失败X次
            progressConfig.cli_label == _progress.evt_adventure_answer_all_right || //智力大乱斗答题全对累计X次
            progressConfig.cli_label == _progress.evt_adventure_plunder_result || //累计成功掠夺X次
            progressConfig.cli_label == _progress.evt_adventure_kill_mon) { //累计击败小怪X次
        } else if (progressConfig.cli_label == _progress.evt_boss_fight || //挑战X次个人BOSS
            progressConfig.cli_label == _progress.evt_boss_fight_result) { //击败XX级个人BOSS（指定类)

        } else if (progressConfig.cli_label == _progress.evt_world_boss_fight || //挑战X次世界BOSS3.累计挑战XX次世界BOSS
            progressConfig.cli_label == _progress.evt_world_boss_fight_ko) {   //完成一次任意世界BOSS的击杀（最后一击）

        } else if (progressConfig.cli_label == _progress.evt_star_tower_pass) { //扫荡或挑战星命塔任意一层X次
            JumpController.getInstance().jumpViewByEvtData([12]);
        } else if (progressConfig.cli_label == _progress.evt_guild_dun_fight || //挑战任意公会bossX次
            progressConfig.cli_label == _progress.evt_guild_dun_fight_ko) { //对公会Boss的最后一击达到x次
            JumpController.getInstance().jumpViewByEvtData([31]);
        } else if (progressConfig.cli_label == _progress.evt_guild_donate) { //2.公会任意种类捐献X次3.公会XX类型捐献达到X次4.公会所以类型捐献总共达到XX次
            JumpController.getInstance().jumpViewByEvtData([13]);
        } else if (progressConfig.cli_label == _progress.evt_partner_enchant_eqm || //精炼装备X次
            progressConfig.cli_label == _progress.evt_partner_levelup || //升级英雄X次
            progressConfig.cli_label == _progress.evt_partner_eqm || //装备X套橙色装备（即武器、衣服、头盔、鞋子都为橙色）
            progressConfig.cli_label == _progress.evt_partner_artifact || //装备1件神器
            progressConfig.cli_label == _progress.evt_eqm_compound) { //进阶x装备
            JumpController.getInstance().jumpViewByEvtData([19]);
        } else if (progressConfig.cli_label == _progress.evt_star_divination) { //任意进行X次观星（普通观星和皇家观星）
            AuguryController.getInstance().openMainView(true)
        } else if (progressConfig.cli_label == _progress.evt_dungeon_auto) { //扫荡剧情副本
            JumpController.getInstance().jumpViewByEvtData([5]);
        } else if (progressConfig.cli_label == _progress.evt_guild_join) { //加入一个公会
            JumpController.getInstance().jumpViewByEvtData([14]);
        } else if (progressConfig.cli_label == _progress.evt_gain_guild) { //公会贡献达到
            JumpController.getInstance().jumpViewByEvtData([14]);
        } else if (progressConfig.cli_label == _progress.evt_loss_guild) { //累计消耗XX贡献点
            JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.UnionShop]);
        } else if (progressConfig.cli_label == _progress.evt_power) { //战力达到多少
            JumpController.getInstance().jumpViewByEvtData([16]);
        } else if (progressConfig.cli_label == _progress.evt_star_natal || //集齐X套星命3.装备X套紫/红/橙命格
            progressConfig.cli_label == _progress.evt_star_level_up || //X套星命升到X级
            progressConfig.cli_label == _progress.evt_star_natal_level_up) { //X个红色命格升星到X星
            StarlifeController.getInstance().openMainView(true)
        } else if (progressConfig.cli_label == _progress.evt_formation_open || //已学习的阵法达到X个
            progressConfig.cli_label == _progress.evt_formation_level_up) { //X个阵法达到X级
        } else if (progressConfig.cli_label == _progress.evt_dungeon_stone_fight) { //1.参与x次宝石副本2.参与x次圣器副本,
            JumpController.getInstance().jumpViewByEvtData([17]);
        } else if (progressConfig.cli_label == _progress.evt_shipping) { //参与远航,
            JumpController.getInstance().jumpViewByEvtData([18]);
        } else if (progressConfig.cli_label == _progress.evt_escort_enter || progressConfig.cli_label == _progress.evt_escort_fight) { // 萌兽
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.escort)
        } else if (progressConfig.cli_label == _progress.evt_endless_fight) { // 无尽试炼
            JumpController.getInstance().jumpViewByEvtData([43]);
        } else if (progressConfig.cli_label == _progress.evt_mystery_buy) { // 打开商城
            var MallController = require("mall_controller");
            if (progressConfig.target == 1) {
                JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.GodShop]);
            } else if (progressConfig.target == 2) {
                JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.Recovery]);
            } else if (progressConfig.target == 3) {
                JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.ScoreShop]);
            } else if (progressConfig.target == 4) { // 杂货店
                JumpController.getInstance().jumpViewByEvtData([6]);
            } else {
                JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.Recovery]);
            }
        } else if (progressConfig.cli_label == _progress.evt_partner_star) { // 打开英雄主界面升星
            JumpController.getInstance().jumpViewByEvtData([19]);
        } else if (progressConfig.cli_label == _progress.evt_hallows_all_step || progressConfig.cli_label == _progress.evt_hallows_step || progressConfig.cli_label == _progress.evt_hallows_activate) { // 打开提升圣器
            JumpController.getInstance().jumpViewByEvtData([20]);
        } else if (progressConfig.cli_label == _progress.evt_guild_war) { // 打开公会站
            JumpController.getInstance().jumpViewByEvtData([21]);
        } else if (progressConfig.cli_label == _progress.evt_endless_pass) { // 打开无尽之塔
            Endless_trailController.getInstance().openEndlessMainWindow(true)
        } else if (progressConfig.cli_label == _progress.evt_partner_decompose) { // 祭祀小屋
            JumpController.getInstance().jumpViewByEvtData([22]);
        } else if (progressConfig.cli_label == _progress.evt_partner_star_up) { // 融合祭坛
            JumpController.getInstance().jumpViewByEvtData([23]);
        } else if (progressConfig.cli_label == _progress.evt_star_tower_floor_pass) { // 试练塔
            JumpController.getInstance().jumpViewByEvtData([12]);
        } else if (progressConfig.cli_label == _progress.evt_recruit_high) { // 先知殿 
            JumpController.getInstance().jumpViewByEvtData([24]);
        } else if (progressConfig.cli_label == _progress.evt_expedition_fight) {//远征
            JumpController.getInstance().jumpViewByEvtData([25]);
        } else if (progressConfig.cli_label == _progress.evt_primus_fight) {//星河
            JumpController.getInstance().jumpViewByEvtData([27]);
        } else if (progressConfig.cli_label == _progress.evt_equipment_compound) {//锻造
            JumpController.getInstance().jumpViewByEvtData([26]);
        } else if (progressConfig.cli_label == _progress.evt_fragment_synthesis) {//背包碎片页签
            JumpController.getInstance().jumpViewByEvtData([8, 3]);
        } else if (progressConfig.cli_label == _progress.evt_dungeon_ext_reward) {//通关奖励
            JumpController.getInstance().jumpViewByEvtData([46]);
        } else if (progressConfig.cli_label == _progress.evt_artifact_compose) {//符文锻造
            JumpController.getInstance().jumpViewByEvtData([26,2]);
        }
    },


    ///---------------------------任务相关 start
    on10400: function (data) {
        this.model.addTaskList(data.quest_list, false, true);
    },

    on10403: function (data) {
        this.model.addTaskList(data.quest_list);
    },

    on10409: function (data) {
        this.model.addTaskList(data.quest_list, true);
    },

    on10406: function (data) {
        message(data.msg);
        
        if (data.flag == 1){
            if(this.status){
                var infoData = null;
                infoData = this.model.getTaskById(data.id)  
                if(infoData){
                  for(let index in infoData.config.commit_rewards){
                    var info = infoData.config.commit_rewards[index]
                    var params = {}
                    params.bid = info[0];
                    params.num = info[1];
                    let i  = this.successRewardList.indexOf(params);
                    if(i == -1){
                      this.successRewardList.push(params);
                    }
                    if(this.RewardListNum>0 && index == infoData.config.commit_rewards.length -1){
                      this.RewardListNum --;
                      if(this.RewardListNum == 0){
                        this.openRewardPopup();
                        if(this.task_main_window){
                          this.task_main_window.refreshRewardBtn(1);
                        }
                      }
                    }
                  }
                }
            }else{
              if(this.task_main_window){
                this.task_main_window.refreshRewardBtn(1);
              }
            }
            this.model.setTaskCompleted(data.id);
        } 
        
    },

    openRewardPopup:function(){
      if(this.successRewardList.length>0){
        var list = [];
        for(let index in this.successRewardList){
          var data = this.successRewardList[index];
          if(list.length==0){
            list.push(data)
            continue;
          }
          var bChange =false;
          for(let i in list){
            var info = list[i];
            if(info.bid == data.bid){
              info.num += data.num;
              bChange =true;
            }
            if(i == list.length-1){
              if(!bChange){
                list.push(data);
              }
            }
          }
        }
        var controller = require("mainui_controller").getInstance();
        controller.openGetItemView(true,list);
        this.successRewardList = [];
      }
    },

    requestSubmitTask: function (id,status) {
        if(status == true){
          this.status = true;
          // this.RewardListNum ++;
        }else{
          this.status = false;
          this.RewardListNum = 0;
        }
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(10406, protocal);
    },

    //------------------------任务相关 end

    //------------------------成就相关 start
    on16400: function (data) {
        this.model.addFeatList(data.feat_list, false, true);
    },
    on16401: function (data) {
        this.model.addFeatList(data.feat_list, true);
    },

    on16402: function (data) {
        message(data.msg);
        // if(this.task_main_window){
        //   this.task_main_window.refreshRewardBtn(2);
        // }
        if (data.code == 1) {
            if(this.status){
              var infoData = null;
              // infoData = this.model.getTaskById(data.id)  
              infoData = this.model.getFeatById(data.id) 
              if(infoData){
                for(let index in infoData.config.commit_rewards){
                  var info = infoData.config.commit_rewards[index]
                  var params = {}
                  params.bid = info[0];
                  params.num = info[1];
                  let i  = this.successRewardList.indexOf(params);
                  if(i == -1){
                    this.successRewardList.push(params);
                  }
                  if(this.RewardListNum>0 && index == infoData.config.commit_rewards.length -1){
                    this.RewardListNum --;
                    if(this.RewardListNum == 0){
                      this.openRewardPopup();
                      if(this.task_main_window){
                        this.task_main_window.refreshRewardBtn(1);
                      }
                    }
                  }
                }
              }
            }else{
              if(this.task_main_window){
                this.task_main_window.refreshRewardBtn(1);
              }
            }
            this.model.setFeatCompleted(data.id);
        }
    },

    requestSubmitFeat: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(16402, protocal);
    },
    //------------------------成就相关 end

    //------------------------活跃度相关 start
    requestActivityInfo: function () {
        this.SendProtocal(20300, {});
    },

    on20300: function (data) {
        this.model.updateActivityData(data.activity_box);
    },

    requestGetActivityAwards: function (activity) {
        var proto = {}
        proto.activity = activity
        this.SendProtocal(20301, proto);
    },

    on20301: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.model.updateSingleActivityData(data.activity);
    },
    //------------------------活跃度相关 end


    //-----------------------新主线 

    send30001: function () {
        this.SendProtocal(30001, {});
    },

    on30001: function (data) {
        cc.log("30001", data);
        this.model.setMainTaskData(data);
    },

    send30002: function (task_id) {
        let proto = {};
        proto.id = task_id;
        this.SendProtocal(30002, proto);
    },

    on30002: function (data) {
        cc.log("3002", data);
        message(data.msg);
        if (data.code == 1) {

        }
    }
});

module.exports = TaskController;