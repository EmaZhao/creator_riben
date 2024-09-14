// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var EnterPanel = require("enter_panel");
var UserPanel = require("user_panel");
var LoaderManager = require("loadermanager")

var LoginWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("login", "login_window");
        this.viewTag = SCENE_TAG.dialogue;
        this.panel_list = [];
        this.win_type = WinType.Full;

        this.mask_max_height = 260;
        this.mask_min_height = 160;
        this.is_move = false;
        this.is_touch = false;
        this.change_progress = false;
    },

    openCallBack: function() {
        Utils.getNodeCompByPath("progress_con/total_progress_bar/progress_des", this.root_wnd, cc.Label).string = Utils.TI18N("加载配置文件");
        Utils.getNodeCompByPath("progress_con/protress_des", this.root_wnd, cc.Label).string = Utils.TI18N("游戏怎么玩？推图、爬塔、打Boss、养英雄玩竞技，感受成长的乐趣");
        this.background = this.root_wnd.getChildByName("background");
        this.background_component = this.background.getComponent(cc.Sprite);;
        this.logo_nd = this.seekChild("logo");
        this.logoX_nd = this.seekChild("logoX");
        this.logo_nd.active = window.GAME_TYPE == "";
        this.logoX_nd.active = !this.logo_nd.active;
        // this.background.scale = 1.25;

        // 版本信息
        this.label_component = this.seekChild("label_version", cc.Label);
        // this.root_wnd.getChildByName("label_version").getComponent(cc.Label);

        // if(!window.IS_PC){//都加
          this.label_notice1_nd = this.root_wnd.getChildByName("label_notice1");
          this.label_notice1_nd.active = true;
          this.label_notice1_nd.getComponent(cc.Label).string = "©2013 EXNOA LLC ©DASH STUDIO Co.,Ltd.";
        // }
        // 版号信息,原始csb里面没有这个,后面如果需要重新导入的时候,要手动添加,但是不建议手动创建
        // this.label_notice = this.root_wnd.getChildByName("label_notice");
        // this.label_notice.getComponent(cc.Label).string = Utils.TI18N("新广出审【2017】 368号\nISBN 968 - 5 - 458 - 03215 - 2\n文网游备字 【2017】-RPG 0918号\n出版单位：上海科学技术文献出版社有限公司");
        this.progress_bar_nd = this.seekChild("total_progress_bar");
        this.progress_bar = this.progress_bar_nd.getComponent(cc.ProgressBar);
        this.sco_progress_bar = this.seekChild("sco_progress_bar", cc.ProgressBar);
        this.container = this.root_wnd.getChildByName("container")
            // this.spine            = this.seekChild("spine", sp.Skeleton);
        this.mask_bg_nd = this.seekChild("mask_bg");
        this.mask_bg_1_nd = this.seekChild("mask_bg_1");
        this.progress_con_nd = this.seekChild("progress_con");
        this.progress_des_lb = this.seekChild("progress_des", cc.Label);
        this.progress_num_lb = this.seekChild("progress_num", cc.Label);
        this.protress_des_lb = this.seekChild("protress_des", cc.Label);

        // var testBtn = this.root_wnd.getChildByName("actionfund_1002")
        // testBtn.on(cc.Node.EventType.TOUCH_END, this.onClickRootWnd, this);

        this.effect_nd = this.seekChild("effect_node");
        this.sp_node = this.seekChild("sp_node");
        this.target_node = this.seekChild("targe_node");
        this.touch_nd = this.seekChild("touch");
        this.effect = this.seekChild("effect");

        this.touch_nd.on(cc.Node.EventType.TOUCH_END, function() {
            if (this.is_move == false)
                this.moveEffectNd();
        }, this)

        // this.background.scale *= FIT_SCALE;
    },

    registerEvent: function() {},

    openRootWnd: function() {
        // this.playBackgroundMusic();
        //加载背景资源
        // this.addTicket(function() {
        //     if (!this.background_component.spriteFrame) {
        //         this.loadRes("ui_res/login2/loading_bg_1.jpg", (function (res) {
        //             this.background_component.spriteFrame = res;
        //         }).bind(this))
        //     }
        // }.bind(this), 0.1)

        // 加载背景动画,
        // this.addTicket(function() {
        //     this.loadRes("spine/E51008/action.atlas", (function (res) {
        //         this.spine.skeletonData = res;
        //         this.spine.setAnimation(0, "action", true);
        //     }).bind(this))
        // }.bind(this), 0.3)


        //这里需要判断一下平台或者包
        if (USE_SDK) { // Android原生SDK
            // 初始化SDK并进行登录
            SDK.initSDK();
            // DMM无需走注册登录，已实现自动登录
            if(PLATFORM_TYPR != "DMM_SDK") {
                this.changeSubPanel(2);
            }
        } else {
            // 切换面板类型
            if (this.open_params) {
                this.changeSubPanel(this.open_params.index);
            }
        }

        //加载完成才隐藏初始界面和进度条
        let splash = document.getElementById('splash');
        if (splash) {
            splash.style.display = 'none';
        }
        this.showLogoEffect();
    },

    //标题特效
    showLogoEffect:function() {
      this.effect_Id = this.effect.addComponent(sp.Skeleton);
      let res = "spine/E50071/action.atlas";
      this.loadRes(res, function(res_object) {
          this.effect_Id.skeletonData = res_object;
          this.effect_Id.setAnimation(1, PlayerAction.action, true);
      }.bind(this))
    },

    // 切换面板类型
    changeSubPanel: function(index) {
        if (this.cur_panel) {
            this.cur_panel.hide()
            this.cur_panel = null;
        }
        index = index ? index : 1;
        var panel = this.panel_list[index];
        if (panel == null) {
            if (index == 1) {
                panel = new UserPanel();
            } else if (index == 2) {
                panel = this.enter_panel = new EnterPanel();
            }
            this.panel_list[index] = panel;
            panel.setParent(this.container);
        }
        if (panel) {
            panel.show();
            this.cur_panel = panel
        }
    },

    closeCallBack: function() {
        for (const key in this.panel_list) {
            if (this.panel_list.hasOwnProperty(key)) {
                const element = this.panel_list[key];
                element.deleteMe();
            }
        }
        this.cur_panel = null

        if (this.sp_node) {
            this.sp_node.destroy();
            this.sp_node = null;
        }

        if (this.randow_timer)
            gcore.Timer.del(this.randow_timer);
    },

    showLoading: function() {
        this.enter_panel.setVisible(false);
        this.progress_con_nd.active = true;
        this.mask_bg_nd.active = true;
        this.mask_bg_1_nd.active = false;
        this.mask_bg_nd.height = this.mask_max_height;
        // this.spine.clearTracks();
        this.randowTitle();

        //第一次登陆领紫武
        // this.showFirstRoleEffect();
    },

    updateLoading: function(progress) {
        this.progress_bar.progress = progress;

        if (progress > 0.52 && !this.change_progress) {
            this.progress_des_lb.string = Utils.TI18N("加载资源文件");
            this.change_progress = true;
        }

        if (progress > 0) {
            if (USE_SDK == true && PLATFORM_TYPR == "SH_SDK" && !IS_LOADING) {
                SDK.dataPlacement(90000);
            }
            IS_LOADING = true;
        } else {
            IS_LOADING = false;
        }

        if (progress > 0.7) {
            this.is_touch = true;
        }
        if (progress >= 1) {
            if (this.is_move == false)
                this.moveEffectNd();
        }
    },

    updateSeconLoading: function(progress) {
        this.sco_progress_bar.progress = progress;
        var value = Math.ceil(progress * 100)
        if (value > 100) value = 100;
        this.progress_num_lb.string = "[" + value + "%" + "]";
    },

    onClickRootWnd: function() {
        SDK.sdkLogin();
        SDK.pay();
    },

    getTestAccount: function() {
        if (this.enter_panel)
            return this.enter_panel.getTestAccount();
    },

    // 随机提示
    randowTitle: function() {
        this.randow_timer = gcore.Timer.set(function() {
            var loginInfo = require("login_controller").getInstance().getCurRoleInfo();
            var login_des = [];
            var lev = 0;
            if (loginInfo && loginInfo.lev)
                lev = loginInfo.lev;

            for (var des_i = 1; des_i < 14; des_i++) {
                if (Lang["LOADING_DESC_" + des_i]) {
                    if (LoadingDes[des_i]) {
                        if (lev < LoadingDes[des_i]) {
                            continue;
                        }
                    }
                    login_des.push(Lang["LOADING_DESC_" + des_i]);
                }
            }

            var index = Math.ceil(Math.random() * 10) % login_des.length + 1;
            if (login_des[index]) {
                this.protress_des_lb.string = login_des[index];
            }

        }.bind(this), 2000, -1)
    },

    playBackgroundMusic: function() {
      Utils.playMusic(AUDIO_TYPE.SCENE, "s_001", true);
    },

    //展示第一次角色领取紫装特效
    showFirstRoleEffect: function() {
        let LoginController = require("login_controller");
        let status = LoginController.getInstance().getModel().getFirstRoleData();
        cc.log(status)
        if (!status) return
        if (!this.effect_nd) return
        this.effect_sk = this.effect_nd.addComponent(sp.Skeleton);
        let res = "spine/E99998/action.atlas";
        this.loadRes(res, function(res_object) {
            this.effect_sk.skeletonData = res_object;
            this.effect_sk.setAnimation(1, PlayerAction.action, true)
        }.bind(this))

        this.get_sp = this.sp_node.addComponent(cc.Sprite);
        this.target_sp = this.target_node.addComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("login2", "login2_1018"), function(sp) {
            this.get_sp.spriteFrame = sp;
        }.bind(this))
        this.loadRes(PathTool.getUIIconPath("login2", "login2_1019"), function(sp) {
            this.target_sp.spriteFrame = sp;
        }.bind(this))
    },

    moveEffectNd: function() {
        if (!this.is_touch) return
        this.is_move = true;
        this.sp_node.active = false;
        this.target_node.active = false;
        let move_to = cc.moveTo(0.7, cc.v2(this.effect_nd.x, this.effect_nd.y + 500));
        let callback = cc.callFunc(function() {
            this.effect_nd.active = false;
        }.bind(this))
        this.effect_nd.runAction(cc.sequence(move_to, callback));
    },
});