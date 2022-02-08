let aws = require("aws-sdk");

function getAwsClient(action, settings){
    const keyId = action.params.accessKeyId || settings.accessKeyId;
    const secret = action.params.secretAccessKey || settings.secretAccessKey;
    const region = parseAutoComplete(action.params.region);
    let config = {
        accessKeyId: keyId,
        secretAccessKey: secret,
        region: region
    }
    return new aws.ELBv2(config);
}

function getEc2(params, settings) {
    return new aws.EC2({
        region: parseAutoComplete(params.region) || settings.region,
        accessKeyId: params.accessKeyId || settings.accessKeyId,
        secretAccessKey: params.secretAccessKey || settings.secretAccessKey,
    });
}

function getLightsail(params, settings) {
    return new aws.Lightsail({
        region: parseAutoComplete(params.region) || settings.region,
        accessKeyId: params.accessKeyId || settings.accessKeyId,
        secretAccessKey: params.secretAccessKey || settings.secretAccessKey,
    });
}

function parseAutoComplete(param){
    return param.id ? param.id : param;
}

function getAwsCallback(resolve, reject){
    return (err, data) => {
        if (err) return reject(err);
        return resolve(data);
    }
}

function parseArr(param){
    if (!param){
        return [];
    }
    if (Array.isArray(param)){
        return param;
    }
    if (typeof(param) === "string"){
        return param.split("\n").map(line=>line.trim()).filter(line=>line);
    }
    throw "Unsupprted array format"
}

function checkListeners(param){
    if (!param){
        throw "Listeners can't be emtpy!"
    }
    if (!Array.isArray(param)){
        throw "Can't parse listeners with a different format than an array";
    }
    if (!param.every(listener => listener.Protocol && listener.LoadBalancerPort)){
        throw "Missing One of listners required fields!";
    }
    return param;
}

function parseTags(tags){
    if (!tags) return [];
    if (Array.isArray(tags) && tags.every(tag => tag.Key)){
        return tags;
    }
    tags = parseArr(tags);
    return tags.map(line => {
        let [key, ...val] = line.split("=");
        if (!val){
            return { Key: key };
        }
        if (Array.isArray(val)){
            val = val.join("=");
        }
        return { Key: key, Value: val };
    });
}


module.exports = {
    getAwsClient,
    getAwsCallback,
    parseArr,
    checkListeners,
    getEc2,
    getLightsail,
    parseTags
}
