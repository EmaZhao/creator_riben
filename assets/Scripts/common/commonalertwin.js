// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      通用提示框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");

var CommonAlertWin = cc.Class({
    extends: BaseView,

    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("common", "common_alert");
        this.viewTag = arguments[0] || SCENE_TAG.msg;
    },

    openCallBack: function () {
        this.main_panel    = this.root_wnd.getChildByName("main_panel");
        this.background    = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        if(window.IS_PC){
          this.background.setContentSize(2200,1280);
        }
        this.ok_btn        = this.main_panel.getChildByName("ok_btn").getComponent(cc.Button);
        this.ok_btn_lb     = this.seekChild("ok_txt", cc.Label);
        this.ok_btn_lo     = this.seekChild("ok_txt", cc.LabelOutline);
        this.cancel_btn    = this.main_panel.getChildByName("cancel_btn");
        this.cancel_btn_lb = this.seekChild("cancel_txt", cc.Label);
        this.close_btn     = this.main_panel.getChildByName("close_btn");
        this.title_lb       = this.seekChild("title_label",cc.Label)
        this.aler_des_rt   = this.seekChild("aler_des", cc.RichText);

        this.click_jump_rt = this.seekChild("jumpBtn",cc.RichText)

        this.ok_btn.node.on("click", this.didClickOkBtn, this);
        this.cancel_btn.on("click", this.didClickCancleBtn, this);
        Utils.getNodeCompByPath("main_panel/title_container/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("提示");
    },

    registerEvent: function () {
        this.close_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            if(this.close_callback){
                this.close_callback();
            }
            Utils.playButtonSound(2)
            this.close();
        }).bind(this))
    },

    openRootWnd: function(params) {
        this.aler_des_rt.string = params.str;
        var resArr = [];
        if(params.other_args && params.other_args.resArr){
            resArr = params.other_args.resArr;
        }

        if(resArr && resArr.length>0){
            for(let i=0;i<resArr.length;++i){
                this.loadRes(resArr[i], (function(resObject){
                    this.aler_des_rt.addSpriteFrame(resObject);
                }).bind(this));
            }
        }

        if (params.confirm_label) this.ok_btn_lb.string = params.confirm_label;
        if (params.cancel_label) this.cancel_btn_lb.string = params.cancel_label;
        this.confirm_callback = params.confirm_callback;
        this.cancel_callback = params.cancel_callback;
        this.close_callback = params.close_callback;

        this.main_panel.runAction(cc.scaleTo(0.1, 1))
        if(params.other_args && params.other_args.title){
            this.title_lb.string = params.other_args.title;
        }
        if(params.other_args && params.other_args.extend_str){
            this.aler_des_rt.node.y = 44
            if(params.other_args.callFunc){
                this.click_jump_rt.addTouchHandler("handler",params.other_args.callFunc)
            }
            this.click_jump_rt.string = params.other_args.extend_str;
        }
        if(params.other_args && params.other_args.maxWidth){
            this.aler_des_rt.maxWidth = params.other_args.maxWidth;
        }
        if(params.other_args && params.other_args.align != null){
            this.aler_des_rt.horizontalAlign = params.other_args.align;
        }
        if(params.other_args && params.other_args.delayS){
            this.ok_btn.interactable = false;
            this.ok_btn.enableAutoGrayEffect = true;
            let s = params.other_args.delayS
            var self = this
            if(s > 0){
                this.ok_btn_lo.color = new cc.Color(125,125,125)
                self.ok_btn_lb.string = params.confirm_label + "(" + s + ")";
                this.ok_btn.schedule(function(){
                    s--
                    if(s <= 0){
                        self.ok_btn_lo.color = new cc.Color(106,43,0);
                        self.ok_btn.unscheduleAllCallbacks();
                        self.ok_btn.interactable = true;
                        self.ok_btn.enableAutoGrayEffect = false;
                        self.ok_btn_lb.string = params.confirm_label;
                    }else{
                        self.ok_btn_lb.string = params.confirm_label + "(" + s + ")";
                    }
                },1)
            }
            
        }

        if(params.other_args && params.other_args.isPlot){
          if(window.IS_PC){
            return;
          }
          this.root_wnd.rotation = 90;
          this.background.scale = 1/FIT_SCALE;
          this.root_wnd.x = -640;
          this.root_wnd.y = 360;
        }
    },

    closeCallBack: function () {
        this.ok_btn.unscheduleAllCallbacks();
    },

    didClickOkBtn: function() {
        Utils.playButtonSound(1)
        this.close();
        if (this.confirm_callback) this.confirm_callback();
    },

    didClickCancleBtn: function() {
        Utils.playButtonSound(1)
        this.close();
        if (this.cancel_callback) this.cancel_callback();
    },
});

module.exports = CommonAlertWin;
