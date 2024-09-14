// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     战令三期 奖励
// <br/>Create: 2019-08-10 16:24:24
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller");
var CommonScrollViewSingle = require("common_scrollview_single");
var OrderActiodRewardItem = require("orderaction_reward_item_panel");
var OrderActionEvent = require("orderaction_event");
var OrderactionController = require("orderaction_controller");

var Orderaction_rewardPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "reward_panel1");
        this.ctrl =  OrderactionController.getInstance();
        this.model = this.ctrl.getModel();
        this.cur_period = arguments[0] || 1;
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.cur_move_num = null;
        this.is_init = true;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");
        var text_1 = this.main_container.getChildByName("Image_1").getChildByName("Text_1").getComponent(cc.Label);
        text_1.string = Utils.TI18N("等级");
        var text_1_0 = this.main_container.getChildByName("Image_1").getChildByName("Text_1_0").getComponent(cc.Label);
        text_1_0.string = Utils.TI18N("奖励");
        var text_1_1 = this.main_container.getChildByName("Image_1").getChildByName("Text_1_1").getComponent(cc.Label);
        text_1_1.string = Utils.TI18N("进阶奖励");
        
        var text_2 = this.main_container.getChildByName("Image_14").getChildByName("Text_2").getComponent(cc.Label);
        text_2.string = Utils.TI18N("奖励预览");
        this.lev_num = this.main_container.getChildByName("Image_14").getChildByName("lev_num").getComponent(cc.Label);
        this.lev_num.string = "";
        this.slide_goods_item = this.main_container.getChildByName("slide_goods_item");
        this.slide_goods_content = this.slide_goods_item.getChildByName("content");
        
        this.lock_image = this.main_container.getChildByName("lock_image");
        this.btn_change_advance = this.lock_image.getChildByName("btn_change_advance");
        this.lock_image.active = true;
        if(this.model.getGiftStatus() == 1){
            this.lock_image.active = false;
        }else{
            this.lock_image.active = true;
        }
        var goods_item = this.main_container.getChildByName("goods_item");
        var scroll_view_size = goods_item.getContentSize();
        var setting = {
            start_x: 0,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 635,               // 单元的尺寸width
            item_height: 116,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
            need_dynamic: true,
        }

        this.reward_goods_item = new CommonScrollViewSingle();
        this.reward_goods_item.createScroll(goods_item, cc.v2(0,0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);

        this.reward_goods_item.registerScriptHandlerSingle(this.createTaskCell.bind(this), ScrollViewFuncType.CreateNewCell)//--创建cell
        this.reward_goods_item.registerScriptHandlerSingle(this.numberOfTaskCells.bind(this), ScrollViewFuncType.NumberOfCells)//-获取数量
        this.reward_goods_item.registerScriptHandlerSingle(this.updateTaskCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex)//更新cell

        var cur_lev = this.model.getCurLev();
        this.setChangeLevelStatus(cur_lev);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(OrderActionEvent.OrderAction_Updata_LevExp_Event,function(data){
            if(data){
                this.setChangeLevelStatus(data.lev);
            }
        }.bind(this));

        this.addGlobalEvent(OrderActionEvent.OrderAction_LevReward_Event,function(lev){
            this.setChangeLevelStatus(lev);
        }.bind(this));

        // 进阶卡情况
        this.addGlobalEvent(OrderActionEvent.OrderAction_BuyGiftCard_Event,function(){
            var cur_lev = this.model.getCurLev();
            this.setChangeLevelStatus(cur_lev);
            if(this.model.getGiftStatus() == 1){
                this.lock_image.active = false;
            }else{
                this.lock_image.active = true;
            }
        }.bind(this));

        Utils.onTouchEnd(this.btn_change_advance, function () {
            this.ctrl.openBuyCardView(true);
        }.bind(this), 1);
    },

    createTaskCell:function(){
        var cell = new OrderActiodRewardItem();
        cell.show();
        return cell;
    },
    
    numberOfTaskCells:function(){
        if(!this.reward_list)return 0;
        return this.reward_list.length;
    },

    updateTaskCellByIndex:function(cell, index){
        if(!this.reward_list)return;
        var cell_data = this.reward_list[index];
        if(!cell_data){
            return;
        }
        cell.setData(cell_data);
        this.setSlideGoodsItem(cell_data.lev);
    },

    //滑动物品显示
    setSlideGoodsItem:function(lev_index){
        var count = Object.keys(Config.holiday_war_order_data.data_lev_reward_list[this.cur_period]).length || 1;
        lev_index = Math.ceil(lev_index*0.1);

        if(this.cur_move_num == lev_index)return;
        this.cur_move_num = lev_index;
        var cur_index = this.cur_move_num * 10;
        if(cur_index >= count){
            cur_index = count;
        }

        if(cur_index == 0){
            cur_index = 1;
        }

        if(!Config.holiday_war_order_data.data_lev_reward_list[this.cur_period])return;
        var data = Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][cur_index];
        if(!data)return;

        this.lev_num.string = "("+data.lev+")";
        if(!this.common_item){
            this.common_item  = ItemsPool.getInstance().getItem("backpack_item");
            this.common_item.initConfig(false, 0.8);
            this.common_item.setParent(this.main_container);
            this.common_item.setPosition(263, 58);
            this.common_item.setDefaultTip();
            this.common_item.show();
        }

        if(data.reward && Utils.next(data.reward) != null){
            this.common_item.setData({bid:data.reward[0][0], num:data.reward[0][1]});
    		this.common_item.setVisible(true);
        }else{
            this.common_item.setVisible(false);
        }

        var data_list = data.rmb_reward || [];
        var setting = {};
        setting.scale = 0.8;
        setting.max_count = 3;
        this.slide_goods_list = Utils.commonShowSingleRowItemList(this.slide_goods_item, this.slide_goods_list, data_list, setting,this.slide_goods_content);
    },


    // 当等级变化的时候
    setChangeLevelStatus:function(cur_lev){
        if(Config.holiday_war_order_data.data_lev_reward_list[this.cur_period]){
            this.reward_list = [];
            for(var i in Config.holiday_war_order_data.data_lev_reward_list[this.cur_period]){
                var v = Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i];
                v.cur_lev = cur_lev;
                v.status = 0;
                v.rmb_status = 0;
                v.is_locak = this.model.getGiftStatus();
                var lev_list = this.model.getLevShowData(v.lev);
                if(lev_list){
                    v.status = lev_list.status;
	    		    v.rmb_status = lev_list.rmb_status;
                }
                if(v.status == 1 && v.rmb_status == 1){

                }else{
                    this.reward_list.push(v);
                }
            }
            if(Utils.next(this.reward_list) == null){
                if(this.common_item){
                    this.common_item.setVisible(false);
                }
                if(this.slide_goods_item){
                    this.slide_goods_item.active = false;
                }
                this.lev_num.string = Utils.TI18N("(领取完毕)");
                this.reward_goods_item.reloadData();
                Utils.commonShowEmptyIcon(this.main_container, true, {font_size: 22,scale: 1, text: Utils.TI18N("已领取所有奖励")});
            }else{
                this.reward_list.sort(function(a,b){
                    return a.lev - b.lev;
                });
                // if(this.is_init == true){
                //     this.is_init = false;
                //     this.reward_goods_item.reloadData();
                // }else{
                //     this.reward_goods_item.resetCurrentItems();
                // }
                this.reward_goods_item.reloadData();
            }
        }
    },

    setVisibleStatus:function(bool){
        bool = bool || false;
        this.setVisible(bool);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if (this.reward_goods_item) {
            this.reward_goods_item.deleteMe();
            this.reward_goods_item = null;
        }

        if(this.slide_goods_list){
            for(var i in this.slide_goods_list){
                this.slide_goods_list[i].deleteMe();
            }   
            this.slide_goods_list = null;
        }
        if(this.common_item){
            this.common_item.deleteMe();
            this.common_item = null;
        }
        // self:removeAllChildren()
        // self:removeFromParent()
    },
})