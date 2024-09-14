// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-13 10:57:38
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroVo = require("hero_vo");

var Guildwar_battle_arrayPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_battle_array_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.hero_item_list = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("container");
        this.bg_image_nd = this.seekChild("image_1");
        this.title_bg_nd = this.seekChild("titile_bg");

        this.form_image_sp = this.seekChild("form_image", cc.Sprite);
        this.form_label_lb = this.seekChild("form_label", cc.Label);
        this.scrollCon = this.seekChild("scrollCon");

        this.power_cr = this.seekChild("power").getComponent("CusRichText");
        this.scroll_view_nd = this.seekChild("scroll_view");
        this.scroll_view_size = this.scroll_view_nd.getContentSize();
        this.scroll_content = this.seekChild(this.scroll_view_nd, "content");

        if(this.newsize){
            this.setPanelContentSize(this.newsize);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (data, is_spec) {
        this.data = data;
        this.is_spec = is_spec;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        var data = this.data || {};

        this.power_cr.setNum(data.power || 0);

        var temp_partner_vo = [];
        for (var k in data.partner_list) {
            var v = data.partner_list[k];
            var vo = new HeroVo();
            vo.updateHeroVo(v);
            temp_partner_vo.push(vo)
        }

        var p_list_size = temp_partner_vo.length;
        var scale = 0.87;
        var total_width = p_list_size * 119 * scale + (p_list_size) * 6;
        var max_width = Math.max(total_width, this.scroll_view_size.width);
        this.scroll_content.setContentSize(max_width, this.scroll_view_size.height);
        var index = 1;
        for (var i in temp_partner_vo) {
            var v = temp_partner_vo[i];
            var partner_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
            partner_item.setRootScale(scale);
            partner_item.setPosition(-total_width / 2 - 60 + index * 130 * scale, 0);
            partner_item.show();
            partner_item.setData(v, null, this.is_spec);
            if (v.rare_type && v.rare_type > 0) {
                partner_item.showRareType(v.rare_type);
            }
            this.hero_item_list.push(partner_item);
            partner_item.setParent(this.scroll_content);
            index = index + 1;
        }

        if (data.formation_type) {
            var form_data = Config.formation_data.data_form_data[data.formation_type];
            if (form_data) {
                var form_lv = data.formation_lev || 1;
                this.form_label_lb.string = form_data.name;
            }
            this.form_label_lb.node.active = true;
            this.form_image_sp.node.active = true;
            this.loadRes(PathTool.getUIIconPath("form", "form_icon_" + data.formation_type), function (sp) {
                this.form_image_sp.spriteFrame = sp;
            }.bind(this))
        } else {
            this.form_label_lb.node.active = false;
            this.form_image_sp.node.active = false;
        }
    },

    setPanelContentSize: function (newsize) {
        if (this.root_wnd) {
            this.root_wnd.setContentSize(newsize);
            this.container.setContentSize(newsize);
            this.bg_image_nd.setContentSize(newsize);
            this.title_bg_nd.setContentSize(newsize.width - 3, 44);
        }else{
            this.newsize = newsize;
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.hero_item_list) {
            for (var i in this.hero_item_list) {
                var v = this.hero_item_list[i];
                if (v) {
                    v.deleteMe();
                    v = null;
                }
            }
            this.hero_item_list = null;
        }
    },
})