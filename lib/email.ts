import emailjs from '@emailjs/browser';

export interface BookingEmailParams {
  customerName: string;
  customerEmail: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
}

export const sendBookingConfirmationEmail = async (params: BookingEmailParams) => {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error("EmailJS environment variables are missing");
    return;
  }

  try {
    const templateParams = {
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      room_type: params.roomType,
      check_in: new Date(params.checkInDate).toLocaleDateString(),
      check_out: new Date(params.checkOutDate).toLocaleDateString(),
      total_amount: params.totalAmount,
    };

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    
    console.log('SUCCESS! Email sent.', response.status, response.text);
    return response;
  } catch (error: any) {
    console.error('FAILED to send email...', error?.text || error?.message || JSON.stringify(error) || error);
    throw error;
  }
};
