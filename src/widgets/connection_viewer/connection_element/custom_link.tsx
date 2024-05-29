import { Point } from '@projectstorm/geometry';
import {
  AbstractModelFactory,
  DeserializeEvent
} from '@projectstorm/react-canvas-core';
import {
  DefaultLinkFactory,
  DefaultLinkModel,
  DefaultLinkWidget,
  DefaultNodeFactory,
  DefaultNodeModel,
  DefaultNodeWidget,
  DefaultPortModel,
  LinkModel
} from '@projectstorm/react-diagrams';
import {
  DiagramEngine,
  LinkWidget,
  PointModel,
  PortModel,
  PortWidget
} from '@projectstorm/react-diagrams-core';
import React from 'react';

export class AdvancedLinkModel extends DefaultLinkModel {
  private _visible: boolean;

  constructor() {
    super({
      type: 'advanced',
      width: 2
    });
    this._visible = true;
  }

  serialize(): any {
    if (this.getSourcePort() && this.getTargetPort()) {
      const source = this.getSourcePort().getParent() as CustomNodeModel;
      const target = this.getTargetPort().getParent() as CustomNodeModel;
      this._visible = source.isVisible() && target.isVisible();
    } else {
      this._visible = true;
    }
    return {
      ...super.serialize(),
      visible: this._visible
    };
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this._visible = event.data.visible;
  }

  isVisible = () => this._visible;
}

export class AdvancedLinkFactory extends DefaultLinkFactory {
  // generateLinkSegment(
  //   model: DefaultLinkModel,
  //   selected: boolean,
  //   path: string
  // ) {
  //   return (
  //     <Path
  //       selected={true}
  //       stroke={
  //         selected ? model.getOptions().selectedColor : model.getOptions().color
  //       }
  //       strokeWidth={model.getOptions().width}
  //       d={path}
  //     />
  //   );
  // }

  constructor() {
    super('advanced');
  }
  generateModel(): AdvancedLinkModel {
    return new AdvancedLinkModel();
  }

  generateReactWidget(event): JSX.Element {
    return (
      <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />
    );
  }
}

export class CustomPortModel extends DefaultPortModel {
  canLinkToPort(port: PortModel): boolean {
    if (port instanceof CustomPortModel) {
      if (!this.options.in && !port.getOptions().in) {
        return false;
      } else {
        return true;
      }
    }
    return true;
  }
  createLinkModel(_?: AbstractModelFactory<LinkModel>) {
    return new AdvancedLinkModel();
  }
}

export class CustomNodeModel extends DefaultNodeModel {
  private _visible: boolean;
  constructor(name: string, color: string, visible = true) {
    super(name, color);
    this._visible = visible;
  }

  serialize(): any {
    return {
      ...super.serialize(),
      visible: this._visible
    };
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this._visible = event.data.visible;
  }

  setVisible = (value: boolean) => {
    this._visible = value;
  };
  isVisible = () => this._visible;
}

export class CustomNodeFactory extends DefaultNodeFactory {
  generateReactWidget(event: any): JSX.Element {
    return <CustomNodeWidget engine={this.engine} node={event.model} />;
  }
}

class CustomNodeWidget extends DefaultNodeWidget {
  generatePort = (port: DefaultPortModel) => {
    return (
      <CustomPortLabel
        engine={this.props.engine}
        port={port}
        key={port.getID()}
      />
    );
  };

  render() {
    const element = super.render();
    const nodeModel = this.props.node as CustomNodeModel;
    return (
      // <div style = {{visibility : nodeModel.isVisible()? "visible" : "hidden" }}>
      <div style={{ display: nodeModel.isVisible() ? 'unset' : 'none' }}>
        {element}
      </div>
    );
  }
}

export interface DefaultPortLabelProps {
  port: DefaultPortModel;
  engine: DiagramEngine;
}

class CustomPortLabel extends React.Component<DefaultPortLabelProps> {
  render() {
    const port = (
      <PortWidget engine={this.props.engine} port={this.props.port}>
        <div className="S_Port"></div>
      </PortWidget>
    );
    const outPort = (
      <PortWidget engine={this.props.engine} port={this.props.port}>
        <div className="S_OutPort"></div>
      </PortWidget>
    );

    const label = (
      <div style={{ padding: '0 5px', flexGrow: 1 }}>
        {this.props.port.getOptions().label}
      </div>
    );

    return (
      <div style={{ display: 'flex', marginTop: '1px', alignItems: 'center' }}>
        {this.props.port.getOptions().in ? port : label}
        {this.props.port.getOptions().in ? label : outPort}
      </div>
    );
  }
}

const CustomLinkArrowWidget = props => {
  const { point, previousPoint, parentThis } = props;

  const angle =
    90 +
    (Math.atan2(
      point.getPosition().y - previousPoint.getPosition().y,
      point.getPosition().x - previousPoint.getPosition().x
    ) *
      180) /
      Math.PI;

  return (
    <g
      className="arrow"
      transform={
        'translate(' +
        point.getPosition().x +
        ', ' +
        point.getPosition().y +
        ')'
      }
    >
      <g style={{ transform: 'rotate(' + angle + 'deg)' }}>
        <g transform={'translate(0, -3)'}>
          <polygon
            points="0,10 5,25 -5,25"
            fill={props.color}
            onMouseLeave={() => {
              parentThis.setState({ selected: false });
            }}
            onMouseEnter={() => {
              parentThis.setState({ selected: true });
            }}
            data-id={point.getID()}
            data-linkid={point.getLink().getID()}
          ></polygon>
        </g>
      </g>
    </g>
  );
};

export class AdvancedLinkWidget extends DefaultLinkWidget {
  renderStatus = false;

  generateArrow(point: PointModel, previousPoint: PointModel): JSX.Element {
    return (
      <CustomLinkArrowWidget
        key={point.getID()}
        point={point as any}
        previousPoint={previousPoint as any}
        colorSelected={this.props.link.getOptions().selectedColor}
        color={this.props.link.getOptions().color}
        parentThis={this}
      />
    );
  }

  render() {
    //ensure id is present for all points on the path

    const points = this.props.link.getPoints();
    const paths = [];
    this.refPaths = [];
    if (
      this.props.link.getSourcePort() !== null &&
      this.props.link.getTargetPort() !== null
    ) {
      let posX, posX2;
      const startDirection = this.props.link.getSourcePort().getOptions()[
        'alignment'
      ];
      const endDirection = this.props.link.getTargetPort().getOptions()[
        'alignment'
      ];
      const posY = points[0].getY();
      const posY2 = points[points.length - 1].getY();
      let midY;
      if (startDirection === 'left' && endDirection === 'left') {
        posX = points[0].getX() - 50;
        posX2 = points[points.length - 1].getX() - 50;
        if (Math.abs(posY - posY2) < 50) {
          midY = (posY + posY2) / 2 + 50;
        } else {
          midY = (posY + posY2) / 2;
        }
      } else if (startDirection === 'left' && endDirection === 'right') {
        posX = points[0].getX() - 50;
        posX2 = points[points.length - 1].getX() + 50;
        if (posX > posX2) {
          midY = (posY + posY2) / 2;
        } else {
          if (Math.abs(posY - posY2) < 50) {
            midY = (posY + posY2) / 2 + 50;
          } else {
            midY = (posY + posY2) / 2;
          }
        }
      } else if (startDirection === 'right' && endDirection === 'left') {
        posX = points[0].getX() + 50;
        posX2 = points[points.length - 1].getX() - 50;
        if (posX < posX2) {
          midY = (posY + posY2) / 2;
        } else {
          if (Math.abs(posY - posY2) < 50) {
            midY = (posY + posY2) / 2 + 50;
          } else {
            midY = (posY + posY2) / 2;
          }
        }
      } else if (startDirection === 'right' && endDirection === 'right') {
        posX = points[0].getX() + 50;
        posX2 = points[points.length - 1].getX() + 50;
        if (Math.abs(posY - posY2) < 50) {
          midY = (posY + posY2) / 2 + 50;
        } else {
          midY = (posY + posY2) / 2;
        }
      }

      if (points.length === 2) {
        const newPoint = new PointModel({
          link: this.props.link,
          position: new Point(posX, posY)
        });

        const newPoint2 = new PointModel({
          link: this.props.link,
          position: new Point(posX2, posY2)
        });
        this.props.link.addPoint(newPoint, 1);
        this.props.link.addPoint(newPoint2, -1);

        const newPoint3 = new PointModel({
          link: this.props.link,
          position: new Point(posX, midY)
        });

        const newPoint4 = new PointModel({
          link: this.props.link,
          position: new Point(posX2, midY)
        });

        this.props.link.addPoint(newPoint3, 2);
        this.props.link.addPoint(newPoint4, -2);
      } else {
        if (points.length > 3) {
          points[1].setPosition(new Point(posX, posY));
          points[points.length - 2].setPosition(new Point(posX2, posY2));
          points[2].setPosition(new Point(posX, midY));
          points[points.length - 3].setPosition(new Point(posX2, midY));
          if (points.length > 6) {
            points.splice(3, points.length - 6);
          }
        }
      }
    }
    //draw the multiple anchors and complex line instead
    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          LinkWidget.generateLinePath(points[j], points[j + 1]),
          {
            'data-linkid': this.props.link.getID(),
            'data-point': j
          },
          j
        )
      );
    }

    if (this.props.link.getTargetPort() !== null) {
      paths.push(
        this.generateArrow(points[points.length - 1], points[points.length - 2])
      );
    } else {
      paths.push(this.generatePoint(points[points.length - 1]));
    }
    const linkModel = this.props.link as AdvancedLinkModel;
    return (
      <g
        style={{ display: linkModel.isVisible() ? 'unset' : 'none' }}
        data-default-link-test={this.props.link.getOptions().testName}
      >
        {paths}
      </g>
    );
  }
}
