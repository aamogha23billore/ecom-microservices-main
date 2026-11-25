# AWS ALB overlay (reference configuration)

This overlay is a template, not a live or production-validated deployment.

Render locally without provisioning AWS resources:

```sh
kubectl kustomize deployment/aws/kubernetes
```

Before deploying, replace api.example.com with your owned API hostname, provision a matching ACM certificate in the ALB region (certificate discovery uses the hostname), configure Route 53, and install the AWS Load Balancer Controller with its IAM permissions, ingress class and appropriate public subnet tags. Install Metrics Server for HPAs.

The overlay changes the gateway Service to ClusterIP so only the Ingress creates an external load balancer. The ALB health check goes directly to gateway pods. Public listener paths are limited to application API routes and the Stripe webhook; actuator and Eureka routes are not published by this Ingress.

The base still contains demo databases, images and example secrets. Replace these with your own built images, managed infrastructure and securely provisioned secrets before use. Configure a separate secure public Keycloak issuer and frontend hosting, adjust issuer/JWK settings, enforce application authorization, and validate health checks and payment idempotency before internet exposure. Do not apply this template unchanged. No AWS resources have been created.
