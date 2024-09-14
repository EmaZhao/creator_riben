// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-29 11:43:16
// --------------------------------------------------------------------
var JumpController = require("jump_controller");
var StrongerEvent = require("stronger_event")
var StrongerController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var StrongerModel = require("stronger_model");

        this.model = new StrongerModel();
        this.model.initConfig();
        this.is_first = true
    },  

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {

    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(11070,this.on11070.bind(this))  // -- 全服最强数据
    },
    on11070( data ){
        this.model.setDataByBid(data)
        gcore.GlobalEvent.fire(StrongerEvent.UPDATE_SCROE,data)
    },
    //--打开我要变强主界面
    openMainWin(status,index,partner_id){
        var self = this
        if (status) { 
            if (!self.main_win) {
                var StrongerMainWindow = require("strong_main_window")
                self.main_win = new StrongerMainWindow(partner_id)
            }
            self.main_win.open(index)
        }else{
            if (self.main_win){ 
                self.main_win.close()
                self.main_win = null
            }
        }
    },
    setIsFirst( bool ){
        this.is_first = bool
    },
    sender11070(partner_bid){
        let protocal = {}
        protocal.partner_bid = partner_bid
        this.SendProtocal(11070, protocal)
    },

    getStrongerRoot: function() {
        if (this.main_win)
            return this.main_win.root_wnd;
    },
    
    clickCallBack(params){
        var evt_type = null;
        if(params.evt_type){
            evt_type = params.evt_type;
        }else{
            evt_type = params;
        }
        if(evt_type){
            if(evt_type == 200){//英雄背包
                JumpController.getInstance().jumpViewByEvtData([19]);
            }else if(evt_type == 201){//神器升级
                JumpController.getInstance().jumpViewByEvtData([20]);
            }else if(evt_type == 202){//联盟技能界面
                JumpController.getInstance().jumpViewByEvtData([32]);
            }else if(evt_type == 203){//玩家英雄信息界面
                if(this.main_win && this.main_win.view_list[1]){
                    var cur_hero_item = this.main_win.view_list[1].getCurHero();
                    if(cur_hero_item){
                        var hero_vo = cur_hero_item.getData();
                        var HeroController = require("hero_controller");
                        var HeroConst      = require("hero_const");
                        var all_role_list = HeroController.getInstance().getModel().getAllHeroArray();
                        HeroController.getInstance().openHeroMainInfoWindow(true, hero_vo, all_role_list, {show_model_type: HeroConst.BagTab.eBagHero})
                    }
                }
            }else if(evt_type == 204){//先知殿
                JumpController.getInstance().jumpViewByEvtData([24]);
            }else if(evt_type == 100){//布阵阵法
                JumpController.getInstance().jumpViewByEvtData([30]);
            }else if(evt_type == 120){//召唤
                JumpController.getInstance().jumpViewByEvtData([1]);
            }else if(evt_type == 121){//背包 碎片
                var BackPackConst = require("backpack_const");
                JumpController.getInstance().jumpViewByEvtData([8, BackPackConst.item_tab_type.HERO])
            }else if(evt_type == 122){//英雄商城
                var MallConst      = require("mall_const");
                JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.Recovery])
            }else if(evt_type == 123 || evt_type == 162){//金币兑换
                JumpController.getInstance().jumpViewByEvtData([35]);
            }else if(evt_type == 125){//金币出售

            }else if(evt_type == 126){//远航
                JumpController.getInstance().jumpViewByEvtData([18]);
            }else if(evt_type == 128){//银币摆摊

            }else if(evt_type == 129){
                JumpController.getInstance().jumpViewByEvtData([41]);
            }else if(evt_type == 130){//成就
                var TaskConst = require("task_const");
                JumpController.getInstance().jumpViewByEvtData([41,TaskConst.type.feat]);
            }else if(evt_type == 131){//充值
                JumpController.getInstance().jumpViewByEvtData([7]);
            }else if(evt_type == 132){//快速作战
                JumpController.getInstance().jumpViewByEvtData([11]);
            }else if(evt_type == 134){//杂货店
                JumpController.getInstance().jumpViewByEvtData([6]);
            }else if(evt_type == 135){//金币市场 突破

            }else if(evt_type == 138){//钻石商城
                var MallConst      = require("mall_const");
                JumpController.getInstance().jumpViewByEvtData([15,MallConst.MallType.GodShop]);
            }else if(evt_type == 144){//道具背包
                var BackPackConst = require("backpack_const");
                JumpController.getInstance().jumpViewByEvtData([8,BackPackConst.item_tab_type.PROPS]);
            }else if(evt_type == 145){//联盟捐献
                var RoleController = require("role_controller")
                var role_vo = RoleController.getInstance().getRoleVo();
                if(role_vo.isHasGuild()){
                    JumpController.getInstance().jumpViewByEvtData([13]);
                }else{
                    var MainuiController = require("mainui_controller");
                    var MainUiConst = require("mainui_const");
                    MainuiController.getInstance().changeMainUIStatus(MainUiConst.new_btn_index.guild);
                }
            }else if(evt_type == 146){//公会副本
                var RoleController = require("role_controller")
                var role_vo = RoleController.getInstance().getRoleVo();
                if(role_vo.isHasGuild()){
                    var list = [31];
                    if(params.id){
                      list.push(params.id);
                    }
                    JumpController.getInstance().jumpViewByEvtData(list);
                }else{
                    var MainuiController = require("mainui_controller");
                    var MainUiConst = require("mainui_const");
                    MainuiController.getInstance().changeMainUIStatus(MainUiConst.new_btn_index.guild);
                }
            }else if(evt_type == 150){//星河神殿
                JumpController.getInstance().jumpViewByEvtData([27]);
            }else if(evt_type == 151){//英雄远征
                JumpController.getInstance().jumpViewByEvtData([25]);
            }else if(evt_type == 152){//日常副本
                JumpController.getInstance().jumpViewByEvtData([17]);
            }else if(evt_type == 153){//无尽试炼
                var open_data = Config.dailyplay_data.data_exerciseactivity[2];
                if(open_data == null){
                    message(Utils.TI18N("无尽试炼数据异常"));
                    return;
                }
                var MainuiController = require("mainui_controller");
                var bool = MainuiController.getInstance().checkIsOpenByActivate(open_data.activate);
                if(bool == false){
                    message(open_data.lock_desc);
                    return;
                }
                var Endless_trailController = require("endless_trail_controller");
                var is_open = Endless_trailController.getInstance().checkIsOpen();
                if(is_open){
                    JumpController.getInstance().jumpViewByEvtData([43]);
                }
            }else if(evt_type == 154){//锻造屋
                JumpController.getInstance().jumpViewByEvtData([26]);
            }else if(evt_type == 155){//融合祭坛
                JumpController.getInstance().jumpViewByEvtData([23]);
            }else if(evt_type == 156){//祭祀小屋
                JumpController.getInstance().jumpViewByEvtData([22]);
            }else if(evt_type == 157){//剧情副本
                JumpController.getInstance().jumpViewByEvtData([5]);
            }else if(evt_type == 158){//竞技场
                JumpController.getInstance().jumpViewByEvtData([3]);
            }else if(evt_type == 159){//冠军赛
                JumpController.getInstance().jumpViewByEvtData([36]);
            }else if(evt_type == 160){//试练塔
                JumpController.getInstance().jumpViewByEvtData([12]);
            }else if(evt_type == 402){//好友
                JumpController.getInstance().jumpViewByEvtData([4]);
            }else if(evt_type == 404){//英雄界面
                JumpController.getInstance().jumpViewByEvtData([19]);
            }else if(evt_type == 405){//幸运探宝
                JumpController.getInstance().jumpViewByEvtData([40]);
            }else if(evt_type == 406){//探宝商店
                var MallConst = require("mall_const");
                JumpController.getInstance().jumpViewByEvtData([15,MallConst.MallType.GuessShop]);
            }else if(evt_type == 407){//冒险
                JumpController.getInstance().jumpViewByEvtData([34]);
            }else if(evt_type == 408 || evt_type == 161){//锻造坊的符文
                var ForgeHouseConst = require("forgehouse_const");
                JumpController.getInstance().jumpViewByEvtData([26,ForgeHouseConst.Tab_Index.Artifact]);
            }else if(evt_type == 409){
                JumpController.getInstance().jumpViewByEvtData([20]);
            }else if(evt_type == 410){//精英段位赛商店
                var MallConst      = require("mall_const");
                JumpController.getInstance().jumpViewByEvtData([15,MallConst.MallType.EliteShop]);
            }else if(evt_type == 411){
                var ActionConst = require("action_const");
                JumpController.getInstance().jumpViewByEvtData([45,ActionConst.ActionRankCommonType.time_summon]);
            }else if(evt_type == 412){//打开录像馆
                require("vedio_controller").getInstance().openVedioMainWindow(true);
            }else if(evt_type == 413){//打开录像馆个人记录
                require("vedio_controller").getInstance().openVedioMyselfWindow(true)
            }
        }
        this.openMainWin(false);
    },
});

module.exports = StrongerController;