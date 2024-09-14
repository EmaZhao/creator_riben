// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: {DATE}
// --------------------------------------------------------------------
var HeroConst = require("hero_const");
var HeroEvent = require("hero_event");
var PartnerConst = require("partner_const");
var HeroCalculate = require("hero_calculate");
var BackPackConst = require("backpack_const");
var LoginController = require("login_controller");

var HeroController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var HeroModel = require("hero_model");

        this.model = new HeroModel(this);
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // 断线重连重置一下伙伴及其装备缓存数据
        this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function () {
            // this.sender11000();
            // this.sender11040();
            // this.sender11037();
        }.bind(this))

        // 角色数据创建完毕后，监听资产数据变化情况
        this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
            gcore.GlobalEvent.unbind(this.login_event_success)
            this.login_event_success = null;
            // this.sender11000();
            // this.sender11040();
            // this.sender11037();
            var StartowerController = require("startower_controller");
            StartowerController.getInstance().sender11320();

            var RoleController = require("role_controller")
            var role_vo = RoleController.getInstance().getRoleVo();
            this.role_update_evt = role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, lev) {
                   if (key == "coin") {
                        this.model.checkLevelRedPointUpdate();
                   } else if (key == "hero_exp") {
                        this.model.checkLevelRedPointUpdate();
                   } else if (key == "lev") {
                        this.model.checkUnlockFormRedPoint(lev);
                   }
            }, this);


        }.bind(this))

        // 物品道具增加 判断红点
        if (!this.add_goods_event) {
             this.add_goods_event = gcore.GlobalEvent.bind(EventId.ADD_GOODS, function(bag_code,temp_add) {

                if (bag_code == BackPackConst.Bag_Code.EQUIPS) {
                    this.model.is_equip_redpoint_bag_update = true
                    this.model.checkEquipRedPointUpdate()
                } else {
                    for (var item_i in temp_add) {
                        var item = temp_add[item_i];
                        if (item.base_id == this.model.upgrade_star_cost_id) {
                            this.model.is_upgradestar_redpoint_bag_update = true;
                            this.model.checkUpgradeStarRedPointUpdate();
                            this.model.checkLevelRedPointUpdate();                     
                        } else if (item.base_id == this.model.talent_skill_cost_id) {
                            this.model.setUpdateTalentRedpoint();
                            this.model.checkTalentRedPointUpdate();                            
                        }

                        // gdata("item_data", "data_skill_item_list", item.base_id);

                        if(Utils.getItemConfig(item.base_id)){
                            this.model.setUpdateTalentRedpoint()
                            this.model.checkTalentRedPointUpdate()
                        }
                    }
                }
            }.bind(this))
        }

        // 物品道具删除 判断红点
        if (!this.del_goods_event) {
             this.del_goods_event = gcore.GlobalEvent.bind(EventId.DELETE_GOODS, function(bag_code,temp_add) {
                if (bag_code == BackPackConst.Bag_Code.EQUIPS) {
                    this.model.is_equip_redpoint_bag_update = true;
                    this.model.checkEquipRedPointUpdate();
                } else {
                    for (var item_i in temp_add) {
                        var item = temp_add[item_i];

                        if (item.base_id == this.model.upgrade_star_cost_id) {
                            this.model.is_upgradestar_redpoint_bag_update = true
                            this.model.checkUpgradeStarRedPointUpdate()
                            this.model.checkLevelRedPointUpdate()                            
                        } else if (item.base_id == this.model.talent_skill_cost_id) {
                            this.model.setUpdateTalentRedpoint()
                            this.model.checkTalentRedPointUpdate()                            
                        }                        
                        if(Utils.getItemConfig(item.base_id)){
                            this.model.setUpdateTalentRedpoint()
                            this.model.checkTalentRedPointUpdate()
                        }
                    }
                }
            }.bind(this))
        }

        // 物品道具改变 判断红点
        if (!this.modify_goods_event) {
             this.modify_goods_event = gcore.GlobalEvent.bind(EventId.MODIFY_GOODS_NUM, function(bag_code,temp_add) {
                if (bag_code == BackPackConst.Bag_Code.EQUIPS) {
                    this.model.is_equip_redpoint_bag_update = true;
                    this.model.checkEquipRedPointUpdate();          
                } else {
                    for (var item_i in temp_add) {
                        var item = temp_add[item_i];

                        if (item.base_id == this.model.upgrade_star_cost_id) {
                            this.model.is_upgradestar_redpoint_bag_update = true
                            this.model.checkUpgradeStarRedPointUpdate()
                            this.model.checkLevelRedPointUpdate()                            
                        } else if (item.base_id == this.model.talent_skill_cost_id) {
                            this.model.setUpdateTalentRedpoint()
                            this.model.checkTalentRedPointUpdate()                            
                        }                        
                        if(Utils.getItemConfig(item.base_id)){
                            this.model.setUpdateTalentRedpoint()
                            this.model.checkTalentRedPointUpdate()
                        }
                    }
                }
            }.bind(this))
        }

        // 激活神器(圣器) 判断红点
        if (!this.update_drama_hallows_event) {
            var HallowsEvent = require("hallows_event");
            this.update_drama_hallows_event = gcore.GlobalEvent.bind(HallowsEvent.HallowsActivityEvent, function() {
                this.model.checkUnlockHallowsRedPoint();
            }.bind(this))
         }        
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(11000, this.handle11000.bind(this));     //请求所有伙伴
        this.RegisterProtocal(11001, this.handle11001.bind(this));     //伙伴增加
        this.RegisterProtocal(11002, this.handle11002.bind(this));     //伙伴属性变更通知(单个伙伴属性)
        this.RegisterProtocal(11007, this.handle11007.bind(this));     //伙伴属性变更通知(list列表伙伴属性)

        //升级
        this.RegisterProtocal(11003, this.handle11003.bind(this));     //伙伴升级
        this.RegisterProtocal(11004, this.handle11004.bind(this));     //伙伴进阶
        this.RegisterProtocal(11005, this.handle11005.bind(this));     //伙伴升星
        this.RegisterProtocal(11006, this.handle11006.bind(this));     //删除伙伴推送

        this.RegisterProtocal(11009, this.handle11009.bind(this));     //购买英雄数量上限
        this.RegisterProtocal(11016, this.handle11016.bind(this));     //伙伴下一阶属性
        this.RegisterProtocal(11017, this.handle11017.bind(this));     //推送伙伴最新数量

        //装备相关
        this.RegisterProtocal(11010, this.handle11010.bind(this));     //穿戴装备
        this.RegisterProtocal(11011, this.handle11011.bind(this));     //卸下装备
        this.RegisterProtocal(11012, this.handle11012.bind(this));     //推送装备改变
        // this.RegisterProtocal(11013, this.handle11013.bind(this));     //装备精炼
        // this.RegisterProtocal(11014, this.handle11014.bind(this));     //一键精炼

        this.RegisterProtocal(11015, this.handle11015.bind(this));     //英雄锁定

        //请求阵法
        // this.RegisterProtocal(11200, this.handle11200.bind(this));     //请求自身阵法
        // this.RegisterProtocal(11201, this.handle11201.bind(this));     //更换自身阵法
        // this.RegisterProtocal(11202, this.handle11202.bind(this));     //伙伴上阵/下阵/交换
        // this.RegisterProtocal(11203, this.handle11203.bind(this));     //阵法数据改变推送
        // this.RegisterProtocal(11204, this.handle11204.bind(this));     //阵法升级/激活
        this.RegisterProtocal(11211, this.handle11211.bind(this));     //请求队伍
        this.RegisterProtocal(11212, this.handle11212.bind(this));     //请求保存队伍协议
        this.RegisterProtocal(11213, this.handle11213.bind(this));     //请求多个队伍

        // //符文相关
        this.RegisterProtocal(11030, this.handle11030.bind(this));     //符文穿戴
        this.RegisterProtocal(11031, this.handle11031.bind(this));     //推送符文改变
        this.RegisterProtocal(11032, this.handle11032.bind(this));     //符文升星
        this.RegisterProtocal(11033, this.handle11033.bind(this));     //符文重置
        this.RegisterProtocal(11034, this.handle11034.bind(this));     //符文重铸保存
        this.RegisterProtocal(11035, this.handle11035.bind(this));     //符文碎片合成
        this.RegisterProtocal(11036, this.handle11036.bind(this));     //符文合成
        this.RegisterProtocal(11037, this.handle11037.bind(this));     //符文祝福值
        this.RegisterProtocal(11038, this.handle11038.bind(this));     //领取符文祝福值

        this.RegisterProtocal(11040, this.handle11040.bind(this));     //英雄图鉴信息
        this.RegisterProtocal(11060, this.handle11060.bind(this));     //英雄图鉴信息

        this.RegisterProtocal(11075, this.handle11075.bind(this));     //请求英雄遣散 分解材料
        this.RegisterProtocal(11076, this.handle11076.bind(this));     //英雄遣散 分解    
        

        // --天赋相关
        this.RegisterProtocal(11096, this.handle11096.bind(this))     //学习天赋技能
        this.RegisterProtocal(11097, this.handle11097.bind(this))     //天赋技能升级
        this.RegisterProtocal(11098, this.handle11098.bind(this))     //天赋遗忘
        this.RegisterProtocal(11099, this.handle11099.bind(this))     //获取英雄天赋信息      
        
        this.RegisterProtocal(11063, this.handle11063.bind(this))     //--英雄详细信息

        this.RegisterProtocal(11019, this.handle11019.bind(this))     //--皮肤
        this.RegisterProtocal(11020, this.handle11020.bind(this))     //--
        
        // 成人剧情相关
        this.RegisterProtocal(11124, this.handle11124.bind(this))     // 请求成人剧情领取奖励
        this.RegisterProtocal(11125, this.handle11125.bind(this))     // 请求成人剧情领取状态

        this.RegisterProtocal(11065, this.handle11065.bind(this))//英雄重生请求材料
        this.RegisterProtocal(11066, this.handle11066.bind(this))//英雄重生结果
    },
    sender11063(partner_id){
        let protocal ={}
        protocal.partner_id = partner_id
        this.SendProtocal(11063,protocal)
    },
    handle11063( data ){
        this.model.updateHeroVoDetailedInfo(data)
    },
    sender11000: function () {
        var protocal = {}
        this.SendProtocal(11000, protocal);
    },

    handle11000: function (data) {     //请求所有伙伴
        this.model.setHeroMaxCount(data.num);
        this.model.setHeroBuyNum(data.buy_num);
        this.model.updateHeroList(data.partners);
        // 初始化成人剧情
        for(let i=0; i<data.partners.length; i++){
            console.log("handle11000 初始化成人剧情  ")
            this.checkUnlockHeroPlot(data.partners[i]);
        }
        
        var calculate = HeroCalculate.getInstance();
        RedMgr.getInstance().addCalHandler(calculate.checkAllStarFuseRedpoint.bind(calculate), RedIds.RefuseHero);

        this.sender11020();
    },

    handle11001: function (data) {     //伙伴增加
        this.model.updateHeroList(data.partners, true)

        //消除熔炼祭坛的红点 里面会重新计算红点
        HeroCalculate.getInstance().clearAllStarFuseRedpointRecord();

        this.model.is_upgradestar_redpoint_bag_update = true;
        this.model.checkUpgradeStarRedPointUpdate();
    },

    handle11002: function (data) {     //单个伙伴属性变更通知
        this.model.updateHeroVo(data);
    },

    handle11007: function (data) {     //list伙伴属性变更通知(
        var RoleController = require("role_controller")
        RoleController.getInstance().getRoleVo().showPower(true)
        this.model.updateHeroList(data.ref_partners, null, true);
    },

    sender11003: function (partner_id) {         // 伙伴升级
        var protocal = {};
        protocal.partner_id = partner_id;
        this.SendProtocal(11003, protocal);
    },

    handle11003: function (data) {     //伙伴升级
        if (data && data.result === 1) {
            gcore.GlobalEvent.getInstance().fire(HeroEvent.Hero_Level_Up_Success_Event, data)
        }
    },

    sender11004: function (partner_id) {
        var protocal = {};
        protocal.partner_id = partner_id;
        this.SendProtocal(11004, protocal);
    },

    handle11004: function (data) {     //伙伴进阶结果
        if (data && data.result == 1) {
            // 显示进阶窗口
        }
    },

    sender11005: function (partner_id, hero_list, random_list) {
        var protocal = {}
        protocal.partner_id = partner_id;
        protocal.expend1 = hero_list;
        protocal.expend2 = random_list;
        this.SendProtocal(11005, protocal);
    },

    handle11005: function (data) {     //伙伴升星
        message(data.msg)
        if (data && data.result === 1) {
            gcore.GlobalEvent.fire(HeroEvent.Upgrade_Star_Success_Event);
        } else {
            this.model.setUpgradeStarUpdateRecord(true);
        }
    },

    handle11006: function (data) {     //删除伙伴推送
        this.model.delHeroDataList(data.expend2);
    },

    sender11009: function () {
        this.SendProtocal(11009, {});
    },

    handle11009: function (data) {     //购买英雄数量上限        
        if (data.result) {
            this.model.setHeroMaxCount(data.num);
            this.model.setHeroBuyNum(data.buy_num);
            gcore.GlobalEvent.fire(HeroEvent.Buy_Hero_Max_Count_Event);
        }
    },

    sender11016: function (partner_id) {
        var protocal = {};
        protocal.partner_id = partner_id;
        this.SendProtocal(11016, protocal);
    },

    handle11016: function (data) {     //伙伴下一阶属性
        gcore.GlobalEvent.fire(HeroEvent.Next_Break_Info_Event, data);
    },

    handle11017: function (data) {     //推送伙伴最新数量
    },

    // 0 表示一键穿戴
    sender11010: function (partner_id, item_id) {     //穿戴装备
        this.model.setEquipUpdateRecord(false);
        var protocal = {}
        protocal.partner_id = partner_id
        protocal.item_id = item_id
        this.SendProtocal(11010, protocal);
    },

    handle11010: function (data) {
        message(data.msg);
        if (!data.result)
            this.model.setEquipUpdateRecord(true);
    },

    sender11011: function (partner_id, pos_id) {
        this.model.setEquipUpdateRecord(false);        
        var protocal = {}
        protocal.partner_id = partner_id
        //此值改成装备唯一id 
        protocal.pos_id = pos_id
        this.SendProtocal(11011, protocal);
    },

    handle11011: function (data) {     //卸下装备
        message(data.msg)
        if (!data.result)
            this.model.setEquipUpdateRecord(true);        
    },

    handle11012: function (data) {     //推送装备改变
        message(data.msg);
        if (data) {
            this.model.updateHeroEquipList(data);
            data = this.model.getHeroById(data.partner_id)
            gcore.GlobalEvent.fire(HeroEvent.Equip_Update_Event,data);
            this.model.is_equip_redpoint_hero_update = true;
            this.model.checkEquipRedPointUpdate()
        }
    },

    sender11015: function (partner_id, is_lock) {
        var protocal = {}
        protocal.partner_id = partner_id;
        protocal.type = is_lock;
        this.SendProtocal(11015, protocal)
    },

    handle11015: function (data) {     //英雄锁定
        if (data.result == 1) {
            this.model.setLockByPartnerid(data.partner_id, data.type)
            gcore.GlobalEvent.fire(HeroEvent.Hero_Lock_Event)
        }
    },

    sender11211: function (type) {     // 请求单个布阵信息 
        var protocal = {}
        protocal.type = type
        this.SendProtocal(11211, protocal)
    },

    handle11211: function (data) {     // 请求单个布阵信息结果
        if (!data || typeof data.type != "number") return
        if (data && (data.type === PartnerConst.Fun_Form.Drama || data.type === PartnerConst.Fun_Form.Arena))
            this.model.setFormList(data);
        gcore.GlobalEvent.fire(HeroEvent.Update_Fun_Form, data);
    },

    sender11212: function (type, formation_type, pos_info, hallows_id) {
        var protocal = {}
        protocal.type = type
        protocal.formation_type = formation_type
        protocal.pos_info = pos_info
        protocal.hallows_id = hallows_id
        this.SendProtocal(11212, protocal)
    },

    handle11212: function (data) {     //请求保存队伍协议
        if (data.code) {
            if (data.type === PartnerConst.Fun_Form.Drama) {
                var type_list = [];
                var drma_info = {};
                drma_info["type"] = PartnerConst.Fun_Form.Drama;
                type_list.push(drma_info);
                var arena_info = {};
                arena_info["type"] = PartnerConst.Fun_Form.Arena;
                type_list.push(arena_info);
                this.sender11213(type_list);
            } else if (data.type === PartnerConst.Fun_Form.Arena) {
                this.sender11211(data.type);
            } else if(data.type === PartnerConst.Fun_Form.LimitExercise){
                var LimitExerciseController = require("limitexercise_controller")
                LimitExerciseController.getInstance().checkJoinFight()
            }
            gcore.GlobalEvent.fire(HeroEvent.Update_Save_Form, data);
        } else {
            message(Utils.TI18N(data.msg))
        }
    },

    sender11213: function (type_list) {    // 请求多个布阵
        var protocal = {}
        protocal.type_list = type_list;
        this.SendProtocal(11213, protocal);
    },

    handle11213: function (data) {     //请求多个布阵结果
        if (!data || !data.info) return;        
        for (var form_i in data.info) {
            var form_data = data.info[form_i];
            if (form_data && (form_data.type === PartnerConst.Fun_Form.Drama ||
                form_data.type === PartnerConst.Fun_Form.Arena))
                this.model.setFormList(form_data);
        }
    },
    //符文-----------------

    //符文穿戴/卸下
    sender11030: function (partner_id, pos_id, artifact_id, type) {
        this.model.setEquipUpdateRecord(false)
        var protocal = {}
        protocal.partner_id = partner_id
        protocal.pos_id = pos_id
        protocal.artifact_id = artifact_id
        protocal.type = type
        this.SendProtocal(11030, protocal)
    },

    handle11030: function (data) {     //符文穿戴
        message(data.msg);
        if (data.result == 0) {
            this.model.setEquipUpdateRecord(true)
        }
    },

    //推送符文改变
    handle11031: function (data) {
        message(data.msg || "");
        this.model.updatePartnerArtifactList(data)
    },

    //符文升星
    sender11032: function (partner_id, artifact_id, expends) {
        var protocal = {};
        protocal.partner_id = partner_id;
        protocal.artifact_id = artifact_id;
        protocal.expends = expends;
        this.SendProtocal(11032, protocal)
    },

    handle11032: function (data) {     //符文升星
        message(data.msg);
        if (data.result == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Artifact_UpStar_Event, data)
        }
    },

    //符文重置
    sender11033: function (partner_id, artifact_id, skills) {
        var protocal = {};
        protocal.partner_id = partner_id;
        protocal.artifact_id = artifact_id;
        protocal.skills = skills;
        this.SendProtocal(11033, protocal)
    },

    handle11033: function (data) {     //符文重置
        message(data.msg);
        if (data.result == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Artifact_Recast_Event)
        }
    },

    //符文重铸保存
    sender11034: function (partner_id, artifact_id, type) {
        var protocal = {};
        protocal.partner_id = partner_id;
        protocal.artifact_id = artifact_id;
        protocal.type = type;
        this.SendProtocal(11034, protocal);
    },


    handle11034: function (data) {     //符文重铸保存
        message(data.msg)
        if (data.result == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Artifact_Save_Event)
        }
    },

    //符文分解
    sender11035: function (artifact_id) {
        var protocal = {};
        protocal.artifact_id = artifact_id;
        this.SendProtocal(11035, protocal)
    },

    handle11035: function (data) {     //符文碎片合成
        message(data.msg)
    },

    //符文合成
    sender11036: function (item_id, expend) {
        var protocal = {};
        protocal.item_id = item_id;
        protocal.expends = expend;
        this.SendProtocal(11036, protocal);
    },

    handle11036: function (data) {     //符文合成
        message(data.msg);
        if (data.result == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Artifact_Compound_Event, data.flag)
        }
    },

    //符文祝福值
    sender11037: function () {
        var protocal = {}
        this.SendProtocal(11037, protocal);
    },

    handle11037: function (data) {     //符文祝福值
        if (data && data.lucky != null) {
            this.model.setArtifactLucky(data.lucky);
            gcore.GlobalEvent.fire(HeroEvent.Artifact_Lucky_Event)
        }
    },

    //领取符文祝福值
    sender11038: function () {
        this.SendProtocal(11038, {});
    },

    handle11038: function (data) {     //领取符文祝福值
        message(data.msg)
    },

    sender11040: function () {
        var protocal = {}
        this.SendProtocal(11040, protocal);
    },

    handle11040: function (data) {     //英雄图鉴信息
        this.model.setHadHeroInfo(data.partners);
    },

    sender11060: function (channel, partner_id) {
        var protocal = {};
        protocal.channel = channel;
        protocal.partner_id = partner_id;
        this.SendProtocal(11060, protocal);
    },

    handle11060: function (data) {     //英雄图鉴信息
        message(data.msg);
    },

    sender11075: function (hero_list) {     //请求英雄分解材料
        var protocal = {};
        protocal.list = hero_list;
        this.SendProtocal(11075, protocal);
    },

    handle11075: function (data) {
        if (data.code == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Hero_Reset_Look_Event, data.list);
        }
    },

    sender11076: function (partner_list) {
        var protocal = {}
        protocal.list = partner_list
        this.SendProtocal(11076, protocal);
    },

    handle11076: function (data) {     //英雄遣散 
        message(data.msg)
        if (data.code) {
            this.model.delHeroDataList(data.list);
        }
    },
    //-天赋相关开始
    sender11096(partner_id, pos, skill_id){
        let protocal = {}
        protocal.partner_id = partner_id
        protocal.pos = pos
        protocal.skill_id = skill_id
        this.SendProtocal(11096, protocal)
    },
    handle11096(data){
        if(data.result == true){
            this.model.updateHeroVoTalent([data], true)
            data = this.model.getHeroById(data.partner_id)
            gcore.GlobalEvent.fire(HeroEvent.Hero_Learn_Talent_Event, data)
            HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPTalent)
        }else{
            message(data.msg)
        }
    },

    // 英雄重生返回材料
    sender11065(hero_list){
        var protocal = {};
        protocal.list = hero_list;
        this.SendProtocal(11065, protocal);
    },

    handle11065(data){
        if (data.code == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Hero_Reset_Rebirth_Data, data.list);
        }
    },

    sender11066(hero_list){
        var protocal = {};
        protocal.list = hero_list;
        this.SendProtocal(11066, protocal);
    },

    handle11066(data){
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Hero_Reset_Rebirth);
        }
    },

    //打开英雄界面
    openHeroMainWindow: function (status, hero_vo) {
        if (!status) {
            if (this.hero_main_window) {
                this.hero_main_window.close()
                this.hero_main_window = null
            }
        } else {
            if (!this.hero_main_window) {
                var HeroMainWIndow = require("hero_main_window");
                this.hero_main_window = new HeroMainWIndow(this);
            }
            this.hero_main_window.open();
        }
    },
    // 英雄(伙伴)背包界面
    // @ hero_vo 英雄对应数据对象
    openHeroBagWindow: function (status, hero_vo) {
        if (!status) {
            if (this.hero_bag_window) {
                this.hero_bag_window.close()
                this.hero_bag_window = null
            }
        } else {
            if (!this.hero_bag_window) {
                var HeroBagWIndow = require("hero_bag_window");
                this.hero_bag_window = new HeroBagWIndow(this);
            }
            this.hero_bag_window.open(hero_vo);
        }
    },

    //打开英雄图书馆信息
    openHeroLibraryMainWindow: function (status, bid) {
        if (status == false) {
            if (this.hero_library_mainWindow != null) {
                this.hero_library_mainWindow.close()
                this.hero_library_mainWindow = null
            }
        } else {
            if (this.hero_library_mainWindow == null) {
                var HeroLibraryMainWindow = require("hero_library_main_window")
                this.hero_library_mainWindow = new HeroLibraryMainWindow()
            }
            this.hero_library_mainWindow.open(bid)
        }
    },


    //打开英雄图书馆信息
    openHeroLibraryInfoWindow: function (status, bid) {
        if (status == false) {
            if (this.hero_library_info != null) {
                this.hero_library_info.close()
                this.hero_library_info = null
            }
        } else {
            if (this.hero_library_info == null) {
                var HeroLibraryInfoWindow = require("hero_library_info_window")
                this.hero_library_info = new HeroLibraryInfoWindow()
            }
            this.hero_library_info.open(bid)
        }
    },

    //打开英雄图书馆传记信息
    openHeroLibraryStoryPanel: function (status, name, content) {
        if (status == false) {
            if (this.hero_library_story != null) {
                this.hero_library_story.close()
                this.hero_library_story = null
            }
        } else {
            if (this.hero_library_story == null) {
                var HeroLibraryInfoWindow = require("hero_library_story_window")
                this.hero_library_story = new HeroLibraryInfoWindow()
            }
            this.hero_library_story.open({ name: name, content: content })
        }
    },

    // -- 英雄(伙伴)主信息 界面
    // --@ hero_vo 英雄对应数据对象
    // --@ hero_list 英雄对象列表 
    // --@ setting 结构
    // --setting.showType 显示英雄新的页签类型
    // --setting.show_model_type 显示模式 1:英雄模式  2:图鉴模式 定义参考 HeroConst.BagTab.eBagHero
    openHeroMainInfoWindow: function (status, hero_vo, hero_list, setting) {
        if (status) {
            if (!this.hero_main_info_window) {
                var HeroMainInfoWindow = require("hero_main_info_window");
                this.hero_main_info_window = new HeroMainInfoWindow(this);
            }
            var open_pragma = {}
            open_pragma.hero_vo = hero_vo;
            open_pragma.hero_list = hero_list;
            open_pragma.setting = setting;
            this.hero_main_info_window.open(open_pragma);
        } else {
            if (this.hero_main_info_window) {
                this.hero_main_info_window.close();
                this.hero_main_info_window = null
            }
        }
    },

    // 打开英雄成人剧情面板
    openHeroPlotPanel: function(status, bid) {
        if (status == false) {
            if (this.hero_plot_panel!= null) {
                this.hero_plot_panel.close()
                this.hero_plot_panel = null
            }
            return;
        } 

        if (this.hero_plot_panel == null) {
            const w = require("hero_library_plot_window");
            this.hero_plot_panel = new w()
        }
        this.hero_plot_panel.open(bid)
    },

    // 打开英雄成人剧情详情面板
    openHeroPlotWindow: function(status, hero_id, plot_id) {
        if(!status) {
            if(this.hero_main_plot_window != null) {
                this.hero_main_plot_window.close();
                this.hero_main_plot_window = null;
            }
            return;
        }
        
        if(this.hero_main_plot_window == null) {
            const w = require("hero_main_plot_window");
            this.hero_main_plot_window = new w();
        }
        this.hero_main_plot_window.open({hero_id: hero_id, plot_id: plot_id});
    },

    //打开英雄重生界面
    openHeroRebirthWidow(status,hero_vo){
        if(!status){
            if(this.hero_rebirth_window != null){
                this.hero_rebirth_window.close();
                this.hero_rebirth_window = null;
            }
        }else{
            if(this.hero_rebirth_window == null){
                var HeroRebirthWindow = require("hero_rebirth_window");
                this.hero_rebirth_window = new HeroRebirthWindow(this);
            }
            this.hero_rebirth_window.open({hero_vo});
        }
    },

    getLibraryPlotRoot:function(finish_cb){
      if (finish_cb) {
        if (this.hero_plot_panel) {
            this.hero_plot_panel.getRootWnd(finish_cb);
        } else {
            finish_cb(null);
        }
      } else {
          if (this.hero_plot_panel)
              return this.hero_plot_panel.root_wnd;
      }
    },

    getLibraryPlotCommonAlertRoot:function(finish_cb){
      if (finish_cb) {
        if (this.hero_plot_panel&&this.hero_plot_panel.CommonAlert) {
            this.hero_plot_panel.CommonAlert.getRootWnd(finish_cb);
        } else {
            finish_cb(null);
        }
      } else {
          if (this.hero_plot_panel &&this.hero_plot_panel.CommonAlert)
              return this.hero_plot_panel.CommonAlert.root_wnd;
      }
    },
    
    // 打成人剧情对话历史记录面板
    openHeroPlotHistoryPanel(status, data) {
        if(!status) {
            if(this.hero_main_plotHistory_panel != null) {
                this.hero_main_plotHistory_panel.close();
                this.hero_main_plotHistory_panel = null;
            }
            return;
        }

        if(this.hero_main_plotHistory_panel == null) {
            const w = require("hero_main_plotHistory_panel");
            this.hero_main_plotHistory_panel = new w();
        }
        this.hero_main_plotHistory_panel.open(data);
    },

    // 打开立绘界面
    openHeroLookDrawWindow: function (status, draw_res_id, name, bid, share_type) {
        if (status) {
            if (!this.hero_look_draw_window) {
                this.hero_look_draw_window = Utils.createClass("hero_look_draw_window")
            }
            var data = {
                draw_res_id: draw_res_id,
                name: name,
                bid: bid,
                share_type: share_type,
            }
            this.hero_look_draw_window.open(data)
        } else {
            if (this.hero_look_draw_window) {
                this.hero_look_draw_window.close();
                this.hero_look_draw_window = null;
            }
        }
    },

    // --打开进阶界面
    openHeroBreakPanel: function (status, hero_vo) {
        if (status) {
            if (!this.hero_break_panel) {
                var HeroBreakPanel = require("hero_break_window");
                this.hero_break_panel = new HeroBreakPanel(this);
            }
            this.hero_break_panel.open(hero_vo);
        } else {
            if (this.hero_break_panel) {
                this.hero_break_panel.close();
                this.hero_break_panel = null;
            }
        }
    },

    // 打开进阶成功界面 old_vo new_vo 都是heroVo对象
    openBreakExhibitionWindow: function (status, old_vo, new_vo) {
        if (status) {
            if (!this.break_exhibition_window) {
                var HeroBreakExhibitionWindow = require("hero_break_exhibition_window");
                this.break_exhibition_window = new HeroBreakExhibitionWindow(this);
            }
            if (this.break_exhibition_window && !this.break_exhibition_window.isOpen()) {
                var open_pragma = {};
                open_pragma.old_vo = old_vo;
                open_pragma.new_vo = new_vo;
                this.break_exhibition_window.open(open_pragma);
            }
        } else {
            if (this.break_exhibition_window) {
                this.break_exhibition_window.close();
                this.break_exhibition_window = null;
            }
            if(old_vo && typeof (old_vo) =="number"){
                let skill_bid = old_vo
                this.openSkillUnlockWindow(true,skill_bid)
            }
        }
    },


    // 打开升星成功界面 old_vo new_vo 都是heroVo对象
    openHeroUpgradeStarExhibitionPanel: function (status, old_vo, new_vo) {
        if (status) {
            if (!this.upgrade_star_exhibition_window) {
                var HeroUpgradeStarExhibitionPanel = require("hero_upgrade_star_exhibition_window");
                this.upgrade_star_exhibition_window = new HeroUpgradeStarExhibitionPanel(this);
            }
            if (this.upgrade_star_exhibition_window && !this.upgrade_star_exhibition_window.isOpen()) {
                var open_pragma = {};
                open_pragma.old_vo = old_vo;
                open_pragma.new_vo = new_vo;
                this.upgrade_star_exhibition_window.open(open_pragma);
            }
        } else if (this.upgrade_star_exhibition_window) {
            this.upgrade_star_exhibition_window.close();
            this.upgrade_star_exhibition_window = null;
        }
    },

    // --打开天赋技能学习面板
    // function HeroController:openSkillUnlockWindow(status, skill_bid)

    //     if status == true then
    //         if not this.unlock_window then 
    //             this.unlock_window = SkillUnlockWindow.New(skill_bid)
    //         end
    //         if this.unlock_window and this.unlock_window:isOpen() == false then
    //             this.unlock_window:open()
    //         end
    //     else 
    //         if this.unlock_window then 
    //             this.unlock_window:close()
    //             this.unlock_window = null
    //         end
    //     end
    // end



    // --打开英雄过滤
    // function HeroController:openFormFilterHeroPanel(status, dic_filter_camp_type, dic_filter_career_type)
    //     if status == true then
    //         if not this.form_filter_hero_panel then 
    //             this.form_filter_hero_panel = FormFilterHeroPanel.New()
    //         end
    //         if this.form_filter_hero_panel and this.form_filter_hero_panel:isOpen() == false then
    //             this.form_filter_hero_panel:open(dic_filter_camp_type, dic_filter_career_type)
    //         end
    //     else 
    //         if this.form_filter_hero_panel then 
    //             this.form_filter_hero_panel:close()
    //             this.form_filter_hero_panel = null
    //         end
    //     end
    // end

    // --打开布阵出战界面
    // --@fun_form_type 布阵队伍类型
    // --@show_type 出战界面显示类型 1 出战 2 保存布阵
    openFormGoFightPanel: function (status, fun_form_type, setting, show_type) {
        if (!status) {
            if (this.form_go_fight_panel) {
                this.form_go_fight_panel.close();
                this.form_go_fight_panel = null;
            }
        } else {
            if (!this.form_go_fight_panel) {
                var FormGoFightPanel = require("form_go_fight_window");
                this.form_go_fight_panel = new FormGoFightPanel(this);
            }
            var open_pragma = {}
            open_pragma.fun_form_type = fun_form_type;
            open_pragma.setting = setting;
            open_pragma.show_type = show_type;
            this.form_go_fight_panel.open(open_pragma);
            // this.form_go_fight_panel.(fun_form_type, setting, show_type);
        }
    },

    // 打开布阵 改成和 布阵出战界面 合二为一
    openFormMainWindow: function (status, fun_form_type,key) {
        var params = {}
        if(key == "battle"){
          params.key = key;
        }
        this.openFormGoFightPanel(status, fun_form_type, params, HeroConst.FormShowType.eFormSave)
    },

    // 打开选择阵法界面
    // @formation_type 阵法类型 也是配置表的id
    openFormationSelectPanel: function (status, formation_type, callback) {
        if (status) {
            if (!this.formation_select_panel) {
                var FormSelectPannel = require("form_select_panel");
                this.formation_select_panel = new FormSelectPannel(this);
            }
            // if (this.formation_select_panel && !this.formation_select_panel.isOpen()) {
            var open_pragma = {};
            open_pragma.formation_type = formation_type;
            open_pragma.callback = callback;
            this.formation_select_panel.open(open_pragma);
            // }
        } else {
            if (this.formation_select_panel) {
                this.formation_select_panel.close()
                this.formation_select_panel = null
            }
        }
    },

    // 打开选择神器界面
    // @hallows_id 神器id
    openFormHallowsSelectPanel: function (status, hallows_id, callback) {
        if (status) {
            if (!this.form_hallows_select_panel) {
                var FormHallowsSelectPanel = require("form_hallows_select_window");
                this.form_hallows_select_panel = new FormHallowsSelectPanel(this);
            }
            var open_pragma = {};
            open_pragma.hallows_id = hallows_id;
            open_pragma.callback = callback;
            this.form_hallows_select_panel.open(open_pragma);
            // end
        } else {
            if (this.form_hallows_select_panel) {
                this.form_hallows_select_panel.close()
                this.form_hallows_select_panel = null
            }
        }
    },

    // 打开英雄升星界面 4升5 5升6 融合祭坛
    openHeroUpgradeStarFuseWindow: function (status, hero_vo) {
        if (status) {
            if (!this.upgrade_star_fuse_window || !this.upgrade_star_fuse_window.root_wnd) {
                var HeroUpgradeStarFuseWindow = require("hero_upgrade_star_fuse_window");
                this.upgrade_star_fuse_window = new HeroUpgradeStarFuseWindow(this);
            }
            if (this.upgrade_star_fuse_window && !this.upgrade_star_fuse_window.isOpen()) {
                this.upgrade_star_fuse_window.open(hero_vo);
            }
        } else {
            if (this.upgrade_star_fuse_window) {
                this.upgrade_star_fuse_window.close();
                this.upgrade_star_fuse_window = null;
            }
        }
    },
    // @select_data 是模拟hero_vo的数据
    // @dic_other_selected 已经其他被选择的数据 [id] = hero_vo模式
    // @ form_type --来源位置  1: 表示融合祭坛 2: 表示升星界面的
    // @ is_master 是否是主卡(融合祭坛专用)
    openHeroUpgradeStarSelectPanel: function (status, select_data, dic_other_selected, form_type, is_master, select_cb, cur_hero_vo) {
        if (status) {
            if (!this.upgrade_star_select_panel) {
                var HeroUpgradeStarSelectPanel = require("hero_upgrade_star_select_window");
                this.upgrade_star_select_panel = new HeroUpgradeStarSelectPanel(this);
            }
            var open_pragma = {};
            open_pragma.select_data = select_data;
            open_pragma.dic_other_selected = dic_other_selected;
            open_pragma.form_type = form_type;
            open_pragma.select_cb = select_cb;
            open_pragma.cur_hero_vo = cur_hero_vo;
            open_pragma.is_master = is_master;
            this.upgrade_star_select_panel.open(open_pragma);
            // if this.upgrade_star_select_panel and this.upgrade_star_select_panel:isOpen() == false then
        } else {
            if (this.upgrade_star_select_panel) {
                this.upgrade_star_select_panel.close();
                this.upgrade_star_select_panel = null;
            }
        }
    },

    // 打开重生操作界面
    openHeroResetWindow: function (status, data) {
        if (status) {
            if (!this.hero_reset_window) {
                var HeroResetWindow = require("hero_reset_window");
                this.hero_reset_window = new HeroResetWindow(this);
            }
            if (this.hero_reset_window)
                this.hero_reset_window.open(data);
        } else {
            if (this.hero_reset_window) {
                this.hero_reset_window.close()
                this.hero_reset_window = null;
            }
        }
    },

    openHeroResetReturnPanel: function (bool, item_list) {
        if (bool) {
            if (!this.hero_reset_return_panel) {
                var HeroResetReturnPanel = require("hero_rest_return_window");
                this.hero_reset_return_panel = new HeroResetReturnPanel(this);
            }
            var open_pragma = {};
            open_pragma.item_list = item_list;
            this.hero_reset_return_panel.open(open_pragma);
        } else {
            if (this.hero_reset_return_panel) {
                this.hero_reset_return_panel.close()
                this.hero_reset_return_panel = null;
            }
        }
    },

    openHeroResetOfferPanel: function (bool, item_list ,is_show_tips, callback ,reset_type ,dec) {
        if (bool) {
            if (!this.hero_reset_offer_panel) {
                var HeroResetOfferPanel = require("hero_reset_offer_window");
                this.hero_reset_offer_panel = new HeroResetOfferPanel(this);
            }
            var open_pragma = {};
            open_pragma.item_list = item_list;
            open_pragma.callback = callback;
            open_pragma.is_show_tips = is_show_tips;
            open_pragma.reset_type = reset_type;
            open_pragma.dec = dec;
            this.hero_reset_offer_panel.open(open_pragma);
        } else {
            if (this.hero_reset_offer_panel) {
                this.hero_reset_offer_panel.close()
                this.hero_reset_offer_panel = null;
            }
        }
    },

    // --打开装备穿戴界面
    openEquipPanel: function (status, pos, partner_id, data) {
        if (status) {
            if (!this.equip_panel) {
                var EquipClothWindow = require("equip_cloth_window");
                this.equip_panel = new EquipClothWindow(this);
            }
            var open_pragma = {};
            open_pragma.equip_type = pos;
            open_pragma.partner_id = partner_id;
            open_pragma.data = data;

            this.equip_panel.open(open_pragma);
        } else {
            if (this.equip_panel) {
                this.equip_panel.close();
                this.equip_panel = null;
            }
        }
    },

    // desc:打开装备tips
    // time:2018-05-24 05:50:42
    // @bool:打开与关闭
    // @data:装备数据
    // @open_type:装备状态，0.其他状态，1: 背包中 3:伙伴身上 具体查看 PartnerConst.EqmTips
    // @partner_id:穿戴在伙伴身上就有伙伴id，其他可不填或填0
    // @return 
    openEquipTips: function (status, data, open_type, partner) {
        if (status) {
            var TipsController = require("tips_controller");
            TipsController.getInstance().showEquipTips(data, open_type, partner);
        }
        // if (status) {
        //     // 引导的时候不弹
        //     // if GuideController:getInstance():isInGuide() return // 引导的时候不要显示tips了 因为可能会被挡住
        //     if (!this.equip_tips) {
        //         var EquipTips = require("equip_tips");
        //         this.equip_tips = new EquipTips();
        //     } 
        //     open_type = open_type || PartnerConst.EqmTips.normal;
        //     this.equip_tips.open();
        // } else {
        //     if (this.equip_tips) {
        //         this.equip_tips.close();
        //         this.equip_tips = null;
        //     }
        // }
    },

    // ----------------------------------------神器相关------------------------------
    // 打开符文重铸界面
    openArtifactRecastWindow: function (status, data, partner_id) {
        if (status == true) {
            if (!this.artifact_recast_win) {
                this.artifact_recast_win = Utils.createClass("artifact_recast_window")
            }
            this.artifact_recast_win.open({ data: data, partner_id: partner_id })
        } else {
            if (this.artifact_recast_win) {
                this.artifact_recast_win.close()
                this.artifact_recast_win = null
            }
        }
    },

    //打开神器列表选择界面
    // function HeroController:openArtifactListWindow(bool,artifact_type,partner_id,select_vo)
    //     if bool == true then
    //         if not this.artifact_list_panel then 
    //             this.artifact_list_panel = ArtifactListWindow.New()
    //         end
    //         artifact_type = artifact_type or 0
    //         partner_id = partner_id or 0
    //         if this.artifact_list_panel and this.artifact_list_panel:isOpen() == false then
    //             this.artifact_list_panel:open(artifact_type,partner_id,select_vo)
    //         end
    //     else 
    //         if this.artifact_list_panel then 
    //             this.artifact_list_panel:close()
    //             this.artifact_list_panel = null
    //         end
    //     end
    // end
    openArtifactListWindow: function (bool, artifact_type, partner_id, select_vo) {
        if (bool == true) {
            if (!this.artifact_list_window) {
                this.artifact_list_window = Utils.createClass("artifact_list_window")
            }
            artifact_type = artifact_type || 0;
            partner_id = partner_id || 0;
            var data = {};
            data.artifact_type = artifact_type;
            data.partner_id = partner_id;
            data.select_vo = select_vo;
            this.artifact_list_window.open(data)
        } else {
            if (this.artifact_list_window) {
                this.artifact_list_window.close()
                this.artifact_list_window = null
            }
        }
    },

    // ルーン選択界面
    openArtifactChoseWindow: function (bool, data) {
        if (bool == true) {
            if (!this.artifact_chose_window) {
                this.artifact_chose_window = Utils.createClass("artifact_chose_window")
            }
            this.artifact_chose_window.open(data)
        } else {
            if (this.artifact_chose_window) {
                this.artifact_chose_window.close()
                this.artifact_chose_window = null
            }
        }
    },

    // --==============================--
    // --desc:打开符文操作界面
    // --time:2018-05-17 05:34:13
    // --@bool:
    // --@data:符文数据，为goods_vo数据
    // --@open_type:打开类型，分为
    // --@return 
    // --==============================--
    openArtifactTipsWindow: function (bool, data, open_type, partner_id, pos) {
        if (bool == true) {
            if (data == null || data.config == null) {
                message(Utils.TI18N("数据异常"))
                return
            }
            if (!this.artifact_tips_window) {
                this.artifact_tips_window = Utils.createClass("artifact_tips_window")
            }
            if (open_type == null) {
                open_type = PartnerConst.ArtifactTips.backpack;
            }
            var param = { data: data, open_type: open_type, partner_id: partner_id, pos: pos }
            this.artifact_tips_window.open(param)
        } else {
            if (this.artifact_tips_window) {
                this.artifact_tips_window.close()
                this.artifact_tips_window = null
            }
        }
    },

    // 打开符文合成tips界面
    openArtifactComTipsWindow: function (status, bid) {
        if (status == true) {
            if (!this.artifact_com_win) {
                this.artifact_com_win = Utils.createClass("artifact_com_tips_window")
            }
            this.artifact_com_win.open(bid)
        } else {
            if (this.artifact_com_win) {
                this.artifact_com_win.close()
                this.artifact_com_win = null
            }
        }
    },

    // 打开符文祝福奖励领取界面
    openArtifactAwardWindow: function (status) {
        if (status == true) {
            if (!this.artifact_award_win) {
                this.artifact_award_win = Utils.createClass("artifact_award_window")
            }
            this.artifact_award_win.open()
        } else {
            if (this.artifact_award_win) {
                this.artifact_award_win.close()
                this.artifact_award_win = null
            }
        }
    },

    // 打开符文技能预览界面
    // -@show_type 显示类型 1 是符文技能预览 2 是英雄天赋技能
    openArtifactSkillWindow: function (status,show_type) {
        if (status == true) {
            if (!this.artifact_skill_win) {
                this.artifact_skill_win = Utils.createClass("artifact_skill_window",show_type)
            }
            this.artifact_skill_win.open()
        } else {
            if (this.artifact_skill_win) {
                this.artifact_skill_win.close()
                this.artifact_skill_win = null
            }
        }
    },
    // ----------------------------------------神器相关结束------------------------------



    // -- 打开英雄tips界面
    // --is_hide_equip 是否隐藏装备
    openHeroTipsPanel(bool, hero_vo, is_hide_equip , is_hide_comment) {
        if (bool == true) {
            if (!this.hero_tips_window) {
                let HeroTipsWindow = require("hero_tips_window")
                this.hero_tips_window = new HeroTipsWindow()
            }
            if(this.hero_tips_window.isOpen() == false){
                this.hero_tips_window.open({ hero_vo: hero_vo, is_hide_equip: is_hide_equip ,is_hide_comment:is_hide_comment})
            }
        } else {
            if (this.hero_tips_window) {
                this.hero_tips_window.close()
                this.hero_tips_window = null
            }
        }
    },
    // -- 打开英雄属性tips界面
    openHeroTipsAttrPanel(bool, hero_vo, is_my) {
        if (bool == true) {
            if (!this.hero_tips_attr_panel) {
                let HeroTipsAttrWindow = require("hero_tips_attr_window")
                this.hero_tips_attr_panel = new HeroTipsAttrWindow()
            }
            this.hero_tips_attr_panel.open({ hero_vo: hero_vo, is_my: is_my })
        } else {
            if (this.hero_tips_attr_panel) {
                this.hero_tips_attr_panel.close()
                this.hero_tips_attr_panel = null
            }
        }
    },

    // -- 打开英雄tips界面根据bid
    openHeroTipsPanelByBid(bid) {
        let hero_vo = this.model.getMockHeroVoByBid(bid)
        if (hero_vo) {
            this.openHeroTipsPanel(true, hero_vo, true)
        }
    },
    // 打开英雄图书馆信息根据bid 和星级
    openHeroInfoWindowByBidStar: function (bid, star, callback) {
        if (bid == null || star == null) return
        var key = Utils.getNorKey(bid, star);
        var hero_vo = this.model.getHeroPokedexByBid(key);
        if (hero_vo) {
            this.openHeroMainInfoWindow(true, hero_vo, [hero_vo], { show_model_type: HeroConst.BagTab.eBagPokedex, callback: callback })
        }
    },

    getHeroGoFightRoot: function (finish_cb) {
        if (finish_cb) {
            if (this.form_go_fight_panel) {
                this.form_go_fight_panel.getRootWnd(finish_cb);
            } else {
                finish_cb(null);
            }
        } else {
            if (this.form_go_fight_panel)
                return this.form_go_fight_panel.root_wnd;            
        }        
    },

    getHeroBagRoot: function (finish_cb) {
        if (finish_cb) {
            if (this.hero_bag_window) {
                this.hero_bag_window.getRootWnd(finish_cb);
            } else {
                finish_cb(null);
            }
        } else {
            if (this.hero_bag_window)
                return this.hero_bag_window.root_wnd;
        }
    },

    getHeroMainWindowRoot: function (finish_cb) {
      if (finish_cb) {
          if (this.hero_main_window) {
              this.hero_main_window.getRootWnd(finish_cb);
          } else {
              finish_cb(null);
          }
      } else {
          if (this.hero_main_window)
              return this.hero_main_window.root_wnd;
      }
  },

    getHeroMianInfoRoot: function (finish_cb) {
        if (finish_cb) {
            if (this.hero_main_info_window) {
                this.hero_main_info_window.getRootWnd(finish_cb);
            } else {
                finish_cb(null);
            }
        } else {
            if (this.hero_main_info_window)
                return this.hero_main_info_window.root_wnd;
        }
    },

    // --请求天赋技能信息
    sender11099(list){
        let protocal = {}
        protocal.partner_ids = list
        this.SendProtocal(11099, protocal)
    },
    handle11099(data){
        this.model.updateHeroVoTalent(data.partner_ids)
        gcore.GlobalEvent.fire(HeroEvent.Hero_Get_Talent_Event, data.partner_ids)
    },
    // --天赋技能升级
    sender11097(partner_id, pos){
        let protocal = {}
        protocal.partner_id = partner_id
        protocal.pos = pos
        this.SendProtocal(11097, protocal)
    },
    handle11097(data){
        if(data.result == true){
            this.model.updateHeroVoTalent([data], true)
            data = this.model.getHeroById(data.partner_id)
            gcore.GlobalEvent.fire(HeroEvent.Hero_Level_Up_Talent_Event, data)
            HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPTalent)
        }else{
            message(data.msg)
        }
    },
    // --天赋遗忘
    sender11098(partner_id, pos){
        let protocal = {}
        protocal.partner_id = partner_id
        protocal.pos = pos
        this.SendProtocal(11098, protocal)
    },
    handle11098(data){
        if(data.result == true){
            this.model.updateHeroVoTalent([data], true)
            data = this.model.getHeroById(data.partner_id)
            gcore.GlobalEvent.fire(HeroEvent.Hero_Forget_Talent_Event, data)
            HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPTalent)
        }else{
            message(data.msg)
        }
    },
    // -- 打开英雄学习技能界面
    openHeroTalentSkillLearnPanel(bool, hero_vo, pos){
        var self = this
        if(bool == true){
            if(!self.hero_talent_skill_panel){
                var HeroTalentSkillLearnPanel = require("hero_talent_skill_learn_window")
                self.hero_talent_skill_panel = new HeroTalentSkillLearnPanel()
            }
            self.hero_talent_skill_panel.open({hero_vo:hero_vo, pos:pos})
        }else{
            if(self.hero_talent_skill_panel){ 
                self.hero_talent_skill_panel.close()
                self.hero_talent_skill_panel = null
            }
        }
    },
    // -- 打开英雄学习技能升级界面
    openHeroTalentSkillLevelUpPanel(bool, hero_vo, skill_id, pos){
        if(bool == true){
            if(!this.hero_talent_levelup_panel){
                var HeroTalentSkillLevelUpPanel = require("hero_talent_skill_level_up_window")
                this.hero_talent_levelup_panel = new HeroTalentSkillLevelUpPanel()
            }
            this.hero_talent_levelup_panel.open({hero_vo:hero_vo, skill_id:skill_id, pos:pos})
        }else{
            if(this.hero_talent_levelup_panel){
                this.hero_talent_levelup_panel.close()
                this.hero_talent_levelup_panel = null
            }
        }
    },
    //开启新技能
    openSkillUnlockWindow(status, skill_bid){
        if(status == true){
            if (this.unlock_window == null){
                let SkillUnlockWindow = require("skill_unlock_window") 
                this.unlock_window = new SkillUnlockWindow(skill_bid)
            }
            if(this.unlock_window && this.unlock_window.isOpen() == false){
                this.unlock_window.open()
            }
        }else{
            if(this.unlock_window){ 
                this.unlock_window.close()
                this.unlock_window = null
            }
        }
    },


    //播放英雄音效
    onPlayHeroVoice: function (vocie_res, time) {
        //默认4秒
        time = time || 4;
        //补充1秒时差
        time += 1;
        
        if (this.voice_time_ticket == null) {
            SoundManager.getInstance().setBackgroundVolume(0.6);
        } else {
            gcore.Timer.del(this.voice_time_ticket);
            this.voice_time_ticket = null;
        }

        if (this.hero_music != null) {
            if(this.hero_music == "undef"){
                SoundManager.getInstance().removeEffectSound(null);
            }else{
                SoundManager.getInstance().removeEffectSound(this.hero_music);
            }
        }
        this.hero_music = SoundManager.getInstance().playHeroEffectOnce(AUDIO_TYPE.DUBBING, vocie_res);
        if(this.hero_music == undefined){
            this.hero_music = "undef";
        }
        this.voice_time_ticket = gcore.Timer.set(function () {
            SoundManager.getInstance().setBackgroundVolume(1);
            this.voice_time_ticket = null;
        }.bind(this), time * 1000, 1)
    },

    stopPlayHeroVoice() {
        if (this.hero_music != null) {
            if(this.hero_music == "undef"){
                SoundManager.getInstance().removeEffectSound(null);
            }else{
                SoundManager.getInstance().removeEffectSound(this.hero_music);
            }
        }
    },

    onPlayPlotHeroVoice(voice_res, isMute) {
        // console.error("语音",voice_res)
        SoundManager.getInstance().stopPlotHeroVoice();
        SoundManager.getInstance().playPlotHeroVoiceOnce(voice_res, isMute);    
    },

    onClickHeroToPlayVoice(voice_list) {
        if(voice_list.length == 0) {
            console.error("立绘语音没数据");
            return;
        }

        let num = Math.floor(Math.random() * voice_list[0].length);
        this.onPlayHeroVoice(voice_list[0][num]);
    },

    /** 
     * 皮肤提示
     * @param {*} status 打开与关闭
     * @param {*} data  皮肤信息
     * @param {*} open_type  装备状态，0.其他状态，1: 背包中 3:伙伴身上 具体查看 PartnerConst.EqmTips
     * @param {*} partner 穿戴在伙伴身上就有伙伴id，其他可不填或填0
     */
    openHeroSkinTipsPanel(status, data, open_type, partner){
        if(status == true){
            if(!this.hero_skin_tips_panel){
                var HeroSkinTipsPanel = require("hero_skin_tips_window")
                this.hero_skin_tips_panel = new HeroSkinTipsPanel(this)
            }
            this.hero_skin_tips_panel.open({data:data,open_type:open_type,partner:partner})
        }else{
            if(this.hero_skin_tips_panel){ 
                this.hero_skin_tips_panel.close()
                this.hero_skin_tips_panel = null
            }
        }
    },
    
    //---------------------------皮肤协议结束-----------------------------------------
    //皮肤使用
    sender11019: function (partner_id, skin_id) {
        let protocal = {};
        protocal.partner_id = partner_id;
        protocal.skin_id = skin_id;
        this.SendProtocal(11019, protocal);
    },

    handle11019: function (data) {
        message(data.msg);
        cc.log("11019",data)
        if (data.result == 1) {
            message(Utils.TI18N("更换成功"));
        }
    },

    //皮肤使用
    sender11020: function () {
        let protocal = {};
        this.SendProtocal(11020, protocal);
    },

    handle11020: function (data) {
        cc.log("11020",data)
        this.model.initHeroSkin(data);

    },

    // 请求成人剧情钻石奖励
    sender11124(plot_id) {
        var protocal = {}
        protocal.plot_id = plot_id;
        this.SendProtocal(11124, protocal);
    },

    handle11124(data) {
        // console.error("11124", data);
        if(data.code == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Hero_Get_Reward, data);
        } 
    },
    
    // 请求成人剧情钻石奖励状态
    sender11125(plot_list) {
        var protocal = {}
        let arr = [];
        for(let i = 0; i < plot_list.length; i++) {
            arr.push({ plot_id: plot_list[i] });
            protocal.plot_list = arr;
        }
        this.SendProtocal(11125, protocal);
    },

    handle11125(data) {
        // console.error("11125", data);
        if(data.code == 1) {
            gcore.GlobalEvent.fire(HeroEvent.Hero_Get_Reward_Status, data);
        } 
    },

    //---------------------------皮肤协议结束-----------------------------------------

    //打开皮肤界面
    openHeroSkinWindow: function (status, vo) {
        if (status == true) {
            if (!this.hero_skin_window) {
                this.hero_skin_window = Utils.createClass("hero_skin_window");
            }
            this.hero_skin_window.open(vo);
        } else {
            if (this.hero_skin_window) {
                this.hero_skin_window.close();
                this.hero_skin_window = null;
            }
        }
    },

    storeHeroPlotInfo(data)  {
        const loginInfo = LoginController.getInstance().model.getLoginInfo();
        cc.sys.localStorage.setItem(`plot_data_${loginInfo.account}`, JSON.stringify(data));
        gcore.GlobalEvent.fire(HeroEvent.Polt_Red_Status);
    },

    getHeroPlotInfo() {
        const loginInfo = LoginController.getInstance().model.getLoginInfo();
        const data = cc.sys.localStorage.getItem(`plot_data_${loginInfo.account}`);
        if(data) {
            return JSON.parse(data);
        }
		return [];
    },
    
    // 记录解锁成人剧情的英雄
    checkUnlockHeroPlot(hero_vo) {
        const plot_data = Config.adult_data.data_plot_unlock[hero_vo.bid];
        if(!plot_data) {
            console.error("该英雄不存在剧情配置",hero_vo.bid);
            return;
        }

        // 新英雄默认解锁第一剧情
        if(!this.model.isUnlockPlotByHeroBid(hero_vo.bid)) {
            this.model.plot_hero_list.push({bid: hero_vo.bid, unLockPlotIds: [plot_data.plot_id_list[0]], haveWatchPlotIds: []});
            this.storeHeroPlotInfo(this.model.plot_hero_list);
        } 

        // 100级解锁新成人剧情
        let hero = null;
        for(let i = 0; i < this.model.plot_hero_list.length; i++) {
            hero = this.model.plot_hero_list[i];
            if(hero.bid == hero_vo.bid) {
                break;
            }
        }
        if(hero) {
            if(hero_vo.lev >= 100 && plot_data.plot_id_list.length == 2 && hero.unLockPlotIds.length == 1) { 
                hero.unLockPlotIds.push(plot_data.plot_id_list[1]);
                this.storeHeroPlotInfo(this.model.plot_hero_list);
                if(this.hero_main_info_window) {
                    message(Utils.TI18N("角色剧情已解锁"));
                    this.hero_main_info_window.play_plotBtn_ani();
                }
            }
        }
    },

    // 看完成人剧记录下来
    checkIsOverPlot(hero_id, plot_id) {
        if(hero_id == "" || plot_id == "")  return;
        for(let i = 0; i < this.model.plot_hero_list.length; i++) {
            let ob = this.model.plot_hero_list[i];
            if(ob.bid == hero_id) {
                if(ob.haveWatchPlotIds.findIndex(element => { return element == plot_id}) == -1) {
                    ob.haveWatchPlotIds.push(plot_id);
                    this.storeHeroPlotInfo(this.model.plot_hero_list);
                    break;
                }
            }
       }
    },
    
    getRemoteRes(res_name) {
        if(!this.model.loadedRemoteRes || res_name == "") { 
            return null;
        }
        const remote_url = this.getRemoteResUrl(res_name);
        if(remote_url == "") {
            console.error("远程资源地址为空");
            return;
        }
        return this.model.loadedRemoteRes[remote_url].content;
    },
    
    getRemoteResUrl(res_name) {
        for(let i = 0, len = this.model.remoteUrls.length; i < len; i++) {
            const res_url = this.model.remoteUrls[i];
            // 解析url的文件名
            const index = res_url.lastIndexOf("/");
            const fileName = res_url.substring(index+1, res_url.length);
            const dotIndex = fileName.lastIndexOf(".");
            const result = fileName.substring(0, dotIndex);
            if(result == res_name) {
                return res_url;
            }
        }
        return "";
    },

    isInAdultStory() {
        if (!this.model) return false;
        return this.model.isAdultStoryState();
    },
});

module.exports = HeroController;