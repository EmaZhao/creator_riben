// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-16 17:20:08
// --------------------------------------------------------------------
var MainuiController = require("mainui_controller")
var MainuiConst = require("mainui_const")
var VedioModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.today_like_num = 0   //-- 今日点赞数
        this.today_like_is_full = false //-- 今日是否点赞数达到最大
        this.all_vedio_data = {}  // 全部录像数据
        this.filt_lv_flag = true  // 是否筛选等级相近的玩家录像
    },
    setPublicVedioData( data ){
        if(!data) return;
        var self = this
        // -- 类型
        if(!self.all_vedio_data[data.type]){
            self.all_vedio_data[data.type] = {}
        }
        // -- 条件
        if(!self.all_vedio_data[data.type][data.cond_type]){
            self.all_vedio_data[data.type][data.cond_type] = {}
        }

        // -- 添加录像数据
        if(!self.all_vedio_data[data.type][data.cond_type].vedio_data){
            self.all_vedio_data[data.type][data.cond_type].vedio_data = []
        }
        for(let i=0;i<data.replay_list.length;++i){
            let v = data.replay_list[i];
            self.all_vedio_data[data.type][data.cond_type].vedio_data.push(v)
        }
        // -- 判断一下数据是否已经达到最大值，达到了则不再继续请求数据
        if(data.len > self.all_vedio_data[data.type][data.cond_type].vedio_data.length ){
            self.all_vedio_data[data.type][data.cond_type].is_full = false
        }else{
            self.all_vedio_data[data.type][data.cond_type].is_full = true
        }
    },
    // -- 获取录像大厅数据
    getPublicVedioData( vedioType, cond_type ){
        let vedio_data = {}
        if(vedioType){
            if(this.all_vedio_data[vedioType]){
                vedio_data = this.all_vedio_data[vedioType][cond_type] || {}
            }
        }
        return vedio_data
    },
    // -- 设置今日点赞数
    setTodayLikeNum( num ){
        this.today_like_num = num
        let red_status = false
        this.today_like_is_full = true
        let likes_limit_cfg = Config.video_data.data_const["likes_limit"]
        if(likes_limit_cfg && likes_limit_cfg.val > num){
            red_status = true
            this.today_like_is_full = false
        }
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.vedio, red_status)
    },
    getTodayLikeNum(  ){
        return this.today_like_num
    },

    // -- 是否请求过录像数据
    checkIsReqVedioDataByType( vedioType, cond_type ){
        if(this.all_vedio_data[vedioType] && this.all_vedio_data[vedioType][cond_type]){
            return true
        }
        return false
    },
    getFiltLevelFlag(  ){
        return this.filt_lv_flag
    },
    // -- 缓存一下竞技场分页是否勾选筛选等级相近的玩家
    setFiltLevelFlag( flag ){
        this.filt_lv_flag = flag
    },
    checkTodayLikeIsFull(  ){
        return this.today_like_is_full
    },
    // -- 更新数据(本地缓存主动更新)
    updateVedioData( vedioType, id, key, val ){
        let new_data
        for(let i in this.all_vedio_data){
            let all_data = this.all_vedio_data[i]
            for(let k in all_data){
                let v = all_data[k]
                for(let m=0;m<v.vedio_data.length;m++){
                    let vData = v.vedio_data[m]
                    if(vData.id == id){
                        vData[key] = val
                        new_data = vData
                    }
                }
            }
        }
        return new_data
    }
});