import { NextRequest, NextResponse } from 'next/server';
import { validateAadhaar } from '@/app/lib/aadhaar';

// ─── Import shared OTP store ──────────────────────────────────────────────────
// We import the store from the send-otp route to share the same Map instance.
// In production, this should be Redis or a DB.
interface OtpRecord {
  otp: string;
  phone: string;       // mobile number OTP was sent to
  expiresAt: number;
  attempts: number;
}

// Re-declare the store here — Next.js module caching ensures both routes
// share the same Map instance within a single server process.
declare global {
  // eslint-disable-next-line no-var
  var __aadhaarOtpStore: Map<string, OtpRecord> | undefined;
}
if (!global.__aadhaarOtpStore) {
  global.__aadhaarOtpStore = new Map<string, OtpRecord>();
}
const otpStore = global.__aadhaarOtpStore;

// ─── POST /api/aadhaar/verify-otp ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { aadhaar?: string; otp?: string };
    const rawAadhaar = (body.aadhaar ?? '').replace(/\s/g, '');
    const enteredOtp = (body.otp ?? '').trim();

    // 1. Structural validation
    if (!validateAadhaar(rawAadhaar)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Aadhaar number.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be 6 digits.' },
        { status: 400 }
      );
    }

    // 2. Look up stored OTP
    const record = otpStore!.get(rawAadhaar);

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 3. Expiry check
    if (Date.now() > record.expiresAt) {
      otpStore!.delete(rawAadhaar);
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 4. Attempt limit (max 5 wrong tries)
    if (record.attempts >= 5) {
      otpStore!.delete(rawAadhaar);
      return NextResponse.json(
        { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // 5. OTP match
    if (enteredOtp !== record.otp) {
      record.attempts++;
      const remaining = 5 - record.attempts;
      return NextResponse.json(
        { success: false, message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // 6. Success — consume the OTP (one-time use)
    otpStore!.delete(rawAadhaar);

    // ─── Production UIDAI Integration Point ──────────────────────────────────
    // When using real UIDAI OTP, verify here with the txnId returned by UIDAI.
    // The OTP is entered by the user and verified against UIDAI's servers,
    // not our store. Remove the above OTP store logic in that case.
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      message: 'Aadhaar verified successfully.',
      // In production, UIDAI returns e-KYC data here (name, DOB, address)
      // For now we return minimal proof-of-verification data
      aadhaarSuffix: rawAadhaar.slice(-4),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
