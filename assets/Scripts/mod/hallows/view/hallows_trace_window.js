// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     圣印窗体
// <br/>Create: 2019-02-20 14:15:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackController = require("backpack_controller");

var Hallows_traceWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_trace_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.attr_list = {};
        this.this_use_num = 0;
        this.cost_config = Config.hallows_data.data_const.id_stone;
        this.attr_config = Config.hallows_data.data_const.stone_attribute;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var main_panel = this.root_wnd.getChildByName("main_panel")

        this.background_img = main_panel.getChildByName("background").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1003"), (function(resObject){
            this.background_img.spriteFrame = resObject;
        }).bind(this));

        this.Image_1 = main_panel.getChildByName("Image_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1036"), (function(resObject){
            this.Image_1.spriteFrame = resObject;
        }).bind(this));

        this.Image_2 = main_panel.getChildByName("Image_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1013"), (function(resObject){
            this.Image_2.spriteFrame = resObject;
        }).bind(this));

        this.Image_5 = main_panel.getChildByName("Image_5").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1037"), (function(resObject){
            this.Image_5.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_5 = main_panel.getChildByName("Sprite_5").getComponent(cc.Sprite);
        this.Sprite_6 = main_panel.getChildByName("Sprite_6").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1033"), (function(resObject){
            this.Sprite_5.spriteFrame = resObject;
            this.Sprite_6.spriteFrame = resObject;
        }).bind(this));

        this.Sprite_23 = main_panel.getChildByName("Sprite_23").getComponent(cc.Sprite);
        this.Sprite_23_0 = main_panel.getChildByName("Sprite_23_0").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1016"), (function(resObject){
            this.Sprite_23.spriteFrame = resObject;
            this.Sprite_23_0.spriteFrame = resObject;
        }).bind(this));

        var win_title = main_panel.getChildByName("win_title").getComponent(cc.Label);
        win_title.string = Utils.TI18N("圣印");
        
        var attr_title = main_panel.getChildByName("attr_title").getComponent(cc.Label);
        attr_title.string = Utils.TI18N("当前属性");
        
        var desc = main_panel.getChildByName("desc").getComponent(cc.Label);
        desc.string = Utils.TI18N("来源:充值活动");
     
        this.cost_item = ItemsPool.getInstance().getItem("backpack_item");
        this.cost_item.setParent(main_panel);
        this.cost_item.setPosition(336-main_panel.width/2, 290 - main_panel.height/2);
        this.cost_item.initConfig(false, 1, false, true);
        this.cost_item.show();
        this.can_use_label = main_panel.getChildByName("can_use_label").getComponent(cc.RichText)
    
        this.max_btn = main_panel.getChildByName("max_btn")
        this.plus_btn = main_panel.getChildByName("plus_btn")
        this.min_btn = main_panel.getChildByName("min_btn")
        this.slider = main_panel.getChildByName("slider").getComponent(cc.Slider);// 滑块
        this.progress = main_panel.getChildByName("ProgressBar").getComponent(cc.ProgressBar);
    
        this.upgrade_btn = main_panel.getChildByName("upgrade_btn")
        this.upgrade_btn_label = this.upgrade_btn.getChildByName("label").getComponent(cc.Label);
        this.upgrade_btn_label.string = Utils.TI18N("使用");

        for(var i = 1;i<3;i++){
            var attr = main_panel.getChildByName("attr_"+i);
            if(attr){
                var object = {};
                object.item = attr;
                object.icon = attr.getChildByName("icon").getComponent(cc.Sprite);
                object.label = attr.getChildByName("label").getComponent(cc.Label);
                this.attr_list[i] = object;
            }
        }

        this.close_btn = main_panel.getChildByName("close_btn")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openHallowsTraceWindow(false);
        }, this)

        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openHallowsTraceWindow(false);
        }, this)

        this.upgrade_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            if(this.data){
                if(this.this_use_num == 0){
                    this.ctrl.openHallowsTraceWindow(false);
                }else{
                    if(this.num == 0){
                        message(Utils.TI18N("使用数量不能为0"))
                    }else{
                        this.ctrl.requestUseTraceItem(this.data.id, this.num);
                    }
                }
            }
        }, this)

        this.slider.node.on("slide",function(){
            this.setComposeNumByPercent(this.slider.progress);
            this.progress.progress = this.slider.progress;
        },this)

        this.min_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            var percent = this.slider.progress;
            if(percent == 0)return;
            if(this.num == 0)return;
            if(this.this_use_num == 0)return;
            this.num = this.num - 1;
            this.setComposeNum(this.num);
        }, this)

        this.plus_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            var percent = this.slider.progress;
            if(percent == 1)return;
            if(this.this_use_num == 0)return;
            if(this.num >= this.this_use_num)return;
            this.num = this.num + 1;
            this.setComposeNum(this.num);
        }, this)


        this.max_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            var percent = this.slider.progress;
            if(percent == 1)return;
            if(this.this_use_num == 0)return;
            if(this.num >= this.this_use_num)return;
            this.num = this.this_use_num;
            this.setComposeNum(this.num);
        }, this)

    },

    setComposeNum:function(num){
        this.num = num;
        var percent = this.num / this.this_use_num || 0;
        this.slider.progress = percent;
        this.progress.progress = this.slider.progress;
        this.fileNum(num);
    },

    setComposeNumByPercent:function(percent){
        this.num = Math.floor( percent * this.this_use_num )
        this.fileNum(this.num);
    },

    fileNum:function(num){
        if(this.had_max_num == null)return;
        this.cost_item.setNeedNum(num , this.had_max_num)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        if(data && data.vo && this.cost_config){
            this.had_use_num = data.vo.seal;             // 当前使用的数量
            this.use_max_num = this.getUseMaxNum();      // 当前最高可使用数量

            //数据异常
            if(this.use_max_num == 0)return;
            var max_step = Config.hallows_data.data_max_lev[this.data.id];
            if(max_step == null)return;
            var step = this.data.vo.step;
            //没吃满,都显示可以使用的
            if(this.had_use_num < this.use_max_num){
                this.can_use_label.string = cc.js.formatStr(Utils.TI18N("当前已使用:%s/%s"), this.had_use_num, this.use_max_num);
            }else{
                if(step >= max_step){//已经满级的
                    this.can_use_label.string = cc.js.formatStr(Utils.TI18N("已达最大使用数量:%s/%s"), this.had_use_num, this.use_max_num)
                }else{
                    //找出下一阶的
                    var next_config = gdata("hallows_data","data_trace_cost",Utils.getNorKey(this.data.id, step+1));
                    if(next_config){
                        this.can_use_label.string = cc.js.formatStr(Utils.TI18N("圣器%s阶可增加使用数量:%s"), step+1, (next_config.num - this.had_use_num) )
                    }
                }
            }

            this.can_use_num = this.use_max_num - this.had_use_num                              // 当前剩余可使用数量
            if(this.can_use_num < 0){
                this.can_use_num = 0;
            }
            //当前背包中数量
            this.had_max_num = BackpackController.getInstance().getModel().getItemNumByBid(this.cost_config.val);     // 背包中总数量
            var itemVo = {bid:this.cost_config.val, num:this.had_max_num};
            this.cost_item.setData(itemVo)  
            this.this_use_num = Math.min(this.can_use_num, this.had_max_num)                                          //这次最多可使用的数量
            this.num = this.this_use_num;        // 当前数量
            this.setComposeNum(this.num);
            this.setBaseAttrList()

        }
    },

    //设置当前圣印总属性
    setBaseAttrList:function(){
        if(this.cost_config == null || this.attr_config == null)return;
        if(this.had_use_num == null){
            this.had_use_num = 0;
        }

        for(var i in this.attr_list){
            this.attr_list[i].item.active = false;
        }

        for(var j in this.attr_config.val){
            var v = this.attr_config.val[j];
            var attr_key = v[0];
            var attr_val = v[1] * this.had_use_num ;
            var attr_name = Config.attr_data.data_key_to_name[attr_key];
            if(attr_name){
                var attr_icon = PathTool.getAttrIconByStr(attr_key);
                var attr_str = cc.js.formatStr(Utils.TI18N(" %s +%s"),attr_name, attr_val);

                var object = this.attr_list[parseInt(j)+1];
                if(object){
                    object.item.active = true;
                    var res = PathTool.getCommonIcomPath(attr_icon);
                    this.loadRes(res, function (icon,sf_obj) {
                        icon.spriteFrame = sf_obj;
                    }.bind(this,object.icon));
                    object.label.string = attr_str;
                }
            }
        }
    },

    //返回当前阶数最大可使用的数量的配置表
    getUseMaxNum:function(){
        if(this.data == null || this.data.vo == null)return;
        var trace_cost_config = gdata("hallows_data","data_trace_cost",Utils.getNorKey(this.data.id, this.data.vo.step));
        if(trace_cost_config){
            return trace_cost_config.num
        }
        return 0
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.cost_item){
            this.cost_item.onDelete();
        }
        this.cost_item = null
        this.ctrl.openHallowsTraceWindow(false);
    },
})