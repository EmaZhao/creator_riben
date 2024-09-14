// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     七天登录活动单个
// <br/>Create: 2019-04-17 16:29:20
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StringUtil = require("string_util");
let STATUS_TYPE_SEVEN = {
  notReceive:1,//未领取
  receive:2,//可领取
  received:3//已领取
}

let STATUS_TYPE_ACTIVITY = {
  notReceive:0,//未领取
  receive:1,//可领取
  received:2//已领取
}

let STATUS_TYPE_COMMON = {
  notReceive:1,//未领取
  receive:2,//可领取
  received:3//已领取
}
let CHECK_TYPE = {//多种签到的可领取，已领取等状态不一样
  1:STATUS_TYPE_SEVEN,
  2:STATUS_TYPE_ACTIVITY,
  3:STATUS_TYPE_COMMON,
}

var Action_seven_login_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_seven_login_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");;
    
        this.click = this.main_container.getChildByName("click");
        var title_bg = this.main_container.getChildByName("title_bg");
        title_bg.zIndex = 21;
        this.title = this.main_container.getChildByName("title").getComponent(cc.Label);
        this.title.node.zIndex = 21;
        this.get = this.main_container.getChildByName("get");
        this.get.active = false;
    
        this.select = this.main_container.getChildByName("select");
        this.select.active = false;
        this.reward_nd = this.main_container.getChildByName("reward");
        this.reward_nd.active = false;

        this.effect_node = this.seekChild("get_eff_node");
        this.effect    = this.seekChild("get_eff_node", sp.Skeleton);
        this.effect_node.active = false;
        this.effect_node.zIndex = 20;

        var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(257), "action");
        this.loadRes(anima_path, function(ske_data) {
            this.effect.skeletonData = ske_data;
            this.effect.setAnimation(0, PlayerAction.action, true);
        }.bind(this));
        
        this.icon = this.main_container.getChildByName("icon");

        if(this.data){
            this.updateInfo();
        }

        if(this.isSelect != null){
            this.setSelect(this.isSelect);
        }

        if(this.status!=null){
            this.setStatus(this.status);
        }else{
            this.setStatus(1);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.click, function () {
            if(this.callback){
                this.callback(this.index);
            }
        }.bind(this), 2);
    },

    setData:function( index ,type){
        this.iType  = type;
        this.data = index;
        this.updateInfo();
        this.status = CHECK_TYPE[this.iType].notReceive;
    },

    setActivity(data){
      this.activity = data;
      this.updateInfo();
    },

    updateInfo:function(){
        if(!this.root_wnd || this.data == null){
          return
        };
        var index = this.data;
        var backpackItem = require("backpack_item");
        var spec_reward_id = null;
        var num = 0;
        if(this.iType == 1){
          spec_reward_id = Config.login_days_data.data_day[index].rewards[0][0];
          this.title.string = +StringUtil.numToChinese(index)+Utils.TI18N("日目");
        }else if(this.iType == 2 && this.activity){
          spec_reward_id = this.activity.item_list[0].bid;
          num = this.activity.item_list[0].num;
          // console.error("测试",index,this.activity.item_list);
          this.title.string = +StringUtil.numToChinese(this.activity.aim)+Utils.TI18N("日目");
          this.setStatus(this.activity.status);
        }else if(this.iType == 3 && this.activity){
          spec_reward_id = this.activity.rewards[0][0];
          num = this.activity.rewards[0][1];
          this.title.string = +StringUtil.numToChinese(this.activity.day)+Utils.TI18N("日目");
          this.setStatus(this.activity.status);
        }
        if(spec_reward_id){
          var item = new backpackItem();
          item.initConfig(false, 1, false, false);
          item.setParent(this.icon);
          item.setData({bid:spec_reward_id,num:num});
          item.show();
        }
        
        
        
        if(this.iType == 1){
          if(index == 2 || index == 3){
            if(this.effect2 == null){
                var node = new cc.Node();
                node.setAnchorPoint(0.5,0.5);
                node.setPosition(this.main_container.getContentSize().width/2,this.main_container.getContentSize().height/2);
                this.main_container.addChild(node,19);
        
                this.effect2 = node.addComponent(sp.Skeleton);
                var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(258), "action");
                this.loadRes(anima_path, function(ske_data) {
                    if(this.effect2){
                        this.effect2.skeletonData = ske_data;
                        this.effect2.setAnimation(0, PlayerAction.action, true);
                    }
                }.bind(this));
            }
            if(this.effect2){
                this.effect2.node.active = true;
            }
            }else{
                if(this.effect2){
                    this.effect2.node.active = false;
                }
            }
        }
    },

    setStatus:function(status){
        this.status = status;
        if(!this.root_wnd)return;
        if(this.status == CHECK_TYPE[this.iType].received){//已领取
            this.get.active = true;
            if(this.effect2){
                this.effect2.node.active = false;
            }
            if(this.effect_node){
                this.effect_node.active = false;
            }
        }else{
            if(this.get){
                this.get.active = false;
            }
        }

        if(this.status == CHECK_TYPE[this.iType].receive){//可领取
            this.reward_nd.active = true
            if(this.effect_node){
                this.effect_node.active = true;
            }
        }else{
            if(this.effect_node){
                this.effect_node.active = false;
            }
            this.reward_nd.active = false;
        }
    },
	

    setSelect:function( status ){
        this.isSelect = status;
        if(!this.root_wnd)return;
        if(status){
            this.select.active = true;
        }else{
            this.select.active = false;
        }
    },

    addCallBack:function( value ){
        this.callback =  value;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
      this.updateInfo();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.effect){
            this.effect.setToSetupPose();
            this.effect.clearTracks();
        }

        if(this.effect2){
            this.effect2.setToSetupPose();
            this.effect2.clearTracks();
        }
        this.effect2 = null;
        
    },
})