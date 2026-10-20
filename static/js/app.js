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

  // 4. In-Browser Edge AI (ONNX Runtime Web Engine)
  // Dynamic Base Path resolution for GitHub Pages subpaths and Vercel/localhost
  function getAssetUrl(relativePath) {
    const currentPath = window.location.pathname;
    const baseDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    return new URL(relativePath, window.location.origin + baseDir).href;
  }

  let ortSession = null;
  let labelsMeta = null;
  let modelLoading = false;
  let modelLoadPromise = null;

  async function initInBrowserModel() {
    if (!window.ort) {
      console.warn('ONNX Runtime Web script not available on window.');
      return;
    }
    if (modelLoadPromise) return modelLoadPromise;

    modelLoadPromise = (async () => {
      try {
        modelLoading = true;
        
        // Critical: Set WASM engine CDN paths for GitHub Pages subpaths
        if (ort.env && ort.env.wasm) {
          ort.env.wasm.numThreads = 1; // Single-thread mode for maximum cross-origin compatibility
          ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
        }
        
        // Primary: Hugging Face Model Hub CDN (CORS & Range Request Enabled)
        const HF_BASE = 'https://huggingface.co/Av1447/plant-disease-model/resolve/main';
        const labelsUrl = `${HF_BASE}/labels.json`;
        const modelUrl = `${HF_BASE}/model.onnx`;

        console.log(`[FloraAI] Loading taxonomy from Hugging Face CDN: ${labelsUrl}`);
        const labelsRes = await fetch(labelsUrl);
        if (!labelsRes.ok) throw new Error(`HTTP ${labelsRes.status} loading labels.json`);
        labelsMeta = await labelsRes.json();

        console.log(`[FloraAI] Downloading neural model (~55MB) from: ${modelUrl}`);
        ortSession = await ort.InferenceSession.create(modelUrl, {
          executionProviders: ['wasm']
        });

        console.log('[FloraAI] Model loaded successfully into WebAssembly engine!');
        modelLoading = false;
        
        // Update HUD badge to ready if waiting
        if (hudBadge && hudBadge.classList.contains('idle')) {
          hudBadge.innerHTML = '<i data-lucide="cpu" style="width: 14px; height: 14px;"></i> Ready';
          if (window.lucide) lucide.createIcons();
        }
      } catch (e) {
        console.error('[FloraAI] Model initialization error:', e);
        modelLoading = false;
      }
    })();

    return modelLoadPromise;
  }

  // In Server Mode, the backend handles the 55MB model.
  // The client browser never downloads the 55MB model.
  if (hudBadge) {
    hudBadge.className = 'hud-badge idle';
    hudBadge.innerHTML = '<i data-lucide="cpu" style="width: 14px; height: 14px;"></i> Server Ready';
    if (window.lucide) lucide.createIcons();
  }

  async function predictImageInBrowser(imgElement) {
    if (modelLoading) {
      showLoadingModelNotice();
      await modelLoadPromise;
    }

    if (!ortSession || !labelsMeta) {
      throw new Error('Neural model is still initializing. Please wait a few seconds.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, 256, 256);

    const imageData = ctx.getImageData(0, 0, 256, 256);
    const data = imageData.data;

    // Tensor shape: [1, 256, 256, 3] Float32 normalized to [0, 1]
    const float32Data = new Float32Array(1 * 256 * 256 * 3);
    let p = 0;
    for (let i = 0; i < data.length; i += 4) {
      float32Data[p++] = data[i] / 255.0;     // R
      float32Data[p++] = data[i + 1] / 255.0; // G
      float32Data[p++] = data[i + 2] / 255.0; // B
    }

    const inputTensor = new ort.Tensor('float32', float32Data, [1, 256, 256, 3]);
    const inputName = ortSession.inputNames[0];
    const outputName = ortSession.outputNames[0];
    const feeds = { [inputName]: inputTensor };
    
    const outputMap = await ortSession.run(feeds);
    const outputTensor = outputMap[outputName];
    const probs = Array.from(outputTensor.data);

    // Compute top 3
    const indices = probs.map((prob, idx) => ({ prob, idx }))
                         .sort((a, b) => b.prob - a.prob)
                         .slice(0, 3);

    const topClasses = indices.map(item => {
      const fmt = labelsMeta.formatted[item.idx];
      return {
        raw: labelsMeta.classes[item.idx],
        crop: fmt.crop,
        condition: fmt.condition,
        confidence: item.prob,
        percentage: Math.round(item.prob * 1000) / 10
      };
    });

    const primary = topClasses[0];
    const info = labelsMeta.formatted[indices[0].idx];

    return {
      raw_label: primary.raw,
      crop: info.crop,
      condition: info.condition,
      is_healthy: info.is_healthy,
      confidence: primary.percentage,
      treatment: info.treatment,
      top3: topClasses
    };
  }

  function showLoadingModelNotice() {
    hudBadge.className = 'hud-badge idle';
    hudBadge.innerHTML = '<span class="pulse-dot"></span> Downloading Engine';
    readoutCrop.textContent = 'Neural Weight Ingestion';
    readoutDiagnosis.textContent = 'Downloading Model (~55MB)...';
  }

  // 5. Leaf Diagnosis Workbench Logic
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
      // Directly send to Python backend server (No 55MB client-side model download!)
      runAnalysisWithServer(file);
    };
    reader.readAsDataURL(file);
  }

  function showPreview(src) {
    previewImg.src = src;
    previewContainer.style.display = 'block';
    lidarScanline.style.display = 'block';
    hudBadge.className = 'hud-badge idle';
    hudBadge.innerHTML = '<span class="pulse-dot"></span> Analyzing';
    readoutCrop.textContent = 'Neural Inference in Progress...';
    readoutDiagnosis.textContent = 'Processing via Server Engine...';
  }

  async function runAnalysisWithServer(file) {
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
      showError('Diagnosis Notice: ' + err.message);
    }
  }

  // Quick Test Sample Function (Server-Side Inference)
  window.testSample = async function(sampleFileName, chipElement) {
    document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
    if (chipElement) chipElement.classList.add('active');

    const sampleUrl = getAssetUrl(`static/samples/${sampleFileName}`);
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
        showError(res.error || 'Failed to process sample');
      }
    } catch (err) {
      showError('Diagnosis Notice: ' + err.message);
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
    hudBadge.textContent = 'Notice';
    readoutCrop.textContent = 'Inference Status';
    readoutDiagnosis.textContent = msg;
  }
});
