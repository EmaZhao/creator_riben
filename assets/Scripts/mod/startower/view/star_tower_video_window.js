// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     竖版星命塔录像界面查看
// <br/>Create: 2019-02-27 20:06:53
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleController = require("battle_controller");
var RoleController = require("role_controller");
var PlayerHead = require("playerhead");
var TimeTool = require("timetool");


var Star_tower_videoWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_video");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        
        this.first_id = 0;
        this.next_id = 0;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.root_wnd.getChildByName("main_container");
    
        this.title_con = this.main_panel.getChildByName("title_con");
        this.title = this.title_con.getChildByName("title_label").getComponent(cc.Label);
        this.title.string = Utils.TI18N("录像");
    
        this.close_btn = this.main_panel.getChildByName("close_btn");

        this.info_con = this.main_panel.getChildByName("info_con");
        this.first_btn = this.info_con.getChildByName("btn1");
        var first_btn_lab = this.first_btn.getChildByName("Label").getComponent(cc.Label);
        first_btn_lab.string = Utils.TI18N("查看");
        

        this.two_btn = this.info_con.getChildByName("btn2");
        var two_btn_lab = this.two_btn.getChildByName("Label").getComponent(cc.Label);
        two_btn_lab.string = Utils.TI18N("查看");


        this.my_look = this.info_con.getChildByName("btn4");
        var my_look_lab = this.my_look.getChildByName("Label").getComponent(cc.Label);
        my_look_lab.string = Utils.TI18N("查看");
        
        this.share_btn = this.info_con.getChildByName("btn3");

        var title_1 =this.info_con.getChildByName("qian_title_1").getComponent(cc.Label);
        title_1.string = Utils.TI18N("最快");

        var title_2 =this.info_con.getChildByName("qian_title_2").getComponent(cc.Label);
        title_2.string = Utils.TI18N("最低");

        this.share_panel = this.main_panel.getChildByName("share_panel");
        this.share_panel.active = false;
        this.share_btn1 = this.share_panel.getChildByName("share_btn1");
        var share_btn1_lab = this.share_btn1.getChildByName("Label").getComponent(cc.Label);
        share_btn1_lab.string = Utils.TI18N("世界频道");

        this.share_btn2 = this.share_panel.getChildByName("share_btn2");
        var share_btn2_lab = this.share_btn2.getChildByName("Label").getComponent(cc.Label);
        share_btn2_lab.string = Utils.TI18N("公会频道");

        this.createDesc();
        this.updateInfo();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(2);
            this.ctrl.openVideoWindow(false);
        }, this)

        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(2);
            this.ctrl.openVideoWindow(false);
        }, this)

        this.first_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            if(this.first_id!=0){
                BattleController.getInstance().csRecordBattle(this.first_id);
            }
        }, this)

        this.two_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            if(this.next_id!=0){
                BattleController.getInstance().csRecordBattle(this.next_id);
            }
        }, this)

        this.two_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            if(this.next_id!=0){
                BattleController.getInstance().csRecordBattle(this.next_id);
            }
        }, this)

        this.my_look.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            if(this.data && this.data.m_replay_id && this.data.m_replay_id != 0){
                BattleController.getInstance().csRecordBattle(this.data.m_replay_id);
            }
        }, this)

        this.share_btn1.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            if(!this.data)return;
            this.ctrl.sender11333(this.data.m_replay_id,1,this.click_tower);
            this.showSharePanel(false);
        }, this)

        this.share_btn2.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            if(!this.data)return;
            this.ctrl.sender11333(this.data.m_replay_id,4,this.click_tower)
            this.showSharePanel(false)
        }, this)

        this.share_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            var is_visible = true;
            if(this.share_panel){
                is_visible = !this.share_panel.active;
            }
            this.showSharePanel(is_visible)
        }, this)
    },

    showSharePanel:function(bool){
        if(bool == false && !this.share_panel)return;
        this.share_panel.active = bool;
    },

    updateInfo:function(){
        if(!this.data || !this.main_panel)return;

        var str = cc.js.formatStr(Utils.TI18N("时间：%s"),TimeTool.getTimeFormat(this.data.my_time))
        this.my_time.string = str;

        var list =  this.data.tower_replay_data || {};
        for(var i in list){
            var v = list[i];
            if(v && v.type == 1){
                var str = cc.js.formatStr(Utils.TI18N("通关时间：%s"),TimeTool.getTimeFormat(v.time));
                this.fast_desc.string = str;
                this.top_name.string = v.name;
                this.top_head.setHeadRes(v.face_id);
                // -- this.top_head:setLev(v.lev)
                this.first_id = v.replay_id;
            }else{
                var str = cc.js.formatStr(Utils.TI18N("最低战力：%s"),v.power);
                this.power_desc.string =str;
                this.bottom_name.string =v.name;
                this.bottom_head.setHeadRes(v.face_id);
                this.next_id = v.replay_id;
                // -- this.bottom_head:setLev(v.lev)
            }
        }
        var rold_vo = RoleController.getInstance().getRoleVo();
        this.my_head.setHeadRes(rold_vo.face_id);
        if(this.data.m_replay_id != null && this.data.m_replay_id == 0){
            this.my_look.active = false;
            this.share_btn.active = false;
            this.my_time.string = Utils.TI18N("暂未通关");
        }
    },

    createDesc:function(){        
        this.top_head = new PlayerHead();      
        this.top_head.show();  
        this.top_head.setPosition(90,295);
        this.top_head.setParent(this.info_con);

        this.bottom_head = new PlayerHead();      
        this.bottom_head.show();  
        this.bottom_head.setPosition(90,175);
        this.bottom_head.setParent(this.info_con);

        this.my_head = new PlayerHead();  
        this.my_head.show();   
        this.my_head.setPosition(90,62);
        this.my_head.setParent(this.info_con);
        
        this.top_name = Utils.createLabel(24,new cc.Color(0xff,0xff,0xff,0xff),null,165,300,"",this.info_con,2,cc.v2(0,0));
        
        this.bottom_name = Utils.createLabel(24,new cc.Color(0xff,0xff,0xff,0xff),null,165,183,"",this.info_con,2,cc.v2(0,0));
        
        this.fast_desc = Utils.createRichLabel(24,new cc.Color(0xff,0x7d,0x48,0xff),cc.v2(0,1),cc.v2(165,290),30,300);
        this.fast_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.info_con.addChild(this.fast_desc.node);
        
        this.power_desc = Utils.createRichLabel(24,new cc.Color(0xff,0x7d,0x48,0xff),cc.v2(0,1),cc.v2(165,170),30,300);
        this.power_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.info_con.addChild(this.power_desc.node);

        
        this.my_name = Utils.createLabel(24,new cc.Color(0xff,0xff,0xff,0xff),null,165,60,"",this.info_con,2,cc.v2(0,0));
        this.my_name.string = Utils.TI18N("我的通关录像");

        
        this.my_time = Utils.createRichLabel(24,new cc.Color(0xff,0x7d,0x48,0xff),cc.v2(0,1),cc.v2(165,55),30,300);
        this.my_time.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.info_con.addChild(this.my_time.node);
        
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(infoArr){
        if(!infoArr)return;

        this.data = infoArr[0];
        this.click_tower = infoArr[1];
        this.updateInfo();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openVideoWindow(false);

        if(this.bottom_head){
            this.bottom_head.onDelete();
            this.bottom_head = null;
        }

        if(this.my_head){
            this.my_head.onDelete();
            this.my_head = null;
        }

        if(this.top_head){
            this.top_head.onDelete();
            this.top_head = null;
        }
    },
})