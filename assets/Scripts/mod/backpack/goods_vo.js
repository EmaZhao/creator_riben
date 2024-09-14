// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      物品数据
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var GoodsVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.id = 0                     // 物品唯一id
        this.base_id = 0                // 基础id,配置白哦id
        this.bind = 0                   // 是否绑定
        this.quantity = 0               // 数量
        this.pos = 0                    // 存放在背包中的格子位置,
        this.expire_type = 0            // 过期类型
        this.expire_time = 0            // 过期时间
        this.main_attr = {}             // 主属性 attr_id 和 attr_val
        this.enchant = 0                // 精炼等级,现在废弃
        this.attr = {}                  // 精炼属性
        this.extra_attr = {}            // 附加属性
        this.score = 0                  // 物品评分
        this.all_score = 0              // 总评分
        this.extra = {}                 // 附加属性 extra_k 和 extra_k

        this.config = {}           // 配置数据
        this.use_type = 0               // 使用类型
        this.quality = 0                // 品质
        this.sub_type = 0               // 二级类型,匹配存放在背包中的标签页的
        this.lev = 0                    // 等级,如果是碎片类的,则是阵营
        this.sort = 0                   // 在背包中的排序规则
        this.type = 0                   // 物品的类型
        this.type_vo = "GoodsVo"        // 识别
    },

    setBaseId:function(value){
        this.config = Utils.getItemConfig(value);
        if (this.config) {
            this.type = this.config.type || 0
            this.use_type = this.config.use_type || 0
            this.quality = this.config.quality || 0
            this.sub_type = this.config.sub_type || 0
            this.lev = this.config.lev || 0
            this.sort = gdata("item_data", "data_item_sort", this.type);
        }
    },

    initAttrData:function(data_list){
        for(var key in data_list){
            this.setGoodsAttr(key, data_list[key])
        }
    },

    setGoodsAttr:function(key, value){
        if (value instanceof Array){
            this[key] = value;
            this.dispatchUpdateAttrByKey(key, value);
        }else{
            if(this[key] != value){
                this[key] = value;
                if(key == "base_id"){
                    this.setBaseId(value);
                }
                this.dispatchUpdateAttrByKey(key, value);
            }
        }
    },

    dispatchUpdateAttrByKey:function(key, value){

    },


    //==============================--
    //desc:外部设置总积分,因为在进阶橙装的时候有用到
    //time:2018-07-27 09:54:27
    //@score:
    //@return 
    //==============================--
    setEnchantScore(score) {
        var enchant_score = score || 0;
        var base_score = this.getEquipBaseScore()
        this.all_score = base_score + enchant_score;
    },

    // ==============================
    // desc:获取装备的基础积分(战力)
    // time:2018-07-27 09:47:23
    // @return 
    // ==============================
    getEquipBaseScore: function() {
        if (!this.config || !this.config.ext || !this.config.ext[0] || !this.config.ext[0][1]) 
            return 0 

        var base_attr = this.config.ext[0][1];
        var PartnerCalculate = require("partner_calculate");
        this.score = PartnerCalculate.calculatePower(base_attr); 
        return this.score        
    },

});

