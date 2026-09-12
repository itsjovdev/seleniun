FROM node:20-bookworm

WORKDIR /app

# ===============================
# Dependencias del sistema
# ===============================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    libreoffice \
    libreoffice-writer \
    libreoffice-core \
    libreoffice-common \
    ghostscript \
    poppler-utils \
    qpdf \
    pdftk-java \
    fonts-dejavu \
    fonts-liberation \
    ca-certificates \
    curl \
    && pip3 install --no-cache-dir --break-system-packages "PyMuPDF==1.23.26" "pdf2docx==0.5.8" \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ===============================
# Node dependencies
# ===============================
COPY package*.json ./

RUN npm install

# ===============================
# Código fuente
# ===============================
COPY . .

# ===============================
# Build NestJS
# ===============================
RUN npm run build

# ===============================
# Limpiar dev deps
# ===============================
RUN npm prune --production

# ===============================
# Puerto
# ===============================
EXPOSE 3000

# ===============================
# Run
# ===============================
CMD ["node", "dist/main.js"]