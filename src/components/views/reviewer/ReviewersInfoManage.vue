<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-goods"></i> 测评管理</el-breadcrumb-item>
                <el-breadcrumb-item>测评任务管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <template v-if="isRestrict === 'false'">
                    <el-button  type="warning" @click="handleComRes">佣金/本金</el-button>
                    <el-button  type="primary" @click="exportReviewers">导出记录</el-button>
                    <span style="margin-left: 20px;" v-if="multipleSelection.length != 0">共选择了{{multipleSelection.length}} 条数据</span>
                </template>
                <div style="float: right;">
                    <template v-if="search_show[0].dateDis">
                        <!-- 日期: -->
                        <el-date-picker class="mr10" v-model="date_filter" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2" unlink-panels value-format="yyyy-MM-dd"></el-date-picker>
                    </template>
                    <el-select class="mr10" v-model="search_selects" multiple placeholder="展示其他搜索栏目" @change="showSearch">
                        <el-option v-for="item in isRestrict === 'false'?search_options:search_options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div>
                <div class="fnsku_filter">
                    <template v-if="search_show[1].fanDis">
                        粉丝号:
                        <el-input style="width:150px" placeholder="请输入粉丝号" v-model.trim="search_fan"></el-input>
                    </template>
                    产品名称:
                    <el-input style="width:150px;" v-model.trim="filter_name" placeholder="请输入产品名称"></el-input>
                    <template v-if="search_show[2].shopDis">
                        店铺:
                        <el-input style="width:130px;" v-model.trim="filter_shopname" placeholder="请输入店铺名称"></el-input>
                    </template>
                    站点:
                    <el-select v-model="site_filter" class="handle-select">
                        <el-option v-for="item in site_options" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                    ASIN:
                    <el-input style="width:150px" placeholder="请输入ASIN" v-model.trim="search_asin"></el-input>
                    订单号:
                    <el-input style="width:150px" placeholder="请输入订单号" v-model.trim="search_number"></el-input>
                    <template v-if="search_show[3].userDis">
                        送测人员:
                        <el-select v-model="user_id_filter" filterable remote :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod" placeholder="选择送测人" class="handle-select">
                            <el-option v-for="item in user_options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            <infinite-loading :on-infinite="onInfinite_user" ref="infiniteLoading"></infinite-loading>
                        </el-select>
                    </template>
                    <template v-if="search_show[4].applyuserDis">
                        申请人员:
                        <el-select v-model="apply_user_id" filterable remote :loading="loading2" @visible-change="selectVisble2" :remote-method="remoteMethod2" placeholder="选择用户" class="handle-select mr10">
                            <el-option v-for="item in user_options2" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            <infinite-loading :on-infinite="onInfinite_user2" ref="infiniteLoading2"></infinite-loading>
                        </el-select>
                    </template>
                    状态:
                    <el-select v-model="statusSelect" placeholder="请选择" class="handle-select mr10">
                        <el-option v-for="item in isRestrict === 'false'?statusOptions:statusOptions2" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </div>
            </div>
            <br><br>
            <el-table v-loading="table_loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column fixed prop="asin" label="ASIN" width="130" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="apply_username" label="申请人" width="70" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="order_number" label="订单号" show-overflow-tooltip>
                </el-table-column>
                <template v-if="isRestrict === 'false'">
                    <el-table-column  prop="plan_date" label="计划日期" width="90">
                    </el-table-column>
                    <el-table-column prop="keyword" label="关键词" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column prop="pay_type" label="支付类型" width="70">
                    </el-table-column>
                    <el-table-column prop="currency" label="币种" width="45">
                    </el-table-column>
                    <el-table-column key="3" prop="pay_price" label="本金" width="65">
                    </el-table-column>
                    <template v-if="filter_refund">
                        <el-table-column key="4" prop="charge" label="手续费" show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column key="5" prop="sumPrice" label="总费用" show-overflow-tooltip>
                        </el-table-column>
                    </template>
                    <template v-if="filter_commission">
                        <el-table-column key="3" prop="commission" label="佣金" show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column key="4" prop="commission_charge" label="佣金手续费" show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column key="5" prop="sumPrice" label="总费用" show-overflow-tooltip>
                        </el-table-column>
                    </template>
                    <el-table-column prop="need_refund2" label="是否需要返款" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <el-tag type="warning" v-if="scope.row.need_refund2 == '是'">是</el-tag>
                            <el-tag type="success" v-else-if="scope.row.need_refund2 == '否'">否</el-tag>
                        </template>
                    </el-table-column>
                </template>
                <el-table-column prop="pay_time" label="支付时间" :formatter="formatter_pay_time" width="140">
                </el-table-column>
                <template v-if="isRestrict === 'false'">
                    <el-table-column prop="refund_time" label="返款时间" :formatter="formatter_refund_time" width="140">
                    </el-table-column>
                </template>
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
                <el-table-column prop="feedback" label="反馈" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                </el-table-column>
                <template v-if="isRestrict === 'false'">
                    <el-table-column prop="paypal_account" label="paypal账号" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column prop="profile_url" label="亚马逊profile url" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <a v-if="scope.row.profile_url != null && scope.row.profile_url != '' && scope.row.profile_url != 'null'" :href="scope.row.profile_url" target="_blank">查看链接</a>
                        </template>
                    </el-table-column>
                    <el-table-column prop="facebook_url" label="fackbook url" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <a v-if="scope.row.facebook_url != null && scope.row.facebook_url != '' && scope.row.facebook_url != 'null'" :href="scope.row.facebook_url" target="_blank">查看链接</a>
                        </template>
                    </el-table-column>
                </template>
                <!-- <el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
                </el-table-column>
                <el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
                </el-table-column> -->
                <el-table-column label="操作" width="100" fixed="right">
                    <template slot-scope="scope">
                        <el-dropdown>
                            <el-button type="primary">
                                操作<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <template v-if="isRestrict === 'false'">
                                    <el-dropdown-item>
                                        <el-button @click="handleDetails(scope.$index, scope.row)" type="text">详情</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button @click="handleDone(scope.$index, scope.row)" type="text">完成评论</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button @click="handleDoneRefund(scope.$index, scope.row)" type="text">完成返款</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button @click="handleAddRefund(scope.$index, scope.row)" type="text">添加返款</el-button>
                                    </el-dropdown-item>
                                    <!-- <el-dropdown-item>
                                        <el-button @click="handleComRes(scope.$index, scope.row)" type="text">佣金/本金</el-button>
                                    </el-dropdown-item> -->
                                </template>
                                <el-dropdown-item>
                                    <el-button @click="handleFeedback(scope.$index, scope.row)" type="text">问题反馈</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="handleCheckFeedback(scope.$index, scope.row)" type="text">审核反馈</el-button>
                                </el-dropdown-item>
                                <!-- <el-dropdown-item>
                                    <el-button @click="showPictures(scope.$index, scope.row)" type="text">图片</el-button>
                                </el-dropdown-item> -->
                                <template v-if="isRestrict === 'false'">
                                    <el-dropdown-item>
                                        <el-button @click="handleEdit(scope.$index, scope.row)" type="text">编辑</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
                                    </el-dropdown-item>
                                </template>
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

        <!-- 完成弹出框 -->
        <el-dialog title="完成测评" :visible.sync="doneVisible" width="50%">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="评论截图">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <template v-if="form.status == '1'">
                    <el-form-item label="是否需要返款" prop="isPay">
                        <el-radio v-model="form.need_refund" label="1">是</el-radio>
                        <el-radio v-model="form.need_refund" label="0">否</el-radio>
                    </el-form-item>
                </template>
                <template v-if="form.need_refund=='1'">
                    <el-form-item label="是否完全返款">
                        <el-radio v-model="form.done_direct" label="1">是</el-radio>
                        <el-radio v-model="form.done_direct" label="0">否</el-radio>
                    </el-form-item>
                </template>
                <!-- <template v-if="form.status == '6'">
                    <el-form-item label="佣金">
                        <el-input-number v-model="form.commission" :min="0"></el-input-number>
                    </el-form-item>
                </template> -->
                <!-- <el-form-item label="佣金">
                    <el-input-number v-model="form.commission" :min="0"></el-input-number>
                </el-form-item> -->
                <el-form-item label="返款时间" prop="pay_time">
                    <el-date-picker style="margin-right: 10px; margin-bottom: 5px;" v-model="form.refund_time" type="datetime" placeholder="选择日期" ></el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="doneVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveDone" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 更新送测记录 -->
        <el-dialog title="添加送测信息" :visible.sync="updatereviewerVisible" width="50%">
            <el-form ref="addReviewerForm" :rules="rules" :model="addReviewerForm" label-width="130px">
                <el-form-item label="ASIN" prop="asin">
                    <span>{{addReviewerForm.asin}}</span>
                </el-form-item>
                <el-form-item label="关键词">
                    <span>{{addReviewerForm.keyword}}</span>
                    <!-- <el-input v-model="addReviewerForm.keyword"></el-input> -->
                    <!-- <el-select v-model="addReviewerForm.keyword">
                        <el-option v-for="item in keyword_options" :key="item" :label="item" :value="item"></el-option>
                    </el-select> -->
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
                    <el-date-picker style="margin-right: 10px; margin-bottom: 5px;" v-model="addReviewerForm.pay_time" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
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
                <el-form-item label="是否需要返款" prop="isPay">
                    <el-radio v-model="addReviewerForm.isPay" label="1">是</el-radio>
                    <el-radio v-model="addReviewerForm.isPay" label="0">否</el-radio>
                </el-form-item>
                <template v-if="addReviewerForm.isPay == '1'">
                    <el-form-item label="是否完全返款">
                        <el-radio v-model="addReviewerForm.done_direct" label="1">是</el-radio>
                        <el-radio v-model="addReviewerForm.done_direct" label="0">否</el-radio>
                    </el-form-item>
                </template>
                <el-form-item label="亚马逊profile url">
                    <el-input v-model="addReviewerForm.profile_url"></el-input>
                </el-form-item>
                 <el-form-item label="备注">
                    <el-input v-model="addReviewerForm.remark"></el-input>
                </el-form-item>
                <el-form-item label="评论截图">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="退款截图">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList2" :on-remove="handleRemove2" :auto-upload="false" :on-change="changeFile2" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <!-- <el-form-item label="总费用">
                    <el-button type="warning">{{sumPrice}}</el-button>
                </el-form-item> -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updatereviewerVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveReviewer('addReviewerForm')" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加失败反馈信息 -->
        <el-dialog title="失败反馈信息" :visible.sync="feedbackVisible" width="50%">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="反馈截图">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList3" :on-remove="handleRemove3" :auto-upload="false" :on-change="changeFile3" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="问题反馈" required>
                    <el-input v-model="form.feedback"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="feedbackVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveFeedback" :disabled="submitDisabled">确 定</el-button>
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
            <el-table :data="review_details" border style="width: 100%">
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
                <el-table-column prop="commission_charge" label="佣金手续费" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="charge" label="手续费" show-overflow-tooltip>
                </el-table-column>
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
                <el-table-column prop="email" label="截图" width="120">
                    <template slot-scope="scope">
                        <el-badge :value="scope.row.img_count" class="item" v-if="scope.row.img_count != 0">
                            <span v-if="scope.row.pictures.length === 0">无</span>
                            <img v-else-if="scope.row.pictures[0] != undefined && scope.row.pictures[0].url.thumb.url != null && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.thumb.url"/>
                            <span v-else>无</span>
                        </el-badge>
                        <span v-else>无</span>
                    </template>
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
                <el-table-column prop="status" label="状态" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
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

        <!-- 查看产品图片 -->
        <el-dialog title="测评截图" :visible.sync="productVisible" width="70%">
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList.length != 0">
                <span>评论截图</span>
                <el-carousel-item v-for="(item, index) in picturestList" :key="index">
                    <img class="img_carousel" @click="handleDeletePic(item.remark, item.id, index)" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <br>
            <!-- <template v-if="isRestrict === 'false'"> -->
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList2.length != 0">
                <span class="demonstration">退款截图</span>
                <el-carousel-item v-for="(item, index) in picturestList2" :key="index">
                    <img class="img_carousel" @click="handleDeletePic(item.remark, item.id, index)" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <!-- </template> -->
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList3.length != 0">
                <span class="demonstration">反馈截图</span>
                <el-carousel-item v-for="(item, index) in picturestList3" :key="index">
                    <img class="img_carousel" @click="handleDeletePic(item.remark, item.id, index)" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList4.length != 0">
                <span class="demonstration">佣金截图</span>
                <el-carousel-item v-for="(item, index) in picturestList4" :key="index">
                    <img class="img_carousel" @click="handleDeletePic(item.remark, item.id, index)" :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <el-carousel height="600px" arrow="always" :autoplay="false" v-if="picturestList5.length != 0">
                <span class="demonstration">定金/佣金截图</span>
                <el-carousel-item v-for="(item, index) in picturestList5" :key="index">
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

        <!-- 返款弹出框 -->
        <el-dialog title="返款" :visible.sync="refundVisible" width="60%" @close="closeRefund">
            <mavon-editor ref="md" @imgAdd="$imgAdd" @imgDel="$imgDel" style="min-height: 100px"/>
            <br><br>
            <el-form ref="form" :model="form" label-width="100px">
                <!-- <el-form-item label="退款截图">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList2" :on-remove="handleRemove2" :auto-upload="false" :on-change="changeFile2" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item> -->
                <el-form-item label="备注">
                    <el-input v-model="form.remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="refundVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRefund" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加返款弹出框 -->
        <el-dialog title="添加返款" :visible.sync="addrefundVisible" width="60%" @close="closeRefund2">
            <mavon-editor ref="md2" @imgAdd="$imgAdd" @imgDel="$imgDel" style="min-height: 100px"/>
            <!-- <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="退款截图">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList4" :on-remove="handleRemove4" :auto-upload="false" :on-change="changeFile4" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
            </el-form> -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addrefundVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveaddRefund" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 下载提示 -->
        <el-dialog title="下载" :visible.sync="exportVisible" width="35%" @close="closeExport">
            <el-button type="primary"><a style="color:#fff;" :href="$axios.defaults.baseURL + '/task_records/export_url?ids=' + exportIds + '&token=' + export_token">下载excel文件</a></el-button>
        </span>
        </el-dialog>

        <!-- 审核反馈弹出框 -->
        <el-dialog title="审核反馈" :visible.sync="checkVisible" width="60%">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="是否通过" >
                    <el-radio v-model="isProblem" label="1">是</el-radio>
                    <el-radio v-model="isProblem" label="0">否</el-radio>
                </el-form-item>
                <template v-if="isProblem == '0'">
                    <el-form-item label="变更状态">
                        <el-select v-model="checkStatus" placeholder="请选择" class="handle-select mr10">
                            <el-option v-for="item in checkOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="checkVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveCheck" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 佣金/定金 -->
        <el-dialog title="佣金/本金" :visible.sync="comResVisible" width="60%">
            <el-table :data="pay_details" border style="width: 100%">
                <el-table-column fixed prop="apply_username" label="申请人" width="130" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="plan_date" label="计划日期" width="90">
                </el-table-column>
                <el-table-column prop="keyword" label="关键词" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="order_number" label="订单号" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="order_number" label="佣金" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.is_pay_commission" :disabled="scope.row.is_commission">是否收取</el-checkbox>
                    </template>
                </el-table-column>
                <el-table-column prop="order_number" label="定金" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.is_pay_capital" :disabled="scope.row.is_capital">是否收取</el-checkbox>
                    </template>
                </el-table-column>
            </el-table>
            <br>
            <el-form ref="form" :model="form" label-width="50px">
                <!-- <el-form-item label="请选择收取的款项" >
                    <el-radio v-model="comRes" label="1">佣金</el-radio>
                    <el-radio v-model="comRes" label="0">本金</el-radio>
                </el-form-item> -->
                <!-- <el-form-item v-if="comRes === '1'" label="佣金">
                    <el-input-number v-model="customer_commission" :min="0"></el-input-number>
                </el-form-item> -->
                <el-form-item label="图片">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="comResVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveComRes" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import VueInfiniteLoading from "vue-infinite-loading"
    import { mavonEditor } from 'mavon-editor'
    import 'mavon-editor/dist/css/index.css'
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
                    remark: '',
                    feedback: '',
                    id: '',
                    need_refund: '',
                    refund_time: '',
                    done_direct: '',
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
                review_details: [],
                detailVisible: false,
                fileList: [],
                picturestList: [],
                search_keyword: '',
                feedbackVisible: false,
                status: '',
                statusOptions: [{value: 1, label: '正在进行中'}, {value: 2, label: '需返款'}, {value: 3, label: '已完成'}, {value: 5, label: '失败'}, {value: 6, label: '等待评论'}, {value: 7, label: '需返佣金'}, {value: 8, label: '反馈待审核'}],
                statusOptions2: [{value: '1,2,6,7,8', label: '正在进行中'},  {value: 3, label: '已完成'}, {value: 5, label: '失败'}],
                statusSelect: '',
                user_id_filter: '',
                query: undefined,
                user_page: 1,
                user_total: 0,
                loading: false,
                user_options: [],
                task_id: '',
                fileList2: [],
                fan_id: '',
                picturestList2: [],
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
                    isPay: '',
                    remark: '',
                    poundage: 0
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
                },
                doneVisible: false,
                updatereviewerVisible: false,
                refundVisible: false,
                fileList3: [],
                picturestList3: [],
                search_fan: '',
                search_number: '',
                search_asin: '',
                addrefundVisible: false,
                fileList4: [],
                sumPrice: 0,
                pickerOptions2: {
                shortcuts: [{
                  text: '最近一周',
                  onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                  }
                }, {
                  text: '最近一个月',
                  onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                  }
                }, {
                  text: '最近三个月',
                  onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                  }
                }]
              },
              date_filter: [],
              export_token: '',
              exportIds: [],
              exportVisible: false,
              paytype_options: ['PayPal', '微信'],
              currency_options: ['美金', '英镑', '欧元', '日元'],
              keyword_options: [],
              search_options: [{value: 'fanDis', label: '粉丝号'}, {value: 'shopDis', label: '店铺名'}, {value: 'userDis', label: '送测人'}, {value: 'applyuserDis', label: '申请人'}, {value: 'dateDis', label: '日期'}],
              search_options2: [{value: 'shopDis', label: '店铺名'},{value: 'dateDis', label: '日期'}],
              search_selects: [],
              search_show: [{'dateDis' : false}, {'fanDis' : false}, {'shopDis' : false}, {'userDis' : false}, {'applyuserDis' : false}],
              search_show2: ['dateDis', 'fanDis', 'shopDis', 'userDis', 'applyuserDis'],
              site_options: ['US', 'UK', 'DE', 'JP'],
              site_filter: '',
              filter_name: '',
              filter_shopname: '',
              filter_refund: false,
              filter_commission: false,
              table_loading: true,
              checkOptions: [{value: '1', label: '正在进行中'}, {value: 2, label: '需返款'}, {value: 3, label: '已完成'}, {value: 6, label: '等待评论'}, {value: 7, label: '需返佣金'}],
              checkStatus: '',
              checkVisible: false,
              isProblem: '',
              isRestrict: '',
              comResVisible: false,
              comRes: '',
              remark: '',
              customer_commission: 0,
              picturestList4: [],
              picturestList5: [],
              apply_user_id: '',
              query2: undefined,
              user_page2: 1,
              user_total2: 0,
              loading2: false,
              user_options2: [],
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
                if (!this.$route.params.task_id) {
                    this.$route.params.task_id = ''
                }
                let date_begin_temp = this.date_filter[0]
                let date_end_temp = this.date_filter[1]
                if(this.date_filter.length == 0) {
                    date_begin_temp = ''
                    date_end_temp = ''
                }
                let tempStatus = ''
                if (this.statusSelect === '1,2,6,7,8') {
                    tempStatus = '&status[]=1&status[]=2&status[]=6&status[]=7&status[]=8'
                } else {
                    tempStatus = '&status=' + this.statusSelect
                }
                this.$axios.get( '/task_records?page='+this.cur_page + tempStatus + '&fan_id=' + this.fan_id + '&user_id=' + this.user_id_filter + '&task_id=' + this.$route.params.task_id + '&asin=' + this.search_asin + '&number=' + this.search_number + '&p_account=' + this.search_fan + '&date_begin=' + date_begin_temp +'&date_end=' + date_end_temp + '&country=' + this.site_filter + '&shopname=' + this.filter_shopname + '&product_name=' + this.filter_name + '&apply_user_id=' + this.apply_user_id
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            if (String(data.need_refund) == 'true') {
                                data.need_refund2 = '是'
                            } else if(String(data.need_refund) == 'false'){
                                data.need_refund2 = '否'
                            }
                            data.sumPrice2 = parseFloat((Number(data.charge) + Number(data.commission) + Number(data.commission_charge) + Number(data.pay_price)).toPrecision(12))
                            if(this.statusSelect == 2) {
                                data.sumPrice = parseFloat((Number(data.charge) + Number(data.pay_price)).toPrecision(12))
                            } else if (this.statusSelect == 7) {
                                data.sumPrice = parseFloat((Number(data.commission_charge) + Number(data.commission)).toPrecision(12))
                            }
                            data.pay_records.forEach((data2) => {
                                data.pictures.push(data2.pictures[0])
                            })
                            data.img_count = data.pictures.length
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
                if (!this.$route.params.task_id) {
                    this.$route.params.task_id = ''
                }
                let date_begin_temp = this.date_filter[0]
                let date_end_temp = this.date_filter[1]
                if(this.date_filter.length == 0) {
                    date_begin_temp = ''
                    date_end_temp = ''
                }
                let tempStatus = ''
                if (this.statusSelect === '1,2,6,7,8') {
                    tempStatus = '&status[]=1&status[]=2&status[]=6&status[]=7&status[]=8'
                } else {
                    tempStatus = '&status=' + this.statusSelect
                }
                this.$axios.get( '/task_records?page='+this.cur_page + tempStatus + '&fan_id=' + this.fan_id + '&user_id=' + this.user_id_filter + '&task_id=' + this.$route.params.task_id + '&asin=' + this.search_asin + '&number=' + this.search_number + '&p_account=' + this.search_fan + '&date_begin=' + date_begin_temp +'&date_end=' + date_end_temp + '&country=' + this.site_filter + '&shopname=' + this.filter_shopname + '&product_name=' + this.filter_name + '&apply_user_id=' + this.apply_user_id
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                            if (String(data.need_refund) == 'true') {
                                data.need_refund2 = '是'
                            } else if(String(data.need_refund) == 'false'){
                                data.need_refund2 = '否'
                            }
                            data.sumPrice2 = parseFloat((Number(data.charge) + Number(data.commission) + Number(data.commission_charge) + Number(data.pay_price)).toPrecision(12))
                            if(this.statusSelect == 2) {
                                data.sumPrice = parseFloat((Number(data.charge) + Number(data.pay_price)).toPrecision(12))
                            } else if (this.statusSelect == 7) {
                                data.sumPrice = parseFloat((Number(data.commission_charge) + Number(data.commission)).toPrecision(12))
                            }
                            data.pay_records.forEach((data2) => {
                                data.pictures.push(data2.pictures[0])
                            })
                            data.img_count = data.pictures.length
                        })
                        if(this.statusSelect == 2) {
                            this.filter_refund = true
                            this.filter_commission = false
                        } else if(this.statusSelect == 7) {
                            this.filter_refund = false
                            this.filter_commission = true
                        } else {
                            this.filter_refund = false
                            this.filter_commission = false
                        }
                        this.tableData = res.data.data
                        this.totals = res.data.count
                    }
                    this.paginationShow = true
                }).catch((res) => {
                    console.log(res)
                }).finally(() => {
                    this.table_loading = false
                })
            },
            clear_filter() {
                this.paginationShow = false
                this.cur_page = 1
                this.statusSelect = ''
                this.user_id_filter = ''
                this.search_number = ''
                this.search_asin = ''
                this.search_fan = ''
                this.date_filter = []
                this.site_filter = ''
                this.filter_name = ''
                this.filter_shopname = ''
                this.filter_refund = false
                this.filter_commission = false
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
            formatter_refund_time(row, column) {
                if (row.refund_time != null) {
                    return row.refund_time.substr(0, 19);
                }else {
                    return
                }
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
            handleDone(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    id: item.id,
                    status: item.status,
                    commission: 0
                }
                this.remark = ''
                this.fileList = []
                // this.fileList2 = []
                this.doneVisible = true;
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
            saveDone() {
                if(this.form.status == '1') {
                    if (this.form.need_refund == '' || this.form.need_refund == undefined) {
                        this.$message.error('请选择是否需要返款')
                        return
                    }
                    if (this.form.need_refund == '1' && this.form.done_direct == undefined) {
                        this.$message.error('请选择是否完全返款')
                        return
                    }
                }
                if(this.form.status == '6') {

                }
                if(this.form.refund_time == undefined) {
                    this.$message.error('请选择返款时间')
                    return
                }
                this.submitDisabled = true
                let formData = new FormData()
                formData.append('remark', this.remark)
                formData.append('need_refund', this.form.need_refund)
                formData.append('refund_time', this.form.refund_time)
                if(this.form.done_direct != undefined) {
                    formData.append('done_direct', this.form.done_direct)
                }
                this.fileList.forEach((item) => {
                    formData.append('picture_review[]', item.raw)
                })
                this.$axios.post('/task_records/' + this.form.id + '/done_review', formData).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('完成评论！')
                        this.getData()
                        this.doneVisible = false
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
            	this.$axios.delete('/task_records/'+this.form.id, 
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
                this.detailVisible = true
                this.review_details = [row]
                // this.$axios.get('/suppliers/' + row.id, {
                //     headers: {
                //         'Authorization': localStorage.getItem('token')
                //     }
                // }).then((res) => {
                //     if(res.data.code == 200) {
                //         this.suppliers_details = [res.data.data]
                //         this.detailVisible = true
                //     }
                // }).catch((res) => {

                // })
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
            changeFile3(file) {
                this.fileList3.push(file)
            },
            handleRemove3(a, b) {
                this.fileList3 = b
            },
            changeFile4(file) {
                this.fileList4.push(file)
            },
            handleRemove4(a, b) {
                this.fileList4 = b
            },
            showPictures(index, row) {
                this.picturestList = []
                this.picturestList2 = []
                this.picturestList3 = []
                this.picturestList4 = []
                this.picturestList5 = []
                this.product_id = row.id
                const item = this.tableData[index]
                item.pictures.forEach((data) => {
                    if (data.remark == 'review') {
                        this.picturestList.push(data)
                    } else if (data.remark == 'refund'){
                        this.picturestList2.push(data)
                    } else if (data.remark == 'commission'){
                        this.picturestList4.push(data)
                    } else if (data.remark == 'capital'){
                        this.picturestList5.push(data)
                    } else {
                        this.picturestList3.push(data)
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
                this.$axios.post('/task_records/' + this.product_id + '/delete_img', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        if (this.remark == 'review') {
                            this.picturestList.splice(this.idx, 1)
                        } else if (this.remark == 'refund') {
                            this.picturestList2.splice(this.idx, 1)
                        } else if (this.remark == 'commission') {
                            this.picturestList4.splice(this.idx, 1)
                        } else if (this.remark == 'capital') {
                            this.picturestList5.splice(this.idx, 1)
                        } else{
                            this.picturestList3.splice(this.idx, 1)
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
            handleFeedback(index, row) {
                this.form.id = row.id
                this.form.feedback = ''
                this.feedbackVisible = true
            },
            saveFeedback() {
                if(this.form.feedback.trim() == '') {
                    this.$message.error('请输入反馈内容')
                    return
                }
                let formData = new FormData()
                formData.append('feedback', this.form.feedback)
                this.fileList3.forEach((item) => {
                    formData.append('picture_feedback[]', item.raw)
                })
                this.$axios.post('/task_records/' + this.form.id + '/done_failure', formData
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        this.$message.success("反馈成功!")
                        this.feedbackVisible = false
                    }
                }).catch((res) => {

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
            handleEdit(index, row) {
                this.idx = row.id
                const item = this.tableData[index]
                // this.keyword_options = row.keyword.split(',')
                this.addReviewerForm = {
                    task_period_id: item.task_period_id,
                    task_id: item.task_id,
                    asin: item.asin,
                    keyword: item.keyword,
                    order_number: item.order_number,
                    pay_type: item.pay_type,
                    currency: item.currency,
                    pay_time: item.pay_time,
                    pay_price: item.pay_price,
                    commission: item.commission,
                    paypal_account: item.paypal_account,
                    profile_url: item.profile_url,
                    facebook_url: item.facebook_url,
                    isPay: String(item.need_refund),
                    remark: item.remark,
                    poundage: item.charge,
                    done_direct: String(item.done_direct),
                }
                if(this.addReviewerForm.isPay == 'true') {
                    this.addReviewerForm.isPay = '1'
                } else if(this.addReviewerForm.isPay == 'false') {
                    this.addReviewerForm.isPay = '0'
                }
                if(this.addReviewerForm.done_direct == 'true') {
                    this.addReviewerForm.done_direct = '1'
                } else if(this.addReviewerForm.done_direct == 'false') {
                    this.addReviewerForm.done_direct = '0'
                }
                // this.sumPrice = parseFloat((Number(this.addReviewerForm.pay_price) + Number(this.addReviewerForm.commission) + Number(this.addReviewerForm.poundage)).toPrecision(12))
                this.fileList = []
                this.fileList2 = []
                this.updatereviewerVisible = true
            },
            saveReviewer(formName) {
                if (this.addReviewerForm.isPay == 'null') {
                    this.$message.error('请选择是否需要返款')
                    return
                }
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
                        formData.append('task_record[charge]', this.addReviewerForm.poundage)
                        formData.append('task_record[need_refund]', this.addReviewerForm.isPay)
                        formData.append('task_record[paypal_account]', this.addReviewerForm.paypal_account)
                        formData.append('task_record[profile_url]', this.addReviewerForm.profile_url)
                        formData.append('task_record[facebook_url]', this.addReviewerForm.facebook_url)
                        formData.append('task_record[remark]', this.addReviewerForm.remark)
                        formData.append('task_record[task_id]', this.addReviewerForm.task_id)
                        formData.append('task_record[task_period_id]', this.addReviewerForm.task_period_id)
                        formData.append('task_record[done_direct]', this.addReviewerForm.done_direct)
                        this.fileList.forEach((item) => {
                            formData.append('picture_review[]', item.raw)
                        })
                        this.fileList2.forEach((item) => {
                            formData.append('picture_refund[]', item.raw)
                        })
                        this.$axios.patch('/task_records/' + this.idx, formData).then((res) => {
                            if(res.data.code == 200) {
                                this.$message.success('提交成功！')
                                this.$refs[formName].resetFields()
                                this.updatereviewerVisible = false
                                this.getData()
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
            handleDoneRefund(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    id: item.id,
                }
                this.remark = ''
                this.fileList2 = []
                this.refundVisible = true;
            },
            saveRefund() {
                this.submitDisabled = true
                let formData = new FormData()
                formData.append('remark', this.form.remark)
                this.fileList2.forEach((item) => {
                    formData.append('picture_refund[]', item.file)
                })
                this.$axios.post('/task_records/' + this.form.id + '/done_refund', formData).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('完成返款！')
                        this.getData()
                        this.refundVisible = false
                    }
                }).catch((res) => {
                    console.log('err')
                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
            closeRefund() {
                this.$refs.md.removeLine()
                this.$refs.md.$refs.toolbar_left.img_file = []
            },
            closeRefund2() {
                this.$refs.md2.removeLine()
                this.$refs.md2.$refs.toolbar_left.img_file = []
            },
            handleAddRefund(index, row) {
                this.form = {
                    id: row.id,
                }
                this.fileList2 = []
                this.addrefundVisible = true;
            },
            saveaddRefund() {
                this.submitDisabled = true
                let formData = new FormData()
                this.fileList2.forEach((item) => {
                    formData.append('picture_refund[]', item.file)
                })
                this.$axios.post('/task_records/' + this.form.id + '/update_picture', formData).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('完成添加返款！')
                        this.getData()
                        this.$refs.md2.removeLine()
                        this.addrefundVisible = false
                    }
                }).catch((res) => {
                    console.log('err')
                }).finally((res) => {
                    this.submitDisabled = false
                })
            },
            totalPrice() {
                // this.sumPrice = parseFloat((this.addReviewerForm.pay_price + this.addReviewerForm.commission + this.addReviewerForm.poundage).toPrecision(12))
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
            $imgAdd(pos, $file){
                this.fileList2.push({file: $file, index: pos})
            },
            $imgDel(pos) {
                this.fileList2.forEach((data ,index) => {
                    if(data.index == pos[1]) {
                        this.fileList.splice(index, 1)
                    }
                })
            },
            showSearch() {
                this.search_selects.forEach((data) => {
                    let tempIndex = this.search_show2.findIndex(x => x == data)
                    if (tempIndex != -1) {
                        this.search_show[tempIndex][data] = true
                    }
                })
                let tempSelects = this.search_show2.filter(x => !this.search_selects.includes(x))
                tempSelects.forEach((data) => {
                    let tempIndex2 = this.search_show2.findIndex(x => x == data)
                    if (tempIndex2 != -1) {
                        this.search_show[tempIndex2][data] = false
                    }
                })
            },
            handleCheckFeedback(index, row) {
                this.product_id = row.id
                this.checkStatus = ''
                this.isProblem = ''
                this.checkVisible = true
            },
            saveCheck() {
                if (this.isProblem == '') {
                    this.$message.error('请选择是否通过')
                    return false
                }
                this.submitDisabled = true
                let params = {
                    status: this.checkStatus,
                    pass: this.isProblem
                }
                this.$axios.post('/task_records/' + this.product_id + '/process_feedback', params
                ).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        this.$message.success("处理成功")
                        this.checkVisible = false
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
            },
            handleComRes() {
                this.pay_details = []
                this.comRes = '', this.fileList = [], this.remark = ''
                if(this.multipleSelection.length == 0) {
                    this.$message.error('请至少选择一条数据')
                    return
                }
                this.pay_details = JSON.parse(JSON.stringify(this.multipleSelection)) // 深拷贝数组
                this.pay_details.forEach((data) => {
                    if (data.is_pay_commission === true) {
                        data.is_commission = true
                    }
                    if (data.is_pay_capital=== true) {
                        data.is_capital = true
                    }
                })
                this.comResVisible = true
            },
            saveComRes() {
                console.log(this.pay_details)
                this.submitDisabled = true
                let formData = new FormData()
                formData.append('remark', this.remark)
                this.multipleSelection.forEach((data) => {
                    formData.append('ids[]', data.id)
                })
                this.pay_details.forEach((data) => {
                    if (data.is_pay_commission === false && data.is_commission != true) {
                        formData.append('commission[]', 0)
                    } else if(data.is_pay_commission === true && data.is_commission != true) {
                        formData.append('commission[]', 1)
                    } else {
                        formData.append('commission[]', 0)
                    }
                    if (data.is_pay_capital === false && data.is_capital != true) {
                        formData.append('capital[]', 0)
                    } else if(data.is_pay_capital === true && data.is_capital != true) {
                        formData.append('capital[]', 1)
                    } else {
                        formData.append('capital[]', 0)
                    }
                })
                this.fileList.forEach((item) => {
                    formData.append('picture_capital[]', item.raw)
                })
                // let tempUrl = ''
                // if (this.comRes === '1') {
                //     tempUrl = 'done_pay_commission'
                //     formData.append('customer_commission', this.customer_commission)
                //     this.fileList.forEach((item) => {
                //         formData.append('picture_commission[]', item.raw)
                //     })
                // } else if (this.comRes === '0') {
                //     tempUrl = 'done_pay'
                //     this.fileList.forEach((item) => {
                //         formData.append('picture_capital[]', item.raw)
                //     })
                // }
                this.$axios.post('/task_records/done_pay', formData).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('完成！')
                        this.getData()
                        this.comResVisible = false
                    }
                }).catch((res) => {
                    console.log(res)
                }).finally((res) => {
                    this.submitDisabled = false
                })
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
            getStatusName(status, done_direct) {
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
            "infinite-loading": VueInfiniteLoading,
            mavonEditor
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
        clear: both;
        float: right;
        margin: 10px 0px 20px;
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
    .mr10{
        margin-right: 10px;
    }
</style>
