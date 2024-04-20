const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 80;

const dbFilePath = './db.json';

const saveToDatabase = async (data) => {
    try {
        await fs.promises.writeFile(dbFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Veritabanına kaydetme hatası:', error);
        throw error;
    }
};

const getFromDatabase = async () => {
    try {
        const data = await fs.promises.readFile(dbFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Veritabanından alma hatası:', error);
        return {};
    }
};

app.listen(port, async () => {
    try {
        const jsonData = await getFromDatabase();
        console.log(`Sunucu çalışıyor: http://localhost:${port}`);
    } catch (error) {
        console.error('Sunucu başlatılırken bir hata oluştu:', error);
    }
});

app.use(bodyParser.json());

app.post('/', async (req, res) => {
    const { key } = req.body;

    if (!key) {
        res.status(400).send('Anahtar girilmedi.');
        return;
    }

    try {
        const jsonData = await getFromDatabase();
        const webhook = jsonData[key];

        if (webhook) {
            res.status(200).send(webhook);
        } else {
            res.status(404).send('Anahtar bulunamadı.');
        }
    } catch (error) {
        console.error('Anahtar bulma hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

app.post('/createkey', async (req, res) => {
    const { key, webhook } = req.body;

    if (!key || !webhook) {
        return res.status(400).json({ error: 'Anahtar ve Webhook gereklidir.' });
    }

    try {
        let jsonData = await getFromDatabase();
        jsonData[key] = webhook;
        await saveToDatabase(jsonData);
        res.json({ success: true });
    } catch (error) {
        console.error('Anahtar oluşturma hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

app.get('/sa', async (req, res) => {
    try {
        const jsonData = await getFromDatabase();
        const plainText = JSON.stringify(jsonData, null, 2); // 2 boşluklu formatlama
        res.type('text/plain').send(plainText);
    } catch (error) {
        console.error('Dosya okuma hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});
