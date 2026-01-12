import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

export interface CarFuel {
  id: number // 编号
  carId?: number // 车辆编号
  carNumber?: string // 车牌号
  fuelTime?: Date // 加油时间
  fuelCharge?: number // 加油量
  money?: number // 加油金额
  unitPrice?: number // 油价
  mileage?: number // 公里数
}

export const CarFuelApi = {
  getCarFuelPage: async (params: any) => {
    return await request.get({ url: `/core/car-fuel/page`, params })
  },

  getCarFuel: async (id: number) => {
    return await request.get({ url: `/core/car-fuel/get?id=` + id })
  },

  createCarFuel: async (data: CarFuel) => {
    return await request.post({ url: `/core/car-fuel/add`, data })
  },

  updateCarFuel: async (data: CarFuel) => {
    return await request.put({ url: `/core/car-fuel/upd`, data })
  },

  deleteCarFuel: async (id: number) => {
    return await request.delete({ url: `/core/car-fuel/delete?id=` + id })
  },

  deleteCarFuelList: async (ids: number[]) => {
    return await request.delete({ url: `/core/car-fuel/delete-list?ids=${ids.join(',')}` })
  },

  exportCarFuel: async (params) => {
    return await request.download({ url: `/core/car-fuel/export-excel`, params })
  }
}
