<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-goods"></i> 支付管理</el-breadcrumb-item>
                <el-breadcrumb-item>支付记录管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <div class="fnsku_filter" v-if="isRestrict === 'false'">
                    申请人员:
                    <el-select v-model="apply_user_id" filterable remote :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod" placeholder="选择用户" clearable class="handle-select mr10">
                        <el-option v-for="item in user_options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_user" ref="infiniteLoading"></infinite-loading>
                    </el-select>
                    <!-- <el-button @click="clear_filter" type="default">重置</el-button> -->
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div>
            </div>
            <br><br>
            <el-table v-loading="table_loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <!-- <el-table-column type="selection" width="55"></el-table-column> -->
                <el-table-column type="index">
                </el-table-column>
                <el-table-column prop="apply_username" label="申请人" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="username" label="审核人" v-if="isRestrict === 'false'" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="截图" width="120">
                    <template slot-scope="scope">
                        <el-badge :value="scope.row.img_count" class="item" v-if="scope.row.img_count != 0">
                            <span v-if="scope.row.pictures.length === 0">无</span>
                            <img style="cursor: pointer;" v-else-if="scope.row.pictures[0] != undefined && scope.row.pictures[0].url.thumb.url != null && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.thumb.url" @click="showPictures(scope.$index, scope.row)"/>
                            <span v-else>无</span>
                        </el-badge>
                        <span v-else>无</span>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
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
                                <!-- <el-dropdown-item>
                                    <el-button @click="handleAgree(scope.$index, scope.row)" type="text">处理</el-button>
                                </el-dropdown-item> -->
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
            <el-table :data="pay_details" border style="width: 100%">
                <el-table-column fixed prop="asin" label="ASIN" width="130" show-overflow-tooltip>
                </el-table-column>
                <el-table-column v-if="isRestrict === 'false'" prop="apply_username" label="申请人" width="70" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="plan_date" label="计划日期" width="90">
                </el-table-column>
                <el-table-column prop="keyword" label="关键词" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="order_number" label="订单号" show-overflow-tooltip>
                </el-table-column>
                <template v-if="isRestrict === 'false'">
                    <el-table-column prop="pay_type" label="支付类型" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column prop="currency" label="币种" >
                    </el-table-column>
                    <el-table-column prop="pay_time" label="支付时间" :formatter="formatter_pay_time" width="150">
                    </el-table-column>
                    <el-table-column prop="pay_price" label="支付价格" >
                    </el-table-column>
                </template>
                <el-table-column v-if="isRestrict === 'false'" prop="commission_charge" label="佣金手续费" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="charge" label="手续费" show-overflow-tooltip>
                </el-table-column>
                <template v-if="isRestrict === 'false'">
                    <el-table-column prop="sumPrice2" label="总费用" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <el-button type="warning">{{scope.row.sumPrice2}}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="need_refund2" label="是否需要返款" width="95">
                        <template slot-scope="scope">
                            <el-tag type="warning" v-if="scope.row.need_refund2 == '是'">是</el-tag>
                            <el-tag type="success" v-else-if="scope.row.need_refund2 == '否'">否</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="refund_time" label="返款时间" :formatter="formatter_refund_time" width="140">
                    </el-table-column>
                    <el-table-column prop="paypal_account" label="paypal账号" width="85">
                    </el-table-column>
                    <el-table-column prop="profile_url" label="亚马逊profile url" width="113">
                        <template slot-scope="scope">
                            <a v-if="scope.row.profile_url != null && scope.row.profile_url != '' && scope.row.profile_url != 'null'" :href="scope.row.profile_url" target="_blank">查看链接</a>
                        </template>
                    </el-table-column>
                    <el-table-column prop="facebook_url" label="fackbook url" width="95">
                        <template slot-scope="scope">
                            <a v-if="scope.row.facebook_url != null && scope.row.facebook_url != '' && scope.row.facebook_url != 'null'" :href="scope.row.facebook_url" target="_blank">查看链接</a>
                        </template>
                    </el-table-column>
                </template>
                <!-- <el-table-column prop="email" label="截图" width="120">
                    <template slot-scope="scope">
                        <el-badge :value="scope.row.img_count" class="item" v-if="scope.row.img_count != 0">
                            <span v-if="scope.row.pictures.length === 0">无</span>
                            <img v-else-if="scope.row.pictures[0] != undefined && scope.row.pictures[0].url.thumb.url != null && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.thumb.url"/>
                            <span v-else>无</span>
                        </el-badge>
                        <span v-else>无</span>
                    </template>
                </el-table-column> -->
                <!-- <el-table-column prop="status" label="状态" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
                    </template>
                </el-table-column> -->
                <el-table-column prop="status" label="状态" width="120">
                    <template slot-scope="scope">
                        <el-tag v-if="isRestrict === 'false'" :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status, scope.row.done_direct)}}</el-tag>
                        <el-tag v-else :type="scope.row.status | statusFilterRestrict">{{getStatusNameReStrict(scope.row.status, scope.row.done_direct)}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_pay_commission" label="佣金" width="65">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.is_pay_commission === false" type="warning">未收</el-tag>
                        <el-tag v-else-if="scope.row.is_pay_commission === true" type="success">已收</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_pay_capital" label="定金" width="65">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.is_pay_capital === false" type="warning">未收</el-tag>
                        <el-tag v-else-if="scope.row.is_pay_capital === true" type="success">已收</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="feedback" label="反馈" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="140">
                </el-table-column>
                <el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="140">
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog title="截图" :visible.sync="productVisible" width="70%">
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList.length != 0">
                <span>截图</span>
                <el-carousel-item v-for="(item, index) in picturestList" :key="index">
                    <img class="img_carousel" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <br>
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList2.length != 0">
                <span class="demonstration">截图</span>
                <el-carousel-item v-for="(item, index) in picturestList2" :key="index">
                    <img class="img_carousel" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList3.length != 0">
                <!-- <span class="demonstration">截图</span> -->
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
                isRestrict: '',
                pay_details: []
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
            statusFilterRestrict(status) {
                const statusMap = {
                    1: 'warning',
                    2: 'warning',
                    3: 'success',
                    4: 'danger',
                    5: 'danger',
                    6: 'warning',
                    7: 'warning',
                    8: 'warning',
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
                this.$axios.get( '/pay_records?page='+this.cur_page + '&apply_user_id=' + this.apply_user_id
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            data.img_count = data.pictures.length
                            data.join_record_pays.forEach((data2) => {
                                let temp = data2.task_record
                                temp.sumPrice2 = parseFloat((Number(temp.charge) + Number(temp.commission) + Number(temp.commission_charge) + Number(temp.pay_price)).toPrecision(12))
                            })
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
                this.$axios.get( '/pay_records?page='+this.cur_page + '&apply_user_id=' + this.apply_user_id
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            data.img_count = data.pictures.length
                            data.join_record_pays.forEach((data2) => {
                                let temp = data2.task_record
                                temp.sumPrice2 = parseFloat((Number(temp.charge) + Number(temp.commission) + Number(temp.commission_charge) + Number(temp.pay_price)).toPrecision(12))
                            })
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
                this.apply_user_id = ''
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
                this.detailOptions3 = []
                this.pay_details = []
                row.join_record_pays.forEach((data) => {
                    // data.task_record.commission = data.commission
                    // data.task_record.capital = data.capital
                    this.pay_details.push(data.task_record)
                })
                // this.pay_details = row.join_record_pays
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
                    this.picturestList3.push(data)
                    // if (data.remark == 'review') {
                    //     this.picturestList.push(data)
                    // } else if (data.remark == 'refund'){
                    //     this.picturestList2.push(data)
                    // } else {
                    //     this.picturestList3.push(data)
                    // }
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
                this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(() => {
                    // let params = {
                    //     id: row.id
                    // }
                    this.$axios.delete('/pay_records/' + row.id
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
                } else if(status == 2 && done_direct == true) {
                    return "需返款"
                } else if(status == 2 && done_direct == false) {
                    return "先返本金"
                } else if(status == 3) {
                    return "已完成"
                }else if(status == 4) {
                    return "已删除"
                }else if(status == 5) {
                    return "失败"
                }else if(status == 6) {
                    return "等待评论"
                }else if(status == 7) {
                    return "需返佣金"
                }else if(status == 8) {
                    return "反馈待审核"
                }else {
                    return '其他'
                }
            },
            getStatusNameReStrict(status, done_direct) {
                if(status == 1 || status == 2 || status == 6 || status == 7 || status == 8) {
                    return "正在进行中"
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
