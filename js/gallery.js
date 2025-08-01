(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    const template = `
      <div id="gallery-view">
        <button id="gallery-close">&times;</button>
        <img id="gallery-image" alt="" loading="lazy" />
        <div id="gallery-thumbs"></div>
        <button id="gallery-prev" class="gallery-nav">&#10094;</button>
        <button id="gallery-next" class="gallery-nav">&#10095;</button>
      </div>`;

    const styles = `
      <style>
        #gallery-view {
          position: fixed;
          z-index: 9999;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        #gallery-image {
          max-width: 90vw;
          max-height: 80vh;
          object-fit: contain;
        }
        #gallery-close {
          position: absolute;
          top: 10px;
          right: 20px;
          color: #fff;
          font-size: 2rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        .gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #fff;
          font-size: 3rem;
          cursor: pointer;
        }
        #gallery-prev { left: 10px; }
        #gallery-next { right: 10px; }
        #gallery-thumbs {
          position: absolute;
          bottom: 10px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 10px;
          overflow-x: auto;
        }
        #gallery-thumbs img {
          width: 60px;
          height: 40px;
          object-fit: cover;
          opacity: 0.6;
          cursor: pointer;
        }
        #gallery-thumbs img.active {
          opacity: 1;
          border: 2px solid #fff;
        }
      </style>`;

    document.head.insertAdjacentHTML('beforeend', styles);

    const items = document.querySelectorAll('.collection-item');
    let galleryData = [];
    let currentIndex = 0;
    let galleryEl = null;

    function getJsonData(item) {
      const jsonScript = item.querySelector('.tn-json');
      if (!jsonScript) return null;
      try {
        return JSON.parse(jsonScript.textContent);
      } catch (e) {
        return null;
      }
    }

    function getGroupItems(group) {
      const groupItems = [];
      items.forEach(item => {
        const data = getJsonData(item);
        if (data && data.group === group) {
          groupItems.push({ item, data, img: item.querySelector('img') });
        }
      });
      return groupItems;
    }

    function createGallery() {
      document.body.insertAdjacentHTML('beforeend', template);
      galleryEl = document.getElementById('gallery-view');
      galleryEl.querySelector('#gallery-close').onclick = hideGallery;
      galleryEl.querySelector('#gallery-prev').onclick = prev;
      galleryEl.querySelector('#gallery-next').onclick = next;
    }

    function showGallery(groupItems, startIdx) {
      galleryData = groupItems;
      currentIndex = startIdx;
      if (!document.getElementById('gallery-view')) {
        createGallery();
      }
      updateThumbs();
      updateGallery();
    }

    function updateThumbs() {
      const container = galleryEl.querySelector('#gallery-thumbs');
      container.innerHTML = '';
      galleryData.forEach((g, i) => {
        const t = document.createElement('img');
        t.src = g.img.src;
        t.loading = 'lazy';
        if (i === currentIndex) t.classList.add('active');
        t.addEventListener('click', () => {
          currentIndex = i;
          updateGallery();
        });
        container.appendChild(t);
      });
    }

    function updateGallery() {
      const { img } = galleryData[currentIndex];
      const main = galleryEl.querySelector('#gallery-image');
      main.src = img.src;
      main.srcset = img.srcset || '';
      galleryEl.querySelectorAll('#gallery-thumbs img').forEach((el, i) => {
        el.classList.toggle('active', i === currentIndex);
      });
      if (!document.body.contains(galleryEl)) {
        document.body.appendChild(galleryEl);
      }
    }

    function hideGallery() {
      if (galleryEl && galleryEl.parentNode) {
        galleryEl.parentNode.removeChild(galleryEl);
      }
    }

    function prev() {
      currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
      updateGallery();
    }

    function next() {
      currentIndex = (currentIndex + 1) % galleryData.length;
      updateGallery();
    }

    items.forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;
      img.style.cursor = 'pointer';
      img.addEventListener('click', e => {
        e.preventDefault();
        const data = getJsonData(item);
        if (!data) return;
        const groupItems = getGroupItems(data.group);
        const startIdx = groupItems.findIndex(g => g.item === item);
        showGallery(groupItems, startIdx);
      });
    });

    document.addEventListener('keydown', e => {
      if (!galleryEl || !document.body.contains(galleryEl)) return;
      if (e.key === 'Escape') hideGallery();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  });
})();
