// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 14:22:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroexpeditController = require("heroexpedit_controller");

var Empoly_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("heroexpedit", "empoly_panel_item");
        this.ctrl = HeroexpeditController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");

        this.btn_enpoly = this.main_container.getChildByName("btn_enpoly");
        this.btn_enpoly.active = false;
        this.text_btn_enpoly = this.btn_enpoly.getChildByName("Text_1_0").getComponent(cc.Label);
        this.text_btn_enpoly.string = Utils.TI18N("选择");
        this.btn_config = this.main_container.getChildByName("btn_config");
        this.btn_config.active = false;
        var text_1= this.btn_config.getChildByName("Text_1").getComponent(cc.Label);
        text_1.string = Utils.TI18N("选择");
    
        this.text_name = this.main_container.getChildByName("text_name").getComponent(cc.Label);
        this.text_power = this.main_container.getChildByName("text_power").getComponent(cc.Label);
        this.text_firend = this.main_container.getChildByName("text_firend").getComponent(cc.Label);
        this.text_firend_label = this.main_container.getChildByName("text_power_0");
        this.text_firend_label.getComponent(cc.Label).string = Utils.TI18N("来自好友：")
        this.text_firend_label.active = false;
        this.text_firend.node.active = false;
    
        this.my_head = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.my_head.setRootScale(1);
        this.my_head.setRootPosition(cc.v2(-243,0));
        this.my_head.setParent(this.main_container);
        this.my_head.show();

        if(this.data){
            this.updateInfo();
        }
    },

    setExtendData:function(tab){
        this.number = tab.num || 0;
	    this.index = tab.index;
    },

    updateInfo:function(){
        if(!this.root_wnd || !this.data || Utils.next(this.data) == null)return;
        var index = this.data.index || 0;
        var isHelp = this.data.isHelp || false;
        if(index == null){
            index = 0;
        }
        if(this.index == 1){
            this.text_firend_label.active = true;
            this.text_firend.node.active = true;
        }else{
            this.text_firend_label.active = false;
            this.text_firend.node.active = false;
        }
        if(isHelp){
            this.btn_enpoly.active = true;
            var str = "";
            if(this.index == 1){
                str = Utils.TI18N("已借用");
            }else{
                str = Utils.TI18N("已派遣");
            }
            this.text_btn_enpoly.string = str;
		    this.btn_config.active = false;
        }else{
            this.btn_config.active = true;
            this.btn_enpoly.active = false;
        }
        this.text_firend.string = this.data.name;
        this.text_power.string = this.data.power;
        this.text_name.string = Config.partner_data.data_partner_base[this.data.bid].name;
	    this.my_head.setData(this.data);
    },

    setData:function(data){
        this.data = data;
        this.updateInfo();
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_config, function () {
            if(!this.data || Utils.next(this.data) == null)return;
            var call_back = function(){
                if(this.main_container){
                    if(this.data.rid && this.data.srv_id && this.data.id){
                        if(this.index == 1){
                            this.ctrl.sender24408(this.data.rid, this.data.srv_id, this.data.id)
                        }else{
                            this.ctrl.sender24407(this.data.id)
                        }
                    }
                }
            }.bind(this);
            var str = "";
            if(this.index == 1){
                str = Utils.TI18N("是否确认雇佣该英雄？");
            }else{
                str = Utils.TI18N("是否确认派遣该英雄？");
            }
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, Utils.TI18N("确定"), call_back, Utils.TI18N("取消"))
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if(this.data){
            this.updateInfo();
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.my_head){
            this.my_head.deleteMe();
            this.my_head = null;
        }
        // this:removeAllChildren()
        // this:removeFromParent()
    },
})