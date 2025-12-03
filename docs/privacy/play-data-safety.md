# Play Data Safety Form - MalloAI

Use this document as a reference when filling out the Google Play Data Safety form in Play Console.

**Last Updated:** December 2024

---

## Section 1: Data Collection Overview

| Question                                                 | Answer                                                   |
| -------------------------------------------------------- | -------------------------------------------------------- |
| Does your app collect or share any user data?            | **Yes**                                                  |
| Is all collected data encrypted in transit?              | **Yes** (Supabase uses HTTPS/TLS)                        |
| Do you provide a way for users to request data deletion? | **Yes** (Settings → Delete Account, 14-day grace period) |

---

## Section 2: Data Types

### Data You COLLECT

| Data Type                        | Collected | Shared | Purpose                                    | Required/Optional |
| -------------------------------- | --------- | ------ | ------------------------------------------ | ----------------- |
| **Email address**                | ✅ Yes    | No     | Account management, authentication         | Required          |
| **Name**                         | ✅ Yes    | No     | Personalization (display name)             | Optional          |
| **User IDs**                     | ✅ Yes    | No     | App functionality (internal user tracking) | Required          |
| **Other user-generated content** | ✅ Yes    | ✅ Yes | Chat messages for AI responses             | Required          |

### Data You DO NOT Collect

- ❌ Phone number
- ❌ Race and ethnicity
- ❌ Political or religious beliefs
- ❌ Sexual orientation
- ❌ Precise location
- ❌ Approximate location
- ❌ Contacts
- ❌ Calendar events
- ❌ Photos and videos (only saved locally, not uploaded)
- ❌ Audio files
- ❌ Files and docs
- ❌ Health information
- ❌ Fitness information
- ❌ Financial information (credit card, bank account)
- ❌ Purchase history
- ❌ Device or other advertising IDs
- ❌ Crash logs
- ❌ Performance diagnostics
- ❌ Other diagnostic data
- ❌ Browsing history
- ❌ Search history (in-app searches are chat prompts, covered above)
- ❌ Installed apps
- ❌ SMS or call log

---

## Section 3: Data Usage Purposes

### Email Address

- ✅ Account management
- ✅ Authentication
- ❌ Analytics
- ❌ Advertising or marketing
- ❌ Fraud prevention, security
- ❌ Personalization

### Name

- ✅ Account management (display name)
- ✅ Personalization
- ❌ Analytics
- ❌ Advertising or marketing

### User-Generated Content (Chat Messages)

- ✅ App functionality (core feature - AI chat)
- ❌ Analytics
- ❌ Advertising or marketing
- ❌ Fraud prevention, security
- ❌ Personalization

---

## Section 4: Data Sharing

### Third Parties That Receive Data

| Data Type                 | Third Party           | Purpose                   | Is this "sharing"?      |
| ------------------------- | --------------------- | ------------------------- | ----------------------- |
| Chat messages (prompts)   | OpenAI                | Generate AI responses     | Yes - Service provider  |
| Chat messages (prompts)   | Anthropic             | Generate AI responses     | Yes - Service provider  |
| Email (Google users)      | Google                | Federated authentication  | Yes - Identity provider |
| Search queries (optional) | Tavily, Bing, SerpAPI | Web search for AI context | Yes - Service provider  |

### Important Notes for Play Console

- Data is shared with **service providers** to provide core app functionality
- Data is **NOT sold** to third parties
- Data is **NOT used for advertising**
- AI providers process data only to generate responses; they do not retain it for their own purposes beyond their stated policies

---

## Section 5: Data Handling Practices

| Practice                    | Answer  | Details                                                                  |
| --------------------------- | ------- | ------------------------------------------------------------------------ |
| Data encrypted in transit   | **Yes** | All API calls use HTTPS/TLS                                              |
| Data encrypted at rest      | **Yes** | Supabase encrypts database at rest                                       |
| Users can request deletion  | **Yes** | Settings → Delete Account (14-day grace period, then permanent deletion) |
| Data deletion is automated  | **Yes** | Cron job processes deletions after 14 days                               |
| Independent security review | **No**  | Not applicable for initial release                                       |

---

## Section 6: Permissions

| Permission             | Purpose                                        | When Requested                       |
| ---------------------- | ---------------------------------------------- | ------------------------------------ |
| Internet               | Core functionality (API calls, authentication) | Always required                      |
| Media Library / Photos | Save AI-generated images to device             | Only when user taps "Save to Photos" |

### Permissions NOT Used

- ❌ Camera
- ❌ Microphone
- ❌ Location
- ❌ Contacts
- ❌ Calendar
- ❌ Phone
- ❌ SMS
- ❌ Storage (beyond media library for saving images)

---

## Quick Reference: Play Console Answers

When filling out the form, select these options:

### "Does your app collect or share user data?"

→ **Yes**

### "Is all of the user data collected by your app encrypted in transit?"

→ **Yes**

### "Do you provide a way for users to request that their data be deleted?"

→ **Yes**

### Data types to select:

1. **Personal info**
   - ✅ Email address
   - ✅ Name
   - ✅ User IDs
2. **Messages**
   - ✅ Other in-app messages (chat with AI)

### For each data type, answer:

- **Is this data collected, shared, or both?** → Collected (and Shared for chat messages)
- **Is this data processed ephemerally?** → No (data is stored)
- **Is this data required or optional?** → Required (except Name which is Optional)
- **Why is this data collected?** → App functionality, Account management

---

## Privacy Policy Link

When prompted for your privacy policy URL, use:

```
https://github.com/Aiden-Hyun/chatgpt-clone/blob/main/docs/privacy/policy.md
```

Or host it at a custom domain if you have one.

---

## Contact Information

For data privacy inquiries (required by Play Store):

- **Email:** [Your support email]
- **Address:** [Your business address if applicable]

---

## Checklist Before Submitting

- [ ] Privacy policy is publicly accessible
- [ ] Delete account feature is working in production build
- [ ] All data types are accurately declared
- [ ] Third-party sharing is disclosed (AI providers)
- [ ] Contact email is valid and monitored
