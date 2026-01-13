<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="车牌号" prop="carNumber">
        <el-input
          v-model="queryParams.carNumber"
          placeholder="请输入"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="加油时间" prop="fuelTime">
        <el-date-picker
          v-model="queryParams.fuelTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery"
          ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button
        >
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading">
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button type="danger" plain :disabled="isEmpty(checkedIds)" @click="handleDeleteBatch">
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" fixed="left" />
      <el-table-column label="序号" align="center" type="index" width="55" fixed="left" />
      <el-table-column
        prop="carNumber"
        label="车牌号"
        min-width="150"
        align="center"
        show-overflow-tooltip
        fixed="left"
      />
      <el-table-column
        prop="fuelTime"
        label="加油时间"
        min-width="150"
        align="center"
        show-overflow-tooltip
        :formatter="dateFormatter2"
      />
      <el-table-column
        prop="fuelCharge"
        label="加油量"
        min-width="150"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="money"
        label="加油金额"
        min-width="150"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="unitPrice"
        label="油价"
        min-width="150"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="mileage"
        label="车表里程数"
        min-width="150"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        min-width="150"
      />
      <el-table-column label="操作" align="center" min-width="200px" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.isJourney == 0"
            link
            type="primary"
            @click="createJourney(scope.row.id, scope.row)"
          >
            生成行程单
          </el-button>
          <el-button v-else link type="primary" @click="getJourneyList(scope.row.id, scope.row)">
            查看行程单
          </el-button>
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CarFuelForm ref="formRef" @success="getList" />

  <!-- 行程单列表弹窗 -->
  <Dialog v-model="journeyDialogVisible" title="行程单列表" width="80%">
    <ContentWrap>
      <!-- 显示当前选中的加油记录信息 -->
      <el-descriptions v-if="currentCarFuel" :column="3" border class="mb-20px">
        <el-descriptions-item label="车牌号">{{ currentCarFuel.carNumber }}</el-descriptions-item>
        <el-descriptions-item label="加油时间">
          {{
            currentCarFuel.fuelTime ? formatDate(currentCarFuel.fuelTime as Date, 'YYYY-MM-DD') : ''
          }}
        </el-descriptions-item>
        <el-descriptions-item label="加油量">{{ currentCarFuel.fuelCharge }}</el-descriptions-item>
        <el-descriptions-item label="油价">{{ currentCarFuel.unitPrice }}</el-descriptions-item>
        <el-descriptions-item label="旧车表里程数">{{
          currentCarFuel.oldMileage
        }}</el-descriptions-item>
        <el-descriptions-item label="车表里程数">{{ currentCarFuel.mileage }}</el-descriptions-item>
        <el-descriptions-item label="加油金额">{{ currentCarFuel.money }}</el-descriptions-item>
        <el-descriptions-item label="用车人">{{ currentCarFuel.carUserName }}</el-descriptions-item>
      </el-descriptions>
      <el-table
        v-loading="journeyLoading"
        :data="journeyList"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column label="序号" align="center" type="index" width="55" />
        <el-table-column
          label="地点"
          prop="place"
          min-width="150"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="距离"
          prop="distance"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          :formatter="dateFormatter"
          min-width="150"
        />
      </el-table>
      <!-- 重新生成行程单按钮 -->
      <div class="mt-20px text-center">
        <el-button
          type="primary"
          :loading="journeyLoading"
          @click="handleReCreateJourney"
          v-if="currentCarFuel"
        >
          <Icon icon="ep:refresh" class="mr-5px" /> 重新生成行程单
        </el-button>
        <el-button
          type="success"
          :loading="exportJourneyLoading"
          @click="handleExportJourney"
          v-if="currentCarFuel"
          class="ml-10px"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出行程单
        </el-button>
      </div>
    </ContentWrap>
  </Dialog>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter, dateFormatter2, formatDate } from '@/utils/formatTime'
import { CarFuelApi, CarFuel } from '@/api/core/carinfo/carFuel'
import CarFuelForm from './CarFuelForm.vue'

import { saveAs } from 'file-saver'

defineOptions({ name: 'CarFuel' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<CarFuel[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  carNumber: undefined,
  fuelTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CarFuelApi.getCarFuelPage(queryParams)
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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CarFuelApi.deleteCarFuel(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch (error: any) {}
}

/** 批量删除车辆信息 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await CarFuelApi.deleteCarFuelList(checkedIds.value)
    message.success(t('common.delSuccess'))
    await getList()
  } catch (error: any) {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: CarFuel[]) => {
  checkedIds.value = records.map((item) => item.id)
}

/** 行程单相关 */
const journeyDialogVisible = ref(false) // 行程单弹窗显示状态
const journeyLoading = ref(false) // 行程单列表加载状态
const journeyList = ref<any[]>([]) // 行程单列表数据
const currentCarFuel = ref<CarFuel | null>(null) // 当前选中的加油记录
const exportJourneyLoading = ref(false) // 导出行程单加载状态

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CarFuelApi.exportCarFuel(queryParams)
    saveAs(data, '加油信息.xlsx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const createJourney = async (id: number, row?: CarFuel) => {
  journeyLoading.value = true
  // 保存当前选中的加油记录
  if (row) {
    currentCarFuel.value = row
  }
  await CarFuelApi.createCarFuelJourney({ id: id })
  await getList()
  // 从刷新后的列表中获取最新的数据，更新 currentCarFuel
  const updatedFuel = list.value.find((item) => item.id === id)
  if (updatedFuel) {
    currentCarFuel.value = updatedFuel
  }
  // 刷新行程单列表
  await getJourneyList(id, updatedFuel || currentCarFuel.value || row)
  message.success('生成行程单成功')
}

const getJourneyList = async (id: number, row?: CarFuel) => {
  try {
    journeyLoading.value = true
    // 保存当前选中的加油记录
    if (row) {
      currentCarFuel.value = row
    } else if (!currentCarFuel.value) {
      // 如果没有传入 row，尝试从列表中查找
      const fuel = list.value.find((item) => item.id === id)
      if (fuel) {
        currentCarFuel.value = fuel
      }
    }
    const data = await CarFuelApi.getJourneyList(id)
    journeyList.value = data
    journeyDialogVisible.value = true
  } catch {
  } finally {
    journeyLoading.value = false
  }
}

/** 重新生成行程单 */
const handleReCreateJourney = async () => {
  if (!currentCarFuel.value || !currentCarFuel.value.id) {
    return
  }
  journeyLoading.value = true
  const id = currentCarFuel.value.id
  try {
    // 调用重新生成行程单接口
    await CarFuelApi.reCreateCarFuelJourney({ id: id })
    // 刷新列表以获取最新数据
    await getList()
    // 从刷新后的列表中获取最新的数据，更新 currentCarFuel
    const updatedFuel = list.value.find((item) => item.id === id)
    if (updatedFuel) {
      currentCarFuel.value = updatedFuel
    }
    // 刷新行程单列表
    await getJourneyList(id, updatedFuel || currentCarFuel.value)
    message.success('重新生成行程单成功')
  } catch (error) {
    console.error('重新生成行程单失败:', error)
    // 即使失败，也尝试刷新列表以显示当前状态
    try {
      // 尝试从列表中获取最新数据
      const updatedFuel = list.value.find((item) => item.id === id)
      if (updatedFuel) {
        currentCarFuel.value = updatedFuel
      }
      await getJourneyList(id, updatedFuel || currentCarFuel.value)
    } catch {}
  } finally {
    journeyLoading.value = false
  }
}

/** 导出行程单 */
const handleExportJourney = async () => {
  if (!currentCarFuel.value || !currentCarFuel.value.id) {
    return
  }
  try {
    exportJourneyLoading.value = true
    const id = currentCarFuel.value.id
    const data = await CarFuelApi.exportJourney(id)
    const fileName = `行程单_${currentCarFuel.value.carNumber || '未知'}_${formatDate(currentCarFuel.value.fuelTime as Date, 'YYYY-MM-DD') || ''}.xlsx`
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
