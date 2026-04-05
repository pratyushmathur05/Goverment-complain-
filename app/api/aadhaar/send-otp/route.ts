import { NextRequest, NextResponse } from 'next/server';
import { validateAadhaar } from '@/app/lib/aadhaar';

// ─── Shared global OTP store ──────────────────────────────────────────────────
interface OtpRecord {
  otp: string;
  phone: string;        // the mobile number OTP was sent to
  expiresAt: number;
  attempts: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __aadhaarOtpStore: Map<string, OtpRecord> | undefined;
}
if (!global.__aadhaarOtpStore) {
  global.__aadhaarOtpStore = new Map<string, OtpRecord>();
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of global.__aadhaarOtpStore!.entries()) {
      if (record.expiresAt < now) global.__aadhaarOtpStore!.delete(key);
    }
  }, 5 * 60 * 1000);
}
const otpStore = global.__aadhaarOtpStore;

// ─── Rate limiting: max 3 OTP requests per Aadhaar per 10 min ───────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

// ─── Validate Indian mobile number ───────────────────────────────────────────
function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

// ─── Generate 6-digit OTP ────────────────────────────────────────────────────
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send SMS via Fast2SMS ────────────────────────────────────────────────────
async function sendSmsViаFast2SMS(phone: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === 'your-fast2sms-api-key-here') {
    // Development fallback: just log the OTP
    console.log(`\n[Aadhaar OTP DEV] → Mobile: ${phone} | OTP: ${otp}\n`);
    return { ok: true };
  }

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
      }),
    });

    const data = await res.json() as { return: boolean; message?: string[] };

    if (!data.return) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : 'SMS delivery failed';
      return { ok: false, error: msg };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to connect to SMS gateway.' };
  }
}

// ─── POST /api/aadhaar/send-otp ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { aadhaar?: string; phone?: string };
    const rawAadhaar = (body.aadhaar ?? '').replace(/\s/g, '');
    const phone      = (body.phone  ?? '').replace(/\s/g, '');

    // 1. Validate Aadhaar (Verhoeff checksum)
    if (!validateAadhaar(rawAadhaar)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Aadhaar number. Please check and try again.' },
        { status: 400 }
      );
    }

    // 2. Validate mobile number
    if (!isValidIndianMobile(phone)) {
      return NextResponse.json(
        { success: false, message: 'Enter a valid 10-digit Aadhaar-linked mobile number.' },
        { status: 400 }
      );
    }

    // 3. Rate limit check
    if (isRateLimited(rawAadhaar)) {
      return NextResponse.json(
        { success: false, message: 'Too many OTP requests. Please wait 10 minutes and try again.' },
        { status: 429 }
      );
    }

    // 4. Generate OTP
    const otp = generateOtp();

    // 5. Send SMS
    const smsResult = await sendSmsViаFast2SMS(phone, otp);
    if (!smsResult.ok) {
      return NextResponse.json(
        { success: false, message: `SMS failed: ${smsResult.error}` },
        { status: 502 }
      );
    }

    // 6. Store OTP server-side (with phone for audit)
    otpStore.set(rawAadhaar, {
      otp,
      phone,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    // Return masked mobile for display (e.g. ****6789)
    const maskedMobile = `+91 ****${phone.slice(-4)}`;

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${maskedMobile}`,
      maskedMobile,
      expiresInSeconds: 600,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
