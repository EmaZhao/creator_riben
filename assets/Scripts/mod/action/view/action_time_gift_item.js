var PathTool = require("pathtool")
var TimeTool = require("timetool")
var actionTimeGiftPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_time_gift_big_panel");
     
    },
    // 可以初始化声明一些变量的
    initConfig:function(){
        this.itemArr = []
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let sp = this.seekChild("bg",cc.Sprite);
        this.loadRes(PathTool.getBigBg("action/action_time_gift_bg"),function(res){
            sp.spriteFrame = res;
        }.bind(this))
        let text_sp = this.seekChild("text",cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("timegiftbig","time_gift_big_text_1"),function(res){
            text_sp.spriteFrame = res;
        }.bind(this))
        let jia_sp = this.seekChild("jia",cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("timegiftbig","time_gift_big_text_jia"),function(res){
            jia_sp.spriteFrame = res;
        }.bind(this))
        let percent_sp = this.seekChild("timegiftbig_percent",cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("timegiftbig","timegiftbig_percent"),function(res){
            percent_sp.spriteFrame = res;
        }.bind(this))
        this.num_lb = this.seekChild("num",cc.Label);
        this.rmb_lb = this.seekChild("Label",cc.Label);
        this.buyCount_lb =this.seekChild("text",cc.Label);
        this.buy_btn = this.seekChild("buy_btn",cc.Button)
        this.goods_list = this.seekChild("goods_list",cc.Layout);
        this.time_lb = this.seekChild("time",cc.Label);
        this.sprite_nd = this.buy_btn.node.getChildByName("sprite");
        if(this.data){
            this.setData(this.data)
        }
    },
    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.buy_btn.node.on('click',function(){
            let config = Config.tri_gift_data.data_limit_gift[this.data.id];
            let charge_config = Config.charge_data.data_charge_data[config.package_id || 0];
            if(charge_config){
                SDK.pay(charge_config.val,1,charge_config.id,charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image)
            }
        }.bind(this))
    },
    onShow:function(data){

    },
    setData(data){
        this.data = data;
        if(!this.root_wnd)return;
        let config = Config.tri_gift_data.data_limit_gift[data.id];
        if(!config)return
        this.buyCount_lb.string = Utils.TI18N(cc.js.formatStr("限定：%d/%d",data.num,config.limit_num))
        if(this.itemArr.length == 0){
            //只首次进入
            // this.loadRes(PathTool.getUIIconPath("timegiftbig","time_gift_big_num","labelatlas"),function(res){
                // this.num_lb.font = res;
                this.num_lb.string = config.desc;
            // }.bind(this))
            let chargeConfig = Config.charge_data.data_charge_data[config.package_id];
            if(chargeConfig){
                this.rmb_lb.string = Utils.TI18N(chargeConfig.val);
            }
            
            let reward = config.reward;
            let scale
            if(reward.length > 4){
                scale = 0.8;
                this.goods_list.type = cc.Layout.Type.GRID;
                this.goods_list.spacingX = 20;
                this.goods_list.spacingY = 15;
                this.goods_list.node.width = 450;
            }else{
                scale = 0.9;
                this.goods_list.type = cc.Layout.Type.HORIZONTAL;
                this.goods_list.node.width = 0;
                this.goods_list.spacingX = 8
            }
            this.setLessTime()
            this.time_ticket = gcore.Timer.set(function () {
                this.setLessTime()
            }.bind(this), 1000, -1)
    
            this.updateItem = this.startUpdate(reward.length,function(index){
                let node = new cc.Node()
                node.setContentSize(120*scale,120*scale)
                this.goods_list.node.addChild(node)
                let item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false,scale,false,true)
                item.setParent(node)
                item.show()
                item.setData({bid:reward[index][0],num:reward[index][1]})   
                this.itemArr.push(item)
            }.bind(this))
            if(this.item_callback){
                this.item_callback(this)
            }
        }
        if(data.num >= config.limit_num){
            this.buy_btn.interactable = false;
            this.buy_btn.enableAutoGrayEffect = true;
            this.rmb_lb.node.getComponent(cc.LabelOutline).enabled = false;
            this.sprite_nd.active = false;
        }
    },
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setLessTime(){
        let time = this.data.end_time - gcore.SmartSocket.getTime()
        if(time <= 0){
            time = 0;
            if(this.time_ticket){
                gcore.Timer.del(this.time_ticket);
                this.time_ticket = null;
                this.buy_btn.interactable = false;
                this.buy_btn.enableAutoGrayEffect = true;
                this.rmb_lb.node.getComponent(cc.LabelOutline).enabled = false;
                this.sprite_nd.active = true;
            }
        }
        let time_desc = TimeTool.getTimeForFunction(time)
        this.time_lb.string = cc.js.formatStr(time_desc,"後ギフトパックはなくなります", );
    },
    addCallFunc(callFunc){
        this.item_callback = callFunc
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.time_ticket){
            gcore.Timer.del(this.time_ticket);
            this.time_ticket = null;
        }
        if(this.updateItem){
            gcore.Timer.del(this.updateItem);
            this.updateItem = null;
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
    },
})