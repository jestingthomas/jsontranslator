var xlsxj = require("xlsx-to-json");
const fs = require("fs");

const inputExcelFilePath = "./files/i/dictionary.xlsx";
const inputLanguageJSONFileToConvert = "./files/i/locale-ES_spa.json";
const outputExcelToJSONFilePath = "./files/o/outfile.json";
const outputLanguageJSONFileConverted = "./files/o/OUTPUT-locale-ES_spa.json";
const outputNotTranslatedTxtFile = "./files/o/notfoundfile.txt";

var totalReplaced = 0;
var totalNotReplaced = 0;
var notFoundStringsArray = [];

xlsxj(
  {
    input: inputExcelFilePath,
    output: outputExcelToJSONFilePath,
    lowerCaseHeaders: true
  },
  replaceStrings
);

function replaceStrings(err, dictionary) {
  if (err) {
    console.error(err);
  } else {
    let found;
    function parseObject(obj, keyVal, outerObj) {
      if (Object.keys(obj).length > 1 && typeof obj !== "string") {
        for (key in obj) {
          parseObject(obj[key], key, obj);
        }
      } else if (Object.keys(obj).length === 1 && typeof obj === "object") {
        for (key in obj) {
          parseObject(obj[key], key, obj);
        }
      } else {
        found = false;
        for (i = 0; i < dictionary.length; i++) {
          if (dictionary[i].english === obj && dictionary[i].spanish !== "") {
            totalReplaced++;
            outerObj[keyVal] = dictionary[i].spanish;
            found = true;
          }
        }

        if (found === false) {
          notFoundStringsArray.push(outerObj[keyVal]);
          totalNotReplaced++;
        }
      }

      return obj;
    }

    let rawdata = fs.readFileSync(inputLanguageJSONFileToConvert);
    let JSONInputContent = JSON.parse(rawdata);

    var returnJSON = parseObject(JSONInputContent);

    console.log("Total translations made ----->", totalReplaced);

    fs.writeFile(
      outputLanguageJSONFileConverted,
      JSON.stringify(returnJSON),
      err => {
        if (err) throw err;
        console.log("File saved!");
      }
    );

    console.log("Total not translated ----->", totalNotReplaced);

    var file = fs.createWriteStream(outputNotTranslatedTxtFile);
    file.on("error", function(err) {
      console.log(err);
    });

    notFoundStringsArray.forEach(function(v) {
      file.write(v + "\n");
    });

    file.end();
    console.log("Done writing to file.");
  }
}
