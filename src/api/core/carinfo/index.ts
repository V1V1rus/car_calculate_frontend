import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 车辆信息信息 */
export interface CarInfo {
  id: number // 编号
  carNumber?: string // 名字
  mileage?: number // 车表里程数
}

// 车辆信息 API
export const CarInfoApi = {
  // 查询车辆信息分页
  getCarInfoPage: async (params: any) => {
    return await request.get({ url: `/core/car-info/page`, params })
  },

  // 查询车辆信息列表
  getCarInfoList: async (params: any) => {
    return await request.get({ url: `/core/car-info/list`, params })
  },

  // 查询车辆信息详情
  getCarInfo: async (id: number) => {
    return await request.get({ url: `/core/car-info/get?id=` + id })
  },

  // 新增车辆信息
  createCarInfo: async (data: CarInfo) => {
    return await request.post({ url: `/core/car-info/create`, data })
  },

  // 修改车辆信息
  updateCarInfo: async (data: CarInfo) => {
    return await request.put({ url: `/core/car-info/update`, data })
  },

  // 删除车辆信息
  deleteCarInfo: async (id: number) => {
    return await request.delete({ url: `/core/car-info/delete?id=` + id })
  },

  /** 批量删除车辆信息 */
  deleteCarInfoList: async (ids: number[]) => {
    return await request.delete({ url: `/core/car-info/delete-list?ids=${ids.join(',')}` })
  },

  // 导出车辆信息 Excel
  exportCarInfo: async (params) => {
    return await request.download({ url: `/core/car-info/export-excel`, params })
  }
}
