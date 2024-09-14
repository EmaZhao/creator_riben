// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     使用药品的
// <br/>Create: 2019-05-10 14:09:13
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Adventure_use_hpWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_use_hp_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.index = 2;
        this.hero_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){

        Utils.getNodeCompByPath("container/choose_container/cancen_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("取消");
        Utils.getNodeCompByPath("container/choose_container/confirm_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("确定");
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var container = this.root_wnd.getChildByName("container");
    
        this.skill_name = container.getChildByName("skill_name").getComponent(cc.Label);
        this.skill_desc = container.getChildByName("skill_desc").getComponent(cc.Label);
        this.skill_num = container.getChildByName("skill_num").getComponent(cc.Label);
    
        this.choose_container = container.getChildByName("choose_container");
        var choose_title = this.choose_container.getChildByName("choose_title").getComponent(cc.Label);
        choose_title.string = Utils.TI18N("请选择使用目标");
        
        this.total_width = this.choose_container.getContentSize().width;
    
        this.cancen_btn = this.choose_container.getChildByName("cancen_btn");
        this.confirm_btn = this.choose_container.getChildByName("confirm_btn");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAdventureUseHPWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.cancen_btn, function () {
            this.ctrl.openAdventureUseHPWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.confirm_btn, function () {
            if(this.select_cell == null){
                message(Utils.TI18N("请选择使用英雄"));
			    return;
            }
            var data = this.select_cell.getData();
            if(data == null || data.partner_id == null || data.partner_id == 0){
                message(Utils.TI18N("数据异常,请关闭重新打开"));
			    return;
            }

            if(this.config){
                this.ctrl.send20607(this.config.id, data.partner_id);
            }
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(data && data.config){
            this.config = data.config;
            this.skill_name.string = this.config.name;
            this.skill_desc.string = Utils.TI18N("效果：")+this.config.desc;
            
            var num = data.num || 0;
            var max_num = this.config.max_num;
            if(max_num && max_num > 0){
                var use_count = data.use_count || 0;
        	    this.skill_num.string = cc.js.formatStr(Utils.TI18N("本轮剩余使用数量：%d/%d"), (max_num-use_count), num);
            }else{
                this.skill_num.string = Utils.TI18N("剩余数量：")+num;
            }
            this.updateHeroList();
        }
    },

    // ==============================--
    // desc:更新自己伙伴信息
    // @return 
    // ==============================--
    updateHeroList:function(){
        var hero_list = this.model.getFormList();
        var partner_id = this.model.getSelectPartnerID();
    
        var scale = 0.8;
        var space = 130;
        var count = hero_list.length;
        var tmp_width = count * space * scale; // 总的个数需要的长度
        var start_x =(this.total_width - tmp_width) * 0.5;
        for(var i in hero_list){
            var v = hero_list[i];
            var clickback = function(cell){
                this.selectHeroItem(cell);
            }.bind(this);

            if(this.hero_list[i] == null){
                this.hero_list[i] = ItemsPool.getInstance().getItem("hero_exhibition_item");;
                this.hero_list[i].setExtendData({can_click:true})
                this.hero_list[i].setParent(this.choose_container);
                this.hero_list[i].show();
                this.hero_list[i].setScale(scale);
                this.hero_list[i].addCallBack(clickback);
                this.hero_list[i].setPosition(-this.choose_container.width/2+start_x + (space * 0.5 + i * space) * scale, -this.choose_container.height/2 + 152);
            }

            var hero_item = this.hero_list[i];
            this.updateHeroInfo(hero_item, v);

            // 默认选中一个
            if(partner_id != 0){
                if(v.partner_id == partner_id){
                    this.selectHeroItem(hero_item);
                }
            }
        }
    },

    // ==============================--
    // desc:外部设置额外信息
    // @item:
    // @data:
    // @return 
    // ==============================--
    updateHeroInfo:function(item, data){
        if(item == null)return;
        item.setData(data);
        var hp_per = data.now_hp / data.hp;
        item.showProgressbar(hp_per*100);
        if(hp_per == 0){
            item.showStrTips(true, Utils.TI18N("已阵亡"));
        }else{
            item.showStrTips(false);
        }
    },

    // ==============================--
    // desc:设置当前选中的
    // @cell:
    // @data:
    // @return 
    // ==============================--
    selectHeroItem:function(cell){
        if(!cell)return;
        var data = cell.getData();
        if(!data)return;
        if(data.now_hp == 0){
            message(Utils.TI18N("死亡英雄无法选择"));
            return;
        }
        if(this.select_cell == cell)return;
        if(this.select_cell){
            this.select_cell.setSelected(false);
		    this.select_cell = null;
        }
        this.select_cell = cell;
	    this.select_cell.setSelected(true);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.hero_list){
            this.hero_list[i].deleteMe();
        }
        this.hero_list = null;
        this.ctrl.openAdventureUseHPWindow(false);
    },
})