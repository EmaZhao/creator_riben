// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-29 14:49:49
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller")
var StrongerController = require("stronger_controller")
var HeroConst = require("hero_const")
var StrongerPanelItem = require("Stronger_panel_item")
var CommonScrollView = require("common_scrollview");
var StrongerEvent = require("stronger_event")
var StrongerPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("stronger", "stronger_panel");
        this.partner_id = arguments[0] || 0  //-- 选中的英雄
        this.ctrl = StrongerController.getInstance();
        this.model = StrongerController.getInstance().getModel()
        this.partner_id_indedx = 0
        this.partnerList = []
        this.cur_hero_item = null
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
       
    },  

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.hero_con_nd = this.seekChild("hero_con");
        this.selected_nd = this.seekChild("selected_nd")
        this.scroll_con_nd = this.seekChild("scroll_con")
        this.seekChild("title_role", cc.Label).string = Utils.TI18N("我的阵容")
        this.seekChild("now_hero", cc.Label).string = Utils.TI18N("当前英雄：")
        this.seekChild("title", cc.Label).string = Utils.TI18N("评分/本服最高")
        this.now_hero_val_lb =   this.seekChild("now_hero_val",cc.Label)
        this.loadingbar_exp_lb = this.seekChild("loadingbar_exp",cc.Label)
        this.loadingbar_bg_pb = this.seekChild("loadingbar_bg",cc.ProgressBar)
        let size = cc.size(this.scroll_con_nd.width,this.scroll_con_nd.height)
        let setting_2 = {
            item_class : StrongerPanelItem,      //-- 单元类
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 0,                    //-- x方向的间隔
            start_y : 0,                    //-- 第一个单元的Y起点
            space_y : 8,                   //-- y方向的间隔
            item_width : 617,               //-- 单元的尺寸width
            item_height : 142,              //-- 单元的尺寸height
            row : 0,                        //-- 行数，作用于水平滚动类型
            col : 1,                         //-- 列数，作用于垂直滚动类型
        }
        this.item_scroll = new CommonScrollView();
        this.item_scroll.createScroll(this.scroll_con_nd,cc.v2(-size.width/2,0),ScrollViewDir.vertical,ScrollViewStartPos.top,size,setting_2,cc.v2(0,0))
        this.createHeroList()
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        var self = this
        this.addGlobalEvent(StrongerEvent.UPDATE_SCROE,function (data){
            if (self.cur_hero_item) {
                let cur_hero_vo = self.cur_hero_item.getData()
                if (cur_hero_vo.bid == data.partner_bid) {
                    this.refreshViewByHero(cur_hero_vo)
                }
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    // --创建英雄列表
    createHeroList(  ){
        var self = this
        // --只显示上阵英雄
        let list = HeroController.getInstance().getModel().getMyPosList()
        let show_list = []
        for (let k in list){ //k,v in pairs(list) do
            let v = list[k]
            let hero_vo = HeroController.getInstance().getModel().getHeroById(v.id)
            if (self.partner_id == 0 && show_list.length == 0 ){ // -- 没有默认选中的英雄则选中第一个
                self.partner_id = hero_vo.partner_id
            }
            show_list.push(hero_vo)
        }
        if(show_list.length == 0)return
        for(let i=0;i<show_list.length;i++){
            let hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
            hero_item.setData(show_list[i])
            hero_item.setParent(this.hero_con_nd);
            hero_item.show();
            hero_item.setScale(0.8)
            hero_item.setPosition(60+i*110,0)
            hero_item.addCallBack(function(){
                if(i == this.partner_id_indedx)return
                this._onClickHero(i)
            }.bind(this))
            this.partnerList[i] = hero_item //show_list[i]
        }
        this._onClickHero(this.partner_id_indedx)
    },
    
    // -- 点击英雄头像
    _onClickHero(index){
        var self = this
        this.partner_id_indedx = index
        if(this.selected_nd){
            this.selected_nd.setPosition(60+index*110,-10)
        }
        let hero_vo = this.partnerList[index].getData()
        // -- 请求伙伴变强相关数据
        self.cur_hero_item = this.partnerList[index]
        self.ctrl.sender11070(hero_vo.partner_id)
    },
    // -- 刷新为某个英雄的相关数据
    refreshViewByHero( hero_vo ){
        var self = this
        self.now_hero_val_lb.string = hero_vo.name
        let bar = self.model.getTotalAndMaxValByBid(hero_vo.bid)
        let total_val = bar.total, max_val =  bar.max
        self.loadingbar_exp_lb.string = total_val+"/"+max_val
        this.loadingbar_bg_pb.progress =  total_val/max_val
        self.refreshItemList(hero_vo.bid)
    },
    refreshItemList(bid){
        let list_data = []
        for (let k in Config.stronger_data.data_stronger_two){ //k,v in pairs(Config.stronger_data.data_stronger_two) do
            let v = Config.stronger_data.data_stronger_two[k]
            let is_open = true
            for (let i=0;i<v.limit.length;++i){//_,lData in pairs(v.limit) do
                let lData = v.limit[i]
                let open_status = this.model.checkStrongItemIsOpen(lData)
                if (open_status == false){
                    is_open = false
                    break
                }
            }
            if (is_open){
                let data = Utils.deepCopy(v)
                let obj = this.model.getStrongerValByBid(bid, v.id)
                data.score_val = obj.scroe_val
                data.max_val =  obj.max_val
                list_data.push(data)
            }
        }
        this.item_scroll.setData(list_data)
    },
    getCurHero(  ){
        return this.cur_hero_item
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if (this.item_scroll) {
            this.item_scroll.deleteMe();
            this.item_scroll = null;
        }
        if(this.partnerList){
            for(let i=0;i<this.partnerList.length;++i){
                this.partnerList[i].deleteMe()
            }
            this.partnerList = null;
        }
    },
})
module.exports = StrongerPanel;