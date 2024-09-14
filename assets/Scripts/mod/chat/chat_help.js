var ChatConst = require("chat_const")
var ChatItemController = require("chat_item_controller");
var BattleController = require("battle_controller");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");

var ChatHelp = cc.Class({

	ctor: function() {
        this.chat_item_ctrl = ChatItemController.getInstance();		
	},

	onChatTouched: function(type, content,role_data) {
		
		if (!type || !content) return;
		var list = content.split("|");
		if (type == ChatConst.Link.Item_Show) {                      // 物品展示
			var srv_id = list[1];
			var share_id = list[2] || 0;
			this.chat_item_ctrl.sender10536(share_id, srv_id);
		} else if (type == ChatConst.Link.Guild_Join) {              // 加入公会
			require("guild_controller").getInstance().requestJoinGuild(Number(list[1]), list[2], 1);
		}else if (type == ChatConst.Link.Open_Vedio_info){			//录像馆分享
			let vedio_id = list[1] || 0
            let svr_id = list[2] || ""
            let _type =  list[3] || 0
			let channel = role_data.channel || ChatConst.Channel.World
			var VedioController = require("vedio_controller")
            VedioController.getInstance().send19908( vedio_id, svr_id, _type, channel )
		}else if(type == 5 || type == ChatConst.Link.Watch_Ladder){//战斗录像查看
			var is_in_fight = BattleController.getInstance().isInFight(); // 战斗中不给弹出二级提示,因为可能新手阶段点开挡住引导了
			if(is_in_fight == true){
				message(Utils.TI18N("正在战斗中或者观看录像中，无法观看录像"));
                return;
			}

			var fun = function(list,type){
				if(list[1]){
					if(!BattleController.getInstance().isInFight() && !BattleController.getInstance().getWatchReplayStatus()){
						if(type == ChatConst.Link.Watch_Ladder){
							BattleController.getInstance().csRecordBattle(parseInt(list[2]), list[1])
						}else{
							BattleController.getInstance().csRecordBattle(parseInt(list[1]))
						}
					}else{
						message(Utils.TI18N("正在战斗中或者观看录像中，无法观看录像"));
					}
				}
			}.bind(this,list,type);
			var str = Utils.TI18N("是否前往查看该录像");
            var ok_btn= Utils.TI18N("确定");
			var cancel_btn= Utils.TI18N("取消");
			var CommonAlert = require("commonalert");
			CommonAlert.show(str,ok_btn,fun,cancel_btn);
		}else if(type == 29 ){
			var hero_id = parseInt(list[2]) || 0;
			var LookController = require("look_controller");
			if(role_data && role_data.role_list && role_data.role_list[0]){
				LookController.getInstance().sender11062(hero_id, role_data.role_list[0].srv_id);
			}
		}else if(type == 35){
			var ChatController = require("chat_controller")
			ChatController.getInstance().closeChatPanel()
			let id = parseInt(list[1]) || 0 
			var WelfareController = require("welfare_controller")
            WelfareController.getInstance().openMainWindow(true, id) 
		}else if(type == 36){
			var ChatController = require("chat_controller")
			ChatController.getInstance().closeChatPanel()
			var WelfareController = require("welfare_controller")
			let yueka_status = WelfareController.getInstance().getModel().getYuekaStatus() 
			if(yueka_status == true){
			
			}else{
				let VipController = require("vip_controller")
                VipController.getInstance().openVipMainWindow(true)
			}
		}else if(type == 37){
			var ChatController = require("chat_controller")
			ChatController.getInstance().closeChatPanel()
			let is_open = MainuiController.getInstance().checkMainFunctionOpenStatus(MainuiConst.icon.first_charge, MainuiConst.function_type.other, false) 
            if(is_open == true){
				let first_icon = MainuiController.getInstance().getFunctionIconById(MainuiConst.icon.first_charge)
				let first_icon1 = MainuiController.getInstance().getFunctionIconById(MainuiConst.icon.first_charge_new1)
                if(first_icon || first_icon1){
					var NewfirstchargeController = require("newfirstcharge_controller")
                    NewfirstchargeController.getInstance().openNewFirstChargeView(true) 
				}else{
					var VipController = require("vip_controller")
                    VipController.getInstance().openVipMainWindow(true)
				}
			}
		}else if(type == 54){
			var ActionController = require("action_controller")
			var ActionConst = require("action_const")
			var ChatController = require("chat_controller")
			ActionController.getInstance().openActionMainPanel(true, null, ActionConst.ActionRankCommonType.time_summon)
            ChatController.getInstance().closeChatPanel()
		}else if(type == 66){
			var ActionController = require("action_controller")
			var ActionConst = require("action_const")
			var ChatController = require("chat_controller")
			
			ActionController.getInstance().openActionMainPanel(true, null, ActionConst.ActionRankCommonType.elite_summon)
            ChatController.getInstance().closeChatPanel()
		}else if (type == 42){	//竞技场跳转
			var ChatController = require("chat_controller")
			ChatController.getInstance().closeChatPanel()
			var MainSceneController = require("mainscene_controller");
			var SceneConst =require("scene_const");
            var build_vo = MainSceneController.getInstance().getBuildVo(SceneConst.CenterSceneBuild.arena)
            if( build_vo && build_vo.is_lock) {
				message(build_vo.desc)
                return
			}
			MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.arena_call)
		}
    else if(type == 44){
      MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.guild);
      MainuiController.getInstance().requestOpenBattleRelevanceWindow(require("battle_const").Fight_Type.GuildDun);
    }else if(type == 7){
      MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.guild);
      require("redbag_controller").getInstance().openMainView(true);
    }
	},
});


ChatHelp.getInstance = function () {
    if (!ChatHelp.instance) {
        ChatHelp.instance = new ChatHelp();
    }
    return ChatHelp.instance;
}
