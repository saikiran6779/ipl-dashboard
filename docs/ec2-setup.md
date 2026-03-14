# EC2 Server Setup

One-time setup required before the GitHub Actions deployment workflow will work.

## 1. Create the systemd service

```bash
sudo nano /etc/systemd/system/ipl.service
```

```ini
[Unit]
Description=IPL Dashboard Backend
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user
EnvironmentFile=/home/ec2-user/ipl.env
ExecStart=/usr/bin/java -jar /home/ec2-user/app.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ipl
```

## 2. Add GitHub Actions secrets

Go to your repo → Settings → Secrets and variables → Actions → New repository secret.

Add these secrets (they match the placeholders in `application-prod.properties`):

| Secret name    | Value                                      |
|----------------|--------------------------------------------|
| `DB_URL`       | `jdbc:mysql://localhost:3306/ipl_dashboard?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME`  | your MySQL username                        |
| `DB_PASSWORD`  | your MySQL password                        |
| `JWT_SECRET`   | output of `openssl rand -base64 32`        |
| `MAIL_USERNAME`| your Gmail address                         |
| `MAIL_PASSWORD`| your Gmail app password                    |

The workflow also needs these (likely already set):

| Secret name           | Value                    |
|-----------------------|--------------------------|
| `EC2_HOST`            | EC2 public IP            |
| `EC2_USER`            | `ec2-user`               |
| `EC2_SSH_KEY`         | contents of your `.pem`  |
| `AWS_ACCESS_KEY_ID`   | AWS IAM key              |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret         |
| `AWS_REGION`          | e.g. `us-east-1`        |
| `S3_BUCKET`           | your S3 bucket name      |

## 3. First deploy

Push any change to `master` or trigger the workflow manually via
GitHub → Actions → Deploy Backend → Run workflow.

The workflow will:
1. Build the JAR (with git commit hash baked in)
2. Copy it to EC2
3. Write `/home/ec2-user/ipl.env` with secrets from GitHub Actions
4. Restart the `ipl` service
5. Confirm the deployed commit hash matches HEAD via `/actuator/info`
