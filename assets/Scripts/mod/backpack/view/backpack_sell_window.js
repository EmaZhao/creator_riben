// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     背包内出售物品的面板
// <br/>Create: 2019-04-15 16:31:04
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackPackConst = require("backpack_const");

var Backpack_sellWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("backpack", "backpack_sell_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = [];
        this.wait_sell_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
    
        this.container = this.root_wnd.getChildByName("container");
        this.total_width = this.container.getContentSize().width;
    
        this.cell_resoult = this.container.getChildByName("cell_resoult")  // img是资产图片节点，是个image  value 是值
        this.cell_resoult.active = false;
    
        var aaaa = cc.instantiate(this.cell_resoult);
        this.container.addChild(aaaa);
    
        this.cancel_btn = this.container.getChildByName("cancel_btn");
        this.confirm_btn = this.container.getChildByName("confirm_btn");
    
        var label = this.cancel_btn.getChildByName("label").getComponent(cc.Label);
        label.string = Utils.TI18N("取消");
    
        this.cell_label = this.confirm_btn.getChildByName("label");
        this.win_title = this.container.getChildByName("win_title").getComponent(cc.Label);
    
        this.sell_desc = this.container.getChildByName("sell_desc").getComponent(cc.Label);
        this.sell_title = this.container.getChildByName("sell_title").getComponent(cc.Label);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.cancel_btn, function () {
            this.ctrl.openSellWindow(false);
        }.bind(this), 1);

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openSellWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.confirm_btn, function () {
            if(Utils.next(this.wait_sell_list) && this.bag_code){
                this.ctrl.sender10522(this.bag_code, this.wait_sell_list);
            }
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(info){
        var bag_code = info[0];
        this.bag_code = bag_code;
        this.wait_sell_list = [];
        var sell_value_list = [];
        var list = info[1];
        for(var i in list){
            var v = list[i];
            if(v.id != null && v.config != null && v.config.value && Utils.next(v.config.value)){
                this.wait_sell_list.push({id: v.id, bid: v.base_id, num: v.quantity});
                for(var j in v.config.value){
                    var value = v.config.value[j];
                    if(sell_value_list[value[0]] == nil){
                        sell_value_list[value[0]] = {id:value[0], num:0};
                    }
                    sell_value_list[value[0]].num = sell_value_list[value[0]].num + value[1] * v.quantity;
                }

                // 如果是装备，则还需要判断他的精炼附加
                if(this.bag_code == BackPackConst.Bag_Code.EQUIPS){
                    if(v.enchant != 0){
                        var config = gdata("partner_eqm_data","data_partner_eqm",Utils.getNorKey(v.config.type, v.enchant));
                        if(config != null && config.sell != null && Utils.next(config.sell) != null){
                            for(var j in config.sell){
                                var value = config.sell[j];
                                if(sell_value_list[value[0]] == null){
                                    sell_value_list[value[0]] = {id: value[0], num: 0};
                                }
                                sell_value_list[value[0]].num = sell_value_list[value[0]].num + value[1] * v.quantity;
                            }
                        }
                    }
                    var stone_id = 0;
                    var stone_count = 0;
                    for(var j in v.gemstones){
                        var key = Utils.getNorKey(v.config.type, d.lev);
                        var stone_config = Config.partner_gemstone_data.data_upgrade[key];
                        if(stone_config && Utils.next(stone_config.add)){
                            stone_id = stone_config.add[0][0];
                            stone_count = stone_count + stone_config.add[0][1];
                        }
                    }
                    if(stone_count > 0){
                        if(sell_value_list[stone_id] == null){
                            sell_value_list[stone_id] = {id: stone_id, num: 0};
                        }
                        sell_value_list[stone_id].num = sell_value_list[stone_id].num + stone_count;
                    }
                }
            }
        }
        this.showSellItemValue(sell_value_list);
        var title = "";
        if(bag_code == BackPackConst.Bag_Code.BACKPACK){
            title = Utils.TI18N("分解");
        }else if(bag_code == BackPackConst.Bag_Code.EQUIPS){
            title = Utils.TI18N("熔炼");
        }

        this.win_title.string = title;
        this.cell_label.string = title;
        this.sell_desc.string = cc.js.formatStr(Utils.TI18N("%s后物品将不可找回"), title);
        this.sell_title.string = cc.js.formatStr(Utils.TI18N("%s后将获得下列物品："), title);
    },

    /**
     * desc:展示待出售物品可获得资产
     * author:{author}
     * list
     * return
     */
    showSellItemValue:function(list){
        if(list == null)return;
        if(!this.cell_resoult)return;
        var sum = 0;
        var sell_item = null;
        var sell_list = [];
        var max_column = 3; //最大列数
        var total_width = 0;
        var init_y = this.cell_resoult.y;
        var width = this.cell_resoult.getContentSize().width;
        var height = this.cell_resoult.getContentSize().height;

        for(var i in list){
            var v = list[i];
            var config = Utils.getItemConfig(v.id);
            if(config!=null){
                sum = sum + 1;
                sell_item = cc.instantiate(this.cell_resoult);
                sell_item.active = true;
                this.container.addChild(sell_item);
                sell_item.img = sell_item.getChildByName("item_img").getComponent(cc.Sprite);
                this.loadRes(PathTool.getItemRes(config.icon), function(sf_obj){
                    sell_item.img.spriteFrame  = sf_obj;
                }.bind(this));
                sell_item.value = sell_item.getChildByName("value").getComponent(cc.Label);
                sell_item.value.string = Math.floor(v.num);
                // -- sell_item:setPositionY(this.init_y)
                sell_list.push(sell_item);
                if(sum < 4){
                    total_width = total_width + sell_item.getContentSize().width;
                }
            }
        }

        var row_count = Math.floor((sell_list.length - 1)/max_column) + 1;
        var start_x = ( this.total_width -  (sell_list.length - 1) * 18 - total_width ) * 0.5;
        var start_y = init_y + (row_count - 1)* height;
        if(row_count >= 2){
            start_y = start_y - 10;
        }
        for(var i in sell_list){
            var x = start_x + ((i-1)% max_column)*(width+18);
            var y = start_y - Math.floor((i-1)/max_column) * (height + 10);
            item.setPosition(x, y)
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openSellWindow(false);
    },
})