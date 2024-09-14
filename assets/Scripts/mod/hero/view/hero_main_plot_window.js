// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 20:34:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var CommonAlert = require("commonalert");
var HeroEvent = require("hero_event");
var MainuiController = require("mainui_controller");

var Hero_main_plot_window = cc.Class({
    extends: BaseView,
    ctor: function () {
        const prefabName = window.IS_PC ? "hero_main_plot_pc_window" : "hero_main_plot_window";
        this.prefabPath = PathTool.getPrefabPath("hero", prefabName) ;
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance();
        this.model = this.ctrl.getModel();

        this.isShowAllBtns = true;
        this.isMute = false;
        this.isAuto = false;
        this.multiple_list = [1, 2, 4];
        this.cur_multiple_id = 0;
        this.speedTime = 1000;
        this.switchTime = 500; // 记录特效时间 用于换场
        this.cur_multiple = this.multiple_list[this.cur_multiple_id];
        this.historyList = []; 
        this.cur_cfg = null;
        this.isTween = false; // 过场动画是否播放中
        this.isGetReward = false; // 是否获取奖励
        this.isAutoVoice = false; //是否正在自动播放语音
        this.cacheTween = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        SoundManager.getInstance().stopMusic();
        // pc端特殊处理
        if(window.IS_PC) {
            this.root_wnd.x = -2200 * 0.5;
            game.views_js.setTagShowStatus(false);
        }
        
        this.originBoxPos = window.IS_PC ? cc.v2(0, -250) : cc.v2(0, -238);
        this.originDrawPos = window.IS_PC ? cc.v2(0, -410) : cc.v2(0, -390);
        this.box= this.seekChild("box");
        this.tip_label = this.seekChild("tip_label", cc.Label);
        if(this.tip_label) {
            this.tip_label.string = Utils.TI18N("请将手机旋转90度横屏观看");
        }
        this.tip_nd = this.seekChild("tip");
        this.background_sp = this.seekChild("bg", cc.Sprite);
        this.name_label = this.seekChild("name_label", cc.Label);
        this.content_label = this.seekChild("content_label", cc.Label);
        this.left_btns = this.seekChild("left");
        this.left_hide_btns = [];
        this.mute_btn = this.seekChild(this.left_btns, "btn_1");
        this.mute_btn_sp = this.mute_btn.getChildByName("icon").getComponent(cc.Sprite);
        this.hide_btn = this.seekChild(this.left_btns, "btn_2");
        this.hide_btn_sp = this.hide_btn.getChildByName("icon").getComponent(cc.Sprite);
        this.history_btn = this.seekChild(this.left_btns, "btn_3");
        this.right_btns = this.seekChild("right");
        this.right_hide_btns = [];
        this.skip_btn = this.seekChild(this.right_btns, "btn_1");
        this.speed_btn = this.seekChild(this.right_btns, "btn_2");
        this.speed_btn_sp = this.speed_btn.getChildByName("icon").getComponent(cc.Sprite);
        this.auto_btn = this.seekChild(this.right_btns, "btn_3");
        this.auto_btn_icon_sp = this.auto_btn.getChildByName("icon").getComponent(cc.Sprite);
        this.auto_btn_sp = this.auto_btn.getComponent(cc.Sprite);
        var path = PathTool.getUIIconPath("plot_panel","Juese_Anniu_2_2","png");
        var path1 = PathTool.getUIIconPath("plot_panel","Juese_Icon_Zidong_1_2","png")
        this.loadRes(path,(res)=>{
          this.auto_btn_sp.spriteFrame =res;
        })
        this.loadRes(path1,(res)=>{
          this.auto_btn_icon_sp.spriteFrame =res;
        })
        this.hide2_btn = this.seekChild(this.right_btns, "btn_4");
        this.draw_sp = this.seekChild("draw", cc.Sprite);
        this.face_sp = this.seekChild("face_sp", cc.Sprite);
        this.maskEffect_nd = this.seekChild("maskEffect");
        this.progressBar_bar = this.seekChild("progressBar", cc.ProgressBar);
        this.progress_label = this.seekChild("progress_label", cc.Label);
        this.close_btn = this.seekChild("close_btn");
        this.click_nd = this.seekChild("click_nd");
        this.initPos();

        for(let i = 0; i < this.left_btns.childrenCount; i++) {
            const btn = this.left_btns.children[i];
            if(btn.name != "btn_2") {
                this.left_hide_btns.push(btn);
            }
        }
       
        for(let i = 0; i < this.right_btns.childrenCount; i++) {
            const btn = this.right_btns.children[i];
            if(btn.name != "btn_4") {
                this.right_hide_btns.push(btn);
            }
        }
    },

    initPos() {
        this.draw_sp.node.position = this.originDrawPos;
        this.box.position = this.originBoxPos;
    },

    // 预加载该英雄所有资源
    preloadRes(callback) {
        const arr = [];
        for(let i = 0, len = this.hero_plot_list.length; i < len; i++) {
            const cur_cfg = this.hero_plot_list[i];
            //背景
            if(cur_cfg.bg != "") {
                if(cur_cfg.bg.indexOf("bg") == -1) {
                    // 通用背景
                    arr.push(`${window.Adult_Res_Url}/${cur_cfg.bg}.jpg`); 
                } else {
                    // 成人背景
                    arr.push(`${window.Adult_Res_Url}/${this.hero_id}/${cur_cfg.bg}.jpg`); 
                }
            } else {
                arr.push(`${window.Adult_Res_Url}/bg_black.jpg`);
            }

            // 表情
            if(cur_cfg.hero_exp != "") {
                arr.push(`${window.Adult_Res_Url}/${this.hero_id}/Face/${cur_cfg.hero_exp}.png`);
            }

            // 立绘
            if(cur_cfg.hero_pic_id != "") {
                arr.push(`${window.Adult_Res_Url}/${this.hero_id}/Draw/${cur_cfg.hero_pic_id}.png`);
            }

            // 声音
            if(cur_cfg.hero_voice != "") {
                arr.push(`${window.Adult_Res_Url}/${this.hero_id}/Voice/${cur_cfg.hero_voice}.mp3`);
            }
        }
        // 去重
        this.model.remoteUrls = arr.filter((item, index)=> {
            return arr.indexOf(item) == index;
        });
        // console.error(this.model.remoteUrls);

        LoaderManager.getInstance().loadRemoteRes(this.model.remoteUrls, (progress)=>{
            if(!this.root_wnd) return;
            this.progressBar_bar.progress = progress;
            this.progress_label.string = `${(progress * 100).toFixed(2)}%`;
        }, (err, textures)=>{
            if(!this.root_wnd) return;
            if(!err) {
                this.tip_nd.active = false;
            }
            this.model.loadedRemoteRes = textures.map;
            callback && callback();
        });
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent () {
        this.addGlobalEvent(HeroEvent.Hero_Get_Reward, (data)=> {
            this.isGetReward = true;
        }, this);

        this.addGlobalEvent(HeroEvent.Herp_Plot_Voice, ()=> {
          if(!this.isAutoVoice||this.isTween){
            return;
          }
          
          this.isAutoVoice = false;
          this.clearKeyTime();
          if(this.cacheTween){
            this.playTransitionEffect(this.cacheTween);
            this.cacheTween = null
            return;
          }
          if(!this.isAuto) return;
          this.key3 = setTimeout(()=>{
            this.updateContent(++this.model.plot_play_num);
          },800)
        }, this);

        if(window.IS_PLOT_LOCAL) {
            Utils.onTouchEnd(this.tip_nd, ()=> {
                this.tip_nd.active = false;
            }, 1);
        }

        Utils.onTouchEnd(this.close_btn, ()=> {
          this.ctrl.openHeroPlotWindow(false);
        }, 1);

        Utils.onTouchEnd(this.mute_btn, ()=> {
            let name = "";
            this.isMute = !this.isMute;
            if(this.isMute) { 
                name = "Juese_Icon_Yuying_1_2";
            } else {
                name = "Juese_Icon_Yuying_1_1";
            }

            const path = PathTool.getUIIconPath(`plot_panel`, name, "png");
            this.loadRes(path, (res)=>{
                this.mute_btn_sp.spriteFrame = res;
            });
                
            SoundManager.getInstance().mutePlotHeroVoice(this.isMute);
        }, 1);

        Utils.onTouchEnd(this.history_btn, ()=> {
            this.isAuto = false;//关闭自动
            this.isAutoVoice = false;
            var path = PathTool.getUIIconPath("plot_panel","Juese_Anniu_2_2","png");
            var path1 = PathTool.getUIIconPath("plot_panel","Juese_Icon_Zidong_1_2","png")
            this.loadRes(path,(res)=>{
              this.auto_btn_sp.spriteFrame =res;
            })
            this.loadRes(path1,(res)=>{
              this.auto_btn_icon_sp.spriteFrame = res;
            })
            this.ctrl.openHeroPlotHistoryPanel(true, {hero_id: this.hero_id, historyList: this.historyList});
        }, 1);

        Utils.onTouchEnd(this.hide_btn, ()=> {
            this.isShowAllBtns = !this.isShowAllBtns;
            let name = "";

            if(this.isShowAllBtns) {
                name = "Juese_Icon_Caokong_1_2";
            } else {
                name = "Juese_Icon_Caokong_1_1";
            }
            const path = PathTool.getUIIconPath(`plot_panel`, name, "png");
            this.loadRes(path, (res)=>{
                this.hide_btn_sp.spriteFrame = res;
            });
            if(!this.isShowAllBtns){
              this.isAuto = false;//关闭自动
              var path2 = PathTool.getUIIconPath("plot_panel","Juese_Anniu_2_2","png");
              var path1 = PathTool.getUIIconPath("plot_panel","Juese_Icon_Zidong_1_2","png")
              this.loadRes(path2,(res)=>{
                this.auto_btn_sp.spriteFrame =res;
              })
              this.loadRes(path1,(res)=>{
                this.auto_btn_icon_sp.spriteFrame = res;
              })
            }
            this.hide_btn.active = this.isShowAllBtns;
            this.box.active = this.isShowAllBtns;
            this.left_hide_btns.forEach(btn => {
                btn.active = this.isShowAllBtns;
            });
            this.right_btns.children.forEach(btn => {
                btn.active = this.isShowAllBtns;
            });

            if(this.isShowAllBtns) {
                this.clearHideBtnTimer();
            }
        }, 1);

        Utils.onTouchEnd(this.skip_btn, ()=> {  
          const confirm_callback = ()=>{
              Utils.playButtonSound(ButtonSound.Normal);
              SoundManager.getInstance().stopPlotHeroVoice();
              this.ctrl.openHeroPlotWindow(false);
          };
          const cancel_callback = ()=> {
              Utils.playButtonSound(ButtonSound.Normal);
          };
          this.CommonAlert = require("commonalert").show(Utils.TI18N("会話をスキップして報酬を受け取りますか"), Utils.TI18N("确定"),confirm_callback, Utils.TI18N("取消"), cancel_callback, null, null, {isPlot:true});
        }, 1);

        Utils.onTouchEnd(this.click_nd, ()=> {
            if(this.isTween) return;
            if(!this.hide_btn.active) {
                this.hide_btn.active = true;
                this.hideBtnTimer = gcore.Timer.set(()=> {
                    this.hide_btn.active = false;
                }, 1000, 1);
                return;
            }
            if(!this.isShowAllBtns) {
                return;
            }
            this.showAllTxt();
        }, 1);
        
        Utils.onTouchEnd(this.box, ()=> {
            if(this.isTween) return;
            if(!this.isShowAllBtns) {
              return;
            }
            this.showAllTxt();
        }, 1);

        Utils.onTouchEnd(this.speed_btn, ()=> {
            if(this.cur_multiple_id >= this.multiple_list.length - 1) {
                this.cur_multiple_id = -1;
            }
            this.cur_multiple = this.multiple_list[++this.cur_multiple_id];
            this.speedTime = 1000;
            if(this.cur_multiple == 2) {
                // this.isAutoVoice = false;
                SoundManager.getInstance().stopPlotHeroVoice();
                SoundManager.getInstance().finishPlotHeroPlayMusic();
                this.speedTime = 500;
            } else if(this.cur_multiple == 4) {
                // this.isAutoVoice = false;
                SoundManager.getInstance().stopPlotHeroVoice();
                SoundManager.getInstance().finishPlotHeroPlayMusic();
                this.speedTime = 250;
            }
            const name = `Juese_Icon_Kuaijing_${this.cur_multiple}`;
            const path = PathTool.getUIIconPath(`plot_panel`, name, "png");
            this.loadRes(path, (res)=>{
                this.speed_btn_sp.spriteFrame = res;
            });

        }, 1);

        Utils.onTouchEnd(this.auto_btn, ()=> {
            this.isAuto = !this.isAuto;
            // 逐个输出字时,特效中 都不能执行
            var path = "";
            var path1 = "";
            if(this.isAuto){
              path = PathTool.getUIIconPath("plot_panel","Juese_Anniu_2_1","png");
              path1 = PathTool.getUIIconPath("plot_panel","Juese_Icon_Zidong_1_1","png")
            }else{
              path = PathTool.getUIIconPath("plot_panel","Juese_Anniu_2_2","png");
              path1 = PathTool.getUIIconPath("plot_panel","Juese_Icon_Zidong_1_2","png")
            }
            this.loadRes(path,(res)=>{
              this.auto_btn_sp.spriteFrame =res;
            })
            this.loadRes(path1,(res)=>{
              this.auto_btn_icon_sp.spriteFrame = res;
            })
            if(this.printDiaTimer || this.isTween ||this.isAutoVoice) {
                return;
            }
            this.updateContent(++this.model.plot_play_num);
        }, 1);

        Utils.onTouchEnd(this.hide2_btn, ()=> {
            this.hide2_btn.rotation = this.skip_btn.active ? 180 : 0;
            this.right_hide_btns.forEach(btn => {
                btn.active = !btn.active;
            });
        }, 1);

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd (param) {
        // console.error(`剧情id: ${param.plot_id}`);
        this.plot_id = param.plot_id;
        this.model.plot_play_num = 1;
        this.hero_id = param.hero_id ;
        this.hero_plot_list = Object.values(Config.adult_data.data_plot_cfg).filter(ob=> ob.hero_id == this.hero_id);

        if(window.IS_PLOT_LOCAL) {
            if(window.IS_PC) {
                this.tip_nd.active = false;
            } else {
                this.progressBar_bar.node.active = false;
            }
            this.updateContent(this.model.plot_play_num);
        } else {
            this.preloadRes(()=>{            
                this.updateContent(this.model.plot_play_num);
            });
        }
        SoundManager.getInstance().setBackgroundVolume(0);
    },

    updateContent(play_num) {
        // console.error(`${this.hero_id}: 播放顺序: ${play_num}`);
        this.clearKeyTime();
        this.isAutoVoice = false;
        this.clearDiaTimer();
        this.cur_cfg = this.hero_plot_list.filter(ob => ob.plot_id == this.plot_id && play_num == ob.play_order)[0];

        if(!this.cur_cfg && play_num == 1) {
            // console.error(`剧情配置为空`);
            this.ctrl.openHeroPlotWindow(false);
            return;
        } 

        if(!this.cur_cfg && play_num > 1) {
            // console.error(`成人版剧情已看完`);
            // this.ctrl.checkIsOverPlot(this.hero_id, this.plot_id);
            this.ctrl.openHeroPlotWindow(false);
            return;
        }

        // 0-正常版  1-成人版
        const isAdultCfg = this.cur_cfg.isAdult == 0;
        if(window.GAME_TYPE == "" && isAdultCfg) {
            // console.error(`正常版剧情已看完`);
            // this.ctrl.checkIsOverPlot(this.hero_id, this.plot_id);
            this.ctrl.openHeroPlotWindow(false);
            return;
        } 
        this.ctrl.checkIsOverPlot(this.hero_id, this.plot_id);

        // 请求获取奖励
        if(!this.isGetReward) {
            // if((window.GAME_TYPE == "" && !isAdultCfg) || (window.GAME_TYPE == "adult" && isAdultCfg)) {
                this.ctrl.sender11124(this.plot_id);
            // } 
        }

        // 立绘和背景为空用黑底
        let bg_name = this.cur_cfg.bg; 
        console.log("bg_name",bg_name);
        if(this.cur_cfg.bg == "") {
            bg_name = "bg_black";
        } 
        if(window.IS_PLOT_LOCAL) {
            var bg_path = PathTool.getIconPath('plot', bg_name, "jpg");
            var filttem = bg_name.indexOf("bg");
            if (filttem == 0 && bg_name != "bg_black") {
                bg_path = PathTool.getIconPath(`plot/${this.cur_cfg.hero_id}`, bg_name, "jpg");
            }
            this.loadRes(bg_path, (res)=>{
                this.background_sp.spriteFrame = res;
            });
        } else {
            this.background_sp.spriteFrame = new cc.SpriteFrame(this.ctrl.getRemoteRes(bg_name));;
        }   
       
        // 没语音不放入列表
        if(this.cur_cfg.hero_voice != "") {
            this.historyList.push(this.cur_cfg);
        }
        
        // 语音
        if(this.speedTime ==1000){
          if(window.IS_PLOT_LOCAL) {
            if(this.cur_cfg.hero_voice){
              this.isAutoVoice = true;
            }
            this.ctrl.onPlayPlotHeroVoice(this.cur_cfg.hero_voice, this.isMute);
          } else {
            if(this.cur_cfg.hero_voice){
              this.isAutoVoice = true;
            }
            // console.error(this.cur_cfg.hero_voice);
            this.ctrl.onPlayPlotHeroVoice(this.ctrl.getRemoteRes(this.cur_cfg.hero_voice), this.isMute);
          }
        }
        

        // 立绘
        if(window.IS_PLOT_LOCAL) {
            if(this.cur_cfg.hero_pic_id.length > 0) {
                const draw_path = PathTool.getIconPath(`plot/${this.cur_cfg.hero_id}/Draw`, this.cur_cfg.hero_pic_id, "png");
                this.loadRes(draw_path, (res)=>{
                    this.draw_sp.spriteFrame = res;
                });
            } else {
                this.draw_sp.spriteFrame = null;
            }
        } else {
            if(this.cur_cfg.hero_pic_id != "") {
                const texture = this.ctrl.getRemoteRes(this.cur_cfg.hero_pic_id);
                this.draw_sp.spriteFrame = new cc.SpriteFrame(texture)
            } else {
                this.draw_sp.spriteFrame = null;
            }
        }
        
        // 表情
        if(window.IS_PLOT_LOCAL) {
            if(this.cur_cfg.hero_exp.length > 0) {
                const exp_path = PathTool.getIconPath(`plot/${this.cur_cfg.hero_id}/Face`, this.cur_cfg.hero_exp, "png");
                this.loadRes(exp_path, (res)=>{
                    this.face_sp.spriteFrame = res;
                });
            } else {
                this.face_sp.spriteFrame = null;
            }
        } else {
            if(this.cur_cfg.hero_exp != "") {
                this.face_sp.spriteFrame = new cc.SpriteFrame(this.ctrl.getRemoteRes(this.cur_cfg.hero_exp))
            } else {
                this.face_sp.spriteFrame = null;
            }
        }
        //文本
        this.name_label.string = this.cur_cfg.dialog_name ? this.cur_cfg.dialog_name : "";
        this.printDialog(this.cur_cfg.dialog_txt);
    },

    printDialog(txt) {
        const txtArr = txt.split("");
        this.content_label.string = "";
        let idx = 0;
        const printSpeed = this.speedTime * 70 / 1000;
        this.printDiaTimer = gcore.Timer.set(()=> {
            this.content_label.string += txtArr[idx];
            idx++;
            if(idx == txtArr.length) {
                this.clearKeyTime();
                this.clearDiaTimer();
                this.playTransitionEffect(this.cur_cfg.effect);
                if(this.isAuto && !this.isAutoVoice && !this.isTween) {
                    this.key1 = gcore.Timer.set(()=> {
                        this.updateContent(++this.model.plot_play_num);
                    }, this.switchTime, 1)
                }
            }
        }, printSpeed, -1);
    },

    showAllTxt() {
        if(this.printDiaTimer) {
            this.content_label.string = this.cur_cfg.dialog_txt;
            this.clearDiaTimer();
            this.clearKeyTime();
            this.playTransitionEffect(this.cur_cfg.effect);
            if(this.isAuto && !this.isAutoVoice && !this.isTween) {
              this.key2 = gcore.Timer.set(()=> {
                    this.updateContent(++this.model.plot_play_num);
                }, this.switchTime, 1);
            }
        } else {
            if(this.cacheTween){
              this.playTransitionEffect(this.cacheTween);
              this.cacheTween = null
              return;
            }
            this.updateContent(++this.model.plot_play_num);
        }
    },

    clearKeyTime:function(){
      if(this.key1){
          gcore.Timer.del(this.key1);
          this.key1 = null;
      }

      if(this.key2){
          gcore.Timer.del(this.key2);
          this.key2 = null;
      }

      if(this.key3){
        clearTimeout(this.key3);
        this.key3 = null
      }
    },

    clearDiaTimer() {
        if(this.printDiaTimer) {
            gcore.Timer.del(this.printDiaTimer);
            this.printDiaTimer = null;
        }
    },

    clearHideBtnTimer() {
        if(this.hideBtnTimer) {
            gcore.Timer.del(this.hideBtnTimer);
            this.hideBtnTimer = null;
        }
    },

    // 转场效果
    // {"立绘消失", 1}
    // {"画面变暗", 2}
    // {"角色立绘摇晃、拉近", 3}
    // {"画面一闪", 4}
    // {"画面变亮", 5}
    playTransitionEffect(effect) {
        // 重置
        this.draw_sp.node.stopAllActions();
        this.initPos();
        this.draw_sp.node.opacity = 255;
        this.draw_sp.node.scale = window.IS_PC ? 1.6 : 1;
        this.maskEffect_nd.opacity = 0;
        this.switchTime = 500;
        
        
        if(this.isAutoVoice && (effect == 2 || effect == 5)){
          if(!this.cacheTween){
            this.cacheTween = effect;
            return ;
          }
        }
        this.isTween = true;

        switch(effect) {
            case 1:
                cc.tween(this.draw_sp.node)
                    .to(1, {opacity: 0})
                    .call(()=>{
                        this.isTween = false;
                    })
                    .start()
                break;
            case 2:
                this.maskEffect_nd.color = cc.Color.BLACK;
                this.switchTime = 2500;
                cc.tween(this.maskEffect_nd)
                    .to(1, {opacity: 255})
                    .delay(1)
                    .call(()=>{ 
                      // if(!this.isAutoVoice){
                          this.updateContent(++this.model.plot_play_num);
                          // this.isTween = false;
                      // }
                    })
                    .to(0.5, {opacity: 0})
                    .call(()=>{ 
                      this.isTween = false;
                    })
                    .start();
                break;
            case 3:
                const shakeAni = cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.05,-10,15)
                        , cc.moveBy(0.05,-8,-10)
                        , cc.moveBy(0.05,-9,8)
                        , cc.moveBy(0.05,14,-14)
                        , cc.moveBy(0.05,10,14)
                        , cc.moveBy(0.05,-10,0)
                        , cc.moveBy(0.05,14,-5)
                        , cc.moveBy(0.05,8,-5)
                        , cc.moveTo(0.05,this.originDrawPos)
                        , cc.callFunc(()=>{
                            this.isTween = false;
                        })
                     ), 2);
                const scaleAni = cc.scaleTo(0.1, window.IS_PC ? 1.7 : 1.1);
                const seq = cc.spawn(scaleAni, shakeAni);
                this.draw_sp.node.runAction(seq);

                const shakeAni2 = cc.repeat(
                    cc.sequence(
                         cc.moveBy(0.05,10,14)
                        , cc.moveBy(0.05,-10,0)
                        , cc.moveBy(0.05,14,-5)
                        , cc.moveBy(0.05,8,-5)
                        , cc.moveBy(0.05,-10,15)
                        , cc.moveBy(0.05,-8,-10)
                        , cc.moveBy(0.05,-9,8)
                        , cc.moveBy(0.05,14,-14)
                        , cc.moveTo(0.05,this.originBoxPos)
                     ), 2);

                this.box.runAction(shakeAni2);
                break;
            case 4:
                this.maskEffect_nd.color = cc.Color.WHITE;
                cc.tween(this.maskEffect_nd)
                    .to(0.09, {opacity: 0})
                    .to(0.09, {opacity: 255})
                    .to(0.09, {opacity: 0})
                    .call(()=> {
                        this.isTween = false;
                    })
                    .start();
                break;
            case 5:
                this.switchTime = 2500;
                this.maskEffect_nd.color = cc.Color.WHITE;
                cc.tween(this.maskEffect_nd)
                    .to(1, {opacity: 255})
                    .delay(1)
                    .call(()=> {
                      // if(!this.isAutoVoice){
                        // this.isTween = false;
                        this.updateContent(++this.model.plot_play_num);
                      // }
                    })
                    .to(0.5, {opacity: 0})
                    .call(()=>{ 
                      this.isTween = false;
                    })
                    .start();
                break;
            default: 
                this.isTween = false;
                break;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack () {
        if(this.isGetReward) {
            const list = [{ bid:3, num: 50 }];
            MainuiController.getInstance().openGetItemView(true, list, null);
            this.model.setAdultStoryState(false);
        } else {
            this.model.setAdultStoryState(false);
        }
        SoundManager.getInstance().pauseMusic();
        SoundManager.getInstance().unCacheEffectAll();
        SoundManager.getInstance().isMute = false;
        this.clearKeyTime();
        this.clearDiaTimer();
        this.clearHideBtnTimer();
        // this.model.setAdultStoryState(false);
        this.background_sp.spriteFrame = null;
        this.draw_sp.spriteFrame = null;
        this.face_sp.spriteFrame = null;
        this.model.remoteUrls = [];
        this.model.loadedRemoteRes = null;
        this.clearDiaTimer();
        SoundManager.getInstance().stopPlotHeroVoice();
        game.views_js.setTagShowStatus(true);
        SoundManager.getInstance().setBackgroundVolume(1);
        this.ctrl.openHeroPlotWindow(false);
    },
})