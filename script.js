document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);
    let currentChart = null; // To hold the chart instance

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
            item.addEventListener('click', () => { createDossierReport(applicantId); showPage(reportPage); });
            applicantListContainer.appendChild(item);
        });
    }
    
    // --- Create RISKON "Dossier" Report ---
    function createDossierReport(applicantId) {
        if (currentChart) {
            currentChart.destroy();
        }
        const applicant = applicantsData[applicantId];

        // BUG FIX: Check for applicant data and history existence at the very start.
        if (!applicant || !applicant.history || applicant.history.length === 0) {
            reportContentWrapper.innerHTML = `<div class="report-container"><p class="text-red-400 text-center text-lg p-10">Error: Critical data missing for applicant ${applicantId}. Cannot generate report.</p></div>`;
            gsap.from(reportContentWrapper, {opacity: 0, y: 20, duration: 0.5});
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
            <div id="report-page-container" class="report-container" style="opacity: 0;">
                <div class="report-header">
                    <div>
                        <h1>RISKON&trade; Digital Dossier</h1>
                        <p class="text-gray-400">Applicant ID: ${applicantId} | Name: ${applicant.personal.name}</p>
                    </div>
                    <div class="report-info">
                        <strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}<br>
                        <strong>Control:</strong> RKN${applicantId}
                    </div>
                </div>

                <div class="tab-nav">
                    <button class="tab-button active" data-tab="dashboard">Risk Dashboard</button>
                    <button class="tab-button" data-tab="ledger">Payment Ledger</button>
                    <button class="tab-button" data-tab="insights">AI Insights</button>
                </div>

                <div id="tab-dashboard" class="tab-content active">
                    <div class="report-section mt-6">
                        <div class="grid-3-col">
                             <div class="kpi-card">
                                <p class="label">RISKON Category</p>
                                <p class="value ${riskColorClass}">${latestRecord.Risk_Category}</p>
                            </div>
                             <div class="kpi-card">
                                <p class="label">Default Probability</p>
                                <p class="value">${(prob * 100).toFixed(2)}%</p>
                            </div>
                             <div class="kpi-card">
                                <p class="label">CIBIL Equivalent</p>
                                <p class="value">${cibilScore}</p>
                            </div>
                        </div>
                         <div id="interactive-graph-container">
                            <canvas id="interactive-graph-canvas"></canvas>
                        </div>
                    </div>
                </div>

                <div id="tab-ledger" class="tab-content">
                    <div class="report-section mt-6">
                        <h3 class="report-section-title">Detailed Payment History</h3>
                        <div class="report-section-content payment-ledger-grid">
                            ${paymentHistoryHTML || '<p>No historical payments found.</p>'}
                        </div>
                    </div>
                </div>
                
                <div id="tab-insights" class="tab-content">
                     <div class="report-section mt-6">
                        <h3 class="report-section-title">QUICK SUMMARY</h3>
                        <div class="report-section-content">
                            <div id="ai-summary-content">
                                <button id="generate-report-btn" onclick="handleGenerateReport('${applicantId}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                                    Generate Insights
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        
        reportContentWrapper.innerHTML = reportHTML;
        
        setupTabs();
        animateInteractiveGraph(applicantId);
        gsap.from("#report-page-container", { opacity: 0, duration: 0.5 });
        gsap.from(".kpi-card", { opacity: 0, y: 30, stagger: 0.15, duration: 0.5, delay: 0.2 });
    }

    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                tabContents.forEach(content => {
                    content.classList.toggle('active', content.id === `tab-${tabId}`);
                });
            });
        });
    }

    function animateInteractiveGraph(applicantId) {
        const canvas = document.getElementById('interactive-graph-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const applicant = applicantsData[applicantId];
        const history = applicant.history.filter(h => h.Data_Type !== 'Forecast').sort((a,b) => a.Month_Offset - b.Month_Offset);

        if (history.length < 1) return;

        const labels = history.map(p => `Month ${p.Month_Offset}`);
        const data = history.map(p => p.Predicted_Prob_Default * 100);

        const riskColor = history[history.length-1].Risk_Category === 'Low' ? '#22c55e' : history[history.length-1].Risk_Category === 'Medium' ? '#f59e0b' : '#ef4444';

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Default Probability (%)',
                    data: data,
                    borderColor: riskColor,
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointBackgroundColor: riskColor,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: riskColor,
                    pointHoverBorderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: '#1f2937',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) { return `Risk: ${context.parsed.y.toFixed(2)}%`; }
                        }
                    }
                }
            }
        });
    }

    window.handleGenerateReport = function(applicantId) {
        const applicant = applicantsData[applicantId];
        const summaryContent = document.getElementById('ai-summary-content');
        const generateBtn = document.getElementById('generate-report-btn');
        
        generateBtn.style.display = 'none';
        summaryContent.innerHTML = `<p id="ai-summary-text"></p>`;
        const p = summaryContent.querySelector('p');
            
        let i = 0;
        const summary = applicant.geminiSummary;
        function typeWriter() {
            if (i < summary.length) {
                p.innerHTML += summary.charAt(i);
                i++;
                setTimeout(typeWriter, 15);
            }
        }
        typeWriter();
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

    
    // --- NEW "SIMPLE LINES WITH ARROWS" ANIMATION ---
    const solutionStepsData = [ 
        { title: "Stage 1: Raw Material Intake", description: "Raw, disorganized data files are ingested into the RISKON Data Pipeline." },
        { title: "Stage 2: The 'Glass Box' Chamber", description: "Features are selected (IV) and transformed (WoE) into a standardized format." },
        { title: "Stage 3: The Cohort Sorting Hub", description: "The population is segmented into distinct financial archetypes using K-Means Clustering." },
        { title: "Stage 4: Dynamic Calibration Lab", description: "Cohort-specific Ordinary Differential Equations (ODEs) are calibrated from historical data." },
        { title: "Stage 5: Final Model Assembly", description: "A unique, regularized Master Risk Equation is trained for each cohort." }
    ];
    const stepsContainer = document.getElementById('solution-steps');
    stepsContainer.innerHTML = ''; // Clear previous content
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

        updateSolutionSVG(0); // Initialize first state
    }

    function updateSolutionSVG(index) {
        const svgNodes = document.querySelectorAll('.svg-node');
        const svgConnectors = document.querySelectorAll('.svg-connector');

        svgNodes.forEach((node, i) => {
            node.classList.toggle('is-active', i === index);
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
