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
        this.prefabPath = PathTool.getPrefabPath("common", "common_input_alert");
        this.viewTag = SCENE_TAG.msg;
    },

    openCallBack: function () {
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.background    = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.ok_btn = this.main_panel.getChildByName("ok_btn");
        this.ok_label = this.ok_btn.getChildByName("label").getComponent(cc.Label);
        this.cancel_btn = this.main_panel.getChildByName("cancel_btn");
        this.cancel_label = this.cancel_btn.getChildByName("label").getComponent(cc.Label);
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.input = this.main_panel.getChildByName("editbox").getComponent(cc.EditBox);
        this.place_label = this.main_panel.getChildByName("editbox").getChildByName("PLACEHOLDER_LABEL").getComponent(cc.Label);
        this.input_desc = this.main_panel.getChildByName("input_label").getComponent(cc.Label);
        this.msg = this.main_panel.getChildByName("msg").getComponent(cc.RichText);
        this.gold_sp = this.seekChild(this.main_panel,"gold",cc.Sprite);
        if(this.gold_res!=null){
            this.setGoldImg(this.gold_res,this.gold_pos)
        }
    },

    registerEvent: function () {
        
    },

    openRootWnd: function(data){
        // var data = { input_desc: input_desc, desc_str:desc_str, placeholder_str:placeholder_str, confirm_label: confirm_label, confirm_callback: confirm_callback, cancel_label: cancel_label, cancel_callback: cancel_callback, close:close, close_callback: close_callback, other_args: other_args};
        this.input_desc.string = data.input_desc || "";
        this.msg.string = data.desc_str || "";
        this.place_label.string = data.placeholder_str || "";
        this.ok_label.string = data.confirm_label || Utils.TI18N("确认");
        this.cancel_label.string = data.cancel_label || Utils.TI18N("取消");
        if(data.other_args && data.other_args.maxLength){
            this.input.maxLength = data.other_args.maxLength;
        }
        var resArr = [];
        if(data.other_args && data.other_args.resArr){
            resArr = data.other_args.resArr;
        }

        if(resArr && resArr.length>0){
            for(let i=0;i<resArr.length;++i){
                this.loadRes(resArr[i], (function(resObject){
                    this.msg.addSpriteFrame(resObject);
                }).bind(this));
            }
        }
        this.ok_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            if( data.confirm_callback(this.input.string)){
                this.close();
            }
        }).bind(this));
        this.cancel_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            if(data.cancel_callback) data.cancel_callback();
            this.close();
        }).bind(this));
        if(data.close != false){
            this.close_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
                if(data.close_callback){
                    data.close_callback();
                }else if(data.cancel_callback){
                    data.cancel_callback();
                }
                this.close();
            }).bind(this));
        }
    },

    setGoldImg:function(res,pos){
        if(this.gold_sp==null){
            this.gold_res = res;
            this.gold_pos = pos;
            return
        }
        this.loadRes(res,function(bg_sp){
            this.gold_sp.spriteFrame = bg_sp
        }.bind(this))
        this.gold_sp.node.setPosition(pos.x,pos.y)
    },

    closeCallBack: function () {
    }
});

module.exports = CommonAlertWin;
