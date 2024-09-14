// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-15 14:21:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var PartnerCalculate = require("partner_calculate")

var Artifact_listItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "artifact_list_item");
        this.index = arguments[0];
        if (this.index == null) {
            this.index = 1;
        }
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.skill_list = {};
        this.attr_list = {};
        this.config_list = {};
        this.ctrl = HeroController.getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.bg = this.seekChild("bg")
        this.artifact_item = ItemsPool.getInstance().getItem("backpack_item");
        this.artifact_item.initConfig(false, 0.8, false, false);
        this.artifact_item.show();
        this.artifact_item.setPosition(-220, 0)
        this.artifact_item.setParent(this.root_wnd)

        this.equip_btn = this.seekChild("equip_btn");
        this.equip_sp = this.seekChild("equip_btn", cc.Sprite);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.equip_btn, function () {
            if (this.call_fun) {
                this.call_fun(this.vo)
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
        this.vo = this.data;
        var data = this.data;
        this.artifact_item.setData({ bid: data.config.id, num: 0 });
        if (!data.config) return

        //伙伴那边触发后者是背包触发
        if (this.partner_id != null && this.partner_id != 0) {
            this.loadRes(PathTool.getCommonIcomPath("txt_cn_common_90011"), function (sp) {
                this.equip_sp.spriteFrame = sp;
            }.bind(this))
        } else {
            this.loadRes(PathTool.getCommonIcomPath("txt_cn_common_90015"), function (sp) {
                this.equip_sp.spriteFrame = sp;
            }.bind(this))
        }

        //属性
        for (var i in this.attr_list) {
            if (this.attr_list[i]) {
                this.attr_list[i].string = "";
            }
        }
        var attr_list = data.attr;
        var attr_num = 2;
        var artifact_config = Config.partner_artifact_data.data_artifact_data[data.config.id];
        var attr_num = 2;
        if (artifact_config) {
            attr_num = artifact_config.attr_num;
        }
        for (var i in attr_list) {
            var v = attr_list[i]
            if (i > attr_num) break;
            var attr_id = v.attr_id;
            var attr_key = Config.attr_data.data_id_to_key[attr_id];
            var attr_val = v.attr_val / 1000;
            var attr_name = Config.attr_data.data_key_to_name[attr_key];
            if (attr_name) {
                if (!this.attr_list[i]) {
                    this.attr_list[i] = Utils.createRichLabel(18, new cc.Color(0xff, 0xff, 0xff, 0xff), cc.v2(0, 0.5), cc.v2(20, 28), 20, 400, this.bg);
                    this.attr_list[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
                }
                const label = this.attr_list[i];
                label.node.setPosition(cc.v2(-145 + i * 170, 23));

                var icon = PathTool.getAttrIconByStr(attr_key);
                var is_per = PartnerCalculate.isShowPerByStr(attr_key);
                if (is_per == true) {
                    attr_val = attr_val / 10 + "%";
                }
                var attr_str = cc.js.formatStr("<img src='%s' /> <color=#ffffff> %s：</c><color=#ffffff>%s</c>", icon, attr_name, attr_val);
                label.string = attr_str;
                this.loadRes(PathTool.getUIIconPath("common", icon), (function (resObject) {
                    label.addSpriteFrame(resObject);
                }).bind(this));
            }
        }

        //技能
        for (var k in this.skill_list) {
            if (this.skill_list[k]) {
                this.skill_list[k].string = "";
            }
        }
        var skill_list = data.extra || {};
        for (var i in skill_list) {
            var v = skill_list[i];
            if (v && v.extra_k && (v.extra_k == 1 || v.extra_k == 2 || v.extra_k == 8)) {
                var skill_id = v.extra_v || 0;
                const config = gdata("skill_data", "data_get_skill", [skill_id]);
                this.config_list[i] = config;
                if (!this.skill_list[i]) {
                    this.skill_list[i] = Utils.createRichLabel(18, new cc.Color(0xfe, 0xef, 0xb3, 0xff), cc.v2(0, 0), cc.v2(110, 35), 20, 200, this.bg);
                    this.skill_list[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
                    this.touchFunc(this.skill_list[i].node,i)
                }
                var str = "";
                if (config) {
                    str = cc.js.formatStr("【<u>%s</u>】", config.name)
                }
                const label = this.skill_list[i];
                label.node.setPosition(cc.v2(-155 + (i ) * 170, -32));
                label.string = str;

            }
        }
    },

    touchFunc: function (node, index) {
        node.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.config_list && this.config_list[index])
                require("tips_controller").getInstance().showSkillTips(this.config_list[index]);
        }, this)
    },

    addCallBack: function (valu) {
        this.call_fun = valu;
    },

    setExtendData: function (partner_id) {
        this.partner_id = partner_id;
    },

    isHaveData: function () {
        if (this.vo) {
            return true
        }
        return false
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.artifact_item) {
            this.artifact_item.deleteMe();
            this.artifact_item = null;
        }
    },
})