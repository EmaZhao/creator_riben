var AdventureEvent = {}

AdventureEvent.UPDATE_ROLE_ATTRIBUTE = "AdventureEvent.UPDATE_ROLE_ATTRIBUTE"

AdventureEvent.SCENE_WALKEND = "AdventureEvent.SCENE_WALKEND"

AdventureEvent.SCENE_CHANGE = "AdventureEvent.SCENE_CHANGE"

AdventureEvent.UPDATE_RED_INFO = "AdventureEvent.UPDATE_RED_INFO"

AdventureEvent.Update_Room_Base_Info = "AdventureEvent.Update_Room_Base_Info"
AdventureEvent.Update_Buff_Info = "AdventureEvent.Update_Buff_Info"
AdventureEvent.Update_Room_Info = "AdventureEvent.Update_Room_Info"
AdventureEvent.Update_BackPack_Info = "AdventureEvent.Update_BackPack_Info"
AdventureEvent.Update_Single_Room_Info = "AdventureEvent.Update_Single_Room_Info"
AdventureEvent.Update_Evt_Buff_Info = "AdventureEvent.Update_Evt_Buff_Info"
AdventureEvent.Update_Evt_Answer_Info = "AdventureEvent.Update_Evt_Answer_Info"
AdventureEvent.Update_Adventure_Formation_Info = "AdventureEvent.Update_Adventure_Formation_Info"
AdventureEvent.Update_Evt_Plunder_Info = "AdventureEvent.Update_Evt_Plunder_Info"
AdventureEvent.Update_Evt_Npc_Info = "AdventureEvent.Update_Evt_Npc_Info"
AdventureEvent.Update_Evt_Plunder_Partner_Info = "AdventureEvent.Update_Evt_Plunder_Partner_Info"
AdventureEvent.Update_Evt_Guess_Result = "AdventureEvent.Update_Evt_Guess_Result"
AdventureEvent.Update_Evt_Box_Result_Info = "AdventureEvent.Update_Evt_Box_Result_Info"

// 掠夺记录
AdventureEvent.Update_Plunder_Record_Info = "AdventureEvent.Update_Plunder_Record_Info"
AdventureEvent.Update_Record_Plunder_View_Info = "AdventureEvent.Update_Record_Plunder_View_Info"

AdventureEvent.Update_Red_Point_Info = "AdventureEvent.Update_Red_Point_Info"

AdventureEvent.Update_Evt_Shop_Info = "AdventureEvent.Update_Evt_Shop_Info"


// 操作房间成功之后处理
AdventureEvent.Update_event_over_Info = "AdventureEvent.Update_event_over_Info"
// 重置或者请求进入下一层之后
AdventureEvent.ResetFloorEvent = "AdventureEvent.ResetFloorEvent"
// 操作房间返回
AdventureEvent.HandleRoomOverEvent = "AdventureEvent.HandleRoomOverEvent"

// 布阵信息变化
AdventureEvent.UpdateAdventureForm = "AdventureEvent.UpdateAdventureForm"

// 技能信息
AdventureEvent.UpdateSkillInfo = "AdventureEvent.UpdateSkillInfo"

// 更新选中的伙伴
AdventureEvent.UpdateAdventureSelectHero = "AdventureEvent.UpdateAdventureSelectHero"

// 怪物气血
AdventureEvent.UpdateMonsterHP = "AdventureEvent.UpdateMonsterHP"

// 一击必杀
AdventureEvent.UpdateShotKillInfo = "AdventureEvent.UpdateShotKillInfo"

// 更新商店总览
AdventureEvent.UpdateShopTotalEvent = "AdventureEvent.UpdateShopTotalEvent"

// 购买商店返回
AdventureEvent.UpdateShopItemEvent = "AdventureEvent.UpdateShopItemEvent"

// 获得技能效果
AdventureEvent.GetSkillForEffectAction = "AdventureEvent.GetSkillForEffectAction"

//宝箱展示任务
AdventureEvent.UpdateBoxTeskEvent = "AdventureEvent.UpdateBoxTeskEvent"

AdventureEvent.BackPackType = {
    BackPackView: 1,
    NextFloor: 2
}

AdventureEvent.EventType = {
    null: 0, //无事件
    buff: 1, //祝福
    boss: 2,//boss
    finger_guessing: 3,//猜拳
    box: 4,//宝箱
    mon: 5, //怪物
    npc: 6,//npc
    answer: 7,//答题
    next: 9,//下一层
    effect: 10, //特效事件
    block: 11, // 烂地板
    freebox: 12,  // 免费宝箱
    npc_talk: 13,  // 新版npc对话
    shop: 14,  // 神秘商店
    mysterious: 15, //神秘事件
    init: 16,
    mon1: 17,
    mon2: 18,
    mon3: 19,
    skill: 20,
}

AdventureEvent.AdventureEvenHandleType = {
    requst: 0,//请求
    handle: 1, //确认操作
    refresh: 2, //刷新
    hook: 3, // 扫荡,只针对怪物       
}

AdventureEvent.AdventurePluderRecordType = {
    defence: 1, //防御
    act: 2, //进攻
}

AdventureEvent.AdventureResetType = {
    reset: 1, //重置本层
    next: 2 //下一层
}

AdventureEvent.AdventureViewType = {
    myself: 1, // 自己掠夺
    other: 2   // 帮助别人掠夺
}

module.exports = AdventureEvent;