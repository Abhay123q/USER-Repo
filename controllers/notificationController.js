const nodemailer = require('nodemailer');
const db = require('../config/db');
const userModel = require('../models/userModel');

/**
 * Send an email notification to a user and log it to the database.
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

        // Setup Nodemailer transport
        let transporter;
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            // Fallback to test account
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }

        // Send email
        const mailOptions = {
            from: process.env.MAIL_FROM || '"User Management" <noreply@example.com>',
            to: user.email,
            subject: subject,
            text: message
        };

        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);

        // Save notification record to notifications table
        const insertQuery = `
            INSERT INTO notifications (user_id, subject, message, sent_at) 
            VALUES (?, ?, ?, NOW())
        `;
        await db.execute(insertQuery, [userId, subject, message]);

        return res.status(200).json({
            success: true,
            data: {
                messageId: info.messageId,
                previewUrl: previewUrl || null
            },
            message: 'Notification sent successfully'
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending notification'
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
