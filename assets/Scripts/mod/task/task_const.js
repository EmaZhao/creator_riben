// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var TaskConst = {
    type: {
        quest: 1,
        feat: 2,
        action: 3
    },

    action_status: {
        normal: 0,
        un_activity: 1,
        activity: 2,
        finish: 3
    },
    update_type: {
        quest: 1,
        feat: 2,
        activity: 3
    },

    task_type: {
        main: 1,                   // 主线任务
        branch: 2,                 // 支线任务
        daily: 3                   // 日常任务
    },

    task_status: {
        un_finish: 0,              // 进行中
        finish: 1, //可提交
        completed: 2, //已提交
        over: 3                    // 已过期
    }
};
module.exports = TaskConst;
