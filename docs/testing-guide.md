# IntelliCOI Testing Guide

## Local Testing with ngrok

This guide will help you test the complete IntelliCOI flow locally, including webhook processing.

### Prerequisites
- IntelliCOI running locally (`npm run dev`)
- All API keys configured in `.env.local`
- Supabase database set up with schema
- Supabase Storage bucket `coi-documents` created

### Quick Start

1. **Run the ngrok setup script**:
   ```bash
   ./scripts/setup-ngrok.sh
   ```

2. **Update `.env.local`** with the ngrok URL shown by the script

3. **Configure Vectorize.io**:
   - Go to your Vectorize.io dashboard
   - Add the webhook URL shown by the script
   - Save your webhook secret to `.env.local`

4. **Restart the dev server**:
   ```bash
   npm run dev
   ```

### Testing Flow

#### 1. Upload a COI
- Go to http://localhost:3001/dashboard
- Upload a PDF or image of a Certificate of Insurance
- Watch the upload progress

#### 2. Monitor Processing
- Check ngrok interface: http://127.0.0.1:4040
- You should see the webhook request from Vectorize
- Check Supabase dashboard for database updates

#### 3. View Results
- Refresh the dashboard to see processing status
- Once complete, you'll see:
  - Extraction confidence score
  - Compliance status
  - Any coverage gaps found

#### 4. Generate Instructions
- Click "Generate Instructions" for non-compliant vendors
- This uses GPT-4 to create specific fix instructions
- Instructions include both vendor and agent guidance

#### 5. Send to Vendor
- Click "Send to Vendor" to email instructions
- Check your email logs in Resend dashboard
- The email includes a unique vendor portal link

#### 6. Test Vendor Portal
- Copy the vendor portal URL from the email
- Visit the link to see the vendor's view
- Upload an updated COI through the vendor portal

### Troubleshooting

#### Webhook not received
- Check ngrok is running: `ps aux | grep ngrok`
- Verify webhook URL in Vectorize.io matches ngrok URL
- Check webhook secret matches in both places

#### Processing stuck
- Check Vectorize.io dashboard for job status
- Look for errors in Next.js console
- Verify API keys are correct

#### Email not sending
- Check Resend API key is valid
- Verify vendor has email address in database
- Check Resend dashboard for failed sends

### Sample COI Files

For testing, you can use:
- Any PDF with insurance information
- Screenshots of COI documents
- Sample COIs from insurance carriers

The system will extract:
- Coverage types and amounts
- Policy numbers
- Effective/expiration dates
- Carrier information
- Additional insured status

### Expected Results

A successful test will:
1. Upload file to Supabase Storage ✓
2. Create vendor and certificate records ✓
3. Send to Vectorize for processing ✓
4. Receive webhook with extraction data ✓
5. Run gap analysis automatically ✓
6. Show gaps in dashboard ✓
7. Generate fix instructions on demand ✓
8. Send email with portal link ✓
9. Allow vendor to upload updated COI ✓

### Performance Benchmarks

- Upload: < 2 seconds
- Vectorize processing: 15-30 seconds
- Gap analysis: < 1 second
- Instruction generation: 2-5 seconds
- Total time: < 45 seconds

### Next Steps

Once local testing is complete:
1. Deploy to Vercel for production testing
2. Configure production webhook URLs
3. Test with real vendor emails
4. Monitor extraction accuracy
5. Gather feedback from property managers