/* eslint-env jest */
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
})
