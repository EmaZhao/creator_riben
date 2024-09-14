// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-22 16:20:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var VedioController = require("vedio_controller")
var VedioConst = require("vedio_const")
var VedioMainItem = require("vedio_item_panel")
var VedioEvent = require("vedio_event")
var RoleController = require("role_controller")
var ChatConst = require("chat_const")
var VedioMyselfWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vedio", "vedio_collect_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
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
        let main_container = self.root_wnd.getChildByName("main_container")
        self.main_container = main_container
        
        self.share_panel = self.root_wnd.getChildByName("share_panel")
        self.share_panel.active = false
        self.share_bg = self.share_panel.getChildByName("share_bg")
        self.btn_guild = self.share_bg.getChildByName("btn_guild")
        self.btn_world = self.share_bg.getChildByName("btn_world")
        self.btn_cross = self.share_bg.getChildByName("btn_cross")
        self.share_bg.getChildByName("guild_label").getComponent(cc.Label).string = Utils.TI18N("分享到公会频道");
        self.share_bg.getChildByName("world_label").getComponent(cc.Label).string = Utils.TI18N("分享到世界频道");
        // self.share_bg.getChildByName("cross_label"):setString(TI18N("分享到跨服频道"))

        let win_title = main_container.getChildByName("win_title")
        win_title.getComponent(cc.Label).string = Utils.TI18N("个人记录")

        self.num_txt = main_container.getChildByName("num_txt").getComponent(cc.Label)
        self.num_txt.fontSize = 22;
        self.num_txt.string = Utils.TI18N("记录自己前30条PVP挑战记录")
        self.no_vedio_image = main_container.getChildByName("no_vedio_image")
        self.no_vedio_image.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("暂无录像收藏");

        let vedio_list = main_container.getChildByName("vedio_list")
        let scroll_view_size = vedio_list.getContentSize()
        let setting = {
            item_class : VedioMainItem,      //-- 单元类
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 0,                    //-- x方向的间隔
            start_y : 0,                    //-- 第一个单元的Y起点
            space_y : 5,                   //-- y方向的间隔
            item_width : 620,               //-- 单元的尺寸width
            item_height : 374,              //-- 单元的尺寸height
            row : 0,                        //-- 行数，作用于水平滚动类型
            col : 1,                         //-- 列数，作用于垂直滚动类型
            need_dynamic : true
        }
        this.vedio_scrollview = new CommonScrollView();
        this.vedio_scrollview.createScroll(vedio_list, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            Utils.playButtonSound(2)
            this.ctrl.openVedioMyselfWindow(false)
        },this)
        this.btn_guild.on('click',function(){
            Utils.playButtonSound(1)
            if(RoleController.getInstance().getRoleVo().isHasGuild() == false){
                message(Utils.TI18N("您暂未加入公会"))
                return
            }
            if(this.replay_id){
                this.ctrl.requestShareVedio(this.replay_id, ChatConst.Channel.Gang, this.srv_id, this.combat_type)
                this._model.updateVedioData(null, this.replay_id, "share", this.share_num)
                let new_data = this.updateVedioDataById(this.replay_id, "share", this.share_num)
                gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
            }
            this.replay_id = null
            this.srv_id = null
            this.combat_type = null
            this.share_panel.active = false
        },this)
        this.btn_world.on("click",function(){
            Utils.playButtonSound(1)
            if(this.replay_id){
                this.ctrl.requestShareVedio(this.replay_id, ChatConst.Channel.World, this.srv_id, this.combat_type)
                this._model.updateVedioData(null, this.replay_id, "share", this.share_num)
                let new_data = this.updateVedioDataById(this.replay_id, "share", this.share_num)
                gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
            }
            this.replay_id = null
            this.srv_id = null
            this.combat_type = null
            this.share_panel.active = false
        },this)
        this.share_panel.on("touchend",function(){
            this.share_panel.active = false
        },this)
        this.addGlobalEvent(VedioEvent.UpdateMyselfVedioEvent, function ( data ){
            this.setData(data)
        }.bind(this))
        this.addGlobalEvent(VedioEvent.CollectSuccessVedioEvent, function ( id ){
            if(this.data){
                this._model.updateVedioData(null, id, "is_collect", 1)
                let new_data = this.updateVedioDataById(id, "is_collect", 1)
                gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.requestMyVedioByType(VedioConst.MyVedio_Type.Myself)
        gcore.GlobalEvent.fire(VedioEvent.OpenCollectViewEvent, true)
    },
    setData(data){
        var self = this
        if(!data || Utils.next(data) == null){
            self.no_vedio_image.active = true;
        }else{
            self.no_vedio_image.active = false
            self.data = data
            self.vedio_scrollview.setData(self.data,this._onClickShareBtn.bind(this),{is_myself : true})
        }
    },
    _onClickShareBtn( world_pos, replay_id, share_num, srv_id, combat_type ){
        var self = this
        self.replay_id = replay_id
        self.share_num = share_num
        self.srv_id = srv_id
        self.combat_type = combat_type
        let node_pos = self.share_panel.convertToNodeSpaceAR(world_pos)
        if(node_pos){
            self.share_bg.setPosition(cc.v2(node_pos.x-60, node_pos.y+45))
            self.share_panel.active = true;
        }
    },
    updateVedioDataById( id, key, val ){
        if(!this.data)  return;
        let vedio_data = {}
        for(let k=0;k<this.data.length;++k){
            let v = this.data[k]
            if(v.id == id){
                v[key] = val
                vedio_data = v
                break
            }
        }
        return vedio_data
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.vedio_scrollview){
            this.vedio_scrollview.DeleteMe()
            this.vedio_scrollview = null
        }
        gcore.GlobalEvent.fire(VedioEvent.OpenCollectViewEvent, false)
        this.ctrl.openVedioMyselfWindow(false)
    },
})