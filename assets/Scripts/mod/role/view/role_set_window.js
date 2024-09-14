// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RoleController = require("role_controller");
var BaseRole = require("baserole");
var PlayerHead = require("playerhead");
var LoginController = require("login_controller");

var RoleSetWindow = cc.Class({
    extends: BaseView,
    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_set_window");
        this.viewTag = SCENE_TAG.dialogue;
    },

    openCallBack: function () {
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        
        var info_con = this.main_container.getChildByName("info_con");
        this.name = info_con.getChildByName("name").getComponent(cc.Label);
        this.pen = info_con.getChildByName("pen");
        this.title_label = info_con.getChildByName("title_val").getComponent(cc.Label);
        this.head = new PlayerHead();
        this.head.setParent(info_con);
        this.head.setPosition(-119, 22);
        this.head.show();
        
        var music_con = this.main_container.getChildByName("music_con");
        this.music_btn = music_con.getChildByName("music_btn").getComponent(cc.Toggle);
        this.sound_btn = music_con.getChildByName("sound_btn").getComponent(cc.Toggle);
        this.voice_btn = music_con.getChildByName("voice_btn").getComponent(cc.Toggle);
        this.auto_pk_btn = music_con.getChildByName("auto_pk_btn").getComponent(cc.Toggle);
        this.property_btn = this.seekChild(music_con,"property_btn",cc.Toggle);

        var btn_con = this.main_container.getChildByName("btn_con");
        this.quit_btn = btn_con.getChildByName("quit_btn");
        this.switch_btn = btn_con.getChildByName("switch_btn");
        this.exchange_btn = btn_con.getChildByName("exchange_btn");
        this.contact_btn = btn_con.getChildByName("contact_btn");
        this.language_btn = this.seekChild(btn_con,"language_btn");
        this.share_btn = this.seekChild(btn_con,"share_btn");
        this.customer_service_btn = this.seekChild(btn_con,"customer_service_btn");
        this.diamond_btn = this.seekChild(btn_con,"diamond_btn");
        
        if(PLATFORM_TYPR == "SH_RH" ){
            this.share_btn.active = false;
            this.switch_btn.active = false;
            this.quit_btn.active = false;
            music_con.y = 40;
            this.voice_btn.node.y = -50;
            this.property_btn.node.y = -50;
            this.auto_pk_btn.node.y = -133;
            this.contact_btn.y = -60;
            this.exchange_btn.y = -60;
        }else if(PLATFORM_TYPR == "QQ_SDK"){
            this.switch_btn.active = false;
            this.share_btn.active = false;
            this.property_btn.node.active = false;
            this.auto_pk_btn.node.x = 66;
            this.auto_pk_btn.node.y = -36.7;
        }else if(PLATFORM_TYPR == "SH_SDK"){
            this.share_btn.active = false;
            this.switch_btn.active = this.customer_service_btn.active = true;
            var switchLab = this.switch_btn.getChildByName("Label").getComponent(cc.Label);
            switchLab.string = Utils.TI18N("刷新游戏");
            this.quit_btn.active = false;
            music_con.y = 40;
            this.voice_btn.node.y = -40;
            this.property_btn.node.y = -40;
            this.auto_pk_btn.node.y = -113;
            this.contact_btn.y = -20;
            this.exchange_btn.y = -20;
            this.switch_btn.y = -100;
            this.customer_service_btn.y = -100;
        }

        this.model_con = this.main_container.getChildByName("model_con");
        this.change_btn = this.model_con.getChildByName("change_btn");
        this.title = this.model_con.getChildByName("title_img").getComponent(cc.Sprite);
        this.spine = new BaseRole();
        this.spine.setParent(this.model_con);
        this.spine.node.setPosition(120, -70);
        var effect_nd = this.model_con.getChildByName("effect")
        if(effect_nd){
          effect_nd.active = false;
        }
        // this.spine.scale = 0.8;
        this.roleVo = RoleController.getInstance().getRoleVo();
        if(!this.roleVo.title_id){
            RoleController.getInstance().send23300();
        }

        Utils.getNodeCompByPath("main_container/title_container/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("设置");
        Utils.getNodeCompByPath("main_container/info_con/title", this.root_wnd, cc.Label).string = Utils.TI18N("称号：");
        Utils.getNodeCompByPath("main_container/music_con/sound_btn/name", this.root_wnd, cc.Label).string = Utils.TI18N("音效");
        Utils.getNodeCompByPath("main_container/music_con/voice_btn/name", this.root_wnd, cc.Label).string = Utils.TI18N("语音");
        Utils.getNodeCompByPath("main_container/music_con/music_btn/name", this.root_wnd, cc.Label).string = Utils.TI18N("音乐");
        Utils.getNodeCompByPath("main_container/music_con/auto_pk_btn/name", this.root_wnd, cc.Label).string = Utils.TI18N("切磋无需验证");
        Utils.getNodeCompByPath("main_container/music_con/property_btn/name", this.root_wnd, cc.Label).string = Utils.TI18N("高品质");
        Utils.getNodeCompByPath("main_container/btn_con/quit_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("退出游戏");
        Utils.getNodeCompByPath("main_container/btn_con/contact_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("Bug反馈");
        Utils.getNodeCompByPath("main_container/btn_con/exchange_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("礼包兑换");
        Utils.getNodeCompByPath("main_container/btn_con/diamond_btn/Label", this.root_wnd, cc.Label).string = "聖竜石内訳";
        Utils.getNodeCompByPath("main_container/model_con/change_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("个性设置");

    },

    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function (event){
            RoleController.getInstance().openRoleInfoView(false);
        }, this);
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function (event){
            Utils.playButtonSound("c_close");
            RoleController.getInstance().openRoleInfoView(false);
        }, this);
        this.change_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            RoleController.getInstance().openRoleDecorateView(true);
        }, this);
        this.music_btn.node.on(cc.Node.EventType.TOUCH_END, function (event){
            gcore.SysEnv.set("music_status", this.music_btn.isChecked ? "1" : "0");
            gcore.GlobalEvent.fire(EventId.VOICE_SETTING, "music_status");           
            // VOICE_SETTING
        }, this);
        this.sound_btn.node.on(cc.Node.EventType.TOUCH_END, function (event){
            gcore.SysEnv.set("sound_status", this.sound_btn.isChecked ? "1" : "0");
            gcore.GlobalEvent.fire(EventId.VOICE_SETTING, "sound_status");            
        }, this);
        this.voice_btn.node.on(cc.Node.EventType.TOUCH_END, function (event){
            gcore.SysEnv.set("voice_status", this.voice_btn.isChecked ? "1" : "0");
            gcore.GlobalEvent.fire(EventId.VOICE_SETTING, "voice_status");            
        }, this); 
        this.auto_pk_btn.node.on(cc.Node.EventType.TOUCH_END, function (event){
            RoleController.getInstance().send10318(this.auto_pk_btn.isChecked ? 1 : 0);
        }, this);
        this.language_btn.on(cc.Node.EventType.TOUCH_END, function (event){
            message(Utils.TI18N("功能暂未开放!"))
        }, this);
        this.share_btn.on(cc.Node.EventType.TOUCH_END, function (event){
            message(Utils.TI18N("功能暂未开放!"))
        }, this);
        this.quit_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            window.location.reload();
        }, this);
        this.switch_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            RoleController.getInstance().init_role = false;
            if(PLATFORM_TYPR == "SH_SDK"){
                if(IS_RESET == true)return;
                // cc.game.restart();
                IS_RESET = true;
                LoginController.getInstance().sender10312();
            }else{
                window.location.reload();
            }
        }, this);
        this.contact_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            var NoticeController = require("notice_controller");
            NoticeController.getInstance().openBugPanel(true);
        })

        this.customer_service_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            if(PLATFORM_TYPR == "SH_SDK" && SDK){
                SDK.openCustomerServiceConversation();
            }
        })
        
        this.exchange_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            var CommonAlert = require("commonalert");
            CommonAlert.showInputApply(null, null, Utils.TI18N("请输入正确的兑换码"), Utils.TI18N("兑换"), (function(str){
                str = str.replace('\n', '');
                if(str == ""){
                    message(Utils.TI18N("请输入兑换码"));
                }else{
                    RoleController.getInstance().sender10945(str);
                    return true;
                }
            }).bind(this), null, null, null, null, {maxLength:36},2);
        }, this);
        if(!this.role_update_evt){
            this.role_update_evt = this.roleVo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function(key, val){
                if(key == "name"){
                    this.name.string = val;
                }else if(key == "look_id"){
                    this.updateSpine(val);
                }else if(key == "title_id"){
                    this.updateTitle(val);
                }else if(key == "face_id"){
                    this.updateHead(val);
                }else if(key == "avatar_base_id"){
                    this.updateHeadFrame(val);
                }
            }), this);
        }
        this.pen.on(cc.Node.EventType.TOUCH_END, function(event){
            var CommonAlert = require("commonalert");
            var msg = Utils.TI18N("<color=#a95f0f>改名需消耗200 <img src='3' /></color>");
            var res = PathTool.getItemRes(3);
            if (this.roleVo.is_first_rename == 1){
                msg = Utils.TI18N("<color=#a95f0f>首次更改免费哦~</color>")
            }
            CommonAlert.showInputApply(Utils.TI18N("名字："), msg, Utils.TI18N("请输入名字（限制6字）"), Utils.TI18N("确认"), (function(name){
                name = name.replace('\n', '');
                if(name == ""){
                    message(Utils.TI18N("请输入角色名称"));
                }else{
                    RoleController.getInstance().changeRoleName(name, Math.min(1, this.roleVo.sex));
                    return true;
                }
            }).bind(this), null, null, null, null, {maxLength:6,resArr:[res]});
            // win.setGoldImg(PathTool.getItemRes(3),cc.v2(100,-5))
        }, this)
        this.diamond_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            RoleController.getInstance().openDiamondDetailPanel(true);
        },this);

    },

    openRootWnd: function(){
        this.updateData();
    },

    updateData : function(){
        this.music_btn.isChecked = gcore.SysEnv.get("music_status", "1") == "1";
        this.sound_btn.isChecked = gcore.SysEnv.get("sound_status", "1") == "1";
        this.voice_btn.isChecked = gcore.SysEnv.get("voice_status", "1") == "1";
        this.roleVo = RoleController.getInstance().getRoleVo();
        this.auto_pk_btn.isChecked = this.roleVo.auto_pk == 1;
        this.name.string = this.roleVo.name;
        this.updateSpine(this.roleVo.look_id);
        this.updateTitle(this.roleVo.title_id);
        this.updateHead(this.roleVo.face_id);
        this.updateHeadFrame(this.roleVo.avatar_base_id);
    },

    updateSpine : function(look_id){
        this.spine.setData(BaseRole.type.role, look_id, PlayerAction.show, true,0.6);
    },

    updateHead : function(bid){
        this.head.setHeadRes(bid);
    },

    updateHeadFrame : function(bid){
        this.head.setFrameRes(bid);
    },

    updateTitle : function(bid){
        var config = Config.honor_data.data_title[bid];
        if(config){
            this.title_label.string = config.name;
            this.loadRes(PathTool.getHonorRes(config.res_id), (function(resObject){
                this.title.spriteFrame = resObject;
            }).bind(this));
        }else{
            this.title_label.string = Utils.TI18N("无");
            this.title.spriteFrame = null;
        }
    },

    closeCallBack: function () {
        RoleController.getInstance().openRoleInfoView(false);
        if(this.role_update_evt){
            this.roleVo.unbind(this.role_update_evt);
        }
    }
});

module.exports = RoleSetWindow;