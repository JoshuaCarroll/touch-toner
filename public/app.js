async function loadSounds() {
  const res = await fetch('/api/sounds');
  const list = await res.json();
  return list;
}

function niceName(filename){
  return filename.replace(/[-_]/g,' ').replace(/\.(mp3|wav|ogg)$/i,'');
}

async function render(){
  const board = document.getElementById('board');
  board.innerHTML = '';
  let sounds = [];
  try { sounds = await loadSounds(); } catch (e) { board.innerHTML = '<p style="color:#f88">Failed to load sounds</p>'; return; }

  sounds.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.innerHTML = `
      <div class="title">🔊</div>
      <div class="label">${niceName(name)}</div>
    `;
    const audio = new Audio(`/sounds/${encodeURIComponent(name)}`);
    audio.preload = 'auto';

    btn.addEventListener('click', () => {
      if (!audio.paused) { audio.pause(); audio.currentTime = 0; btn.classList.remove('playing'); return; }
      audio.currentTime = 0; audio.play(); btn.classList.add('playing');
    });

    audio.addEventListener('ended', () => btn.classList.remove('playing'));
    audio.addEventListener('pause', () => btn.classList.remove('playing'));

    board.appendChild(btn);
  });
}

window.addEventListener('load', render);
