import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

export interface CarUser {
  id: number // 编号
  name?: string // 名字
}

export const CarUserApi = {
  getCarUserPage: async (params: any) => {
    return await request.get({ url: `/core/car-user/page`, params })
  },

  getCarUser: async (id: number) => {
    return await request.get({ url: `/core/car-user/get?id=` + id })
  },

  createCarUser: async (data: CarUser) => {
    return await request.post({ url: `/core/car-user/add`, data })
  },

  updateCarUser: async (data: CarUser) => {
    return await request.put({ url: `/core/car-user/upd`, data })
  },

  deleteCarUser: async (id: number) => {
    return await request.delete({ url: `/core/car-user/delete?id=` + id })
  },

  deleteCarUserList: async (ids: number[]) => {
    return await request.delete({ url: `/core/car-user/delete-list?ids=${ids.join(',')}` })
  },

  exportCarUser: async (params) => {
    return await request.download({ url: `/core/car-user/export-excel`, params })
  }
}
