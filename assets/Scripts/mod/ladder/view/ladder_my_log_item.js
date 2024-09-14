// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     我的记录item
// <br/>Create: 2019-08-10 16:05:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var ChatController = require("chat_controller");
var RoleController = require("role_controller");
var BattleController = require("battle_controller");
var TimeTool = require("timetool");

var Ladder_my_log_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_my_log_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.color_1 = new cc.Color(36,144,3,255);
        this.color_2 = new cc.Color(217,80,20,255);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container = this.seekChild("container");
        this.attk_lb = this.seekChild("attk_label",cc.Label);
        this.name_lb = this.seekChild("name_label",cc.Label);
        this.defend_lb = this.seekChild("defend_label",cc.Label);
        this.time_lb = this.seekChild("time_label",cc.Label);
        this.btn_share = this.seekChild("btn_share");
        this.btn_watch = this.seekChild("btn_watch");
        this.rank_lb = this.seekChild("rank_lb",cc.RichText);

        this.my_head = new PlayerHead();
        this.my_head.setScale(0.7);
        this.my_head.setPosition(60,85);
        this.my_head.show();
        this.my_head.setParent(this.container);

        this.my_head.addCallBack(function(){
            if(this.data){
                if(this.data.srv_id == "robot"){
                    message(Utils.TI18N("神秘人太高冷，不给查看"));
                }else{
                    let f_data = {rid :this.data.rid,srv_id :this.data.srv_id};
                    ChatController.getInstance().openFriendInfo(f_data,cc.v2(0,0));
                }
            }
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_share, function () {
            if(this._onShareCallBack && this.data){
                let srv_id = this.data.srv_id;
                if(this.data.type == 1){
                    let role_vo = RoleController.getInstance().getRoleVo();
                    srv_id = role_vo.srv_id;
                }
                this._onShareCallBack(world_pos,this.data.replay_id,this.data.name,srv_id);
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_share, function () {
            if(this.data && this.replay_srv_id != null){
                let srv_id = this.replay_srv_id;
                if(this.data.type == 2){
                    srv_id = this.data.srv_id;
                }
                BattleController.getInstance().csRecordBattle(this.data.replay_id,srv_id);
            }
        }.bind(this), 1)
    },

    setData:function(data){
        this.data = data;
        if(this.root_wnd)
        this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if(this.data == null) return
        let data = this.data;

        this.my_head.setHeadRes(data.face);
        this.attk_lb.string = data.power || 0;
        this.name_lb.string = Utils.transformNameByServ(data.name, data.srv_id);

        let time_str = TimeTool.getYMDHMS(data.time);
        time_str = time_str.substring(2);
        this.time_lb.string = time_str;

        if(data.type == 1 && data.ret == 1){
            this.defend_lb.node.color = this.color_1;
            this.defend_lb.string = Utils.TI18N("进攻成功");
        }else if (data.type == 1 && data.ret ==2){
            this.defend_lb.node.color = this.color_2;
            this.defend_lb.string = Utils.TI18N("进攻失败");
        }else if (data.type == 2 && data.ret == 1){
            this.defend_lb.node.color = this.color_1;
            this.defend_lb.string = Utils.TI18N("防守成功");
        }else if (data.type == 2 && data.ret == 2){
            this.defend_lb.node.color = this.color_2;
            this.defend_lb.string = Utils.TI18N("防守失败");
        }

        if(data.rank_type == 0){
            this.rank_lb.string = Utils.TI18N("排名保持不变");
        }else if (data.rank_type == 1){
            this.rank_lb.string = cc.js.formatStr(Utils.TI18N("排名升至<color=#249003>%d</c>名"), data.rank || 0);
        }else if (data.rank_type == 2){
            if(!data.rank || data.rank <= 0){
                this.rank_lb.string = Utils.TI18N("排名降至<color=#D95014>1000名外</c>");
            }else{
                this.rank_lb.string = cc.js.formatStr(Utils.TI18N("排名降至<color=#D95014>%d</c>名"),data.rank || 0);
            }
        }
    },
    
    setExtendData:function(extend){
        this._onShareCallBack = extend.callback;
        this.replay_srv_id = extend.replay_srv_id;
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
    },
})