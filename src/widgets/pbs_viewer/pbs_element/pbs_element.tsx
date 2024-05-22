import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { Styles } from '@material-ui/styles/withStyles';
import { Theme } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { StateInterface } from '../../redux/types';
import * as ReduxAction from '../../redux/actions';
import Button from '@material-ui/core/Button';
import G6 from '@antv/g6';
import { TreeGraph } from '@antv/g6';
import { debounce } from '../../redux/tools';

const styles: Styles<Theme, any> = (theme: Theme) => ({
  textColor: {
    color: 'rgb(250, 250, 250)',
    background: '#525354',
    margin: '0px 5px',
  },
});

const getGraphData = (state: StateInterface) => {
  return {
    pbsData: state.systemArch.systemTree,
    positionData: state.systemArch.systemPBS,
    systemPBSUpdated: state.systemArch.systemPBSUpdated
  };
};

const mapStateToProps = (state: StateInterface) => {
  return getGraphData(state);
};

const mapDispatchToProps = (dispatch: (f: any) => void) => {
  return {
    saveGraphPosition: (data: {
      [key: string]: { visible: boolean; position: Array<number> };
    }) => dispatch(ReduxAction.archSaveGraphPosition(data))
  };
};




interface AppState {}

interface AppProps {
  classes: any;
  pbsData: any;
  panelRef?: Array<number>;
  signal?: number;
  positionData: {
    [key: string]: { visible: boolean; position: Array<number> };
  };
  systemPBSUpdated: number;
  saveGraphPosition: (data: {
    [key: string]: { visible: boolean; position: Array<number> };
  }) => void;
}

const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
  return [
    ['M', x - r, y - r],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
    ['M', x + 2 - r, y - r],
    ['L', x + r - 2, y - r]
  ];
};
const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
  return [
    ['M', x - r, y - r],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
    ['M', x + 2 - r, y - r],
    ['L', x + r - 2, y - r],
    ['M', x, y - 2 * r + 2],
    ['L', x, y - 2]
  ];
};

/**
 * React component for the PBS view of system. The position
 * of each node is synced with the node in connection view.
 *
 * @export
 * @class PBSElement
 * @extends {Component<AppProps, AppState>}
 */
export class PBSElement extends Component<AppProps, AppState> {
  private _divRef: React.RefObject<HTMLDivElement>;
  private centerGroup: any;
  private updated: boolean;
  private graph: TreeGraph;

  constructor(props: AppProps) {
    super(props);
    this._divRef = React.createRef<HTMLDivElement>();
    this.updated = false;
    window.onresize = debounce(this.handleResize, 500);
  }

  /**
   * Register to G6 a custom node named `tree-node` and a custom
   * edge named `flow-line`.
   *
   * @returns
   * @memberof PBSElement
   */
  componentDidMount() {
    G6.registerNode(
      'tree-node',
      {
        getAnchorPoints: function getAnchorPoints() {
          return [
            [0.5, 1], // The center of the bottom border
            [0.5, 0] // The center of the top border
          ];
        },
        drawShape: function drawShape(cfg: any, group: any) {
          const rect = group.addShape('rect', {
            attrs: {
              fill: 'rgb(0, 134, 178)',
              stroke: 'black'
            },
            name: 'rect-shape'
          });

          const content: string = cfg.id.split('.');
          const label = content[content.length - 1];
          const text = group.addShape('text', {
            attrs: {
              text: label,
              x: 0,
              y: 0,
              textAlign: 'left',
              textBaseline: 'middle',
              fill: '#fff',
              fontFamily: 'sans-serif',
              fontSize: 11,
              fontWeight: 400
            },
            name: 'rect-shape'
          });
          const bbox = text.getBBox();

          const hasChildren = cfg.children && cfg.children.length > 0;
          if (hasChildren) {
            group.addShape('marker', {
              attrs: {
                x: bbox.width / 2,
                y: bbox.height / 2 + 12,
                r: 5,
                symbol: cfg.collapsed ? EXPAND_ICON : COLLAPSE_ICON,
                stroke: '#fff',
                lineWidth: 2
              },
              name: 'collapse-icon'
            });
          }
          let widthDelta: number;
          if (bbox.width < 50) {
            widthDelta = (50 - bbox.width) / 2;
          } else {
            widthDelta = 5;
          }
          rect.attr({
            x: bbox.minX - widthDelta,
            y: bbox.minY - 6,
            width: bbox.width + 2 * widthDelta,
            height: bbox.height + (hasChildren ? 22 : 12)
          });
          return rect;
        }
      },
      'single-node'
    );
    G6.registerEdge('flow-line', {
      draw(cfg, group) {
        const startPoint = cfg.startPoint;
        const endPoint = cfg.endPoint;

        const { style } = cfg;
        const shape = group.addShape('path', {
          attrs: {
            stroke: style.stroke,
            endArrow: style.endArrow,
            path: [
              ['M', startPoint.x, startPoint.y],
              ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
              ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
              ['L', endPoint.x, endPoint.y]
            ]
          }
        });

        return shape;
      }
    });
    setTimeout(() => {
      this.createGraph();
    }, 500);
  }

  /**
   * Helper to resize the graph after resizing windows.
   * This function is called after `window.onresize` event end, with a
   * delay of 500ms
   *
   * @private
   * @memberof PBSElement
   */
  private handleResize = () =>
  {
    if (this._divRef.current)
    {
      const width = this._divRef.current.clientWidth;
      const height = this._divRef.current.clientHeight;
      if (this.graph) {
        this.graph.changeSize(width, height);
        this.graph.fitView();
        this.graph.refresh();
      }
    }
  };

  /**
   * This function is used to create a pbs graph after
   * `componentDidMount` event
   *
   * @private
   * @memberof PBSElement
   */
  private createGraph = () => {
    let data = {};
    if (this.props.pbsData.nodeData.length > 0) {
      data = JSON.parse(JSON.stringify(this.props.pbsData.nodeData[0]));
    }
    const width = this._divRef.current.clientWidth;
    const height = this._divRef.current.clientHeight;
    this.graph = new G6.TreeGraph({
      container: this._divRef.current,
      width,
      height,
      modes: {
        default: [
          {
            type: 'collapse-expand',
            onChange: function onChange(item, collapsed) {
              const data = item.get('model');
              const icon = item
                .get('group')
                .find(element => element.get('name') === 'collapse-icon');

              if (collapsed) {
                icon.attr('symbol', EXPAND_ICON);
              } else {
                icon.attr('symbol', COLLAPSE_ICON);
              }
              data.collapsed = collapsed;
              return true;
            }
          },
          'drag-canvas',
          'zoom-canvas',
          'drag-node'
        ]
      },
      defaultNode: {
        type: 'tree-node',
        anchorPoints: [
          [0.5, 1], // The center of the bottom border
          [0.5, 0] // The center of the top border
        ]
      },
      defaultEdge: {
        type: 'flow-line',
        style: {
          stroke: '#91d5ff',
          endArrow: true
        }
      },
      fitView: true,
      layout: {
        type: 'compactBox',
        direction: 'TB',
        getId: function getId(d) {
          return d.id;
        },
        getHeight: function getHeight() {
          return 16;
        },
        getWidth: function getWidth() {
          return 16;
        },
        getVGap: function getVGap() {
          return 40;
        },
        getHGap: function getHGap() {
          return 40;
        }
      }
    });

    this.graph.data(data);
    this.graph.on('afterlayout', this.saveNodePosition);
    this.graph.render();
    this.graph.layout(true);
    this.updated = true;
  };

  /**
   * This function contains the logic to update the graph each
   * time the store data is updated
   *
   * @param {AppProps} prevProps
   * @param {AppState} prevState
   * @memberof PBSElement
   */
  componentDidUpdate(prevProps: AppProps, prevState: AppState) {
    if (prevProps.systemPBSUpdated !== this.props.systemPBSUpdated) {
      const newData = JSON.parse(
        JSON.stringify(this.props.pbsData.nodeData[0])
      );

      G6.Util.traverseTreeUp(newData, item => {
        if (item.children) {
          const indicesToRemove = [];
          item.children.forEach((val, index) => {
            if (!this.props.positionData[val.id].visible) {
              indicesToRemove.push(index);
            }
          });
          for (let j = indicesToRemove.length - 1; j >= 0; j--) {
            item.children.splice(indicesToRemove[j], 1);
          }
        }
        return true;
      });
      this.graph.changeData(newData);
    }
  }

  /**
   * This function is called after the `afterlayout` event of
   * the G6 graph. It is used to save the style of graph and the
   * position of all nodes to the redux store. This data is used
   * by the connection view to update the corresponding nodes.
   *
   * @private
   * @memberof PBSElement
   */
  private saveNodePosition = () => {
    const nodeList = this.graph.getNodes();
    const style = this.graph.get('layout');

    let radial = false;
    if (style['radial']) {
      radial = true;
    }

    const posData = {
      __$graph_style$__: { visible: radial, position: [0, 0] }
    };
    for (const key in this.props.positionData) {
      if (key !== '__$graph_style$__') {
        posData[key] = { ...this.props.positionData[key], position: null };
      }
    }
    nodeList.forEach(node => {
      const data = node.get('model');
      if (posData[data.id]) {
        posData[data.id].position = [data.x, data.y];
      } else {
        posData[data.id] = { visible: true, position: [data.x, data.y] };
      }
    });

    this.props.saveGraphPosition(posData);
  };

  /**
   *
   * Expand the PBS tree.
   * @private
   * @memberof PBSElement
   */
  private expandGraph = () => {
    const nodeList = this.graph.getNodes();
    nodeList.forEach(item => {
      const model = item.get('model');
      const icon = item
        .get('group')
        .find(element => element.get('name') === 'collapse-icon');
      if (icon) {
        icon.attr('symbol', COLLAPSE_ICON);
      }
      model.collapsed = false;
    });
    this.graph.layout(true);
  };

  /**
   *
   * Collapse the PBS tree to have only 2 levels.
   * @private
   * @memberof PBSElement
   */
  private resetGraph = () => {
    const nodeList = this.graph.getNodes();
    nodeList.forEach(item => {
      const model = item.get('model');
      const id: string = model.id;
      if (id.split('.').length === 2) {
        const icon = item
          .get('group')
          .find(element => element.get('name') === 'collapse-icon');
        if (icon) {
          icon.attr('symbol', EXPAND_ICON);
        }
        model.collapsed = true;
      }
    });
    this.graph.layout(true);
  };

  /**
   * Switch the PBS tree to radial layout
   *
   * @private
   * @memberof PBSElement
   */
  private radialLayout = () => {
    const layout = {
      direction: 'RL',
      getId: function getId(d) {
        return d.id;
      },
      getHeight: () => {
        return 26;
      },
      getWidth: () => {
        return 26;
      },
      getVGap: () => {
        return 20;
      },
      getHGap: () => {
        return 20;
      },
      radial: true
    };

    this.graph.updateLayout(layout);
    this.graph.fitView();
    this.graph.refresh();
  };

  /**
   * Switch the PBS tree to flat layout
   *
   * @private
   * @memberof PBSElement
   */
  private flatLayout = () => {
    const layout = {
      type: 'compactBox',
      direction: 'TB',
      getId: function getId(d) {
        return d.id;
      },
      getHeight: function getHeight() {
        return 16;
      },
      getWidth: function getWidth() {
        return 16;
      },
      getVGap: function getVGap() {
        return 40;
      },
      getHGap: function getHGap() {
        return 40;
      }
    };

    this.graph.updateLayout(layout);
    this.graph.fitView();
    this.graph.refresh();
  };

  render() {
    return (
      <div className={'cosapp-widget-box'}>
        <div
          ref={this._divRef}
          style={{ height: 'calc(100% - 30px)' }}
          className="pbsView"
        ></div>
        <div style={{ height: '30px', display: 'flex', background : '#e0e0e0' }}>
          <Button  onClick={this.flatLayout}  >
            Flat layout
          </Button>
          <Button  onClick={this.radialLayout}  >
            Radial layout
          </Button>
          {/* <Button variant="contained" onClick={this.resetGraph}>
            COLLAPSE
          </Button>
          <Button variant="contained" onClick={this.expandGraph}>
            Expand
          </Button> */}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(PBSElement)
);
