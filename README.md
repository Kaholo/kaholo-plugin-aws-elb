# kaholo-plugin-aws-elb
Kaholo integration with AWS ELB API.

## Settings
1. Access Key ID (String) **Optional** - The Access Key ID to use on default.
2. Secret Access Key (Vault) **Optional** - The Secret Access Key to use on default.

## Method: Create Load Balancer
Create a new load balancer on AWS ELB. You can see more info on this method [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#createLoadBalancer-property).

### Parameters
1. Access Key ID(string) **Optional** - The Access Key ID to use to authenticate.
2. Secret Access Key(vault) **Optional** - The Secret Access Key to use to authenticate.
3. AWS Region (AutoComplete String) **Required** - The region to create the the Load Balancer on.
4. Name (String) **Required** - The name of the load balancer to create.
5. Scheme (Options) **Optional** - The type of a load balancer. Can be either Internet Facing or Internal. Default is Internet Facing.
6. Type (Options) **Required** - The type of the load balancer. Can be either application/network/gateway.
7. Subnets (Array/Text) **Required** - The IDs of the subnets in your VPC to attach to the load balancer. To enter multiple values seperate each with a new line.
8. Security Groups (Array/Text) **Optional** - The IDs of the security groups to assign to the load balancer. To enter multiple values seperate each with a new line. Also accepts getting an array value from code.
9. Tags (Array of objects/Text) **Optional** - Tags to assign to the load balancer. You can see more information about tagging your load balancer [here](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/add-remove-tags.html). Enter each tag in the format of Key=Value. Also accepts Tags in the format of just Key. To enter multiple values seperate each with a new line. Also accepts getting an array of objects in the form of { Key, Value } or { Key }. 

## Method: Create Forward Listeners
Create a new listener for the specified load balancer. Also Creates specified path rules that forward to the new listener. Also Creates new Target Groups for the specified VPC and ports. You can see more info on the original method [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#createListeners-property).


### Parameters
1. Access Key ID(string) **Optional** - The Access Key ID to use to authenticate.
2. Secret Access Key(vault) **Optional** - The Secret Access Key to use to authenticate.
3. AWS Region (AutoComplete String) **Required** - The region to create the the Load Balancer on.
4. Target Group VPC ID (String) **Required** - The ID of the VPC to include in the new Target Group.
5. Target Group Ports (Text/Array) **Required** - The ports to forward traffic to the vpc on. Each Port will be created a new target group for. To enter multiple values seperate each with a new line.
6. Forward Path Rule Patterns (Text/Array) **Required** - The patterns of the new forward path rules to create. Needs to be in the same length as 'Target Group Ports'. Each port is assigned the matching pattern in the same index. To enter multiple values seperate each with a new line.
7. Default Actions (Array of objects) **Optional** - If specified, attach yhe specified actions to default(when no other rule matches). You can see more on default actions in the [documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#createListeners-property).
8. Load Balancer ARN (String) **Optional** - The ARN of the load balancer to attach the listener to.
9. Protocol (Options) **Optional** - The protocol to use 
to listen. Can be either HTTP or HTTPS.
10. Listener Ports (Text/Array) **Required** - The ports to listen to on the listener for each path rule. Needs to be in the same lengrh as 'Target Group Ports' and 'Forward Path Rule Patterns'.
11. SSL Policy (String) **Optional** - Only for HTTPS. The SSL policy to use.
12. Certificate ARN (String) **Optional** - Only for HTTPS. The ARN of the SSL certificate to use.
13. Tags (Array of objects/Text) **Optional** - Tags to assign to all resources created in this method. You can see more information about tagging your load balancer [here](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/add-remove-tags.html). Enter each tag in the format of Key=Value. Also accepts Tags in the format of just Key. To enter multiple values seperate each with a new line. Also accepts getting an array of objects in the form of { Key, Value } or { Key }. 

## Method: Describe Listeners
Return information about all listeners or only the ones specified. You can see more info on the original method [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#describeListeners-property).


### Parameters
1. Access Key ID(string) **Optional** - The Access Key ID to use to authenticate.
2. Secret Access Key(vault) **Optional** - The Secret Access Key to use to authenticate.
3. AWS Region (AutoComplete String) **Required** - The region to create the the Load Balancer on.
4. Load Balancer ARN (String) **Optional** - If specified, return only listeners of the specified load balancer.
5. Listener ARNs (Text/Array) **Optional** - If specified, return information only about the listeners that were specified.

## Method: Create Path Rule
Create a new forward path rule for the specified listener. Forwards all traffic in the specified listener and URL address to the specified target group. You can see more info on the original method [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#createPathRule-property).


### Parameters
1. Access Key ID(string) **Optional** - The Access Key ID to use to authenticate.
2. Secret Access Key(vault) **Optional** - The Secret Access Key to use to authenticate.
3. AWS Region (AutoComplete String) **Required** - The region to create the the Load Balancer on.
4. Listener ARN (String) **Required** - The ARN of the listener to create the path rule for.
5. Path Pattern (String) **Required** - The pattern of URL pathes the rule should catch.
6. Target Group ARN (String) **Required** - The ARN of the target group to forward the traffic to.

## Method: Create Target Group
Create a new target group for the specified VPC in the specified Port. You can see more info on the original method [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#createTargetGroup-property).


### Parameters
1. Access Key ID(string) **Optional** - The Access Key ID to use to authenticate.
2. Secret Access Key(vault) **Optional** - The Secret Access Key to use to authenticate.
3. AWS Region (AutoComplete String) **Required** - The region to create the the Load Balancer on.
4. Name (String) **Reqired** - The name of the target group to create.
5. Protocol (Options) **Optional** - The protocol to use for this target group. Can be HTTP\HTTPS. Defailt is HTTP.
6. VPC ID (String) **Required** - The VPC to assign to this Target group.
