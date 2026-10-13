FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates \
 && pip3 install --break-system-packages -U "yt-dlp[default]" \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN cd server && npm install --omit=dev
ENV NODE_ENV=production
CMD ["node","server/server.js"]
