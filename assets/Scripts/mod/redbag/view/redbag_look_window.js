// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-06-27 09:41:07
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var RoleController = require("role_controller");
var RedbagEvent = require("redbag_event");
var TimeTool = require("timetool");
var RedBagLookItem = require("redbag_look_item");
var CommonScrollView = require("common_scrollview");

var Redbag_lookWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_look");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("redbag_controller").getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.main_panel = this.seekChild("main_panel");
        this.size = this.main_panel.getContentSize();

        this.close_btn = this.seekChild("close_btn");
        this.label_panel = this.seekChild("label_panel");

        this.title_lb = this.seekChild(this.label_panel, "title", cc.Label);

        this.bg_sp = this.seekChild("bg", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_42"), function (sp) {
            this.bg_sp.spriteFrame = sp;
        }.bind(this))


        this.head_icon = new PlayerHead();
        this.head_icon.show();
        this.head_icon.setParent(this.main_panel);
        this.head_icon.setPosition(0,250);
        this.head_icon.setScale(0.9);
        this.head_icon.addCallBack(function () {
            var roleVo = RoleController.getInstance().getRoleVo();
            if (roleVo.rid == this.data.rid && roleVo.srv_id == this.data.srv_id)
                return
            require("chat_controller").getInstance().openFriendInfo(this.data)
        }.bind(this))

        this.status_bg_nd = this.seekChild("status_bg");
        this.status_bg_nd.active = false;

        this.desc_label_rt = this.seekChild("desc_label", cc.RichText);
        this.role_name_rt = this.seekChild("role_name", cc.RichText);

        this.less_num_lb = this.seekChild("less_num", cc.Label);
        this.less_time_lb = this.seekChild("less_time", cc.Label);

        if(this.event_data){
            this.updateMessage(event_data);
            this.updateMemberList(event_data);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLookWindow(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openLookWindow(false);
        }.bind(this), 2)

        this.addGlobalEvent(RedbagEvent.Get_List_Event, function (data) {
            if(this.root_wnd == null){
                this.event_data = data;
                return
            }
            this.updateMessage(data);
            this.updateMemberList(data);
        }, this)
    },

    updateMessage: function (data) {
        if (!data) return
        if (!this.data) return
        this.status_bg_nd.active = false;
        this.list_data = data;
        this.head_icon.setHeadRes(data.face_id);
        this.head_icon.setFrameRes(data.avatar_bid);

        var config = Config.guild_data.data_guild_red_bag[this.data.type];
        if (!config) return
        this.red_config = config;
        this.title_lb.string = config.name;
        var name = data.name || "";
        this.role_name_rt.string = cc.js.formatStr(Utils.TI18N("<color=#ffea96>%s</c>的红包"), name);

        var config = Config.guild_data.data_guild_red_bag[data.type];
        if (config) {
            this.desc_label_rt.string = config.msg;
        }

        if (this.data.num >= this.data.max_num) {
            this.status_bg_nd.active = true;
        }

        this.less_num_lb.string = cc.js.formatStr(Utils.TI18N("剩余个数：%s/%s"), this.data.max_num - this.data.num, this.data.max_num);
        if (this.less_timer) {
            gcore.Timer.del(this.less_timer);
            this.less_timer = null;
        }
        var less_time = this.data.time || 0;
        if (less_time - gcore.SmartSocket.getTime() <= 0) {
            this.less_time_lb.string = Utils.TI18N("剩余时间：已过期")
            return
        }
        if (!this.less_timer) {
            this.less_timer = gcore.Timer.set(function () {
                this.less_time_lb.string = cc.js.formatStr(Utils.TI18N("剩余时间：%s"), TimeTool.getTimeFormatDay(less_time - gcore.SmartSocket.getTime()));
                less_time = less_time - 1;
            }.bind(this), 1000, -1)
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        this.data = data
        this.ctrl.sender13540(this.data.id);
    },

    updateMemberList: function (data) {
        if (!this.list_view) {
            var scroll_view_size = cc.size(450, 400);
            var setting = {
                item_class: RedBagLookItem,      // 单元类
                start_x: 1,                    // 第一个单元的X起点
                space_x: 2,                    // x方向的间隔
                start_y: 10,                    // 第一个单元的Y起点
                space_y: 3,                   // y方向的间隔
                item_width: 455,               // 单元的尺寸width
                item_height: 93,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 1,                        // 列数，作用于垂直滚动类型
                need_dynamic: true
            }
            this.list_view = new CommonScrollView()
            this.list_view.createScroll(this.main_panel, cc.v2(0,-100), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
        }

        var list = data.list || [];
        list.sort(Utils.tableUpperSorter(["val","time"]));
        for(var i in list){
            list[i].index = i;
        }
        this.list_view.setData(list,null,this.red_config);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openLookWindow(false);
        if (this.list_view) {
            this.list_view.deleteMe();
            this.list_view = null;
        }
        if (this.head_icon) {
            this.head_icon.deleteMe();
            this.head_icon = null;
        }
        if (this.less_timer) {
            gcore.Timer.del(this.less_timer);
            this.less_timer = null;
        }
    },
})