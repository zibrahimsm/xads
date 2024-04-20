const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 80;

const dbFilePath = './db.json'; // Veritabanı dosyası

// Anahtar-webhook çiftlerini veritabanına kaydet
const saveToDatabase = async (data) => {
    try {
        await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Veritabanına kaydetme hatası:', error);
    }
};

// Anahtar-webhook çiftlerini veritabanından al
const getFromDatabase = async () => {
    try {
        const data = await fs.readFile(dbFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Veritabanından alma hatası:', error);
        return {};
    }
};

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
        keys = await getFromDatabase();
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
////


// Anahtar oluşturma endpoint'i
app.post('/createkey', async (req, res) => {
    const { key, webhook } = req.body;

    if (!key || !webhook) {
        return res.status(400).json({ error: 'Anahtar ve Webhook gereklidir.' });
    }

    keys[key] = webhook;

    // Veritabanına kaydet
    await saveToDatabase(keys);

    res.json({ success: true });
});

