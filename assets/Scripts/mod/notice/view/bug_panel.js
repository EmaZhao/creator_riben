// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var LoaderManager = require("loadermanager")
var RoleController = require("role_controller");

var BugPanel = cc.Class({
    extends: BaseView,
    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("notice", "bug_panel");
        this.viewTag = SCENE_TAG.dialogue;
        this.win_type = WinType.Mini;
    },

    openCallBack: function () {
        this.backpanel = this.root_wnd.getChildByName("backpanel");
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.ok_btn = this.main_panel.getChildByName("ok_btn");

        this.tab_container = this.main_panel.getChildByName("tab_container");
        this.btn_list = [];
        for(let i = 0; i < 2; i++){
            var btn = this.tab_container.getChildByName("tab_btn_" + (i+1));
            btn.label = btn.getChildByName("title");
            btn.label.color = new cc.Color(0xcf, 0xb5, 0x93, 0xff);
            btn.buttom = btn.getComponent(cc.Button);
            this.btn_list[i] = btn;
            btn.index = i;
            
        }
        this.changeIndex(0);
        this.title_input = this.main_panel.getChildByName("title_input").getComponent(cc.EditBox);
        this.content_input = this.main_panel.getChildByName("content_input").getComponent(cc.EditBox);
        this.desc = this.main_panel.getChildByName("desc").getComponent(cc.RichText);
        this.desc.string = cc.js.formatStr(Utils.TI18N("<color=#593429>亲爱的冒险者大人：<br/>欢迎您进驻《%s》的冒险世界，如您在游戏中发现BUG或有什么建议，请您填写留言并提交，我们会认真对待你们的建议~如有紧急问题，请点击【浮标】→【客服】进行反馈，我们会第一时间给你回复！</color>"), GAME_NAME);
        Utils.getNodeCompByPath("main_panel/top_panel/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("反馈问题");
        Utils.getNodeCompByPath("main_panel/tab_container/tab_btn_1/title", this.root_wnd, cc.Label).string = Utils.TI18N("提交建议");
        Utils.getNodeCompByPath("main_panel/tab_container/tab_btn_2/title", this.root_wnd, cc.Label).string = Utils.TI18N("BUG反馈");
        Utils.getNodeCompByPath("main_panel/ok_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("提 交");
        Utils.getNodeCompByPath("main_panel/edit_box_content", this.root_wnd, cc.Label).string = Utils.TI18N("内容：");
        Utils.getNodeCompByPath("main_panel/edit_box_title", this.root_wnd, cc.Label).string = Utils.TI18N("标题：");
        Utils.getNodeCompByPath("main_panel/title_input/PLACEHOLDER_LABEL", this.root_wnd, cc.Label).string = Utils.TI18N("请输入标题");
        Utils.getNodeCompByPath("main_panel/content_input/PLACEHOLDER_LABEL", this.root_wnd, cc.Label).string = Utils.TI18N("请输入内容");
    },

    registerEvent: function () {
        var NoticeController = require("notice_controller");
        this.backpanel.on(cc.Node.EventType.TOUCH_END, function(event){
            NoticeController.getInstance().openBugPanel(false);
        }, this);
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            NoticeController.getInstance().openBugPanel(false);
        }, this);
        this.ok_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            if(this.title_input.string == ""){
                message(Utils.TI18N("请输入标题"));
                return;
            }
            if(this.content_input.string == ""){
                message(Utils.TI18N("请输入内容"));
                return;
            }
            NoticeController.getInstance().sender10810(this.index + 2, this.title_input.string, this.content_input.string);
            this.title_input.string = "";
            this.content_input.string = "";
        }, this);
        for(let i=0; i<2; i++){
            var btn = this.btn_list[i];
            btn.on(cc.Node.EventType.TOUCH_END, function(event){
                this.changeIndex(i);
            }, this);
        }
    },

    changeIndex : function(index){
        if(this.index == index){
            return;
        }
        if(index < 0 || index > 1){
            index = 0;
        }
        this.index = index;
        if(this.cur_tab){
            this.cur_tab.buttom.interactable = true;
            this.cur_tab.getChildByName("select").active = false;
            this.cur_tab.label.color = new cc.Color(0xcf, 0xb5, 0x93, 0xff);
        }
        this.cur_tab = this.btn_list[index];
        if(this.cur_tab){
            this.cur_tab.buttom.interactable = false;
            this.cur_tab.getChildByName("select").active = true;
            this.cur_tab.label.color = new cc.Color(0xff, 0xed, 0xd6, 0xff);
        }
    },

    openRootWnd: function(){
       
    },

    closeCallBack: function () {
        if(this.role_update_evt){
            this.roleVo.unbind(this.role_update_evt);
        }
    }
});

module.exports = BugPanel;
