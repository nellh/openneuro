/*eslint react/no-danger: 0 */

// dependencies -------------------------------------------------------

import React    from 'react';
import actions  from './dataset.actions.js';
import Spinner  from '../common/partials/spinner.jsx';
import {Modal}  from 'react-bootstrap';
import moment   from 'moment';
import Select   from 'react-select';
import markdown from '../utils/markdown';
import validate from '../../../../validator';
import scitran  from '../utils/scitran';
import Results  from '../upload/upload.validation-results.jsx';

export default class JobMenu extends React.Component {

// life cycle events --------------------------------------------------

    constructor() {
        super();
        this.state = {
            loading:          false,
            parameters:       [],
            disabledApps:     {},
            selectedApp:      {},
            selectedAppID:    '',
            selectedSnapshot: '',
            message:          null,
            error:            false,
            subjects:         []
        };
    }

    componentWillReceiveProps() {
        // initialize subjects into state
        if (this.state.subjects.length === 0 && this.props.dataset.summary) {
            let subjects = [];
            for (let subject of this.props.dataset.summary.subjects) {
                subjects.push({label: 'sub-' + subject, value: 'sub-' + subject});
            }
            subjects.reverse();
            this.setState({subjects});
        }

        // pre-select snapshots
        if (!this.state.selectedSnapshot) {
            this.props.snapshots.map((snapshot) => {
                if (snapshot._id == this.props.dataset._id) {
                    if (snapshot.original) {
                        this._selectSnapshot({target: {value: snapshot._id}});
                    } else if (this.props.snapshots.length > 1) {
                        this._selectSnapshot({target: {value: this.props.snapshots[1]._id}});
                    }
                    return;
                }
            });
        }
    }

    render() {
        let selectedApp = this.state.selectedApp;
        let loadingText = this.props.loadingApps ? 'Loading pipelines' : 'Starting ' + this.state.selectedAppID;

        let form = (
            <div className="anaylsis-modal clearfix">
                {this._snapshots()}
                {this._apps()}
                {this._info(selectedApp)}
                {this._parameters()}
                {this._submit()}
            </div>
        );

        let message = (
            <div>
                <div className={this.state.error ? 'alert alert-danger' : null}>
                    {this.state.error ? <h4 className="danger">Error</h4> : null}
                    <h5>{this.state.message}</h5>
                </div>
                <button className="btn-admin-blue" onClick={this._hide.bind(this)}>OK</button>
            </div>
        );

        let body;
        if (this.state.loading || this.props.loadingApps) {
            body = <Spinner active={true} text={loadingText}/>;
        } else if (this.state.message) {
            body = message;
        } else {
            body = form;
        }

        return (
            <Modal show={this.props.show} onHide={this._hide.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Run Analysis</Modal.Title>
                </Modal.Header>
                <hr className="modal-inner" />
                <Modal.Body>
                    <div className="dataset">
                        {body}
                    </div>
                </Modal.Body>
            </Modal>
        );
    }

// template methods ---------------------------------------------------

    /**
     * Apps
     *
     * Returns a label and select box for selection an
     * analysis application.
     */
    _apps() {
        let options = this.props.apps ? this.props.apps.map((app) => {
            let disabled = this.state.disabledApps.hasOwnProperty(app.id) ? '* ' : null;
            return <option key={app.id}
                           value={app.id}>
                       {disabled + app.label + ' - v' + app.version}
                   </option>;
        }) : [];

        if (this.state.selectedSnapshot) {
            return (
                <div>
                    <h5>Choose an analysis pipeline to run on dataset {this.props.dataset.name}</h5>
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="col-xs-6 task-select">
                                <select value={this.state.selectedAppID} onChange={this._selectApp.bind(this)}>
                                    <option value="" disabled>Select a Task</option>
                                    {options}
                                </select>
                            </div>
                        </div>
                            <br /><span> * - app is incompatible with selected snapshot</span>
                    </div>
                </div>
            );
        }
    }

    /**
     * Info
     */
    _info(app) {

        if (this.state.disabledApps.hasOwnProperty(app.id)) {
            return this._incompatible(app);
        }

        let shortDescription;
        if (app.shortDescription) {
            shortDescription = (
                <div>
                    <h5>Short Description</h5>
                    <div className="well" dangerouslySetInnerHTML={markdown.format(app.shortDescription)}></div>
                </div>
            );
        }

        let help;
        if (app.helpURI) {
            help = (
                <div>
                    <h5>Help</h5>
                    <div className="well">
                        <a href={app.helpURI} target="_blank">{app.helpURI}</a>
                    </div>
                </div>
            );
        }

        let tags;
        if (app.tags) {
            tags = (
                <div>
                    <h5>Tags</h5>
                    <div className="well">{app.tags.join(', ')}</div>
                </div>
            );
        }

        let description,
            acknowledgments,
            support;
        if (app.longDescription) {
            app.longDescription = typeof app.longDescription === 'string' ? JSON.parse(app.longDescription) : app.longDescription;

            description = (
                <div>
                    <h5>Description</h5>
                    <div className="well" dangerouslySetInnerHTML={markdown.format(app.longDescription.description)}></div>
                </div>
            );

            acknowledgments = (
                <div>
                    <h5>Acknowledgements</h5>
                    <div className="well" dangerouslySetInnerHTML={markdown.format(app.longDescription.acknowledgments)}></div>
                </div>
            );

            support = (
                <div>
                    <h5>Support</h5>
                    <div className="well" dangerouslySetInnerHTML={markdown.format(app.longDescription.support)}></div>
                </div>
            );
        }

        return (
            <div>
                <br /><hr />
                {shortDescription}
                {description}
                {acknowledgments}
                {help}
                {support}
                {tags}
            </div>
        );
    }

    /**
     * Incompatible
     */
    _incompatible(app) {
        let issues = this.state.disabledApps[app.id].issues;
        return (
            <div>
                <div>
                    <h5>Incompatible</h5>
                    <div className="well">
                        <div>This snapshot has issues that make it incompatible with this pipeline. Pipelines may have validation requirements beyond BIDS compatibility.</div>
                        <Results errors={issues.errors} warnings={issues.warnings} />
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Snapshots
     *
     * Returns a labeled select box for selecting a snapshot
     * to run analysis on.
     */
    _snapshots() {
        let options = this.props.snapshots ? this.props.snapshots.map((snapshot) => {
            if (!snapshot.isOriginal && !snapshot.orphaned) {
                return (
                    <option key={snapshot._id} value={snapshot._id}>
                        {'v' + snapshot.snapshot_version + ' (' + moment(snapshot.modified).format('lll') + ')'}
                    </option>
                );
            }
        }) : [];

        let createSnapshot;
        if (this.props.dataset.access === 'admin') {
            createSnapshot = (
                <div className="col-xs-6 default-reset">
                    <button className="btn-reset" onClick={this._createSnapshot.bind(this)}>Create New Snapshot</button>
                </div>
            );
        }

        return (
            <div>
                <h5>Choose a snapshot to run analysis on</h5>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="col-xs-6 task-select">
                            <select value={this.state.selectedSnapshot} onChange={this._selectSnapshot.bind(this)}>
                                <option value="" disabled>Select a Snapshot</option>
                                {options}
                            </select>
                        </div>
                        {createSnapshot}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Parameters
     *
     * Returns an array of input markup
     * for the parameters of the selected
     * app.
     */
    _parameters() {
        if (this.state.disabledApps.hasOwnProperty(this.state.selectedApp.id)) {
            return false;
        }
        let parameters = this.state.parameters.map((parameter) => {
            let input;
            if (parameter.type === 'number') {
                input = <input className="form-control" type="number" value={parameter.value} onChange={this._updateParameter.bind(this, parameter.id)}/>;
            } else if (parameter.type === 'checkbox') {
                input = (
                    <span>
                        <input className="form-control checkbox"
                               type="checkbox"
                               id={'check-' + parameter.id}
                               checked={parameter.value}
                               onChange={this._updateParameter.bind(this, parameter.id)}/>
                        <label htmlFor={'check-' + parameter.id} className="checkmark"><span></span></label>
                    </span>
                );
            } else if (parameter.id === 'subjectList') {
                input = <Select multi simpleValue value={parameter.value} placeholder="Select your subject(s)" options={this.state.subjects} onChange={this._updateParameter.bind(this, parameter.id)} />;
            } else {
                input = <input className="form-control" value={parameter.value} onChange={this._updateParameter.bind(this, parameter.id)}/>;
            }
            return (
                <div key={parameter.id}>
                    <div className="parameters form-horizontal">
                        <div className="form-group" key={parameter.id}>
                            <label className="sr-only">{parameter.label}</label>
                            <div className="input-group">
                                  <div className="input-group-addon">{parameter.label}</div>
                                <div className="clearfix">
                                    {input}
                                    <span className="help-text">{parameter.description}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

        let reset;
        if (parameters.length > 0) {
            reset = (
                <div className="row">
                    <div className="col-xs-6">
                        <h5>Parameters</h5>
                    </div>
                    <div className="col-xs-6 default-reset">
                        <button className="btn-reset" onClick={this._restoreDefaultParameters.bind(this)}>Restore Default Parameters</button>
                    </div>
                </div>
            );
            return (
                <div>
                    <br /><hr /><br />
                    {reset}
                    {parameters}
                </div>
            );
        }

    }

    _submit() {
        if (this.state.disabledApps.hasOwnProperty(this.state.selectedApp.id)) {
            return false;
        }
        if (this.state.selectedAppID) {
            return (
                <div className="col-xs-12 modal-actions">
                    <button className="btn-modal-submit" onClick={this._startJob.bind(this)}>Start</button>
                    <button className="btn-reset" onClick={this._hide.bind(this)}>close</button>
                </div>
            );
        }
    }

// actions ------------------------------------------------------------

    /**
     * Hide
     */
    _hide() {
        let success = !!this.state.message && !this.state.error;
        this.props.onHide(success, this.state.selectedSnapshot, this.state.selectedAppID);
        this.setState({
            loading:          false,
            parameters:       [],
            selectedApp:      {},
            selectedAppID:    '',
            selectedSnapshot: '',
            message:          null,
            error:            false,
            options:          [],
            value:            []
        });
    }

    /**
     * Update Parameter
     *
     * Takes a parameter id and the
     * onChange event and updates the
     * parameter to the new value.
     */
    _updateParameter(id, e) {
        let value = e && e.target ? e.target.value : e;
        let parameters = this.state.parameters;
        for (let parameter of parameters) {
            if (parameter.id === id) {
                if (parameter.type === 'bool') {
                    parameter.value = !parameter.value;
                } else {
                    parameter.value = value;
                }
            }
        }
        this.setState({parameters});
    }

    /**
     * Restore Default Parameters
     */
    _restoreDefaultParameters() {
        let parameters = this.state.parameters;
        for (let parameter of parameters) {
            parameter.value = parameter.default;
        }
        this.setState({parameters});
    }

    /**
     * Select App
     */
    _selectApp(e) {
        let selectedApp;
        let selectedAppID = e.target.value;
        let parameters = [], parametersSpec = [];
        for (let app of this.props.apps) {
            if (app.id === selectedAppID) {
                selectedApp = app;
                parametersSpec = app.parameters;
                break;
            }
        }
        for (let parameter of parametersSpec) {
            if (parameter.value.visible) {
                parameters.push({
                    id:          parameter.id,
                    label:       parameter.details.label,
                    description: parameter.details.description,
                    type:        parameter.value.type,
                    default:     parameter.value.default,
                    value:       parameter.value.default
                });
            }
        }
        this.setState({selectedApp, selectedAppID, parameters});
    }

    /**
     * Select Snapshot
     */
    _selectSnapshot(e) {
        let snapshotId = e.target.value;
        let disabledApps = {};

        /**
         * determine app availability
         */
        // load validation data for selected snapshot
        scitran.getProject(snapshotId, (res) => {

            for (let app of this.props.apps) {
                let appConfig = {error: [1]};
                let issues = validate.reformat(res.body.metadata.validation, res.body.metadata.summary, appConfig);
                if (issues.errors.length > 0) {
                    disabledApps[app.id] = {issues};
                }
            }
            this.setState({selectedSnapshot: snapshotId, disabledApps});
        },{snapshot:true});
    }

    /**
     * Create Snapshot
     */
    _createSnapshot() {
        this.setState({loading: true});
        actions.createSnapshot((res) => {
            if (res.error) {
                this.setState({
                    error: true,
                    message: res.error,
                    loading: false
                });
            } else {
                this.setState({
                    selectedSnapshot: res,
                    loading: false
                });
            }
        }, false);
    }

    /**
     * Start Job
     */
    _startJob() {
        let parameters = {};
        for (let parameter of this.state.parameters) {
            if (parameter.type === 'number') {parameter.value = Number(parameter.value);}
            if (parameter.type === 'string' && !parameter.value) {parameter.value = '';}
            if (typeof parameter.value === 'string' && parameter.value.indexOf('sub-') > -1) {
                parameter.value = parameter.value.replace(/,/g, ' ').replace(/sub-/g, '');
            }
            parameters[parameter.id] = parameter.value;
        }
        this.setState({loading: true});

        actions.startJob(this.state.selectedSnapshot, this.state.selectedApp, parameters, (err, res) => {
            let message, error;
            if (err) {
                error   = true;
                if (res.status === 409) {
                    message = 'This analysis has already been run on this dataset with the same parameters. You can view the results in the Analyses section of the dataset page.';
                } else if (res.status === 503) {
                    message = 'We are temporarily unable to process this analysis. Please try again later. If this issue persists, please contact the site administrator.';
                } else {
                    message = 'There was an issue submitting your analysis. Double check your inputs and try again. If the issue persists, please contact the site administrator.';
                }
            } else {
                message = 'Your analysis has been submitted. Periodically check the Analyses section of this dataset to view the status and results.';
            }
            this.setState({loading: false, message: message, error: error});
        });
    }
}

JobMenu.propTypes = {
    apps:        React.PropTypes.array,
    dataset:     React.PropTypes.object,
    loadingApps: React.PropTypes.bool,
    onHide:      React.PropTypes.func.isRequired,
    show:        React.PropTypes.bool,
    snapshots:   React.PropTypes.array
};

JobMenu.defaultProps = {
    app:         [],
    dataset:     {},
    loadingApps: false,
    show:        false,
    snapshots:   []
};