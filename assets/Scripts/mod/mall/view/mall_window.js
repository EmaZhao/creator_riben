// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var MallController = require("mall_controller");
var RoleController = require("role_controller");
var CommonScrollView = require("common_scrollview");
var MallEvent = require("mall_event");
var MallConst = require("mall_const");
var MallItem = require("mall_item");
var TimeTool = require("timetool")
var BackpackController = require("backpack_controller")
var BackpackEvent = require("backpack_event")
var BackPackConst = require("backpack_const")
var CommonAlert = require("commonalert")
var MailWindow = cc.Class({
    extends: CommonWindowTab,
    ctor: function() {
        this.model = MallController.getInstance().getModel()
        this.ctrl = MallController.getInstance();
        this.win_type = WinType.Full;
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.tab_info_list = [
            { label: gdata("exchange_data", "data_shop_list", 1).name, index: 1, status: true, notice: cc.js.formatStr("%s级开启", gdata("exchange_data", "data_shop_exchage_cost", "open_gold_lev").val), is_first: true },
            { label: gdata("exchange_data", "data_shop_list", 2).name, index: 2, status: true, notice: cc.js.formatStr("%s级开启", gdata("exchange_data", "data_shop_exchage_cost", "open_hero_soul_lev").val), is_first: true },
            { label: gdata("exchange_data", "data_shop_list", 3).name, index: 3, status: true, notice: cc.js.formatStr("%s级开启", gdata("exchange_data", "data_shop_exchage_cost", "open_point_lev").val), is_first: true },
            { label: gdata("exchange_data", "data_shop_list", MallConst.MallType.SkillShop).name, index: 4, status: true, notice: cc.js.formatStr("%s级开启", gdata("exchange_data", "data_shop_exchage_cost", "open_skill_lev").val), is_first: true }
        ];
        this.title_str = Utils.TI18N("商城");
        this.tab_list = this.tab_info_list;
        this.cur_tab = null;
        this.cur_index = null;
        this.first_index = null;
        this.data_list = {};
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    initPanel: function() {
        if (this.mall_root_wnd == null) {
            this.loadRes(PathTool.getPrefabPath("mall", "mall_window_2"), function(res_obj) {
                var obj = res_obj;
                this.createMallRootWnd(obj);
            }.bind(this));
        }
    },

    createMallRootWnd: function(view) {
        this.mall_root_wnd = view;
        this.mall_root_wnd.setParent(this.container);

        this.mall_container = this.mall_root_wnd.getChildByName("container");
        this.mall_scroll_con = this.mall_container.getChildByName("scrollCon");
        this.btn = this.mall_container.getChildByName("btn");
        this.btn.active = false;
        this.btn_label = this.seekChild(this.btn, "Label", cc.Label);
        this.btn_img = this.seekChild(this.btn, "img", cc.Sprite);

        this.coin = this.mall_container.getChildByName("coin").getComponent(cc.Sprite);
        this.count = this.mall_container.getChildByName("count").getComponent(cc.Label);
        this.add_btn = this.mall_container.getChildByName("add_btn");
        this.time_rt = this.mall_container.getChildByName("time").getComponent(cc.RichText)
        this.time_down_text_rt = this.mall_container.getChildByName("time_down_text").getComponent(cc.RichText)
        this.add_btn.active = false;
        this.refresh_count = this.mall_container.getChildByName("refresh_count").getComponent(cc.Label);
        this.tips_btn = this.mall_container.getChildByName("tips_btn");
        this.tips_btn.active = false;
        this.good_cons = this.mall_container.getChildByName("good_cons");

        var scroll_view_size = cc.size(622, 705)
        var setting = {
            item_class: MallItem, // 单元类
            start_x: 4, // 第一个单元的X起点
            space_x: 0, // x方向的间隔
            start_y: 3, // 第一个单元的Y起点
            space_y: 2, // y方向的间隔
            item_width: 306, // 单元的尺寸width
            item_height: 143, // 单元的尺寸height
            row: 0, // 行数，作用于水平滚动类型
            col: 2, // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.mall_scroll_con, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))

        this.selectedTabCallBack(this.first_index);
        this.registerEvent_1()
    },

    registerEvent_1: function() {
        if (this.add_btn) {
            this.add_btn.on(cc.Node.EventType.TOUCH_END, function() {
                var item_bid = gdata("exchange_data", "data_shop_list", [this.cur_index]).item_bid;
                var data = Utils.getItemConfig(item_bid);
                require("backpack_controller").getInstance().openTipsSource(true, data)
            }, this)
        }

        if (this.btn) {
            this.btn.on(cc.Node.EventType.TOUCH_END, function() {
                if (this.cur_index == 4 || this.cur_index == 2) {
                    let type = this.cur_index
                    let fun = function() {
                        this.ctrl.sender13405(type)
                    }.bind(this)
                    if (this.cur_index == 4) {
                        type = MallConst.MallType.SkillShop
                        fun()
                    } else {
                        let asset_cfg = Config.exchange_data.data_shop_exchage_cost["soul_reset_cost"]
                        let bid, num
                        if (asset_cfg) {
                            bid = asset_cfg.val[0][0]
                            num = asset_cfg.val[0][1]
                        }
                        let good_res_path = Utils.getItemConfig(bid).icon
                        let frame_arrays = [];
                        let good_path = PathTool.getIconPath("item", good_res_path);
                        frame_arrays.push(good_path);
                        let text = Utils.TI18N("是否消耗<img src='%s' />%s进行重置？");
                        let str = cc.js.formatStr(text, good_res_path, num)
                        CommonAlert.show(str, Utils.TI18N("确定"), fun.bind(this), Utils.TI18N("取消"), null, null, null, { resArr: frame_arrays })
                    }
                }
            }, this)
        }

        //获取商品已购买次数(限于购买过的有限购的商品)
        this.addGlobalEvent(MallEvent.Open_View_Event, function(data) {
            if (this.cur_index != 4 && this.cur_index != 2) {
                this.cur_tab.is_first = false;
                var list = this.getConfig(this.cur_index, data);
                this.data_list[this.cur_index] = Utils.deepCopy(list);
                this.item_scrollview.setData(list, function(cell) {
                    this.ctrl.openMallBuyWindow(true, cell);
                })
            }
        }.bind(this))

        //获取神秘商店物品列表
        this.addGlobalEvent(MallEvent.Get_Buy_list, function(data) {
            if (this.cur_index == 4 || this.cur_index == 2) {
                this.cur_tab.is_first = false;
                var btn_str = Utils.TI18N("免费刷新");
                if (this.cur_index == 2) { //神格
                    if (data.free_count <= 0) {
                        var asset_cfg = gdata("exchange_data", "data_shop_exchage_cost", "soul_reset_cost");
                        if (asset_cfg) {
                            var bid = asset_cfg.val[0][0];
                            var num = asset_cfg.val[0][1];
                            btn_str = cc.js.formatStr(Utils.TI18N("%s重置"), num)
                            this.loadRes(PathTool.getItemRes(Utils.getItemConfig(bid).icon), function(res_object) {
                                this.btn_img.spriteFrame = res_object;
                            }.bind(this))
                        }
                    }
                }
                this.btn_label.string = btn_str;
                this.setResetCount(data)
                for (var k in data.item_list) {
                    var v = data.item_list[k];
                    if (this.cur_index == 4) {
                        v.shop_type = MallConst.MallType.SkillShop;
                    } else {
                        v.shop_type = this.cur_index;
                    }
                }
                this.data_list[this.cur_index] = Utils.deepCopy(data)

                if (this.cur_index == 4) {
                    this.setLessTime(this.data_list[this.cur_index].refresh_time - gcore.SmartSocket.getTime());
                }
                this.item_scrollview.setData(this.data_list[this.cur_index].item_list, function(cell) {
                    this.ctrl.openMallBuyWindow(true, cell);
                }.bind(this))
            }
        }.bind(this))

        if (this.role_vo) {
            if (this.role_update_lev_event == null) {
                this.role_update_lev_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value) {
                    if (this.cur_index == null || this.cur_index == MallConst.MallType.ScoreShop)
                        return
                    if (key == "lev") {
                        for (var k in this.tab_list) {
                            this.setTabBtnTouchStatus(this.checkBtnIsOpen(k), k);
                        }
                    } else if (key == "gold" || key == "arena_cent" || key == "guild" || key == "hero_soul" || key == "friend_point" || key == "red_gold") {
                        var config = gdata("exchange_data", "data_shop_list", [this.cur_index]);
                        if (config) {
                            var item_bid = config.item_bid;
                            if (item_bid == 15) { //钻石
                                this.count.string = Utils.getMoneyString(this.role_vo.getTotalGold());
                            } else {
                                if (gdata("item_data", "data_assets_id2label", [item_bid]) == key)
                                    this.count.string = Utils.getMoneyString(BackpackController.getInstance().getModel().getRoleAssetByAssetKey(gdata("item_data", "data_assets_id2label", [item_bid])));
                            }
                        }
                        // var item_res_path = PathTool.getItemRes(Utils.getItemConfig(item_bid).icon);
                        // if (item_res_path) {
                        //     this.loadRes(item_res_path, function (res_object) {
                        //         this.coin.spriteFrame = res_object;
                        //     }.bind(this))
                        // }
                    }
                }, this)
            }
        }

        //到时候刷新了
        this.addGlobalEvent(MallEvent.Frash_tips_event, function() {
            if (this.cur_index == 4 || this.cur_index == 2) {
                let _type = this.cur_index
                if (this.cur_index == 4) {
                    _type = MallConst.MallType.SkillShop
                }
                this.ctrl.sender13403(_type);
            }
        }.bind(this))

        //除神秘神格商城以外的购买成功
        this.addGlobalEvent(MallEvent.Buy_Success_Event, function(data) {
            if (this.cur_index == null || this.data_list == null || this.data_list[this.cur_index] == null)
                return
            if (this.cur_index != 2 || this.cur_index != 4) {
                for (var k in this.data_list[this.cur_index]) {
                    var v = this.data_list[this.cur_index][k];
                    if (v.id == data.eid && Utils.next(data.ext || {}) != null) {
                        v.has_buy = data.ext[0].val;
                    }
                }
            }
        }.bind(this))

        //神秘/神格商城购买成功
        this.addGlobalEvent(MallEvent.Buy_One_Success, function(data) {
            if (this.cur_index == null || this.data_list == null || this.data_list[this.cur_index] == null)
                return
            let _shop_type = this.cur_index
            if (this.cur_index == 4) {
                _shop_type = MallConst.MallType.SkillShop
            }
            for (var k in this.data_list[this.cur_index].item_list) {
                var v = this.data_list[this.cur_index].item_list[k];
                if (v.shop_type == _shop_type && v.order && data.order == v.order)
                    v.has_buy = 1;
            }
        }.bind(this))

        this.addGlobalEvent(BackpackEvent.DELETE_GOODS, function(bag_code, temp_list) {
            if (bag_code != BackPackConst.Bag_Code.EQUIPS) {
                let item_bid = Config.exchange_data.data_shop_list[MallConst.MallType.SkillShop].item_bid
                for (let i in temp_list) {
                    let item = temp_list[i]
                    if (item.base_id == item_bid) {
                        this.updateIconInfo(item_bid)
                        break
                    }
                }
            }
        }.bind(this))

        this.addGlobalEvent(BackpackEvent.MODIFY_GOODS_NUM, function(bag_code, temp_list) {
            if (bag_code != BackPackConst.Bag_Code.EQUIPS) {
                let item_bid = Config.exchange_data.data_shop_list[MallConst.MallType.SkillShop].item_bid
                for (let i in temp_list) {
                    let item = temp_list[i]
                    if (item.base_id == item_bid) {
                        this.updateIconInfo(item_bid)
                        break
                    }
                }
            }
        }.bind(this))

        this.addGlobalEvent(BackpackEvent.ADD_GOODS, function(bag_code, temp_list) {
            if (bag_code != BackPackConst.Bag_Code.EQUIPS) {
                let item_bid = Config.exchange_data.data_shop_list[MallConst.MallType.SkillShop].item_bid
                for (let i in temp_list) {
                    let item = temp_list[i]
                    if (item.base_id == item_bid) {
                        this.updateIconInfo(item_bid)
                        break
                    }
                }
            }
        }.bind(this))
        this.tips_btn.on(cc.Node.EventType.TOUCH_END, function(event) {
            var str = "";
            if (this.cur_index == 2) {
                var cfg = gdata("exchange_data", "data_shop_exchage_cost", "hero_soul_instruction");
                if (cfg && cfg.desc)
                    str = cfg.desc;

            } else if (this.cur_index == 4) {
                var cfg = gdata("exchange_data", "data_shop_exchage_cost", "secret_instruction");
                if (cfg && cfg.desc)
                    str = cfg.desc;
            }
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(str, pos);
        }, this)
    },

    setLessTime: function(less_time) {
        var self = this
        if (!self.time_rt) return;
        if (this.time_tichet) {
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        this.time_rt.node.active = true;
        this.time_down_text_rt.node.active = true;
        if (less_time > 0) {
            self.setTimeFormatString(less_time)
            if (this.time_tichet == null) {
                this.time_tichet = gcore.Timer.set(function() {
                    less_time--
                    if (less_time < 0) {
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                        if (self.cur_index == 4) {
                            self.ctrl.sender13403(MallConst.MallType.SkillShop)
                        }
                    } else {
                        this.setTimeFormatString(less_time)
                    }
                }.bind(this), 1000, -1)
            }
        } else {
            self.setTimeFormatString(less_time)
        }
    },

    setTimeFormatString: function(time) {
        if (time > 0) {
            this.time_rt.string = Utils.TI18N("免费刷新:") + " <color=#249003>" + TimeTool.getTimeFormat(time) + "</color>"
        } else {
            this.time_rt.string = Utils.TI18N("免费刷新:") + " <color=#249003>00:00:00</color>"
        }
    },

    updateIconInfo(item_bid) {
        if (item_bid == gdata("item_data", "data_assets_label2id", "gold")) {
            this.count.string = Utils.getMoneyString(this.role_vo.getTotalGold());
        } else {
            this.count.string = Utils.getMoneyString(BackpackController.getInstance().getModel().getItemNumByBid(item_bid));
        }
    },
    openRootWnd: function(index) {
        index = index || 1;
        let sub_index = index
        if (index == MallConst.MallType.SkillShop) {
            sub_index = 4
        } else if (index > 4) {
            let subtype = gdata("exchange_data", "data_shop_list", [3]).subtype
            if (subtype.indexOf(index) != -1) {
                sub_index = 3
            }
        } else if (index == MallConst.MallType.ScoreShop) {
            index = 8;
        }
        //first_index 为选中 //所在类型
        this.first_index = sub_index;
        this.sub_type = index
        this.ctrl.setFirstLogin(false);
        this.setSelecteTab(sub_index);
    },

    closeCallBack: function() {
        this.ctrl.openMallPanel(false);
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe();
            this.item_scrollview = null;
        }
        if (this.son_panel) {
            this.son_panel.deleteMe();
        }
        if (this.role_update_lev_event) {
            this.role_vo.unbind(this.role_update_lev_event);
            this.role_update_lev_event = null
        }
        if (this.time_tichet) {
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        this.role_vo = null;
        this.son_panel = null;
        var ActionController = require("action_controller")
        if (ActionController.getInstance().getTreasureView()) {
            ActionController.getInstance().getTreasureView().setVisible(true)
        }
    },

    //切换标签
    selectedTabCallBack: function(index) {
        if (this.cur_index == index)
            return
        if (this.mall_root_wnd == null)
            return
        this.first_index = index
        let type
        if (index == 3) {
            if (this.sub_type) {
                type = this.sub_type
                this.sub_type = null
            } else {
                type = gdata("exchange_data", "data_shop_list", [index]).subtype[0]
            }
        } else {
            this.sub_type = null
        }

        this.cur_index = index;
        this.mall_scroll_con.active = index != 3;

        this.cur_tab = this.tab_info_list[index - 1];
        //容错旧版本一些跳转问题
        if (this.cur_tab == null) {
            index = 1;
            this.cur_index = index;
            this.cur_tab = this.tab_info_list[index - 1];
        }

        this.time_rt.node.active = false;
        this.time_down_text_rt.node.active = false;
        this.tips_btn.active = false;
        if (this.hasSon(index)) {
            this.btn.active = false;
            this.good_cons.active = false;
            if (!this.son_panel) {
                var MallSonPanel = require("mall_son_panel");
                this.son_panel = new MallSonPanel();
                this.son_panel.show();
                this.son_panel.setParent(this.mall_container);
            } else {
                this.son_panel.setVisibleStatus(true);
            }
            this.mall_scroll_con.active = false;
            this.son_panel.setList(gdata("exchange_data", "data_shop_list", [index]).subtype);
            this.son_panel.openById(type);
            this.btn.active = false;
            this.good_cons.active = false;
            this.coin.node.active = false;
            this.count.node.active = false;
            this.refresh_count.label = "";
            this.add_btn.active = false;
        } else if (index <= 4) {
            if (index != 4 && index != 2) {
                this.btn.active = false;
                this.coin.node.active = true;
                this.count.node.active = true;
                this.refresh_count.label = "";
                this.add_btn.active = false;
                if (this.cur_tab.is_first) {
                    this.ctrl.sender13401(index); //获取普通商店的限购次数
                } else {
                    this.item_scrollview.setData(this.data_list[this.cur_index], function(cell) {
                        this.ctrl.openMallBuyWindow(true, cell);
                    })
                }
            } else {
                this.btn.active = true;
                this.coin.node.active = true;
                this.count.node.active = true;
                this.add_btn.active = false;
                if (index == 2) {
                    this.tips_btn.active = true;
                }

                if (this.cur_tab.is_first) {
                    let _type = index
                    if (_type == 4) {
                        _type = MallConst.MallType.SkillShop
                    }
                    this.ctrl.sender13403(_type); //获取神秘/神格商店列表
                } else {
                    if (index == 4) {
                        let time = this.data_list[this.cur_index].refresh_time - gcore.SmartSocket.getTime()
                        if (time > 0) {
                            this.setLessTime(time)
                        } else {
                            this.setTimeFormatString(0)
                            this.ctrl.sender13403(MallConst.MallType.SkillShop)
                        }
                    }
                    this.setResetCount(this.data_list[this.cur_index])
                    this.item_scrollview.setData(this.data_list[this.cur_index].item_list, function(cell) {
                        this.ctrl.openMallBuyWindow(true, cell);
                    }.bind(this))
                }
            }
            var item_bid
            if (index == 4) {
                item_bid = gdata("exchange_data", "data_shop_list", [MallConst.MallType.SkillShop]).item_bid;
            } else {
                item_bid = gdata("exchange_data", "data_shop_list", [index]).item_bid;
            }

            var item_res_path = PathTool.getItemRes(Utils.getItemConfig(item_bid).icon);
            if (item_res_path) {
                this.loadRes(item_res_path, function(res_object) {
                    this.coin.spriteFrame = res_object;
                }.bind(this))
            }
            this.updateIconInfo(item_bid)

            this.good_cons.active = true;
            if (this.son_panel) {
                this.son_panel.setVisibleStatus(false);
            }
        }

    },

    getConfig: function(index, data) {
        var config = [];
        var list = [];
        if (index == 1) {
            config = Utils.deepCopy(Config.exchange_data.data_shop_exchage_gold);
        } else if (index == 2) {

        }

        var show_list = [];
        if (index != 4 && index != 2) {
            var list = Utils.deepCopy(data.item_list);
            for (var a in config) {
                var j = config[a];
                if (j.type == this.cur_index) {
                    if (list && Utils.next(list)) { //已经买过的限购物品
                        for (var k in list) {
                            var v = list[k];
                            if (j.id == v.item_id) {
                                if (v.ext[0] && v.ext[0].val != null) { //不管是什么限购 赋值已购买次数就好了
                                    j.has_buy = v.ext[0].val;
                                    list.splice(k, 1);
                                }
                                break;
                            } else
                                j.has_buy = 0;
                        }
                    } else
                        j.has_buy = 0;
                    show_list.push(j)
                }
            }
        }
        return show_list;
    },

    //判断是否有子标签:{
    hasSon: function(index) {
        var sub_type = gdata("exchange_data", "data_shop_list", [index]).subtype;
        return Utils.next(sub_type) != null
    },


    //判断是否开启按钮
    checkBtnIsOpen: function(index) {
        if (index == 1) { //钻石商城
            if (this.role_vo.lev >= gdata("exchange_data", "data_shop_exchage_cost", "open_gold_lev").val)
                return true
            else
                return false
        } else if (index == 2) { //神格商店
            if (this.role_vo.lev >= gdata("exchange_data", "data_shop_exchage_cost", "open_hero_soul_lev").val)
                return true
            else
                return false
        } else if (index == 3) { //积分
            if (this.role_vo.lev >= gdata("exchange_data", "data_shop_exchage_cost", "open_point_lev").val)
                return true
            else
                return false
        } else if (index == 4) { //神秘商店
            if (this.role_vo.lev >= gdata("exchange_data", "data_shop_exchage_cost", "open_secret_lev").val)
                return true
            else
                return false
        }
        return true
    },
    setResetCount(data) {
        var self = this
        if (!data) return;
        let free_count = data.free_count || 0
        let btn_str = Utils.TI18N("免费刷新")
        this.btn_img.node.active = false;
        if (self.cur_index == 2) { //神格
            if (free_count <= 0) {
                let asset_cfg = Config.exchange_data.data_shop_exchage_cost["soul_reset_cost"]
                if (asset_cfg) {
                    let bid = asset_cfg.val[0][0];
                    let num = asset_cfg.val[0][1];
                    btn_str = num + Utils.TI18N("重置");
                    this.btn_img.node.active = true;
                    this.loadRes(PathTool.getItemRes(Utils.getItemConfig(bid).icon), function(res) {
                        this.btn_img.spriteFrame = res
                    }.bind(this))
                }
            }
        } else if (self.cur_index == 4) { //技能
            if (free_count <= 0) {
                let config = Config.exchange_data.data_shop_list[MallConst.MallType.SkillShop]
                if (config) {
                    let cost_list = config.cost_list;
                    let bid = cost_list[0][0];
                    let num = cost_list[0][1];
                    btn_str = num + Utils.TI18N("刷新");
                    this.btn_img.node.active = true;
                    this.loadRes(PathTool.getItemRes(Utils.getItemConfig(bid).icon), function(res) {
                        this.btn_img.spriteFrame = res
                    }.bind(this))
                }
            } else {
                let asset_cfg = Config.exchange_data.data_shop_exchage_cost["skill_refresh_free"]
                if (asset_cfg) {
                    btn_str = cc.js.formatStr("%s(%s/%s)", Utils.TI18N("免费刷新"), free_count, asset_cfg.val)
                }
            }
            let config = Config.exchange_data.data_shop_exchage_cost.skill_refresh_number
            let max_count = 0
            if (config) {
                max_count = config.val
            }
            let count = data.count || 0
            let text = cc.js.formatStr("%s:%s/%s", Utils.TI18N("刷新次数"), count, max_count)
            self.time_down_text_rt.string = text;
        }
        self.btn_label.string = btn_str
    },
    setTabBtnTouchStatus: function(status, index) {

    },



});

module.exports = MailWindow;