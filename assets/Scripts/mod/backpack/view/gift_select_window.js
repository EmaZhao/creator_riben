// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-15 10:35:50
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Gift_selectWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("backpack", "gift_select");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.WIDTH = 460;  //界面的宽度
        this.HEIGHT = 350;
        this.GOODS_WIDTH = 68; //偏移量
        this.select_type = 1;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        var size = this.main_panel.getContentSize();
        this.close_btn =this.main_panel.getChildByName("close_btn");
        this.top_panel = this.main_panel.getChildByName("top_panel");
        var title = this.top_panel.getChildByName("title_label").getComponent(cc.Label);
        title.string = Utils.TI18N("自选礼包");
    
        //领取按钮
        this.use_btn = this.main_panel.getChildByName("use_btn");
        var use_lab = this.use_btn.getChildByName("Label").getComponent(cc.Label);
        use_lab.string = Utils.TI18N("使用");

        // 滚动部分
        this.scroll_view = this.seekChild("items_content");

        this.desc_label = Utils.createRichLabel(24, new cc.Color(0x76,0x45,0x19, 0xff), cc.v2(0.5, 1), cc.v2(size.width/2,625),null,400);
        this.main_panel.addChild(this.desc_label.node);
    },

    // 设置数据
    updateGiftList:function(giftid,giftBid, goods_list, choose_num){
        this.giftid = giftid;
        this.giftBid = giftBid;
        this.goods_list = goods_list || [];
        this.choose_num = choose_num || 1;
        // 物品列表
        this.desc_label.string = cc.js.formatStr(Utils.TI18N("请从以下奖励中选择%s个"), this.choose_num );

        if(!this.item_list){
            this.item_list = [];
        }

        if(!this.name_list){
            this.name_list = [];
        }

        var scroll_size = this.scroll_view.getContentSize();
        var len = 0;
        var RoleController      = require("role_controller");
        var role_vo = RoleController.getInstance().getRoleVo();

        for(var i in this.goods_list){
            if(this.goods_list[i].min_lev <=role_vo.lev && this.goods_list[i].max_lev >=role_vo.lev){
                len = len+1;
            }
        }

        var max_height = Math.max(scroll_size.height, len*128 +20);
        
        this.scroll_view.setContentSize(cc.size(scroll_size.width, max_height));
        var index = 1;
        for(var i in this.goods_list){
            var v = this.goods_list[i];

            if(v.min_lev <=role_vo.lev && v.max_lev >=role_vo.lev){
                var temp = v;
                var x;
                var y;
                x = scroll_size.width/2;
                y =max_height -128*index;

                var bid = temp.bid;
                if(!this.item_list[index]){
                    var GiftSelectItem = require("gift_select_item_panel");
                    this.item_list[index] = new GiftSelectItem(index);
                    this.item_list[index].setParent(this.scroll_view);
                }
                this.item_list[index].setPosition(x, y);
                var data = {base_id: bid,quantity: temp.num}
                this.item_list[index].setData(data);

                this.item_list[index].addCallBack(function(index,vo){
                    var id = index || 1;
                    this.clickCallBack(id, vo.base_id, vo.quantity);
                }.bind(this));
                index = index +1;
            }
        }
        // 选择列表置空
        this.select_list = [];
    },

    // 点击的事件
    clickCallBack:function(goods_id, bid, num){
        // 判断该bid是否存在的
        if(this.select_list && this.select_list.length > 0){
            for(var i = this.select_list.length-1; i>=0;i--){
                var temp_id = this.select_list[i].goods_id;
                if(temp_id == goods_id){
                    this.select_list.splice(i,1);
                    this.setSelectedState(goods_id, false)
                    return
                }
            }
        }

        // 判断数量是否满了
        if(this.select_list.length >= this.choose_num){
            var item = this.select_list.shift();
            var temp_goods_id = item.goods_id
            this.setSelectedState(temp_goods_id, false);
    // --        message2("选择数量已满！")
    // --        return
        }

        // 插入数据
        this.select_list.push({goods_id:goods_id,bid:bid,num: num});
        this.setSelectedState(goods_id, true);
    },

    setSelectedState:function(id, bool){
        if(this.item_list){
            for(var i in this.item_list){
                var item = this.item_list[i];
                if(item.index && item.index == id){
                    item.setSelected(bool)
                }
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.use_btn, function () {
            if(this.select_list && this.select_list.length >= this.choose_num){
                var gift_id = this.giftid;
                var chose_ids = [];
                var goods_num = 1;
                for(var i in this.select_list){
                    chose_ids.push({name:1,value: this.select_list[i].bid,str:""});
                    goods_num = this.select_list[i].num;
                }
                var BackPackConst = require("backpack_const");
                var count = this.model.getPackItemNumByBid(BackPackConst.Bag_Code.BACKPACK,this.giftBid);
                if(count >1 && this.choose_num==1){
                    this.ctrl.openBatchUseItemView(true, this.gift_vo,1,chose_ids)
                }else{
                    this.ctrl.sender10515(gift_id,1,chose_ids);
                    this.ctrl.closeGiftSelectPanel();
                }
            }else{
                message(cc.js.formatStr(Utils.TI18N("请选择<color=#5a503c>%d个</color>物品！"),  this.choose_num))
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.closeGiftSelectPanel();
        }.bind(this), 2);
    
    },

//     function GiftSelectPanel:createTitleTxt(txt, x, y)
//     local container = ccui.Widget:create()
//     container:setAnchorPoint(cc.p(0.5, 1))
//     local size = cc.size(400, 20)
//     container:setContentSize(size)
//     container:setPosition(cc.p(x, y))
//     local bg = createSprite(PathTool.getCommonRes("line7"), 0, 20)
//     bg:setAnchorPoint(cc.p(0, 1))
//     container:addChild(bg)
//     bg = createSprite(PathTool.getCommonRes("line7"), size.width, 20)
//     bg:setFlippedX(true)
//     bg:setAnchorPoint(cc.p(1, 1))
//     container:addChild(bg)
//     local title = createLabel(22,Config.ColorData.data_color4[1],nil,size.width/2, 12,"",this.scroll_view,nil,cc.p(0,0))
//     title:setString(txt)
//     container:addChild(title)
//     return container, title
// end

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(giftvo){
        var choose_num = 1;
        this.gift_vo = giftvo;
        if(!giftvo)return;
        var giftId = giftvo.id;

        var giftBid = giftvo.base_id;
        var item_list = [];
        if(Config.gift_data.data_choose_gift[giftBid]){
            var item = Utils.getItemConfig(giftBid);
            if(item && item.ext && item.ext.length>0){
                for(var i in item.ext){
                    choose_num = item.ext[i];
                }
            }
            var gift_cfg = Config.gift_data.data_choose_gift[giftBid];
            for(var i in gift_cfg){
                item_list.push(gift_cfg[i]);
            }
        }
        item_list.sort(Utils.tableLowerSorter(["sort_id"]));
        this.updateGiftList(giftId, giftBid, item_list, choose_num);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.item_list){
            this.item_list[i].deleteMe();
        }
        this.item_list = null;
        this.select_list = null;
        this.name_list = null;
    },
})