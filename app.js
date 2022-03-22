const { listRegions } = require("./autocomplete");
const {
  getAwsClient, getAwsCallback, parseArr, parseTags,
} = require("./helpers");

async function createLoadBalancer(action, settings) {
  const client = getAwsClient(action, settings);
  const params = {
    Name: (action.params.name || "").trim(),
    Subnets: parseArr(action.params.subnets),
    Scheme: action.params.scheme || "internet-facing",
    SecurityGroups: parseArr(action.params.securityGroups),
    Type: action.params.type || "application",
  };
  if (!params.Name || params.Subnets.length === 0) {
    throw new Error("One of the required parameters was not provided");
  }
  if (action.params.tags) {
    params.Tags = parseTags(action.params.tags);
  }
  let result = {
    createLoadBalancer: await new Promise((resolve, reject) => {
      client.createLoadBalancer(params, getAwsCallback(resolve, reject));
    }),
  };
  if (action.params.createListeners) {
    const newAction = action;
    newAction.params.loadBalancerArn = result.createLoadBalancer.LoadBalancers[0].LoadBalancerArn;
    result = {
      ...result,
      ...(await createListeners(newAction, settings)),
    };
  }
  return result;
}

async function createListeners(action, settings) {
  const newAction = action;
  const defaultActions = parseArr(newAction.params.defaultActions);
  const defaultListenerActions = [
    {
      Type: "fixed-response",
      FixedResponseConfig: {
        StatusCode: "403",
        ContentType: "text/plain",
        MessageBody: "Invalid Request",
      },
    },
  ];
  const params = {
    Protocol: newAction.params.protocol || "HTTP",
    LoadBalancerArn: newAction.params.loadBalancerArn,
    SslPolicy: newAction.params.sslPolicy,
    DefaultActions: defaultActions.length > 0 ? defaultActions : defaultListenerActions,
  };
  const ports = parseArr(newAction.params.ports); const
    tgPorts = parseArr(newAction.params.targetGroupPorts);
  if (
    !params.LoadBalancerArn
    || ports.length === 0
    || tgPorts.length === 0
    || !newAction.params.vpcId
  ) {
    throw new Error("One of the required parameters was not provided");
  }
  if (ports.length !== tgPorts.length) { throw new Error("Ports and Target Groups Ports must be same length!"); }
  const results = {};
  if (newAction.params.vpcId && newAction.params.targetGroupPorts) {
    results.createTargetGroups = await Promise.all(tgPorts.map((port) => {
      newAction.params.port = port;
      newAction.params.name = `listener-${port}-${Date.now().toString()}`.substr(0, 32);
      return createTargetGroup(newAction, settings);
    }));
  }
  const client = getAwsClient(newAction, settings);
  if (newAction.params.tags) {
    params.Tags = parseTags(newAction.params.tags);
  }
  if (newAction.params.certificateArn) {
    params.Certificates = [{ CertificateArn: newAction.params.certificateArn }];
  }

  results.createListeners = await Promise.all(ports.map((port) => {
    params.Port = port;
    return new Promise((resolve, reject) => {
      client.createListener(params, getAwsCallback(resolve, reject));
    });
  }));
  if (newAction.params.pathPatterns && results.createTargetGroups) {
    const pathPatterns = parseArr(newAction.params.pathPatterns);
    results.createRules = await Promise.all(results.createTargetGroups.map((result, index) => {
      newAction.params.listenerArn = results.createListeners[index].Listeners[0].ListenerArn;
      newAction.params.targetGroupArn = result.TargetGroups[0].TargetGroupArn;
      newAction.params.pathPattern = pathPatterns[index];
      newAction.params.priority = index + 1;
      return createPathRule(newAction, settings);
    }));
  }
  return results;
}

async function describeListeners(action, settings) {
  const client = getAwsClient(action, settings);
  const params = {
    LoadBalancerArn: action.params.loadBalancerArn,
  };
  if (action.params.listenerArns) {
    params.ListenerArns = parseArr(action.params.listenerArns);
  }
  return new Promise((resolve, reject) => {
    client.describeListeners(params, getAwsCallback(resolve, reject));
  });
}

async function createPathRule(action, settings) {
  if (!action.params.targetGroupArn || !action.params.pathPattern
      || !action.params.priority || !action.params.listenerArn) {
    throw new Error("One of the required parameters was not provided to createPathRule");
  }
  const client = getAwsClient(action, settings);
  const params = {
    ListenerArn: action.params.listenerArn,
    Priority: action.params.priority,
    Conditions: [{
      Field: "path-pattern",
      Values: [action.params.pathPattern],
    }],
    Actions: [{
      TargetGroupArn: action.params.targetGroupArn,
      Type: "forward",
    }],
  };
  return new Promise((resolve, reject) => {
    client.createRule(params, getAwsCallback(resolve, reject));
  });
}

async function createTargetGroup(action, settings) {
  const client = getAwsClient(action, settings);
  const params = {
    Name: action.params.name,
    Port: Number.parseInt(action.params.port, 10),
    Protocol: action.params.protocol || "HTTP",
    VpcId: action.params.vpcId,
  };
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
  listRegions,
};
