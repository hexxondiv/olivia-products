# Email Debugging Guide

## Issue: Customer Acknowledgement Email Not Being Sent

### What Was Fixed

1. **Separate Error Handling**: Sales and customer emails are now sent independently - if one fails, the other still attempts to send
2. **Detailed Logging**: All email attempts are logged with detailed information
3. **Error Reporting**: The API response now includes which emails succeeded/failed and why

### How to Debug

#### 1. Check PHP Error Logs

Check your PHP error log (usually in `/var/log/apache2/error.log` or `/var/log/php/error.log`):

```bash
tail -f /var/log/apache2/error.log
# or
tail -f /var/log/php/error.log
```

Look for entries like:
- "Attempting to send email to: [email]"
- "Mailgun API Response - HTTP Code: [code]"
- "Failed to send customer email to [email]: [error]"

#### 2. Check Browser Console

After submitting an order, check the browser console (F12) for the API response. It now includes:
- `customerEmailSent`: true/false
- `customerEmailError`: Error message if failed
- `warnings`: Array of warnings about failed emails

#### 3. Test Mailgun API Directly

You can test if Mailgun is working by making a direct API call:

```bash
curl -s --user 'api:key-3e777634c2d522f0ac0d671365685d34' \
  https://api.mailgun.net/v3/educare.school/messages \
  -F from='Olivia Products <info@oliviaproducts.com>' \
  -F to='test@example.com' \
  -F subject='Test Email' \
  -F text='This is a test email'
```

#### 4. Common Issues

**Issue: Invalid Email Address**
- Check if the customer email is valid
- Look for error: "Invalid email address: [email]"

**Issue: Mailgun API Error**
- Check if the Mailgun API key is correct
- Check if the domain is verified in Mailgun
- Look for error: "Mailgun API Error (401/403): [message]"

**Issue: Email Template Generation Failed**
- Check if all required order data is present
- Look for error: "Failed to generate customer email HTML template"

**Issue: cURL Error**
- Check if PHP has cURL enabled: `php -m | grep curl`
- Check if SSL certificates are valid
- Look for error: "cURL Error: [error]"

#### 5. Verify Email Configuration

Check `api/config.php` to ensure:
- `MAILGUN_DOMAIN` is correct
- `MAILGUN_PRIVATE_KEY` is correct
- `MAILGUN_FROM_ADDRESS` is verified in Mailgun
- The domain is verified in your Mailgun account

#### 6. Check Mailgun Dashboard

1. Log into your Mailgun dashboard
2. Go to "Sending" > "Logs"
3. Check if emails are being sent
4. Look for any bounces or failures

### Next Steps

1. **Check the error logs** after submitting an order
2. **Check the browser console** for the API response
3. **Verify Mailgun configuration** in the dashboard
4. **Test with a known good email address** to rule out email validation issues

### Response Format

The API now returns detailed information:

```json
{
  "success": true,
  "message": "Order submitted successfully. Note: Customer confirmation email failed to send",
  "orderId": "ORD-20240101-ABC12345",
  "salesEmailSent": true,
  "salesEmailError": null,
  "customerEmailSent": false,
  "customerEmailError": "Mailgun API Error (401): Forbidden",
  "warnings": ["Customer confirmation email failed to send"]
}
```

This will help identify exactly what's going wrong with the email sending.

