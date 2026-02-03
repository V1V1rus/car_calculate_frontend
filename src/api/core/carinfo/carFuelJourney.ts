import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

export interface CarFuelJourney {
  id: number // 编号
  fuelId?: number // 加油id
  destinationId?: number // 地点id
  place?: string // 加油时间
  distance?: number // 距离
  carUserId?: number // 用车人id
  carUserName?: string // 用车人
  useDate?: string // 用车时间
}

export const CarFuelJourneyApi = {
  getCarFuelJourneyPage: async (params: any) => {
    return await request.get({ url: `/core/car-fuel-journey/page`, params })
  },

  exportCarFuelJourney: async (params) => {
    return await request.download({ url: `/core/car-fuel-journey/export-excel`, params })
  },
}
