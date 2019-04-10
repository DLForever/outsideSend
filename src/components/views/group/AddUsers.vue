<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-lx-friendadd"></i> 用户管理</el-breadcrumb-item>
				<el-breadcrumb-item>新建用户</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="新建用户" name="first">
					<div class="form-box">
						<el-form ref="form" :rules="rules" :model="form" label-width="110px">
							<el-form-item label="用户名" prop="username">
								<el-input v-model.trim="form.username"></el-input>
							</el-form-item>
							<el-form-item label="密码" prop="password">
								<el-input v-model.trim="form.password"></el-input>
							</el-form-item>
							<el-form-item label="姓名" prop="name">
								<el-input v-model.trim="form.name"></el-input>
							</el-form-item>
							<el-form-item label="是否限制" prop="restrict">
								<el-radio v-model="form.restrict" label="1">是</el-radio>
								<el-radio v-model="form.restrict" label="0">否</el-radio>
							</el-form-item>
							<el-form-item label="邮箱">
								<el-input v-model.trim="form.email"></el-input>
							</el-form-item>
							<el-form-item label="手机号码">
								<el-input v-model.trim="form.phone"></el-input>
							</el-form-item>
							<el-form-item label="性别">
								<el-radio v-model="form.sex" label="true">男</el-radio>
								<el-radio v-model="form.sex" label="false">女</el-radio>
							</el-form-item>
							<el-form-item label="角色">
								<el-select v-model="form.role_ids" multiple placeholder="请选择">
									<el-option v-for="item in roleoptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="权限">
								<el-select v-model="form.policy_ids" multiple placeholder="请选择">
									<el-option v-for="item in policyoptions" :key="item.id" :label="item.desc" :value="item.id"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="备注">
								<el-input v-model.trim="form.remark"></el-input>
							</el-form-item>
							<!-- <el-form-item label="产品图片">
								<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								</el-upload>
							</el-form-item> -->
							<el-form-item>
								<el-button type="primary" @click="onSubmit('form')" :disabled="submitDisabled">新建</el-button>
							</el-form-item>
						</el-form>
					</div>

				</el-tab-pane>
				<!-- <el-tab-pane label="批量上传" name="second">
					<template v-if="message === 'second'">
						<el-form ref="form" :model="form" label-width="100px">
							<el-form-item label="批量上传产品">
								<el-upload class="upload-demo" drag action="" :on-exceed="exceed" :file-list="batchProduct" :on-remove="handleRemoveBatch" :auto-upload="false" :on-change="changeBatch" :before-upload="beforeAvatarUpload" :limit="1">
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
									<div class="el-upload__tip" slot="tip">只能上传xls/xlsx格式文件</div>
								</el-upload>
								<a :href="$axios.defaults.baseURL +'/batch_product.xlsx'">模板下载</a>
							</el-form-item>
						</el-form>
						<el-form ref="form" :model="form" label-width="100px">
							<el-form-item label="批量上传图片">
								<el-upload class="upload-demo" drag action="" :on-exceed="exceed" :file-list="batchImg" :on-remove="handleRemoveImgs" :auto-upload="false" :on-change="changeImgs" :before-upload="beforeAvatarUpload" :limit="1">
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								</el-upload>
								<a :href="$axios.defaults.baseURL +'/batch_product.xlsx'">模板下载</a>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" @click="uploadproduct">上传文件</el-button>
							</el-form-item>
						</el-form>
					</template>
				</el-tab-pane> -->
			</el-tabs>
		</div>
	</div>
</template>

<script>
	export default {
		// name: 'addProduct',
		data: function() {
			return {
				message: 'first',
				submitDisabled: false,
				product_pictures: [],
				fileList: [],
				fileList2: [],
				batchProduct: [],
				batchImg: [],
				form: {
					username: '',
					password: '',
					name: '',
					email: '',
					phone: '',
					sex: '',
					role_ids: [],
					policy_ids: [],
					sex: '',
					remark: '',
					restrict: ''
				},
				rules: {
					username: [{
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					}],
					name: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}],
					restrict: [{
						required: true,
						message: '请选择是否限制',
						trigger: 'blur'
					}],
				},
				radio: undefined,
				category_id: [],
				options: [],
				cur_page: 1,
				roleoptions: [],
				role_ids: [],
				roles_page: 1,
				policyoptions: [],
				policy_ids: []
			}
		},
		beforeRouteEnter: (to, from, next) => {
			next()
		},
		created() {
            this.getRoles()
            this.getPolicies()
        },
		methods: {
			getData() {
                if (process.env.NODE_ENV === 'development') {
                };
                this.$axios.get( '/categories?page='+this.cur_page
                ).then((res) => {
                    if(res.data.code == 200) {
                    	this.options = this.options.concat(this.getCategoryTree(res.data.data,0))
                    }
                    console.log(this.options)
                }).catch((res) => {
                	console.log('error')
                })
            },
            getRoles() {
            	this.$axios.get( '/roles?page='+this.roles_page
                ).then((res) => {
                    if(res.data.code == 200) {
                    	this.roleoptions = res.data.data
                    }
                }).catch((res) => {
                	console.log(res)
                })
            },
            getPolicies() {
            	this.$axios.get( '/policies'
                ).then((res) => {
                    if(res.data.code == 200) {
                    	this.policyoptions = res.data.data
                    }
                }).catch((res) => {
                	console.log(res)
                })
            },
            getCategoryTree(categories,id){
		        let result = []
		        for (var i = 0; i < categories.length; i++){
			       	if(categories[i].parent_id == id || categories[i].parent_id == null){
				        result.push({value:categories[i].id,label:categories[i].name,children:this.getTree(categories,categories[i].id)})
				    }
				}
		        return result
		    },
		    getTree(categories,id){
			   	let tmp =  categories.filter((s) => {
			    	return s.parent_id == id
			   		})
			    return tmp.map((s) => {
			    	return {value:s.id,label:s.name,children:this.getTree(categories,s.id)}
			   })
			},
			submitUpload(content) {
				this.formData = new FormData();
				formData.append('file', content.file)
			},
			onSubmit(formName) {
				if(this.form.password == '' || this.form.name == '' || this.form.username == '') {
					this.$message.error('请填写必填信息')
					return
				}
				// let arr = []
				// arr.push(this.form.length, this.form.width, this.form.height, this.form.weight, this.form.price, this.form.package_length, this.form.package_width, this.form.package_height, this.form.package_weight)
				// if(this.judge_addproduct(arr)){
				// }else{
				// 	return
				// }
				let formData = new FormData()
				console.log(this.$refs[formName].validate())
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.submitDisabled = true
						formData.append('user[username]', this.form.username)
						formData.append('user[password]', this.form.password)
						formData.append('user[name]', this.form.name)
						formData.append('user[email]', this.form.email)
						formData.append('user[phone]', this.form.phone)
						formData.append('user[remark]', this.form.remark)
						formData.append('user[sex]', this.form.sex)
						formData.append('user[restrict]', this.form.restrict)
						this.form.role_ids.forEach((data) => {
							formData.append('role_ids[]', data)
						})
						this.form.policy_ids.forEach((data) => {
							formData.append('policy_ids[]', data)
						})
						this.$axios.post('/users', formData).then((res) => {
							if(res.data.code == 200) {
								this.$message.success('提交成功！')
								this.$refs['form'].resetFields()
								this.$router.push('/usersmanage')
							}
						}).catch((res) => {
							console.log('err')
						}).finally((res) => {
		                    this.submitDisabled = false
		                })
					} else {
						this.$message.error("请填写完整信息")
						return false
					}
				})
			},
			uploadproduct() {
				if(this.batchProduct.length == 0) {
					this.$message.error("请选择xlsx文件")
					return
				}
				const extension = this.batchProduct[0].name.split('.')[1] === 'xls'
				const extension2 = this.batchProduct[0].name.split('.')[1] === 'xlsx'
				const isLt2M = this.batchProduct[0].size / 1024 / 1024 < 10
				if(!extension & !extension2) {
					console.log('上传模板只能是 xls、xlsx格式！')
					this.$message.error('请上传 xls、xlsx格式的文件')
					return
				}
				if(!isLt2M) {
					console.log('上传模板大小不能超过10MB！')
					return
				}
				
				let formData = new FormData()
				console.log(this.batchProduct)
				this.batchProduct.forEach((item) => {
					formData.append('file', item.raw)
				})
				this.$axios.post('/products/batch', formData).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("提交成功")
						this.batchProduct = []
					}
				}).catch((res) => {
					this.$message.error("失败，请核对无误后联系管理员")
				})
			},			
			//上传前对文件的大小进行判断
			beforeAvatarUpload(file) {
				const extension = file.name.split('.')[1] === 'xls'
				const extension2 = file.name.split('.')[1] === 'xlsx'
				const isLt2M = file.size / 1024 / 1024 < 10
				if(!extension & !extension2) {
					console.log('上传模板只能是 xls、xlsx格式！')
					this.$message.error('请上传 xls、xlsx格式的文件')
				}
				if(!isLt2M) {
					console.log('上传模板大小不能超过10MB！')
				}
			},
			uploadError(res, file, FileList) {
				console.log('上传失败，请重试！')
			},
			changeFile(file) {
				this.fileList.push(file)
			},
			handleRemove(a, b) {
				this.fileList = b
			},
			changeImgs(file) {
				this.batchImg.push(file)
			},
			handleRemoveImgs(a, b) {
				this.batchImg = b
			},
			changeBatch(file) {
				this.batchProduct.push(file)
			},
			handleRemoveBatch(a, b) {
				this.batchProduct = b
			},
			exceed() {
				this.$message.error("对不起，超过个数限制")
			}
		}
	}
</script>