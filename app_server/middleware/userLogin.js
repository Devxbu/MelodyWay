const express = require('express')
const app = express()

function extractIdMiddleware(req, res, next) {
    // İstek URL'sini al
    const url = req.originalUrl;
    
    // Eğer URL "/admin/table/" ile başlamıyorsa, sonraki middleware'e geç
    if (!url.startsWith("/qrLogin/") || url.endsWith(".png")) {
        return next();
    }
    
    // Buraya geldiysek, istek "/admin/table/" ile başlıyor demektir
    // ID'yi çıkar
    const parts = url.split('/');
    const id = parts[parts.length - 1];
    
    // ID'yi isteğe ekle
    req.accessKey = id;
	console.log('id',id)
    // Sonraki middleware'e geç
    next();
}

module.exports = extractIdMiddleware;
