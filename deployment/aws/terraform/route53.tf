data "aws_route53_zone" "public" {
  count        = var.hosted_zone_name == null ? 0 : 1
  name         = var.hosted_zone_name
  private_zone = false
}

resource "aws_route53_record" "api" {
  count   = var.hosted_zone_name != null && var.api_hostname != null && var.alb_dns_name != null && var.alb_zone_id != null ? 1 : 0
  zone_id = data.aws_route53_zone.public[0].zone_id
  name    = var.api_hostname
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}
