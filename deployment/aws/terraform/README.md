# AWS Terraform reference infrastructure

**Not deployed or validated against a live AWS account.** This configuration creates billable resources if applied, including three NAT gateways, EKS nodes, two Multi-AZ RDS instances and three MSK brokers. It is not a free-tier configuration.

For offline-style syntax/provider validation (init downloads modules/providers; no AWS resources are created):

```sh
terraform fmt -recursive
terraform init -backend=false
terraform validate
```

For an actual deployment, verify service versions and quotas, copy the example tfvars and fill required variables, configure AWS authentication outside Git, and use an encrypted, access-controlled remote state backend with locking. Commit the provider lock file after initialization. Review a plan before any separately authorized apply.

The stack defines a three-AZ VPC, private EKS workers, separate encrypted PostgreSQL instances for product and order, private IAM-authenticated MSK, seven immutable ECR repositories, and optional Route 53 alias DNS to an existing ALB. RDS generates and manages master passwords in Secrets Manager. Use distinct least-privilege database application users, not master credentials.

## Integration still required

- Install AWS Load Balancer Controller with workload IAM permissions, Metrics Server, and a node autoscaler if needed. Provision a matching ACM certificate and configure the AWS Ingress overlay.
- Build and publish project-owned images to ECR and substitute immutable tags/digests in Kubernetes.
- Replace demo PostgreSQL and Kafka/ZooKeeper manifests with RDS/MSK endpoints and secrets. Spring Kafka needs the AWS MSK IAM authentication library, SASL_SSL/AWS_MSK_IAM settings, and scoped workload IAM permissions for topics and consumer groups. These are not wired by this Terraform stack.
- Provide durable MongoDB, RabbitMQ and Keycloak infrastructure, secure issuer configuration, frontend hosting and secret injection. Validate network access, payments, authentication, and concurrency before exposure.
- Supply the ALB DNS name and canonical hosted zone ID after the controller provisions it to enable the optional Route 53 alias.

Deletion protection is enabled for RDS. Plan cleanup deliberately and account for retained snapshots and ongoing charges. No apply or destroy has been run.
