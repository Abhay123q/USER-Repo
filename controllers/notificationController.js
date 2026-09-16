const nodemailer = require('nodemailer');
const db = require('../config/db');
const userModel = require('../models/userModel');

/**
 * Send an email notification to a user and log it to the database.
 * Works in 2 modes:
 *   1. Gmail configured (SMTP_USER + SMTP_PASS) → sends real email
 *   2. No Gmail → saves notification to DB only, shows success
 */
exports.sendNotification = async (req, res) => {
    try {
        const { userId, subject, message } = req.body;

        if (!userId || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, subject, and message are required'
            });
        }

        // Look up user
        const user = await userModel.getById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let emailResult = null;
        let emailSent = false;
        let previewUrl = null;
        const gmailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

        // Try sending email if Gmail is configured
        if (gmailConfigured) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                // Beautiful HTML email
                const htmlBody = '<div style="font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' +
                    '<div style="background: #4F46E5; padding: 28px 32px;">' +
                        '<h1 style="color: #ffffff; margin: 0; font-size: 22px;">UserDash Notification</h1>' +
                    '</div>' +
                    '<div style="padding: 32px;">' +
                        '<p style="color: #1E293B; font-size: 16px; margin-top: 0;">Hi <strong>' + user.first_name + ' ' + user.last_name + '</strong>,</p>' +
                        '<div style="background: #F8FAFC; border-left: 4px solid #4F46E5; padding: 16px 20px; border-radius: 4px; margin: 20px 0;">' +
                            '<p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.6;">' + message.replace(/\n/g, '<br>') + '</p>' +
                        '</div>' +
                        '<p style="color: #64748B; font-size: 13px; margin-bottom: 0; border-top: 1px solid #E2E8F0; padding-top: 16px;">This email was sent via <strong>UserDash</strong>.</p>' +
                    '</div>' +
                '</div>';

                const info = await transporter.sendMail({
                    from: '"UserDash" <' + process.env.SMTP_USER + '>',
                    to: user.email,
                    subject: subject,
                    text: message,
                    html: htmlBody
                });

                emailResult = info.messageId;
                emailSent = true;
                console.log('Email sent to', user.email, 'messageId:', info.messageId);
            } catch (emailError) {
                console.error('Gmail send failed:', emailError.message);
                // Don't return error — still save notification to DB
            }
        }

        // Always save notification to database
        const insertQuery = 'INSERT INTO notifications (user_id, subject, message, sent_at) VALUES (?, ?, ?, NOW())';
        await db.execute(insertQuery, [userId, subject, message]);

        // Build response message
        let responseMessage = '';
        if (emailSent) {
            responseMessage = 'Email sent successfully to ' + user.email;
        } else if (gmailConfigured) {
            responseMessage = 'Notification saved. Email delivery failed — check Gmail App Password.';
        } else {
            responseMessage = 'Notification saved to ' + user.first_name + ' ' + user.last_name + '. Configure Gmail in .env to also send emails.';
        }

        return res.status(200).json({
            success: true,
            data: {
                messageId: emailResult,
                sentTo: user.email,
                emailSent: emailSent,
                previewUrl: previewUrl
            },
            message: responseMessage
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send notification: ' + error.message
        });
    }
};

/**
 * Get notification history (latest 50).
 */
exports.getHistory = async (req, res) => {
    try {
        const query = `
            SELECT n.id, n.user_id, n.subject, n.message, n.sent_at, 
                   u.first_name, u.last_name, u.email
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            ORDER BY n.sent_at DESC
            LIMIT 50
        `;
        
        const [rows] = await db.execute(query);
        
        return res.status(200).json({
            success: true,
            data: rows,
            message: 'Notification history retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching notification history:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
