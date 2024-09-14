// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-15 14:10:50
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");
var ArenaConst = require("arena_const")
var ArenaChampionTop321Panel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_top_32_1_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.cur_page = 0;
        this.role_list = null;
        this.page_infos = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        Utils.getNodeCompByPath("pageview/view/page_content/page_item_conten_0/page_item/guess_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("竞猜");
        this.page_item_nd = this.seekChild("page_item");
        this.page_content_nd = this.seekChild("page_content");
        this.pageview_nd = this.seekChild("pageview");
        this.pageview_pg = this.seekChild("pageview", cc.PageView);
        this.left_btn = this.seekChild("left_btn", cc.Button)
        this.right_btn = this.seekChild("right_btn", cc.Button)
        var pagte_item_nds = this.pagte_item_nds = [];
        pagte_item_nds[0] = this.page_item_nd;
        for (var page_i = 1; page_i < 4; page_i++) {
            pagte_item_nds[page_i] = cc.instantiate(this.page_item_nd);
            var page_item_content = this.seekChild("page_item_conten_" + page_i);
            page_item_content.addChild(pagte_item_nds[page_i]);
        }

        this.pageview_nd.on("page-turning", this.onPageChanged, this);
        this.notice_label = new cc.Node().addComponent(cc.Label)
        this.root_wnd.addChild(this.notice_label.node)
        this.notice_label.fontSize = 22;
        this.notice_label.horizontalAlign = cc.macro.TextAlignment.CENTER;
        this.notice_label.verticalAlign = cc.macro.TextAlignment.CENTER;
        this.notice_label.lineHeight = 24
        this.notice_label.node.color = new cc.Color(0x3f, 0x32, 0x34)
        this.notice_label.node.setAnchorPoint(cc.v2(0.5, 0))
        this.notice_label.node.setPosition(0, this.root_wnd.height / 2)
        this.addTurnCallBack()
    },

    onPageChanged: function(event) {
        this.cur_page = event.getCurrentPageIndex();
        this.updatePageInfo();
        this.addTurnCallBack()
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateTop32InfoEvent, function(data) {
            if (data)
                this.updateTop32InfoList(data);
        }.bind(this));

        // 压注更新
        this.addGlobalEvent(ArenaEvent.UpdateTop324GuessGroupEvent, function(group, pos) {
            this.group = group;
            this.pos = pos;
            if (group && pos) {
                this.updateGuessStatus();
            } else {
                for (var page_i in this.page_infos) {
                    this.page_infos[page_i].guess_btn_nd.active = false;
                }
            }
        }.bind(this));
        this.left_btn.node.on("click", function() {
            this.pageview_pg.scrollToPage(this.cur_page - 1)
        }, this)
        this.right_btn.node.on("click", function() {
            this.pageview_pg.scrollToPage(this.cur_page + 1)
        }, this)
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

        this.ctrl.sender20260();
    },

    updateTop32InfoList: function(data) {
        if (data && data.list) {
            this.data = data;
            this.goup_list = data.list;
            if (this.root_wnd)
                this.updatePageInfo();
        }
        this.ctrl.sender20262();
    },

    updatePageInfo: function() {
        var page_info = this.page_infos[this.cur_page];
        if (!page_info) {
            page_info = this.page_infos[this.cur_page] = {};
            page_info.role_name_list = {};
            page_info.role_pos_list = {};
            page_info.pos_line_list = {};
            page_info.pos_line_list_2 = {};
            page_info.check_bnt_list = {};

            var apge_nd = this.pagte_item_nds[this.cur_page];
            page_info.guess_btn_nd = this.seekChild(apge_nd, "guess_btn");
            page_info.guess_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickGuessBtn, this);
            page_info.guess_btn_nd.active = false;

            // pos name
            for (var role_i = 1; role_i <= 14; role_i++) {
                // name
                var name_info = page_info.role_name_list[role_i] = {};
                name_info.name_nd = this.seekChild(apge_nd, "role_name_" + role_i)
                name_info.name_lb = name_info.name_nd.getComponent(cc.Label);
                name_info.name_lb.string = "";

                // pso
                var pos_info = page_info.role_pos_list[role_i] = {};
                var pos_nd = this.seekChild(apge_nd, "role_pos_" + role_i);
                pos_info.normal = pos_nd.getChildByName("normal");
                pos_info.normal_sp = pos_info.normal.getComponent(cc.Sprite);
                pos_info.select = pos_nd.getChildByName("select");
                pos_info.select.active = false;
            }

            // line_list  位置线
            for (var line_i = 1; line_i <= 12; line_i++) {
                var line_info = page_info.pos_line_list[line_i] = {};
                var line_node = this.seekChild(apge_nd, "pos_line_" + line_i);
                line_info.normal_1 = line_node.getChildByName("normal_1");
                line_info.normal_2 = line_node.getChildByName("normal_2");
                line_info.select_1 = line_node.getChildByName("select_1");
                line_info.select_2 = line_node.getChildByName("select_2");
                line_info.select_1.active = false;
                line_info.select_2.active = false;
                line_info.normal_1.active = true;
                line_info.normal_2.active = true;
            }

            // 公共线 查看按钮
            for (var line_i = 1; line_i <= 7; line_i++) {
                var index_1 = (line_i - 1) * 2 + 1;
                var index_2 = line_i * 2;
                var line2_info = page_info.pos_line_list_2[index_1 + "_" + index_2] = {};
                var line2_nd = this.seekChild(apge_nd, "pos_line_" + index_1 + "_" + index_2);
                line2_info.normal = line2_nd.getChildByName("normal");
                line2_info.select = line2_nd.getChildByName("select");
                line2_info.select.active = false;
                line2_info.normal.active = true;

                var check_btn_nd = this.seekChild(apge_nd, "check_btn_" + index_1);
                page_info.check_bnt_list[index_1] = check_btn_nd;
                check_btn_nd.index_1 = index_1;
                check_btn_nd.active = false;
                check_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCheckBtn, this);
            }
        }

        // page_info
        var role_list = this.role_list = this.goup_list[this.cur_page].pos_list;
        this.notice_label.string = ArenaConst.getGroup(this.goup_list[this.cur_page].group)
        for (var role_i in role_list) {
            var role_info = role_list[role_i];

            if (page_info.role_name_list[role_info.pos]) {

                var name_info = page_info.role_name_list[role_info.pos];
                var line_info = page_info.pos_line_list[role_info.pos];
                var pos_info = page_info.role_pos_list[role_info.pos];

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

                if (line_info && line_info.select_1)
                    line_info.select_1.active = is_line;
                if (line_info && line_info.select_2)
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
                if (page_info.pos_line_list_2[public_index])
                    page_info.pos_line_list_2[public_index].select.active = is_active;

                // 查看btn
                page_info.check_bnt_list[check_index].active = is_active;
            }


        }

        if (this.group && this.pos) {
            this.updateGuessStatus();
        }
    },

    onClickCheckBtn: function(event) {
        if (event.target.index_1) {
            gcore.GlobalEvent.fire(ArenaEvent.CheckFightInfoEvent, true, this.cur_page+1, event.target.index_1)
        }
    },

    updateGuessStatus: function() {
        var group = this.group;
        var pos = this.pos;
        if (group && pos && this.page_infos[group - 1]) {
            var page_info = this.page_infos[group - 1];
            var check_btn = page_info.check_bnt_list[pos];

            page_info.guess_btn_nd.active = true;
            page_info.guess_btn_nd.position = check_btn.position;
        }
    },

    // 点击了竞猜按钮
    onClickGuessBtn: function() {
        this.ctrl.updateChampionTab(2);
    },
    addTurnCallBack() {
        if (this.cur_page == 0) {
            this.left_btn.interactable = false;
            this.left_btn.enableAutoGrayEffect = true;
            this.right_btn.interactable = true;
            this.right_btn.enableAutoGrayEffect = false;
        } else if (this.cur_page == 3) {
            this.left_btn.interactable = true;
            this.left_btn.enableAutoGrayEffect = false;
            this.right_btn.interactable = false;
            this.right_btn.enableAutoGrayEffect = true;
        } else {
            this.left_btn.interactable = true;
            this.left_btn.enableAutoGrayEffect = false;
            this.right_btn.interactable = true;
            this.right_btn.enableAutoGrayEffect = false;
        }
    }
})