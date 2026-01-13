<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :validate-on-rule-change="false"
    >
      <el-form-item label="车牌号" prop="carId">
        <el-select v-model="formData.carId" placeholder="请选择" clearable style="width: 80%">
          <el-option
            v-for="item in carInfoList"
            :key="item.id"
            :label="item.carNumber"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="加油时间" prop="fuelTime">
        <el-date-picker
          v-model="formData.fuelTime"
          type="date"
          placeholder="请选择加油时间"
          clearable
          style="width: 80%"
        />
      </el-form-item>
      <el-form-item label="加油量" prop="fuelCharge">
        <el-input-number
          v-model="formData.fuelCharge"
          placeholder="请输入加油量"
          clearable
          style="width: 80%"
        />
      </el-form-item>
      <el-form-item label="加油金额" prop="money">
        <el-input-number
          v-model="formData.money"
          placeholder="请输入加油金额"
          clearable
          style="width: 80%"
        />
      </el-form-item>
      <el-form-item label="油价" prop="unitPrice">
        <el-input-number
          v-model="formData.unitPrice"
          placeholder="请输入油价"
          clearable
          style="width: 80%"
        />
      </el-form-item>
      <el-form-item label="车表里程数" prop="mileage">
        <el-input-number
          v-model="formData.mileage"
          placeholder="请输入车表里程数"
          clearable
          style="width: 80%"
        />
      </el-form-item>
      <span>旧车表里程数： {{ formData.oldMileage }}</span>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { CarFuelApi, CarFuel } from '@/api/core/carinfo/carFuel'
import { CarInfoApi, CarInfo } from '@/api/core/carinfo'

/** 车辆信息 表单 */
defineOptions({ name: 'CarFuelForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const carInfoList = ref<CarInfo[]>([]) // 车辆信息列表
const formData = ref<Partial<CarFuel>>({
  id: undefined,
  carId: undefined,
  carNumber: undefined,
  fuelTime: undefined,
  fuelCharge: undefined,
  money: undefined,
  unitPrice: undefined,
  mileage: undefined
})
// 自定义校验：车表里程数不能小于选择的车辆的车表里程数
const validateMileage = (_rule: any, value: any, callback: any) => {
  // 如果值为空，直接通过（required 规则会处理空值校验）
  if (value === undefined || value === null || value === '') {
    callback()
    return
  }
  // 如果没有选择车辆，直接通过
  if (!formData.value.carId) {
    callback()
    return
  }
  const selectedCar = carInfoList.value.find((car) => car.id === formData.value.carId)
  if (selectedCar && selectedCar.mileage !== undefined && selectedCar.mileage !== null) {
    if (value <= selectedCar.mileage) {
      callback(new Error(`输入的车表里程数不能小于车辆的车表里程数(${selectedCar.mileage})`))
      return
    }
  }
  callback()
}

// 自定义 required 校验，对数字类型更友好（0 也是有效值）
const validateRequired = (fieldName: string) => {
  return (_rule: any, value: any, callback: any) => {
    // 对于数字类型，0 也是有效值，只有 undefined、null 或空字符串才认为是空
    if (value === undefined || value === null || value === '') {
      callback(new Error(`${fieldName}不能为空`))
    } else {
      callback()
    }
  }
}

const formRules = reactive({
  carNumber: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
  fuelTime: [{ required: true, message: '加油时间不能为空', trigger: 'blur' }],
  fuelCharge: [{ validator: validateRequired('加油量'), trigger: 'blur' }],
  money: [{ validator: validateRequired('加油金额'), trigger: 'blur' }],
  unitPrice: [{ validator: validateRequired('油价'), trigger: 'blur' }],
  mileage: [
    { validator: validateRequired('车表里程数'), trigger: 'blur' },
    { validator: validateMileage, trigger: 'blur' }
  ]
})
const formRef = ref() // 表单 Ref

// 监听车辆选择变化，重新校验车表里程数，并将车辆的mileage放入oldMileage
watch(
  () => formData.value.carId,
  (newCarId) => {
    // 当选择车辆后，将选中车辆的mileage放入formData.oldMileage
    if (newCarId) {
      const selectedCar = carInfoList.value.find((car) => car.id === newCarId)
      if (selectedCar && selectedCar.mileage !== undefined && selectedCar.mileage !== null) {
        formData.value.oldMileage = selectedCar.mileage
      }
    } else {
      // 如果清空选择，也清空oldMileage
      formData.value.oldMileage = undefined
    }
    // 只有在有车表里程数值时才触发校验，避免初始化时触发
    if (formData.value.mileage !== undefined && formData.value.mileage !== null) {
      formRef.value?.validateField('mileage')
    }
  }
)

// 监听弹窗打开状态，在弹窗打开后清除校验
watch(
  () => dialogVisible.value,
  async (newVal) => {
    if (newVal) {
      // 弹窗打开后，等待 DOM 更新，然后清除校验
      await nextTick()
      await nextTick()
      formRef.value?.clearValidate()
    }
  }
)

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  // 获取车辆信息列表
  await getCarInfoList()
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await CarFuelApi.getCarFuel(id)
      // 等待弹窗完全打开
      await nextTick()
      // 设置数据
      formData.value = data
      // 多次等待 DOM 更新，确保所有组件都已渲染完成
      await nextTick()
      // 清除所有校验状态，避免数据加载时触发校验
      formRef.value?.clearValidate()
      // 使用 setTimeout 确保在下一个事件循环中再次清除校验
      setTimeout(() => {
        formRef.value?.clearValidate()
      }, 100)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 根据选择的车辆ID，设置车牌号
  if (formData.value.carId) {
    const selectedCar = carInfoList.value.find((car) => car.id === formData.value.carId)
    if (selectedCar && selectedCar.carNumber) {
      formData.value.carNumber = selectedCar.carNumber
      formData.value.oldMileage = selectedCar.mileage
    }
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CarFuel
    if (formType.value === 'create') {
      await CarFuelApi.createCarFuel(data)
      message.success(t('common.createSuccess'))
    } else {
      await CarFuelApi.updateCarFuel(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    carId: undefined,
    carNumber: undefined,
    fuelTime: undefined,
    fuelCharge: undefined,
    money: undefined,
    unitPrice: undefined,
    mileage: undefined
  }
  // 清除表单校验状态，避免初始化时显示错误
  formRef.value?.resetFields()
  formRef.value?.clearValidate()
}

/** 获取车辆信息列表 */
const getCarInfoList = async () => {
  try {
    const data = await CarInfoApi.getCarInfoList({})
    carInfoList.value = data
  } catch (error) {
    console.error(error)
  }
}
</script>
