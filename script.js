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
            // BUG FIX: Ensure history exists and is not empty before using reduce
            const latestRecord = (applicant.history && applicant.history.length > 0)
                ? applicant.history.reduce((latest, current) => current.Month_Offset > latest.Month_Offset ? current : latest)
                : { Predicted_Prob_Default: 0, Risk_Category: 'N/A' }; // Fallback

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
    
    // --- Create RISKON DOSSIER REPORT ---
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
            .filter(h => h.Data_Type === "Historical")
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
                        <h3 class="report-section-title">AI-POWERED SUMMARY</h3>
                        <div class="report-section-content">
                            <div id="ai-summary-content">
                                <button id="generate-report-btn" onclick="handleGenerateReport('${applicantId}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                                    Generate Live Insights with Gemini
                                </button>
                            </div>
                            <div id="pdf-download-area" class="hidden mt-4">
                               <button id="download-pdf-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                                    Download Full Report as PDF
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
        const history = applicant.history.filter(h => h.Data_Type === 'Historical').sort((a,b) => a.Month_Offset - b.Month_Offset);

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

    window.handleGenerateReport = async function(applicantId) {
        const applicantData = applicantsData[applicantId];
        const summaryContent = document.getElementById('ai-summary-content');
        const generateBtn = document.getElementById('generate-report-btn');
        const pdfArea = document.getElementById('pdf-download-area');

        generateBtn.style.display = 'none';
        summaryContent.innerHTML = `<div class="loader"></div> <p class="text-gray-400">Contacting Gemini for live analysis...</p>`;

        try {
            const response = await fetch('/api/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicantData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'The API returned an error.');
            }

            const data = await response.json();
            const summary = data.summary;
            summaryContent.innerHTML = `<p id="ai-summary-text"></p>`;
            const p = summaryContent.querySelector('p');
            
            let i = 0;
            function typeWriter() {
                if (i < summary.length) {
                    p.innerHTML += summary.charAt(i);
                    i++;
                    setTimeout(typeWriter, 15);
                } else {
                    pdfArea.classList.remove('hidden');
                    gsap.from(pdfArea, { opacity: 0, y: 10, duration: 0.5 });
                }
            }
            typeWriter();

        } catch (error) {
            summaryContent.innerHTML = `<p class="text-red-400">Error: Could not connect to the Gemini API. This may be due to a missing API key during deployment. Please see INSTRUCTIONS.md.</p><p class="text-xs text-gray-500 mt-2">${error.message}</p>`;
        }
    }

    function downloadReportAsPDF(applicantId) {
        const reportElement = document.getElementById('report-page-container');
        const options = { margin: 0, filename: `RISKON_Report_${applicantId}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#111827' }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
        
        const pdfBtn = reportElement.querySelector('#download-pdf-btn');
        const originalDisplay = pdfBtn.style.display;
        pdfBtn.style.display = 'none';

        html2pdf().from(reportElement).set(options).save().then(() => {
            pdfBtn.style.display = 'block';
        });
    }

    // --- Landing Page Animations ---
    let heroScene, heroCamera, heroRenderer, heroParticles;
    function initHeroAnimation() { /* ... [Unchanged Hero Animation Code] ... */ }
    function animateHero() { /* ... [Unchanged Hero Animation Code] ... */ }
    window.addEventListener('resize', () => { if(heroRenderer) { /* ... */ } }, false);
    initHeroAnimation();
    
    // --- SOLUTION ANIMATION: 3D DATA FUNNEL ---
    const solutionStepsData = [ { title: "Data Engineering", description: "From raw, complex data sources to actionable, time-series insights." }, { title: "Feature Preprocessing", description: "Utilizing Weight of Evidence (WoE) and Information Value (IV) for powerful feature selection." }, { title: "Cohort Discovery", description: "Personalized risk assessment by segmenting borrowers into financial archetypes using K-Means clustering." }, { title: "Dynamic Calibration", description: "Solving Ordinary Differential Equations (ODEs) to model dynamic risk factors." }, { title: "Final Model Training", description: "Training cohort-specific ElasticNet models for maximum accuracy and fairness." } ];
    const stepsContainer = document.getElementById('solution-steps');
    solutionStepsData.forEach((step, i) => { stepsContainer.innerHTML += `<div class="step-content" id="step-${i}"><h3 class="text-3xl font-bold mb-3">${step.title}</h3><p class="text-slate-400">${step.description}</p></div>`; });
    
    let vizScene, vizCamera, vizRenderer, particles, funnel;
    
    function initSolutionViz() {
        const container = document.getElementById('solution-viz');
        if(!container) return;
        vizScene = new THREE.Scene();
        vizCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        vizRenderer = new THREE.WebGLRenderer({ alpha: true });
        vizRenderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(vizRenderer.domElement);
        vizCamera.position.set(0, 0, 15);

        const particleGeo = new THREE.BufferGeometry();
        const particleCount = 2000;
        const posArray = new Float32Array(particleCount * 3);
        const colorArray = new Float32Array(particleCount * 3);

        for(let i=0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const particleMat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true });
        particles = new THREE.Points(particleGeo, particleMat);
        vizScene.add(particles);

        const funnelGeo = new THREE.CylinderGeometry(0.1, 2, 8, 32, 1, true);
        const funnelMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.3 });
        funnel = new THREE.Mesh(funnelGeo, funnelMat);
        funnel.position.y = 2;
        funnel.visible = false;
        vizScene.add(funnel);

        const crystalGeo = new THREE.IcosahedronGeometry(2, 0);
        const crystalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x3b82f6, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0 });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.y = -6;
        vizScene.add(crystal);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#solution-section-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const stepProgress = Math.floor(progress * 5);
                    const stepContents = document.querySelectorAll(".step-content");
                    stepContents.forEach((step, i) => {
                        step.classList.toggle('is-active', i === stepProgress);
                    });
                }
            }
        });

        tl.to(particles.position, { y: 0, duration: 0.1 }) // Phase 0: Data Engineering
         .to(particles.position, { y: -4, duration: 0.2 }, "+=0.05") // Phase 1: Preprocessing
         .call(() => { funnel.visible = true; }, null, ">")
         .to(funnel.material, { opacity: 0.7, duration: 0.05 }, "<")
         .to(particles.rotation, { z: Math.PI * 2, duration: 0.2 }) // Phase 2: Cohort Discovery
         .call(() => {
            const colors = particles.geometry.attributes.color.array;
            for(let i=0; i<particleCount; i++){
                const cohort = Math.random();
                if (cohort < 0.33) new THREE.Color(0x22c55e).toArray(colors, i*3);
                else if (cohort < 0.66) new THREE.Color(0xf59e0b).toArray(colors, i*3);
                else new THREE.Color(0xef4444).toArray(colors, i*3);
            }
            particles.geometry.attributes.color.needsUpdate = true;
         }, null, ">")
         .to(particles.position, { y: -8, duration: 0.2 }) // Phase 3: Calibration
         .to(funnel.material, { opacity: 0, duration: 0.05 }, "<")
         .call(() => { funnel.visible = false; }, null, ">")
         .to(crystal.material, { opacity: 0.8, duration: 0.1 }) // Phase 4: Final Model
         .to(particles.material, { opacity: 0, duration: 0.1 }, "<");

        animateViz();
    }

    function animateViz() {
        requestAnimationFrame(animateViz);
        if (vizRenderer) vizRenderer.render(vizScene, vizCamera);
    }
    
    initSolutionViz();
});
