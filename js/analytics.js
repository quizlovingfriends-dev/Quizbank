/**
 * analytics.js — Performance Dashboard Logic
 */

(function() {
    const TOPIC_META = {
        "sports":          { label: "Sports",          icon: "🏆" },
        "wildlife":        { label: "Wildlife",         icon: "🦁" },
        "current-affairs": { label: "Current Affairs",  icon: "📰" },
        "history":         { label: "History",          icon: "🏛️" },
        "politics":        { label: "Politics",         icon: "⚖️" },
        "cuisines":        { label: "Cuisines",         icon: "🍜" },
        "science":         { label: "Science",          icon: "🔬" },
        "literature":      { label: "Literature",       icon: "📚" },
        "geography":       { label: "Geography",        icon: "🌍" },
        "general":         { label: "General",          icon: "🧠" }
    };

    function init() {
        state.subscribe(renderUI);
        state.loadQuestions(); // Ensure questions are loaded for counts
        renderUI(state.data);
    }

    function renderUI(data) {
        const perf = data.performance || {};
        const sessionsHistory = data.sessionHistory || [];
        
        // No data check
        if (sessionsHistory.length === 0 && (!perf.total || perf.total === 0)) {
            const main = document.querySelector('.qb-main');
            if (main) {
                main.innerHTML = '<h1 class="page-title">PERFORMANCE_ANALYTICS</h1><div style="padding:40px;border:3px dashed var(--ink);text-align:center;font-weight:700;">No practice sessions yet — start practicing to build your stats</div>';
            }
            return;
        }
        

        // Headline stat cards (Fix 4)
        const totalAttempted = (data.performance && data.performance.total) || 0;
        const accuracy = totalAttempted > 0 ? Math.round(((data.performance.correct || 0) / totalAttempted) * 100) : 0;
        const sessions = (data.sessionHistory || []).length;

        const statTotal = document.getElementById('stat-total');
        const statAcc = document.getElementById('stat-accuracy');
        const statStreak = document.getElementById('stat-streak');
        const statSessions = document.getElementById('stat-sessions');
        if (statTotal) statTotal.textContent = totalAttempted;
        if (statAcc) statAcc.textContent = accuracy + '%';
        if (statStreak) statStreak.textContent = (perf.streak || 0) + ' 🔥';
        if (statSessions) statSessions.textContent = sessions;

        // Topic Mastery (Item 3)
        const masteryChart = document.getElementById('mastery-chart');
        if (masteryChart) {
            masteryChart.innerHTML = Object.keys(TOPIC_META).map(topic => {
                const stats = perf.perTopic[topic] || { correct: 0, total: 0 };
                const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return `<div class="pixel-bar" style="height: ${pct}%;" data-value="${pct}%" title="${TOPIC_META[topic].label}"></div>`;
            }).join('');
        }

        // Accuracy Trend (Item 18)
        const accuracyChart = document.getElementById('accuracy-chart');
        if (accuracyChart) {
            const results = perf.dailyResults || {};
            const last12Days = [];
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                last12Days.push(d.toDateString());
            }
            
            accuracyChart.innerHTML = last12Days.map(day => {
                const r = results[day];
                const pct = (r && r.total > 0) ? Math.round((r.correct / r.total) * 100) : 0;
                return `<div class="pixel-bar" style="height: ${pct}%;" data-value="${pct}%" title="${day}"></div>`;
            }).join('');
        }

        // Activity Heatmap
        const activityGrid = document.getElementById('activity-grid');
        if (activityGrid) {
            const results = perf.dailyResults || {};
            const days = [];
            const now = new Date();
            for (let i = 119; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                days.push(d.toDateString());
            }
            activityGrid.innerHTML = days.map(day => {
                const r = results[day];
                const level = r ? (r.total >= 10 ? 'high' : 'low') : 'none';
                // Note: CSS classes for activity-cell are 'active' (high) or none. 
                // Let's use a simple background override if needed, or stick to classes.
                const isActive = r ? 'active' : '';
                return `<div class="activity-cell ${isActive}" title="${day}"></div>`;
            }).join('');
        }

        
        // Cumulative Performance Trend (last 12 sessions)
        const cumChart = document.getElementById('cumulative-chart-container');
        if (cumChart && sessionsHistory.length > 0) {
            const last12 = sessionsHistory.slice(-12);
            cumChart.innerHTML = '';
            const maxAcc = 100;
            const w = 100 / Math.max(last12.length, 1);
            last12.forEach((s, i) => {
                const acc = s.accuracy || 0;
                const h = acc + '%';
                const bar = document.createElement('div');
                bar.style.cssText = `position:absolute; bottom:0; left:${i * w}%; width:${w - 2}%; height:${h}; background:var(--ink);`;
                bar.title = `Session ${i+1}: ${acc}%`;
                cumChart.appendChild(bar);
            });
        }
        
        initAnimations();
    }

    function initAnimations() {
        if (typeof gsap === 'undefined') return;

        gsap.from(".stat-card", {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out"
        });

        gsap.from(".analytics-section", {
            y: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out"
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
