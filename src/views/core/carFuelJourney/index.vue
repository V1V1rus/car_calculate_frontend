<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="车牌号" prop="carNumber">
        <el-input v-model="queryParams.carNumber" placeholder="请输入" clearable @keyup.enter="handleQuery" class="!w-240px"/>
      </el-form-item>
      <el-form-item label="用车人" prop="carUserName">
        <el-input v-model="queryParams.carUserName" placeholder="请输入" clearable @keyup.enter="handleQuery" class="!w-240px"/>
      </el-form-item>
      <el-form-item label="用车时间" prop="useDate">
        <el-date-picker v-model="queryParams.useDate" value-format="YYYY-MM-DD" type="daterange"
          start-placeholder="开始日期" end-placeholder="结束日期" class="!w-220px"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery"
          ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button
        >
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="success" plain @click="handleExportJourney" :loading="exportJourneyLoading">
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table row-key="id" v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="序号" align="center" type="index" width="55" fixed="left" />
      <el-table-column prop="carUserName" label="用车人" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column prop="useDate" label="用车时间" min-width="150" align="center" show-overflow-tooltip :formatter="dateFormatter2"/>
      <el-table-column prop="carNumber" label="车牌号" min-width="150" align="center" show-overflow-tooltip fixed="left" />
      <el-table-column prop="place" label="地点" min-width="150" align="center" show-overflow-tooltip/>
      <el-table-column prop="distance" label="距离" min-width="150" align="center" show-overflow-tooltip/>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>


</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import { CarFuelJourneyApi, CarFuelJourney } from '@/api/core/carinfo/carFuelJourney'

import { saveAs } from 'file-saver'

defineOptions({ name: 'CarFuelJourney' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const list = ref<CarFuelJourney[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  carNumber: undefined,
  carUserName: undefined,
  useDate: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CarFuelJourneyApi.getCarFuelJourneyPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}
/** 行程单相关 */
const exportJourneyLoading = ref(false) // 导出行程单加载状态

/** 导出行程单 */
const handleExportJourney = async () => {
  try {
    exportJourneyLoading.value = true
    const data = await CarFuelJourneyApi.exportCarFuelJourney(queryParams)
    const fileName = `行程单.xlsx`
    saveAs(data, fileName)
    message.success('导出行程单成功')
  } catch (error) {
    console.error('导出行程单失败:', error)
  } finally {
    exportJourneyLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
