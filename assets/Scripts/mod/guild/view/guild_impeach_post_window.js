// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      弹劾面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");

var GuildImpeachPostWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_impeach_post_window");
        this.win_type = WinType.Mini;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.close_btn = this.seekChild("close_btn");
        this.background.scale = FIT_SCALE;
        this.notice = this.seekChild("notice",cc.Label);
        this.impeach_btn = this.seekChild("impeach_btn");
        this.text_diamond = this.seekChild(this.impeach_btn,"textDiamond",cc.Label);
        this.btn_sp = this.seekChild(this.impeach_btn,"sprite",cc.Sprite)
        this.loadRes(PathTool.getItemRes(3),function(bg_sp){
            this.btn_sp.spriteFrame = bg_sp;
        }.bind(this))
    },



    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildImpeachPostWindow(false);
        }, this)

        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildImpeachPostWindow(false);
        }, this)

        this.impeach_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.send13565();
            this.ctrl.openGuildImpeachPostWindow(false);
        }, this)
    },




    openRootWnd: function () {
        if(this.notice){
            this.notice.string = Utils.TI18N("该会长长期不在线，为了公会的健康发展，需要一位新的会长站出来。弹劾会长后，你将成为新的会长");
        }

        this.text_diamond.string = gdata("guild_data","data_const","impeach_gold").val[0][1];
    },

    closeCallBack: function () {
        this.ctrl.openGuildImpeachPostWindow(false);
    }

});

module.exports = GuildImpeachPostWindow;