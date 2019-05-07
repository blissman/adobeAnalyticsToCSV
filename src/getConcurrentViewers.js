/*
    Dependencies (I don't love jQuery either but Adobe's library uses it)
*/
const fs = require("file-system");
const testHTML = `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
</body>
</html>
`;
const {
    JSDOM
} = require("jsdom");
const jsdom = new JSDOM(testHTML);
const {
    window
} = jsdom;
const {
    document
} = window;
global.window = window;
global.document = document;
const $ = global.jQuery = require("jquery");
require("./wsse.js");
require("./marketing_cloud.js");
require("./user.js");
require("./report.js");
require("./parseToCSV.js");

/*
    Adobe Variables
*/
const rsid = window.report.rsid; // your RSID name
const segmentId = window.report.segmentId; // insert your segment id here
const startDate = window.report.startDate; // your start date in YYYY-MM-DD format
const endDate = window.report.endDate; // your end date in YYYY-MM-DD format
const userName = window.user.name;
const sharedSecret = window.user.sharedSecret;
const endpoint = "api.omniture.com"; // Adobe's San Jose datacentre (api2.omniture.com = Dallas, api3.omniture.com = London, api4.omniture.com = Singapore)
const body = {
    "reportDescription": {
        "reportSuiteID": rsid,
        "dateFrom": startDate,
        "dateTo": endDate,
        "metrics": [{
            "id": "instances"
        }],
        "elements": [{
            "id": "videoconcurrentviewers",
            "top": "2880"
        }],
        "segments": [{
            "id": segmentId
        }],
        "sortBy": "instances",
        "locale": "en_US"
    }
};

/*
    Methods
*/
let reportID = "";
let retryCount = 0;
const retryLimit = 3;

const callReport = (newBody) => {
    window.MarketingCloud.makeRequest(userName, sharedSecret, "Report.Get", newBody, endpoint, function(e) {
        if (JSON.parse(e.responseText).error === "report_not_ready" && retryCount < retryLimit) {
            setTimeout(() => {
                callReport(newBody);
            }, 20000);
            retryCount++;
        } else if (e.responseText && JSON.parse(e.responseText).report) {
            const returnValue = window.parseData.returnCSV(JSON.parse(e.responseText));
            fs.writeFile("./reports/" + reportID + ".csv", returnValue, (err, data) => {
                if (err) {
                    console.log(err);
                }
            });
            console.log(returnValue);
        } else if (retryCount >= retryLimit) {
            console.log("Error: could not view report after three retries!");
        } else {
            console.log("Error:" + e.responseText);
        }
    });
};

const init = () => {
    window.MarketingCloud.makeRequest(userName, sharedSecret, "Report.Queue", body, endpoint, function(e) {
        console.log("Report Queue Response: " + e.responseText);
        reportID = JSON.parse(e.responseText).reportID;
        console.log("reportID: " + reportID);
        const newBody = body;
        newBody.reportID = reportID;
        callReport(newBody);
    });
};

init();