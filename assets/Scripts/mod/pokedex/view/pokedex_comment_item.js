// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-08 19:13:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Pokedex_comment_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("pokedex", "pokedex_comment_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this
        self.main_panel = self.root_wnd.getChildByName("main_panel")
        self.bg = self.main_panel.getChildByName("bg")
       
        // --热度图标
        self.hot_bg =self.main_panel.getChildByName("hot_bg") 
        self.hot_bg.active = false 

        // --点赞按钮 
        self.btn2 = self.main_panel.getChildByName("btn2") 
        self.likes_lb = self.btn2.getChildByName("title").getComponent(cc.Label)
        // self.btn2:setCascadeOpacityEnabled(true)
        self.btn2_select = self.btn2.getChildByName("bg_select")
        self.btn2_unselect = self.btn2.getChildByName("bg_unselect")
        self.btn2_select.active = false  
        self.btn2_unselect.active = true
 
        // --踩按钮
        self.btn1 = self.main_panel.getChildByName("btn1") 
        this.dislike_lb = self.btn1.getChildByName("title").getComponent(cc.Label)
        // self.btn1:setCascadeOpacityEnabled(true)
        self.btn1_select = self.btn1.getChildByName("bg_select")
        self.btn1_unselect = self.btn1.getChildByName("bg_unselect")
        self.btn1_select.active = false 
        self.btn1_unselect.active = true

        // --评论者名字
        self.goods_name_lb =  self.main_panel.getChildByName("name").getComponent(cc.Label)
        // --评论内容
        self.comment_lb = self.main_panel.getChildByName("comment_label").getComponent(cc.Label)
        if (this.data) {
            this.setData(this.data);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        var self = this
        self.btn1.on("touchend",function(){
            if (self.call_fun) { 
                self.call_fun(self,self.data,0)
            }
        },this)
        self.btn2.on("touchend",function(){
            if (self.call_fun) { 
                self.call_fun(self,self.data,1)
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setData(data){
        var self = this
        self.data = data
        if(!data || !this.root_wnd) return
        let name = data.name || ""
        self.goods_name_lb.string = name

        self.likes_lb.string = data.like_num 

        self.dislike_lb.string = data.no_like_num 

        let str = data.msg || ""
        self.comment_lb.string =  str

        if (data._index && data._index <=3){ 
            self.hot_bg.active = true
        }
        if (data.is_like == 0){ 
            self.btn1_unselect.active = false
            self.btn1_select.active = true
            self.btn2_unselect.active = true
            self.btn2_select.active = false
        }else if(data.is_like == 1){  
            self.btn2_unselect.active = false
            self.btn2_select.active = true
            self.btn1_unselect.active = true
            self.btn1_select.active = false
        }else{
            self.btn1_select.active = false
            self.btn1_unselect.active = true
            self.btn2_select.active = false
            self.btn2_unselect.active = true
        }    
        
    },
    updateCommentNum(vo){
        var self = this
        if (!vo) return
        if (!self.data) return
        let click_type = vo.type || 0 
        if (click_type == 0) { 
            self.data.is_like = 0
            let num = self.data.no_like_num
            self.dislike_lb.string = num+1
            // --setChildDarkShader(true,self.btn1)
            self.btn1_unselect.active = false
            self.btn1_select.active = true
            self.btn2_unselect.active = true
            self.btn2_select.active = false
        }else{
            self.data.is_like = 1
            let num = self.data.like_num
            self.likes_lb.string =  num+1
            // --setChildDarkShader(true,self.btn2)
            self.btn2_unselect.active = false
            self.btn2_select.active = true
            self.btn1_unselect.active = true
            self.btn1_select.active = false
        }
    },
    addCallBack(call_fun){
        this.call_fun =call_fun
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },
})