FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm install

COPY apps/web/prisma ./prisma
RUN npx prisma generate

COPY apps/web/ .

RUN chmod +x ./docker-entrypoint.sh

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./docker-entrypoint.sh"]
