import mongo from '../libs/mongo'
import config from '../config'
import scitran from '../libs/scitran'

let c = mongo.collections
let events = Object.keys(config.events)

/*
 * Collect the data from a project as a log data object
 * 
 * This is different than job logs but similar field names
 */
const mapProjectData = project => {
  return {
    dataset: {
      datasetId: project._id,
      datasetLabel: project.label,
      created: project.created,
      modified: project.modified,
    },
  }
}

/*
 * Map scitran projects object to log object
 * { type, data, date, user }
 */
const mapProjectsLogs = projects => {
  return projects.map(project => {
    return {
      type: 'DATASET_CREATED',
      data: mapProjectData(project),
      date: project.created,
      user: project.group,
    }
  })
}

/**
 * Produce a history of SciTran dataset events
 */
const getDatasetHistory = () => {
  return new Promise((resolve, reject) => {
    scitran.getAllProjects((err, res) => {
      if (err) reject(err)
      const projects = res.body
      resolve(mapProjectsLogs(projects))
    })
  })
}

/*
 * Combine the mongo job logs with the scitran projects logs
 */
const mergeLogs = (jobLogs, projectLogs) => {
  return jobLogs.concat(projectLogs)
}

// handlers ----------------------------------------------------------------

/**
 * Event Logs
 *
 * Handlers for event logs.
 */
const handlers = {
  getEventLogs(req, res, next) {
    getDatasetHistory(scitran).then(projectLogs => {
      // This stuff could be a middleware?
      let limit = 30
      /*eslint-disable no-unused-vars*/
      let skip = 0
      let reqLimit = parseInt(req.query.limit)
      let reqSkip = parseInt(req.query.skip)
      if (!isNaN(reqLimit) && reqLimit < limit) {
        limit = req.query.limit
      }
      if (!isNaN(reqSkip) && reqSkip) {
        skip = reqSkip
      }
      c.crn.logs
        .find({ type: { $in: events } }, { sort: [['date', 'desc']] })
        .toArray((err, logs) => {
          if (err) return next(err)
          const mergedLogs = mergeLogs(logs, projectLogs)
          res.send(mergedLogs)
        })
    })
  },
  getDatasetHistory,
  mergeLogs,
}

export default handlers
