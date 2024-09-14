// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-24 11:43:27
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const");
var HeroCalculate = require("hero_calculate");
var HeroEvent = require("hero_event")

var ExhibitionItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.rleasePrefab = false;        
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_exhibition_item");
        var HeroBagController = require("hero_controller");
        this.ctrl = HeroBagController.getInstance();
        this.model = this.ctrl.getModel();
        this.isCache = true;//缓存
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.scale = 1
        this.data = null;
        this.id = null;
        this.is_allow_select = true;           // 是否允许选中和取消选中
        this.is_ui_select = false;
        this.percent = null;
        this.percent_lab = null;
        this.str_tips_obj = null;
        this.effect = true;                 // 是否响应按钮过滤
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        if (this.cur_pos) {
            this.setPosition(this.cur_pos.x,this.cur_pos.y);
            this.cur_pos = null;
        }

        if(this.scale){
            this.root_wnd.scale = this.scale;
        }

        this.star_item_nd       = this.seekChild("star_item");
        this.stars_container_nd = this.seekChild("stars_container");
        this.head_icon_nd       = this.seekChild("head_icon");
        this.head_icon_sp       = this.seekChild("head_icon", cc.Sprite);
        this.comp_type_nd       = this.seekChild("comp_type");
        this.comp_type_sp       = this.seekChild("comp_type", cc.Sprite);
        this.background_sp      = this.seekChild("background", cc.Sprite);
        this.level_lb           = this.seekChild("level", cc.Label);
        this.fight_nd           = this.seekChild("fight");
        this.select_item_nd     = this.seekChild("select_item");
        this.lock_item_nd       = this.seekChild("lock_item");
        this.lock_item_sp       = this.seekChild("lock_item", cc.Sprite);
        this.red_icon_nd        = this.seekChild("red_icon");
        this.chip_icon_nd       = this.seekChild("chip_icon")
        this.special_nd         = this.seekChild("special")
        this.special_sp         = this.seekChild("special",cc.Sprite)
       

        this.comp_type_sp.spriteFrame = null;
        this.level_lb.string = "";

        this.red_icon_nd.active = this.red_status || false;

        if (this.data) {
            this.setData(this.data);
        }else if(this.id!=null){
            this.setUnitData(this.id);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {
      gcore.GlobalEvent.bind(HeroEvent.Polt_Red_Status,()=>{
        if (this.from_type == HeroConst.ExhibitionItemType.eHeroBag && this.data) {           // 英雄界面判断红点
          if (HeroCalculate.getInstance().isCheckHeroRedPointByHeroVo(this.data)) {
            var is_redpoint = HeroCalculate.getInstance().checkSingleHeroRedPoint(this.data);
            this.showRedPoint(is_redpoint);
          }
          this.fight_nd.active = this.data.isFormDrama();
        }
      })
     
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if (this.root_wnd && !this.click_event) {
            this.root_wnd.on(cc.Node.EventType.TOUCH_END, this.onClickRootWnd, this);
            this.root_wnd.on(cc.Node.EventType.TOUCH_START, this.onClickRootWnd, this);
            this.root_wnd.on(cc.Node.EventType.TOUCH_CANCEL, this.onClickRootWnd, this);
            this.click_event = true;
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        this.unBindEvent();
        if(this.head_icon_sp){
            this.head_icon_sp.spriteFrame = null
        }

        if (this.root_wnd && this.click_event) {
            this.root_wnd.off(cc.Node.EventType.TOUCH_END, this.onClickRootWnd, this);
            this.root_wnd.off(cc.Node.EventType.TOUCH_START, this.onClickRootWnd, this);
            this.root_wnd.off(cc.Node.EventType.TOUCH_CANCEL, this.onClickRootWnd, this);
            this.click_event = false;
        }
        ItemsPool.getInstance().cacheItem(this);

    },

    addCallBack: function(click_cb) {
        this.click_cb = click_cb
    },

    addTouchCb: function(touch_cb) {
        this.touch_cb = touch_cb;
    },

    onClickRootWnd: function(event) {
        var is_callback = true;
        if (this.from_type == HeroConst.ExhibitionItemType.eFormFight) {
            if (!this.data) 
                is_callback = false;
        }

        if (event.type === cc.Node.EventType.TOUCH_START) {
            if(this.effect){
                this.root_wnd.scale = (this.scale || 1) * 0.9;
            }
            if (this.touch_cb && is_callback)
                this.touch_cb(this);
        }

        if (event.type === cc.Node.EventType.TOUCH_CANCEL) {
            if(this.effect){
                this.root_wnd.scale = this.scale || 1;   
            }
        }

        if (event.type === cc.Node.EventType.TOUCH_END) {
            if(this.effect){
                this.root_wnd.scale = this.scale || 1; 
            }
            if (this.click_cb && is_callback) {
                Utils.playButtonSound(3)
                this.click_cb(this);
            }
        }
    },
    setButtonEffect(status){
        this.effect = status
    },
    setExtendData: function(extend_data) {
        if (!extend_data) return;
        this.scale = extend_data.scale || 1;
        this.can_click = extend_data.can_click || false;
        this.from_type = extend_data.from_type || HeroConst.ExhibitionItemType.eNone;
        this.boold_type = extend_data.boold_type || null;
        this.click_delay = extend_data.click_delay || 0;
        this.hide_star = extend_data.hide_star || false;
    },

    // ==============================--
    // desc:根据单位id设置相关现实
    // @id:
    // @return 
    // ==============================--
    setUnitData:function(id){
        this.id = id;
        if(!this.root_wnd)return;
        id = id || 0;
        var config = Utils.getUnitConfig(id);
        if(config == null){
            this.head_icon_nd.active =false;
            this.stars_container_nd.active = false;
            this.level_lb.string = "";
            var background_res = PathTool.getItemQualityBG(0);
            var common_res_path = PathTool.getCommonIcomPath(background_res);
            this.loadRes(common_res_path, function(sf_obj){
                this.background_sp.spriteFrame = sf_obj;
            }.bind(this));

            if(this.comp_type_nd){
                this.comp_type_nd.active = false;
            }
        }else{
            this.head_icon_nd.active =true;
            this.stars_container_nd.active = true;
        
            var monster_id = config.monster3;
            if(monster_id){
                var monster_config = Utils.getUnitConfig(monster_id);
                if(monster_config){
                    // 设置头像
                    var head_res_path = PathTool.getHeadRes(monster_config.head_icon);
                    this.loadRes(head_res_path, function(head_sf) {
                        this.head_icon_sp.spriteFrame = head_sf;
                    }.bind(this));

                    // 设置品质框
                    var background_res = PathTool.getItemQualityBG(monster_config.star);
                    var common_res_path = PathTool.getCommonIcomPath(background_res);
                    this.loadRes(common_res_path, function(sf_obj){
                        this.background_sp.spriteFrame = sf_obj;
                    }.bind(this));

                    // 设置阵营
                    var camp_res = PathTool.getHeroCampRes(monster_config.camp_type);
                    var common_res_path = PathTool.getUIIconPath("common", camp_res);
                    this.loadRes(common_res_path, function(sf_obj){
                        this.comp_type_sp.spriteFrame = sf_obj;
                    }.bind(this))

                    // -- 设置星数
                    this.updateStars(monster_config.star); 
                    // 设置等级
                    this.level_lb.string = monster_config.lev.toString();
                }
            }
        }
    },
    //头像
    setHeadImg(head_icon){
        var head_res_path = PathTool.getHeadRes(head_icon);
        this.loadRes(head_res_path, function(head_sf) {
            this.head_icon_sp.spriteFrame = head_sf;
        }.bind(this));
    },
    //品质框
    setQualityImg(quality){
        var background_res = PathTool.getItemQualityBG(quality);
        var common_res_path = PathTool.getCommonIcomPath(background_res);
        this.loadRes(common_res_path, function(sf_obj){
            this.background_sp.spriteFrame = sf_obj;
        }.bind(this));
    },
    //阵营
    setCampImg(camp_type){
        var camp_res = PathTool.getHeroCampRes(camp_type);
        var common_res_path = PathTool.getUIIconPath("common", camp_res);
        this.loadRes(common_res_path, function(sf_obj){
            this.comp_type_sp.spriteFrame = sf_obj;
        }.bind(this))
    },
    //等级
    setLev(lev){
        this.level_lb.string = lev.toString();
    },
    init(){
        this.setRootScale(1)
        this.cur_pos = null;
        this.setPosition(0,0)
        this.setData(null)
        this.setExtendData({})
        this.record_res_id = null;
        this.showChipIcon(false)
        // this.setHeadUnEnabled(true)
        this.showRedPoint(false)
        if(this.bgImg){
            this.bgImg.node.active = false;
        }
        if(this.barNode){
            this.barNode.active = false;
        }
        if(this.lock_icon){
            this.lock_icon.node.active = false;
        }
        this.showLockIcon(false)
        this.setSelected(false)
        if(this.hireHero){
            this.hireHero.node.active = false;
        }
        this.showStrTips(false);
        this.showHelpImg(false)
        if(this.fight_nd){
            this.fight_nd.active = false;
        }

        this.str_tips_obj = null;
        this.cur_visible = false;
        this.id = null;
        this.is_allow_select = true;           // 是否允许选中和取消选中
        this.is_ui_select = false;
        this.percent = null;
        this.percent_lab = null;
        this.effect = true;      
        this.addCallBack(null);
        this.addTouchCb(null)
        if(this.special_nd){
            this.special_nd.active = false;
        }
        if(this.root_wnd_cb){
            this.root_wnd_cb = null;
        }
        if(this.head_icon_nd){
            this.head_icon_nd.active = true;
        }
        if(this.root_wnd){
            Utils.setChildUnEnabled(this.root_wnd,false)
        }
    },
    setData: function(data,hold_bg) {
        if (this.data &&this.item_update_event) {
            this.data.unbind(this.item_update_event);
            this.item_update_event = null;
        }

        this.data = data;
        if (this.root_wnd) {
            if (!data) {
                this.head_icon_nd.active = false;
                this.head_icon_sp.spriteFrame = null;
                this.stars_container_nd.active = false;
                this.level_lb.string = "";
                this.comp_type_sp.spriteFrame = null;
                var background_res = this.record_res_id = PathTool.getItemQualityBG(0);
                if(!hold_bg){
                var common_res_path = PathTool.getCommonIcomPath(background_res);
                this.loadRes(common_res_path, function(sf_obj){
                    this.background_sp.spriteFrame = sf_obj;
                }.bind(this))
                }
                if(this.special_nd.active){
                    this.special_nd.active = false;
                }
            } else {
                this.head_icon_nd.active = true;
                this.stars_container_nd.active = true;
            }
            this.setRootScale(this.scale)
            this.updateWidget(data);
        };
        if (this.data && this.data.UPDATE_PARTNER_ATTR)
            this.addVoBindEvent();
    },

    updateWidget: function(info) {
        if (!info) {
            this.setSelected(false);
            return;
        }
        var data = info;
        if (typeof info == "number") {
            data = Config.partner_data.data_partner_base[data];
            if (!data) return;
        } else {
            if (info.data)
                data = info.data;
        }
        if (!data || data.bid === undefined) return;

        let star = data.star || data.init_star
        // 根节点名称
        this.root_wnd.name = "hero" + "_" + data.bid

        // 头像
        this.record_head_id = null;
        var head_res_path = null;
        if (data.bid === 0) {
            if (this.default_path){
                head_res_path = this.default_path;
            }else if(data.icon){
                head_res_path = PathTool.getIconPath("item", data.icon);
            }
        } else {
            let use_skin = this.findUseSkin(info);
            if(use_skin != null && use_skin != 0){
                let skin_config = Config.partner_skin_data.data_skin_info[use_skin];
                if(skin_config){
                    head_res_path = PathTool.getHeadRes(skin_config.head_id);
                }
            }else{
                var star_key = data.bid + "_" + star;
                var star_cfg = gdata("partner_data", "data_partner_star", star_key);
                if (star_cfg) {
                    var shwo_head_id = star_cfg.head_id;
                    if (!this.record_head_id || this.record_head_id !== shwo_head_id) {
                        this.record_head_id = shwo_head_id;
                        head_res_path = PathTool.getHeadRes(this.record_head_id)
                        // if (data.item_id) {
                        //     var item_cfg = gdata("item_data", "data_unit5", data.item_id);
                        //     head_res_path = PathTool.getIconPath("item", item_cfg.icon);
                        // }
                    }
                }
            }           
        }

        if (head_res_path) {
            this.loadRes(head_res_path, function(head_sf) {
                if(this.root_wnd && this.root_wnd.isValid){
                    this.head_icon_sp.spriteFrame = head_sf;
                }
            }.bind(this));
        }

        // 背景
        var background_res =  PathTool.getItemQualityBG(star -1);
        if (!this.record_res_id || this.record_res_id != background_res) {
            this.record_res_id = background_res;
            var common_res_path = PathTool.getCommonIcomPath(background_res);
            this.loadRes(common_res_path, function(sf_obj){
                if(this.root_wnd && this.root_wnd.isValid){
                    this.background_sp.spriteFrame = sf_obj;
                }
            }.bind(this))
        }

        //　阵营
        var camp_type
        var par_config = Config.partner_data.data_partner_base[data.bid]; 
        if (par_config){
            camp_type = par_config.camp_type
        }
        if(data.bid == 0 && data.camp_type){
            camp_type = data.camp_type
        }
        if (camp_type === 0) {
            this.comp_type_nd.active = false;
        } else {
            if (camp_type && this.comp_type_nd) {
                this.comp_type_nd.active = true;
                var camp_res = PathTool.getHeroCampRes(camp_type);
                var common_res_path = PathTool.getUIIconPath("common", camp_res);
                this.loadRes(common_res_path, function(sf_obj){
                    if(this.root_wnd && this.root_wnd.isValid){
                        this.comp_type_sp.spriteFrame = sf_obj;
                    }
                }.bind(this))
            }
        }
        //碎片
        if(this.chip_status != null){
            this.showChipIcon(this.chip_status)
        }
        // 星星
        if (this.hide_star) {
            this.stars_container_nd.active = false;
        } else {
            this.stars_container_nd.active = true;
            this.updateStars(data.star);                        
        }

        // 等级
        if (data.lev) {
            this.level_lb.string = data.lev;
        } else {
            this.level_lb.string = "";
        }
        // 图鉴显示变灰逻辑
        this.setHeadUnEnabled(true);
        if(this.red_status != null){
            this.showRedPoint(this.red_status)
        }else{
            this.showRedPoint(false);
        }
        this.fight_nd.active = false;
        if(this.bgImg){
            this.bgImg.node.active = false;
        }
        if(this.barNode){
            this.barNode.active = false;
        }
        if(this.lock_icon){
            this.lock_icon.node.active = false;
        }
        if (this.from_type == HeroConst.ExhibitionItemType.eHeroBag) {           // 英雄界面判断红点
            this.setSelected(false);
            this.showRedPoint(false);
            if (HeroCalculate.getInstance().isCheckHeroRedPointByHeroVo(data)) {
                var is_redpoint = HeroCalculate.getInstance().checkSingleHeroRedPoint(data);
                this.showRedPoint(is_redpoint);
            }
            this.fight_nd.active = this.data.isFormDrama();

        }else if(this.from_type == HeroConst.ExhibitionItemType.eHeroChange){     // 英雄转换界面
            if(this.lock_icon){
                this.lock_icon.node.destroy()
                this.lock_icon = null
            }
            if(this.lock_label){
                this.lock_label.node.destroy()
                this.lock_label = null
            }
            // --设置锁住状态
            this.showLockIcon(data.is_locked || false, data.lock_str)
            // --设置选中状态 
            this.setSelected(data.is_ui_select == true)
        } else if (this.from_type == HeroConst.ExhibitionItemType.ePokedex) {    // 图鉴界面是否置灰
            this.showRedPoint(false);
            var par_max_star = this.model.getHadHeroStarBybid(data.bid);
            if (!par_max_star || par_max_star < data.star)
                this.setHeadUnEnabled(false);
        } else if (this.from_type == HeroConst.ExhibitionItemType.eFormFight) {  // 布阵
            this.setSelected(data.is_ui_select);
        } else if (this.from_type == HeroConst.ExhibitionItemType.eHeroSelect) { // 
            this.setSelected(data.is_ui_select);
            this.showLockIcon(data.is_ui_lock);            
        } else if (this.from_type == HeroConst.ExhibitionItemType.eUpStar) {     // 英雄生星
            this.setGrayHead(data.head_gray);
        } else if (this.from_type ==  HeroConst.ExhibitionItemType.eHeroReset) {  // 英雄分解
            if (!data.is_ui_lock) {
                this.setSelected(data.is_ui_select);
            }
            this.showLockIcon(data.is_ui_lock);
        }else if(this.from_type == HeroConst.ExhibitionItemType.eExpeditFight){ //远征
            // 血条
            var blood = 100;
            if(this.boold_type == true){
                var HeroExpeditController = require("heroexpedit_controller");
                var partner_id = data.partner_id;
                if(data.partner_id>100000){
                    partner_id = data.partner_id-100000; 
                }

                blood = HeroExpeditController.getInstance().getModel().getHeroBloodById(partner_id, data.rid, data.srv_id);
                var status = false;
                status = HeroExpeditController.getInstance().getModel().getHireHero(partner_id, data.rid, data.srv_id)
                if(status == true && data.is_used!=null){
                    // -- self:showHelpImg(true)
                    // --远征的支援标志......2019.1.28。20:37  晓勤特地叫改回来的
                    if(!this.hireHero){
                        this.hireHero = Utils.createImage(this.root_wnd, null,20, -63, cc.v2(0,0))
                        
                    }else{
                        this.hireHero.node.active = true;
                    }
                    this.loadRes(PathTool.getUIIconPath("heroexpedit","txt_heroexpedit_1"), (function(resObject){
                        this.hireHero.spriteFrame = resObject;
                    }).bind(this));
                }else{
                    if(this.hireHero){
                        this.hireHero.node.active = false;
                    }
                }
            }else{
                blood = data.blood || 0;
            }

            this.showProgressbar(blood)
            if(blood <= 0){
                this.showStrTips(true,Utils.TI18N("已阵亡"),{c3b: new cc.Color(255,255,255,255)})
            }else{
                this.showStrTips(false);
            }
            // 设置选中状态 
            this.setSelected(data.is_ui_select == true);
        }else if(this.from_type == HeroConst.ExhibitionItemType.eEndLessHero){
            // 设置选中状态 
            this.setSelected(data.is_ui_select == true);
            // 是雇佣兵
            if(data.is_endless){
                this.showHelpImg(true);
            }else{
                this.showHelpImg(false);
            }
            
            if(data.hp_per!=null){
                this.showProgressbar(data.hp_per);
                if(data.hp_per <= 0){
                    this.showStrTips(true,Utils.TI18N("已阵亡"),{c3b: new cc.Color(255,255,255,255)})
                }else{
                    this.showStrTips(false);
                }
            }
        } else if(this.from_type == HeroConst.ExhibitionItemType.eHeroFuse){
            var need_count = data.need_count || 0;
            var total_count = data.total_count  || 0;
            var label = cc.js.formatStr("%s/%s", total_count, need_count);

            if (data.cur_redpoint === 1) {
                this.showRedPoint(true);
            } else {
                this.showRedPoint(false);
            }

            this.showProgressbar(total_count / need_count * 100, label);  
            this.setSelected(data.is_ui_select == true)
        }else if (this.from_type == HeroConst.ExhibitionItemType.eVoyage){  //远航
            this.showStrTips(data.in_task,Utils.TI18N("任务中"));
        }
        else{
            this.setSelected(this.is_ui_select);
            if(this.percent!=null){
                this.showProgressbar(this.percent,this.percent_lab);
            }
            if(this.str_tips_obj){
                this.showStrTips(this.str_tips_obj.status, this.str_tips_obj.str, this.str_tips_obj.color);
            }
        }
    },

    unBindEvent: function() {
        if (this.data && this.item_update_event) {
            this.data.unbind(this.item_update_event);
            this.item_update_event = null;
        }
    },

    updateStars: function(star_num) {
        var star_res = "";
        var star_scal = 1;
        let star
        this.special_nd.active = false;
        this.stars_container_nd.width = 0;
        this.stars_container_nd.removeAllChildren();
        if (star_num > 0 && star_num <= 5) {
            star_res = "common_90074";
        } else if (star_num > 5 && star_num <= 9) {
            star_num = star_num - 5;
            star_res = "common_90075";
        } else if (star_num > 9) {
            star = star_num - 10
            star_num = 1;
            star_res = "common_90073";
            star_scal = 1.2;
            this.special_nd.active = true;
            let path
            if(star > 0){
                path = PathTool.getUIIconPath("common","common_90084")
            }else{
                path = PathTool.getUIIconPath("common","common_90076")
            }
            this.loadRes(path,function(res){
                this.special_sp.spriteFrame = res
            }.bind(this))
        }

        for (var star_i = 0; star_i < star_num; star_i++) {
            var star_nd = cc.instantiate(this.star_item_nd);
            star_nd.scale = star_scal;
            var star_sp = star_nd.getComponent(cc.Sprite);
            var common_res_path = PathTool.getCommonIcomPath(star_res);
            this.loadRes(common_res_path, function(star_sp, sf_obj){
                star_sp.spriteFrame = sf_obj;
            }.bind(this, star_sp));
            
            this.stars_container_nd.addChild(star_nd);
            if(star){
                let node = new cc.Node() 
                node.y = -1
                let lab = node.addComponent(cc.Label)
                lab.string = star 
                lab.fontSize = 15;
                lab.lineHeight = 16;
                lab.horizontalAlign = cc.macro.TextAlignment.CENTER;
                lab.verticalAlign = cc.macro.TextAlignment.CENTER;
                node.addComponent(cc.LabelOutline).color = new cc.color(0,0,0);
                star_nd.addChild(node)
            }
        }
    },

    setHeadUnEnabled: function(status) {
        var sp_status = cc.Sprite.State.NORMAL;
        if (!status) {
            sp_status = cc.Sprite.State.GRAY;
        }
        if(this.head_icon_sp){
            this.head_icon_sp.setState(sp_status);
        }
        if(this.comp_type_sp){
            this.comp_type_sp.setState(sp_status);
        }

    },

    setSelected: function(status) {
        if (!this.is_allow_select) return;
        this.is_ui_select = status
        if(this.root_wnd==null){
            return
        }
        if (status) {
            this.select_item_nd.active = true;
        } else {
            this.select_item_nd.active = false;
        }
    },

    setRootPosition: function(pos) {
        if (!pos) return;
        if (this.root_wnd) {
            this.setPosition(pos.x,pos.y)
        } else {
            this.cur_pos = pos;
        }
    },

    setRootScale: function(scale) {
        if (!scale) return;
        this.scale = scale;
        if (this.root_wnd) {
            this.root_wnd.scale = scale;
        }
    },

    getWorldPos: function() {
        if (this.root_wnd) {
            return this.root_wnd.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        return null;
    },

    updagePositon: function(new_pos) {
        if (!new_pos) return;
        if (this.root_wnd)
            this.root_wnd.setPosition(new_pos);
    },

    addVoBindEvent: function() {
        if (this.data && this.data.id) {
            if (this.item_update_event) return;
            this.item_update_event =  this.data.bind(this.data.UPDATE_PARTNER_ATTR, function(hero_vo) {
                if (this.root_wnd)
                    this.setData(hero_vo);
            }.bind(this))
        }
    },

    setDefaultHead: function(icon_path) {
        if (icon_path)
            this.default_path = icon_path;
    },

    setGrayHead: function(status) {
        var sp_state  = cc.Sprite.State.NORMAL;
        if (status) {
             sp_state = cc.Sprite.State.GRAY;
        }
        this.head_icon_sp.setState(sp_state);
    },
    // --设置锁
    showLockIcon(bool,str){
        var self = this
        if (bool == false && !self.lock_icon) return 
        if (!self.lock_icon){
            let res = PathTool.getUIIconPath("common","common_90009")
            let size = cc.size(this.root_wnd.width,this.root_wnd.height)
            self.lock_icon = Utils.createImage(self.root_wnd,res,0,0,cc.v2(0.5,0.5),true,0,false)
            this.loadRes(res, (function(resObject){
                self.lock_icon.spriteFrame = resObject;
            }).bind(this));
        }
        if (str){
            if (!self.lock_label){ 
                self.lock_label = Utils.createLabel(22,Config.color_data.data_color16[1],Config.color_data.data_color4[9],size.width/2,22,"",this.root_wnd,2, cc.v2(0.5,0))
            }
            self.lock_label.string = str 
        }

        self.lock_icon.node.active = bool

        // -- 锁住的时候某些部分要置灰
        self.setHeadUnEnabled(!bool)
        if (self.partner_type){
            // setChildUnEnabled(bool, self.partner_type)
        }
        if (self.lock_label){  
            self.lock_label.node.active = bool
        }
    },

    // 显示支援图片
    showHelpImg:function(bool){
        if(bool == false && !this.help_img)return;
        if(!this.help_img){
            var res = PathTool.getCommonIcomPath("txt_cn_common_90014")
            this.help_img = Utils.createImage(this.root_wnd,res,-this.root_wnd.width/2+20, -this.root_wnd.height/2+20,cc.v2(0.5,0.5),true,0,false)
            this.loadRes(res, (function(resObject){
                this.help_img.spriteFrame = resObject;
            }).bind(this));
        }
        this.help_img.node.active = bool;
    },

    // @percent 百分比
    // @label 进度条中间文字描述
    showProgressbar:function(percent, label){
        this.percent = percent;
        this.percent_lab = label;

        if(!this.root_wnd)return;

        var size = cc.size(118, 15)
        if(this.bgImg){
            this.bgImg.node.active = true;
        }
        if(this.barNode){
            this.barNode.active = true;
        }
        if(!this.comp_bar){
            var res = PathTool.getCommonIcomPath("common_90005")
            var res1 = PathTool.getCommonIcomPath("common_90006")
            
            this.bgImg = Utils.createImage(this.root_wnd,null,0,-this.root_wnd.height/2-size.height/2-2,cc.v2(0.5,0.5),true,0,true)
            this.bgImg.node.setContentSize(size.width+2,size.height+2);
            this.loadRes(res, (function(resObject){
                this.bgImg.spriteFrame = resObject;
            }.bind(this)))

            this.barNode = new cc.Node();
            this.barNode.setAnchorPoint(cc.v2(0.5,0.5));
            this.barNode.setContentSize(size);
            this.barNode.setPosition(0,-this.root_wnd.height/2-size.height/2-2);
            this.root_wnd.addChild(this.barNode);

            var barImg = this.barNode.addComponent(cc.Sprite);
            barImg.type = cc.Sprite.Type.SLICED;
            barImg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            
            this.loadRes(res1, (function(resObject){
                barImg.spriteFrame = resObject;
            }.bind(this)));

            var comp_bar = this.barNode.addComponent(cc.ProgressBar);
            comp_bar.barSprite = barImg;
            comp_bar.mode = cc.ProgressBar.Mode.HORIZONTAL;
            comp_bar.totalLength = size.width;
            this.comp_bar = comp_bar;
        }
        if(this.comp_bar_label){
            this.comp_bar_label.string = ""
        }
        if(label){
            if(!this.comp_bar_label){
                var text_color = new cc.Color(255,255,255,255)
                var line_color = new cc.Color(0,0,0,255)
                var size = cc.size(118, 19);
                this.comp_bar_label = Utils.createLabel(18,text_color, line_color,size.width/2, 0,"",this.comp_bar.node,2,cc.v2(0.5, 0.5));
            }
            this.comp_bar_label.string = label;
        }
        this.comp_bar.progress = percent/100;
    },

    //  显示文字提示
    showStrTips:function( status, str, color ){
        this.str_tips_obj = {status:status,str:str,color:color};
        if(!this.root_wnd)return;
        if(status){
            if(this.lay_tips == null){
                this.lay_tips = new cc.Node();
                this.lay_tips.setAnchorPoint(cc.v2(0.5,0.5))
                var size = this.root_wnd.getContentSize();
                this.lay_tips.setContentSize(size)
                this.lay_tips.setPosition(0,0) 
                var graphics_cp = this.lay_tips.addComponent(cc.Graphics);
                graphics_cp.clear();
                graphics_cp.fillColor = cc.color(0, 0, 0, 150);
                graphics_cp.rect(-size.width/2, -size.height/2, size.width, size.height);
                graphics_cp.fill();

                var c3b = new cc.Color(255,255,255,255);
                var enable = new cc.Color(132,0,0,255);
                if(color){
                    c3b = color.c3b || c3b;
                    enable = color.enable || enable;
                }
                
                var tips_text = Utils.createLabel(26,c3b,enable,0,0,str,this.lay_tips,1,cc.v2(0.5, 0.5));
                this.root_wnd.addChild(this.lay_tips)
            }
            this.lay_tips.active = true;
        }else{
            if(this.lay_tips){
                this.lay_tips.active = false;
            }
        }
    },

    findUseSkin:function(info){
        if(info.ext_data){
            let ext = info.ext_data || {};
            for(let i in ext){
                let v = ext[i];
                if(v.key == 5){
                    return v.val;
                }
            }
        }
        if(info.ext != null){
            let ext = info.ext || {};
            for(let i in ext){
                let v = ext[i];
                if(v.key == 5){
                    return v.val;
                }
            } 
        }
        if(info.use_skin){
            return info.use_skin
        }
        return 0
    },

    getData(){
        return this.data || {}
    },

    showRedPoint: function(status) {
        this.red_status = status;
        if (this.red_icon_nd)
            this.red_icon_nd.active = !!status;
    },

    showChipIcon(status){
        this.chip_status = status
        if(this.chip_icon_nd){
            this.chip_icon_nd.active = status;
        }
    }
    // showLockIcon: function(status) {
    //     this.lock_item_nd.active = status;
    //     this.lock_item_sp.setState(!status);
    //     if (status) {
    //         this.setHeadUnEnabled(false);
    //     } else {
    //         this.setHeadUnEnabled(true);
    //     }
    // },

})