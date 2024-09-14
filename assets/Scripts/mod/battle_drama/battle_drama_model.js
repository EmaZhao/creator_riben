// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-25 14:56:32
// --------------------------------------------------------------------
var DramaEvent = require("battle_drama_event");
var MainUIController = require("mainui_controller");
var MainuiConst = require("mainui_const");
var Battle_dramaModel = cc.Class({
    extends: BaseClass,

    properties: {
        drama_data: {
            default: {}
        },
        last_dun_id: null,

        quick_battle_data: {
            default: {}
        },

        // 已领取的通关奖励
        dic_drama_rewrad_ids: {
            default: {}
        },

        mode_list: {
            default: {}
        },

        cur_dun_list: {
            default: {}
        },

        // 当前章节
        init_dungeon_list: {
            default: {}
        },

        drama_res: {
            default: {}
        }
    },

    ctor: function () {
    },

    initConfig: function () {
        this.had_update_reward = false
        this.is_open_quick_battle_view = false; //主要用于记录是否已经打开是红点
    },

    preloadDramaScene: function(callback) {
        var battle_res_id = 10003;
        var drama_data = this.getDramaData();
        if (drama_data && drama_data.mode && drama_data.chapter_id){
            var drama_config = Config.dungeon_data.data_drama_world_info[drama_data.mode][drama_data.chapter_id];
            battle_res_id = drama_config.map_id;
        } 
        var drama_paths = PathTool.getBattleDrameBg(battle_res_id);

        LoaderManager.getInstance().loadRes(drama_paths.f, function(path, f_bg) {
            this.drama_res.f_res = {};
            this.drama_res.f_res.path = path;
            this.drama_res.f_res.res = f_bg;            
        }.bind(this, drama_paths.f));

        LoaderManager.getInstance().loadRes(drama_paths.s, function(path, s_bg) {
            this.drama_res.s_res = {};
            this.drama_res.s_res.path = path;
            this.drama_res.s_res.res = s_bg;
        }.bind(this, drama_paths.s));
    },

    getDramaScene: function(battle_res_id, isF, callback) {
        var drama_paths = PathTool.getBattleDrameBg(battle_res_id);
        if (isF) {
            if (this.drama_res.f_res && this.drama_res.f_res.path == drama_paths.f) {
                callback(this.drama_res.f_res.res)
            } else {
                LoaderManager.getInstance().loadRes(drama_paths.f, function(path, f_bg) {
                    if (this.drama_res.f_res)
                        LoaderManager.getInstance().releaseRes(this.drama_res.f_res.path);
                    this.drama_res.f_res = {};
                    this.drama_res.f_res.path = path;
                    this.drama_res.f_res.res = f_bg;
                    if (callback)
                        callback(f_bg);
                }.bind(this, drama_paths.f));                                
            }
        } else {
            if (this.drama_res.s_res && this.drama_res.s_res.path == drama_paths.s) {
                callback(this.drama_res.s_res.res)
            } else {
                LoaderManager.getInstance().loadRes(drama_paths.s, function(path, s_bg) {
                    if (this.drama_res.s_res)
                        LoaderManager.getInstance().releaseRes(this.drama_res.s_res.path);
                    this.drama_res.s_res = {};
                    this.drama_res.s_res.path = path;
                    this.drama_res.s_res.res = s_bg;
                    if (callback)
                        callback(s_bg);
                }.bind(this, drama_paths.s));                
            }
        }
    },

    setDramaData: function (data) {
        var need_event = false;
        if (!this.drama_data || this.drama_data.max_dun_id !== data.max_dun_id) {
            need_event = true;
        }
        if (!this.last_dun_id || this.last_dun_id < data.max_dun_id) {
            this.last_dun_id = data.max_dun_id || this.drama_data.max_dun_id;
        }
        this.drama_data.mode = data.mode;                           // 当前难度
        this.drama_data.chapter_id = data.chapter_id;               // 当前章节
        this.drama_data.dun_id = data.dun_id;                       // 当前关卡
        this.drama_data.status = data.status;                       // 当前关卡状态(1:制作中 2:可挑战 3:已通关)
        this.drama_data.cool_time = data.cool_time;                 // 当前关卡冷却时间(unixtime)
        this.drama_data.max_dun_id = data.max_dun_id;               // 最大通关关卡
        this.drama_data.auto_num = data.auto_num;                   // 今天扫荡已用次数
        this.drama_data.auto_num_max = data.auto_num_max;           // 今天扫荡次数上限
        this.drama_data.is_first = data.is_first;                   // 是否首次挑战当前关卡
        this.drama_data.last_dun_id = this.last_dun_id;             // 本地缓存上一个通关章节id

        if(data.mode_list){
            this.mode_list = data.mode_list;
        }

        if (need_event) {
            gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Update_Max_Id, this.drama_data.max_dun_id);
        }

        gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Top_Update_Data, data);
        this.initDungeonList(this.drama_data.mode, this.drama_data.chapter_id);//战斗副本界面没对应刷新函数，暂时在这里初始化
    },

    // 更新关卡信息
    updateDramaData: function (data) {
        if (!this.drama_data) return;
        var need_event = false;
        if (this.drama_data.max_dun_id != data.max_dun_id) {
            need_event = true;
        }
        var need_cool = false
        if (this.drama_data.cool_time != data.cool_time && this.drama_data.status != data.status) {
            need_cool = true;
        }
        var need_dun_id = false
        if(this.drama_data.dun_id != data.dun_id){
            need_dun_id = true;
        }

        if (this.drama_data.max_dun_id == null || this.drama_data.max_dun_id < data.max_dun_id) {
            this.last_dun_id = this.drama_data.max_dun_id || data.max_dun_id;
        }
        if (this.drama_data.dun_id != data.dun_id) {
            gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Update_Dun_Id, data.dun_id);
        }
        this.drama_data.mode = data.mode;                           // 当前难度
        this.drama_data.chapter_id = data.chapter_id;               // 当前章节
        this.drama_data.dun_id = data.dun_id;                       // 当前关卡
        this.drama_data.status = data.status;                       // 当前关卡状态(1:制作中 2:可挑战 3:已通关)
        this.drama_data.cool_time = data.cool_time;                 // 当前关卡冷却时间(unixtime)
        this.drama_data.max_dun_id = data.max_dun_id;               // 最大通关关卡
        this.drama_data.is_first = data.is_first;                   // 是否首次挑战当前关卡
        this.drama_data.last_dun_id = this.last_dun_id;             // 本地缓存上一个通关章节id

        this.updateModeListInfo(data);
        if (this.cur_dun_list && Utils.next(this.cur_dun_list || {}) != null && this.cur_dun_list[data.dun_id]) {
            this.cur_dun_list[data.dun_id].status = data.status;
            if (this.cur_dun_list[data.dun_id].status == 3) {
                this.cur_dun_list[data.dun_id].is_has = true;
            }
            gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Top_Update_Data, data);
        }

        if (need_event) {        // 以更新剧情id为最优先
            gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Update_Max_Id, this.drama_data.max_dun_id);
        } else if (need_cool) {    // 这个是更新时间的
            gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Update_Cool_Time);
        }
        if (need_dun_id) {
            gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Update_Dun_Id);
        }
    },

    // 累积挂机时间处理
    updateHookAccumulateTime: function (data) {
        this.hook_accumulate_data = data;
        gcore.GlobalEvent.fire(DramaEvent.UpdateHookAccumulateTime, data);
    },

    // 挂机时间处理
    getHookAccumulateInfo: function () {
        return this.hook_accumulate_data;
    },

    getDramaData: function () {
        return this.drama_data
    },

    // 更新快速作战的数据
    setQuickData: function (data) {
        this.quick_battle_data = data;
        this.checkRedPoint();
        gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Quick_Battle_Data, data);
    },

    // 获取快速作战信息
    getQuickData: function () {
        return this.quick_battle_data;
    },

    // 更新已通关奖励
    setDramaReward: function (data) {
        this.checkRedPoint();
        gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Drama_Reward_Data,data)
        if (this.had_update_reward == true) return;             // 为了兼容原生那边,只做一次处理,具体更新再下面
        this.had_update_reward = true;

        if (!data || !data.list || data.list.length == 0) return;
        this.dic_drama_rewrad_ids = {};
        for (let index = 0; index < data.list.length; index++) {
            const element = data.list[index];
            this.dic_drama_rewrad_ids[element.id] = true;
        }
        // 这里需要判断一下红点,基于当前通关的max_dun_id 和已领取的来匹配
    },

    //获取通关奖励的红点信息
    getDramaRewardRedPointInfo:function(){
        var drama_data = this.getDramaData();
        if(this.dic_drama_rewrad_ids && drama_data && drama_data.max_dun_id){
            var config = Config.dungeon_data.data_drama_reward;
            if(config){
                for(var i in config){
                    var v = config[i];
                    //当前最大关卡 比需求关卡 大 说明可领
                    if(drama_data.max_dun_id >= v.limit_id){
                        if(!this.dic_drama_rewrad_ids[v.id]){
                            return true
                        }
                    }
                }
            }
        }
        return false
    },

    // 更新奖励
    updateDramaReward: function (id) {
        this.dic_drama_rewrad_ids[id] = true;
        gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Drama_Reward_Data, id);
    },

    // 获取剧情通关奖励列表
    getDramaRewardPassList: function () {
        return this.dic_drama_rewrad_ids;
    },

    //获取已开启的总章节数
    getOpenSumChapter: function (mode) {
        if (this.mode_list) {
            var chapter_list = this.mode_list[mode - 1].chapter_list;
            var chapter_sum = 0;
            if (chapter_list) {
                for (var i in chapter_list) {
                    chapter_sum = chapter_sum + 1;
                }
            }
            return chapter_sum
        }
    },

    checkRedPoint:function(){
        var status = this.getDramaRewardRedPointInfo();
        MainUIController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.drama_scene, status);
    },

    //获取boss关卡预览相关信息
    getBossShowData: function () {
        var chapter_list = [];
        var sum_chapter = this.getOpenSumChapter(this.drama_data.mode);
        if (Config.dungeon_data.data_drama_world_info) {
            var world_list = Config.dungeon_data.data_drama_world_info[this.drama_data.mode];
            var boss_reward_list = Config.dungeon_data.data_drama_boss_show_reward;
            
            for (var i in world_list) {
                var boss_reward = boss_reward_list[i];
                if (boss_reward && world_list[i].chapter_id <= sum_chapter + 1) {
                    chapter_list.push(world_list[i]);
                }
            }
        }
        return chapter_list;
    },


    getCurDunInfoByID: function (dun_id) {
        if (this.cur_dun_list) {
            var config = this.cur_dun_list[dun_id]
            return config;
        }
    },

    getInitDungeonList: function () {
        if (this.init_dungeon_list && Utils.next(this.init_dungeon_list || []) != null) {
            return this.init_dungeon_list;
        }
    },

    // 用于初始化当前显示关卡的信息展示
    initDungeonList: function (mode, chapter_id) {
        if (Config.dungeon_data.data_drama_info) {
            var chapter_list = Config.dungeon_data.data_drama_info[mode][chapter_id];
            if (chapter_list) {
                var list = [];
                for (var i in chapter_list) {
                    list.push(chapter_list[i]);
                }
                list.sort(function (a, b) {
                    return a.id - b.id;
                })

                for (var i in list) {
                    var info_data = gdata("dungeon_data", "data_drama_dungeon_info", list[i].id);
                    this.init_dungeon_list[i] = { info_data: info_data }
                    this.cur_dun_list[list[i].id] = { dun_id: list[i].id, status: 0, cool_time: 0, auto_num: 0, is_has: false }
                }
            }
            this.updateHadModeListInfo(mode, chapter_id);
        }
    },

    // 获取初始化当前章节和难道所有副本信息
    updateHadModeListInfo: function (mode, chapter_id) {
        if (this.mode_list && Utils.next(this.mode_list || {}) != null) {
            var chapter_list = this.getChapterListByID(mode, chapter_id);
            if (chapter_list) {
                var dun_list = chapter_list.dun_list;
                if (dun_list) {
                    for (var i in dun_list) {
                        var temp_data = this.cur_dun_list[dun_list[i].dun_id];
                        if (temp_data) {
                            temp_data.dun_id = dun_list[i].dun_id;
                            temp_data.status = dun_list[i].status;
                            temp_data.cool_time = dun_list[i].cool_time;
                            temp_data.auto_num = dun_list[i].auto_num;
                            temp_data.is_has = true;
                        }
                    }
                }
            }
        }
    },

    updateModeListInfo:function(data){
        if(this.mode_list && Utils.next(this.mode_list || {}) != null){
            var chapter_list = this.getChapterListByID(data.mode,data.chapter_id);
            if(chapter_list){
                var dun_list = chapter_list.dun_list;
                if(dun_list){
                    var temp_has = true;
                    if(data.status == 1){
                        temp_has = false;
                    }
                    var is_has = false;
                    for(var i in dun_list){
                        if(data.dun_id == dun_list[i].dun_id){
                            is_has = true;
                            dun_list[i].dun_id = data.dun_id;
                            dun_list[i].cool_time = data.cool_time;
                            dun_list[i].status = data.status;
                            dun_list[i].is_has = temp_has;
                        }
                    }
                    if(!is_has){
                        dun_list.push({dun_id: data.dun_id, status: data.status , cool_time: data.cool_time, auto_num: 0,is_has: temp_has})
                    }
                }
            }
        }
    },

    getChapterListByID: function (mode, chapter_id) {
        if (this.mode_list && Utils.next(this.mode_list || {}) != null) {
            var chapter_list = this.mode_list[mode - 1].chapter_list;
            var list = null;
            if (chapter_list) {
                for (var i in chapter_list) {
                    if (chapter_list[i].chapter_id == chapter_id) {
                        list = chapter_list[i];
                        break;
                    }
                }
                return list;
            }
        }
    },

    //根据难度和章节id去获取已通过的Boss关卡数
    getHasCurChapterPassListBossNum: function (mode, chapter_id) {
        if (this.mode_list && Utils.next(this.mode_list || {}) != null) {
            var chapter_list = this.getChapterListByID(mode, chapter_id);
            var sum = 1;
            if (chapter_list) {
                var dun_list = chapter_list.dun_list;
                if (dun_list) {
                    for (var i in dun_list) {
                        var config = gdata("dungeon_data", "data_drama_dungeon_info", [dun_list[i].dun_id]);
                        if (dun_list[i].status == 3 && config && config.is_big == 1) {
                            sum = sum + 1;
                        }
                    }
                }
            }
            return sum
        }
    },

    //根据当前副本id来获取展示
    getShowDescRewad: function (dun_id) {
        var list = [];
        var index = 1;
        var config = Config.dungeon_data.data_drama_show_reward;
        if (config) {
            for (var k in config) {
                var v = config[k];
                if (dun_id < v.id && index <= 3) {
                    index = index + 1;
                    list.push(v);
                }
            }
            list.sort(Utils.tableLowerSorter(["id"]))
        }
        return list
    },

    // 获取当前切换章节通过最大的关卡ID
    getHasPassChapterMaxDunId:function(mode,chapter_id){
        if(this.mode_list && Utils.next(this.mode_list || {})){
            var chapter_list = this.getChapterListByID(mode,chapter_id);
            var max_dun_id = 0;
            if(chapter_list){
                var dun_list = chapter_list.dun_list;
                for(var i in dun_list){
                    if(dun_list[i].dun_id > max_dun_id){
                        max_dun_id = dun_list[i].dun_id;
                    }
                }
            }
            return max_dun_id;
        }
    },


    // 获取当前通关的章节数
    getCurMaxChapterId:function(mode){
        if(this.mode_list && Utils.next(this.mode_list || {})!=null){
            var chapter_list = this.mode_list[mode-1].chapter_list;
            var chapter_id = 1;
            if(chapter_list){
                for(var i in chapter_list){
                    if(chapter_list[i].status == 1){
                        if(chapter_id <= chapter_list[i].chapter_id){
                            chapter_id = chapter_list[i].chapter_id
                        }
                    }
                }
            }
            return chapter_id;
        }
    },


   // 获取某个章节的副本总长度
    getChapterLength:function(model, chapter_id){
        if(this.chapter_list == null){
            this.chapter_list = {};
        }
        if(this.chapter_list[Utils.getNorKey(model, chapter_id)] == null){
            var sum = 0;
            if(Config.dungeon_data.data_drama_info[model]!=null){
                var list = Config.dungeon_data.data_drama_info[model][chapter_id]
                if(list!=null){
                    sum = Object.keys(list).length;
                }
            }
            this.chapter_list[Utils.getNorKey(model, chapter_id)] = sum;
        }
        return this.chapter_list[Utils.getNorKey(model, chapter_id)];
    },



    // 根据难度和章节id去获取已通过的关卡数
    getHasCurChapterPassListNum:function(mode,chapter_id){
        if(this.mode_list && Utils.next(this.mode_list || {}) != null){
            var chapter_list = this.getChapterListByID(mode,chapter_id);
            var sum = 0;
            if(chapter_list){
                var dun_list = chapter_list.dun_list;
                for(var i in dun_list){
                    if(dun_list[i].status == 3){
                        sum = sum + 1;
                    }
                }
            }
            return sum
        }
    },
    // --判断当前关卡是否已通关和有弹出提示
    getPreStatus:function(dun_id){
        if(Config.dungeon_data.data_drama_pre_fun){
            let is_show = false
            let data
            let sys_data = JSON.parse(cc.sys.localStorage.getItem("drama_data")) //SysEnv:getInstance():loadDramaTipsFile()
            cc.log(Config.dungeon_data.data_drama_pre_fun,sys_data)
            for(let i in Config.dungeon_data.data_drama_pre_fun){
                let v = Config.dungeon_data.data_drama_pre_fun[i]
                if(v.limit_id == dun_id && !sys_data[dun_id]){
                    is_show = true
                    data = v
                    break
                }   
            }
            return is_show,data
        }
    },

    /**
     * 设置快速作战buff显示
     * @param {*} data 
     */
    setBuffData:function(data){
        this.buff_data = data;
        gcore.GlobalEvent.fire(DramaEvent.BattleDrama_Drama_Buff_View);
    },

    getBuffData:function(){
        return this.buff_data;
    },

    setOpenQuickBattleStatus:function(status){
        this.is_open_quick_battle_view = status;
    },

    getOpenQuickBattleStatus :function(){
        return this.is_open_quick_battle_view;
    },

    //设置第一次快速作战花费
    setFirstFresh:function(status){
        this.is_first_fresh = status;
    },

    getFirstFresh: function () {
        return this.is_first_fresh || false
    },
});