import React from 'react'
import LeftSidebar from './left-sidebar.jsx'
import LeftSidebarButton from './left-sidebar-button.jsx'
import DatasetMain from './dataset-main.jsx'

export default class DatasetPage extends React.Component {
  constructor(props) {
    super(props)
    this.toggleSidebar = this.toggleSidebar.bind(this)
    this.state = {
      sidebar: true,
    }
  }

  toggleSidebar() {
    this.setState({ sidebar: !this.state.sidebar })
  }

  render() {
    return (
      <div className="page dataset">
        <div
          className={
            this.state.sidebar ? 'open dataset-container' : 'dataset-container'
          }>
          <LeftSidebar snapshots={this.props.dataset.snapshots} />
          <LeftSidebarButton
            sidebar={this.state.sidebar}
            toggle={this.toggleSidebar}
          />
          <div className="fade-in inner-route dataset-route light">
            <div className="clearfix dataset-wrap">
              <div className="dataset-animation">
                <div className="col-xs-12 dataset-inner">
                  <DatasetMain dataset={this.props.dataset} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}