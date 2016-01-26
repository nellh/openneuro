// dependencies -----------------------------------------------------------

import React from 'react';
import Reflux      from 'reflux';
import UploadStore from './upload.store.js';
import {ProgressBar} from 'react-bootstrap';

// component setup --------------------------------------------------------

export default class UploadProgress extends React.Component {

// life cycle events ------------------------------------------------------

	render () {
		let completed = this.props.progress.completed;
		let total     = this.props.progress.total;
		let progress  = total > 0 ? Math.floor(completed / total * 100) : 0;

		let currentFiles = this.props.progress.currentFiles.map(function (file, index) {
			return (
				<div className="uploadFiles" key={index}>
					{file}
					<span className="one">.</span>
					<span className="two">.</span>
					<span className="three">.</span>​
				</div>
			);
		});

		return (
			<div className="uploadProgress-block">
				<span className="upload-dirname">
					<label><i className="folderIcon fa fa-folder-open" /></label>
					{this.props.name}
					<span className="message fadeIn"> {completed}/{total} files complete</span>

				</span>
				<ProgressBar active now={progress} />
				<div className="uploadFiles-wrap">
					{currentFiles}
				</div>
			</div>
		);
	}

}

UploadProgress.propTypes = {
	progress: React.PropTypes.object,
	name:   React.PropTypes.string
};

UploadProgress.Props = {
	progress: {}
};