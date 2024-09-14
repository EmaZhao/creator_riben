// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-12 17:36:49
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var OrderactionController = require("orderaction_controller");

var Orderaction_reward_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "reward_item1");
        this.ctrl =  OrderactionController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var main_container = this.root_wnd.getChildByName("main_container");
        this.goods_item = main_container.getChildByName("goods_item");
        this.good_item_content = this.goods_item.getChildByName("content");
        this.mark = main_container.getChildByName("mark");
        this.mark.active = false;
        this.lev_num = main_container.getChildByName("lev_num").getComponent(cc.Label);
        this.lev_num.string = "";
        this.common_goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.common_goods_item.initConfig(false, 0.8,null,true);
        this.common_goods_item.setParent(main_container);
        this.common_goods_item.setPosition(263, 58);
        this.common_goods_item.addActionCallBack(function(){
            if(this.data && this.data.lev && this.data.status!=null){
                if(this.data.status == 0){
                    this.ctrl.send25304(this.data.lev);
                }
            }
        }.bind(this));

        this.common_goods_item.show();
        if(this.data){
            this.updateData(this.data);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    updateData:function(data){
        this.lev_num.string = data.lev || 1;
        var common = true;
        if(this.common_goods_item){
            if(data.reward && data.reward[0]){
                this.common_goods_item.setData({bid:data.reward[0][0],num:data.reward[0][1]});
                this.common_goods_item.setVisible(true);
                this.common_goods_item.showOrderWarLock(true);
            }else{
                this.common_goods_item.setVisible(false);
            }

            // 领取状态
            if(data.status == 1){
                this.common_goods_item.IsGetStatus(true);
            }else{
                this.common_goods_item.IsGetStatus(false);
            }
        }

        var is_locak_status = true;
        if(data.cur_lev >= data.lev){
            if(this.common_goods_item){
                this.common_goods_item.showOrderWarLock(false);
	    	    common = false;
            }
            if(data.is_locak == 1){
                is_locak_status = false;
            }else{
                is_locak_status = true;
            }
        }else{
             if(this.common_goods_item){
                this.common_goods_item.showOrderWarLock(true);
	    	    common = true;
            }
            is_locak_status = true;
        }

        if(common == false){
            if(data.status == 1){
                this.common_goods_item.showItemEffect(false);
            }else{
                this.common_goods_item.showItemEffect(true, 263, PlayerAction.action_1, true, 1.1);
            }
        }else{
            this.common_goods_item.showItemEffect(false);
        }
        // 普通奖励
        if(data.status != 0){
            common = false;
        }
        this.common_goods_item.setDefaultTip(common);

        // 进阶奖励
        var advance = true;
        var effect_id;
        if(this.model.getGiftStatus() == 1){
            if(data.rmb_status == 0){
                if(data.cur_lev >= data.lev){
                    advance = false;
                }
            }
        }
        if(advance == false){
            effect_id = 263;
        }

        var data_list = data.rmb_reward || [];
        var setting = {};
        setting.start_x = 10;
        setting.scale = 0.8;
        setting.max_count = 3;
        setting.lock = is_locak_status;
        setting.is_tip = advance;
        setting.show_effect_id = effect_id;

        var callback = function(){
            if(this.data && this.data.lev && this.data.rmb_status!=null){
                if(this.data.rmb_status == 0){
                    this.ctrl.send25304(this.data.lev);
                }
            }
        }.bind(this);

        setting.callback = callback;
        this.item_list = Utils.commonShowSingleRowItemList(this.goods_item, this.item_list, data_list, setting ,this.good_item_content,true);
    },

    setData:function(data){
        if(!data)return;
        this.data = data;
        if(this.root_wnd){
            this.updateData(data);
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
        if(this.item_list){
            for(var i in this.item_list){
                this.item_list[i].deleteMe();
            }
            this.item_list = null;
        }
        if(this.common_goods_item){
            this.common_goods_item.deleteMe();
            this.common_goods_item = null;
        }
        // self:removeAllChildren()
        // self:removeFromParent()
    },
})