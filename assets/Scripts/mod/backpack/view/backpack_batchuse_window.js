// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-13 09:32:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var BackPackConst = require("backpack_const");

var Backpack_batchuseWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("backpack", "batchuse_panel_view");
        this.viewTag = SCENE_TAG.msg;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.cur_selected_sum = 0;                       // 当前选中消耗的数量
        this.select_goods = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.close_btn = this.main_container.getChildByName("close_btn");
    
        this.item = ItemsPool.getInstance().getItem("backpack_item");
        this.item.initConfig(true, 1, false);
        this.item.setParent(this.main_container)
        this.item.show();
        this.item.setPosition(-200, 140);
    
        this.use_btn = this.main_container.getChildByName("use_btn");
        this.use_btn_lab = this.use_btn.getChildByName("Label").getComponent(cc.Label);
        this.use_btn_lab.string = Utils.TI18N("使用");
    
        this.handle_container = this.main_container.getChildByName("handle_container");
        this.handle_container_cy = 0;
    
        //  如果不是产出资源类的,这个东西要居中父节点
        this.container = this.handle_container.getChildByName("container");
        this.container_y = this.container.y;
    
        this.sub_btn = this.container.getChildByName("sub_btn");                                 // 减号
        this.add_btn = this.container.getChildByName("add_btn");                                 // 加号
        this.max_btn = this.container.getChildByName("max_btn");                                 // 最大值
        this.slider = this.container.getChildByName("slider").getComponent(cc.Slider);// 滑块
        this.progress = this.container.getChildByName("ProgressBar").getComponent(cc.ProgressBar);
        // this.slider:setBarPercent(20, 80)
    
        this.value = this.container.getChildByName("value").getComponent(cc.Label);              // 使用数量提示
    
        this.use_title = this.container.getChildByName("title").getComponent(cc.Label);           // 使用数量提示
        this.use_title.string = Utils.TI18N("使用数量：");
    
        this.extend_container = this.handle_container.getChildByName("extend_container");
        this.use_item_title = this.extend_container.getChildByName("use_item_title").getComponent(cc.Label);
        this.use_item_title.string = "";
    
        this.use_effect = this.extend_container.getChildByName("use_effect").getComponent(cc.Label);
    
        this.title_label = this.main_container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("批量使用");
        this.item_name = this.main_container.getChildByName("item_name").getComponent(cc.Label);
        this.item_own = this.main_container.getChildByName("item_own").getComponent(cc.Label);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openBatchUseItemView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.use_btn, function () {
            if(this.item_vo == null || this.item_vo.config == null)return;
            this.cur_selected_sum = Math.min(this.cur_selected_sum,this.item_vo.quantity);
            if(this.cur_selected_sum == 0){
                message(Utils.TI18N("当前数量不能为0"));
                return;
            }
            if(this.type == BackPackConst.ItemConsumeType.use){
                this.ctrl.sender10515(this.item_vo.id, this.cur_selected_sum,this.select_goods);
            }else{
                // 金币市场的物品出售
                if(this.select_goods && this.select_goods.type && this.select_goods.type == 1){
                    // MarketController:getInstance():sender23502( this.item_vo.id,this.cur_selected_sum)
                    this.ctrl.openBatchUseItemView(false);
                    return
                }
                this.ctrl.sender10522(BackPackConst.Bag_Code.BACKPACK, [{id:this.item_vo.id, bid:this.item_vo.base_id,num:this.cur_selected_sum}]);
            }
        }.bind(this), 1);

        this.slider.node.on("slide",function(){
            this.setCurUseItemInfoByPercent(this.slider.progress);
            this.progress.progress = this.slider.progress;
        },this)

        Utils.onTouchEnd(this.sub_btn, function () {
            if(this.item_vo == null)return;
            var percent = this.slider.progress;
            if(percent == 0)return;//已经是最小的了
            if(this.cur_selected_sum == 0)return;
            this.cur_selected_sum = this.cur_selected_sum - 1;
            this.setCurUseItemInfoByNum(this.cur_selected_sum);
        }.bind(this), 1);

        Utils.onTouchEnd(this.add_btn, function () {
            if(this.item_vo == null)return;
            var percent = this.slider.progress;
            if(percent == 100)return;//已经是最大的了
            if(this.cur_selected_sum >= this.item_vo.quantity)return;
            this.cur_selected_sum = this.cur_selected_sum + 1;
            this.setCurUseItemInfoByNum(this.cur_selected_sum);
        }.bind(this), 1);

        Utils.onTouchEnd(this.max_btn, function () {
            if(this.item_vo == null)return;
            var percent = this.slider.progress;
            if(percent == 100)return;//已经是最大的了
            if(this.cur_selected_sum >= this.item_vo.quantity)return;
            this.cur_selected_sum = this.item_vo.quantity;
            this.setCurUseItemInfoByNum(this.cur_selected_sum);
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        var item = params[0];
        var type = params[1];
        var select_vo = params[2];

        this.type = type || BackPackConst.ItemConsumeType.use;
        this.item_vo = item;
        this.select_goods = select_vo;
        if(this.item_vo == null || this.item_vo.config == null){
            this.ctrl.openBatchUseItemView(false);
            return;
        }
        if(this.type == BackPackConst.ItemConsumeType.use){
            this.title_label.string = Utils.TI18N("批量使用");
            this.use_title.string = Utils.TI18N("使用数量：");
            this.use_btn_lab.string = Utils.TI18N("使用");
            this.updateItem();
        }else if(this.type == BackPackConst.ItemConsumeType.resolve){
            this.title_label.string = Utils.TI18N("批量分解");
            this.use_title.string = Utils.TI18N("分解数量：");
            this.use_btn_lab.string = Utils.TI18N("分解");
            this.updateCellItem();
        }else{
            this.title_label.string = Utils.TI18N("物品出售");
            this.use_title.string = Utils.TI18N("出售数量：");
            this.use_btn_lab.string = Utils.TI18N("出售");
            this.updateCellItem();
        }

        this.setUseInfo(100)
    },

    // --==============================--
    // --desc:针对出售类物品的处理
    // --@return 
    // --==============================--
    updateCellItem:function(){
        if(this.item_vo == null || this.item_vo.config ==null)return;
        this.item.setData(this.item_vo.config);
        this.item_name.string = this.item_vo.config.name;
        this.item_own.string = cc.js.formatStr(Utils.TI18N("拥有 %s 个"), this.item_vo.quantity);
        this.cur_selected_sum = this.item_vo.quantity;
        //  打开面板的时候,都是默认选中最大数量
        this.value.string = this.item_vo.quantity;
        //  设置最大
        this.slider.progress = 1;
        this.progress.progress = this.slider.progress;
        var value = this.item_vo.config.value;
        if(value != null && Utils.next(value) !=null){
            this.value_config = value[0];
            if(this.value_config == null || this.value_config[0] == null || typeof(this.value_config[0]) != "number")return;
            var base_id = this.value_config[0];
            var own = 0;
            var item_config = Utils.getItemConfig(base_id);
            if(item_config==null)return;
            
            if(this.value_config[0] == gdata("item_data", "data_assets_label2id", "coin")){
                own = this.role_vo.coin;
            }else if(this.value_config[0] == gdata("item_data", "data_assets_label2id", "hero_soul")){
                own = this.role_vo.hero_soul;
            }
            
            this.setCurUseItemInfoByPercent(1);
        }
        if(this.select_goods && this.select_goods.type && this.select_goods.type == 1){
            this.value_config = this.select_goods.value_list || {};
            this.setCurUseItemInfoByPercent(1);
        }
    },

    updateItem:function(){
        if(this.item_vo == null || this.item_vo.config == null)return;
        this.item.setData(this.item_vo.config);
        this.item_name.string = this.item_vo.config.name;
        this.item_own.string = cc.js.formatStr(Utils.TI18N("拥有 %s 个"), this.item_vo.quantity);
        this.cur_selected_sum = this.item_vo.quantity;
        //  打开面板的时候,都是默认选中最大数量
        this.value.string = this.item_vo.quantity;
        //  设置最大
        this.slider.progress = 1;
        this.progress.progress = this.slider.progress;
        // 如果是产出资产类的
        if(this.isAssetsItem(this.item_vo.config) == true){
            this.container.y = this.container_y;
            this.extend_container.active = true;
            //  直接取第一个效果吧
            if(this.item_vo.config.effect && Utils.next(this.item_vo.config.effect) != null){
                var effect = this.item_vo.config.effect[0];
                if(effect != null && this.role_vo != null){
                    var own = 0;
                    if(effect.effect_type == BackPackConst.item_effect_type.GOLD){
                        own = this.role_vo.coin;
                    }else if(effect.effect_type == BackPackConst.item_effect_type.COIN){
                        own = this.role_vo.coin;
                    }else if(effect.effect_type == BackPackConst.item_effect_type.PARTNER_EXP){
                        own = this.role_vo.partner_exp_all;
                    }
                }
            }
            this.setCurUseItemInfoByPercent(1);
        }else{
            this.container.y = this.handle_container_cy;
            this.extend_container.active = false;
        }
    },

    // --==============================--
    // --desc:设置当前进度的相关数据
    // --@percent:
    // --@return 
    // --==============================--
    setCurUseItemInfoByPercent:function(percent){
        if(this.item_vo == null)return;
        this.cur_selected_sum = Math.max(1, Math.floor( percent * this.item_vo.quantity));
        this.setUseInfo(this.cur_selected_sum);
    },

    setCurUseItemInfoByNum:function(num){
        if(this.item_vo == null)return;
        this.cur_selected_sum = Math.max(1, num);
        var all_num =Math.max(1,this.item_vo.quantity-1);
        var percent = (this.cur_selected_sum-1) / all_num;
        this.slider.progress = percent;
        this.progress.progress = this.slider.progress;
        this.setUseInfo(this.cur_selected_sum);
    },

    setUseInfo:function(sum){
        sum = Math.min(this.item_vo.quantity,sum);
        this.value.string = sum;
        if(this.type == BackPackConst.ItemConsumeType.sell && this.value_config !=null){
            var base_value = this.value_config[1] || 0;
            var base_id = this.value_config[0];
            if(base_id== null)return; 
            var item_config = Utils.getItemConfig(base_id);
            if(item_config==null)return;
            this.use_item_title.string = cc.js.formatStr(Utils.TI18N("出售后可获得%s："), item_config.name);
            this.use_effect.string = base_value * sum;
            this.use_effect.node.x = this.use_item_title.node.getContentSize().width + this.use_item_title.node.x;
        }else if(this.type == BackPackConst.ItemConsumeType.resolve && this.value_config != null){
            var base_value = this.value_config[1] || 0;
            var base_id = this.value_config[0];
            if(base_id ==null)return;
            var item_config = Utils.getItemConfig(base_id);
            if(item_config == null)return;
            this.use_item_title.string = cc.js.formatStr(Utils.TI18N("分解后可获得%s："), item_config.name);
            this.use_effect.string = base_value * sum;
            this.use_effect.node.x = this.use_item_title.node.getContentSize().width + this.use_item_title.node.x; 
        }else{
            if(this.item_vo == null || this.item_vo.config == null || this.item_vo.config.effect == null || Utils.next(this.item_vo.config.effect) == null)return;
            if(this.isAssetsItem(this.item_vo.config) == false)return;
            var effect = this.item_vo.config.effect[0];
            if(effect!=null){
                this.use_item_title.string = cc.js.formatStr(Utils.TI18N("使用后可获得%s："), Config.item_data.data_item_effect_type[effect.effect_type]);
                this.use_effect.string = effect.val * sum;
                this.use_effect.node.x = this.use_item_title.node.getContentSize().width + this.use_item_title.node.x;
            }
        }
    },

    // --==============================--
    // --desc:是否是财产类的物品
    // --@return 
    // --==============================--
    isAssetsItem:function(config){
        if(config == null){
            return false;
        }
        if(config.effect == null || Utils.next(config.effect) == null){
            return false;
        }
        var is_assets = false;
        for(var i in config.effect){
            var v = config.effect[i];
            if(v.effect_type == BackPackConst.item_effect_type.GOLD ||
            v.effect_type == BackPackConst.item_effect_type.COIN ||
            v.effect_type == BackPackConst.item_effect_type.PARTNER_EXP){
                is_assets = true;
                break;
            }
        }
        return is_assets;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item){
            this.item.deleteMe();
        }
        this.item = null;
        this.ctrl.openBatchUseItemView(false);
    },
})