// dependencies ----------------------------------------------------------------------
import React from 'react'
import PropTypes from 'prop-types'
import { VictoryPie } from 'victory'

// Life Cycle ----------------------------------------------------------------------

const Pie = ({ failed, success, total }) => {
  let dataPoints = { failed, success }
  let data = []
  let dataP

  Object.entries(dataPoints).forEach(([key, value]) => {
    if (value && total) {
      dataP = Math.round(value / total * 100)
      let label = key + ' ' + dataP + '%'
      data.push({ x: label, y: dataP })
    }
  })

  return (
    <div>
      <VictoryPie
        width={400}
        height={400}
        data={data}
        innerRadius={49}
        labelRadius={78}
        style={{ labels: { fontSize: 14, fill: 'white' } }}
        colorScale={['#333333', '#007c92']}
      />
    </div>
  )
}

Pie.propTypes = {
  failed: PropTypes.node,
  success: PropTypes.node,
  total: PropTypes.node,
}

export default Pie