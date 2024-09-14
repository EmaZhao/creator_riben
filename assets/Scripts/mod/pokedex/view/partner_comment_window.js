// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-08 14:00:13
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PokedexController = require("pokedex_controller")
var PokedexEvent = require("pokedex_event")
var PokedexCommentItem = require("pokedex_comment_item")
var CommonScrollView = require("common_scrollview");
var Partner_commentWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("pokedex", "pokedex_comment");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = PokedexController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.main_panel = self.root_wnd.getChildByName("main_panel")

        // --喜欢按钮
        self.like_btn = self.main_panel.getChildByName("like_btn")
        self.send_btn = self.main_panel.getChildByName("send_btn")
        //喜欢人数
        self.like_num_lb = this.seekChild("like_num",cc.Label)
        //点评人数
        self.comment_num_lb =  this.seekChild("comment_lab",cc.Label)
        //输入框
        self.edit_box_eb = this.seekChild("edit_box",cc.EditBox)
        //名字
        self.hero_name_lb = this.seekChild("name_lab",cc.Label)
        
        self.close_btn_nd = this.seekChild("close_btn")

        Utils.getNodeCompByPath("common_window_2/main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("评论");
        Utils.getNodeCompByPath("main_panel/send_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("发送");
        Utils.getNodeCompByPath("main_panel/like_btn/title", this.root_wnd, cc.Label).string = Utils.TI18N("喜欢");
        Utils.getNodeCompByPath("main_panel/edit_box/PLACEHOLDER_LABEL", this.root_wnd, cc.Label).string = Utils.TI18N("请输入评论内容");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        var self = this
        // --请求整个评论列表
        if(!self.get_list_event){ 
            self.get_list_event= this.addGlobalEvent(PokedexEvent.Comment_List_Event,function(data){
                self.data = data
                self.updateCommentList()
            })
        }
        // --评论返回
        if (!self.comment_success_event){ 
            self.comment_success_event = this.addGlobalEvent(PokedexEvent.Comment_Say_Event,function(){
                self.ctrl.sender11041(self.hero_data.bid,1,100)
                self.edit_box_eb.string = ""
            })
        }
        // --点击喜欢返回
        if (!self.like_success_event){ 
            self.like_success_event= this.addGlobalEvent(PokedexEvent.Comment_Like_Event,function(){
                if (!self.data) return 
                let like_num = self.data.like_num || 0
                this.like_num_lb.string =  like_num + 1
                self.like_btn.active = false
            })
        }   
        // --点击点赞或踩返回
        if (!self.zan_success_event){ 
            self.zan_success_event= this.addGlobalEvent(PokedexEvent.Comment_Zan_Event,function(data){
                if (self.select_item){ 
                    self.select_item.updateCommentNum(data)
                }
                self.select_item = null
            })
        }   
        this.send_btn.on("touchend",function(){
            if(!this.hero_data)return
            Utils.playButtonSound(1)
            if(this.edit_box_eb.string.length<=0){
                message(Utils.TI18N("请输入评论内容"))
                return
            }
            self.ctrl.sender11043(self.hero_data.bid,this.edit_box_eb.string)
        },this)

        self.like_btn.on("touchend",function(){
            Utils.playButtonSound(3)
            if (self.data && self.data.like && self.data.like ==1){
                message(Utils.TI18N("你已设置为喜欢"))
                return
            }
            if(!self.hero_data)return
            self.ctrl.sender11042(self.hero_data.bid)
        },this)
        self.close_btn_nd.on("touchend",function(){
            Utils.playButtonSound(2)
            this.ctrl.openCommentWindow(false)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(!data)return
        this.hero_data = data || {}
        this.hero_name_lb.string = this.hero_data.name
        this.createHeroMessage()
        this.ctrl.sender11041(this.hero_data.bid,1,100)
    },
    createHeroMessage(){
        var self = this
        // --头像
        self.hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
        self.hero_item.setParent(self.main_panel)
        self.hero_item.setPosition(85,740)
        self.hero_item.setData(self.hero_data)
        self.hero_item.show()
    },
    updateCommentList(){
        var self = this
        if (!self.data ) return 
          
        let like_num = self.data.like_num || 0
        self.like_num_lb.string =  like_num
        if (self.data.partner_comments) {
            let num = self.data.partner_comments.length || 0
            self.comment_num_lb.string =  Utils.TI18N("评论数：") + num
        }

        let bool = true
        if (self.data.like && self.data.like == 1) { 
            bool = false
        }
        self.like_btn.active = bool

        if(this.list_view){
          this.list_view.setData(this.data.partner_comments);
          return;
        }
        let scroll_view_size = cc.size(620,560)
        let setting = {
            item_class : PokedexCommentItem,      //-- 单元类
            start_x : 4,                  //-- 第一个单元的X起点
            space_x : 0,                    //-- x方向的间隔
            start_y : 0,                    //-- 第一个单元的Y起点
            space_y : 5,                   //-- y方向的间隔
            item_width : 610,               //-- 单元的尺寸width
            item_height : 150,              //-- 单元的尺寸height
            row : 1,                        //-- 行数，作用于水平滚动类型
            col : 1,                         //-- 列数，作用于垂直滚动类型
            need_dynamic:true,
        }       
        self.list_view = new CommonScrollView()
        
        self.list_view.createScroll(self.main_panel,cc.v2(13, 95),ScrollViewDir.vertical,ScrollViewStartPos.top,scroll_view_size,setting)
        let list =self.data.partner_comments || []
        let callback = function(item,vo,index){
            if(vo && Utils.next(vo)){
                self.select_item = item
                let partner_id = self.hero_data.bid || 0
                let comment_id = vo.comment_id || 0
                self.ctrl.sender11044(partner_id,comment_id,index)
            }
        }
        self.list_view.setData(list, callback)
    },
    addCallBack(call_fun){
        this.call_fun =call_fun
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.call_fun){
            this.call_fun()
        }
        if (this.hero_item){
            this.hero_item.deleteMe();
        }
        this.ctrl.openCommentWindow(false)
    },
})