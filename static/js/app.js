document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Lenis Smooth Momentum Scroll Engine (Apple Feel)
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // 3. Apple-grade GSAP Scroll Animations
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Scroll Scrub Parallax
    gsap.to('.hero-title', {
      scale: 0.92,
      y: -40,
      opacity: 0.15,
      filter: 'blur(5px)',
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: '.hero-stage',
        start: 'top top',
        end: 'bottom 45%',
        scrub: 1
      }
    });

    gsap.to('.hero-sub, .hero-actions, .hero-capsule', {
      y: -25,
      opacity: 0,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: '.hero-stage',
        start: 'top top',
        end: 'bottom 65%',
        scrub: 1
      }
    });

    // Pinned Keynote Scroll Timeline
    const keynotePin = gsap.timeline({
      scrollTrigger: {
        trigger: '#keynote',
        start: 'top top',
        end: '+=2400',
        pin: '#pinnedContainer',
        scrub: 1,
        anticipatePin: 1
      }
    });

    keynotePin
      .to('#hologramMatrix', { opacity: 1, duration: 0.8 })
      .to('#pinnedLeafImg', { scale: 1.18, duration: 1.2 }, '<')
      .to('#pinnedFrame', { rotateY: -4, rotateX: 3, duration: 1.2 }, '<')
      .to('#slide1', { opacity: 0, y: -25, duration: 0.6 }, '+=0.2')
      .to('#slide2', { opacity: 1, y: 0, duration: 0.6 })
      .to('#scrubbedLaser', { opacity: 1, duration: 0.3 })
      .to('#scrubbedLaser', { top: '85%', duration: 1.5, ease: 'none' })
      .to('#slide2', { opacity: 0, y: -25, duration: 0.6 })
      .to('#slide3', { opacity: 1, y: 0, duration: 0.6 })
      .to('#scrubbedLaser', { opacity: 0, duration: 0.3 }, '<')
      .to('#reticleTarget', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(2)' })
      .to('#pinnedLeafImg', { scale: 1.26, filter: 'saturate(1.25) contrast(1.1)', duration: 0.8 }, '<')
      .to('#pinnedFrame', {
        boxShadow: '0 40px 120px rgba(0, 0, 0, 0.9), 0 0 80px rgba(34, 197, 94, 0.45)',
        borderColor: 'rgba(34, 197, 94, 0.6)',
        duration: 0.8
      }, '<')
      .to({}, { duration: 0.6 });

    // 3D Perspective Scrub on Pipeline Cards
    gsap.utils.toArray('.pipeline-card').forEach((card) => {
      gsap.fromTo(card, 
        { rotateX: 18, y: 70, opacity: 0.2, transformPerspective: 1000 },
        {
          rotateX: 0,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 55%',
            scrub: 1
          }
        }
      );
    });

    // 3D Perspective Scrub on Bento Spec Grid
    gsap.utils.toArray('.bento-cell').forEach((cell) => {
      gsap.fromTo(cell, 
        { rotateX: 15, y: 60, opacity: 0.2, transformPerspective: 1000 },
        {
          rotateX: 0,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cell,
            start: 'top 92%',
            end: 'top 60%',
            scrub: 1
          }
        }
      );
    });

    // Smooth entry for Diagnostic Studio
    gsap.fromTo('.studio-grid',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.studio-section',
          start: 'top 80%',
          end: 'top 40%',
          scrub: 1
        }
      }
    );

    // Crops Cloud tags stagger
    gsap.from('.crop-tag', {
      scrollTrigger: {
        trigger: '.flora-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      scale: 0.85,
      opacity: 0,
      duration: 0.5,
      stagger: 0.025,
      ease: 'back.out(1.6)'
    });
  }

  // 4. Leaf Diagnosis Workbench Logic (Server-Powered Foliar Inference)
  // DOM element handles initialized upfront to eliminate any Temporal Dead Zone errors
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('imageFileInput');
  const previewContainer = document.getElementById('previewContainer');
  const previewImg = document.getElementById('previewImg');
  const lidarScanline = document.getElementById('lidarScanline');
  const hudBadge = document.getElementById('hudBadge');
  const readoutCrop = document.getElementById('readoutCrop');
  const readoutDiagnosis = document.getElementById('readoutDiagnosis');
  const confidenceScore = document.getElementById('confidenceScore');
  const confidenceBarFill = document.getElementById('confidenceBarFill');
  const treatmentBox = document.getElementById('treatmentBox');
  const treatmentText = document.getElementById('treatmentText');
  const candidatesContainer = document.getElementById('candidatesContainer');

  // Apple-grade Interactive Action Controls
  const btnClearPreview = document.getElementById('btnClearPreview');
  const btnTestAnotherHud = document.getElementById('btnTestAnotherHud');
  const readoutActions = document.getElementById('readoutActions');
  const previewStatusLabel = document.getElementById('previewStatusLabel');

  // Set initial HUD status to ready immediately
  if (hudBadge) {
    hudBadge.className = 'hud-badge idle';
    hudBadge.innerHTML = '<i data-lucide="cpu" style="width: 14px; height: 14px;"></i> Ready';
    if (window.lucide) lucide.createIcons();
  }

  function getAssetUrl(relativePath) {
    const currentPath = window.location.pathname;
    const baseDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    return new URL(relativePath, window.location.origin + baseDir).href;
  }

  function resetWorkbench() {
    if (previewContainer) previewContainer.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (fileInput) fileInput.value = '';
    if (lidarScanline) lidarScanline.style.display = 'none';
    if (readoutActions) readoutActions.style.display = 'none';
    if (treatmentBox) treatmentBox.style.display = 'none';
    if (readoutCrop) readoutCrop.textContent = 'Botanical Analyzer';
    if (readoutDiagnosis) readoutDiagnosis.textContent = 'Awaiting Specimen';
    if (confidenceScore) confidenceScore.textContent = '—';
    if (confidenceBarFill) confidenceBarFill.style.width = '0%';
    if (hudBadge) {
      hudBadge.className = 'hud-badge idle';
      hudBadge.innerHTML = '<i data-lucide="cpu" style="width: 14px; height: 14px;"></i> Ready';
    }
    document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
    if (window.lucide) lucide.createIcons();
  }

  function showPreview(src) {
    if (previewImg) previewImg.src = src;
    if (previewContainer) previewContainer.style.display = 'block';
    if (lidarScanline) lidarScanline.style.display = 'block';
    if (previewStatusLabel) previewStatusLabel.textContent = 'Diagnosing Specimen';
    if (readoutActions) readoutActions.style.display = 'block';
    if (hudBadge) {
      hudBadge.className = 'hud-badge idle';
      hudBadge.innerHTML = '<span class="pulse-dot"></span> Analyzing';
    }
    if (readoutCrop) readoutCrop.textContent = 'Spectrometric Scan in Progress...';
    if (readoutDiagnosis) readoutDiagnosis.textContent = 'Processing Foliage Pixels...';
  }

  function displayResults(data) {
    setTimeout(() => {
      if (lidarScanline) lidarScanline.style.display = 'none';
      if (previewStatusLabel) previewStatusLabel.textContent = 'Diagnosis Complete';
      if (readoutActions) readoutActions.style.display = 'block';

      const isHealthy = Boolean(data.is_healthy);
      if (hudBadge) {
        hudBadge.className = isHealthy ? 'hud-badge healthy' : 'hud-badge diseased';
        hudBadge.innerHTML = isHealthy 
          ? '<i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> Healthy' 
          : '<i data-lucide="alert-triangle" style="width:14px;height:14px;"></i> Pathology Detected';
      }

      if (readoutCrop) readoutCrop.textContent = `${data.crop || 'Botanical'} Specimen`;
      if (readoutDiagnosis) readoutDiagnosis.textContent = data.condition || 'Analysis Complete';

      const confVal = data.confidence !== undefined ? data.confidence : 95.0;
      if (confidenceScore) confidenceScore.textContent = `${confVal}% Match`;
      if (confidenceBarFill) confidenceBarFill.style.width = `${Math.min(confVal, 100)}%`;

      if (treatmentBox) treatmentBox.style.display = 'block';
      if (treatmentText) treatmentText.textContent = data.treatment || 'Consult agricultural extension specialist.';

      if (candidatesContainer && data.top3 && data.top3.length > 0) {
        candidatesContainer.innerHTML = data.top3.map(c => `
          <div class="candidate-item">
            <span class="candidate-name">${c.crop} • ${c.condition}</span>
            <span class="candidate-val">${c.percentage}%</span>
          </div>
        `).join('');
      }

      if (window.lucide) lucide.createIcons();
    }, 400);
  }

  function showError(msg) {
    if (lidarScanline) lidarScanline.style.display = 'none';
    if (hudBadge) {
      hudBadge.className = 'hud-badge diseased';
      hudBadge.innerHTML = '<i data-lucide="alert-circle" style="width:14px;height:14px;"></i> Notice';
    }
    if (readoutCrop) readoutCrop.textContent = 'Diagnostic Notice';
    if (readoutDiagnosis) readoutDiagnosis.textContent = msg || 'Diagnosis service unavailable. Please retry.';
    if (window.lucide) lucide.createIcons();
  }

  // File Upload Diagnosis Pipeline
  async function handleFile(file) {
    if (!file || !file.type.match('image.*')) {
      alert('Please upload a valid image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      showPreview(e.target.result);

      // Free tier cold start watchdog: inform user if server takes >3.5s to wake up
      let isSlow = false;
      const slowTimer = setTimeout(() => {
        isSlow = true;
        if (readoutCrop) readoutCrop.textContent = 'Waking Neural Engine...';
        if (readoutDiagnosis) readoutDiagnosis.textContent = 'Server instance is spinning up (free tier cold start, ~15s)...';
      }, 3500);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          body: formData
        });
        clearTimeout(slowTimer);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const res = await response.json();
        if (res.success && res.data) {
          displayResults(res.data);
        } else {
          throw new Error(res.error || 'Invalid response received from diagnostic engine.');
        }
      } catch (err) {
        clearTimeout(slowTimer);
        console.error('[FloraAI] Inference error:', err);
        showError(err.message || 'Diagnostic service currently offline. Please retry in a few moments.');
      }
    };
    reader.readAsDataURL(file);
  }

  // Quick Test Sample Function
  window.testSample = async function(sampleFileName, chipElement) {
    document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
    if (chipElement) chipElement.classList.add('active');

    const sampleUrl = getAssetUrl(`static/samples/${sampleFileName}`);
    showPreview(sampleUrl);

    let isSlow = false;
    const slowTimer = setTimeout(() => {
      isSlow = true;
      if (readoutCrop) readoutCrop.textContent = 'Waking Neural Engine...';
      if (readoutDiagnosis) readoutDiagnosis.textContent = 'Server instance is spinning up (free tier cold start)...';
    }, 3500);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample: sampleFileName })
      });
      clearTimeout(slowTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const res = await response.json();
      if (res.success && res.data) {
        displayResults(res.data);
      } else {
        throw new Error(res.error || 'Sample diagnostic analysis failed.');
      }
    } catch (err) {
      clearTimeout(slowTimer);
      console.error('[FloraAI] Sample inference error:', err);
      showError(err.message || 'Diagnostic service currently offline. Please retry.');
    }
  };

  // Drag and drop event listeners
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt && dt.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });
  }

  // File input change listener
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });
  }

  // Apple Action Controls: Diagnose Another Leaf & Reset Workbench
  if (btnTestAnotherHud) {
    btnTestAnotherHud.addEventListener('click', (e) => {
      e.preventDefault();
      if (fileInput) fileInput.click();
    });
  }

  if (btnClearPreview) {
    btnClearPreview.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetWorkbench();
    });
  }
});
