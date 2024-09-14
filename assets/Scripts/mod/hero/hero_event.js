var HeroEvent = {};

// 更新英雄数据
HeroEvent.Hero_Data_Update = "HeroEvent.Hero_Data_Update"
// 新增英雄
HeroEvent.Hero_Data_Add = "HeroEvent.Hero_Data_Add"
// 删除英雄
HeroEvent.Del_Hero_Event = "HeroEvent.Del_Hero_Event"
// 英雄升级成功返回
HeroEvent.Hero_Level_Up_Success_Event = "HeroEvent.Hero_Level_Up_Success_Event"
// 是否可以播放升级音效
HeroEvent.Hero_Can_Play_Level_UP_Music_Event = "HeroEvent.Hero_Can_Play_Level_UP_Music_Event"

// 更新装备 
HeroEvent.Equip_Update_Event = "HeroEvent.Equip_Update_Event"
// 所有英雄红点事件
HeroEvent.All_Hero_RedPoint_Event = "HeroEvent.All_Hero_RedPoint_Event"
//英雄主界面红点更新
HeroEvent.Hero_Main_RedPoint_Event = "HeroEvent.Hero_Main_RedPoint_Event"

// 装备红点更新事件
HeroEvent.Equip_RedPoint_Event = "HeroEvent.Equip_RedPoint_Event"
// 升级红点
HeroEvent.Level_RedPoint_Event = "HeroEvent.Level_RedPoint_Event"
// 升星红点
HeroEvent.UpgradeStar_RedPoint_Event = "HeroEvent.UpgradeStar_RedPoint_Event"

// 阵法红点监听
HeroEvent.Form_RedPoint_Event = "HeroEvent.Form_RedPoint_Event"


// 英雄下一阶数据
HeroEvent.Next_Break_Info_Event = "HeroEvent.Next_Break_Info_Event"

// 购买英雄上限返回
HeroEvent.Buy_Hero_Max_Count_Event = "HeroEvent.Buy_Hero_Max_Count_Event"
// 英雄锁定返回
HeroEvent.Hero_Lock_Event = "HeroEvent.Hero_Lock_Event"

// 英雄遣散
HeroEvent.Hero_Disband_Event = "HeroEvent.Hero_Disband_Event"
// 英雄献祭查看材料
HeroEvent.Hero_Reset_Look_Event = "HeroEvent.Hero_Reset_Look_Event"

// 阵法相关
// 获取阵法列表
HeroEvent.Form_List_Event = "HeroEvent.Form_List_Event"
// 更换位置
HeroEvent.Form_Pos_Update = "HeroEvent.Form_Pos_Update"
// 更换阵法成功
HeroEvent.Use_Form_Success = "HeroEvent.Use_Form_Success"
// 阵法升级
HeroEvent.Form_Level_Event = "HeroEvent.Form_Level_Event"

// 功能阵法相关
HeroEvent.Update_Fun_Form = "HeroEvent.Update_Fun_Form"
HeroEvent.Update_Save_Form = "HeroEvent.Update_Save_Form"
// 剧情阵营更新
HeroEvent.Form_Drama_Event = "HeroEvent.Form_Drama_Event"
HeroEvent.Filter_Hero_Update = "HeroEvent.Filter_Hero_Update"


// 熔炼祭坛
// 选择英雄回调
HeroEvent.Upgrade_Star_Select_Event = "HeroEvent.Upgrade_Star_Select_Event"
// 升星成功返回
HeroEvent.Upgrade_Star_Success_Event = "HeroEvent.Upgrade_Star_Success_Event"


// 神器相关
HeroEvent.Artifact_Update_Event = "HeroEvent.Artifact_Update_Event"
HeroEvent.Artifact_UpStar_Event = "HeroEvent.Artifact_UpStar_Event"
HeroEvent.Artifact_Recast_Event = "HeroEvent.Artifact_Recast_Event"
HeroEvent.Artifact_Save_Event = "HeroEvent.Artifact_Save_Event"
HeroEvent.Artifact_Select_Event = "HeroEvent.Artifact_Select_Event"
HeroEvent.Artifact_Lucky_Event = "HeroEvent.Artifact_Lucky_Event"
HeroEvent.Artifact_Compound_Event = "HeroEvent.Artifact_Compound_Event"
HeroEvent.Artifact_Lucky_Red_Event = "HeroEvent.Artifact_Lucky_Red_Event"
HeroEvent.Artifact_Chose_Event = "HeroEvent.Artifact_Chose_Event"


// --天赋技能
HeroEvent.Hero_Get_Talent_Event = "HeroEvent.Hero_Get_Talent_Event"
HeroEvent.Hero_Learn_Talent_Event = "HeroEvent.Hero_Learn_Talent_Event"
HeroEvent.Hero_Level_Up_Talent_Event = "HeroEvent.Hero_Level_Up_Talent_Event"
HeroEvent.Hero_Forget_Talent_Event = "HeroEvent.Hero_Forget_Talent_Event"

// --英雄详细信息
HeroEvent.Hero_Vo_Detailed_info = "HeroEvent.Hero_Vo_Detailed_info"

//皮肤
HeroEvent.Hero_Skin_Info_Event = "Hero_Skin_Info_Event"

// 成人剧情领取奖励返回
HeroEvent.Hero_Get_Reward = "HeroEvent.Hero_Get_Reward"
// 成人剧情领取奖励状态
HeroEvent.Hero_Get_Reward_Status = "HeroEvent.Hero_Get_Reward_Status"
//成人剧情自动语音播放完
HeroEvent.Herp_Plot_Voice ="Herp_Plot_Voice"; 
HeroEvent.Polt_Red_Status ="Polt_Red_Status"

//英雄重生
HeroEvent.Hero_Reset_Rebirth = "Hero_Reset_Rebirth"
HeroEvent.Hero_Reset_Rebirth_Data = "Hero_Reset_Rebirth_Data"

module.exports = HeroEvent;