// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-26 11:37:15
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var LevupgradeController = require("levupgrade_controller")
var StoryEvent = require("story_event")
var LevupgradeWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("levupgrade", "lev_upgrade_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl =  LevupgradeController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.lev_list = []
        this.can_touch = false;
        this.auto_limit_time = 5;
        this.item_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this;
        self.background = self.root_wnd.getChildByName("background")

        self.main_container = self.root_wnd.getChildByName("main_container")
        self.back_panel = self.main_container.getChildByName("back_panel")
        self.title_container = self.main_container.getChildByName("title_container")
        self.play_effect = self.title_container.getChildByName("action").getComponent(sp.Skeleton)
        self.title_width = self.title_container.getContentSize().width
        self.title_height = self.title_container.getContentSize().height

        let item = self.main_container.getChildByName("item_1")
        if(item){
            let title = item.getChildByName("title")
            title.getComponent(cc.Label).string = Utils.TI18N("冒险者等级");
            let object = {}
            object.last_lev = item.getChildByName("last_lev")
            object.now_lev = item.getChildByName("now_lev")
            this.lev_list.push(object)
        }   

        // -- 升级奖励
        self.award_container = self.main_container.getChildByName("award_container")
        let award_title = self.award_container.getChildByName("award_title")
        award_title.getComponent(cc.Label).string = Utils.TI18N("升级奖励");

        // -- 扩展类的说明,不一定有
        self.extend_container = self.main_container.getChildByName("extend_container")
        self.extend_panel = self.extend_container.getChildByName("extend_panel")
        self.extend_icon = self.extend_panel.getChildByName("icon")
        self.extend_title = self.extend_panel.getChildByName("title")
        self.extend_desc = self.extend_panel.getChildByName("desc")
        self.extend_ext_desc = self.extend_panel.getChildByName("ext_desc")
        self.extend_panel.getChildByName("extend_title").getComponent(cc.Label).string = Utils.TI18N("功能预告");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on('touchend',function(){
            Utils.playButtonSound(2)
            if(this.can_touch  == true){
                this.onClickClose()
            }
        },this) 

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        var self = this;
        // self.root_wnd.getComponent(cc.Animation).play("lev_upgrade_window")
        Utils.playButtonSound("c_get") 
        self.handleEffect()
        self.starTimeTicket()
        let old_lev = data.old_lev || 0
        let lev = data.lev || 0
        let lev_config = Config.role_data.data_role_attr[lev]
        if(lev_config){
            // -- 角色等级
            let role_object = self.lev_list[0]
            role_object.last_lev.getComponent(cc.Label).string = old_lev;
            role_object.now_lev.getComponent(cc.Label).string = lev;

            self.award_data = []
            for(let i= old_lev+1;i<=lev;++i){
                let lev_cfg = Config.role_data.data_role_attr[i]
                if(lev_cfg && lev_cfg.reward){
                    for(let k=0;k<lev_cfg.reward.length;++k){
                        let v = lev_cfg.reward[k]
                        self.checkAddAwardData(v)
                    }
                }
            }
            self.setAwardInfo()
            self.setExtendInfo(lev_config)
        }
    },
    handleEffect(){
        var self = this;
        let effect_id = 274;
        if(self.play_effect ){ 
            let sketon_path = PathTool.getSpinePath(PathTool.getEffectRes(effect_id), "action");
            this.loadRes(sketon_path, function(skeleton_data){
                this.play_effect.skeletonData = skeleton_data;
                this.play_effect.setAnimation(0, "action2", false);           
            }.bind(this)); 
        }
        
    },
    starTimeTicket(){
        var self = this
        self.cut_time = 0
        if(self.time_ticket == null){
            self.time_ticket = gcore.Timer.set(function(){
                self.cut_time = self.cut_time + 0.5
                if (self.cut_time > 0.5){
                    self.can_touch = true
                }
                if(self.cut_time >= self.auto_limit_time){
                    gcore.Timer.del(this.time_ticket);
                    this.time_ticket = null;
                    self.onClickClose()
                }
            }.bind(this),500,-1)
        }
    },
    //将重复的奖励道具叠加显示
    checkAddAwardData(data){
        var self = this;
        self.award_data = self.award_data || []
        if(Utils.next(self.award_data) == null){
            self.award_data.push(data)
            return
        }
        for(let k=0;k<self.award_data.length;++k){
            let v = self.award_data[k]
            if(v[0] && data[0]){
                if(v[0] == data[0]){
                    v[1] = v[1] + data[1]
                }else{
                    self.award_data.push(data)
                }
            }
        }
    },
    // -- 升级奖励物品
    setAwardInfo( ){
        var self = this;
        if(self.award_data == null)  return;
        for(let k=0;k<self.item_list.length;++k){
            let v = self.item_list[k]
            v.setVisible(false)
        }
        if(self.award_data && Utils.next(self.award_data) != null){
            let space_x = 20
            let scale = 1
            let panel_size = self.award_container.getContentSize()
            let start_x = 0//panel_size.width/2 - (self.award_data.length-1)*(space_x/2+120*scale/2)
            for(let i=0;i<self.award_data.length;++i){
                let v = self.award_data[i]
                let item = self.item_list[i]
                if(item == null){
                    let bid = v[0]
                    let num = v[1]
                    item = ItemsPool.getInstance().getItem("backpack_item")
                    item.setParent(self.award_container);
                    item.setData({bid:bid, num:num})
                    self.item_list[i] = item
                }
                let pos_x = start_x + (i+1 -1)*(space_x+120*scale)
                item.show()
                item.setPosition(pos_x, panel_size.height/2-25)
            }
            self.award_container.active = true;
        }else{
            self.award_container.active = false;
        }
    },
    onClickClose(){
        this.ctrl.openMainWindow(false)
        ActionController.getInstance().checkOpenActionLimitGiftMainWindow()
    },
    setExtendInfo(config){
        if(config == null) return
        var self = this
        if(config.icon == ""){
            self.back_panel.setContentSize(cc.size(SCREEN_WIDTH, 349))
            let height = this.main_container.height - 349
            this.main_container.height -= height
            self.extend_container.active = false;
        }else{
            self.back_panel.setContentSize(cc.size(SCREEN_WIDTH, 519))
            let path_icon = PathTool.getUIIconPath("bigbg/battledrama", config.icon)
            this.loadRes(path_icon,function(res){
                self.extend_icon.getComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
            self.extend_title.getComponent(cc.Label).string = config.title;
            self.extend_desc.getComponent(cc.Label).string = config.desc;
            self.extend_ext_desc.getComponent(cc.Label).string = config.ext_desc;
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.play_effect.skeletonData = null;
        if(this.time_ticket){
            gcore.Timer.del(this.time_ticket);
            this.time_ticket = null;
        }
        for(let i=0;i<this.item_list.length;++i){
            this.item_list[i].deleteMe()
            this.item_list[i] = null
        }
        gcore.GlobalEvent.fire(StoryEvent.PREPARE_PLAY_PLOT)
        this.ctrl.openMainWindow(false)
    },
})