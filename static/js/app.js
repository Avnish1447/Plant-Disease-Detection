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

    // Hero elements are 100% visible on load.
    // Parallax smoothly fades and lifts them ONLY as user scrolls away from top:
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

    // =========================================================
    // PINNED KEYNOTE SCROLL TIMELINE (The Flagship Apple Feature)
    // =========================================================
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
      // Phase 1 -> 2: Hologram Matrix Fades in, Leaf Zooms
      .to('#hologramMatrix', { opacity: 1, duration: 0.8 })
      .to('#pinnedLeafImg', { scale: 1.18, duration: 1.2 }, '<')
      .to('#pinnedFrame', { rotateY: -4, rotateX: 3, duration: 1.2 }, '<')
      
      // Transition Slide 1 out, Slide 2 in
      .to('#slide1', { opacity: 0, y: -25, duration: 0.6 }, '+=0.2')
      .to('#slide2', { opacity: 1, y: 0, duration: 0.6 })

      // Laser Beam Sweeps Down
      .to('#scrubbedLaser', { opacity: 1, duration: 0.3 })
      .to('#scrubbedLaser', { top: '85%', duration: 1.5, ease: 'none' })
      
      // Transition Slide 2 out, Slide 3 in
      .to('#slide2', { opacity: 0, y: -25, duration: 0.6 })
      .to('#slide3', { opacity: 1, y: 0, duration: 0.6 })
      .to('#scrubbedLaser', { opacity: 0, duration: 0.3 }, '<')

      // Target Reticle Locks On with Zoom & Pop
      .to('#reticleTarget', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(2)' })
      .to('#pinnedLeafImg', { scale: 1.26, filter: 'saturate(1.25) contrast(1.1)', duration: 0.8 }, '<')
      .to('#pinnedFrame', {
        boxShadow: '0 40px 120px rgba(0, 0, 0, 0.9), 0 0 80px rgba(34, 197, 94, 0.45)',
        borderColor: 'rgba(34, 197, 94, 0.6)',
        duration: 0.8
      }, '<')
      
      // Hold for final read before releasing pin
      .to({}, { duration: 0.6 });

    // 3D Perspective Scrub on Pipeline Cards
    gsap.utils.toArray('.pipeline-card').forEach((card, index) => {
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

  // 4. Leaf Diagnosis Workbench Logic
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

  // Drag and drop events
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
    const files = dt.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.match('image.*')) {
      alert('Please upload a valid image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      showPreview(e.target.result);
      runAnalysisWithFile(file);
    };
    reader.readAsDataURL(file);
  }

  function showPreview(src) {
    previewImg.src = src;
    previewContainer.style.display = 'block';
    lidarScanline.style.display = 'block';
    hudBadge.className = 'hud-badge idle';
    hudBadge.innerHTML = '<span class="pulse-dot"></span> Analyzing';
    readoutCrop.textContent = 'Spectrometric Scan in Progress...';
    readoutDiagnosis.textContent = 'Processing Foliage Pixels...';
  }

  async function runAnalysisWithFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      });
      const res = await response.json();
      if (res.success) {
        displayResults(res.data);
      } else {
        showError(res.error || 'Failed to process image');
      }
    } catch (err) {
      showError('Inference request failed: ' + err.message);
    }
  }

  // Quick Test Sample Function
  window.testSample = async function(sampleFileName, chipElement) {
    document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
    if (chipElement) chipElement.classList.add('active');

    const sampleUrl = `/static/samples/${sampleFileName}`;
    showPreview(sampleUrl);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample: sampleFileName })
      });
      const res = await response.json();
      if (res.success) {
        displayResults(res.data);
      } else {
        showError(res.error || 'Failed to analyze sample');
      }
    } catch (err) {
      showError('Sample analysis failed: ' + err.message);
    }
  };

  function displayResults(data) {
    setTimeout(() => {
      lidarScanline.style.display = 'none';

      const isHealthy = data.is_healthy;
      hudBadge.className = isHealthy ? 'hud-badge healthy' : 'hud-badge diseased';
      hudBadge.innerHTML = isHealthy 
        ? '<i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> Healthy' 
        : '<i data-lucide="alert-triangle" style="width:14px;height:14px;"></i> Pathology Detected';

      readoutCrop.textContent = `${data.crop} Specimen`;
      readoutDiagnosis.textContent = data.condition;

      confidenceScore.textContent = `${data.confidence}% Match`;
      confidenceBarFill.style.width = `${Math.min(data.confidence, 100)}%`;

      treatmentBox.style.display = 'block';
      treatmentText.textContent = data.treatment;

      if (data.top3 && data.top3.length > 0) {
        candidatesContainer.innerHTML = data.top3.map(c => `
          <div class="candidate-item">
            <span class="candidate-name">${c.crop} • ${c.condition}</span>
            <span class="candidate-val">${c.percentage}%</span>
          </div>
        `).join('');
      }

      if (window.lucide) lucide.createIcons();
    }, 450);
  }

  function showError(msg) {
    lidarScanline.style.display = 'none';
    hudBadge.className = 'hud-badge diseased';
    hudBadge.textContent = 'Error';
    readoutCrop.textContent = 'Inference Notice';
    readoutDiagnosis.textContent = msg;
  }
});
