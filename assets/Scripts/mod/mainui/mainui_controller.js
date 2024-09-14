// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-11-27 17:07:15
// --------------------------------------------------------------------
var MainuiConst = require("mainui_const");
var BattleDramaController = require("battle_drama_controller");
var MainuiEvent = require("mainui_event");
// var FunctionIconVo = require("function_icon_vo");
var ActionConst = require("action_const");
var RoleController = require("role_controller");
var BattleEvent = require("battle_event");
var SceneConst = require("scene_const");
var BattleConst = require("battle_const");
var ArenaConst = require("arena_const");
// var WelfareController = require("welfare_controller");
var OrderactionConst = require("orderaction_const");

var MainUiController = cc.Class({
    extends: BaseController,
    ctor: function () {
        this.ui_fight_type = MainuiConst.ui_fight_type.main_scene;
    },

    // 初始化配置数据
    initConfig: function () {
        var MainUiModel = require("mainui_model");
        this.model = new MainUiModel();
        this.model.initConfig();

        this.relevance_ui_last_type = 0;            // 上一个ui战斗类型
        this.relevance_battle_type = 0              // 当前请求的战斗类型
        this.relevance_ui_fight_type = 0            // 当前战斗类型想匹配的yu战斗类型
        this.relevance_params = 0                   // 附带参数

        this.function_list = {};                    //当前已经激活的图标,包含客户端自己的以及服务端的
        this.cache_tips_list = {};                  //当前缓存的图标状态
        this.cache_wait_create_list = {};           //缓存待创建的图标,可能是等级不足,可能是关卡数不对

        this.cachesBtnRed = [] //因为主界面没创建先缓存红点信息
        // var MainuiNoticeView = require("mainui_notice_view");
        // this.notice_view = new MainuiNoticeView();
        // this.notice_view.open();

        this.cache_list = [];   //缓存界面列表
        this.activityPopupStatus = false;//首次登录弹
        this.activityPopupCachesStatus = false;//是否弹窗已经缓存在某个回调里。
        this.cachesAwardList = [] //缓存奖励信息
        this.isShow // 
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        //请求进入竞技场之前，需要告诉服务器，我要进去了，有没有真是战斗，快点告诉我
        if (this.combat_type_back_event == null) {
            this.combat_type_back_event = gcore.GlobalEvent.bind(BattleEvent.COMBAT_TYPE_BACK, function (combat_type, type) {
                if (type == 0) //不存在战斗
                    this.openRelevanceWindowAtOnce(combat_type)
            }, this)
        }

        //弹窗
        // showCachePanel
        if (this.guide_event == null) {
          this.guide_event = gcore.GlobalEvent.bind(BattleEvent.GuideClose, function () {
            this.showCachePanel()
          }, this)
        }

        if (this.loading_enter_scene == null) {
          this.loading_enter_scene = gcore.GlobalEvent.bind(MainuiEvent.LOADING_ENTER_SCENE, (function () {
              this.showCachePanel();
          }).bind(this))
        }

        // 退出战斗需要打开进入战斗之前的一些窗体
        if (!this.battle_exit_event) {
            this.battle_exit_event = gcore.GlobalEvent.bind(EventId.EXIT_FIGHT, function (combat_type) {
                this.openRelevanceWindowAtOnce(combat_type)
            }.bind(this))
        }

        if (!this.update_drama_max_event) {
            this.update_drama_max_event = gcore.GlobalEvent.bind(require("battle_drama_event").BattleDrama_Update_Max_Id, function (max_id) {
                this.updateMainBtnStatus(max_id);
            }.bind(this))
        }

        if (this.init_main_event == null) {
            this.init_main_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                gcore.GlobalEvent.unbind(this.init_main_event);
                this.init_main_event = null;
                if (this.role_change_event == null) {
                    this.role_vo = RoleController.getInstance().getRoleVo();
                    if (this.role_vo != null) {
                        this.role_change_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                            if (key == "lev") {
                                this.checkFunctionByRoleLev(value);
                                if (IS_SUBMIT) {
                                    SDK.sdkSubmitUserData(4)
                                }
                                // World_bossController:getInstance():send20500()
                            }
                        }, this)
                    }
                }
            }, this)
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(12742, this.on12742);                     // 通用获取物品奖励
    },

    // 打开主界面
    openMainUI: function (status) {
        if (status == true) {
            if (this.mainui == null) {
                var MainUIView = require("mainui_view");
                this.mainui = new MainUIView();
                this.checkFunctionByRoleLev();
            }
            if (!this.mainui.getHideContainerStatus() && this.mainui.cur_select_index!= MainuiConst.new_btn_index.drama_scene) {
                this.mainui.open();
            }
            if (this.function_list) {
                for (let i in this.function_list) {
                    let function_vo = this.function_list[i]
                    if (function_vo) {
                        this.mainui.addIcon(function_vo);
                    }
                }
            }
            // 处理下方开启
            // if (this.max_dun_id) {
            //     this.mainui.checkUnLockStatus(this.max_dun_id);
            //     this.max_dun_id = null;
            // }
            if(!this.isShow){
              var LoginPopupManager = require("LoginPopupManager");
              LoginPopupManager.getInstance().run();
              this.isShow = true;
            }
        } else {
            if (this.mainui) {
                this.mainui.close();
            }
        }
    },

    // 获取当前的面板
    getUIFightType: function () {
        return this.ui_fight_type;
    },

    // 设置当前面板数据
    setUIFightType: function (value) {
        this.ui_fight_type = value
    },

    // 是否在剧情副本界面
    checkIsInDramaUIFight: function () {
        return this.ui_fight_type == MainuiConst.ui_fight_type.drama_scene;
    },

    // 切换主城状态,或者一些跳转也是要到这里来的
    changeMainUIStatus: function (index, sub_type, data,iType,callback) {
        if (this.mainui) {
            // 这里需要判断某一些是否开启了
            if (sub_type == MainuiConst.sub_type.adventure) {
                var config = Config.city_data.data_base[SceneConst.CenterSceneBuild.adventure];
                if (config) {
                    if (this.checkIsOpenByActivate(config.activate) == false) {
                        message(config.desc);
                        return;
                    }
                }
            }

            this.mainui.changeMainUiStatus(index, sub_type, data,iType,callback);
        }
    },

    // 请求打开战斗相关的窗体,同时也包含了剧情副本的
    requestOpenBattleRelevanceWindow: function (battle_type, params) {
        var BattleController = require("battle_controller");
        var BattleConst = require("battle_const");
        this.relevance_ui_last_type = this.ui_fight_type;
        this.relevance_battle_type = battle_type;
        this.relevance_params = params;
        this.relevance_ui_fight_type = BattleConst.getUIFightByFightType(battle_type);
        this.setUIFightType(this.relevance_ui_fight_type);
        BattleController.getInstance().send20060(battle_type);
    },

    // 还原之前的ui战斗类型,因为可能几个带战斗类型的面板互相调用
    resetUIFightType: function () {
        if (this.relevance_ui_last_type) {
            this.ui_fight_type = this.relevance_ui_last_type;
            this.relevance_ui_last_type = MainuiConst.ui_fight_type.normal;
        }
    },

    //打开关联窗体,这里针对世界boss又需要重新判断调整
    openRelevanceWindowAtOnce: function (combat_type) {
        var BattleConst = require("battle_const");
        if (combat_type == BattleConst.Fight_Type.WorldBoss || combat_type == BattleConst.Fight_Type.SingleBoss) {
            if (this.relevance_battle_type != BattleConst.Fight_Type.WorldBoss && self.relevance_battle_type != BattleConst.Fight_Type.SingleBoss) return
        } else {
            if (this.relevance_battle_type != combat_type) return
        }
        if (combat_type == BattleConst.Fight_Type.GuildDun) {
            require("guildboss_controller").getInstance().openMainWindow(true);
        } else if (combat_type == BattleConst.Fight_Type.StarTower) {
            require("startower_controller").getInstance().openMainView(true);
        } else if (combat_type == BattleConst.Fight_Type.Arena) {
            require("arena_controller").getInstance().openArenaLoopMathWindow(true);
        } else if (combat_type == BattleConst.Fight_Type.Endless) {
            require("endless_trail_controller").getInstance().openEndlessMainWindow(true)
        } else if (combat_type == BattleConst.Fight_Type.ExpeditFight) {
            require("heroexpedit_controller").getInstance().openHeroExpeditView(true)
        } else if (combat_type == BattleConst.Fight_Type.PrimusWar) {//荣耀神殿
            require("primus_controller").getInstance().openPrimusMainWindow(true)
        } else if (combat_type == BattleConst.Fight_Type.DungeonStone) {
            require("stone_dungeon_controller").getInstance().openStoneDungeonView(true)
        } else if (combat_type == BattleConst.Fight_Type.GuildWar) {
            require("guildwar_controller").getInstance().openMainWindow(true)
        } else if (combat_type == BattleConst.Fight_Type.Adventrue) {
            require("adventure_controller").getInstance().openAdventureMainWindow(true)
        } else if (combat_type == BattleConst.Fight_Type.LimitExercise) {
            require("limitexercise_controller").getInstance().openLimitExerciseChangeView(true)
        } else if(combat_type == BattleConst.Fight_Type.ElementWar){
            require("element_controller").getInstance().openElementMainWindow(true)
        }
    },

    //处理主界面下面的5个红点, 如果data是nil则表示清空红点数据
    setBtnRedPoint: function (id, data) {
        if (typeof (id) != "number") return;
        if (this.mainui) {
            this.mainui.updateBtnTipsPoint(id, data);
        } else {
            this.cachesBtnRed.push([id, data])
        }
    },
    resetCachesRetData() {
        this.cachesBtnRed = []
    },
    getCachesBtnRed: function () {
        return this.cachesBtnRed
    },
    // 返回当前所处的主界面标签
    getMainUIIndex: function () {
        if (this.mainui) {
            return this.mainui.getMainUIIndex();
        }
        return MainuiConst.new_btn_index.main_scene;
    },

    // 通用获取物品奖励
    on12742: function (data) {
        if (data.asset_list.length == 0) return;
        this.openGetItemView(true, data.asset_list, data.source);
    },

    //检测是否首次登录活动弹窗
    checkActivityPopup:function(status){
      if(!status || this.activityPopupStatus || this.activityPopupCachesStatus){
        return;
      }
      var GuideController = require("guide_controller");
      var role_vo = RoleController.getInstance().getRoleVo();
      if(IS_LOADING == true||GuideController.getInstance().isInGuide() || role_vo.lev <5){
        this.cache_list.push({function:function(data){
            this.checkActivityPopup(status);
        }.bind(this,status)});
        return;
      }      
      var ActivityController = require("activity_controller");
      var model = ActivityController.getInstance().getModel();
      this.dataList = model.getActivityList(); 
      if(!status || this.dataList.length == 0){return}
      this.activityPopupStatus = true;
      var ActivityController = require("activity_controller");
      ActivityController.getInstance().openActivityPopup(status);
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

    // 通用打开获取物品界面
    openGetItemView: function (status, list, source, extend, open_type) {
        if (!status) {
            if (this.exhibition_view) {
                if (this.cachesAwardList.length > 0) {
                    let data = this.cachesAwardList[0]
                    this.cachesAwardList.splice(0, 1)
                    this.exhibition_view.open({ list: data.list, source: data.source, extend: data.extend, open_type: open_type });
                } else {
                    this.exhibition_view.close();
                    this.exhibition_view = null;
                }
            }

        } else {
            if (list && (list instanceof Array) && list.length > 0) {
                if (this.exhibition_view) {
                    this.cachesAwardList.push({ list: list, source: source, extend: extend, open_type: open_type })
                    return
                }
                if (!this.exhibition_view) {
                    this.exhibition_view = Utils.createClass("item_exhibition_window")
                }

                this.exhibition_view.open({ list: list, source: source, extend: extend, open_type: open_type });
            }
        }
    },

    // 通用玩法规则面板
    openCommonExplainView: function (status, config, title_str) {
        if (status == false) {
            if (this.common_explain != null) {
                this.common_explain.close();
                this.common_explain = null;
            }
        } else {
            if (config == null || Utils.next(config) == null) return;
            if (this.common_explain == null) {
                this.common_explain = Utils.createClass("common_explain_window", this)
            }
            if (this.common_explain && this.common_explain.isOpen() == false) {
                this.common_explain.open([config, title_str])
            }
        }
    },
    //点击活动图标
    iconClickHandle: function (id, action_id) {
        if (id == null) return
        if (id == MainuiConst.icon.welfare) {
            require("welfare_controller").getInstance().openMainWindow(true);
        } else if (id == MainuiConst.icon.mail) {
            require("mail_controller").getInstance().openMailUI(true);
        } else if (id == MainuiConst.icon.daily) {
            require("task_controller").getInstance().openTaskMainWindow(true);
        } else if (id == MainuiConst.icon.friend) {
            require("friend_controller").getInstance().openFriendWindow(true);
        } else if (id == MainuiConst.icon.rank) {
            require("rank_controller").getInstance().openMainView(true);
        } else if (id == MainuiConst.icon.charge) {
            require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE);
        } else if (id == MainuiConst.icon.fund) {
            //超值基金
            require("welfare_controller").getInstance().openMainWindow(true, MainuiConst.icon.fund);
        } else if (id == MainuiConst.icon.first_charge_new || id == MainuiConst.icon.first_charge_new1) {
            require("newfirstcharge_controller").getInstance().openNewFirstChargeView(true);
        } else if (id == MainuiConst.icon.seven_login) {
            require("action_controller").getInstance().openSevenLoginWin(true);
        } else if (id == MainuiConst.icon.action || id == MainuiConst.icon.festival) {
            //限时活动,节日活动,竞猜活动
            require("action_controller").getInstance().openActionMainPanel(true, id)
        } else if (id == MainuiConst.icon.day_charge) {
            require("action_controller").getInstance().openActionMainPanel(true, null, 91005)
        } else if (id == MainuiConst.icon.godpartner) {
            require("action_controller").getInstance().openActionMainPanel(true, null, 93006)
        } else if (id == MainuiConst.icon.seven_goal || id == MainuiConst.icon.seven_goal1 || id == MainuiConst.icon.seven_goal2 || id == MainuiConst.icon.seven_goal3) {
            require("action_controller").getInstance().openSevenGoalView(true);
        } else if (id == MainuiConst.icon.lucky_treasure) {
            require("action_controller").getInstance().openLuckyTreasureWin(true);
        } else if (id == MainuiConst.icon.limit_gift_entry) {
            //限时礼包
            require("action_controller").getInstance().openActionLimitGiftMainWindow(true);
        } else if (id == MainuiConst.icon.day_first_charge) {//每日首充
            require("daycharge_controller").getInstance().openDayFirstChargeView(true);
        } else if (id == MainuiConst.icon.vedio) {
            //录像馆
            require("vedio_controller").getInstance().openVedioMainWindow(true)
        } else if (id == MainuiConst.icon.guildwar) {
            //公会战
            this.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.GuildWar);
        } else if (id == MainuiConst.icon.champion) {
            //冠军赛
            require("mainscene_controller").getInstance().openBuild(SceneConst.CenterSceneBuild.arena, ArenaConst.arena_type.rank);
        } else if (id == MainuiConst.icon.limit_recruit) {
            //限时招募
            require("recruithero_controller").getInstance().openRecruitHeroWindow(true);
        } else if (id == MainuiConst.icon.shrh_share) {
            //深海融合分享
            require("welfare_controller").getInstance().openMainWindow(true, 8007);
        } else if (id == MainuiConst.icon.shrh_sub) {
            //深海融合关注
            require("welfare_controller").getInstance().openMainWindow(true, 8014);
        } else if (id == MainuiConst.icon.shrh_realname) {
            //深海融合实名
            if (PLATFORM_TYPR == "SH_RH") {
                SDK.realname({ apiType: "askShow" })
            }
        } else if (id == OrderactionConst.OrderActionEntranceID.entrance_id) {//战令活动
            require("orderaction_controller").getInstance().openOrderActionMainView(true)
        } else if (id == MainuiConst.icon.give_vip) {//免费vip活动
            require("vip_controller").getInstance().openVipAwardWindow(true)
        } else if (id == MainuiConst.icon.trigger_gift) {
            //触发礼包
            require("action_controller").getInstance().openTriggerGiftWindow(true)
            if (this.getFunctionIconById(MainuiConst.icon.trigger_gift)) {
                let redStatus = this.getFunctionIconById(MainuiConst.icon.trigger_gift).getTipsStatus()
                if (redStatus) {
                    this.setFunctionTipsStatus(MainuiConst.icon.trigger_gift, !redStatus)
                }
            }
        } else if (id == MainuiConst.icon.privilege_shop) {
            //特权商城
            require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.PRIVILEGE);
            if (this.getFunctionIconById(MainuiConst.icon.privilege_shop)) {
                let redStatus = this.getFunctionIconById(MainuiConst.icon.privilege_shop).getTipsStatus()
                if (redStatus) {
                    this.setFunctionTipsStatus(MainuiConst.icon.privilege_shop, !redStatus)
                }
            }
        } else if (id == MainuiConst.icon.open_server_recharge) {
            //开服小额充值
            var ActionController = require("action_controller");
            ActionController.getInstance().openActionOpenServerGiftWindow(true, ActionConst.ActionRankCommonType.open_server)

        } else if (id == MainuiConst.icon.shwx_share) {
            //深海小程序分享
            require("welfare_controller").getInstance().openMainWindow(true, 8101);
        } else if (id == MainuiConst.icon.shwx_sub) {
            //深海小程序关注
            require("welfare_controller").getInstance().openMainWindow(true, 8102);
        } else if (id == MainuiConst.icon.shwx_collect) {
            //深海小程序收藏
            require("welfare_controller").getInstance().openMainWindow(true, 8103);
        } else if (id == MainuiConst.icon.one_gift) {
            //一元礼包
            this.setFunctionTipsStatus(MainuiConst.icon.one_gift, false)
            require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.DAILY_GIFT);
        } else if(id == MainuiConst.icon.skin){
            var ActionController = require("action_controller");
            ActionController.getInstance().openBuySkinWindow(true)
        }


    },

    /*
    监测主UI的功能图标开启情况
    type:是主界面下面的6个+充值,还是其他比如排行榜之类的
    */
    checkMainFunctionOpenStatus: function (id, type, un_show_desc) {
        type = type || MainuiConst.function_type.main;
        id = id || 0;
        var config = null;
        if (type == MainuiConst.function_type.mian) {
            config = Config.function_data.data_base[id];
        } else {
            config = Config.function_data.data_info[id];
        }

        var str = "";
        var is_open = false;
        if (config == null || config.activate == null) {
            str = Utils.TI18N("配置数据异常")
            is_open = false;
        } else {
            str = config.desc;
            is_open = this.checkIsOpenByActivate(config.activate);
        }
        if (!un_show_desc && is_open == false) {
            message(str)
        }
        return is_open
    },

    //根据id获取指定的图标数据
    getFunctionIconById: function (id) {
        return this.function_list[id];
    },
    
    getActivityList: function () {
      return this.function_list;
    },


    //设置功能图标的红点状态,主要是function_data_info的数据
    setFunctionTipsStatus: function (id, data) {
        id = Number(id);
        if (typeof (id) != "number") return
        var vo = this.getFunctionIconById(id);
        if (vo) {
            vo.setTipsStatus(data);
        } else {
            if (this.cache_tips_list == null) {
                this.cache_tips_list = {}
            }
            if (typeof (data) == "object") {
                if (data.bid == null || typeof (data.bid) != "number") return
                if (this.cache_tips_list[id] == null) {
                    this.cache_tips_list[id] = {}
                }
                if (data.bid != null) {
                    this.cache_tips_list[id][data.bid] = data;
                }
            } else {
                this.cache_tips_list[id] = data
            }
        }
        //检查红点状态
        this.checkMainSceneIconStatus()
    },

    //判断主城图标的红点状态,需要检查主城建筑以及功能红点
    checkMainSceneIconStatus: function () {
        //首先判断图标红点吧
        var main_scene_btn_status = false;
        for (var k in this.function_list) {
            if (this.function_list[k] && this.function_list[k].getTipsStatus() == true) {
                main_scene_btn_status = true;
                break
            }
        }
        //如果有红点的话,直接跳过了
        if (main_scene_btn_status == true) {
            if (this.main_scene_btn_status == false) {
                this.main_scene_btn_status = true;
                // this.setBtnRedPoint(MainuiConst.new_btn_index.main_scene, false);
                this.setBtnRedPoint(MainuiConst.new_btn_index.main_scene, this.main_scene_btn_status);
            }
            return
        }

        var build_list = require("mainscene_controller").getInstance().getBuildVoList();
        if (build_list) {
            for (var k in build_list) {
                if (build_list[k].getTipsStatus() == true) {
                    main_scene_btn_status = true;
                    break
                }
            }
        }
        if (main_scene_btn_status != this.main_scene_btn_status) {
            this.main_scene_btn_status = main_scene_btn_status;
            // this.setBtnRedPoint(MainuiConst.new_btn_index.main_scene, false);
            this.setBtnRedPoint(MainuiConst.new_btn_index.main_scene, this.main_scene_btn_status);
        }
    },

    // 剧情章节变化的时候判断客户端自己的图标开启状态
    updateMainBtnStatus: function (max_dun) {
        if (this.mainui) {
            this.mainui.checkUnLockStatus(max_dun);
        } else {
            this.max_dun_id = max_dun;
        }

        this.checkFunctionByDrama(max_dun);
    },

    //初始化图标,找出是客户端创建并且达到等级的
    checkFunctionByRoleLev: function (lev) {
        if (this.mainui == null) return //登录上线有升级的时候,这个时候会先于openui过来,所以没必要创建
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo == null) return
        lev = lev || role_vo.lev;
        var add_list = [];
        for (var k in Config.function_data.data_info) {
            var config = Config.function_data.data_info[k];
            if (this.function_list[config.id] == null) {
                if (IS_SHOW_CHARGE == true || (IS_SHOW_CHARGE == false && config.is_verifyios == 1)) {
                    if (config.open_type == 1 && config.activate) {
                        var activate = config.activate[0] //开启条件
                        if (activate && activate[0] && activate[1]) {
                            var activate_condition = activate[0];
                            var activate_value = activate[1];
                            if (activate_condition == "lev" && lev >= activate_value) {
                                var function_vo = this.createFunctionVo(config);
                                if (function_vo != null) {
                                    this.function_list[config.id] = function_vo;
                                    add_list.push(function_vo);
                                    gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, config.id, true);
                                }
                            } else if (lev >= activate_value) {
                                if (activate_condition == "shrh_lev" && PLATFORM_TYPR == "SH_RH") {
                                    // if (config.id == MainuiConst.icon.shrh_sub && window.SH_RH_IS_SUBSCRIBE == true) continue
                                    // if (config.id == MainuiConst.icon.shrh_share && require("welfare_controller").getInstance().getModel().getShareAwardStatus() == 1) continue
                                    // if (config.id == MainuiConst.icon.shrh_realname && window.SH_RH_IS_REALNAME == true) continue
                                    // if (config.id == MainuiConst.icon.shrh_sub && window.SH_RH_IS_SUBSCRIBE == true || SH_RH_IS_SHOW_SUBSCRIBE == false) continue
                                    // if (config.id == MainuiConst.icon.shrh_share && require("welfare_controller").getInstance().getModel().getShareAwardStatus() == 1 || SH_RH_IS_SHOW_SHARE == false) continue
                                    // if (config.id == MainuiConst.icon.shrh_realname && window.SH_RH_IS_REALNAME == true || SH_RH_IS_SHOW_REALNAME == false) continue
                                    if (config.id == MainuiConst.icon.shrh_sub) {
                                        if (window.SH_RH_IS_SUBSCRIBE == true || SH_RH_IS_SHOW_SUBSCRIBE == false)
                                            continue
                                    }
                                    if (config.id == MainuiConst.icon.shrh_share) {
                                        if (SH_RH_IS_SHOW_SHARE == false || require("welfare_controller").getInstance().getModel().getShareAwardStatus() == 1)
                                            continue
                                    }
                                    if (config.id == MainuiConst.icon.shrh_realname) {
                                        if (window.SH_RH_IS_REALNAME == true || SH_RH_IS_SHOW_REALNAME == false) {
                                            continue
                                        }
                                    }
                                    var function_vo = this.createFunctionVo(config);
                                    if (function_vo != null) {
                                        this.function_list[config.id] = function_vo;
                                        add_list.push(function_vo);
                                        gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, config.id, true);
                                    }
                                } else if (activate_condition == "shwx_lev" && PLATFORM_TYPR == "SH_SDK") {
                                    if (config.id == MainuiConst.icon.shwx_sub && window.SH_SDK_FOLLOW == true) continue
                                    if (config.id == MainuiConst.icon.shwx_share && require("welfare_controller").getInstance().getModel().getShareAwardStatus() == 1) continue
                                    if (config.id == MainuiConst.icon.shwx_collect && require("welfare_controller").getInstance().getModel().getCollectAwardStatus() == 1) continue

                                    var function_vo = this.createFunctionVo(config);
                                    if (function_vo != null) {
                                        this.function_list[config.id] = function_vo;
                                        add_list.push(function_vo);
                                        gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, config.id, true);
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
        if (Utils.next(add_list)) {
            if (this.mainui) {
                this.mainui.addIconList(add_list);
            }
        }
        //监测是否有带创建的图标
        this.checkCacheWaitFunction();
    },

    //根据副本进度创建图标
    checkFunctionByDrama: function (max_dun_id) {
        var add_list = [];
        for (var k in Config.function_data.data_info) {
            var config = Config.function_data.data_info[k];
            if (this.function_list[config.id] == null) {
                if (IS_SHOW_CHARGE == true || (IS_SHOW_CHARGE == false && config.is_verifyios == 1)) {
                    if (config.open_type == 1 && config.activate) {
                        var activate = config.activate[0] //开启条件
                        if (activate && activate[0] && activate[1]) {
                            var activate_condition = activate[0];
                            var activate_value = activate[1];
                            if (activate_condition == "dun" && max_dun_id >= activate_value) {
                                var function_vo = this.createFunctionVo(config);
                                if (function_vo != null) {
                                    this.function_list[config.id] = function_vo;
                                    add_list.push(function_vo);
                                    gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, config.id, true);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (Utils.next(add_list)) {
            if (this.mainui) {
                this.mainui.addIconList(add_list);
            }
        }
        // 监测是否有待创建的图标
        this.checkCacheWaitFunction();
    },


    //监测是否有要求创建时候不满足情况的图标
    checkCacheWaitFunction: function () {
        if (this.cache_wait_create_list == null || Utils.getArrLen(this.cache_wait_create_list) == 0) return
        var role_vo = RoleController.getInstance().getRoleVo();
        var drama_data = BattleDramaController.getInstance().getModel().getDramaData();
        for (var k in this.cache_wait_create_list) {
            var v = this.cache_wait_create_list[k];
            var config = gdata("function_data", "data_info", [k]);
            if (config == null || config.activate == null) {
                v = null;
            } else {
                var activate = config.activate[0];
                if (activate[0] == null || activate[1] == null) {
                    v == null;
                } else {
                    var activate_condition = activate[0];
                    var activate_value = activate[1];
                    if ((activate_condition == "lev" && role_vo && role_vo.lev >= activate_value) || (activate_condition == "dun" && drama_data && drama_data.max_dun_id >= activate_value)) {
                        var function_vo = this.createFunctionVo(config);
                        if (function_vo != null) {
                            var params = v;
                            function_vo.update(params);
                            this.function_list[k] = function_vo;
                            if (this.mainui) {
                                this.mainui.addIcon(function_vo);
                            }
                            v = null
                            //缓存图标创建成功之后
                            gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, k, true);
                        }
                    } else if (role_vo && role_vo.lev >= activate_value) {
                        if (activate_condition == "shrh_lev" && PLATFORM_TYPR == "SH_RH") {
                            // if (config.id == MainuiConst.icon.shrh_sub && window.SH_RH_IS_SUBSCRIBE == true) continue
                            // if (config.id == MainuiConst.icon.shrh_share) continue
                            // if (config.id == MainuiConst.icon.shrh_realname && window.SH_RH_IS_REALNAME == true) continue
                            if (config.id == MainuiConst.icon.shrh_sub) {
                                if (window.SH_RH_IS_SUBSCRIBE == true || SH_RH_IS_SHOW_SUBSCRIBE == false)
                                    continue
                            }
                            if (config.id == MainuiConst.icon.shrh_share) {
                                if (SH_RH_IS_SHOW_SHARE == false || require("welfare_controller").getInstance().getModel().getShareAwardStatus() == 1)
                                    continue
                            }
                            if (config.id == MainuiConst.icon.shrh_realname) {
                                if (window.SH_RH_IS_REALNAME == true || SH_RH_IS_SHOW_REALNAME == false) {
                                    continue
                                }
                            }
                            var function_vo = this.createFunctionVo(config);
                            if (function_vo != null) {
                                var params = v;
                                function_vo.update(params);
                                this.function_list[k] = function_vo;
                                if (this.mainui) {
                                    this.mainui.addIcon(function_vo);
                                }
                                v = null
                                //缓存图标创建成功之后
                                gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, k, true);
                            }
                        } else if (activate_condition == "shwx_lev" && PLATFORM_TYPR == "SH_SDK") {
                            if (config.id == MainuiConst.icon.shwx_sub && window.SH_SDK_FOLLOW == true) continue
                            if (config.id == MainuiConst.icon.shwx_share && require("welfare_controller").getInstance().getModel().getShareAwardStatus() == 1) continue
                            if (config.id == MainuiConst.icon.shwx_collect && require("welfare_controller").getInstance().getModel().getCollectAwardStatus() == 1) continue
                            var function_vo = this.createFunctionVo(config);
                            if (function_vo != null) {
                                var params = v;
                                function_vo.update(params);
                                this.function_list[k] = function_vo;
                                if (this.mainui) {
                                    this.mainui.addIcon(function_vo);
                                }
                                v = null
                                //缓存图标创建成功之后
                                gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, k, true);
                            }
                        }
                    }
                }
            }
        }
    },

    getFucntionIconVoById: function (id) {
        if (this.function_list && Utils.next(this.function_list || {}) != null && this.function_list[id])
            return this.function_list[id]
    },

    //创建一个图标数据
    createFunctionVo: function (config) {
        if (config == null) return
        if (config.id == MainuiConst.icon.action || config.id == MainuiConst.icon.festival) {
            var ActionController = require("action_controller");
            var can_add = ActionController.getInstance().checkCanAddWonderful(config.id);
            if (can_add == false) return
        }
        var function_vo = this.function_list[config.id];
        if (function_vo == null) {
            function_vo = Utils.createClass("function_icon_vo", config);
        }
        if (this.cache_wait_create_list[config.id] != null) {
            function_vo.update(this.cache_wait_create_list[config.id]);
            // this.cache_wait_create_list[config.id] = null;
            delete this.cache_wait_create_list[config.id]
        }
        if (this.cache_tips_list[config.id] != null) {
            function_vo.setTipsStatus(this.cache_tips_list[config.id]);
            this.cache_tips_list[config.id] = null;
        }
        // if (config.id == MainuiConst.icon.action) {
        //     require("action_controller").getInstance().requestActionAwardStatus(ActionConst.ActionType.Wonderful);
        // } else if (config.id == MainuiConst.icon.combine) {
        //     require("action_controller").getInstance().requestActionAwardStatus(ActionConst.ActionType.Combine);
        // }
        return function_vo
    },

    //添加图标
    addFunctionIconById: function (id) {
        if (id == null) return;
        var function_vo = this.function_list[id];
        let params = []
        if (arguments.length > 1) {
            for (let i = 1; i < arguments.length; ++i) {
                params.push(arguments[i])
            }
        }
        if (function_vo) {
            function_vo.update(params);
            return;
        }
        var config = Config.function_data.data_info[id];
        if (config == null || config.activate == null) return;
        if (IS_SHOW_CHARGE == false && config.is_verifyios == 0) return;
        var activate = config.activate[0];
        if (activate == null || activate[0] == null || activate[1] == null) return
        var activate_condition = activate[0];
        var activate_value = activate[1];
        var role_vo = RoleController.getInstance().getRoleVo();
        var drama_data = BattleDramaController.getInstance().getModel().getDramaData();
        if ((activate_condition == "lev" && role_vo && role_vo.lev >= activate_value) || (activate_condition == "dun" && drama_data && drama_data.max_dun_id >= activate_value)) {
            function_vo = this.createFunctionVo(config);    // 创建
            if (function_vo) {
                function_vo.update(params);
                this.function_list[id] = function_vo;
                if (this.mainui) {
                    this.mainui.addIcon(function_vo);
                }
                // 通知添加一个图标
                gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, id, true);
            }
        } else if (activate_condition == "shrh_lev" && role_vo && role_vo.lev >= activate_value) {
            if (PLATFORM_TYPR == "SH_RH") {
                // if (config.id == MainuiConst.icon.shrh_sub && window.SH_RH_IS_SUBSCRIBE == true) return
                // if (config.id == MainuiConst.icon.shrh_share && window.SH_RH_IS_SHARE == true) return
                // if (config.id == MainuiConst.icon.shrh_realname && window.SH_RH_IS_REALNAME == true) return
                
                // if (config.id == MainuiConst.icon.shrh_sub && window.SH_RH_IS_SUBSCRIBE == true || SH_RH_IS_SHOW_SUBSCRIBE == false) return
                // if (config.id == MainuiConst.icon.shrh_share && window.SH_RH_IS_SHARE == true || SH_RH_IS_SHOW_SHARE == false) return
                // if (config.id == MainuiConst.icon.shrh_realname && window.SH_RH_IS_REALNAME == true || SH_RH_IS_SHOW_REALNAME == false) return
                if (config.id == MainuiConst.icon.shrh_sub) {
                    if (window.SH_RH_IS_SUBSCRIBE == true || SH_RH_IS_SHOW_SUBSCRIBE == false)
                        return
                }
                if (config.id == MainuiConst.icon.shrh_share) {
                    if (SH_RH_IS_SHOW_SHARE == false || window.SH_RH_IS_SHARE == true)
                        return
                }
                if (config.id == MainuiConst.icon.shrh_realname) {
                    if (window.SH_RH_IS_REALNAME == true || SH_RH_IS_SHOW_REALNAME == false) {
                        return
                    }
                }
                function_vo = this.createFunctionVo(config);    // 创建
                if (function_vo) {
                    function_vo.update(params);
                    this.function_list[id] = function_vo;
                    if (this.mainui) {
                        this.mainui.addIcon(function_vo);
                    }
                    // 通知添加一个图标
                    gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, id, true);
                }
            }
        } else if (activate_condition == "shwx_lev" && role_vo && role_vo.lev >= activate_value) {
            if (PLATFORM_TYPR == "SH_SDK") {
                if (config.id == MainuiConst.icon.shwx_sub && window.SH_SDK_FOLLOW == true) return
                if (config.id == MainuiConst.icon.shwx_share && require("welfare_controller").getInstance().getModel().getShareAwardStatus() == 1) return
                if (config.id == MainuiConst.icon.shwx_collect && require("welfare_controller").getInstance().getModel().getCollectAwardStatus() == 1) return
                function_vo = this.createFunctionVo(config);    // 创建
                if (function_vo) {
                    function_vo.update(params);
                    this.function_list[id] = function_vo;
                    if (this.mainui) {
                        this.mainui.addIcon(function_vo);
                    }
                    // 通知添加一个图标
                    gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, id, true);
                }
            }
        } else {
            this.cache_wait_create_list[id] = params;       // 缓存他们的数据
        }
    },

    //移除一个服务端图标
    removeFunctionIconById: function (id) {
        if (!id) return;
        var function_vo = this.function_list[id];
        if (function_vo) {
            if (this.mainui) {
                this.mainui.removeIcon(id);
            }
            this.function_list[id] = null;
            // this.cache_wait_create_list[id] = null;
            delete this.cache_wait_create_list[id]
            // 通知添加一个图标
            gcore.GlobalEvent.fire(MainuiEvent.UPDATE_FUNCTION_STATUS, id, false);
        }
    },

    // 根据开启条件判断该条件是否开启,包括了等级,剧情章节id,开服天数,和Vip等级
    checkIsOpenByActivate: function (activate) {
        if (activate == null || Utils.next(activate) == null) {
            return false;
        }
        var role_vo = require("role_controller").getInstance().getRoleVo();
        var drama_data = require("battle_drama_controller").getInstance().getModel().getDramaData();

        for (let index = 0; index < activate.length; index++) {
            const element = activate[index];
            if (element) {
                var condition_type = element[0];
                var condition_value = element[1];
                var max_val = 0;
                if (condition_type == "lev" && role_vo) {
                    max_val = role_vo.lev;
                } else if (condition_type == "open_day" && role_vo) {
                    max_val = role_vo.open_day;
                } else if (condition_type == "vip_lev" && role_vo) {
                    max_val = role_vo.vip_lev;
                } else if (condition_type == "dun" && drama_data) {
                    max_val = drama_data.max_dun_id;
                }
                if (condition_value > max_val) {
                    return false;
                }
            }
        }
        return true;
    },

    // 是否处于无尽试炼战斗的ui战斗下
    checkIsInEndlessUIFight: function () {
        return this.ui_fight_type == MainuiConst.ui_fight_type.endless;
    },

    setMainUIBottomStatus: function (status) {
        if (this.mainui)
            this.mainui.setBottomStatus(status);
    },

    setMainUITopStatus: function (status) {
        if (this.mainui)
            this.mainui.setTopStatus(status);
    },

    getMainUiRoot: function (root_cb) {
        if (root_cb) {
            if (this.mainui) {
                this.mainui.getRootWnd(root_cb)
            } else {
                root_cb(null);
            }
        } else {
            if (this.mainui)
                return this.mainui.root_wnd
        }
    },

    getHideContainerStatus: function () {
        if (this.mainui && this.mainui.getHideContainerStatus) {
            return this.mainui.getHideContainerStatus();
        }
    },

    getItemExhibtionRoot: function () {
        if (this.exhibition_view)
            return this.exhibition_view.root_wnd;
    },

    showPower: function (power_add, last_power) {
        if (this.mainui)
            this.mainui.showPower(power_add, last_power);
    },

    changeHeroStatus: function (is_hero) {
        if (this.mainui)
            this.mainui.changeHeroStatus(is_hero);
    },
    showChatBtn(status) {
        if (this.mainui) {
            this.mainui.showChatBtn(status)
        }
    },
    setMainUIChatBubbleStatus(status) {
        if (this.mainui) {
            this.mainui.setMainUIChatBubbleStatus(status)
        }
    },

    getTaskTipsPanel: function () {
        if (this.mainui) {
            return this.mainui.getTaskTipsPanel();
        }
    },
    //主界面系统提示跳转
    onClickPromptTipsItem(data) {
        var PromptTypeConst = require("prompt_type_const")
        if (data.type == PromptTypeConst.Private_chat) {  //私聊
            let temp_data = {}
            for (let k = 0; k < data.list[0].data.arg_uint32.length; ++k) {
                let v = data.list[0].data.arg_uint32[k]
                if (v.key == 1) {
                    temp_data.rid = v.value
                }
            }
            for (let k = 0; k < data.list[0].data.arg_str.length; ++k) {
                let v = data.list[0].data.arg_str[k]
                if (v.key == 1) {
                    temp_data.srv_id = v.value
                }
            }
            if (Utils.next(temp_data) != null) {
                var ChatController = require("chat_controller")
                var ChatConst = require("chat_const")
                ChatController.getInstance().openChatPanel(ChatConst.Channel.Friend, "friend", temp_data)
            }
        } else if (data.type == PromptTypeConst.At_notice) {
            var channel = null;
            for (let k = 0; k < data.list[0].data.arg_uint32.length; ++k) {
                let v = data.list[0].data.arg_uint32[k]
                if (v.key == 2) {
                    channel = v.value
                }
            }
            var ChatController = require("chat_controller")
            ChatController.getInstance().openChatPanel(null,channel,null)
        } else if (data.type == PromptTypeConst.Endless_trail) { //无尽试炼
            var Endless_trailController = require("endless_trail_controller");
            Endless_trailController.getInstance().openEndlessBuffView(true)
        }
    },
});

module.exports = MainUiController;
