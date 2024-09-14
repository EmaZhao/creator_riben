// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-06-04 11:49:06
// --------------------------------------------------------------------
var VedioMainItem = require("vedio_item_panel")
var PathTool = require("pathtool");
var VedioController = require("vedio_controller")
var VedioConst = require("vedio_const")
var Vedio_lookWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vedio", "vedio_look_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = VedioController.getInstance()
        this._model = this.ctrl.getModel()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")

        self.main_container = self.root_wnd.getChildByName("main_container")
        self.main_panel = self.main_container.getChildByName("main_panel")

    
        self.title_lb = self.main_panel.getChildByName("win_title").getComponent(cc.Label)
        self.title_lb.string = Utils.TI18N("录像详情")

        self.cell = new VedioMainItem()
        self.cell.addCallBack(function(world_pos){
            self.onShowSharePanel(world_pos)
        })
        self.cell.addPlayCallBack(function(){
            self.onClickBtnClose()
        })
        self.cell.setPosition(0 , 0 )
        self.cell.setParent(self.main_panel)
        self.cell.show(true)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            this.ctrl.openVedioLookPanel(false)
            Utils.playButtonSound(2)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.setData(data)
    },
    setData(data){
        this.data = data
        this.cell.setData(data)
    },
    onShowSharePanel(world_pos){
        if(!world_pos) return
        if(!this.data) return 
        this.ctrl.openVedioSharePanel(true, this.data.id, world_pos, function(share_btn_type){
            this.updateData(share_btn_type) 
        }.bind(this),this.data.a_srv_id, this.data.combat_type)
    },
    onClickBtnClose(){
        this.ctrl.openVedioLookPanel(false)
    },
    updateData(share_btn_type){
        if(!this.data)  return;
        if(share_btn_type == VedioConst.Share_Btn_Type.eGuildBtn){
            this.data.share = this.data.share + 1
        }else{
            // -- share_btn_type == VedioConst.Share_Btn_Type.eWorldBtn
            // -- 默认世界分享
            this.data.share = this.data.share + 1
        }
        this.cell.setData(this.data)
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.cell){
            this.cell.deleteMe()
            this.cell = null;
        }
        this.ctrl.openVedioLookPanel(false)
    },
})