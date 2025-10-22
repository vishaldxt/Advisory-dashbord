function load_advisory_dashboard(frm) {
    if (frm.advisory_dashboard_loaded) return;
    frm.advisory_dashboard_loaded = true;

    const wrapper = frm.fields_dict.advisory_html.$wrapper;

    const renderContent = (htmlContent) => {
        wrapper.html(htmlContent);
        if (window.lucide) {
            lucide.createIcons();
        }
    };

    const loaderHtml = `
        <div class="k-loader-wrapper">
            <div class="k-dashboard-loader">
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
            </div>
            <p class="loader-text">Loading Advisory Dashboard...</p>
        </div>
        <style>
            .k-loader-wrapper { display:flex; flex-direction:column; justify-content:center; align-items:center; height:400px; background: linear-gradient(135deg, hsl(120, 60%, 97%), hsl(142, 70%, 92%)); border-radius: 1rem; }
            .k-dashboard-loader { position: relative; width: 80px; height: 80px; }
            .loader-ring { position: absolute; border: 4px solid transparent; border-top-color: hsl(142, 76%, 36%); border-radius: 50%; animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite; }
            .loader-ring:nth-child(1) { width: 64px; height: 64px; top: 8px; left: 8px; animation-delay: -0.45s; }
            .loader-ring:nth-child(2) { width: 48px; height: 48px; top: 16px; left: 16px; animation-delay: -0.3s; border-top-color: hsl(142, 71%, 45%); }
            .loader-ring:nth-child(3) { width: 32px; height: 32px; top: 24px; left: 24px; animation-delay: -0.15s; border-top-color: hsl(120, 60%, 97%); }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .loader-text { margin-top: 2rem; color: hsl(142, 76%, 36%); font-weight: 600; font-size: 1rem; animation: pulse 2s ease-in-out infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        </style>
    `;
    renderContent(loaderHtml);

    frappe.call({
        method: 'fetch_all_api_data',
        doc: frm.doc,
        callback: function(r) {
            if (!r || !r.message) {
                const errorHtml = `
                    <div class="k-card k-error-card">
                        <i data-lucide="alert-triangle"></i>
                        <h3>Failed to Load Dashboard</h3>
                        <p>There was a problem retrieving the advisory data. Please check the connection or try again later.</p>
                    </div>
                `;
                renderContent(errorHtml);
                return;
            }

            let apiData = r.message;
            const dfData = apiData.daily_forecast?.data || [];
            const hfData = apiData.hourly_forecast?.data || [];
            const swData = apiData.spray_window?.data || [];
            const waData = apiData.weather_alerts?.data?.[0] || null;
            const csData = apiData.crop_specific_data || [];

            const getIcon = (name) => `<i data-lucide="${name}"></i>`;

            const createEmptyCard = (title, message = 'Data not available', icon = 'info') => `
                <div class="k-card">
                    <div class="card-header"><div class="icon">${getIcon(icon)}</div><h3>${title}</h3></div>
                    <div class="empty-state">
                        <div class="empty-icon">${getIcon(icon)}</div>
                        <p>${message}</p>
                    </div>
                </div>`;

            const createWeatherAlertCard = (alert) => {
                const getSeverityInfo = (value) => {
                    switch (value) {
                        case 1: return { level: "Slight", color: "success", icon: "info" };
                        case 2: return { level: "Moderate", color: "warning", icon: "alert-triangle" };
                        case 3: return { level: "High", color: "destructive", icon: "cloud-lightning" };
                        case 4: return { level: "Severe", color: "alert", icon: "cloud-lightning" };
                        default: return { level: "Unknown", color: "muted", icon: "info" };
                    }
                };

                const updatedDate = alert ? new Date(alert.updated_at * 1000) : new Date();
                const hoursSinceUpdate = alert ? Math.floor((new Date().getTime() - updatedDate.getTime()) / 3600000) : 0;
                const hasAlert = alert && alert.value && hoursSinceUpdate < 24;
                const severity = hasAlert ? getSeverityInfo(alert.value) : getSeverityInfo(0);

                return `
                    <div class="k-card weather-alert-card">
                        <div class="card-header">
                            <div class="flex items-center gap-2">
                                <div class="icon text-primary">${getIcon('alert-triangle')}</div>
                                <h3>Weather Alerts</h3>
                            </div>
                            <span class="text-xs text-muted">Updated ${hoursSinceUpdate}h ago</span>
                        </div>
                        <div class="card-content">
                            <div class="alert-description ${hasAlert ? `border-${severity.color}` : 'border-muted'}">
                                <div class="icon text-${hasAlert ? severity.color : 'muted'}">${getIcon(hasAlert ? severity.icon : 'check-circle')}</div>
                                <div>
                                    <h4>${hasAlert ? `${severity.level} risk of thunderstorm` : 'No Active Alerts'}</h4>
                                    <p class="text-sm text-muted">${hasAlert ? 'Stay alert and monitor weather conditions. Take necessary precautions.' : 'Conditions are currently clear.'}</p>
                                </div>
                            </div>
                            <div class="alert-details">
                                <div class="detail-item">
                                    <span class="text-muted">Alert Level</span>
                                    <span class="font-semibold">${hasAlert ? alert.value : '0'} / 4</span>
                                </div>
                                <div class="detail-item">
                                    <span class="text-muted">Last Updated</span>
                                    <span class="font-semibold">${updatedDate.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
            };

            const createDailyForecastCard = (f) => {
                if (!f || !f.date || !f.temperature) return createEmptyCard("Daily Forecast", "Forecast data is currently unavailable.", "cloud-off");
                const formatDate = (date) => new Date(date).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
                const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "N/A";

                return `
                <div class="k-card daily-forecast-card">
                    <div class="card-header">
                        <div class="icon">${getIcon('calendar')}</div>
                        <h3>${formatDate(f.date)}</h3>
                    </div>
                    <div class="card-content space-y-4">
                        <div class="forecast-section temperature-section">
                            <div class="icon-bg">${getIcon('sun')}</div>
                            <div class="flex-1">
                                <p class="label">Temperature</p>
                            </div>
                            <div class="text-right">
                                <p class="value">${f.temperature.max}° / ${f.temperature.min}°</p>
                                <p class="label">High / Low</p>
                            </div>
                        </div>

                        <div class="sun-times">
                            <div class="sun-item">
                                <div class="icon">${getIcon('sunrise')}</div>
                                <div>
                                    <p class="label">Sunrise</p>
                                    <p class="value">${formatTime(f.timestamps?.sunrise)}</p>
                                </div>
                            </div>
                            <div class="sun-item">
                                <div class="icon">${getIcon('sunset')}</div>
                                <div>
                                    <p class="label">Sunset</p>
                                    <p class="value">${formatTime(f.timestamps?.sunset)}</p>
                                </div>
                            </div>
                        </div>

                        <div class="forecast-section moon-phase-section">
                             <div class="icon">${getIcon('moon')}</div>
                             <p class="label">Moon Phase</p>
                             <p class="value">${f.moon_phase || 'N/A'}</p>
                        </div>
                        
                        <div class="day-night-desc">
                            <div class="flex-between"><span>Day</span><span class="badge-outline">${f.weather?.description?.day || 'N/A'}</span></div>
                            <div class="flex-between"><span>Night</span><span class="badge-outline">${f.weather?.description?.night || 'N/A'}</span></div>
                        </div>

                        <div class="details-grid">
                            <div class="detail-item"><div class="icon">${getIcon('droplets')}</div> <span>Day Humidity</span> <span class="value">${f.humidity?.day || 'N/A'}%</span></div>
                            <div class="detail-item"><div class="icon">${getIcon('droplets')}</div> <span>Night Humidity</span> <span class="value">${f.humidity?.night || 'N/A'}%</span></div>
                            <div class="detail-item"><div class="icon">${getIcon('sun')}</div> <span>Day UV</span> <span class="value">${f.uvi?.day || 'N/A'}</span></div>
                            <div class="detail-item"><div class="icon">${getIcon('sun')}</div> <span>Night UV</span> <span class="value">${f.uvi?.night || 'N/A'}</span></div>
                            <div class="detail-item"><div class="icon">${getIcon('wind')}</div> <span>Day Wind</span> <span class="value">${f.wind?.speed?.day || 'N/A'} ${f.wind?.direction?.day || ''}</span></div>
                            <div class="detail-item"><div class="icon">${getIcon('wind')}</div> <span>Night Wind</span> <span class="value">${f.wind?.speed?.night || 'N/A'} ${f.wind?.direction?.night || ''}</span></div>
                        </div>

                        <div class="precipitation-section">
                            <p class="section-title"><div class="icon">${getIcon('cloud-rain')}</div>Precipitation</p>
                            <div class="precip-details">
                                <div>
                                    <p class="label">Day Probability</p>
                                    <p class="value">${f.precipitation?.probability?.day || '0'}%</p>
                                </div>
                                <div>
                                    <p class="label">Night Probability</p>
                                    <p class="value">${f.precipitation?.probability?.night || '0'}%</p>
                                </div>
                                <div class="col-span-2">
                                    <p class="label">Amount</p>
                                    <p class="value">${f.precipitation?.amount || '0.00'} mm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            };

            const createHourlyForecastCard = (f) => {
                 if (!f || !f.timestamp) return createEmptyCard("Hourly Forecast", "Forecast data is currently unavailable.", "cloud-off");
                const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `
                <div class="k-card">
                  <div class="card-header"><div class="icon">${getIcon('clock')}</div><h3>${formatTime(f.timestamp)}</h3></div>
                  <div class="space-y-3">
                    <div class="highlight-box temp-box">
                      <div class="flex items-center gap-2"><div class="icon">${getIcon('thermometer')}</div><span>Temperature</span></div>
                      <div class="text-2xl font-bold">${parseFloat(f.temp).toFixed(0)}°</div>
                      <div class="text-sm text-muted w-full">Feels like ${parseFloat(f.feels_like).toFixed(0)}°</div>
                    </div>
                    <div class="weather-desc">${f.weather?.description || 'N/A'}</div>
                    <div class="grid-2">
                      <div class="info-chip"><div class="icon-sm">${getIcon('droplets')}</div><div><div class="label">Humidity</div><div class="value">${f.humidity || 'N/A'}%</div></div></div>
                      <div class="info-chip"><div class="icon-sm">${getIcon('gauge')}</div><div><div class="label">Pressure</div><div class="value">${parseFloat(f.pressure).toFixed(0)} hPa</div></div></div>
                      <div class="info-chip"><div class="icon-sm text-secondary">${getIcon('sun')}</div><div><div class="label">UV Index</div><div class="value">${f.uvi || 'N/A'}</div></div></div>
                      <div class="info-chip"><div class="icon-sm">${getIcon('eye')}</div><div><div class="label">Visibility</div><div class="value">${parseFloat(f.visibility).toFixed(1)} km</div></div></div>
                    </div>
                    <div class="info-chip full"><div class="icon-sm">${getIcon('wind')}</div><div><div class="label">Wind</div><div class="value">${f.wind?.speed || 'N/A'} km/h ${f.wind?.direction || ''}</div></div></div>
                    ${(f.precipitation?.probability || 0) > 0 ? `
                    <div class="details-box">
                      <div class="flex items-center gap-2 mb-2"><div class="icon-sm">${getIcon('cloud-rain')}</div><span>Precipitation</span></div>
                      <div class="space-y-1 text-sm">
                        <div class="flex-between"><span>Probability</span><b>${f.precipitation.probability}%</b></div>
                        <div class="flex-between"><span>Type</span><b class="capitalize">${f.precipitation.type}</b></div>
                        <div class="flex-between"><span>Amount</span><b>${f.precipitation.amount} mm</b></div>
                      </div>
                    </div>` : ''}
                  </div>
                </div>`;
            };

            const createCropCard = (gddData) => {
                const crop = gddData?.data || {};
                if (!crop || !crop.stages || !Array.isArray(crop.stages)) {
                    return createEmptyCard("Crop Growth", "Crop data is currently unavailable.", "sprout");
                }
                const getCropIconName = (type) => {
                    switch (String(type).toLowerCase()) {
                        case "grain": return "wheat";
                        case "vegetable": return "leaf";
                        case "fruit": return "tree-pine";
                        default: return "sprout";
                    }
                };
                const currentStage = crop.stages.find(s => s.order === crop.das_stage);
                const healthStatus = crop.health === 1 ? {text: '✓ Good', color: 'success'} : crop.health === -1 ? {text: '✗ Poor', color: 'alert'} : {text: 'Unknown', color: 'muted'};

                return `
                <div class="k-card k-card-gradient-header">
                  <div class="card-header">
                    <div class="header-icon-bg">${getIcon(getCropIconName(crop.type))}</div>
                    <div><h3 class="font-bold">${crop.name}</h3><p class="text-sm text-muted capitalize">${crop.type}</p></div>
                  </div>
                  <div class="card-content space-y-6">
                    <div class="stage-highlight">
                      <p class="label-up">Current Growth Stage</p>
                      <p class="text-xl font-bold text-primary">${currentStage?.name || "Unknown"}</p>
                    </div>
                    <div class="grid-2">
                      <div class="metric-box"><p class="label-up">GDD Value</p><p class="text-2xl font-bold">${crop.gdd_value?.toFixed(1) || "N/A"}</p></div>
                      <div class="metric-box"><p class="label-up">Progress</p><p class="text-2xl font-bold">${crop.gdd_percentage?.toFixed(1) || "0"}%</p></div>
                    </div>
                    <div class="metric-box"><p class="label-up">Health Status</p><p class="text-lg font-bold text-${healthStatus.color}">${healthStatus.text}</p></div>
                    <div>
                      <p class="label-up mb-3">All Growth Stages</p>
                      <div class="space-y-2">
                        ${crop.stages.sort((a, b) => a.order - b.order).map(stage => `
                          <div class="stage-item ${stage.order === crop.das_stage ? 'active' : ''}">${stage.order + 1}. ${stage.name}</div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>`;
            };

            const createSprayWindowCard = (data) => {
              if (!data || !Array.isArray(data) || data.length === 0) {
                  return createEmptyCard("Spray Window", "No spray data available.", "droplet");
              }
              return `
              <div class="k-card k-card-gradient-header">
                <div class="card-header">
                  <div class="header-icon-bg">${getIcon('droplet')}</div>
                  <div><h3 class="font-bold">Spray Window</h3><p class="text-sm text-muted">Optimal spraying conditions</p></div>
                </div>
                <div class="card-content">
                  <div class="scroll-box">
                    ${data.map(item => `
                      <div class="spray-item border-${item.spray ? 'success' : 'alert'} bg-${item.spray ? 'success' : 'alert'}-light">
                        <div class="flex items-center gap-3">
                          <div class="icon text-${item.spray ? 'success' : 'alert'}">${getIcon(item.spray ? 'check-circle' : 'x-circle')}</div>
                          <div>
                            <p class="font-semibold">${new Date(item.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', hour12:true})}</p>
                            ${item.conditions ? `<p class="text-xs text-muted">${item.conditions}</p>` : ''}
                          </div>
                        </div>
                        <span class="font-bold text-sm text-${item.spray ? 'success' : 'alert'}">${item.spray ? '✓ Spray' : '✗ No Spray'}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>`;
            };

            const createSoilNutrientCard = (nutrientData) => {
                const nutrients = nutrientData?.data || {};
                if (!nutrients || Object.keys(nutrients).length === 0 || Array.isArray(nutrients)) {
                    return createEmptyCard("Soil Analysis", "No soil data available.", "leaf");
                }
                const getStatus = (value) => {
                    if (value === 0) return { label: "OK", color: "success", fill: "success" };
                    if (value === -1) return { label: "Low", color: "alert", fill: "alert" };
                    if (value === 1) return { label: "High", color: "warning", fill: "warning" };
                    return { label: "N/A", color: "muted", fill: "muted" };
                };
                return `
                <div class="k-card k-card-gradient-header">
                  <div class="card-header">
                    <div class="header-icon-bg">${getIcon('leaf')}</div>
                    <div><h3 class="font-bold">Soil Analysis</h3><p class="text-sm text-muted">Nutrient levels status</p></div>
                  </div>
                  <div class="card-content">
                    <div class="flex gap-2 text-xs mb-4 flex-wrap">
                      <span class="legend"><span class="dot bg-success"></span>0=OK</span>
                      <span class="legend"><span class="dot bg-alert"></span>-1=Low</span>
                      <span class="legend"><span class="dot bg-warning"></span>1=High</span>
                    </div>
                    <div class="scroll-box space-y-4">
                      ${Object.entries(nutrients).map(([nutrient, value]) => {
                        const status = getStatus(value);
                        return `
                        <div class="space-y-2">
                          <div class="flex-between">
                            <span class="font-semibold text-sm uppercase">${nutrient}</span>
                            <span class="badge-sm bg-${status.color}-light text-${status.color}">${status.label}</span>
                          </div>
                          <div class="progress-bar"><div class="progress-fill bg-${status.fill}"></div></div>
                        </div>`;
                      }).join('')}
                    </div>
                  </div>
                </div>`;
            };

            const createIrrigationCard = (irrigationData) => {
                const irrigation = irrigationData?.data || {};
                if (!irrigation || !irrigation.weekly_irrigation_details || irrigation.weekly_irrigation_details.length === 0) {
                    return createEmptyCard("Weekly Irrigation", "No irrigation data available.", "droplets");
                }
                return `
                <div class="k-card k-card-gradient-header">
                  <div class="card-header">
                    <div class="header-icon-bg">${getIcon('droplets')}</div>
                    <div><h3 class="font-bold">Weekly Irrigation</h3><p class="text-sm text-muted">Water requirements</p></div>
                  </div>
                  <div class="card-content space-y-4">
                    <div class="space-y-2">
                      ${irrigation.weekly_irrigation_details.map(item => `
                        <div class="irrigation-item">
                          <span class="text-sm font-semibold">${new Date(item.timestamp).toLocaleDateString([], {month:'short',day:'numeric'})}</span>
                          <span class="text-base font-bold text-primary">${item.irrigation_mm.toFixed(2)} mm</span>
                        </div>
                      `).join('')}
                    </div>
                    <div class="total-irrigation-box">
                      <p class="label-up opacity-90 mb-2">Total Weekly</p>
                      <p class="text-3xl font-bold mb-1">${irrigation.weekly_irrigation_mm?.toFixed(2) || '0.00'} mm</p>
                      ${irrigation.weekly_irrigation_liter ? `<p class="text-sm opacity-90">${irrigation.weekly_irrigation_liter.toFixed(2)} Liters</p>` : ''}
                    </div>
                  </div>
                </div>`;
            };

            const createCropsSection = (cropData) => {
                if (!cropData || cropData.length === 0) {
                    return `
                        <h2 class="section-title">Crop Monitoring</h2>
                        <div class="k-card">
                            <div class="empty-state">
                                <div class="empty-icon">${getIcon('info')}</div>
                                <p>No crop data available to display.</p>
                            </div>
                        </div>`;
                }

                const cropSelector = `
                    <div class="k-crop-selector-wrapper">
                        <label for="k-crop-selector">Select Crop</label>
                        <div class="select-box">
                            ${getIcon('leaf')}
                            <select id="k-crop-selector">
                                ${cropData.map(crop => `<option value="${crop.crop_id}">${crop.crop_name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                `;

                const cropCardsContainer = cropData.map((crop, index) => `
                    <div class="k-crop-data-wrapper ${index === 0 ? 'active' : ''}" data-crop-id="${crop.crop_id}">
                        <h2 class="section-title">Crop Growth Monitoring</h2>
                        <p class="section-subtitle">Track ${crop.crop_name}'s growth stages, health, and progress</p>
                        <div class="k-grid single-col">${createCropCard(crop.gdd)}</div>

                        <h2 class="section-title">Agricultural Management for ${crop.crop_name}</h2>
                        <div class="k-grid">
                            ${createSoilNutrientCard(crop.soil_nutrient)}
                            ${createIrrigationCard(crop.irrigation)}
                        </div>
                    </div>
                `).join('');

                return `
                    ${cropSelector}
                    <div id="k-crop-cards-container">
                        ${cropCardsContainer}
                    </div>
                    <h2 class="section-title">General Management</h2>
                     <div class="k-grid single-col">
                        ${createSprayWindowCard(swData)}
                    </div>
                    `;
            };

            let htmlContent = `
            <div class="k-dashboard">
                <div class="k-dashboard-header">
                    <div>
                        <h1>${getIcon('cloud-sun')} Advisory Dashboard</h1>
                        <p>Real-time weather insights and crop management</p>
                    </div>
                </div>

                <div class="k-toggle-bar">
                    <button class="k-toggle-btn active" data-tab="weather">${getIcon('cloud-sun')} Weather</button>
                    <button class="k-toggle-btn" data-tab="crops">${getIcon('sprout')} Crops</button>
                </div>

                <div id="weather-content" class="k-tab-content active">
                    <div class="k-grid full-width">${createWeatherAlertCard(waData)}</div>
                    <div class="k-toggle-bar secondary">
                         <button class="k-toggle-btn active" data-tab="daily">${getIcon('calendar')} Daily Forecast</button>
                         <button class="k-toggle-btn" data-tab="hourly">${getIcon('clock')} Hourly Forecast</button>
                    </div>
                    <div id="daily-content" class="k-tab-content active">
                        <div class="k-grid horizontal-scroll">${Array.isArray(dfData) && dfData.length > 0 ? dfData.map(createDailyForecastCard).join('') : createEmptyCard("Daily Forecast", "Forecast data is currently unavailable.", "cloud-off")}</div>
                    </div>
                    <div id="hourly-content" class="k-tab-content">
                        <div class="k-grid horizontal-scroll">${Array.isArray(hfData) && hfData.length > 0 ? hfData.map(createHourlyForecastCard).join('') : createEmptyCard("Hourly Forecast", "Forecast data is currently unavailable.", "cloud-off")}</div>
                    </div>
                </div>

                <div id="crops-content" class="k-tab-content">
                    ${createCropsSection(csData)}
                </div>
            </div>
            `;
            
            const style = `
                <style>
            :root {
                --primary: hsl(142, 76%, 36%);
                --primary-light: hsl(142, 70%, 92%);
                --secondary: hsl(48, 96%, 53%);
                --success: hsl(142, 76%, 36%);
                --warning: hsl(38, 92%, 50%);
                --destructive: hsl(0, 84%, 60%);
                --alert: hsl(0, 84%, 60%);
                --card-bg: hsl(0, 0%, 100%);
                --body-bg: hsl(120, 60%, 97%);
                --text-color: hsl(120, 10%, 15%);
                --text-muted: hsl(120, 10%, 47%);
                --border-color: hsl(120, 20%, 91%);
                --section-bg: hsl(120, 20%, 96%);
                --radius: 0.75rem;
            }
            .k-dashboard { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                background: linear-gradient(135deg, hsl(120, 60%, 97%), hsl(142, 70%, 92%));
                padding: 1.5rem; 
                color: var(--text-color);
                min-height: 100vh;
            }
            .k-dashboard * { box-sizing: border-box; }

            /* Typography */
            .font-bold { font-weight: 700; } 
            .font-semibold { font-weight: 600; } 
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; } 
            .text-xs { font-size: 0.75rem; line-height: 1rem; } 
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; } 
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; } 
            .text-2xl { font-size: 1.5rem; line-height: 2rem; } 
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }

            /* Spacing */
            .mb-1 { margin-bottom: 0.25rem; } 
            .mb-2 { margin-bottom: 0.5rem; } 
            .mb-3 { margin-bottom: 0.75rem; } 
            .mb-4 { margin-bottom: 1rem; } 
            .p-4 { padding: 1rem; }

            /* Flex */
            .flex { display: flex; } 
            .flex-1 { flex: 1; } 
            .items-center { align-items: center; } 
            .gap-2 { gap: 0.5rem; } 
            .gap-3 { gap: 0.75rem; } 
            .flex-between { display: flex; justify-content: space-between; align-items: center; }

            /* Spacing */
            .space-y-2 > *:not(:last-child) { margin-bottom: 0.5rem; } 
            .space-y-3 > *:not(:last-child) { margin-bottom: 0.75rem; } 
            .space-y-4 > *:not(:last-child) { margin-bottom: 1rem; } 
            .space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }

            /* Grid */
            .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } 
            .col-span-2 { grid-column: span 2; }

            /* Utilities */
            .w-full { width: 100%; } 
            .text-right { text-align: right; } 
            .capitalize { text-transform: capitalize; } 
            .uppercase { text-transform: uppercase; }

            /* Colors */
            .text-primary { color: var(--primary); } 
            .text-secondary { color: var(--secondary); } 
            .text-destructive { color: var(--destructive); } 
            .text-alert { color: var(--alert); } 
            .text-warning { color: var(--warning); } 
            .text-success { color: var(--success); } 
            .text-muted { color: var(--text-muted); }
            
            .bg-destructive { background-color: var(--destructive); color: white; } 
            .bg-alert { background-color: var(--alert); color: white; } 
            .bg-warning { background-color: var(--warning); color: white; } 
            .bg-success { background-color: var(--success); color: white; } 
            .bg-muted { background-color: var(--section-bg); }
            .bg-success-light { background-color: hsl(142, 76%, 95%); } 
            .bg-alert-light { background-color: hsl(0, 84%, 95%); } 
            .bg-warning-light { background-color: hsl(38, 92%, 95%); }
            
            .border-destructive { border-left: 3px solid var(--destructive); } 
            .border-alert { border-left: 3px solid var(--alert); } 
            .border-warning { border-left: 3px solid var(--warning); } 
            .border-success { border-left: 3px solid var(--success); } 
            .border-muted { border-left: 3px solid var(--border-color); }
            
            /* Dashboard Header */
            .k-dashboard-header { 
                text-align: left; 
                margin-bottom: 2rem; 
                background: linear-gradient(135deg, var(--primary), hsl(142, 76%, 28%));
                padding: 2rem; 
                border-radius: var(--radius); 
                box-shadow: 0 4px 6px -1px rgba(14,122,65,0.2);
            }
            .k-dashboard-header h1 { 
                font-size: 2rem; 
                font-weight: 700; 
                color: white; 
                margin: 0 0 0.5rem; 
                display: flex; 
                align-items: center; 
                justify-content: flex-start; 
                gap: 0.75rem; 
            }
            .k-dashboard-header p { color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 1rem; }
            
            /* Toggle Bar */
            .k-toggle-bar { 
                display: flex; 
                background-color: var(--card-bg); 
                border-radius: 99px; 
                padding: 0.5rem; 
                margin-bottom: 2rem; 
                max-width: 400px; 
                margin-left: auto; 
                margin-right: auto; 
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .k-toggle-btn { 
                flex: 1; 
                border: none; 
                background: transparent; 
                padding: 0.75rem 1rem; 
                border-radius: 99px; 
                font-weight: 600; 
                cursor: pointer; 
                transition: all 0.2s ease; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                gap: 0.5rem; 
                color: var(--text-muted); 
            }
            .k-toggle-btn.active { 
                background: var(--primary); 
                color: white; 
                box-shadow: 0 4px 6px -1px rgba(14,122,65,0.2);
            }
            .k-toggle-bar.secondary { max-width: 400px; }
            .k-tab-content { display: none; } 
            .k-tab-content.active { display: block; animation: fadeIn 0.3s; } 
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            
            /* Grid & Cards */
            .k-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
                gap: 1.5rem; 
            } 
            .k-grid.full-width { 
                grid-template-columns: 1fr; 
                max-width: 800px; 
                margin: 0 auto 1.5rem auto; 
            } 
            .k-grid.single-col { 
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
            } 
            
            .k-card { 
                background-color: var(--card-bg); 
                border-radius: var(--radius); 
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); 
                padding: 1.25rem; 
                border: 1px solid var(--border-color); 
                display: flex; 
                flex-direction: column; 
                transition: all 0.2s ease; 
            }
            .k-card:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .k-card .card-header { 
                display: flex; 
                align-items: center; 
                justify-content: flex-start; 
                gap: 0.75rem; 
                margin-bottom: 1rem; 
                padding-bottom: 0.75rem; 
                border-bottom: 1px solid var(--border-color);
                background: transparent;
            } 
            .k-card .card-header h3 { 
                font-size: 1.125rem; 
                font-weight: 600; 
                margin: 0; 
                color: var(--text-color);
            } 
            .k-card .card-header .icon { color: var(--primary); } 
            .k-card i[data-lucide] { width: 1.25rem; height: 1.25rem; } 
            .card-content { flex: 1; }
            
            .k-grid.horizontal-scroll { 
                display: flex; 
                flex-wrap: nowrap; 
                overflow-x: auto; 
                -webkit-overflow-scrolling: touch; 
                gap: 1.5rem; 
                padding-bottom: 1rem; 
                margin-left: -1rem; 
                margin-right: -1rem; 
                padding-left: 1rem; 
                padding-right: 1rem; 
                scrollbar-width: thin;
                scrollbar-color: var(--primary) var(--border-color);
            } 
            .k-grid.horizontal-scroll::-webkit-scrollbar {
                height: 8px;
            }
            .k-grid.horizontal-scroll::-webkit-scrollbar-track {
                background: var(--border-color);
                border-radius: 4px;
            }
            .k-grid.horizontal-scroll::-webkit-scrollbar-thumb {
                background: var(--primary);
                border-radius: 4px;
            }
            .k-grid.horizontal-scroll .k-card { flex: 0 0 340px; }
            
            /* Card-Specific */
            .weather-alert-card .card-header { border-bottom: none; padding-bottom: 0.5rem; }
            .weather-alert-card .alert-description { 
                display: flex; 
                align-items: start; 
                gap: 0.75rem; 
                padding: 1rem; 
                border-radius: var(--radius); 
                background-color: var(--section-bg); 
                margin-bottom: 1rem; 
            }
            .weather-alert-card .alert-description h4 { 
                font-weight: 600; 
                margin: 0 0 0.25rem; 
                color: var(--text-color);
            } 
            .weather-alert-card .alert-description p { margin: 0; }
            .weather-alert-card .alert-details { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 1rem; 
                font-size: 0.875rem; 
            } 
            .weather-alert-card .alert-details .detail-item { 
                display: flex; 
                flex-direction: column;
                gap: 0.25rem;
                padding: 0.5rem; 
            }
            
            .daily-forecast-card .card-header { 
                display: flex; 
                justify-content: flex-start; 
                gap: 0.5rem; 
                align-items: center; 
                border-bottom: none; 
                padding-bottom: 0.5rem; 
            }
            .daily-forecast-card .label { 
                font-size: 0.75rem; 
                color: var(--text-muted); 
                margin: 0; 
                font-weight: 500;
            } 
            .daily-forecast-card .value { 
                font-size: 1rem; 
                font-weight: 600; 
                margin: 0.125rem 0 0; 
                color: var(--text-color);
            }
            .daily-forecast-card .forecast-section { 
                display: flex; 
                align-items: center; 
                gap: 0.75rem; 
                background-color: var(--section-bg); 
                padding: 0.75rem; 
                border-radius: var(--radius); 
            }
            .daily-forecast-card .temperature-section .icon-bg { 
                background-color: var(--primary-light); 
                color: var(--primary); 
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
            }
            .daily-forecast-card .temperature-section .value { 
                font-size: 1.5rem; 
                font-weight: 700; 
            }
            .daily-forecast-card .sun-times { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 0.75rem; 
            }
            .daily-forecast-card .sun-item { 
                display: flex; 
                align-items: center; 
                gap: 0.5rem; 
                background-color: var(--section-bg); 
                padding: 0.75rem; 
                border-radius: var(--radius); 
            }
            .daily-forecast-card .sun-item .icon { color: var(--secondary); }
            .daily-forecast-card .moon-phase-section { justify-content: space-between; }
            .daily-forecast-card .day-night-desc { font-size: 0.875rem; }
            
            .badge-outline { 
                border: 1px solid var(--border-color); 
                padding: 0.25rem 0.6rem; 
                border-radius: 0.375rem; 
                font-size: 0.8rem; 
                font-weight: 500; 
                background-color: var(--section-bg);
            }
            
            .details-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 0.5rem; 
                font-size: 0.8rem; 
                background-color: var(--section-bg); 
                padding: 0.75rem; 
                border-radius: var(--radius); 
            }
            .details-grid .detail-item { 
                display: flex; 
                align-items: center; 
                gap: 0.375rem; 
                color: var(--text-muted); 
            }
            .details-grid .detail-item span:first-of-type {
                flex: 1;
            }
            .details-grid .detail-item .value { 
                font-weight: 600; 
                color: var(--text-color); 
            }
            .details-grid .icon { color: var(--text-muted); }
            
            .precipitation-section { 
                background-color: var(--section-bg); 
                padding: 0.75rem; 
                border-radius: var(--radius); 
            }
            .precipitation-section .section-title { 
                font-size: 0.875rem; 
                font-weight: 600; 
                display: flex; 
                align-items: center; 
                gap: 0.5rem; 
                margin-bottom: 0.75rem;
                color: var(--text-color);
            }
            .precipitation-section .precip-details { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 0.75rem; 
                text-align: center; 
            }
            .precipitation-section .value { 
                font-size: 1.125rem; 
                font-weight: 700; 
                color: var(--primary); 
            }
            
            .badge { 
                display: inline-block; 
                padding: 0.25rem 0.75rem; 
                border-radius: 99px; 
                font-weight: 600; 
                font-size: 0.8rem; 
            }
            .badge-sm { 
                font-size: 0.7rem; 
                font-weight: 700; 
                padding: 0.2rem 0.6rem; 
                border-radius: 99px; 
                text-transform: uppercase; 
            }
            
            .details-box { 
                background-color: var(--section-bg); 
                border-radius: var(--radius); 
                padding: 0.75rem; 
                font-size: 0.875rem; 
            }
            
            .highlight-box { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                background-color: var(--section-bg); 
                padding: 0.75rem 1rem; 
                border-radius: var(--radius); 
            } 
            .highlight-box.temp-box { flex-wrap: wrap; }
            
            .info-chip { 
                display: flex; 
                align-items: center; 
                gap: 0.5rem; 
                background-color: var(--section-bg); 
                padding: 0.5rem; 
                border-radius: var(--radius); 
            } 
            .info-chip.full { width: 100%; } 
            .info-chip .label { 
                font-size: 0.75rem; 
                color: var(--text-muted); 
                font-weight: 500;
            } 
            .info-chip .value { 
                font-size: 0.875rem; 
                font-weight: 600; 
                color: var(--text-color);
            } 
            .icon-sm i { width: 1rem; height: 1rem; }
            
            .weather-desc { 
                text-align: center; 
                padding: 0.5rem; 
                background-color: var(--primary-light); 
                color: var(--primary); 
                border-radius: var(--radius); 
                font-weight: 600; 
            }
            
            .empty-state { 
                text-align: center; 
                padding: 2rem; 
                margin: auto; 
            } 
            .empty-state .empty-icon { 
                width: 3rem; 
                height: 3rem; 
                margin: 0 auto 0.75rem; 
                color: var(--text-muted); 
                opacity: 0.5; 
            } 
            .empty-state p { 
                font-weight: 600; 
                color: var(--text-color);
            } 
            
            .section-title { 
                font-size: 1.5rem; 
                font-weight: 700; 
                margin: 2.5rem 0 0.5rem; 
                text-align: center; 
                color: var(--primary);
            } 
            .section-title:first-child { margin-top: 0; } 
            .section-subtitle { 
                text-align: center; 
                color: var(--text-muted); 
                margin-bottom: 1.5rem; 
                max-width: 600px; 
                margin-left: auto; 
                margin-right: auto;
            }
            
            .k-card-gradient-header .card-header { 
                background: transparent; 
                border-bottom: 1px solid var(--border-color); 
                margin: 0; 
                padding: 0 0 0.75rem 0; 
            }
            .header-icon-bg { 
                width: 3rem; 
                height: 3rem; 
                border-radius: 0.75rem; 
                background: var(--primary); 
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                box-shadow: 0 4px 6px -1px rgba(14,122,65,0.2);
            } 
            .header-icon-bg i { width: 1.5rem; height: 1.5rem; }
            
            .stage-highlight { 
                background: var(--primary-light); 
                border-radius: var(--radius); 
                padding: 1rem; 
                border-left: 4px solid var(--primary); 
            } 
            .label-up { 
                font-size: 0.75rem; 
                font-weight: 600; 
                color: var(--text-muted); 
                text-transform: uppercase; 
                letter-spacing: 0.05em; 
                margin: 0 0 0.25rem 0; 
            } 
            .metric-box { 
                background-color: var(--section-bg); 
                border-radius: var(--radius); 
                padding: 0.75rem; 
            } 
            .stage-item { 
                padding: 0.5rem 0.75rem; 
                border-radius: var(--radius); 
                font-size: 0.875rem; 
                font-weight: 500; 
                background-color: var(--section-bg); 
                color: var(--text-muted); 
                transition: all 0.2s ease; 
            } 
            .stage-item.active { 
                background: var(--primary); 
                color: white; 
                font-weight: 600; 
                box-shadow: 0 2px 4px rgba(14,122,65,0.2);
            }
            
            .scroll-box { 
                max-height: 400px; 
                overflow-y: auto; 
                padding-right: 0.25rem;
            }
            
            .spray-item { 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                padding: 1rem; 
                margin-bottom: 0.75rem;
                border-radius: var(--radius); 
                border-left-width: 4px; 
                transition: all 0.2s; 
            }
            
            .legend { 
                display: flex; 
                align-items: center; 
                gap: 0.25rem; 
                color: var(--text-muted); 
                font-weight: 500;
            } 
            .legend .dot { 
                width: 0.75rem; 
                height: 0.75rem; 
                border-radius: 99px; 
            }
            
            .progress-bar { 
                width: 100%; 
                height: 0.5rem; 
                background-color: var(--border-color); 
                border-radius: 99px; 
                overflow: hidden; 
            } 
            .progress-fill { 
                height: 100%; 
                width: 100%; 
                transition: all 0.5s; 
            }
            
            .irrigation-item { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 0.75rem; 
                background: var(--primary-light); 
                border-radius: var(--radius); 
            }
            
            .total-irrigation-box { 
                padding: 1.25rem; 
                border-radius: var(--radius); 
                background: var(--primary); 
                color: white; 
                text-align: center; 
                box-shadow: 0 4px 6px -1px rgba(14,122,65,0.2);
            }
            
            .k-crop-selector-wrapper { 
                max-width: 400px; 
                margin: 0 auto 2rem auto; 
            } 
            .k-crop-selector-wrapper label { 
                font-size: 0.875rem; 
                font-weight: 600; 
                display: block; 
                margin-bottom: 0.5rem; 
                color: var(--text-color); 
            } 
            .k-crop-selector-wrapper .select-box { position: relative; } 
            .k-crop-selector-wrapper .select-box i { 
                position: absolute; 
                left: 0.75rem; 
                top: 50%; 
                transform: translateY(-50%); 
                color: var(--primary); 
            } 
            .k-crop-selector-wrapper select { 
                width: 100%; 
                padding: 0.75rem 0.75rem 0.75rem 2.5rem; 
                border: 1px solid var(--border-color); 
                border-radius: var(--radius); 
                font-size: 1rem; 
                font-weight: 600; 
                background-color: var(--card-bg); 
                color: var(--text-color);
                -webkit-appearance: none; 
                appearance: none; 
                background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E'); 
                background-repeat: no-repeat; 
                background-position: right .7em top 50%; 
                background-size: .65em auto; 
            }
            
            .k-crop-data-wrapper { display: none; } 
            .k-crop-data-wrapper.active { display: block; }
            
            .k-error-card { 
                text-align: center; 
                padding: 2rem; 
                background-color: hsl(0, 84%, 95%); 
                border: 1px solid var(--alert); 
                color: var(--alert); 
            } 
            .k-error-card i { 
                width: 48px; 
                height: 48px; 
                margin-bottom: 1rem; 
            } 
            .k-error-card h3 { 
                font-size: 1.5rem; 
                margin: 0 0 0.5rem 0; 
            }
        </style>
            `;

            const script = `
                <script src="https://unpkg.com/lucide@0.546.0/dist/umd/lucide.js"></script>
                <script>
                    setTimeout(() => {
                        if (window.lucide) {
                            lucide.createIcons();
                        }

                        function setupToggles(barSelector) {
                            const toggleBars = document.querySelectorAll(barSelector);
                            toggleBars.forEach(toggleBar => {
                                const buttons = toggleBar.querySelectorAll('.k-toggle-btn');
                                buttons.forEach(button => {
                                    button.addEventListener('click', () => {
                                        const targetTabId = button.getAttribute('data-tab');

                                        buttons.forEach(btn => btn.classList.remove('active'));
                                        button.classList.add('active');

                                        const allTabContents = toggleBar.parentElement.querySelectorAll(':scope > .k-tab-content');
                                        allTabContents.forEach(contentEl => {
                                            contentEl.classList.remove('active');
                                        });

                                        const targetContentEl = document.getElementById(targetTabId + '-content');
                                        if (targetContentEl) targetContentEl.classList.add('active');
                                    });
                                });
                            });
                        }

                        function setupCropSelector() {
                            const cropSelector = document.getElementById('k-crop-selector');
                            const container = document.getElementById('k-crop-cards-container');
                            if (!cropSelector || !container) return;

                            cropSelector.addEventListener('change', (event) => {
                                const selectedCropId = event.target.value;
                                container.querySelectorAll('.k-crop-data-wrapper').forEach(wrapper => {
                                    wrapper.classList.remove('active');
                                });
                                const activeWrapper = container.querySelector(\`.k-crop-data-wrapper[data-crop-id="\${selectedCropId}"]\`);
                                if (activeWrapper) {
                                    activeWrapper.classList.add('active');
                                }
                            });
                        }

                        setupToggles('.k-toggle-bar');
                        setupCropSelector();

                    }, 0);
                </script>
            `;
            wrapper.html(style + htmlContent + script);
            frm.set_value('advisory_html', style + htmlContent + script);
            frappe.msgprint(__('Weather Advisory Dashboard Updated Successfully! 🎉'));

        },
        error: function(r) {
            const errorHtml = `
                <div class="k-card k-error-card">
                    <i data-lucide="server-crash"></i>
                    <h3>Error Communicating with Server</h3>
                    <p>Could not load the dashboard due to a server error. Please contact support if the problem persists.</p>
                </div>
            `;
            renderContent(errorHtml);
        }
    });
}


frappe.ui.form.on('Store', {
    refresh(frm) {
        const $tab = $('#store-advisory_tab-tab');
        if($tab.length && !$tab.data('bound')){
            $tab.data('bound', true);
            $tab.one('click', () => load_advisory_dashboard(frm));
        }
    }
});
