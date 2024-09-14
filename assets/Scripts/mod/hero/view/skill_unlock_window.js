// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-28 16:05:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller")
var SkillUnlockWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "skill_unlock");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.skill_bid = arguments[0] || 0
        this.is_can_close = false
        this.ctrl = HeroController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        Utils.playButtonSound("c_newskill");

        var self = this
        self.background = self.root_wnd.getChildByName("background")
    
        self.main_panel = self.root_wnd.getChildByName("main_container")

        self.star_name =  self.main_panel.getChildByName("star_name").getComponent(cc.Label)
    
        self.star_desc = self.main_panel.getChildByName("star_desc").getComponent(cc.Label)

        self.effect_sk = self.main_panel.getChildByName("action").getComponent(sp.Skeleton)
        self.createDesc()
        self.updateDesc()
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            Utils.playButtonSound(2)
            if(this.is_can_close == true){
                this.ctrl.openSkillUnlockWindow(false)
            }
        },this)
    },
    createDesc(){
        var SkillItem = require("skill_item");
        this.skill_item = new SkillItem();
        this.skill_item.setPosition(cc.v2(0, 45));
        this.skill_item.setParent(this.main_panel);
    },
    updateDesc(){
        var self = this
        if(self.skill_bid == 0) return;
        let config = gdata("skill_data","data_get_skill",self.skill_bid)
        if(!config) return
        let desc = config.des || ""
        self.star_desc.string = desc
        self.star_desc._forceUpdateRenderData(true)
        if(self.star_desc.node.getContentSize().height > 22){
            self.star_desc.horizontalAlign = cc.macro.TextAlignment.LEFT
        }
        let name = config.name || ""
        self.star_name.string = name;
        self.skill_item.setLeveStatus(false)
        self.skill_item.btn_status = false;
        self.skill_item.setData(self.skill_bid)
        self.background.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function(){
            this.is_can_close = true
        },this)))
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        Utils.playButtonSound("c_get")
        this.handleEffect()
    },
    handleEffect(){
        let sketon_path = PathTool.getSpinePath("E51003", "action");
        this.loadRes(sketon_path, function(skeleton_data){
            this.effect_sk.skeletonData = skeleton_data;
            this.effect_sk.setAnimation(0, "action", true);           
        }.bind(this));  
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.skill_item){
            this.skill_item.deleteMe()
        }
        this.ctrl.openSkillUnlockWindow(false)
    },
})