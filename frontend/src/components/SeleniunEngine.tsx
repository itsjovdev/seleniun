import "./SeleniunEngine.css";

export default function SeleniunEngine() {
  return (
  <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 450"
      width="100%"
      height="100%"
      className="seleniun-svg-container"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="engineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
        </linearGradient>

        {/* Gradientes extraídos de tus iconos originales */}
        <linearGradient id="wordGradient" x1="4.494" y1="7.914" x2="13.832" y2="24.086" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2368c4"/><stop offset="0.5" stopColor="#1a5dbe"/><stop offset="1" stopColor="#1146ac"/>
        </linearGradient>
        <linearGradient id="excelGradient" x1="4.494" y1="7.914" x2="13.832" y2="24.086" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#18884f"/><stop offset="0.5" stopColor="#117e43"/><stop offset="1" stopColor="#0b6631"/>
        </linearGradient>
      </defs>

      <g className="anim-scene">
        {/* Línea de track */}
        <path
          d="M 120 225 L 680 225"
          fill="none"
          stroke="var(--track-color)"
          strokeWidth="3"
          className="track-line"
          strokeLinecap="round"
        />

        {/* --- PDF DE ENTRADA (ORIGINAL) --- */}
        <g className="anim-pdf" transform="translate(0, 0)">
          <g transform="translate(-35, -45) scale(0.28)"> 
             <polygon style={{fill:'#E8E8E8'}} points="219.821,0 32.842,0 32.842,303.188 270.346,303.188 270.346,50.525"/>
             <path style={{fill:'#FB3449'}} d="M230.013,149.935c-3.643-6.493-16.231-8.533-22.006-9.451c-4.552-0.724-9.199-0.94-13.803-0.936... (resto del path del PDF)"/>
             {/* Nota: He acortado el path aquí por brevedad, usa el path completo de tu PDF original */}
             <path style={{fill:'#FB3449'}} d="M230.013,149.935c-3.643-6.493-16.231-8.533-22.006-9.451c-4.552-0.724-9.199-0.94-13.803-0.936c-3.615-0.024-7.177,0.154-10.693,0.354c-1.296,0.087-2.579,0.199-3.861,0.31c-1.314-1.36-2.584-2.765-3.813-4.202c-7.82-9.257-14.134-19.755-19.279-30.664c1.366-5.271,2.459-10.772,3.119-16.485c1.205-10.427,1.619-22.31-2.288-32.251c-1.349-3.431-4.946-7.608-9.096-5.528c-4.771,2.392-6.113,9.169-6.502,13.973c-0.313,3.883-0.094,7.776,0.558,11.594c0.664,3.844,1.733,7.494,2.897,11.139c1.086,3.342,2.283,6.658,3.588,9.943c-0.828,2.586-1.707,5.127-2.63,7.603c-2.152,5.643-4.479,11.004-6.717,16.161c-1.18,2.557-2.335,5.06-3.465,7.507c-3.576,7.855-7.458,15.566-11.815,23.02c-10.163,3.585-19.283,7.741-26.857,12.625c-4.063,2.625-7.652,5.476-10.641,8.603c-2.822,2.952-5.69,6.783-5.941,11.024c-0.141,2.394,0.807,4.717,2.768,6.137c2.697,2.015,6.271,1.881,9.4,1.225c10.25-2.15,18.121-10.961,24.824-18.387c4.617-5.115,9.872-11.61,15.369-19.465c0.012-0.018,0.024-0.036,0.037-0.054c9.428-2.923,19.689-5.391,30.579-7.205c4.975-0.825,10.082-1.5,15.291-1.974c3.663,3.431,7.621,6.555,11.939,9.164c3.363,2.069,6.94,3.816,10.684,5.119c3.786,1.237,7.595,2.247,11.528,2.886c1.986,0.284,4.017,0.413,6.092,0.335c4.631-0.175,11.278-1.951,11.714-7.57C231.127,152.765,230.756,151.257,230.013,149.935z"/>
             <polygon style={{fill:'#FB3449'}} points="227.64,25.263 32.842,25.263 32.842,0 219.821,0"/>
             <polygon style={{fill:'#D1D3D3'}} points="219.821,50.525 270.346,50.525 219.821,0"/>
          </g>
          <text x="0" y="60" className="label-text">Original PDF</text>
        </g>

        {/* --- ENGINE --- */}
        <g className="anim-engine">
          <g className="engine-group">
            <circle cx="0" cy="0" r="55" fill="var(--engine-main)" opacity="0.1" className="engine-glow" />
            <polygon
              points="0,-58 50,-29 50,29 0,58 -50,29 -50,-29"
              fill="var(--engine-bg)"
              stroke="var(--engine-main)"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <circle cx="0" cy="0" r="30" fill="url(#engineGradient)" />
            <path
              d="M0,-18 C0,-6 6,0 18,0 C6,0 0,6 0,18 C0,6 -6,0 -18,0 C-6,0 0,-6 0,-18 Z"
              fill="var(--engine-main)"
              className="engine-core"
            />
            <text x="0" y="85" className="label-text engine-label">Seleniun AI Engine</text>
          </g>
        </g>

        {/* --- SALIDAS (WORD & EXCEL) --- */}
        <g className="anim-outputs">
          {/* Icono Word */}
          <g transform="translate(-45, -25) scale(2.2)">
             <path d="M28.8,3H9.7A1.2,1.2,0,0,0,8.5,4.2V9.5l11.1,3.3L30,9.5V4.2A1.2,1.2,0,0,0,28.8,3Z" style={{fill:'#41a5ee'}}/>
             <path d="M30,9.5H8.5V16l11.1,2L30,16Z" style={{fill:'#2b7cd3'}}/>
             <path d="M8.5,16v6.5l10.4,1.3L30,22.5V16Z" style={{fill:'#185abd'}}/>
             <path d="M9.7,29h19.1A1.2,1.2,0,0,0,30,27.8V22.5H8.5v5.3A1.2,1.2,0,0,0,9.7,29Z" style={{fill:'#103f91'}}/>
             <rect x="2" y="8.8" width="14.3" height="14.3" rx="1.2" style={{fill:'url(#wordGradient)'}}/>
             <path d="M6.9,18c0,.2,0,.3,0,.5h0c0-.1,0-.3.1-.5s0-.3.1-.5l1.3-5.4h1.6l1.3,5.3a7.8,7.8,0,0,1,.2,1h0a7.6,7.6,0,0,1,.1-1l1-5.4h1.5L12.3,19.9H10.6l-1.2-5.1c0-.1-.1-.3-.1-.6s0-.5-.1-.5h0c0,.2-.1.4-.1.6s-.1.4-.1.6l-1.2,5.1H6L4.2,12.1h1.5l1.1,5.4A4.5,4.5,0,0,1,6.9,18Z" style={{fill:'#fff'}}/>
          </g>

          {/* Icono Excel */}
          <g transform="translate(5, 5) scale(2.2)">
             <path d="M19.6,15.4,8.5,13.4V27.8A1.2,1.2,0,0,0,9.7,29h19.1A1.2,1.2,0,0,0,30,27.8V22.5Z" style={{fill:'#185c37'}}/>
             <path d="M19.6,3H9.7A1.2,1.2,0,0,0,8.5,4.2V9.5l11.1,6.5,5.9,2L30,16V9.5Z" style={{fill:'#21a366'}}/>
             <path d="M8.5,9.5H19.6V16H8.5Z" style={{fill:'#107c41'}}/>
             <rect x="2" y="8.8" width="14.3" height="14.3" rx="1.2" style={{fill:'url(#excelGradient)'}}/>
             <path d="M5.7,19.9l2.5-3.9-2.3-3.9H7.8l1.2,2.5c.1.2.2.4.2.5h0c.1-.2.2-.4.3-.5l1.3-2.5h1.7l-2.4,3.8,2.4,3.9H10.8L9.4,17.2a2.4,2.4,0,0,1-.2-.4h0c0,.1,0,.2-.1.3l-1.6,2.8Z" style={{fill:'#fff'}}/>
             <path d="M28.8,3H19.6V9.5H30V4.2A1.2,1.2,0,0,0,28.8,3Z" style={{fill:'#33c481'}}/>
             <path d="M19.6,16H30v6.5H19.6Z" style={{fill:'#107c41'}}/>
          </g>
          
          <text x="0" y="75" className="label-text">Structured Data</text>
        </g>
      </g>
    </svg>
  );
}