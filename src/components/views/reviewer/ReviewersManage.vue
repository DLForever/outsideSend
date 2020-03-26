<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-goods"></i> 外单测评管理</el-breadcrumb-item>
                <el-breadcrumb-item>测评任务管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <div>
                <el-button v-if="isRestrict === 'false'" type="primary" @click="confirmDistribute">分配</el-button>
                <el-button type="primary" @click="exportReviewers">部分导出</el-button>
                <el-button  type="warning">
                    <a style="color:#fff;" :href="$axios.defaults.baseURL + '/tasks/export_url?token=' + export_token + '&user_id=' + user_id_filter + '&status=' + statusSelect + '&asin=' + search_asin + '&product_name=' + filter_name + '&apply_user_id=' + apply_user_id + '&self=' + (is_self == true ? 1 : 0) + '&is_company=' + is_company">导出全部</a>
                </el-button>
                <el-button v-if="isRestrict === 'false'" type="success" @click="updateCategory">分类</el-button>
                </div>
                <br>
                <div class="fnsku_filter">
                    <!-- 开发人员:
                    <el-input style="width:150px" placeholder="请输入开发人员" v-model.trim="search_shopname"></el-input> -->
                    产品名:
                    <el-input style="width:150px;" v-model.trim="filter_name" placeholder="请输入产品名称"></el-input>
                    ASIN:
                    <el-input style="width:150px" placeholder="请输入ASIN" v-model.trim="search_asin"></el-input>
                    <template v-if="isRestrict === 'false'">
                        送测人:
                        <el-select v-model="user_id_filter" filterable remote :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod" placeholder="选择用户" class="handle-select mr10">
                            <el-option v-for="item in user_options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            <infinite-loading :on-infinite="onInfinite_user" ref="infiniteLoading"></infinite-loading>
                        </el-select>
                        申请人:
                        <el-select v-model="apply_user_id" filterable remote :loading="loading2" @visible-change="selectVisble2" :remote-method="remoteMethod2" placeholder="选择用户" class="handle-select mr10">
                            <el-option v-for="item in user_options2" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            <infinite-loading :on-infinite="onInfinite_user2" ref="infiniteLoading2"></infinite-loading>
                        </el-select>
                        &nbsp
                        <el-checkbox v-model="is_self" label="被分配" border></el-checkbox>
                        <el-checkbox v-model="weight_filter" label="优先级" border></el-checkbox>
                    </template>
                    状态:
                    <el-select v-model="statusSelect" placeholder="请选择" class="handle-select mr10">
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    
                    <el-button style="margin-left: 5px" @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div>
            </div>
            <br><br>
            <el-table v-loading="table_loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="asin" label="ASIN" width="150" fixed show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="sku" label="SKU" width="150" fixed show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="country" label="站点" width="50">
                </el-table-column>
                <template v-if="isRestrict === 'false'">
                    <el-table-column prop="username" label="送测人" width="140">
                    </el-table-column>
                </template>
                <el-table-column prop="apply_username" label="申请人" width="70">
                </el-table-column>
                <template v-if="isRestrict === 'false'">
                    <el-table-column prop="category_name" label="分类" width="100" show-overflow-tooltip>
                    </el-table-column>
                </template>
                <el-table-column prop="name" label="产品名称" width="100" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="weight" label="优先级" width="70">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.weight | statusFilterWeight">{{getStatusWeight(scope.row.weight)}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="70">
                </el-table-column>
                <el-table-column prop="customer_commission" label="佣金" width="65">
                </el-table-column>
                <el-table-column prop="shopname" label="店铺" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="url" label="url" width="50">
                    <template slot-scope="scope">
                        <a v-if="scope.row.url != null && scope.row.url != '' && scope.row.url != 'null'" :href="scope.row.url" target="_blank">链接</a>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="Review截图" width="115">
                    <template slot-scope="scope">
                        <el-badge :value="scope.row.img_count" class="item" v-if="scope.row.img_count != 0">
                            <span v-if="scope.row.pictures.length === 0">无</span>
                            <img style="cursor: pointer;" v-else-if="scope.row.pictures[0] != undefined && scope.row.pictures[0].url.thumb.url != null && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.thumb.url" @click="showPictures(scope.$index, scope.row)"/>
                            <span v-else>无</span>
                        </el-badge>
                        <span v-else>无</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="115">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
                </el-table-column>
                <!-- <el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
                </el-table-column> -->
                <el-table-column label="操作" width="100" fixed="right">
                    <template slot-scope="scope">
                        <el-dropdown>
                            <el-button type="primary">
                                操作<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item>
                                    <el-button @click="handleDetails(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp详情</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item v-if="isRestrict === 'false'">
                                    <el-button @click="handleCheck(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp审核</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button type="text" @click="handleSetWeight(scope.$index, scope.row)">&nbsp&nbsp&nbsp设置权重
                                    </el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button type="text" @click="toReviewers(scope.$index, scope.row)">查看送测记录
                                        <!-- <router-link to="./reviewersinfomanage"></router-link> -->
                                    </el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button type="text" @click="toReviewersChange(scope.$index, scope.row)">查看变更记录
                                        <!-- <router-link to="./reviewersinfomanage"></router-link> -->
                                    </el-button>
                                </el-dropdown-item>
                                <template v-if="isRestrict === 'false'">
                                    <el-dropdown-item>
                                        <el-button @click="handleRefuse(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp拒绝</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button @click="handlerecover(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp恢复</el-button>
                                    </el-dropdown-item>
                                </template>
                                <!-- <el-dropdown-item>
                                    <el-button @click="showPictures(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp图片</el-button>
                                </el-dropdown-item> -->
                                <el-dropdown-item>
                                    <el-button @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp编辑</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp删除</el-button>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
            </el-table>
            <div class="pagination" v-if="paginationShow && totals != 0">
                <el-pagination  @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-size="pagesize" layout="prev, pager, next" :total="totals" :current-page.sync="cur_page">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="50%">
            <el-form ref="form" :model="form" label-width="110px">
                <el-form-item label="ASIN">
                    <span>{{form.asin}}</span>
                </el-form-item>
                <el-form-item label="SKU">
                    <el-input v-model="form.sku"></el-input>
                </el-form-item>
                <el-form-item label="站点">
                    <el-select v-model="form.country">
                        <el-option v-for="item in site_options" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="价格">
                    <el-input v-model="form.price"></el-input>
                </el-form-item>
                <el-form-item label="url">
                    <el-input v-model="form.url"></el-input>
                </el-form-item>
                <el-form-item label="店铺">
                    <el-input v-model="form.shopname"></el-input>
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
                                <i style="margin-right: 5px;  font-size: 15px" class="el-icon-circle-plus" @click="keywordsAdd(index)"></i>
                                <i style="font-size: 15px" class="el-icon-remove" @click="keywordsDel(index)" v-if="keywordsArr.length >1"></i>
                            </div>
                        </tbody>
                    </table>
                </el-form-item>

                <!-- <el-form-item label="关键词">
                    <el-input v-model="form.keywords"></el-input>
                </el-form-item>
                <el-form-item label="关键词位置">
                    <el-input v-model="form.keyword_index"></el-input>
                </el-form-item> -->
                <!-- <el-form-item label="日期/每日次数">
                    <table >
                        <tbody v-for="(p,index) in date_time">
                            <td>
                                <el-date-picker style="margin-right: 10px; margin-bottom: 5px;" v-model="p.plan_date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                            </td>
                            <td>
                                <el-input-number style="margin-bottom: 5px;" v-model="p.plan_sum" :min="0" label="描述文字"></el-input-number>
                            </td>
                            <div v-if="index ==  0" style="margin-left: 10px; margin-top: 10px; font-size: 0px">
                                <i style="margin-right: 5px;  font-size: 15px" class="el-icon-circle-plus" @click="orderAdd(index)"></i>
                                <i style="font-size: 15px" class="el-icon-remove" @click="orderDel(index)" v-if="date_time.length >1"></i>
                            </div>
                        </tbody>
                    </table>
                </el-form-item> -->
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
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加送测记录 -->
        <el-dialog title="添加送测信息" :visible.sync="addreviewerVisible" width="50%">
            <el-form ref="addReviewerForm" :rules="rules" :model="addReviewerForm" label-width="130px">
                <el-form-item label="ASIN" prop="asin">
                    <!-- <el-input v-model="addReviewerForm.asin"></el-input> -->
                    <span>{{addReviewerForm.asin}}</span>
                </el-form-item>
                <el-form-item label="关键词">
                    <el-select v-model="addReviewerForm.keyword">
                        <el-option v-for="item in keyword_options" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="订单号" prop="order_number">
                    <el-input v-model="addReviewerForm.order_number"></el-input>
                </el-form-item>
                <el-form-item label="支付类型" prop="pay_type">
                    <el-select v-model="addReviewerForm.pay_type">
                        <el-option v-for="item in paytype_options" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="币种" prop="currency">
                    <el-select v-model="addReviewerForm.currency">
                        <el-option v-for="item in currency_options" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="支付时间" prop="pay_time">
                    <el-date-picker style="margin-right: 10px; margin-bottom: 5px;" v-model="addReviewerForm.pay_time" type="datetime" placeholder="选择日期" ></el-date-picker>
                </el-form-item>
                <el-form-item label="支付价格" prop="pay_price">
                    <el-input-number style="margin-bottom: 5px;" v-model="addReviewerForm.pay_price" :min="0" :step="10" @change="totalPrice"></el-input-number>
                </el-form-item>
                <!-- <el-form-item label="佣金" prop="commission">
                    <el-input-number style="margin-bottom: 5px;" v-model="addReviewerForm.commission" :min="0" @change="totalPrice"></el-input-number>
                </el-form-item> -->
                <!-- <el-form-item label="手续费" prop="poundage">
                    <el-input-number style="margin-bottom: 5px;" v-model="addReviewerForm.poundage" :min="0" @change="totalPrice"></el-input-number>
                </el-form-item> -->
                <el-form-item label="paypal账号" prop="paypal_account">
                    <el-input v-model="addReviewerForm.paypal_account"></el-input>
                </el-form-item>
                <el-form-item label="facebook url" prop="facebook_url">
                    <el-input v-model="addReviewerForm.facebook_url"></el-input>
                </el-form-item>
                <!-- <el-form-item label="是否需要返款" prop="isPay">
                    <el-radio v-model="addReviewerForm.isPay" label="true">是</el-radio>
                    <el-radio v-model="addReviewerForm.isPay" label="false">否</el-radio>
                </el-form-item> -->
                <el-form-item label="亚马逊profile url">
                    <el-input v-model="addReviewerForm.profile_url"></el-input>
                </el-form-item>
                <el-form-item label="自费金额" prop="self_pay_price">
                    <el-input-number style="margin-bottom: 5px;" v-model="addReviewerForm.self_pay_price" :min="0" :step="10"></el-input-number>
                </el-form-item>
                <el-form-item label="是否含税" prop="pay_tax">
                    <el-select v-model="addReviewerForm.pay_tax">
                        <el-option v-for="item in pay_tax_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="税前价格" prop="before_tax_price">
                    <el-input-number style="margin-bottom: 5px;" v-model="addReviewerForm.before_tax_price" :min="0" :step="10"></el-input-number>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="addReviewerForm.remark"></el-input>
                </el-form-item>
                <!-- <el-form-item label="总费用">
                    <el-button type="warning">{{sumPrice}}</el-button>
                </el-form-item> -->
                <!-- <el-form-item label="图片">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item> -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addreviewerVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveReviewer('addReviewerForm')" :disabled="submitDisabled">确 定</el-button>
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
        <el-dialog title="详情" :visible.sync="detailVisible" width="90%">
            <el-button :disabled="submitDisabled" v-if="isaddPlan" type="success" size="small" icon="el-icon-circle-check-outline" @click="saveaddplan">确认</el-button>
            <el-button v-else type="primary" @click="isaddPlan=!isaddPlan">增加任务</el-button>
            <template v-if="isaddPlan">
                <el-button type="warning" icon="el-icon-refresh" @click="cancelAddPlan">取消</el-button>
                <el-date-picker style="margin-right: 10px; margin-bottom: 5px; margin-left: 5px;" v-model="plan_date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                <el-input-number style="margin-bottom: 5px;" v-model="plan_sum" :min="0" label="数量"></el-input-number>
            </template>
            <el-button style="float: right;" type="primary" @click="checkSelf">通过自审</el-button>
            <br><br>
            <el-table :data="detailOptions" border style="width: 100%">
                <el-table-column prop="asin" label="ASIN" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="country" label="站点" show-overflow-tooltip>
                </el-table-column>
                <el-table-column v-if="isRestrict === 'false'" prop="username" label="送测人" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="apply_username" label="申请人" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="name" label="产品名称" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="price" label="价格" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="customer_commission" label="佣金" width="70">
                </el-table-column>
                <el-table-column prop="shopname" label="店铺" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="url" label="url" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <a v-if="scope.row.url != null && scope.row.url != '' && scope.row.url != 'null'" :href="scope.row.url" target="_blank">查看链接</a>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="Review截图" width="120">
                    <template slot-scope="scope">
                        <el-badge :value="scope.row.img_count" class="item" v-if="scope.row.img_count != 0">
                            <span v-if="scope.row.pictures.length === 0">无</span>
                            <img  v-else-if="scope.row.pictures[0] != undefined && scope.row.pictures[0].url.thumb.url != null && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.thumb.url"/>
                            <span v-else>无</span>
                        </el-badge>
                        <span v-else>无</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
                </el-table-column>
                <el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
                </el-table-column>
            </el-table>
            <br>
            <el-table v-if="detailOptions3.length != 0" :data="detailOptions3" border style="width: 100%">
                <el-table-column prop="keywords" label="关键词" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="keyword_index" label="关键词位置" show-overflow-tooltip>
                </el-table-column>
            </el-table>
            <br>
            <el-table :data="detailOptions2" border style="width: 100%">
                <el-table-column v-if="isRestrict === 'false'" type="expand">
                    <template slot-scope="scope" >
                        <el-table :data="scope.row.task_period_infos" border style="width: 100%">
                            <el-table-column prop="username" label="送测人" show-overflow-tooltip>
                            </el-table-column>
                            <el-table-column prop="sum" label="数量" show-overflow-tooltip>
                            </el-table-column>
                        </el-table>
                    </template>
                </el-table-column>
                <el-table-column prop="plan_date" label="计划日期" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="查看该日期的变更记录" placement="top">
                            <span class="link-type" @click="toReviewersChange2(scope.$index, scope.row)">{{ scope.row.plan_date }}</span>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column prop="plan_sum" label="计划数量" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <template v-if="scope.row.edit">
                            <el-input-number style="margin-bottom: 5px;" v-model="scope.row.plan_sum" :min="0"></el-input-number>
                            <el-button style="margin-left: 5px" class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)">取消</el-button>
                        </template>
                        <span v-else>{{scope.row.plan_sum}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="start_sum" label="已进行的数量" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="accept_sum" label="接受数量" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <template v-if="scope.row.editAccept">
                            <el-input-number style="margin-bottom: 5px;" v-model="scope.row.accept_sum" :min="0"></el-input-number>
                            <el-button style="margin-left: 5px" class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelEditAccept(scope.row)">取消</el-button>
                        </template>
                        <span v-else>{{scope.row.accept_sum}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" :width="isRestrict === 'false' ? 450 : 200" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <template v-if="!scope.row.editAccept">
                            <el-button v-if="!scope.row.edit && isRestrict === 'false'" @click="handleCreate(scope.$index, scope.row)" :disabled="scope.row.noshow" type="primary" icon="el-icon-plus">添加送测记录</el-button>
                            <el-button v-if="scope.row.edit" @click="saveupdateplan(scope.row)" :disabled="scope.row.noshow" icon="el-icon-circle-check-outline" type="success">确认</el-button>
                            <el-button v-else type="warning" size="small" icon="el-icon-edit" :disabled="scope.row.noshow" @click="scope.row.edit=!scope.row.edit">编辑</el-button>
                            <el-button v-if="!scope.row.edit" icon="el-icon-delete" @click="handleDeletePlan(scope.$index, scope.row)" :disabled="scope.row.noshow" type="danger">删除</el-button>
                        </template>
                        <template v-if="!scope.row.edit && isRestrict === 'false'">
                            <el-button v-if="scope.row.editAccept" @click="saveAccept(scope.row)" :disabled="scope.row.noshow" icon="el-icon-circle-check-outline" type="success">确认</el-button>
                            <el-button v-else type="success" size="small" icon="el-icon-edit" :disabled="scope.row.noshow" @click="scope.row.editAccept=!scope.row.editAccept">处理计划周期</el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <!-- 查看产品图片 -->
        <el-dialog title="图片" :visible.sync="productVisible" width="70%">
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList.length != 0">
                <span>产品广告位图片</span>
                <el-carousel-item v-for="(item, index) in picturestList" :key="index">
                    <img class="img_carousel" @click="handleDeletePic(item.remark, item.id, index)" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <br>
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList2.length != 0">
                <span class="demonstration">无logo非产品主图</span>
                <el-carousel-item v-for="(item, index) in picturestList2" :key="index">
                    <img class="img_carousel" @click="handleDeletePic(item.remark, item.id, index)" :src="$axios.defaults.baseURL+item.url.url" />
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

        <!-- 分配提示 -->
        <el-dialog title="确认分配" :visible.sync="distributeVisible" width="35%">
            <el-form label-width="110px">
                <el-form-item label="选择开发人员">
                    <el-select v-model="distributeUser" placeholder="选择用户" multiple filterable remote :loading="loading3" @visible-change="selectVisble3" :remote-method="remoteMethod3" class="handle-select mr10">
                        <el-option v-for="item in distributeUserOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_dis_user" ref="infiniteLoading3"></infinite-loading>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="distributeVisible = false">取 消</el-button>
            <el-button type="primary" @click="distributenProduct" :disabled="submitDisabled">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 修改计划 -->
        <el-dialog title="修改计划" :visible.sync="updateplanVisible" width="50%">
            <el-form ref="form" :model="form" label-width="110px">
                <el-form-item label="日期/每日次数">
                    <el-input-number style="margin-bottom: 5px;" v-model="plan_sum" :min="0" label="描述文字"></el-input-number>
                    <!-- <table >
                        <tbody v-for="(p,index) in date_time">
                            <td>
                                <el-date-picker style="margin-right: 10px; margin-bottom: 5px;" v-model="p.plan_date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                            </td>
                            <td>
                                <el-input-number style="margin-bottom: 5px;" v-model="p.plan_sum" :min="0" label="描述文字"></el-input-number>
                            </td>
                        </tbody>
                    </table> -->
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateplanVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveupdateplan" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 更新计划 -->
        <el-dialog title="增加计划" :visible.sync="addplanVisible" width="50%">
            <el-form ref="form" :model="form" label-width="110px">
                <el-form-item label="日期/每日次数">
                    <table >
                        <tbody v-for="(p,index) in date_time">
                            <td>
                                <el-date-picker style="margin-right: 10px; margin-bottom: 5px;" v-model="p.plan_date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                            </td>
                            <td>
                                <el-input-number style="margin-bottom: 5px;" v-model="p.plan_sum" :min="0" label="数量"></el-input-number>
                            </td>
                            <!-- <div v-if="index ==  0" style="margin-left: 10px; margin-top: 10px; font-size: 0px">
                                <i style="margin-right: 5px;  font-size: 15px" class="el-icon-circle-plus" @click="orderAdd(index)"></i>
                                <i style="font-size: 15px" class="el-icon-remove" @click="orderDel(index)" v-if="date_time.length >1"></i>
                            </div> -->
                        </tbody>
                    </table>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addplanVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveaddplan" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 审核提示框 -->
        <el-dialog title="审核" :visible.sync="checkVisible" width="50%">
            <el-form label-width="80px">
                <!-- <el-form-item label="请选择收取的款项">
                    <el-radio v-model="isagree" label="1">审核通过</el-radio>
                    <el-radio v-model="isagree" label="0">不通过</el-radio>
                </el-form-item> -->
                <el-form-item label="佣金">
                    <el-input-number v-model="customer_commission" :min="0"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="checkVisible = false">取 消</el-button>
                <!-- <el-button type="warning" @click="saveCheck(0)">拒 绝</el-button> -->
                <el-button type="primary" @click="saveCheck(1)">通 过</el-button>
            </span>
        </el-dialog>
        <!-- 分类提示框 -->
        <el-dialog title="分类" :visible.sync="categoryVisible" width="50%">
            <el-form label-width="80px">
                <el-form-item label="分类名">
                    <el-select v-model="category_filter" filterable remote :loading="loading4" @visible-change="selectVisble4" :remote-method="remoteMethod4" placeholder="选择分类" class="handle-select mr10">
                        <el-option v-for="item in category_options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite_category" ref="infiniteLoading4"></infinite-loading>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="categoryVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveCaterory" :disabled="submitDisabled">提 交</el-button>
            </span>
        </el-dialog>
        <!-- 设置权重提示框 -->
        <el-dialog title="设置权重" :visible.sync="setWeightVisible" width="50%">
            <el-form label-width="80px">
                <el-form-item label="选择权重">
                    <el-select v-model="weight" class="handle-select">
                        <el-option v-for="item in weight_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setWeightVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveSetWeight" :disabled="submitDisabled">提 交</el-button>
            </span>
        </el-dialog>
        <!-- 下载提示 -->
        <el-dialog title="下载" :visible.sync="exportVisible" width="35%" @close="closeExport">
            <el-button type="primary"><a style="color:#fff;" :href="$axios.defaults.baseURL + '/tasks/export_url?ids=' + exportIds + '&token=' + export_token">下载excel文件</a></el-button>
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
                search_keyword: '',
                addreviewerVisible: false,
                status: '',
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
                fileList2: [],
                statusSelect: '',
                statusOptions: [{value: 1, label: '待自审'}, {value: 2, label: '待审核'}, {value: 9, label: '已审核'}, {value: 4, label: '已分配送测人'}, {value: 5, label: '正在进行中'}, {value: 6, label: '已计划完成'}, {value: 7, label: '已完成'}, {value: 8, label: '已拒绝'}],
                picturestList2: [],
                detailOptions: [],
                detailOptions2: [],
                date_time: [{
                    plan_date: '',
                    plan_sum: 0
                }],
                add_date_time: {
                    plan_date: '',
                    plan_sum: 0
                },
                addReviewerForm: {
                    task_period_id: '',
                    task_id: '',
                    asin: '',
                    keyword: '',
                    order_number: '',
                    pay_type: '',
                    currency: '',
                    pay_time: '',
                    pay_price: 0,
                    commission: 0,
                    paypal_account: '',
                    profile_url: '',
                    facebook_url: '',
                    isPay: undefined,
                    remark: '',
                    poundage: 0,
                    self_pay_price: 0,
                    before_tax_price: 0,
                    pay_tax: ''
                },
                rules: {
                    keyword: [{
                        required: true,
                        message: '请输入关键词',
                        trigger: 'blur'
                    }],
                    pay_price: [{
                        required: true,
                        message: '请输入支付价格',
                        trigger: 'blur'
                    }],
                    asin: [{
                        required: true,
                        message: '请输入asin',
                        trigger: 'blur'
                    }],
                    order_number: [{
                        required: true,
                        message: '请输入订单号',
                        trigger: 'blur'
                    }],
                    pay_type: [{
                        required: true,
                        message: '请输入支付类型',
                        trigger: 'blur'
                    }],
                    currency: [{
                        required: true,
                        message: '请输入币种',
                        trigger: 'blur'
                    }],
                    pay_time: [{
                        required: true,
                        message: '请输入支付时间',
                        trigger: 'blur'
                    }],
                    commission: [{
                        required: true,
                        message: '请输入佣金',
                        trigger: 'blur'
                    }],
                    paypal_account: [{
                        required: true,
                        message: '请输入paypal账号',
                        trigger: 'blur'
                    }],
                    poundage: [{
                        required: true,
                        message: '请输入手续费',
                        trigger: 'blur'
                    }],
                    facebook_url: [{
                        required: true,
                        message: '请输入facebook url',
                        trigger: 'blur'
                    }],
                    isPay: [{
                        required: true,
                        message: '请选择是否需要返款',
                        trigger: 'blur'
                    }],
                    self_pay_price: [{
                        required: true,
                        message: '请输入自费金额',
                        trigger: 'blur'
                    }],
                    before_tax_price: [{
                        required: true,
                        message: '请输入税前价格',
                        trigger: 'blur'
                    }],
                    pay_tax: [{
                        required: true,
                        message: '请选择是否含税',
                        trigger: 'blur'
                    }],
                },
                task_id: '',
                distributeUserOptions: [],
                distributeUser: [],
                dis_user_page: 1,
                dis_user_total: 0,
                query3: undefined,
                loading3: false,
                distributeVisible: false,
                updateplanVisible: false,
                addplanVisible: false,
                plan_sum: 0,
                task_period_id: '',
                detailOptions3: [],
                keywordsArr: [{
                    keywords: '',
                    keyword_index: ''
                }],
                add_keywords: {
                    keywords: '',
                    keyword_index: ''
                },
                sumPrice: 0,
                plan_sum: 0,
                plan_date: '',
                isaddPlan: false,
                site_options: ['US', 'UK', 'DE', 'JP', 'CA'],
                paytype_options: ['PayPal', '微信'],
                currency_options: ['美金', '英镑', '欧元', '日元', '加币'],
                keyword_options: [],
                table_loading: true,
                username: '',
                isRestrict: '',
                filter_name: '',
                search_asin: '',
                customer_commission: 0,
                isagree: '',
                export_token: '',
                is_self: '',
                categoryVisible: false,
                category_filter: '',
                category_options: [],
                category_page: 1,
                category_total: 0,
                query4: undefined,
                loading4: false,
                weight: '',
                weight_options: [{value: 0, label: '低'},  {value: 1, label: '正常'}, {value: 2, label: '高'}, {value: 3, label: '紧急'}],
                setWeightVisible: false,
                weight_filter: '',
                pay_tax_options: [{value: 0, label: '否'},  {value: 1, label: '是'}],
                is_company: '',
                exportVisible: false,
                exportIds: []
            }
        },
        created() {
            if (this.$store.getters.isSkip == true) {
                this.cur_page = this.$store.getters.skipPage
            } else {
                this.cur_page = 1
                this.$store.dispatch('setSkipPage', 1)
            }
            this.$store.dispatch('setIsSkip', false)
            this.isRestrict = localStorage.getItem('restrict')
            this.getData();
        },
        watch: {
        	"$route": "getData"
        },
        computed: {
            data() {
                return this.tableData.filter((d) => {
                    let is_del = false;
                    return d
                })
            },
        },
        filters: {
            //类型转换
            statusFilter(status) {
                const statusMap = {
                    1: 'danger',
                    2: 'warning',
                    3: 'danger',
                    4: 'success',
                    5: 'primary',
                    6: 'success',
                    10: 'success',
                    8: 'warning'
                }
                return statusMap[status]
            },
            statusFilterWeight(status) {
                const statusMap = {
                    1: 'primary',
                    2: 'warning',
                    3: 'danger',
                    0: 'success',
                }
                return statusMap[status]
            },
        },
        methods: {
        	handleSizeChange(val) {
        		this.pagesize = val;
        	},
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.$store.dispatch('setSkipPage', this.cur_page)
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                // 开发环境使用 easy-mock 数据，正式环境使用 json 文件
                if (process.env.NODE_ENV === 'development') {
//                  this.url = '/ms/table/list';
                };
                this.export_token = localStorage.getItem('token')
                this.is_company = localStorage.getItem('is_company')
                if (localStorage.getItem('restrict') === 'true') {
                    this.is_company = ''
                } else if (localStorage.getItem('restrict') === 'false' && localStorage.getItem('is_company') === '1') {
                    this.is_company = '0'
                }
                // console.log(this.$store.getters.skipPage)
                this.table_loading = true
                this.$axios.get( '/tasks?page='+this.cur_page + '&status=' + this.statusSelect + '&user_id=' + this.user_id_filter + '&apply_user_id=' + this.apply_user_id + '&asin=' + this.search_asin + '&product_name=' + this.filter_name + '&self=' + (this.is_self == true ? 1 : 0) + '&wight=' + (this.weight_filter == true ? 1 : 0) + '&is_company=' + this.is_company
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            data.img_count = data.pictures.length
                            data.task_periods.forEach((data2) => {
                                data2.originalSum = data2.plan_sum
                                data2.edit = false
                                data2.noshow = false
                                data2.editAccept = false
                                data2.originalaccept = data2.accept_sum
                            })
                            data.username = ''
                            data.operate_users.forEach((data3) => {
                                data.username += data3.username + ','
                            })
                            data.username = data.username.substr(0, data.username.length - 1)
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
            filter_product() {
                this.table_loading = true
                this.cur_page = 1
                this.paginationShow = false
                this.$axios.get( '/tasks?page='+this.cur_page + '&status=' + this.statusSelect + '&user_id=' + this.user_id_filter + '&apply_user_id=' + this.apply_user_id + '&asin=' + this.search_asin + '&product_name=' + this.filter_name + '&self=' + (this.is_self == true ? 1 : 0) + '&wight=' + (this.weight_filter == true ? 1 : 0) + '&is_company=' + this.is_company
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            data.img_count = data.pictures.length
                            data.task_periods.forEach((data2) => {
                                data2.originalSum = data2.plan_sum
                                data2.edit = false
                                data2.noshow = false
                                data2.editAccept = false
                                data2.originalaccept = data2.accept_sum
                            })
                            data.username = ''
                            data.operate_users.forEach((data3) => {
                                data.username += data3.username + ','
                            })
                            data.username = data.username.substr(0, data.username.length - 1)
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
            clear_filter() {
                this.paginationShow = false
                this.cur_page = 1
                this.user_id_filter = ''
                this.apply_user_id = ''
                this.statusSelect = ''
                this.filter_name = '', this.search_asin = '', this.is_self = '', this.weight_filter = ''
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
                this.keywordsArr = []
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    id: item.id,
                    asin: item.asin,
                    country: item.country,
                    name: item.name,
                    url: item.url,
                    shopname: item.shopname,
                    price: item.price,
                    keywords: item.keywords,
                    keyword_index: item.keyword_index,
                    remark: item.remark,
                    sku: item.sku,
                }
                let tempkeywords = item.keywords.split(',')
                let tempkeywordindex = item.keyword_index.split(',')
                if(tempkeywords.length != 0) {
                    tempkeywords.forEach((data, index) => {
                        this.keywordsArr.push({keywords: data, keyword_index: tempkeywordindex[index]})
                    })
                }else {
                    this.keywordsArr = [{
                        keywords: '',
                        keyword_index: ''
                    }]
                }
                this.fileList = []
                this.fileList2 = []
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
                let tempkeywords = []
                let tempkeyword_index = []
                this.keywordsArr.forEach((data) => {
                    if (data.keywords.trim() != '' && data.keyword_index.trim() != '') {
                        tempkeywords.push(data.keywords)
                        tempkeyword_index.push(data.keyword_index)
                    }
                })
                this.submitDisabled = true
                let formData = new FormData()
                formData.append('task[asin]', this.form.asin)
                formData.append('task[country]', this.form.country)
                formData.append('task[name]', this.form.name)
                formData.append('task[url]', this.form.url)
                formData.append('task[shopname]', this.form.shopname)
                formData.append('task[price]', this.form.price)
                formData.append('task[keywords]', String(tempkeywords))
                formData.append('task[keyword_index]', String(tempkeyword_index))
                formData.append('task[remark]', this.form.remark)
                formData.append('task[sku]', this.form.sku)
                this.date_time.forEach((data) => {
                    formData.append('task[plan_date][]', data.plan_date)
                    formData.append('task[plan_sum][]', data.plan_sum)
                })
                this.fileList.forEach((item) => {
                    formData.append('picture_adv[]', item.raw)
                })
                this.fileList2.forEach((item) => {
                    formData.append('picture_fb[]', item.raw)
                })
                this.$axios.patch('/tasks/' + this.form.id, formData).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('更新成功！')
                        this.getData()
                        this.editVisible = false
                    }
                }).catch((res) => {
                    console.log('err')
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
            	this.$axios.delete('/tasks/'+this.form.id, 
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
                this.username = ''
                this.username = row.username
                this.detailOptions3 = []
                if (row.keywords != '' || row.keyword_index != '') {
                    let tempkeywords = row.keywords.split(',')
                    let tempkeywordindex = row.keyword_index.split(',')
                    tempkeywords.forEach((data, index) => {
                        this.detailOptions3.push({keywords: data, keyword_index: tempkeywordindex[index]})
                    })
                } else {
                    this.detailOptions3 = []
                }
                this.keyword_options = row.keywords.split(',')
                this.task_id = row.id
                this.addReviewerForm.asin = row.asin
                this.detailOptions = [row]
                // row.task_periods.forEach((data) => {
                //     data.edit = false
                //     data.originalSum = data.plan_sum
                // })
                this.detailOptions2 = row.task_periods
                this.detailVisible = true
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
            showPictures(index, row) {
                const item = this.tableData[index]
                if (item.pictures.length == 0) {
                    this.$message.info('暂未上传图片!')
                    return
                }
                this.picturestList = []
                this.picturestList2 = []
                this.product_id = row.id
                item.pictures.forEach((data) => {
                    if(data.remark == 'adv') {
                        this.picturestList.push(data)
                    }else {
                        this.picturestList2.push(data)
                    }
                    
                })
                this.productVisible = true;
            },
            handleDeletePic(remark, id, index) {
                this.remark = remark
                this.picture_id = id
                this.idx = index;
                this.confirmDelProVis = true;
            },
            deleteImg() {
                let params = {
                    // id: this.product_id,
                    img_id: this.picture_id
                }
                this.$axios.post('/tasks/' + this.product_id + '/delete_img', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        if (this.remark == 'adv') {
                            this.picturestList.splice(this.idx, 1);
                        } else {
                            this.picturestList2.splice(this.idx, 1);
                        }
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
            handleCreate(index, row) {
                this.addReviewerForm.task_id = row.task_id
                this.addReviewerForm.task_period_id = row.id
                this.addreviewerVisible = true
            },
            saveReviewer(formName) {
                let formData = new FormData()
                this.$refs[formName].validate((valid) => {
                    if(valid) {
                        this.submitDisabled = true
                        formData.append('task_record[asin]', this.addReviewerForm.asin)
                        formData.append('task_record[keyword]', this.addReviewerForm.keyword)
                        formData.append('task_record[order_number]', this.addReviewerForm.order_number)
                        formData.append('task_record[pay_type]', this.addReviewerForm.pay_type)
                        formData.append('task_record[currency]', this.addReviewerForm.currency)
                        formData.append('task_record[pay_time]', this.addReviewerForm.pay_time)
                        formData.append('task_record[pay_price]', this.addReviewerForm.pay_price)
                        // formData.append('task_record[commission]', this.addReviewerForm.commission)
                        // formData.append('task_record[charge]', this.addReviewerForm.poundage)
                        formData.append('task_record[paypal_account]', this.addReviewerForm.paypal_account)
                        formData.append('task_record[profile_url]', this.addReviewerForm.profile_url)
                        formData.append('task_record[facebook_url]', this.addReviewerForm.facebook_url)
                        formData.append('task_record[remark]', this.addReviewerForm.remark)
                        formData.append('task_record[task_id]', this.addReviewerForm.task_id)
                        formData.append('task_record[task_period_id]', this.addReviewerForm.task_period_id)
                        formData.append('task_record[self_pay_price]', this.addReviewerForm.self_pay_price)
                        formData.append('task_record[before_tax_price]', this.addReviewerForm.before_tax_price)
                        formData.append('task_record[pay_tax]', this.addReviewerForm.pay_tax)
                        this.$axios.post('/task_records', formData).then((res) => {
                            if(res.data.code == 200) {
                                this.$message.success('提交成功！')
                                this.$refs[formName].resetFields()
                                this.addReviewerForm.keyword = ''
                                this.getData()
                                this.addreviewerVisible = false
                                this.detailVisible = false
                                // this.$router.push('/reviewersmanage')
                            }
                        }).catch((res) => {
                            console.log('err')
                        }).finally((res) => {
                            this.submitDisabled = false
                        })
                    } else {
                        this.$message.error("请填写完整信息")
                        // return false
                    }
                })
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
            toReviewers(index, row) {
                this.$router.push({name: 'Reviewersinfomanage', params: {task_id: row.id}})
                this.$store.dispatch('setIsSkip', true)
            },
            toReviewersChange(index, row) {
                this.$router.push({name: 'Reviewerschangemanage', params: {task_id: row.id}})
                this.$store.dispatch('setIsSkip', true)
            },
            toReviewersChange2(index, row) {
                this.$router.push({name: 'Reviewerschangemanage', params: {task_period_id: row.id}})
                this.$store.dispatch('setIsSkip', true)
            },
            orderAdd() {
                this.date_time.push(this.add_date_time)
                this.add_date_time = {
                    plan_date: '',
                    plan_sum: 0
                }
            },
            orderDel(index) {
                this.date_time.pop()
            },
            checkSelf() {
                this.$axios.post('/tasks/' + this.task_id + '/check',''
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        this.$message.success("通过自审")
                        this.detailVisible = false
                    }
                }).catch((res) => {

                })
            },
            confirmDistribute() {
                this.distributeUser = []
                this.distributeUserOptions = []
                if(this.multipleSelection.length == 0) {
                    this.$message.error('请选择至少一个任务')
                    return
                }
                let isSingle = ''
                this.multipleSelection.forEach((data) => {
                    if(data.status != 9 && this.multipleSelection.length >= 2) {
                        isSingle = 1
                    }
                    if(data.status == 1 || data.status == 2) {
                        isSingle = 2
                    }
                })
                if(isSingle == 2) {
                    this.$message.error('有任务还未审核，请审核后再分配！')
                    return
                } else if(isSingle == 1) {
                    this.$message.error('已分配送测人的任务，只能单独选择！')
                    return
                }else {

                }
                if(this.multipleSelection.length == 1 && this.multipleSelection[0].operate_users != null) {
                    this.multipleSelection[0].operate_users.forEach((data) => {
                        this.distributeUserOptions.push({id: data.user_id, name: data.username})
                        this.distributeUser.push(data.user_id)
                    })
                }else {
                    this.distributeUser = []
                }
                this.distributeVisible = true
            },
            distributenProduct() {
                if(this.distributeUser.length == 0) {
                    this.$message.error('请选择分配人员')
                    return
                }
                let id = []
                this.multipleSelection.forEach((data) => {
                    id.push(data.id)
                })
                let params = {
                    task_ids: id,
                    user_ids: this.distributeUser,
                }
                this.$axios.post('/tasks/allocate_task', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('分配成功!')
                        this.distributeVisible = false
                        this.distributeUser = []
                        this.getData()
                    }
                }).catch((res) => {

                })
            },
            remoteMethod3(query, callback = undefined) {
                if(query != "" || this.query3 != "" || callback) {
                    let reload = false
                    if(this.query3 != query) {
                        this.loading3 = true
                        this.dis_user_page = 1
                        this.query3 = query
                        reload = true
                        if(this.$refs.infiniteLoading3.isComplete) {
                            this.$refs.infiniteLoading3.stateChanger.reset()
                        }
                    }
                    this.$axios.get("/users/?page=" + this.dis_user_page + '&name=' + query.trim()
                    ).then((res) => {
                        if(res.data.code == 200) {
                            this.loading3 = false
                            //                          this.options = res.data.data
                            if(reload) {
                                let tempOptions = []
                                // this.distributeUserOptions = res.data.data
                                this.distributeUserOptions = tempOptions.concat(res.data.data)
                            } else {
                                this.distributeUserOptions = this.distributeUserOptions.concat(res.data.data)
                            }
                            console.log(this.distributeUserOptions)
                            this.dis_user_total = res.data.count
                            if(callback) {
                                callback()
                            }
                        }
                    }).catch((res) => {
                        console.log('失败')
                    })
                }
            },
            onInfinite_dis_user(obj) {
                if((this.dis_user_page * 20) < this.dis_user_total) {
                    this.dis_user_page += 1
                    this.remoteMethod3(this.query3, obj.loaded)
                    //                  this.getUser(obj.loaded)
                } else {
                    obj.complete()
                }
            },
            selectVisble3(visible) {
                if(visible) {
                    this.query3 = undefined
                    this.remoteMethod3("")
                }
            },
            handleUpdatePlan(index, row) {
                this.plan_sum = row.plan_sum
                this.task_period_id = row.id
                // this.date_time = []
                // this.date_time = JSON.parse(JSON.stringify([row]))
                this.updateplanVisible = true;
            },
            saveupdateplan(row) {
                this.submitDisabled = true
                let params = {
                    task_period_id: row.id,
                    plan_sum: row.plan_sum
                }
                this.$axios.post('/tasks/' + this.task_id + '/update_period', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        if (this.username != null) {
                            row.plan_sum = row.originalSum
                            this.$message.success("请求已提交，等待送测人同意！")
                        } else {
                            row.originalSum = row.plan_sum
                            this.$message.success("更新成功")
                        }
                        row.edit = false
                        // this.updateplanVisible = false
                        // this.detailVisible = false
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
            },
            saveAccept(row) {
                this.submitDisabled = true
                let params = {
                    period_id: row.id,
                    accept_sum: row.accept_sum
                }
                this.$axios.post('/tasks/' + this.task_id + '/process_period', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        row.originalaccept = row.accept_sum
                        this.$message.success("更新成功")
                        row.editAccept = false
                        // this.updateplanVisible = false
                        // this.detailVisible = false
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
            },
            handleAddPlan() {
                this.date_time = [{
                    plan_date: '',
                    plan_sum: 0
                }]
                // this.date_time = JSON.parse(JSON.stringify(row.task_periods))
                this.addplanVisible = true;
            },
            saveaddplan() {
                this.submitDisabled = true
                let params = {
                    plan_date: this.plan_date,
                    plan_sum: this.plan_sum
                }
                this.$axios.post('/tasks/' + this.task_id + '/create_period', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        this.$message.success("增加成功")
                        this.isaddPlan = false
                        this.detailOptions2.push({ plan_sum: this.plan_sum, plan_date: this.plan_date, start_sum: 0, accept_sum: 0,noshow: true})
                        this.plan_sum = 0
                        this.plan_date = ''
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
            },
            closePlan() {
                // this.editVisible = false
                this.getData()
            },
            handleDeletePlan(index, row) {
                this.$prompt('请输入删除备注', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(({value}) => {
                    let params = {
                        task_period_id: row.id,
                        remark: value,
                    }
                    this.$axios.post('/tasks/' + this.task_id + '/delete_period', params
                    ).then((res) => {
                        if(res.data.code == 200) {
                            if (this.username != null) {
                                this.$message.success("请求已提交,等待送测人同意！")
                            } else {
                                this.detailOptions2.splice(index, 1);
                                this.$message.success("已删除")
                            }
                            this.getData()
                            
                        }
                    }).catch(() => {
                        
                    })
                }).catch(() => {
                    this.$message.info('已取消删除')
                })
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
            totalPrice() {
                // this.sumPrice = this.addReviewerForm.pay_price + this.addReviewerForm.commission + this.addReviewerForm.poundage
            },
            cancelEdit(row) {
                row.plan_sum = row.originalSum
                row.edit = false
            },
            cancelEditAccept(row) {
                row.accept_sum = row.originalaccept
                row.editAccept = false
            },
            cancelAddPlan() {
                this.isaddPlan = false
                this.plan_sum = 0
                this.plan_date = ''
            },
            handleRefuse(index, row) {
                this.$prompt('请输入拒绝备注', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(( {value} ) => {
                    let params = {
                        remark: value
                    }
                    this.$axios.post('/tasks/' + row.id + '/reject_task', params
                    ).then((res) => {
                        if(res.data.code == 200) {
                            this.getData()
                            this.$message.success("拒绝成功")
                        }
                    }).catch(() => {
                        
                    })
                }).catch(() => {
                    // this.$message.info('已取消拒绝')
                })
            },
            handleCheck(index, row) {
                this.form.id = row.id
                this.isagree = ''
                this.customer_commission = 0
                this.checkVisible = true
            },
            saveCheck() {
                // if (this.isagree === '') {
                //     this.$message.error('请选择是否通过')
                //     return
                // }
                this.submitDisabled = true
                let params = {
                    customer_commission: this.customer_commission,
                }
                this.$axios.post('/tasks/' + this.form.id + '/manager_check', params).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('处理成功！')
                        this.getData()
                        this.checkVisible = false
                    }
                }).catch((res) => {
                    console.log(res)
                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
            handlerecover(index, row) {
                this.$confirm('恢复该任务, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info'
                }).then(() => {
                    this.$axios.post('/tasks/' + row.id + '/recover_task'
                    ).then((res) => {
                        if(res.data.code == 200) {
                            this.getData()
                            this.$message.success("恢复成功")
                        }
                    }).catch(() => {
                        
                    })
                }).catch(() => {
                })
            },
            // isSelfChange() {
            //     this.is_self = this.is_self == true ? 1 : 0
            // },
            updateCategory() {
                if(this.multipleSelection.length == 0) {
                    this.$message.error('请选择至少一个任务')
                    return
                }
                this.category_filter = ''
                this.categoryVisible = true
            },
            saveCaterory() {
                if(this.category_filter == '') {
                    this.$message.error('请选择分类！')
                    return
                }
                let id = []
                this.multipleSelection.forEach((data) => {
                    id.push(data.id)
                })
                this.submitDisabled = true
                let params = {
                    task_ids: id,
                    category_id: this.category_filter,
                }
                this.$axios.post('/tasks/update_category', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('分类成功!')
                        this.categoryVisible = false
                        this.getData()
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
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
            handleSetWeight(index, row) {
                this.idx = row.id
                this.weight = row.weight
                this.setWeightVisible = true
            },
            saveSetWeight() {
                this.submitDisabled = true
                let params = {
                    weight: this.weight,
                }
                this.$axios.post('/tasks/' + this.idx + '/set_weight', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('设置成功!')
                        this.setWeightVisible = false
                        this.getData()
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
            },
            exportReviewers() {
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
            getStatusName(status) {
                if(status == 1) {
                    return "待自审"
                } else if(status == 2) {
                    return "待审核"
                } else if(status == 3) {
                    return "已删除"
                }else if(status == 4) {
                    return "已分配送测人"
                }else if(status == 5) {
                    return "正在进行中"
                }else if(status == 6) {
                    return "已计划完成"
                }else if(status == 7) {
                    return "已完成"
                }else if(status == 8) {
                    return "已拒绝"
                }else if(status == 9) {
                    return "已审核"
                }else {
                    return '其他'
                }
            },
            getStatusWeight(status) {
                if(status == 0) {
                    return "低"
                } else if(status == 1) {
                    return "正常"
                } else if(status == 2) {
                    return "高"
                }else if(status == 3) {
                    return "紧急"
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
        width:40rem;
        height:40rem;
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
    .link-type,
    .link-type:focus {
      color: #337ab7;
      cursor: pointer;
    }
    .link-type:hover {
        color: rgb(32, 160, 255);
    }
</style>
