// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-08 09:29:30
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaController = require("battle_drama_controller")
var Battle_dramaEvent = require("battle_drama_event")
var BattleDramaUnlockChapterWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_unlock_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = BattleDramaController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.is_can_close = false;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this;
        self.background = self.root_wnd.getChildByName("background")
        self.background.scale = FIT_SCALE;
        self.main_panel = self.root_wnd.getChildByName("main_container")
        self.title_panel = self.main_panel.getChildByName("title_panel")
        self.title_sp = self.title_panel.getChildByName("title_sp")
        self.icon = self.main_panel.getChildByName("icon")
        self.time_label = this.seekChild(self.main_panel,"time_label",cc.Label)
        self.time_label.string = Utils.TI18N("8秒后关闭")
        self.star_name = this.seekChild(this.main_panel,"star_name",cc.Label)
        self.play_effect_sk = this.seekChild(this.main_panel,"play_effect",sp.Skeleton)
        self.handleEffect()
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            if(this.is_can_close == true){
                this.ctrl.openBattleDramaUnlockChapterView(false)
                Utils.playButtonSound(2)
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.updateDesc(data)
    },
    updateDesc(config){
        var self = this
        self.config = config
        if(config){
            this.loadRes(PathTool.getUIIconPath("bigbg/battledrama","txt_cn_battledrama_unlock_title"),function(res){
                self.title_sp.getComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
            this.loadRes(PathTool.getUIIconPath("bigbg/battledrama","battledrama_unlock_icon"),function(res){
                self.icon.getComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
            self.star_name.string = config.name;
        }
        this.root_wnd.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function(){
            self.is_can_close = true
        },this)))
        this.updateTimer()
    },
    updateTimer(){
        let less_time = 8
        if(this.time_tichet == null){
            this.time_tichet = gcore.Timer.set(function(){
                less_time-- 
                this.time_label.string = less_time + "秒後に閉じます" 
                if(less_time <=0 ){
                    gcore.Timer.del(this.time_tichet);
                    this.time_tichet = null;
                    this.ctrl.openBattleDramaUnlockChapterView(false)
                }
            }.bind(this),1000,-1)
        }
    },
    handleEffect(){
        if(this.play_effect_sk){
            let sketon_path = PathTool.getSpinePath("E51003", "action");
            this.loadRes(sketon_path, function(skeleton_data){
                this.play_effect_sk.skeletonData = skeleton_data;
                this.play_effect_sk.setAnimation(0, "action", true);           
            }.bind(this)); 
        }

    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        gcore.GlobalEvent.fire(Battle_dramaEvent.BattleDrama_Drama_Unlock_View, this.config)
        this.play_effect_sk.skeletonData = null;
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        this.ctrl.openBattleDramaUnlockChapterView(false)
    },
})