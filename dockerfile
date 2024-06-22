# Node.js'in resmi en güncel sürümünü kullanarak yeni bir image oluştur
FROM node:18-bullseye-slim

# Uygulama dizinini oluştur ve çalışma dizini olarak ayarla
WORKDIR /app

# Paket dosyalarını ve package-lock.json (eğer varsa) kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --unsafe-perm

# Uygulama kodunu kopyala
COPY . .

# Uygulama için gerekli GLIBC kütüphanelerini yükle (gerekiyorsa)
RUN apt-get update && apt-get install -y libc6

# Uygulamanın 8080 portunu dinlemesini sağla
EXPOSE 8080

# Uygulamayı başlat
CMD ["npm", "start"]
