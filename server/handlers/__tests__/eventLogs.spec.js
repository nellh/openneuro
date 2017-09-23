/* eslint-env jest */
import moment from 'moment'
jest.mock('../../libs/scitran')
import eventlogs from '../eventLogs'

describe('handlers/eventLogs', () => {
  describe('getDatasetHistory()', () => {
    it('should return logs objects', async () => {
      const logs = await eventlogs.getDatasetHistory()
      logs.map(log => {
        expect(log).toHaveProperty('type')
        expect(log).toHaveProperty('data')
        expect(log).toHaveProperty('date')
        expect(log).toHaveProperty('user')
        expect(log.type).toBe('DATASET_CREATED')
      })
    })
  })
  describe('mergeLogs()', () => {
    it('should return an array containing all parent array elements', () => {
      const a = [1, 2, 3]
      const b = [4, 5]
      const c = new Set([5, 4, 3, 2, 1])
      const child = new Set(eventlogs.mergeLogs(a, b))
      expect(child).toMatchObject(c)
    })
    it('should return all elements in order by date', async () => {
      const jobLogs = [
        { type: 'JOB_COMPLETED', date: '2017-09-22T23:45:02.549Z', data: {} },
        { type: 'JOB_STARTED', date: '2017-09-22T23:50:20.814Z', data: {} },
      ]
      const datasetLogs = await eventlogs.getDatasetHistory()
      const merged = eventlogs.mergeLogs(jobLogs, datasetLogs)
      expect(
        merged.every((log, idx) => {
          if (idx === merged.length - 1) return true
          const cd = moment(log.date)
          const nd = moment(merged[idx + 1].date)
          return cd > nd
        }),
      ).toBe(true)
    })
  })
})
