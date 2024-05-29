import { PageConfig } from '@jupyterlab/coreutils';
import { MathJaxTypesetter } from '@jupyterlab/mathjax2';
import { removeMath, replaceMath } from '@jupyterlab/rendermime';
import { withStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { Theme } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Styles } from '@material-ui/styles/withStyles';
import marked from 'marked';
import React, { Component, forwardRef } from 'react';
import { connect } from 'react-redux';

import { IDict, StateInterface } from '../../redux/types';

marked.setOptions({
  gfm: true,
  sanitize: false
});

function renderMarked(content: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    marked(content, (err: any, content: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

const styles: Styles<Theme, any> = () => ({
  textColor: {
    color: 'rgb(250, 250, 250)',
    background: '#525354',
    margin: '0px 5px'
  },
  formControl: {
    paddingLeft: '5%',
    width: '90%'
  }
});

const mapStateToProps = (state: StateInterface) => {
  return {
    systemConfig: state.systemConfig
  };
};

const mapDispatchToProps = () => {
  return {};
};

interface IState {
  traceConfig: IDict<any>;
  selectedSystem: string;
  allSystem: string[];
  selectedContent: string;
}

interface IProps {
  systemConfig: IDict<any>;
  send_msg: any;
  model: any;
  classes: any;
  initialState: IDict<any>;
}

export class SystemInfoElement extends Component<IProps, IState> {
  private _divRef: React.RefObject<HTMLDivElement>;
  private _rawContent: IDict<string>;
  private _renderedContent: IDict<{ renderMath: boolean; htmlString: string }>;
  private _mathjax: any;
  private _initialized: boolean;
  constructor(props: IProps) {
    super(props);
    props.model.listenTo(props.model, 'msg:custom', this.on_msg);
    this._divRef = React.createRef<HTMLDivElement>();
    const config = 'TeX-AMS-MML_HTMLorMML-full,Safe';
    let url: string;
    if (this.props.systemConfig['enableEdit']) {
      url = PageConfig.getOption('fullMathjaxUrl');
    } else {
      url = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js';
    }
    this._mathjax = new MathJaxTypesetter({ url, config });
    this._rawContent = {};
    this._renderedContent = {};
    this._initialized = false;
    this.state = {
      traceConfig: {},
      allSystem: [],
      selectedSystem: '',
      selectedContent: ''
    };
    props.send_msg({ action: 'SystemInfoComponent::getData' });
  }

  on_msg = (data: { type: string; payload: { [key: string]: any } }) => {
    const { type, payload } = data;
    switch (type) {
      case 'SystemInfoComponent::infoData': {
        if (this._initialized) {
          return;
        } else {
          this._rawContent = payload;
          const selectedSystem = Object.keys(payload)[0];
          this.handleSystemChange(null, selectedSystem);
          this._initialized = true;
        }
        break;
      }
      case 'SystemInfoComponent::updateData': {
        this._renderedContent = {};
        this._rawContent = payload;
        this.handleSystemChange(null, this.state.selectedSystem);
      }
    }
  };
  componentDidUpdate() {}

  componentDidMount() {}

  componentWillUnmount() {
    this.props.model.stopListening(this.props.model, 'msg:custom', this.on_msg);
  }

  handleSystemChange = (event: React.ChangeEvent<any>, value: string) => {
    if (value in this._renderedContent) {
      const { htmlString, renderMath } = this._renderedContent[value];
      this.setState(
        old => ({
          ...old,
          selectedSystem: value,
          selectedContent: htmlString
        }),
        () => {
          if (renderMath && this._mathjax) {
            console.log('typeset');
            this._mathjax.typeset(this._divRef.current);
          }
        }
      );
    } else {
      const source = this._rawContent[value];
      const parts = removeMath(source);

      renderMarked(parts['text']).then(html => {
        const htmlString = replaceMath(html, parts['math']);
        const renderMath = parts['math'].length > 0;
        this._renderedContent[value] = { htmlString, renderMath };
        this.setState(
          old => ({
            ...old,
            selectedSystem: value,
            selectedContent: htmlString
          }),
          () => {
            if (renderMath && this._mathjax) {
              this._mathjax.typeset(this._divRef.current);
            }
          }
        );
      });
    }
  };

  render() {
    return (
      <div className={'cosapp-widget-box'}>
        <div
          className={'cosapp-info-widget'}
          ref={this._divRef}
          style={{
            height: 'calc(100% - 30px)',
            paddingLeft: 25,
            paddingRight: 25,
            overflow: 'auto'
          }}
          dangerouslySetInnerHTML={{
            __html: this.state.selectedContent
          }}
        ></div>
        <div
          style={{
            height: '30px',
            display: 'flex',
            background: '#e0e0e0'
          }}
        >
          <FormControl className={this.props.classes.formControl}>
            <Autocomplete
              disableClearable={true}
              value={this.state.selectedSystem}
              onChange={this.handleSystemChange}
              options={Object.keys(this._rawContent)}
              size="small"
              renderInput={params => (
                <TextField
                  {...params}
                  size="small"
                  variant="standard"
                  placeholder=""
                  fullWidth
                  InputLabelProps={{ shrink: false }}
                />
              )}
            />
          </FormControl>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
})(
  withStyles(styles)(
    forwardRef((props: IProps, ref: any) => (
      <SystemInfoElement {...props} ref={ref} />
    ))
  )
);
