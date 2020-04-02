<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card shadow="hover" class="mgb20" style="height:252px;">
                    <div class="user-info">
                        <img src="../../assets/img/img.jpg" class="user-avator" alt="">
                        <div class="user-info-cont">
                            <div class="user-info-name">{{name}}</div>
                            <!-- <div>{{role}}</div> -->
                        </div>
                    </div>
                    <!-- <div class="user-info-list">上次登录时间：<span>2018-01-01</span></div>
                    <div class="user-info-list">上次登录地点：<span>东莞</span></div> -->
                </el-card>
            </el-col>
            <template v-if="is_company === '1' && restrict === 'false' && authority === 1">
            <el-col :span="16">
                <el-row :gutter="20" class="mgb20">
                    <el-col :span="6">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-4">
                                <i class="el-icon-lx-recharge grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{total_price}}</div>
                                    <div>总收入</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-1">
                                <i class="el-icon-lx-cart grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{total}}</div>
                                    <div>总计</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-2">
                                <i class="el-icon-lx-roundcheck grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{done}}</div>
                                    <div>完成</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-3">
                                <i class="el-icon-lx-warn grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{block}}</div>
                                    <div>失败</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
            </template>

        </el-row>
        <el-row :gutter="20" v-if="schart_show === 1 && is_company ==='1' && restrict === 'false' && authority === 1">
            <el-col :span="12">
                <el-card shadow="hover">
                    <schart ref="bar" class="schart" canvasId="bar" :options="options10"></schart>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover">
                    <schart ref="bar2" class="schart" canvasId="bar2" :options="options30"></schart>
                </el-card>
            </el-col>
            <!-- <el-col :span="12">
                <el-card shadow="hover">
                    <schart ref="line" class="schart" canvasId="line" :options="options20"></schart>
                </el-card>
            </el-col> -->
        </el-row>
    </div>
</template>

<script>
    import Schart from 'vue-schart';
    import bus from '../common/bus';
    export default {
        // name: 'dashboard',
        data() {
            return {
                name: localStorage.getItem('ms_username'),
                todoList: [{
                        title: '今天要修复100个bug',
                        status: false,
                    },
                    {
                        title: '今天要修复100个bug',
                        status: false,
                    },
                    {
                        title: '今天要写100行代码加几个bug吧',
                        status: false,
                    }, {
                        title: '今天要修复100个bug',
                        status: false,
                    },
                    {
                        title: '今天要修复100个bug',
                        status: true,
                    },
                    {
                        title: '今天要写100行代码加几个bug吧',
                        status: true,
                    }
                ],
                data: [{
                        name: '2018/09/04',
                        value: 1083
                    },
                    {
                        name: '2018/09/05',
                        value: 941
                    },
                    {
                        name: '2018/09/06',
                        value: 1139
                    },
                    {
                        name: '2018/09/07',
                        value: 816
                    },
                    {
                        name: '2018/09/08',
                        value: 327
                    },
                    {
                        name: '2018/09/09',
                        value: 228
                    },
                    {
                        name: '2018/09/10',
                        value: 1065
                    }
                ],
                options: {
                    title: '最近七天每天的用户访问量',
                    showValue: false,
                    fillColor: 'rgb(45, 140, 240)',
                    bottomPadding: 30,
                    topPadding: 30
                },
                options2: {
                    title: '最近七天用户访问趋势',
                    fillColor: '#FC6FA1',
                    axisColor: '#008ACD',
                    contentColor: '#EEEEEE',
                    bgColor: '#F5F8FD',
                    bottomPadding: 30,
                    topPadding: 30
                },
                options10: {
                    type: 'bar',
                    title: {
                        text: '各站点今日统计'
                    },
                    xRorate: 25,
                    labels: ['US', 'UK', 'DE', 'JP', 'CA'],
                    datasets: [
                        {
                            label: '计划数量',
                            data: [0, 0, 0, 0, 0]
                        },
                        {
                            label: '完成数量',
                            data: [0, 0, 0, 0, 0]
                        },
                        {
                            label: '失败数量',
                            data: [0, 0, 0, 0, 0]
                        },
                    ]
                },
                options30: {
                    type: 'bar',
                    title: {
                        text: '各站点今日收益统计'
                    },
                    xRorate: 25,
                    labels: ['US', 'UK', 'DE', 'JP', 'CA'],
                    datasets: [
                        {
                            label: '收款',
                            data: [0, 0, 0, 0, 0]
                        },
                        {
                            label: '佣金',
                            data: [0, 0, 0, 0, 0]
                        },
                    ]
                },
                options20: {
                    type: 'line',
                    title: {
                        text: '最近几个月各品类销售趋势图'
                    },
                    labels: ['6月', '7月', '8月', '9月', '10月'],
                    datasets: [
                        {
                            label: '家电',
                            data: []
                        },
                        {
                            label: '百货',
                            data: [164, 178, 150, 135, 160]
                        },
                        {
                            label: '食品',
                            data: [74, 118, 200, 235, 90]
                        }
                    ]
                },
                schart_show: 0,
                total: 0,
                total_price: 0,
                done: 0,
                block: 0,
                is_company: '',
                restrict: '',
                authority: 0
            }
        },
        computed: {
            role() {
                return this.name === 'admin' ? '超级管理员' : '普通用户';
            }
        },
        created(){
            // console.log(111)
            // console.log(this.options10)
            this.is_company = localStorage.getItem('is_company')
            this.restrict = localStorage.getItem('restrict')
            console.log(localStorage.getItem('is_company'))
            this.getData()
            // this.handleListener();
            // this.changeDate();
        },
        watch: {
            // "$route": "getData"
        },
        activated(){
            // this.handleListener();
        },
        // deactivated(){
        //     window.removeEventListener('resize', this.renderChart);
        //     bus.$off('collapse', this.handleBus);
        // },
        methods: {
            getData() {
                this.$axios.get('/performances/today_info' 
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.total = 0, this. total_price = 0, this.done = 0, this. block = 0
                        if (res.data.data.US != undefined) {
                            this.options10.datasets[0].data[0] = parseFloat(res.data.data.US.plan)
                            this.options10.datasets[1].data[0] = parseFloat(res.data.data.US.done)
                            this.options10.datasets[2].data[0] = parseFloat(res.data.data.US.block)
                            this.options30.datasets[0].data[0] = parseFloat(res.data.data.US.pay_price)
                            this.options30.datasets[1].data[0] = parseFloat(res.data.data.US.commission)
                            this.total += parseFloat(res.data.data.US.plan)
                            this.total_price += parseFloat(res.data.data.US.pay_price)
                            this.done += parseFloat(res.data.data.US.done)
                            this.block += parseFloat(res.data.data.US.block)
                        }

                        if(res.data.data.UK != undefined) {
                            this.options10.datasets[0].data[1] = parseFloat(res.data.data.UK.plan)
                            this.options10.datasets[1].data[1] = parseFloat(res.data.data.UK.done)
                            this.options10.datasets[2].data[1] = parseFloat(res.data.data.UK.block)
                            this.options30.datasets[0].data[1] = parseFloat(res.data.data.UK.pay_price)
                            this.options30.datasets[1].data[1] = parseFloat(res.data.data.UK.commission)
                            this.total += parseFloat(res.data.data.UK.plan)
                            this.total_price += parseFloat(res.data.data.UK.pay_price)
                            this.done += parseFloat(res.data.data.UK.done)
                            this.block += parseFloat(res.data.data.UK.block)
                        }
                        
                        if(res.data.data.DE != undefined) {
                            this.options10.datasets[0].data[2] = parseFloat(res.data.data.DE.plan)
                            this.options10.datasets[1].data[2] = parseFloat(res.data.data.DE.done)
                            this.options10.datasets[2].data[2] = parseFloat(res.data.data.DE.block)
                            this.options30.datasets[0].data[2] = parseFloat(res.data.data.DE.pay_price)
                            this.options30.datasets[1].data[2] = parseFloat(res.data.data.DE.commission)
                            this.total += parseFloat(res.data.data.DE.plan)
                            this.total_price += parseFloat(res.data.data.DE.pay_price)
                            this.done += parseFloat(res.data.data.DE.done)
                            this.block += parseFloat(res.data.data.DE.block)
                        }

                        if(res.data.data.JP != undefined) {
                            this.options10.datasets[0].data[3] = parseFloat(res.data.data.JP.plan)
                            this.options10.datasets[1].data[3] = parseFloat(res.data.data.JP.done)
                            this.options10.datasets[2].data[3] = parseFloat(res.data.data.JP.block)
                            this.options30.datasets[0].data[3] = parseFloat(res.data.data.JP.pay_price)
                            this.options30.datasets[1].data[3] = parseFloat(res.data.data.JP.commission)
                            this.total += parseFloat(res.data.data.JP.plan)
                            this.total_price += parseFloat(res.data.data.JP.pay_price)
                            this.done += parseFloat(res.data.data.JP.done)
                            this.block += parseFloat(res.data.data.JP.block)
                        }

                        if(res.data.data.CA != undefined) {
                            this.options10.datasets[0].data[4] = parseFloat(res.data.data.CA.plan)
                            this.options10.datasets[1].data[4] = parseFloat(res.data.data.CA.done)
                            this.options10.datasets[2].data[4] = parseFloat(res.data.data.CA.block)
                            this.options30.datasets[0].data[4] = parseFloat(res.data.data.CA.pay_price)
                            this.options30.datasets[1].data[4] = parseFloat(res.data.data.CA.commission)
                            this.total += parseFloat(res.data.data.CA.plan)
                            this.total_price += parseFloat(res.data.data.CA.pay_price)
                            this.done += parseFloat(res.data.data.CA.done)
                            this.block += parseFloat(res.data.data.CA.block)
                        }
                        this.schart_show = 1
                        if(res.data.code != 300) {
                            this.authority = 1
                        }
                        // setTimeout()
                        // console.log(res.data.data.US)
                        // res.data.data.forEach((data) => {
                            
                        // })
                    }
                }).catch((res) => {
                    console.log(res)
                })
            },
            changeDate(){
                const now = new Date().getTime();
                this.data.forEach((item, index) => {
                    const date = new Date(now - (6 - index) * 86400000);
                    item.name = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
                })
            },
            // handleListener(){
            //     bus.$on('collapse', this.handleBus);
            //     // 调用renderChart方法对图表进行重新渲染
            //     window.addEventListener('resize', this.renderChart)
            // },
            // handleBus(msg){
            //     setTimeout(() => {
            //         this.renderChart()
            //     }, 300);
            // },
            // renderChart(){
            //     this.$refs.bar.renderChart();
            //     this.$refs.line.renderChart();
            // }
        },
        components: {
            Schart
        }
    }


</script>


<style scoped>
    .el-row {
        margin-bottom: 20px;
    }

    .grid-content {
        display: flex;
        align-items: center;
        height: 100px;
    }

    .grid-cont-right {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #999;
    }

    .grid-num {
        font-size: 30px;
        font-weight: bold;
    }

    .grid-con-icon {
        font-size: 50px;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
        color: #fff;
    }

    .grid-con-1 .grid-con-icon {
        background: rgb(45, 140, 240);
    }

    .grid-con-1 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-2 .grid-con-icon {
        background: rgb(100, 213, 114);
    }

    .grid-con-2 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-3 .grid-con-icon {
        background: rgb(242, 94, 67);
    }

    .grid-con-3 .grid-num {
        color: rgb(242, 94, 67);
    }

    .grid-con-4 .grid-con-icon {
        background: rgb(245, 203, 66);
    }

    .grid-con-4 .grid-num {
        color: rgb(245, 203, 66);
    }

    .user-info {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 2px solid #ccc;
        margin-bottom: 20px;
    }

    .user-avator {
        width: 120px;
        height: 120px;
        border-radius: 50%;
    }

    .user-info-cont {
        padding-left: 50px;
        flex: 1;
        font-size: 14px;
        color: #999;
    }

    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }

    .user-info-list {
        font-size: 14px;
        color: #999;
        line-height: 25px;
    }

    .user-info-list span {
        margin-left: 70px;
    }

    .mgb20 {
        margin-bottom: 20px;
    }

    .todo-item {
        font-size: 14px;
    }

    .todo-item-del {
        text-decoration: line-through;
        color: #999;
    }

    .schart {
        width: 100%;
        height: 300px;
    }

</style>
