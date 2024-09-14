// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var LoaderManager = require("loadermanager");
var RoleController = require("role_controller");

var RoleDecorateWindow = cc.Class({    
    extends: BaseView,
    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_decorate_window");
        this.viewTag = SCENE_TAG.dialogue;
        this.win_type = WinType.Mini;
    },

    openCallBack: function () {
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.title_container = this.main_container.getChildByName("title_container");
        this.title_label = this.title_container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("更换装饰");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.scrollCon = this.main_container.getChildByName("scrollCon");
        this.tab_container = this.main_container.getChildByName("tab_container");
        this.tab_list = [
            {label : Utils.TI18N("头像"), index : 1, status : true}
            ,{label : Utils.TI18N("头像框"), index : 2, status : false}
            ,{label : Utils.TI18N("冒险形象"), index : 3, status : false}
            ,{label : Utils.TI18N("称号"), index : 4, status : false}
        ];
        for(let i = 0; i < 4; i++){
            var tab = this.tab_list[i];
            tab.btn = this.tab_container.getChildByName("tab_btn_" + tab.index);
            tab.btn_label = tab.btn.getChildByName("title").getComponent(cc.Label);
            // tab.btn_label.node.color =  new cc.Color(0xcf, 0xb5, 0x93, 0xff);
            tab.btn_sprite = tab.btn.getComponent(cc.Sprite);
            tab.btn_label.string = tab.label;
            tab.btn.getComponent(cc.Button).interactable = true;
            tab.btn.on(cc.Node.EventType.TOUCH_END, function(event){
                Utils.playButtonSound(ButtonSound.Tab);
                this.changeIndex(i+1);
            }, this);
        }
    },

    registerEvent: function () {
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            RoleController.getInstance().openRoleDecorateView(false);
        }, this);
        this.background.on(cc.Node.EventType.TOUCH_END, function(event){
            RoleController.getInstance().openRoleDecorateView(false);
        }, this);
    },

    openRootWnd: function(index, setting){
        this.changeIndex(index || 1);
    },

    changeIndex : function(index){
        if(index == this.index){
            return;
        }
        this.index = index;
        if(this.cur_tab){
            this.cur_tab.btn.getComponent(cc.Button).interactable = true;
            // this.cur_tab.btn_label.node.color = new cc.Color(0xcf, 0xb5, 0x93, 0xff)
            this.cur_tab.panel.hide();
        }
        this.cur_tab = this.tab_list[index - 1];
        if(this.cur_tab){
            this.cur_tab.btn.getComponent(cc.Button).interactable = false;
            // this.cur_tab.btn_label.node.color = new cc.Color(0xff, 0xed, 0xd6, 0xff)
        }
        if(!this.cur_tab.panel){
            if(index == 1){
                var RoleHeadPanel = require("role_head_panel");
                var panel = new RoleHeadPanel();
                panel.setParent(this.scrollCon);
                this.cur_tab.panel = panel;
            }else if(index == 2){
                var RoleFacePanel = require("role_face_panel");
                var panel = new RoleFacePanel();
                panel.setParent(this.scrollCon);
                this.cur_tab.panel = panel;
            }else if(index == 3){
                var RoleBodyPanel = require("role_body_panel");
                var panel = new RoleBodyPanel();
                panel.setParent(this.scrollCon);
                this.cur_tab.panel = panel;
            }else if(index == 4){
                var RoleTitlePanel = require("role_title_panel");
                var panel = new RoleTitlePanel();
                panel.setParent(this.scrollCon);
                this.cur_tab.panel = panel;
            }
        }
        this.cur_tab.panel.show();
    },
    
    closeCallBack: function () {
        RoleController.getInstance().openRoleDecorateView(false);
        for(var i in this.tab_list){
            var tab = this.tab_list[i];
            if(tab.panel){
                tab.panel.deleteMe();
            }
        }
        this.tab_list = null;
    }
});

module.exports = RoleDecorateWindow;