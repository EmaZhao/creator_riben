// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-28 11:13:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaController = require("battle_drama_controller")
var BattleDramaUnlockWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battleunlock");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = BattleDramaController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")

        self.main_panel = self.root_wnd.getChildByName("main_container")
        self.ok_btn = self.main_panel.getChildByName("ok_btn")
        self.ok_btn.getChildByName("Label").getComponent(cc.Label).string = "知道了";
        self.time_label = self.main_panel.getChildByName("tip");
        self.head_icon = self.main_panel.getChildByName("head_icon")
        self.star_name  = self.main_panel.getChildByName("star_name")
        self.star_desc = self.main_panel.getChildByName("star_desc")
        self.play_effect = self.title_container.getChildByName("action").getComponent(sp.Skeleton)
        self.handleEffect(true)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.ok_btn.on("click",function(){
            Utils.playButtonSound(2)
            if(this.is_can_close == true){
                this.ctrl.openBattleDramaUnlockWindow(false)
            }
        },this) 

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.updateDesc(data)
    },
    handleEffect(){
        if(this.play_effect ){ 
            let sketon_path = PathTool.getSpinePath(PathTool.getEffectRes(145), "action");
            this.loadRes(sketon_path, function(skeleton_data){
                this.play_effect.skeletonData = skeleton_data;
                this.play_effect.setAnimation(0, "action", true);           
            }.bind(this)); 
        }
    },
    updateDesc(data){
        var self = this
        if(data){
            let title_id = PathTool.getUIIconPath("bigbg/battledrama",data.unlock_icon)
            if(self.res_id_2 != title_id){
                self.res_id_2 = title_id
                this.loadRes(self.res_id_2,function(res){
                    self.head_icon.getComponent(cc.Sprite).spriteFrame = res
                }.bind(this))
            }
            self.star_name.getComponent(cc.Label).string = data.unlock_name;
            self.star_desc.getComponent(cc.Label).string  = data.unlock_desc;
        }
        self.is_can_close = true
        self.updateTimer()
    },
    updateTimer(){
        let time = 10
        var self = this
        let call_back = function(){
            time = time - 1
            let new_time = Map.ceil(time)
            let str = new_time + "秒後に閉じます";
            if(self.time_label){
                self.time_label.getComponent(cc.Label).string = str;
            }
            if(new_time <= 0){
                gcore.Timer.del(self.time_ticket);
                self.time_ticket = null;
            }
        }
        if(self.time_ticket == null){
            self.time_ticket = gcore.Timer.set(call_back.bind(this),1000,-1)
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.play_effect){
            this.play_effect.skeletonData = null;
        }
        if(this.time_ticket){
            gcore.Timer.del(this.time_ticket);
            this.time_ticket = null;
        }
    },
})