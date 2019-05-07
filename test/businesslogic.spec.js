describe("parse to csv", () => {

    beforeEach(() => {
        spyOn(window.getReport, "requestBody").and.callThrough();
        spyOn(window.getReport, "fetch").and.callThrough();
        window.MarketingCloud = {};
        window.MarketingCloud.makeRequest = () => {
            return true;
        };
    });

    const data = {
        "report": {
            "type": "ranked",
            "elements": [{
                "id": "videoconcurrentviewers",
                "name": "Video Concurrent Viewers"
            }],
            "reportSuite": {
                "id": "bellmediatsnprod",
                "name": "TSN - Prod"
            },
            "period": "Thu.  2 May 2019 - Fri.  3 May 2019",
            "metrics": [{
                "id": "instances",
                "name": "Instances",
                "type": "number",
                "decimals": 0,
                "latency": 2602,
                "current": false
            }],
            "segments": [{
                "id": "s300008103_5cccaa0d85d04262783da2e6",
                "name": "TSN Live Streams"
            }],
            "data": [{
                "name": "00:24 2019-05-02",
                "url": "",
                "counts": ["237"]
            }, {
                "name": "00:25 2019-05-02",
                "url": "",
                "counts": ["236"]
            }, {
                "name": "00:23 2019-05-02",
                "url": "",
                "counts": ["236"]
            }, {
                "name": "00:26 2019-05-02",
                "url": "",
                "counts": ["235"]
            }],
            "totals": ["321749"],
            "version": "1.4.18.10"
        },
        "waitSeconds": 0,
        "runSeconds": 0
    };

    const user = {
            name: "gerald.butts@canada.ca:Federal Government",
            sharedSecret: "0be47a0a1aab316891eeae4e6555551b"
        };

    const report = {
            rsid: "testrsid",
            segmentId: "s311108103_5cccaa0d85d04262783da2e6",
            type: "daily",
            month: 5,
            year: 2019,
            startDate: "2019-03-12",
            endDate: "2019-03-13"
        };


    const result = {
        "reportDescription": {
            "reportSuiteID": "testrsid",
            "dateFrom": "2019-03-12",
            "dateTo": "2019-03-13",
            "metrics": [{
                "id": "instances"
            }],
            "elements": [{
                "id": "videoconcurrentviewers",
                "top": "2880"
            }],
            "segments": [{
                "id": "s311108103_5cccaa0d85d04262783da2e6"
            }],
            "sortBy": "instances",
            "locale": "en_US"
        }
    };

    it("should parse the json to csv", () => {
        expect(window.parseData.returnCSV(data)).toEqual(
            "type,ranked\nelements,Video Concurrent Viewers\nreportSuite,id,bellmediatsnprod\n,name,TSN - Prod\nPeriod,Thu.  2 May 2019 - Fri.  3 May 2019\nsegments,id,s300008103_5cccaa0d85d04262783da2e6\n,name,TSN Live Streams\ndata\nTime,Count,URL\n00:24 2019-05-02,237,\n00:25 2019-05-02,236,\n00:23 2019-05-02,236,\n00:26 2019-05-02,235,\n"
        );
    });

    it("should return false if getReport.requestBody() is called without a report config object", () => {
        expect(window.getReport.requestBody(undefined)).toBeFalsy();
        expect(window.getReport.requestBody(null)).toBeFalsy();
        expect(window.getReport.requestBody(() => {})).toBeFalsy();
        expect(window.getReport.requestBody(32)).toBeFalsy();
        expect(window.getReport.requestBody("string")).toBeFalsy();
    });

    it("should return a body object if getReport.requestBody() is called with a report config object set", () => {
        expect(window.getReport.requestBody(report)).toEqual(result);
    });

    it("should return false if init is called with invalid user and/or report configurations", () => {
        expect(window.getReport.init(undefined, report)).toBeFalsy();
        expect(window.getReport.init(null, report)).toBeFalsy();
        expect(window.getReport.init(() => {}, report)).toBeFalsy();
        expect(window.getReport.init(32, report)).toBeFalsy();
        expect(window.getReport.init("string", report)).toBeFalsy();
        expect(window.getReport.init(user, undefined)).toBeFalsy();
        expect(window.getReport.init(user, null)).toBeFalsy();
        expect(window.getReport.init(user, () => {})).toBeFalsy();
        expect(window.getReport.init(user, 32)).toBeFalsy();
        expect(window.getReport.init(user, "string")).toBeFalsy();
    });

    it("should generate a request body if init is called with valid user and report configurations", () => {
        window.getReport.init(user, report);
        expect(window.getReport.requestBody).toHaveBeenCalledWith({
            rsid: 'testrsid',
            segmentId: 's311108103_5cccaa0d85d04262783da2e6',
            type: "daily",
            month: 5,
            year: 2019,
            startDate: '2019-03-12',
            endDate: '2019-03-13'
        });
    });

    it("should return the right number of days for non leap-years", () => {
        expect(window.utils.getDays(1, 2018)).toEqual(31);
        expect(window.utils.getDays(2, 2019)).toEqual(28);
        expect(window.utils.getDays(3, 2019)).toEqual(31);
        expect(window.utils.getDays(4, 2019)).toEqual(30);
        expect(window.utils.getDays(5, 2019)).toEqual(31);
        expect(window.utils.getDays(6, 2019)).toEqual(30);
        expect(window.utils.getDays(7, 2019)).toEqual(31);
        expect(window.utils.getDays(8, 2019)).toEqual(31);
        expect(window.utils.getDays(9, 2019)).toEqual(30);
        expect(window.utils.getDays(10, 2019)).toEqual(31);
        expect(window.utils.getDays(11, 2019)).toEqual(30);
        expect(window.utils.getDays(12, 2019)).toEqual(31);
    });

    it("should return false for invalid months", () => {
        expect(window.utils.getDays(0, 2019)).toBeFalsy();
        expect(window.utils.getDays(undefined, 2019)).toBeFalsy();
        expect(window.utils.getDays(null, 2019)).toBeFalsy();
        expect(window.utils.getDays(()=>{}, 2019)).toBeFalsy();
        expect(window.utils.getDays(13, 2019)).toBeFalsy();
        expect(window.utils.getDays("thirteen", 2019)).toBeFalsy();
        expect(window.utils.getDays(12, "2019")).toBeFalsy();
        expect(window.utils.getDays(11, null)).toBeFalsy();
        expect(window.utils.getDays(12, undefined)).toBeFalsy();
        expect(window.utils.getDays(11, false)).toBeFalsy();
    });


    it("should return 29 for February leap years", () => {
        expect(window.utils.getDays(2, 2020)).toEqual(29);
        expect(window.utils.getDays(2, 2024)).toEqual(29);
        expect(window.utils.getDays(2, 2028)).toEqual(29);
    });
});