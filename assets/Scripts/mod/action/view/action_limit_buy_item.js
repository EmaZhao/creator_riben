var PathTool = require("pathtool");
var ActionController = require("action_controller")
var ActionConst = require("action_const");
var StrongerController = require("stronger_controller")
var CommonScrollView = require("common_scrollview");
var VipController = require("vip_controller")
var HeroController = require("hero_controller")
var ActionLimitBuyItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_limit_buy_item");
        this.ctrl = ActionController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        self.main_container = self.root_wnd.getChildByName("main_container")
        self.title_label = self.main_container.getChildByName("title_label").getComponent(cc.Label)
    
        self.goods_con = self.main_container.getChildByName("goods_con")
        self.has_bg = self.main_container.getChildByName("has_bg")
        self.has_bg.active = false;
        self.btn = self.main_container.getChildByName("btn")
        self.btn_state = self.btn.getComponent(cc.Button)
        self.old_price = self.main_container.getChildByName("old_price")
        self.price_line = self.old_price.getChildByName("price_line")
        self.limit_rt = self.main_container.getChildByName("limit_label").getComponent(cc.RichText)
        self.num = self.btn.getChildByName("num").getComponent(cc.Label)
        self.line = self.btn.getChildByName("num").getComponent(cc.LabelOutline)
        let scroll_view_size = self.goods_con.getContentSize()
        let setting = {
            item_class : "backpack_item", //-- 单元类
            start_x : 3, //-- 第一个单元的X起点
            space_x : 15, //-- x方向的间隔
            start_y : 11, //-- 第一个单元的Y起点
            space_y : 4, //-- y方向的间隔
            item_width : 120 * 0.7, //-- 单元的尺寸width
            item_height : 120 * 0.7, //-- 单元的尺寸height
            row : 1, //-- 行数，作用于水平滚动类型
            col : 0, //-- 列数，作用于垂直滚动类型
            scale : 0.7
        }
        self.item_scrollview = new CommonScrollView();
        self.item_scrollview.createScroll(self.goods_con,cc.v2(0, 0),ScrollViewDir.horizontal,ScrollViewStartPos.top,scroll_view_size,setting)
        if(this.data){
            this.setData(this.data)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {
        var self = this
        this.btn.on('click',function(){
            Utils.playButtonSound(1)
            if(this.data){
                if(self.data.status == 0 && self.touch_limit_buy == true){
                    // self.touch_limit_buy = null
                    let new_price = Utils.keyfind('aim_args_key', 27, self.data.aim_args) || {}
                    let charge_config = Config.charge_data.data_charge_data[self.data.aim]
                    SDK.pay(new_price.aim_args_val, 1, self.data.aim, charge_config.name,charge_config.product_desc,null,null,charge_config.pay_image)
                  
                    // if(self.send_limit_buy_ticket == null){
                    //     self.send_limit_buy_ticket = GlobalTimeTicket:getInstance():add(function()
                    //         self.touch_limit_buy = true
                    //         if self.send_limit_buy_ticket ~= null then
                    //             GlobalTimeTicket:getInstance():remove(self.send_limit_buy_ticket)
                    //             self.send_limit_buy_ticket = null
                    //         end
                    //     end,2)
                    // }
                }else if(self.data.status == 2){
                    message(Utils.TI18N("已经购买完了"))
                }
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    setData(data){
        if(!data) return;
        this.data = data;
        var self = this
        if(this.root_wnd){
            this.touch_limit_buy = true;
            self.data = data
            let list = []
            for(let k=0;k<data.item_list.length;++k){
                let v = data.item_list[k]
                if(v && v.bid){
                    list.push(v)
                }
            }
            self.item_scrollview.setData(list)
            self.item_scrollview.addEndCallBack(function(){
                self.item_scrollview.scroll_view_compend.enabled = false
                let itemList = self.item_scrollview.getItemList()
                for(let k=0;k<itemList.length;++k){
                    let v = itemList[k]
                    v.setDefaultTip(true,false)
                }
            }.bind(this))

            let discount = Utils.keyfind('aim_args_key', 26, data.aim_args) || {}
            let new_price = Utils.keyfind('aim_args_key', 27, data.aim_args) || {}
            let txt = Utils.TI18N("原价: ") +discount.aim_args_val
            self.old_price.getComponent(cc.Label).string = txt;
            self.price_line.active = true;

            let price_str =new_price.aim_args_val
            self.num.string = price_str;
            self.title_label.string = data.aim_str;

            let _type = self.getValByKey(data.aim_args,7) || 0
            let max_num = self.getValByKey(data.aim_args,2) || 0
            let cur_num = self.getValByKey(data.aim_args,6) || 0
            let str = ""
            if(_type == 1){ //--日限购
                if (max_num >=0 && max_num != 0 && cur_num >= 0){ 
                    str = Utils.TI18N("每周限购") + max_num + Utils.TI18N("个") + "(" +"<color=#249003>"+cur_num+"</color>/"+ max_num +")"
                }
            }else if(_type == 2){ // --累计限购
                if(max_num>=0 && max_num != 0 && cur_num >= 0){ 
                    str = Utils.TI18N("总限购") + max_num + + Utils.TI18N("个") + "(" +"<color=#249003>"+cur_num+"</color>/"+ max_num +")"
                }
            }
            self.limit_rt.string = str;
            if(data.sort_index == 2){
                self.btn_state.interactable = false;
                self.btn_state.enableAutoGrayEffect = true;
                self.line.enabled = false;
            }else{
                self.btn_state.interactable = true;
                self.btn_state.enableAutoGrayEffect = false;
                self.line.enabled = true;
            }
        }
    },
    getValByKey(aim_args, key){
        if(!aim_args){
            return 0
        }
        let val = 0
        for(let i=0;i<aim_args.length;++i){
            let v = aim_args[i]
            if (v.aim_args_key == key){
                val = v.aim_args_val
            }
        }
        return val
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },
})