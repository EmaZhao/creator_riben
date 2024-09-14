// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     天赋领悟
// <br/>Create: 2019-05-11 14:03:34
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const")
var HeroController = require("hero_controller")
var SkillItem = require("skill_item")
var CommonScrollViewSingle = require("common_scrollview_single")
var BackpackController = require("backpack_controller")
var HeroTalentSkillLearnWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_talent_skill_learn_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = HeroController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        // --消耗数据列表
        this.item_list = []
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
        self.main_container = self.root_wnd.getChildByName("main_container")

        self.show_item_node = self.main_container.getChildByName("show_item_node")
        self.skill_item = new SkillItem()
        self.skill_item.setParent(this.show_item_node);
        self.skill_item.setLeveStatus(false);

        self.skill_name = self.main_container.getChildByName("skill_name").getComponent(cc.Label)
        self.skill_desc_lb = self.main_container.getChildByName("skill_desc").getComponent(cc.Label)
        self.no_vedio_image = self.main_container.getChildByName("no_vedio_image")
        self.no_vedio_label = self.main_container.getChildByName("no_vedio_label").getComponent(cc.Label)

        self.lay_scrollview = self.main_container.getChildByName("lay_scrollview")

        self.cost_node = self.main_container.getChildByName("cost_node")
        self.select_btn = self.main_container.getChildByName("select_btn")

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on('touchend',this.onClickBtnClose,this)
        this.select_btn.on('click',this.onClickBtnSelect,this)
    },
    onClickBtnClose(){
        Utils.playButtonSound(2)
        this.ctrl.openHeroTalentSkillLearnPanel(false)
    },
    // --选择
    onClickBtnSelect(){
        if(!this.select_skill_data){
            return
        }
        Utils.playButtonSound(1)
        if(this.dic_have_skill_id.order_had == 1){
            // --已拥有
            return
        }else{
            this.ctrl.sender11096(this.hero_vo.partner_id, this.pos, this.select_skill_data.config.id)
            this.onClickBtnClose()
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(!data.hero_vo) return
        if(!data.pos) return
        var self = this
        self.pos = data.pos  
        self.hero_vo = data.hero_vo
        let config_list = Config.partner_skill_data.data_partner_skill_learn
        if(config_list && Utils.next(config_list) != null){
            self.no_vedio_image.active = false;
            self.no_vedio_label.node.active = false;
            self.initSkillData(config_list)
        }
    },
    initSkillData(config_list){
        var self = this
        self.skill_list  = []
        self.dic_have_skill_id = {}
        for(let pos in self.hero_vo.talent_skill_list){
            let id = self.hero_vo.talent_skill_list[pos]
            self.dic_have_skill_id[id] = pos
        }

        // --英雄职业对应名字
        let career_order_name ={
            [HeroConst.CareerType.eMagician]    : "order_magician",
            [HeroConst.CareerType.eWarrior]     : "order_warrior",
            [HeroConst.CareerType.eTank]        : "order_tank",
            [HeroConst.CareerType.eSsistant]    : "order_ssistant",
        }

        let dic_hero_talent_skill_learn_redpoint = this.ctrl.getModel().getTalentRedpointRecord()

        let dic_commend_skill = {}
        let commend_skill_config = Config.partner_skill_data.data_partner_commend_skill[this.hero_vo.bid]
        if(commend_skill_config){
            for(let i=0;i<commend_skill_config.length;++i){
                let skill_id = commend_skill_config[i]
                dic_commend_skill[skill_id] = i+1
            }
        }
        for(let id in config_list){
            let config = config_list[id]
            let skill_data = {}
            skill_data.config = config
            skill_data.order = config.order
            if(commend_skill_config){
                //该英雄有单独推荐的  用单独推荐初始化
                if(dic_commend_skill[config.id]){
                    skill_data.career_order = dic_commend_skill[config.id]
                }else{
                    skill_data.career_order = 1000
                }
            }else{
                if(career_order_name[self.hero_vo.type]){
                    skill_data.career_order = config[career_order_name[self.hero_vo.type]]
                }else{
                    skill_data.career_order = 1000
                }
            }
            if(self.dic_have_skill_id[config.id]){
                skill_data.order_had = 1  //--已拥有
            }else{
                skill_data.order_had = 2
            }

            if(dic_hero_talent_skill_learn_redpoint[config.id]){
                skill_data.order_can = 1 //--可领悟
            }else{
                skill_data.order_can = 2
            }
            self.skill_list.push(skill_data)
        }
        self.updateSkillList()
    },
    updateSkillList(){
        var self = this;
        if(self.list_view == null){
            let scroll_view_size = self.lay_scrollview.getContentSize()
            let width = scroll_view_size.width/4
            let list_setting = {
                start_x : 0, // 第一个单元的X起点
                space_x : 0, // x方向的间隔
                start_y : 0, // 第一个单元的Y起点
                space_y : 0, // y方向的间隔
                item_width : 152, // 单元的尺寸width 152
                item_height : 158, // 单元的尺寸height 158
                row : 0, // 行数，作用于水平滚动类型
                col : 4,                         // 列数，作用于垂直滚动类
                need_dynamic : true
            }
            this.list_view = new CommonScrollViewSingle();
            self.list_view.createScroll(self.lay_scrollview, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, list_setting, cc.v2(0, 0)) 
            this.list_view.registerScriptHandlerSingle(this.createNewCell.bind(this), ScrollViewFuncType.CreateNewCell)
            this.list_view.registerScriptHandlerSingle(this.numberOfCells.bind(this), ScrollViewFuncType.NumberOfCells)
            this.list_view.registerScriptHandlerSingle(this.updateCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex)
            this.list_view.registerScriptHandlerSingle(this.onCellTouched.bind(this), ScrollViewFuncType.OnCellTouched)
        }
        let sort_func = Utils.tableLowerSorter(["order_had", "order_can", "career_order", "order"])
        self.skill_list.sort(sort_func)

        let select_index = null

        for(let i=0;i<self.skill_list.length;++i){
            let skill_data = self.skill_list[i]
            if(select_index == null && skill_data.order_had != 1){
                select_index = i
                break
            }
        }

        // --容错
        if(select_index == null){
            select_index = 0
        }

        self.list_view.reloadData(select_index)

    },
    createNewCell(width, height){
        let cell = new cc.Node()
        cell.setContentSize(cc.size(width, height))
        cell.skill_item = new SkillItem();
        cell.skill_item.setLeveStatus(false);
        cell.skill_item.setPosition(0,11)
        cell.skill_item.setParent(cell)
        cell.skill_item.addCallBack(function () {
            this.onCellTouched(cell)
        }.bind(this))
        return cell
    },
    //获取数据数量
    numberOfCells: function () {
        if (!this.skill_list) return 0
        return this.skill_list.length
    },
    //更新cell(拖动的时候.刷新数据时候会执行次方法)
    //cell :createNewCell的返回的对象
    //inde :数据的索引
    updateCellByIndex: function (cell, index) {
        cell.index = index;
        let skill_data = this.skill_list[index];
        if(skill_data){
            let config = gdata("skill_data","data_get_skill",skill_data.config.id)
            if(config){
                cell.skill_item.setData(skill_data.config.id)
                cell.skill_item.showName(true,config.name, null,null,true)
                cell.skill_item.showRecommondIcon(false)
                if(skill_data.order_had == 1){  //--已学会
                    cell.skill_item.showRecommondIcon(true,2)
                }else if(skill_data.order_can == 1){ // --已领悟
                    cell.skill_item.showRecommondIcon(true,5)
                }else if(skill_data.career_order != 1000){ //--推荐
                    cell.skill_item.showRecommondIcon(true,1)
                }
                if(this.select_skill_data && this.select_skill_data.config.id == skill_data.config.id){
                    cell.skill_item.setSelected(true)
                }else{
                    cell.skill_item.setSelected(false)
                }
            }
        }
    },
    //点击cell .需要在 createNewCell 设置点击事件
    onCellTouched: function (cell) {
        let index = cell.index
        var skill_data = this.skill_list[index];
        if(this.select_cell){
            this.select_cell.skill_item.setSelected(false)
        }
        this.select_cell = cell
        if(this.select_cell){
            this.select_cell.skill_item.setSelected(true)
        }
        this.showSkillInfo(skill_data)
    },
    showSkillInfo(skill_data){
        if(!skill_data) return;
        this.select_skill_data = skill_data
        let config = gdata("skill_data","data_get_skill",skill_data.config.id)
        if(config){
            if(this.skill_item){
                this.skill_item.setData(skill_data.config.id)
            }
            this.skill_name.string = config.name;
            this.skill_desc_lb.string = config.des;
            this.showCostInfo(skill_data)
        }
    },
    showCostInfo(skill_data){
        if(!skill_data) return;
        var self = this
        for(let i=0;i<this.item_list.length;++i){
            let item = this.item_list[i]
            // item:setPositionX(10000) --相当于隐藏
        }
        let item_width = 120 + 10
        let start_x = - item_width * skill_data.config.expend.length/2 + item_width * 0.5
        for(let i=0;i<skill_data.config.expend.length;++i ){
            let cost = skill_data.config.expend[i]
            let bid = cost[0]
            let num = cost[1]
            if(self.item_list[i] == null){
                self.item_list[i] =  ItemsPool.getInstance().getItem("backpack_item")
                self.item_list[i].setDefaultTip(true, null, null , 1)
                self.item_list[i].name_size = 24
                self.item_list[i].name_color = "#643223"
                self.item_list[i].setParent(self.cost_node);
                self.item_list[i].initConfig(false, 0.8, true, true,true);
                self.item_list[i].show();

            }
            let _x = start_x + i * item_width
            self.item_list[i].setPosition(_x, 0)
            let item_config = Utils.getItemConfig(bid)
            if(item_config){
                self.item_list[i].setData({bid:bid, num:num})
                let have_num = BackpackController.getInstance().getModel().getItemNumByBid(item_config.id)
                self.item_list[i].setNeedNum(num, have_num)
            }
        }
    },
    // 关闭窗体回调,需.要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.list_view) {
            if(this.list_view.cellList.length){
                for(let i=0;i<this.list_view.cellList.length;++i){
                    let cell = this.list_view.cellList[i].cell
                    if(cell && cell.skill_item){
                        cell.skill_item.deleteMe()
                        cell.skill_item = null
                    }
                }
            }
            this.list_view.deleteMe();
            this.list_view = null;
        }
        if(this.skill_item){
            this.skill_item.deleteMe();
            this.skill_item = null;
        }
        for(let i=0;i<this.item_list.length;++i){
            this.item_list[i].deleteMe()
            this.item_list[i] = null
        }
        this.item_list = null;
        this.ctrl.openHeroTalentSkillLearnPanel(false)
    },
})