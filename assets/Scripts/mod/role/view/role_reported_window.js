// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-29 15:25:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller")
var RoleEvent = require("role_event")
var ChatConst = require("chat_const")
var Role_reportedWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_reported_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = RoleController.getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this;
        self.background = self.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.inputBox_eb = this.seekChild("EditBox",cc.EditBox)
        self.main_container = self.root_wnd.getChildByName("main_container");
        self.main_panel = self.main_container.getChildByName("main_panel");

        self.title = self.main_panel.getChildByName("win_title");
        self.title.getComponent("cc.Label").string = "举报";

        self.close_btn = self.main_panel.getChildByName("close_btn");


        self.key_reported = self.main_container.getChildByName("key_reported");
        self.key_reported.getComponent("cc.Label").string = "举报原因:";
        self.key_explain = self.main_container.getChildByName("key_explain");
        self.key_explain.getComponent("cc.Label").string = "附加说明:";
        self.key_evidence = self.main_container.getChildByName("key_evidence");
        self.key_evidence.getComponent("cc.Label").string = "举报证据:";
        self.key_evidence2 = self.main_container.getChildByName("key_evidence2");
        self.key_evidence2.getComponent("cc.Label").string = "勾选发言记录作为证据:";
        self.key_reported_name = self.main_container.getChildByName("key_reported_name");
        self.key_reported_name.getComponent("cc.Label").string = "被举报玩家:";

        self.reported_name = self.main_container.getChildByName("reported_name");
        let check_name_list ={
            [1] : Utils.TI18N("昵称不雅"),
            [2] : Utils.TI18N("骚扰谩骂"),
            [3] : Utils.TI18N("广告刷屏"),
            [4] : Utils.TI18N("色情暴力"),
            [5] : Utils.TI18N("反动证据"),
            [6] : Utils.TI18N("其他")
        }
        self.checkbox_list = {};
        for(let i=1;i<=6;++i){
            let checkbox = self.main_container.getChildByName("toggle").getChildByName("checkbox"+i);
            if(checkbox){ 
                let name = checkbox.getChildByName("name");
                if(check_name_list[i]){
                    name.getComponent("cc.Label").string = check_name_list[i];
                }
                self.checkbox_list[i] = checkbox;
            }
        }
        self.item_scrollview = self.main_container.getChildByName("item_scrollview");

        self.item_scrollview_size = self.item_scrollview.getContentSize();

        self.look_btn = self.main_container.getChildByName("look_btn");
        self.comfirm_btn = self.main_container.getChildByName("comfirm_btn");
        self.comfirm_btn.getChildByName("label").getComponent("cc.Label").string = Utils.TI18N("提 交");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            Utils.playButtonSound(2);
            this.onClickBtnClose();
        },this)
        this.look_btn.on('click',function(){
            Utils.playButtonSound(1);
            let config = Config.role_data.data_role_const.game_rule1;
            let p = this.look_btn.convertToWorldSpace(cc.v2(0,0));
            require("tips_controller").getInstance().showCommonTips(config.desc,p);
        },this)
        this.close_btn.on('click',function(){
            Utils.playButtonSound(2);
            this.onClickBtnClose();
        },this)
        this.comfirm_btn.on('click',this.onClickBtnComfirm,this)
        this.addGlobalEvent(RoleEvent.ROLE_REPORTED_EVENT, function(data){
            if(!data) return;;
            this.setData(data);
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        let rid = data.rid;
        let svr_id = data.srv_id;
        let play_name = data.play_name;
        if(!rid) return;
        if(!svr_id) return;
        if(!play_name) return ;
        var self = this;
        self.rid = rid;
        self.svr_id = svr_id;
        self.play_name = play_name;
        self.reported_name.getComponent(cc.Label).string = play_name;
        this.ctrl.send12771(rid, svr_id);
    },
    setData(data){
        var self = this
        self.data = data
        let channel_name = {
            [ChatConst.Channel.World] : Utils.TI18N("世界"),
            [2] : Utils.TI18N("公会"),
            [3] : Utils.TI18N("私聊"),
            [4] : Utils.TI18N("系统"),
            [ChatConst.Channel.Cross] : Utils.TI18N("跨服"),
            [6] : Utils.TI18N("同省")
        }
        this.data.history.sort(function(a,b){
            return a.id - b.id;
        })
        self.show_list = []
        for(let i=0;i<this.data.history.length;++i){
            let v = this.data.history[i];
            let channel_str;
            channel_str = channel_name[v.channel];
            if(channel_str == null){
                channel_str = Utils.TI18N("未知");
            }
            let msg = self.filterFace(v.msg);
          
            v.show_info = "["+channel_str+"] " + "<color=#249003>"+self.play_name+":</color> "+msg;
            if(msg.length > 0){
                self.show_list.push(v);
            }
        }
        self.updateList();
    },
    //过滤表情
    filterFace(msg){
        let len = msg.length;
        if(len == 0){
            return "";
        }
        let index1 = msg.indexOf("<");
        let index2 = msg.indexOf(">");
        if(index1 != -1 && index2 != -1 && (index1+32) == index2){
            msg = msg.slice(0, msg.indexOf("<img src='emoji")) + msg.slice(msg.indexOf(">")+1);
            return this.filterFace(msg);
        }
        return msg
    },
    updateList(){
        let path = PathTool.getPrefabPath("roleinfo","role_reported_item");
        for(let i=0;i<this.show_list.length;++i){
            let node = new cc.Node();
            node.setAnchorPoint(0.5,1);
            this.item_list.push(node);
            Utils.delayRun(this.item_scrollview,Number(i)/30,function(){
                this.item_scrollview.getChildByName("content").addChild(node);
                let item = node;
                this.loadRes(path,function(prefabPath){
                    let data = this.show_list[i];
                    let prefab = prefabPath;
                    item.addChild(prefab);
                    prefab.getChildByName("text").getComponent(cc.RichText).string = data.show_info;
                    prefab.height = prefab.getChildByName("text").height + 24;
                    item.setContentSize(prefab.getContentSize()) ;
                }.bind(this))
            }.bind(this))
        }

    },
    onClickBtnClose(){
        this.ctrl.openRoleReportedPanel(false);
    },
    onClickBtnComfirm(){
        var self = this;
        if(!self.data)return;
        let _type = 1
        for(let i in  self.checkbox_list){
            if(self.checkbox_list[i].getComponent(cc.Toggle).isChecked){
                _type = Number(i);
                break
            }
        }
        
        let msg = self.inputBox_eb.string || "";
        let history = [];
        if(self.item_list){
            for(let i=0;i<self.item_list.length;++i){
                let v = self.item_list[i].getChildByName("Layer").getChildByName("checkbox").getComponent(cc.Toggle);
                if(v.isChecked){
                    history.push({id : this.show_list[i].id});
                }
            }
        }
        this.ctrl.send12770(self.rid, self.svr_id, _type,  msg, history);
        self.onClickBtnClose();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openRoleReportedPanel(false);
    },
})