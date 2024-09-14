// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     快速作战的主界面
// <br/>Create: 2019-03-02 14:38:52
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaHookRewardListPanel = require("battle_drama_hook_reward_list_panel");
var DramaEvent = require("battle_drama_event");
var BattleEvent = require("battle_event");
var RoleController = require("role_controller");
var BattleDramaQuickWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_quick_battle_windows");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.controller = require("battle_drama_controller").getInstance();
        this.drama_model = this.controller.getModel();
        this.quick_battle_status = 0;
        this.privilege_status = require("role_controller").getInstance().getModel().checkPrivilegeStatus(1);   // 是否有特权
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.list_view = this.seekChild("list_view");                       // 存放物品展示列表
        this.close_btn = this.seekChild("close_btn");                       // 关闭按钮
        this.desc = this.seekChild("desc", cc.RichText);                    // 描述文本
        this.explain_btn = this.seekChild("explain_btn");                   // 说明文本
        this.background.scale = FIT_SCALE;

        this.source_btn = this.seekChild("source_btn")                      // 快速作战按钮
        this.source_label = this.seekChild(this.source_btn, "label", cc.Label);              // 作战按钮描述文本
        this.source_icon = this.seekChild(this.source_btn, "icon");                          // 作战按钮物品icon
        this.source_icon_frame = this.source_icon.getComponent(cc.Sprite);
        this.notice_label = this.seekChild("notice_label", cc.RichText);    // 剩余次数展示
        this.btn_buy_quick = this.seekChild("btn_buy_quick");
        this.btn_buy_quick.active = false;

        var scroll_view_size = cc.size(this.list_view.width, this.list_view.height);
        var setting = {
            item_class: BattleDramaHookRewardListPanel,      // 单元类
            start_x: 22,                    // 第一个单元的X起点
            space_x: 30,                    // x方向的间隔
            start_y: 10,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: 120,               // 单元的尺寸width
            item_height: 120,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 4,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = Utils.createClass("common_scrollview");
        this.item_scrollview.createScroll(this.list_view, null, null, null, scroll_view_size, setting);

        Utils.getNodeCompByPath("root/use_title", this.root_wnd, cc.Label).string = Utils.TI18N("使用后预计收益:");
        Utils.getNodeCompByPath("root/btn_buy_quick", this.root_wnd, cc.Label).string = Utils.TI18N("前往激活");
        Utils.getNodeCompByPath("root/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("快速战斗");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.controller.openDramBattleQuickView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.controller.openDramBattleQuickView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_buy_quick, function () {
            require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.PRIVILEGE)
            this.controller.openDramBattleQuickView(false);
        }.bind(this), 2);

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            var desc = StringUtil.parse(Config.dungeon_data.data_drama_const.game_rule.desc)
            require("tips_controller").getInstance().showCommonTips(desc, pos);
        });

        Utils.onTouchEnd(this.source_btn, function () {
            if (this.quick_battle_status == 0 || this.quick_battle_status == 1) {          // 可以直接使用
                this.send13004()
            } else if (this.quick_battle_status == 2 && this.quick_battle_cost != 0) {       // 需要花费钻石
                if (this.drama_model.getFirstFresh() && this.privilege_status == false) {
                    this.controller.send13039();
                    var CommonAlert = require("commonalert");
                    var str = Utils.TI18N("购买快速作战特权可增加每日快速作战次数（包含2次免费次数），是否前往购买？");
                    var fun = function () {
                        require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.PRIVILEGE)
                        this.controller.openDramBattleQuickView(false);
                    }.bind(this)
                    var cancel_fun = function () {
                        var CommonAlert = require("commonalert");
                        var str = cc.js.formatStr("今回の快速消費<img src='%s' scale=0.3 />x%s", Config.item_data.data_assets_label2id.gold, this.quick_battle_cost)
                        var res = PathTool.getItemRes(Config.item_data.data_assets_label2id.gold)
                        var fun = function () {
                            this.send13004();
                        }.bind(this)
                        CommonAlert.show(str, Utils.TI18N("确认"), fun, Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
                    }.bind(this)
                    CommonAlert.show(str, Utils.TI18N("确认"), fun, Utils.TI18N("取消"), cancel_fun, 2, null)
                    return
                }
                var CommonAlert = require("commonalert");
                var str = cc.js.formatStr("今回の快速消費<img src='%s' scale=0.3 />x%s", Config.item_data.data_assets_label2id.gold, this.quick_battle_cost)
                var res = PathTool.getItemRes(Config.item_data.data_assets_label2id.gold)
                var fun = function () {
                    this.send13004();
                }.bind(this)
                CommonAlert.show(str, Utils.TI18N("确认"), fun, Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
            } else if (this.quick_battle_status == 3) {       // 没有次数了,需要判断特权
                if (this.privilege_status == true) {
                    this.send13004()
                } else {
                    var CommonAlert = require("commonalert");
                    var str = Utils.TI18N("购买快速作战特权可增加每日快速作战次数（包含2次免费次数），是否前往购买？");
                    var fun = function () {
                        require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.PRIVILEGE)
                        this.controller.openDramBattleQuickView(false);
                    }.bind(this)
                    CommonAlert.show(str, Utils.TI18N("确认"), fun, Utils.TI18N("取消"), null, 2, null)
                }
            } else {
                this.send13004()
            }
        }.bind(this), 1);

        this.addGlobalEvent(DramaEvent.BattleDrama_Quick_Battle_Data, function (data) {
            this.updateData();
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.updateData();
        this.updateShowItems();
        this.updateShowDesc();
    },

    send13004: function () {
        var role_vo = RoleController.getInstance().getRoleVo();
        if (!role_vo) return
        var cur_energy = role_vo.energy;
        var max_energy = role_vo.energy_max;
        var qingbao_val = 0;
        var vip_add_per = 0;
        var hook_max_time = this.drama_model.hook_max_time || 120;
        var drama_data = this.drama_model.getDramaData() || {};
        var config = gdata("dungeon_data", "data_drama_dungeon_info", [drama_data.dun_id]);
        if (config && config.per_hook_items) {
            for (var i in config.per_hook_items) {
                var v = config.per_hook_items[i];
                if (v[0] == Config.item_data.data_assets_label2id.energy) {
                    qingbao_val = v[1] * hook_max_time * (1 + vip_add_per);
                }
            }
        }
        if (cur_energy + qingbao_val > max_energy) {
            var call_back = function () {
                this.controller.send13004();
            }.bind(this)

            var str = cc.js.formatStr(Utils.TI18N("注意:当前拥有<color=#249003>%s/%s</c>远航情报,快速作战后,远航情报溢出部分将会损失,是否继续？"), cur_energy, max_energy);
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, Utils.TI18N("确认"), call_back, Utils.TI18N("取消"), null, 2, null)
        } else {
            this.controller.send13004();
        }
    },

    // 次数和按钮显示
    updateData: function () {
        var quickdata = this.drama_model.getQuickData();
        if (!quickdata) return;
        this.quick_battle_status = 0;       // 当前特权次数状态
        this.quick_battle_cost = 0;         // 当前特权消耗
        // 优先处理按钮显示
        this.source_label.node.x = 0;
        if (quickdata.fast_combat_free_num > 0) {        // 免费就不做任何处理了.直接判断了
            this.source_label.string = Utils.TI18N("快速作战");
            this.source_icon.active = false;
            this.notice_label.string = Utils.TI18N("本次免费");
        } else {
            var combat_num = quickdata.fast_combat_max - quickdata.fast_combat_num;     // 剩余普通次数
            var privilege_num = Config.privilege_data.data_fast_combat_cost_length - quickdata.fast_combat_p_num;   // 剩余特权数量
            if (privilege_num > 0 && this.privilege_status) {
                this.notice_label.string = cc.js.formatStr("%s<color=#249003>%s+%s</color>%s", Utils.TI18N("今日剩余:"), combat_num, privilege_num, Utils.TI18N("次"));
            } else {
                this.notice_label.string = cc.js.formatStr("%s<color=#249003>%s</color>%s", Utils.TI18N("今日剩余:"), combat_num, Utils.TI18N("次"));
            }
            // 先判断普通次数,在判断是否是有特权,判断特权消耗
            var next_config = Config.dungeon_data.data_drama_quick_cost[quickdata.fast_combat_num + 1];
            var cost = 0
            if (next_config) {
                cost = next_config.cost;
                this.quick_battle_status = 2;
            } else {
                if (this.privilege_status) {        // 开了特权的
                    var privilege_config = Config.privilege_data.data_fast_combat_cost[quickdata.fast_combat_p_num + 1];
                    if (privilege_config) {
                        cost = privilege_config.cost;       // 下一次特权消耗
                        this.quick_battle_status = 2;
                    }
                    this.notice_label.string = cc.js.formatStr("%s<color=#249003>%s+%s</color>%s", Utils.TI18N("今日剩余:"), combat_num, privilege_num, Utils.TI18N("次"));
                }
            }
            this.quick_battle_cost = cost;
            if (cost == 0) {
                this.quick_battle_status = 3;   // 没有次数了
                this.source_icon.active = false;
                if (this.privilege_status) {
                    this.source_label.string = Utils.TI18N("快速作战");
                } else {
                    this.source_label.string = Utils.TI18N("提升免费次数");
                }
            } else {
                this.source_icon.active = true;
                if (!this.source_icon_status) {
                    this.source_icon_status = true
                    // 设置icon的图片
                    var icon_path = PathTool.getItemRes(3);
                    this.loadRes(icon_path, function (source_icon, res_object) {
                        source_icon.spriteFrame = res_object;
                    }.bind(this, this.source_icon_frame));
                }
                this.source_label.node.x = 16;
                this.source_label.string = cost + Utils.TI18N("快速战斗");
            }
        }
    },

    // 描述文字库
    updateShowDesc: function () {
        var tips_str = Utils.TI18N("快速作战可获得<color=#249003>120</color>分钟挂机收益。\n激活快速作战特权:每天免费<color=#249003>3</color>次，额外购买<color=#249003>11</color>次");
        if (this.privilege_status == true) {
            tips_str = tips_str + Utils.TI18N("<color=#249003>(特权已激活)</color>");
            this.btn_buy_quick.active = false;
        } else {
            tips_str = tips_str + Utils.TI18N("<color=#c92606>(特权未激活)</color>");
            this.btn_buy_quick.active = true;
        }
        this.desc.string = tips_str;
    },

    // 增加物品展示
    updateShowItems: function () {
        var data = this.drama_model.getDramaData();
        if (!data) return;
        var drama_config = Config.dungeon_data.data_drama_dungeon_info[data.max_dun_id];
        if (!drama_config) return;

        var item_list = [];
        for (let index = 0; index < drama_config.quick_show_items.length; index++) {
            const element = drama_config.quick_show_items[index];
            item_list.push({ bid: element[0], num: element[1] });
        }
        this.item_scrollview.setData(item_list);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe();
        }
        this.item_scrollview = null;
        this.controller.openDramBattleQuickView(false);
        gcore.GlobalEvent.fire(BattleEvent.CLOSE_RESULT_VIEW)
    },
})
