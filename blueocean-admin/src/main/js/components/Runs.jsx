import React, { Component, PropTypes } from 'react';
import ajaxHoc from '../AjaxHoc';
import moment from 'moment';
import { ModalView, ModalBody, StatusIndicator, LogConsole } from '@jenkins-cd/design-language';

const { bool, object, string, any } = PropTypes;

require('moment-duration-format');

/*
 http://localhost:8080/jenkins/blue/rest/organizations/jenkins/pipelines/PR-demo/runs
 */
export default class Runs extends Component {
    constructor(props) {
        super(props);
        this.state = { isVisible: false };
    }
    /*
    componentDidMount() {
        let url;
        const {baseUrl, multiBranch, result} = this.props;
        if(multiBranch) {
            url = `${baseUrl}/branches/${result.pipeline}/runs/${result.id}/log/`;
        } else {
            url = `${baseUrl}/runs/${result.id}/log/`;
        }
        console.log(url)
        fetchPipelineData(data => {
          this.setState({
            data: data,
          });
        }, url, false);
    }*/
    render() {
        const { result, changeset, data } = this.props;
        // early out
        if (!result && !data) {
            return null;
        }
        let lines = [];
        if (data && data.split) {
            lines = data.split('\n')
        }
        console.log(lines.length)
        const log = lines.map((line, index) => <div key={index}>${line}</div>);

        let
            duration = moment.duration(
                Number(result.durationInMillis), 'milliseconds').format('hh:mm:ss');

        const durationArray = duration.split(':');
        const name = decodeURIComponent(result.pipeline);

        if (durationArray.length === 1) {
            duration = `00:${duration}`;
        }

        const afterClose = () => this.setState({ isVisible: false });
        const open = () => this.setState({ isVisible: true });
        const resultRun = result.result === 'UNKNOWN' ? result.state : result.result;
        return (<tr key={result.id}>
            <td>
                {
                    this.state.isVisible && <ModalView hideOnOverlayClicked
                      title={`Branch ${name}`}
                      isVisible={this.state.isVisible}
                      afterClose={afterClose}
                    >
                        <ModalBody>
                            <div>
                                <dl>
                                    <dt>Status</dt>
                                    <dd>
                                        <StatusIndicator result={resultRun} />
                                    </dd>
                                    <dt>Build</dt>
                                    <dd>{result.id}</dd>
                                    <dt>Commit</dt>
                                    <dd>
                                        {changeset
                                        && changeset.commitId
                                        && changeset.commitId.substring(0, 8) || '-'
                                        }
                                    </dd>
                                    <dt>Branch</dt>
                                    <dd>{name}</dd>
                                    <dt>Message</dt>
                                    <dd>{changeset && changeset.comment || '-'}</dd>
                                    <dt>Duration</dt>
                                    <dd>{duration} minutes</dd>
                                    <dt>Completed</dt>
                                    <dd>{moment(result.endTime).fromNow()}</dd>
                                </dl>
                                 <LogConsole key={`${result.id}${name}`} result={log} />
                            </div>
                        </ModalBody>
                    </ModalView>
                }
                <a onClick={open}>
                    <StatusIndicator result={resultRun} />
                </a>
            </td>
            <td>{result.id}</td>
            <td>{changeset && changeset.commitId && changeset.commitId.substring(0, 8) || '-'}</td>
            <td>{name}</td>
            <td>{changeset && changeset.comment || '-'}</td>
            <td>
                {duration} minutes
            </td>
            <td>{moment(result.endTime).fromNow()}</td>
        </tr>);
    }
}

Runs.propTypes = {
    result: any.isRequired,
    data: string,
    changeset: object.isRequired,
    baseUrl: string.isRequired,
    multiBranch: bool,
};
// Decorated for ajax
export default ajaxHoc(Runs, ({ baseUrl, multiBranch, result }, config) => {
    let url;
    if (multiBranch) {
        url = `${baseUrl}/branches/${encodeURI(result.pipeline)}/runs/${result.id}/log/`;
    } else {
        url = `${baseUrl}/runs/${result.id}/log/`;
    }
    return url;
}, false);
