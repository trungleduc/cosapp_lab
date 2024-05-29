import G6 from '@antv/g6';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Theme } from '@material-ui/core/styles';
import { Styles } from '@material-ui/styles/withStyles';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import createEngine, {
  DefaultDiagramState,
  DiagramModel,
  PathFindingLinkFactory
} from '@projectstorm/react-diagrams';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { IDict, StateInterface, SystemGraphInterface } from '../../redux/types';
import { BaseCanvasWidget } from './canvas_widget';
import {
  AdvancedLinkFactory,
  AdvancedLinkModel,
  CustomNodeFactory,
  CustomNodeModel,
  CustomPortModel
} from './custom_link';

const styles: Styles<Theme, any> = () => ({
  textColor: {
    color: 'rgb(250, 250, 250)',
    background: '#525354',
    margin: '0px 5px'
  }
});

const getGraphData = (state: StateInterface) => {
  return {
    systemData: state.systemArch.systemGraph,
    pbsNodePosition: state.systemArch.systemPBS,
    pbsData: state.systemArch.systemTree
  };
};

const mapStateToProps = (state: StateInterface) => {
  return getGraphData(state);
};

const mapDispatchToProps = (_: (f: any) => void) => {
  return {};
};

interface AppState {
  engine: DiagramEngine;
  model: DiagramModel;
  nodeData: { [key: string]: CustomNodeModel };
  filterMenuToggle: boolean;
  filterMode: number;
}

interface AppProps {
  classes: any;
  systemData: SystemGraphInterface; // data to draw the graph;

  pbsNodePosition: {
    [key: string]: { visible: boolean; position: Array<number> };
  }; // Position of node from PBS view;
  pbsData: IDict<any>;
}

export class GraphPanel extends Component<AppProps, AppState> {
  engine: DiagramEngine;
  model: DiagramModel;
  private _divRef: React.RefObject<HTMLDivElement>;
  private _defaultPosition: IDict<any>;
  constructor(props: AppProps) {
    super(props);

    this.engine = createEngine();

    this.engine.getLinkFactories().registerFactory(new AdvancedLinkFactory());
    this.engine.getNodeFactories().registerFactory(new CustomNodeFactory());
    this.model = new DiagramModel();
    const engineState = this.engine.getStateMachine().getCurrentState();
    if (engineState instanceof DefaultDiagramState) {
      engineState.dragNewLink.config.allowLooseLinks = false;
    }
    this.engine.setModel(this.model);
    this._divRef = React.createRef<HTMLDivElement>();
    this.state = {
      engine: this.engine,
      model: this.model,
      nodeData: {},
      filterMenuToggle: false,
      filterMode: 0
    };
  }

  /**
   *  This function extract the data from a `AdvancedLinkModel`
   *  and return the target and source port of this link with
   *  correct system name.
   *
   * @static
   * @param {AdvancedLinkModel} linkElement
   * @returns
   * @memberof GraphPanel
   */
  static connectionDataGenerator(linkElement: AdvancedLinkModel) {
    const sourcePort = linkElement.getSourcePort();
    const sourcePortName: string = sourcePort.getName();
    const sourceSystem: string = sourcePort.getParent().getOptions()['name'];
    const targetPort = linkElement.getTargetPort();
    const targetPortName: string = targetPort.getName();
    const targetSystem: string = targetPort.getParent().getOptions()['name'];
    let connection: string[];
    let sysKey: string;
    if (!targetSystem.includes('.')) {
      sysKey = targetSystem;
      connection = [
        targetPortName,
        sourceSystem.replace(sysKey + '.', '') + '.' + sourcePortName
      ];
    } else {
      if (!sourceSystem.includes('.')) {
        sysKey = sourceSystem;
        connection = [
          targetSystem.replace(sysKey + '.', '') + '.' + targetPortName,
          sourcePortName
        ];
      } else {
        const sourceSysArray = sourceSystem.split('.');
        const targetSysArray = targetSystem.split('.');
        sysKey = sourceSysArray[0];

        for (
          let index = 1;
          index < Math.min(sourceSysArray.length, targetSysArray.length);
          index++
        ) {
          if (sourceSysArray[index] === targetSysArray[index]) {
            sysKey = sysKey.concat('.' + sourceSysArray[index]);
          } else {
            break;
          }
        }
        const targetConnection =
          targetSystem.replace(sysKey, '') + '.' + targetPortName;
        const sourceConnection =
          sourceSystem.replace(sysKey, '') + '.' + sourcePortName;
        connection = [
          targetConnection.replace(/^./, ''),
          sourceConnection.replace(/^./, '')
        ];
      }
    }
    return { sysKey, connection };
  }

  /**
   * This function contains the logic to save the graph each
   * time the `saveSignal` is updated and to update the node positions
   * each time the tab is activated
   * @param {AppProps} prevProps
   * @param {AppState} prevState
   * @memberof GraphPanel
   */
  componentDidUpdate() {}

  /**
   * This function create the link data from system name
   * and connection.
   *
   * @static
   * @param {string} systemName
   * @param {string[]} connection
   * @returns
   * @memberof GraphPanel
   */
  static createLink(systemName: string, connection: string[]) {
    const start = connection[1];
    const end = connection[0];
    let startSys, endSys, startPort, endPort;
    if (start.includes('.')) {
      const sysArray = start.split('.');
      startPort = sysArray[sysArray.length - 1];
      startSys =
        systemName + '.' + sysArray.slice(0, sysArray.length - 1).join('.');
    } else {
      startSys = systemName;
      startPort = start;
    }
    if (end.includes('.')) {
      const sysArray = end.split('.');
      endPort = sysArray[sysArray.length - 1];
      endSys =
        systemName + '.' + sysArray.slice(0, sysArray.length - 1).join('.');
    } else {
      endSys = systemName;
      endPort = end;
    }
    return { startSys, endSys, startPort, endPort };
  }

  /**
   *
   *
   * @private
   * @memberof GraphPanel
   */
  private createNodeFromData = (
    propsData: SystemGraphInterface,
    systemList: string[] = []
  ): { [key: string]: CustomNodeModel } => {
    const newNodeData: { [key: string]: CustomNodeModel } = {};
    for (let index = 0; index < propsData.systemList.length; index++) {
      const sysName = propsData.systemList[index];
      if (systemList.length > 0 && !systemList.includes(sysName)) {
        continue;
      }
      const inPortList = propsData.systemGraphData[sysName].inPort;
      const outPortList = propsData.systemGraphData[sysName].outPort;

      const node: CustomNodeModel = GraphPanel.createNode(
        sysName,
        inPortList,
        outPortList
      );

      if (propsData.systemGraphData[sysName].position) {
        const nodeX: number = propsData.systemGraphData[sysName].position[0];
        const nodeY: number = propsData.systemGraphData[sysName].position[1];
        node.setPosition(nodeX, nodeY);
      }
      newNodeData[sysName] = node;
    }
    return newNodeData;
  };

  private creatConnectionFromData = (
    propsData: SystemGraphInterface,
    newNodeData: { [key: string]: CustomNodeModel },
    pathfinding: any,
    relatedNode: string[] = []
  ) => {
    const linkList = [];
    propsData.systemList.forEach(systemName => {
      if (relatedNode.length > 0 && !relatedNode.includes(systemName)) {
        return;
      }
      const connectionList: Array<Array<string>> =
        propsData.systemGraphData[systemName].connections;
      connectionList.forEach(connection => {
        const { startSys, endSys, startPort, endPort } = GraphPanel.createLink(
          systemName,
          connection
        );
        const nodeStart = newNodeData[startSys];
        const nodeEnd = newNodeData[endSys];

        if (
          startPort in nodeStart.getPorts() &&
          endPort in nodeEnd.getPorts()
        ) {
          const portSource = nodeStart.getPorts()[startPort] as CustomPortModel;
          const portSink = nodeEnd.getPorts()[endPort] as CustomPortModel;

          const link = portSource.link(portSink, pathfinding);
          linkList.push(link);
        }
      });
    });

    return linkList;
  };

  /**
   * The connection graph is created in componentDidMount method
   *
   * @memberof GraphPanel
   */
  componentDidMount() {
    const newNodeData = this.createNodeFromData(this.props.systemData);
    Object.values(newNodeData).forEach(node => {
      this.model.addNode(node);
    });

    const pathfinding = this.engine
      .getLinkFactories()
      .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME);
    const linkList = this.creatConnectionFromData(
      this.props.systemData,
      newNodeData,
      pathfinding
    );

    linkList.forEach(element => {
      this.model.addLink(element);
    });
    this._defaultPosition = this.createDefaultPosition();

    this.setState(
      () => ({
        engine: this.engine,
        model: this.model,
        nodeData: newNodeData
      }),
      () => {
        setTimeout(this.syncPosition, 500);
      }
    );
    this.model.setLocked(true);
  }

  createDefaultPosition = () => {
    let pbsNodePosition: IDict<any>;
    if (Object.keys(this.props.pbsNodePosition).length === 0) {
      let data = {};
      if (this.props.pbsData.nodeData.length > 0) {
        data = JSON.parse(JSON.stringify(this.props.pbsData.nodeData[0]));
      }
      const container = document.createElement('div');
      const width = this._divRef.current.clientWidth;
      const height = this._divRef.current.clientHeight;
      const graph = new G6.TreeGraph({
        container,
        width,
        height,

        fitView: true,
        layout: {
          type: 'compactBox',
          direction: 'TB',
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
      graph.data(data);
      // graph.render();
      graph.layout(true);
      const posData = {
        __$graph_style$__: { visible: false, position: [0, 0] }
      };
      const nodeList = graph.getNodes();
      nodeList.forEach(node => {
        const data = node.get('model');
        if (posData[data.id]) {
          posData[data.id].position = [data.x, data.y];
        } else {
          posData[data.id] = { visible: true, position: [data.x, data.y] };
        }
      });
      pbsNodePosition = posData;
    } else {
      pbsNodePosition = { ...this.props.pbsNodePosition };
    }
    return pbsNodePosition;
  };

  /**
   * This function compute the zoom factor from
   * the  bounding box of the graph and the `margin`
   *
   * @private
   * @memberof GraphPanel
   */
  private autoZoomGraph = () => {
    const engine = this.state.engine;
    const model = this.state.model;
    const allNodes = model
      .getNodes()
      .filter((node: CustomNodeModel) => node.isVisible())
      .map(node => node) as Array<CustomNodeModel>;
    const nodesRect = engine.getBoundingNodesRect(allNodes);
    if (nodesRect) {
      // there is something we should zoom on

      const canvasRect = engine.getCanvas().getBoundingClientRect();
      const canvasTopLeftPoint = {
        x: canvasRect.left,
        y: canvasRect.top
      };
      const nodeLayerTopLeftPoint = {
        x: canvasTopLeftPoint.x + model.getOffsetX(),
        y: canvasTopLeftPoint.y + model.getOffsetY()
      };

      const xFactor = engine.getCanvas().clientWidth / nodesRect.getWidth();
      const yFactor = engine.getCanvas().clientHeight / nodesRect.getHeight();
      const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

      this.model.setZoomLevel(zoomFactor * 100);

      const nodesRectTopLeftPoint = {
        x: nodeLayerTopLeftPoint.x + nodesRect.getTopLeft().x * zoomFactor,
        y: nodeLayerTopLeftPoint.y + nodesRect.getTopLeft().y * zoomFactor
      };
      const width = nodesRect.getWidth() * zoomFactor;
      const height = nodesRect.getHeight() * zoomFactor;
      const hOffset = (canvasRect.width - width) / 2;
      const vOffset = (canvasRect.height - height) / 2;
      this.model.setOffset(
        this.model.getOffsetX() +
          canvasTopLeftPoint.x -
          nodesRectTopLeftPoint.x +
          hOffset,
        this.model.getOffsetY() +
          canvasTopLeftPoint.y -
          nodesRectTopLeftPoint.y +
          vOffset
      );

      engine.repaintCanvas();
    }
  };

  /**
   * Create a `CustomNodeModel` from system name and
   * list of in/out port
   *
   * @static
   * @param {string} sysName
   * @param {string[]} inPortList
   * @param {string[]} outPortList
   * @returns
   * @memberof GraphPanel
   */
  static createNode(
    sysName: string,
    inPortList: string[],
    outPortList: string[]
  ) {
    const node = new CustomNodeModel(sysName, 'rgb(0,192,255)');

    inPortList.forEach(portName => {
      const inp = new CustomPortModel(true, portName, portName);

      node.addPort(inp);
    });
    outPortList.forEach(portName => {
      const outp = new CustomPortModel(false, portName, portName);

      node.addPort(outp);
    });
    return node;
  }

  /**
   * Update node position from PBS view
   *
   * @private
   * @memberof GraphPanel
   */
  private syncPosition = () => {
    let pbsNodePosition: any;
    if (Object.keys(this.props.pbsNodePosition).length === 0) {
      pbsNodePosition = this._defaultPosition;
    } else {
      pbsNodePosition = this.props.pbsNodePosition;
    }
    const currentModel = this.state.model;
    const disabledNode = [];
    const nodes = currentModel.getNodes() as Array<CustomNodeModel>;
    const radial = pbsNodePosition['__$graph_style$__'].visible;

    let scaleFactor = 3;
    if (radial) {
      scaleFactor = 1;
    }

    nodes.forEach(node => {
      const nodeName = node.getOptions()['name'];
      const positionData = pbsNodePosition[nodeName].position;
      if (positionData) {
        node.setPosition(
          scaleFactor * positionData[0],
          scaleFactor * positionData[1]
        );
      } else {
        disabledNode.push(nodeName);
        node.setVisible(false);
      }
    });

    this.setState(
      oldState => ({
        ...oldState,
        model: currentModel
      }),
      () => {
        this.autoZoomGraph();
      }
    );
  };

  render() {
    return (
      <div className={'cosapp-widget-box'}>
        <div ref={this._divRef} style={{ height: 'calc(100% - 30px)' }}>
          <BaseCanvasWidget>
            <CanvasWidget engine={this.state.engine} />
          </BaseCanvasWidget>
        </div>
        <div style={{ height: '30px', display: 'flex', background: '#e0e0e0' }}>
          <Button onClick={this.syncPosition}>Update position</Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(GraphPanel)
);
