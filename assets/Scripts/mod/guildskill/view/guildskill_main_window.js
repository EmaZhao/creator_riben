// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会技能的主界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildskillController = require("guildskill_controller");
var GuildskillEvent = require("guildskill_event");
var GuildskillConst = require("guildskill_const");
var BackpackConst = require("backpack_const");
var BackpackController = require("backpack_controller");
var GuildConst = require("guild_const");
var RoleController = require("role_controller");
var GuildSkillAttrItem = require("guildskill_item");
var GuildEvent = require("guild_event");
var PartnerCalculate = require("partner_calculate");

var GuildskillMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildskill", "guildskill_main_window");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildskillController.getInstance();
        this.model = this.ctrl.getModel();

        this.tab_list = {};            // 标签页
        this.attr_list = {};            // 综述性加成
        this.item_list = {};            // 6个单元集合
        this.singe_att_list = {};            // 单个的属性加成
        this.attr_value_list = {};            // 当前所累积属性的列表
        this.cur_info_group_id = 0             // 更新判断依据
        this.backpack_item_list = {};            // 物品图标实例

        this.upgrade_cost_list = {};            // 点亮需要消耗的物品和资产
        this.cur_index = 1;
        this.role_vo = RoleController.getInstance().getRoleVo();
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        var main_panel = this.seekChild("main_panel");
        this.background.scale = FIT_SCALE;
        this.career_desc = this.seekChild(main_panel, "career_desc", cc.RichText);
        this.close_btn = this.seekChild(main_panel, "close_btn");
        this.explain_btn = this.seekChild(main_panel, "explain_btn");
        // this.total_power_value = this.seekChild(main_panel, "total_power_value");
        this.cost_container = this.seekChild(main_panel, "cost_container");
        this.handle_btn = this.seekChild(main_panel, "handle_btn");
        this.handle_btn_label = this.seekChild(this.handle_btn, "label", cc.Label);
        this.handle_btn_label_outline = this.seekChild(this.handle_btn, "label", cc.LabelOutline);
        this.handle_btn_label.string = Utils.TI18N("点亮");
        this.condition_value = this.seekChild(this.cost_container, "condition_value", cc.Label);

        var cost_node = this.seekChild(this.cost_container, "cost_node");
        cost_node.active = false;
        this.cost_item_icon = this.seekChild(cost_node, "item_img");
        this.cost_item_value = this.seekChild(cost_node, "cost_value");

        this.auto_buy_label = this.seekChild(main_panel, "auto_buy_label", cc.RichText);
        this.auto_buy_label.node.active = false;

        var titleLabel = Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label);
        titleLabel && (titleLabel.string = Utils.TI18N("公会技能"));
        
        var tab_container = this.seekChild(main_panel, "tab_container");
        for (var i = 1; i < 5; i++) {
            var tab_btn = tab_container.getChildByName("tab_btn_" + i);
            if (tab_btn) {
                var title = tab_btn.getChildByName("title").getComponent(cc.Label);
                var tips = tab_btn.getChildByName("tips");
                if (i == 1) {
                    title.string = Utils.TI18N("战士职业");
                } else if (i == 2) {
                    title.string = Utils.TI18N("法师职业");
                } else if (i == 3) {
                    title.string = Utils.TI18N("坦克职业");
                } else if (i == 4) {
                    title.string = Utils.TI18N("補助型");
                }
                var career = this.getType(i);
                tab_btn.career = career;
                tab_btn.label = title;
                tab_btn.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
                tab_btn.tips = tips;
                tab_btn.index = i;
                tab_btn.btn = tab_btn.getComponent(cc.Button);
                tab_btn.btn.interactable = false;
                this.tab_list[career] = tab_btn;
            }
        }

        this.scroll_view = this.seekChild(main_panel, "scroll_view");
        this.scroll_view_con = this.seekChild(this.scroll_view, "content");
        var size = this.scroll_view.getContentSize();

        var attr_container = this.seekChild(main_panel, "attr_container");
        attr_container.active = false;

        //配置显示综述性条目
        var config = gdata("guild_skill_data", "data_const", ["attr_show_" + this.cur_index]);
        var _x, _y;
        var itemCount = 2;
        if (config && config.val) {
            var list_size = Math.ceil(config.val.length / itemCount);
            var width = 250;
            var height = 24;
            var space_x = 10;
            var space_y = 13;
            var max_height = list_size * height + (list_size + 1) * space_y;
            max_height = Math.max(max_height, size.height);
            for (var i in config.val) {
                var v = config.val[i];
                var node = cc.instantiate(attr_container);
                node.active = true;
                var attr_item = new GuildSkillAttrItem(node, v);
                node.setParent(this.scroll_view_con);
                _x = -size.width / 2 + (i % itemCount) * (width + space_x);
                _y = - (7 + height * 0.5 + (Math.floor(i / itemCount)) * (height + space_y));
                node.setPosition(_x, _y);
                this.attr_list[i] = attr_item;
            }
        }

        this.selected = this.seekChild(main_panel, "selected");
        CommonAction.breatheShineAction3(this.selected)

        for (var i = 1; i < 7; i++) {
            var object = {};
            var item = main_panel.getChildByName("item_" + i).getComponent(cc.Sprite);
            var item_lev = main_panel.getChildByName("item_lev_" + i).getComponent(cc.Label);
            if (item) {
                object.node = item;
                object.lev = item_lev;
                object.index = i;
                object.x = item.node.x;
                object.y = item.node.y;
                object.status = null;
                object.data = null;
                object.config = null;
                this.item_list[i] = object;
            }
        }

        //单个单元的属性加成展示
        this.single_item_attr_container = this.seekChild(main_panel, "single_item_attr_container");
        for (var i = 1; i < 3; i++) {
            var object = {};
            object.attr_title = this.single_item_attr_container.getChildByName("attr_title_" + i).getComponent(cc.Label);
            object.attr_value = this.single_item_attr_container.getChildByName("attr_value_" + i).getComponent(cc.Label);
            object.attr_title.node.active = false;
            object.attr_value.node.active = false;
            this.singe_att_list[i] = object;
        }

        this.lev_upgrade_model = this.seekChild(main_panel, "lev_upgrade_model");
        this.main_panel = main_panel;
        Utils.getNodeCompByPath("main_container/main_panel/attr_desc", this.root_wnd, cc.Label).string = Utils.TI18N("加成总览");
    },

    registerEvent: function () {
        if (this.background) {
            this.background.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openGuildSkillMainWindow(false);
            }, this)
        }

        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openGuildSkillMainWindow(false);
                Utils.playButtonSound(2);
            }, this)
        }

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            var config = Config.guild_skill_data.data_const.game_rule;
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos,null,null,500);
        }, this)

        for (var k in this.tab_list) {
            var tab_btn = this.tab_list[k];
            tab_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
                var sender = event.currentTarget
                this.changeSelectedTab(sender.career, sender.index);
            }, this)
        }

        this.handle_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.selected_item && this.selected_item.data) {
                if (this.auto_buy_item_bid && this.auto_buy_item_price && this.auto_buy_item_price > 0 && !this.auto_buy_label.active) {
                    var item_config = Utils.getItemConfig(this.auto_buy_item_bid);
                    BackpackController.getInstance().openTipsSource(true, item_config);
                    message(Utils.TI18N("道具不足，无法点亮"));
                    return
                }
                this.ctrl.requestActivitySkill(this.selected_item.data.id);
            }
        }, this)

        //初始化的时候做的，可能切换标签，或者第一次打开
        this.addGlobalEvent(GuildskillEvent.UpdateGuildSkillEvent, function (career) {
            if (this.selected_tab && this.selected_tab.career == career)
                this.updateSkillList(career);
        }, this)

        this.addGlobalEvent(GuildskillEvent.UpdateSkillStatusEvent, function (career, skill_id) {
            if (this.selected_tab && this.selected_tab.career == career)
                this.updateSkillItemById(skill_id);
        }, this)

        this.addGlobalEvent(GuildskillEvent.UpdateSkilUpgradeEvent, function (career, group_id) {
            if (this.selected_tab && this.selected_tab.career == career)
                this.updateSkillList(career, true);
        }, this)

        this.addGlobalEvent(GuildEvent.UpdateGuildRedStatus, function (bid, status) {
            this.updateGuildSkillRed(bid, status);
        }, this)

        this.addGlobalEvent(EventId.ADD_GOODS, function (bag_code, del_list) {
            if (bag_code != BackpackConst.Bag_Code.BACKPACK)
                return
            this.changeNeedItemInfo(del_list);
        }, this)

        this.addGlobalEvent(EventId.MODIFY_GOODS_NUM, function (bag_code, change_list) {
            if (bag_code != BackpackConst.Bag_Code.BACKPACK)
                return
            this.changeNeedItemInfo(change_list);
        }, this)

        if (this.role_vo) {
            if (this.update_role_assets_event == null) {
                this.update_role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (this.selected_item && this.upgrade_cost_list) {
                        if (this.upgrade_cost_list.base_list && this.upgrade_cost_list.base_list[key]) {
                            this.setUpgradeCostStatus(0);
                        } else if (this.upgrade_cost_list.asset_list && this.upgrade_cost_list.asset_list[key]) {
                            this.setUpgradeCostStatus(1);
                        }
                    }
                }, this)
            }
        }
    },

    openRootWnd: function (career) {
        career = career || GuildskillConst.index.physics;
        this.changeSelectedTab(career, this.cur_index);
        this.updateGuildSkillRed();
    },

    //更新红点
    updateGuildSkillRed: function (bid, status) {
        if (bid == null) {
            for (var k in this.tab_list) {
                var tab_btn = this.tab_list[k];
                var status = this.model.getRedStatus(tab_btn.career);
                if (tab_btn.tips)
                    tab_btn.tips.active = status;
            }
        } else if (bid == GuildConst.red_index.skill_2) {
            var tab_btn = this.tab_list[GuildskillConst.index.magic];
            if (tab_btn && tab_btn.tips)
                tab_btn.tips.active = status;
        } else if (bid == GuildConst.red_index.skill_3) {
            var tab_btn = this.tab_list[GuildskillConst.index.physics];
            if (tab_btn && tab_btn.tips)
                tab_btn.tips.active = status;
        } else if (bid == GuildConst.red_index.skill_4) {
            var tab_btn = this.tab_list[GuildskillConst.index.defence];
            if (tab_btn && tab_btn.tips)
                tab_btn.tips.active = status;
        } else if (bid == GuildConst.red_index.skill_5) {
            var tab_btn = this.tab_list[GuildskillConst.index.assist];
            if (tab_btn && tab_btn.tips)
                tab_btn.tips.active = status;
        }
    },

    //标签页选中
    changeSelectedTab: function (career, index) {
        if (this.selected_tab != null) {
            if (this.selected_tab.career == career)
                return
        }
        this.cur_index = index;
        if (this.selected_tab) {
            this.selected_tab.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            this.selected_tab.btn.interactable = false;
            this.selected_tab = null;
        }
        this.selected_tab = this.tab_list[career];
        if (this.selected_tab) {
            this.selected_tab.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);;
            this.selected_tab.btn.interactable = true;
        }

        //做全部属性显示切换
        var object = this.model.getCareerSkillInfo(career);
        if (object == null)
            this.ctrl.requestCareerSkillInfo(career);
        else
            this.updateSkillList(career);
        //关闭红点
        var bid = this.model.getCareerKey(career);
        this.model.updateGuildRedStatus(bid, false);

        //设置显示
        var item_res_id = "";
        for (var i in this.item_list) {
            var v = this.item_list[i];
            item_res_id = cc.js.formatStr("guildskill_%s_%s", career, v.index);
            if (v.node) {
                this.loadRes(PathTool.getUIIconPath("guildskill", item_res_id), function (sf_obj) {
                    v.node.spriteFrame = sf_obj;
                }.bind(this))
            }
        }
    },

    //刷新属性名称显示
    updateSkillAttrNameAndVal: function () {
        var config_str = "attr_show_" + this.cur_index;
        var config = gdata("guild_skill_data", "data_const", [config_str]);
        if (config && config.val) {
            for (var i in config.val) {
                var v = config.val[i];
                var attr_item = this.attr_list[i];
                if (attr_item) {
                    var attr_key = v;
                    var attr_value = this.attr_value_list[attr_key];
                    attr_item.setData(attr_value, attr_key);
                }
            }
        }
    },

    //设置指定技能id的状态
    updateSkillItemById: function (skill_id) {
        if (skill_id == null)
            return
        var update_list = [];
        for (var i in this.item_list) {
            var item = this.item_list[i];
            if (item.data && item.data.id == skill_id && item.node) {
                if (item.status != item.data.status) {
                    item.status = item.data.status;
                    var bool = item.status == GuildskillConst.status.activity
                    item.node.setState(bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY)
                }

                //这里在吧这个技能的属性累加到当前总记录的里面去，并且更新制动的汇总技能
                if (item.config) {
                    for (var i in item.config.attr_list) {
                        var v = item.config.attr_list[i];
                        if (v instanceof Array && (v.length >= 2)) {
                            if (this.attr_value_list[v[0]] == null)
                                this.attr_value_list[v[0]] = 0;
                            this.attr_value_list[v[0]] = this.attr_value_list[v[0]] + v[1];
                            //存储需要更新的属性key
                            update_list.push(v[0]);
                        }
                    }
                }
                break
            }
        }

        //做属性的更新
        this.updateSkillAttrNameAndVal();

        //升级特效
        if (this.selected_item && this.selected_item.node) {
            var _x = this.selected_item.node.x;
            var _y = this.selected_item.node.y;
            this.handleUpgradeEffect(true, cc.v2(_x, _y));
        }

        //重新选择一下下一个待点亮的
        var index = 0;
        if (this.cur_skill_info && this.cur_skill_info.skill_ids) {
            for (var i in this.cur_skill_info.skill_ids) {
                var item = this.cur_skill_info.skill_ids[i];
                if (item.status == GuildskillConst.status.un_activity) {
                    if (index == 0 || index > item.index) {
                        index = item.index;
                    }
                }
            }
            this.changeSelectedItem(index, true);
        }

        //这里计算一下总战力
        // var total_power = PartnerCalculate.calculatePower(self.attr_value_list)
        // this.total_power_value.string = Math.floor(total_power);
    },

    //播放特效
    handleUpgradeEffect: function (status, pos) {
        if (status == false) {
            if (this.upgrade_effect != null) {
                this.upgrade_effect.removeFromParent();
                this.upgrade_effect = null;
            }
        } else {
            var finish_func = function () {
                if (this.upgrade_effect) {
                    this.upgrade_effect.active = false;
                }
            }
            if (this.upgrade_effect == null) {
                if (this.main_panel) {
                }
            }
        }
    },

    //技能组升级的特效
    handleLevUpgradeEffect: function (status) {
        if (status == false) {

        }
    },

    //初始化技能列表
    updateSkillList: function (career, is_upgrade) {
        if (career == null)
            return
        var object = this.model.getCareerSkillInfo(career);
        if (object) {
            if (this.cur_info_group_id == object.group_id)
                return
            this.cur_info_group_id = object.group_id;
            this.cur_skill_info = object;
            //下一块开启的描述显示
            var group_config = gdata("guild_skill_data", "data_group", [Utils.getNorKey(career, object.group_id)]);
            if (group_config != null) {
                var max_group = this.model.getCareerGroupMax(career);
                this.career_desc.string = cc.js.formatStr("%s<color=#239004>(%s/%s)</c>", group_config.group_name, group_config.group_seq, max_group);
            }
            //给显示单位储存数据结构
            if (object.skill_ids) {
                var index = 0;
                var skill_item = null;
                var config = null;
                for (var i in object.skill_ids) {
                    //存储对应技能单位属性
                    var item = object.skill_ids[i];
                    skill_item = this.item_list[item.index];
                    config = gdata("guild_skill_data", "data_info", [item.id]);
                    if (skill_item && config) {
                        skill_item.data = item;
                        skill_item.config = config;
                        //设置显示状态
                        if (skill_item.node) {
                            if (skill_item.status != item.status) {
                                skill_item.status = item.status;
                                var bool = item.status == GuildskillConst.status.activity
                                skill_item.node.setState(bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
                            }
                        }
                        //设置技能等级
                        if (skill_item.lev) {
                            skill_item.lev.string = config.lev;
                        }
                    }

                    //选中当前待升级的那个
                    if (item.status == GuildskillConst.status.un_activity) {
                        if (index == 0 || index > item.index) {
                            index = item.index;
                        }
                    }
                }
                //如果遍历完了还是0，其实这个时候已经是最高等级了，那就随便选中一个
                if (Number(index) == 0) {
                    index = 1
                }
                this.changeSelectedItem(index, true);
            }
            this.calculateTotalAttr();
        }

        //如果是升级，播放升级特效
        if (is_upgrade == true)
            this.handleLevUpgradeEffect(true);
    },

    //计算当前总属性，这边会缓存属性，下一次点亮之后只需要累加处理
    calculateTotalAttr: function () {
        if (this.cur_skill_info == null)
            return
        var activity_skill_list = [];       //已经激活的技能
        if (this.cur_skill_info.group_ids && Utils.next(this.cur_skill_info.group_ids)) {
            //首先把已经激活的技能组里面包含的所有技能储存起来
            for (var i in this.cur_skill_info.group_ids) {
                var v = this.cur_skill_info.group_ids[i];
                var group_config = gdata("guild_skill_data", "data_info_group", [v.group_id]);
                if (group_config == null)
                    return
                for (var n in group_config) {
                    activity_skill_list.push(group_config[n].id);
                }
            }
        }

        //储存当前的技能组已经激活的技能
        if (this.cur_skill_info.skill_ids && Utils.next(this.cur_skill_info.skill_ids)) {
            for (var i in this.cur_skill_info.skill_ids) {
                var v = this.cur_skill_info.skill_ids[i];
                if (v.status == GuildskillConst.status.activity) {
                    activity_skill_list.push(v.id);
                }
            }
        }

        var activity_attr_dic = [];
        for (var i in activity_skill_list) {
            var v = activity_skill_list[i];
            var skill_config = gdata("guild_skill_data", "data_info", [v]);
            if (skill_config != null) {
                for (var n in skill_config.attr_list) {
                    var m = skill_config.attr_list[n];
                    if (activity_attr_dic[m[0]] == null) {
                        activity_attr_dic[m[0]] = 0;
                    }
                    activity_attr_dic[m[0]] = activity_attr_dic[m[0]] + m[1];
                }
            }
        }

        //这里是判断所有的数据
        this.attr_value_list = activity_attr_dic;
        this.updateSkillAttrNameAndVal();

        //这里计算一下总战力
        // local total_power = PartnerCalculate.calculatePower(self.attr_value_list)
        // self.total_power_value:setString(math.floor( total_power ))
    },

    //单元选中
    changeSelectedItem: function (index, force) {
        if (this.selected_item && !force) {
            if (this.selected_item.index == index)
                return
        }
        this.selected_item = this.item_list[index];
        if (this.selected_item == null)
            return
        if (this.selected_item.node) {
            this.selected.setPosition(this.selected_item.x, this.selected_item.y);
            // this.selected.x = this.selected_item.x;
            // this.selected.y = this.selected_item.y;
        }

        //做显示属性切换
        var config = this.selected_item.config;
        if (config) {
            var attr_key = null;
            var attr_name = null;
            for (var i in config.attr_list) {
                var v = config.attr_list[i];
                if (v instanceof Array && v.length >= 2) {
                    var show_object = this.singe_att_list[Number(i) + 1];
                    if (show_object) {
                        attr_key = v[0];
                        attr_name = gdata("attr_data", "data_key_to_name", [attr_key]);
                        if (attr_name) {
                            show_object.attr_title.node.active = true;
                            show_object.attr_title.string = attr_name;

                            //如果是百分比数值
                            show_object.attr_value.node.active = true;
                            show_object.attr_value.string = v[1];
                            if (PartnerCalculate.isShowPerByStr(attr_key) == true) {
                                show_object.attr_value.string = ("+" + (v[1] * 0.1) + "%")
                            }
                            else {
                                show_object.attr_value.string = ("+" + v[1])
                            }
                        }
                    }
                }
            }

            this.setUpgradeCost();
        }
    },

    //点亮消耗
    setUpgradeCost: function () {
        if (this.selected_item == null || this.selected_item.config == null || this.selected_item.data == null)
            return
        var config = this.selected_item.config;
        var data = this.selected_item.data;
        if (config.lev >= 20 && data.status == GuildskillConst.status.activity) {
            this.cost_container.active = false;
            if (this.max_lev_label == null) {
                self.max_lev_label = Utils.createLabel(28, 175,null,338, 96, Utils.TI18N("该技能已满级!"), this.main_panel,0, cc.v2(0.5,0.5))
            }
            this.max_lev_label.active = true;
        } else {
            this.cost_container.active = true;
            if (this.max_lev_label)
                this.max_lev_label.active = false;
            if (config.loss) {
                var base_cost = {};
                var item_config = null;
                if (this.upgrade_cost_list == null) {
                    this.upgrade_cost_list = {};
                }
                this.upgrade_cost_list.base_list = {}       // 基础消耗
                this.upgrade_cost_list.item_list = {}       // 物品
                this.upgrade_cost_list.asset_list = {}      // 资产物品    

                if (base_cost && base_cost[0] && base_cost[1]) {
                    item_config = Utils.getItemConfig(base_cost[0]);
                    if (item_config) {

                    }
                    var asset_key = gdata("item_data", "data_assets_id2label", [base_cost[0]]);
                    if (asset_key) {
                        this.upgrade_cost_list.base_list[asset_key] = { need_num: base_cost[1], condition_status: false, item: self.cost_item_value };
                    }
                }

                //因为第一个已经被提出掉了，所以这不做处理了
                for (var k in this.backpack_item_list) {
                    this.backpack_item_list[k].setVisible(false);
                }

                var index = 1;
                var _x = 94;
                var _y = 80;
                for (var i in config.loss) {
                    var v = config.loss[i];
                    if (v[0]!= null && v[1] != null) {
                        var backpack_item = this.backpack_item_list[index];
                        if (backpack_item == null) {
                            backpack_item = ItemsPool.getInstance().getItem("backpack_item");
                            backpack_item.initConfig(false, 1, false, false)
                            backpack_item.show();
                            this.backpack_item_list[index] = backpack_item;
                            backpack_item.setParent(this.cost_container);
                            _x = -300 + (index - 1) * (BackPackItem.Width + 28) + BackPackItem.Width * 0.5;
                            backpack_item.setPosition(_x, _y);
                            backpack_item.setNumBgPos(cc.v2(0, -74), cc.v2(0.5, 0.5), cc.v2(0, 0), cc.v2(0.5, 0.5));
                        }
                        backpack_item.setData({ bid: v[0], num: 0 });
                        backpack_item.setVisible(true);
                        index = index + 1;
                        var asset_key = gdata("item_data", "data_assets_id2label", [v[0]]);
                        if (asset_key != null) {
                            this.upgrade_cost_list.asset_list[asset_key] = { need_num: v[1], condition_status: false, item: backpack_item };
                        } else {
                            this.upgrade_cost_list.item_list[v[0]] = { need_num: v[1], condition_status: false, item: backpack_item };
                        }
                    }
                }
                this.setUpgradeCostStatus();
            }
        }
    },

    //更新消耗状态
    //null的话就标识全部判断，0标识判断基础，1标识判断扩展资产，2标识判断物品
    setUpgradeCostStatus: function (type) {
        //这里是资产
        for (var k in this.upgrade_cost_list.base_list) {
            var v = this.upgrade_cost_list.base_list[k];
            if (v.need_num && v.item) {
                var sum = BackpackController.getInstance().getModel().getRoleAssetByAssetKey(k)|| 0;
                if (sum >= v.need_num) {
                    v.condition_status = true;
                    v.item.color = new cc.Color(0x68, 0x45, 0x2a, 0xff);
                } else {
                    v.condition_status = false;
                    v.item.color = new cc.Color(0xd9, 0x50, 0x14, 0xff);
                }
                v.item.string = v.need_num;
            }
        }

        //这里是扩展资产
        for (var k in this.upgrade_cost_list.asset_list) {
            var v = this.upgrade_cost_list.asset_list[k];
            if (v.item && v.item.setNeedNum) {
                var sum = BackpackController.getInstance().getModel().getRoleAssetByAssetKey(k) || 0;
                v.item.setNeedNum(v.need_num, sum);
                if (sum < v.need_num)
                    v.condition_status = false;
                else
                    v.condition_status = true;
            }
        }

        //这里是需求道具
        this.auto_buy_item_price = 0;
        this.auto_buy_item_bid = 0;

        for (var k in this.upgrade_cost_list.item_list) {
            var sum = BackpackController.getInstance().getModel().getBackPackItemNumByBid(k);
            var v = this.upgrade_cost_list.item_list[k];
            if (v.item && v.item.setNeedNum) {
                v.item.setNeedNum(v.need_num, sum);
                if (sum < v.need_num) {
                    this.auto_buy_item_price = this.auto_buy_item_price + this.getItemPrice(k) * (v.need_num - sum);
                    this.auto_buy_item_bid = k;
                    v.condition_status = true;
                } else {
                    v.condition_status = true;
                }
            }
        }
        this.checkUpgradeCostStatus();
    },

    //获取物品价格
    getItemPrice: function (bid) {
        for (var i in Config.exchange_data.data_shop_exchange_guild) {
            var v = Config.exchange_data.data_shop_exchange_guild[i];
            if (v.item_bid == bid)
                return v.price
        }
        return 0
    },

    //设置更新状态
    checkUpgradeCostStatus: function () {
        if (this.upgrade_cost_list == null)
            return
        if (this.selected_item == null || this.selected_item.config == null)
            return
        var config = this.selected_item.config;
        var condition_status = true;
        for (var k in this.upgrade_cost_list) {
            var list = this.upgrade_cost_list[k];
            for (var n in list) {
                var item = list[n];
                if (item.condition_status == false) {
                    condition_status = false;
                    break
                }
            }
        }

        var condition_type = 0;     //1：消耗不足 2：满足 3：条件不足
        if (this.role_vo.guild_lev >= config.guild_lev) {
            if (condition_status == false)
                condition_type = 1;
            else
                condition_type = 2;
        } else
            condition_type = 3;

        if (this.condition_type != condition_type) {
            this.condition_type = condition_type;
            if (condition_type == 1) {
                // this.check_box.active = false;
                this.condition_value.active = false;
                Utils.setGreyButton(this.handle_btn);
                this.handle_btn_label_outline.enabled = false;
                Utils.setGreyButton(this.handle_btn.getComponent(cc.Button))
                this.handle_btn_label.string = Utils.TI18N("消耗不足");
            } else if (condition_type == 2) {
                // if (this.auto_buy_item_price > 0)
                    // this.check_box.active = true;
                // else
                    // this.check_box.active = false;
                this.condition_value.active = false;
                Utils.setGreyButton(this.handle_btn, false);
                this.handle_btn_label_outline.enabled = true;
                Utils.setGreyButton(this.handle_btn.getComponent(cc.Button),false)
                this.handle_btn_label_outline.color = new cc.Color(0x00, 0x00, 0x00, 0xff)
                this.handle_btn_label.string = Utils.TI18N("点亮");
            } else if (condition_type == 3) {
                // this.check_box.active = false;
                this.condition_value.active = true;
                this.condition_value.string = cc.js.formatStr(Utils.TI18N("需要公会到达%s级"), config.guild_lev)
                Utils.setGreyButton(this.handle_btn, true);
                this.handle_btn_label_outline.enabled = false;
                Utils.setGreyButton(this.handle_btn.getComponent(cc.Button))
                this.handle_btn_label.string = Utils.TI18N("条件不足");
            }
        }
        this.updateAutoBuyInfo();
    },

    updateAutoBuyInfo: function () {

    },

    //物品增删的时候处理
    changeNeedItemInfo: function (list) {
        if (this.upgrade_cost_list == null || this.upgrade_cost_list.item_list == null)
            return
        if (list == null || Utils.next(list) == null)
            return
        var list_dict = {};
        for (var i in list) {
            var vo = list[i];
            if (vo.base_id)
                list_dict[vo.base_id] = true;
        }
        var need_update = false;
        this.auto_buy_item_price = 0;
        for (var k in this.upgrade_cost_list.item_list) {
            if (list_dict[k] == true) {
                need_update = true;
                var sum = BackpackController.getInstance().getModel().getBackPackItemNumByBid(k);
                if (v.item && v.item.setNeedNum) {
                    v.item.setNeedNum(v.need_num, sum);
                    if (sum < v.need_num) {
                        this.auto_buy_item_price = this.auto_buy_item_price + this.getItemPrice(k) * (v.need_num - sum);
                        v.condition_status = true;
                    } else {
                        v.condition_status = true;
                    }
                }
            }
        }
        if (need_update == true)
            this.checkUpgradeCostStatus();
    },

    //标签页对应的伙伴职业类型
    getType: function (index) {
        if (index == 1) {
            return GuildskillConst.index.physics;
        } else if (index == 2) {
            return GuildskillConst.index.magic;
        } else if (index == 3) {
            return GuildskillConst.index.defence;
        } else if (index == 4) {
            return GuildskillConst.index.assist;
        }
    },

    closeCallBack: function () {
        this.ctrl.openGuildSkillMainWindow(false)
        this.handleUpgradeEffect(false)
        this.handleLevUpgradeEffect(false)

        // if (this.selected) {
        //     this.selected.stopAllActions();
        // }

        if (this.fight_label) {
            this.fight_label.deleteMe();
            this.fight_label = null;
        }

        for (var k in this.backpack_item_list) {
            this.backpack_item_list[k].deleteMe();
            this.backpack_item_list[k] = null;
        }
        this.backpack_item_list = {};


        if (this.role_vo) {
            if (this.update_role_assets_event != null) {
                this.role_vo.unbind(this.update_role_assets_event);
                this.update_role_assets_event = null;
            }
        }
    }

});

module.exports = GuildskillMainWindow;