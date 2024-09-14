// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-08 12:02:54
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StoneDungeonController = require("stone_dungeon_controller");
var RoleController      = require("role_controller");

var Stone_dungeonItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("stonedungeon", "stone_dungeon_item");
        this.ctrl = StoneDungeonController.getInstance();
        this.model = StoneDungeonController.getInstance().getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.item_list = [];
        this.role_vo = RoleController.getInstance().getRoleVo();

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.Image_bg = this.root_wnd.getChildByName("Image_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("Currency_2_1"), (function(resObject){
            this.Image_bg.spriteFrame = resObject;
        }).bind(this));

        this.item_scrollView = this.root_wnd.getChildByName("item_scrollview");
        this.content = this.item_scrollView.getChildByName("content");

        this.diff_lev = this.root_wnd.getChildByName("diff_lev").getComponent(cc.Sprite);
        this.diff_text = this.root_wnd.getChildByName("diff_lev").getChildByName("Text_1").getComponent(cc.Label);
        this.jian = this.root_wnd.getChildByName("Sprite_1");
        this.jian.active = false;
        this.textNumber = this.root_wnd.getChildByName("textNumber").getComponent(cc.Label);
        this.btnChange = this.root_wnd.getChildByName("btnChange");
        this.textChange = this.btnChange.getChildByName("btn_label").getComponent(cc.RichText);
        this.textChange.string = "<color=#ffffff><outline color=#000000 width=2>挑戦</outline></color>";
        this.btnChange.sprite = this.btnChange.getComponent(cc.Sprite);

        this.btnClear = this.root_wnd.getChildByName("btnClear");
        this.textClear = this.btnClear.getChildByName("btn_label").getComponent(cc.RichText);
        this.textClear.string = "<color=#ffffff><outline color=#000000 width=2>掃討</outline></color>";
        this.btnClear.active = false;

        if(this.dungeonData){
            this.setChangeData();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        //扫荡
        Utils.onTouchEnd(this.btnClear, function () {
            this.ctrl.send13032(this.dungeonData.id);
        }.bind(this), 1);
        
        // 挑战
        Utils.onTouchEnd(this.btnChange, function () {
            if(this.role_vo.lev < this.dungeonData.lev_limit){
                message(this.dungeonData.lev_limit+Utils.TI18N("级开启"));
            }else{
                this.ctrl.send13031(this.dungeonData.id);
            }
        }.bind(this), 1);
    },
    

    setExtendData:function(tab){
        this.expend = tab.expend
        this.free_count = tab.count
        this.title_pos = tab.title_pos
    },

    setData:function(data){
        this.dungeonData = data;
        this.setChangeData(data);
    },

    setChangeData:function(){
        if(!this.root_wnd)return;

        this.btnChange.name = "stone_change_btn_" + this.dungeonData.id;

        if(this.dungeonData.title_name!=""){
            this.diff_text.string = this.dungeonData.title_name;
        }else{
            this.diff_text.string = "";
        }

        if(this.title_pos == this.dungeonData.difficulty){
            this.jian.active = true;
        }else{
            this.jian.active = false;
        }

        this.btnChange.active = false;
        this.btnClear.active = false;
        var hex = gdata("color_data", "data_color16", 253+this.dungeonData.difficulty);
        this.diff_text.node.color.fromHEX(hex);
        this.textNumber.string = cc.js.formatStr(Utils.TI18N("战力%d开启"), this.dungeonData.power || 0);
        this.textNumber.node.active = true;
        var is_first = 1
        var clearance = this.model.getPassClearanceID(this.dungeonData.id);
        
        this.btnChange.getComponent(cc.Button).interactable = true;
        this.btnChange.getComponent(cc.Button).enableAutoGrayEffect = false;
        
        if(clearance && clearance.status == 1){//已经通关的
            if(this.role_vo.max_power >= this.dungeonData.power){
                this.textNumber.node.active = false;
                this.btnClear.active = true;
                if(this.free_count == 0){
                    this.textClear.string = cc.js.formatStr(Utils.TI18N("<img src='%s'/><color=#ffffff><outline color=#000000 width=2>%s 掃討</outline></color>"), 15, this.expend);
                    this.loadRes(PathTool.getItemRes(15), (function(resObject){
                        this.textClear.addSpriteFrame(resObject);
                    }).bind(this));
                }else{
                    this.textClear.string = "<color=#ffffff><outline color=#000000 width=2>掃討</outline></color>";
                }
            }else{
                this.btnClear.active = false;
                this.btnChange.active = true;
                this.textChange.string = `<color=#ffffff >${Utils.TI18N("未开启")}</color>`;
                
                this.btnChange.getComponent(cc.Button).interactable = false;
                this.btnChange.getComponent(cc.Button).enableAutoGrayEffect = true;
            }
            is_first = null;
        }else{
            this.btnClear.active = false;
            if(this.role_vo.max_power >= this.dungeonData.power){
                this.textNumber.node.active = false;
                this.btnChange.active = true;
                var status = false;
                if(this.role_vo.lev < this.dungeonData.lev_limit){
                    var str = cc.js.formatStr(`<color=#ffffff >${Utils.TI18N("%d级开启")}</color>`,this.dungeonData.lev_limit);
                    this.textChange.string = str;
                    status = true;
                }else{
                    if(this.free_count == 0){//scale=0.25
                        this.textChange.string = cc.js.formatStr("<img src='%s'/><color=#ffffff><outline color=#000000 width=2>%s 挑戦</outline></color>", 15, this.expend);
                        this.loadRes(PathTool.getItemRes(15), (function(resObject){
                            this.textChange.addSpriteFrame(resObject);
                        }).bind(this));
                    }else{
                        this.textChange.string = "<color=#ffffff><outline color=#000000 width=2>挑戦</outline></color>";
                    }
                }
                this.btnChange.getComponent(cc.Button).interactable = !status;
                this.btnChange.getComponent(cc.Button).enableAutoGrayEffect = status;
            }else{
                this.btnChange.active = true;
                var str = "<color=#ffffff >未開放</color>"
                if(this.role_vo.lev < this.dungeonData.lev_limit){
                    str = cc.js.formatStr(`<color=#ffffff >${Utils.TI18N("%d级开启")}</color>`,this.dungeonData.lev_limit)
                }
                this.textChange.string = str;
                this.btnChange.getComponent(cc.Button).interactable = false;
                this.btnChange.getComponent(cc.Button).enableAutoGrayEffect = true;
            }
        }
        
        this.loadRes(PathTool.getUIIconPath("activity",this.dungeonData.pis_str), (function(resObject){
            this.diff_lev.spriteFrame = resObject;
        }).bind(this));
        for(var i in this.item_list){
            this.item_list[i].setVisible(false);
        }
        // 首通奖励
        this.firstAward(is_first);
        // 展示奖励
        this.showAward(is_first);

        if(this.item_scrollView){
            this.item_scrollView.off(cc.Node.EventType.TOUCH_START, this.item_scrollView._onTouchBegan, this.item_scrollView, true);
            this.item_scrollView.off(cc.Node.EventType.TOUCH_MOVE, this.item_scrollView._onTouchMoved, this.item_scrollView, true);
            this.item_scrollView.off(cc.Node.EventType.TOUCH_END, this.item_scrollView._onTouchEnded, this.item_scrollView, true);
            this.item_scrollView.off(cc.Node.EventType.TOUCH_CANCEL, this.item_scrollView._onTouchCancelled, this.item_scrollView, true);
        }
    },

    firstAward:function(is_first){
        if(!is_first)return;
        if(this.dungeonData.first_items[0]){
            if(!this.item_list[0]){
                
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.setParent(this.content);
                item.initConfig(null, 0.8, false, false);
                item.setAnchorPoint(0, 0.5);
                item.show();
                // item.setFirstIcon(true);
                this.item_list[0] = item;
            }
            if(this.item_list[0]){
                this.item_list[0].setVisible(true)
                this.item_list[0].setPosition(cc.v2(4,0))
                this.item_list[0].setData({bid:this.dungeonData.first_items[0][0], num:this.dungeonData.first_items[0][1]});
                this.item_list[0].setDefaultTip()
            }
        }
    },

    showAward:function(is_first){
        var _flag = is_first && 1 || 0;
        if(!this.dungeonData.first_items[0]){
            _flag = 0;
            is_first = null;
        }
        var total_width = 135 * (this.dungeonData.show_items.length+_flag) * 0.8 + (this.dungeonData.show_items.length+_flag) * 5
        this.content.setContentSize(cc.size(total_width, this.content.getContentSize().height));
        this.item_scrollView.setContentSize(cc.size(total_width, this.content.getContentSize().height));

        for(var i in this.dungeonData.show_items){
            var i = parseInt(i);
            if(!this.item_list[1+i]){
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.setAnchorPoint(0, 0.5)
                item.initConfig(null, 0.8, false, false);
                item.setParent(this.content);
                item.show();
                this.item_list[1+i] = item
            }
            if(this.item_list[1+i]){
                if(is_first){
                    this.item_list[1+i].setPosition(4*(i+1) + 109*i+109/2,0);
                }else{
                    this.item_list[1+i].setPosition(4*i + 109*i + 109/2,0);
                }
                this.item_list[1+i].setVisible(true)
                this.item_list[1+i].setData({bid:this.dungeonData.show_items[i][0],num:this.dungeonData.show_items[i][1]})
                this.item_list[1+i].setDefaultTip();
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        
    },


    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_list){
            for(var k in this.item_list){
                var v = this.item_list[k];
                if(v){
                    v.deleteMe();
                    v = null
                }
            }
            this.item_list = null;
        }
    },
})
