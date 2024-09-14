// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-11 17:43:55
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroVo = require("hero_vo");
var TimeTool = require("timetool");

var Guildwar_defend_lookPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_defend_look_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.color_1 = new cc.Color(217, 80, 20, 255);
        this.color_2 = new cc.Color(36, 144, 3, 255);
        this.item_list = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("containr");
        this.name_lb = this.seekChild("name_label", cc.Label);
        this.time_lb = this.seekChild("time_label", cc.Label);
        this.attk_lb = this.seekChild("attk_label", cc.Label);
        this.result_lb = this.seekChild("result_label", cc.Label);
        this.magic_lb = this.seekChild("magic_label", cc.Label);
        this.diff_lb = this.seekChild("diff_label", cc.Label);

        this.vedio_btn = this.seekChild("vedio_btn");
        this.role_list = this.seekChild("role_list");

        this.scroll_view = this.seekChild(this.role_list, "scroll_view");
        this.scroll_content = this.seekChild(this.scroll_view, "content");
        this.scroll_view_size = this.scroll_view.getContentSize();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.vedio_btn, function () {
            if (this.data && this.data.repaly_id) {
                require("battle_controller").getInstance().csRecordBattle(this.data.repaly_id);
            }
        }.bind(this), 1)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return

        var data = this.data;
        this.name_lb.string = cc.js.formatStr(Utils.TI18N("挑战者：%s"), data.name);
        this.attk_lb.string = cc.js.formatStr(Utils.TI18N("战力：%s"), data.power);
        this.time_lb.string = cc.js.formatStr(TimeTool.getYMDHMS(data.time));

        var form_data = Config.formation_data.data_form_data[data.formation_type];
        if (form_data) {
            var form_lv = data.formation_lev || 1;
            this.magic_lb.string = cc.js.formatStr("%s Lv.%s", form_data.name, form_lv);
        }

        if (data.result == 1) {
            this.result_lb.string = Utils.TI18N("挑战失败");
            this.result_lb.node.color = this.color_1;
        } else {
            this.result_lb.string = Utils.TI18N("挑战成功");
            this.result_lb.node.color = this.color_2;
        }

        if (data.hp == 1) {
            this.diff_lb.string = Utils.TI18N("[简单]");
        } else if (data.hp == 2) {
            this.diff_lb.string = Utils.TI18N("[普通]");
        } else if (data.hp == 3) {
            this.diff_lb.string = Utils.TI18N("[困难]");
        }

        //阵容
        var temp_partner_vo = [];
        for (var k in data.defense) {
            var v = data.defense[k];
            var vo = new HeroVo();
            vo.updateHeroVo(v);
            temp_partner_vo.push(vo);
        }

        var scale = 0.77;
        var p_list_size = temp_partner_vo.length;
        var total_width = p_list_size * 119 * scale + (p_list_size - 1) * 6;
        var start_x = -145;
        var max_width = Math.max(total_width, this.scroll_view_size.width);
        this.scroll_content.setContentSize(cc.size(max_width, this.scroll_view_size.height));

        for (var i in temp_partner_vo) {
            var v = temp_partner_vo[i];
            var partner_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
            partner_item.show();
            partner_item.setRootScale(scale);
            partner_item.setPosition(start_x + 119 * scale * 0.5 + (i - 1) * (119 * scale + 6), 0);
            partner_item.setData(v, null, null);
            partner_item.setParent(this.scroll_content);
            this.item_list.push(partner_item);
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_list) {
            for (var i in this.item_list) {
                var v = this.item_list[i];
                if (v) {
                    v.deleteMe();
                    v = null;
                }
            }
            this.item_list = null;
        }
    },
})