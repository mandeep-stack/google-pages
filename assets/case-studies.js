(function(){
  /* ---------------- CONFIG ---------------- */
  var CONFIG = {
    bunnyLibraryId: '659110',
    cdnHost: 'vz-7e22ccfd-0a4.b-cdn.net',
    ctaUrl: 'https://rzp.io/rzp/webaudit'
  };

  /* ---------------- VIDEOS ----------------
     Newest first. For each video fill in:
       thumb  = Bunny "Thumbnail URL" (paste the whole link)
       title  = what the visitor sees, e.g. 'Dry Dock: homepage from 6.2s to 1.4s'
       result = one-line outcome badge, e.g. 'Mobile score 38 → 91'   (optional)
       desc   = 1-2 sentences on what this video shows                  (optional)
       len    = video length shown on the thumbnail, e.g. '2:41'       (optional)
     Each video gets its own link: /case-studies#v-<first 8 characters of the GUID>
  ------------------------------------------ */
  var VIDEOS = [
    { thumb:'https://vz-7e22ccfd-0a4.b-cdn.net/32269413-44f2-4245-bfdd-fbcdfc8de95c/thumbnail_453fa36c.jpg', title:'', result:'', desc:'', len:'' },
    { thumb:'83e08e1a-9aa8-4492-a834-3e5878e416f8/thumbnail_571bc302.jpg', title:'', result:'', desc:'', len:'' },
    { thumb:'3a93a286-9aea-4bc4-b731-580024a91735/thumbnail_3bda8808.jpg', title:'', result:'', desc:'', len:'' },
    { thumb:'/5ffbda5e-5df7-42c4-967e-d8023d598768/thumbnail_bf0373c7.jpg', title:'', result:'', desc:'', len:'' },
    { thumb:'4e72c9a2-4664-417c-a9a8-2232e54de809/thumbnail_ec23698c.jpg', title:'', result:'', desc:'', len:'' },
    { thumb:'9dd458b0-b1a0-4850-9f56-721b0474ca9d/thumbnail.jpg', title:'', result:'', desc:'', len:'' }
  ];

  /* ---------------- HELPERS ---------------- */
  var dl = (window.dataLayer = window.dataLayer || []);
  var qs = new URLSearchParams(location.search);
  var SRC = { utm_source:qs.get('utm_source')||'', utm_medium:qs.get('utm_medium')||'', utm_campaign:qs.get('utm_campaign')||'' };
  function push(o){ for (var k in SRC) o[k] = SRC[k]; dl.push(o); }
  function $(id){ return document.getElementById(id); }
  function esc(s){ var d=document.createElement('div'); d.textContent = s==null?'':String(s); return d.innerHTML; }
  function vid(g){ return 'v-' + String(g).slice(0,8); }
  function parse(e){
    e = String(e).trim();
    var m = e.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([^\/?#|]+)/i);
    if(m) return { g:m[1], f:m[2] };
    var p = e.split('|');
    return { g:p[0], f:p[1] || 'thumbnail.jpg' };
  }
  var libOk = CONFIG.bunnyLibraryId.indexOf('YOUR_') !== 0;
  var cdnOk = CONFIG.cdnHost.indexOf('YOUR_') !== 0;

  var items = VIDEOS.map(function(v, i){
    var P = parse(v.thumb);
    return {
      i:i, g:P.g, f:P.f, id:vid(P.g),
      title: v.title || ('Case study ' + (i+1)),
      result: v.result || '', desc: v.desc || '', len: v.len || '',
      ok: libOk && String(P.g).indexOf('YOUR_') !== 0 && String(P.g).indexOf('NEXT_') !== 0
    };
  });
  function thumbUrl(it){ return 'https://'+CONFIG.cdnHost+'/'+encodeURIComponent(it.g)+'/'+it.f; }
  var IMG_ERR = "if(!this.dataset.r){this.dataset.r=1;this.src=this.src.replace(/\\/[^\\/]+$/,'/thumbnail.jpg')}else{this.remove()}";

  /* ---------------- SIDEBAR LIST ---------------- */
  $('aw-count').textContent = items.length + (items.length === 1 ? ' video' : ' videos');
  $('aw-items').innerHTML = items.map(function(it){
    return '<button type="button" class="aw-item" data-i="'+it.i+'" aria-current="false">' +
      '<span class="aw-th">' + (cdnOk ? '<img src="'+esc(thumbUrl(it))+'" onerror="'+IMG_ERR+'" alt="" width="320" height="180" decoding="async" loading="lazy">' : '') +
      '<span class="aw-len">'+esc(it.len)+'</span></span>' +
      '<span class="aw-meta"><span class="aw-it">'+esc(it.title)+'</span><span class="aw-ir">'+esc(it.result)+'</span><span class="aw-now">Now playing</span></span>' +
      '</button>';
  }).join('');

  /* ---------------- PLAYER TRACKING (player.js loaded only after a click) ---------------- */
  function loadPlayerJs(cb){
    if(window.playerjs) return cb();
    var s = document.createElement('script');
    s.src = 'https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js';
    s.onload = cb; document.head.appendChild(s);
  }
  function track(f, id){
    try{
      var fired = {}, played = false;
      var p = new playerjs.Player(f);
      p.on('ready', function(){
        p.on('play', function(){ if(!played){ played = true; push({ event:'case_video_play', case_id:id }); } });
        p.on('timeupdate', function(d){
          if(!d || !d.duration) return;
          var pct = (d.seconds / d.duration) * 100;
          [25,50,75].forEach(function(m){
            if(pct >= m && !fired[m]){ fired[m]=1; push({ event:'case_video_progress', case_id:id, percent:m }); }
          });
        });
        p.on('ended', function(){ if(!fired[100]){ fired[100]=1; push({ event:'case_video_progress', case_id:id, percent:100 }); } });
      });
    }catch(e){}
  }

  /* ---------------- STAGE ---------------- */
  var stage = $('aw-stage'), cur = -1, viewed = {};
  function posterHtml(it){
    if(!it.ok) return '<div class="aw-soon">Video coming soon</div>';
    return '<button type="button" class="aw-poster" aria-label="Play: '+esc(it.title)+'">' +
      (cdnOk ? '<img src="'+esc(thumbUrl(it))+'" onerror="'+IMG_ERR+'" width="1280" height="720" alt="" decoding="async" fetchpriority="high">' : '') +
      '<span class="aw-play"></span></button>';
  }
  function play(it){
    var f = document.createElement('iframe');
    f.src = 'https://iframe.mediadelivery.net/embed/'+encodeURIComponent(CONFIG.bunnyLibraryId)+'/'+encodeURIComponent(it.g)+'?autoplay=true&preload=true&responsive=true';
    f.title = it.title;
    f.setAttribute('allow','accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture');
    f.setAttribute('allowfullscreen','');
    f.setAttribute('data-vid', it.id);
    stage.innerHTML = ''; stage.appendChild(f);
    loadPlayerJs(function(){ track(f, it.id); });
  }
  function show(i, autoplay, user){
    if(i < 0 || i >= items.length) return;
    var it = items[i];
    cur = i;
    stage.innerHTML = posterHtml(it);
    $('aw-title').textContent = it.title;
    $('aw-result').textContent = it.result;
    $('aw-desc').textContent = it.desc;
    Array.prototype.forEach.call(document.querySelectorAll('.aw-item'), function(b){
      b.setAttribute('aria-current', String(+b.getAttribute('data-i') === i));
    });
    if(!viewed[it.id]){ viewed[it.id] = 1; push({ event:'case_view', case_id:it.id }); }
    if(user){
      push({ event:'case_select', case_id:it.id });
      try{ history.replaceState(null, '', '#'+it.id); }catch(e){}
      var r = stage.getBoundingClientRect();
      if(r.top < 0 || r.top > window.innerHeight * .4){
        var rm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
        stage.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block:'start' });
      }
    }
    if(autoplay && it.ok) play(it);
  }

  stage.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.aw-poster') : null;
    if(b && items[cur]) play(items[cur]);
  });
  $('aw-items').addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.aw-item') : null;
    if(b) show(+b.getAttribute('data-i'), true, true);
  });

  /* ---------------- DEEP LINK, CTA ---------------- */
  function idxFromHash(){
    var h = decodeURIComponent((location.hash||'').slice(1));
    for(var i=0;i<items.length;i++) if(items[i].id === h) return i;
    return -1;
  }
  var start = idxFromHash();
  show(start >= 0 ? start : 0, false, false);
  if(start >= 0){ setTimeout(function(){ stage.scrollIntoView({ block:'start' }); }, 150); }
  window.addEventListener('hashchange', function(){
    var i = idxFromHash();
    if(i >= 0 && i !== cur) show(i, false, true);
  });

  ['aw-cta-main','aw-cta-bar'].forEach(function(id){
    var a = $(id);
    if(CONFIG.ctaUrl.indexOf('PASTE_') !== 0) a.href = CONFIG.ctaUrl;
    a.addEventListener('click', function(){ push({ event:'case_cta_click', case_id: items[cur] ? items[cur].id : 'footer' }); });
  });
})();
