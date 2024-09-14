// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-07 11:00:34
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var FriendController = require("friend_controller");
var RoleController = require("role_controller");
var PlayerHead = require("playerhead");

var Endless_rank_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_rank_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var container = this.root_wnd.getChildByName("container");
        this.rank_img = container.getChildByName("rank_img").getComponent(cc.Sprite);
        this.role_name = container.getChildByName("role_name").getComponent(cc.Label);
        this.role_power = container.getChildByName("role_power").getComponent(cc.Label);
        
        this.rank_txt_nd = container.getChildByName("rank_txt");
        this.rank_txt_ct = this.rank_txt_nd.getComponent("CusRichText");

        this.score_info = Utils.createRichLabel(20, new cc.Color(0xff,0xde,0x5e, 0xff), cc.v2(0, 0.5), cc.v2(100, 0),30,300);
        this.score_info.horizontalAlign = cc.macro.TextAlignment.LEFT;
        container.addChild(this.score_info.node);
    
        this.role_head = new PlayerHead();
        this.role_head.setPosition(-157, 0);
        this.role_head.setScale(0.95);
        this.role_head.setLev(99)
        this.role_head.setParent(container);
        this.role_head.show();

        this.container = container

        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.role_head.addCallBack( function(){
            if(this.data != null){
                FriendController.getInstance().openFriendCheckPanel(true, {srv_id: this.data.srv_id, rid: this.data.rid})
            }
        }.bind(this));
    },

    addCallBack:function(call_back){
        this.call_back = call_back;
    },

    setData:function(data){
        this.data = data;
        this.updateInfo();
    },

    updateInfo:function(){
        if(!this.root_wnd)return;
        var role_vo = RoleController.getInstance().getRoleVo();
        if(this.data && role_vo){
            this.role_name.string = this.data.name;
            this.role_power.string = this.data.val2;
            this.role_head.setHeadRes(this.data.face_id);
            this.role_head.setLev(this.data.lev);
            var avatar_bid = this.data.avatar_id 
            var vo = Config.avatar_data.data_avatar[avatar_bid];
            if(vo){
                var res_id = vo.res_id || 0;
                this.role_head.setFrameRes(res_id);
            }
            if(this.data.idx <= 3){
                if(this.rank_txt_nd != null){
                    this.rank_txt_nd.active = false;
                }
                if(this.data.idx == 0){
                    this.rank_img.node.active = false;   
                }
                var res_id = PathTool.getCommonIcomPath(cc.js.formatStr("common_200%s", this.data.idx));
                if(this.rank_res_id != res_id){
                    this.rank_res_id  = res_id;
                    this.loadRes(res_id, (function(resObject){
                        this.rank_img.spriteFrame = resObject;
                    }).bind(this));
                }
                this.rank_img.node.active = true;
            }else{
                this.rank_txt_nd.active = true;
                this.rank_txt_ct.setNum(this.data.idx);
                this.rank_img.node.active = false;
            }
            var msg = cc.js.formatStr("%s<color=#ffde5e fontsize=22>%s</color>", Utils.TI18N("最大通关数:"), this.data.val1 || 0);
            this.score_info.string = msg;
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
        if(this.role_head){
            this.role_head.deleteMe();
        }
        this.role_head = null;
        // this.removeAllChildren();
        // this.removeFromParent();
    },
})