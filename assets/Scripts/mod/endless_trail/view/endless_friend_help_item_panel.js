// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-05 21:06:56
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PartnerConst = require("partner_const");

var Endless_friend_help_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_friend_help_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.item_list = {};
        this.is_init = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var container = this.root_wnd.getChildByName("container");
        this.career_name = container.getChildByName("career_name").getComponent(cc.Label);
        this.career_icon = container.getChildByName("career_icon").getComponent(cc.Sprite);
    
        this.power_panel = container.getChildByName("power_panel");
        this.role_power = this.power_panel.getChildByName("role_power").getComponent(cc.Label);
        this.role_name = container.getChildByName("role_name").getComponent(cc.Label);
        this.help_button = container.getChildByName("help_button");
        this.help_button_bg = this.help_button.getComponent(cc.Sprite);
        this.help_label = this.help_button.getChildByName("help_label").getComponent(cc.Label);
        this.help_label.string = Utils.TI18N("选择");
        this.help_label_line = this.help_button.getChildByName("help_label").getComponent(cc.LabelOutline);
        this.firend_label = container.getChildByName("firend_label").getComponent(cc.Label);
        this.firend_label.active = false;
        this.lock_panel = container.getChildByName("lock_panel");
        var limit_label = this.lock_panel.getChildByName("limit_label").getComponent(cc.Label);
        limit_label.string = Utils.TI18N("战力超出范围");
        this.lock_panel.active = false;
        
        this.hero_node = container.getChildByName("hero_node");

        this.hero_icon = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.hero_icon.setRootPosition(0,0)
        this.hero_icon.setParent(this.hero_node);
        this.hero_icon.show();
        if(this.data){
            this.updateInfo();
        }

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.help_button, function () {
            if(this.click_fun && this.data){
                if(this.data.select == true){
                    this.click_fun(this, this.data, this.index, false)
                }else{
                    this.click_fun(this, this.data, this.index, true)
                }
            }
        }.bind(this), 1);
    },

    setData:function(data){
        this.data = data;
        this.updateInfo();
    },

    updateInfo:function(){
        if(!this.root_wnd)return;
        if(this.data){
            this.type = this.data.type;
            this.info_data = this.data.info_data;
            this.index = this.data._index;
            this.hero_icon.setData(this.data);

            this.firend_label.string = Utils.TI18N("来自好友:")+this.data.name;
            this.role_power.string = this.data.power;
            this.firend_label.active = true;
            
            var config = Config.partner_data.data_partner_base[this.data.bid];
            if(config){
                this.role_name.string = config.name;
            }
            if(this.data.is_lock == true){
                this.lock_panel.active = true;
                this.help_button.active = false;
            }else{
                this.lock_panel.active = false;
                this.help_button.active = true;
            }
            // --[[if this.data.select == true and not this.is_init then
            //     this.click_fun(this, this.data, this.index,true,true)
            //     this.is_init = true
            // end--]]
            
            this.updateBtnStatus(this.data.select);
            var res = PathTool.getCommonIcomPath(cc.js.formatStr("common_%s",90045+this.info_data.type));
            this.loadRes(res, (function(resObject){
                this.career_icon.spriteFrame = resObject;
            }).bind(this));
            var str = PartnerConst.Hero_Type[this.info_data.type] || "";
            this.career_name.string = "["+str+"]";
        }
    },

    getData:function(  ){
        return this.data
    },

    addCallBack:function(click_fun){
        this.click_fun = click_fun;
    },

    updateBtnStatus:function(status){
        this.cur_status = status;
        if(status == true){
            var res = PathTool.getUIIconPath("newly_added","Btn_1_2");
            this.loadRes(res, (function(resObject){
                if(this.cur_status == true){
                    this.help_button_bg.spriteFrame = resObject;
                }
            }).bind(this));
            this.help_label.string = Utils.TI18N("取消选择");
            this.help_label_line.color = new cc.Color(0x6c,0x2b,0x00, 0xff);
        }else{
            var res = PathTool.getUIIconPath("newly_added","Btn_1_1");
            this.loadRes(res, (function(resObject){
                if(this.cur_status == false){
                    this.help_button_bg.spriteFrame = resObject;
                }
            }).bind(this));
    
            this.help_label.string = Utils.TI18N("选择");
            this.help_label_line.color = new cc.Color(0x2b,0x61,0x0d, 0xff);
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.hero_icon){
            this.hero_icon.deleteMe();
            this.hero_icon = null;
        }
        // self:removeAllChildren()
        // self:removeFromParent()
    },
})