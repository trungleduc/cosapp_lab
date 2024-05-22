import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';
import { Styles } from '@material-ui/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
interface IProps {
  moduleData: {
    name: string;
    title: string;
    meta: { [key: string]: string };
  };
  classes: any;
}
interface IState {
  raised: number;
  shortDesc: string;
  openSetting: boolean;
}

const styles: Styles<{}, {}> = () => ({
  root: {
    minWidth: 275,
    height: 200,
    display: 'flex',
    flexDirection: 'column',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});
const DESC_LENGTH = 100;
class ModuleCard extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    let shortDesc = props.moduleData.title;
    if (props.moduleData.meta['description']) {
      shortDesc = props.moduleData.meta['description'];
    }
    this.state = { raised: 10, shortDesc, openSetting: false };
  }

  onMouseOver = () => this.setState({ raised: 20 });

  onMouseOut = () => this.setState({ raised: 10 });

  startModule = () =>
  {
    window.sessionStorage.removeItem('adso_kernel_name');
    window.sessionStorage.removeItem('adso_kernel_id');
    const currentUrl = window.location.href.split('?')[0]
    const baseUrl = currentUrl.endsWith('/')? currentUrl.slice(0, -1) : currentUrl
    window.location.href = `${baseUrl}/module/${this.props.moduleData.name}`
  }

  render = () => {
    const { classes } = this.props;
    let moduleName = '';
    let readme = this.state.shortDesc;
    if (this.props.moduleData.meta.version) {
      moduleName = `${this.props.moduleData.name} ${this.props.moduleData.meta.version}`;
    } else {
      moduleName = `${this.props.moduleData.name}}`;
    }
    if (this.props.moduleData.meta.readme) {
      readme = this.props.moduleData.meta.readme;
    }
    return (
      <div>
        <Dialog
          open={this.state.openSetting}
          aria-labelledby='draggable-dialog-title'
          fullWidth={true}
          maxWidth='md'>
          <DialogTitle className='draggable-dialog-title'>
            {this.props.moduleData.title}
          </DialogTitle>
          <DialogContent>
            <Typography variant='body1' style={{ whiteSpace: 'pre-line' }}>
              {readme}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => {
                this.setState((old) => ({ ...old, openSetting: false }));
              }}
              color='primary'>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Card
          className={classes.root}
          elevation={this.state.raised}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          style={{
            background: this.state.raised === 10 ? 'aliceblue' : '#cfe9ff',
          }}>
          <CardContent style={{ flexGrow: 1, padding: '16px 16px 0px 16px' }}>
            <Typography variant='h5' component='h2'>
              {this.props.moduleData.title}
            </Typography>
            <Typography
              className={classes.title}
              color='textSecondary'
              gutterBottom>
              Module : {moduleName}
            </Typography>
            <Typography
              variant='body2'
              component='p'
              style={{ maxHeight: 80, overflow: 'hidden' }}>
              {this.state.shortDesc}
            </Typography>
          </CardContent>
          <CardActions style={{ justifyContent: 'space-between' }}>
            <Button
              size='small'
              onClick={() => {
                this.setState((old) => ({ ...old, openSetting: true }));
              }}>
              Learn More
            </Button>
            <Button
              onClick = {this.startModule}
              color='primary'
              size='small'>
              Start
            </Button>
          </CardActions>
        </Card>
      </div>
    );
  };
}

export default withStyles(styles)(ModuleCard);
