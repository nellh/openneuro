const scitranProjectsBody = [
  {
    files: [Object],
    group: 'nell@squishymedia.com',
    created: '2017-09-11T23:10:23.214000+00:00',
    snapshot_version: 1,
    tags: [Object],
    modified: '2017-09-14T16:20:31.554000+00:00',
    label: 'One Subject',
    _id: '202020206473303031303031',
    permissions: [],
  },
  {
    files: [Object],
    group: 'nell@squishymedia.com',
    created: '2017-09-12T22:31:40.939000+00:00',
    snapshot_version: 1,
    tags: [],
    modified: '2017-09-12T22:31:41.057000+00:00',
    label: 'One Subject 2.0',
    _id: '202020206473303031303032',
    permissions: [],
  },
  {
    files: [Object],
    group: 'nell@squishymedia.com',
    created: '2017-09-17T18:45:43.680000+00:00',
    snapshot_version: 1,
    tags: [],
    modified: '2017-09-17T18:45:43.767000+00:00',
    label: 'DS003-downsampled (only T1)',
    _id: '202020206473303031303033',
    permissions: [],
  },
  {
    files: [Object],
    group: 'nell@squishymedia.com',
    created: '2017-09-21T19:57:57.927000+00:00',
    snapshot_version: 1,
    tags: [],
    modified: '2017-09-21T19:58:49.054000+00:00',
    label: 'BIDS',
    _id: '202020206473303031303037',
    permissions: [],
  },
]

const scitranMock = {
  getAllProjects: cb => {
    cb(null, { body: scitranProjectsBody })
  },
}

export default scitranMock
