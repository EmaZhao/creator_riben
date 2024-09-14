// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      竖版商城子商城
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var MallController = require("mall_controller");
var RoleController = require("role_controller");
var MallConst = require("mall_const");
var MallEvent = require("mall_event");
var MallItem = require("mall_item");
var CommonScrollView = require("common_scrollview");
var BackpackController = require("backpack_controller");
var TimeTool = require("timetool");

var treasure_type = 16; //针对探宝的

var MallSonPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mall", "mall_son_panel");
        this.ctrl = MallController.getInstance();
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.tab_list = [];
        this.cur_index = null;
        this.cur_tab = null;
        this.data_list = [];
        this.btnOffRes = null;
        this.btnOnRes = null;
    },

    initPanel: function () {
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.tab_container = this.main_container.getChildByName("tab_container");

        for (var i = 1; i < 5; i++) {
            var tab_btn = this.tab_container.getChildByName(cc.js.formatStr("tab_btn_%s", i));
            tab_btn.label = tab_btn.getChildByName("title").getComponent(cc.Label);
            tab_btn.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            // tab_btn.bright = false;
            tab_btn.btn = tab_btn.getComponent(cc.Button);
            tab_btn.btn.interactable = false;
            tab_btn.index = i;
            tab_btn.is_first = true;
            tab_btn.sp = tab_btn.getComponent(cc.Sprite);
            this.tab_list[i] = tab_btn;
        }

        this.refresh_panel = this.main_container.getChildByName("refresh_panel");
        this.refresh_panel.active = false;
        this.btn_refresh = this.refresh_panel.getChildByName("btn_refresh");
        this.refresh_time = this.refresh_panel.getChildByName("refresh_time").getComponent(cc.Label);
        this.refresh_time.string = "";

        var config = gdata("exchange_data", "data_shop_list", [treasure_type]);
        var Sprit_1 = this.btn_refresh.getChildByName("Sprite_1").getComponent(cc.Sprite);
        Sprit_1.node.setScale(0.5, 0.5);
        var item_res_path = PathTool.getItemRes(Utils.getItemConfig(config.item_bid).icon);
        if (item_res_path) {
            this.loadRes(item_res_path, function (res_object) {
                Sprit_1.spriteFrame = res_object;
            }.bind(this))
        }
        var Text_1 = this.btn_refresh.getChildByName("Text_1").getComponent(cc.Label);
        Text_1.string = config.cost_list[0][1] +Utils.TI18N("刷新");

        this.scrollCon = this.main_container.getChildByName("scrollCon");
        this.coin = this.main_container.getChildByName("coin").getComponent(cc.Sprite);
        this.count = this.main_container.getChildByName("count").getComponent(cc.Label);
        this.add_btn = this.main_container.getChildByName("add_btn");
        this.add_btn.active = false;

        var scroll_view_size = cc.size(610, 660);
        var setting = {
            item_class: MallItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 3,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 306,               // 单元的尺寸width
            item_height: 143,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 2,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scrollCon, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))

        this.loadRes(PathTool.getUIIconPath("newly_added","Btn_1_1"),(res)=>{
            this.btnOnRes = res;
            this.cur_tab.sp.spriteFrame = this.btnOnRes;
        });
        
        this.loadRes(PathTool.getUIIconPath("newly_added","Btn_1_4"),(res)=>{
            this.btnOffRes = res;
        });

    },

    registerEvent: function () {
        // for (var k in this.tab_list){
        //     var tab_btn = this.tab_list[k];
        //     var func = function(btn){
        //         if(btn.type != null){
        //             if(btn.btn.interactable == false){
        //                 message(Utils.TI18N(btn.notice));
        //             }else{
        //                 this.changeTabView(btn.index);
        //             }
        //         }
        //     }.bind(this)
        //     tab_btn.on(cc.Node.EventType.TOUCH_END,func(tab_btn))
        // }

        this.add_btn.on(cc.Node.EventType.TOUCH_END, function () {
            var item_bid = gdata("exchange_data", "data_shop_list", [this.cur_tab.type]).item_bid;
            var data = Utils.getItemConfig(item_bid);
            BackpackController.getInstance().openTipsSource(true, data)
        }, this)

        this.addGlobalEvent(MallEvent.Open_View_Event, function (data) {
            if (this.cur_index != 4) {
                var list = this.getConfig(this.cur_tab.type, data);
                this.data_list[this.cur_index] = Utils.deepCopy(list);
                this.item_scrollview.setData(this.data_list[this.cur_index], function (cell) {
                    this.ctrl.openMallBuyWindow(true, cell);
                }.bind(this))
            }
        }.bind(this))

        if (this.role_vo) {
            if (this.role_update_lev_event == null) {
                this.role_update_lev_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    // if (this.cur_index == null || this.cur_index == MallConst.MallType.ScoreShop)
                    //     return
                    if (key == "lev") {
                        for (var k in this.tab_list) {
                            if(k == this.cur_index){
                                continue
                            }
                            this.setTabBtnTouchStatus(this.checkBtnIsOpen(k), k);
                        }
                    } else if (key == "gsrv_id" || key == "gid") {
                        this.setTabBtnTouchStatus(this.checkBtnIsOpen(5), 1)
                    }
                    else if (key == "gold" || key == "arena_cent" || key == "guild" || key == "hero_soul" || key == "friend_point" || key == "arena_guesscent" || key == "star_point" || key == "expedition_medal") {
                        var item_bid = gdata("exchange_data", "data_shop_list", [this.cur_tab.type]).item_bid;

                        if (gdata("item_data", "data_assets_id2label", [item_bid]) == key) {
                            var item_res_path = PathTool.getItemRes(Utils.getItemConfig(item_bid).icon);
                            if (item_res_path) {
                                this.loadRes(item_res_path, function (res_object) {
                                    this.coin.spriteFrame = res_object;
                                }.bind(this))
                            }
                            if (this.cur_index == 4) {
                                this.count.string = this.role_vo.star_point;
                            } else {
                                if (this.cur_index == 1) {
                                    this.count.string = this.role_vo.expedition_medal;
                                } else {
                                    this.count.string = BackpackController.getInstance().getModel().getRoleAssetByAssetKey(gdata("item_data", "data_assets_id2label", [item_bid]));
                                }
                            }
                        }


                    }
                }, this)
            }
        }

        //除神秘神格商城以外的购买成功
        this.addGlobalEvent(MallEvent.Buy_Success_Event, function (data) {
            if (this.cur_index && this.data_list && this.data_list[this.cur_index]) {
                for (var k in this.data_list[this.cur_index]) {
                    var v = this.data_list[this.cur_index][k];
                    if (typeof (v) == "number") {
                        if (v != null && v.id != null && v.has_buy != null) {
                            if (v.id == data.eid && Utils.next(data.ext || {}) != null)
                                v.has_buy = data.ext[0].val;
                        }
                    }
                }
            }
        }.bind(this))

        this.btn_refresh.on(cc.Node.EventType.TOUCH_END, function () {
            var list = gdata("exchange_data", "data_shop_list", [treasure_type]).cost_list;
            if (this.role_vo.star_point >= list[0][1]) {
                this.ctrl.sender13405(treasure_type);
            } else {
                message(Utils.TI18N("探宝积分不足"));
                BackpackController.getInstance().openTipsSource(true, 18)
            }
        }, this)

        this.addGlobalEvent(MallEvent.Get_Buy_list, function (data) {
            if (data.type == treasure_type) {
                this.setLessTime(data.refresh_time - gcore.SmartSocket.getTime());
                for (var k in data.item_list) {
                    data.item_list[k].shop_type = treasure_type;
                }
                this.data_list[this.cur_index] = Utils.deepCopy(data);
                this.item_scrollview.setData(this.data_list[this.cur_index].item_list, function (cell) {
                    this.ctrl.openMallBuyWindow(true, cell);
                }.bind(this))
            }
        }.bind(this));
    },

    //设置倒计时
    setLessTime: function (less_time) {
        if (this.refresh_time == null) return
        this.refresh_time.node.stopAllActions();
        if (less_time > 0) {
            this.setTimeFormatString(less_time);
            var callfun = cc.callFunc(function () {
                less_time = less_time - 1;
                if (less_time < 0) {
                    this.refresh_time.node.stopAllActions();
                } else {
                    this.setTimeFormatString(less_time)
                }
            }.bind(this))
            this.refresh_time.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1), callfun)))
        } else {
            this.setTimeFormatString(less_time);
        }
    },

    setTimeFormatString: function (time) {
        if (time > 0) {
            this.refresh_time.string = TimeTool.getTimeFormat(time);
        } else {
            this.refresh_time.string = "00:00:00";
        }
    },

    setData: function (data) {
        if (data == null)
            return
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        this.setList(this.list);
        this.openById(this.id);
    },

    setCallFun: function (call_fun) {
        this.call_fun = call_fun;
    },

    setVisibleStatus: function (bool) {
        if (this.root_wnd == null)
            return
        this.root_wnd.active = bool;
    },


    onDelete: function () {
        if (this.item_scrollview)
            this.item_scrollview.deleteMe();
        this.item_scrollview = null;
        if (this.role_update_lev_event) {
            if (this.role_vo) {
                this.role_vo.unbind(this.role_update_lev_event)
                this.role_update_lev_event = null;
                this.role_vo = null;
            }
        }
        if (this.refresh_time) {
            this.refresh_time.node.stopAllActions();
            this.refresh_time = null;
        }

        this.btnOffRes = this.btnOnRes = null;
    },


    changeTabView: function (index) {
        if (this.cur_index == index)
            return
        if (this.cur_tab != null) {
            this.cur_tab.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            this.cur_tab.btn.interactable = true;
            if(this.btnOnRes) {
                this.cur_tab.sp.spriteFrame = this.btnOffRes;
            }
        }
        this.cur_index = index;
        this.cur_tab = this.tab_list[this.cur_index];


        if (this.cur_tab) {
            this.cur_tab.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            this.cur_tab.btn.interactable = false;
            if(this.btnOnRes) {
                this.cur_tab.sp.spriteFrame = this.btnOnRes;
            }
        }

        this.refresh_panel.active = this.cur_index == 4;

        if (this.cur_tab.is_first) {
            this.ctrl.sender13401(this.cur_tab.type);
            this.cur_tab.is_first = false;
        } else {
            if (this.cur_index != 4) {
                this.item_scrollview.setData(this.data_list[this.cur_index], function (cell) {
                    this.ctrl.openMallBuyWindow(true, cell);
                }.bind(this))
            }
        }

        if (this.cur_index == 4) {
            this.item_scrollview.setData([]);
            this.ctrl.sender13403(treasure_type);
        }

        var item_bid = gdata("exchange_data", "data_shop_list", [this.cur_tab.type]).item_bid;
        if (item_bid) {
            if (this.cur_index == 4) {
                var item_bid = gdata("exchange_data", "data_shop_list", [treasure_type]).item_bid;
                var item_res_path = PathTool.getItemRes(Utils.getItemConfig(item_bid).icon);
                if (item_res_path) {
                    this.loadRes(item_res_path, function (res_object) {
                        this.coin.spriteFrame = res_object;
                    }.bind(this))
                    this.count.string = this.role_vo.star_point;
                }
            } else {
                var item_res_path = PathTool.getItemRes(Utils.getItemConfig(item_bid).icon);
                if (item_res_path) {
                    this.loadRes(item_res_path, function (res_object) {
                        this.coin.spriteFrame = res_object;
                    }.bind(this))
                    this.count.string = this.role_vo.star_point;
                }
                if (this.cur_index == 1)
                    this.count.string = this.role_vo.expedition_medal;
                else
                    this.count.string = Utils.getMoneyString(BackpackController.getInstance().getModel().getRoleAssetByAssetKey(gdata("item_data", "data_assets_id2label", [item_bid])));
            }
        }
    },

    openById: function (id) {
        this.id = id;
        if (this.root_wnd == null)
            return;
        for (var k in this.tab_list) {
            var v = this.tab_list[k];
            if (v.type == id) {
                this.cur_index = null;
                this.changeTabView(v.index);
            }
        }
    },

    getConfig: function (index, data) {
        var config = [];
        if (index == 5) {
            config = Utils.deepCopy(Config.exchange_data.data_shop_exchage_guild)
        } else if (index == 6) {
            config = Utils.deepCopy(Config.exchange_data.data_shop_exchage_arena)
        } else if (index == 7) {
            config = Utils.deepCopy(Config.exchange_data.data_shop_exchage_boss)
        } else if (index == 8) {
            config = Utils.deepCopy(Config.exchange_data.data_shop_exchage_expediton)
        } else if (index == 16) { //探宝
            config = Utils.deepCopy(Config.exchange_data.data_shop_exchage_guess)
        }

        var list = Utils.deepCopy(data.item_list);
        var show_list = [];
        for (var a in config) {
            var j = config[a];
            if (j.type == this.cur_tab.type) {
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
        return show_list;
    },

    checkBtnIsOpen: function (type) {
        if (type == 5) { //工会
            if (this.role_vo.lev >= gdata("exchange_data", "data_shop_exchage_cost", "open_guild_lev").val && this.role_vo.isHasGuild())
                return true
            else
                return false
        } else if (type == 6 || type == 16) {//竞技
            var SceneConst = require("scene_const");
            var build_vo = require("mainscene_controller").getInstance().getBuildVo(SceneConst.CenterSceneBuild.arena);
            if (build_vo && build_vo.is_lock)
                return false
            else
                return true
        } else if (type == 7) {
            if (this.role_vo.lev >= gdata("exchange_data", "data_shop_exchage_cost", "open_god_point_lev").val)
                return true
            else
                return false
        }
        return true
    },

    setTabBtnTouchStatus: function (status, index) {
        var tab_btn = this.tab_list[index];
        if (tab_btn) {
            if (!status)
                tab_btn.getComponent(cc.Sprite).setState(cc.Sprite.State.GRAY)
            else{
                tab_btn.getComponent(cc.Sprite).setState(cc.Sprite.State.NORMAL)
                tab_btn.getComponent(cc.Button).interactable = status;
                tab_btn.getComponent(cc.Button).enableAutoGrayEffect = !status;
            }

            tab_btn.can_touch = status
        }
    },

    setList: function (list) {
        this.list = list;
        if (this.root_wnd == null)
            return
        var notice_list = {
            [5]: gdata("exchange_data", "data_shop_exchage_cost", "open_guild_lev").desc,
            [16]: gdata("exchange_data", "data_shop_exchage_cost", "open_arena_cent_lev").desc,
            [6]: gdata("exchange_data", "data_shop_exchage_cost", "open_arena_cent_lev").desc
        }

        for (var k in this.tab_list) {
            var v = this.tab_list[k];
            if (list[k - 1] != null) {
                v.active = true;
                v.label.string = gdata("exchange_data", "data_shop_list", [list[k - 1]]).name;
                v.type = list[k - 1];
                v.notice = notice_list[v.type];
                this.setTabBtnTouchStatus(this.checkBtnIsOpen(v.type), k);
            } else {
                v.active = false;
            }
        }

        if (this.btn_event == null) {
            for (var k in this.tab_list) {
                var tab_btn = this.tab_list[k];
                if (tab_btn != null) {
                    tab_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
                        var btn = event.currentTarget;
                        if (btn.type != null) {
                            if (btn.can_touch == false)
                                message(Utils.TI18N(btn.notice));
                            else
                                this.changeTabView(btn.index);
                        }
                    }, this)
                }
            }
            this.btn_event = true;
        }

        // var select_index = 1;
        // for(var i = 0;i < list.length; i ++){
        //     if (list[i] != null){
        //         if (this.checkBtnIsOpen(this.tab_list[i]).type){
        //             select_index = i;
        //             break
        //         }
        //     }
        // }
    },


});

module.exports = MallSonPanel;