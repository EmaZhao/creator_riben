// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 11:42:49
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var BattleController = require("battle_controller");

var ArenaChampionTop32Panel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_vs_panel");

    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        this.check_btn_nd = this.seekChild("check_btn");
        this.look_btn_nd = this.seekChild("look_btn");
        this.vs_img_nd = this.seekChild("vs_img");

        this.fight_forms = {};
        for (var fight_i = 1; fight_i <= 2; fight_i++) {
            var fight_form = this.fight_forms[fight_i] = {};
            var role_container_nd = this.seekChild("role_container_" + fight_i);
            fight_form["role_name_lb"] = this.seekChild(role_container_nd, "role_name", cc.Label);
            fight_form["role_lev_lb"] = this.seekChild(role_container_nd, "role_lev", cc.Label);
            fight_form["form_icon_sp"] = this.seekChild(role_container_nd, "form_icon", cc.Sprite);
            fight_form["success_img_nd"] = this.seekChild(role_container_nd, "success_img");

            var rank_txt_nd = this.seekChild(role_container_nd, "power_val");
            fight_form["power_cr"] = rank_txt_nd.getComponent("CusRichText");

            fight_form["hero_items"] = {};
            fight_form["hero_nds"] = {};
            for (var form_i = 1; form_i <= 9; form_i++) {
                var hero_item_nd = this.seekChild(role_container_nd, "hero_iten_" + form_i);
                var hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
                hero_item.setParent(hero_item_nd);
                hero_item.show();
                fight_form["hero_items"][form_i] = hero_item;
                fight_form["hero_nds"][form_i] = hero_item_nd;
            }
            var head_nd = this.seekChild(role_container_nd, "head_con");
            fight_form["role_head"] = new PlayerHead();
            fight_form["role_head"].setParent(head_nd);
            fight_form["role_head"].show();
        }

        this.check_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCheckBtn, this);
        this.look_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLookBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateWiget();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        for (var form_i in this.fight_forms) {
            var fight_infos = this.fight_forms[form_i];
            for (var hero_i in fight_infos["hero_items"]) {
                fight_infos["hero_items"][hero_i].deleteMe();
                fight_infos["hero_items"][hero_i] = null;
            }
            if (fight_infos.role_head) {
                fight_infos.role_head.deleteMe()
                fight_infos.role_head = null
            }
            fight_infos = null;
        }
    },

    // 主界面基础信息更新
    updateFightInfo: function(fight_info) {
        if (!fight_info) return;
        this.fight_info = fight_info;
        if (this.root_wnd)
            this.updateWiget();
    },

    updateWiget: function() {
        var fight_info = this.fight_info;
        if (!fight_info) return;

        // 敌我阵容相关
        for (var form_i in this.fight_forms) {
            var info_index = "a_";
            if (form_i == 2)
                info_index = "b_";

            var fight_form = this.fight_forms[form_i];
            // hero_tiem初始化
            for (var hero_i in fight_form["hero_items"]) {
                fight_form["hero_items"][hero_i].setData(null);
                if (this.isFightPos(fight_info[info_index + "formation_type"], hero_i)) {
                    fight_form["hero_nds"][hero_i].opacity = 255;
                } else {
                    fight_form["hero_nds"][hero_i].opacity = 128;
                }
            }

            // 基础信息
            fight_form["role_name_lb"].string = fight_info[info_index + "name"];
            fight_form["role_lev_lb"].string = Utils.TI18N("Lv.") +fight_info[info_index + "lev"];
            var form_icon_path = PathTool.getUIIconPath("form", "form_icon_" + fight_info[info_index + "formation_type"]);
            this.loadRes(form_icon_path, function(form_sp, form_sf) {
                form_sp.spriteFrame = form_sf;
            }.bind(this, fight_form["form_icon_sp"]));

            // 英雄item
            var hero_list = fight_info[info_index + "plist"];
            for (var hero_i in hero_list) {
                var hero_info = hero_list[hero_i];
                var item_pos = this.getHeroItemPos(fight_info[info_index + "formation_type"], hero_info.pos);
                fight_form["hero_items"][item_pos].setData(hero_info);
                fight_form["hero_nds"][item_pos].opacity = 255;
            }

            // 头像
            fight_form["role_head"].setHeadRes(fight_info[info_index + "face"])
                // fight_form["role_head"].setLev(fight_info[info_index + "lev"]);

            // 战力
            fight_form["power_cr"].setNum(fight_info[info_index + "power"]);
        }

        // 0:未打 1:胜利 2:失败
        if (fight_info.ret == 0) {
            this.fight_forms[1]["success_img_nd"].active = false;
            this.fight_forms[2]["success_img_nd"].active = false;
            if (fight_info.replay_id === 0) {
                this.check_btn_nd.active = false;
                this.look_btn_nd.active = false;
                this.vs_img_nd.active = true;
            } else {
                this.check_btn_nd.active = false;
                this.look_btn_nd.active = true;
                this.vs_img_nd.active = false;
            }
        } else {
            this.check_btn_nd.active = true;
            this.look_btn_nd.active = false;
            this.vs_img_nd.active = false;

            if (fight_info.ret === 1) {
                this.fight_forms[1]["success_img_nd"].active = true;
                this.fight_forms[2]["success_img_nd"].active = false;
            } else {
                this.fight_forms[1]["success_img_nd"].active = false;
                this.fight_forms[2]["success_img_nd"].active = true;
            }
        }
    },

    getHeroItemPos: function(form_type, pos) {
        var formation_config = Config.formation_data.data_form_data[form_type];
        return formation_config.pos[pos - 1][1];
    },

    isFightPos: function(form_type, pos) {
        var formation_config = Config.formation_data.data_form_data[form_type];
        for (var pos_i in formation_config.pos) {
            if (formation_config.pos[pos_i][1] === pos) {
                return true;
            }
        }
        return false;
    },

    onClickCheckBtn: function() {
        var ArenaController = require("arena_controller");
        ArenaController.getInstance().openArenaChampionReportWindow(true, this.fight_info);
    },

    onClickLookBtn: function() {
        if (this.fight_info && this.fight_info.replay_id != 0) {
            BattleController.getInstance().csRecordBattle(this.fight_info.replay_id);
        }
    },
})