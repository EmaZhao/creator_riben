// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-14 11:35:40
// --------------------------------------------------------------------
var GuildConst = require("guild_const");

var PathTool = require("pathtool");
var GuildinitWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_init_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.panel_list = {};
        this.tab_list = {};
        this.normal_color = new cc.Color(0xd3, 0xb4, 0x9b, 0xff)
        this.normal_outlinecolor = new cc.Color(0x40, 0x22, 0x15, 0xff)
        this.select_color = new cc.Color(0xff, 0xff, 0xff, 0xff)
        this.select_outlinecolor = new cc.Color(0x6d, 0x35, 0x07, 0xff)

        this.controller = require("guild_controller").getInstance()
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background_nd = this.seekChild("background");
        this.background_nd.scale   = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("bigbg_2"),function(res){
            this.background_nd.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))

        this.title_list = [Utils.TI18N("公会列表"), Utils.TI18N("创建公会"), Utils.TI18N("查找公会")]
        var tab_container = this.seekChild("tab_container")
        this.win_title = this.seekChild("win_title",cc.Label);
        this.container = this.seekChild("container");
        for (let index = 0; index < 3; index++) {
            var object = {}
            var new_index = index + 1
            object.btn = tab_container.getChildByName("tab_btn_" + new_index)               //获取主节点
            object.normal = object.btn.getChildByName("unselect_bg")                        //普通状态
            object.select = object.btn.getChildByName("select_bg")                          //选中状态
            object.title = object.btn.getChildByName("title").getComponent(cc.Label)        //label对象
            object.title_outline = object.title.getComponent(cc.LabelOutline)       //描边
            object.title.string = this.title_list[index]
            object.index = new_index
            this.tab_list[new_index] = object;
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        for(var key in this.tab_list){
            const element = this.tab_list[key]
            if (element.btn) {
                element.btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
                    this.changeTabView(element.index)
                }).bind(this))
            }
        }

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        var index = params || 1
        this.changeTabView(index)
    },

    /**
     * 切换标签页
     * @param {*} index 
     */
    changeTabView:function(index){
        if(this.cur_index == index) {
            return;
        }
        if (this.cur_tab){
            this.cur_tab.select.active = false
            this.cur_tab.title.node.color = this.normal_color
            //this.cur_tab.title_outline.color = this.normal_outlinecolor
        }
        this.cur_index = index
        this.cur_tab = this.tab_list[index]
        if (this.cur_tab) {
            this.cur_tab.select.active = true
            this.cur_tab.title.node.color = this.select_color
            //this.cur_tab.title_outline.color = this.select_outlinecolor
        }
        this.setPanelData()
    },

    // 设置标签
    setPanelData:function(){
        if(this.cur_index == null) {
            return;
        }
        this.win_title.string = this.title_list[this.cur_index-1];

        if(this.cur_panel != null){
            this.cur_panel.addToParent(false);
            this.cur_panel = null;
        }
        var index = this.cur_index;
        var cur_panel = this.panel_list[index];
        if(cur_panel == null){
            if (index == GuildConst.init_type.create){
                var GuildCreatePanel = require("guild_create_panel");
                cur_panel = new GuildCreatePanel();
            }else if(index == GuildConst.init_type.list){
                var GuildListPanel = require("guild_list_panel");
                cur_panel = new GuildListPanel();
            }else if (index == GuildConst.init_type.search){
                var GuildSearchPanel = require("guild_search_panel");
                cur_panel = new GuildSearchPanel();
            }
            this.panel_list[index] = cur_panel;
            cur_panel.show();
            if(cur_panel != null)
                cur_panel.setParent(this.container);
        }

        if(cur_panel != null){
            cur_panel.addToParent(true);
            this.cur_panel = cur_panel;
            // this.cur_index = index;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.controller.openGuildInitWindow(false)
        for (var k in this.panel_list){
            var panel = this.panel_list[k];
            panel.deleteMe();
            panel = null;
        }
        this.panel_list = null;
    },
})
