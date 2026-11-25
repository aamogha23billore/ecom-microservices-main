variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project" {
  type    = string
  default = "ecom"
}

variable "eks_version" {
  description = "An EKS Kubernetes version supported in the selected region"
  type        = string
}

variable "kafka_version" {
  description = "An MSK Kafka version supported in the selected region"
  type        = string
}

variable "admin_cidrs" {
  description = "Trusted operator CIDRs for the EKS public API endpoint"
  type        = list(string)
  validation {
    condition     = length(var.admin_cidrs) > 0 && alltrue([for c in var.admin_cidrs : can(cidrhost(c, 0)) && !contains(["0.0.0.0/0", "::/0"], c)])
    error_message = "Specify restricted operator CIDRs, not unrestricted public access."
  }
}

variable "node_instance_types" {
  type    = list(string)
  default = ["m6i.large"]
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.medium"
}

variable "kafka_instance_type" {
  type    = string
  default = "kafka.m5.large"
}

variable "hosted_zone_name" {
  description = "Existing public Route 53 hosted zone; null skips DNS"
  type        = string
  default     = null
}

variable "api_hostname" {
  type    = string
  default = null
}

variable "alb_dns_name" {
  description = "ALB DNS name after Kubernetes Ingress reconciliation"
  type        = string
  default     = null
}

variable "alb_zone_id" {
  description = "Canonical hosted zone ID of the ALB, not the application DNS zone"
  type        = string
  default     = null
}
