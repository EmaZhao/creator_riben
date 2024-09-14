// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-16 17:20:08
// --------------------------------------------------------------------
var VedioEvent = require("vedio_event")
var VedioConst = require("vedio_const")
var VedioController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var VedioModel = require("vedio_model");

        this.model = new VedioModel();
        this.model.initConfig();
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
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(19901,this.handle19901.bind(this)) //个人录像数据返回
        this.RegisterProtocal(19902,this.handle19902.bind(this)) //录像大厅数据返回
        this.RegisterProtocal(19903,this.handle19903.bind(this)) //点赞返回
        this.RegisterProtocal(19904,this.handle19904.bind(this)) //收藏返回
        this.RegisterProtocal(19905,this.handle19905.bind(this)) //分享返回
        this.RegisterProtocal(19906,this.handle19906.bind(this)) //今日点赞数
        this.RegisterProtocal(19907,this.handle19907.bind(this)) //伙伴信息数据

        this.RegisterProtocal(19908,this.handle19908.bind(this)) //查看分享录像
    },
    handle19901(data){
        if(data){
		    if(data.type == VedioConst.MyVedio_Type.Myself){
                gcore.GlobalEvent.fire(VedioEvent.UpdateMyselfVedioEvent, data.replay_list)
            }else if(data.type == VedioConst.MyVedio_Type.Collect){
                gcore.GlobalEvent.fire(VedioEvent.UpdateCollectVedioEvent, data.replay_list)
            }
        }
        
    },
    handle19902(data){
        if(data){
		    this.model.setPublicVedioData(data)
		    gcore.GlobalEvent.fire(VedioEvent.UpdatePublicVedioEvent, data.type)
        }
    },
    handle19903(data){
        message(data.msg)
        if(data.code == 1){
            gcore.GlobalEvent.fire(VedioEvent.CLICK_Like_Vedio_EVENT)
        }
    },
    handle19904(data){
        message(data.msg)
        if(data.code == 1 && data.type == 1){  //-- 收藏成功
            let new_data = this.model.updateVedioData(this.vedioType_flag, data.id, "is_collect", 1)
            gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
            gcore.GlobalEvent.fire(VedioEvent.CollectSuccessVedioEvent, data.id)
        }
        if(data.type == 0){
            gcore.GlobalEvent.fire(VedioEvent.CancelCollectVedioEvent, data.id)
        }
    },
    handle19905(data){
        message(data.msg)
    },
    handle19906(data){
        if(data.like != null){
            this.model.setTodayLikeNum(data.like)
            gcore.GlobalEvent.fire(VedioEvent.UpdateTodayLikeNum)
        }
    },
    handle19907(data){
        if(data){
            let config = Config.partner_data.data_partner_base[data.bid]
            let camp_type = 1
            if(config){
                camp_type = config.camp_type
            }
            data.camp_type = camp_type
            data.ext_data = data.ext
            data.name = config.name
            for(let i=0;i<data.ext.length;++i){
                let v = data.ext[i]
                if(v.key == 111){ //--命中
                    data.hit_rate = v.val
                }else if(v.key == 112){ // --闪避
                    data.dodge_rate = v.val
                }else if(v.key == 117){ //--抗暴
                    data.tenacity = v.val
                }else if(v.key == 121){  //--伤害加成
                    data.dam = v.val
                }else if(v.key == 122){ //--免伤
                    data.res = v.val
                }else if(v.key == 123){ //--被治疗
                    data.be_cure = v.val
                }else if(v.key == 124){ //--治疗
                    data.cure = v.val
                }else if(v.key == 125){  //--物伤
                    data.dam_p = v.val
                }else if(v.key == 126){  //--法伤
                    data.dam_s = v.val
                }else if(v.key == 127){   //--物免
                    data.res_p = v.val
                }else if(v.key == 128){  //--法免
                    data.res_s = v.val
                }
            }

            // --后端问题.没法改结构..现在模拟神装数据 从artifacts里面拿数据
            // data.holy_eqm = {}
            // for i,v in ipairs(data.artifacts) do
            //     if v.artifact_pos == BackPackConst.item_type.GOD_EARRING + 100 or
            //         v.artifact_pos == BackPackConst.item_type.GOD_RING + 100 or
            //         v.artifact_pos == BackPackConst.item_type.GOD_NECKLACE + 100 or
            //         v.artifact_pos == BackPackConst.item_type.GOD_BANGLE + 100 then
            //         --说明是神装
            //         local holy_data = {}
            //         holy_data.id = v.id
            //         holy_data.base_id = v.base_id
            //         holy_data.main_attr = v.attr
            //         holy_data.holy_eqm_attr = v.extra_attr
            //         for i,v in ipairs(holy_data.holy_eqm_attr) do
            //             v.pos = i
            //         end
            //         table.insert(data.holy_eqm, holy_data)
            //     end
            // end
            var HeroController = require("hero_controller")
            HeroController.getInstance().openHeroTipsPanel(true, data)
        }
    },
    handle19908(){

    },
    // - 请求录像大厅的数据
    requestPublicVedioData( type, cond_type, start, num ){
        let protocal = {}
        protocal.type = type
        protocal.cond_type = cond_type
        protocal.start = start
        protocal.num = num
        this.SendProtocal(19902, protocal)
    },
    // -- 请求伙伴信息
    requestVedioHeroData( replay_id, partner_id, type, srv_id, combat_type ){
        let protocal = {}
        protocal.replay_id = replay_id
        protocal.partner_id = partner_id
        protocal.type = type
        protocal.srv_id = srv_id
        protocal.combat_type = combat_type
        this.SendProtocal(19907, protocal)
    },
    // -- 请求录像分享
    requestShareVedio( id, channel, srv_id, combat_type ){
        let protocal = {}
        protocal.id = id
        protocal.channel = channel
        protocal.srv_id = srv_id
        protocal.combat_type = combat_type
        this.SendProtocal(19905, protocal)
    },
    // -- 请求录像收藏
    requestCollectVedio( id, type, srv_id, combat_type, vedioType ){
        this.vedioType_flag = vedioType  //-- 记录一下请求收藏的类型
        let protocal = {}
        protocal.id = id
        protocal.type = type
        protocal.srv_id = srv_id
        protocal.combat_type = combat_type
        this.SendProtocal(19904, protocal)
    },    
    // -- 请求录像点赞
    requestLikeVedio( id, srv_id, combat_type ){
        let protocal = {}
        protocal.id = id
        protocal.srv_id = srv_id
        protocal.combat_type = combat_type
        this.SendProtocal(19903, protocal)
    },
    // -- 请求个人录像数据(我的记录、我的收藏)
    requestMyVedioByType( type ){
        let protocal = {}
        protocal.type = type
        this.SendProtocal(19901, protocal)
    },
    // -- 录像信息
    send19908( replay_id, srv_id, type, channel ){
        let protocal = {}
        protocal.replay_id = replay_id
        protocal.srv_id = srv_id
        protocal.type = type
        protocal.channel = channel
        this.SendProtocal(19908, protocal)
    } ,
    handle19908(data){
        this.openVedioLookPanel(true, data)
        // -- GlobalEvent:getInstance():Fire(VedioEvent.LOOK_VEDIO_EVENT, data)
    },

    // 打开录像馆
    openVedioMainWindow( status, sub_type ){
        if(status == true){
            if(!this.vedio_main_wnd){
                var VedioMainWindow = require("vedio_main_window")
                this.vedio_main_wnd = new VedioMainWindow()
            }
            if(this.vedio_main_wnd.isOpen() == false){
                this.vedio_main_wnd.open(sub_type)
            }
        }else{
            if(this.vedio_main_wnd){
                this.vedio_main_wnd.close()
                this.vedio_main_wnd = null
            }
        }
    },
    //打开录像收藏界面
    openVedioCollectWindow(status){
        var self = this
        if(status == true){
            if(self.vedio_collect_win == null){
                var VedioCollectWindow = require("vedio_collect_window")
                self.vedio_collect_win = new VedioCollectWindow()
            }
            if(self.vedio_collect_win.isOpen() == false){
                self.vedio_collect_win.open()
            }
        }else{
            if(self.vedio_collect_win){
                self.vedio_collect_win.close()
                self.vedio_collect_win = null
            }
        }
    },
    //打开个人记录界面
    openVedioMyselfWindow(status){
        var self = this
        if(status == true){
            if(self.vedio_myself_win == null){
                var VedioMyselfWindow = require("vedio_myself_window")
                self.vedio_myself_win = new VedioMyselfWindow()
            }
            if(self.vedio_myself_win.isOpen() == false){
                self.vedio_myself_win.open()
            }
        }else{
            if(self.vedio_myself_win){
                self.vedio_myself_win.close()
                self.vedio_myself_win = null
            }
        }
    },
    openVedioLookPanel(status, data){
        if(status == true){
            if(!this.vedio_look_panel){
                let VedioLookPanel = require("vedio_look_window")
                this.vedio_look_panel = new VedioLookPanel()
            }
            if(this.vedio_look_panel.isOpen() == false){
                this.vedio_look_panel.open(data)
            }
        }else{
            if(this.vedio_look_panel){
                this.vedio_look_panel.close()
                this.vedio_look_panel = null
            }
        }
    },
    openVedioSharePanel(status,  vedio_id, world_pos, callback, srv_id, combat_type){
        if(status == true){
            if(!this.vedio_share_panel){
                let VedioSharePanel = require("vedio_share_window")
                this.vedio_share_panel = new VedioSharePanel()
            }
            if(this.vedio_share_panel.isOpen() == false){
                this.vedio_share_panel.open({replay_id:vedio_id, world_pos:world_pos, callback:callback, srv_id:srv_id, combat_type:combat_type})
            }
        }else{
            if(this.vedio_share_panel){
                this.vedio_share_panel.close()
                this.vedio_share_panel = null;
            }
        }
    },
});

module.exports = VedioController;