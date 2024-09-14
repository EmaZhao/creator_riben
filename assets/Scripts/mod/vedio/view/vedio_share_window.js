// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-06-04 14:27:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VedioController = require("vedio_controller")
var RoleController = require("role_controller")
var ChatConst = require("chat_const")
var VedioConst = require("vedio_const")
var Vedio_shareWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vedio", "vedio_share_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = VedioController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
        self.share_panel = self.root_wnd.getChildByName("share_panel")
        self.share_bg = self.share_panel.getChildByName("share_bg")
        self.btn_guild = self.share_bg.getChildByName("btn_guild")
        self.btn_world = self.share_bg.getChildByName("btn_world")
        self.btn_cross = self.share_bg.getChildByName("btn_cross")
        self.share_bg.getChildByName("guild_label").getComponent(cc.Label).string = Utils.TI18N("分享到公会频道")
        self.share_bg.getChildByName("world_label").getComponent(cc.Label).string = Utils.TI18N("分享到世界频道")
        self.share_bg.getChildByName("cross_label").getComponent(cc.Label).string = Utils.TI18N("分享到跨服频道")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            Utils.playButtonSound(2)
            this.onClickCloseBtn()
        },this)
        this.btn_guild.on("touchend",this.onClickGuildBtn,this)
        this.btn_world.on("touchend",this.onClickWorldBtn,this)
    },
    onClickCloseBtn(){
        this.ctrl.openVedioSharePanel(false)
    },
    onClickGuildBtn(){
        Utils.playButtonSound(1)
        if(!this.replay_id) return
        if(RoleController.getInstance().getRoleVo().isHasGuild() == false){
            message(Utils.TI18N("您暂未加入公会"))
            return
        }
        this.ctrl.requestShareVedio(this.replay_id, ChatConst.Channel.Gang, this.srv_id, this.combat_type)
        if(this.callback){
            this.callback(VedioConst.Share_Btn_Type.eGuildBtn)
        }
        this.replay_id = null
        this.onClickCloseBtn()
    },
    onClickWorldBtn(){
        Utils.playButtonSound(1)
        if(!this.replay_id) return;
        this.ctrl.requestShareVedio(this.replay_id, ChatConst.Channel.World, this.srv_id, this.combat_type)
        if(this.callback){
            this.callback(VedioConst.Share_Btn_Type.eWorldBtn)
        }
        this.replay_id = null
        this.onClickCloseBtn()
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(!data || !data.replay_id)return
        this.replay_id = data.replay_id; 
        this.callback = data.callback;
        this.srv_id = data.srv_id;
        this.combat_type = data.combat_type;
        let world_pos = data.world_pos
        let node_pos = this.share_panel.convertToNodeSpaceAR(world_pos)
        if(node_pos){
            this.share_bg.setPosition(cc.v2(node_pos.x-60, node_pos.y+45))
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openVedioSharePanel(false)
    },
})