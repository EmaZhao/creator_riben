// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     挑战护卫界面
// <br/>Create: 2019-05-11 17:46:41
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");

var Adventure_evt_challengeWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_challenge_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.hero_list = {};
        //  当前信息.其实需要获取单位id
        this.data = null;

        this.is_skip_fight = false
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var container = this.root_wnd.getChildByName("container");
        var win_title = container.getChildByName("win_title").getComponent(cc.Label);
        win_title.string = Utils.TI18N("挑战守卫");
        var change_title = container.getChildByName("change_title").getComponent(cc.Label);
        change_title.string = Utils.TI18N("选择英雄");
        var self_title = container.getChildByName("self_title").getComponent(cc.Label);
        self_title.string = Utils.TI18N("我方");
        var other_title = container.getChildByName("other_title").getComponent(cc.Label);
        other_title.string = Utils.TI18N("守卫");
    
        this.challenge_btn = container.getChildByName("challenge_btn");
        var challenge_label = this.challenge_btn.getChildByName("label").getComponent(cc.Label);
        challenge_label.string = Utils.TI18N("进入战斗");
    
        this.cur_hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.cur_hero_item.setExtendData({can_click:true});
        this.cur_hero_item.setRootPosition(cc.v2(-container.width/2+158, -container.height/2+447));
        this.cur_hero_item.showProgressbar(100);
        this.cur_hero_item.show();
        this.cur_hero_item.setParent(container);

        this.target_hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.target_hero_item.setExtendData({can_click:true});
        this.target_hero_item.setRootPosition(cc.v2(-container.width/2+560, -container.height/2+447));
        this.target_hero_item.showProgressbar(100);
        this.target_hero_item.show();
        this.target_hero_item.setParent(container);
    
        this.other_name = container.getChildByName("other_name").getComponent(cc.Label);        // 守卫名字
    
        // 战力
        this.power_val_nd          = this.seekChild("power_val");
        this.fight_label         = this.power_val_nd.getComponent("CusRichText");

        this.container = container;
    
        this.checkboxNode = container.getChildByName("checkbox");
        this.checkBg = this.checkboxNode.getChildByName("Background");
        this.checkbox = this.checkboxNode.getComponent(cc.Toggle);
        var checkbox_name = this.checkBg.getChildByName("name").getComponent(cc.Label);
        checkbox_name.string = Utils.TI18N("跳过战斗");
        this.checkboxNode.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.challenge_btn, function () {
            if(this.data){
                var ext_list = [];
                if(this.is_skip_fight){
                    ext_list.push({type: 2, val: 1});
                }
                this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.handle,ext_list)
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.checkboxNode, function () {
            var is_select = !this.checkbox.isChecked
            this.is_skip_fight = is_select;
        }.bind(this), 1);

        this.addGlobalEvent(AdventureEvent.UpdateMonsterHP,function(data){
            if(this.target_hero_item){
                data = data || 0;
                this.target_hero_item.showProgressbar(data);
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        if(this.data){
            this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.requst, {});
            // 设置头像
            if(this.target_hero_item && this.data && this.data.config){
                this.target_hero_item.setUnitData(this.data.config.unit_id);
                var config = Utils.getUnitConfig(this.data.config.unit_id);
                if(config){
                    this.other_name.string = config.name;
                }
            }
        }
        this.createHeroList();

        this.base_data = this.model.getAdventureBaseData();
        if(this.base_data){
            var config = Config.adventure_data.data_floor_reward[this.base_data.id];
            if(config && config.auto_combat == 1){
                // 可以跳过战斗
                this.checkboxNode.active = true;
                this.is_skip_fight = gcore.SysEnv.getBool("adventure_skip_fight", true)
                this.checkbox.isChecked = this.is_skip_fight;
            }
        }
    },

    
    // ==============================--
    // desc:创建自己的伙伴列表
    // @return 
    // ==============================--
    createHeroList:function(){
        var hero_list = this.model.getFormList();
        var partner_id = this.model.getSelectPartnerID();
        for(var i in hero_list){
            var clickback = function(cell){
                this.selectHeroItem(cell);
            }.bind(this);

            if(this.hero_list[i] == null){
                this.hero_list[i] = ItemsPool.getInstance().getItem("hero_exhibition_item");;
                this.hero_list[i].setExtendData({scale:0.9,can_click:true});
                this.hero_list[i].setRootPosition(cc.v2(-this.container.width/2+110 + i* 124, -this.container.height/2+206));
                this.hero_list[i].addCallBack(clickback);
                this.hero_list[i].show();
                this.hero_list[i].setParent(this.container);
            }
            var hero_item = this.hero_list[i];
            this.updateHeroInfo(hero_item, hero_list[i]);

            // 默认选中一个
            if(partner_id != 0){
                if(hero_list[i].partner_id == partner_id){
                    this.selectHeroItem(hero_item);
                }
            }
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
        this.fight_label.setNum(data.power);
        //  请求储存
        this.ctrl.requestSelectPartner(data.partner_id);

        this.cur_hero_item.setData(data);
        //  设置血量
        var hp_per = data.now_hp / data.hp;
        this.cur_hero_item.showProgressbar(hp_per * 100);
    },

    // ==============================--
    // desc:外部设置额外信息
    // time:2019-01-24 06:04:06
    // @item:
    // @data:
    // @return 
    // ==============================--
    updateHeroInfo:function(item, data){
        if(item == null)return;
        item.setData(data);
        var hp_per = data.now_hp / data.hp;
        item.showProgressbar(hp_per * 100);
        if(hp_per == 0){
            item.showStrTips(true, Utils.TI18N("已阵亡"));
        }else{
            item.showStrTips(false);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        gcore.SysEnv.set("adventure_skip_fight", this.is_skip_fight, true)
        if (this.cur_hero_item) {
            this.cur_hero_item.deleteMe();
        }
        this.cur_hero_item = null;

        if (this.target_hero_item) {
            this.target_hero_item.deleteMe();
        }
        this.target_hero_item = null;

        for(var i in this.hero_list){
            this.hero_list[i].deleteMe();
        }
        this.item_list = null;

        this.ctrl.openEvtViewByType(false);
    },
})