import React, { Component } from 'react';

import './App.scss';

import Duration, { format as durationFormat } from './Duration';
import { VideoPlayer } from './components/VideoPlayer';

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
      doc: null,
      loaded: false,
      value: '',
      selectedIndex: null
    };

    const { firebase } = this.props;
    const db = firebase.db;

    db.doc('videos/mC5h7yldgnk0nFyk8b1D').onSnapshot(doc => {
      console.log(`${doc.id} =>`, doc.data());
      this.setState({
        doc,
        url: doc.data().url,
        annotatedList: doc.data().annotatedList || []
      });
    });
  }

  get doc() {
    return this.state.doc;
  }

  get url() {
    return this.state.url;
  }

  get annotatedList() {
    const { annotatedList } = this.state;
    return (annotatedList || []).sort((a, b) => a.timestamp - b.timestamp);
  }

  annotateVideo = async () => {
    this.player.pause();

    const { value } = this.state;
    const duration = this.player.duration;
    const { doc, annotatedList } = this;
    const data = {
      text: value,
      timestamp: this.player.getCurrentTime(),
      durationBefore: 0,
      durationAfter: 0
    };
    data.durationBefore = data.timestamp - 30;
    if (data.durationBefore < 0) data.durationBefore = 0;
    data.durationAfter = data.timestamp + 30;
    if (data.durationAfter > duration) data.durationAfter = duration;
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
    this.player.seekTo(annotatedList[selectedIndex].durationBefore);
    this.setState({ selectedIndex });
    this.player.play();
  };

  handleDuration = duration => {
    this.setState({ duration });
  };

  ref = player => {
    this.player = player;
  };

  render() {
    const { selectedIndex } = this.state;
    let loaded = 0,
      played = 0,
      duration = 0;
    if (this.state.loaded) {
      loaded = this.player.loaded;
      played = this.player.played;
      duration = this.player.duration;
    }
    const { url, annotatedList } = this;
    /*
    https://r1---sn-q4fl6nlr.c.drive.google.com/videoplayback?expire=1578691947&ei=KrUYXu-EOMmn0AWrjKUg&ip=98.194.51.1&cp=QVNMWkdfUFlSSFhOOms0RmhMSWJKbWVoYzUyank2bzhPZG42ZDFGczdvN0hiR0VMcWZaUHNNMTU&id=fd5a98fd9ab46f3a&itag=18&source=webdrive&requiressl=yes&mm=30&mn=sn-q4fl6nlr&ms=nxu&mv=m&mvi=0&pl=15&ttl=transient&susc=dr&driveid=10WYgwOVz00VOt_dbnuAKc0Iokr6fr1r3&app=explorer&mime=video/mp4&dur=407.278&lmt=1576185682206117&mt=1578677439&sparams=expire,ei,ip,cp,id,itag,source,requiressl,ttl,susc,driveid,app,mime,dur,lmt&sig=ALgxI2wwRgIhAPAKcj_gs82qqNnRubYR95zE9n3ZeGQm2U_2FL4p8ufyAiEAhI0fFCP3aBwW3KFtvcpHnZfUHCR89q2ckwBtCHUVSEk=&lsparams=mm,mn,ms,mv,mvi,pl&lsig=AHylml4wRQIgUdrFo7FxkAVjPIPguoxoyPU8vhgeFRd45s57HV6lywoCIQD0QKP6Ngu_58aE260rS1tNHM1oaGMqGGbdQb8eqhsvSQ==&cpn=wSfBMNmn6XCVVCJk&c=WEB_EMBEDDED_PLAYER&cver=20200108
    https://drive.google.com/uc?export=download&id=10WYgwOVz00VOt_dbnuAKc0Iokr6fr1r3
    https://drive.google.com/open?id=10WYgwOVz00VOt_dbnuAKc0Iokr6fr1r3
    */
    return (
      <Grid>
        <Row>
          <Cell columns={12}>
            <VideoPlayer
              width="100%"
              ref={this.ref}
              controls={true}
              url={url}
              onReady={() => this.setState({ loaded: true })}
              // onStart={() => console.log('onStart')}
              // onPlay={this.handlePlay}
              // onPause={this.handlePause}
              // onBuffer={() => console.log('onBuffer')}
              // onSeek={e => console.log('onSeek', e)}
              // onEnded={this.handleEnded}
              // onError={e => console.log('onError', e)}
              // onProgress={this.handleProgress}
              onDuration={this.handleDuration}
            />
            {/* <IconButton
              style={{
                position: 'absolute',
                color: 'yellow',
                top: '1px'
              }}
            >
              <MaterialIcon icon="bookmark" />
            </IconButton> */}
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
                      onKeyDown={() => this.player.pause()}
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
                          secondaryText={`${durationFormat(
                            v.durationBefore
                          )} - ${durationFormat(v.durationAfter)}`}
                        />
                        <ListItemMeta
                          meta={durationFormat(
                            v.durationAfter - v.durationBefore
                          )}
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
