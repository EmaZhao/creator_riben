// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-21 19:40:01
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackConst = require("backpack_const");

var TipsSourceWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.prefabPath = PathTool.getPrefabPath("backpack", "item_source_view");
        this.viewTag = SCENE_TAG.msg; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.source_items = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {},

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.item_config = params.data; //Utils.getItemConfig(params.data);
        this.need_list = params.item_list;
        if (!this.item_config) return

        this.initWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        if (this.back_item) {
            this.back_item.deleteMe();
        }
        this.back_item = null;

        if (this.source_items) {
            for (var i in this.source_items) {
                this.source_items[i].deleteMe();
            }
        }

        this.source_items = [];
        this.ctrl.openTipsSource(false);
    },

    initWidgets: function() {
        this.background = this.root_wnd.getChildByName("bg").getChildByName("background").getChildByName("background");
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.root_wnd.getChildByName("bg").setContentSize(2200,1280);
        }
        this.title_label_lb = this.seekChild("title_label", cc.Label);
        this.close_btn_nd = this.seekChild("close_btn");

        this.items_content_nd = this.seekChild("items_content");
        this.item_conten_nd = this.seekChild("item_conten");
        this.item_name_nd = this.seekChild("item_name");
        this.item_name_lb = this.item_name_nd.getComponent(cc.Label);
        this.item_own_nd = this.seekChild("own_num");
        this.item_own_lb = this.seekChild("own_num", cc.Label);
        this.item_dec_rt = this.seekChild("item_dec", cc.RichText);

        this.item_own_nd.active = false;

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didCloseBtn, this);
        this.background.on(cc.Node.EventType.TOUCH_END, this.didCloseBtn, this);

        this.updateWidgets();
        this.createBackPackItem();
        this.createSourceList();
    },

    updateWidgets: function() {
        var config;
        if (this.item_config.config) {
            config = this.item_config.config;
        } else {
            config = this.item_config;
        }
        if (config == null) return;
        this.item_bid = config.id;
        this.title_label_lb.string = Utils.TI18N("获取途径");
        this.item_name_lb.string = config.name;

        var name_color = BackpackConst.quality_color(config.quality);
        var item_name_color = this.item_name_nd.color;

        item_name_color.fromHEX(name_color);
        this.item_name_nd.color = item_name_color;
        this.item_dec_rt.string = StringUtil.parse(config.desc);

        var num = this.model.getItemNumByBid(this.item_bid);
        num = Utils.getMoneyString(num);
        var have_str = cc.js.formatStr(Utils.TI18N("拥有%s个"), num);
        this.item_own_nd.active = true;
        this.item_own_lb.string = have_str;
    },

    createBackPackItem: function() {
        this.back_item = ItemsPool.getInstance().getItem("backpack_item");
        this.back_item.setParent(this.item_conten_nd);
        this.back_item.show();
        this.back_item.setData(this.item_config);
    },

    // 创建来源列表
    createSourceList: function() {
        if (!this.item_config) return;
        var config;
        if (this.item_config.config) {
            config = this.item_config.config;
        } else {
            config = this.item_config;
        }
        if (!config) return;

        if(this.items_content_nd.children.length>0){
          return;
        }

        var source_list = config.source;
        if (source_list && Utils.next(source_list) != null) {
            var list = [];
            for (var i in source_list) {
                var data = Config.source_data.data_source_data[source_list[i][0]];
                if (data && data.evt_type != "evt_league_help") { //帮内求助特殊处理下 只出现在特定场合 
                    list.push(source_list[i]);
                } else {
                    if (this.extend_data && Utils.next(this.extend_data) != null) {
                        if (this.extend_data[0] == "evt_league_help" && this.extend_data[1]) {
                            list.push(source_list[i]);
                        }
                    }
                }
            }

            var max_height = Math.max(this.items_content_nd.height, 115 * list.length);
            this.items_content_nd.height = max_height;

            var final_list = [];
            for (var i in list) {
                var data = Config.source_data.data_source_data[list[i][0]];
                var source_info = this.getSourceInfo(data.lev_limit);
                list[i].id = data.id
                list[i].infon_data = data;
                list[i].is_lock = source_info.is_lock;
                list[i].des = source_info.des;
                list[i].index = i;
                final_list.push(list[i]);
            }



            final_list.sort(Utils.tableLowerSorter(["is_lock"]));
            if (final_list && Utils.next(final_list || {}) != null) {
                var SoureceItem = require("source_item");
                for (var i in final_list) {
                    var source_item = new SoureceItem(this.items_content_nd, config.id, this.need_list);
                    this.source_items.push(source_item);
                    source_item.setData(final_list[i]);
                }
            }
        }

    },

    getSourceInfo: function(data) {
        if (!data || !data[0]) return;
        var source_info = {};
        source_info.is_lock = true;
        source_info.des = "";

        switch (data[0]) {
            case "dungeon":
                { // 关卡等级
                    var BattleDramaController = require("battle_drama_controller");
                    var battle_drama_ctrl = BattleDramaController.getInstance();
                    var drama_data = battle_drama_ctrl.getModel().getDramaData();
                    if (drama_data && data[1]) {
                        if (drama_data.max_dun_id >= data[1]) {
                            source_info.is_lock = false;
                        }
                        var dungeon_cfg = Config.dungeon_data.data_drama_dungeon_info[data[1].toString()];
                        if (dungeon_cfg)
                            source_info.des = Utils.TI18N("通关") + dungeon_cfg.name + Utils.TI18N("解锁");
                    }
                }
                break;
            case "lev":
                { // 等级
                    var RoleController = require("role_controller")
                    var role_vo = RoleController.getInstance().getRoleVo()
                    if (role_vo && data[1]) {
                        if (role_vo.lev >= data[1]) {
                            source_info.is_lock = false;
                        }
                    }
                    source_info.des = data[1] + Utils.TI18N("级解锁");
                }
                break;
            case "guild":
                { // 公会等级
                    var GuildController = require("guild_controller");
                    var RoleController = require("role_controller")
                    var role_vo = RoleController.getInstance().getRoleVo()

                    if (role_vo && role_vo.gid && role_vo.gsrv_id) {
                        var guild_info = GuildController.getInstance().getModel().getMyGuildInfo();
                        if (guild_info && data[1]) {
                            if (guild_info.lev >= data[1]) {
                                source_info.is_lock = false;
                            } else {
                                source_info.des = Utils.TI18N("公会") + data[1] + Utils.TI18N("级解锁");
                            }
                        }
                    } else {
                        source_info.des = Utils.TI18N("尚未加入公会");
                    }
                }
                break;
        }

        return source_info
    },

    didCloseBtn: function() {
        this.ctrl.openTipsSource(false);
    },

})