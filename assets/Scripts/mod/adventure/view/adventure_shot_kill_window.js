// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     冒险一击必杀界面
// <br/>Create: 2019-05-10 15:34:03
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var AdventureEvent = require("adventure_event");

var Adventure_shot_killWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_shot_kill_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.monster_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        Utils.getNodeCompByPath("container/choose_container/cancen_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("取消");
        Utils.getNodeCompByPath("container/choose_container/confirm_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("确定");
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var container = this.root_wnd.getChildByName("container");
    
        this.skill_name = container.getChildByName("skill_name").getComponent(cc.Label);
        this.skill_desc = container.getChildByName("skill_desc").getComponent(cc.Label);
        this.skill_num = container.getChildByName("skill_num").getComponent(cc.Label);
    
        this.empty_desc = container.getChildByName("empty_desc").getComponent(cc.Label);
        this.empty_desc.string = Utils.TI18N("暂无可击杀守卫");
    
        this.choose_container = container.getChildByName("choose_container");
        var choose_title = this.choose_container.getChildByName("choose_title").getComponent(cc.Label);
        choose_title.string = Utils.TI18N("请选择使用目标");
        this.total_width = this.choose_container.getContentSize().width;
    
        this.cancen_btn = this.choose_container.getChildByName("cancen_btn");
        this.confirm_btn = this.choose_container.getChildByName("confirm_btn");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAdventureShotKillWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.cancen_btn, function () {
            this.ctrl.openAdventureShotKillWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.confirm_btn, function () {
            if(this.select_object == null || this.select_object.data == null){
                message(Utils.TI18N("请选择击杀目标"));
                return;
            }
            if(this.config){
                this.ctrl.send20607(this.config.id, this.select_object.data.id) 
            }
        }.bind(this), 1);

        this.addGlobalEvent(AdventureEvent.UpdateShotKillInfo,function(list){
            this.updateMonsterList(list);
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.ctrl.send20611();
        if(data && data.config){
            this.config = data.config;
            this.skill_name.string = this.config.name;
            this.skill_desc.string = Utils.TI18N("效果：")+this.config.desc;
            
            var num = data.num || 0;
            var max_num = this.config.max_num;
            if(max_num && max_num > 0){
                var use_count = data.use_count || 0;
                this.skill_num.string = cc.js.formatStr(Utils.TI18N("本轮剩余使用数量：%d/%d"), (max_num-use_count), num);
            }else{
                this.skill_num.string = Utils.TI18N("剩余数量：")+num;
            }
        }
    },

    updateMonsterList:function(list){
        if(list == null || Utils.next(list) == null){
            this.choose_container.active = false;
            this.empty_desc.active = true;
        }else{
            this.choose_container.active = true;
            this.empty_desc.active = false;
            var count = list.length;
            var tmp_width = count * 120; // 总的个数需要的长度
            var start_x = ( this.total_width - tmp_width ) * 0.5;
            // /创建头像
            for(var i in list){
                this.createMonsterHead(list[i], i, start_x);
            }
        }
    },

    // ==============================--
    // desc:创建怪物头像
    // @data:
    // @index:
    // @return 
    // ==============================--
    createMonsterHead:function(data, index, start_x){
        if(data == null || data.evt_id == null)return;
        var evt_config = gdata("adventure_data","data_adventure_event",data.evt_id);
        if(evt_config == null || evt_config.res_id == null || evt_config.res_id[0] == null || evt_config.res_id[0][1] == null)return;
        if(this.monster_list[data.evt_id])return;
        var object = {};


        var container = new cc.Node();
        container.setContentSize(cc.size(120, 120))
        container.setAnchorPoint(0.5,0.5);
        container.setPosition(-this.choose_container.width/2+start_x + 60 + index * 120,-this.choose_container.height/2+ 142);
        Utils.onTouchEnd(container, function (data) {
            this.selectMonsterIcon(data.evt_id)
        }.bind(this,data), 1);
        this.choose_container.addChild(container);

        var head = new PlayerHead();      
        head.setPosition(0,0);
        head.setParent(container);
        head.show();
        head.setHeadRes(evt_config.face);

        var select = Utils.createImage(container, null, 0, 0, cc.v2(0.5, 0.5), false,2);
        this.loadRes(PathTool.getUIIconPath("adventurewindow","adventurewindow_15"), function (select,sf_obj) {
            select.spriteFrame = sf_obj;
        }.bind(this,select));

        var mark_icon = Utils.createImage(select.node, null, 0, 0, cc.v2(0.5, 0.5), false,3);
        this.loadRes(PathTool.getCommonIcomPath("common_1043"), function (mark_icon,sf_obj) {
            mark_icon.spriteFrame = sf_obj;
        }.bind(this,mark_icon));

        select.node.active = false;
        var event_path = PathTool.getUIIconPath("adventure/evt",evt_config.res_id[0][1]);
        var background = Utils.createImage(container, null, 0, 0, cc.v2(0.5, 0.5), false,4);
        this.loadRes(event_path, function (background,sf_obj) {
            background.spriteFrame = sf_obj;
        }.bind(this,background));

        object.container = container;
        object.head = head;
        object.select = select;
        object.data = data;
        this.monster_list[data.evt_id] = object;
    },


    selectMonsterIcon:function(evt_id){
        if(this.select_object && this.select_object.data && this.select_object.data.evt_id == evt_id)return;
        if(this.select_object){
            this.select_object.select.node.active = false;
            this.select_object = null;
        }
        this.select_object = this.monster_list[evt_id];
        if(this.select_object){
            this.select_object.select.node.active = true;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.monster_list){
            if(this.monster_list[i].head){
                this.monster_list[i].head.deleteMe();
            }
        }
        this.monster_list = null;

        this.ctrl.openAdventureShotKillWindow(false);
    },
})