// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-06-04 17:26:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var ArenaController = require("arena_controller")
var ArenaLoopChallengeCheckWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_challenge_check_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl =  ArenaController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = []
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
        
        let container = self.root_wnd.getChildByName("container")
        self.close_btn = container.getChildByName("close_btn")

        self.scroll_view = container.getChildByName("scroll_view").getComponent(cc.ScrollView)
        self.scroll_size = self.scroll_view.node.getContentSize()

        self.challenge_btn = container.getChildByName("challenge_btn")
        self.challenge_btn_label = self.challenge_btn.getChildByName("label").getComponent(cc.Label)
        self.challenge_btn_label.string = Utils.TI18N("挑 战")

        self.role_name = container.getChildByName("role_name").getComponent(cc.Label)
        self.role_score = container.getChildByName("role_score").getComponent(cc.Label)
        self.score_title = container.getChildByName("score_title").getComponent(cc.Label)
        self.score_title.string = Utils.TI18N("竞技场积分：")

        this.role_head = new PlayerHead();
        this.role_head.setParent(container);
        this.role_head.show();
        this.role_head.setPosition(-218, 113)

        this.fight_label = container.getChildByName('power_img').getChildByName("num").getComponent("CusRichText")

        self.container = container
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            Utils.playButtonSound(2)
            this.ctrl.openCheckLoopChallengeRole(false)
        },this)
        this.close_btn.on("click",function(){
            Utils.playButtonSound(2)
            this.ctrl.openCheckLoopChallengeRole(false)
        },this)
        this.challenge_btn.on('click',function(){
            Utils.playButtonSound(1)
            if(this.data != null){
                this.ctrl.openCheckLoopChallengeRole(false)
                this.ctrl.sender20203(this.data.rid, this.data.srv_id)
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data
        var self = this
        if(this.data != null){
            self.role_name.string = self.data.name;
            self.fight_label.setNum(self.data.power);
            self.role_head.setHeadRes(self.data.face);
            self.role_head.setLev(self.data.lev);
            self.role_score.string = self.data.score;
        }
        self.setCheckRoleHero()
    },
    setCheckRoleHero(){
        var  self = this
        if(self.data == null || self.data.p_list == null) return 
        let p_list_size = self.data.p_list.length
        let total_width = p_list_size * 104 + (p_list_size - 1) * 6
        let start_x = ( self.scroll_size.width - total_width ) / 2 
        for(let i=0;i<self.data.p_list.length;++i){
            let v = self.data.p_list[i]
            Utils.delayRun(self.container, i/40, function(){
                let partner_item =  ItemsPool.getInstance().getItem("hero_exhibition_item")
                partner_item.setRootScale(0.8)
                partner_item.show()
                let x = start_x+104*0.5+(i)*(104+6) 
                partner_item.setPosition(x, self.scroll_size.height*0.5)
                partner_item.setData(v)
                partner_item.addCallBack(function(){
                    if(self.data){
                        self.ctrl.requestRabotInfo(self.data.rid, self.data.srv_id, v.pos)
                    }
                })
                partner_item.setParent(self.scroll_view.content);
                self.item_list.push(partner_item)
            }.bind(this))
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.role_head){
            this.role_head.deleteMe()
        }
        if(this.item_list){
            for(let i=0;i<this.item_list.length;++i){
                this.item_list[i].deleteMe()
                this.item_list[i] = null;
            }
            this.item_list = null
        }
        this.ctrl.openCheckLoopChallengeRole(false)
    },
})