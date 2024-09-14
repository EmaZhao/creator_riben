// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-15 14:12:31
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Gift_select_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.width = 544;
        this.height = 128;
        
        this.index = arguments[0] || 1;
        this.is_break = false;
        this.old_lev = 0;
        this.attr_list ={};
        this.initPanel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.root_wnd = new cc.Node("gift_select_item");
        this.root_wnd.setAnchorPoint(0.5, 0);
        this.root_wnd.setContentSize(cc.size(this.width,this.height));

        this.bg = Utils.createImage(this.root_wnd, null, 0, this.height/2, cc.v2(0.5,0.5), true, 0, true);
        this.bg.node.setContentSize(cc.size(this.width,this.height));
        var res = PathTool.getCommonIcomPath("common_1029");
        this.loadRes(res, function(sf_obj){
            this.bg.spriteFrame  = sf_obj;
        }.bind(this));

        // 头像
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.goods_item.initConfig(false, 0.9, false, true);
        this.goods_item.setParent(this.root_wnd)
        this.goods_item.show();
        this.goods_item.setPosition(-205,65);

        // 名字
        this.goods_name = Utils.createLabel(24,new cc.Color(0x76,0x45,0x19,0xff),null,-112,this.height/2,"",this.root_wnd,0, cc.v2(0,0.5));
        this.registerEvent();
        if(this.vo){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.root_wnd, function () {
            if(!this.vo)return;
            if(this.call_fun){
                this.call_fun(this.index,this.vo);
            }
        }.bind(this), 1);
    },

    
    // [[
    //  @功能:设置数据
    //  @参数:
    //  @返回值:
    //  ]]
    setData:function( data){
        if(data == null)return;
        this.vo = data;
        this.updateInfo();
    },

    updateInfo:function(){
        if(!this.root_wnd)return;
        var config = Utils.getItemConfig(this.vo.base_id);
        if(!config)return;
        this.goods_item.setData(config);
        var name = config.name || "";
        var num = this.vo.quantity || 1;
        this.goods_name.string = name+"*"+num;
    },

    setSelected:function(bool){
        bool = bool || false;
        var res = PathTool.getCommonIcomPath("common_1029");
        if(bool == true){
            var res = PathTool.getCommonIcomPath("common_1020");
        }
        this.loadRes(res, function(sf_obj){
            this.bg.spriteFrame  = sf_obj;
        }.bind(this));
    },

    isHaveData:function(){
        if(this.vo){
            return true;
        }
        return false;
    },

    clickHandler:function(){
        if(this.call_fun){
            call_fun(this.vo);
        }
    },

    addCallBack:function( value ){
        this.call_fun =  value;
    },


    getData:function( ){
        return this.vo;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.goods_item){
            this.goods_item.deleteMe();
            this.goods_item = null;
        }
        this.vo =null;
    },
})