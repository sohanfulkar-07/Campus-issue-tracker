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
            if (document.getElementById('faculty-notif-engine-styles')) return;

            const style = document.createElement('style');
            style.id = 'faculty-notif-engine-styles';
            style.textContent = `
                .notifications-card {
                    overflow: hidden;
                    position: relative;
                }

                .notif-header-badge {
                    background: #2563eb;
                    color: #ffffff;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 20px;
                    margin-left: 0.5rem;
                    animation: pulseBadge 2s infinite;
                }

                .notification-feed {
                    max-height: 440px;
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

                .notif-alert-card {
                    position: relative;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-left: 4px solid #2563eb;
                    border-radius: 12px;
                    padding: 0.9rem 1rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    gap: 0.85rem;
                    align-items: flex-start;
                }

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

                .notif-alert-card.status-pending {
                    border-left-color: #f59e0b;
                }
                .notif-alert-card.status-assigned {
                    border-left-color: #8b5cf6;
                }
                .notif-alert-card.status-in-progress {
                    border-left-color: #3b82f6;
                }
                .notif-alert-card.status-resolved {
                    border-left-color: #10b981;
                }

                .notif-icon-circle {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                    background: #f1f5f9;
                }

                .status-pending .notif-icon-circle {
                    background: rgba(245, 158, 11, 0.12);
                }
                .status-assigned .notif-icon-circle {
                    background: rgba(139, 92, 246, 0.12);
                }
                .status-in-progress .notif-icon-circle {
                    background: rgba(59, 130, 246, 0.12);
                }
                .status-resolved .notif-icon-circle {
                    background: rgba(16, 185, 129, 0.12);
                }

                .notif-content-body {
                    flex: 1;
                    padding-right: 1.25rem;
                }

                .notif-card-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #2563eb;
                    margin: 0 0 0.2rem 0;
                }

                .notif-card-detail {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 0.35rem 0;
                    line-height: 1.4;
                }

                [data-theme="dark"] .notif-card-detail,
                body.dark-theme .notif-card-detail {
                    color: #f8fafc;
                }

                .notif-card-timestamp {
                    font-size: 0.725rem;
                    color: #94a3b8;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }

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
            } catch (error) {
                console.error('Error reading acknowledged status map:', error);
                return {};
            }
        }

        saveAcknowledgedMap(map) {
            try {
                localStorage.setItem(this.ackStorageKey, JSON.stringify(map));
            } catch (error) {
                console.error('Error saving acknowledged status map:', error);
            }
        }

        getNotificationState(ticket) {
            const status = String(ticket.status || '').toUpperCase().trim();
            const department = String(ticket.department || ticket.assignedTo || ticket.assigned || '').trim();
            const hasAssignment = Boolean(ticket.assignedTo || ticket.department || ticket.assigned || ticket.assignedFaculty || ticket.assignedAdmin);

            if (status.includes('RESOLVED') || status.includes('CLOSED')) {
                return {
                    icon: '✅',
                    message: 'Your complaint has been Resolved.',
                    statusClass: 'status-resolved'
                };
            }

            if (status.includes('PROGRESS') || status === 'IN_PROGRESS') {
                return {
                    icon: '🔄',
                    message: 'Complaint status changed to In Progress.',
                    statusClass: 'status-in-progress'
                };
            }

            if (status.includes('ASSIGNED') || hasAssignment) {
                const assignedText = department ? `Your complaint has been assigned to the ${department}.` : 'Your complaint has been assigned to the Maintenance Department.';
                return {
                    icon: '👨‍🔧',
                    message: assignedText,
                    statusClass: 'status-assigned'
                };
            }

            return {
                icon: '🔔',
                message: `Your complaint #${ticket.id || 'ISSUE-243428'} has been submitted.`,
                statusClass: 'status-pending'
            };
        }

        checkTicketStatusUpdates() {
            const container = document.getElementById('notificationList') || document.getElementById('notificationsList');
            if (!container) return;

            container.className = 'notification-feed';

            const masterTickets = JSON.parse(localStorage.getItem(this.masterStorageKey) || '[]');
            const notifItems = masterTickets
                .filter(Boolean)
                .map(ticket => {
                    const state = this.getNotificationState(ticket);
                    return {
                        ticketId: String(ticket.id || ''),
                        title: ticket.title || `Issue #${ticket.id || '243428'}`,
                        status: String(ticket.status || 'Pending'),
                        icon: state.icon,
                        message: state.message,
                        statusClass: state.statusClass,
                        timestamp: ticket.date || new Date().toLocaleDateString()
                    };
                })
                .filter(item => item.ticketId);

            this.renderNotifications(container, notifItems);
        }

        renderNotifications(container, notifs) {
            const header = container.previousElementSibling;
            let badge = document.getElementById('notifBadge') || document.getElementById('notifBadgeCount');

            if (!badge && header) {
                badge = document.createElement('span');
                badge.id = 'notifBadgeCount';
                badge.className = 'notif-header-badge';
                header.appendChild(badge);
            }

            if (!notifs || notifs.length === 0) {
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

            const cardsHtml = notifs.map(notif => `
                <div class="notif-alert-card ${notif.statusClass}" data-ticket-id="${notif.ticketId}" data-status="${notif.status}">
                    <div class="notif-icon-circle">${notif.icon}</div>
                    <div class="notif-content-body">
                        <div class="notif-card-title">Issue #${notif.ticketId} - ${notif.title}</div>
                        <div class="notif-card-detail">${notif.icon} ${notif.message}</div>
                        <div class="notif-card-timestamp">
                            <i class="far fa-clock"></i> Synced: ${notif.timestamp}
                        </div>
                    </div>
                    <button class="notif-dismiss-btn" data-ticket-id="${notif.ticketId}" data-status="${notif.status}" title="Acknowledge & Clear">&times;</button>
                </div>
            `).join('');

            container.innerHTML = cardsHtml;
        }

        bindDismissalListeners() {
            document.addEventListener('click', (event) => {
                const btn = event.target.closest('.notif-dismiss-btn');
                if (!btn) return;

                event.preventDefault();
                event.stopPropagation();

                const ticketId = btn.getAttribute('data-ticket-id');
                const newStatus = btn.getAttribute('data-status');
                const card = btn.closest('.notif-alert-card');

                if (card) {
                    card.classList.add('notif-fade-out');

                    setTimeout(() => {
                        card.remove();

                        if (ticketId && newStatus) {
                            const ackMap = this.getAcknowledgedMap();
                            ackMap[ticketId] = newStatus;
                            this.saveAcknowledgedMap(ackMap);
                        }

                        const container = document.getElementById('notificationList') || document.getElementById('notificationsList');
                        if (container) {
                            const remainingCards = container.querySelectorAll('.notif-alert-card');
                            const badge = document.getElementById('notifBadge') || document.getElementById('notifBadgeCount');

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

    window.NotificationEngine = new NotificationEngine();
})();
