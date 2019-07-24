const util = require('util');
const AWS = require('aws-sdk');

const S = new AWS.S3({
    maxRetries: 0,
    region: 'us-east-1',
});

exports.handler = async (event, context) => {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    let srcBucket = event.Records[0].s3.bucket.name;
    let srcKey    = event.Records[0].s3.object.key;

    // don't run on anything that isn't a CSV
    if (srcKey.match(/\.csv$/) === null) {
        let msg = "Key " + srcKey + " is not a csv file, bailing out";
        console.log(msg);
        return {message: msg};
    }
    console.log(`Getting ${srcKey} from s3://${srcBucket}`)

    let data = await S.getObject({
        Bucket: srcBucket,
        Key: srcKey,
    }).promise();

    console.log("Raw CSV data:");
    console.log(data.Body.toString('utf-8'));
    console.log(context.getRemainingTimeInMillis());
    return data;
};
