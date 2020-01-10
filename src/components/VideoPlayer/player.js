import React from 'react';
import ReactPlayer from 'react-player';

class VideoPlayer extends ReactPlayer {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      duration: 0,
      seeking: false,
      played: 0,
      loaded: 0,
      loop: false
    };
  }

  ref = player => {
    this.player = player;
  };

  get duration() {
    return this.state.duration;
  }
  set duration(value) {
    this.setState({ duration: value });
  }
  get seeking() {
    return this.state.seeking;
  }
  set seeking(value) {
    this.setState({ seeking: value });
  }
  get loop() {
    return this.props.loop;
  }
  get playing() {
    return this.state.playing;
  }
  set playing(value) {
    this.setState({ playing: value });
  }

  pause() {
    this.playing = false;
  }
  play() {
    this.playing = true;
  }

  handlePlay = () => {
    this.playing = true;
  };

  handlePause = () => {
    this.playing = false;
  };

  handleSeekMouseDown = e => {
    this.seeking = true;
  };

  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) });
  };

  handleSeekMouseUp = e => {
    this.seeking = false;
    this.player.seekTo(parseFloat(e.target.value));
  };

  handleProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.seeking) {
      this.setState(state);
    }
  };

  handleEnded = () => {
    this.playing = this.loop;
  };

  handleDuration = duration => {
    this.duration = duration;
    if (this.props.onDuration) {
      this.props.onDuration(duration);
    }
  };

  render() {
    const { playing } = this.state;
    const { url, controls, width, onReady } = this.props;

    return (
      <ReactPlayer
        width={width}
        ref={this.ref}
        controls={controls}
        url={url}
        playing={playing}
        onReady={() => onReady()}
        // onStart={() => console.log('onStart')}
        onPlay={this.handlePlay}
        onPause={this.handlePause}
        // onBuffer={() => console.log('onBuffer')}
        // onSeek={e => console.log('onSeek', e)}
        onEnded={this.handleEnded}
        onError={e => console.log('onError', e)}
        onProgress={this.handleProgress}
        onDuration={this.handleDuration}
      />
    );
  }
}

export default VideoPlayer;
