// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     冒险商店单利
// <br/>Create: 2019-05-14 16:45:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Adventure_shop_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_shop_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.is_completed = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container = this.root_wnd.getChildByName("container");
        this.name = this.container.getChildByName("name").getComponent(cc.Label);

        var count_bg = this.container.getChildByName("count_bg");
        this.coin = count_bg.getChildByName("coin").getComponent(cc.Sprite);            // 商品图标
        this.price = count_bg.getChildByName("price").getComponent(cc.Label);               // 商品价格

        this.discount = this.container.getChildByName("discount");                    // 打折背景
        this.discount_num = this.discount.getChildByName("discount_num").getComponent(cc.Label);            // 折扣价格
        this.sold = this.container.getChildByName("sold");            // 已售
        this.grey = this.container.getChildByName("grey");            // 暗背景

        this.item_container = this.container.getChildByName("item_container");
        this.backpack_item = ItemsPool.getInstance().getItem("backpack_item");
        this.backpack_item.initConfig(false, 1, false, true);
        this.backpack_item.setParent(this.item_container);
        this.backpack_item.show();
        this.backpack_item.setPosition(0, 0);

        this.grey.active = false;
        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.container, function () {
            if(this.call_back){
                this.call_back(this);
            }
        }.bind(this), 1);
    },

    // ==============================--
    // desc:设置已售完状态
    // @return 
    // ==============================--
    updateOverStatus:function(){
        if(this.data == null)return;
        if(this.data.is_buy == 1){
            this.sold.active = true;
		    this.grey.active = true;
        }else{
            this.sold.active = false;
		    this.grey.active = false;
        }
    },

    setData:function(data){
        this.data = data;
        if(this.root_wnd){
            this.updateInfo();
        }
    },

    getData:function(){
        return this.data;
    },

    updateInfo:function(){
        if(this.data){
            var item_config = Utils.getItemConfig(this.data.bid);
            var buy_config = Utils.getItemConfig(this.data.pay_type);
            this.item_config = item_config;
            this.buy_config = buy_config;
            if(item_config && buy_config){
                this.backpack_item.setData({bid:this.data.bid, num:this.data.num});

                //  物品名字
                this.name.string = item_config.name;
    
                //  资源类型
                var res_id = PathTool.getItemRes(buy_config.icon);
                if(this.icon_res_id != res_id){
                    this.icon_res_id = res_id;
                    this.loadRes(res_id,function(res){
                        this.coin.spriteFrame = res;
                    }.bind(this))
                }
            }

            // 价格
            this.price.string = Utils.getMoneyString(this.data.pay_val);
            // 折扣
            if(this.data.discount != 0){
                this.discount.active = true;
                this.discount_num.string = this.data.discount+Utils.TI18N("折");
            }else{
                this.discount.active = false;
            }
            this.updateOverStatus();
        }
    },

    addCallBack:function(call_back){
        this.call_back = call_back;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.backpack_item){
            this.backpack_item.deleteMe()
        }
        this.backpack_item = null;
    },
})