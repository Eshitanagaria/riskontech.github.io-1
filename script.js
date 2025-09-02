    // --- Create RISKON Themed "Dossier" Report ---
    function createDossierReport(applicantId) {
        const applicant = applicantsData[applicantId];
        const latestRecord = applicant.history.reduce((latest, current) => current.Month_Offset > latest.Month_Offset ? current : latest);
        
        const prob = latestRecord.Predicted_Prob_Default;
        let cibilScore;
        if (prob <= 0.15) { cibilScore = 780 + (1 - prob/0.15) * 120; } 
        else if (prob <= 0.70) { cibilScore = 650 + (1 - (prob - 0.15)/0.55) * 130; } 
        else { cibilScore = 300 + (1 - (prob - 0.70)/0.30) * 350; }
        cibilScore = Math.round(cibilScore);

        let riskCategory;
        if (prob > 0.7) riskCategory = 'High';
        else if (prob > 0.4) riskCategory = 'Medium';
        else riskCategory = 'Low';
        
        const riskColorClass = riskCategory === 'Low' ? 'risk-low' : riskCategory === 'Medium' ? 'risk-medium' : 'risk-high';
        const paymentHistoryHTML = applicant.history
            .map(h => {
                const statusClass = h.Payment_Status.includes('late') ? 'risk-high' : h.Payment_Status.includes('early') ? 'risk-low' : '';
                return `<div class="info-pair"><span class="label">Month ${h.Month_Offset}:</span><span class="value ${statusClass}">${h.Payment_Status}</span></div>`;
            })
            .join('');

        const reportHTML = `
            <div id="report-page-container" class="report-container" style="opacity: 0;">
                <div class="report-header">
                    <h1>RISKON&trade; Intelligence Report</h1>
                    <div class="report-info">
                        <strong>Applicant ID:</strong> ${applicantId}<br>
                        <strong>Report Date:</strong> ${new Date().toLocaleDateString('en-GB')}
                    </div>
                </div>

                <div class="section grid-2-col">
                    <div class="report-section">
                        <h3 class="report-section-title">Personal Details</h3>
                        <div class="report-section-content">
                            <div class="info-pair"><span class="label">Name:</span> <span class="value">${applicant.personal.name}</span></div>
                            <div class="info-pair"><span class="label">Date of Birth:</span> <span class="value">${applicant.personal.dob}</span></div>
                            <div class="info-pair"><span class="label">Gender:</span> <span class="value">${applicant.personal.gender}</span></div>
                        </div>
                    </div>
                     <div class="report-section">
                        <h3 class="report-section-title">RISKON Score</h3>
                         <div class="score-box">
                            <div id="cibil-score-span" class="score-value ${riskColorClass}">300</div>
                            <div class="score-label">CIBIL Equivalent</div>
                        </div>
                    </div>
                </div>

                 <div class="section report-section">
                    <h3 class="report-section-title">RISK ANALYSIS & TRACKING</h3>
                     <div class="report-section-content">
                         <div class="graph-container">
                            <img src="${applicant.graphImage}" alt="Risk Trend Graph for Applicant ${applicantId}">
                        </div>
                     </div>
                </div>

                <div class="section report-section">
                    <h3 class="report-section-title">CREDIT ACCOUNT & PAYMENT HISTORY</h3>
                    <div class="report-section-content payment-history-grid">
                        ${paymentHistoryHTML || '<p>No historical payments found.</p>'}
                    </div>
                </div>
                
                <div class="report-generation-section">
                     <button id="generate-report-btn" onclick="handleGenerateReport('${applicantId}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 flex items-center mx-auto">
                        <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12,1.75A10.25,10.25,0,0,0,1.75,12A10.25,10.25,0,0,0,12,22.25A10.25,10.25,0,0,0,22.25,12A10.25,10.25,0,0,0,12,1.75ZM9.25,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,9.25,6Zm6,12a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,15.25,18Zm-2-6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,13.25,12Z"/></svg>
                        Generate AI Summary
                    </button>
                    <div id="ai-summary-container" class="hidden mt-6">
                        <div class="report-section">
                            <h3 class="report-section-title">QUICK SUMMARY</h3>
                            <div class="report-section-content">
                                <p id="ai-summary-text" class="text-base leading-relaxed text-gray-300"></p>
                            </div>
                        </div>
                        <button id="download-pdf-btn" class="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                            Download as PDF
                        </button>
                    </div>
                </div>
            </div>`;
        
        reportContentWrapper.innerHTML = reportHTML;
        document.getElementById('download-pdf-btn').addEventListener('click', () => downloadReportAsPDF(applicantId));

        // --- GSAP ANIMATIONS FOR THE REPORT ---
        const tl = gsap.timeline();
        const scoreCounter = { value: 300 };
        
        tl.to("#report-page-container", { opacity: 1, duration: 0.5 })
          .to(scoreCounter, { 
              value: cibilScore, 
              duration: 1.5, 
              ease: "power2.out",
              onUpdate: () => {
                  document.getElementById("cibil-score-span").textContent = Math.round(scoreCounter.value);
              }
          }, "-=0.2")
          .from(".section", { opacity: 0, y: 30, stagger: 0.2, duration: 0.6 }, "-=1.2")
          .from(".graph-container img", { scale: 1.1, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.8");
    }

    // --- Handle Report Generation Click ---
    window.handleGenerateReport = function(applicantId) {
        const applicant = applicantsData[applicantId];
        const summaryContainer = document.getElementById('ai-summary-container');
        const summaryContent = document.getElementById('ai-summary-text');
        const generateBtn = document.getElementById('generate-report-btn');

        summaryContent.textContent = "";
        summaryContainer.classList.remove('hidden');
        gsap.set(summaryContainer, { height: 'auto', opacity: 1 });
        gsap.from(summaryContainer, { height: 0, opacity: 0, duration: 0.6, ease: 'power2.out' });
        
        generateBtn.style.display = 'none';

        setTimeout(() => {
            const summary = applicant.geminiSummary;
            let i = 0;
            function typeWriter() {
                if (i < summary.length) {
                    summaryContent.innerHTML += summary.charAt(i);
                    i++;
                    setTimeout(typeWriter, 15);
                }
            }
            typeWriter();
        }, 800);
    }

   
    // --- Landing Page Animations ---
    let heroScene, heroCamera, heroRenderer, heroParticles;
    function initHeroAnimation() {
        const container = document.getElementById('hero-animation');
        if (!container) return;
        heroScene = new THREE.Scene();
        heroCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        heroRenderer = new THREE.WebGLRenderer({ alpha: true });
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(heroRenderer.domElement);
        const particleCount = 8000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const heroTargetPositions = new Float32Array(particleCount * 3);
        const heroInitialPositions = new Float32Array(particleCount * 3);
        const fontLoader = new THREE.FontLoader();
        fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', 
            function (font) {
                const textGeometry = new THREE.TextGeometry('RISKON', { font: font, size: 1.5, height: 0.2, curveSegments: 12 });
                textGeometry.center();
                const sampler = new THREE.MeshSurfaceSampler(new THREE.Mesh(textGeometry)).build();
                const tempPosition = new THREE.Vector3();
                for (let i = 0; i < particleCount; i++) {
                    sampler.sample(tempPosition);
                    heroTargetPositions[i * 3] = tempPosition.x;
                    heroTargetPositions[i * 3 + 1] = tempPosition.y;
                    heroTargetPositions[i * 3 + 2] = tempPosition.z;
                }
                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    const radius = 10;
                    const theta = 2 * Math.PI * Math.random();
                    const phi = Math.acos(2 * Math.random() - 1);
                    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                    positions[i3 + 2] = radius * Math.cos(phi);
                }
                heroInitialPositions.set(positions);
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const material = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.035, transparent: true, opacity: 0 });
                heroParticles = new THREE.Points(geometry, material);
                heroScene.add(heroParticles);
                gsap.to(heroParticles.material, {opacity: 1, duration: 1});
            }
        );
        heroCamera.position.z = 10;
        const heroTimeline = gsap.timeline({ scrollTrigger: { trigger: "#hero-section", start: "top top", end: "bottom bottom", scrub: 1 } });
        heroTimeline.to({}, { duration: 1, onUpdate: function() { const progress = this.progress(); if (heroParticles) { const positions = heroParticles.geometry.attributes.position.array; for (let i = 0; i < particleCount; i++) { const i3 = i * 3; positions[i3] = THREE.MathUtils.lerp(heroInitialPositions[i3], heroTargetPositions[i3], progress); positions[i3 + 1] = THREE.MathUtils.lerp(heroInitialPositions[i3+1], heroTargetPositions[i3+1], progress); positions[i3 + 2] = THREE.MathUtils.lerp(heroInitialPositions[i3+2], heroTargetPositions[i3+2], progress); } heroParticles.geometry.attributes.position.needsUpdate = true; } } }, 0);
        heroTimeline.to({}, { duration: 1, onUpdate: function() { const progress = this.progress(); if (heroParticles) { const positions = heroParticles.geometry.attributes.position.array; for (let i = 0; i < particleCount; i++) { const i3 = i * 3; const dismemberedX = heroTargetPositions[i3] * (1 + progress * 5); const dismemberedY = heroTargetPositions[i3+1] * (1 + progress * 5); const dismemberedZ = heroTargetPositions[i3+2] * (1 + progress * 5); positions[i3] = dismemberedX; positions[i3 + 1] = dismemberedY; positions[i3 + 2] = dismemberedZ; } heroParticles.geometry.attributes.position.needsUpdate = true; heroParticles.material.opacity = 1 - progress; } } }, 1);
        heroTimeline.to("#hero-text", { opacity: 1, duration: 0.5 }, 1.5);
        animateHero();
    }
    function animateHero() { requestAnimationFrame(animateHero); if (heroRenderer) { if (heroParticles && !ScrollTrigger.isScrolling) heroParticles.rotation.y += 0.0001; heroRenderer.render(heroScene, heroCamera); } }
    window.addEventListener('resize', () => { if(heroRenderer) { heroCamera.aspect = window.innerWidth / window.innerHeight; heroCamera.updateProjectionMatrix(); heroRenderer.setSize(window.innerWidth, window.innerHeight); } }, false);
    initHeroAnimation();

    
    // --- "SIMPLE LINES WITH ARROWS" ANIMATION ---
    const solutionStepsData = [ 
        { title: "Stage 1: Raw Material Intake", description: "Raw, disorganized data files are ingested into the RISKON Data Pipeline." },
        { title: "Stage 2: The 'Glass Box' Chamber", description: "Features are selected (IV) and transformed (WoE) into a standardized format." },
        { title: "Stage 3: The Cohort Sorting Hub", description: "The population is segmented into distinct financial archetypes using K-Means Clustering." },
        { title: "Stage 4: Dynamic Calibration Lab", description: "Cohort-specific Ordinary Differential Equations (ODEs) are calibrated from historical data." },
        { title: "Stage 5: Final Model Assembly", description: "A unique, regularized Master Risk Equation is trained for each cohort." }
    ];
    const stepsContainer = document.getElementById('solution-steps');
    stepsContainer.innerHTML = '';
    solutionStepsData.forEach((step, i) => { stepsContainer.innerHTML += `<div class="step-content" id="step-${i}"><h3 class="text-3xl font-bold mb-3">${step.title}</h3><p class="text-slate-400 text-lg">${step.description}</p></div>`; });
    
    function initSolutionViz() {
        const stepContents = document.querySelectorAll(".step-content");
        stepContents.forEach((step, i) => { 
            ScrollTrigger.create({ 
                trigger: step, 
                start: "top center", 
                end: "bottom center", 
                onEnter: () => updateSolutionSVG(i),
                onEnterBack: () => updateSolutionSVG(i),
            }); 
        });

        const svgConnectors = document.querySelectorAll('.svg-connector');
        svgConnectors.forEach(connector => {
            const pathLength = connector.getTotalLength();
            connector.style.strokeDasharray = pathLength;
            connector.style.strokeDashoffset = pathLength;
        });

        updateSolutionSVG(0);
    }

    function updateSolutionSVG(index) {
        const svgNodes = document.querySelectorAll('.svg-node');
        const svgConnectors = document.querySelectorAll('.svg-connector');

        svgNodes.forEach((node, i) => {
            node.classList.toggle('is-active', i <= index);
        });

        svgConnectors.forEach((connector, i) => {
            const pathLength = connector.getTotalLength();
            if (i < index) {
                gsap.to(connector, { 
                    strokeDashoffset: 0, 
                    duration: 0.5,
                    onStart: () => {
                        connector.setAttribute('marker-end', 'url(#arrowhead-active)');
                        connector.style.stroke = '#3b82f6';
                    }
                });
            } else {
                gsap.to(connector, { 
                    strokeDashoffset: pathLength, 
                    duration: 0.5,
                    onComplete: () => {
                        connector.setAttribute('marker-end', 'url(#arrowhead-inactive)');
                        connector.style.stroke = '#475569';
                    }
                });
            }
        });
    }
    
    initSolutionViz();
});
