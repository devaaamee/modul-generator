const axios = require("axios");
const xl = require('xlsx');

function getDataSheet() {
    const wb = xl.readFile('BUP SPPB AJU 010005 A.01 IBT 2023.xls');
    const ws = wb.Sheets["Barang"];
    const daftarHSBarang = xl.utils.sheet_to_json(ws);

    const listHSCode = [];

    daftarHSBarang.forEach(barang => {
        const hsCode = barang["POS TARIF"];

        listHSCode.push(hsCode);
    });
    return listHSCode;
}

// ==========    PERIKSA LARTAS UNTUK TIAP HS CODE    ==========\

async function main(array) {
    const result = [];
    let res = {};
    let pointer = 0;

    setInterval(() => {

        const url = `https://api.insw.go.id/api-prod-ba/ref/hscode/komoditas?hs_code=${array[pointer]}`;

        axios.get(url, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": "Basic aW5zd18yOmJhYzJiYXM2",
                "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Microsoft Edge\";v=\"115\", \"Chromium\";v=\"115\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://insw.go.id/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        }).then(response => {

            const html = response.data;
            const data = html.data[0];

            res["HS Code"] = array[pointer];

            // TARIF
            res["BM"] = data["new_mfn"][0]["bm"][0]['bm'];
            res["PPN"] = data["new_mfn"][0]["ppn"][0]['ppn'];
            res["PPH"] = data["new_mfn"][0]["pph"][0]['pph'];

            // LARTAS
            res["lartas_import"] = data.import_regulation.length ? "1" : "0";
            res["lartas_border"] = data.import_regulation_border.length ? "1" : "0";
            res["lartas_post_border"] = data.import_regulation_post_border.length ? "1" : "0";
            res["lartas_export"] = data.export_regulation.length ? "1" : "0";

            result.push(res);

        }).then(() => {
            console.log(array[pointer]);
            console.log(pointer);
            console.log(res);

        }).catch((err) => {
            console.log(err);
        });

        pointer++;
    }, 8000);

}

const myItem = getDataSheet();
main(myItem);

