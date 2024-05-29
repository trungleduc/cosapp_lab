import { withStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import { Theme } from '@material-ui/core/styles';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import ViewColumn from '@material-ui/icons/ViewColumn';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Styles } from '@material-ui/styles/withStyles';
import 'flexlayout-react/style/light.css';
import MaterialTable from 'material-table';
import React, { Component, forwardRef } from 'react';
import { connect } from 'react-redux';

import { IDict, StateInterface } from '../../redux/types';

const tableIcons = {
  Add: forwardRef((props, ref: any) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref: any) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref: any) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref: any) => (
    <DeleteOutline {...props} ref={ref} />
  )),
  DetailPanel: forwardRef((props, ref: any) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref: any) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref: any) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref: any) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref: any) => (
    <FirstPage {...props} ref={ref} />
  )),
  LastPage: forwardRef((props, ref: any) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref: any) => (
    <ChevronRight {...props} ref={ref} />
  )),
  PreviousPage: forwardRef((props, ref: any) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref: any) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref: any) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref: any) => (
    <ArrowDownward {...props} ref={ref} />
  )),
  ThirdStateCheck: forwardRef((props, ref: any) => (
    <Remove {...props} ref={ref} />
  )),
  ViewColumn: forwardRef((props, ref: any) => (
    <ViewColumn {...props} ref={ref} />
  ))
};

function PaperComponent(props: PaperProps) {
  return <Paper {...props} />;
}
const styles: Styles<any, any> = (theme: Theme) => ({
  textSizeSmall: {
    //fontSize: "0.75rem"
  },
  toolbarHeigt: {
    minHeight: 36,
    background: 'rgb(50, 50, 50)'
  },
  viewSelector: {
    minWidth: 120,
    //fontSize: "0.75rem",
    color: 'rgb(250, 250, 250)'
  },
  bgSelector: {
    minWidth: 60,
    //fontSize: "0.75rem",
    color: 'rgb(250, 250, 250)'
  },
  textColor: {
    color: 'rgb(250, 250, 250)'
  },
  backGround: {
    color: 'rgb(50, 50, 50)'
  },
  formControl: {
    padding: theme.spacing(1),
    width: '90%'
  },
  formControlShort: {
    padding: theme.spacing(1),
    width: 'calc(50% - 16px)'
  },
  formControlTiny: {
    width: '22%'
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '90%'
  },
  bottomBarDiv: {
    width: '100%',
    height: '35px',
    background: '#e0e0e0',
    display: 'flex',
    flexDirection: 'row-reverse'
  }
});

const getStoreData = (state: StateInterface) => {
  return {
    computedResult: state.dashboardState.computedResult,
    portMetaData: state.dashboardState.portMetaData
  };
};

const mapStateToProps = (state: StateInterface) => {
  return getStoreData(state);
};

const mapDispatchToProps = (_: (f: any) => void) => {
  return {};
};

interface IAppProps {
  send_msg: any;
  model: any;
  classes: any;
  id: string;
  initialState: IDict<any>;
  computedResult: IDict<any>;
  portMetaData: IDict<IDict<any>>;
}

interface IAppStates {
  traceConfig: {
    systemName: string;
    portName: string;
  };
  openSetting: boolean;

  listSelector: string[];
  dictSelector: IDict<Array<string>>;
  title: string;
  rowData: Array<IDict<any>>;
}

const ALL_PORTS = 'All ports';
/**
 *
 * React component displaying the render window.
 * @class DataViewer
 * @extends {Component<IAppProps, IAppStates>}
 */
export class DataViewer extends Component<IAppProps, IAppStates> {
  /**
   *Creates an instance of DataViewer.
   * @param {IAppProps} props
   * @memberof DataViewer
   */

  initialState: IDict<any>;
  constructor(props: IAppProps) {
    super(props);
    this.initialState = props.initialState;

    let dictSelector = {};
    for (const [key, value] of Object.entries(props.portMetaData)) {
      const portList = Object.keys(value);
      portList.unshift(ALL_PORTS);
      dictSelector[key] = portList;
    }
    let listSelector = Object.keys(props.portMetaData);
    if (listSelector.length === 0) {
      listSelector = ['None'];
      dictSelector = { None: { None: ['None'] } };
    }
    const rowData = [];

    this.state = {
      traceConfig: {
        systemName: listSelector[0],
        portName: dictSelector[listSelector[0]][0]
      },
      openSetting: false,
      listSelector,
      dictSelector,
      title: 'Data Viewer',
      rowData
    };
  }

  componentDidMount() {
    if (this.initialState) {
      const traceConfig: {
        systemName: string;
        portName: string;
      } = this.initialState.traceConfig;
      let sysClass: string;
      if (
        traceConfig.portName !== 'inwards' &&
        traceConfig.portName !== 'outwards' &&
        traceConfig.portName !== ALL_PORTS
      ) {
        sysClass =
          '- ' +
          this.props.portMetaData[traceConfig.systemName][traceConfig.portName][
            '__class__'
          ];
      } else {
        sysClass = '';
      }

      const title = `${traceConfig.systemName} - ${traceConfig.portName} ${sysClass}`;
      const rowData = this.computedResultToTableData(
        traceConfig.systemName,
        traceConfig.portName
      );

      this.setState(old => {
        return {
          ...old,
          traceConfig,
          rowData,
          title
        };
      });
    }
  }

  /**
   *
   *
   * @param {IAppProps} oldProps
   * @param {IAppStates} oldState
   * @memberof DataViewer
   */
  componentDidUpdate(oldProps: IAppProps, _: IAppStates) {
    if (oldProps.computedResult !== this.props.computedResult) {
      const rowData = this.computedResultToTableData(
        this.state.traceConfig.systemName,
        this.state.traceConfig.portName
      );
      this.setState(old => ({ ...old, rowData }));
    }
  }

  singlePortToTableData = (
    sysName: string,
    portName: string,
    prefix = false
  ): Array<IDict<any>> => {
    const tableData = [];

    const portMeta: IDict<IDict<string>> =
      this.props.portMetaData[sysName][portName];
    for (const [varName, varMeta] of Object.entries(portMeta)) {
      if (varName !== '__class__') {
        const path = `${sysName}.${portName}.${varName}`;
        const value = this.props.computedResult[path][1];
        const dtype = this.props.computedResult[path][0];
        let displayValue: string | number;
        if (!isNaN(value)) {
          displayValue = value;
        } else if (typeof value === 'string') {
          displayValue = value;
        } else {
          displayValue = 'Expand to view';
        }
        const {
          desc = null,
          distribution = null,
          invalid_comment = null,
          limits = null,
          out_of_limits_comment = null,
          unit = null,
          valid_range = null
        } = varMeta;
        let fullName: string;
        let displayUnit = '';
        if (unit) {
          displayUnit = ` (${unit})`;
        }
        if (prefix) {
          fullName = `${portName}.${varName}${displayUnit}`;
        } else {
          fullName = `${varName}${displayUnit}`;
        }
        tableData.push({
          name: fullName,
          value,
          displayValue,
          desc,
          dtype,
          distribution,
          invalid_comment,
          limits,
          out_of_limits_comment,
          unit,
          valid_range
        });
      }
    }
    return tableData;
  };
  computedResultToTableData = (
    sysName: string,
    portName: string
  ): Array<IDict<any>> => {
    if (portName !== ALL_PORTS) {
      return this.singlePortToTableData(sysName, portName, false);
    } else {
      const tableData = [];
      this.state.dictSelector[sysName].forEach(pName => {
        if (pName !== ALL_PORTS) {
          tableData.push(...this.singlePortToTableData(sysName, pName, true));
        }
      });

      return tableData;
    }
  };

  handleSystemSelectChange = (event: React.ChangeEvent<any>, value: string) => {
    const portName = this.state.dictSelector[value][0];
    this.setState(old => ({
      ...old,
      traceConfig: { systemName: value, portName }
    }));
  };
  handlePortChange = (event: React.ChangeEvent<any>, value: string) => {
    this.setState(old => ({
      ...old,
      traceConfig: { ...old.traceConfig, portName: value }
    }));
  };
  toggleSetting = () => {
    this.setState(old => ({ ...old, openSetting: !old.openSetting }));
  };
  updateSetting = () => {
    this.setState(old => {
      const systemName = old.traceConfig.systemName;
      const portName = old.traceConfig.portName;
      let sysClass: string;
      if (
        portName !== 'inwards' &&
        portName !== 'outwards' &&
        portName !== ALL_PORTS
      ) {
        sysClass =
          '- ' + this.props.portMetaData[systemName][portName]['__class__'];
      } else {
        sysClass = '';
      }

      const title = `${systemName} - ${portName} ${sysClass}`;
      const rowData = this.computedResultToTableData(systemName, portName);
      return { ...old, openSetting: false, title, rowData };
    });
  };

  check_value_in_range = (
    value: number | Array<number>,
    range: Array<number | string>
  ) => {
    let ret = true;
    if (!range) {
      return ret;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return ret;
      }
      if (isNaN(value[0])) {
        return ret;
      }

      for (const element of value) {
        if (
          parseFloat(range[0] + '') > element ||
          element > parseFloat(range[1] + '')
        ) {
          ret = false;
          break;
        }
      }
    } else {
      if (
        parseFloat(range[0] + '') > value ||
        value > parseFloat(range[1] + '')
      ) {
        ret = false;
      }
    }
    return ret;
  };

  check_validity_and_limit_value = (
    value: number | Array<number>,
    valid: Array<number | string>,
    limit: Array<number | string>
  ) => {
    let valid_range = [0, 0];
    let limit_range = [0, 0];
    let in_valid = true;
    let in_limit = true;
    if (valid) {
      for (let idx = 0; idx < valid.length; idx++) {
        const element = valid[idx];
        if (element === '-inf') {
          valid_range[idx] = -Infinity;
        } else if (element === 'inf') {
          valid_range[idx] = Infinity;
        } else {
          valid_range[idx] = parseFloat(element + '');
        }
      }
    } else {
      valid_range = null;
    }

    if (limit) {
      for (let idx = 0; idx < limit.length; idx++) {
        const element = limit[idx];
        if (element === '-inf') {
          limit_range[idx] = -Infinity;
        } else if (element === 'inf') {
          limit_range[idx] = Infinity;
        } else {
          limit_range[idx] = parseFloat(element + '');
        }
      }
    } else {
      limit_range = null;
    }
    in_valid = this.check_value_in_range(value, valid_range);
    in_limit = this.check_value_in_range(value, limit_range);
    return { in_valid, in_limit };
  };

  render() {
    const classes = this.props.classes;
    return (
      <div className={'cosapp-widget-box'}>
        <Dialog
          open={this.state.openSetting}
          aria-labelledby="draggable-dialog-title"
          fullWidth={true}
          maxWidth="sm"
          PaperComponent={PaperComponent}
        >
          <DialogTitle
            style={{ cursor: 'move' }}
            className="draggable-dialog-title"
          >
            Data viewer configuration
          </DialogTitle>
          <DialogContent>
            <FormGroup style={{ flexDirection: 'row' }}>
              <Autocomplete
                className={classes.formControlShort}
                value={this.state.traceConfig.systemName}
                onChange={this.handleSystemSelectChange}
                options={this.state.listSelector}
                getOptionLabel={option => {
                  const newLabel = option.replace('chart_viewer.', '');
                  return newLabel;
                }}
                defaultValue={this.state.listSelector[0]}
                disableClearable={true}
                renderInput={params => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Select system"
                    placeholder=""
                    fullWidth
                  />
                )}
              />

              <FormControl className={classes.formControlShort}>
                <Autocomplete
                  disableClearable={true}
                  value={this.state.traceConfig.portName}
                  onChange={this.handlePortChange}
                  options={
                    this.state.dictSelector[this.state.traceConfig.systemName]
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Select port"
                      placeholder=""
                      fullWidth
                    />
                  )}
                />
              </FormControl>
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={this.toggleSetting} color="primary">
              Close
            </Button>
            <Button autoFocus onClick={this.updateSetting} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <div
          className="DataViewerMain"
          style={{
            width: '100%',
            height: 'calc(100% - 35px)',
            overflow: 'auto'
          }}
        >
          <MaterialTable
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            icons={tableIcons as any}
            title={this.state.title}
            options={{
              paging: false,
              search: false,
              rowStyle: rowData => {
                let background = '';
                const { value, limits, valid_range } = rowData;
                const { in_valid, in_limit } =
                  this.check_validity_and_limit_value(
                    value,
                    valid_range,
                    limits
                  );
                if (!in_limit) {
                  background = '#db3737';
                } else {
                  if (!in_valid) {
                    background = '#f5f56c';
                  }
                }
                return {
                  backgroundColor: background
                };
              }
            }}
            columns={[
              { title: 'Variable', field: 'name' },
              { title: 'Value', field: 'displayValue' },
              { title: 'Description', field: 'desc' }
            ]}
            data={this.state.rowData}
            detailPanel={rowData => {
              return (
                <Box margin={1}>
                  <Table size="small" aria-label="purchases">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {' '}
                          <b>Property</b>{' '}
                        </TableCell>
                        <TableCell>
                          <b>Value</b>{' '}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(rowData)
                        .filter(
                          ([propKey, _]) =>
                            propKey !== 'tableData' &&
                            propKey !== 'displayValue'
                        )
                        .map(([propKey, propValue]) => {
                          let value;
                          if (
                            ['value', 'limits', 'valid_range'].includes(propKey)
                          ) {
                            value = JSON.stringify(propValue).replace(
                              new RegExp(',', 'g'),
                              ', '
                            );
                          } else {
                            if (!propValue) {
                              value = 'None';
                            } else {
                              value = propValue;
                            }
                          }
                          return (
                            <TableRow key={propKey}>
                              <TableCell component="th" scope="row">
                                {propKey}
                              </TableCell>
                              <TableCell style={{ wordBreak: 'break-word' }}>
                                {value}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </Box>
              );
            }}
          />
        </div>
        <div className={this.props.classes.bottomBarDiv}>
          <Button
            onClick={this.toggleSetting}
            style={{ color: 'rgb(50,50,50)' }}
          >
            {' '}
            <SettingsIcon />
          </Button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
})(
  withStyles(styles)(
    forwardRef((props: IAppProps, ref: any) => (
      <DataViewer {...props} ref={ref} />
    ))
  )
);
