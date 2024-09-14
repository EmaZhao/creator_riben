// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-01 11:38:52
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var PartnerConst = require("partner_const");
var SceneConst = require("scene_const");
var PartnerCalculate = require("partner_calculate");
var SkillItem = require("skill_item");

var Artifact_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "artifact_tips");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance();
        this.base_list = {}
        this.skill_list = {}
        this.tab_list = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.main_panel = this.seekChild("main_panel");
        this.container = this.seekChild("container");
        this.close_btn = this.seekChild(this.container, "close_btn")
        this.container_init_size = this.container.getContentSize();

        // 基础属性,名字,类型和评分等
        this.base_panel = this.seekChild("base_panel");
        this.base_panel_sp = this.seekChild("base_panel", cc.Sprite);
        this.equip_item = ItemsPool.getInstance().getItem("backpack_item");
        this.equip_item.initConfig(true, 1, false, false);
        this.equip_item.setParent(this.base_panel);
        this.equip_item.show();
        this.equip_item.setPosition(-135, -69);

        this.name_lb = this.seekChild(this.base_panel, "name", cc.Label);
        this.equip_type_lb = this.seekChild(this.base_panel, "equip_type", cc.Label);
        this.power_label_cr = this.seekChild(this.base_panel, "power_label").getComponent("CusRichText");

        //基础属性
        this.baseattr_panel = this.seekChild("baseattr_panel");
        this.attr_text_rt = this.seekChild(this.baseattr_panel, "attr_text", cc.RichText);

        //技能1容器
        this.skill_panel_1 = this.seekChild(this.container, "skill_panel_1");

        //技能2容器
        this.skill_panel_2 = this.seekChild(this.container, "skill_panel_2");
        this.skill_panel_height = this.skill_panel_2.getContentSize().height;

        //技能3容器
        this.skill_panel_3 = this.seekChild(this.container, "skill_panel_3");

        //按钮容器
        this.tab_panel = this.seekChild(this.container, "tab_panel");
        this.tab_panel_height = this.tab_panel.getContentSize().height;
        var title_list = {
            [1]: Utils.TI18N("合成"), [2]: Utils.TI18N("重铸"), [3]: Utils.TI18N("分解"), [4]: Utils.TI18N("穿戴")
        }
        for (var i = 1; i <= 4; i++) {
            const btn = this.seekChild(this.tab_panel, "tab_btn_" + i);
            if (btn) {
                this.tab_list[i] = btn;
                var label = this.seekChild(btn, "Label", cc.Label);
                btn.label = label;
                btn.label.string = title_list[i];
                btn.index = i;
            }
        }

        Utils.getNodeCompByPath("main_panel/container/base_panel/score_title", this.root_wnd, cc.Label).string = Utils.TI18N("评价:");
        Utils.getNodeCompByPath("main_panel/container/baseattr_panel/label", this.root_wnd, cc.Label).string = Utils.TI18N("基础属性");
        Utils.getNodeCompByPath("main_panel/container/skill_panel_1/label", this.root_wnd, cc.Label).string = Utils.TI18N("神器技能");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openArtifactTipsWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openArtifactTipsWindow(false)
        }.bind(this), 2)
        for (var k in this.tab_list) {
            const btn = this.tab_list[k];
            btn.on(cc.Node.EventType.TOUCH_END, function () {
                this.clickBtn(btn.index);
                Utils.playButtonSound(1);
            }, this)
        }
    },

    clickBtn: function (index) {
        index = index || 1;
        this.ctrl.openArtifactTipsWindow(false);
        if (index == PartnerConst.Artifact_Type.Source) {
            if (this.data && this.data.config) {
                require("backpack_controller").getInstance().openTipsSource(true, this.data.config);
            }
        } else if (index == PartnerConst.Artifact_Type.Cloth) {
            // var MainuiConst = require("mainui_const");
            // require("mainui_controller").getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner)
            var hero_controller = require("hero_controller").getInstance();
            hero_controller.openHeroBagWindow(true);
        } else if (index == PartnerConst.Artifact_Type.Compose) {
            var config = Config.city_data.data_base[SceneConst.CenterSceneBuild.mall];
            if (config == null) return
            var is_open = require("mainui_controller").getInstance().checkIsOpenByActivate(config.activate);
            if (is_open) {
                require("forgehouse_controller").getInstance().openForgeHouseView(true, 2)
            }
        } else if (index == PartnerConst.Artifact_Type.Recast) {
            this.ctrl.openArtifactRecastWindow(true, this.data, this.partner_id)
        } else if (index == PartnerConst.Artifact_Type.Getoff) {
            if (this.data && this.data.id) {
                this.ctrl.sender11030(this.partner_id, this.artifact_pos, this.data.id, 0);
            }
        } else if (index == PartnerConst.Artifact_Type.Replace) {
            this.ctrl.openArtifactListWindow(true, this.artifact_pos, this.partner_id);
        } else if (index == PartnerConst.Artifact_Type.Resolve) {
            if (this.data && this.data.config && this.data.config.id != null && this.data.enchant != null) {
                var config = Config.partner_artifact_data.data_artifact_resolve[this.data.config.id];
                if (config && config[0] != null) {
                    var bid = config[0][0];
                    var num = config[0][1];
                    var msg = cc.js.formatStr(Utils.TI18N("分解此符文可以获得<img src='%s' />%s，是否继续？"), bid, num)
                    var res = PathTool.getItemRes(bid)
                    var CommonAlert = require("commonalert");
                    CommonAlert.show(
                        msg,
                        Utils.TI18N("确定"),
                        function () {
                            this.ctrl.sender11035(this.data.id)
                        }.bind(this),
                        Utils.TI18N("取消"),
                        null,
                        2,
                        null,
                        { resArr: [res] }
                    )
                } else {
                    message(Utils.TI18N("无该符文配置数据"))
                }
            }
        }
        
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (param) {
        if (param == null) return
        this.open_type = param.open_type;
        this.data = param.data || {};
        this.item_config = param.data.config;
        this.partner_id = param.partner_id || 0;
        if (param.pos == null) {
            this.artifact_pos = 1;
        } else {
            this.artifact_pos = param.pos;
        }
        //动态设置位置
        var target_height = this.container_init_size.height;
        //技能
        var show_skill_num = 0;//需要显示的技能数量
        if (this.data && this.data.extra) {
            var skill_num = 0;
            for (var i in this.data.extra) {
                var v = this.data.extra[i];
                if (v.extra_k == 1 || v.extra_k == 2 || v.extra_k == 8) {
                    skill_num = skill_num + 1;
                }
            }
            show_skill_num = skill_num;
        }

        if (show_skill_num < 1) {
            this.skill_panel_1.active = false;
            target_height = target_height - this.skill_panel_height;
        }
        if (show_skill_num < 2) {
            this.skill_panel_2.active = false;
            target_height = target_height - this.skill_panel_height;
        }
        if (show_skill_num < 3) {
            this.skill_panel_3.active = false;
            target_height = target_height - this.skill_panel_height;
        }

        //底部按钮
        if (this.open_type == PartnerConst.ArtifactTips.partner) {
            this.tab_list[3].label.string = Utils.TI18N("卸下");
            this.tab_list[3].index = PartnerConst.Artifact_Type.Getoff;
            this.tab_list[4].label.string = Utils.TI18N("替换");
            this.tab_list[4].index = PartnerConst.Artifact_Type.Replace
        } else if (this.open_type == PartnerConst.ArtifactTips.normal) {
            target_height = target_height - this.tab_panel_height;
            this.tab_panel.active = false;
        }

        if (target_height != this.container_init_size.height) {
            this.container.setContentSize(cc.size(this.container_init_size.width, target_height));
        }
        this.score_val = 0;//符文评分（技能评分+属性评分）
        this.setBaseInfo();
        this.setBaseAttrInfo();
        this.setSkillInfo();
        this.power_label_cr.setNum(this.score_val);
    },

    //设置基础信息
    setBaseInfo: function () {
        if (this.data == null || this.item_config == null) return
        var data = this.data;
        this.equip_item.setData(data.config);
        var quality = 0;
        if (this.item_config.quality >= 0 && this.item_config.quality <= 5) {
            quality = this.item_config.quality;
        }
        // var background_res = PathTool.getUIIconPath("tips", "tips_" + quality);
        // this.loadRes(background_res, function (sp) {
        //     this.base_panel_sp.spriteFrame = sp;
        // }.bind(this))
        var color = require("backpack_const").getEquipTipsColor(quality)
        this.name_lb.node.color = color;
        this.name_lb.string = this.item_config.name;

        this.equip_type_lb.string = Utils.TI18N("类型：") + this.item_config.type_desc
    },

    //设置基础属性
    setBaseAttrInfo: function () {
        if (!this.data || !this.data.attr || !this.item_config) return
        var artifact_config = Config.partner_artifact_data.data_artifact_data[this.item_config.id];
        var attr_num = 2;
        if (artifact_config) {
            attr_num = artifact_config.attr_num;
        }
        var score_data = Config.partner_artifact_data.data_artifact_attr_score[this.item_config.id];

        var index = 1;
        for (var i in this.data.attr) {
            var v = this.data.attr[i];
            if (index > attr_num) {
                break
            }
            var attr_id = v.attr_id;
            var attr_key = Config.attr_data.data_id_to_key[attr_id];

            var attr_val = v.attr_val / 1000;
            var attr_name = Config.attr_data.data_key_to_name[attr_key];
            if (attr_name) {
                if (!this.base_list[index]) {
                    this.base_list[index] = Utils.createRichLabel(22, new cc.Color(0x41, 0x33, 0x33, 0xff), cc.v2(0, 0.5), cc.v2(20, 28), 30, 380, this.baseattr_panel);
                }
                const label = this.base_list[index];
                label.horizontalAlign = cc.macro.TextAlignment.LEFT;
                //label.node.x = 30 + i * 200;
                label.node.y = 40 - i * 30;

                var icon = PathTool.getAttrIconByStr(attr_key);
                var is_per = PartnerCalculate.isShowPerByStr(attr_key);
                if (is_per == true) {
                    attr_val = attr_val / 10 + "%";
                }
                var attr_str = cc.js.formatStr("<img src='%s' /> <color=#413333> %s：</c><color=#379700>%s</c>", icon, attr_name, attr_val);
                label.string = attr_str;
                this.loadRes(PathTool.getUIIconPath("common", icon), (function (resObject) {
                    label.addSpriteFrame(resObject);
                }).bind(this));
                index = index + 1;
            }

            if (score_data) {
                this.score_val = this.score_val + score_data[attr_key] || 0;
            }
        }
    },

    //设置技能显示
    setSkillInfo: function () {
        if (this.data == null || this.data.extra == null) return
        var index = 1;
        var const_config = Config.partner_artifact_data.data_artifact_const;
        for (var i in this.data.extra) {
            var value = this.data.extra[i];
            if (value && value.extra_k && (value.extra_k == 1 || value.extra_k == 2 || value.extra_k == 8)) {
                var config = gdata("skill_data", "data_get_skill", [value.extra_v]);
                if (config) {
                    if (!this.skill_list[index]) {
                        const item = this.createSkillItem(index, this["skill_panel_" + index]);
                        this.skill_list[index] = item;
                    }
                    const skill_item = this.skill_list[index];
                    skill_item.skill.setData(config.bid);
                    skill_item.name.string = config.name;
                    skill_item.desc.string = config.des;

                    var skill_lev = config.level || 1;
                    if (const_config["skill_score_" + skill_lev] && const_config["skill_score_" + skill_lev].val != null) {
                        this.score_val = this.score_val + const_config["skill_score_" + skill_lev].val;
                    }
                    index = index + 1;
                }
            }
        }
    },

    //创建技能显示单例
    createSkillItem: function (index, parent) {
        var item = {};
        var skill = new SkillItem();
        skill.setLeveStatus(false);
        skill.setScale(0.8)
        skill.setParent(parent);
        skill.setShowTips(true);
        var name = Utils.createLabel(24, new cc.Color(0xBD, 0x69, 0x13, 0xff), null, 140 - 211, 96 - 160, "", parent, 1, cc.v2(0, 0))
        var desc = Utils.createRichLabel(20, new cc.Color(0x41, 0x33, 0x33, 0xff), cc.v2(0, 1), cc.v2(140 - 211, 88), 26, 260, parent);
        desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
        if (Number(index) == 1) {
            skill.setPosition(cc.v2(70 - 211, 62 - 160));
            desc.node.y = 90 - 150;
        } else {
            skill.setPosition(cc.v2(70 - 211, 62 - 130));
            desc.node.y = 90 - 120;
            name.node.y = 96 - 135;
        }
        item.skill = skill;
        item.name = name;
        item.desc = desc;
        return item
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.equip_item) {
            this.equip_item.deleteMe();
            this.equip_item = null;
        }
        if (this.skill_list) {
            for (var i in this.skill_list) {
                var v = this.skill_list[i];
                // cc.log(v)
                if (v) {
                    if (v.skill && v.skill.deleteMe) {
                        v.skill.deleteMe();
                        v.skill = null;
                    }
                    if (v.name) {
                        v.name.node.destroy();
                        v.name = null;
                    }
                    if (v.desc) {
                        v.desc.node.destroy();
                        v.desc = null;
                    }
                    v = null
                }
            }
            this.skill_list = null
        }
        if (this.base_list) {
            for (var k in this.base_list) {
                var v = this.base_list[k];
                if (v) {
                    if(v instanceof cc.Node){
                        v.destroy();
                        v = null
                    }else{
                        v.node.destroy();
                        v = null;
                    }
                }
            }
            this.base_list = null;
        }
    },
})