// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-15 14:11:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");
var PlayerHead = require("playerhead");

var ArenaChampionTop322Panel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_top_32_2_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("container/guess_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("竞猜");
        this.container_nd = this.seekChild("container");
        this.guess_btn_nd = this.seekChild("guess_btn");
        this.head_container_nd = this.seekChild("head_container");
        this.guess_btn_nd.active = false;

        var head = this.champion_head = new PlayerHead();
        head.setPosition(0, 0);
        head.setParent(this.head_container_nd);
        head.show();

        this.pos_line_list = {};
        this.pos_line_list_2 = {};
        this.role_pos_list = {};
        this.role_name_list = {};
        this.check_bnt_list = {};

        for (var line_i = 1; line_i <= 6; line_i++) {
            var line_info = this.pos_line_list[line_i] = {};
            var line_node = this.seekChild(this.container_nd, "pos_line_" + line_i);
            line_info.normal_1 = line_node.getChildByName("normal_1");
            line_info.normal_2 = line_node.getChildByName("normal_2");
            line_info.select_1 = line_node.getChildByName("select_1");
            line_info.select_2 = line_node.getChildByName("select_2");
            if (line_info.select_1)
                line_info.select_1.active = false;
            if (line_info.select_2)
                line_info.select_2.active = false;

            var pos_info = this.role_pos_list[line_i] = {};
            var pos_nd = this.seekChild(this.container_nd, "role_pos_" + line_i);
            pos_info.normal = pos_nd.getChildByName("normal");
            pos_info.normal_sp = pos_info.normal.getComponent(cc.Sprite);
            pos_info.select = pos_nd.getChildByName("select");
            pos_info.select.active = false;

            var name_info = this.role_name_list[line_i] = {};
            name_info.name_nd = this.seekChild(this.container_nd, "role_name_" + line_i)
            name_info.name_lb = name_info.name_nd.getComponent(cc.Label);
            name_info.name_lb.string = "";

            // 查看按钮
            if (line_i % 2 === 1) {
                this.check_bnt_list[line_i] = this.seekChild(this.container_nd, "check_btn_" + line_i);
                this.check_bnt_list[line_i].index = line_i;
                this.check_bnt_list[line_i].active = false;
                this.check_bnt_list[line_i].on(cc.Node.EventType.TOUCH_END, this.onClickCheckBtn, this);
            }
        }

        for (var line_1 = 1; line_i <= 2; line_i++) {
            var index_1 = (i - 1) * 2 + 1;
            var index_2 = i * 2;
            var line_info = this.pos_line_list_2[index_1 + "_" + index_2] = {};
            var line_node = this.seekChild(this.container_nd, "pos_line_" + index_1 + "_" + index_2s);
            line_info.normal = line_node.getChildByName("normal");
            line_info.select = line_node.getChildByName("select");
        }

        this.guess_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickGuessBtn, this);

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateTop4InfoEvent, function(data) {
            if (data)
                this.updateTop4Info(data);
        }.bind(this));

        // 压注更新
        this.addGlobalEvent(ArenaEvent.UpdateTop324GuessGroupEvent, function(group, pos) {
            if (!group && pos) {
                this.updateGuessStatus(pos);
            } else {
                this.guess_btn_nd.active = false;
            }
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {

    },

    updateBaseInfo: function() {
        if (this.root_wnd)
            this.updateWidgets();
    },

    updateWidgets: function() {
        var base_info = this.base_info = this.model.getBaseInfo();
        var role_info = this.role_info = this.model.getRoleInfo();
        if (!base_info || !role_info) return;

        // if (base_info.flag !== 0)
        this.ctrl.sender20261();
    },


    updateTop4Info: function(pos_data) {
        var role_list = pos_data.pos_list;
        if (!role_list) return;

        for (var role_i in role_list) {
            var role_info = role_list[role_i];
            if (this.role_name_list[role_info.pos]) {
                var name_info = this.role_name_list[role_info.pos];
                var line_info = this.pos_line_list[role_info.pos];
                var pos_info = this.role_pos_list[role_info.pos];

                name_info.name_lb.string = role_info.name;

                var name_color = null; // 文字色
                var normal_status = null; // 底图是否置灰
                var is_select = false;
                var is_line = false;

                if (role_info.ret === 0) { // 未打
                    name_color = new cc.Color().fromHEX("#ffffff");
                    normal_status = cc.Sprite.State.NORMAL;
                } else if (role_info.ret === 1) { // 胜利
                    name_color = new cc.Color().fromHEX("#ffffff");
                    normal_status = cc.Sprite.State.NORMAL;
                    is_select = true;
                    is_line = true;
                } else { // 失败
                    name_color = new cc.Color(0x5b, 0x5b, 0x5b, 0xff);
                    normal_status = cc.Sprite.State.GRAY;
                }

                name_info.name_nd.color = name_color;
                pos_info.normal_sp.setState(normal_status);
                pos_info.select.active = is_select;

                if (line_info.select_1)
                    line_info.select_1.active = is_line;
                if (line_info.select_2)
                    line_info.select_2.active = is_line;

                // 公共line, 打过了就显示
                var check_index = 0;
                var public_index = 0;
                if (role_info.pos % 2 === 0) {
                    var check_index = role_info.pos - 1;
                    var public_index = check_index + "_" + role_info.pos;
                } else {
                    var check_index = role_info.pos;
                    var public_index = check_index + "_" + role_info.pos + 1;
                }

                var is_active = false;
                if (role_info.ret !== 0) {
                    is_active = true;
                }
                if (this.pos_line_list_2[public_index])
                    this.pos_line_list_2[public_index].select.active = is_active;

                // 查看btn
                this.check_bnt_list[check_index].active = is_active;
            }
        }

        if (role_list.length == 7) {
            this.champion_head.setHeadRes(role_list[0].face);
        } else {
            this.champion_head.clearHead();
        }

        this.ctrl.sender20262();
    },

    onClickCheckBtn: function(event) {
        gcore.GlobalEvent.fire(ArenaEvent.CheckFightInfoEvent, true, null, event.target.index)
    },

    updateGuessStatus: function(pos) {
        var check_bnt = this.check_bnt_list[pos];
        if (check_bnt) {
            this.guess_btn_nd.active = true;
            this.guess_btn_nd.position = check_bnt.position;
        }
    },

    onClickGuessBtn: function() {
        this.ctrl.updateChampionTab(2);
    }
})