// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 17:24:16
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var DramaEvent = require("battle_drama_event");
var BattleDramaPassVedioItemPanel = require("battle_drama_pass_vedio_item_panel");
var BattleDramaPassVedioWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_vedio_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.controller = require("battle_drama_controller").getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.close_btn = this.seekChild("close_btn");                       // 关闭按钮
        this.list_panel = this.seekChild("item_container");             // 列表对象

        var scroll_view_size = cc.size(this.list_panel.width, this.list_panel.height)
        var setting = {
            item_class: BattleDramaPassVedioItemPanel,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 5,
            item_width: 600,
            item_height: 136,
            row: 1,
            col: 1,
            once_num: 1
        }
        this.item_scrollview = Utils.createClass("common_scrollview");
        this.item_scrollview.createScroll(this.list_panel, cc.v2(0, -2), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("container/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("通关录像");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.controller.openDramaPassVedioWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.controller.openDramaPassVedioWindow(false);
        }.bind(this), 2);

        // 录像更新
        this.addGlobalEvent(DramaEvent.UpdatePassVedioDataEvent, function(data_list){
            this.setData(data_list);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        var drama_data = this.controller.getModel().getDramaData();
        if (drama_data){
            this.controller.send13015(drama_data.dun_id);
        }
    },

    // 设置配置数据
    setData:function(data_list){
        var getVedioDataByType = function (pType){
            if (data_list){
                for (let index = 0; index < data_list.length; index++) {
                    const element = data_list[index];
                    if (element && element.type == pType){
                        return element;
                    }
                }
            }
            return null;
        }.bind(this);

        var vedio_data = [];
        for (let index = 0; index < 3; index++) {       // 通关记录类型(1:最少时间  2:最低战力 3:最近通关)
            var temp_data = getVedioDataByType(index + 1);
            if (!temp_data){
                temp_data = {}
                temp_data.type = (index + 1);
            }
            vedio_data.push(temp_data);
        }
        this.item_scrollview.setData(vedio_data);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.controller.openDramaPassVedioWindow(false);
    },
})
