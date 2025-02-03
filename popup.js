// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    setupEventListeners();
});

// Load all statistics
function loadStats() {
    chrome.storage.sync.get(null, (result) => {
        let totalTasks = 0;
        let totalNotes = 0;
        const sites = new Set();
        const siteStats = {};

        // Process all storage data
        for (const [key, value] of Object.entries(result)) {
            if (key.endsWith('_notes')) {
                const site = key.replace('_notes', '');
                sites.add(site);
                totalNotes += value.length;
                if (!siteStats[site]) siteStats[site] = {};
                siteStats[site].notes = value.length;
            } else if (key.endsWith('_analytics')) {
                const site = key.replace('_analytics', '');
                sites.add(site);
                if (!siteStats[site]) siteStats[site] = {};
                siteStats[site].analytics = value;
            } else if (Array.isArray(value)) {
                // This is a tasks array
                sites.add(key);
                totalTasks += value.length;
                if (!siteStats[key]) siteStats[key] = {};
                siteStats[key].tasks = value.length;
            }
        }

        // Update total stats
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('totalNotes').textContent = totalNotes;

        // Render site list
        renderSiteList(siteStats);
    });
}

// Render the list of sites with their stats
function renderSiteList(siteStats) {
    const siteList = document.getElementById('siteList');
    siteList.innerHTML = '';

    for (const [site, stats] of Object.entries(siteStats)) {
        const siteItem = document.createElement('div');
        siteItem.className = 'site-item';
        
        siteItem.innerHTML = `
            <div class="site-info">
                <img src="https://www.google.com/s2/favicons?domain=${site}&sz=32" class="site-favicon" alt="${site}"/>
                <div class="site-name">${site}</div>
            </div>
            <div class="site-stats">
                ${stats.tasks ? `
                    <div class="stat-badge task-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                        </svg>
                        ${stats.tasks} tasks
                    </div>
                ` : ''}
                ${stats.notes ? `
                    <div class="stat-badge note-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                        </svg>
                        ${stats.notes} notes
                    </div>
                ` : ''}
            </div>
        `;

        // Add click event to open the site's dashboard
        siteItem.addEventListener('click', () => {
            openDashboard(site);
        });

        siteList.appendChild(siteItem);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('openDashboard').addEventListener('click', () => {
        // Get the current active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);
            openDashboard(url.hostname);
        });
    });
}

// Open dashboard for a specific site
function openDashboard(site) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        // Send message to content script to open dashboard
        chrome.tabs.sendMessage(currentTab.id, {
            action: 'open-dashboard',
            site: site
        });
        // Close popup
        window.close();
    });
} 