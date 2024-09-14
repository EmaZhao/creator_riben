// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      主场景的入口
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

require("baseclass");
require("basecontroller");
require("baseview");
require("basepanel");
require("global");
require("viewmanager");
require("globalmessagemgr");
require("config");

window.Config = {};
window.gcore = require("game-core-js-min");
window.Log = gcore.Log;
window.gdata = gcore.CoreUtils.getDataKeyVal;

var LoaderManager = require("loadermanager");
var LoginController = require("login_controller");
var ZipLoader = require("ZipLoader");
var DownloadManager = require("downloadmanager");

cc.Class({
    extends: cc.Component,

    properties: {
        game_canvas: { default: null, type: cc.Canvas },
    },

    ctor: function () {
        this.finish_loading = false;
        this.preload_loading = false;
        window.game = this;
    },


    onLoad: function () {
        this.adjustFrame();

        //游戏加载开始上报
        if (cli_log && cli_log.log_loading_start) {
            cli_log.log_loading_start();
        };

        // cc.game.setFrameRate(60);
        // 调整适配策略        
        var screen_scale = SCREEN_WIDTH / SCREEN_HEIGHT;
        var view_size = cc.view.getFrameSize();
        var cur_scale = view_size.width / view_size.height;
        window.isMobile = true;

        if (cc.sys.os == cc.sys.OS_OSX || cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os == cc.sys.OS_LINUX)
            window.isMobile = false;

        if (!OUT_NET){
            window.isMobile = true;
            if(window.WEN_DING_FU){
                if (cc.sys.os == cc.sys.OS_OSX || cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os == cc.sys.OS_LINUX)
                    window.isMobile = false;
            }
        }
        

        if (isMobile) {
            if (cur_scale > screen_scale) {   // 适应高，调整宽
                window.FIT_HEIDGHT = true;
                this.game_canvas.fitHeight = true;
                this.game_canvas.fitWidth = false;
                window.FIT_SCALE = Math.ceil(cur_scale / screen_scale * 100) / 100;
            } else {                          // 适应宽，调整高
                window.FIT_WIDTH = true;
                this.game_canvas.fitHeight = false;
                this.game_canvas.fitWidth = true;
                window.FIT_SCALE = Math.ceil(screen_scale / cur_scale * 100) / 100;
            }
        } else {
            window.IS_PC = true;
            if(window.IS_PC){
              this.game_canvas.designResolution = new cc.Size(2200, 1280);
              this.node.setContentSize(2200,1280);
              var bg_sprite = this.node.getChildByName("background").getComponent(cc.Sprite);
              LoaderManager.getInstance().loadRes("ui_res/pcui/Pc_Beijin_1_1.jpg",function(res){
                bg_sprite.spriteFrame = res;
                bg_sprite.node.width = 2184;
                bg_sprite.node.height = 1280;
              }.bind(this))
            }
            this.game_canvas.fitHeight = true;
            this.game_canvas.fitWidth = true;
            window.FIT_SCALE = 1;
        }

        var graphics_cp = this.node.addComponent(cc.Graphics);
        graphics_cp.clear();
        graphics_cp.fillColor = cc.color(111, 111, 111, 128);
        graphics_cp.rect(-0.5 * this.node.width, -0.5 * this.node.height, this.node.width, this.node.height);
        graphics_cp.fill();

        this.scheduleOnce(function () {
            LoaderManager.getInstance().loadPrefab("prefab/login/game_views", function (view_data) {
                if (view_data) {
                    var views = view_data;
                    this.node.addChild(views);
                    this.views_js = views.addComponent("game_views");
                    this.views_js.initWaitingView();
                    this.initViewTags(this.views_js);
                    // if (window.FIT_SCALE == 1 && !window.isMobile && window.IS_PC) {
                        this.views_js.showFrame();
                    // }
                }
            }.bind(this));

            // var url = URL_CONFIG + "?platform=" + PLATFORM + "&chanleId=" + CHANNEL + "&time=" + Date.now();        
            // cc.loader.load(url, (function(err, data){
            //     data = JSON.parse(data);

            //     cc.log("DDDDDDDDDDDDDDDDDDD");
            //     cc.log(data);

            //     for(var k in data){
            //         Log.debug(k, data[k]);
            //         window[k] = data[k];
            //     }
            //     this.url_init = true;
            // if (this.view_init)
            // LoginController.getInstance().openLoginWindow({status:true, index:1});
            // }).bind(this)); 

            this.initPreloadRes();
        }.bind(this), 0.1);

        if (window.ImportConfigs) {
            console.log(window.ImportConfigs)
        }
    },

    initViewTags: function (views) {
        // 储存各个层级节点
        ViewManager.getInstance().addSceneNode(SCENE_TAG.scene, views.scene_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.battle, views.battle_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.effect, views.effect_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.ui, views.ui_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.win, views.win_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.top, views.top_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.dialogue, views.dialogue_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.msg, views.msg_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.reconnect, views.reconnect_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.loading, views.loading_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.pcLeft, views.pc_left_tag);
        ViewManager.getInstance().addSceneNode(SCENE_TAG.pcRight, views.pc_right_tag);

        this.view_init = true;

        // if (this.url_init)
        LoginController.getInstance().openLoginWindow({ status: true, index: 1 });
    },

    initConfigs: function (finish_cb) {
        // 加载配置表
        // var config_zip_url = DATA_URL + "data.zip" + "?" + DATA_VER;
        LoaderManager.getInstance().initConfigs(function (progress) {
            if (progress > 1)
                progress = 1;
            if (typeof progress == "number") {
                LoginController.getInstance().updateLoading(progress * 0.5);
                LoginController.getInstance().updateSeconLoading(progress);
            } else {
                var RoleController = require("role_controller")
                RoleController.getInstance();
                // LoaderManager.getInstance().initConfigScript();
                var ModuleInfo = require("modulelist");
                for (var k in ModuleInfo.module_list) {
                    var c = require(ModuleInfo.module_list[k]);
                    if (c.getInstance) {
                        c.getInstance();
                    }
                }
                if (finish_cb)
                    finish_cb();

                
            }
        }.bind(this));
    },

    // 协议请求更新
    updateProtoProgress: function (proggress) {
        var cur_progress = 0.5 + proggress * 0.4;
        LoginController.getInstance().updateLoading(cur_progress);
        LoginController.getInstance().updateSeconLoading(proggress);
    },

    update: function (dt) {
        gcore.SmartSocket.handleMsg();
        var BattleController = require("battle_controller");
        BattleController.getInstance().update(dt);
    },

    initMsgView: function () {
        this.views_js.initMsgView();
    },

    addGuideRes: function () {
        this._pre_load_res.push("prefab/drama/guide_main_view.prefab");
        this._pre_load_res.push("prefab/drama/dramatalk_view.prefab");
    },

    addChapterRes: function(chapter_id) {
        if (!chapter_id)
            chapter_id = 1;
        var drama_config = Config.dungeon_data.data_drama_world_info["1"][chapter_id];
        var battle_res_id = drama_config.map_id;
        var drama_paths = PathTool.getBattleDrameBg(battle_res_id);        
        this._pre_load_res.push(drama_paths.s);
        this._pre_load_res.push(drama_paths.f);
    },

    addRenameRes: function () {
        this._pre_load_res.push("prefab/login/login_story_window.prefab");
        this._pre_load_res.push("prefab/roleinfo/role_setname_view.prefab");
        var sketon_path = PathTool.getSpinePath(PathTool.getEffectRes(237), "action")
        this._pre_load_res.push(sketon_path);
    },

    initPreloadRes: function () {
        this._pre_load_res = [
            "spine/E50069/action.atlas"
        ]

        for (var atlas_i in cacheAtlas) {
            var atlas_path = cacheAtlas[atlas_i];
            this._pre_load_res.push(atlas_path + ".plist");
        }

        for (var prefab_i in cachePrefabs) {
            var prefab_path = "prefab/" + cachePrefabs[prefab_i] + ".prefab";
            this._pre_load_res.push(prefab_path);
        }
    },

    preloadRes: function (finish_cb) {
        var cur_num = 0;
        this.preload_loading = true;
        LoaderManager.getInstance().initConfigScript();
        
        for (var res_i in this._pre_load_res) {
            this.waiting_timer = gcore.Timer.set(function (res_path) {
                LoaderManager.getInstance().loadRes(res_path, function (res_i) {
                    cur_num++;
                    var progress = cur_num / this._pre_load_res.length;
                    var cur_progress = 0.5 + progress * 0.4;
                    LoginController.getInstance().updateLoading(cur_progress);
                    LoginController.getInstance().updateSeconLoading(progress);

                    if (cur_num == this._pre_load_res.length && finish_cb) {
                        // var ModuleInfo = require("modulelist");
                        // for (var k in ModuleInfo.module_list) {
                        //     var c = require(ModuleInfo.module_list[k]);
                        //     if (c.getInstance) {
                        //         c.getInstance();
                        //     }
                        // }

                        this.preload_loading = false;

                        finish_cb();

                        if (!OUT_NET) {
                            var GmCmd = require("gmcmd");
                            GmCmd.show();
                        }
                    }

                }.bind(this, res_i));
            }.bind(this, this._pre_load_res[res_i]), 100, this._pre_load_res.length)
        }
    },

    updateLoadingStatus: function (status) {
        this.finish_loading = status;
    },

    updateWaitingStatus: function (status) {
        if (this.views_js)
            this.views_js.updateWaitingStatus(status);
    },

    relogin: function () {
        this.scheduleOnce(function () {
            if(PLATFORM_TYPR == "SH_SDK"){
                LoginController.getInstance().openLoginWindow({ status: true, index: 1 });
            }else{
                window.location.reload();
            }
        }, 2)
    },

    // 调整帧率
    adjustFrame: function() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            if (cc.sys.osVersion < 8) {
                cc.game.setFrameRate(40);
            } else {
                cc.game.setFrameRate(60);                
            }
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            cc.game.setFrameRate(40);
        } else {
            cc.game.setFrameRate(60);
        }
    },

});
