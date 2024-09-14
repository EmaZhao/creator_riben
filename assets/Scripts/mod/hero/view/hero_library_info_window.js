// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 17:52:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var HeroConst = require("hero_const");
var SkillItem = require("skill_item");


var Hero_library_infoWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_library_info_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        //当前选择
        this.select_index = 0
        //最大索引
        this.max_index = 2
        //技能item
        this.skill_item_list = {}
        this.skill_container_size = cc.size(580, 130)


        this.ctrl = HeroController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        Utils.getNodeCompByPath("main_container/box_6/attr_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("详细属性");
        Utils.getNodeCompByPath("main_container/box_6/story_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("查看传记");
        Utils.getNodeCompByPath("main_container/box_6/plot_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("英雄剧情");
        Utils.getNodeCompByPath("main_container/box_6/pageview/view/content/page_2/voice_panel/voice_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("播放语音");
        this.main_container = this.seekChild("main_container");
        this.close_btn = this.seekChild("close_btn");

        this.background_nd = this.seekChild("background");
        this.background_nd.scale   = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("hero/hero_draw_bg"),function(res){
            this.background_nd.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))

        //名字背景
        this.hero_name_bg_nd = this.seekChild(this.main_container, "hero_name_bg");
        //英雄立绘
        this.hero_draw_icon_sp = this.seekChild(this.main_container, "hero_draw_icon", cc.Sprite);
        //英雄名字
        this.hero_name_lb = this.seekChild(this.hero_name_bg_nd, "hero_name", cc.Label);
        this.title_name_lb = this.seekChild(this.hero_name_bg_nd, "title_name", cc.Label);
        this.title_bg_nd = this.seekChild(this.hero_name_bg_nd, "title_bg");

        this.box_6_nd = this.seekChild(this.main_container, "box_6");

        //详细属性
        this.attr_btn = this.seekChild(this.box_6_nd, "attr_btn");
        //查看传记
        this.story_btn = this.seekChild(this.box_6_nd, "story_btn");
        //英雄剧情
        this.plot_btn = this.seekChild(this.box_6_nd, "plot_btn");

        //pageview
        this.left_btn_nd = this.seekChild(this.box_6_nd, "left_btn");
        this.left_btn = this.seekChild(this.box_6_nd, "left_btn", cc.Button);
        this.right_btn_nd = this.seekChild(this.box_6_nd, "right_btn");
        this.right_btn = this.seekChild(this.box_6_nd, "right_btn", cc.Button);
        this.light_1_sp = this.seekChild(this.box_6_nd, "light_1", cc.Sprite)
        this.light_2_sp = this.seekChild(this.box_6_nd, "light_2", cc.Sprite)

        this.page_view_nd = this.seekChild(this.box_6_nd, "pageview");
        this.page_view_pv = this.seekChild(this.box_6_nd, "pageview", cc.PageView);
        var view = this.seekChild(this.page_view_nd, "view");
        var content = this.seekChild(view, "content");
        var page_1 = this.seekChild(content, "page_1");
        var page_2 = this.seekChild(content, "page_2");

        this.skill_panel_nd = this.seekChild(page_1, "skill_panel");
        this.attr_name_lb = this.seekChild(this.skill_panel_nd, "attr_name", cc.Label);
        this.type_name_lb = this.seekChild(this.skill_panel_nd, "type_name", cc.Label);
        this.item_content = this.seekChild(this.skill_panel_nd, "content");


        this.voice_panel_nd = this.seekChild(page_2, "voice_panel");
        this.richlabel_rt = this.seekChild(this.voice_panel_nd, "richlabel", cc.RichText);
        this.voice_btn_nd = this.seekChild(this.voice_panel_nd, "voice_btn")

        this.adaptationScreen();
    },

    //设置适配屏幕
    adaptationScreen: function () {

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openHeroLibraryInfoWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.attr_btn, function () {
            this.onClickAttrBtn()
        }.bind(this), 1)
        Utils.onTouchEnd(this.story_btn, function () {
            this.onClickStoryBtn()
        }.bind(this), 1)
        Utils.onTouchEnd(this.plot_btn, function () {
            this.onClickPlotBtn()
        }.bind(this), 1)
        Utils.onTouchEnd(this.left_btn_nd, function () {
            this.onClickLeftBtn()
        }.bind(this), 1)
        Utils.onTouchEnd(this.right_btn_nd, function () {
            this.onClickRightBtn()
        }.bind(this), 1)
        Utils.onTouchEnd(this.voice_btn_nd, function () {
            this.onClickVoiceBtn()
        }.bind(this), 1)
        this.page_view_pv.node.on("page-turning", function () {
            var cur_page = this.page_view_pv.getCurrentPageIndex();
            this.setBtnVisable(cur_page);
        }, this)
        Utils.onTouchEnd(this.hero_draw_icon_sp.node, ()=> {
            this.ctrl.onClickHeroToPlayVoice(this.library_config.voice_res);
        }, 1);
    },

    //详细属性
    onClickAttrBtn: function () {
        if (this.partner_config == null) return
        var pokedex_config = gdata("partner_data", "data_partner_pokedex", [this.partner_config.bid]);
        if (pokedex_config && pokedex_config[0]) {
            var star = pokedex_config[0].star || 1;
            this.ctrl.openHeroInfoWindowByBidStar(this.partner_config.bid, star,function(){
                this.setVisible(true);
            }.bind(this));
        }
        this.setVisible(false);
    },

    //查看传记
    onClickStoryBtn: function () {
        if (this.partner_config == null || this.library_config == null) return
        if (this.library_config.story == null || this.library_config.story == "") {
            message(Utils.TI18N("该英雄暂无传记"));
            return
        }
        var name = cc.js.formatStr("%s %s", this.library_config.title, this.partner_config.name);
        var content = this.library_config.story;
        this.ctrl.openHeroLibraryStoryPanel(true, name, content);
    },

    //英雄剧情
    onClickPlotBtn: function () {
        this.ctrl.openHeroPlotPanel(true, this.partner_config.bid);
    },

    //播放语音
    onClickVoiceBtn: function () {
        if(!this.partner_config || !this.library_config) return

        if(this.partner_config.voice && this.partner_config.voice != ""){
            let voice = this.partner_config.voice;
            let time = this.partner_config.voice_time;
            this.ctrl.onPlayHeroVoice(voice, time)
        }
    },

    //左边
    onClickLeftBtn: function () {
        var index = this.page_view_pv.getCurrentPageIndex() - 1;
        this.page_view_pv.scrollToPage(index)
        this.setBtnVisable(index);
    },

    //右边
    onClickRightBtn: function () {
        var index = this.page_view_pv.getCurrentPageIndex() + 1;
        this.page_view_pv.scrollToPage(index)
        this.setBtnVisable(index);

    },

    setBtnVisable: function (index) {
        if (index < 1) {
            Utils.setGreyButton(this.left_btn, true);
            Utils.setGreyButton(this.right_btn, false);
            this.light_1_sp.node.x = -10;
            this.light_2_sp.node.x = 10;
        } else {
            Utils.setGreyButton(this.left_btn, false);
            Utils.setGreyButton(this.right_btn, true);
            this.light_1_sp.node.x = 10;
            this.light_2_sp.node.x = -10;
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (bid, library_config) {
        var partner_config = gdata("partner_data", "data_partner_base", [bid]);
        var library_config = gdata("partner_data", "data_partner_library", [bid]);
        if (![partner_config || !library_config]) return

        this.partner_config = partner_config;
        this.library_config = library_config;
        this.updateHeroInfo();

        this.attr_name_lb.string = cc.js.formatStr("%s：%s%s", Utils.TI18N("属性"), String(HeroConst.CampAttrName[this.partner_config.camp_type]), String(HeroConst.CareerName[this.partner_config.type]));
        this.type_name_lb.string = cc.js.formatStr("%s：%s", Utils.TI18N("定位"), this.partner_config.hero_pos);
        this.richlabel_rt.string = "  " + this.library_config.voice_str;

        this.setBtnVisable(0);
        this.initSkill()

        if(this.partner_config.voice && this.partner_config.voice != ""){
            this.voice_btn_nd.active = true;
        }

    },

    //更新英雄信息
    updateHeroInfo: function () {
        if (!this.partner_config || !this.library_config) return
        var draw_res_id = this.partner_config.draw_res;
        var bg_res = PathTool.getIconPath("herodraw/herodrawres", draw_res_id);
        if (this.hero_draw_icon_sp) {
            this.loadRes(bg_res, function (bg_sf) {
                this.hero_draw_icon_sp.spriteFrame = bg_sf;
            }.bind(this));

        }
        if (this.library_config.scale == 0) {
            this.hero_draw_icon_sp.node.scale = 1;
        } else {
            this.hero_draw_icon_sp.node.scale = this.library_config.scale / 100;
        }
        if (this.library_config.draw_offset && Utils.next(this.library_config.draw_offset) != null) {
            var pos = this.hero_draw_icon_sp.node.getPosition();
            var offset_x = this.library_config.draw_offset[0][0] || 0;
            var offset_y = this.library_config.draw_offset[0][1] || 0;
            this.hero_draw_icon_sp.node.setPosition(pos.x + offset_x, pos.y + offset_y);
        }

        this.hero_name_lb.string = this.partner_config.name;
        if (this.library_config.title && this.library_config.title != "") {
            this.title_name_lb.string = this.library_config.title;
        } else {
            this.title_bg_nd.active = false;
        }
    },


    initSkill: function () {
        if (!this.partner_config.bid) return
        var bid = this.partner_config.bid;
        var star = Config.partner_data.data_partner_max_star[bid] || this.partner_config.init_star;
        var key = Utils.getNorKey(bid, star);
        var star_config = gdata("partner_data", "data_partner_star", [key]);
        if (star_config == null) return
        var skill_list = [];
        for (var k in star_config.skills) {
            var v = star_config.skills[k];
            if (v[0] != 1) {
                skill_list.push(v);
            }
        }

        var skill_width = 108;
        var item_width = skill_width + 28;

        for (var i in this.skill_item_list) {
            if (this.skill_item_list[i]) {
                this.skill_item_list[i].setVisible(false);
            }
        }

        var index = 0;
        for (var i in skill_list) {
            var skill = skill_list[i];
            var config = gdata('skill_data', 'data_get_skill', [skill[1]]);
            if (config) {
                if (this.skill_item_list[i] == null) {
                    this.skill_item_list[i] = new SkillItem(true, true, true, 1, true);
                    this.skill_item_list[i].setParent(this.item_content);
                    this.skill_item_list[i].setShowTips(true)
                }
                this.skill_item_list[i].setData([skill[1]]);
                this.skill_item_list[i].setVisible(true);
                this.skill_item_list[i].setPosition(cc.v2(-item_width / 2 * (skill_list.length - 1) + item_width * index, 0))
                index = index + 1;
            } else {
                debug(cc.js.formatStr("技能表id: %s 没发现", String(skill.skill_bid)))
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openHeroLibraryInfoWindow(false)
        this.ctrl.stopPlayHeroVoice();
        if (this.skill_item_list) {
            for (var k in this.skill_item_list) {
                if (this.skill_item_list[k]) {
                    this.skill_item_list[k].deleteMe();
                    this.skill_item_list[k] = null;
                }
            }
            this.skill_item_list = null
        }
    },
})