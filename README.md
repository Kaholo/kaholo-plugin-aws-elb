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
5. Listeners (Array of Objects) **Required** - An array of Listener objects. You can see more information on listeners [here](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-listener-config.html). Each Listener can have the following fields: 
* InstancePort: 'NUMBER_VALUE', /* required */
* LoadBalancerPort: 'NUMBER_VALUE', /* required */
* Protocol: 'STRING_VALUE', /* required */
* InstanceProtocol: 'STRING_VALUE',
* SSLCertificateId: 'STRING_VALUE'
6. Scheme (Options) **Optional** - The type of a load balancer. Can be either Internet Facing or Internal. Default is Internet Facing.
7. Availability Zones (Array/Text) **Optional** - One or more Availability Zones from the same region as the load balancer. To enter multiple values seperate each with a new line.
8. Subnets (Array/Text) **Optional** - The IDs of the subnets in your VPC to attach to the load balancer. **Can't specify Both Subnets and Availabilty Zones!**. To enter multiple values seperate each with a new line. Also accepts getting an array value from code.
9. Security Groups (Array/Text) **Optional** - The IDs of the security groups to assign to the load balancer. To enter multiple values seperate each with a new line. Also accepts getting an array value from code.
10. Tags (Array of objects/Text) **Optional** - Tags to assign to the load balancer. You can see more information about tagging your load balancer [here](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/add-remove-tags.html). Enter each tag in the format of Key=Value. Also accepts Tags in the format of just Key. To enter multiple values seperate each with a new line. Also accepts getting an array of objects in the form of { Key, Value } or { Key }. 
