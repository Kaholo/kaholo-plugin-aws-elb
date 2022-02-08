const { getRegions } = require("./autocomplete")
const { getAwsClient, getAwsCallback, parseArr, checkListeners, parseTags } = require("./helpers");

async function createLoadBalancer(action, settings){
  const client = getAwsClient(action, settings);
  const params = {
    Name: (action.params.name || "").trim(),
    Subnets: parseArr(action.params.subnets),
    Scheme: action.params.scheme || "internet-facing",
    SecurityGroups: parseArr(action.params.securityGroups),
    Type: action.params.type || "application"
  }
  if (!params.Name ||  params.Subnets.length === 0){
    throw "One of the required parameters was not provided";
  }
  if (action.params.tags){
    params.Tags = parseTags(action.params.tags);
  }
  let result = { createLoadBalancer: await new Promise((resolve, reject) => {
      client.createLoadBalancer(params, getAwsCallback(resolve, reject));
    })
  }
  if (action.params.createListeners){
    action.params.loadBalancerArn = result.createLoadBalancer.LoadBalancers[0].LoadBalancerArn;
    result = {
      ...result,
      ...(await createListeners(action, settings))
    };
  }
  return result;
}

async function createListeners(action, settings){
  const defaultActions = parseArr(action.params.defaultActions);
  const defaultListenerActions = [
    {
        "Type": "fixed-response",
        "FixedResponseConfig": {
            "StatusCode": "403",
            "ContentType": "text/plain",
            "MessageBody": "Invalid Request"
        }
    }
  ];
  const params = {
    Protocol: action.params.protocol || "HTTP",
    LoadBalancerArn: action.params.loadBalancerArn,
    SslPolicy: action.params.sslPolicy,
    DefaultActions: defaultActions.length > 0 ? defaultActions : defaultListenerActions
  }
  const ports = parseArr(action.params.ports), tgPorts = parseArr(action.params.targetGroupPorts);
  if (!params.LoadBalancerArn || ports.length === 0 || tgPorts.length === 0 || !action.params.vpcId){
    throw "One of the required parameters was not provided";
  }
  if (ports.length !== tgPorts.length) throw "Ports and Target Groups Ports must be same length!"
  const results = {};
  if (action.params.vpcId && action.params.targetGroupPorts){
    results.createTargetGroups = await Promise.all(tgPorts.map(port => {
      action.params.port = port;
      action.params.name = `listener-${port}-${Date.now().toString()}`.substr(0, 32);
      return createTargetGroup(action, settings);
    }));
  }
  const client = getAwsClient(action, settings);
  if (action.params.tags){
    params.Tags = parseTags(action.params.tags);
  }
  if (action.params.certificateArn){
    params.Certificates = [ {CertificateArn: action.params.certificateArn }];
  }

  results.createListeners = await Promise.all(ports.map(port => {
    params.Port = port;
    return new Promise((resolve, reject) => {
      client.createListener(params, getAwsCallback(resolve, reject));
    });
  }));
  if (action.params.pathPatterns && results.createTargetGroups){
    const pathPatterns = parseArr(action.params.pathPatterns);
    results.createRules = await Promise.all(results.createTargetGroups.map((result, index) => {
      action.params.listenerArn = results.createListeners[index].Listeners[0].ListenerArn;
      action.params.targetGroupArn = result.TargetGroups[0].TargetGroupArn;
      action.params.pathPattern = pathPatterns[index];
      action.params.priority = index + 1;
      return createPathRule(action, settings);
    }));
  }
  return results;
}

async function describeListeners(action, settings){
  const client = getAwsClient(action, settings);
  const params = {
    LoadBalancerArn: action.params.loadBalancerArn,
  }
  if (action.params.listenerArns){
    params.ListenerArns = parseArr(action.params.listenerArns);
  }
  return new Promise((resolve, reject) => {
    client.describeListeners(params, getAwsCallback(resolve, reject));
  });
}

async function createPathRule(action, settings){
  if (!action.params.targetGroupArn || !action.params.pathPattern ||
      !action.params.priority || !action.params.listenerArn)
  {
    throw "One of the required parameters was not provided to createPathRule";
  }
  const client = getAwsClient(action, settings);
  const params = {
    ListenerArn: action.params.listenerArn,
    Priority: action.params.priority,
    Conditions:  [{
      Field: "path-pattern",
      Values: [ action.params.pathPattern ]
    }],
    Actions: [{
      TargetGroupArn: action.params.targetGroupArn,
      Type: "forward"
    }]
  }
  return new Promise((resolve, reject) => {
    client.createRule(params, getAwsCallback(resolve, reject));
  });
}

async function createTargetGroup(action, settings){
  const client = getAwsClient(action, settings);
  const params = {
    Name: action.params.name,
    Port: Number.parseInt(action.params.port),
    Protocol: action.params.protocol || "HTTP",
    VpcId: action.params.vpcId
  }
  return new Promise((resolve, reject) => {
    client.createTargetGroup(params, getAwsCallback(resolve, reject));
  });
}

module.exports = {
  createLoadBalancer,
  describeListeners,
  createPathRule,
  createTargetGroup,
  createListeners,
  // autocomplete
  getRegions
};

