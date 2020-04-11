<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-friendadd"></i> 用户管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <!-- <div class="fnsku_filter">
                    开发人员:
                    <el-input style="width:150px" placeholder="请输入开发人员" v-model.trim="search_shopname"></el-input>
                    产品名称:
                    <el-input style="width:150px" placeholder="请输入产品名称" v-model.trim="search_fnsku"></el-input>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div> -->
            </div>
            <br><br>
            <el-table v-loading="table_loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="username" label="用户名" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="name" label="姓名" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="phone" label="电话" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="sex2" label="性别">
                </el-table-column>
                <el-table-column prop="is_company" label="是否员工" width="120">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.is_company == true">是</el-tag>
                        <el-tag type="warning" v-else-if="scope.row.is_company == false">否</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at_format" label="创建时间" sortable width="140">
                </el-table-column>
                <!-- <el-table-column prop="updated_at" label="更新时间" sortable width="140">
                </el-table-column> -->
                <el-table-column prop="remark" label="备注" width="180" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-dropdown>
                            <el-button type="primary">
                                操作<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item>
                                    <el-button @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp编&nbsp&nbsp辑&nbsp&nbsp</el-button>
                                </el-dropdown-item>
                                <!-- <el-dropdown-item>
                                    <el-button @click="handleEditShopCount(scope.$index, scope.row)" type="text">修改店铺数量</el-button>
                                </el-dropdown-item> -->
                                <el-dropdown-item>
                                    <el-button @click="handleEditPolicy(scope.$index, scope.row)" type="text">查看/修改权限</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="handleEditRoles(scope.$index, scope.row)" type="text">查看/修改角色</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp删&nbsp&nbsp除&nbsp&nbsp</el-button>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
            </el-table>
            <div class="pagination">
                <el-pagination v-if="paginationShow" @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="50%" @close="closeEdit">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="姓名">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password"></el-input>
                </el-form-item>
                <el-form-item label="是否限制" prop="restrict">
                    <el-radio v-model="form.restrict" label="1">是</el-radio>
                    <el-radio v-model="form.restrict" label="0">否</el-radio>
                </el-form-item>
                <el-form-item label="是否公司员工" prop="restrict">
                    <el-radio v-model="form.is_company" label="1">是</el-radio>
                    <el-radio v-model="form.is_company" label="0">否</el-radio>
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="form.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号码">
                    <el-input v-model="form.phone"></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio v-model="form.sex" label="true">男</el-radio>
                    <el-radio v-model="form.sex" label="false">女</el-radio>
                </el-form-item>
                 <el-form-item label="备注">
                    <el-input v-model="form.remark"></el-input>
                </el-form-item>
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
        <!-- 修改权限弹出框 -->
        <el-dialog title="修改权限" :visible.sync="editPoliciesVisible" width="50%" @close="closeEdit">
            <el-transfer v-model="policesSelect" :data="policyoptions" :titles="['未有权限', '已有权限']"></el-transfer>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editPoliciesVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEditPolicy" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改角色弹出框 -->
        <el-dialog title="修改角色" :visible.sync="editRolesVisible" width="50%" @close="closeEdit">
            <el-form>
                <el-form-item label="角色">
                    <el-select v-model="rolesSelect" multiple placeholder="请选择">
                        <el-option v-for="item in rolesoptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRolesVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEditRoles" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改店铺数量弹出框 -->
        <el-dialog title="修改店铺数量" :visible.sync="editCountVisible" width="50%">
            <el-form>
                <el-form-item label="店铺数量">
                    <el-input-number v-model.trim="shopCount" :min="0"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCountVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEditShop" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
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
                del_list: [],
                fileList: [],
                fileList2: [],
                is_search: false,
                editVisible: false,
                delVisible: false,
                paginationShow: true,
                search_fnsku: '',
                search_shopname: '',
                totals: 0,
                form: {
                    name: '',
                    date: '',
                    address: '',
                    username: '',
                    name: '',
                    email: '',
                    phone: '',
                    remark: '',
                    sex: '',
                    restrict: '',
                    is_company: ''
                },
                idx: -1,
                picture_id: undefined,
                submitDisabled: false,
                options: [],
                category_id: [],
                policyoptions: [],
                policesSelect: [],
                policesSave: [],
                rolesoptions: [],
                rolesSelect: [],
                rolesSave: [],
                editPoliciesVisible: false,
                roles_page: 1,
                editRolesVisible: false,
                editCountVisible: false,
                shopCount: 0,
                user_id: undefined,
                table_loading: true
            }
        },
        created() {
            this.getData();
            this.getPolicies()
        },
        watch: {
        	"$route": "getData"
        },
        computed: {
            data() {
                return this.tableData.filter((d) => {
                    return d
                    // let is_del = false;
                    // if (!is_del) {
                    //     if ((d.name.indexOf(this.select_word) > -1 ||
                    //             d.fnsku.indexOf(this.select_word) > -1)
                    //     ) {
                    //         return d;
                    //     }
                    // }
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
                this.$axios.get( '/users?page='+this.cur_page
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            if(data.sex) {
                                data.sex2 = '男'
                            }else if(data.sex == false) {
                                data.sex2 = '女'
                            }else {

                            }
                        })
                        this.tableData = res.data.data
                        this.totals = res.data.count
                        this.paginationShow = true
                    }
                }).catch((res) => {
                	console.log(res)
                }).finally(() => {
                    this.table_loading = false
                })
            },
            getRoles() {
                this.rolesoptions = []
                this.$axios.get( '/roles?page='+this.roles_page
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.rolesoptions = res.data.data
                    }
                }).catch((res) => {
                    console.log('error')
                })
            },
            getPolicies() {
                this.policyoptions = []
                this.$axios.get( '/policies'
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            this.policyoptions.push({
                                key: data.id,
                                label: data.desc
                            })
                        })
                        // this.policyoptions = res.data.data
                    }
                }).catch((res) => {
                    console.log('error')
                })
            },
            filter_product() {
                this.cur_page = 1
                this.paginationShow = false
                this.$axios.get( '/products?page='+this.cur_page + '&shopname=' + this.search_shopname + '&fnsku=' + this.search_fnsku
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                        data.size = data.length + '*' + data.width + '*' + data.height
                    })
                        this.tableData = res.data.data
                        this.totals = res.data.count
                    }
                    this.paginationShow = true
                }).catch((res) => {
                    console.log('error')
                })
            },
            clear_filter() {
                this.paginationShow = false
                this.cur_page = 1
                this.search_fnsku = ''
                this.search_shopname = ''
                this.getData()
            },
            formatter_created_at(row, column) {
				return row.created_at.substr(0, 19);
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19);
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
            handleEdit(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    id: item.id,
                    username: item.username == null ? '' : item.username,
                    name: item.name == null ? '' : item.name,
                    email: item.email == null ? '' : item.email,
                    phone: item.phone == null ? '' : item.phone,
                    remark: item.remark == null ? '' : item.remark,
                    sex: String(item.sex),
                    password: '',
                    restrict: String(item.restrict),
                    is_company: (item.is_company) == true ? '1' : '0'
                }
                if (this.form.restrict === 'false') {
                    this.form.restrict = '0'
                } else {
                    this.form.restrict = '1'
                }
                // this.category_id = this.category_id.concat(item.category_id)
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
                let formData = new FormData()
                formData.append('user[username]', this.form.username)
                formData.append('user[password]', this.form.password)
                formData.append('user[name]', this.form.name)
                formData.append('user[email]', this.form.email)
                formData.append('user[phone]', this.form.phone)
                formData.append('user[remark]', this.form.remark)
                formData.append('user[sex]', this.form.sex)
                formData.append('user[restrict]', this.form.restrict)
                formData.append('user[is_company]', (this.form.is_company == true ? '1' : '0'))
                this.$axios.patch('/users/' + this.form.id, formData).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success(res.data.message)
                        this.options = []
                        this.category_id = []
                        this.getData()
                        this.editVisible = false
                    }
                }).catch((res) => {
                    console.log('err')
                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
            closeEdit() {
                this.options = []
                this.category_id = []
                this.editVisible = false
            },
            changeFile(file) {
                this.fileList.push(file)
            },
            handleRemove(a, b) {
                this.fileList = b
            },
            changeFile2(file) {
                this.fileList2.push(file)
            },
            handleRemove2(a, b) {
                this.fileList2 = b
            },
            changeBatch(file) {
                this.batchList.push(file)
            },
            // 确定删除
            deleteRow(){
            	let index = this.idx
            	const item = this.tableData[index];
            	this.form = {
            		id: item.id
            	}
            	this.$axios.delete('/users/'+this.form.id
                	).then((res) => {
                    	if(res.data.code == 200){
                    		this.tableData.splice(this.idx, 1)
                    		this.getData()
                            this.delVisible = false;
                    		this.$message.success(res.data.message)           		
                    	}
                        }).catch((res) => {
                        	this.$message.error("删除失败")
                        })
            },
            handleEditPolicy(index, row) {
                // this.getPolicies()
                this.policesSelect = []
                this.policesSave = []
                this.idx = row.id
                this.$axios.get('/users/' + this.idx
                ).then((res) => {
                    if(res.data.code == 200){
                        res.data.data.policies_list.forEach((data) => {
                            this.policesSelect.push(data.id)
                            this.policesSave.push(data.id)
                        })
                        this.editPoliciesVisible = true
                    }
                }).catch((res) => {
                    this.$message.error('系统异常,请联系管理员')
                    console.log('err')
                })
            },
            saveEditPolicy() {
                let addPolicies = this.policesSave.concat(this.policesSelect).filter(p => !this.policesSave.includes(p))
                let removePolicies = this.policesSave.concat(this.policesSelect).filter(p => !this.policesSelect.includes(p))
                this.submitDisabled = true
                // let formData = new FormData()
                // addPolicies.forEach((data) => {
                //     formData.append('add[]', data)
                // })
                // removePolicies.forEach((data) => {
                //     formData.append('remove[]', data)
                // })
                // formData.append('add', addPolicies)
                // formData.append('remove', removePolicies)
                let params = {
                    add: addPolicies,
                    remove: removePolicies
                }
                this.$axios.post('/users/' + this.idx +'/change_policy', params).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success(res.data.message)
                        this.getData()
                        this.editPoliciesVisible = false
                    }
                }).catch((res) => {
                    console.log(res)
                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
            handleEditRoles(index, row) {
                this.getRoles()
                this.rolesSelect = []
                this.rolesSave = []
                this.idx = row.id
                this.$axios.get('/users/' + this.idx
                ).then((res) => {
                    if(res.data.code == 200){
                        res.data.data.roles.forEach((data) => {
                            this.rolesSelect.push(data.id)
                            this.rolesSave.push(data.id)
                        })
                        this.editRolesVisible = true
                    }
                }).catch((res) => {
                    this.$message.error('系统异常,请联系管理员')
                    console.log('err')
                })
            },
            saveEditRoles() {
                let addRoles = this.rolesSave.concat(this.rolesSelect).filter(p => !this.rolesSave.includes(p))
                let removeRoles = this.rolesSave.concat(this.rolesSelect).filter(p => !this.rolesSelect.includes(p))
                this.submitDisabled = true
                // let formData = new FormData()
                // addPolicies.forEach((data) => {
                //     formData.append('add[]', data)
                // })
                // removePolicies.forEach((data) => {
                //     formData.append('remove[]', data)
                // })
                // formData.append('add', addPolicies)
                // formData.append('remove', removePolicies)
                let params = {
                    add: addRoles,
                    remove: removeRoles
                }
                this.$axios.post('/users/' + this.idx +'/change_role', params).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success(res.data.message)
                        this.getData()
                        this.editRolesVisible = false
                    }
                    this.submitDisabled = false
                }).catch((res) => {
                    this.submitDisabled = false
                    console.log('err')
                })
            },
            handleEditShopCount(index, row) {
                this.user_id = row.id
                this.shopCount = row.shop_sum
                this.editCountVisible = true
            },
            saveEditShop() {
                this.submitDisabled = true
                let params = {
                    sum: this.shopCount
                }
                this.$axios.post('/users/' + this.user_id + '/update_shopsum', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success(res.data.message)
                        this.editCountVisible = false
                        this.getData()
                    }
                }).catch((res) => {

                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
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
        width: 300px;
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
</style>
