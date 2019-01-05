// see linked js in settings for pub/sub: pubsub.js
console.clear();
const PRECISION = 3; // precision after decimal for final cut command

const els = {};

function editorInit() {
  els.player = document.querySelector('.editor > video');
  els.playerPauseButton = document.querySelector('.player__pause-button');
  els.currentTimeSlider = document.querySelector('.player__current-time-slider');
  els.elapsedTimeSpan = document.querySelector('.player__time-elapsed');
  els.playSpeed = document.querySelector('.player__play-speed');

  ps.pubs(config);
}

const config = {
    pubs: [
    { sel: '.player__pause-button', event: 'click', topic: 'togglePlayForVideo' },
    { sel: '.player__playback-rate-slider', event: 'input', topic: 'updatePlaybackRate', convert: ev => ev.target.value },

    { sel: '.player__current-time-slider', event: 'input', topic: 'updateCurrentTimeForVideo', convert: ev => ev.target.value },
    { sel: '.editor > video', event: 'timeupdate', topic: 'updateCurrentTimeForSlider', convert: ev => ev.target.currentTime },

    { sel: '.editor > video', event: 'ended', topic: 'togglePlayForButton' },
    { sel: '.player__a-button', event: 'click', topic: 'setMarker', convert: ev => ({marker: 'a', el: ev.target}) },
    { sel: '.player__b-button', event: 'click', topic: 'setMarker', convert: ev => ({marker: 'b', el: ev.target}) },

    { sel: '.time__cut-button', event: 'click', topic: 'cutVideo', convert: ev => ev.preventDefault()}
  ],
  subs: [
    { topic: 'togglePlayForVideo',
      func: () => {
        els.player[els.player.paused ? 'play' : 'pause']();
        els.playerPauseButton.textContent = els.player.paused ? '►' : '❚❚';
      }
    },
    { topic: 'togglePlayForButton',
      func: () => {
        els.playerPauseButton.textContent = els.player.paused ? '►' : '❚❚';
      }
    },
    { topic: 'updatePlaybackRate',
      func: (topic, info) => {
        els.player.playbackRate = info;
        els.playSpeed.textContent = `${parseFloat(info, 10).toFixed(1)}x`;
      }
    },
    { topic: 'updateCurrentTimeForSlider',
      func: (topic, info) => {
        els.currentTimeSlider.value = info / els.player.duration;
        const seconds = parseInt(info, 10).toString().padStart(2, '0');
        const minutes = parseInt(info / 60, 10).toString().padStart(1, '0');
        const formattedTime = `${minutes}:${seconds}`;
        els.elapsedTimeSpan.textContent = formattedTime;
      }
    },
    { topic: 'updateCurrentTimeForVideo',
      func: (topic, info) => {
        els.player.currentTime = els.player.duration * info;
      }
    },

    { topic: 'setMarker',
      func: (topic, info) => {
        info.el.dataset.time = els.player.currentTime;
        document.querySelector(`.time__${info.marker}-input`).value = els.player.currentTime;
        const location = els.currentTimeSlider.getBoundingClientRect().width / 100 * els.currentTimeSlider.value * 100;
        const marker = document.querySelector(`.overlay--${info.marker}`);
        document.querySelector('.time__cut-button').disabled = false;
        marker.style.left = `calc(10px + ${location}px)`;//`${player.currentTime}px`;
        marker.classList.remove('invisible');
      }
    },

    { topic: 'cutVideo',
      func: (topic, info) => {
        const startSecond = Number(document.querySelector('.time__a-input').value);
        const endSecond = Number(document.querySelector('.time__b-input').value);
        const currentSrc = (els.player.dataset.filename) ? els.player.dataset.filename : els.player.currentSrc;
        const {filename, fileWithoutExt, ext} = fileParts(currentSrc);
        const ffmpegOptions = {
          inputParams: ['-ss', `${startSecond.toPrecision(PRECISION)}`],
          outputParams: ['-t', `${(endSecond - startSecond).toPrecision(PRECISION)}`, '-c', 'copy', '-map', '0', '-avoid_negative_ts', '1'],
          outFilename: `${fileWithoutExt}-cut.${ext}`
        };
        start(window.fileObject, ffmpegOptions);
      }
    }
  ]
};
if (!window.ps) {
  window.ps = getPubSub();
}
const unSubs = ps.subs(config);
