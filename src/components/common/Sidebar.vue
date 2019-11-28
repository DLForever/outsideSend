<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" unique-opened router>
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item v-for="(threeItem,i) in subItem.subs" :key="i" :index="threeItem.index">
                                    {{ threeItem.title }}
                                </el-menu-item>
                            </el-submenu>
                            <el-menu-item v-else :index="subItem.index" :key="subItem.index">
                                {{ subItem.title }}
                            </el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
    import bus from '../common/bus';
    export default {
        data() {
            return {
                collapse: false,
                items: [
                    {
                        icon: 'el-icon-lx-home',
                        index: 'dashboard',
                        title: '系统首页'
                    },
                    {
                        icon: 'el-icon-lx-group',
                        index: '1',
                        title: '用户管理',
                        subs: [{
                            index: 'addusers',
                            title: '创建用户'
                        },
                        {
                            index: 'addroles',
                            title: '创建角色',
                        },
                        {
                            index: 'usersmanage',
                            title: '用户管理'
                        },{
                            index: 'rolesmanage',
                            title: '角色管理'
                        }]
                    },
                    {
                        icon: 'el-icon-lx-sort',
                        index: '4',
                        title: '分类管理',
                        subs: [{
                            index: 'addcategory',
                            title: '添加分类'
                        },{
                            index: 'categoriesmanage',
                            title: '分类管理'
                        }]
                    },
                    {
                        icon: 'el-icon-lx-goods',
                        index: '2',
                        title: '测评管理',
                        subs: [{
                            index: 'addreviewers',
                            title: '新建测评任务'
                        },
                        {
                            index: 'reviewersmanage',
                            title: '测评任务管理'
                        },
                        {
                            index: 'reviewersinfomanage',
                            title: '测评记录管理'
                        },
                        {
                            index: 'reviewerschangemanage',
                            title: '任务变更管理'
                        },
                        {
                            index: 'fansmanage',
                            title: '粉丝管理'
                        }]
                    },
                    {
                        icon: 'el-icon-lx-recharge',
                        index: '3',
                        title: '支付管理',
                        subs: [{
                            index: 'batchpay',
                            title: '批量支付'
                        },{
                            index: 'paymanage',
                            title: '支付记录管理'
                        }]
                    },
                    // {
                    //     icon: 'el-icon-lx-copy',
                    //     index: 'tabs',
                    //     title: 'tab选项卡'
                    // },
                    // {
                    //     icon: 'el-icon-lx-calendar',
                    //     index: '3',
                    //     title: '表单相关',
                    //     subs: [
                    //         {
                    //             index: 'form',
                    //             title: '基本表单'
                    //         },
                    //         {
                    //             index: '3-2',
                    //             title: '三级菜单',
                    //             subs: [
                    //                 {
                    //                     index: 'editor',
                    //                     title: '富文本编辑器'
                    //                 },
                    //                 {
                    //                     index: 'markdown',
                    //                     title: 'markdown编辑器'
                    //                 },
                    //             ]
                    //         },
                    //         {
                    //             index: 'upload',
                    //             title: '文件上传'
                    //         }
                    //     ]
                    // },
                    // {
                    //     icon: 'el-icon-lx-emoji',
                    //     index: 'icon',
                    //     title: '自定义图标'
                    // },
                    // {
                    //     icon: 'el-icon-lx-favor',
                    //     index: 'charts',
                    //     title: 'schart图表'
                    // },
                    // {
                    //     icon: 'el-icon-rank',
                    //     index: '6',
                    //     title: '拖拽组件',
                    //     subs: [
                    //         {
                    //             index: 'drag',
                    //             title: '拖拽列表',
                    //         },
                    //         {
                    //             index: 'dialog',
                    //             title: '拖拽弹框',
                    //         }
                    //     ]
                    // },
                    // {
                    //     icon: 'el-icon-lx-warn',
                    //     index: '7',
                    //     title: '错误处理',
                    //     subs: [
                    //         {
                    //             index: 'permission',
                    //             title: '权限测试'
                    //         },
                    //         {
                    //             index: '404',
                    //             title: '404页面'
                    //         }
                    //     ]
                    // }
                ],
                items2: [
                    {
                        icon: 'el-icon-lx-home',
                        index: 'dashboard',
                        title: '系统首页'
                    },
                    // {
                    //     icon: 'el-icon-lx-group',
                    //     index: '1',
                    //     title: '用户管理',
                    //     subs: [{
                    //         index: 'addusers',
                    //         title: '创建用户'
                    //     },
                    //     {
                    //         index: 'addroles',
                    //         title: '创建角色',
                    //     },
                    //     {
                    //         index: 'usersmanage',
                    //         title: '用户管理'
                    //     },{
                    //         index: 'rolesmanage',
                    //         title: '角色管理'
                    //     }]
                    // },
                    {
                        icon: 'el-icon-lx-goods',
                        index: '2',
                        title: '测评管理',
                        subs: [{
                            index: 'addreviewers',
                            title: '新建测评任务'
                        },
                        {
                            index: 'reviewersmanage',
                            title: '测评任务管理'
                        },
                        {
                            index: 'reviewersinfomanage',
                            title: '测评记录管理'
                        },
                        {
                            index: 'reviewerschangemanage',
                            title: '任务变更管理'
                        }]
                    },
                    {
                        icon: 'el-icon-lx-recharge',
                        index: '3',
                        title: '支付管理',
                        subs: [{
                            index: 'paymanage',
                            title: '支付记录管理'
                        }]
                    },
                ]
            }
        },
        computed:{
            onRoutes(){
                if (localStorage.getItem('restrict') === 'true') {
                    this.items = this.items2
                }
                return this.$route.path.replace('/','');
            }
        },
        created(){
            // 通过 Event Bus 进行组件间通信，来折叠侧边栏
            bus.$on('collapse', msg => {
                this.collapse = msg;
            })
        }
    }
</script>

<style scoped>
    .sidebar{
        display: block;
        position: absolute;
        left: 0;
        top: 70px;
        bottom:0;
        overflow-y: scroll;
    }
    .sidebar::-webkit-scrollbar{
        width: 0;
    }
    .sidebar-el-menu:not(.el-menu--collapse){
        width: 250px;
    }
    .sidebar > ul {
        height:100%;
    }
</style>
