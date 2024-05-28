import * as React from 'react';

export interface CanvasWidgetProps {
  color?: string;
  background?: string;
  children: any;
}

export class BaseCanvasWidget extends React.Component<CanvasWidgetProps> {
  render() {
    return <div className="graphView">{this.props.children}</div>;
  }
}
