/*-----------------------------------------------------+
 * 图标数据内存缓存数据,数据事件,更新自身
 * @author zys
 +-----------------------------------------------------*/

var FunctionIconVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.config = arguments[0] || {};
        this.pos = this.config.type || 1;
        this.sort = this.config && this.config.index || 1;
        this.is_new = false;
        this.is_lock = arguments[1];
        this.tips_status = false;
        this.res_id = this.config.icon_res;
        this.unclick = false;
        this.status = 0;
        this.end_time = 0;
        this.action_id = 0;
        this.dynamicres_id = 0;
        this.real_name = "";        //动态调整的名字
        this.tips_status_list = {};
        this.real_res_id = "";      //动态调整的资源
    },

    setConfig: function (conf) {
        this.config = conf;
    },

    setLock: function (status) {
        this.is_lock = status;
    },

    //刚进入主场景的时候锁定点击状态,避免引导出问题
    setUnclick: function (status) {
        this.unclick = status;
    },

    update: function (params) {
        if (params == null || Utils.next(params) == null) return
        if (Utils.getArrLen(params) == 1) {
            let arg = params[0]
            if(typeof(arg)  == "object"){
                if (arg instanceof Object) {
                    this.id = arg.id;
                    this.status = arg.status;       // 活动状态 0结束，1开始， 2准备
                    this.int_args = arg.int_args;   //整型数组: 默认第一个参数为持续时间(单位秒),第二个是图标资源
                }

                if (this.int_args && Utils.next(this.int_args) != null) {
                    this.end_time = this.int_args[0].val || 0;
                }

                var ext_args = arg.ext_args;
                if (ext_args && Utils.next(ext_args)) {
                    for (var k in ext_args) {
                        var v = ext_args[k];
                        if (v.type == 1) {
                            this.dynamicres_id = v.val;
                            this.real_name = v.str;
                            if (v.val != 0) {
                                this.changeDynamicResId();
                            }
                            break
                        }
                    }
                }
            } else if (typeof (arg) == "number") {
                this.status = arg;
            }else if (typeof(arg) == "string"){
                var config = Config.function_data.data_convert_icon[arg];
                if(config){
                    this.real_name = config.icon_name;
                    this.real_res_id = config.icon_res;
                }
            }
        }else if (Utils.getArrLen(params) >= 2) {
            this.status = params[0] || 0;
            this.end_time = params[1] || 0;
        }
        this.fire(FunctionIconVo.UPDATE_SELF_EVENT);
    },

    //设置图标红点状态, 如果是table则必须包含 bid 这个作为唯一标志去储存的
    setTipsStatus: function (data) {
        if (data instanceof Object) {
            if (data.bid != null) {
                this.tips_status_list[data.bid] = data;
            } else {
                for (var k in data) {
                    var v = data[k];
                    if (data[k].bid != null) {
                        this.tips_status_list[v.bid] = v;
                    }
                }
            }
        } else {
            if (data != null) {
                this.tips_status = data;
            } else {
                this.tips_status = !this.tips_status;
            }
        }
        this.fire(FunctionIconVo.UPDATE_SELF_EVENT, "tips_status");
    },

    //获取图标红点状态
    getTipsStatus: function () {
        for (var k in this.tips_status_list) {
            var v = this.tips_status_list[k];
            if (v.num != null && typeof (v.num) == "number" && v.num > 0) {
                return true;
            }
        }
        return this.tips_status;
    },

    //获取当前红点的总数量
    getTipsNum: function () {
        var num = 0;
        if (this.tips_status_list && Utils.next(this.tips_status_list)) {
            for (var k in this.tips_status_list) {
                var v = this.tips_status_list[k];
                num = num + (v.num || 0);
            }
        }
        return num
    },

    changeDynamicResId: function () {
        if (this.dynamicres_id == 0) return
        var res_id = "icon" + this.dynamicres_id;
        this.changeIcon(res_id);
    },

    getBattleIconRes: function () {
        return this.dynamicres_id || 1;
    },

    changeIcon: function (id) {
        this.res_id = id;
        this.fire(FunctionIconVo.UPDATE_SELF_EVENT, "res_id")
    },

    changeTime: function (time) {
        this.end_time = time;
        this.fire(FunctionIconVo.UPDATE_SELF_EVENT, "end_time")
    },

    //获取配置表的id
    getID: function () {
        if (this.config != null) {
            return this.config.id;
        }
    },

    _delete: function () {

    },

});

FunctionIconVo.UPDATE_SELF_EVENT = "FunctionIconVo.UPDATE_SELF_EVENT";
FunctionIconVo.type = {
    right_top_1: 1,
    right_top_2: 2,
    right_bottom_1: 3,
    right_bottom_2: 4,
}


module.exports = FunctionIconVo;