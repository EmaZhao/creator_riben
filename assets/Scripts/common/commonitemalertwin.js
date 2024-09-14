// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      通用提示框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");

var CommonItemAlertWin = cc.Class({
    extends: BaseView,

    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("common", "common_alert");
        this.viewTag = arguments[0] || SCENE_TAG.msg;
        this.item_list = {};
    },

    openCallBack: function () {
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.seekChild("title_label",cc.Label).string = Utils.TI18N("奖励")
        this.background    = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        if(window.IS_PC){
          this.background.setContentSize(2200,1280);
        }
        this.ok_btn = this.main_panel.getChildByName("ok_btn");
        this.ok_btn_lb = this.seekChild("ok_txt", cc.Label);
        this.cancel_btn = this.main_panel.getChildByName("cancel_btn");
        this.cancel_btn_lb = this.seekChild("cancel_txt", cc.Label);
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.title_lb       = this.seekChild("title_label",cc.Label)

        this.cancel_btn.active = false;
        this.ok_btn.x = 0;

        this.aler_des_rt = this.seekChild("aler_des", cc.RichText);

        this.ok_btn.on(cc.Node.EventType.TOUCH_END, this.didClickOkBtn, this);
        this.cancel_btn.on(cc.Node.EventType.TOUCH_END, this.didClickCancleBtn, this);
    },

    registerEvent: function () {
        this.close_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            this.close();
        }).bind(this))
    },

    openRootWnd: function (params) {
        this.aler_des_rt.string = params.str;
        if(params.margin){
            this.aler_des_rt.node.y = this.aler_des_rt.node.y + params.margin.off_y;
            if(params.margin.close_off == true){
                this.close_btn.active = false;
            }
        }else{
            this.aler_des_rt.node.y = this.aler_des_rt.node.y + 57
        }
        // var resArr = [];
        // if(params.other_args && params.other_args.resArr){
        //     resArr = params.other_args.resArr;
        // }

        // if(resArr && resArr.length>0){
        //     for(var i in resArr){
        //         this.loadRes(resArr[i], (function(resObject){
        //             this.aler_des_rt.addSpriteFrame(resObject);
        //         }).bind(this));
        //     }
        // }
        if (params.list) {
            this.createItem(params.list);
        }

        if(params.title_str){
            this.title_lb.string = params.title_str;
        }

        if (params.confirm_label) this.ok_btn_lb.string = params.confirm_label;
        if (params.cancel_label) this.cancel_btn_lb.string = params.cancel_label;
        this.confirm_callback = params.confirm_callback;
        this.cancel_callback = params.cancel_callback;
        this.main_panel.runAction(cc.scaleTo(0.1, 1))
    },

    createItem: function (list) {
        var arr = [];
        for (var i in list) {
            var v = list[i];
            var data = {};
            data.bid = v[0];
            data.num = v[1];
            arr.push(data)
        }
        for (var i in arr) {
            var data = arr[i];
            if (this.item_list[i] == null) {
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 0.9, false, true);
                item.setParent(this.main_panel)
                item.show();
                item.setPosition(140 * i - 70 * (arr.length - 1), 0)
                this.item_list[i] = item;
            }
            this.item_list[i].setData(data)
        }
    },

    didClickOkBtn: function () {
        if (this.confirm_callback) this.confirm_callback();
        this.close();
    },

    didClickCancleBtn: function () {
        if (this.cancel_callback) this.cancel_callback();
        this.close();
    },

    closeCallBack: function () {
        // this.close();
        if (this.item_list) {
            for (var i in this.item_list) {
                if (this.item_list[i]) {
                    this.item_list[i].deleteMe();
                    this.item_list[i] = null;
                }
            }
            this.item_list = null;
        }
    }
});

module.exports = CommonItemAlertWin;
