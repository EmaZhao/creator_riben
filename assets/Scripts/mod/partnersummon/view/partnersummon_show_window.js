// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-16 11:47:41
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GuideEvent = require("guide_event");
var PartnersummonConst = require("partnersummon_const");

var PartnersummonShowWindow = cc.Class({
    extends: BaseView,

    properties: {
        skelton_data: null,
        conmmon_sp: null,
    },

    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("partnersummon", "partnersummon_show_window");
        this.viewTag = SCENE_TAG.dialogue; // 该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; // 是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.show_bids = arguments[1];
        this.finish_cb = arguments[2];
        this.bg_type = arguments[3];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.partnersummon_config = Config.recruit_data.data_partnersummon_data;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        Utils.getNodeCompByPath("show_conten/share_btn/again_one_txt", this.root_wnd, cc.RichText).string = Utils.TI18N("分享");
        Utils.getNodeCompByPath("show_conten/share_btn/again_ten_txt", this.root_wnd, cc.RichText).string = Utils.TI18N("再抽十次");
        Utils.getNodeCompByPath("show_conten/confirm_btn/again_txt", this.root_wnd, cc.RichText).string = Utils.TI18N("确定");
        Utils.getNodeCompByPath("show_conten/reward/goods_num_have", this.root_wnd, cc.Label).string = Utils.TI18N("首次分享奖励");
        Utils.getNodeCompByPath("share_conten/share_des", this.root_wnd, cc.Label).string = Utils.TI18N("长按识别二维码");
        //Utils.getNodeCompByPath("share_conten/return_btn/again_txt", this.root_wnd, cc.RichText).string = Utils.TI18N("返回");
        Utils.getNodeCompByPath("share_conten/share_des", this.root_wnd, cc.Label).string = Utils.TI18N("分享到");
        // Utils.getNodeCompByPath("herocard_info/hero_name", this.root_wnd, cc.Label).string = Utils.TI18N("黑精灵秘言");
        // Utils.getNodeCompByPath("herocard_info/hero_slogn", this.root_wnd, cc.Label).string = Utils.TI18N("黑精灵秘言");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.initWidget();
        this.initBgInfo();
        this.showRecruit();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        var PartnersummonController = require("partnersummon_controller");
        PartnersummonController.getInstance().openSummonGainShowWindow(false)
        if(this.time){
          for(let i in this.time){
            if(this.time[i])
                clearTimeout(this.time[i]);
                this.time[i] = null;
          }
          this.time = null;
        }
        SoundManager.getInstance().unCacheEffectAll()
    },

    initBgInfo: function() {
        this.recruit_data = this.model.getRecruitData();

        // 背景
        if (this.recruit_data) {
            var summon_cfg_item = this.partnersummon_config[this.recruit_data.group_id];
        }
        var resources_id = "partnersummon_call_bg_100";
        if (this.bg_type != null && this.bg_type == 2) {
            resources_id = "partnersummon_call_bg_200";
        }
        if (summon_cfg_item)
            resources_id = summon_cfg_item.call_bg;
        // var bg_path = PathTool.getUIIconPath("bigbg/partnersummon", resources_id);
        // this.loadRes(bg_path, function(bigbg_sf) {
        //     this.summon_bg_sp.spriteFrame = bigbg_sf;
        // }.bind(this));

        // 背景动画
        // var bg_effect_id = "140"
        // if (summon_cfg_item)
        //     bg_effect_id = summon_cfg_item.call_bg_action;
        // var effect_res = PathTool.getEffectRes(bg_effect_id);
        // var effect_path = PathTool.getSpinePath(effect_res, "action");
        // this.loadRes(effect_path, function(bg_sd) {
        //     this.bg_effect_sk.skeletonData = bg_sd;
        //     this.bg_effect_sk.setAnimation(0, "action", true);
        // }.bind(this));
    },

    initWidget: function() {
        this.summon_bg_sp = this.seekChild("summon_bg", cc.Sprite);
        this.bg_effect_sk = this.seekChild("bg_effect", sp.Skeleton);
        this.herocard_info_nd = this.seekChild("herocard_info");
        this.break_btn = this.seekChild("break_btn");
        this.break_btn.active = false;

        this.partnersummon_bg = this.seekChild("partnersummon_bg");
        this.summon_bg_nd = this.seekChild("summon_bg");
        this.summon_bg_nd.scale = this.summon_bg_nd.scale * FIT_SCALE
        this.partnersummon_bg.scale = FIT_SCALE;

        this.share_conten_nd = this.seekChild("share_conten");
        this.show_conten_nd = this.seekChild("show_conten");

        this.skill_item_nd = this.seekChild("skill_item"); // 可复制的技能item
        this.star_item_nd = this.seekChild("star_item"); // 可复制的星星
        this.star_skeleton = this.root_wnd.getChildByName("skeleton")

        this.herocard_sp = this.seekChild("herocard", cc.Sprite);
        this.herobgCard = cc.instantiate(this.herocard_sp.node);
        this.herocard_sp.node.parent.addChild(this.herobgCard);
        this.herocard_spine_nd = this.seekChild("herocard_spine");
        this.herocard_spine_nd.active = false;
        this.herobgCard.active = false;
        this.stars_conten_nd = this.seekChild("stars_conten");
        this.stars_conten1_nd = this.seekChild("stars_conten1");
        // this.hero_type_sp = this.seekChild("hero_type", cc.Sprite);
        this.hero_name_lb = this.seekChild("hero_name", cc.Label);
        // this.hero_slogn_lb = this.seekChild("hero_slogn", cc.Label);
        this.camp_type_sp = this.seekChild("camp_type", cc.Sprite);
        this.camp_type_skeleton = this.seekChild("camp_effect",sp.Skeleton);
        this.star_bg_skeleton = this.seekChild("effect_star",sp.Skeleton);

        // 展示相关
        this.share_btn_nd = this.seekChild("share_btn");

        // this.partnersummon_tag_bg_nd = this.seekChild("partnersummon_tag_bg")

        this.again_one_txt_nd = this.seekChild("again_one_txt");
        this.again_ten_txt_nd = this.seekChild("again_ten_txt");
        this.confirm_btn_nd = this.seekChild("confirm_btn");
        this.confirm_btn_nd.active = false;
        if (PLATFORM_TYPR == "QQ_SDK") {
            this.share_btn_nd.active = true; //临时屏蔽
        } else {
            this.share_btn_nd.active = false; //临时屏蔽
            this.confirm_btn_nd.x = 360;
        }
        this.skills_content_nd = this.seekChild("skills_content");
        this.reward_nd = this.seekChild("reward");
        this.reward_nd.active = false; //临时屏蔽

        // 分享相关
        this.return_btn_nd = this.seekChild("return_btn");
        this.weixin_btn_nd = this.seekChild("weixin_btn");
        this.friend_btn_nd = this.seekChild("friend_btn");

        this.card_skeleton = this.seekChild("card_skelton", sp.Skeleton);
        this.card_skeleton.setStartListener(this.animaComplete.bind(this));


        this.partnersummon_bg.on(cc.Node.EventType.TOUCH_END, this.didClickConfimBtn, this);
        this.share_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickShareBtn, this);
        this.confirm_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickConfimBtn, this);
        this.return_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickReturnBtn, this);
        this.break_btn.on(cc.Node.EventType.TOUCH_END,(()=>{
          Utils.playButtonSound(1)
          if (this.finish_cb) this.finish_cb();
            var PartnersummonController = require("partnersummon_controller");
            PartnersummonController.getInstance().openSummonGainShowWindow(false);
        }))
    },

    updateWidget: function(bid_info) {
        if (!this.par_base_config || !this.par_star_config || !bid_info) return;
        if (bid_info.show_type && bid_info.show_type == PartnersummonConst.Gain_Show_Type.Skin_show) {
            let skin_config = Config.partner_skin_data.data_skin_info[bid_info.skin_id];
            if (skin_config) {
                this.hero_name_lb.string = skin_config.skin_name;
                this.stars_conten_nd.active = false;
                this.stars_conten1_nd.active = false;
                return
            }
        }
        var camp = this.par_base_config.camp_type;
        var camp_path = "";
        if (camp == null) {
          camp = 1
        } else if (camp > 5) {
            camp = 1
        }
        if (camp == 1) {                // 水
          camp_path =  "Zhaohuan_Icon_Shuxing_1_1";
        } else if (camp == 2) {         // 火
          camp_path =  "Zhaohuan_Icon_Shuxing_2_1";
        } else if (camp == 3) {         // 风
          camp_path =  "Zhaohuan_Icon_Shuxing_3_1";
        } else if (camp == 4) {         // 光
          camp_path =  "Zhaohuan_Icon_Shuxing_4_1";
        } else if (camp == 5){          // 暗
          camp_path =  "Zhaohuan_Icon_Shuxing_5_1";
        }

        
            // var common_res_path = PathTool.getUIIconPath("partnersummon", camp_path);
            // this.loadRes(common_res_path, function(sf_obj){
            //     this.camp_type_sp.spriteFrame = sf_obj;
            // }.bind(this))

        this.loadRes(PathTool.getUIIconPath("partnersummon", camp_path), function(sf_obj) {
            this.camp_type_sp.spriteFrame = sf_obj;
        }.bind(this))
        var res = ""
        if(bid_info.init_star<5){
          res = "spine/E80007/action.atlas";
        }else{
          res = "spine/E80006/action.atlas";
        }
        this.camp_type_skeleton.node.scaleX = 0;
        this.camp_type_skeleton.node.scaleY = 1.1;
        this.loadRes(res,function(skeleton_data){
            this.camp_type_skeleton.skeletonData = skeleton_data;
            this.camp_type_skeleton.setAnimation(0, "action",true);
            this.camp_type_skeleton.node.runAction(cc.scaleTo(0.5,1.1,1.1));
        }.bind(this));

        
        if(this.star_bg_skeleton){
          this.loadRes("spine/E80008/action.atlas",function(skeleton_data){
            this.star_bg_skeleton.skeletonData = skeleton_data;
            this.star_bg_skeleton.setAnimation(0, "action",true);
            
        }.bind(this));
        }
        if (this.par_base_config.voice) {
            SoundManager.getInstance().stopEffectAll();
            SoundManager.getInstance().playHeroEffectOnce(AUDIO_TYPE.DUBBING, this.par_base_config.voice,1);
        }  
        this.hero_name_lb.string = this.par_base_config.name;
    },

    clearTimeoutStar:function(){
      if(this.time){
        for(let i in this.time){
          if(this.time[i])
              clearTimeout(this.time[i]);
              this.time[i] = null;
        }
        this.time = null;
      }
      if(this.key1){
        clearTimeout(this.key1);
        this.key1 = null;
      }
    },

    playCardAction:function(){//对立绘进行操作
      // this.key1 = setTimeout(()=>{
        this.herocard_sp.node.runAction(
          cc.sequence(
          cc.moveBy(0.7,0,-30),
          cc.moveBy(0.7,0,30),
          cc.callFunc(()=>{
            this.playCardAction();
          })
          )
        )
        
      // },1000)
      
    },

    playCardActionBig:function(){
      this.herobgCard.stopAllActions();
      this.herocard_sp.node.stopAllActions();
      this.herobgCard.runAction(cc.spawn(
        cc.scaleTo(0.5,2,2),
        cc.fadeOut(0.5),
        cc.callFunc(()=>{
          this.herobgCard.opacity = 120;
          this.herobgCard.scale = 1;
          // this.playCardAction();
          // this.herobgCard.active = false;
        })
      ))
    },

    playCardSpineAim:function(config){
      if(!config){
        return;
      }
      if(this.herocard_spine_nd){
        var spine_res_list = config.spine_res_list;
        if( spine_res_list && spine_res_list.length>0){
          var spine_name =  spine_res_list[0][0];
          if(spine_name){
            this.herocard_spine_nd.active = true;
            this.herocard_sp.node.active = false;;
            // this.herobgCard.active = false;
            var skeleton_res = "spine/"+spine_name+"/action.atlas"
            LoaderManager.getInstance().loadRes(skeleton_res, function (skeleton_data) {
              this.herocard_spine_nd.getComponent(sp.Skeleton).skeletonData = skeleton_data;
              this.herocard_spine_nd.getComponent(sp.Skeleton).setAnimation(0, "action", true);
            }.bind(this));
          }
        }
      }
    },

    showRecruit: function() {
        if (this.show_bids.length > 0) {

            // 重置显示
            this.show_conten_nd.active = false;
            this.herocard_info_nd.active = false;
            this.herocard_spine_nd.active = false;

            var bid_info = this.show_bids.shift();
            this.par_base_config = Config.partner_data.data_partner_base[bid_info.partner_bid];
            this.par_star_config = gdata("partner_data", "data_partner_star", bid_info.partner_bid.toString() + "_" + bid_info.init_star.toString());
   
            this.updateWidget(bid_info);
            this.stars_conten_nd.removeAllChildren();
            this.stars_conten1_nd.removeAllChildren();
            var x = -60 + (bid_info.init_star-3)*-30;
            for (var i = 0; i < bid_info.init_star; i++) {
              var star_nd = cc.instantiate(this.star_item_nd);
              var skeleton_nd = cc.instantiate(this.star_skeleton);
              this.stars_conten_nd.addChild(star_nd);
              this.stars_conten1_nd.addChild(skeleton_nd);
              star_nd.index = i;
              star_nd.x = x+60*i;
              skeleton_nd.x = x+60*i;
              star_nd.active = false;
              skeleton_nd.index = i;
            }
       
            this.clearTimeoutStar();
            this.time = [];
            setTimeout(()=>{
              for(let child of this.stars_conten1_nd.children){
                this.time[child.index] = setTimeout(()=>{
                  var component = child.getChildByName("skeleton").getComponent(sp.Skeleton);
                  component.setCompleteListener((function(){
                    // setTimeout(()=>{
                    var node = this.stars_conten_nd.children[child.index]
                    if(node){
                      node.active = true;
                    }
                    // },0)
                    if(child.index == this.stars_conten1_nd.children.length-1){
                      this.break_btn.active = true;  
                    }
                  }).bind(this));
                  this.loadRes("spine/E80005/action.atlas", function(skeleton_data) {
                    component.skeletonData = skeleton_data;
                    component.setAnimation(0, "action");
                    
                  }.bind(this));
                },300*child.index)
              }
            },100)
            

            // 立绘资源
            var card_path = null;
            var config = gdata("partner_data", "data_partner_base", [bid_info.partner_bid]);
            var library_config = gdata("partner_data", "data_partner_library", [bid_info.partner_bid]);
            var draw_res = config.draw_res;
            card_path = PathTool.getIconPath("herodraw/herodrawres", draw_res);
            //                         this.playCardSpineAim(library_config);//全为未觉醒spine

            var x = 0;
            var y = 0;
            if (library_config) {
              if(library_config.main_draw_offset.length>0){
                // x = library_config.main_draw_offset[0][0];
                y = library_config.main_draw_offset[0][1];
              }
            }
            this.herobgCard.setPosition(x,y-100);
            this.herocard_spine_nd.setPosition(x,y-100);
            this.herocard_sp.node.setPosition(x,y-100);


            var spine_res_list = library_config.spine_res_list;
            if(spine_res_list && spine_res_list.length>0){
             
              var spine_name =  spine_res_list[0][0];
              if(spine_name){
                this.herocard_spine_nd.active = true;
                this.loadRes(card_path, function(sf_bof) {
                  this.herobgCard.getComponent(cc.Sprite).spriteFrame = sf_bof;
                }.bind(this))
                this.herocard_sp.node.active = false;
                
                var skeleton_res = "spine/"+spine_name+"/action.atlas"
                LoaderManager.getInstance().loadRes(skeleton_res, function (skeleton_data) {
                  this.herocard_spine_nd.stopAllActions();
                  this.herocard_spine_nd.getComponent(sp.Skeleton).skeletonData = skeleton_data;
                  this.herocard_spine_nd.getComponent(sp.Skeleton).setAnimation(0, "action", true);
                  setTimeout(()=>{
                    this.herocard_spine_nd.scale = 2;
                    this.herocard_spine_nd.runAction(
                      cc.sequence(
                        cc.scaleTo(0.3,1.4,1.4),
                        cc.scaleTo(0.1,1.1,1.1),
                        cc.scaleTo(0.05,1,1),
                        cc.scaleTo(0.1,1.1,1.1),
                        cc.scaleTo(0.05,1,1),
                        cc.callFunc(()=>{
                          this.herobgCard.active = true;
                          this.herobgCard.scale = 1;
                          this.herobgCard.opacity = 120;
                          this.herobgCard.setPosition(this.herocard_spine_nd.getPosition());
                          this.playCardActionBig();
                        })
                      )
                    )
                  },0.1)
                }.bind(this));
              }
              // this.playCardSpineAim(library_config)
            }else{
                this.loadRes(card_path, function(sf_bof) {
                  this.herocard_spine_nd.active = false;
                  this.herocard_sp.node.active = true;
                  this.herocard_sp.spriteFrame = sf_bof;
                  this.herobgCard.getComponent(cc.Sprite).spriteFrame = sf_bof;
                  
                  this.herocard_sp.node.stopAllActions();
                  setTimeout(()=>{
                    this.herocard_sp.node.scale = 2;
                    this.herocard_sp.node.runAction(
                      cc.sequence(
                        cc.scaleTo(0.3,1.4,1.4),
                        cc.scaleTo(0.1,1.1,1.1),
                        cc.scaleTo(0.05,1,1),
                        cc.scaleTo(0.1,1.1,1.1),
                        cc.scaleTo(0.05,1,1),
                        cc.callFunc(()=>{
                          this.herobgCard.active = true;
                          this.herobgCard.scale = 1;
                          this.herobgCard.opacity = 120;
                          this.herobgCard.setPosition(this.herocard_sp.node.getPosition());
                          this.playCardActionBig();
                        })
                      )
                    )
                  },0.1)
                  
                }.bind(this))
            }
            
            // 背景动画
            // var action_name = "action1"
            if(bid_info.init_star <5){
              this.card_skeleton.node.active = false;
            }else{
              this.card_skeleton.node.active = true;
            }
            if (this.card_skeleton) {
                this.is_playing = true
                var spine_res ="spine/E80004/action.atlas";;
                if(spine_res)
                    this.loadRes(spine_res, function(skeleton_data) {
                        this.card_skeleton.skeletonData = skeleton_data;
                        this.card_skeleton.setAnimation(0, "action",true);
                    }.bind(this));
            }
        }
    },

    didClickShareBtn: function(event) {
        Utils.playButtonSound(1)
        if (PLATFORM_TYPR == "QQ_SDK") {
            SDK.canvasToTempFilePath();
        }

        // this.share_conten_nd.active = true;
    },

    didClickConfimBtn: function(event) {
        Utils.playButtonSound(1)
        if (this.show_bids.length > 0) {
            this.herocard_sp.node.active = false;
            this.herocard_sp.node.stopAllActions();
            this.key1 = setTimeout(()=>{
              this.break_btn.active = true;
              this.showRecruit();
            },0)
        } else {
            if (this.finish_cb) this.finish_cb();
            var PartnersummonController = require("partnersummon_controller");
            PartnersummonController.getInstance().openSummonGainShowWindow(false);
        }
        if (window.TASK_TIPS)
            gcore.GlobalEvent.fire(GuideEvent.TaskNextStep, "confirm_btn"); //任务引导用到
    },

    didClickReturnBtn: function() {
        Utils.playButtonSound(1)
        this.show_conten_nd.active = true;
        this.show_conten_nd.active = true;
        this.share_conten_nd.active = false;
    },

    animaComplete: function(trackEntry, loopCount) {
        if (this.is_playing == false) return;
        var animationName = trackEntry.animation ? trackEntry.animation.name : "";
        if (animationName == "action") {
            // this.card_skeleton.setAnimation(0, "action3", true);
            this.show_conten_nd.active = true;
            this.herocard_info_nd.active = true;
        }
        this.is_playing = false;
        this.shakeScreen(this.root_wnd)
    },
    shakeScreen(root_wnd) {
        let node = root_wnd;
        if (node.action) {
            this.is_shake = false;
            node.stopAllActions();
            node.action = null;
        }
        this.camera_shake_pos = root_wnd.getPosition();
        this.is_shake = true;
        let returnPos = function() {
            this.is_shake = false;
            node.setPosition(this.camera_shake_pos);
        }.bind(this)
        let order = [1, 4, 7, 8, 9, 6, 3, 2]
        let str = 15 //--振幅，单位像素
        let damp = 3 //--振动减衰, 单位像素
        let step = 0.015 //--振动间隔，单位秒
        let shakeXTime = 0.25 //--横向加倍
        let shakeYTime = 0.25 //--纵向加倍
        let shakeTime = 1 //--振动次数
        let xy_list = [
            [-0.7, 0.7],
            [0, 1],
            [0.7, 0.7],
            [-1, 0],
            [0, 0],
            [1, 0],
            [-0.7, -0.7],
            [0, -1],
            [0.7, -0.7]
        ];
        let setRandomPos = function(index) {
            let pos_x, pos_y;
            pos_x = str * shakeYTime * xy_list[order[index] - 1][0];
            pos_y = -str * shakeXTime * xy_list[order[index] - 1][1];
            let pos = cc.v2(this.camera_shake_pos.x + pos_x, this.camera_shake_pos.y + pos_y);
            node.setPosition(pos);
        }.bind(this)
        let base_call = cc.delayTime(0);
        for (let j = 0; j < shakeTime; ++j) {
            for (let i = 0; i < order.length; ++i) {
                let delay = cc.delayTime(step);
                base_call = cc.sequence(base_call, cc.callFunc(function() {
                    setRandomPos(i);
                }.bind(this)), delay)
            }
            str = str - damp;
        }
        base_call = cc.sequence(base_call, cc.callFunc(returnPos));
        node.action = base_call;
        node.runAction(base_call);
    },

})