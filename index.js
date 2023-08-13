const { default: axios } = require("axios");
const hashlist = require("./BTM_hashlist.json");
const fs = require("fs");

const savedHashes = fs
  .readdirSync("./metadata")
  .map((filename) => filename.split(".")[0]);

const hashesToCrawl = hashlist.filter((hash) => !savedHashes.includes(hash));

console.log(hashesToCrawl.length);

const erroredHashes = [];
let count = 0;

(async () => {
  for (const hash of hashesToCrawl) {
    console.log("Remaining: ", hashesToCrawl.length - count);
    count++;
    try {
      const { data } = await axios.get(
        `https://api.solscan.io/account?address=${hash}&cluster=`,
        {
          headers: {
            Origin: "https://solscan.io",
            Referer: "https://solscan.io",
            "Sec-Ch-Ua":
              '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          },
        }
      );
      const metadataUri = data.data.metadata.data.uri;

      const { data: metadata } = await axios.get(metadataUri, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        },
      });
      fs.writeFileSync(
        `./metadata/${hash}.json`,
        JSON.stringify(metadata, null, 4)
      );
    } catch (err) {
      console.log({ err, hash });
      erroredHashes.push(hash);
    }
  }

  console.log("done");
  console.log({ erroredHashes: JSON.stringify(erroredHashes) });
})();
