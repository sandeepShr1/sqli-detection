const axios = require("axios");
const db = require('../db/models');
const AttackLog = db.attack_logs;
const Notifications = db.notifications;
const { sseClients } = require("../controller/notificationControlller");
const sendMail = require("../utils/sendEmail")

// Exclude pagination, filtering, and sorting parameters
const EXCLUDED_QUERY_KEYS = [
      'page', 'limit', 'offset', 'skip', 'take',
      'sort', 'sortBy', 'order', 'orderBy',
      'price[gte]', 'price[lte]', 'price[gt]', 'price[lt]',
      'ratings[gte]', 'ratings[lte]', 'ratings[gt]', 'ratings[lt]',
      'rating[gte]', 'rating[lte]', 'rating[gt]', 'rating[lt]'
];

async function sqlDetectionMiddleware(req, res, next) {
      // console.log({ REQUEST: req.query, BODY: req.body })
      try {
            const fieldsToScan = [];

            // Scan query parameters (exclude pagination/filters)
            if (req.query) {
                  for (const key in req.query) {
                        // Skip excluded parameters
                        if (EXCLUDED_QUERY_KEYS.includes(key)) continue;

                        const value = req.query[key];

                        if (
                              typeof value === "string" &&
                              value.trim().length > 2 &&
                              !/^\d+$/.test(value) // ignore pure numbers
                        ) {
                              fieldsToScan.push({
                                    field: `query.${key}`,
                                    value: value.trim()
                              });
                        }
                  }
            }

            // Scan all body fields
            if (req.body) {
                  for (const key in req.body) {
                        const value = req.body[key];

                        if (
                              typeof value === "string" &&
                              value.trim().length > 2 &&
                              !/^\d+$/.test(value) // ignore pure numbers
                        ) {
                              fieldsToScan.push({
                                    field: `body.${key}`,
                                    value: value.trim()
                              });
                        }
                  }
            }

            // Nothing meaningful → skip
            if (fieldsToScan.length === 0) {
                  return next();
            }

            // Scan each value independently
            for (const item of fieldsToScan) {
                  const response = await axios.post(
                        "http://127.0.0.1:5000/detect",
                        { input: item.value }
                  );

                  if (response.data?.isAttack) {
                        await AttackLog.create({
                              payload: item.value,              // only malicious input
                              field: item.field,                // where it came from
                              confidence: response.data.confidence,
                              attackType: response.data.attackType,
                              ip: req.ip || req.connection.remoteAddress,
                              route: req.originalUrl,
                              method: req.method,
                              userId: req.user ? req.user.id : null,
                              userAgent: req.headers['user-agent']
                        });

                        // Create notification for the user (or admin if no user)
                        const notificationUserId = req.user ? req.user.id : 2; // Default to admin user ID 1
                        const notificationMessage = {
                              attackType: response.data.attackType, detected: req.originalUrl,
                              field: item.field, Confidence: response.data.confidence,
                              ip: req.ip || req.connection.remoteAddress,
                              payload: item.value
                        };

                        await Notifications.create({
                              userId: 2,
                              message: JSON.stringify(notificationMessage),
                              type: 'SECURITY_ALERT',
                              read: false
                        });

                        // Broadcast SSE notification to all connected admin clients
                        if (sseClients && sseClients.length > 0) {
                              console.log(`🔔 Broadcasting SQL injection alert to ${sseClients.length} connected admin(s)`);

                              const eventData = JSON.stringify({
                                    type: 'SECURITY_ALERT',
                                    attackType: response.data.attackType,
                                    message: notificationMessage,
                                    payload: item.value,
                                    field: item.field,
                                    confidence: response.data.confidence,
                                    ip: req.ip || req.connection.remoteAddress,
                                    route: req.originalUrl,
                                    method: req.method,
                                    userId: 2,
                                    timestamp: new Date().toISOString()
                              });

                              sseClients.forEach((client, index) => {
                                    try {
                                          client.res.write(`data: ${eventData}\n\n`);
                                          console.log(`✅ SSE sent to client ${client.id}`);
                                    } catch (sseError) {
                                          console.error(`❌ SSE Send Error for client ${client.id}:`, sseError.message);
                                          // Remove dead client
                                          sseClients.splice(index, 1);
                                    }
                              });
                        } else {
                              console.log('⚠️ No admin clients connected to receive SSE notification');
                        }

                        // Send email notification (non-blocking)
                        if (response.data.confidence >= 0.8 && process.env.SMTP_ADMIN_MAIL) {
                              sendMail({
                                    email: process.env.SMTP_ADMIN_MAIL,
                                    subject: `🚨 ${response.data.attackType} Detected `,
                                    message: `
                                          Attack Type: ${response.data.attackType}
                                          Payload: ${item.value}
                                          Confidence: ${response.data.confidence}
                                          IP: ${req.ip || req.connection.remoteAddress}
                                          Route: ${req.originalUrl}
                                          `,
                              }).catch(err => console.error('Email send error:', err));
                        }

                        // BLOCK THE REQUEST - Stop execution immediately
                        console.log(`🚫 BLOCKING REQUEST: Attack detected in ${item.field}`);
                        return res.status(403).json({
                              success: false,
                              message: "Malicious input detected. Request blocked.",
                              attackType: response.data.attackType,
                              field: item.field,
                              confidence: response.data.confidence
                        });
                  }
            }

            next();
      } catch (error) {
            console.error('SQL Detection Error:', error.message);
            // Fail-open (recommended for ML services)
            next();
      }
}

module.exports = sqlDetectionMiddleware;
