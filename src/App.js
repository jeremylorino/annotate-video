import React, { Component } from 'react';

import './App.scss';

import ReactPlayer from 'react-player';
import Duration, { format as durationFormat } from './Duration';

import { Cell, Grid, Row } from '@material/react-layout-grid';
import TextField, { HelperText, Input } from '@material/react-text-field';
import Button from '@material/react-button';
import IconButton from '@material/react-icon-button';
import MaterialIcon from '@material/react-material-icon';
import List, {
  ListItem,
  ListItemText,
  ListItemMeta
} from '@material/react-list';
import LinearProgress from '@material/react-linear-progress';

class App extends Component {
  state = {
    url:
      'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    playing: false,
    duration: 0,
    seeking: null,
    played: 0,
    loaded: 0,
    value: '',
    selectedIndex: null,
    annotatedList: [
      {
        primaryText: 'stretching',
        timestamp: 50
      },
      {
        primaryText: 'smelling flowers',
        timestamp: 75
      },
      {
        primaryText: 'looking at tree',
        timestamp: 90
      },
      {
        primaryText: 'squirrel in the headlights',
        timestamp: 336
      }
    ]
  };

  handlePlay = () => {
    console.log('onPlay');
    this.setState({ playing: true });
  };

  handlePause = () => {
    console.log('onPause');
    this.setState({ playing: false });
  };

  handleSeekMouseDown = e => {
    this.setState({ seeking: true });
  };

  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) });
  };

  handleSeekMouseUp = e => {
    this.setState({ seeking: false });
    this.player.seekTo(parseFloat(e.target.value));
  };

  handleProgress = state => {
    console.log('onProgress', state);
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state);
    }
  };

  handleEnded = () => {
    console.log('onEnded');
    this.setState({ playing: this.state.loop });
  };

  handleDuration = duration => {
    console.log('onDuration', duration);
    this.setState({ duration });
  };

  annotateVideo = () => {
    const { annotatedList, value } = this.state;
    const data = {
      primaryText: value,
      timestamp: this.player.getCurrentTime()
    };
    console.log('onAnnotate', data);
    annotatedList.push(data);
    this.setState({ annotatedList, value: '' });
  };

  handleSelect = selectedIndex => {
    const { annotatedList } = this.state;
    this.player.seekTo(annotatedList[selectedIndex].timestamp);
    this.setState({ selectedIndex });
  };

  ref = player => {
    this.player = player;
  };

  render() {
    const {
      url,
      playing,
      annotatedList,
      selectedIndex,
      loaded,
      played,
      duration
    } = this.state;
    return (
      <Grid>
        <Row>
          <Cell columns={4}>
            <Row>
              <Cell columns={12}>
                <form onSubmit={ev => ev.preventDefault()}>
                  <TextField
                    label="tag here"
                    helperText={<HelperText>Help Me!</HelperText>}
                    onTrailingIconSelect={() => this.setState({ value: '' })}
                    trailingIcon={<MaterialIcon role="button" icon="delete" />}
                  >
                    <Input
                      value={this.state.value}
                      onChange={e =>
                        this.setState({ value: e.currentTarget.value })
                      }
                    />
                  </TextField>
                  <Button onClick={this.annotateVideo} type="submit">
                    Annotate
                  </Button>
                </form>
              </Cell>
              <Cell columns={12}>
                <List
                  singleSelection
                  selectedIndex={selectedIndex}
                  handleSelect={this.handleSelect}
                >
                  {annotatedList.map((v, i) => {
                    return (
                      <ListItem key={i}>
                        <ListItemText
                          primaryText={v.primaryText}
                          secondaryText={durationFormat(v.timestamp)}
                        />
                        <ListItemMeta
                          meta={`${((v.timestamp / duration) * 100).toFixed(
                            2
                          )}%`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Cell>
            </Row>
          </Cell>
          <Cell columns={12 - 4}>
            <Row>
              <Cell columns={12}>
                <ReactPlayer
                  ref={this.ref}
                  controls={true}
                  url={url}
                  playing={playing}
                  onReady={() => console.log('onReady')}
                  onStart={() => console.log('onStart')}
                  onPlay={this.handlePlay}
                  onPause={this.handlePause}
                  onBuffer={() => console.log('onBuffer')}
                  onSeek={e => console.log('onSeek', e)}
                  onEnded={this.handleEnded}
                  onError={e => console.log('onError', e)}
                  onProgress={this.handleProgress}
                  onDuration={this.handleDuration}
                />
              </Cell>
              <Cell columns={12}>
                <Duration seconds={duration}></Duration>
                <LinearProgress
                  bufferingDots={false}
                  buffer={loaded}
                  progress={played}
                  style={{ width: '640px' }}
                />
                <div style={{ width: '640px' }}>
                  {annotatedList.map((v, i) => {
                    const position = (v.timestamp / duration).toFixed(2);
                    return (
                      <IconButton
                        key={i}
                        title={v.primaryText}
                        onClick={() => {
                          return this.handleSelect(i);
                        }}
                        style={{
                          position: 'absolute',
                          transform: `translateX(${position * 640 - 22}px)`
                        }}
                      >
                        <MaterialIcon
                          icon={
                            selectedIndex === i ? 'bookmark' : 'bookmark_border'
                          }
                        />
                      </IconButton>
                    );
                  })}
                </div>
              </Cell>
            </Row>
          </Cell>
        </Row>
      </Grid>
    );
  }
}

export default App;
