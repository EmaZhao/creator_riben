// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-10 11:06:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var HeroEvent = require("hero_event");
var BackpackController = require("backpack_controller")
var PartnerCalculate = require("partner_calculate");
var SkillItem = require("skill_item");
var PartnerConst = require("partner_const");

var Artifact_recastWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "artifact_recast_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance()
        this.model = this.ctrl.getModel()
        this.is_can_save = false
        this.need_list = {}
        this.base_list_left = {}
        this.base_list_right = {}
        this.skill_list_left = {}
        this.skill_list_right = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");

        this.main_container = this.seekChild("main_container");

        var container = this.seekChild(this.main_container, "container");

        this.left_bg_nd = this.seekChild(container, "Image_7");
        this.right_bg_nd = this.seekChild(container, "Image_9");
        this.name_lb = this.seekChild(container, "name_txt", cc.Label);
        this.pos_item = this.seekChild("pos_item")

        var cost_icon_1_sp = this.seekChild(container, "cost_icon_1", cc.Sprite);
        var cost_icon_2_sp = this.seekChild(container, "cost_icon_2", cc.Sprite);
        this.cost_icon = [cost_icon_1_sp, cost_icon_2_sp];
        var cost_txt_1_lb = this.seekChild(container, "cost_txt_1", cc.Label);
        var cost_txt_2_lb = this.seekChild(container, "cost_txt_2", cc.Label);
        cost_txt_1_lb.string = "";
        cost_txt_2_lb.string = "";
        this.cost_txt = [cost_txt_1_lb, cost_txt_2_lb];

        this.close_btn = this.seekChild("close_btn");
        this.save_btn = this.seekChild("save_btn");
        this.reset_btn = this.seekChild("reset_btn");
        this.cancel_btn = this.seekChild("cancel_btn");
        this.explain_btn = this.seekChild("explain_btn")

        this.item_node = ItemsPool.getInstance().getItem("backpack_item");
        this.item_node.initConfig(false, 1, false, false);
        this.item_node.show();
        this.item_node.setParent(this.pos_item)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openArtifactRecastWindow(false)
        }.bind(this), 2)
        //重铸
        Utils.onTouchEnd(this.reset_btn, function () {
            if (this.data && this.data.id) {
                this.ctrl.sender11033(this.partner_id, this.data.id, {})
            }
        }.bind(this), 1)
        //保存重铸
        Utils.onTouchEnd(this.save_btn, function () {
            if (this.data && this.data.id) {
                this.ctrl.sender11034(this.partner_id, this.data.id, 1)
            }
        }.bind(this), 1)
        //取消重铸(改为继续重铸)
        Utils.onTouchEnd(this.cancel_btn, function () {
            if (this.data && this.data.id) {
                this.ctrl.sender11033(this.partner_id, this.data.id, {})
            }
        }.bind(this), 1)

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            var desc = StringUtil.parse(Config.partner_artifact_data.data_artifact_const.recast_rule.desc)
            require("tips_controller").getInstance().showCommonTips(desc, pos);
        });

        this.addGlobalEvent(HeroEvent.Artifact_Recast_Event, function () {
            if (!this.data || this.data.id == 0) return
            if (this.partner_id && this.partner_id != 0) {
                var artifact_list = this.model.getPartnerArtifactList(this.partner_id);
                for (var k in artifact_list) {
                    var vo = artifact_list[k];
                    if (vo.id == this.data.id) {
                        this.setData(vo, this.partner_id);
                        break
                    }
                }
            } else {
                var item_data = BackpackController.getInstance().getModel().getBackPackItemById(this.data.id);
                this.setData(item_data, this.partner_id);
            }
        }, this)

        this.addGlobalEvent(HeroEvent.Artifact_Save_Event, function () {
            if (!this.data || this.data.id == 0) return
            if (this.partner_id && this.partner_id != 0) {
                var artifact_list = this.model.getPartnerArtifactList(this.partner_id);
                for (var k in artifact_list) {
                    var vo = artifact_list[k];
                    if (vo.id == this.data.id) {
                        this.setData(vo, this.partner_id);
                        break
                    }
                }
            } else {
                var item_data = BackpackController.getInstance().getModel().getBackPackItemById(this.data.id);
                this.setData(item_data, this.partner_id);
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.setData(params.data, params.partner_id)
    },

    setData: function (data, partner_id) {
        this.data = data || {};
        this.item_config = data.config;
        this.partner_id = partner_id || 0;
        this.item_node.setData(data);
        this.name_lb.string = this.item_config.name;

        //判断是否已经重铸但未保存
        this.is_can_save = false;
        if (this.data.extra_attr && Utils.next(this.data.extra_attr) != null) {
            this.is_can_save = true;
        }
        this.setBaseAttrInfo()
        this.setSkillInfo()
        this.updateBtnShow()
        this.updateCostInfo()
    },

    //基础属性
    setBaseAttrInfo: function () {
        if (!this.data || !this.data.attr || !this.item_config) return
        var attr_num = 2;
        var artifact_config = Config.partner_artifact_data.data_artifact_data[this.item_config.id];
        if (artifact_config) {
            attr_num = artifact_config.attr_num;
        }

        for (var i in this.data.attr) {
            if (i > attr_num) break
            var v = this.data.attr[i];
            var attr_id = v.attr_id;
            var attr_key = Config.attr_data.data_id_to_key[attr_id];
            var attr_val = v.attr_val / 1000;
            var attr_name = Config.attr_data.data_key_to_name[attr_key];
            if (attr_name != null) {
                if (!this.base_list_left[i]) {
                    this.base_list_left[i] = Utils.createRichLabel(24, new cc.Color(0xa5, 0x5f, 0x14, 0xff), cc.v2(0, 0.5), cc.v2(-120, 28), 30, 380, this.left_bg_nd);
                    this.base_list_left[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
                }
                const label = this.base_list_left[i];
                label.node.y = -70 - i * 35;
                var icon = PathTool.getAttrIconByStr(attr_key);
                var is_per = PartnerCalculate.isShowPerByStr(attr_key);
                if (is_per == true) {
                    attr_val = attr_val / 10 + "%";
                }
                var attr_str = cc.js.formatStr("<img src='%s' /> <color=#a55f14> %s：</c><color=#a55f14>%s</c>", icon, attr_name, attr_val);
                label.string = attr_str;
                this.loadRes(PathTool.getUIIconPath("common", icon), (function (resObject) {
                    label.addSpriteFrame(resObject);
                }).bind(this));
            }
        }

        if (this.is_can_save) {
            //重铸过，未保存
            for (var i in this.data.extra_attr) {
                var v = this.data.extra_attr[i];
                var attr_id = v.attr_id;
                var attr_key = Config.attr_data.data_id_to_key[attr_id];
                var attr_val = v.attr_val / 1000;
                var attr_name = Config.attr_data.data_key_to_name[attr_key];
                if (attr_name != null) {
                    if (!this.base_list_right[i]) {
                        this.base_list_right[i] = Utils.createRichLabel(24, new cc.Color(0xa5, 0x5f, 0x14, 0xff), cc.v2(0, 0.5), cc.v2(-120, 28), 30, 380, this.right_bg_nd);
                        this.base_list_right[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
                    }
                    const label = this.base_list_right[i];
                    label.node.x = -120;
                    label.node.y = -70 - i * 35;

                    var icon = PathTool.getAttrIconByStr(attr_key);
                    var is_per = PartnerCalculate.isShowPerByStr(attr_key);
                    if (is_per == true) {
                        attr_val = attr_val / 10 + "%";
                    }
                    var attr_str = cc.js.formatStr("<img src='%s' /> <color=#a55f14> %s：</c><color=#a55f14>%s</c>", icon, attr_name, attr_val);
                    label.string = attr_str;
                    this.loadRes(PathTool.getUIIconPath("common", icon), (function (resObject) {
                        label.addSpriteFrame(resObject);
                    }).bind(this));
                }
            }
        } else {
            for (var i in this.data.attr) {
                if (i > attr_name) break
                var v = this.data.attr[i];
                if (!this.base_list_right[i]) {
                    this.base_list_right[i] = Utils.createRichLabel(24, new cc.Color(0xa5, 0x5f, 0x14, 0xff), cc.v2(0, 0.5), cc.v2(120 - 303, 28), 30, 380, this.right_bg_nd);
                    this.base_list_right[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
                }
                const label = this.base_list_right[i];
                label.node.x = -110
                label.node.y = -70 - i * 35;
                label.string = Utils.TI18N("随机属性")
            }
        }
    },

    //神器技能
    setSkillInfo: function () {
        if (this.data == null || this.data.extra == null) return
        var skill_num = 0;
        var artifact_config = Config.partner_artifact_data.data_artifact_data[this.item_config.id];
        if (artifact_config) {
            skill_num = artifact_config.skill_num;
        }
        var index = 1;
        var cur_skills = [];
        this.data.extra.sort(Utils.tableLowerSorter(["extra_k"]));
        for (var k in this.skill_list_left) {
            this.setSkillItemVisible(false, this.skill_list_left[k]);
        }
        for (var i in this.data.extra) {
            var value = this.data.extra[i];
            if (value && value.extra_k && value.extra_k == 1 || value.extra_k == 2 || value.extra_k == 8) {
                if (cur_skills.length <= skill_num) {
                    cur_skills.push(value.extra_v);
                    var config = gdata("skill_data", "data_get_skill", [value.extra_v]);
                    if (config) {
                        if (!this.skill_list_left[index]) {
                            var item = this.createSkillItem(this.left_bg_nd, index);
                            this.skill_list_left[index] = item;
                        }

                        const skill_item = this.skill_list_left[index];
                        this.setSkillItemVisible(true, skill_item);
                        skill_item.skill.setData(config.bid);
                        skill_item.name.string = config.name;
                        skill_item.desc.string = config.des;
                        skill_item.random_icon.node.active = false
                        skill_item.random_des.node.active = false

                        var name_color = PartnerConst.SkillColor[config.level];
                        name_color = name_color || new cc.Color(0xa5, 0x5f, 0x14, 0xff);
                        skill_item.name.node.color = name_color;

                        index = index + 1;
                    }
                }
            }
        }

        this.cur_skills = cur_skills;

        //右侧
        var recast_skills = [];
        for (var i in this.data.extra) {
            var value = this.data.extra[i];
            if (value && value.extra_k != null && value.extra_k == 3 || value.extra_k == 4 || value.extra_k == 9) {
                recast_skills.push(value.extra_v);
            }
        }
        this.recast_skills = recast_skills;
        var right_skill_num = skill_num;
        //当没有重置技能则显示为最大数量的问号，有则显示为技能数量
        if (Utils.next(recast_skills) != null) {
            right_skill_num = recast_skills.length;
        }
        if (right_skill_num > skill_num) {
            right_skill_num = skill_num;
        }
        for (var k in this.skill_list_right) {
            this.setSkillItemVisible(false, this.skill_list_right[k]);
        }
        for (var i = 0; i < right_skill_num; i++) {
            if (!this.skill_list_right[i]) {
                var item = this.createSkillItem(this.right_bg_nd, i + 1);
                this.skill_list_right[i] = item;
            }

            var skill_id = recast_skills[i];
            var skill_item = this.skill_list_right[i];

            this.setSkillItemVisible(true, skill_item);
            skill_item.name.node.active = true;
            skill_item.desc.node.active = true;
            skill_item.random_icon.node.active = false;
            skill_item.random_des.node.active = false;
            var config = gdata("skill_data", "data_get_skill", [skill_id]);
            if (config) {
                skill_item.skill.setData(config.bid);
                skill_item.name.string = config.name;
                skill_item.desc.string = config.des;

                var name_color = PartnerConst.SkillColor[config.level];
                name_color = name_color || new cc.Color(0xa5, 0x5f, 0x14, 0xff);
                skill_item.name.node.color = name_color;
            } else {
                skill_item.skill.setData();
                skill_item.name.node.active = false;
                skill_item.desc.node.active = false;
                skill_item.random_icon.node.active = true;
                skill_item.random_des.node.active = true;
            }
        }
    },

    //创建一个技能item
    createSkillItem: function (parent, index) {
        var item = {};
        var skill = new SkillItem();
        skill.setLeveStatus(false);
        skill.setScale(0.8)
        skill.setParent(parent);
        var pos_y = 207 - 444 - (index - 1) * 193;
        skill.setPosition(cc.v2(60 - 151, pos_y))
        var name = Utils.createLabel(22, new cc.Color(0xfe, 0xee, 0xba, 0xff), null, 45, pos_y + 35, "", parent, 1, cc.v2(0.5, 0))
        var desc = Utils.createRichLabel(16, new cc.Color(0x3f, 0x32, 0x34, 0xff), cc.v2(0, 1), cc.v2(130 - 167, pos_y + 40), 26, 180, parent);
        desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
        var icon_res = PathTool.getUIIconPath("artifact", "artifact_1003")
        var random_icon = Utils.createImage(parent, null, 75 - 167, pos_y, cc.v2(0.5, 0.5), null, 2)
        this.loadRes(icon_res, function (sp) {
            random_icon.spriteFrame = sp;
        }.bind(this))
        var random_des = Utils.createLabel(24, new cc.Color(0x3f, 0x32, 0x34, 0xff), null, 45, pos_y, Utils.TI18N("随机技能"), parent, 1, cc.v2(0.5, 0.5))
        item.skill = skill;
        item.name = name;
        item.desc = desc;
        item.random_icon = random_icon;
        item.random_des = random_des;
        return item
    },

    setSkillItemVisible: function (status, item) {
        if (item == null) return
        item.skill.setVisible(status)
        item.desc.node.active = status;
        item.name.node.active = status;
        item.random_icon.node.active = status;
        item.random_des.node.active = status;
    },

    updateBtnShow: function () {
        this.reset_btn.active = !this.is_can_save;
        this.save_btn.active = this.is_can_save;
        this.cancel_btn.active = this.is_can_save;
    },

    updateCostInfo: function () {
        if (!this.data || !this.data.attr || !this.item_config) return
        var artifact_config = Config.partner_artifact_data.data_artifact_data[this.item_config.id];
        if (artifact_config && artifact_config.ref_expend) {
            for (var i = 0; i < 2; i++) {
                const cost_icon = this.cost_icon[i];
                const cost_txt = this.cost_txt[i];
                const cost_data = artifact_config.ref_expend[i];
                if (cost_data) {
                    var bid = cost_data[0];
                    var num = cost_data[1];
                    var item_config = Utils.getItemConfig(bid);
                    if (item_config) {
                        this.loadRes(PathTool.getItemRes(bid), function (sp) {
                            cost_icon.spriteFrame = sp;
                        }.bind(this))
                        var have_num = BackpackController.getInstance().getModel().getItemNumByBid(bid);
                        cost_txt.string = Utils.getMoneyString(have_num) + "/" + Utils.getMoneyString(num);
                        if (have_num >= num) {
                            cost_txt.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
                        } else {
                            cost_txt.node.color = new cc.Color(0xc8, 0x14, 0x14, 0xff);
                        }
                    }
                } else {
                    cost_data.string = ""
                }
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.item_node) {
            this.item_node.deleteMe();
            this.item_node = null;
        }
        if (this.skill_list_left) {
            for (var k in this.skill_list_left) {
                var v = this.skill_list_left[k];
                if (v) {
                    v.skill.deleteMe();
                    v.skill = null;
                    v.desc.node.destroy();
                    v.desc = null;
                    v.name.node.destroy();
                    v.name = null;
                    v.random_des.node.destroy();
                    v.random_des = null;
                    v.random_icon.node.destroy();
                    v.random_icon = null;
                    v = null;
                }
            }
            this.skill_list_left = null;
        }
        if (this.skill_list_right) {
            for (var k in this.skill_list_right) {
                var v = this.skill_list_right[k];
                if (v) {
                    v.skill.deleteMe();
                    v.skill = null;
                    v.desc.node.destroy();
                    v.desc = null;
                    v.name.node.destroy();
                    v.name = null;
                    v.random_des.node.destroy();
                    v.random_des = null;
                    v.random_icon.node.destroy();
                    v.random_icon = null;
                    v = null;
                }
            }
            this.skill_list_right = null;
        }
        if (this.base_list_left) {
            for (var k in this.base_list_left) {
                var v = this.base_list_left[k];
                if (v) {
                    v.node.destroy();
                    v = null;
                }
            }
            this.base_list_left = null;
        }
        if (this.base_list_right) {
            for (var k in this.base_list_right) {
                var v = this.base_list_right[k];
                if (v) {
                    v.node.destroy();
                    v = null;
                }
            }
            this.base_list_right = null;
        }
        this.ctrl.openArtifactRecastWindow(false);
    },
})