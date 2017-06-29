const request = require('superagent');
const cookie = require('cookie');
const util = require('util');
const fs = require('fs');
const path = require('path');

const userAgent = [
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
];

const cookies = '';

const DATADIR = path.join(__dirname, './data');

class Spider{
        constructor(config = {}){
                this.url = config.url;
                this.number = 0;
        }
        // 抓取
        sendReq(cb){
                const url = this.url.replace('{number}', this.number);
                request
                .get(url)
                .set('appId', 3001)
                .set('tourId', "2475DDC6-DAB8-434A-AC82-A40B93364457")
                .set('versionCode', '3.7-10')
                .set('User-Agent', userAgent[0])
                .set('Cookie', cookies)
                .end((err, resp)=>{
                        if (err) {
                                console.log('request error: ', err);
                                return cb(err);
                        }
                        const body = JSON.parse(resp.text);
                        console.log(body);
                        this.writeData(body.data, function(){
                                cb(body);
                        })
                });
        }
        // 批量抓取
        batch(){
                this.sendReq((res) =>{
                        this.number++;
                        if(res.data.catalogs.length){
                                this.batch();
                        }
                })
        }
        writeData(data, cb){
                const filename = Date.now().toString().substr(5, 9) + '.json';
                const file = path.join(DATADIR, filename);
                fs.writeFile(file, JSON.stringify(data), 'utf-8', (err) => {
                        if (err) {
                                console.log('load images error: ', err);
                                cb(err);
                        } else {
                                console.log(`save ${this.number} page to ${filename} successfully`);
                                cb();
                        }
                });
        }
}

new Spider({
        url: 'https://a.bolo.me/v2/search?cid=1&gateway=5&order_by=sold_quantity&page_num={number}&page_size=500'
}).batch(function(){});
