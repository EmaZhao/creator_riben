// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里统一处理跳转
// <br/>Create: 2019-04-10 17:31:58
// --------------------------------------------------------------------
var JumpController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        
    },

    /**
     *  跳转
     * 	evt_data[0]: 为跳转id
     * 	evt_data[1]: 2及之后都为扩展参数
     */
    jumpViewByEvtData:function( evt_data ){

        if(!evt_data || !evt_data[0])return;
        var evt_id = Number(evt_data[0]);
        if(evt_id == 1){//召唤
            var PartnersummonController = require("partnersummon_controller");
            PartnersummonController.getInstance().openPartnerSummonWindow(true);
        }else if(evt_id == 2){//获取一个x星英雄
            var PartnersummonController = require("partnersummon_controller");
            if(evt_data && Utils.next(evt_data)){
                var extra_type = evt_data[1]
                var extra_val = evt_data[2]
                if(extra_type == "star"){
                    if(extra_val <= 5){//小于等于5星打开召唤界面
                        PartnersummonController.getInstance().openPartnerSummonWindow(true);
                    }else{//大于5星打开融合界面
                        var HeroController = require("hero_controller");
                        HeroController.getInstance().openHeroUpgradeStarFuseWindow(true);
                    }
                }else if(extra_type == "lev"){//跳转到英雄界面
                    var hero_controller = require("hero_controller").getInstance();
                    hero_controller.openHeroBagWindow(true);
                }else{
                    PartnersummonController.getInstance().openPartnerSummonWindow(true);
                }
            }else{
                PartnersummonController.getInstance().openPartnerSummonWindow(true);
            }
        }else if(evt_id == 3){//竞技场
            var ArenaController = require("arena_controller");
            ArenaController.getInstance().requestOpenArenWindow(true);
        }else if(evt_id == 4){//好友
            var FriendController = require("friend_controller");
            var FriendConst = require("friend_const");
            FriendController.getInstance().openFriendWindow(true, FriendConst.Type.MyFriend)
        }else if(evt_id == 5){//剧情副本
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.drama_scene);
        }else if(evt_id == 6){//精灵商店
            var MallController = require("mall_controller");
            MallController.getInstance().openVarietyStoreWindows(true);
        }else if(evt_id == 7){//VIP界面
            var tab_type = evt_data[1] || VIPTABCONST.VIP
            var sub_type = evt_data[2]
            var VipController = require("vip_controller");
            VipController.getInstance().openVipMainWindow(true, tab_type, sub_type)
        }else if(evt_id == 8){//背包
            var sub_type = evt_data[1];
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.backpack, sub_type)
        }else if(evt_id == 9){//聊天界面
            var ChatConst = require("chat_const");
            var ChatController = require("chat_controller");
            var channel = evt_data[1] || ChatConst.Channel.World
		    ChatController.getInstance().openChatPanel(channel);
        }else if(evt_id == 10){//私聊
            var ChatController = require("chat_controller");
            var ChatConst = require("chat_const");
            ChatController.getInstance().openChatPanel(ChatConst.Channel.Friend,"friend")
        }else if(evt_id == 11){//快速作战
            var BattleDramaController = require("battle_drama_controller");
            BattleDramaController.getInstance().openDramBattleQuickView(true);
        }else if(evt_id == 12){//星命塔
            var Battleconst = require("battle_const");
            require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(Battleconst.Fight_Type.StarTower);
        }else if(evt_id == 13){//公会捐献
            var RoleController = require("role_controller")
            var role_vo = RoleController.getInstance().getRoleVo();
            if(role_vo.isHasGuild()){
                var GuildController = require("guild_controller");
                GuildController.getInstance().openGuildDonateWindow(true);
            }else{
                var MainuiController    = require("mainui_controller");
                var MainuiConst = require("mainui_const");
                MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.guild)
            }
        }else if(evt_id == 14){//公会
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.guild);
        }else if(evt_id == 15){//商城
            var mall_type = evt_data[1];
            var bid = evt_data[2];
            var MallController = require("mall_controller");
            MallController.getInstance().openMallPanel(true, mall_type, bid)
        }else if(evt_id == 16){//变强
            var StrongerController = require("stronger_controller")
            StrongerController.getInstance().openMainWin(true);
        }else if(evt_id == 17){//历练
            // var MainuiController    = require("mainui_controller");
            // var MainuiConst = require("mainui_const");
            // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.esecsice, MainuiConst.sub_type.dungeonstone);
            var EsecsiceController = require("esecsice_controller");
            var EsecsiceConst = require("esecsice_const");
            EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.stonedungeon);
        }else if(evt_id == 18){//远航
            var VoyageController = require("voyage_controller")
            VoyageController.getInstance().openVoyageMainWindow(true)
        }else if(evt_id == 19){//英雄背包
            var sub_type = evt_data[1]
            var MainuiController    = require("mainui_controller");
            // var MainuiConst = require("mainui_const");
            // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner, sub_type);
            var hero_controller = require("hero_controller").getInstance();
            hero_controller.openHeroBagWindow(true);
        }else if(evt_id == 20){//神器界面
            var controller = require("hallows_controller").getInstance();
            controller.openHallowsMainWindow(true);
        }else if(evt_id == 21){//公会战
            // var is_open = GuildwarController.getInstance().checkIsCanOpenGuildWarWindow()
            // if(is_open == true){
            //     var guildwar_status = GuildwarController.getInstance().getModel().getGuildWarStatus();
            //     if(guildwar_status == GuildwarConst.status.processing || guildwar_status == GuildwarConst.status.settlement){
            //         var MainuiController    = require("mainui_controller");
            //         var MainuiConst = require("mainui_const");
            //         MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.guildwar)
            //     }else{
            //         message(TI18N("公会战尚未开启"))
            //     }
            // }
        }else if(evt_id == 22){//祭祀小屋
            var HeroController = require("hero_controller");
            HeroController.getInstance().openHeroResetWindow(true);
        }else if(evt_id == 23){//融合祭坛
            var HeroController = require("hero_controller");
            HeroController.getInstance().openHeroUpgradeStarFuseWindow(true)
        }else if(evt_id == 24){//先知殿
            var seerpalace = require("seerpalace_controller").getInstance();
            seerpalace.openSeerpalaceMainWindow(true);
        }else if(evt_id == 25){//远征
            var EsecsiceController = require("esecsice_controller");
            var EsecsiceConst = require("esecsice_const");
            EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.heroexpedit);
        }else if(evt_id == 26){//锻造屋
          var controller = require("forgehouse_controller")
          controller.getInstance().openForgeHouseView(true);
        }else if(evt_id == 27){//星河神殿
            // var MainuiController    = require("mainui_controller");
            // var MainuiConst = require("mainui_const");
            // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.primuswar)
            var EsecsiceConst = require("esecsice_const");
            var EsecsiceController = require("esecsice_controller");
            EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.honourfane);
        }else if(evt_id == 28){//精英大赛
            // MainuiController:getInstance():changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.eliteMatchWar)
        }else if(evt_id == 29){//跨服天梯
            // MainuiController:getInstance():changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.ladderwar)
        }else if(evt_id == 30){//布阵阵法
            var HeroController = require("hero_controller");
            HeroController.getInstance().openFormMainWindow(true);
        }else if(evt_id == 31){//公会副本//公会活跃界面 一起处理了
            var RoleController = require("role_controller")
            var MainuiController    = require("mainui_controller");
            var role_vo = RoleController.getInstance().getRoleVo();
            if(role_vo.isHasGuild()){
                if(evt_data[1] == 172){
                  if (role_vo != null) {
                    var lev = gdata("guild_quest_data", "data_guild_action_data", "open_glev").val;
                    if (role_vo.guild_lev >= lev){
                      require("guild_controller").getInstance().openGuildActionGoalWindow(true);
                    }
                    else{
                      message(cc.js.formatStr(Utils.TI18N("联盟达到%d级后开启"), lev));
                    }
                }
                }else{
                  var BattleConst = require("battle_const");
                  MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.GuildDun)
                }
            }else{
                var MainuiConst = require("mainui_const");
                MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.guild)
            }
        }else if(evt_id == 32){//公会技能
            var RoleController = require("role_controller")
            var role_vo = RoleController.getInstance().getRoleVo();
            if(role_vo.isHasGuild()){
                var GuildskillController = require("guildskill_controller");
                GuildskillController.getInstance().openGuildSkillMainWindow(true)
            }else{
                var MainuiController    = require("mainui_controller");
                var MainuiConst = require("mainui_const");
                MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.guild)
            }
        }else if(evt_id == 33){//公会红包
            var RoleController = require("role_controller")
            var role_vo = RoleController.getInstance().getRoleVo();
            if(role_vo.isHasGuild()){
                var RedbagController = require("redbag_controller");
                RedbagController.getInstance().openMainView(true)
            }else{
                var MainuiController    = require("mainui_controller");
                var MainuiConst = require("mainui_const");
                MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.guild)
            }
        }else if(evt_id == 34){//神界冒险
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.adventure);
        }else if(evt_id == 35){//点金
            var ExchangeController = require("exchange_controller");
            ExchangeController.getInstance().openExchangeMainView(true);
        }else if(evt_id == 36){//冠军赛
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.champion_call);
        }else if(evt_id == 37){//天梯商店
            // local is_open = LadderController:getInstance():getModel():getLadderOpenStatus()
            // if is_open then
            //     LadderController:getInstance():requestLadderMyBaseInfo()
            //     LadderController:getInstance():openLadderShopWindow(true)
            // end
        }else if(evt_id == 38){//投资计划
            var WelfareController = require("welfare_controller");
            var ActionConst = require("action_const");
            WelfareController.getInstance().openMainWindow(true, ActionConst.ActionSpecialID.invest)
        }else if(evt_id == 39){//成长基金
            var WelfareController = require("welfare_controller");
            var ActionConst = require("action_const");
            WelfareController.getInstance().openMainWindow(true, ActionConst.ActionSpecialID.growfund)
        }else if(evt_id == 40){//探宝
            var ActionController = require("action_controller");
            ActionController.getInstance().openLuckyTreasureWin(true);
        }else if(evt_id == 41){//日常（任务或成就）
            var sub_type = evt_data[1]
            var TaskController = require("task_controller");
            TaskController.getInstance().openTaskMainWindow(true, sub_type);
        }else if(evt_id == 42){//元素圣殿
            // MainuiController:getInstance():changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.elementWar)
        }else if(evt_id == 43){//无尽试炼
            // var MainuiController    = require("mainui_controller");
            var EsecsiceController = require("esecsice_controller");
            var EsecsiceConst = require("esecsice_const");
            EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.endless);
            // var MainuiConst = require("mainui_const");
            // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.endless);
        }else if(evt_id == 44){//至尊月卡
            var WelfareController = require("welfare_controller");
            var WelfareConst = require("welfare_const");
            WelfareController.getInstance().openMainWindow(true,WelfareConst.WelfareIcon.supre_yueka);
        }else if(evt_id == 45){//限时召唤
            var extend_data = evt_data[1];
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.wonderful, extend_data)
        }else if(evt_id == 46){//剧情副本的通关奖励
            var BattleDramaController = require("battle_drama_controller");
            BattleDramaController.getInstance().openDramaRewardWindow(true);
        }
    },

    
    __delete:function(){
   
    },
});


module.exports = JumpController;