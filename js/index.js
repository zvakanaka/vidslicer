// see linked js in settings for pub/sub: pubsub.js
window.fileObject;
async function swapInEditor(src = null) {
  document.body.innerHTML = await addHTML('./html/video-editor.html', true);
  editorInit(); // comes from video editor js
  const videoEl = document.querySelector('.editor > video');
  if (src) videoEl.src = src;
  return;
}

const dropConfig = {
    pubs: [
      { sel: null /* document*/, event: 'dragover', convert: ev => ev.preventDefault(), bubbles: false },
      { sel: '#video-input', event: 'change', topic: 'handleDroppedFile', convert: ev => { ev.preventDefault(); return ev; }, bubbles: false },
      { sel: null /* document*/, event: 'drop', topic: 'handleDroppedFile', convert: ev => { ev.preventDefault(); return ev; }, bubbles: false },
      { sel: 'a.demo-video', event: 'click', topic: 'loadDemoVideo', convert: ev => ev.preventDefault(), bubbles: false }
  ],
  subs: [
    { topic: 'handleDroppedFile',
      func: async (_topic, ev) => {
        let dataList, dataText, dataType;
        const target = ev.dataTransfer ? ev.dataTransfer : ev.target;
        fileObject = target.files[0];
        if (target.files.length === 1) { // single file
          //determine if our URL is a supported video
          const extensions = ['mp4', 'mov', 'webm', 'avi'];
          const {ext} = fileParts(target.files[0].name.toLowerCase());
          if (extensions.includes(ext)) { // valid extension
            const urlToVideo = URL.createObjectURL(fileObject);
            console.log(fileObject);
            await swapInEditor(urlToVideo);
            const videoEl = document.querySelector('.editor > video');
            videoEl.dataset.filename = fileObject.name;
          } else {
            console.log('invalid extension', ext);
          }
        }
        else { // list of files
          console.log('no support for list of files yet');
        }
      }
    },
    {
      topic: 'loadDemoVideo',
      func: () => {
        swapInEditor('https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.webm');
      }
    }
  ]
};
if (!window.ps) {
  console.log('no')
  window.ps = getPubSub();
}
const unsubs = ps.subs(dropConfig);

ps.pubs(dropConfig);
