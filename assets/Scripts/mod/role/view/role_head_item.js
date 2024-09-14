// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      头像选择
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PlayerHead = require("playerhead");

var RoleHeadItem = cc.Class({
    extends: PlayerHead,
    ctor: function () {
    },

    initPanel: function () {
        this._super();
    },

    registerEvent: function () {
        this._super();
    },

    onShow: function () {
        this.setLockStatus(this.data.status == 1);
        this.setUsed(this.data.use == 1);
        this.setName(this.data.name);
        this.setHeadRes(this.data.face_id);
        if(this.extend_data.select_func){
            this.extend_data.select_func(this);
        }
    },

    setData: function (data) {
        this.data = data;
        this.show(data);
    },

    setExtendData: function (data) {
        this.extend_data = data;
    },

    // 设置名称
    setName: function (name) {
        if (name) {
            if(!this.name_label){
                this.name_label = Utils.createLabel(18, new cc.Color(0x68, 0x45, 0x2a), null, 
                    0, -75, name, this.root_wnd, null, cc.v2(0.5, 0.5));
            }else{
              this.name_label.string = name;
            }
        }
    },

    // 设置使用状态 
    setUsed: function (bool) {
        if (!this.root_wnd) return;
        if (bool) {
            if (!this.use_node) {
                this.use_node = new cc.Node();
                this.use_node_sprite = this.use_node.addComponent(cc.Sprite);
                this.loadRes(PathTool.getUIIconPath("face", "txt_cn_face_use"), function (bg_sp) {
                    this.use_node_sprite.spriteFrame = bg_sp;
                }.bind(this))
                this.root_wnd.addChild(this.use_node, 100);
                this.use_node.setPosition(12, -33);
            }
            this.use_node.active = true;
        } else if (this.use_node) {
            this.use_node.active = false;
        }
    },

    // 设置选择状态 
    setSelected: function (bool) {
        if (!this.root_wnd) return;
        if (bool) {
            if (!this.select) {
                this.select = new cc.Node();
                this.select_sprite = this.select.addComponent(cc.Sprite);
                var common_res_path = PathTool.getCommonIcomPath("common_1060");
                this.loadRes(common_res_path, function (sf_obj) {
                    this.select_sprite.spriteFrame = sf_obj;
                }.bind(this))
                this.root_wnd.addChild(this.select);
            }
            this.select.active = bool;
            this.select.runAction(cc.repeatForever(cc.sequence(
                cc.fadeIn(0.7), cc.fadeOut(0.7)
            )));
        } else if (this.select) {
            this.select.active = bool;
            this.select.stopAllActions();
        }
    },

    onDelete: function () {
        if (this.select) {
            this.select.destroy();
            this.select = null;
            this.select_sprite = null;
        }
        if (this.use_node) {
            this.use_node.destroy();
            this.use_node = null;
            this.use_node_sprite = null;
        }
    },
});

module.exports = RoleHeadItem;