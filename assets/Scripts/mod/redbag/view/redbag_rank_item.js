// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");

var RedBagRankItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_rank_item");
        this.data = null;
        this.star_list = {};
        this.is_show_point = false;
        this.size = cc.size(600, 123);
    },

    initPanel: function () {
        this.main_panel = this.seekChild("main_panel");
        this.rank_icon = this.seekChild("rank_icon", cc.Sprite);

        //名字
        this.role_name = Utils.createLabel(26, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 125 - this.size.width / 2, 0, "", this.main_panel, 0,cc.v2(0, 0.5))
        this.rank_index = Utils.createLabel(30, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 50 - this.size.width / 2, 0, "", this.main_panel, 0,cc.v2(0, 0.5))

        //发放总价值
        this.send_money = Utils.createLabel(22, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 355 - this.size.width / 2, 0 + 15, "", this.main_panel, 0,cc.v2(0, 0.5))
        //发放数
        this.send_num = Utils.createLabel(22, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 355 - this.size.width / 2, 0 - 15, "", this.main_panel, 0,cc.v2(0, 0.5))
    },

    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END,function(){
            if(this.calkl_fun)
                this.call_fun(this.data);
        },this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null) return
        var vo = this.data;
        var index = Number(vo.index) + 1;
        this.index = index || 1;
        this.rank_index.string = this.index;
        if (this.index >= 1 && this.index <= 3) {
            this.rank_index.node.active = false;
            this.rank_icon.node.active = true;
            this.loadRes(PathTool.getUIIconPath("common", "common_300" + this.index), function (sf_obj) {
                this.rank_icon.spriteFrame = sf_obj;
            }.bind(this))
            this.rank_icon.node.setScale(0.7);
        } else {
            this.rank_index.node.active = true;
            this.rank_icon.node.active = false;
        }

        var name = vo.name || "";
        this.role_name.string = name;
        var price = vo.price || "";
        this.send_money.string = Utils.TI18N("ご祝儀配布総額：" + price);
        var num = vo.num || 0;
        this.send_num.string = Utils.TI18N("ご祝儀配布数：" + num);
    },

    clickHandler:function(){
        if(this.call_fun)
            this.call_fun(this.data);
    },

    addCallBack:function(call_fun){
        this.call_fun = call_fun;
    },

    setVisibleStatus:function(bool){
        this.setVisible(bool);
    },

    getData:function(){
        return this.data;
    },

    onDelete: function () {

    }
});

module.exports = RedBagRankItem;