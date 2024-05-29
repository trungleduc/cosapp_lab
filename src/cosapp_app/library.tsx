import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Styles } from '@material-ui/styles/withStyles';
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';

import CoSAppGetUrl from './cosapp_url';
import ModuleCard from './module_card';

interface IProps {
  libData: {
    [key: string]: {
      code: string;
      title: string;
      meta: { [key: string]: string };
    };
  };
  classes: any;
}
interface IState {
  tileData: Array<{
    name: string;
    title: string;
    meta: { [key: string]: string };
  }>;
}

const styles: Styles<any, any> = () => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    padding: 20
  }
});

class Library extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    const tileData: Array<{
      name: string;
      title: string;
      meta: { [key: string]: string };
    }> = [];
    for (const [name, value] of Object.entries(props.libData)) {
      tileData.push({ name, title: value.title, meta: value.meta });
    }
    this.state = { tileData };
  }

  render = () => {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={6}>
          {this.state.tileData.map(tile => (
            <Grid key={tile.name} item xs={3} style={{ minWidth: 300 }}>
              <ModuleCard moduleData={tile} />
            </Grid>
          ))}
        </Grid>
      </div>
    );
    // ;
  };
}

const StyledLibrary = withStyles(styles)(Library);
function main() {
  const { BASEURL } = CoSAppGetUrl();
  const URL = `${BASEURL}cosapp/code`;
  fetch(URL)
    .then(
      response => response.json(),
      () => {
        alert('Server connection failed');
      }
    )
    .then(
      data => {
        const comp = <StyledLibrary libData={data.libData} />;
        const root = createRoot(document.getElementById('main'));
        root.render(comp);
      },
      () => {
        alert('Server connection failed');
      }
    );
}

main();
