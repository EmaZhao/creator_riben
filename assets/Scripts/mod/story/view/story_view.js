// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-15 20:40:37
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleController = require("battle_controller");
var StoryEvent = require("story_event");
var StoryTalk = require("story_talk");
var BattleConst = require("battle_const");
var StartowerController = require("startower_controller");
var LevupgradeController = require("levupgrade_controller");
var GuideConst = require("guide_const");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");

var StoryView = cc.Class({
    extends: BaseView,
    ctor: function () {
        // this.prefabPath = PathTool.getPrefabPath("story", "story_base_panel");
        this.viewTag = SCENE_TAG.msg;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.initRootWind();
    },

    initRootWind: function () {
        this.root_wnd = new cc.Node();
        var root_wdg = this.root_wnd.addComponent(cc.Widget);
        root_wdg.isAlignBottom = true;
        root_wdg.isAlignTop = true;
        root_wdg.top = 0;
        root_wdg.bottom = 0;
        // this.root_wnd.setContentSize(view_size);
        // this.root_wnd.setPosition(-view_size.width*0.5, -SCREEN_HEIGHT*0.5)
        this.event_block = this.root_wnd.addComponent(cc.BlockInputEvents);
        this.event_block.enabled = false;
        // this.root_wnd.
        ViewManager.getInstance().addToSceneNode(this.root_wnd, this.viewTag);
        // 打开回调
        this.openCallBack();
        // 开启注册时间
        this.registerEvent();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.cur_drama = null;                                    // 当前剧情的配置数据
        this.cur_act_list = {};                                   // 记录当前动作列表
        this.cur_step = 0;                                        // 当前动作步数
        this.talk = null;                                         // 记录对话界面
        this.is_next_action = false;                              // 是否可以点击跳过的剧情
        this.battle_ctrl = BattleController.getInstance()
        if (!this.battle_ctrl.getIsNoramalBattle()) {
            this.battle_model = this.battle_ctrl.getModel();
        } else {
            this.battle_model = this.battle_ctrl.getHookModel();
        }
        this.cur_bubble = null;                                   // 当前显示的泡泡
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(StoryEvent.READ_CONFIG_COMPLETE, function () {
            var result_view = BattleController.getInstance().getFinishView(BattleConst.Fight_Type.Darma);
            var star_result = StartowerController.getInstance().getResultWindow();
            var is_wait_levupgrade = LevupgradeController.getInstance().waitLevupgrade();

            if (!result_view && !star_result && !is_wait_levupgrade) {
                cc.log("正常执行引导");
                this.playAct();
            } else {
                cc.log("缓存剧情因素");
                cc.log(!!result_view);
                cc.log(star_result);
                cc.log(is_wait_levupgrade);
                if (is_wait_levupgrade)
                    LevupgradeController.getInstance().logStatus();

                if (!this.can_play_drama_event) {
                    this.can_play_drama_event = this.addGlobalEvent(StoryEvent.PREPARE_PLAY_PLOT, function () {
                        if (this.can_play_drama_event)
                            this.removeGlobalEvent(this.can_play_drama_event);
                        this.can_play_drama_event = null;
                        this.playAct();
                    }.bind(this));
                }
            }

        }.bind(this));


        this.addGlobalEvent(StoryEvent.PLAY_NEXT_ACT, function () {
            this.playNextAct();
        }.bind(this));

        this.addGlobalEvent(StoryEvent.SKIP_STORY, function () {                  // 跳过剧情
            this.storyOverHandler();
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {

    },

    // desc:引导触发的时候做的一些事情,比如关闭界面等
    doSomeThingForDrama: function () {
        if (this.cur_drama && (this.cur_drama.bid == GuideConst.special_id.guild || this.cur_drama.bid == GuideConst.special_id.seerpalace || this.cur_drama.bid == GuideConst.special_id.stronger)) {
            // 以上剧情特殊处理，不做关闭界面
            return
        }
        var new_btn_index = MainuiController.getInstance().getMainUIIndex();
        if (new_btn_index != MainuiConst.new_btn_index.drama_scene && new_btn_index != MainuiConst.new_btn_index.main_scene) {
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene);
        } else {
            // 公会引导结束之后,会跟一个剧情,这个时候这个剧情是不要关闭窗体的
            if (this.cur_drama && this.cur_drama.bid != GuideConst.special_id.guild && this.cur_drama.bid != GuideConst.special_id.market && this.cur_drama.bid != GuideConst.special_id.seerpalace && this.cur_drama.bid != GuideConst.special_id.stronger) {
                Utils.closeAllWindow();
            }
        }
    },

    playAct: function () {
        this.cur_drama = this.model.getCurStory();
        var adult_story_state = require("hero_controller").getInstance().getModel().isAdultStoryState()||false;
        var status = require("LoginPopupManager").getInstance().getIsPopupStatus();
        var bStoryStatus = require("role_controller").getInstance().bStoryStatus;
        if (game.finish_loading &&!adult_story_state && !status && !bStoryStatus) {
            cc.log("当前执行剧情配置数据");
            cc.log(this.cur_drama);
            if (this.cur_drama) {
                this.event_block.enabled = true;
                if (!this.talk) {
                    this.talk = new StoryTalk(this);
                    this.talk.setParent(this.root_wnd);
                    this.talk.show(function () {
                        this.addTicket(this.readyAct.bind(this), 0.1);
                    }.bind(this));
                } else {
                    this.readyAct();
                }
            }
        } else {
            this.addGlobalEvent(EventId.LOADING_FINISH, function () {
                if (this.cur_drama)
                    this.playAct();
            }.bind(this));
            this.addGlobalEvent(EventId.GUIDE_TO_CONTINUE, function () {
              if (this.cur_drama)
                  this.playAct();
            }.bind(this));
        }
    },

    readyAct: function () {
        var act_list = this.cur_drama.act;
        this.cur_act_list = Utils.deepCopy(act_list);

        this.doSomeThingForDrama();
        this.model.setStoryState(true);

        if (!this.cur_act_list || this.cur_act_list.length == 0) {
            this.storyOverHandler();
            this.ctrl.send11100(this.model.getCurStoryBid(), 0);
            return;
        }

        this.cur_step = 0;
        this.playNextAct();
    },

    playNextAct: function () {
        if (!this.model.isStoryState()) return;
        this.is_next_action = false;

        if (this.cur_step > 0)
            this.ctrl.send11100(this.model.getCurStoryBid(), this.cur_step);

        this.cur_bubble = null;
        this.cur_step += 1;

        if (this.cur_act_list && this.cur_act_list.length > 0) {
            if (this.hasTicket("delayPlayStory")) {
                this.delTicker("delayPlayStory")
            }
            var obj = this.cur_act_list.shift();
            if (typeof obj == "object") {
                this.actLonelyPlayer(obj, false, this.cur_step);
            } else {
                cc.log("特殊的剧情数据HHHHH");
                cc.log(obj);
            }
            // this.ctrl.send11100(this.model.getCurStoryBid(), this.cur_step);
        } else {
            this.ctrl.send11100(this.model.getCurStoryBid(), this.cur_step)
            this.storyOverHandler();
        }
    },

    // 跳过剧情
    storyOverHandler: function () {
        // this.ctrl.send11100(this.model.getCurStoryBid(), this.cur_step + 1)

        // 对白
        if (this.talk) {
            this.talk.clearData();
            // this.talk.setVisible(false);
            this.talk.changeStatus(false);
        }
        if (this.cur_drama && this.cur_drama.bid != null) {
            this.model.saveDrama(this.cur_drama.bid);
        }
        this.event_block.enabled = false;

        this.clearDramaData();
    },

    clearDramaData: function () {
        this.cur_step = 0;
        this.model.setStoryState(false);
        this.model.clearActData();
        this.cur_drama = null;
        this.is_next_action = false;
    },

    // 动作组的播放 obj 动作组对象
    // actTeamPlayer: function(obj) {
    //     var time = 0;
    //     for (var act_i in obj) {
    //         var act = obj[act_i];
    //         time = Math.max(time, act[1] + act[2]);
    //         this.addTicket(this.actLonelyPlayer.bind(this, act, true), act[1]);
    //     }

    //     if (time > 0){
    //         this.addTicket(this.playNextAct.bind(this), time);
    //     } else {
    //         this.playNextAct();
    //     }
    // },

    // -- 单个动作的播放 obj 动作对象 is_async 是否异步
    actLonelyPlayer: function (obj, is_async, step) {
        var obj = Utils.deepCopy(obj);
        var is_drama = false;
        switch (obj[0]) {
            case "unit_dialog": {
                this.showTalk(obj[3], obj[4], obj[5], obj[6], obj[7]);
                this.playActSound(obj[8]);
                is_drama = true;
            }
                break;
            case "unit_opening": {
                this.playWelcom(true, obj[3]);
                this.playActSound(obj[4]);
            }
                break;
            case "comic_begin": {
                this.playStartManga(true, obj[3], obj[4]);
                this.playActSound(obj[5]);
            }
                break;
            case "unit_black": {
                this.showBlackCurtain(true, obj[3]);
                this.playActSound(obj[4]);
            }
                break;
        }

        if (this.waiting_timer) {
            gcore.Timer.del(this.waiting_timer);
            this.waiting_timer = null;
        }

        if (!is_async && is_drama) {
            var total_time = (obj[1] || 0) + (obj[2] || 0);
            if (total_time == 0) {
                this.playNextAct();
            } else {
                this.addTicket(this.playNextAct.bind(this), total_time, "delayPlayStory");
            }

            // 加多一个关闭的计时器
            this.waiting_timer = gcore.Timer.set(function () {
                // this.storyOverHandler();
            }.bind(this), (total_time + 3) * 1000)
        } else {
            this.storyOverHandler();
        }
    },

    playActSound: function (sound_name) {
        if (!sound_name) return;
        Utils.playEffectSound(AUDIO_TYPE.Drama, sound_name);
    },

    playWelcom: function () {

    },

    showTalk: function (type, bid, actiontype, name, msg) {
        this.is_next_action = true;
        // if (!this.talk) {
        //     this.talk = new StoryTalk(this);
        //     this.talk.setParent(this.root_wnd);
        //     this.talk.show();
        // } else {
        this.talk.changeStatus(true);
        // }

        this.talk.addMessage(type, bid, actiontype, name, msg);
    },

    playStartManga: function () {

    },

    showBlackCurtain: function () {

    },

    playStepOver: function () {
        // if (this.cur_act_list.length === 0)
        // this.storyOverHandler();
    },

})