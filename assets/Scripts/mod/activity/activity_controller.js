// --------------------------------------------------------------------
// @author: 
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-06 14:29:17
// --------------------------------------------------------------------
var GuildbossEvent = require("guildboss_event");
var RoleController = require("role_controller");
var RoleEvent = require("role_event");

var ActivityController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var ActivityModel = require("activity_model");

        this.model = new ActivityModel();
        this.model.initConfig();
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if(this.init_role_event == null){
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function() {
                gcore.GlobalEvent.unbind(this.init_role_event)
                this.init_role_event = null;
                var RoleController = require("role_controller");
                this._roleVo = RoleController.getInstance().getRoleVo();
                if(this._roleVo!=null){
                    if(this.role_assets_event == null){
                        var RoleEvent = require("role_event");
                        this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value){
                            if(key == "lev"){
                                this.requestInitProtocal();
                            }
                        }.bind(this))
                    }
                }
            }.bind(this))
        }


        if (!this.re_link_game_event) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function(){
                this.requestInitProtocal();
            }.bind(this));
        }

        gcore.GlobalEvent.bind(RoleEvent.RefreshRoleLev, (function (key, val) {
          if(key == "lev"){
            if(val >=5){
              this.openActivityPCWindow(true);
              // var controller = require("mainui_controller");
              // if(controller.getInstance().activityPopupCachesStatus){
              //   return;
              // }
              // controller.getInstance().checkActivityPopup(true);
            }
          } 
        }.bind(this)));

    },
    requestInitProtocal(){
        // --暂时没用到
        let config = Config.dailyplay_data.data_limitactivity
        if(config[2].is_open == 1 && this._roleVo){
            if(this._roleVo.lev >= config[2].activate[0][1]){
                this.SendProtocal(21322, {})
            }
        }
    },
    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(21322, this.handle21322)   // 公会副本双倍时间
    },

    handle21322:function(data){
        if(!data)return;
        if(data.code == 0){
            this._doubleTime = false;
        }else if(data.code == 1){
            this._doubleTime = true;
        }
        this._firstComein = this._doubleTime;
        var limitRed = false;
        var GuildBossController = require("guildboss_controller");
        var base_info = GuildBossController.getInstance().getModel().getBaseInfo();

        if(this._doubleTime == true){
            if(base_info && base_info.count){
                if(base_info.count > 0){
                    limitRed = true;    
                }
            }
        }
        gcore.GlobalEvent.fire(GuildbossEvent.BossActivityDoubleTime, this._doubleTime);
    },

    setFirstComeGuild:function(status){
        this._firstComein = status;
    },

    getFirstComeGuild:function(){
        return this._firstComein;
    },

    getBossActivityDoubleTime:function(){
        return this._doubleTime;
    },
    //全局无引用，已经弃用
    // openActivityView:function(bool){
    //     if(bool == true){
    //         if(!this.activityView){
    //             this.activityView = Utils.createClass("activity_window",this);
    //         }
    //         if(this.activityView && this.activityView.isOpen() == false){
    //             this.activityView.open();
    //         }
            
    //     }else{
    //         if(this.activityView){
    //             this.activityView.close();
    //             this.activityView = null;
    //         }
    //     }
    // },

    //活动PC端界面
    openActivityPCWindow:function(status){
      this.dataList = this.model.getActivityList(); 
      if(this.dataList.length == 0 ||this.role_vo.lev<5){
        return;
      }
      if (!status) {
        if (this.activityPCWindow) {
            this.activityPCWindow.close()
            this.activityPCWindow = null
        }
      } else {
          if (!this.activityPCWindow) {
              var ActivityPCWindow = require("activity_window");
              this.activityPCWindow = new ActivityPCWindow();
          }
          if(!this.activityPCWindow.isOpen()){
            this.activityPCWindow.open();
          }else{
            this.activityPCWindow.refreshUI();
          }
      }
    },

    //打开活动弹窗，首次登录触发
    openActivityPopup:function(status){
      this.dataList = this.model.getActivityList(); 
      if(this.dataList.length == 0 ||this.role_vo.lev<5){
        return;
      }
      if(!status){
        if(this.activityPopup){
          this.activityPopup.close();
          this.activityPopup = null;
        }
      }else{
        if(this.activityPopup == null){
          var ActivityPopup = require("activity_popup");
          this.activityPopup = new ActivityPopup();
        }
        this.activityPopup.open();
        var controller = require("mainui_controller");
        controller.getInstance().activityPopupStatus = true;  
      }
    },

    //  通用报名面板
    openSignView:function(value, id, data){
        if(value == false){
            if(this.activity_sign_view!=null){
                this.activity_sign_view.close();
                this.activity_sign_view = null;
            }
        }else{
            if(this.activity_sign_view == null){
                this.activity_sign_view = Utils.createClass("activity_sign_window",this);
            }
            if(this.activity_sign_view && this.activity_sign_view.isOpen() == false){
                this.activity_sign_view.open([id, data]);
            }
        }
    },

    // // 进入活动名称(1:萌兽寻宝 2:公会Boss狂欢 3:首席争霸 4:众神战场 5:公会战 6:冠军赛)
    // switchLimitActivityView:function(_type){
    //     if(_type == ActivityConst.limit_index.escort){
    //         MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Escort);
    //     }else if(_type == ActivityConst.limit_index.union){
    //         if(this.getBossActivityDoubleTime() == false){
    //             message(Utils.TI18N("当前不处于活动时段，请在活动开启后再来哦"));
    //         }else{
    //             MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.GuildDun)  
    //         }
    //     }else if(_type == ActivityConst.limit_index.fightFirst){
            
    //     }else if(_type == ActivityConst.limit_index.allGod){
    //         MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Godbattle);
    //     }else if(_type == ActivityConst.limit_index.guildwar){
    //         // var is_open = GuildwarController:getInstance():checkIsCanOpenGuildWarWindow();
    //         // if(is_open == true){
    //         //     MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.GuildWar);;
    //         // }
    //     }else if(_type == ActivityConst.limit_index.champion){
    //         MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.champion_call);
    //     }else if(_type == ActivityConst.limit_index.ladder){
    //         // var is_open = LadderController:getInstance():getModel():getLadderOpenStatus();
    //         // if(is_open == true){
    //         //     MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.LadderWar)
    //         // }
    //     }
    // },

    //  引导使用
    getActivityRoot:function(){
        if(this.activityView){
            return this.activityView.root_wnd;
        }
    },
});

module.exports = ActivityController;