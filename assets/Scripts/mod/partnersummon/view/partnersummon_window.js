// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-14 09:29:03
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var SummonEvent = require("partnersummon_event");
var SummonConst = require("partnersummon_const");
var MainUiController = require("mainui_controller");
var GuideEvent = require("guide_event");

var PartnersSummon = cc.Class({
    extends: BaseView,

    properties: {
        summon_item: null,
        recruit_sk: null,
        summonType: 200,
    },

    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("partnersummon", "partnersummon_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.rleasePrefab = false;

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();

        var RoleController = require("role_controller");
        this.role_vo = RoleController.getInstance().getRoleVo();
        var ActionController = require("action_controller")
        if (ActionController.getInstance().action_operate) {
            ActionController.getInstance().action_operate.setVisible(false)
        }
    },

    initConfig: function() {
        this.partnersummon_config = Config.recruit_data.data_partnersummon_data;
    },

    openCallBack: function() {
        //Utils.getNodeCompByPath("container/main_container/close_btn/close_btn_label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        //Utils.getNodeCompByPath("container/main_container/partner_book_btn/book_btn_label", this.root_wnd, cc.Label).string = Utils.TI18N("图书馆");
        if (this.role_vo_attr) {
            gcore.GlobalEvent.unbind(this.role_vo_attr);
        }
    },

    registerEvent: function() {
        // 召唤信息更新
        gcore.GlobalEvent.bind(SummonEvent.UpdateSummonDataEvent, function(data) {
            this.updateSummonGroupData();
            this.updataRedPoint();
        }.bind(this));

        // 召唤成功
        this.addGlobalEvent(SummonEvent.PartnerSummonSuccess, function() {
            this.playRecruitEffect();
        }.bind(this));

        // 积分更新
        if (this.role_vo && !this.role_vo_attr) {
            this.role_vo_attr = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value) {
                if (key === "recruit_hero" && this.root_wnd)
                    this.updateScoreInfo();
            }.bind(this))
        }
    },

    openRootWnd: function(params) {
        this.initWidgets();
    },

    initWidgets: function() {

        MainUiController.getInstance().setMainUIBottomStatus(false);
        this.close_btn_nd = this.seekChild("close_btn");
        this.tips_btn_nd = this.seekChild("details_btn");
        this.score_btn_nd = this.seekChild("score_btn");
        this.advancedsummon_btn = this.seekChild("advancedsummon_btn");
        this.advancedsummon_redPoint = this.advancedsummon_btn.getChildByName("point");
        this.normalsummon_btn = this.seekChild("normalsummon_btn");
        this.normalsummon_redPoint = this.normalsummon_btn.getChildByName("point");
        this.friendsummon_btn = this.seekChild("friendsummon_btn");
        // this.advancedsummon_btn.getChildByName("bg").zIndex = 1;
        // this.normalsummon_btn.getChildByName("bg").zIndex = 1;
        // this.friendsummon_btn.getChildByName("bg").zIndex = 1;
        this.card_content_nd = this.seekChild("summon_item_root");
        this.progress_label_lb = this.seekChild("progress_label", cc.Label);
        this.background_nd = this.seekChild("background");
        this.select_nd = this.seekChild("summon_select");
        this.summonType = SummonConst.Summon_Type.Advanced;
        this.setBgSpriteShow();


        // 召唤动画
        this.recruit_ani_bg_nd = this.seekChild("recruit_ani_bg");
        this.recruit_ani_sk = this.seekChild("recruit_ani", sp.Skeleton);

        this.recruit_ani_sk.setCompleteListener(this.animaComplete.bind(this));
        this.recruit_ani_bg_nd.on(cc.Node.EventType.TOUCH_END, this.animaComplete, this);
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickCloseBtn, this);
        this.tips_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickTipsBtn, this);
        this.score_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickScoreBtn, this);
        this.advancedsummon_btn.on(cc.Node.EventType.TOUCH_END, this.didClickAdvancedSummonBtn, this);
        this.normalsummon_btn.on(cc.Node.EventType.TOUCH_END, this.didClickNormalSummonBtn, this);
        this.friendsummon_btn.on(cc.Node.EventType.TOUCH_END, this.didClickFriendSummonBtn, this);

        // var top_anima_path = PathTool.getSpinePath("E50065", "action");
        // this.loadRes(top_anima_path, function(ske_data) {
        //     this.top_anima_sk.skeletonData = ske_data;
        //     this.top_anima_sk.setAnimation(0, "status_0", true);
        // }.bind(this));

        this.updageWidget();
    },

    updageWidget: function() {
        this.updateSummonGroupData();
        this.refreshWelfarStatus();
        this.updateScoreInfo();
        this.updataRedPoint();
        var cur_score = this.role_vo.recruit_hero; // 积分信息
    },

    updataRedPoint(){
      if(!this.summon_item) return;
      if(this.advancedsummon_btn.active){
       
        var summomdata =  this.model.getSummonProtoDataByGroupID(SummonConst.Summon_Type.Advanced)
        var info = this.summon_item.getFreeInfo(1,summomdata);
        if(info.free_times>0){
          this.advancedsummon_redPoint.active = true;
        }else{
          this.advancedsummon_redPoint.active = false;
        }
      }

      if(this.normalsummon_btn.active){
        var summomdata =   this.model.getSummonProtoDataByGroupID(SummonConst.Summon_Type.Normal)
        var info =this.summon_item.getFreeInfo(1,summomdata);
        if(info.free_times>0){
          this.normalsummon_redPoint.active = true;
        }else{
          this.normalsummon_redPoint.active = false;
        }
      }

      if(this.friendsummon_btn.active&& info.group_id == this.summonType){
        //暂时不处理
      }
    },

    // 更新卡库列表 
    updateSummonGroupData: function() {
        var summon_list = this.model.getSummonGroupData();
        var summondata;
        for (var summon_i = 0; summon_i < summon_list.length; summon_i++) 
        {
            if(summon_list[summon_i].group_id == this.summonType)
            {
                summondata = summon_list[summon_i];
            }
        }
        if(this.summon_item == null)
        {
            var SummonItem = require("partnersummon_item");
            this.summon_item = new SummonItem(this.card_content_nd, 1, this.startRecruit.bind(this));
        }
        this.summon_item.updateData(summondata);
    },



    setBgSpriteShow:function(){
        var resources_id = SummonConst.Summon_Bg[this.summonType];
        var bg_path = PathTool.getUIIconPath("bigbg/partnersummon", resources_id);
        this.loadRes(bg_path, function(res) {
            this.background_nd.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))
        switch(this.summonType){
            case SummonConst.Summon_Type.Normal:
                //this.select_nd.x = this.normalsummon_btn.x;
                this.select_nd.parent = this.normalsummon_btn;
                break;
            case SummonConst.Summon_Type.Advanced:
                //this.select_nd.x = this.advancedsummon_btn.x;
                this.select_nd.parent = this.advancedsummon_btn;
                break;
            case SummonConst.Summon_Type.Friend:
                this.select_nd.parent = this.friendsummon_btn;
                break;
        }
        this.select_nd.x = 1.4;
        this.select_nd.y = -10.7;
        this.select_nd.zIndex = 10;
    },
    refreshWelfarStatus: function() {},

    updateScoreInfo: function() {
        var need_score = this.model.getScoreSummonNeedCount();
        var have_score = this.role_vo.recruit_hero;
        var progress_percen = 0;
        if (have_score >= need_score) {
            progress_percen = 1;
            //this.showScoreFullAction(true);
        } else {
            if (have_score >= 0) {
                progress_percen = have_score / need_score;
            }
            //this.showScoreFullAction(false);
        }

        var progress_str = have_score + "/" + need_score;
        this.progress_label_lb.string = progress_str;
        //this.progress_nd.scaleX = progress_percen;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        var ActionController = require("action_controller")
        if (ActionController.getInstance().action_operate) {
            ActionController.getInstance().action_operate.setVisible(true)
        }
        this.ctrl.openPartnerSummonWindow(false);
        MainUiController.getInstance().setMainUIBottomStatus(true);
    },

    didClickCloseBtn: function() {
        Utils.playButtonSound(ButtonSound.Close);
        this.ctrl.openPartnerSummonWindow(false);
    },

    didClickTipsBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        let newconfig = Utils.deepCopy(Config.recruit_data.data_explain);
        for(let c in newconfig){
            if(newconfig[c].id == 7){
                delete newconfig[c];
                continue;
            }
            newconfig[c].btnstatus = 1;
        }
        MainUiController.getInstance().openCommonExplainView(true, newconfig, Utils.TI18N("规则说明"));
    },

    didClickScoreBtn: function() {

        // var top_anima_path = PathTool.getSpinePath("E50065", "action");
        // LoaderManager.getInstance().releaseRes(top_anima_path);

        Utils.playButtonSound(ButtonSound.Normal);
        this.ctrl.openScoreTipWindow(true);
    },
    didClickAdvancedSummonBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        this.summonType = SummonConst.Summon_Type.Advanced;
        this.updateSummonGroupData();
        this.setBgSpriteShow();
        this.updataRedPoint()
    },
    didClickNormalSummonBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        this.summonType = SummonConst.Summon_Type.Normal;
        this.updateSummonGroupData();
        this.setBgSpriteShow();
        this.updataRedPoint()
    },
    didClickFriendSummonBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        this.summonType = SummonConst.Summon_Type.Friend;
        this.updateSummonGroupData();
        this.setBgSpriteShow();
        this.updataRedPoint()
    },

    // 积分抖动效果
    showScoreFullAction: function(status) {
        this.score_btn_nd.rotation = 1;
        this.score_btn_nd.stopAllActions();
        if (!status) return;
        var act_1 = cc.rotateBy(0.05, -10);
        var act_2 = cc.rotateBy(0.1, 20);
        var act_3 = cc.rotateBy(0.05, -10);
        var delay = cc.delayTime(0.7);
        var seq_1 = cc.sequence(act_1, act_2, act_3);
        var seq_2 = cc.repeat(seq_1, 5);
        var seq_3 = cc.sequence(seq_2, delay);
        var final = cc.repeatForever(seq_3);
        this.score_btn_nd.runAction(final);
    },

    startRecruit: function(group_id, times, recruit_type) {
        this.last_recruit = {};
        this.last_recruit.group_id = group_id;
        this.last_recruit.times = times;
        this.last_recruit.recruit_type = recruit_type;
        this.sendRecruitProtocal(group_id, times, recruit_type);
    },

    regainRecruit: function() {
        if (!this.last_recruit) return;

        if (this.last_recruit.recruit_type == 1) {
            this.last_recruit.recruit_type = 4;
            // if (this.last_recruit.group_id == SummonConst.Summon_Type.Advanced) {
            //     this.item_list[2].regainRecruit();
            //     return;
            // } else if (this.last_recruit.group_id == SummonConst.Summon_Type.Normal) {
            //     this.item_list[0].regainRecruit();
            //     return;                
            // }
        }
        this.sendRecruitProtocal(this.last_recruit.group_id, this.last_recruit.times, this.last_recruit.recruit_type);
    },

    sendRecruitProtocal: function(group_id, times, recruit_type) {
        let interval;
        if (times == 1) {
            interval = 500;
        } else {
            interval = 2000;
        }
        if (this.last_time && Math.abs(new Date().getTime() - this.last_time) < interval) {
            //点击间隔
            message(Utils.TI18N("点击过快"))
            if (this.ctrl.getSummonResultRoot()) {
                this.model.clickIntervalStatus(true)
            }
            return
        }
        this.last_time = new Date().getTime() //gcore.SmartSocket.getTime()
            // 在此处进行道具的判断和提示。
        this.ctrl.send23201(group_id, times, recruit_type);
    },

    // 播放召唤动画
    playRecruitEffect: function() {
        var recruit_data = this.model.getRecruitData();

        if (!recruit_data) return;

        // var recruit_cgf_item = this.partnersummon_config[recruit_data.group_id];
        var action_name = "action";
        // if (recruit_cgf_item)
        //     action_name = recruit_cgf_item.action_name;
        // var effect_res = PathTool.getEffectRes("120");
        var effect_path = null;
        var b = false;
        for(let index in recruit_data.partner_bids){
          let info = recruit_data.partner_bids[index]
          if(info){
            if(info.init_star ==5 ){
              b = true;
              break;
            }
          }
        }
        if(b){
          effect_path = "spine/E80002/action.atlas";
        }else{
          effect_path = "spine/E80001/action.atlas";
        }
        // var effect_path = PathTool.getSpinePath(effect_res, "action");

        this.recruit_ani_bg_nd.active = true;
        this.loadRes(effect_path, function(recruit_sk) {
            this.recruit_ani_sk.skeletonData = recruit_sk;
            this.recruit_ani_sk.setAnimation(0, action_name);
        }.bind(this));

        // 播放音效
        var music_name = "recruit_" + action_name;
        Utils.playEffectSound(AUDIO_TYPE.Recruit, music_name);

        MainUiController.getInstance().setMainUIBottomStatus(false);
        MainUiController.getInstance().setMainUITopStatus(false);
    },

    animaComplete: function() {
        //MainUiController.getInstance().setMainUIBottomStatus(true);
        MainUiController.getInstance().setMainUITopStatus(true);
        this.recruit_ani_sk.clearTrack(0);
        this.recruit_ani_bg_nd.active = false;
        this.ctrl.openSummonGainWindow(true);
    },

    deleteMe: function() {
        this._super();
        // for (var item_i in this.item_list) {
        //     this.item_list[item_i].deleteMe();
        // }
        if(this.summon_item!=null){
            this.summon_item.deleteMe();
        }
    },

    // getSummonItemRoot: function(name, get_cb) {
    //     this.root_item_get_cb = get_cb;
    //     this.root_item_get_name = name;
    //     if (this.item_list[0]) {
    //         this.item_list[0].getSummonItemRoot(name, get_cb);
    //     }
    // },
})