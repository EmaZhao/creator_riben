// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     竖版伙伴主界面的子项
// <br/>Create: 2019-02-28 14:29:41
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StartowerController = require("startower_controller");
var BattleDramaController = require("battle_drama_controller");




var Star_tower_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_item");
        this.ctrl = StartowerController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.is_lock = false;
        this.is_open_tower = true;
        this.star_list = {};
        this.config = Config.star_tower_data.data_tower_base;
        this.itemNum = 6 // 层级奖励
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        //背景
        this.background = this.main_panel.getChildByName("bg");
        //选中背景
        this.select_bg = this.main_panel.getChildByName("select_bg");
        this.select_bg.active = false;
    
        this.tower_name = this.main_panel.getChildByName("name").getComponent(cc.Label);
        // 锁
        this.lock_icon = this.main_panel.getChildByName("lock");
        // 通关图标
        this.pass_icon = this.main_panel.getChildByName("pass_icon");
        this.pass_icon.active = false;
        // 关键层奖励
        this._floorAward = this.main_panel.getChildByName("floorAward");
        this._firstAward = this._floorAward.getChildByName("firstAward");
        this._floorAward.active = false;
        // 扫荡次数
        this.countVisible(false);
        // 点击进入
        this.come_label =this.main_panel.getChildByName("Image_4");
        this.come_label.active = false;
    },

    countVisible:function(visible){
        var countBG = this.main_panel.getChildByName("countBG");
        countBG.active = visible;
        this._textCount = countBG.getChildByName("textCount").getComponent(cc.Label);
        this._textCount.active = visible;
        this._dianmond = countBG.getChildByName("dianmond");
        this.loadRes(PathTool.getItemRes(15), (function(resObject){
            this._dianmond.getComponent(cc.Sprite).spriteFrame = resObject;
        }).bind(this));
        this._dianmond.active = false;
    },

    setData:function(index){
        if(!index)return;
        var data = this.config[index];
        this.data = data;
        if(this.main_panel){
            this.updateData();
        }
    },

    updateData:function(){
        if(!this.main_panel || this.data == null)return;
        var name = this.data.name || "";
        this.tower_name.string = name;
        this.main_panel.name = "guildsign_startower_" + this.data.lev;

        this.updateMessage();
    },

    sweepCount:function(data){
        this.pass_icon.active = false;
        this.countVisible(false);
        var max_tower = this.model.getNowTowerId() || 0;
        if(data && data.lev == max_tower){
            var count = this.model.getTowerLessCount() || 0;
            var buyCount = this.model.getBuyCount();
            if(count <= 0){
                if(buyCount >= 0){
                    this.countVisible(true);
                    this._dianmond.active = true;
                    var have_buycount = this.model.getBuyCount() || 0;
                    if(Config.star_tower_data.data_tower_buy[have_buycount+1]){
                        var num = Config.star_tower_data.data_tower_buy[have_buycount+1].expend[0][1] || 0;
                        var str = cc.js.formatStr(Utils.TI18N("   %d掃討"),num);
                        this._textCount.string = str;
                    }else{
                        this.countVisible(false);
                        this._dianmond.active = false;
                        this.pass_icon.active = true;
                    }
                }else{
                    this.countVisible(false);
                    this._dianmond.active = false;
                    this.pass_icon.active = true;
                }
            }else{
                var str = cc.js.formatStr(Utils.TI18N("可扫荡%d次"),count);
                this._textCount.string = str;
                this.countVisible(true);
                this._dianmond.active = false;
                this.pass_icon.active = false;
            }
        }
        if(data.lev != max_tower && data.lev < max_tower){
            this.pass_icon.active = true;
        }
        // 层级奖励
        var max_tower = this.model.getNowTowerId() || 0;
        var max = max_tower;
        if(max_tower+this.itemNum >= this.config.length){
            max = this.config.length;
        }else{
            max = max_tower+this.itemNum;
        }

        var current = max_tower;
        if(max_tower+1 >= this.config.length){
            current = this.config.length;
        }else{
            current = max_tower+1
        }

        if(this.data.lev > current && this.data.lev <= max){
            var item_show = this.config[this.data.lev].item_show[0];
            if(item_show){
                var baseid = item_show[0];
                var num = item_show[1];
                
                if(this.goods_item == null){
                    var item = ItemsPool.getInstance().getItem("backpack_item");
                    item.setParent(this._floorAward);
                    item.initConfig(null, 0.6, false, true);
                    item.setPosition(62,51);
                    item.show();
                    this.goods_item = item;
                }
                var item = this.goods_item;
                
                // item:setDefaultTip()
                this._firstAward.zIndex = 10;
                var itemVo = {bid:baseid, num:num};
                item.setData(itemVo)
                this._floorAward.active = true;
            }else{
                this._floorAward.active = false;
            }
        }else{
            this._floorAward.active = false;
        }
    },

    updateMessage:function(){
        if(!this.data)return;
        var max_tower = this.model.getNowTowerId() || 0;
        var bool = false;
        if(this.data.lev <= max_tower){
            bool = true;    
        }
        this.is_pass = bool;
        this.sweepCount(this.data);

        this.is_lock = this.data.lev > max_tower+1;
        this.lock_icon.active = this.is_lock;
        this.come_label.active = false;

        // this.come_label.node.stopAllActions();
        this.is_open_tower = true;
        if(this.is_pass == false && this.is_lock == false){
            var limit_dun_id = this.data.limit_dun_id || 0;
            var data = BattleDramaController.getInstance().getModel().getDramaData();
            if(limit_dun_id!=0 && data && data.max_dun_id && data.max_dun_id < limit_dun_id){
                this.is_open_tower = false;
                return;
            }
            if(this.data.lev == max_tower+1){
                this.come_label.active = true;
                // CommonAction.breatheShineAction(this.come_label.node, 1, 1);
                this.setSelectStatus(true);
            }else{
                this.setSelectStatus(false);
            }
        }else{
            this.setSelectStatus(false);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

        this.main_panel.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.clickHandler();
        }, this)
    },

    clickHandler:function(){
        if(this.call_fun){
            this.call_fun(this.data);
        }
    },

    addCallBack:function(call_fun){
        this.call_fun =call_fun;
    },

    setSelectStatus:function(bool){
        this.select_bg.active = bool;
    },

    setVisibleStatus:function(bool){
        this.active = bool;
    },

    getData:function(){
        return this.data;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.updateData();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.come_label){
            // this.come_label.node.stopAllActions();
        }

        if(this.goods_item){
            this.goods_item.deleteMe();
            this.goods_item = null;
        }
    },
})