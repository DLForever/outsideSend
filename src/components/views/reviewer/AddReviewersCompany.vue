<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-lx-goods"></i> 公司测评管理</el-breadcrumb-item>
				<el-breadcrumb-item>新建测评任务</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="新建测评任务" name="first">
					<div class="form-box">
						<el-form ref="form" :rules="rules" :model="form" label-width="110px">
							<el-form-item label="Asin" prop="asin">
								<el-input v-model.trim="form.asin"></el-input>
							</el-form-item>
							<el-form-item label="SKU">
								<el-input v-model.trim="form.sku"></el-input>
							</el-form-item>
							<el-form-item label="站点" prop="site">
								<el-select v-model="form.site">
									<el-option v-for="item in site_options" :key="item" :label="item" :value="item"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="产品名称" prop="name">
								<el-input v-model="form.name"></el-input>
							</el-form-item>
							<el-form-item label="价格" prop="price">
								<el-input v-model.trim="form.price"></el-input>
							</el-form-item>
							<el-form-item label="店铺" prop="shopname">
								<el-input v-model="form.shopname"></el-input>
							</el-form-item>
							<el-form-item label="产品链接" prop="website">
								<el-input v-model.trim="form.website" placeholder="需加入https://或http://前缀"></el-input>
							</el-form-item>
							<el-form-item label="关键词/位置">
								<table >
									<tbody v-for="(p,index) in keywordsArr">
										<td>
											<el-input style="margin-bottom: 5px;" v-model="p.keywords" placeholder="请输入关键词"></el-input>
										</td>
										&nbsp&nbsp
										<td>
											<el-input style="margin-bottom: 5px;" v-model="p.keyword_index" placeholder="请输入关键词位置"></el-input>
										</td>
										<div v-if="index ==  0" style="margin-left: 10px; margin-top: 10px; font-size: 0px">
											<i style="margin-right: 5px;  font-size: 15px;cursor: pointer;" class="el-icon-circle-plus" @click="keywordsAdd(index)"></i>
											<i style="font-size: 15px;cursor: pointer;" class="el-icon-remove" @click="keywordsDel(index)" v-if="keywordsArr.length >1"></i>
										</div>
									</tbody>
								</table>
							</el-form-item>
							<el-form-item label="日期/每日次数">
								<table >
									<tbody v-for="(p,index) in date_time">
										<td>
											<el-date-picker style="margin-right: 10px; margin-bottom: 5px;" v-model="p.date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
										</td>
										<td>
											<el-input-number style="margin-bottom: 5px;" v-model="p.time" :min="0" label="描述文字"></el-input-number>
										</td>
										<div v-if="index ==  0" style="margin-left: 10px; margin-top: 10px; font-size: 0px">
											<i style="margin-right: 5px;  font-size: 15px;cursor: pointer;" class="el-icon-circle-plus" @click="orderAdd(index)"></i>
											<i style="font-size: 15px;cursor: pointer;" class="el-icon-remove" @click="orderDel(index)" v-if="date_time.length >1"></i>
										</div>
									</tbody>
								</table>
							</el-form-item>
							<el-form-item label="备注">
								<el-input v-model="form.remark"></el-input>
							</el-form-item>
							<el-form-item label="产品广告位图片">
								<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								</el-upload>
							</el-form-item>
							<el-form-item label="产品无logo非产品主图图片">
								<el-upload class="upload-demo" drag action="" :file-list="fileList2" :on-remove="handleRemove2" :auto-upload="false" :on-change="changeFile2" :limit="5" multiple>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								</el-upload>
							</el-form-item>
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
					asin: '',
					name: '',
					site: '',
					adposition: '',
					website: '',
					shopname: '',
					price: '',
					remark: '',
					sku: ''
				},
				rules: {
					name: [{
						required: true,
						message: '请输入产品名称',
						trigger: 'blur'
					}],
					price: [{
						required: true,
						message: '请输入价格',
						trigger: 'blur'
					}],
					asin: [{
						required: true,
						message: '请输入asin',
						trigger: 'blur'
					}],
					site: [{
						required: true,
						message: '请输入站点',
						trigger: 'blur'
					}],
					keywords: [{
						required: true,
						message: '请输入关键词',
						trigger: 'blur'
					}],
					adposition: [{
						required: true,
						message: '请输入关键词位置',
						trigger: 'blur'
					}],
					shopname: [{
						required: true,
						message: '请输入店铺',
						trigger: 'blur'
					}],
					website: [{
						required: true,
						message: '请输入链接',
						trigger: 'blur'
					}],
				},
				radio: undefined,
				category_id: [],
				options: [],
				cur_page: 1,
				date_time: [{
					date: '',
					time: 0
				}],
				add_date_time: {
					date: '',
					time: 0
				},
				keywordsArr: [{
					keywords: '',
					keyword_index: ''
				}],
				add_keywords: {
					keywords: '',
					keyword_index: ''
				},
				site_options: ['US', 'UK', 'DE', 'JP', 'CA']
			}
		},
		beforeRouteEnter: (to, from, next) => {
			console.log('Hi,i am comming')
			next()
		},
		created() {
            // this.getData();
        },
        props:{
			getMessageCount:Function
		},
		methods: {
			getData() {
                if (process.env.NODE_ENV === 'development') {
                };
                this.$axios.get( '/tasks?page='+this.cur_page
                ).then((res) => {
                    if(res.data.code == 200) {

                    }
                }).catch((res) => {
                	console.log('error')
                })
            },
			submitUpload(content) {
				this.formData = new FormData();
				formData.append('file', content.file)
			},
			onSubmit(formName) {
				let tempkeywords = []
				let tempkeyword_index = []
				this.keywordsArr.forEach((data) => {
					if (data.keywords.trim() != '' && data.keyword_index.trim() != '') {
						tempkeywords.push(data.keywords)
						tempkeyword_index.push(data.keyword_index)
					}
				})
				// if(this.form.password == '' || this.form.name == '' || this.form.username == '') {
				// 	this.$message.error('请填写必填信息')
				// 	return
				// }
				// let arr = []
				// arr.push(this.form.length, this.form.width, this.form.height, this.form.weight, this.form.price, this.form.package_length, this.form.package_width, this.form.package_height, this.form.package_weight)
				// if(this.judge_addproduct(arr)){
				// }else{
				// 	return
				// }
				let formData = new FormData()
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.submitDisabled = true
						formData.append('task[asin]', this.form.asin)
						formData.append('task[country]', this.form.site)
						formData.append('task[name]', this.form.name)
						formData.append('task[url]', this.form.website)
						formData.append('task[shopname]', this.form.shopname)
						formData.append('task[price]', this.form.price)
						formData.append('task[keywords]', String(tempkeywords))
						formData.append('task[keyword_index]', String(tempkeyword_index))
						formData.append('task[remark]', this.form.remark)
						formData.append('task[sku]', this.form.sku)
						this.date_time.forEach((data) => {
							formData.append('task[plan_date][]', data.date)
							formData.append('task[plan_sum][]', data.time)
						})
						this.fileList.forEach((item) => {
							formData.append('picture_adv[]', item.raw)
						})
						this.fileList2.forEach((item) => {
							formData.append('picture_fb[]', item.raw)
						})
						this.$axios.post('/tasks', formData).then((res) => {
							if(res.data.code == 200) {
								this.$message.success('提交成功！')
								this.$refs['form'].resetFields()
								this.$router.push('/reviewersmanage')
								this.getMessageCount()
							}
						}).catch((res) => {
							console.log(res)
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
			changeFile2(file) {
				this.fileList2.push(file)
			},
			handleRemove2(a, b) {
				this.fileList2 = b
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
			},
			orderAdd() {
				this.date_time.push(this.add_date_time)
				this.add_date_time = {
					date: '',
					time: 0
				}
			},
			orderDel(index) {
				this.date_time.pop()
			},
			keywordsAdd() {
				this.keywordsArr.push(this.add_keywords)
				this.add_keywords = {
					keywords: '',
					keyword_index: ''
				}
			},
			keywordsDel(index) {
				this.keywordsArr.pop()
			},
		}
	}
</script>