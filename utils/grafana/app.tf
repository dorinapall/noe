module "backend_app" {
  source = "git@gitlab.com:rollet/terraform-modules/terraform-aws-ecs-service.git"

  app_name        = "${var.app_name}-${terraform.workspace}"
  ecs_cluster     = local.core_config.ecs_cluster.private.cluster_name
  cpu_units       = 512
  memory_mbytes   = 512
  desired_count   = var.desired_count
  minimum_percent = var.minimum_percent
  maximum_percent = var.maximum_percent

  port_mappings = var.app_tg_ports

  app_image_url      = var.app_image_url
  env_vars           = var.env_vars
  env_secrets        = var.env_secrets
  lb_target_groups   = aws_lb_target_group.backend_nlb_tgs
  execution_role_arn = aws_iam_role.task_execution_role.arn

  cw_log_group_name   = var.cw_log_group_name
  cw_log_group_region = var.cw_log_group_region

}

resource "aws_iam_role" "task_execution_role" {
  name = "${var.app_name}-${terraform.workspace}-task-execution-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  tags = {
    tag-key = "tag-value"
  }
}

resource "aws_iam_role_policy_attachment" "ssm_reader_policy" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = local.core_config.ssm_reader_policy_arn
}
resource "aws_iam_role_policy_attachment" "execution_role_policy" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
resource "aws_iam_role_policy_attachment" "cloudwatch_read_policy" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = aws_iam_policy.cloudwatch_read.arn
}

resource "aws_iam_policy" "cloudwatch_read" {
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReadingMetricsFromCloudWatch",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:DescribeAlarmsForMetric",
        "cloudwatch:DescribeAlarmHistory",
        "cloudwatch:DescribeAlarms",
        "cloudwatch:ListMetrics",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:GetMetricData"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowReadingTagsInstancesRegionsFromEC2",
      "Effect": "Allow",
      "Action": ["ec2:DescribeTags", "ec2:DescribeInstances", "ec2:DescribeRegions"],
      "Resource": "*"
    },
    {
      "Sid": "AllowReadingResourcesForTags",
      "Effect": "Allow",
      "Action": "tag:GetResources",
      "Resource": "*"
    }
  ]
}
EOF
}