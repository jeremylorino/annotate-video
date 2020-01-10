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
  constructor(props) {
    super(props);

    this.state = {
      doc: {
        id: null,
        data: () => {
          return { url: null, annotatedList: [] };
        }
      },
      playing: false,
      duration: 0,
      seeking: null,
      played: 0,
      loaded: 0,
      value: '',
      selectedIndex: null
    };

    const { firebase } = this.props;
    const db = firebase.db;

    db.doc('videos/F1v1YAxhPxPrNLSiaspK').onSnapshot(doc => {
      console.log(`${doc.id} =>`, doc.data());
      this.setState({
        doc,
        url: doc.data().url,
        annotatedList: doc.data().annotatedList
      });
    });
  }

  get doc() {
    return this.state.doc;
  }

  get url() {
    return this.state.doc.data().url;
  }

  get annotatedList() {
    const { annotatedList } = this.state.doc.data();
    return annotatedList.sort((a, b) => a.timestamp - b.timestamp);
  }

  handlePlay = () => {
    // console.log('onPlay');
    this.setState({ playing: true });
  };

  handlePause = () => {
    // console.log('onPause');
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
    // console.log('onProgress', state);
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state);
    }
  };

  handleEnded = () => {
    // console.log('onEnded');
    this.setState({ playing: this.state.loop });
  };

  handleDuration = duration => {
    console.log('onDuration', duration);
    this.setState({ duration });
  };

  annotateVideo = async () => {
    const { value } = this.state;
    const { doc, annotatedList } = this;
    const data = {
      text: value,
      timestamp: this.player.getCurrentTime(),
      durationBefore: 0,
      durationAfter: 0
    };
    annotatedList.push(data);
    try {
      console.log(doc);
      await doc.ref.update({ annotatedList });
      this.setState({ value: '' });
    } catch (err) {
      console.error(err);
    }
  };

  handleSelect = selectedIndex => {
    const { annotatedList } = this;
    this.player.seekTo(annotatedList[selectedIndex].timestamp);
    this.setState({ selectedIndex });
  };

  ref = player => {
    this.player = player;
  };

  render() {
    const {
      // doc,
      playing,
      selectedIndex,
      loaded,
      played,
      duration
    } = this.state;
    const { url, annotatedList } = this;

    return (
      <Grid>
        <Row>
          <Cell columns={12}>
            <ReactPlayer
              width="100%"
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
            <IconButton
              style={{
                position: 'absolute',
                color: 'yellow',
                top: '1px'
              }}
            >
              <MaterialIcon icon="bookmark" />
            </IconButton>
          </Cell>
          <Cell columns={12}>
            <Duration seconds={duration}></Duration>
            <LinearProgress
              bufferingDots={false}
              buffer={loaded}
              progress={played}
              style={{ width: '640px' }}
            />
            <div style={{ width: '640px', minHeight: '28px' }}>
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
                          primaryText={v.text}
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
        </Row>
      </Grid>
    );
  }
}

export default App;
