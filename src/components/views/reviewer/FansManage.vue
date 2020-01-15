<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-people"></i> 粉丝管理</el-breadcrumb-item>
                <el-breadcrumb-item>粉丝管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" @click="exportFans">导出粉丝</el-button>
                <div class="fnsku_filter">
                    站点:
                    <el-select v-model="site_filter" class="handle-select">
                        <el-option v-for="item in site_options" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                    ASIN:
                    <el-input style="width:150px" placeholder="请输入ASIN" v-model.trim="search_asin"></el-input>
                    订单号:
                    <el-input style="width:150px" placeholder="请输入订单号" v-model.trim="search_number"></el-input>
                    送测人员:
                    <el-select v-model="user_id_filter" filterable remote :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod" placeholder="选择送测人" class="handle-select">
                        <el-option v-for="item in user_options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_user" ref="infiniteLoading"></infinite-loading>
                    </el-select>
                    申请人员:
                    <el-select v-model="apply_user_id" filterable remote :loading="loading2" @visible-change="selectVisble2" :remote-method="remoteMethod2" placeholder="选择用户" class="handle-select mr10">
                        <el-option v-for="item in user_options2" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_user2" ref="infiniteLoading2"></infinite-loading>
                    </el-select>
                    分类名:
                    <el-select v-model="category_filter" filterable remote :loading="loading4" @visible-change="selectVisble4" :remote-method="remoteMethod4" placeholder="选择分类" class="handle-select mr10">
                        <el-option v-for="item in category_options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_category" ref="infiniteLoading4"></infinite-loading>
                    </el-select>
                    粉丝号:
                    <el-input class="handle-input mr10" placeholder="请输入粉丝号" v-model.trim="search_fan"></el-input>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div>
            </div>
            <br><br>
            <el-table v-loading="table_loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="paypal_account" label="粉丝名称" show-overflow-tooltip>
                </el-table-column>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at">
                </el-table-column>
                <el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at">
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
                                    <el-button @click="handleEdit(scope.$index, scope.row)" type="text">编辑</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
                                </el-dropdown-item> -->
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
                <!-- <el-form-item label="知识产权图片">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item> -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 详情提示 -->
        <el-dialog title="详情" :visible.sync="detailVisible" width="95%">
            <el-table :data="suppliers_details" border style="width: 100%">
                <el-table-column prop="paypal_account" label="粉丝名称" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间">
                </el-table-column>
                <el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at">
                </el-table-column>
            </el-table>
            <br>
            <el-table :data="task_records" border style="width: 100%">
                <el-table-column fixed prop="asin" label="ASIN" width="130" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="keyword" label="关键词" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="order_number" label="订单号" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="pay_type" label="支付类型" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="currency" label="币种" >
                </el-table-column>
                <el-table-column prop="pay_time" label="支付时间" :formatter="formatter_pay_time" width="150">
                </el-table-column>
                <el-table-column prop="pay_price" label="支付价格" >
                </el-table-column>
                <el-table-column prop="commission" label="佣金">
                </el-table-column>
                <el-table-column prop="charge" label="手续费" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="sumPrice" label="总费用" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-button type="warning">{{scope.row.sumPrice}}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="need_refund2" label="是否需要返款" width="95">
                </el-table-column>
                <el-table-column prop="email" label="截图" width="120">
                    <template slot-scope="scope">
                        <el-badge :value="scope.row.img_count" class="item" v-if="scope.row.img_count != 0">
                            <span v-if="scope.row.pictures.length === 0">无</span>
                            <img style="cursor: pointer;" v-else-if="scope.row.pictures[0] != undefined && scope.row.pictures[0].url.thumb.url != null && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.thumb.url" @click="showPictures(scope.$index, scope.row)"/>
                            <span v-else>无</span>
                        </el-badge>
                        <span v-else>无</span>
                    </template>
                </el-table-column>
                <el-table-column prop="refund_time" label="返款时间" :formatter="formatter_refund_time" width="140">
                </el-table-column>
                <el-table-column prop="paypal_account" label="paypal账号" width="85" show-overflow-tooltip>
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
                <el-table-column prop="status" label="状态" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
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
                <el-table-column fixed="right" label="操作"width="100">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    </template>
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

        <!-- 删除产品图片提示 -->
        <el-dialog title="删除图片" :visible.sync="confirmDelProVis" width="35%">
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
            <el-button @click="confirmDelProVis = false">取 消</el-button>
            <el-button type="danger" @click="deleteImg">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 下载提示 -->
        <el-dialog title="下载" :visible.sync="exportVisible" width="35%" @close="closeExport">
            <el-button type="primary"><a style="color:#fff;" :href="$axios.defaults.baseURL + '/fans/export_url?ids=' + exportIds + '&token=' + export_token">下载excel文件</a></el-button>
        </span>
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
                delVisible: false,
                paginationShow: true,
                totals: 0,
                form: {
                    name: '',
                    date: '',
                    address: '',
                },
                idx: -1,
                productVisible: false,
                packageVisible: false,
                img_product: 1,
                pdf_product: 0,
                img_package: 1,
                pdf_package: 0,
                picturesProductList: [],
                picturesPackageList: [],
                supplier_id: undefined,
                confirmDelProVis: false,
                confirmDElPacVis: false,
                picture_id: undefined,
                submitDisabled: false,
                checkVisible: false,
                suppliers_details: [],
                detailVisible: false,
                fileList: [],
                picturestList: [],
                productVisible: false,
                search_fan: '',
                task_records: [],
                export_token: '',
                exportIds: [],
                exportVisible: false,
                picturestList: [],
                picturestList2: [],
                picturestList3: [],
                table_loading: true,
                category_filter: '',
                category_options: [],
                category_page: 1,
                category_total: 0,
                query4: undefined,
                loading4: false,
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
                site_options: ['US', 'UK', 'DE', 'JP', 'CA'],
                site_filter: '',
                search_asin: '',
                search_number: ''
            }
        },
        created() {
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
                this.$axios.get( '/fans?page='+this.cur_page + '&p_account=' + this.search_fan + '&category_id=' + this.category_filter + '&user_id=' + this.user_id_filter + '&asin=' + this.search_asin + '&order_number=' + this.search_number + '&country=' + this.site_filter + '&apply_user_id=' + this.apply_user_id
                ).then((res) => {
                    if(res.data.code == 200) {
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
                this.$axios.get( '/fans?page='+this.cur_page + '&p_account=' + this.search_fan + '&category_id=' + this.category_filter + '&user_id=' + this.user_id_filter + '&asin=' + this.search_asin + '&order_number=' + this.search_number + '&country=' + this.site_filter + '&apply_user_id=' + this.apply_user_id
                ).then((res) => {
                    if(res.data.code == 200) {
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
                this.search_fan = '', this.category_filter = '', this.user_id_filter = '', this.search_asin = ''
                this.search_number = '', this.site_filter = '', this.apply_user_id = ''
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
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
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
                // let formData = new FormData()
                // formData.append('brand_name', this.form.brand_name)
                // formData.append('product_category', this.form.product_category)
                // formData.append('website', this.form.website)
                // formData.append('brand_type', this.form.brand_type)
                // formData.append('remark', this.form.remark)
                // this.fileList.forEach((item) => {
                //     formData.append('logo[]', item.raw)
                // })
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
            // 确定删除
            deleteRow(){
            	let index = this.idx
            	const item = this.tableData[index];
            	this.form = {
            		id: item.id
            	}
            	this.$axios.delete('/intellectual_properties/'+this.form.id, 
            ).then((res) => {
            	if(res.data.code == 200){
            		this.tableData.splice(this.idx, 1)
            		this.getData()
            		this.$message.success("删除成功")           		
            	}
            }).catch((res) => {
            	this.$message.error("删除失败")
            })
                this.delVisible = false;
            },
            handleDetails(index, row) {
                this.$axios.get('/fans/' + row.id
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.suppliers_details = [res.data.data]
                        this.task_records = res.data.data.task_records
                        this.task_records.forEach((data) => {
                            data.img_count = data.pictures.length
                            data.sumPrice = parseFloat((Number(data.charge) + Number(data.commission) + Number(data.pay_price)).toPrecision(12))
                            if (String(data.need_refund) == 'true') {
                                data.need_refund2 = '是'
                            } else if(String(data.need_refund) == 'false'){
                                data.need_refund2 = '否'
                            }
                        })
                        this.detailVisible = true
                    }
                }).catch((res) => {

                })
            },
            changeFile(file) {
                this.fileList.push(file)
            },
            handleRemove(a, b) {
                this.fileList = b
            },
            closeProduct() {
                this.productVisible = false
                this.picturestList = []
            },
            handleDeletePic(index, row) {
                this.picture_id = row.id
                this.idx = index;
                this.confirmDelProVis = true;
            },
            deleteImg() {
                let params = {
                    id: this.product_id,
                    img_id: this.picture_id
                }
                this.$axios.post('/intellectual_properties/delete_img', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.picturestList.splice(this.idx, 1);
                        this.getData()
                        this.$message.success("删除成功")
                        this.confirmDelProVis = false
                    }
                }).catch((res) => {

                })
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
            exportFans() {
                if(this.multipleSelection.length == 0) {
                    this.$message.error('请至少选择一条数据')
                    return
                }
                this.multipleSelection.forEach((data) => {
                    this.exportIds.push(data.id)
                })
                this.export_token = localStorage.getItem('token')
                this.exportVisible = true
            },
            closeExport() {
                this.exportVisible = false
                this.exportIds = []
                this.$refs.multipleTable.clearSelection()
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
            onInfinite_category(obj) {
                if((this.category_page * 20) < this.category_total) {
                    this.category_page += 1
                    // this.getUsers(obj.loaded)
                    this.remoteMethod4(this.query4,obj.loaded)
                } else {
                    obj.complete()
                }
            },
            selectVisble4(visible) {
                if(visible) {
                    this.query4 = undefined
                    this.remoteMethod4("")
                }
            },
            remoteMethod4(query, callback = undefined) {
                if(query != "" || this.query4 != "" || callback) {
                    let reload = false
                    if(this.query4 != query) {
                        this.loading4 = true
                        this.category_page = 1
                        this.query4 = query
                        reload = true
                        if(this.$refs.infiniteLoading4.isComplete) {
                            this.$refs.infiniteLoading4.stateChanger.reset()
                        }
                    }
                    this.$axios.get("/categories/?page=" + this.category_page + '&query=' + query.trim()
                    ).then((res) => {
                        if(res.data.code == 200) {
                            this.loading4 = false
                            //                          this.options = res.data.data
                            if(reload) {
                                let tempOptions = []
                                this.category_options = tempOptions.concat(res.data.data)
                            } else {
                                this.category_options = this.category_options.concat(res.data.data)
                            }
                            this.category_total = res.data.count
                            if(callback) {
                                callback()
                            }
                        }
                    }).catch((res) => {
                        console.log('失败')
                    })
                }
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
</style>
