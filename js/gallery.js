(function() {
  // Wait for DOM to be ready
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    // Create modal HTML structure
    const modalHTML = `
      <div id="gallery-modal" style="display:none;">
        <div id="gallery-overlay"></div>
        <div id="gallery-content">
          <span id="gallery-close">&times;</span>
          <img id="gallery-image" src="" alt="" />
          <div id="gallery-meta"></div>
          <button id="gallery-prev">&#8592;</button>
          <button id="gallery-next">&#8594;</button>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add CSS styles
    const styles = `
      <style>
        #gallery-modal {
          position: fixed; 
          z-index: 9999; 
          left: 0; 
          top: 0; 
          width: 100vw; 
          height: 100vh;
          background: rgba(0,0,0,0.8); 
          display: flex; 
          align-items: center; 
          justify-content: center;
        }
        #gallery-overlay { 
          position: absolute; 
          width: 100%; 
          height: 100%; 
          top: 0; 
          left: 0; 
        }
        #gallery-content {
          position: relative; 
          z-index: 2; 
          background: #222; 
          padding: 20px; 
          border-radius: 8px; 
          text-align: center;
          max-width: 90vw; 
          max-height: 90vh;
        }
        #gallery-image { 
          max-width: 80vw; 
          max-height: 70vh; 
          object-fit: contain;
        }
        #gallery-close {
          position: absolute; 
          top: 10px; 
          right: 20px; 
          color: #fff; 
          font-size: 2em; 
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          width: 40px;
          height: 40px;
          line-height: 40px;
        }
        #gallery-prev, #gallery-next {
          background: none; 
          border: none; 
          color: #fff; 
          font-size: 2em; 
          cursor: pointer; 
          margin: 0 20px;
          padding: 10px;
          border-radius: 50%;
          transition: background-color 0.3s;
        }
        #gallery-prev:hover, #gallery-next:hover {
          background-color: rgba(255,255,255,0.1);
        }
        #gallery-meta { 
          color: #fff; 
          margin-top: 10px; 
          font-size: 14px;
        }
      </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', styles);

    // Gallery functionality
    const items = document.querySelectorAll('.collection-item');
    let galleryData = [];
    let currentIndex = 0;

    // Helper: Parse JSON from .w-json script
    function getJsonData(item) {
      const jsonScript = item.querySelector('.w-json');
      if (!jsonScript) return null;
      try {
        return JSON.parse(jsonScript.textContent);
      } catch (e) {
        return null;
      }
    }

    // Helper: Find all items in the same group
    function getGroupItems(group) {
      let groupItems = [];
      items.forEach(item => {
        const data = getJsonData(item);
        if (data && data.group === group) {
          groupItems.push({item, data});
        }
      });
      return groupItems;
    }

    // Show modal
    function showGallery(groupItems, startIdx) {
      galleryData = groupItems;
      currentIndex = startIdx;
      updateGallery();
      document.getElementById('gallery-modal').style.display = 'flex';
    }

    // Update modal content
    function updateGallery() {
      const {data} = galleryData[currentIndex];
      const img = data.items[0]; // Assuming one image per .w-json
      document.getElementById('gallery-image').src = img.url;
      document.getElementById('gallery-meta').textContent = `Image ${currentIndex + 1} of ${galleryData.length}`;
    }

    // Hide modal
    function hideGallery() {
      document.getElementById('gallery-modal').style.display = 'none';
    }

    // Event listeners for each image
    items.forEach((item, idx) => {
      const img = item.querySelector('img');
      if (!img) return;
      img.style.cursor = 'pointer';
      img.addEventListener('click', function(e) {
        e.preventDefault();
        const data = getJsonData(item);
        if (!data) return;
        const groupItems = getGroupItems(data.group);
        const startIdx = groupItems.findIndex(g => g.item === item);
        showGallery(groupItems, startIdx);
      });
    });

    // Modal controls
    document.getElementById('gallery-close').onclick = hideGallery;
    document.getElementById('gallery-overlay').onclick = hideGallery;
    document.getElementById('gallery-prev').onclick = function() {
      currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
      updateGallery();
    };
    document.getElementById('gallery-next').onclick = function() {
      currentIndex = (currentIndex + 1) % galleryData.length;
      updateGallery();
    };

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (document.getElementById('gallery-modal').style.display !== 'flex') return;
      if (e.key === 'Escape') hideGallery();
      if (e.key === 'ArrowLeft') document.getElementById('gallery-prev').click();
      if (e.key === 'ArrowRight') document.getElementById('gallery-next').click();
    });
  });
})(); 