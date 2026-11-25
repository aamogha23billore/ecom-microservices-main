resource "aws_security_group" "postgres" {
  name_prefix = "${var.project}-postgres-"
  description = "PostgreSQL access from EKS nodes"
  vpc_id      = module.vpc.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "postgres" {
  security_group_id            = aws_security_group.postgres.id
  referenced_security_group_id = module.eks.node_security_group_id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}

resource "aws_db_subnet_group" "postgres" {
  name       = "${var.project}-postgres"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_db_instance" "postgres" {
  for_each = toset(["product", "order"])

  identifier                  = "${var.project}-${each.key}"
  engine                      = "postgres"
  instance_class              = var.db_instance_class
  allocated_storage           = 20
  max_allocated_storage       = 100
  storage_type                = "gp3"
  storage_encrypted           = true
  db_name                     = "${each.key}db"
  username                    = "ecomadmin"
  manage_master_user_password = true
  db_subnet_group_name        = aws_db_subnet_group.postgres.name
  vpc_security_group_ids      = [aws_security_group.postgres.id]
  publicly_accessible         = false
  multi_az                    = true
  backup_retention_period     = 7
  auto_minor_version_upgrade  = true
  deletion_protection         = true
  skip_final_snapshot         = false
  final_snapshot_identifier   = "${var.project}-${each.key}-final"
}
