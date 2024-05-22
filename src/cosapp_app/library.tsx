import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { Styles } from '@material-ui/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import ModuleCard from './module_card';
import CoSAppGetUrl from './cosapp_url';
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

const styles: Styles<{}, {}> = () => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    padding: 20,
  },
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
          {this.state.tileData.map((tile) => (
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
  const { BASEURL, COSAPP_MODULE } = CoSAppGetUrl();
  const URL = `${BASEURL}cosapp/code`;
  fetch(URL)
    .then(
      (response) => response.json(),
      (reason) => {
        alert('Server connection failed');
      }
    )
    .then(
      (data) => {
        const comp = <StyledLibrary libData={data.libData} />;
        ReactDOM.render(comp, document.getElementById('main'));
      },
      (reason) => {
        alert('Server connection failed');
      }
    );
}

main();
