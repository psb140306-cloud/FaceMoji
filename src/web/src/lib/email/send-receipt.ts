// 결제 영수증 이메일 발송 (Resend API)

interface ReceiptData {
  to: string;
  orderId: string;
  amount: number;
  itemName: string;
  paymentMethod: string;
  paidAt: string;
  receiptUrl?: string;
}

export async function sendReceiptEmail(data: ReceiptData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping receipt email");
    return;
  }

  const html = buildReceiptHtml(data);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "FaceMoji <noreply@facemoji.app>",
      to: data.to,
      subject: `[FaceMoji] 결제 영수증 - ${data.orderId}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Failed to send receipt email:", await res.text());
  }
}

function buildReceiptHtml(data: ReceiptData): string {
  const date = new Date(data.paidAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:20px;margin:0 0 4px;color:#111;">
        <span style="color:#6366f1;">Face</span>Moji
      </h1>
      <p style="color:#666;font-size:14px;margin:0 0 24px;">결제 영수증</p>

      <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">

      <table style="width:100%;font-size:14px;color:#333;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;color:#888;">주문번호</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#888;">상품</td>
          <td style="padding:8px 0;text-align:right;">${data.itemName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#888;">결제수단</td>
          <td style="padding:8px 0;text-align:right;">${data.paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#888;">결제일시</td>
          <td style="padding:8px 0;text-align:right;">${date}</td>
        </tr>
      </table>

      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:16px;font-weight:700;color:#111;">결제 금액</span>
        <span style="font-size:24px;font-weight:700;color:#6366f1;">${data.amount.toLocaleString()}원</span>
      </div>

      ${
        data.receiptUrl
          ? `<a href="${data.receiptUrl}" style="display:block;margin-top:24px;text-align:center;padding:12px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">영수증 확인</a>`
          : ""
      }

      <p style="margin-top:24px;font-size:12px;color:#999;text-align:center;">
        이 메일은 FaceMoji 결제 완료 시 자동 발송됩니다.<br>
        문의: support@facemoji.app
      </p>
    </div>
  </div>
</body>
</html>`;
}
