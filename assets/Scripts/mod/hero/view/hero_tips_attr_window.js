// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-03 14:44:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Controller = require("hero_controller")
var PartnerCalculate = require("partner_calculate");
var HeroConst = require("hero_const")
var GuildskillController = require("guildskill_controller")
var HeroEvent = require("hero_event");
var Hero_tips_attrWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_tips_attr_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.controller = Controller.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        var self = this
        self.key_list1 = {[1]:"atk",[2]:"hp",[3]:"def",[4]:"speed"}
        self.key_list2 = {[1]:"crit_rate",[2]:"crit_ratio",[3]:"hit_magic",[4]:"dodge_magic"}
        self.key_list3 = {[1]:"tenacity",[2]:"hit_rate",[3]:"res",[4]:"dodge_rate"}
        self.key_list4 = {[1]:"cure",[2]:"be_cure",[3]:"dam",[4]:"dam"}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
        self.container = self.root_wnd.getChildByName("main_panel")
        self.panel_bg = self.container.getChildByName("panel_bg") 
        self.panel_bg_size = self.panel_bg.getContentSize()
        let bottom_panel = self.container.getChildByName("bottom_panel")
        self.bottom_panel = bottom_panel
        self.bottom_panel_y = bottom_panel.y//getPositionY()
        // --属性信息
        self.attr_panel_list = {}
        self.attr_list = {}
        // var arr = [self.key_list1, self.key_list2, self.key_list3, self.key_list4]
        for (let k=1;k<=4;++k){
            let attr_panel = self.container.getChildByName("attr_panel_"+k)
            self.attr_panel_list[k] = attr_panel
            self.attr_list[k] = {}
            let key_attr_name = "key_list"+k
            for (let i=1;i<=4;++i){
                if (k == 4 && i == 4 ) break  //--最后一个没有了
                let item = {}
                item.icon = attr_panel.getChildByName("attr_icon"+i)
                item.key = attr_panel.getChildByName("attr_key"+i)
                item.value = attr_panel.getChildByName("attr_label"+i)
                item.attr_key = self[key_attr_name][i]
                self.attr_list[k][i] = item
            }
        }

        // --下面两个
        // -- 公会等级

        self.guild_level_key = bottom_panel.getChildByName("attr_key1")
        self.halidom_level_key = bottom_panel.getChildByName("attr_key2")
        self.guild_level_value = bottom_panel.getChildByName("attr_label1")
        self.halidom_level_value = bottom_panel.getChildByName("attr_label2")

        self.title_name = bottom_panel.getChildByName("title_name")

        self.goto_btn_1 = bottom_panel.getChildByName("goto_btn_1")
        self.goto_btn_2 = bottom_panel.getChildByName("goto_btn_2")

        self.bottom_btn = bottom_panel.getChildByName("bottom_btn")
        self.is_hide = false
        Utils.getNodeCompByPath("main_panel/base_attr", this.root_wnd, cc.Label).string = Utils.TI18N("基础属性");
        Utils.getNodeCompByPath("main_panel/special_attr", this.root_wnd, cc.Label).string = Utils.TI18N("特殊属性");
        Utils.getNodeCompByPath("main_panel/bottom_panel/title_name", this.root_wnd, cc.Label).string = Utils.TI18N("加成项");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.bottom_btn.on("touchend",this.onClickBottomBtn,this)
        this.background.on("touchend",this.onClickCloseBtn,this)
        this.addGlobalEvent(HeroEvent.Hero_Vo_Detailed_info,function(hero_vo){
            if(hero_vo && hero_vo.partner_id == this.hero_vo.partner_id){
                this.setData(hero_vo)
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        let hero_vo = data.hero_vo
        let is_my = data.is_my
        if(!hero_vo) return 
        var self = this
        self.is_my = is_my
        self.hero_vo = hero_vo
        if (self.is_my){
            if (hero_vo.is_pokedex){
                // --是否图鉴
                self.setData(hero_vo)
                self.goto_btn_1.active = false
                self.goto_btn_2.active = false
            }else if(hero_vo.is_had_detailed){
                // --是否已经有数据
                self.setData(hero_vo)
            }else{
                this.controller.sender11063(hero_vo.partner_id)
            }
        }else{
            self.setData(hero_vo)
        }
    },
    setData(hero_vo){
        var self = this
        for(let k in self.attr_list){ //k,list in ipairs(self.attr_list) do
            let list = self.attr_list[k]
            for (let i in list){//i,attr in ipairs(list) do
                let attr = list[i]
                let attr_str = attr.attr_key
                let res_id = PathTool.getAttrIconByStr(attr_str)
                let res = PathTool.getUIIconPath("common",res_id)
                this.loadRes(res,function(SpriteFrame){
                    attr.icon.getComponent(cc.Sprite).spriteFrame = SpriteFrame
                })

                let attr_name = Config.attr_data.data_key_to_name[attr_str]
                attr.key.getComponent(cc.Label).string = attr_name 
                let value = hero_vo[attr_str] || 0
                let is_per = PartnerCalculate.isShowPerByStr(attr_str) //-- 是否为千分比
                if (is_per) {
                    value = (value/10)+"%"
                }
                attr.value.getComponent(cc.Label).string = value
            }
        }
        this.setBottomInfo()
    },
    // --隐藏
    onClickBottomBtn(){
        Utils.playButtonSound(1)
        var self = this
        if (self.is_hide){
            self.is_hide = false
            self.bottom_btn.setRotation(-90)
            // --显示
            // self.panel_bg.setContentSize(self.panel_bg_size)
            self.bottom_panel.y = self.bottom_panel_y 
            self.attr_panel_list[3].active = true 
            self.attr_panel_list[4].active = true 
        }else{
            self.is_hide = true
            self.bottom_btn.setRotation(90)
            // --隐藏
            // self.panel_bg.setContentSize(cc.size(self.panel_bg_size.width, self.panel_bg_size.height - 162))
            self.bottom_panel.y = self.bottom_panel_y + 162 
            self.attr_panel_list[3].active = false 
            self.attr_panel_list[4].active = false 
        }
    },
    setBottomInfo(){
        var self = this
        // let string_format = string.format
        let _type = HeroConst.CareerType.eMagician
        let camp_type = HeroConst.CampType.eWater
        let config = Config.partner_data.data_partner_base[self.hero_vo.bid]
        if (config) {
            _type = config.type
            camp_type = config.camp_type
        }

        let guild_level = 0 //--公会等级
        let halidom_level = 0 //--圣物等级
        let halidom_break = 0 //--圣物阶级
        if (self.hero_vo.ext_data) {
            for(let i=0;i<this.hero_vo.ext_data.length;++i){
                let v = this.hero_vo.ext_data[i]
                if(v.id == 1){ //--公会等级
                    guild_level = v.val || 0
                }else if(v.id == 2){
                    halidom_break = v.val || 0
                }else if(v.id == 3){
                    halidom_level = v.val || 0
                }
            }
        }
        if (self.is_my && !self.hero_vo.is_pokedex ){
            // --是自己的.公会等级可能会改变
            let model = GuildskillController.getInstance().getModel()
            let level = model.getCareerSkillLevel(_type)
            if(level != -1){ 
                // --如果有公会技能等级信息..拿本地的
                guild_level = level
            }
            // let halidom_vo = HalidomController.getInstance().getModel().getHalidomDataByCampType(camp_type)
            // if halidom_vo then
            //     halidom_level = halidom_vo.lev or 0
            //     halidom_break = halidom_vo.step or 0
            // end
        }

        self.guild_level_key.getComponent(cc.Label).string ="ギルドスキルLv." + HeroConst.CareerName[_type];
        self.halidom_level_key.getComponent(cc.Label).string = HeroConst.CampName[camp_type] + "之圣物等级"
        self.guild_level_value.getComponent(cc.Label).string = "lv."+ guild_level
        if (halidom_break == 0 && halidom_level == 0) {
            self.halidom_level_value.getComponent(cc.Label).string = "未解锁" 
        }else{
            self.halidom_level_value.getComponent(cc.Label).string = "lv."+halidom_level + halidom_break + "阶" 
            //:setString(string_format("lv.%s(%s%s)", halidom_level, halidom_break, TI18N("阶")))
        }
    },
    // --关闭
    onClickCloseBtn(){
        Utils.playButtonSound(2)
        this.controller.openHeroTipsAttrPanel(false)
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.controller.openHeroTipsAttrPanel(false)
    },
})