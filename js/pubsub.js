// getPubSub subscribe and publish code-cred: intervalia
function getPubSub() {
  var listeners = {};
  return {
    subscribe: function(topic, listener) {
      listeners[topic] = listeners[topic] || [];
      var index = listeners[topic].push(listener) -1;
      return function() {
        delete listeners[topic][index];
      };
    },
    publish: function(topic, info) {
      if(listeners[topic]) {
        listeners[topic].forEach(function(listener) {
          listener(topic, info !== undefined ? info : {});
        });
      }
    },
    subs: function(config) {
      // register subscribers
      const unSubs = config.subs.map(sub => ps.subscribe(sub.topic, sub.func));
      return unSubs;
    },
    pubs: function(config) {
      // register publishers
      config.pubs.forEach(pub => {
        const el = pub.sel && document.querySelector(pub.sel) ? document.querySelector(pub.sel) : document;
        // console.log('setting listener', pub.event,'on', el, `(${pub.sel})`)
        el.addEventListener(pub.event, function(ev) {
          const detail = typeof pub.convert === 'function' ? pub.convert(ev) : ev.detail;
          ps.publish(pub.hasOwnProperty('topic') ? pub.topic : pub.event, detail);
        }, pub.bubbles);
      });
    }
  };
}
