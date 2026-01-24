import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { EventSourcePolyfill } from 'event-source-polyfill';
import * as actionTypes from '../redux/constants/notificationConstants';

const useSSENotifications = (isAdmin = false) => {
      const dispatch = useDispatch();
      const eventSourceRef = useRef(null);
      const reconnectTimeoutRef = useRef(null);
      const reconnectAttempts = useRef(0);
      const maxReconnectAttempts = 5;
      console.log({ isAdmin })
      const baseURL = process.env.REACT_APP_API_URL

      useEffect(() => {
            // Only connect SSE if user is admin
            if (!isAdmin) {
                  return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                  console.log('No token found, skipping SSE connection');
                  return;
            }

            const connectSSE = () => {
                  try {
                        console.log('Attempting to connect to SSE...');

                        // Close existing connection if any
                        if (eventSourceRef.current) {
                              eventSourceRef.current.close();
                        }

                        // Create new SSE connection with Authorization header
                        const url = `${baseURL}/api/v1/notifications/admin/events`;
                        console.log('🔗 Connecting to SSE URL:', url);

                        eventSourceRef.current = new EventSourcePolyfill(url, {
                              headers: {
                                    'Authorization': `Bearer ${token}`
                              },
                              heartbeatTimeout: 120000, // 2 minutes
                              withCredentials: false
                        });

                        eventSourceRef.current.onopen = () => {
                              console.log('✅ SSE Connected successfully');
                              console.log('📊 Connection readyState:', eventSourceRef.current.readyState);
                              reconnectAttempts.current = 0;
                              dispatch({
                                    type: actionTypes.SSE_CONNECTION_STATUS,
                                    payload: true
                              });
                        };

                        eventSourceRef.current.onmessage = (event) => {
                              try {
                                    const data = JSON.parse(event.data);
                                    console.log('📨 SSE Event received:', data);

                                    // Handle different event types
                                    if (data.type === 'CONNECTION') {
                                          console.log('🔗 Connection established:', data.message);
                                    } else if (data.type === 'SECURITY_ALERT') {
                                          // Dispatch to Redux store
                                          dispatch({
                                                type: actionTypes.SSE_NOTIFICATION_RECEIVED,
                                                payload: data
                                          });

                                          // Show browser notification if permitted
                                          if ('Notification' in window && Notification.permission === 'granted') {
                                                new Notification('🚨 Security Alert', {
                                                      body: `${data.attackType} detected on ${data.route}`,
                                                      icon: '/favicon.ico',
                                                      badge: '/favicon.ico',
                                                      tag: 'security-alert',
                                                      requireInteraction: true
                                                });
                                          }

                                          // Play sound notification
                                          playNotificationSound();
                                    }
                              } catch (error) {
                                    console.error('Error parsing SSE event:', error);
                              }
                        };

                        eventSourceRef.current.onerror = (error) => {
                              console.error('❌ SSE Error:', error);
                              console.error('📊 Error readyState:', eventSourceRef.current?.readyState);
                              console.error('📊 Error type:', error.type);

                              // ReadyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
                              if (eventSourceRef.current?.readyState === 2) {
                                    console.error('🔴 Connection closed by server. Check backend logs and authentication.');
                              }

                              dispatch({
                                    type: actionTypes.SSE_CONNECTION_STATUS,
                                    payload: false
                              });

                              // Close the connection
                              if (eventSourceRef.current) {
                                    eventSourceRef.current.close();
                                    eventSourceRef.current = null;
                              }

                              // Attempt to reconnect with exponential backoff
                              if (reconnectAttempts.current < maxReconnectAttempts) {
                                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                                    console.log(`🔄 Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

                                    reconnectTimeoutRef.current = setTimeout(() => {
                                          reconnectAttempts.current++;
                                          connectSSE();
                                    }, delay);
                              } else {
                                    console.error('Max reconnection attempts reached. Please refresh the page.');
                              }
                        };

                  } catch (error) {
                        console.error('Failed to create SSE connection:', error);
                  }
            };

            // Initial connection
            connectSSE();

            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                  Notification.requestPermission().then(permission => {
                        console.log('Notification permission:', permission);
                  });
            }

            // Cleanup function
            return () => {
                  console.log('Cleaning up SSE connection...');

                  if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                  }

                  if (eventSourceRef.current) {
                        eventSourceRef.current.close();
                        eventSourceRef.current = null;
                  }

                  dispatch({
                        type: actionTypes.SSE_CONNECTION_STATUS,
                        payload: false
                  });
            };
      }, [isAdmin, dispatch]);

      const markAsRead = () => {
            dispatch({
                  type: actionTypes.SSE_NOTIFICATION_MARK_READ
            });
      };

      const clearAll = () => {
            dispatch({
                  type: actionTypes.SSE_NOTIFICATION_CLEAR_ALL
            });
      };

      return {
            markAsRead,
            clearAll
      };
};

// Helper function to play notification sound
const playNotificationSound = () => {
      try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
            console.error('Error playing notification sound:', error);
      }
};

export default useSSENotifications;
