var PartnerCalculate = {}

//是否是伙伴额外属性
PartnerCalculate.isEquipAttr = function (key) {
    if (key == "atk2" || key == "def2" || key == "hp2" || key == "speed2" || key == "hit_rate2" ||
        key == "crit_rate2" || key == "hit_magic2" || key == "dodge_magic2" || key == "crit_ratio2")
        return true

    return false
},

    //判断是否需要千分比显示,参数为数字
    PartnerCalculate.isShowPer = function (num) {
        var value = gdata("attr_data", "data_id_to_key", [num]);
        var config = gdata("attr_data", "data_type", [value]);
        if (config && config == 2) {
            return true
        }
        return false
    },

    //判断是否需要千分比显示，参数为字符串
    PartnerCalculate.isShowPerByStr = function (value) {
        var config = gdata("attr_data", "data_type", [value]);
        if (config && config == 2) {
            return true
        }
        return false
    },

    //计算战力的接口
    PartnerCalculate.calculatePower = function (attr_list) {
        var total_power = 0;
        if (attr_list == null || Utils.getArrLen(attr_list) == 0) {
            return total_power
        }
        var key = null;
        var value = null;
        for (var k in attr_list) {
            var v = attr_list[k];
            if (v instanceof Array && v.length >= 2) {
                key = v[0];
                value = v[1];
            } else {
                key = k;
                value = v;
            }
            var radio = Config.attr_data.data_power[key] //gdata("attr_data", "data_power", [key]);
            if (radio) {
                total_power = total_power + value * radio * 0.001;
            }
        }
        return Math.ceil(total_power)
    }

module.exports = PartnerCalculate;