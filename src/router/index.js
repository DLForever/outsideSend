import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/dashboard',
                    component: resolve => require(['../components/views/Dashboard.vue'], resolve),
                    meta: { title: '系统首页' }
                },
                {
                    path: '/addusers',
                    component: resolve => require(['../components/views/group/AddUsers.vue'], resolve),
                    meta: { title: '创建用户' }
                },
                {
                    path: '/usersmanage',
                    component: resolve => require(['../components/views/group/UsersManage.vue'], resolve),
                    meta: { title: '用户管理' }
                },
                {
                    path: '/addroles',
                    component: resolve => require(['../components/views/group/AddRoles.vue'], resolve),
                    meta: { title: '创建角色' }
                },
                {
                    path: '/rolesmanage',
                    component: resolve => require(['../components/views/group/RolesManage.vue'], resolve),
                    meta: { title: '角色管理' }
                },
                {
                    path: '/addreviewers',
                    component: resolve => require(['../components/views/reviewer_merge/AddReviewers.vue'], resolve),
                    meta: { title: '新建测评任务' }
                },
                {
                    path: '/reviewersmanage',
                    component: resolve => require(['../components/views/reviewer_merge/ReviewersManage.vue'], resolve),
                    meta: { title: '测评任务管理' }
                },
                {
                    path: '/reviewersinfomanage',
                    component: resolve => require(['../components/views/reviewer_merge/ReviewersInfoManage.vue'], resolve),
                    name: 'Reviewersinfomanage',
                    meta: { title: '测评记录管理' }
                },
                {
                    path: '/reviewerschangemanage',
                    component: resolve => require(['../components/views/reviewer_merge/ReviewersChangeManage.vue'], resolve),
                    name: 'Reviewerschangemanage',
                    meta: { title: '任务变更管理' }
                },
                {
                    path: '/addreviewerscompany',
                    component: resolve => require(['../components/views/reviewer_merge/AddReviewersCompany.vue'], resolve),
                    meta: { title: '新建测评任务' }
                },
                {
                    path: '/reviewersmanagecompany',
                    component: resolve => require(['../components/views/reviewer_merge/ReviewersManageCompany.vue'], resolve),
                    meta: { title: '测评任务管理' }
                },
                {
                    path: '/reviewersinfomanagecompany',
                    component: resolve => require(['../components/views/reviewer_merge/ReviewersInfoManageCompany.vue'], resolve),
                    name: 'Reviewersinfomanagecompany',
                    meta: { title: '测评记录管理' }
                },
                {
                    path: '/reviewerschangemanagecompany',
                    component: resolve => require(['../components/views/reviewer_merge/ReviewersChangeManageCompany.vue'], resolve),
                    name: 'Reviewerschangemanagecompany',
                    meta: { title: '任务变更管理' }
                },
                {
                    path: '/todayTasks',
                    component: resolve => require(['../components/views/reviewer_merge/Today_Tasks.vue'], resolve),
                    meta: { title: '排单管理' }
                },
                {
                    path: '/performances',
                    component: resolve => require(['../components/views/group/Performances.vue'], resolve),
                    meta: { title: '绩效管理' }
                },
                {
                    path: '/recordPay',
                    component: resolve => require(['../components/views/record_pay/RecordPayInfoManage.vue'], resolve),
                    meta: { title: '付款管理' }
                },
                {
                    path: '/fansmanage',
                    component: resolve => require(['../components/views/reviewer/FansManage.vue'], resolve),
                    meta: { title: '粉丝管理' }
                },
                {
                    path: '/paymanage',
                    component: resolve => require(['../components/views/payRecord/payRecord.vue'], resolve),
                    meta: { title: '支付记录管理' }
                },
                {
                    path: '/batchpay',
                    component: resolve => require(['../components/views/payRecord/batchPay.vue'], resolve),
                    meta: { title: '批量支付' }
                },
                {
                    path: '/notifications',
                    component: resolve => require(['../components/views/Tabs.vue'], resolve),
                    meta: { title: '未读消息' }
                },
                {
                    path: '/addcategory',
                    component: resolve => require(['../components/views/category/AddCategory.vue'], resolve),
                    meta: { title: '创建分类' }
                },
                {
                    path: '/categoriesmanage',
                    component: resolve => require(['../components/views/category/CategoriesManage.vue'], resolve),
                    meta: { title: '分类管理' }
                },
                {
                    path: '/icon',
                    component: resolve => require(['../components/views/Icon.vue'], resolve),
                    meta: { title: '自定义图标' }
                },
                {
                    // 权限页面
                    path: '/permission',
                    component: resolve => require(['../components/views/Permission.vue'], resolve),
                    meta: { title: '权限测试', permission: true }
                },
                {
                    path: '/404',
                    component: resolve => require(['../components/views/404.vue'], resolve),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: resolve => require(['../components/views/403.vue'], resolve),
                    meta: { title: '403' }
                }
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/views/Login.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
