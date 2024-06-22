const express = require('express')
const app = express()

function extractIdMiddleware(req, res, next) {
    // İstek URL'sini al
    const url = req.originalUrl;
    
    // Eğer URL "/admin/tableDetail/" ile başlamıyorsa, sonraki middleware'e geç
    if (url.endsWith(".png")) {
        return next();
    }
    
    // Buraya geldiysek, istek "/admin/tableDetail/" ile başlıyor demektir
    // ID'yi çıkar
    const parts = url.split('/');
    var cafeName = '';
    if(url.includes('table')) {
        cafeName = parts[parts.indexOf('table') + 1]
    }
    else{
        cafeName = parts[parts.length - 1];
    }
    
    // Kafe ismini isteğe ekle
    req.cafe = cafeName;

    // Sonraki middleware'e geç
    next();
}

module.exports = extractIdMiddleware;