import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

export interface CarDestination {
  id: number // 编号
  place?: string // 地点
  distance?: number // 距离
}

export const CarDestinationApi = {
  getCarDestinationPage: async (params: any) => {
    return await request.get({ url: `/core/car-destination/page`, params })
  },

  getCarDestination: async (id: number) => {
    return await request.get({ url: `/core/car-destination/get?id=` + id })
  },

  createCarDestination: async (data: CarDestination) => {
    return await request.post({ url: `/core/car-destination/add`, data })
  },

  updateCarDestination: async (data: CarDestination) => {
    return await request.put({ url: `/core/car-destination/upd`, data })
  },

  deleteCarDestination: async (id: number) => {
    return await request.delete({ url: `/core/car-destination/delete?id=` + id })
  },

  deleteCarDestinationList: async (ids: number[]) => {
    return await request.delete({ url: `/core/car-destination/delete-list?ids=${ids.join(',')}` })
  },

  exportCarDestination: async (params) => {
    return await request.download({ url: `/core/car-destination/export-excel`, params })
  }
}
