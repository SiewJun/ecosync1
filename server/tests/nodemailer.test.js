const nodemailer = require('nodemailer');

// Create a mock sendEmail function for testing
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({});
  return transporter.sendMail({ to, subject, html });
};

jest.mock('nodemailer');

describe('Nodemailer', () => {
  it('should send an email', async () => {
    const sendMailMock = jest.fn().mockResolvedValue(true);
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    await sendEmail('test@example.com', 'Test Subject', 'Test Body');
    expect(sendMailMock).toHaveBeenCalled();
  });
});