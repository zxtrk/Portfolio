'use strict';

const CONFIG = {
  API_KEY:   '0d81d04e076f7fdd22ebd0e5e0909bb8',
  BASE_URL:  'https://api.weatherstack.com',
  CACHE_KEY: 'aether_city_ws',
  UNIT_KEY:  'aether_unit',
};

const state = {
  city:             '',
  unit:             localStorage.getItem(CONFIG.UNIT_KEY) || 'metric',
  theme:            'dark',
  soundEnabled:     false,
  currentCondition: '',
  lastCode:         113,
  bgSlot:           'a',   
};

document.addEventListener('DOMContentLoaded', () => {

  const el = (id) => document.getElementById(id);

  const dom = {
    html:           document.documentElement,
    loadingState:   el('loading-state'),
    errorState:     el('error-state'),
    weatherContent: el('weather-content'),
    welcomeState:   el('welcome-state'),
    errorMessage:   el('error-message'),
    cityInput:      el('city-input'),
    searchBtn:      el('search-btn'),
    locationBtn:    el('location-btn'),
    soundBtn:       el('sound-btn'),
    themeBtn:       el('theme-btn'),
    unitBtn:        el('unit-btn'),
    unitLabel:      el('unit-label'),
    soundIconOn:    el('sound-icon-on'),
    soundIconOff:   el('sound-icon-off'),
    themeMoon:      el('theme-moon'),
    themeSun:       el('theme-sun'),
    cityName:       el('city-name'),
    locationMeta:   el('location-meta'),
    weatherIcon:    el('weather-icon'),
    conditionText:  el('condition-text'),
    temperature:    el('temperature'),
    feelsLike:      el('feels-like'),
    tempRange:      el('temp-range'),
    humidity:       el('humidity'),
    windSpeed:      el('wind-speed'),
    visibility:     el('visibility'),
    pressure:       el('pressure'),
    cloudiness:     el('cloudiness'),
    dewPoint:       el('dew-point'),
    windDir:        el('wind-dir'),
    weatherBgA:     el('weather-bg-a'),
    weatherBgB:     el('weather-bg-b'),
    canvas:         el('weather-canvas'),
    cloudLayer:     el('cloud-layer'),
    fogLayer:       el('fog-layer'),
    sunGlow:        el('sun-glow'),
    lightningFlash: el('lightning-flash'),
  };

  const criticalIds = ['loading-state','error-state','weather-content','welcome-state','city-input'];
  for (const id of criticalIds) {
    if (!el(id)) { console.error(`[Nimbus] Missing element: #${id}`); return; }
  }

  const Animate = {
    pulse(el, cls, delay = 0) {
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth; // reflow
      if (delay) {
        setTimeout(() => el.classList.add(cls), delay);
      } else {
        el.classList.add(cls);
      }
    },


    statPop(el, value, delay = 0) {
      if (!el) return;
      setTimeout(() => {
        el.textContent = value;
        el.classList.remove('popping');
        void el.offsetWidth;
        el.classList.add('popping');
        el.addEventListener('animationend', () => el.classList.remove('popping'), { once: true });
      }, delay);
    },

    cityReveal(weatherContentEl) {
      if (!weatherContentEl) return;
      weatherContentEl.classList.remove('city-transition');
      void weatherContentEl.offsetWidth;
      weatherContentEl.classList.add('city-transition');
      weatherContentEl.addEventListener('animationend', (e) => {
        if (e.target === weatherContentEl) {
          weatherContentEl.classList.remove('city-transition');
        }
      }, { once: true });
    },
  };

  /* ════════════════════════════════════════
     UI
  ════════════════════════════════════════ */
  const UI = {
    show(panel) {
      ['loadingState','errorState','weatherContent','welcomeState'].forEach(p => {
        if (dom[p]) dom[p].classList.add('hidden');
      });
      if (dom[panel]) dom[panel].classList.remove('hidden');
    },

    showError(msg) {
      if (dom.errorMessage) dom.errorMessage.textContent = msg;
      this.show('errorState');
    },

    tempUnit()  { return state.unit === 'metric' ? '°C' : '°F'; },
    speedUnit() { return state.unit === 'metric' ? 'km/h' : 'mph'; },
    visUnit()   { return state.unit === 'metric' ? 'km' : 'mi'; },
    round(n)    { return Math.round(n); },

    dewPoint(tempC, rh) {
      const a = 17.625, b = 243.04;
      const g = Math.log(rh / 100) + (a * tempC) / (b + tempC);
      const dp = (b * g) / (a - g);
      return state.unit === 'imperial' ? this.round(dp * 9/5 + 32) : this.round(dp);
    },

    applyTheme(theme) {
      state.theme = theme;
      dom.html.setAttribute('data-theme', theme);
      if (dom.themeMoon) dom.themeMoon.classList.toggle('hidden', theme === 'dark');
      if (dom.themeSun)  dom.themeSun.classList.toggle('hidden',  theme === 'light');
    },

    toggleTheme() { this.applyTheme(state.theme === 'dark' ? 'light' : 'dark'); },

    toggleUnit() {
      state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
      localStorage.setItem(CONFIG.UNIT_KEY, state.unit);
      if (dom.unitLabel) dom.unitLabel.textContent = state.unit === 'metric' ? '°C' : '°F';
      if (state.city) App.loadWeather(state.city);
    },

    updateCurrent(data, code) {
      const { location, current } = data;
      const unit = this.tempUnit();

      if (dom.cityName) {
        dom.cityName.textContent = `${location.name}, ${location.country}`;
        Animate.pulse(dom.cityName, 'sliding');
        dom.cityName.addEventListener('animationend', () => dom.cityName.classList.remove('sliding'), { once: true });
      }

      if (dom.locationMeta) {
        dom.locationMeta.textContent = location.localtime || '';
        Animate.pulse(dom.locationMeta, 'fading');
        dom.locationMeta.addEventListener('animationend', () => dom.locationMeta.classList.remove('fading'), { once: true });
      }

      if (dom.weatherIcon) {
        const isDay = current.is_day === 'yes';
        dom.weatherIcon.innerHTML = this._conditionSVG(code, isDay);
        dom.weatherIcon.title = current.weather_descriptions?.[0] || '';
        Animate.pulse(dom.weatherIcon, 'swap');
        dom.weatherIcon.addEventListener('animationend', () => dom.weatherIcon.classList.remove('swap'), { once: true });
      }

      if (dom.conditionText) {
        dom.conditionText.textContent = current.weather_descriptions?.[0] || '—';
        Animate.pulse(dom.conditionText, 'revealing');
        dom.conditionText.addEventListener('animationend', () => dom.conditionText.classList.remove('revealing'), { once: true });
      }

      if (dom.temperature) {
        dom.temperature.textContent = `${this.round(current.temperature)}${unit}`;
        Animate.pulse(dom.temperature, 'animating');
        dom.temperature.addEventListener('animationend', () => dom.temperature.classList.remove('animating'), { once: true });
      }

      if (dom.feelsLike) {
        dom.feelsLike.textContent = `Feels like ${this.round(current.feelslike)}${unit}`;
        Animate.pulse(dom.feelsLike, 'fading');
        dom.feelsLike.addEventListener('animationend', () => dom.feelsLike.classList.remove('fading'), { once: true });
      }

      if (dom.tempRange) dom.tempRange.textContent = `Precip: ${current.precip ?? '—'} mm`;

      Animate.statPop(dom.humidity,   `${current.humidity}%`,              80);
      Animate.statPop(dom.windSpeed,  `${current.wind_speed} ${this.speedUnit()}`, 130);
      Animate.statPop(dom.visibility, `${current.visibility ?? '—'} ${this.visUnit()}`, 180);
      Animate.statPop(dom.pressure,   `${current.pressure} hPa`,           230);

      Animate.statPop(dom.cloudiness, `${current.cloudcover ?? '—'}%`,     160);
      Animate.statPop(dom.windDir,    current.wind_dir || '—',             200);

      const tempC = state.unit === 'imperial'
        ? (current.temperature - 32) * 5/9
        : current.temperature;
      Animate.statPop(dom.dewPoint, `${this.dewPoint(tempC, current.humidity)}${unit}`, 240);
    },

    _conditionSVG(code, isDay) {
      const sun = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="13" fill="#fbbf24"/>
        <g stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="11"/><line x1="32" y1="53" x2="32" y2="58"/>
          <line x1="6" y1="32" x2="11" y2="32"/><line x1="53" y1="32" x2="58" y2="32"/>
          <line x1="14" y1="14" x2="17.5" y2="17.5"/><line x1="46.5" y1="46.5" x2="50" y2="50"/>
          <line x1="50" y1="14" x2="46.5" y2="17.5"/><line x1="17.5" y1="46.5" x2="14" y2="50"/>
        </g></svg>`;

      const moon = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 12C28 14 20 24 20 35C20 47 30 56 42 56C47 56 51.5 54 55 51C45 52 36 44 36 33C36 24 37 17 40 12Z" fill="#93c5fd"/>
        <circle cx="52" cy="16" r="2" fill="#bfdbfe" opacity="0.6"/>
        <circle cx="46" cy="9" r="1.5" fill="#bfdbfe" opacity="0.5"/></svg>`;

      const cloudSunDay = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="38" cy="22" r="10" fill="#fbbf24" opacity="0.9"/>
        <g stroke="#fbbf24" stroke-width="2" stroke-linecap="round" opacity="0.8">
          <line x1="38" y1="8" x2="38" y2="12"/><line x1="50" y1="10" x2="47.5" y2="12.5"/>
          <line x1="52" y1="22" x2="48" y2="22"/>
        </g>
        <rect x="8" y="30" width="38" height="16" rx="8" fill="#cbd5e1"/>
        <rect x="16" y="24" width="22" height="14" rx="7" fill="#e2e8f0"/></svg>`;

      const cloudSunNight = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M44 12C36 14 30 20 30 28C30 31 31 34 33 36C29 35 26 32 26 28C26 21 32 15 40 14C41.4 13.7 42.7 13.7 44 12Z" fill="#93c5fd" opacity="0.8"/>
        <rect x="8" y="32" width="38" height="16" rx="8" fill="#cbd5e1"/>
        <rect x="16" y="26" width="22" height="14" rx="7" fill="#e2e8f0"/></svg>`;

      const cloud = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="32" width="42" height="18" rx="9" fill="#94a3b8"/>
        <rect x="14" y="24" width="28" height="16" rx="8" fill="#b0bec5"/>
        <rect x="22" y="18" width="18" height="14" rx="7" fill="#cbd5e1"/></svg>`;

      const rain = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="14" width="40" height="18" rx="9" fill="#94a3b8"/>
        <rect x="16" y="8" width="26" height="14" rx="7" fill="#b0bec5"/>
        <g stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="38" x2="15" y2="48"/><line x1="28" y1="38" x2="25" y2="50"/>
          <line x1="38" y1="38" x2="35" y2="48"/>
        </g></svg>`;

      const drizzle = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="14" width="40" height="18" rx="9" fill="#94a3b8"/>
        <rect x="16" y="8" width="26" height="14" rx="7" fill="#b0bec5"/>
        <g stroke="#93c5fd" stroke-width="2" stroke-linecap="round" opacity="0.8">
          <line x1="16" y1="38" x2="14" y2="45"/><line x1="24" y1="40" x2="22" y2="47"/>
          <line x1="32" y1="38" x2="  /* ════════════════════════════════════════
     ANIMATION HELPERS
  ════════════════════════════════════════ */30" y2="45"/><line x1="40" y1="40" x2="38" y2="47"/>
        </g></svg>`;

      const thunder = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="44" height="20" rx="10" fill="#475569"/>
        <rect x="14" y="4" width="28" height="14" rx="7" fill="#64748b"/>
        <polyline points="34,32 27,44 33,44 24,58" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

      const snow = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="40" height="18" rx="9" fill="#94a3b8"/>
        <rect x="16" y="6" width="26" height="14" rx="7" fill="#cbd5e1"/>
        <g stroke="#bfdbfe" stroke-width="2.5" stroke-linecap="round">
          <line x1="20" y1="37" x2="20" y2="49"/><line x1="14" y1="43" x2="26" y2="43"/>
          <line x1="32" y1="37" x2="32" y2="49"/><line x1="26" y1="43" x2="38" y2="43"/>
          <line x1="44" y1="37" x2="44" y2="49"/><line x1="38" y1="43" x2="50" y2="43"/>
        </g></svg>`;

      const fog = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#94a3b8" stroke-width="3" stroke-linecap="round" opacity="0.9">
          <line x1="8" y1="20" x2="56" y2="20"/><line x1="12" y1="30" x2="52" y2="30"/>
          <line x1="8" y1="40" x2="56" y2="40"/><line x1="14" y1="50" x2="48" y2="50"/>
        </g></svg>`;

      const wind = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round">
          <path d="M8 22 Q28 22 34 22 Q44 22 44 16 Q44 10 38 10 Q32 10 32 16"/>
          <path d="M8 32 Q32 32 42 32 Q56 32 56 38 Q56 44 50 44 Q44 44 44 38"/>
          <path d="M8 42 Q22 42 28 42"/>
        </g></svg>`;

      if ([200,386,389,392,395].includes(code)) return thunder;
      if ([176,263,266,293,296,353].includes(code)) return drizzle;
      if ([299,302,305,308,311,314,317,356,359,362,365,374,377].includes(code)) return rain;
      if ([179,182,185,227,230,320,323,326,329,332,335,338,368,371].includes(code)) return snow;
      if ([143,248,260].includes(code)) return fog;
      if ([281,284,350].includes(code)) return wind;
      if (code === 113) return isDay ? sun : moon;
      if (code === 116) return isDay ? cloudSunDay : cloudSunNight;
      if ([119,122].includes(code)) return cloud;
      return isDay ? cloudSunDay : cloudSunNight;
    },
  };

  /* ════════════════════════════════════════
     API
  ════════════════════════════════════════ */
  const API = {
    unitParam() { return state.unit === 'metric' ? 'm' : 'f'; },

    async fetchCurrent(query) {
      const url = `${CONFIG.BASE_URL}/current?access_key=${CONFIG.API_KEY}&query=${encodeURIComponent(query)}&units=${this.unitParam()}`;
      let res;
      try {
        res = await fetch(url);
      } catch (networkErr) {
        throw new Error('Network request failed. Make sure you are running via a local server (http://localhost) — WeatherStack free tier requires HTTP.');
      }

      if (!res.ok) throw new Error(`HTTP ${res.status} — check your connection.`);
      const data = await res.json();

      if (data.error) {
        const { code, info } = data.error;
        if (code === 101 || code === 102) throw new Error('Invalid API key. Double-check CONFIG.API_KEY in script.js.');
        if (code === 105)                  throw new Error('HTTPS not supported on free plan. Open via http://localhost.');
        if (code === 104)                  throw new Error('Monthly request limit reached for your WeatherStack plan.');
        if (code === 615)                  throw new Error(`City "${query}" not found. Try a different spelling.`);
        throw new Error(info || 'WeatherStack API error.');
      }
      return data;
    },

    async fetchByCoords(lat, lon) { return this.fetchCurrent(`${lat},${lon}`); },

    normalise(code) {
      if ([200,386,389,392,395].includes(code))                                     return 'thunderstorm';
      if ([176,263,266,293,296,353].includes(code))                                 return 'drizzle';
      if ([299,302,305,308,311,314,317,356,359,362,365,374,377].includes(code))     return 'rain';
      if ([179,182,185,227,230,320,323,326,329,332,335,338,368,371].includes(code)) return 'snow';
      if ([143,248,260].includes(code))                                             return 'mist';
      if (code === 113)                                                              return 'clear';
      if ([116,119,122].includes(code))                                             return 'clouds';
      if ([281,284,350].includes(code))                                             return 'squall';
      return 'clouds';
    },
  };


  const BG = {
    current: null,

    set(condition) {
      if (condition === this.current) return;
      this.current = condition;

      const cls = `weather-bg--${condition}`;
      const active   = state.bgSlot === 'a' ? dom.weatherBgA : dom.weatherBgB;
      const inactive = state.bgSlot === 'a' ? dom.weatherBgB : dom.weatherBgA;

      inactive.className = `weather-bg ${cls}`;
      inactive.style.zIndex = '0';

      requestAnimationFrame(() => {
        inactive.style.opacity = '1';
        active.style.opacity   = '0';
      });

      state.bgSlot = state.bgSlot === 'a' ? 'b' : 'a';
    },
  };

  /* ════════════════════════════════════════
     WEATHER EFFECTS
  ════════════════════════════════════════ */
  const Effects = {
    ctx:            null,
    raf:            null,
    particles:      [],
    current:        null,
    lightningTimer: null,

    init() {
      if (!dom.canvas) return;
      this.ctx = dom.canvas.getContext('2d');
      this._resize();
      window.addEventListener('resize', () => this._resize());
    },

    _resize() {
      if (!dom.canvas) return;
      dom.canvas.width  = window.innerWidth;
      dom.canvas.height = window.innerHeight;
    },

    clear() {
      if (this.raf)            { cancelAnimationFrame(this.raf);   this.raf = null; }
      if (this.lightningTimer) { clearTimeout(this.lightningTimer); this.lightningTimer = null; }
      this.particles = [];
      this.current   = null;
      if (this.ctx && dom.canvas) this.ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);

      if (dom.cloudLayer)     dom.cloudLayer.classList.remove('visible');
      if (dom.fogLayer)       dom.fogLayer.classList.remove('visible');
      if (dom.sunGlow)        dom.sunGlow.classList.remove('visible');
      if (dom.lightningFlash) dom.lightningFlash.style.opacity = '0';
    },

    set(condition, windSpeed) {
      this.clear();

      BG.set(condition);

      setTimeout(() => {
        switch (condition) {
          case 'thunderstorm': this._rain(true);       this._scheduleLightning(); break;
          case 'drizzle':      this._rain(false, true); break;
          case 'rain':         this._rain();             break;
          case 'snow':         this._snow();             break;
          case 'clear':        if (dom.sunGlow)    dom.sunGlow.classList.add('visible');    break;
          case 'clouds':       if (dom.cloudLayer) dom.cloudLayer.classList.add('visible'); break;
          case 'mist':
          case 'fog':
          case 'haze':         if (dom.fogLayer)   dom.fogLayer.classList.add('visible');   break;
          case 'squall':       this._leaves(); break;
          default:             if (windSpeed > 50) this._leaves(); break;
        }
      }, 200);
    },

    _rain(heavy = false, drizzle = false) {
      this.current = 'rain';
      const n = drizzle ? 60 : heavy ? 220 : 130;
      const spd = drizzle ? 5 : heavy ? 14 : 9;
      const len = drizzle ? 10 : heavy ? 28 : 18;
      const W = dom.canvas?.width || window.innerWidth;
      const H = dom.canvas?.height || window.innerHeight;
      for (let i = 0; i < n; i++) this.particles.push({
        x: Math.random() * W, y: Math.random() * H,
        len: Math.random() * len + 6,
        speed: Math.random() * spd * .6 + spd * .4,
        opacity: Math.random() * .35 + (drizzle ? .1 : .2),
        thickness: Math.random() * (heavy ? 2 : 1.2) + .4,
        drift: drizzle ? 0 : -.2,
      });
      this._animRain();
    },
    _animRain() {
      if (this.current !== 'rain' || !this.ctx || !dom.canvas) return;
      const { ctx, particles } = this, W = dom.canvas.width, H = dom.canvas.height;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.drift * p.len, p.y + p.len);
        ctx.strokeStyle = `rgba(174,214,245,${p.opacity})`; ctx.lineWidth = p.thickness; ctx.stroke();
        p.y += p.speed; p.x += p.drift * .5;
        if (p.y > H) { p.y = -p.len; p.x = Math.random() * W; }
      });
      this.raf = requestAnimationFrame(() => this._animRain());
    },

    _snow() {
      this.current = 'snow';
      const W = dom.canvas?.width || window.innerWidth;
      const H = dom.canvas?.height || window.innerHeight;
      for (let i = 0; i < 160; i++) this.particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 3 + 1, speed: Math.random() * 1.2 + .4,
        drift: Math.random() * .8 - .4, opacity: Math.random() * .6 + .3,
        wobble: Math.random() * Math.PI * 2, wobbleS: Math.random() * .015 + .005,
      });
      this._animSnow();
    },
    _animSnow() {
      if (this.current !== 'snow' || !this.ctx || !dom.canvas) return;
      const { ctx, particles } = this, W = dom.canvas.width, H = dom.canvas.height;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(255,255,255,${p.opacity})`); g.addColorStop(1, 'rgba(200,225,255,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        p.y += p.speed; p.x += Math.sin(p.wobble) * p.drift; p.wobble += p.wobbleS;
        if (p.y > H + p.r) { p.y = -p.r; p.x = Math.random() * W; }
      });
      this.raf = requestAnimationFrame(() => this._animSnow());
    },

    _leaves() {
      this.current = 'leaves';
      const C = ['#e67e22','#e74c3c','#f39c12','#d35400','#c0392b','#8e6b00'];
      const W = dom.canvas?.width || window.innerWidth;
      const H = dom.canvas?.height || window.innerHeight;
      for (let i = 0; i < 35; i++) this.particles.push({
        x: Math.random() * W, y: Math.random() * H,
        size: Math.random() * 14 + 7, speedY: Math.random() * 2.5 + 1,
        speedX: Math.random() * 3 + 1.5, rot: Math.random() * Math.PI * 2,
        rotS: (Math.random() - .5) * .08, swing: Math.random() * Math.PI * 2,
        swingS: Math.random() * .02 + .005, swingA: Math.random() * 20 + 8,
        opacity: Math.random() * .5 + .4, color: C[Math.floor(Math.random() * C.length)],
      });
      this._animLeaves();
    },
    _animLeaves() {
      if (this.current !== 'leaves' || !this.ctx || !dom.canvas) return;
      const { ctx, particles } = this, W = dom.canvas.width, H = dom.canvas.height;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.opacity; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.bezierCurveTo(p.size * .6, -p.size * .6, p.size * .6, p.size * .6, 0, p.size / 2);
        ctx.bezierCurveTo(-p.size * .6, p.size * .6, -p.size * .6, -p.size * .6, 0, -p.size / 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -p.size / 2); ctx.lineTo(0, p.size / 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = .8; ctx.stroke();
        ctx.restore();
        p.y += p.speedY; p.x += p.speedX + Math.sin(p.swing) * p.swingA * .04;
        p.swing += p.swingS; p.rot += p.rotS;
        if (p.y > H + p.size || p.x > W + p.size) { p.y = -p.size; p.x = Math.random() * W * .5; }
      });
      this.raf = requestAnimationFrame(() => this._animLeaves());
    },

    _scheduleLightning() {
      const d = Math.random() * 5000 + 2500;
      this.lightningTimer = setTimeout(() => {
        if (this.current !== 'rain') return;
        this._flash(); this._scheduleLightning();
      }, d);
    },
    _flash() {
      if (!dom.lightningFlash) return;
      this._bolt();
      dom.lightningFlash.style.transition = 'opacity .04s';
      dom.lightningFlash.style.opacity = '.7';
      setTimeout(() => { dom.lightningFlash.style.opacity = '0'; }, 80);
      setTimeout(() => {
        dom.lightningFlash.style.opacity = '.4';
        setTimeout(() => { dom.lightningFlash.style.opacity = '0'; }, 60);
      }, 180);
    },
    _bolt() {
      if (!this.ctx || !dom.canvas) return;
      const { ctx } = this, W = dom.canvas.width, H = dom.canvas.height;
      let cx = Math.random() * W, cy = 0;
      ctx.save(); ctx.strokeStyle = 'rgba(220,200,255,.9)'; ctx.lineWidth = 2;
      ctx.shadowColor = '#b8a8ff'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(cx, cy);
      while (cy < H * .6) { cx += (Math.random() - .5) * 60; cy += Math.random() * 40 + 20; ctx.lineTo(cx, cy); }
      ctx.stroke(); ctx.restore();
      setTimeout(() => { if (this.ctx && dom.canvas) this.ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height); }, 120);
    },
  };

  /* ════════════════════════════════════════
     SOUND
  ════════════════════════════════════════ */
  const Sound = {
    ctx: null, nodes: {}, active: false,

    _ensure() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    _noise(pink = false) {
      const sr = this.ctx.sampleRate, buf = this.ctx.createBuffer(1, sr * 3, sr), out = buf.getChannelData(0);
      if (pink) {
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i = 0; i < out.length; i++) {
          const w = Math.random() * 2 - 1;
          b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.96900*b2+w*.1538520;
          b3=.86650*b3+w*.3104856;b4=.55000*b4+w*.5329522;b5=-.7616*b5-w*.0168980;
          out[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)/7*.1;b6=w*.115926;
        }
      } else { for (let i = 0; i < out.length; i++) out[i] = Math.random() * 2 - 1; }
      const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s;
    },
    _connect(src, type, freq, gain, q = 1) {
      const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
      if (q !== 1) f.Q.value = q;
      const g = this.ctx.createGain(); g.gain.value = gain;
      src.connect(f); f.connect(g); g.connect(this.ctx.destination);
      return { src, f, g };
    },
    playRain() { this.stop(); this._ensure(); const s = this._noise(); this.nodes = this._connect(s, 'lowpass', 1400, .18); s.start(); },
    playWind() { this.stop(); this._ensure(); const s = this._noise(true); this.nodes = this._connect(s, 'bandpass', 400, .12, .4); s.start(); },
    stop() { if (this.nodes.src) { try { this.nodes.src.stop(); } catch (_) {} } this.nodes = {}; },
    set(condition) {
      if (!this.active) return;
      if (['rain','drizzle','thunderstorm'].includes(condition)) this.playRain();
      else if (condition === 'squall') this.playWind();
      else this.stop();
    },
    toggle() {
      this.active = !this.active;
      if (this.active) this.set(state.currentCondition); else this.stop();
      return this.active;
    },
  };

  /* ════════════════════════════════════════
     APP CONTROLLER
  ════════════════════════════════════════ */
  const App = {
    _keyMissing() {
      return !CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_WEATHERSTACK_ACCESS_KEY_HERE';
    },

    async loadWeather(query) {
      if (this._keyMissing()) {
        UI.showError('⚠ API key not set. Open script.js and paste your WeatherStack access key into CONFIG.API_KEY.');
        return;
      }
      state.city = query;
      UI.show('loadingState');

      try {
        const data      = await API.fetchCurrent(query);
        const code      = parseInt(data.current.weather_code, 10);
        const condition = API.normalise(code);
        state.currentCondition = condition;
        state.lastCode         = code;

        UI.show('weatherContent');

        Animate.cityReveal(dom.weatherContent);

        UI.updateCurrent(data, code);

        Effects.set(condition, data.current.wind_speed || 0);
        Sound.set(condition);

      } catch (err) {
        console.error('[Nimbus]', err);
        UI.showError(err.message || 'Something went wrong. Please try again.');
      }
    },

    async loadByCoords(lat, lon) {
      if (this._keyMissing()) {
        UI.showError('⚠ API key not set. Add your WeatherStack key to script.js.');
        return;
      }
      UI.show('loadingState');
      try {
        const data      = await API.fetchByCoords(lat, lon);
        const code      = parseInt(data.current.weather_code, 10);
        const condition = API.normalise(code);
        state.city             = data.location.name;
        state.currentCondition = condition;
        state.lastCode         = code;
        if (dom.cityInput) dom.cityInput.value = data.location.name;

        UI.show('weatherContent');
        Animate.cityReveal(dom.weatherContent);
        UI.updateCurrent(data, code);
        Effects.set(condition, data.current.wind_speed || 0);
        Sound.set(condition);
      } catch (err) {
        console.error('[Nimbus]', err);
        UI.showError(err.message || 'Could not get weather for your location.');
      }
    },

    detectLocation() {
      if (!navigator.geolocation) { UI.showError('Geolocation not supported.'); return; }
      if (dom.locationBtn) {
        dom.locationBtn.style.transform = 'scale(.9)';
        setTimeout(() => { dom.locationBtn.style.transform = ''; }, 150);
      }
      UI.show('loadingState');
      navigator.geolocation.getCurrentPosition(
        p => this.loadByCoords(p.coords.latitude, p.coords.longitude),
        () => UI.showError('Location access denied. Search for a city instead.'),
        { timeout: 10000, maximumAge: 60000 },
      );
    },

    handleSearch() {
      const city = dom.cityInput?.value.trim() || '';
      if (!city) {
        dom.cityInput?.classList.add('shake');
        dom.cityInput?.addEventListener('animationend', () => dom.cityInput?.classList.remove('shake'), { once: true });
        return;
      }
      this.loadWeather(city);
    },
  };


  if (dom.cloudLayer) {
    for (let i = 1; i <= 4; i++) {
      const c = document.createElement('div');
      c.className = `cloud cloud--${i}`;
      dom.cloudLayer.appendChild(c);
    }
  }

  const ks = document.createElement('style');
  ks.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}.shake{animation:shake .4s ease-in-out;}`;
  document.head.appendChild(ks);

  Effects.init();
  UI.applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (dom.unitLabel) dom.unitLabel.textContent = state.unit === 'metric' ? '°C' : '°F';
  UI.show('welcomeState');

  /* ── Events ── */
  dom.searchBtn?.addEventListener('click',   () => App.handleSearch());
  dom.cityInput?.addEventListener('keydown', e => { if (e.key === 'Enter') App.handleSearch(); });
  dom.locationBtn?.addEventListener('click', () => App.detectLocation());
  dom.themeBtn?.addEventListener('click',    () => UI.toggleTheme());
  dom.unitBtn?.addEventListener('click',     () => UI.toggleUnit());

  dom.soundBtn?.addEventListener('click', () => {
    const on = Sound.toggle();
    if (dom.soundIconOn)  dom.soundIconOn.classList.toggle('hidden', !on);
    if (dom.soundIconOff) dom.soundIconOff.classList.toggle('hidden', on);
    dom.soundBtn.setAttribute('aria-pressed', String(on));
    dom.soundBtn.title = on ? 'Sound On — click to mute' : 'Sound Off — click to enable';
  });

}); 