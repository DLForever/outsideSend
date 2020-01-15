<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-goods"></i> 公司测评管理</el-breadcrumb-item>
                <el-breadcrumb-item>任务变更管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <div class="fnsku_filter">
                    送测人员:
                    <el-select v-model="user_id_filter" filterable remote :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod" placeholder="选择用户" class="handle-select mr10">
                        <el-option v-for="item in user_options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_user" ref="infiniteLoading"></infinite-loading>
                    </el-select>
                    申请人员:
                    <el-select v-model="apply_user_id" filterable remote :loading="loading2" @visible-change="selectVisble2" :remote-method="remoteMethod2" placeholder="选择用户" class="handle-select mr10">
                        <el-option v-for="item in user_options2" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_user2" ref="infiniteLoading2"></infinite-loading>
                    </el-select>
                    是否处理:
                    <el-select style="width:120px; margin-right: 10px;" v-model="isProcess" clearable placeholder="请选择">
                        <el-option v-for="item in isProcessOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div>
            </div>
            <br><br>
            <el-table v-loading="table_loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <!-- <el-table-column type="selection" width="55"></el-table-column> -->
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-form label-position="left" inline class="demo-table-expand">
                            <!-- <el-form-item label="计划日期">
                                <span>{{ props.row.task_period.plan_date }}</span>
                            </el-form-item> -->
                            <el-form-item label="计划数量">
                                <span>{{ props.row.task_period.plan_sum }}</span>
                            </el-form-item>
                            <el-form-item label="已进行数量">
                                <span>{{ props.row.task_period.start_sum }}</span>
                            </el-form-item>
                            <el-form-item label="接受数量">
                                <span>{{ props.row.task_period.accept_sum }}</span>
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column prop="asin" label="Asin" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="apply_username" label="申请人" show-overflow-tooltip>
                </el-table-column>
                <el-table-column v-if="isRestrict === 'false'" prop="username" label="送测人" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="plan_date" label="计划日期" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="sum_from" label="原计划数量" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="sum_to" label="变更数量" show-overflow-tooltip>
                </el-table-column>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="remove_remark" label="处理备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="c_type" label="状态" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.c_type === 1" type="warning">更新</el-tag>
                        <el-tag v-else type="danger">删除</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="c_type" label="处理状态" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.process === false" type="warning">未处理</el-tag>
                        <el-tag v-else-if="scope.row.process === true && scope.row.pass === false" type="danger">拒绝</el-tag>
                        <el-tag v-else-if="scope.row.process === true && scope.row.pass === true" type="success">同意</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at">
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-dropdown>
                            <el-button type="primary">
                                操作<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item>
                                    <el-button @click="handleDetails(scope.$index, scope.row)" type="text">详情</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="handleAgree(scope.$index, scope.row)" type="text">处理</el-button>
                                </el-dropdown-item>
                                <!-- <el-dropdown-item>
                                    <el-button @click="handleEdit(scope.$index, scope.row)" type="text">编辑</el-button>
                                </el-dropdown-item> -->
                                <el-dropdown-item>
                                    <el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
            </el-table>
            <div class="pagination" v-if="paginationShow && totals != 0">
                <el-pagination  @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="50%">
            <el-form ref="form" :model="form" label-width="150px">
                <el-form-item label="facebook url">
                    <el-input v-model="form.facebook_url"></el-input>
                </el-form-item>
                <el-form-item label="亚马逊profile url">
                    <el-input v-model="form.profile_url"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 处理提示框 -->
        <el-dialog title="提示" :visible.sync="handleVisible" width="50%">
            <el-form label-width="100px">
                <el-form-item label="备注">
                    <el-input v-model="remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleVisible = false">取 消</el-button>
                <el-button type="warning" @click="saveAgree(0)">拒 绝</el-button>
                <el-button type="primary" @click="saveAgree(1)">通 过</el-button>
            </span>
        </el-dialog>

        <!-- 详情提示 -->
        <el-dialog title="详情" :visible.sync="detailVisible" width="95%">
            <el-table :data="task_details" border style="width: 100%">
                <el-table-column prop="asin" label="Asin" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="apply_username" label="申请人" show-overflow-tooltip>
                </el-table-column>
                <el-table-column v-if="isRestrict === 'false'" prop="username" label="送测人" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="shopname" label="店铺" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="name" label="名称" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="price" label="价格" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间">
                </el-table-column>
            </el-table>
            <br>
            <el-table :data="detailOptions3" border style="width: 100%">
                <el-table-column prop="keywords" label="关键词" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="keyword_index" label="关键词位置" show-overflow-tooltip>
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog title="测评截图" :visible.sync="productVisible" width="70%">
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList.length != 0">
                <span>评论截图</span>
                <el-carousel-item v-for="(item, index) in picturestList" :key="index">
                    <img class="img_carousel" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <br>
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList2.length != 0">
                <span class="demonstration">退款截图</span>
                <el-carousel-item v-for="(item, index) in picturestList2" :key="index">
                    <img class="img_carousel" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList3.length != 0">
                <span class="demonstration">反馈截图</span>
                <el-carousel-item v-for="(item, index) in picturestList3" :key="index">
                    <img class="img_carousel" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
        </el-dialog>
    </div>
</template>

<script>
    import VueInfiniteLoading from "vue-infinite-loading"
    export default {
//      name: 'product_manage',
        data() {
            return {
                url: './static/vuetable.json',
//              url: 'package.json',
                tableData: [],
                cur_page: 1,
                pagesize: 20,
//              pagesizes:'',
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                is_search: false,
                editVisible: false,
                paginationShow: true,
                totals: 0,
                form: {
                    name: '',
                    date: '',
                    address: '',
                },
                idx: -1,
                picturesProductList: [],
                picturesPackageList: [],
                supplier_id: undefined,
                picture_id: undefined,
                submitDisabled: false,
                checkVisible: false,
                detailVisible: false,
                fileList: [],
                picturestList: [],
                productVisible: false,
                search_fan: '',
                task_records: [],
                picturestList: [],
                picturestList2: [],
                picturestList3: [],
                table_loading: true,
                user_id_filter: '',
                query: undefined,
                user_page: 1,
                user_total: 0,
                loading: false,
                user_options: [],
                apply_user_id: '',
                query2: undefined,
                user_page2: 1,
                user_total2: 0,
                loading2: false,
                user_options2: [],
                handleVisible: false,
                remark: '',
                task_details: [],
                detailOptions3: [],
                isProcess: '',
                isProcessOptions: [{label: '已处理', value: 1}, {label: '未处理', value: 0}],
                isRestrict: ''
            }
        },
        created() {
            this.isRestrict = localStorage.getItem('restrict')
            this.getData();
        },
        watch: {
        	"$route": "getData"
        },
        filters: {
            //类型转换
            statusFilter(status) {
                const statusMap = {
                    1: 'warning',
                    2: 'primary',
                    3: 'success',
                    4: 'danger',
                    5: 'danger',
                    6: 'success',
                    10: 'success',
                }
                return statusMap[status]
            },
        },
        computed: {
            data() {
                return this.tableData.filter((d) => {
                    let is_del = false;
                    return d
                })
            }
        },
        methods: {
        	handleSizeChange(val) {
        		this.pagesize = val;
        	},
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                // 开发环境使用 easy-mock 数据，正式环境使用 json 文件
                if (process.env.NODE_ENV === 'development') {
//                  this.url = '/ms/table/list';
                };
                this.table_loading = true
                this.export_token = localStorage.getItem('token')
                if (!this.$route.params.task_id) {
                    this.$route.params.task_id = ''
                }
                if (!this.$route.params.task_period_id) {
                    this.$route.params.task_period_id = ''
                }
                this.$axios.get( '/period_change_records?page='+this.cur_page + '&user_id=' + this.user_id_filter + '&apply_user_id=' + this.apply_user_id + '&process=' + this.isProcess + '&task_id=' + this.$route.params.task_id + '&task_period_id=' + this.$route.params.task_period_id + '&is_company=1'
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            data.apply_username = data.task.apply_username
                            data.username = data.task.username
                            data.asin = data.task.asin
                            data.plan_date = data.task_period.plan_date
                        })
                        this.tableData = res.data.data
                        this.totals = res.data.count
                        this.paginationShow = true
                    }
                }).catch((res) => {
                	console.log('error')
                }).finally(() => {
                    this.table_loading = false
                })
            },
            filter_product() {
                this.table_loading = true
                this.cur_page = 1
                this.paginationShow = false
                if (!this.$route.params.task_id) {
                    this.$route.params.task_id = ''
                }
                if (!this.$route.params.task_period_id) {
                    this.$route.params.task_period_id = ''
                }
                this.$axios.get( '/period_change_records?page='+this.cur_page + '&user_id=' + this.user_id_filter + '&apply_user_id=' + this.apply_user_id + '&process=' + this.isProcess + '&task_id=' + this.$route.params.task_id + '&task_period_id=' + this.$route.params.task_period_id + '&is_company=1'
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            data.apply_username = data.task.apply_username
                            data.username = data.task.username
                            data.asin = data.task.asin
                            data.plan_date = data.task_period.plan_date
                        })
                        this.tableData = res.data.data
                        this.totals = res.data.count
                        this.table_loading = false
                    }
                    this.paginationShow = true
                }).catch((res) => {
                    console.log('error')
                }).finally(() => {
                    this.table_loading = false
                })
            },
            clear_filter() {
                this.paginationShow = false
                this.cur_page = 1
                this.user_id_filter = ''
                this.apply_user_id = ''
                this.isProcess = ''
                this.$route.params.task_id = ''
                this.$route.params.task_period_id = ''
                this.getData()
            },
            formatter_created_at(row, column) {
				return row.created_at.substr(0, 19);
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19);
			},
            formatter_pay_time(row, column) {
                return row.pay_time.substr(0, 19);
            },
            search() {
                this.is_search = true;
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            check(index, row) {
                this.idx = row.id
                this.checkVisible = true
            },
            handleEdit(index, row) {
                this.idx = index;
                const item = row
                this.form = {
                    id: item.id,
                    facebook_url: item.facebook_url,
                    profile_url: item.profile_url,
                }
                this.editVisible = true;
            },
            delAll() {
                const length = this.multipleSelection.length;
                let str = '';
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += this.multipleSelection[i].name + ' ';
                }
                this.$message.error('删除了' + str);
                this.multipleSelection = [];
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            saveEdit() {
                this.submitDisabled = true
                let params = {
                    facebook_url: this.form.facebook_url,
                    profile_url: this.form.profile_url,
                    fan: 'true'
                }
                this.$axios.patch('/task_records/' + this.form.id, params).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('更新成功！')
                        this.getData()
                        this.editVisible = false
                        this.detailVisible = false
                    }
                }).catch((res) => {
                    console.log(res)
                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
            handleDetails(index, row) {
                // this.detailOptions3 = []
                
                // tempkeywords.forEach((data, index) => {
                //     this.detailOptions3.push({keywords: data, keyword_index: tempkeywordindex[index]})
                // })
                // this.keyword_options = row.keywords.split(',')
                // this.task_id = row.id
                // this.addReviewerForm.asin = row.asin
                // this.detailOptions = [row]
                // this.detailOptions2 = row.task_periods

                this.detailOptions3 = []
                this.task_details = [row.task]
                let tempkeywords = row.task.keywords.split(',')
                let tempkeywordindex = row.task.keyword_index.split(',')
                tempkeywords.forEach((data, index) => {
                    this.detailOptions3.push({keywords: data, keyword_index: tempkeywordindex[index]})
                })
                this.detailVisible = true
            },
            changeFile(file) {
                this.fileList.push(file)
            },
            handleRemove(a, b) {
                this.fileList = b
            },
            formatter_created_at(row, column) {
                return row.created_at.substr(0, 19);
            },
            formatter_updated_at(row, column) {
                return row.updated_at.substr(0, 19);
            },
            formatter_refund_time(row, column) {
                if (row.refund_time != null) {
                    return row.refund_time.substr(0, 19);
                }else {
                    return
                }
            },
            showPictures(index, row) {
                this.picturestList = []
                this.picturestList2 = []
                this.picturestList3 = []
                this.product_id = row.id
                const item = row
                item.pictures.forEach((data) => {
                    if (data.remark == 'review') {
                        this.picturestList.push(data)
                    } else if (data.remark == 'refund'){
                        this.picturestList2.push(data)
                    } else {
                        this.picturestList3.push(data)
                    }
                })
                this.productVisible = true;
            },
            onInfinite_user(obj) {
                if((this.user_page * 20) < this.user_total) {
                    this.user_page += 1
                    // this.getUsers(obj.loaded)
                    this.remoteMethod(this.query,obj.loaded)
                } else {
                    obj.complete()
                }
            },
            selectVisble(visible) {
                if(visible) {
                    this.query = undefined
                    this.remoteMethod("")
                }
            },
            remoteMethod(query, callback = undefined) {
                if(query != "" || this.query != "" || callback) {
                    let reload = false
                    if(this.query != query) {
                        this.loading = true
                        this.user_page = 1
                        this.query = query
                        reload = true
                        if(this.$refs.infiniteLoading.isComplete) {
                            this.$refs.infiniteLoading.stateChanger.reset()
                        }
                    }
                    this.$axios.get("/users/?page=" + this.user_page + '&name=' + query.trim()
                    ).then((res) => {
                        if(res.data.code == 200) {
                            this.loading = false
                            //                          this.options = res.data.data
                            if(reload) {
                                let tempOptions = []
                                this.user_options = tempOptions.concat(res.data.data)
                            } else {
                                this.user_options = this.user_options.concat(res.data.data)
                            }
                            this.user_total = res.data.count
                            if(callback) {
                                callback()
                            }
                        }
                    }).catch((res) => {
                        console.log('失败')
                    })
                }
            },
            onInfinite_user2(obj) {
                if((this.user_page2 * 20) < this.user_total2) {
                    this.user_page2 += 1
                    // this.getUsers(obj.loaded)
                    this.remoteMethod2(this.query2,obj.loaded)
                } else {
                    obj.complete()
                }
            },
            selectVisble2(visible) {
                if(visible) {
                    this.query2 = undefined
                    this.remoteMethod2("")
                }
            },
            remoteMethod2(query, callback = undefined) {
                if(query != "" || this.query2 != "" || callback) {
                    let reload = false
                    if(this.query2 != query) {
                        this.loading2 = true
                        this.user_page2 = 1
                        this.query2 = query
                        reload = true
                        if(this.$refs.infiniteLoading2.isComplete) {
                            this.$refs.infiniteLoading2.stateChanger.reset()
                        }
                    }
                    this.$axios.get("/users/?page=" + this.user_page2 + '&name=' + query.trim()
                    ).then((res) => {
                        if(res.data.code == 200) {
                            this.loading2 = false
                            //                          this.options = res.data.data
                            if(reload) {
                                let tempOptions = []
                                this.user_options2 = tempOptions.concat(res.data.data)
                            } else {
                                this.user_options2 = this.user_options2.concat(res.data.data)
                            }
                            this.user_total2 = res.data.count
                            if(callback) {
                                callback()
                            }
                        }
                    }).catch((res) => {
                        console.log('失败')
                    })
                }
            },
            handleAgree(index, row) {
                this.remark = ''
                this.form.id = row.id
                this.idx = index;
                this.handleVisible = true;
            },
            saveAgree(type) {
                this.submitDisabled = true
                let params = {
                    remark: this.remark,
                    pass: type
                }
                this.$axios.patch('/period_change_records/' + this.form.id, params).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('处理成功！')
                        this.getData()
                        this.handleVisible = false
                    }
                }).catch((res) => {
                    console.log(res)
                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
            handleDelete(index, row) {
                this.$confirm('此操作将永久删除该任务, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(() => {
                    // let params = {
                    //     id: row.id
                    // }
                    this.$axios.delete('/period_change_records/' + row.id
                    ).then((res) => {
                        if(res.data.code == 200) {
                            this.getData()
                            this.$message.success("删除成功")
                        }
                    }).catch(() => {
                        
                    })
                }).catch(() => {
                    this.$message.info('已取消删除')
                })
            },
            getStatusName(status) {
                if(status == 1) {
                    return "正在进行中"
                } else if(status == 2) {
                    return "已评论"
                } else if(status == 3) {
                    return "已完成"
                }else if(status == 4) {
                    return "已删除"
                }else if(status == 5) {
                    return "失败"
                }else {
                    return '其他'
                }
            },
        },
        components: {
            "infinite-loading": VueInfiniteLoading
        }
    }

</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 150px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }

    .fnsku_filter {
        float: right;
    }

    .img_fnsku {
        width:6rem;
        height:6rem;
    }
    .img {
        width:3rem;
        height:3rem;
    }

    .item {
      margin-top: 10px;
      margin-right: 40px;
    }
    .el-carousel__item.is-animating{
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }
    .img_carousel {
        max-width: 40rem;
    }
    .mr10{
        margin-right: 10px;
    }
    .demo-table-expand {
        font-size: 0;
    }
    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
    .el-form--inline .el-form-item__label {
        width: 90px;
        color: #99a9bf;
    }
</style>
