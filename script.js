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
            const latestRecord = applicant.history.length > 0 ? applicant.history.reduce((latest, current) => current.Month_Offset > latest.Month_Offset ? current : latest) : { Predicted_Prob_Default: 0, Risk_Category: 'N/A' };
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
    
    // --- Create RISKON Themed Report (WITH ENHANCED ANIMATIONS) ---
    function createCibilReport(applicantId) {
        const applicant = applicantsData[applicantId];
        const latestRecord = applicant.history.length > 0 ? applicant.history.reduce((latest, current) => current.Month_Offset > latest.Month_Offset ? current : latest) : { Predicted_Prob_Default: 0, Risk_Category: 'N/A' };
        
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
                         <div class="graph-canvas-container">
                            <img src="${applicant.graphImage}" alt="Risk Trend Graph" />
                            <canvas id="graph-animation-canvas"></canvas>
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
                        <h3 class="report-section-title">AI-POWERED SUMMARY (GEMINI-STYLE)</h3>
                        <div class="report-section-content">
                            <div id="ai-summary-content">
                                <button id="generate-report-btn" onclick="handleGenerateReport('${applicantId}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                                    Generate Insights
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
        
        // --- SETUP AND ANIMATE REPORT ---
        setupTabs();
        animateGraph(applicantId);
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

    function animateGraph(applicantId) {
        const canvas = document.getElementById('graph-animation-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const applicant = applicantsData[applicantId];
        const history = applicant.history.filter(h => h.Data_Type === 'Historical').sort((a,b) => a.Month_Offset - b.Month_Offset);

        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        if (history.length < 2) return; // Need at least 2 points to draw a line

        const points = history.map((p, i) => ({
            x: (i / (history.length - 1)) * canvas.width,
            y: (1 - p.Predicted_Prob_Default) * canvas.height
        }));

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)'); // High risk color
        gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)'); // Medium risk color
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.5)'); // Low risk color
        
        const animationProgress = { val: 0 };
        gsap.to(animationProgress, {
            val: 1,
            duration: 2,
            ease: "power2.inOut",
            delay: 0.5,
            onUpdate: () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);

                const currentPointIndex = Math.floor((points.length - 1) * animationProgress.val);
                for (let i = 1; i <= currentPointIndex; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                
                if (currentPointIndex < points.length - 1) {
                    const lastPoint = points[currentPointIndex];
                    const nextPoint = points[currentPointIndex + 1];
                    const segmentProgress = ((points.length - 1) * animationProgress.val) % 1;
                    const interpolatedX = lastPoint.x + (nextPoint.x - lastPoint.x) * segmentProgress;
                    const interpolatedY = lastPoint.y + (nextPoint.y - lastPoint.y) * segmentProgress;
                    ctx.lineTo(interpolatedX, interpolatedY);
                }

                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    }

    // --- Handle Report Generation Click ---
    window.handleGenerateReport = function(applicantId) {
        const applicant = applicantsData[applicantId];
        const summaryContent = document.getElementById('ai-summary-content');
        const generateBtn = document.getElementById('generate-report-btn');
        const pdfArea = document.getElementById('pdf-download-area');

        generateBtn.textContent = 'Analyzing...';
        generateBtn.disabled = true;

        setTimeout(() => { // Simulate API call delay
            generateBtn.style.display = 'none';
            const summary = applicant.geminiSummary;
            summaryContent.innerHTML = `<p></p>`;
            const p = summaryContent.querySelector('p');
            
            let i = 0;
            function typeWriter() {
                if (i < summary.length) {
                    p.innerHTML += summary.charAt(i);
                    i++;
                    setTimeout(typeWriter, 15);
                } else {
                    p.style.borderRight = 'none';
                    pdfArea.classList.remove('hidden');
                    gsap.from(pdfArea, { opacity: 0, y: 10, duration: 0.5 });
                }
            }
            typeWriter();
        }, 1200);
    }

    // --- Handle PDF Download ---
    function downloadReportAsPDF(applicantId) {
        const reportElement = document.getElementById('report-page-container');
        const options = { margin: 0, filename: `RISKON_Report_${applicantId}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#1f2937' }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
        
        const btnContainer = reportElement.querySelector('#pdf-download-area');
        const originalDisplay = btnContainer.style.display;
        btnContainer.style.display = 'none'; // Hide button for PDF

        html2pdf().from(reportElement).set(options).save().then(() => {
            btnContainer.style.display = originalDisplay; // Show it again
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
    
    // --- NEURAL NETWORK ANIMATION ---
    const solutionStepsData = [ { title: "Data Engineering", description: "From raw, complex data sources to actionable, time-series insights." }, { title: "Feature Preprocessing", description: "Utilizing Weight of Evidence (WoE) and Information Value (IV) for powerful feature selection." }, { title: "Cohort Discovery", description: "Personalized risk assessment by segmenting borrowers into financial archetypes using K-Means clustering." }, { title: "Dynamic Calibration", description: "Solving Ordinary Differential Equations (ODEs) to model dynamic risk factors." }, { title: "Final Model Training", description: "Training cohort-specific ElasticNet models for maximum accuracy and fairness." } ];
    const stepsContainer = document.getElementById('solution-steps');
    solutionStepsData.forEach((step, i) => { stepsContainer.innerHTML += `<div class="step-content" id="step-${i}"><h3 class="text-3xl font-bold mb-3">${step.title}</h3><p class="text-slate-400">${step.description}</p></div>`; });
    
    let vizScene, vizCamera, vizRenderer, nodes = [], lines = [];
    
    function initSolutionViz() {
        const container = document.getElementById('solution-viz');
        if(!container) return;
        vizScene = new THREE.Scene();
        vizCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        vizRenderer = new THREE.WebGLRenderer({ alpha: true });
        vizRenderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(vizRenderer.domElement);
        vizCamera.position.set(0, 0, 12);

        const layers = [5, 7, 7, 4]; // Nodes per layer
        const layerPositions = [];
        const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
        
        layers.forEach((count, i) => {
            const layerX = (i - (layers.length - 1) / 2) * 4;
            const layer = [];
            for(let j = 0; j < count; j++) {
                const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
                const node = new THREE.Mesh(nodeGeo, nodeMat);
                const nodeY = (j - (count - 1) / 2) * 1.5;
                node.position.set(layerX, nodeY, 0);
                nodes.push(node);
                layer.push(node);
                vizScene.add(node);
            }
            layerPositions.push(layer);
        });

        for(let i = 0; i < layerPositions.length - 1; i++) {
            const currentLayer = layerPositions[i];
            const nextLayer = layerPositions[i+1];
            currentLayer.forEach(currentNode => {
                nextLayer.forEach(nextNode => {
                    const points = [currentNode.position, nextNode.position];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0 });
                    const line = new THREE.Line(lineGeo, lineMat);
                    lines.push(line);
                    vizScene.add(line);
                });
            });
        }
        
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

        tl.from(nodes.map(n => n.scale), { x: 0, y: 0, z: 0, stagger: 0.02, duration: 0.2 })
          .to(lines.map(l => l.material), { opacity: 0.5, stagger: 0.005, duration: 0.8 });

        animateViz();
    }

    function animateViz() {
        requestAnimationFrame(animateViz);
        if (vizRenderer) vizRenderer.render(vizScene, vizCamera);
    }
    
    initSolutionViz();
});
