# Email Setup Guide for Pool Ladder

The join form now supports automatic email sending! Here are three options to enable it:

## Option 1: EmailJS (Recommended - Free)

1. **Sign up at https://www.emailjs.com/**
2. **Create a service** (Gmail, Outlook, etc.)
3. **Create an email template** with these variables:
   - `{{from_name}}` - Applicant name
   - `{{from_email}}` - Applicant email
   - `{{subject}}` - Email subject
   - `{{message}}` - Application details
   - `{{reply_to}}` - Reply-to email

4. **Update the configuration in `js/main.js`:**
   ```javascript
   const SERVICE_ID = 'your_service_id';        // From EmailJS dashboard
   const TEMPLATE_ID = 'your_template_id';      // From EmailJS dashboard  
   const USER_ID = 'your_public_key';           // From EmailJS dashboard
   ```

5. **Template example for EmailJS:**
   ```
   Subject: {{subject}}
   
   {{message}}
   
   Reply to: {{reply_to}}
   ```

## Option 2: Formspree (Simple Alternative)

1. **Sign up at https://formspree.io/**
2. **Create a new form** with target email: `fasteddiespoolleague@proton.me`
3. **Update the endpoint in `js/main.js`:**
   ```javascript
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
   ```
4. **Replace EmailJS call with Formspree:**
   ```javascript
   const emailSent = await sendEmailViaFormspree(emailData);
   ```

## Option 3: Keep Current Mailto (No Setup Required)

The current system falls back to opening the user's email client automatically. This works without any setup but requires users to manually send the email.

## Testing

1. **Fill out the join form** on the website
2. **Check the browser console** for email sending status
3. **Verify emails are received** at the target address

## Current Behavior

- **With EmailJS configured**: Sends email automatically in background
- **Without EmailJS**: Falls back to opening user's email client
- **Error handling**: Shows user-friendly messages for all scenarios

## Email Template Example

```
Subject: Pool Ladder Application - [Name]

New Pool Ladder Application Received:

Name: [Name]
Email: [Email]
Experience Level: [Level]
Additional Message: [Message]

Submitted: [Date/Time]

This application was submitted through The Pool Ladder website.
Please contact the applicant to proceed with league registration.
```

The system is designed to work immediately with mailto fallback, and can be enhanced with automatic sending by configuring any of the above services.