// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-11-23 11:43:49
// --------------------------------------------------------------------

var SceneEvent = require("mainscene_event");
var DramaEvent = require("battle_drama_event");
var RoleController = require("role_controller")
var SceneConst = require("scene_const");
var BattleConst = require("battle_const");
var CrossshowController = require("crossshow_controller");

var MainSceneController = cc.Class({
    extends: BaseController,

    properties: {
        build_list_vo: {             // 建筑数据缓存
            default: {}
        },
        has_init: false,
        role_vo: null,
        time_type: 1,
    },

    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        // var MainSceneModel = require("mainscene_model");
        this.model = Utils.createClass("mainscene_model")
        this.model.initConfig();
        this.hero_vo = null;

        var BattleDramaController = require("battle_drama_controller");
        this.battle_drama_ctrl = BattleDramaController.getInstance();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        this.create_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function () {
            gcore.GlobalEvent.unbind(this.create_role_event);
            this.create_role_event = null;
            this.role_vo = RoleController.getInstance().getRoleVo();
            this.creatBuildVo();
            // 初始化之后，请求建筑战斗状态
            this.registerProtocals();
            this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function (key, val) {
                if (key == "lev" || key == "open_day") this.checkBuildLockStatus();
            }.bind(this)));
        }).bind(this));

        if (!this.update_drama_max_event) {
            this.update_drama_max_event = gcore.GlobalEvent.bind(DramaEvent.BattleDrama_Update_Max_Id, function (max_it) {
                // gcore.GlobalEvent.unbind(this.update_drama_max_event);
                this.update_drama_max_event = null;
                this.checkBuildLockStatus();
                // if (!this.has_init) {
                //     this.has_init = true;
                //     this.creatBuildVo();
                //     // 初始化之后，请求建筑战斗状态
                //     this.registerProtocals();
                // } else {
                //     // 检测建筑状态是否开启
                //     this.checkBuildLockStatus();
                // }
            }.bind(this));
        }

        // 进入战斗需要隐藏掉主城和已经打开的一些ui,但是退出之后需要重新手动打开
        if (!this.battle_enter_event) {
            this.battle_enter_event = gcore.GlobalEvent.bind(EventId.ENTER_FIGHT, function (combat_type) {
                if (combat_type == BattleConst.Fight_Type.Nil) return;
                Utils.hideAllWindowForBattle();
                this.handleSceneStatus(false);
            }.bind(this))
        }

        // 退出战斗需要打开进入战斗之前的一些窗体
        if (!this.battle_exit_event) {
            this.battle_exit_event = gcore.GlobalEvent.bind(EventId.EXIT_FIGHT, function (combat_type) {
                if (combat_type == BattleConst.Fight_Type.Nil) return;
                var need_show_scene = Utils.showAllWindowForBattle();
                this.handleSceneStatus(need_show_scene);
            }.bind(this))
        }
    },



    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(20063, this.on20063);
        this.RegisterProtocal(10304, this.on10304);
    },

    // 请求建筑气泡战斗状态
    requestFightStatus: function () {
        this.SendProtocal(20063, {});
    },


    // 设置战斗状态
    on20063: function (data) {
        if (!this.build_list_vo || !Utils.next(this.build_list_vo)) return;

        var status_list = {};
        for (var build_i in Config.city_data.data_base) {
            status_list[build_i] = {}
        }

        if (data.type_list) {
            for (var type_i in data.type_list) {
                var value = data.type_list[type_i];
                var key = this.getBuildIdByCombat(value.combat_type); // 这个标识在战斗中
                if (key) {
                    status_list[key][value.combat_type] = true
                }
            }        
        }

        for (var status_i in status_list) {
            var buildvo = this.build_list_vo[status_i];
            if (buildvo) {
                buildvo.setFightStatus(status_list[status_i]);
            }
        }

        // for k,v in pairs(status_list) do
        //     local buildvo = self.build_list_vo[k]
        //     if buildvo then
        //         buildvo:setFightStatus(v)
        //     end
        // end        
    },


    getBuildIdByCombat: function(combat_type) {
        var BattleConst = require("battle_const");
        if (combat_type == BattleConst.Fight_Type.Arena) {
            return SceneConst.CenterSceneBuild.arena;
        } else if (combat_type == BattleConst.Fight_Type.StarTower) {
            return SceneConst.CenterSceneBuild.startower;
        } else if (combat_type == BattleConst.Fight_Type.Adventrue || combat_type == BattleConst.Fight_Type.ElementWar || combat_type == BattleConst.Fight_Type.HeavenWar) {
            return SceneConst.CenterSceneBuild.adventure;
        } else if (combat_type == BattleConst.Fight_Type.LadderWar || combat_type == BattleConst.Fight_Type.EliteMatchWar || combat_type == BattleConst.Fight_Type.EliteKingMatchWar || combat_type == BattleConst.Fight_Type.CrossArenaWar) {
            return SceneConst.CenterSceneBuild.ladder;
        }
    },

    // 进入主城入口,收到这个协议开始创建主城
    on10304: function (data) {
        this.can_enter = true;
        // if (this.main_scene == null){
        //     this.enterMainScene(true)
        //     this.enterMainScene(true)
        // }
        if(PLATFORM_TYPR == "SH_RH"){
            if (cli_log && cli_log.log_enter_city) {
                cli_log.log_enter_city(require("login_controller").getInstance().getModel().getLoginData().usrName);
            };
        }

    },

    //进入主城

    enterMainScene: function (status) {
      if (!status) {
          if (this.main_scene) {
            this.main_scene.close()
            this.main_scene = null
          }
      } else {
          if (!this.main_scene) {
              var CityMainWindow = require("city_main_window");
              this.main_scene = new CityMainWindow(this);
          }else{
            this.main_scene.reset();
          }
      }
  },

    changeMainCityTimeType: function (type) {
        if (this.main_scene) {
            this.main_scene.setTimeType(type);
        }
        this.time_type = type;
    },

    /**
     * 设置主城是否可见,并且同时设置主ui是否可见,这里需要设置的有打开全屏界面和关闭,进入剧情或退出
     * @param {*} status 
     */
    handleSceneStatus: function (status) {
        if (this.main_scene) {
            this.main_scene_status = status;
            if (status == false) {
                this.main_scene.setVisible(status);
                if (this.wait_status_time_ticket) {
                    gcore.Timer.del(this.wait_status_time_ticket);
                    this.wait_status_time_ticket = null;
                }
            } else {
                if (this.wait_status_time_ticket == null) {
                    this.wait_status_time_ticket = gcore.Timer.set(function () {
                        if (this.main_scene_status == true) {
                            this.main_scene.setVisible(this.main_scene_status);
                        }
                        gcore.Timer.del(this.wait_status_time_ticket);
                        this.wait_status_time_ticket = null;
                    }.bind(this), 100, 1)
                }
            }
        }
        // 主ui也做显示
        var mainuiCtrl = require("mainui_controller");
        mainuiCtrl.getInstance().openMainUI(status);
    },

    checkBuildLockStatus: function () {
        var drama_data = this.battle_drama_ctrl.getModel().getDramaData();
        if (!drama_data || !this.role_vo || !this.build_list_vo) return;

        for (var buildIndex in this.build_list_vo) {
            var build_vo = this.build_list_vo[buildIndex];
            if (build_vo.activate && build_vo.is_lock) {
                var is_lock = false;
                for (var activateIndex in build_vo.activate) {
                    var condition_type = build_vo.activate[activateIndex][0];
                    var condition_value = build_vo.activate[activateIndex][1];
                    var curValue = 0;
                    switch (condition_type) {
                        case "dun": {
                            curValue = drama_data.max_dun_id;
                        }
                            break;
                        case "lev": {
                            curValue = this.role_vo.lev;
                        }
                            break;
                        case "open_day": {
                            curValue = this.role_vo.open_day;
                        }
                            break;
                    }
                    if (curValue >= condition_value) {
                        is_lock = false;
                    } else {
                        is_lock = true;
                        break;
                    }
                }
                if (is_lock !== build_vo.is_lock) {
                    build_vo.setLockStatus(is_lock);
                }
            }
        }
    },

    creatBuildVo: function () {
        if (!this.role_vo) return;
        var scene_config = Config.main_scene_data[1];
        var drama_data = this.battle_drama_ctrl.getModel().getDramaData();

        for (var buildIndex in scene_config.building_list) {
            var buildingitem = scene_config.building_list[buildIndex];
            if (buildingitem.type == SceneConst.BuildItemType.build) {
                if(buildingitem.bid == 12 || buildingitem.bid == 13)continue
                var city_item = Config.city_data.data_base[buildingitem.bid];
                var is_lock = false;

                if (city_item && city_item.activate) {
                    for (var activateIndex in city_item.activate) {
                        var condition_type = city_item.activate[activateIndex][0];
                        var condition_value = city_item.activate[activateIndex][1];
                        var curValue = 0;
                        switch (condition_type) {
                            case "dun": {
                                curValue = drama_data.max_dun_id;
                            }
                                break;
                            case "lev": {
                                curValue = this.role_vo.lev;
                            }
                                break;
                            case "open_day": {
                                curValue = this.role_vo.open_day;
                            }
                                break;
                            case "world_lev": {
                                let world_lev = RoleController.getInstance().getModel().getWorldLev();
                                if(world_lev){
                                    curValue = world_lev
                                }
                            }
                                break;
                        }
                        if (curValue >= condition_value) {
                            is_lock = false;
                        } else {
                            is_lock = true;
                            break;
                        }
                    }

                    var BuildVo = require("build_vo");
                    var build_vo = new BuildVo(buildingitem, is_lock, city_item.activate, city_item.desc)
                    // 缓存的红点状态
                    if (this.cache_tips_list && this.cache_tips_list[buildingitem.bid]) {
                        build_vo.setTipsStatus(this.cache_tips_list[buildingitem.bid])
                        this.cache_tips_list[v.bid] = null;
                    }
                    this.build_list_vo[buildingitem.bid] = build_vo;

                }
            }
        }
        gcore.GlobalEvent.fire(SceneEvent.CreateBuildVoOver);
    },

    getBuildList: function () {
        return this.build_list_vo
    },

    getBuildVo: function (id) {
        if (this.build_list_vo && this.build_list_vo[id])
            return this.build_list_vo[id];
    },

    openBuild: function (bid, extend) {
        switch (bid) {
            case SceneConst.CenterSceneBuild.shop: {                     // 商店
                var controller = require("mall_controller").getInstance();
                controller.openMallPanel(true)
            }
                break;

            case SceneConst.CenterSceneBuild.seerpalace: {               // 先知
                let seerpalace = require("seerpalace_controller").getInstance();
                seerpalace.openSeerpalaceMainWindow(true)
            }
                break;
            case SceneConst.CenterSceneBuild.fuse: {                     // 祭坛
                var hero_ctl = require("hero_controller").getInstance();
                hero_ctl.openHeroUpgradeStarFuseWindow(true);
            }
                break;
            case SceneConst.CenterSceneBuild.arena: {                    // 竞技
                var ArenaController = require("arena_controller");
                // ArenaController.getInstance().openArenaLoopMathWindow(true, this.relevance_params)
                ArenaController.getInstance().requestOpenArenWindow(true, extend)
            }
                break;
            case SceneConst.CenterSceneBuild.summon: {                   // 召唤
                var PartnersummonController = require("partnersummon_controller");
                PartnersummonController.getInstance().openPartnerSummonWindow(true);
            }
                break;
            case SceneConst.CenterSceneBuild.video: {                    // 录像

            }
                break;
            case SceneConst.CenterSceneBuild.startower: {                // 星命塔
                var Battleconst = require("battle_const");
                require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(Battleconst.Fight_Type.StarTower);
            }
                break;
            case SceneConst.CenterSceneBuild.mall: {                     // 锻造屋
                var controller = require("forgehouse_controller")
                controller.getInstance().openForgeHouseView(true)
            }
                break;
            case SceneConst.CenterSceneBuild.variety: {                  // 杂货店
                var controller = require("mall_controller").getInstance();
                controller.openVarietyStoreWindows(true);
            }
                break;
            case SceneConst.CenterSceneBuild.guild: {                    // 祭坛
                var hero_ctl = require("hero_controller").getInstance();
                hero_ctl.openHeroResetWindow(true);
            }
                break;
            case SceneConst.CenterSceneBuild.escort: {                   // 活动

            }
                break;
            case SceneConst.CenterSceneBuild.library: {                   // 图书馆
                require("hero_controller").getInstance().openHeroLibraryMainWindow(true)
            }
                break;
            case SceneConst.CenterSceneBuild.adventure: {                   // 冒险
                require("adventureactivity_controller").getInstance().openAdventureActivityMainWindow(true)
            }
                break;
            case SceneConst.CenterSceneBuild.ladder: {
            }
                break;
            case SceneConst.CenterSceneBuild.crossshow: {
                CrossshowController.getInstance().openCrossshowMainWindow(true);
            }
                break;
        }
        this.relevance_params = null;
    },


    /**@desc:设置建筑红点状态
        author:{author}
        time:2018-05-25 16:52:47
        --@id:
        --@data:红点状态可以是单个 boolean,也可以是 {bid=XX,status=boolean},也可以是[{bid=XX,status=boolean}, {bid=YY,status=boolean}] ,其他格式不做处理
        return
    */
    setBuildRedStatus: function (id, data) {
        if (!this.build_list_vo || !this.build_list_vo[id]) {

            if (!this.cache_tips_list) {
                this.cache_tips_list = {};
            }
            if (data instanceof Array) {
                if (!this.cache_tips_list[id]) {
                    this.cache_tips_list[id] = {};
                }
                for (var i in data) {
                    var v = data[i];
                    if (v.bid != null && typeof (v.bid) == "number") {
                        this.cache_tips_list[id][v.bid] = v;
                    }
                }
            } else if (typeof data == "object") {
                if (!this.cache_tips_list[id]) {
                    this.cache_tips_list[id] = {};
                }
                if (data.bid != null && typeof (data.bid) == "number") {
                    this.cache_tips_list[id][data.bid] = data;
                }
            } else {
                this.cache_tips_list[id] = data;
            }
            // cc.log("缓存的红点状态");
            // cc.log(this.cache_tips_list);
        } else {
            var build_vo = this.build_list_vo[id];
            build_vo.setTipsStatus(data);
        }
        // 监测红点
        var MainuiController = require("mainui_controller")
        MainuiController.getInstance().checkMainSceneIconStatus()
    },

    //获取建筑
    getBuildVoList: function () {
        return this.build_list_vo
    },

    // getCenterCityBuildById: function (id, finish_cb) {
        // if (this.main_scene) {
        //     this.main_scene.getBuildById(id, finish_cb);
        // } else {
            // this._finish_data = { id: id, finish_cb: finish_cb };
        // }
    // },

    // moveToBuild: function (id) {
    //     if (this.main_scene) {
    //         this.main_scene.moveToBuild(id);
    //     }
    // },

});

module.exports = MainSceneController;
