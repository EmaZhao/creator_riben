// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-28 20:06:22
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionConst = require("action_const")
var ActionController = require("action_controller")
var ActionEvent = require("action_event")
var ActionOpenServerGiftItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_open_server_gift_item");
        this.ctrl = ActionController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.open_server_charge_id = 0;
        this.itemArr = []
        this.touch_get_btn = true;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container")
        this.label_title = this.main_container.getChildByName("label_title").getComponent(cc.Label)	//--标题
        this.label_title.string = "";
        this.label_item_desc = this.main_container.getChildByName("label_item_desc").getComponent(cc.Label) //--描述
        this.label_item_desc.string = "";
        this.label_cost = this.main_container.getChildByName("label_cost").getComponent(cc.Label) 		//--折扣前金额
        this.label_cost.string = "";
        this.label_limit = this.main_container.getChildByName("label_limit").getComponent(cc.Label)	//--限购
        this.label_limit.string = "";
        this.img_line = this.main_container.getChildByName("img_line") 			//--红线
    
        this.img_has_get = this.main_container.getChildByName("img_has_get")	//--已领取
        this.img_has_get.active = false;
        this.btn_get = this.main_container.getChildByName("btn_get")			//--购买
        this.rmb_num_lb = this.btn_get.getChildByName("Label").getComponent(cc.Label) 
        this.rmb_num_lb.string = "";

        this.good_cons = this.main_container.getChildByName("goods_con")
        if(this.data){
            this.setData(this.data)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.Is_Charge_Event,function(data){
            if(data && data.status!= null && data.charge_id){
                let charge_config = Config.charge_data.data_charge_data[data.charge_id]
                if(charge_config && data.status == 1 && data.charge_id == this.open_server_charge_id){
                    SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image)
                }
            }
        }.bind(this))
        this.btn_get.on('click',function(){
            Utils.playButtonSound(1)
            if(!this.touch_get_btn) return;
            Utils.delayRun(this.main_container,2,function(){
                this.touch_get_btn = true
            }.bind(this))
            // if this.get_item_ticket == null then
            //     this.get_item_ticket = GlobalTimeTicket:getInstance():add(function()
            //         this.touch_get_btn = true
            //         if this.get_item_ticket ~= nil then
            //             GlobalTimeTicket:getInstance():remove(this.get_item_ticket)
            //             this.get_item_ticket = nil
            //         end
            //     end,2)
            // end
            this.touch_get_btn = null
            if(this.data){
                if(this.data.charge_id && this.data.left_time > 0){
                    this.open_server_charge_id = this.data.charge_id
                    this.ctrl.sender21016(this.data.charge_id)
                }
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },
    setData(data){
        this.data = data
        if(!this.root_wnd)return;
        if(this.itemArr.length == 0){
            // --加载礼包物品列表
            this.loadRewardList(data.item_list)
        }
        // --标题
        this.label_title.string = (data.aim_str)
    
        // --描述
        let desc_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ItemDesc, data.aim_args)
        this.label_item_desc.string = (desc_list.aim_args_str || "")
    
        // --当前已购买次数/总次数
        let totle_count,current_count
        let current_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageCurCount, data.aim_args)
        let totle_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageTotalCount, data.aim_args)
        current_count = current_list.aim_args_val || 0
        totle_count = totle_list.aim_args_val || 0
        this.label_limit.string = (cc.js.formatStr(Utils.TI18N("限定：%d/%d"),current_count,totle_count))
    
        // --剩余购买次数
        this.data.left_time = totle_count - current_count
    
        // --折扣前价格、折扣后价格
        let price,discount_price
        let price_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ActivityOldPrice, data.aim_args)
        let dis_price_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ActivityCurrentPrice, data.aim_args)
        price = price_list.aim_args_val || 0
        discount_price = dis_price_list.aim_args_val || 0

        this.label_cost.string = (cc.js.formatStr(Utils.TI18N("%d"), price))
        this.rmb_num_lb.string = (cc.js.formatStr(Utils.TI18N("%d"), discount_price))
    
        let charge_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ItemRechargeId, data.aim_args)
        // --支付物品ID
        this.data.charge_id = charge_list.aim_args_val || 0
    
        this.btn_get.active = (this.data.left_time > 0)
        this.img_has_get.active = (this.data.left_time <= 0)
    },
    loadRewardList(item_list){
        if(item_list.length > 0){
            let scale = 0.8
            this.updateItem = this.startUpdate(item_list.length,function(index){
                let node = new cc.Node()
                node.setContentSize(120*scale,120*scale)
                this.good_cons.addChild(node)
                let item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false,scale,true,true)
                item.setParent(node)
                item.show()
                item.setData({bid:item_list[index].bid,num:item_list[index].num})   
                this.itemArr.push(item)
            }.bind(this))
        }
    },
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.main_container){
            this.main_container.stopAllActions()
        }
        if(this.itemArr){
            for(let i=0;i<this.itemArr.length;++i){
                if(this.itemArr[i]){
                    this.itemArr[i].deleteMe()
                    this.itemArr[i] = null;
                }
            }
            this.itemArr = null
        }
        if(this.updateItem){
            gcore.Timer.del(this.updateItem);
            this.updateItem = null;
        }
    },
})