output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "ecr_repository_urls" {
  value = { for name, repo in aws_ecr_repository.services : name => repo.repository_url }
}

output "postgres_endpoints" {
  value = { for name, db in aws_db_instance.postgres : name => db.address }
}

output "postgres_master_secret_arns" {
  value = { for name, db in aws_db_instance.postgres : name => db.master_user_secret[0].secret_arn }
}

output "msk_bootstrap_brokers_iam" {
  value = aws_msk_cluster.events.bootstrap_brokers_sasl_iam
}

output "api_dns_record" {
  value = try(aws_route53_record.api[0].fqdn, null)
}
