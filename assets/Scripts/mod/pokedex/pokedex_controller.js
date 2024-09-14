// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-08 10:31:20
// --------------------------------------------------------------------
var RoleController = require("role_controller")
var PokedexEvent = require("pokedex_event")
var PokedexController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var PokedexModel = require("pokedex_model");

        this.model = new PokedexModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // var self = this
        // if (!self.init_role_event){
        //     self.init_role_event = gcore.GlobalEvent.bind(EventId.ROLE_CREATE_SUCCESS, function(){
        //         gcore.GlobalEvent.unBind(self.init_role_event)
        //         self.role_vo = RoleController.getInstance().getRoleVo()
        //         // self.sender11040() 登录先请求一下当前的图书馆信息
        //     })
        // }
        // if not self.add_goods_event then
        //     self.add_goods_event = GlobalEvent:getInstance():Bind(BackpackEvent.ADD_GOODS, function(bag_code,temp_add)
        //         if bag_code == BackPackConst.Bag_Code.BACKPACK then 
        //             self:checkRedPoint(temp_add)
        //         end
        //     end)
        // end

        // if not self.del_goods_event then
        //     self.del_goods_event = GlobalEvent:getInstance():Bind(BackpackEvent.DELETE_GOODS, function(bag_code,temp_del)
        //         if bag_code == BackPackConst.Bag_Code.BACKPACK then 
        //             self:checkRedPoint(temp_del)
        //         end
        //     end)
        // end

        // if not self.modify_goods_event then
        //     self.modify_goods_event = GlobalEvent:getInstance():Bind(BackpackEvent.MODIFY_GOODS_NUM, function(bag_code,temp_list)
        //         if bag_code == BackPackConst.Bag_Code.BACKPACK then 
        //             self:checkRedPoint(temp_list)
        //         end
        //     end)
        // end
        // if not self.add_partner_event then
        //     self.add_partner_event = GlobalEvent:getInstance():Bind(PartnerEvent.Partner_Data_Update, function(_partner_vo, is_add)
        //         if is_add then 
        //             -- self:checkIsCanCall()
        //         end
        //     end)
        // end
        // if not self.get_all_data then 
        //     self.get_all_data =  GlobalEvent:getInstance():Bind(BackpackEvent.GET_ALL_DATA, function(bag_code)
        //         if bag_code == BackPackConst.Bag_Code.BACKPACK then 
        //             -- self:checkIsCanCall()
        //         end
        //     end)
        // end
    },

    // 注册协议接受事件
    registerProtocals: function () {
        var self = this
        // this.RegisterProtocal(1110, this.on1110);
        self.RegisterProtocal(11041, this.handle11041.bind(this))     //--请求指定英雄评论信息
        self.RegisterProtocal(11042, this.handle11042.bind(this))     //--设置伙伴为喜欢
        self.RegisterProtocal(11043, this.handle11043.bind(this))     //--伙伴评论
        self.RegisterProtocal(11044, this.handle11044.bind(this))     //--评论点赞    
        self.RegisterProtocal(11046, this.handle11046.bind(this))     //--推送伙伴总星数改变    
        self.RegisterProtocal(11047, this.handle11047.bind(this))     //--图书馆加成等级升级
    },
    handle11041( data ){
        gcore.GlobalEvent.fire(PokedexEvent.Comment_List_Event,data)
        
    },
    handle11042( data ){
        message(data.msg)
        if (data.result == 1){
            gcore.GlobalEvent.fire(PokedexEvent.Comment_Like_Event,data)
        }
    },
    handle11043( data ){
        message(data.msg)
        if(data.result == 1){
            gcore.GlobalEvent.fire(PokedexEvent.Comment_Say_Event,data)   
        }
    },
    handle11044( data ){
        message(data.msg)
        if (data.result == 1){
            gcore.GlobalEvent.fire(PokedexEvent.Comment_Zan_Event,data)
        }
    },
    // --推送伙伴总星数改变
    handle11046( data ){
        message(data.msg)
        if (data){
            let all_data = this.model.getAllData()
            all_data.all_star = data.new_star
            // this.checkIsCanCall()
        }    
    },
    handle11047(data){
        message(data.msg)
        var self = this
        if (data.result == 1){
            let config = Config.partner_data.data_pokedex_attr
            let all_data = self.model.getAllData()
            let cur_lev = all_data.lev
            if (!cur_lev)return
            all_data.lev = data.lev
            let next_lev = Math.min(data.lev + 1, tableLen(config))
            let next_config = Config.partner_data.data_pokedex_attr[next_lev]
            self.star_data = {old_star : all_data.all_star, new_star : next_config.star,old_lev : cur_lev,cur_lev : data.lev}
            if (self.star_data) {
                self.openStarUpWindow(true, self.star_data)
            }
            gcore.GlobalEvent.fire(PokedexEvent.Up_End_Event,self.star_data)
        }
    },
    // --评论
    openCommentWindow(bool,data,callFunc){
        var self = this
        if (bool == false){
            if (self.commentWindow){
                self.commentWindow.close()
                self.commentWindow = null
            }
        }else{
            if (!self.commentWindow){
                var PartnerCommentWindow = require("partner_comment_window")
                self.commentWindow = new PartnerCommentWindow()
            }
            if(self.commentWindow.isOpen() == false){
                self.commentWindow.open(data)
                if(callFunc){
                    self.commentWindow.addCallBack(callFunc)
                }
            }
        }
        
    },
    // --总星数提升一级
    openStarUpWindow(bool,data){
        // if bool == false then
        //     if self.star_window ~= nil then
        //         self.star_window:close()
        //         self.star_window = nil
        //         self:checkIsCanCall()
        //     end
        // else
        //     if self.star_window == nil then
        //         self.star_window = PokedexStarWindow.New(data)
        //     end
        //     if self.star_window:isOpen() == false then
        //         self.star_window:open()
        //     end
        // end  
    },
    // --请求指定英雄评论信息
    sender11041(partner_id,start,num){
        let protocal ={}
        protocal.partner_id = partner_id
        protocal.start = start
        protocal.num = num
        this.SendProtocal(11041,protocal)
    },
    // --伙伴评论
    sender11043(partner_id,msg){
        let protocal ={}
        protocal.partner_id = partner_id
        protocal.msg = msg
        this.SendProtocal(11043,protocal)
    },
    // --设置伙伴为喜欢
    sender11042(partner_id){
        let protocal ={}
        protocal.partner_id = partner_id
        this.SendProtocal(11042,protocal)
    },
    // --评论点赞
    sender11044(partner_id,comment_id,type){
        let protocal ={}
        protocal.partner_id = partner_id
        protocal.comment_id = comment_id
        protocal.type = type
        
        this.SendProtocal(11044,protocal)
    },
});

module.exports = PokedexController;