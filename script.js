document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);

    // --- Page Elements ---
    const landingPage = document.getElementById('landing-page');
    const monitoringPage = document.getElementById('monitoring-page');
    const reportPage = document.getElementById('report-page');
    const demoBtn = document.getElementById('demo-btn');
    const backToLandingBtn = document.getElementById('back-to-landing-btn');
    const backToMonitoringBtn = document.getElementById('back-to-monitoring-btn');
    const applicantListContainer = document.getElementById('applicant-list');
    const reportContentWrapper = document.getElementById('report-content-wrapper');

    // --- Navigation ---
    function showPage(page) {
        landingPage.classList.add('hidden');
        monitoringPage.classList.add('hidden');
        reportPage.classList.add('hidden');
        page.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
    demoBtn.addEventListener('click', () => { populateApplicantList(); showPage(monitoringPage); });
    backToLandingBtn.addEventListener('click', () => showPage(landingPage));
    backToMonitoringBtn.addEventListener('click', () => showPage(monitoringPage));

    // --- Populate Applicant List ---
    function populateApplicantList() {
        applicantListContainer.innerHTML = '';
        Object.keys(applicantsData).forEach(applicantId => {
            const applicant = applicantsData[applicantId];
            const latestRecord = applicant.history.reduce((latest, current) => current.Month_Offset > latest.Month_Offset ? current : latest);
            const riskPercentage = (latestRecord.Predicted_Prob_Default * 100).toFixed(2);
            const riskCategory = latestRecord.Risk_Category;
            const riskColorClass = riskCategory === 'Low' ? 'text-green-400' : riskCategory === 'Medium' ? 'text-yellow-400' : 'text-red-400';
            
            const item = document.createElement('div');
            item.className = 'glass-card monitoring-card p-4 rounded-lg flex justify-between items-center cursor-pointer transition duration-300';
            item.innerHTML = `
                <div>
                    <p class="text-slate-400 text-sm">Applicant ID</p>
                    <p class="text-white font-semibold text-lg">${parseInt(applicantId)}</p>
                </div>
                <div class="text-right">
                    <p class="text-slate-400 text-sm">Risk (${riskCategory})</p>
                    <p class="font-semibold text-lg ${riskColorClass}">${riskPercentage}%</p>
                </div>`;
            item.addEventListener('click', () => { createCibilReport(applicantId); showPage(reportPage); });
            applicantListContainer.appendChild(item);
        });
    }
    
    // --- Create CIBIL-Style Report ---
    function createCibilReport(applicantId) {
        const applicant = applicantsData[applicantId];

        if (!applicant || !applicant.history || applicant.history.length === 0) {
            reportContentWrapper.innerHTML = `<div id="report-page-container"><p class="text-red-500 text-center text-lg p-10">Error: Critical data missing for applicant ${applicantId}. Cannot generate report.</p></div>`;
            gsap.from("#report-page-container", {opacity: 0, y: 20, duration: 0.5});
            return;
        }

        const latestRecord = applicant.history.reduce((latest, current) => current.Month_Offset > latest.Month_Offset ? current : latest);
        
        const prob = latestRecord.Predicted_Prob_Default;
        let cibilScore;
        if (prob <= 0.15) { cibilScore = 780 + (1 - prob/0.15) * 120; } 
        else if (prob <= 0.70) { cibilScore = 650 + (1 - (prob - 0.15)/0.55) * 130; } 
        else { cibilScore = 300 + (1 - (prob - 0.70)/0.30) * 350; }
        cibilScore = Math.round(cibilScore);
        
        const riskColorClass = latestRecord.Risk_Category === 'Low' ? 'risk-low' : latestRecord.Risk_Category === 'Medium' ? 'risk-medium' : 'risk-high';
        
        const paymentHistoryHTML = applicant.history
            .map(h => {
                const statusClass = h.Payment_Status.includes('late') ? 'risk-high' : h.Payment_Status.includes('early') ? 'risk-low' : '';
                return `<div class="info-pair"><span class="label">Month ${h.Month_Offset}:</span><span class="value ${statusClass}">${h.Payment_Status}</span></div>`;
            })
            .join('');

        const reportHTML = `
            <div id="report-page-container" style="opacity: 0;">
                <div class="header">
                    <h1>RISKON&trade; <span style="color: #555; font-weight: 300;">CIBIL Co-Branded Report</span></h1>
                    <div class="report-info">
                        <strong>Applicant ID:</strong> ${applicantId}<br>
                        <strong>Report Date:</strong> ${new Date().toLocaleDateString('en-GB')}
                    </div>
                </div>
                <div class="section grid-container">
                    <div class="info-box">
                        <h3 class="font-bold">RISKON Score</h3>
                        <div class="score-gauge-container">
                            <svg class="score-gauge-svg" viewBox="0 0 200 100">
                                <circle class="score-gauge-track" pathLength="100"></circle>
                                <circle id="score-gauge-bar" class="score-gauge-bar ${riskColorClass}" pathLength="100"></circle>
                            </svg>
                            <div class="score-gauge-text">
                                <div id="cibil-score-span" class="score-value ${riskColorClass}">300</div>
                                <div class="score-label">CIBIL Equivalent</div>
                            </div>
                        </div>
                    </div>
                    <div class="info-box">
                        <h3 class="font-bold">Personal & Risk Details</h3>
                        <div class="info-pair"><span class="label">Name:</span> <span class="value">${applicant.personal.name}</span></div>
                        <div class="info-pair"><span class="label">Date of Birth:</span> <span class="value">${applicant.personal.dob}</span></div>
                        <div class="info-pair"><span class="label">Gender:</span> <span class="value">${applicant.personal.gender}</span></div>
                        <div class="info-pair"><span class="label">RISKON Category:</span> <span class="value font-bold ${riskColorClass}">${latestRecord.Risk_Category}</span></div>
                        <div class="info-pair"><span class="label">Default Probability:</span> <span class="value">${(prob * 100).toFixed(2)}%</span></div>
                    </div>
                </div>
                 <div class="section">
                    <div class="section-title">RISKON DYNAMIC RISK TRACKING</div>
                     <div class="graph-container">
                        <img src="${applicant.graphImage}" alt="Risk Trend Graph for Applicant ${applicantId}">
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">CREDIT ACCOUNT & PAYMENT HISTORY</div>
                    <div class="payment-history-grid">
                        ${paymentHistoryHTML || '<p>No historical payments found.</p>'}
                    </div>
                </div>
                <div class="report-generation-section text-center">
                     <button id="generate-report-btn" onclick="handleGenerateReport('${applicantId}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 flex items-center mx-auto">
                        <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12,1.75A10.25,10.25,0,0,0,1.75,12A10.25,10.25,0,0,0,12,22.25A10.25,10.25,0,0,0,22.25,12A10.25,10.25,0,0,0,12,1.75ZM9.25,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,9.25,6Zm6,12a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,15.25,18Zm-2-6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,13.25,12Z"/></svg>
                        Generate AI Summary
                    </button>
                    <div id="ai-summary-container" class="hidden mt-6 text-left">
                        <div class="info-box">
                            <h3 class="font-bold">AI-POWERED SUMMARY (GEMINI-STYLE)</h3>
                            <div id="ai-summary-content">
                                <p id="ai-summary-text" class="text-base leading-relaxed"></p>
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

        const tl = gsap.timeline();
        const scoreCounter = { value: 300 };
        const gaugeBar = document.getElementById('score-gauge-bar');
        const scorePercentage = (cibilScore - 300) / 600;
        const dashOffset = 100 * (1 - scorePercentage);
        
        gaugeBar.style.strokeDasharray = 100;
        gaugeBar.style.strokeDashoffset = 100;
        
        tl.to("#report-page-container", { opacity: 1, duration: 0.5 })
          .to(scoreCounter, { 
              value: cibilScore, 
              duration: 1.5, 
              ease: "power2.out",
              onUpdate: () => {
                  document.getElementById("cibil-score-span").textContent = Math.round(scoreCounter.value);
              }
          }, "-=0.2")
          .to(gaugeBar, { 
              strokeDashoffset: dashOffset, 
              duration: 1.5, 
              ease: "power2.out" 
          }, "<")
          .from(".section", { opacity: 0, y: 30, stagger: 0.2, duration: 0.6 }, "-=1.2")
          .from(".graph-container img", { scale: 1.1, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.8");
    }

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
                    setTimeout(typeWriter, 20);
                }
            }
            typeWriter();
        }, 800);
    }

    // BUG FIX: Rewritten PDF function for reliability
    function downloadReportAsPDF(applicantId) {
        const reportElement = document.getElementById('report-page-container');
        const options = {
            margin: 0,
            filename: `RISKON_Report_${applicantId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        const elementToPrint = reportElement.cloneNode(true);
        elementToPrint.style.opacity = 1;
        elementToPrint.style.transform = 'none';
        elementToPrint.querySelectorAll('*').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });

        const btn1 = elementToPrint.querySelector('#generate-report-btn');
        const btn2 = elementToPrint.querySelector('#download-pdf-btn');
        if (btn1) btn1.style.display = 'none';
        if (btn2) btn2.style.display = 'none';

        elementToPrint.style.position = 'absolute';
        elementToPrint.style.left = '-9999px';
        document.body.appendChild(elementToPrint);

        html2pdf().from(elementToPrint).set(options).save().then(() => {
            document.body.removeChild(elementToPrint);
        });
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
    
    // --- "DATA REFINERY" ANIMATION ---
    const solutionStepsData = [ 
        { title: "Stage 1: Raw Material Intake", description: "We take in the chaos." }, 
        { title: "Stage 2: The 'Glass Box' Chamber", description: "We process and structure information." }, 
        { title: "Stage 3: The Cohort Sorting Hub", description: "We learn from the patterns." }, 
        { title: "Stage 4: Dynamic Calibration Lab", description: "We calibrate cohort-specific dynamics." },
        { title: "Stage 5: Final Model Assembly", description: "We predict risk, before it strikes." }
    ];
    const stepsContainer = document.getElementById('solution-steps');
    solutionStepsData.forEach((step, i) => { stepsContainer.innerHTML += `<div class="step-content" id="step-${i}"><h3 class="text-3xl font-bold mb-3">${step.title}</h3><p class="text-slate-400 text-lg">${step.description}</p></div>`; });
    
    function initSolutionViz() {
        const viz = document.getElementById('solution-viz');
        viz.innerHTML = `
            <div id="s1-funnel" class="refinery-element funnel" style="top: 35%; left: 50%; transform: translateX(-50%);">
                <div class="refinery-label">RISKON Data Pipeline</div>
            </div>
            <div id="s1-file1" class="refinery-element file-icon">application_train.csv</div>
            <div id="s1-file2" class="refinery-element file-icon">bureau.csv</div>
            <div id="s1-file3" class="refinery-element file-icon">previous_application.csv</div>
            <div id="s1-file4" class="refinery-element file-icon">installments_payments.csv</div>
            <div id="s1-belt" class="refinery-element conveyor-belt" style="top: 60%; left: 50%; transform: translateX(-50%); opacity: 0;"></div>
            <div id="s1-grid" class="refinery-element data-grid" style="top: 62%; left: 50%; transform: translateX(-50%); opacity: 0; scale: 0.5;">
                ${Array.from({length: 30}).map(() => `<div class="data-grid-cell"></div>`).join('')}
            </div>
        `;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#solution-section-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: (self) => {
                    const stepProgress = Math.floor(self.progress * solutionStepsData.length);
                    document.querySelectorAll(".step-content").forEach((step, i) => {
                        step.classList.toggle('is-active', i === stepProgress);
                    });
                }
            }
        });

        // Stage 1 Animation
        tl.from(["#s1-file1", "#s1-file2", "#s1-file3", "#s1-file4"], {
            opacity: 0, y: (i) => (i % 2 === 0 ? -150 : 150), x: (i) => (i < 2 ? -150 : 150), stagger: 0.1, duration: 0.2
        }).to(["#s1-file1", "#s1-file2", "#s1-file3", "#s1-file4"], {
            y: 0, x: 0, scale: 0.1, opacity: 0, duration: 0.2
        }).to("#s1-funnel", { opacity: 0, scale: 0.5, y: -50, duration: 0.1 })
          .to(["#s1-belt", "#s1-grid"], { opacity: 1, y: 0, scale: 1, duration: 0.2 });

        // Placeholder for future stages
        tl.to({}, {duration: 0.8}); // Add duration for the other 4 stages
    }
    
    initSolutionViz();
});
