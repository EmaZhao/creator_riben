// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     圣器进阶成功的界面
// <br/>Create: 2019-02-20 14:15:06
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Hallows_step_upWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_step_up_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.title_container = this.root_wnd.getChildByName("title_container");
    
        this.title_eff_sk = this.seekChild("title_container", sp.Skeleton);

        this.main_container = this.root_wnd.getChildByName("main_container");

        this.background_img = this.main_container.getChildByName("background").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1064"), (function(resObject){
            this.background_img.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_1 = this.main_container.getChildByName("Sprite_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1062"), (function(resObject){
            this.Sprite_1.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_2 = this.main_container.getChildByName("Sprite_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1063"), (function(resObject){
            this.Sprite_2.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_3 = this.main_container.getChildByName("Sprite_3").getComponent(cc.Sprite);
        this.Sprite_4 = this.main_container.getChildByName("Sprite_4").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_30003"), (function(resObject){
            this.Sprite_3.spriteFrame = resObject;
            this.Sprite_4.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_5 = this.main_container.getChildByName("Sprite_5").getComponent(cc.Sprite);
        this.Sprite_6 = this.main_container.getChildByName("Sprite_6").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_30002"), (function(resObject){
            this.Sprite_5.spriteFrame = resObject;
            this.Sprite_6.spriteFrame = resObject;
        }).bind(this));

        this.Image_1 = this.main_container.getChildByName("Image_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1091"), (function(resObject){
            this.Image_1.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_29 = this.main_container.getChildByName("Sprite_29").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_30014"), (function(resObject){
            this.Sprite_29.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_13 = this.main_container.getChildByName("Sprite_13").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("txt_cn_common_notice"), (function(resObject){
            this.Sprite_13.spriteFrame = resObject;
        }).bind(this));

        this.hallows_name = this.main_container.getChildByName("hallows_name").getComponent(cc.Label);
        this.old_step = this.main_container.getChildByName("old_step").getComponent(cc.Label);
        this.cur_step = this.main_container.getChildByName("cur_step").getComponent(cc.Label);
    
        for(var i = 1;i<3;i++){
            var item = this.main_container.getChildByName("item_"+i);
            if(item){
                var object = {};
                object.item = item;
                object.title = item.getChildByName("title").getComponent(cc.Label);
                object.last_lev = item.getChildByName("last_lev").getComponent(cc.Label);
                object.now_lev = item.getChildByName("now_lev").getComponent(cc.Label);
                object.arrow = item.getChildByName("arrow");
                object.title.string = "";
                object.last_lev.string = "";
                object.now_lev.string = "";
                object.arrow.active = false;
    
                this.item_list[i] = object;
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openHallowsStepUpWindow(false);
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(id){
        this.handleEffect(true) ;
        if(id){
            this.data = this.model.getHallowsById(id);
            this.data_config = Config.hallows_data.data_base[id];
            if(this.data && this.data_config){
                this.setBaseInfo();
                this.setAttrInfo();
            }
        }
    },

    setBaseInfo:function(){
        if(this.data == null || this.data_config == null)return;
        this.hallows_name.string = this.data_config.name;
        this.old_step.string = (this.data.step-1)+Utils.TI18N("级");
        this.cur_step.string = this.data.step+Utils.TI18N("级");
    },

    setAttrInfo:function(){
        if(this.data == null)return;
        var vo = this.data;
        
        var old_config = gdata("hallows_data","data_info",Utils.getNorKey(vo.id, vo.step-1));
        var cur_config = gdata("hallows_data","data_info",Utils.getNorKey(vo.id, vo.step));
        if(old_config == null || cur_config == null)return;
        for(var i in old_config.attr){
            if(i>1)break;
            var attr_key = old_config.attr[i][0];
		    var attr_val = old_config.attr[i][1];
            var attr_name = Config.attr_data.data_key_to_name[attr_key];
            if(attr_name){
                var object = this.item_list[parseInt(i)+1];
                if(object){
                    object.title.string = attr_name;
			    	object.last_lev.string = attr_val;
                }
            }
        }

        for(var j in cur_config.attr){
            if(i>1)break;
            var attr_key = cur_config.attr[j][0];
		    var attr_val = cur_config.attr[j][1];
            var attr_name = Config.attr_data.data_key_to_name[attr_key];
            if(attr_name){
                var object = this.item_list[parseInt(j)+1];
                if(object){
                    object.arrow.active = true;
                    object.now_lev.string = attr_val;
                    //如果上一阶没有这个属性.那么上一阶显示0
                    if(old_config.attr[j] == null){
                        object.title.string = attr_name;
                        object.last_lev.string = 0;
                    }
                }
            }
        }
    },

    handleEffect:function(status){
        if(!status){
            if(this.title_eff_sk){
                this.title_eff_sk.setToSetupPose();
                this.title_eff_sk.clearTracks();
            }
        }else{
            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(189), "action");
            this.loadRes(anima_path, function(ske_data) {
                this.title_eff_sk.skeletonData = ske_data;
                this.title_eff_sk.setAnimation(0, PlayerAction.action, false);
            }.bind(this));
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.handleEffect(false);
        this.ctrl.openHallowsStepUpWindow(false);
    },
})