import React, { Component } from 'react';

import './App.scss';

import ReactPlayer from 'react-player';
import { format as durationFormat } from './Duration';

import { Cell, Grid, Row } from '@material/react-layout-grid';
import TextField, { HelperText, Input } from '@material/react-text-field';
import { Button } from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import List, { ListItem, ListItemText } from '@material/react-list';

class App extends Component {
  state = {
    url:
      'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    playing: false,
    duration: 0,
    seeking: null,
    played: 0,
    value: '',
    selectedIndex: null,
    annotatedList: [
      {
        primaryText: 'stretching',
        secondaryText: '50'
      },
      {
        primaryText: 'smelling flowers',
        secondaryText: '75'
      },
      {
        primaryText: 'looking at tree',
        secondaryText: '90'
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
      secondaryText: this.player.getCurrentTime()
    };
    console.log('onAnnotate', data);
    annotatedList.push(data);
    this.setState({ annotatedList });
  };

  ref = player => {
    this.player = player;
  };

  render() {
    const { url, playing, annotatedList, selectedIndex } = this.state;
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
                  handleSelect={selectedIndex => {
                    this.player.seekTo(
                      parseFloat(annotatedList[selectedIndex].secondaryText)
                    );
                    this.setState({ selectedIndex });
                  }}
                >
                  {annotatedList.map((v, i) => {
                    return (
                      <ListItem key={i}>
                        <ListItemText
                          primaryText={v.primaryText}
                          secondaryText={durationFormat(v.secondaryText)}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Cell>
            </Row>
          </Cell>
          <Cell columns={12 - 4}>
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
        </Row>
      </Grid>
    );
  }
}

export default App;
