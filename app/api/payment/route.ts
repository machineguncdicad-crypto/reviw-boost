import { NextResponse } from "next/server";
// @ts-ignore
import Midtrans from "midtrans-client"; // 👈 Garis merah ilang berkat @ts-ignore
import { v4 as uuidv4 } from 'uuid';

const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(request: Request) {
    // 1. Terima data dari Frontend
    const { plan, price } = await request.json();
    
    // 2. Bikin Order ID unik
    const orderId = `ORDER-${uuidv4()}`;

    // 3. Siapkan Parameter Midtrans
    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: price
        },
        credit_card: { secure: true },
        item_details: [{
            id: plan,
            price: price,
            quantity: 1,
            name: `Upgrade Paket ${plan}`
        }]
    };

    // 4. Minta Token Transaksi
    try {
        const token = await snap.createTransaction(parameter);
        return NextResponse.json(token);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}