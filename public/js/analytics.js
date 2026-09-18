// Store chart instances so they can be destroyed before re-creating
var charts = {
    city: null,
    state: null,
    country: null
};

// Color palettes
var COLORS = {
    primary: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#4338CA', '#5B21B6', '#7E22CE', '#9333EA', '#A855F7'],
    teal: ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#0F766E', '#115E59', '#134E4A', '#042F2E', '#0D9488'],
    varied: ['#4F46E5','#7C3AED','#EC4899','#F59E0B','#10B981','#06B6D4','#8B5CF6','#F97316','#14B8A6','#6366F1']
};

// Color helper to ensure enough colors for any number of items
function getColors(palette, count) {
    var colors = [];
    for (var i = 0; i < count; i++) {
        colors.push(palette[i % palette.length]);
    }
    return colors;
}

function destroyCharts() {
    if (charts.city) { charts.city.destroy(); charts.city = null; }
    if (charts.state) { charts.state.destroy(); charts.state = null; }
    if (charts.country) { charts.country.destroy(); charts.country = null; }
}

async function loadAnalytics() {
    destroyCharts();
    await fetchAndRenderSummary();
    await fetchAndRenderCityChart();
    await fetchAndRenderStateChart();
    await fetchAndRenderCountryChart();
}

async function fetchAndRenderSummary() {
    var res = await apiCall('/api/analytics/summary');
    
    if (res && res.success) {
        var data = res.data;
        var container = document.getElementById('analytics-summary');
        
        container.innerHTML = 
            '<div class="summary-card">' +
                '<div class="summary-value">' + (data.totalUsers || data.total_users || 0) + '</div>' +
                '<div class="summary-label">Total Users</div>' +
            '</div>' +
            '<div class="summary-card">' +
                '<div class="summary-value">' + (data.distinctCities || data.unique_cities || 0) + '</div>' +
                '<div class="summary-label">Cities</div>' +
            '</div>' +
            '<div class="summary-card">' +
                '<div class="summary-value">' + (data.distinctStates || data.unique_states || 0) + '</div>' +
                '<div class="summary-label">States</div>' +
            '</div>' +
            '<div class="summary-card">' +
                '<div class="summary-value">' + (data.distinctCountries || data.unique_countries || 0) + '</div>' +
                '<div class="summary-label">Countries</div>' +
            '</div>';
    }
}

async function fetchAndRenderCityChart() {
    var res = await apiCall('/api/analytics/by-city');
    
    if (res && res.success && res.data) {
        var labels = res.data.map(function(d) { return d.city || 'Unknown'; });
        var data = res.data.map(function(d) { return d.count; });
        
        var ctx = document.getElementById('cityChart').getContext('2d');
        charts.city = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Users',
                    data: data,
                    backgroundColor: getColors(COLORS.primary, data.length),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

async function fetchAndRenderStateChart() {
    var res = await apiCall('/api/analytics/by-state');
    
    if (res && res.success && res.data) {
        var labels = res.data.map(function(d) { return d.state || 'Unknown'; });
        var data = res.data.map(function(d) { return d.count; });
        
        var ctx = document.getElementById('stateChart').getContext('2d');
        charts.state = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Users',
                    data: data,
                    backgroundColor: getColors(COLORS.teal, data.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

async function fetchAndRenderCountryChart() {
    var res = await apiCall('/api/analytics/by-country');
    
    if (res && res.success && res.data) {
        var labels = res.data.map(function(d) { return d.country || 'Unknown'; });
        var data = res.data.map(function(d) { return d.count; });
        
        var ctx = document.getElementById('countryChart').getContext('2d');
        charts.country = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: getColors(COLORS.varied, data.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });
    }
}
