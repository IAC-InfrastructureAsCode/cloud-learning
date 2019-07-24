const util = require('util');
const AWS = require('aws-sdk');

const S = new AWS.S3({
    maxRetries: 0,
    region: 'us-east-1',
});

exports.handler = async (event, context) => {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey    = event.Records[0].s3.object.key;

    // don't run on anything that isn't a CSV
    if (srcKey.match(/\.csv$/) === null) {
        const msg = "Key " + srcKey + " is not a csv file, bailing out";
        console.log(msg);
        return {message: msg};
    }
    console.log(`Getting ${srcKey} from s3://${srcBucket}`)

    let data = await S.getObject({
        Bucket: srcBucket,
        Key: srcKey,
    }).promise();

    let lines = data.Body.toString('utf-8').split('\n');
    let net_profit = 0;
    lines.slice(1).forEach(function (raw_line) {
        let line = raw_line.split(',');
        if (line.length < 3) { return null; }
        console.log(line);
        net_profit += line[2] - line[3];
    });
    console.log(net_profit);
    return {"net_profits": net_profit};
};
