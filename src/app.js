const { getRegions } = require("./autocomplete")
const { getAwsClient, getAwsCallback, parseArr, checkListeners, parseTags } = require("./helpers");

async function createLoadBalancer(action, settings){
  const client = getAwsClient(action, settings);
  const params = {
    LoadBalancerName: (action.params.name || "").trim(),
    Listeners: checkListeners(action.params.listeners),
    AvailabilityZones: parseArr(action.params.availabilityZones),
    Subnets: parseArr(action.params.subnets),
    SecurityGroups: parseArr(action.params.securityGroups)
  }
  if (!params.LoadBalancerName || params.AvailabilityZones.length === 0){
    throw "One of the required parameters was not provided";
  }
  if (action.params.scheme === "Internal"){
    params.Scheme = "internal";
  }
  if (action.params.tags){
    params.Tags = parseTags(action.params.tags);
  }
  return new Promise((resolve, reject) => {
    client.createLoadBalancer(params, getAwsCallback(resolve, reject));
  });
}

module.exports = {
  createLoadBalancer,
  // autocomplete
  getRegions
};

