# AWS Deployment Architecture

This document describes the AWS deployment architecture for the e-commerce microservices platform.

> **Deployment status:** The Kubernetes manifests and AWS deployment architecture are deployment-ready.

## Architecture

```text
                         INTERNET
                            |
                            v
                  AWS Load Balancer
                            |
                            v
                    Kubernetes Ingress
                            |
                            v
                    API Gateway Service
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
   User Service      Product Service     Order Service
          |                 |                 |
          +-----------------+-----------------+
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
         PostgreSQL      MongoDB       Messaging
                                           |
                                  +--------+--------+
                                  |                 |
                                  v                 v
                                Kafka           RabbitMQ

                  Supporting Infrastructure
                  --------------------------
                  Eureka
                  Config Server
                  Keycloak
                  Zipkin
