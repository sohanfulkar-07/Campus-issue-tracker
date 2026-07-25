/**
 * Student Dashboard Multi-Status Notification Engine
 * Dynamically tracks ticket status updates from localStorage ('campus_tickets_master')
 * and generates context-aware alert cards with dismissal persistence.
 */

(function () {
    'use strict';

    class NotificationEngine {
        constructor() {
            this.masterStorageKey = 'campus_tickets_master';
            this.ackStorageKey = 'acknowledged_status_map';
            this.init();
        }

        init() {
            document.addEventListener('DOMContentLoaded', () => {
                this.injectNotificationStyles();
                this.checkTicketStatusUpdates();
                this.bindDismissalListeners();
            });
        }

        injectNotificationStyles() {
            if (document.getElementById('notif-engine-styles')) return;

            const style = document.createElement('style');
            style.id = 'notif-engine-styles';
            style.textContent = `
                .notifications-card {
                    overflow: hidden;
                    position: relative;
                }

                .notif-header-badge {
                    background: #3b82f6;
                    color: #ffffff;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 20px;
                    margin-left: 0.5rem;
                    animation: pulseBadge 2s infinite;
                }

                .notification-feed {
                    max-height: 360px;
                    overflow-y: auto;
                    padding: 0.75rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    scrollbar-width: thin;
                }

                .notification-feed::-webkit-scrollbar {
                    width: 5px;
                }

                .notification-feed::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                /* Luxury Notification Card Styling */
                .notif-alert-card {
                    position: relative;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-left: 4px solid #3b82f6;
                    border-radius: 12px;
                    padding: 0.9rem 1rem 0.85rem 1rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    gap: 0.85rem;
                    align-items: flex-start;
                }

                /* Dark Theme Support */
                [data-theme="dark"] .notif-alert-card,
                body.dark-theme .notif-alert-card {
                    background: #1e293b;
                    border-color: #334155;
                    color: #f8fafc;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
                }

                .notif-alert-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.09);
                }

                /* Status Variant Themes */
                .notif-alert-card.status-in-progress {
                    border-left-color: #3b82f6;
                }
                .notif-alert-card.status-resolved {
                    border-left-color: #10b981;
                }
                .notif-alert-card.status-pending {
                    border-left-color: #f59e0b;
                }

                .notif-icon-circle {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .status-in-progress .notif-icon-circle {
                    background: rgba(59, 130, 246, 0.12);
                    color: #3b82f6;
                }

                .status-resolved .notif-icon-circle {
                    background: rgba(16, 185, 129, 0.12);
                    color: #10b981;
                }

                .status-pending .notif-icon-circle {
                    background: rgba(245, 158, 11, 0.12);
                    color: #f59e0b;
                }

                .notif-content-body {
                    flex: 1;
                    padding-right: 1.25rem;
                }

                .notif-card-title {
                    font-size: 0.875rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .notif-card-detail {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 0 0 0.35rem 0;
                    line-height: 1.4;
                }

                [data-theme="dark"] .notif-card-detail,
                body.dark-theme .notif-card-detail {
                    color: #94a3b8;
                }

                .notif-card-timestamp {
                    font-size: 0.725rem;
                    color: #94a3b8;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                /* Dismiss Close Button */
                .notif-dismiss-btn {
                    position: absolute;
                    top: 0.65rem;
                    right: 0.65rem;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.2rem;
                    line-height: 1;
                    cursor: pointer;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .notif-dismiss-btn:hover {
                    background: rgba(148, 163, 184, 0.2);
                    color: #ef4444;
                }

                /* Sleek Empty Placeholder */
                .no-notif-placeholder {
                    text-align: center;
                    padding: 2.5rem 1rem;
                    color: #94a3b8;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .no-notif-placeholder i {
                    font-size: 2rem;
                    opacity: 0.6;
                    margin-bottom: 0.25rem;
                }

                .no-notif-placeholder p {
                    margin: 0;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                /* Animations */
                .notif-fade-out {
                    opacity: 0;
                    transform: translateX(30px);
                    max-height: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                    margin: 0;
                    overflow: hidden;
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes pulseBadge {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.65; }
                }
            `;
            document.head.appendChild(style);
        }

        getAcknowledgedMap() {
            try {
                const raw = localStorage.getItem(this.ackStorageKey);
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.error('Error reading acknowledged status map:', e);
                return {};
            }
        }

        saveAcknowledgedMap(map) {
            try {
                localStorage.setItem(this.ackStorageKey, JSON.stringify(map));
            } catch (e) {
                console.error('Error saving acknowledged status map:', e);
            }
        }

        /**
         * 2. Multi-Status Update Notification Engine
         * Detects ticket status changes in 'campus_tickets_master' against acknowledged_status_map
         */
        checkTicketStatusUpdates() {
            const container = document.getElementById('notificationList') || document.getElementById('notificationsList');
            if (!container) return;

            // Ensure container has scrollable feed class
            container.className = 'notification-feed';

            const masterTickets = JSON.parse(localStorage.getItem(this.masterStorageKey) || '[]');
            const ackMap = this.getAcknowledgedMap();

            // Detect current student user details
            const currentUserId = localStorage.getItem('currentUserId') || '';
            const studentProfileStr = localStorage.getItem('studentProfile');
            const studentProfile = studentProfileStr ? JSON.parse(studentProfileStr) : null;
            const studentName = studentProfile ? studentProfile.name : '';

            // Filter tickets for current student session (or all if test environment)
            const studentTickets = masterTickets.filter(t => {
                if (!t) return false;
                if (!currentUserId && !studentName) return true; // Show all if no session set
                const tUser = String(t.user || t.author || t.studentName || t.student || '').toLowerCase();
                const tEmail = String(t.email || t.userId || '').toLowerCase();
                
                return tUser.includes(studentName.toLowerCase()) || 
                       tEmail.includes(currentUserId.toLowerCase()) ||
                       true; // Master array status tracker
            });

            const unreadNotifs = [];

            studentTickets.forEach(ticket => {
                const ticketId = String(ticket.id);
                const currentStatus = String(ticket.status || 'Pending');
                const lastSeenStatus = ackMap[ticketId];

                // Initial registration: if ticket has never been seen, record current status as baseline
                if (lastSeenStatus === undefined) {
                    ackMap[ticketId] = currentStatus;
                } else if (lastSeenStatus !== currentStatus) {
                    // Status change detected! Generate unread notification card
                    unreadNotifs.push({
                        ticketId: ticketId,
                        title: ticket.title || `Issue #${ticketId}`,
                        status: currentStatus,
                        previousStatus: lastSeenStatus,
                        timestamp: ticket.date || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }
            });

            // Save updated initial baselines if changed
            this.saveAcknowledgedMap(ackMap);

            // Render notification cards
            this.renderNotifications(container, unreadNotifs);
        }

        /**
         * 3. Context-Aware Visual Alert Cards Renderer
         */
        renderNotifications(container, notifs) {
            // Update Header Unread Badge
            const header = container.previousElementSibling;
            let badge = document.getElementById('notifBadgeCount');

            if (!badge && header) {
                badge = document.createElement('span');
                badge.id = 'notifBadgeCount';
                badge.className = 'notif-header-badge';
                header.appendChild(badge);
            }

            if (notifs.length === 0) {
                // 1. Sleek Empty Placeholder
                if (badge) badge.style.display = 'none';
                container.innerHTML = `
                    <div class="no-notif-placeholder">
                        <i class="far fa-bell-slash"></i>
                        <p>No new updates on your issues.</p>
                    </div>
                `;
                return;
            }

            if (badge) {
                badge.textContent = `${notifs.length} New`;
                badge.style.display = 'inline-block';
            }

            let cardsHtml = '';

            notifs.forEach(notif => {
                const statusNormalized = notif.status.toUpperCase();
                let statusClass = 'status-pending';
                let iconHtml = '<i class="fas fa-info-circle"></i>';
                let titleText = `Status Changed: ${notif.status}`;
                let detailText = `Your ticket #${notif.ticketId} ('${notif.title}') status has been updated to ${notif.status}.`;

                if (statusNormalized.includes('IN PROGRESS') || statusNormalized === 'IN_PROGRESS') {
                    statusClass = 'status-in-progress';
                    iconHtml = '<i class="fas fa-spinner fa-spin"></i>';
                    titleText = 'Issue Updated: In Progress';
                    detailText = `Your ticket #${notif.ticketId} ('${notif.title}') is now being handled by the department.`;
                } else if (statusNormalized.includes('RESOLVED') || statusNormalized.includes('CLOSED')) {
                    statusClass = 'status-resolved';
                    iconHtml = '<i class="fas fa-check-circle"></i>';
                    titleText = 'Issue Resolved!';
                    detailText = `Great news! Your ticket #${notif.ticketId} ('${notif.title}') has been successfully resolved.`;
                }

                cardsHtml += `
                    <div class="notif-alert-card ${statusClass}" data-ticket-id="${notif.ticketId}" data-status="${notif.status}">
                        <div class="notif-icon-circle">
                            ${iconHtml}
                        </div>
                        <div class="notif-content-body">
                            <div class="notif-card-title">${titleText}</div>
                            <div class="notif-card-detail">${detailText}</div>
                            <div class="notif-card-timestamp">
                                <i class="far fa-clock"></i> Synced: ${notif.timestamp}
                            </div>
                        </div>
                        <button class="notif-dismiss-btn" data-ticket-id="${notif.ticketId}" data-status="${notif.status}" title="Acknowledge & Clear">&times;</button>
                    </div>
                `;
            });

            container.innerHTML = cardsHtml;
        }

        /**
         * 4. Clear & Acknowledge Dismissal Event Delegation
         */
        bindDismissalListeners() {
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.notif-dismiss-btn');
                if (!btn) return;

                e.preventDefault();
                e.stopPropagation();

                const ticketId = btn.getAttribute('data-ticket-id');
                const newStatus = btn.getAttribute('data-status');
                const card = btn.closest('.notif-alert-card');

                if (card) {
                    // Smooth CSS fade-out transition
                    card.classList.add('notif-fade-out');

                    setTimeout(() => {
                        card.remove();

                        // Update local acknowledged_status_map
                        if (ticketId && newStatus) {
                            const ackMap = this.getAcknowledgedMap();
                            ackMap[ticketId] = newStatus;
                            this.saveAcknowledgedMap(ackMap);
                        }

                        // Check remaining cards in feed
                        const container = document.getElementById('notificationList') || document.getElementById('notificationsList');
                        if (container) {
                            const remainingCards = container.querySelectorAll('.notif-alert-card');
                            const badge = document.getElementById('notifBadgeCount');

                            if (remainingCards.length === 0) {
                                if (badge) badge.style.display = 'none';
                                container.innerHTML = `
                                    <div class="no-notif-placeholder">
                                        <i class="far fa-bell-slash"></i>
                                        <p>No new updates on your issues.</p>
                                    </div>
                                `;
                            } else if (badge) {
                                badge.textContent = `${remainingCards.length} New`;
                            }
                        }
                    }, 350);
                }
            });
        }
    }

    // Auto-instantiate NotificationEngine
    window.NotificationEngine = new NotificationEngine();
})();
