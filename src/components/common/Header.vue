<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i class="el-icon-menu"></i>
        </div>
        <div class="logo">
            <a href="/" style="color: #fff;"><span>送测管理系统</span></a>
        </div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全屏显示 -->
                <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>
                <!-- 消息中心 -->
                <el-badge :value="message_count" class="item" >
                    <el-tooltip effect="dark" :content="message_count?`有${message_count}条未读消息`:`消息中心`" placement="bottom">
                        <router-link to="/notifications">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                </el-badge>
                <!-- <el-badge :value="message_count" class="item" >
                    <el-tooltip effect="dark" :content="message_count?`有${message_count}条未读消息`:`消息中心`" placement="bottom">
                        <router-link to="/notifications">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                </el-badge> -->
                <!-- <div class="btn-bell">
                    <el-tooltip effect="dark" :content="message?`有${message}条未读消息`:`消息中心`" placement="bottom">
                        <router-link to="/tabs">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                    <span class="btn-bell-badge" v-if="message"></span>
                </div> -->
                <!-- 用户头像 -->
                <div class="user-avator"><img src="../../assets/img/img.jpg"></div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{username}} <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item divided  command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>
<script>
    import bus from '../common/bus';
    export default {
        data() {
            return {
                collapse: false,
                fullscreen: false,
                name: 'lyh',
                message: 2,
                defaultActiveIndex: '/'
            }
        },
        props:{
            clearInte: Function,
            message_count:Number,
            notifications:Array,
        },
        created() {
            // 组件创建完后获取数据
            this.fetchNavData()
        },
        computed:{
            username(){
                let username = localStorage.getItem('ms_username');
                return username ? username : this.name;
            }
        },
        methods:{
            // 用户名下拉菜单选择事件
            handleCommand(command) {
                if(command == 'loginout'){
                    this.clearInte()
                    localStorage.removeItem('ms_username')
                    this.$router.push('/login');
                }
            },
            // 侧边栏折叠
            collapseChage(){
                this.collapse = !this.collapse;
                bus.$emit('collapse', this.collapse);
            },
            // 全屏事件
            handleFullScreen(){
                let element = document.documentElement;
                if (this.fullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                } else {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.webkitRequestFullScreen) {
                        element.webkitRequestFullScreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.msRequestFullscreen) {
                        // IE11
                        element.msRequestFullscreen();
                    }
                }
                this.fullscreen = !this.fullscreen;
            },
            fetchNavData() { // 初始化菜单激活项
                let cur_path = this.$route.path
                let routers = this.$router.options.routes
                let nav_type = '', nav_name = ''
                for (let i = 0; i < routers.length; i++) {
                    let children = routers[i].children
                    if (children) {
                        for (let j = 0; j < children.length; j++) {
                            if (children[j].path === cur_path) {
                                nav_type = routers[i].type
                                nav_name = routers[i].name
                                break
                            }
                            // 如果还有子菜单
                            if (children[j].children) {
                                let grandChildren = children[j].children
                                for (let z = 0; z < grandChildren.length; z++) {
                                    if (grandChildren[z].path === cur_path) {
                                        nav_type = routers[i].type
                                        nav_name = routers[i].name
                                        break
                                    }
                                    if(grandChildren[z].children) {
                                        let threeChildren = grandChildren[z].children
                                        for (let y = 0; y < threeChildren.length; y++) {
                                            if (threeChildren[y].path === cur_path) {
                                                nav_type = routers[i].type
                                                nav_name = routers[i].name
                                                break
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                this.$store.state.topNavState = nav_type
                this.$store.dispatch('setLeftNavState', nav_name)
                // this.$store.state.leftNavState = nav_name
                if (nav_type == 'home') {
                    this.defaultActiveIndex = '/'
                } else {
                    this.defaultActiveIndex = '/' + nav_name + 'Department'
                }
            },
        },
        mounted(){
            if(document.body.clientWidth < 1500){
                this.collapseChage();
            }
        },
        watch: {
            '$route': function(to, from) {
                this.fetchNavData()
            }
        }
    }
</script>
<style scoped>
    .header {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 70px;
        font-size: 22px;
        color: #fff;
    }
    .collapse-btn{
        float: left;
        padding: 0 21px;
        cursor: pointer;
        line-height: 70px;
    }
    .header .logo{
        float: left;
        width:250px;
        line-height: 70px;
    }
    .header-right{
        float: right;
        padding-right: 50px;
    }
    .header-user-con{
        display: flex;
        height: 70px;
        align-items: center;
    }
    .btn-fullscreen{
        transform: rotate(45deg);
        margin-right: 5px;
        font-size: 24px;
    }
    .btn-bell, .btn-fullscreen{
        position: relative;
        width: 30px;
        height: 30px;
        text-align: center;
        border-radius: 15px;
        cursor: pointer;
    }
    .btn-bell-badge{
        position: absolute;
        right: 0;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background: #f56c6c;
        color: #fff;
    }
    .btn-bell .el-icon-bell{
        color: #fff;
    }
    .user-name{
        margin-left: 10px;
    }
    .user-avator{
        margin-left: 20px;
    }
    .user-avator img{
        display: block;
        width:40px;
        height:40px;
        border-radius: 50%;
    }
    .el-dropdown-link{
        color: #fff;
        cursor: pointer;
    }
    .el-dropdown-menu__item{
        text-align: center;
    }
    .topbar-title {
        float: left;
        text-align: left;
        padding-left: 10px;
        /*border-left: 1px solid #000;*/
    }
    .topbar-title .el-menu--horizontal {
        background-color: transparent;
    }
    .el-menu--horizontal > .el-menu-item:not(.is-disabled):hover, .el-menu--horizontal > .el-menu-item:not(.is-disabled):focus, .el-menu--horizontal > .el-menu-item.is-active {
        color: #fff;
        background-color: transparent;
        border-bottom: 3px solid #409EFF !important;
    }
    .topbar-title .el-menu--horizontal > .el-menu-item {
        height: 70px;
        line-height: 70px;
        color: #fff;
    }
</style>
