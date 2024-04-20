const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 80;

let jsonData;

// JSON dosyasını oku
fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
        console.error('JSON dosyası okunurken bir hata oluştu:', err);
        return;
    }
    jsonData = JSON.parse(data);

    // Sunucuyu belirtilen portta başlat
    app.listen(port, () => {
        console.log(`Sunucu çalışıyor: http://localhost:${port}`);
    });
});

// JSON verisi analiz ediciyi ayarla
app.use(bodyParser.json());

// Anahtarın girildiğini kontrol eden endpoint
app.post('/', (req, res) => {
    const key = req.body.key;

    if (!key) {
        res.status(400).send('Anahtar girilmedi.');
        return;
    }

    // Anahtarı JSON dosyasında kontrol et
    const webhook = jsonData[key];

    if (webhook) {
        res.status(200).send(webhook);
    } else {
        res.status(404).send('Anahtar bulunamadı.');
    }
});
