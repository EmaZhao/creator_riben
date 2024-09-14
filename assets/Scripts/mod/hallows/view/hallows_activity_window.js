// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     圣器激活面板
// <br/>Create: 2019-02-20 14:13:05
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HallowsConst = require("hallows_const");
var HeroEvent = require("hero_event");


var Hallows_activityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_activity_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");

        this.background_img = this.main_container.getChildByName("background").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("levupgrade","levupgrade_1"), (function(resObject){
            this.background_img.spriteFrame = resObject;
        }).bind(this));

        this.Image_1 = this.main_container.getChildByName("Image_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("levupgrade","levupgrade_2"), (function(resObject){
            this.Image_1.spriteFrame = resObject;
        }).bind(this));

        this.hallows_eff_node = this.seekChild("hallows_eff_node");
        this.hallows_eff_sk    = this.seekChild("hallows_eff_node", sp.Skeleton);

        this.title_eff_node = this.seekChild("title_eff_node");
        this.title_eff_sk    = this.seekChild("title_eff_node", sp.Skeleton);

        this.hallows_name = this.main_container.getChildByName("hallows_name").getComponent(cc.Label);
        this.desc = this.main_container.getChildByName("desc").getComponent(cc.Label);
        this.desc.string = Utils.TI18N("全体上阵英雄");

        this.close_btn = this.main_container.getChildByName("close_btn");

        var item_1 = this.root_wnd.getChildByName("item_1");
        this.item_bg = item_1.getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_90044"), (function(resObject){
            this.item_bg.spriteFrame = resObject;
        }).bind(this));

        this.attr_1 = Utils.createRichLabel(24, new cc.Color(0xff,0xe8,0xb7, 0xff), cc.v2(0, 0.5), cc.v2(160, 20),30);
        this.attr_1.horizontalAlign = cc.macro.TextAlignment.LEFT;
        item_1.addChild(this.attr_1.node);
        this.attr_2 = Utils.createRichLabel(24, new cc.Color(0xff,0xe8,0xb7, 0xff), cc.v2(0, 0.5), cc.v2(430, 20),30);
        this.attr_2.horizontalAlign = cc.macro.TextAlignment.LEFT;
        item_1.addChild(this.attr_2.node);
        //Utils.getNodeCompByPath("main_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("关闭");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openHallowsActivityWindow(false);
        }, this)

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.handleEffect(true);
        if(data){
            
            this.step_config = gdata("hallows_data","data_info",Utils.getNorKey(data.id, data.step));
            require("hero_controller").getInstance().getModel().setHallowsRedPointState(data.id,"true");
            if(this.step_config){
                this.hallows_name.string = this.step_config.name;
                var attr_list = this.step_config.attr;
                for(var i = 1;i<3;i++){
                    this["attr_"+i].string = "";
                }
                if(attr_list && Utils.next(attr_list)){
                    for(var j in attr_list){
                        if(j>2)break;
                        var attr_key = attr_list[j][0];
                        var attr_val = attr_list[j][1];
                        var attr_name = Config.attr_data.data_key_to_name[attr_key];
                        if(attr_name){
                            var str = cc.js.formatStr("%s<color=#ffffff>    +%s</c>", attr_name, attr_val) 
                            this["attr_"+(parseInt(j)+1)].string = str;
                        }
                    }
                }
                this.updateHallowsBaseInfo()
            }
        }
    },

    updateHallowsBaseInfo:function(){
        if(this.step_config == null)return;
        var anima_path = PathTool.getSpinePath(this.step_config.effect, "action");
        this.loadRes(anima_path, function(ske_data) {
            this.hallows_eff_sk.skeletonData = ske_data;
            this.hallows_eff_sk.setAnimation(0, PlayerAction.action_2, true);
        }.bind(this)); 
    },

    handleEffect:function(status){
        if(!status){
            if(this.title_eff_sk){
                this.title_eff_sk.setToSetupPose();
                this.title_eff_sk.clearTracks();
            }
        }else{
            var effect_id = 549;
            var action = PlayerAction.action_1;
            if(this.open_type == HallowsConst.Activity_Type.Magic){
                action = PlayerAction.action_2;
            }
            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(effect_id), "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.title_eff_sk.skeletonData = ske_data;
                    this.title_eff_sk.setAnimation(0,action, false);
                }.bind(this)); 
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.hallows_eff_sk){
            this.hallows_eff_sk.setToSetupPose();
            this.hallows_eff_sk.clearTracks();
        }
        gcore.GlobalEvent.fire(HeroEvent.Filter_Hero_Update);
        this.handleEffect(false);
        this.ctrl.openHallowsActivityWindow(false);
    },
})