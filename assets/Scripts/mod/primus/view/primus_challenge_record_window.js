// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     星河神殿 挑战记录
// <br/>Create: 2019-03-16 10:26:22
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var PrimusChallengeRecordItem = require("primus_challenge_record_item_panel");

var Primus_challenge_recordWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("primus", "primus_challenge_record_panel");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var container = this.root_wnd.getChildByName("container");
        this.container = container;
    
        var win_title = container.getChildByName("win_title").getComponent(cc.Label);
        win_title.string = Utils.TI18N("挑战记录");
    
        this.close_btn = container.getChildByName("close_btn");
        this.no_vedio_image = container.getChildByName("no_vedio_image");
        this.loadRes(PathTool.getBigBg("bigbg_3"), (function(resObject){
            if(this.no_vedio_image){
                this.no_vedio_image.getComponent(cc.Sprite).spriteFrame = resObject;
            }
        }).bind(this));

        this.no_vedio_label = container.getChildByName("no_vedio_label");
        this.time_label = container.getChildByName("time_label");
        this.list_panel = container.getChildByName("list_panel");
    
    
        var bgSize = this.list_panel.getContentSize();
        var scroll_view_size = cc.size(bgSize.width, bgSize.height-8);
        var setting = {
            item_class : PrimusChallengeRecordItem,      // 单元类
            start_x : 0,                  // 第一个单元的X起点
            space_x : 0,                    // x方向的间隔
            start_y : 0,                    // 第一个单元的Y起点
            space_y : 0,                   // y方向的间隔
            item_width : 616,               // 单元的尺寸width
            item_height : 218,              // 单元的尺寸height
            row : 0,                        // 行数，作用于水平滚动类型
            col : 1,                         // 列数，作用于垂直滚动类型
            delay : 6
        }
    
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.list_panel, cc.v2(0,5) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openPrimusChallengeRecordPanel(false);
        }.bind(this), 1);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openPrimusChallengeRecordPanel(false);
        }.bind(this), 2);
    },

    setData:function( data ){
        data = data || {};
        //  防守列表
        if(data.list && Utils.next(data.list) != null){
            this.item_scrollview.setData(data.list);
            this.no_vedio_image.active = false;
            this.no_vedio_label.active = false;
        }else{
            this.no_vedio_image.active = true;
            this.no_vedio_label.active = true;
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        // 申请记录
        // -- controller:requestPositionDefendData(g_id, g_sid, pos)
        this.setData(data);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }

        this.ctrl.openPrimusChallengeRecordPanel(false);
    },
})