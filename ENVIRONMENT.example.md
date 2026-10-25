# MC HOSTING environment reference

Configure these through the project's managed secret/environment settings. Never commit actual values and never expose `DISCORD_WEBHOOK_URL` through a `VITE_` variable.

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-id/your-webhook-token
DEFAULT_DELIVERY_FEE=250
FREE_DELIVERY_THRESHOLD=5000
VITE_WHATSAPP_NUMBER=923001234567
```

`VITE_WHATSAPP_NUMBER` is optional and should be replaced with MC Hosting's official Discord number. Until configured, the Discord shortcut safely falls back to the contact page.
