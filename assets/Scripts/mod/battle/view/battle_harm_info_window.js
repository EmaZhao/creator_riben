// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     战斗伤害统计面板
// <br/>Create: 2019-03-26 11:48:50
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleController = require("battle_controller");
var RoleController = require("role_controller");
var BattleHarmInfoItem = require("battle_harm_info_item");

var Dir_Type = {
    Left: 1,  // 左边英雄
    Right: 2  // 右边英雄
}

var battle_harm_infoWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_harm_info_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = BattleController.getInstance();
        this.tab_list = {}
        this.left_role_list = {}
        this.right_role_list = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        
        var container = this.seekChild("container");
        this.left_name_lb = this.seekChild(container, "left_name_label", cc.Label);
        this.right_name_lb = this.seekChild(container, "right_name_label", cc.Label);
        this.left_role_panel_nd = this.seekChild(container, "left_role_panel");
        this.right_role_panel_nd = this.seekChild(container, "right_role_panel");
        this.close_btn = this.seekChild(container, "close_btn");

        var tab_container = this.seekChild(container, "tab_container");
        for (var i = 1; i <= 2; i++) {
            var object = {};
            var tab_btn = tab_container.getChildByName("tab_btn_" + i);
            if (tab_btn) {
                var title = tab_btn.getChildByName("title").getComponent(cc.Label);
                object.tab_btn = tab_btn;
                object.label = title;
                object.index = i;
                this.tab_list[i] = object;
                if (i == 1) {
                    title.string = Utils.TI18N("伤害量");
                    this.tab_object = object;
                } else if (i == 2) {
                    title.string = Utils.TI18N("治疗量");
                }
            }
        }
        Utils.getNodeCompByPath("container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("确  定");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openBattleHarmInfoView(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openBattleHarmInfoView(false)
        }.bind(this), 2)
        var fun = function (object) {
            object.tab_btn.on("click", function () {
                this.changeSelectedTab(object.index);
                Utils.playButtonSound(1);
            }, this)
        }.bind(this)
        for (var k in this.tab_list) {
            var object = this.tab_list[k];
            if (object.tab_btn) {
                fun(object)
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        this.setData(data)
    },

    setData: function (data) {
        if (data && data.hurt_statistics) {
            this.data = data;
            //名称
            var role_vo = RoleController.getInstance().getRoleVo();
            var left_name = data.atk_name || role_vo.name;
            this.left_name_lb.string = left_name;
            this.right_name_lb.string = data.target_role_name || data.def_name || "";

            var left_hero_data = {};
            var right_hero_data = {};
            for (var k in data.hurt_statistics) {
                var v = data.hurt_statistics[k];
                if (v.type == 1) {
                    left_hero_data = v.partner_hurts;
                } else if (v.type == 2) {
                    right_hero_data = v.partner_hurts;
                }
            }

            var left_max_harm = 0;
            var left_max_cure = 0;
            for (var k in left_hero_data) {
                var v = left_hero_data[k];
                if (v.dps > left_max_harm) {
                    left_max_harm = v.dps;
                }
                if (v.cure > left_max_cure) {
                    left_max_cure = v.cure;
                }
            }

            var right_max_harm = 0;
            var right_max_cure = 0;
            for (var k in right_hero_data) {
                var v = right_hero_data[k];
                if (v.dps > right_max_harm) {
                    right_max_harm = v.dps;
                }
                if (v.cure > right_max_cure) {
                    right_max_cure = v.cure;
                }
            }


            for (var k in this.right_role_list) {
                this.right_role_list[k].setVisible(false);
            }
            for (var k in this.left_role_list) {
                this.left_role_list[k].setVisible(false);
            }

            //英雄列表
            var start_y = this.left_role_panel_nd.getContentSize().height;
            var space_y = 0;
            var fun = function (l_data, i) {
                Utils.delayRun(this.left_role_panel_nd, i * 4 / 60, function () {
                    var role_item = this.left_role_list[i];
                    if (role_item == null) {
                        role_item = new BattleHarmInfoItem(Dir_Type.Left, data.vedio_id);
                        this.left_role_list[i] = role_item;
                        role_item.setParent(this.left_role_panel_nd);
                        role_item.show();
                    }
                    role_item.setVisible(true);
                    role_item.setPosition(0, start_y - i * (99 + space_y) - 99);
                    role_item.setData(l_data, left_max_harm, left_max_cure);
                }.bind(this))
            }.bind(this)
            //左侧
            for (var i in left_hero_data) {
                fun(left_hero_data[i], i)
            }

            var fun_2 = function (r_data, i) {
                Utils.delayRun(this.right_role_panel_nd, i * 4 / 60, function () {
                    var role_item = this.right_role_list[i];
                    if (role_item == null) {
                        role_item = new BattleHarmInfoItem(Dir_Type.Right, data.vedio_id);
                        this.right_role_list[i] = role_item;
                        role_item.setParent(this.right_role_panel_nd);
                        role_item.show()
                    }
                    role_item.setVisible(true);
                    role_item.setPosition(0, start_y - i * (99 + space_y) - 99);
                    role_item.setData(r_data, right_max_harm, right_max_cure);
                }.bind(this))
            }.bind(this)
            //右侧
            for (var i in right_hero_data) {
                fun_2(right_hero_data[i], i)
            }
        }
    },

    changeSelectedTab: function (index) {
        if (this.tab_object && this.tab_object.index == index) return
        if (this.tab_object) {
            this.tab_object.tab_btn.getComponent(cc.Button).interactable = true;
            this.tab_object.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
        }
        this.tab_object = this.tab_list[index];
        if (this.tab_object) {
            this.tab_object.tab_btn.getComponent(cc.Button).interactable = false;
            this.tab_object.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
        }

        for (var i in this.left_role_list) {
            this.left_role_list[i].updateHarmType(index);
        }
        for (var i in this.right_role_list) {
            this.right_role_list[i].updateHarmType(index);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openBattleHarmInfoView(false);
        for (var k in this.left_role_list) {
            if (this.left_role_list[k]) {
                this.left_role_list[k].deleteMe();
                this.left_role_list[k] = null;
            }
        }
        for (var k in this.right_role_list) {
            if (this.right_role_list[k]) {
                this.right_role_list[k].deleteMe();
                this.right_role_list[k] = null;
            }
        }
    },
})